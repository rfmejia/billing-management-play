package controllers

import com.github.rfmejia.hoa._
import com.github.rfmejia.hoa.slick.models.{ actionLogs, documents }
import com.github.rfmejia.hoa.slick.ConnectionFactory
import org.joda.time.DateTime
import org.locker47.json.play._
import play.api.libs.json._
import play.api._
import scala.slick.driver.PostgresDriver.simple._
import securesocial.core.RuntimeEnvironment

class ActionLogs(override implicit val env: RuntimeEnvironment[User])
    extends ApiController[User] {

  lazy val createForm: JsObject = getCreateTemplate("DOCUMENTS")
  lazy val editForm: JsObject = getEditTemplate("DOCUMENTS")

  def show(id: Int) = SecuredAction { implicit request =>
    val logs: List[JsObject] = Document.actionLogsOf(id) map {
      log =>
        JsObject(Seq(
          "id" -> JsNumber(log.id),
          "who" -> JsString(log.who),
          "what" -> JsNumber(log.what),
          "when" -> JsString(log.when.toString),
          "why" -> JsString(log.why)
        ))
    }

    val self = routes.ActionLogs.show(id)
    Ok {
      HalJsObject.self(self.absoluteURL())
        .withLink("profile", "hoa:logs")
        .withField("total", logs.length)
        .withEmbedded(HalJsObject.empty
          .withField("items", JsArray(logs)))
        .asJsValue
    }
  }
}
