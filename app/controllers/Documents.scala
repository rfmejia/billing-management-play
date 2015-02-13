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

  def show(id: Int) = Action { implicit request =>
    Document.findById(id) match {
      case Some(doc) =>
        Ok(documentToHalJsObject(doc).asJsValue)
      case None => NotFound
    }
  }

  def moveMailbox(id: Int, mailbox: String) = SecuredAction {
    (Document.findById(id), Workflow.exists(mailbox)) match {
      case (Some(d), Some(box)) =>
        Document.update(d.copy(mailbox = box)) match {
          case Success(d) => NoContent
          case Failure(err) => InternalServerError(err.getMessage)
        }
      case (None, _) => NotFound("Document cannot be found")
      case (_, None) => NotFound("Mailbox cannot be found")
    }
  }

  def list(offset: Int = 0, limit: Int = 10, mailbox: String, forTenant: Int) = Action { implicit request =>
    val (ds, total) = ConnectionFactory.connect withSession { implicit session =>
      val query = documents.drop(offset).take(limit).sortBy(_.created.desc)
        .filter(d => d.mailbox === mailbox || mailbox.isEmpty)
        .filter(d => d.forTenant === forTenant || forTenant < 1)
      (query.list, documents.length.run)
    }

    val objs = ds map { d =>
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
        .withField("assigned", d.assigned)

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

    val self = routes.Documents.list(offset, limit)
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

    val withList = blank.withEmbedded(HalJsObject.empty.withField("item", objs))

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
              Document.insert(title, docType, forTenant, date, body) match {
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
          (json \ "assigned").asOpt[String],
          (json \ "amountPaid").asOpt[Double]) match {
            case (None, None, None, None) =>
              BadRequest("No editable fields matched. Please check your request.")
            case (title, body, assigned, amountPaid) =>
              // TODO: Get user responsible for this request
              val newDoc =
                d.replaceWith(title map (x => d.copy(title = x)))
                .replaceWith(body map (x => d.copy(body = x)))
                .replaceWith(amountPaid map (x => d.copy(amountPaid = x)))
                .replaceWith(assigned map (x => d.copy(assigned = Option(x))))

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

  private def documentToHalJsObject(d: Document)(implicit req: RequestHeader): HalJsObject = {
    val selfUrl = routes.Documents.show(d.id).absoluteURL()
    val obj = HalJsObject.create(selfUrl)
      .withCurie("hoa", Application.defaultCurie)
      .withLink("profile", "hoa:documents")
      .withLink("collection", routes.Documents.list().absoluteURL())
      .withField("_template", editForm)
      .withLink("edit", routes.Documents.edit(d.id).absoluteURL())
      .withField("id", d.id)
      .withField("serialId", d.serialId)
      .withField("title", d.title)
      .withField("docType", d.docType)
      .withField("mailbox", d.mailbox)
      .withField("created", d.created)
      .withField("creator", d.creator)
      .withField("preparedBy", d.preparedBy)
      .withField("preparedOn", d.preparedOn)
      .withField("checkedBy", d.checkedBy)
      .withField("checkedOn", d.checkedOn)
      .withField("approvedBy", d.approvedBy)
      .withField("approvedOn", d.approvedOn)
      .withField("assigned", d.assigned)
      .withField("forTenant", d.forTenant)
      .withField("forMonth", d.forMonth)
      .withField("amountPaid", d.amountPaid)
      .withField("hoa:nextBox", Workflow.next(d.mailbox))
      .withField("hoa:prevBox", Workflow.prev(d.mailbox))
      .withField("body", d.body)

    val obj1 = Workflow.next(d.mailbox) map { box =>
      obj.withLink("hoa:nextBox", routes.Documents.moveMailbox(d.id, box).absoluteURL())
    } getOrElse obj
    val obj2 = Workflow.prev(d.mailbox) map { box =>
      obj1.withLink("hoa:prevBox", routes.Documents.moveMailbox(d.id, box).absoluteURL())
    } getOrElse obj1

    val obj3 = Tenant.findById(d.forTenant) map { t =>
      val tenantUrl = routes.Tenants.show(d.forTenant).absoluteURL()
      val obj = HalJsObject.create(tenantUrl)
        .withLink("profile", "hoa:tenant")
        .withLink("collection", routes.Tenants.list().absoluteURL())
        .withField("id", t.id)
        .withField("tradeName", t.tradeName)
        .withField("address", t.address)
        .withField("contactPerson", t.contactPerson)
        .withField("contactNumber", t.contactNumber)
        .withField("email", t.email)
      obj2.withEmbedded(HalJsObject.empty.withField("tenant", obj.asJsValue))
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

    withTotal
  }
}
