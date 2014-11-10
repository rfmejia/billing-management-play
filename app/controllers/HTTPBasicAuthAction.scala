package com.nooovle.security

import com.nooovle.User
import java.util.Base64
import org.apache.shiro.authc.UsernamePasswordToken
import play.api.libs.concurrent.Execution.Implicits.defaultContext
import play.api.mvc._
import play.api.mvc.Results._
import scala.concurrent.Future

object HTTPBasicAuthAction extends ActionBuilder[Request] {
  private val missingHeader = Unauthorized.withHeaders(
    "WWW-Authenticate" -> "Basic realm=\"hoa-realm\"")

  private def decodeAuthHeader(auth: String): Either[SimpleResult, UsernamePasswordToken] = {
    if (auth == null || auth.length == 0) Left(missingHeader)
    else {
      val header = auth.split(" ")
      if (header.length != 2 || header(0).equalsIgnoreCase("basic ")) {
        Left(BadRequest)
      } else {
        val decoded = new String(Base64.getDecoder().decode(header(1)))
        val upString = decoded.split(":")
        if (upString.length != 2) {
          Left(BadRequest)
        } else {
          Right(new UsernamePasswordToken(upString(0), upString(1)))
        }
      }
    }
  }

  def invokeBlock[A](request: Request[A], block: Request[A] => Future[SimpleResult]): Future[SimpleResult] = {
    request.headers.get("authorization") match {
      case Some(header) =>
        decodeAuthHeader(header) match {
          case Right(token) =>
            SecurityTools.authenticate(token) match {
              case Left(msg) => Future.successful(Forbidden(msg))
              case Right(subj) =>
                // TODO: Check authorization
                block(request)
            }
          case Left(result) => Future.successful(result)
        }
      case None => Future.successful(missingHeader)
    }
  }
}
