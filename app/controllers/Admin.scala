package controllers

import com.nooovle._
import com.nooovle.slick.ConnectionFactory
import com.nooovle.slick.models._
import org.locker47.json.play._
import play.api._
import play.api.libs.json._
import play.api.mvc.{ Action, RequestHeader }
import play.filters.csrf._
import scala.slick.driver.H2Driver.simple._
import securesocial.core._

import play.api.data.Form
import play.api.data.Forms._
import play.api.data.validation.Constraints._

class Admin(override implicit val env: RuntimeEnvironment[User])
  extends ApiController[User] {

  def invite() = {
    val hasAdmin = ConnectionFactory.connect withSession { implicit session =>
      (for {
        ur <- userRoles if ur.roleName === "admin"
        u <- ur.user
      } yield ur).exists.run
    }

    if (hasAdmin) SecureInvitePage
    else OpenInvitePage
  }

  val startForm = Form(
    "email" -> email.verifying(nonEmpty)
    // "roles" -> checkbox
  )

  private def SecureInvitePage = CSRFAddToken {
    SecuredAction(WithRoles("admin")) {
      implicit request =>
        if (SecureSocial.enableRefererAsOriginalUrl) {
          SecureSocial.withRefererAsOriginalUrl(Ok(env.viewTemplates.getStartSignUpPage(startForm)))
        } else {
          Ok(env.viewTemplates.getStartSignUpPage(startForm))
        }
    }
  }

  private def OpenInvitePage = CSRFAddToken {
    Action {
      implicit request =>
        if (SecureSocial.enableRefererAsOriginalUrl) {
          SecureSocial.withRefererAsOriginalUrl(Ok(env.viewTemplates.getStartSignUpPage(startForm)))
        } else {
          Ok(env.viewTemplates.getStartSignUpPage(startForm))
        }
    }
  }
}
