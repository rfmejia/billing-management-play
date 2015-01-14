package services;

import scala.concurrent.Future
import scala.slick.driver.H2Driver.simple.{
  booleanColumnExtensionMethods,
  booleanColumnType,
  columnExtensionMethods,
  optionColumnExtensionMethods,
  productQueryToUpdateInvoker,
  queryToAppliedQueryInvoker,
  queryToInsertInvoker,
  repToQueryExecutor,
  stringColumnType,
  valueToConstColumn
}
import scala.util.Try

import com.nooovle.User
import com.nooovle.slick.ConnectionFactory
import com.nooovle.slick.models.users

import play.api.Logger
import securesocial.core.{ BasicProfile, PasswordInfo }
import securesocial.core.providers.MailToken
import securesocial.core.services.{ SaveMode, UserService }

class CustomUserService extends UserService[User] {
  val logger = Logger("application.controllers.DemoUserService")

  private var tokens = Map[String, MailToken]()

  def find(providerId: String, userId: String): Future[Option[BasicProfile]] =
    Future.fromTry {
      Try {
        ConnectionFactory.connect withSession { implicit session =>
          val query = for (u <- users if u.providerId === providerId && u.userId === userId) yield u
          query.firstOption.map(_.asBasicProfile)
        }
      }
    }

  def findByEmailAndProvider(email: String, providerId: String): Future[Option[BasicProfile]] =
    Future.fromTry {
      Try {
        ConnectionFactory.connect withSession { implicit session =>
          val query = for (
            u <- users if u.providerId === providerId &&
              u.email === email
          ) yield u
          query.firstOption.map(_.asBasicProfile)
        }
      }
    }

  def save(profile: BasicProfile, mode: SaveMode): Future[User] = {
    Future.fromTry {
      Try {
        ConnectionFactory.connect withSession { implicit session =>
          val user = User.fromBasicProfile(profile)
          val query = for (
            u <- users if u.providerId === profile.providerId
              && u.userId === profile.userId
          ) yield u
          // TODO: Review the implications for each save mode (ignored for now)
          if (query.exists.run) {
            query.update(user)
//            mode match {
//              case SaveMode.SignUp         => ???
//              case SaveMode.LoggedIn       => ???
//              case SaveMode.PasswordChange => ???
//            }
          } else {
            users += user
          }
          user
        }
      }
    }
  }

  def link(current: User, to: BasicProfile): Future[User] = save(to, SaveMode.SignUp)

  def saveToken(token: MailToken): Future[MailToken] = {
    Future.successful {
      tokens += (token.uuid -> token)
      token
    }
  }

  def findToken(token: String): Future[Option[MailToken]] = {
    Future.successful {
      tokens.get(token)
    }
  }

  def deleteToken(uuid: String): Future[Option[MailToken]] = {
    Future.successful {
      tokens.get(uuid) match {
        case Some(token) =>
          tokens -= uuid
          Some(token)
        case None => None
      }
    }
  }

  def deleteExpiredTokens() {
    tokens = tokens.filter(!_._2.isExpired)
  }

  override def updatePasswordInfo(user: User, info: PasswordInfo): Future[Option[BasicProfile]] =
    Future.fromTry {
      Try {
        ConnectionFactory.connect withSession { implicit session =>
          val query = for (
            u <- users if u.providerId === user.providerId
              && u.userId === user.userId
          ) yield u
          if (query.exists.run) {
            val updated = user.copy(hasher = info.hasher, password = info.password, salt = info.salt)
            query.update(updated)
            Some(updated.asBasicProfile)
          } else None
        }
      }
    }

  override def passwordInfoFor(user: User): Future[Option[PasswordInfo]] = {
    Future.fromTry {
      Try {
        ConnectionFactory.connect withSession { implicit session =>
          val query = for (
            u <- users if u.providerId === user.providerId
              && u.userId === user.userId
          ) yield u
          query.firstOption.map(_.passwordInfo).getOrElse(None)
        }
      }
    }
  }
}
