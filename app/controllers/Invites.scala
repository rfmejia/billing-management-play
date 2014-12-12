package controllers

import com.nooovle._
import com.nooovle.slick.models.{ modelInfo, invites }
import com.nooovle.slick.ConnectionFactory
import org.joda.time.DateTime
import org.locker47.json.play._
import play.api.libs.json._
import play.api._
import play.api.mvc.{ Action, Controller }
import play.api.mvc.BodyParsers._
import scala.slick.driver.H2Driver.simple._
import scala.util.{ Try, Success, Failure }

object Invites extends Controller {
  def show(username: String) = Action { implicit request =>
    Invite.findByUsernameWithRoles(username) match {
      case Some((i, rs)) =>
        val self = routes.Invites.show(username)
        val obj = HalJsObject.create(self.absoluteURL())
          .withCurie("hoa", Application.defaultCurie)
          .withLink("profile", "hoa:invite")
          .withLink("collection", routes.Invites.list().absoluteURL())
          .withLink("edit", routes.Invites.edit(username).absoluteURL())
          .withLink("hoa:acceptInvite",
            routes.Users.createViaInvite(username).absoluteURL())
          .withField("_template", List(editForm, acceptForm))
          .withField("username", i.username)
          .withField("email", i.email)
          .withField("validUntil", i.validUntil)
          .withField("validationCode", i.validationCode)
          .withField("roles", rs)
        Ok(obj.asJsValue)
      case None => NotFound
    }
  }

  def list(offset: Int = 0, limit: Int = 10) = Action { implicit request =>
    val (is, total) = ConnectionFactory.connect withSession { implicit session =>
      val is = invites.drop(offset).take(limit).list
      val total = invites.length.run
      (is, total)
    }

    val objs = is map { i =>
      val link = routes.Invites.show(i.username)
      val obj = HalJsObject.create(link.absoluteURL())
        .withLink("profile", "hoa:invite")
        .withField("username", i.username)
        .withField("email", i.email)
        .withField("validUntil", i.validUntil)
      obj.asJsValue
    }

    val self = routes.Invites.list(offset, limit)
    val blank = HalJsObject.create(self.absoluteURL())
      .withCurie("hoa", Application.defaultCurie)
      .withLink("profile", "collection")
      .withLink("up", routes.Application.index().absoluteURL())
      .withLink("create", routes.Invites.create().absoluteURL())
      .withField("_template", createForm)
      .withField("count", is.length)
      .withField("total", total)
    val x = blank.withEmbedded(HalJsObject.empty.withField("item", objs))

    Ok(x.asJsValue)
  }

  def create() = Action(parse.json) { implicit request =>
    val json = request.body
    ((json \ "username").asOpt[String], (json \ "email").asOpt[String], (json \ "roles").asOpt[Seq[String]], (json \ "validUntil").asOpt[DateTime]) match {
      case (Some(username), Some(email), Some(rs), Some(validUntil)) =>
        val newInvite = Invite(username, email, validUntil)
        val result = Invite.insertWithRoles(newInvite, rs.toSet)

        result match {
          case Success(username) =>
            val link = routes.Invites.show(username).absoluteURL()
            Created.withHeaders("Location" -> link)
          case Failure(err) => err match {
            case e: IllegalStateException => BadRequest(s"An invite under the username '${username}' already exists.")
            case e: Throwable => throw e
          }
        }
      case _ => BadRequest("Some required values are missing. Please check your request.")
    }
  }

  def edit(username: String) = Action(parse.json) { implicit request =>
    // Check existence under ID
    Invite.findByUsername(username) match {
      case None => NotFound
      case Some(invite) =>
        val json = request.body
        ((json \ "username").asOpt[String], (json \ "email").asOpt[String],
          (json \ "roles").asOpt[Seq[String]], (json \ "validUntil").asOpt[DateTime]) match {
            case (Some(username), Some(email), Some(rs), Some(validUntil)) =>
              val newInvite = invite.copy(username = username, email = email,
                validUntil = validUntil)
              Invite.updateWithRoles(username, newInvite, rs.toSet) match {
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
      val query = for (i <- invites if i.username === username) yield i
      query.delete
    }
    if (deleted == 0) NotFound
    else Ok
  }

  lazy val createForm: JsObject = {
    val fields = ModelInfo.toJsonArray {
      ConnectionFactory.connect withSession { implicit session =>
        val query = for (
          i <- modelInfo if i.modelName === "INVITES"
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
          i <- modelInfo if i.modelName === "INVITES"
            && i.editForm
        ) yield i
        query.list
      }
    }
    Json.obj("edit" -> Json.obj("data" -> fields))
  }

  lazy val acceptForm: JsObject = {
    val fields = ModelInfo.toJsonArray {
      ConnectionFactory.connect withSession { implicit session =>
        val query = for (
          i <- modelInfo if i.modelName === "USERS"
            && i.createForm
        ) yield i
        query.list
      }
    }
    Json.obj("hoa:acceptInvite" -> Json.obj("data" -> fields))
  }
}
