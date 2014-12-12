
import com.nooovle.slick.ConnectionFactory
import filters._
import org.locker47.json.play.HalJsObject
import play.api.libs.concurrent.Execution.Implicits.defaultContext
import play.api.libs.json._
import play.api.mvc.Results.InternalServerError
import play.api.mvc.{ RequestHeader, WithFilters }
import play.api.{ Application, GlobalSettings }
import play.filters.gzip.GzipFilter
import scala.concurrent.Future

object Global extends WithFilters(CorsFilter, new GzipFilter()) with GlobalSettings {

  override def onStart(app: Application) = {
    ConnectionFactory.connect withSession { implicit session =>
      com.nooovle.slick.models.buildTables
    }
  }

  override def onError(request: RequestHeader, ex: Throwable) = {
    Future.successful {
      InternalServerError {
        val obj = HalJsObject.create(request.uri)
          .withCurie("hoa", controllers.Application.defaultCurie(request))
          .withLink("profile", "hoa:error")
          .withField("title", "Unexpected Runtime Error")
          .withField("code", 500)
          .withField("message", "Uncaught application exception. Please contact your administrator for support.")
          .withField("exception", ex.getMessage)
          .withField("stackTrace", ex.getStackTrace.mkString("\n"))

        obj.asJsValue
      }
    }
  }
}
