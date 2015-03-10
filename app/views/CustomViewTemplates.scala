package views

import controllers.InvitationInfo
import play.api.data.Form
import play.api.i18n.Lang
import play.api.mvc.RequestHeader
import play.twirl.api.Html
import securesocial.controllers.ViewTemplates
import securesocial.core.RuntimeEnvironment

class CustomViewTemplates(env: RuntimeEnvironment[_]) extends ViewTemplates.Default(env) {
  override def getLoginPage(form: Form[(String, String)],
    msg: Option[String] = None)(implicit request: RequestHeader, lang: Lang): Html =
    views.html.login(form, msg)

  def getStartInvitePage(form: Form[InvitationInfo])(implicit request: RequestHeader, lang: Lang): Html =
    views.html.startInvite(form)
}
