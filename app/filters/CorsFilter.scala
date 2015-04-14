package filters

import play.api.libs.concurrent.Execution.Implicits.defaultContext
import play.api.mvc.{ EssentialAction, EssentialFilter, RequestHeader }

object CorsFilter extends EssentialFilter {
  def apply(next: EssentialAction) = new EssentialAction {
    def apply(requestHeader: RequestHeader) = {
      next(requestHeader).map { result =>
        result.withHeaders(
          "Access-Control-Allow-Origin" -> "*",
          "Access-Control-Expose-Headers" -> "WWW-Authenticate, Server-Authorization",
          "Access-Control-Allow-Methods" -> "POST, GET, OPTIONS, PUT, DELETE",
          "Access-Control-Allow-Headers" -> "x-requested-with,content-type,Cache-Control,Pragma,Date"
        )
      }
    }
  }
}
