package controllers

import akka.util.Timeout
import com.github.rfmejia.hoa.User
import java.nio.file._
import java.util.UUID
import org.joda.time.{ DateTime, LocalDate }
import org.locker47.json.play._
import play.api.{ Play, Logger }
import play.api.libs.json._
import scala.concurrent.{ Await, Future }
import scala.concurrent.duration._
import scala.language.postfixOps
import scala.util.{ Try, Success, Failure }
import securesocial.core.RuntimeEnvironment

class Logs(override implicit val env: RuntimeEnvironment[User])
    extends ApiController[User] {

  val logger = Logger("nvl-error-logging")

  def log = SecuredAction(parse.json) { implicit request =>
    implicit val timeout = Timeout(1 second)
    val result: String = Await.result(writeText(request.body.toString), timeout.duration)
    Ok(result)
  }

  def writeText(text: String): Future[String] = 
    Future.successful {
      val msg = s"(${DateTime.now.toString}) ${text}"
      logger.error(msg)
      msg
    }

}
