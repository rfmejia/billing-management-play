package controllers

import com.nooovle._
import com.nooovle.slick.ConnectionFactory
import com.nooovle.slick.models.{ modelTemplates, documents }
import org.joda.time.{ DateTime, YearMonth }
import org.locker47.json.play._
import play.api._
import play.api.i18n.Messages
import play.api.libs.json._
import play.api.mvc.BodyParsers._
import play.api.mvc.{ Action, Controller, RequestHeader }
import scala.slick.driver.PostgresDriver.simple._
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

  def list(offset: Int = 0, limit: Int = 10, mailbox: String, forTenant: Int,
    creator: String, assigned: Option[String], year: Option[Int], month: Option[Int],
    isPaid: Option[Boolean], others: Option[Boolean],
    isAssigned: Option[Boolean]) = SecuredAction { implicit request =>

    // Assigned filters: 
    // isAssigned == None => _
    // isAssigned == Some(true) => isAssigned.isDefined
    // isAssigned == Some(false) => isAssigned.isEmpty

    // assigned == None => _
    // assigned == Some(user) => filter(user)

    // others == None => _
    // others == Some(true) => filterNot(me)
    // others == Some(false) => filter(me)

    val (docs, totalHits): (List[Document], Int) =
      ConnectionFactory.connect withSession { implicit session =>
        // Filter values by comparing to their default values in the router
        // (workaround to Slick limitations)
        val query = documents
          .filter(d => (d.mailbox inSetBind Mailbox.getSubboxes(mailbox)) || mailbox.isEmpty)
          .filter(d => d.forTenant === forTenant || forTenant < 1)
          .filter(d => d.creator === creator || creator.isEmpty)
          .filter(d => d.year === year || year.isEmpty)
          .filter(d => d.month === month || month.isEmpty)
          .filter(d => d.isPaid === isPaid || isPaid.isEmpty)

        val withIsAssigned = isAssigned map {
          flag => query.filter(d => d.assigned.isDefined === flag)
        } getOrElse query

        val withAssigned = assigned map {
          user => withIsAssigned.filter(d => d.assigned === assigned)
        } getOrElse withIsAssigned

        val withOthers = others map {
          flag =>
            val userSet: Set[String] = Set(request.user.userId)
            if (flag) withAssigned.filterNot(d => d.assigned inSetBind userSet)
            else withAssigned.filter(d => d.assigned inSetBind userSet)
        } getOrElse withAssigned

        val total = withOthers.length.run
        val results = withOthers.drop(offset).take(limit).sortBy(_.created.desc).list
        (results, total)
      }

    val objs = docs
      .map { d =>
        implicit val doc = d

        val link = routes.Documents.show(d.id)
        val obj = HalJsObject.create(link.absoluteURL())
          .withLink("profile", "hoa:document")
          .withField("id", d.id)
          .withField("serialId", d.serialId)
          .withField("docType", d.docType)
          .withField("mailbox", d.mailbox)
          .withField("forTenant", tenantToJsObject(d.forTenant))
          .withField("forMonth", new YearMonth(d.year, d.month))
          .withField("year", d.year)
          .withField("month", d.month)
          .withField("amountPaid", d.amountPaid)
          .withField("creator", d.creator)
          .withField("assigned", (d.assigned.map { userToJsObject(_) }))

        val withAssignLinks = appendAmounts(appendAssignLinks(obj))

        withAssignLinks.asJsValue
      }

    val self = routes.Documents.list(offset, limit, mailbox, forTenant, creator, assigned, year, month, isPaid, others, isAssigned)
    val blank = HalJsObject.create(self.absoluteURL())
      .withCurie("hoa", Application.defaultCurie)
      .withLink("profile", "collection")
      .withLink("up", routes.Application.index().absoluteURL())
      .withLink("create", routes.Documents.create().absoluteURL())
      .withLink("hoa:templates", routes.Templates.list().absoluteURL(),
        Some("List of document templates"))
      .withField("_template", createForm)
      .withField("count", objs.length)
      .withField("offset", offset)
      .withField("limit", limit)
      .withField("total", totalHits)

    val withList = blank.withEmbedded(HalJsObject.empty.withField("item", objs))

    val withNavLinks = listNavLinks(self.absoluteURL(), offset, limit, totalHits)
      .foldLeft(withList) {
        (obj, pair) => obj.withLink(pair._1, pair._2.href)
      }

    Ok(withNavLinks.asJsValue)
  }

  def create() = SecuredAction(parse.json) { implicit request =>
    val json = request.body
    (
      (json \ "docType").asOpt[String],
      (json \ "forTenant").asOpt[Int],
      (json \ "year").asOpt[Int],
      (json \ "month").asOpt[Int],
      (json \ "body").asOpt[JsObject]
    ) match {
        case (Some(docType), Some(forTenant), Some(year), Some(month), Some(body)) => {
          val yearMonth = new YearMonth(year, month)
          Document.insert(request.user, docType, forTenant, yearMonth, body) match {
            case Success(doc) =>
              val link = routes.Documents.show(doc.id).absoluteURL()
              val body = documentToHalJsObject(doc)
              Created(body.asJsValue).withHeaders("Location" -> link)
            case Failure(err) =>
              Logger.error(s"Error in creating document", err)
              InternalServerError(err.getMessage)
          }
        }
        case _ =>
          BadRequest("Some required values are missing. Please check your request.")
      }
  }

  def edit(id: Int) = SecuredAction(parse.json) { implicit request =>
    Document.findById(id) map {
      existingDoc =>
        // Get user responsible for this request and only allow if this is the assigned user
        if (!existingDoc.assigned.exists(_ == request.user.userId)) {
          Forbidden(Messages("hoa.documents.forbidden.NotAssigned")
            + s" (Assigned to '${existingDoc.assigned}')")
        } else {
          val json = request.body
          (
            (json \ "body").asOpt[JsObject],
            (json \ "comments").asOpt[JsObject],
            (json \ "amountPaid").asOpt[JsObject]
          ) match {
              case (None, None, None) =>
                BadRequest("No editable fields matched. Please check your request.")
              case (bodyOpt, commentsOpt, amountPaidOpt) =>

                val newDoc: Document = {
                  val a: Document = existingDoc.copy(
                    body = bodyOpt getOrElse existingDoc.body,
                    comments = commentsOpt getOrElse existingDoc.comments,
                    amountPaid = amountPaidOpt getOrElse existingDoc.amountPaid
                  )

                  // If the payment resolves the bill, automatically move the document to paid mailbox
                  val b: Document = amountPaidOpt map { _ =>
                    val (current, previous) = Templates.extractAmounts(a)
                    val paid = current.isPaid && previous.isPaid
                    if (paid && a.mailbox == Mailbox.unpaid.name)
                      a.copy(isPaid = paid, mailbox = Mailbox.paid.name)
                    else if(!paid && a.mailbox == Mailbox.paid.name)
                      a.copy(isPaid = paid, mailbox = Mailbox.unpaid.name)
                    else a.copy(isPaid = paid)
                  } getOrElse a
                  b
                }

                Document.update(newDoc) match {
                  case Success(updatedDoc) =>
                    val changes = Seq(
                      amountPaidOpt.map(v => s"Amount paid: '${existingDoc.amountPaid}' -> '${v}'"),
                      bodyOpt.map(v => "Body updated"),
                      commentsOpt.map(v => "Comments updated")
                    ).flatten.mkString(", ")

                    ActionLog.log(request.user.userId, updatedDoc.id, "Updates: " + changes) match {
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
          doc.assigned.contains(request.user.userId) && doc.mailbox == Mailbox.drafts.name ||
            User.findRoles(request.user.userId).contains(Roles.Admin)
        }

        if (hasAccess) {
          val deleted = ConnectionFactory.connect withSession { implicit session =>
            val query = for (d <- documents if d.id === id) yield d
            query.delete
          }
          if (deleted == 0) NotFound
          else Ok
        } else Forbidden(Messages("hoa.documents.forbidden.DeleteNotAllowed")
          + s" (Assigned to '${doc.assigned}' in mailbox '${doc.mailbox}'")
    } getOrElse NotFound
  }

  def assignToMe(id: Int) = SecuredAction { implicit request =>
    Document.findById(id) match {
      case Some(d) =>
        // Forbid if someone is assigned
        d.assigned match {
          case None =>
            val newDoc = d.copy(assigned = Some(request.user.userId))
            Document.update(newDoc) match {
              case Success(id) => NoContent
              case Failure(err) => InternalServerError(err.getMessage)
            }
          case Some(user) => Forbidden(Messages("hoa.documents.forbidden.NotAssigned")
            + s" (Assigned to '${user}')")
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
            User.findRoles(request.user.userId).contains(Roles.Admin)
        }

        if (hasAccess) {
          val newDoc = d.copy(assigned = None)
          Document.update(newDoc) match {
            case Success(id) => NoContent
            case Failure(err) => InternalServerError(err.getMessage)
          }
        } else Forbidden(Messages("hoa.documents.forbidden.NotAssigned")
          + s" (Assigned to '${d.assigned}')")
      case None => NotFound
    }
  }

  private def documentToHalJsObject(d: Document)(implicit req: RequestHeader): HalJsObject = {
    implicit val doc = d

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
      .withField("hoa:nextBox", Mailbox.next(d.mailbox).map(_.asJsObject))
      .withField("hoa:prevBox", Mailbox.prev(d.mailbox).map(_.asJsObject))
      .withField("body", d.body)
      .withField("comments", d.comments)

    val obj1 = Mailbox.next(d.mailbox) map { box =>
      obj.withLink("hoa:nextBox", routes.Workflow.moveMailbox(d.id, box.name).absoluteURL())
    } getOrElse obj
    val obj2 = Mailbox.prev(d.mailbox) map { box =>
      obj1.withLink("hoa:prevBox", routes.Workflow.moveMailbox(d.id, box.name).absoluteURL())
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

    val withActions = appendAmounts(obj3)
      .withField("lastAction", d.lastAction flatMap (actionToJsObject(_)))
      .withField("preparedAction", d.preparedAction flatMap (actionToJsObject(_)))

    val withAssignLinks = appendAssignLinks(withActions)

    withAssignLinks
  }

  private def appendAssignLinks(obj: HalJsObject)(implicit request: RequestHeader, doc: Document): HalJsObject =
    doc.assigned match {
      case Some(_) => obj.withLink("hoa:unassign", routes.Documents.unassign(doc.id).absoluteURL())
      case None => obj.withLink("hoa:assign", routes.Documents.assignToMe(doc.id).absoluteURL())
    }

  private def appendAmounts(obj: HalJsObject)(implicit doc: Document): HalJsObject = {
    if (doc.docType == "invoice-1") {
      val (current, previous) = Templates.extractAmounts(doc)

      val amounts = HalJsObject.empty
        .withField("isPaid", JsBoolean(current.isPaid && previous.isPaid))
        .withField("current", JsArray(List(
          JsObject(Seq(
            "name" -> JsString("rent"),
            "amounts" -> current.rent.asJsObject
          )),
          JsObject(Seq(
            "name" -> JsString("electricity"),
            "amounts" -> current.electricity.asJsObject
          )),
          JsObject(Seq(
            "name" -> JsString("water"),
            "amounts" -> current.water.asJsObject
          )),
          JsObject(Seq(
            "name" -> JsString("cusa"),
            "amounts" -> current.cusa.asJsObject
          ))
        )))
        .withField("previous", JsArray(List(
          JsObject(Seq(
            "name" -> JsString("rent"),
            "amounts" -> previous.rent.asJsObject
          )),
          JsObject(Seq(
            "name" -> JsString("electricity"),
            "amounts" -> previous.electricity.asJsObject
          )),
          JsObject(Seq(
            "name" -> JsString("water"),
            "amounts" -> previous.water.asJsObject
          )),
          JsObject(Seq(
            "name" -> JsString("cusa"),
            "amounts" -> previous.cusa.asJsObject
          ))
        )))

      obj.withField("amounts", amounts.asJsValue)
      
    } else obj
  }

  def userToJsObject(userId: String): JsObject =
    User.findById(userId) match {
      case Some(u) =>
        JsObject(Seq(
          "userId" -> JsString(u.userId),
          "fullName" -> JsString(u.fullName getOrElse "")
        ))
      case None => JsObject(Seq("userId" -> JsString(userId)))
    }

  def tenantToJsObject(tenantId: Int): JsObject =
    Tenant.findById(tenantId) match {
      case Some(t) =>
        JsObject(Seq(
          "id" -> JsNumber(t.id),
          "tradeName" -> JsString(t.tradeName)
        ))
      case None => JsObject(Seq("id" -> JsNumber(tenantId)))
    }

  def actionToJsObject(id: Int) = ActionLog.findById(id) map { log =>
    JsObject(Seq(
      "id" -> JsNumber(log.id),
      "who" -> userToJsObject(log.who),
      "what" -> JsNumber(log.what),
      "when" -> JsString(log.when.toString),
      "why" -> JsString(log.why)
    ))
  }
}
