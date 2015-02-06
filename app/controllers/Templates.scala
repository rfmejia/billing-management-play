package controllers

import scala.slick.driver.H2Driver.simple._
import scala.util.{ Try, Success, Failure }

import org.locker47.json.play._

import com.nooovle._

import play.api._
import play.api.libs.json._
import securesocial.core.RuntimeEnvironment

class Templates(override implicit val env: RuntimeEnvironment[User])
  extends ApiController[User] {

  val logger = Logger("controllers.Templates")

  val templates: Seq[JsObject] = Seq(Templates.invoice1)

  def show(docType: String) = SecuredAction { implicit request =>
    templates find { template =>
      (template \ "docType").as[String] == docType
    } match {
      case Some(template) =>
        Ok {
          val link = routes.Templates.show(docType)
          HalJsObject.create(link.absoluteURL())
            .withLink("profile", "hoa:template")
            .asJsValue ++ template
        }
      case None => NotFound
    }
  }

  def list(offset: Int = 0, limit: Int = 10) = play.api.mvc.Action { implicit request =>
    val objs = templates map { t =>
      val docType = (t \ "docType").as[String]
      val link = routes.Templates.show(docType)
      val obj = HalJsObject.create(link.absoluteURL())
        .withLink("profile", "hoa:template")
        .withField("docType", t \ "docType")
        .withField("name", t \ "name")
      obj.asJsValue
    }

    val self = routes.Templates.list(offset, limit)
    val blank = HalJsObject.create(self.absoluteURL())
      .withCurie("hoa", Application.defaultCurie)
      .withLink("profile", "collection")
      .withLink("up", routes.Application.index().absoluteURL())
      .withField("count", templates.length)
      .withField("total", templates.length)
    val x = blank.withEmbedded(HalJsObject.empty.withField("item", objs))

    Ok(x.asJsValue)
  }
}

object Templates {
  // NOTE: The following is a hard-coded lookup of total values.
  // Either standardize the field in the document type(s) or have a
  // template registration system
  def getTotal(d: Document): Either[String, Double] = {
    if (d.docType == "invoice-1") {
      if (d.body \ "summary" \ "id" == JsString("invoice_summary")) {

        d.body \ "summary" \ "value" match {
          case JsNumber(value) => Right(value.doubleValue)
          case _ => Left(s"Invoice summary value is not a number")
        }
      } else Left(s"Cannot find invoice summary in '${d.docType}'")
    } else Left(s"The document type '${d.docType}' is not registered")
  }

  lazy val invoice1: JsObject = {
    val filename = "public/assets/templates/invoice-1.json"
    Play.current.resourceAsStream(filename) match {
      case Some(is) =>
        val str = scala.io.Source.fromInputStream(is).getLines().mkString
        val obj = Try(Json.parse(str)) map { json =>
          json match {
            case obj: JsObject => obj
            case _ =>
              Logger.warn("File '${filename}' is not a valid JSON root object")
              Json.obj()
          }
        }
        obj match {
          case Success(obj) => obj
          case Failure(t) =>
            Logger.warn("Error in reading template file", t)
            Json.obj()
        }
      case None =>
        Logger.warn(s"File '${filename}' was not found")
        Json.obj()
    }
  }
}
