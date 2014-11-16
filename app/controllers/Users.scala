package controllers

import com.nooovle._
import com.nooovle.security.HTTPBasicAuthAction
import com.nooovle.slick.models.{ modelInfo, users }
import com.nooovle.slick.ConnectionFactory
import org.joda.time.DateTime
import org.locker47.json.play._
import play.api.libs.json._
import play.api._
import play.api.mvc.{ Action, Controller }
import play.api.mvc.BodyParsers._
import scala.slick.driver.H2Driver.simple._
import scala.util.{ Try, Success, Failure }

object Users extends Controller {
  def show(username: String) = Action { implicit request =>
    User.findByUsernameWithRoles(username) match {
      case Some((u, rs)) =>
        val self = routes.Users.show(username)
        val obj = HalJsObject.create(self.absoluteURL())
          .withCurie("hoa", Application.defaultCurie)
          .withLink("profile", "hoa:user")
          .withLink("collection", routes.Users.list().absoluteURL())
          .withLink("edit", routes.Users.edit(username).absoluteURL())
          .withField("_template", editForm)
          .withField("username", u.username)
          .withField("email", u.email)
          .withField("firstName", u.firstName)
          .withField("lastName", u.lastName)
          .withField("roles", rs)
        Ok(obj.asJsValue)
      case None => NotFound
    }
  }

  def list(offset: Int = 0, limit: Int = 10) = Action { implicit request =>
    val (us, total) = ConnectionFactory.connect withSession { implicit session =>
      val us = users.drop(offset).take(limit).list
      val total = users.length.run
      (us, total)
    }

    val objs = us map { u =>
      val link = routes.Users.show(u.username)
      val obj = HalJsObject.create(link.absoluteURL())
        .withLink("profile", "hoa:user")
        .withField("username", u.username)
        .withField("firstName", u.firstName)
        .withField("lastName", u.lastName)
      obj.asJsValue
    }

    val self = routes.Users.list(offset, limit)
    // val createUrl = routes.Users.create("--------").absoluteURL()
    // .replaceAll("--------", "{username}")
    val blank = HalJsObject.create(self.absoluteURL())
      .withCurie("hoa", Application.defaultCurie)
      .withLink("profile", "collection")
      .withLink("up", routes.Application.index().absoluteURL())
      // .withLink("create", createUrl)
      .withField("_template", createForm)
      .withField("count", us.length)
      .withField("total", total)
    val x = blank.withEmbedded(HalJsObject.empty.withField("item", objs))

    Ok(x.asJsValue)
  }

  def createViaInvite(username: String) = Action(parse.json) { implicit request =>
    val json = request.body
    ((json \ "firstName").asOpt[String], (json \ "lastName").asOpt[String],
      (json \ "password").asOpt[String], (json \ "validationCode").asOpt[String]) match {
        case (Some(firstName), Some(lastName), Some(password), Some(validationCode)) =>
          Invite.findByUsernameWithRoles(username) match {
            case Some((invite, rs)) =>
              val now = new DateTime()
              if (!now.isBefore(invite.validUntil)) BadRequest("Invite has expired")
              else if (invite.validationCode != validationCode) BadRequest("Invalid validation code")
              else {
                val newUser = User(invite.username, invite.email,
                  password.getBytes, firstName, lastName)
                val result = User.insertWithRoles(newUser, rs)

                result match {
                  case Success(id) =>
                    val link = routes.Users.show(id).absoluteURL()
                    Created.withHeaders("Location" -> link)
                  case Failure(err) => err match {
                    case e: IllegalStateException => BadRequest(s"The username '${username}' already exists.")
                    case e: Throwable => throw e
                  }
                }
              }
            case None => NotFound
          }
        case _ => BadRequest("Some required values are missing. Please check your request.")
      }
  }

  def edit(username: String) = Action(parse.json) { implicit request =>
    // Check existence under ID
    User.findByUsername(username) match {
      case None => NotFound
      case Some(user) =>
        val json = request.body
        ((json \ "email").asOpt[String], (json \ "firstName").asOpt[String],
          (json \ "lastName").asOpt[String], (json \ "password").asOpt[String],
          (json \ "roles").asOpt[Seq[String]]) match {
            case (Some(email), Some(firstName), Some(lastName), Some(password),
              Some(rs)) =>
              // Create a new user to ensure proper salt generation
              val newUser = User(user.username, email, password.getBytes,
                firstName, lastName)

              User.updateWithRoles(newUser, rs.toSet) match {
                case Success(username) => NoContent
                case Failure(err) => err match {
                  case e: IndexOutOfBoundsException => NotFound
                  case e: Throwable => throw e
                }
              }
            case _ => BadRequest("Some required values are missing. Please check your request.")
          }
    }
  }

  def delete(username: String) = Action { implicit request =>
    val deleted = ConnectionFactory.connect withSession { implicit session =>
      val query = for (u <- users if u.username === username) yield u
      query.delete
    }
    if (deleted == 0) NotFound
    else Ok
  }

  lazy val createForm: JsObject = {
    val fields = ModelInfo.toJsonArray {
      ConnectionFactory.connect withSession { implicit session =>
        val query = for (
          i <- modelInfo if i.modelName === "USERS"
            && i.createForm
        ) yield i
        query.list
      }
    }
    Json.obj("create" -> Json.obj("data" -> fields))
  }

  lazy val editForm: JsObject = {
    val fields = ModelInfo.toJsonArray {
      ConnectionFactory.connect withSession { implicit session =>
        val query = for (
          i <- modelInfo if i.modelName === "USERS"
            && i.editForm
        ) yield i
        query.list
      }
    }
    Json.obj("edit" -> Json.obj("data" -> fields))
  }
}
