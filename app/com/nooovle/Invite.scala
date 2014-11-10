package com.nooovle

import com.nooovle.slick.ConnectionFactory
import com.nooovle.slick.models.{ invites, inviteRoles, roles }
import org.joda.time.DateTime
import scala.slick.driver.H2Driver.simple._
import scala.util.{ Random, Try }

case class Invite(username: String, email: String, validUntil: DateTime,
  validationCode: String)

object Invite extends ((String, String, DateTime, String) => Invite) with HasModelInfo {
  val validationCodeLength = 6

  def findByUsername(username: String): Option[Invite] = {
    val invite = for (i <- invites if i.username === username) yield i
    ConnectionFactory.connect withSession { implicit session =>
      invite.firstOption
    }
  }

  def findByUsernameWithRoles(username: String): Option[(Invite, Set[String])] = {
    val invite = for (i <- invites if i.username === username) yield i
    val rs = for {
      ir <- inviteRoles if ir.username === username
      rs <- roles if rs.name === ir.roleName
    } yield rs
    ConnectionFactory.connect withSession { implicit session =>
      invite.firstOption map (i => (i, rs.list.toSet))
    }
  }

  def insertWithRoles(invite: Invite, rs: Set[String]): Try[String] = Try {
    ConnectionFactory.connect withTransaction { implicit transaction =>
      try {
        val query = for (i <- invites if i.username === invite.username) yield i

        val uname: String = if (query.exists.run) { // Insert invite
          throw new IllegalStateException
        } else {
          invites += invite
          invite.username
        }
        rs foreach (role => roles.insertOrUpdate(role))
        // The following does not use insertOrUpdate because username is an
        // auto-incrementing foreign key (bug exists)
        rs foreach (role => inviteRoles += ((invite.username, role)))
        uname
      } catch {
        case t: Throwable =>
          transaction.rollback
          throw t
      }
    }
  }

  def updateWithRoles(username: String, invite: Invite, rs: Set[String]): Try[String] = Try {
    ConnectionFactory.connect withTransaction { implicit transaction =>
      try {
        val query = for (i <- invites if i.username === invite.username) yield i

        val uname: String = if (!query.exists.run) { // Insert invite
          throw new IndexOutOfBoundsException
        } else { // Update invite
          query.update(invite)
          query.first.username
        }
        rs foreach (role => roles.insertOrUpdate(role))
        // The following does not use insertOrUpdate because id is an
        // auto-incrementing foreign key (bug exists)
        rs foreach (role => inviteRoles += ((uname, role)))
        uname
      } catch {
        case t: Throwable =>
          transaction.rollback
          throw t
      }
    }
  }

  def apply(username: String, email: String, validUntil: DateTime): Invite =
    Invite(username, email, validUntil, generateValidationCode)

  def generateValidationCode: String =
    Random.alphanumeric.take(validationCodeLength).mkString.toLowerCase

  lazy val modelInfo = Seq(
    ModelInfo("INVITES", "username", "String", true, true, true, Some("Username")),
    ModelInfo("INVITES", "email", "String", true, true, true, Some("Email")),
    ModelInfo("INVITES", "roles", "String[]", true, true, true, Some("Roles")),
    ModelInfo("INVITES", "validUntil", "DateTime", true, true, true,
      Some("Valid until")),
    ModelInfo("INVITES", "validationCode", "String", false, false, true,
      Some("Validation code")))
}
