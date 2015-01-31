package controllers

import com.nooovle._
import com.nooovle.slick.models.{ modelTemplates, users }
import com.nooovle.slick.ConnectionFactory
import org.joda.time.DateTime
import org.locker47.json.play._
import play.api.libs.json._
import play.api._
import play.api.mvc.{ Action, Controller }
import play.api.mvc.BodyParsers._
import scala.slick.driver.H2Driver.simple._
import scala.util.{ Try, Success, Failure }
import securesocial.core.{ RuntimeEnvironment, SecureSocial }

class Users(override implicit val env: RuntimeEnvironment[User])
  extends ApiController[User] {

  def show(userId: String) = SecuredAction { implicit request =>
    User.findByUserIdWithRoles(userId) match {
      case Some((u, rs)) =>
        Ok {
          val self = routes.Users.show(userId)
          val obj = HalJsObject.create(self.absoluteURL())
            .withCurie("hoa", Application.defaultCurie)
            .withLink("profile", "hoa:user")
            .withLink("collection", routes.Users.list().absoluteURL())
            .withLink("edit", routes.Users.edit(userId).absoluteURL())
            .withField("_template", editForm)
            .withField("userId", u.userId)
            .withField("email", u.email)
            .withField("firstName", u.firstName)
            .withField("lastName", u.lastName)
            .withField("fullName", u.fullName)
            .withField("roles", rs)
          obj.asJsValue
        }
      case None => NotFound
    }
  }

  def list(offset: Int = 0, limit: Int = 10) = SecuredAction { implicit request =>
    val (us, total) = ConnectionFactory.connect withSession { implicit session =>
      val us = users.drop(offset).take(limit).list
      val total = users.length.run
      (us, total)
    }
    val objs = us map { u =>
      val link = routes.Users.show(u.userId)
      val obj = HalJsObject.create(link.absoluteURL())
        .withLink("profile", "hoa:user")
        .withField("userId", u.userId)
        .withField("firstName", u.firstName)
        .withField("lastName", u.lastName)
      obj.asJsValue
    }

    Ok {
      val self = routes.Users.list(offset, limit)
      val blank = HalJsObject.create(self.absoluteURL())
        .withCurie("hoa", Application.defaultCurie)
        .withLink("profile", "collection")
        .withLink("up", routes.Application.index().absoluteURL())
        .withField("count", us.length)
        .withField("total", total)
      val x = blank.withEmbedded(HalJsObject.empty.withField("item", objs))

      x.asJsValue
    }
  }

  def edit(userId: String) = SecuredAction(parse.json) { implicit request =>
    val json = request.body
    ((json \ "firstName").as[Option[String]], (json \ "lastName").as[Option[String]],
      (json \ "email").as[Option[String]], (json \ "roles").asOpt[Seq[String]]) match {
        case (firstName, lastName, email, Some(rs)) =>
          User.updateWithRoles(userId, firstName, lastName, email, rs.toSet) match {
            case Success(userId) => NoContent
            case Failure(err) => err match {
              case e: IndexOutOfBoundsException => NotFound
              case e: Throwable                 => throw e
            }
          }
        case _ => BadRequest("Some required values are missing. Please check your request.")
      }
  }

  def delete(userId: String) = SecuredAction { implicit request =>
    val deleted = ConnectionFactory.connect withSession { implicit session =>
      val query = for (u <- users if u.userId === userId) yield u
      query.delete
    }
    if (deleted == 0) NotFound
    else Ok
  }

  lazy val createForm: JsObject = getCreateTemplate("USERS")
  lazy val editForm: JsObject = getEditTemplate("USERS")
}
