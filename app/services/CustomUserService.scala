package services;

import com.nooovle.slick.ConnectionFactory
import com.nooovle.slick.models.{ invitations, mailTokens, users }
import com.nooovle.User
import controllers.InvitationMailToken
import org.joda.time.DateTime
import scala.concurrent.Future
import scala.slick.driver.H2Driver.simple._
import scala.util.Try
import securesocial.core.providers.MailToken
import securesocial.core.services.{ SaveMode, UserService }
import securesocial.core.{ BasicProfile, PasswordInfo }

class CustomUserService extends UserService[User] {

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
          val existingToken = for (
            u <- users if u.providerId === profile.providerId
              && u.userId === profile.userId
          ) yield u
          // TODO: Review the implications for each save mode (ignored for now)
          if (existingToken.exists.run) {
            existingToken.update(user)
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

  def findToken(uuid: String): Future[Option[MailToken]] =
    Future.fromTry {
      Try {
        ConnectionFactory.connect withSession { implicit session =>
          (for (t <- mailTokens if (t.uuid === uuid)) yield t).firstOption
        }
      }
    }

  def saveToken(token: MailToken): Future[MailToken] =
    Future.fromTry {
      Try {
        ConnectionFactory.connect withSession { implicit session =>
          val existingToken = for (t <- mailTokens if (t.uuid === token.uuid)) yield t
          if (existingToken.exists.run) {
            existingToken.update(token)
          } else {
            mailTokens += token
          }

          token match {
            case inv: InvitationMailToken =>
              val existingInvite = for(i <- invitations if i.uuid === inv.uuid) yield i
              if(existingInvite.exists.run) {
                existingInvite.update(inv.invitationInfo)
              } else {
                invitations += inv.invitationInfo
              }
            case _ => // do nothing
          }

          token
        }
      }
    }

  def deleteToken(uuid: String): Future[Option[MailToken]] =
    Future.fromTry {
      Try {
        ConnectionFactory.connect withSession { implicit session =>
          val existingToken = (for (t <- mailTokens if (t.uuid === uuid)) yield t)
          if (existingToken.exists.run) {
            val token = existingToken.firstOption
            existingToken.delete
            token
          } else {
            None
          }
        }
      }
    }

  def deleteExpiredTokens() = Try {
    import com.github.tototoshi.slick.H2JodaSupport._
    ConnectionFactory.connect withSession { implicit session =>
      val query = for (t <- mailTokens if t.expirationTime < DateTime.now) yield t

    }
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
