
import com.nooovle._
import com.nooovle.slick.ConnectionFactory
import com.nooovle.slick.models.modelTemplates
import filters._
import java.lang.reflect.Constructor
import java.nio.file.{ Files, Paths }
import org.locker47.json.play.HalJsObject
import play.api.libs.json._
import play.api.mvc.Results._
import play.api.mvc.{ RequestHeader, WithFilters }
import play.api.{ Application, GlobalSettings, Logger, Play }
import play.filters.gzip.GzipFilter
import play.mvc.Http.Status
import scala.collection.immutable.ListMap
import scala.concurrent.{ ExecutionContext, Future }
import scala.slick.driver.PostgresDriver.simple._
import scala.util.{ Try, Success, Failure }
import securesocial.core.providers._
import securesocial.core.RuntimeEnvironment
import services.{ CustomRoutesService, CustomUserService }
import views.CustomViewTemplates

object Global extends WithFilters(CorsFilter, new GzipFilter()) with GlobalSettings {
  val logger = Logger(this.getClass.getName)

  private def exportSchemaStatements(pathKey: String, statements: Iterator[String]): Try[String] =
    Try {
      val path = Paths.get(Play.current.configuration.getString(pathKey).get)
      Files.write(path, statements.map(_ + ";").mkString("\n").getBytes)
      s"Successfully exported to ${path}"
    }

  private val initializeDB: Try[String] =
    Try {
      ConnectionFactory.connect withSession { implicit session =>
        val msgs = com.nooovle.slick.models.buildTables
        msgs foreach (msg => logger.info(msg.toString))
        //insertModelInfos
      }
      "Successfully initialized the database"
    }

  override def onStart(app: Application) = {
    val bootSequence: Try[List[String]] = for {
      msg1 <- exportSchemaStatements("schema.create.path", slick.models.ddl.createStatements)
      msg2 <- exportSchemaStatements("schema.drop.path", slick.models.ddl.dropStatements)
    } yield List(msg1, msg2)

    bootSequence match {
      case Success(msgs) => msgs.foreach(logger.info(_))
      case Failure(err) =>
        logger.error(s"Could not initialize the database", err)
        err.printStackTrace()
    }
  }

  // TODO: Add an HTML 500 page in addition to the JSON response
  override def onError(request: RequestHeader, ex: Throwable) =
    Future.successful {
      logger.warn(s"Error on request ${request.toString}", ex)
      InternalServerError {
        val obj = HalJsObject.self(request.uri)
          .withCurie("hoa", controllers.Application.defaultCurie(request))
          .withLink("profile", "hoa:error")
          .withField("title", "Unexpected Runtime Error")
          .withField("code", Status.INTERNAL_SERVER_ERROR)
          .withField("message", "Uncaught application exception. Please contact your administrator for support.")
          .withField("devMsg", ex.getMessage)
          .withField("stackTrace", ex.getStackTrace.mkString("\n"))

        obj.asJsValue
      }
    }

  override def onBadRequest(request: RequestHeader, error: String) =
    Future.successful {
      BadRequest {
        val obj = HalJsObject.self(request.uri)
          .withCurie("hoa", controllers.Application.defaultCurie(request))
          .withLink("profile", "hoa:error")
          .withField("title", "Bad request")
          .withField("code", Status.BAD_REQUEST)
          .withField("message", "You submitted a bad request. Please check your inputs or contact your administrator for support.")
          .withField("devMsg", error)

        obj.asJsValue
      }
    }

  // TODO: Add an HTML 404 page in addition to the JSON response
  override def onHandlerNotFound(request: RequestHeader) =
    Future.successful {
      NotFound {
        val obj = HalJsObject.self(request.uri)
          .withCurie("hoa", controllers.Application.defaultCurie(request))
          .withLink("profile", "hoa:error")
          .withField("title", "Action Not Found")
          .withField("code", Status.NOT_FOUND)
          .withField("message", "The server does not know the requested action. Please contact your administrator for support.")
          .withField("devMsg", s"Unkown action '${request.toString}'")

        obj.asJsValue
      }
    }

  /**
   * Demo application's custom Runtime Environment
   */
  object MyRuntimeEnvironment extends RuntimeEnvironment.Default[User] {
    override implicit val executionContext = play.api.libs.concurrent.Execution.defaultContext
    override lazy val userService: CustomUserService = new CustomUserService
    override lazy val routes = new CustomRoutesService
    override lazy val providers = ListMap(
      include(new UsernamePasswordProvider[User](userService, avatarService, viewTemplates, passwordHashers))
    )
    override lazy val viewTemplates = new CustomViewTemplates(this)
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
      params.length == 1 && params(0) == classOf[RuntimeEnvironment[User]]
    }.map {
      _.asInstanceOf[Constructor[A]].newInstance(MyRuntimeEnvironment)
    }
    instance.getOrElse(super.getControllerInstance(controllerClass))
  }
}
