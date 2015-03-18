package services

import play.api.mvc.{ Call, RequestHeader }
import securesocial.core.services.RoutesService

class CustomRoutesService extends RoutesService.Default {
  override def handleSignUpUrl(mailToken: String)(implicit req: RequestHeader): String = 
    absoluteUrl(controllers.routes.Invitation.handleSignUp(mailToken))
  
}
