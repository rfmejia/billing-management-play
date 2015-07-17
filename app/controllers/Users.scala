package controllers

import com.nooovle._
import com.nooovle.DomainModelWrites._
import com.nooovle.slick.models.{ modelTemplates, users }
import com.nooovle.slick.ConnectionFactory
import org.joda.time.DateTime
import org.locker47.json.play._
import play.api.libs.json._
import play.api._
import play.api.mvc.{ Action, Controller }
import play.api.mvc.BodyParsers._
import scala.slick.driver.PostgresDriver.simple._
import scala.util.{ Try, Success, Failure }
import securesocial.core.{ RuntimeEnvironment, SecureSocial }

class Users(override implicit val env: RuntimeEnvironment[User])
    extends ApiController[User] {

  lazy val editForm: JsObject = getEditTemplate("USERS")

  def show(userId: String) = SecuredAction { implicit request =>
    User.findByUserIdWithRoles(userId) match {
      case Some((u, rs)) =>
        Ok {
          val self = routes.Users.show(userId)
          val obj = HalJsObject.from(Json.toJson(u))
            .self(self.absoluteURL())
            .withCurie("hoa", Application.defaultCurie)
            .withLink("profile", "hoa:user")
            .withLink("collection", routes.Users.list().absoluteURL())
            .withLink("edit", routes.Users.edit(userId).absoluteURL())
            .withField("_template", editForm)
            .withField("roles", roleSetToJsArray(rs))

          val withEditRoleLink =
            if (User.findRoles(request.user.userId).contains(Roles.Admin))
              obj.withLink("hoa:editRoles", routes.Users.editRoles(u.userId).absoluteURL())
            else obj

          withEditRoleLink.asJsValue
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
      val obj = HalJsObject.from(Json.toJson(u))
        .self(link.absoluteURL())
        .withLink("profile", "hoa:user")
      obj.asJsValue
    }

    Ok {
      val self = routes.Users.list(offset, limit)
      val blank = HalJsObject.self(self.absoluteURL())
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
    // TODO: Only same user, or admin can edit
    val json = request.body
    (
      (json \ "firstName").as[Option[String]],
      (json \ "lastName").as[Option[String]]
    ) match {
        case (Some(firstName), Some(lastName)) =>
          User.update(userId, Some(firstName), Some(lastName)) match {
            case Success(_) => NoContent
            case Failure(err) => err match {
              case e: IndexOutOfBoundsException => NotFound
              case e: Throwable => throw e
            }
          }
        case _ => BadRequest("Some required values are missing. Please check your request.")
      }
  }

  def editRoles(userId: String) = SecuredAction(WithRoles(Roles.Admin))(parse.json) {
    implicit request =>
      val json = request.body
      (json \ "roles").asOpt[Seq[String]] match {
        case Some(rs) =>
          User.updateRoles(userId, Roles.fromStringSet(rs.toSet)) match {
            case Success(userId) => NoContent
            case Failure(err) => err match {
              case e: IndexOutOfBoundsException => NotFound
              case e: Throwable => throw e
            }
          }
        case _ => BadRequest("Some required values are missing. Please check your request.")
      }
  }

  def delete(userId: String) = SecuredAction(WithRoles(Roles.Admin)) { implicit request =>
    val deleted = ConnectionFactory.connect withSession { implicit session =>
      val query = for (u <- users if u.userId === userId) yield u
      query.delete
    }
    if (deleted == 0) NotFound
    else Ok
  }

  def showCurrentUser() = SecuredAction { implicit request =>
    Ok {
      val u = request.user
      val rs = User.findRoles(u.userId)

      val self = routes.Users.show(u.userId)
      val obj = HalJsObject.from(Json.toJson(u))
        .self(self.absoluteURL())
        .withCurie("hoa", Application.defaultCurie)
        .withLink("profile", "hoa:user")
        .withLink("collection", routes.Users.list().absoluteURL())
        .withLink("edit", routes.Users.edit(u.userId).absoluteURL())
        .withField("_template", editForm)
        
      obj.asJsValue
    }
  }

  def roleSetToJsArray(roles: Set[Role]): JsArray = {
    val items: Set[JsValue] = for (role <- roles) yield {
      JsObject(Seq(
        "id" -> JsString(role.id),
        "name" -> JsString(role.name)
      ))
    }
    JsArray(items.toList)
  }
}
