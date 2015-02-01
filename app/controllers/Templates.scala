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

  val templates: Seq[JsObject] = Seq(invoice1)

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

  def list(offset: Int = 0, limit: Int = 10) = SecuredAction { implicit request =>
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

  lazy val invoice1: JsObject = {
    val filename = "public/assets/templates/invoice-1.json"
    Play.current.resourceAsStream(filename) match {
      case Some(is) =>
        val str = scala.io.Source.fromInputStream(is).getLines().mkString
        val obj = Try(Json.parse(str)) map { json =>
          json match {
            case obj: JsObject => obj
            case _ =>
              logger.warn("File '${filename}' is not a valid JSON root object")
              Json.obj()
          }
        }
        obj match {
          case Success(obj) => obj
          case Failure(t) =>
            logger.warn("Error in reading template file", t)
            Json.obj()
        }
      case None =>
        logger.warn(s"File '${filename}' was not found")
        Json.obj()
    }
  }
}
