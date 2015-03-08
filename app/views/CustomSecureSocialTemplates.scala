package views

import play.api.data.Form
import play.api.i18n.Lang
import play.api.mvc.RequestHeader
import play.twirl.api.Html
import securesocial.controllers.ViewTemplates
import securesocial.core.RuntimeEnvironment

class CustomSecureSocialTemplates(env: RuntimeEnvironment[_]) extends ViewTemplates.Default(env) {
  override def getLoginPage(form: Form[(String, String)],
    msg: Option[String] = None)(implicit request: RequestHeader, lang: Lang): Html =
    views.html.login(form, msg)
}

//  {

//   override def getSignUpPage(form: Form[RegistrationInfo], token: String)(implicit request: RequestHeader, lang: Lang): Html = ViewTemplates.Default.getSignUpPage

//   override def getStartSignUpPage(form: Form[String])(implicit request: RequestHeader, lang: Lang): Html = ViewTemplates.Default.getStartSignUpPage

//   override def getStartResetPasswordPage(form: Form[String])(implicit request: RequestHeader, lang: Lang): Html = ViewTemplates.Default.getStartResetPasswordPage

//   override def getResetPasswordPage(form: Form[(String, String)], token: String)(implicit request: RequestHeader, lang: Lang): Html = ViewTemplates.Default.getResetPasswordPage

//   override def getPasswordChangePage(form: Form[ChangeInfo])(implicit request: RequestHeader, lang: Lang): Html = ViewTemplates.Default.getPasswordChangePage

//   def getNotAuthorizedPage(implicit request: RequestHeader, lang: Lang): Html = ViewTemplates.Default.getNotAuthorizedPage
// }
