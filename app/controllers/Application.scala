package controllers

import com.nooovle._
import com.nooovle.slick.models._
import com.nooovle.slick.ConnectionFactory
import org.locker47.json.play._
import play.api.libs.json._
import play.api._
import play.api.mvc._
import scala.slick.driver.H2Driver.simple._

object Application extends Controller {

  def defaultCurie(implicit requestHeader: RequestHeader) =
    routes.Application.documentation.absoluteURL() + "/{rel}"

  def index = Action { implicit request =>
    val self = routes.Application.index
    val obj = HalJsObject.create(self.absoluteURL())
      .withCurie("hoa", Application.defaultCurie)
      .withLink("profile", "collection")
      .withLink("hoa:tenants", routes.Tenants.list().absoluteURL(),
        Some("List of registered tenants"))
      .withLink("hoa:documents", routes.Documents.list().absoluteURL(),
        Some("List of documents"))
      .withLink("hoa:users", routes.Users.list().absoluteURL(),
        Some("List of users"))
      .withLink("hoa:templates", routes.Templates.list().absoluteURL(),
        Some("List of document templates"))
      .withLink("hoa:webapp", routes.Assets.at("index.html").absoluteURL(),
        Some("Web application"))
      .withLink("hoa:mailboxes", routes.Application.listMailboxes.absoluteURL(),
        Some("Listing of mailboxes and description of workflow"))
    Ok(obj.asJsValue)
  }

  def documentation = TODO

  def listMailboxes = Action { implicit request =>
    val self = routes.Application.listMailboxes
    val obj = HalJsObject.create(self.absoluteURL())
      .withCurie("hoa", Application.defaultCurie)
      .withLink("profile", "collection")
    Ok(obj.asJsValue ++ Workflow.asJsObject)
  }
}
