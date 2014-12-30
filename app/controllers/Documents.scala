package controllers

import com.nooovle._
import com.nooovle.slick.models.{ modelTemplates, documents }
import com.nooovle.slick.ConnectionFactory
import org.joda.time.DateTime
import org.locker47.json.play._
import play.api.libs.json._
import play.api._
import play.api.mvc.{ Action, Controller }
import play.api.mvc.BodyParsers._
import scala.slick.driver.H2Driver.simple._
import scala.util.{ Try, Success, Failure }

object Documents extends Controller {
  def show(id: Int) = Action { implicit request =>
    Document.findById(id) match {
      case Some(d) =>
        val self = routes.Documents.show(id)
        val obj = HalJsObject.create(self.absoluteURL())
          .withCurie("hoa", Application.defaultCurie)
          .withLink("profile", "hoa:documents")
          .withLink("collection", routes.Documents.list().absoluteURL())
          .withField("_template", editForm)
          .withLink("edit", routes.Documents.edit(id).absoluteURL())
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
          .withField("hoa:next", Workflow.next(d.mailbox))
          .withField("hoa:prev", Workflow.prev(d.mailbox))
          .withField("body", d.body)

        val obj1 = Workflow.next(d.mailbox) map { box =>
          obj.withLink("next", routes.Documents.moveMailbox(id, box).absoluteURL())
        } getOrElse obj
        val obj2 = Workflow.prev(d.mailbox) map { box =>
          obj1.withLink("prev", routes.Documents.moveMailbox(id, box).absoluteURL())
        } getOrElse obj1

        Ok(obj2.asJsValue)
      case None => NotFound
    }
  }

  def moveMailbox(id: Int, mailbox: String) = Action {
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

  def list(offset: Int = 0, limit: Int = 10, mailbox: String = "") = Action { implicit request =>
    val (ds, total) = ConnectionFactory.connect withSession { implicit session =>
      val ds = {
        if (mailbox.isEmpty) {
          documents.drop(offset).take(limit).sortBy(_.created.desc)
        } else {
          documents.filter(d => d.mailbox === mailbox).drop(offset).take(limit).sortBy(_.created.desc)
        }
      }
      (ds.list, ds.length.run)
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
        .withField("assigned", d.assigned)
      obj.asJsValue
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

    val withSubsections = withList
      .withLink("subsection", routes.Documents.list(offset, limit, "Drafts").absoluteURL())
      .withLink("subsection", routes.Documents.list(offset, limit, "For checking").absoluteURL())
      .withLink("subsection", routes.Documents.list(offset, limit, "For approval").absoluteURL())
      .withLink("subsection", routes.Documents.list(offset, limit, "Unpaid").absoluteURL())
      .withLink("subsection", routes.Documents.list(offset, limit, "Paid").absoluteURL())

    Ok(withSubsections.asJsValue)
  }

  def create() = Action(parse.json) { implicit request =>
    val json = request.body
    ((json \ "title").asOpt[String],
      (json \ "docType").asOpt[String],
      (json \ "forTenant").asOpt[Int],
      (json \ "forMonth").asOpt[DateTime],
      (json \ "body").asOpt[JsObject]) match {
        case (Some(title), Some(docType), Some(forTenant), Some(forMonth), Some(body)) =>
          Document.insert(title, docType, forTenant, forMonth, body) match {
            case Success(id) =>
              val link = routes.Documents.show(id).absoluteURL()
              Created.withHeaders("Location" -> link)
            case Failure(err) =>
              err.printStackTrace
              InternalServerError(err.getMessage)
          }
        case _ => BadRequest("Some required values are missing. Please check your request.")
      }
  }

  def edit(id: Int) = Action(parse.json) { implicit request =>
    Document.findById(id) match {
      case None => NotFound
      case Some(d) =>
        val json = request.body
        ((json \ "title").asOpt[String],
          (json \ "body").asOpt[JsObject],
          (json \ "mailbox").asOpt[String],
          (json \ "assigned").asOpt[String]) match {
            case (Some(title), Some(body), Some(mailbox), assigned) =>
              // TODO: Get user responsible for this request
              val newDoc = d.copy(title = title, mailbox = mailbox, body = body,
                assigned = assigned)
              Document.update(newDoc) match {
                case Success(id) => NoContent
                case Failure(err) => InternalServerError(err.getMessage)
              }
            case _ => BadRequest("Some required values are missing. Please check your request.")
          }
    }
  }

  def delete(id: Int) = Action { implicit request =>
    val deleted = ConnectionFactory.connect withSession { implicit session =>
      val query = for (d <- documents if d.id === id) yield d
      query.delete
    }
    if (deleted == 0) NotFound
    else Ok
  }

  lazy val createForm: JsObject = {
    val fields = ModelInfo.toJsonArray {
      ConnectionFactory.connect withSession { implicit session =>
        val query = for (
          i <- modelTemplates if i.modelName === "DOCUMENTS"
            && i.createForm
        ) yield i
        query.list
      }
    }
    Json.obj("create" -> Json.obj("data" -> fields))
  }

  lazy val editForm: JsObject = {
    val fields = ModelInfo.toJsonArray {
      ConnectionFactory.connect withSession { implicit session =>
        val query = for (
          i <- modelTemplates if i.modelName === "DOCUMENTS"
            && i.editForm
        ) yield i
        query.list
      }
    }
    Json.obj("edit" -> Json.obj("data" -> fields))
  }
}
