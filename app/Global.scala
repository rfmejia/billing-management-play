
import java.lang.reflect.Constructor

import scala.collection.immutable.ListMap
import scala.concurrent.Future
import scala.slick.driver.H2Driver.simple._

import org.locker47.json.play.HalJsObject

import com.nooovle._
import com.nooovle.slick.ConnectionFactory
import com.nooovle.slick.models.modelTemplates

import filters._
import play.api.Application
import play.api.GlobalSettings
import play.api.libs.concurrent.Execution.Implicits.defaultContext
import play.api.libs.json._
import play.api.mvc.RequestHeader
import play.api.mvc.Results.InternalServerError
import play.api.mvc.Results.Unauthorized
import play.api.mvc.WithFilters
import play.filters.gzip.GzipFilter
import securesocial.core.RuntimeEnvironment
import securesocial.core.providers._
import services.CustomUserService
import services.DemoUser

object Global extends WithFilters(CorsFilter, new GzipFilter()) with GlobalSettings {

  override def onStart(app: Application) = {
    ConnectionFactory.connect withSession { implicit session =>
      com.nooovle.slick.models.buildTables
      insertModelInfos
    }
  }

  override def onError(request: RequestHeader, ex: Throwable) = {
    Future.successful {
      InternalServerError {
        val obj = HalJsObject.create(request.uri)
          //          .withCurie("hoa", controllers.Application.defaultCurie(request))
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

  /**
   * Demo application's custom Runtime Environment
   */
  object DemoRuntimeEnvironment extends RuntimeEnvironment.Default[DemoUser] {
    override lazy val userService: CustomUserService = new CustomUserService
    override lazy val providers = ListMap(
      include(new UsernamePasswordProvider[DemoUser](userService, avatarService, viewTemplates, passwordHashers)))
  }

  /**
   * Dependency injection on Controllers using Cake Pattern
   *
   * @param controllerClass
   * @tparam A
   * @return
   */
  override def getControllerInstance[A](controllerClass: Class[A]): A = {
    val instance = controllerClass.getConstructors.find { c =>
      val params = c.getParameterTypes
      params.length == 1 && params(0) == classOf[RuntimeEnvironment[DemoUser]]
    }.map {
      _.asInstanceOf[Constructor[A]].newInstance(DemoRuntimeEnvironment)
    }
    instance.getOrElse(super.getControllerInstance(controllerClass))
  }

  def insertModelInfos(implicit session: Session) = {
    Tenant.modelInfos foreach (modelTemplates.insertOrUpdate(_))
    User.modelInfos foreach (modelTemplates.insertOrUpdate(_))
    Document.modelInfos foreach (modelTemplates.insertOrUpdate(_))
  }
}
