package controllers

import akka.util.Timeout
import com.nooovle.User
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

  def log = SecuredAction(parse.json) { implicit request =>
    implicit val timeout = Timeout(1 second)
    val result: String = Await.result(writeText(request.body.toString), timeout.duration)
    Ok(result)
  }

  def writeText(text: String): Future[String] =
    Play.current.configuration.getString("logservice.path") map {
      logFolderName =>
        Try { 
          val ld = LocalDate.now
          val year = f"${ld.getYear}"
          val month = f"${ld.getMonthOfYear}%02d"
          val day = f"${ld.getDayOfMonth}%02d"

          Files.createDirectories(Paths.get(logFolderName, year, month, day))

          val fileName = UUID.randomUUID().toString().replaceAll("-", "")
          val file: Path = Paths.get(logFolderName, year, month, day, fileName) 

          Files.write(file, text.getBytes)
          val msg = s"(${DateTime.now.toString}) Logged to ${file.toString}"
          Logger.info(msg)
          msg
       } 
     } match {
       case Some(Success(result)) => Future.successful(result)
       case Some(Failure(err)) => Future.failed[String](err)
       case None => Future.failed[String](throw new NullPointerException("Setting 'logservice.path' is not defined"))
     }
}
