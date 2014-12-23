package controllers

import com.nooovle._
import com.nooovle.slick.models.{ modelTemplates, documents }
import com.nooovle.slick.ConnectionFactory
import java.util.UUID
import org.joda.time.DateTime
import org.locker47.json.play._
import play.api.libs.json._
import play.api._
import play.api.mvc.{ Action, Controller }
import play.api.mvc.BodyParsers._
import scala.slick.driver.H2Driver.simple._
import scala.util.{ Try, Success, Failure }

object Documents extends Controller {
  def show(id: String) = Action { implicit request =>
    Document.findById(UUID.fromString(id)) match {
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
          .withField("assigned", d.assigned)
          .withField("next", Workflow.next(d.mailbox))
          .withField("prev", Workflow.prev(d.mailbox))
          .withField("body", d.body)
        Ok(obj.asJsValue)
      case None => NotFound
    }
  }

  def list(offset: Int = 0, limit: Int = 10) = Action { implicit request =>
    val (ds, total) = ConnectionFactory.connect withSession { implicit session =>
      val ds = documents.drop(offset).take(limit).sortBy(_.created.desc).list
      val total = documents.length.run
      (ds, total)
    }

    val objs = ds map { d =>
      val link = routes.Documents.show(d.id.toString)
      val obj = HalJsObject.create(link.absoluteURL())
        .withLink("profile", "hoa:document")
        .withField("id", d.id)
        .withField("serialId", d.serialId)
        .withField("title", d.title)
        .withField("docType", d.docType)
        .withField("mailbox", d.mailbox)
        .withField("created", d.created)
        .withField("creator", d.creator)
        .withField("assigned", d.assigned)
      obj.asJsValue
    }

    val self = routes.Documents.list(offset, limit)
    val blank = HalJsObject.create(self.absoluteURL())
      .withCurie("hoa", Application.defaultCurie)
      .withLink("profile", "collection")
      .withLink("up", routes.Application.index().absoluteURL())
      .withLink("create", routes.Documents.create().absoluteURL())
      .withField("_template", createForm)
      .withField("count", ds.length)
      .withField("total", total)
    val x = blank.withEmbedded(HalJsObject.empty.withField("item", objs))

    Ok(x.asJsValue)
  }

  def create() = Action(parse.json) { implicit request =>
    val json = request.body
    ((json \ "title").asOpt[String],
      (json \ "docType").asOpt[String],
      (json \ "body").asOpt[JsObject]) match {
        case (Some(title), Some(docType), Some(body)) =>
          Document.insert(title, docType, body) match {
            case Success(id) =>
              val link = routes.Documents.show(id.toString).absoluteURL()
              Created.withHeaders("Location" -> link)
            case Failure(err) =>
              err.printStackTrace
              InternalServerError(err.getMessage)
          }
        case _ => BadRequest("Some required values are missing. Please check your request.")
      }
  }

  def edit(id: String) = Action(parse.json) { implicit request =>
    Document.findById(UUID.fromString(id)) match {
      case None => NotFound
      case Some(d) =>
        val json = request.body
        ((json \ "title").asOpt[String],
          (json \ "body").asOpt[JsObject],
          (json \ "mailbox").asOpt[String],
          (json \ "assigned").asOpt[String]) match {
            case (Some(title), Some(body), Some(mailbox), assigned) =>
              val newDoc = Document(d.id, d.serialId, title, d.docType, mailbox,
                d.created, d.creator, assigned, body)
              Document.update(newDoc) match {
                case Success(id) => NoContent
                case Failure(err) => InternalServerError(err.getMessage)
              }
            case _ => BadRequest("Some required values are missing. Please check your request.")
          }
    }
  }

  def delete(id: String) = Action { implicit request =>
    val _id = UUID.fromString(id)
    val deleted = ConnectionFactory.connect withSession { implicit session =>
      val query = for (d <- documents if d.id === _id) yield d
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
