package controllers

import com.netaporter.uri.dsl._
import com.nooovle.ModelInfo._
import com.nooovle.slick.ConnectionFactory
import com.nooovle.slick.models.modelTemplates
import com.nooovle.{ ModelInfo, Role, User }
import org.locker47.json.play._
import play.api.libs.json.{ JsObject, Json }
import play.api.mvc.{ Request, RequestHeader, Result }
import scala.concurrent.Future
import scala.slick.driver.H2Driver.simple._
import securesocial.core.Authorization

trait ApiController[T] extends securesocial.core.SecureSocial[T] {

  def listNavLinks(base: String, offset: Int, limit: Int, total: Int): Map[String, Link] = {
    val uri = base.removeParams("offset").removeParams("limit")
    val startLinks = if (offset > 0) {
      Map("first" -> Link.create(uri ? ("offset" -> 0) & ("limit" -> limit)),
        "prev" -> Link.create(uri ? ("offset" -> (Math.max((offset - limit), 0))) & ("limit" -> limit)))
    } else Map.empty
    val endLinks = if (offset + limit < total) {
      Map("next" -> Link.create(uri ? ("offset" -> (Math.min((offset + limit), total))) & ("limit" -> limit)),
        "last" -> Link.create(uri ? ("offset" -> (Math.max((total - limit), 0))) & ("limit" -> limit)))
    } else Map.empty
    (startLinks ++ endLinks)
  }

  def getTemplate(modelName: String, action: DocAction) = {
    val fields = ModelInfo.toJsonArray(action) {
      ConnectionFactory.connect withSession { implicit session =>
        val query = for (
          i <- modelTemplates if i.modelName === modelName
            && {
              if (action == "create") i.createForm
              else if (action == "edit") i.editForm
              else false
            }

        ) yield i
        query.list
      }
    }
    Json.obj(action -> Json.obj("data" -> fields))
  }

  def getCreateTemplate(modelName: String) = getTemplate(modelName, DocCreate)
  def getEditTemplate(modelName: String) = getTemplate(modelName, DocEdit)

  // case class CreatorOnly() extends Authorization[User]
  // case class AssignedOnly() extends Authorization[User]

  case class WithRoles(requiredRoles: Set[Role]) extends Authorization[User] {
    def isAuthorized(user: User, request: RequestHeader) = {
      val userRoles = User.findRoles(user.userId)
      val matches = userRoles & requiredRoles
      play.api.Logger.debug(s"Required: ${requiredRoles}")
      play.api.Logger.debug(s"User: ${userRoles}")
      play.api.Logger.debug(s"Role matches: ${matches}")
      matches.nonEmpty
    }
  }

  object WithRoles extends (Set[Role] => WithRoles) {
    def apply(role: Role): WithRoles = WithRoles.apply(Set(role))
  }
}
