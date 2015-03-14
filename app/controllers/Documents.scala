package controllers

import com.nooovle._
import com.nooovle.slick.models.{ modelTemplates, documents }
import com.nooovle.slick.ConnectionFactory
import org.joda.time.{ DateTime, YearMonth }
import org.locker47.json.play._
import play.api.libs.json._
import play.api._
import play.api.mvc.{ Action, Controller, RequestHeader }
import play.api.mvc.BodyParsers._
import scala.slick.driver.H2Driver.simple._
import scala.util.{ Try, Success, Failure }
import securesocial.core.RuntimeEnvironment

class Documents(override implicit val env: RuntimeEnvironment[User])
  extends ApiController[User] {

  lazy val createForm: JsObject = getCreateTemplate("DOCUMENTS")
  lazy val editForm: JsObject = getEditTemplate("DOCUMENTS")

  def show(id: Int) = SecuredAction { implicit request =>
    Document.findById(id) match {
      case Some(doc) =>
        Ok(documentToHalJsObject(doc).asJsValue)
      case None => NotFound
    }
  }

  def moveMailbox(id: Int, mailbox: String) = SecuredAction { implicit request =>
    Document.findById(id) map {
      oldDoc =>
        // TODO: Only the assigned user can move this mailbox
        // And that assigned user has the correct privileges, or if user is admin
        (Workflow.find(oldDoc.mailbox), Workflow.find(mailbox)) match {
          case (Some(oldBox), Some(newBox)) =>
            Document.update(oldDoc.copy(mailbox = newBox.name, assigned = None)) match {
              case Success(newDoc) =>
                val msg = s"Moved document from '${oldBox.title}' to '${newBox.title}'"
                ActionLog.log(request.user.userId, newDoc.id, msg) map { log =>
                  // Check if the target box is the next box in the workflow
                  // To properly log for movements
                  if (Option(newBox) == Workflow.next(oldBox.name)) {
                    oldBox match {
                      case Workflow.drafts =>
                        Document.logPreparedAction(log)
                      case Workflow.forChecking =>
                        Document.logCheckedAction(log)
                      case Workflow.forApproval =>
                        Document.logApprovedAction(log)
                      case _ => Document.logLastAction(log)
                    }
                  } else { // Clear existing logs, if any
                    val (clearPrepared, clearChecked, clearApproved) = newBox match {
                      case Workflow.drafts => (true, true, true)
                      case Workflow.forChecking => (false, true, true)
                      case Workflow.forApproval => (false, false, true)
                      case _ => (false, false, false)
                    }

                    Document.update(
                      newDoc.copy(
                        preparedAction = if (clearPrepared) None else newDoc.preparedAction,
                        checkedAction = if (clearChecked) None else newDoc.checkedAction,
                        approvedAction = if (clearApproved) None else newDoc.approvedAction)) match {
                        case Success(_) => Document.logLastAction(log)
                        case Failure(err) => InternalServerError(err.getMessage)
                      }
                  }
                }
                NoContent
              case Failure(err) => InternalServerError(err.getMessage)
            }
          case (None, _) => NotFound("Current mailbox cannot be found")
          case (_, None) => NotFound("Target mailbox cannot be found")
        }
    } getOrElse NotFound("Document cannot be found")
  }

  def list(offset: Int = 0, limit: Int = 10, mailbox: String, forTenant: Int, creator: String, assigned: Option[String], year: Option[Int], month: Option[Int], isPaid: Option[Boolean], others: Option[Boolean], isAssigned: Option[Boolean]) = SecuredAction { implicit request =>

    val ds = ConnectionFactory.connect withSession { implicit session =>
      // Filtering level 1: Query-level filters
      // Filter values by comparing to their default values in the router
      // (workaround to Slick limitations)

      // TODO: Check if adding the limit here and filters in other levels may affect
      // the final result (items.length < limit)
      val query = documents
        .filter(d => (d.mailbox inSetBind Workflow.getSubboxes(mailbox)) || mailbox.isEmpty)
        .filter(d => d.forTenant === forTenant || forTenant < 1)
        .filter(d => d.creator === creator || creator.isEmpty)
        .filter(d => d.assigned === assigned || assigned.isEmpty)
        .filter(d => d.year === year || year.isEmpty)
        .filter(d => d.month === month || month.isEmpty)
        .drop(offset).take(limit).sortBy(_.created.desc)

      query.list
    }

    // Filtering level 2: Post-fetch, pre-mapping to JS value
    // TODO: if parsing fails, return bad request

    def isAssignedFilter(assigned: Option[String]) = {
      (assigned, isAssigned) match {
        case (None, Some(true)) => false
        case (Some(_), Some(false)) => false
        case (_, _) => true
      }
    }

    def othersFilter(assigned: Option[String]) = {
      (assigned, others) match {
        case (Some(user), Some(true)) =>
          user == request.user
        case (_, _) => true
      }
    }

    val objs = ds
      .filter(d => isAssignedFilter(d.assigned))
      .filter(d => othersFilter(d.assigned))
      .map { d =>
        val link = routes.Documents.show(d.id)
        val obj = HalJsObject.create(link.absoluteURL())
          .withLink("profile", "hoa:document")
          .withField("id", d.id)
          .withField("serialId", d.serialId)
          .withField("title", d.title)
          .withField("docType", d.docType)
          .withField("mailbox", d.mailbox)
          .withField("forTenant", tenantToJsObject(d.forTenant))
          .withField("forMonth", new YearMonth(d.year, d.month))
          .withField("year", d.year)
          .withField("month", d.month)
          .withField("amountPaid", d.amountPaid)
          .withField("creator", d.creator)
          .withField("assigned", (d.assigned.map { userToJsObject(_) }))

        val withTotal = Templates.extractTotal(d) match {
          case Right(total) =>
            val unpaid = total - 0
            obj.withField("isPaid", unpaid <= 0)
              .withField("unpaid", unpaid)
              .withField("total", total)
          case Left(warning) =>
            Logger.warn(warning)
            obj.withField("total", JsNull)
              .withField("warning", warning)
        }

        val withAssignLinks = addAssignLinks(d, withTotal)

        withAssignLinks.asJsValue
      }

    // Filtering level 3: Post-mapping to JS value
    val withIsPaid = isPaid map { b =>
      objs.filter(d => d \ "isPaid" == JsBoolean(b))
    } getOrElse objs

    val self = routes.Documents.list(offset, limit, mailbox, forTenant, creator, assigned, year, month, isPaid, others, isAssigned)
    val blank = HalJsObject.create(self.absoluteURL())
      .withCurie("hoa", Application.defaultCurie)
      .withLink("profile", "collection")
      .withLink("up", routes.Application.index().absoluteURL())
      .withLink("create", routes.Documents.create().absoluteURL())
      .withLink("hoa:templates", routes.Templates.list().absoluteURL(),
        Some("List of document templates"))
      .withField("_template", createForm)
      .withField("count", ds.length)
      .withField("offset", offset)
      .withField("limit", limit)

    val withList = blank.withEmbedded(HalJsObject.empty.withField("item", withIsPaid))

    val withNavLinks = listNavLinks(self.absoluteURL(), offset, limit, ds.length)
      .foldLeft(withList) {
        (obj, pair) => obj.withLink(pair._1, pair._2.href)
      }

    Ok(withNavLinks.asJsValue)
  }

  def create() = SecuredAction(parse.json) { implicit request =>
    val json = request.body
    ((json \ "title").asOpt[String],
      (json \ "docType").asOpt[String],
      (json \ "forTenant").asOpt[Int],
      (json \ "forMonth").asOpt[String],
      (json \ "body").asOpt[JsObject]) match {
        case (Some(title), Some(docType), Some(forTenant), Some(forMonth), Some(body)) =>
          Try(YearMonth.parse(forMonth)) match {
            case Success(date) =>
              Document.insert(request.user, title, docType, forTenant, date, body) match {
                case Success(doc) =>
                  val link = routes.Documents.show(doc.id).absoluteURL()
                  val body = documentToHalJsObject(doc)
                  Created(body.asJsValue).withHeaders("Location" -> link)
                case Failure(err) =>
                  Logger.error(s"Error in creating document '${title}'", err)
                  InternalServerError(err.getMessage)
              }
            case Failure(msg) =>
              BadRequest("The supplied date is invalid, please format to ISO8601")
          }
        case _ =>
          BadRequest("Some required values are missing. Please check your request.")
      }
  }

  def edit(id: Int) = SecuredAction(parse.json) { implicit request =>
    Document.findById(id) map {
      existingDoc =>
        // Get user responsible for this request and only allow if this is the assigned user
        if (!existingDoc.assigned.exists(_ == request.user.userId)) Forbidden
        else {
          val json = request.body
          ((json \ "title").asOpt[String],
            (json \ "body").asOpt[JsObject],
            (json \ "comments").asOpt[JsObject],
            (json \ "amountPaid").asOpt[JsObject]) match {
              case (None, None, None, None) =>
                BadRequest("No editable fields matched. Please check your request.")
              case (titleOpt, bodyOpt, commentsOpt, amountPaidOpt) =>
                val newDoc =
                  existingDoc.copy(
                    title = titleOpt getOrElse existingDoc.title,
                    body = bodyOpt getOrElse existingDoc.body,
                    comments = commentsOpt getOrElse existingDoc.comments,
                    amountPaid = amountPaidOpt getOrElse existingDoc.amountPaid)

                Document.update(newDoc) match {
                  case Success(updateDoc) =>
                    val changes = Seq(
                      titleOpt.map(v => s"Title: '${existingDoc.title}' -> '${v}'"),
                      amountPaidOpt.map(v => s"Amount paid: '${existingDoc.amountPaid}' -> '${v}'"),
                      bodyOpt.map(v => "Body updated"),
                      commentsOpt.map(v => "Comments updated"))
                      .flatten
                      .mkString(", ")

                    ActionLog.log(request.user.userId, updateDoc.id, "Updates: " + changes) match {
                      case Success(log) =>
                        Document.logLastAction(log)
                        NoContent
                      case Failure(err) => Ok("Updates saved, but encountered error " + err.getMessage)
                    }
                  case Failure(err) => InternalServerError(err.getMessage)
                }
              case _ => BadRequest("Some required values are missing. Please check your request.")
            }
        }
    } getOrElse NotFound
  }

  def delete(id: Int) = SecuredAction { implicit request =>
    Document.findById(id) map {
      doc =>
        // Permissions: currently assigned user if in drafts, or administrator
        val hasAccess = {
          doc.assigned.contains(request.user.userId) && doc.mailbox == Workflow.drafts.name ||
            User.findRoles(request.user.userId).contains("admin")
        }

        if (hasAccess) {
          val deleted = ConnectionFactory.connect withSession { implicit session =>
            val query = for (d <- documents if d.id === id) yield d
            query.delete
          }
          if (deleted == 0) NotFound
          else Ok
        } else Forbidden
    } getOrElse NotFound
  }

  def assignToMe(id: Int) = SecuredAction { implicit request =>
    Document.findById(id) match {
      case Some(d) =>
        val newDoc = d.copy(assigned = Some(request.user.userId))
        Document.update(newDoc) match {
          case Success(id) => NoContent
          case Failure(err) => InternalServerError(err.getMessage)
        }
      case None => NotFound
    }
  }

  def unassign(id: Int) = SecuredAction { implicit request =>
    Document.findById(id) match {
      case Some(d) =>
        // Permissions: currently assigned user, or administrator
        val hasAccess = {
          d.assigned.contains(request.user.userId) ||
            User.findRoles(request.user.userId).contains("admin")
        }

        if (hasAccess) {
          val newDoc = d.copy(assigned = None)
          Document.update(newDoc) match {
            case Success(id) => NoContent
            case Failure(err) => InternalServerError(err.getMessage)
          }
        } else Forbidden
      case None => NotFound
    }
  }

  private def addAssignLinks(doc: Document, obj: HalJsObject)(implicit request: RequestHeader): HalJsObject =
    doc.assigned match {
      case Some(_) => obj.withLink("hoa:unassign", routes.Documents.unassign(doc.id).absoluteURL())
      case None => obj.withLink("hoa:assign", routes.Documents.assignToMe(doc.id).absoluteURL())
    }

  private def documentToHalJsObject(d: Document)(implicit req: RequestHeader): HalJsObject = {
    val self = routes.Documents.show(d.id).absoluteURL()
    val obj = HalJsObject.create(self)
      .withCurie("hoa", Application.defaultCurie)
      .withLink("profile", "hoa:documents")
      .withLink("collection", routes.Documents.list().absoluteURL())
      .withField("_template", editForm)
      .withLink("edit", routes.Documents.edit(d.id).absoluteURL())
      .withLink("hoa:logs", routes.ActionLogs.show(d.id).absoluteURL())
      .withField("id", d.id)
      .withField("serialId", d.serialId)
      .withField("title", d.title)
      .withField("docType", d.docType)
      .withField("mailbox", d.mailbox)
      .withField("created", d.created)
      .withField("creator", d.creator)
      .withField("assigned", (d.assigned.map { userToJsObject(_) }))
      .withField("forTenant", tenantToJsObject(d.forTenant))
      .withField("forMonth", new YearMonth(d.year, d.month))
      .withField("year", d.year)
      .withField("month", d.month)
      .withField("amountPaid", d.amountPaid)
      .withField("hoa:nextBox", Workflow.next(d.mailbox).map(_.asJsObject))
      .withField("hoa:prevBox", Workflow.prev(d.mailbox).map(_.asJsObject))
      .withField("body", d.body)
      .withField("comments", d.comments)

    val obj1 = Workflow.next(d.mailbox) map { box =>
      obj.withLink("hoa:nextBox", routes.Documents.moveMailbox(d.id, box.name).absoluteURL())
    } getOrElse obj
    val obj2 = Workflow.prev(d.mailbox) map { box =>
      obj1.withLink("hoa:prevBox", routes.Documents.moveMailbox(d.id, box.name).absoluteURL())
    } getOrElse obj1

    val obj3: HalJsObject = Tenant.findById(d.forTenant) map { t =>
      val tenantUrl = routes.Tenants.show(d.forTenant).absoluteURL()
      val tenant = HalJsObject.create(tenantUrl)
        .withLink("profile", "hoa:tenant")
        .withLink("collection", routes.Tenants.list().absoluteURL())
        .withField("id", t.id)
        .withField("tradeName", t.tradeName)
        .withField("address", t.address)
        .withField("contactPerson", t.contactPerson)
        .withField("contactNumber", t.contactNumber)
        .withField("email", t.email)

      val embedded = obj2.embedded.getOrElse(HalJsObject.empty)
      obj2.withEmbedded(embedded.withField("tenant", tenant.asJsValue))
    } getOrElse obj2

    val withTotal = Templates.extractTotal(d) match {
      case Right(total) =>
        val unpaid = total - 0
        obj3.withField("isPaid", unpaid <= 0)
          .withField("unpaid", unpaid)
          .withField("total", total)
      case Left(warning) =>
        Logger.warn(warning)
        obj3.withField("total", JsNull)
          .withField("warning", warning)
    }

    val withActions = withTotal
      .withField("lastAction", d.lastAction flatMap (actionToJsObject(_)))
      .withField("preparedAction", d.preparedAction flatMap (actionToJsObject(_)))
      .withField("checkedAction", d.checkedAction flatMap (actionToJsObject(_)))
      .withField("approvedAction", d.approvedAction flatMap (actionToJsObject(_)))

    val withAssignLinks = addAssignLinks(d, withActions)

    withAssignLinks
  }

  def withAmounts(doc: Document)(implicit obj: HalJsObject): Document = ???
    // Templates.extractTotal(doc) match {
    //   case Right(total) =>
    //     obj.withField()
    //   case Left(warning) =>
    //     Logger.warn(warning)
    //     obj.withField("total", None)
    //       .withField("warning", warning)
    // }

  def userToJsObject(userId: String): JsObject =
    User.findById(userId) match {
      case Some(u) =>
        JsObject(Seq(
          "userId" -> JsString(u.userId),
          "fullName" -> JsString(u.fullName getOrElse "")))
      case None => JsObject(Seq("userId" -> JsString(userId)))
    }

  def tenantToJsObject(tenantId: Int): JsObject =
    Tenant.findById(tenantId) match {
      case Some(t) =>
        JsObject(Seq(
          "id" -> JsNumber(t.id),
          "tradeName" -> JsString(t.tradeName)))
      case None => JsObject(Seq("id" -> JsNumber(tenantId)))
    }

  def actionToJsObject(id: Int) = ActionLog.findById(id) map { log =>
    JsObject(Seq(
      "id" -> JsNumber(log.id),
      "who" -> userToJsObject(log.who),
      "what" -> JsNumber(log.what),
      "when" -> JsString(log.when.toString),
      "why" -> JsString(log.why)))
  }
}
