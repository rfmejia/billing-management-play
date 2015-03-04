package controllers

import com.nooovle._
import com.nooovle.slick.models.{ modelTemplates, documents }
import com.nooovle.slick.ConnectionFactory
import org.joda.time.DateTime
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
    Document.findById(id) match {
      case Some(d) =>
        // TODO: Only the assigned user can move this mailbox
        // And that assigned user has the correct privileges
        (Workflow.find(d.mailbox), Workflow.find(mailbox)) match {
          case (Some(oldBox), Some(newBox)) =>
            Document.update(d.copy(mailbox = newBox.name)) match {
              case Success(updated) =>
                val msg = s"Moved document from '${oldBox.title}' to '${newBox.title}'"
                ActionLog.log(request.user.userId, updated.id, msg) map { log =>
                  // Check if the target box is the next box in the workflow
                  // To properly log for movements
                  (oldBox, Workflow.next(oldBox.name)) match {
                    case (Workflow.drafts, Some(newBox)) =>
                      Document.logPreparedAction(log)
                    case (Workflow.forChecking, Some(newBox)) =>
                      Document.logCheckedAction(log)
                    case (Workflow.forApproval, Some(newBox)) =>
                      Document.logApprovedAction(log)
                    case _ => Document.logLastAction(log)
                  }
                }
                NoContent
              case Failure(err) => InternalServerError(err.getMessage)
            }
          case (None, _) => NotFound("Current mailbox cannot be found")
          case (_, None) => NotFound("Target mailbox cannot be found")
        }
      case None => NotFound("Document cannot be found")
    }
  }

  def list(offset: Int = 0, limit: Int = 10, mailbox: String, forTenant: Int, creator: String, assigned: Option[String], forMonth: Option[String], isPaid: Option[Boolean], others: Option[Boolean], isAssigned: Option[Boolean]) = SecuredAction { implicit request =>

    val (ds, total) = ConnectionFactory.connect withSession { implicit session =>
      // Filtering level 1: Query-level filters
      // Filter values by comparing to their default values in the router
      // (workaround to Slick limitations)
      val query = documents.drop(offset).take(limit).sortBy(_.created.desc)
        .filter(d => d.mailbox === mailbox || mailbox.isEmpty)
        .filter(d => d.forTenant === forTenant || forTenant < 1)
        .filter(d => d.creator === creator || creator.isEmpty)
        .filter(d => d.assigned === assigned || assigned.isEmpty)

      (query.list, documents.length.run)
    }

    // Filtering level 2: Post-fetch, pre-mapping to JS value
    // TODO: if parsing fails, return bad request
    def dateFilter(date: DateTime): Boolean = {
      forMonth.map(dateParam => Try(DateTime.parse(dateParam)) match {
        case Success(parsedDate) =>
          date.getMonthOfYear == parsedDate.getMonthOfYear &&
            date.getYear == parsedDate.getYear
        case Failure(_) => false
      }) getOrElse true
    }

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
      .filter(d => dateFilter(d.forMonth))
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
          .withField("forTenant", d.forTenant)
          .withField("forMonth", d.forMonth)
          .withField("amountPaid", d.amountPaid)
          .withField("creator", d.creator)
          .withField("assigned", (d.assigned.map { userToObj(_) }))

        val withTotal = Templates.getTotal(d) match {
          case Right(total) =>
            val unpaid = total - d.amountPaid
            obj.withField("isPaid", unpaid <= 0)
              .withField("unpaid", unpaid)
              .withField("total", total)
          case Left(warning) =>
            Logger.warn(warning)
            obj.withField("total", JsNull)
              .withField("warning", warning)
        }
        withTotal.asJsValue
      }

    // Filtering level 3: Post-mapping to JS value
    val withIsPaid = isPaid map { b =>
      objs.filter(d => d \ "isPaid" == JsBoolean(b))
    } getOrElse objs

    val self = routes.Documents.list(offset, limit, mailbox, forTenant, creator, assigned, forMonth, isPaid, others, isAssigned)
    val blank = HalJsObject.create(self.absoluteURL())
      .withCurie("hoa", Application.defaultCurie)
      .withLink("profile", "collection")
      .withLink("up", routes.Application.index().absoluteURL())
      .withLink("create", routes.Documents.create().absoluteURL())
      .withLink("hoa:templates", routes.Templates.list().absoluteURL(),
        Some("List of document templates"))
      .withField("_template", createForm)
      .withField("count", ds.length)
      .withField("total", total)
      .withField("offset", offset)
      .withField("limit", limit)

    val withList = blank.withEmbedded(HalJsObject.empty.withField("item", withIsPaid))

    val y = listNavLinks(self.absoluteURL(), offset, limit, total).foldLeft(withList) {
      (obj, pair) => obj.withLink(pair._1, pair._2.href)
    }

    Ok(y.asJsValue)
  }

  def create() = SecuredAction(parse.json) { implicit request =>
    val json = request.body
    ((json \ "title").asOpt[String],
      (json \ "docType").asOpt[String],
      (json \ "forTenant").asOpt[Int],
      (json \ "forMonth").asOpt[String],
      (json \ "body").asOpt[JsObject]) match {
        case (Some(title), Some(docType), Some(forTenant), Some(forMonth), Some(body)) =>
          Try(DateTime.parse(forMonth)) match {
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
    Document.findById(id) match {
      case None => NotFound
      case Some(d) =>
        val json = request.body
        ((json \ "title").asOpt[String],
          (json \ "body").asOpt[JsObject],
          (json \ "comments").asOpt[JsObject],
          (json \ "assigned").asOpt[String],
          (json \ "amountPaid").asOpt[Double]) match {
            case (None, None, None, None, None) =>
              BadRequest("No editable fields matched. Please check your request.")
            case (titleOpt, bodyOpt, commentsOpt, assignedOpt, amountPaidOpt) =>
              // TODO: Get user responsible for this request and only allow if this is the assigned user

              val toBeAssigned: Option[String] =
                if (assignedOpt.exists(_ != "none")) assignedOpt
                else None

              val newDoc =
                d.copy(
                  title = titleOpt getOrElse d.title,
                  body = bodyOpt getOrElse d.body,
                  comments = commentsOpt getOrElse d.comments,
                  assigned = toBeAssigned,
                  amountPaid = amountPaidOpt getOrElse d.amountPaid)

              Document.update(newDoc) match {
                case Success(id) => NoContent
                case Failure(err) => InternalServerError(err.getMessage)
              }
            case _ => BadRequest("Some required values are missing. Please check your request.")
          }
    }
  }

  def delete(id: Int) = SecuredAction { implicit request =>
    val deleted = ConnectionFactory.connect withSession { implicit session =>
      val query = for (d <- documents if d.id === id) yield d
      query.delete
    }
    if (deleted == 0) NotFound
    else Ok
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
            User.findRoles(request.user.userId).contains("administrator")
        }

        if (hasAccess) {
          val newDoc = d.copy(assigned = Some(request.user.userId))
          Document.update(newDoc) match {
            case Success(id) => NoContent
            case Failure(err) => InternalServerError(err.getMessage)
          }
        } else Forbidden
      case None => NotFound
    }
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
      .withField("assigned", (d.assigned.map { userToObj(_) }))
      .withField("forTenant", d.forTenant)
      .withField("forMonth", d.forMonth)
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

    val withTotal = Templates.getTotal(d) match {
      case Right(total) =>
        val unpaid = total - d.amountPaid
        obj3.withField("isPaid", unpaid <= 0)
          .withField("unpaid", unpaid)
          .withField("total", total)
      case Left(warning) =>
        Logger.warn(warning)
        obj3.withField("total", JsNull)
          .withField("warning", warning)
    }

    def actionToJsObject(id: Int) = ActionLog.findById(id) map { log =>
      JsObject(Seq(
        "id" -> JsNumber(log.id),
        "who" -> JsString(log.who),
        "what" -> JsNumber(log.what),
        "when" -> JsString(log.when.toString),
        "why" -> JsString(log.why)))
    }

    val withActions = withTotal
      .withField("lastAction", d.lastAction flatMap (actionToJsObject(_)))
      .withField("preparedAction", d.preparedAction flatMap (actionToJsObject(_)))
      .withField("checkedAction", d.checkedAction flatMap (actionToJsObject(_)))
      .withField("approvedAction", d.approvedAction flatMap (actionToJsObject(_)))

    withActions
  }

  def userToObj(userId: String): JsObject =
    User.findById(userId) match {
      case Some(u) =>
        JsObject(Seq(
          "userId" -> JsString(u.userId),
          "fullName" -> JsString(u.fullName getOrElse "")))
      case None => JsObject(Seq("userId" -> JsString(userId)))
    }

}
