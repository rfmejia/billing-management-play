package controllers

import com.nooovle._
import com.nooovle.templates._
import org.locker47.json.play._
import play.api.libs.json._
import play.api._
import play.api.mvc.{ Action, Controller }
import scala.slick.driver.H2Driver.simple._
import scala.util.{ Try, Success, Failure }
import securesocial.core.{ Identity, Authorization }

object Templates extends Controller with securesocial.core.SecureSocial {
  def show(id: String) = Action { implicit request =>
    id match {
      case "billing_template-1" => Ok(BillingTemplate.asJsValue)
      case _ => NotFound
    }
  }

  def list(offset: Int = 0, limit: Int = 10) = Action { implicit request =>
    val templates = Seq(BillingTemplate.asJsValue)

    val objs = templates map { t =>
      val id = (t \ "id") match {
        case JsString(value) => value
        case _ => (t \ "id").toString
      }
      val link = routes.Templates.show(id)
      val obj = HalJsObject.create(link.absoluteURL())
        .withLink("profile", "hoa:template")
        .withField("name", t \ "name")
      obj.asJsValue
    }

    val self = routes.Users.list(offset, limit)
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
