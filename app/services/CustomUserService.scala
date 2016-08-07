package services;

import com.github.rfmejia.hoa.slick.ConnectionFactory
import com.github.rfmejia.hoa.slick.models.{ invitations, mailTokens, users }
import com.github.rfmejia.hoa.User
import controllers.InvitationMailToken
import org.joda.time.DateTime
import scala.concurrent.Future
import scala.slick.driver.PostgresDriver.simple._
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
          val existingUser = for (
            u <- users if u.providerId === profile.providerId
              && u.userId === profile.userId
          ) yield u
          // TODO: Review the implications for each save mode (ignored for now)
          if (existingUser.exists.run) {
            existingUser.update(user)
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

  /**
   * Coneverts to an InvitationMailToken instance if it exists, else returns the same mail token
   * @param token Mail token
   */
  private def withInvitation(token: MailToken)(implicit session: Session): MailToken = {
    val invite = for (i <- invitations if i.email === token.email) yield i
    invite.firstOption map { inv =>
      InvitationMailToken(token, Some(inv))
    } getOrElse token
  }

  def findToken(uuid: String): Future[Option[MailToken]] =
    Future.fromTry {
      Try {
        ConnectionFactory.connect withSession { implicit session =>
          val mailToken = (for (t <- mailTokens if (t.uuid === uuid)) yield t).firstOption
          mailToken map withInvitation
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
              val existingInvite = for (i <- invitations if i.email === inv.email) yield i
              if (existingInvite.exists.run) {
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
          val query = (for (t <- mailTokens if (t.uuid === uuid)) yield t)
          val existingToken = query.firstOption map withInvitation

          if (existingToken.isDefined) query.delete
          existingToken
        }
      }
    }

  def deleteExpiredTokens() = Try {
    import com.github.tototoshi.slick.H2JodaSupport._
    ConnectionFactory.connect withSession { implicit session =>
      val query = for (t <- mailTokens if t.expirationTime < DateTime.now) yield t
      query.delete
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
