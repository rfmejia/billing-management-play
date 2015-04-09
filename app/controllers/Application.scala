package controllers

import com.nooovle._
import com.nooovle.slick.ConnectionFactory
import com.nooovle.slick.models._
import org.locker47.json.play._
import play.api._
import play.api.libs.json._
import play.api.mvc.RequestHeader
import scala.slick.driver.PostgresDriver.simple._
import securesocial.core._

object Application {
  def defaultCurie(implicit requestHeader: RequestHeader) =
    routes.Application.documentation.absoluteURL() + "/{rel}"
}

class Application(override implicit val env: RuntimeEnvironment[User])
    extends ApiController[User] {

  def index = SecuredAction { implicit request =>
    Ok {
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
        .withLink("hoa:webapp", routes.Assets.at("/public", "index.html").absoluteURL(),
          Some("Web application"))
        .withLink("hoa:mailboxes", routes.Workflow.listMailboxes.absoluteURL(),
          Some("Listing of mailboxes and description of workflow"))
        .withLink("hoa:logout", "/logout")
        .withLink("hoa:currentUser", routes.Users.showCurrentUser().absoluteURL(),
          Some("Information about the user currently logged in"))
        .withLink("hoa:reports", routes.Reports.show(None, None).absoluteURL())
        .withLink("hoa:invite", routes.Invitation.startInvite().absoluteURL())
        .withLink("hoa:logservice", routes.Logs.log().absoluteURL())
      obj.asJsValue
    }
  }

  def documentation = SecuredAction {
    val filename = "public/assets/docs/api-docs.md"
    Play.current.resourceAsStream(filename) match {
      case Some(stream) =>
        val md = scala.io.Source.fromInputStream(stream).getLines().mkString("\n")
        val doc = s"""
<head><title>HOA API Documentation</title></head>
<xmp theme="united" style="display:none;">${md}</xmp>
<script src="http://strapdownjs.com/v/0.2/strapdown.js"></script>
        """
        Ok(doc).as(HTML)
      case None =>
        Logger.warn(s"File '${filename}' was not found")
        NotFound
    }
  }
}
