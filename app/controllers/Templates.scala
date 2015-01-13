//package controllers
//
//import com.nooovle._
//import com.nooovle.templates._
//import org.locker47.json.play._
//import play.api.libs.json._
//import play.api._
//import play.api.mvc.{ Action, Controller }
//import scala.slick.driver.H2Driver.simple._
//import scala.util.{ Try, Success, Failure }
//
//object Templates extends Controller {
//  val templates = Seq(BillingTemplate.asJsObject)
//
//  def show(docType: String) = Action { implicit request =>
//    templates find { template =>
//      (template \ "docType").as[String] == docType
//    } match {
//      case Some(template) =>
//        Ok {
//          val link = routes.Templates.show(docType)
//          HalJsObject.create(link.absoluteURL())
//            .withLink("profile", "hoa:template")
//            .asJsValue ++ template
//        }
//      case None => NotFound
//    }
//  }
//
//  def list(offset: Int = 0, limit: Int = 10) = Action { implicit request =>
//    val objs = templates map { t =>
//      val docType = (t \ "docType").as[String]
//      val link = routes.Templates.show(docType)
//      val obj = HalJsObject.create(link.absoluteURL())
//        .withLink("profile", "hoa:template")
//        .withField("docType", t \ "docType")
//        .withField("name", t \ "name")
//      obj.asJsValue
//    }
//
//    val self = routes.Templates.list(offset, limit)
//    val blank = HalJsObject.create(self.absoluteURL())
//      .withCurie("hoa", Application.defaultCurie)
//      .withLink("profile", "collection")
//      .withLink("up", routes.Application.index().absoluteURL())
//      .withField("count", templates.length)
//      .withField("total", templates.length)
//    val x = blank.withEmbedded(HalJsObject.empty.withField("item", objs))
//
//    Ok(x.asJsValue)
//  }
//}
