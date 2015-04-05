package controllers

import com.nooovle._
import com.nooovle.slick.ConnectionFactory
import com.nooovle.slick.models.userRoles
import org.joda.time.DateTime
import play.api._
import play.api.data.Form
import play.api.data.Forms._
import play.api.data.validation.Constraints._
import play.api.i18n.Lang
import play.api.i18n.Messages
import play.api.mvc.{ Action, RequestHeader }
import play.filters.csrf._
import play.twirl.api.Html
import scala.concurrent.Future
import scala.slick.driver.PostgresDriver.simple._
import securesocial.controllers.ViewTemplates
import securesocial.core._
import securesocial.core.authenticator.CookieAuthenticator
import securesocial.core.providers.{ MailToken, UsernamePasswordProvider }
import securesocial.core.services.SaveMode
import views.CustomViewTemplates

class Invitation(override implicit val env: RuntimeEnvironment[User]) extends BaseInvitation[User] {

  def startInvite() = {
    val hasAdmin = ConnectionFactory.connect withSession { implicit session =>
      (for {
        ur <- userRoles if ur.roleName === Roles.Admin.id
        u <- ur.user
      } yield ur).exists.run
    }

    if (hasAdmin) SecureInvitePage
    else OpenInvitePage
  }

  private def SecureInvitePage = CSRFAddToken {
    SecuredAction(WithRoles(Roles.Admin)) { implicit request =>

      if (SecureSocial.enableRefererAsOriginalUrl) {
        SecureSocial.withRefererAsOriginalUrl(Ok(customViewTemplate.getStartInvitePage(invitationForm)))
      } else {
        Ok(customViewTemplate.getStartInvitePage(invitationForm))
      }
    }
  }

  private def OpenInvitePage = CSRFAddToken {
    Action { implicit request =>
      if (SecureSocial.enableRefererAsOriginalUrl) {
        SecureSocial.withRefererAsOriginalUrl(Ok(customViewTemplate.getStartInvitePage(invitationForm)))
      } else {
        Ok(customViewTemplate.getStartInvitePage(invitationForm))
      }
    }
  }
}

trait BaseInvitation[U] extends securesocial.controllers.BaseRegistration[U] with ApiController[U] {

  val invitationForm: Form[InvitationInfo] = Form(
    mapping(
      "email" -> email.verifying(nonEmpty),
      Roles.Encoder.id -> boolean,
      Roles.Checker.id -> boolean,
      Roles.Approver.id -> boolean,
      Roles.Admin.id -> boolean)(InvitationInfo.apply)(InvitationInfo.unapply))

  lazy val customViewTemplate = env.viewTemplates match {
    case custom: CustomViewTemplates => custom
    case _ => throw new IllegalStateException(Messages("hoa.invite.errors.NotCustomViewTemplates"))
  }

  /**
   * Handles posts from the invite page
   */
  def handleStartInvite = CSRFCheck {
    Action.async { implicit request =>
      invitationForm.bindFromRequest.fold(
        errors => {
          Future.successful(BadRequest(customViewTemplate.getStartInvitePage(errors)))
        },
        form => {
          val email = form.email
          // check if there is already an account for this email address
          env.userService.findByEmailAndProvider(email, UsernamePasswordProvider.UsernamePassword).map {
            maybeUser =>
              maybeUser match {
                case Some(user) =>
                  // user signed up already, send an email offering to login/recover password
                  env.mailer.sendAlreadyRegisteredEmail(user)
                case None =>
                  createToken(email, isSignUp = true).flatMap { token =>
                    env.mailer.sendSignUpEmail(email, token.uuid)
                    val inviteToken = InvitationMailToken(token, Some(form))
                    Logger.debug(s"Invitation to ${email} contains invitation info: ${form}")
                    env.userService.saveToken(inviteToken)
                  }
              }
              handleStartResult().flashing(Success -> Messages("hoa.invite.inviteSent"), Email -> email)
          }
        })
    }
  }

  /**
   * Saves roles of a user if the supplied token was created from an invitation
   * @param userId User ID
   * @param token Mail token
   */
  private def saveRoles(userId: String, token: MailToken): Future[String] =
    token match {
      case inv: InvitationMailToken =>
        def f(b: Boolean, r: Role): Set[Role] = if (b) Set(r) else Set.empty
        val roles: Set[Role] =
          f(inv.isEncoder, Roles.Encoder) ++
            f(inv.isChecker, Roles.Checker) ++
            f(inv.isApprover, Roles.Approver) ++
            f(inv.isAdmin, Roles.Admin)
        Future.fromTry(User.updateRoles(userId, roles))
      case _ => Future.successful("Not an invitation, nothing saved")
    }

  override def handleSignUp(token: String) = CSRFCheck {
    Action.async {
      implicit request =>
        executeForToken(token, true, {
          t =>
            form.bindFromRequest.fold(
              errors => {
                Logger.debug("[securesocial] errors " + errors)
                Future.successful(BadRequest(env.viewTemplates.getSignUpPage(errors, t.uuid)))
              },
              info => {
                val id = if (UsernamePasswordProvider.withUserNameSupport) info.userName.get else t.email
                val newUser = BasicProfile(
                  providerId,
                  id,
                  Some(info.firstName),
                  Some(info.lastName),
                  Some("%s %s".format(info.firstName, info.lastName)),
                  Some(t.email),
                  None,
                  AuthenticationMethod.UserPassword,
                  passwordInfo = Some(env.currentHasher.hash(info.password)))

                val withAvatar = env.avatarService.map {
                  _.urlFor(t.email).map { url =>
                    if (url != newUser.avatarUrl) newUser.copy(avatarUrl = url) else newUser
                  }
                }.getOrElse(Future.successful(newUser))

                import securesocial.core.utils._
                val result = for {
                  toSave <- withAvatar
                  saved <- env.userService.save(toSave, SaveMode.SignUp)
                  withRoles <- saveRoles(id, t)
                  deleted <- env.userService.deleteToken(t.uuid)
                } yield {
                  if (UsernamePasswordProvider.sendWelcomeEmail)
                    env.mailer.sendWelcomeEmail(newUser)
                  val eventSession = Events.fire(new SignUpEvent(saved)).getOrElse(request.session)
                  if (UsernamePasswordProvider.signupSkipLogin) {
                    env.authenticatorService.find(CookieAuthenticator.Id).map {
                      _.fromUser(saved).flatMap { authenticator =>
                        confirmationResult().flashing(Success -> Messages("securesocial.signup.signUpDone")).startingAuthenticator(authenticator)
                      }
                    } getOrElse {
                      Logger.error(s"[securesocial] There isn't CookieAuthenticator registered in the RuntimeEnvironment")
                      Future.successful(confirmationResult().flashing(Error -> Messages("There was an error signing you up")))
                    }
                  } else {
                    Future.successful(confirmationResult().flashing(Success -> Messages("securesocial.signup.signUpDone")).withSession(eventSession))
                  }
                }
                result.flatMap(f => f)
              })
        })
    }
  }
}

trait BaseInvitationInfo {
  val email: String
  val isEncoder: Boolean
  val isChecker: Boolean
  val isApprover: Boolean
  val isAdmin: Boolean
}

case class InvitationInfo(email: String, isEncoder: Boolean, isChecker: Boolean, isApprover: Boolean, isAdmin: Boolean) extends BaseInvitationInfo

class InvitationMailToken(
  override val uuid: String,
  override val email: String,
  override val creationTime: DateTime,
  override val expirationTime: DateTime,
  override val isSignUp: Boolean,
  val isEncoder: Boolean,
  val isChecker: Boolean,
  val isApprover: Boolean,
  val isAdmin: Boolean) extends MailToken(uuid, email, creationTime, expirationTime, isSignUp) with BaseInvitationInfo {

  lazy val invitationInfo = InvitationInfo(email, isEncoder, isChecker, isApprover, isAdmin)
}

object InvitationMailToken {
  def apply(token: MailToken, invitationInfo: Option[InvitationInfo]): InvitationMailToken = {
    val inv = invitationInfo getOrElse InvitationInfo(token.email, false, false, false, false)
    new InvitationMailToken(
      token.uuid, token.email, token.creationTime, token.expirationTime, token.isSignUp,
      inv.isEncoder, inv.isChecker, inv.isApprover, inv.isAdmin)
  }
}
