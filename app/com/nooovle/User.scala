package com.nooovle

import scala.slick.driver.H2Driver.simple.columnExtensionMethods
import scala.slick.driver.H2Driver.simple.productQueryToUpdateInvoker
import scala.slick.driver.H2Driver.simple.queryToAppliedQueryInvoker
import scala.slick.driver.H2Driver.simple.queryToInsertInvoker
import scala.slick.driver.H2Driver.simple.repToQueryExecutor
import scala.slick.driver.H2Driver.simple.stringColumnType
import scala.slick.driver.H2Driver.simple.valueToConstColumn
import scala.util.Try

import com.nooovle.slick.ConnectionFactory
import com.nooovle.slick.models.roles
import com.nooovle.slick.models.userRoles
import com.nooovle.slick.models.users

import securesocial.core.AuthenticationMethod
import securesocial.core.GenericProfile
import securesocial.core.PasswordInfo

case class User(userId: String,
                providerId: String,
                firstName: Option[String],
                lastName: Option[String],
                email: Option[String],
                hasher: String,
                password: String,
                salt: Option[String]) extends GenericProfile {
  val fullName = Some((firstName.getOrElse("") + " " + lastName.getOrElse("")).trim)
  val authMethod = AuthenticationMethod.UserPassword
  val avatarUrl = None
  val oAuth1Info = None
  val oAuth2Info = None
  val passwordInfo = Option(PasswordInfo(hasher, password, salt))
}

object User extends ((String, String, Option[String], Option[String], Option[String], String, String, Option[String]) => User)
  with ModelTemplate {

  // def apply(userId: String, firstName: String, lastName: String, email: Option[String], password: String): User = {
  //   val providerId = UsernamePasswordProvider.UsernamePassword
  //   val hasher = PasswordHasher.
  //   val salt = ""
  //   User(userId, providerId, firstName, lastName, email, hasher, password, Some(salt))
  // }

  // def findByIdentityId(id: IdentityId): Option[User] =
  //   ConnectionFactory.connect withSession { implicit session =>
  //     (for (
  //       u <- users if u.userId === id.userId &&
  //         u.providerId === id.providerId
  //     ) yield u).firstOption
  //   }

  // def fromIdentity(i: Identity): User = {
  //   val hasher = i.passwordInfo.map(_.hasher) getOrElse ""
  //   val password = i.passwordInfo.map(_.password) getOrElse ""
  //   val salt = i.passwordInfo.map(_.salt) getOrElse None
  //   User(i.identityId.userId, i.identityId.providerId, i.firstName, i.lastName,
  //     i.email, hasher, password, salt)
  // }

  def findByUserId(userId: String): Option[User] = {
    ConnectionFactory.connect withSession { implicit session =>
      (for (u <- users if u.userId === userId) yield u).firstOption
    }
  }

  def findByUserIdWithRoles(userId: String): Option[(User, Set[String])] =
    ConnectionFactory.connect withSession { implicit session =>
      val user = for (u <- users if u.userId === userId) yield u
      val rs = for {
        ur <- userRoles if ur.userId === userId
        rs <- roles if rs.name === ur.roleName
      } yield rs
      user.firstOption map (u => (u, rs.list.toSet))
    }

  def insertWithRoles(user: User, rs: Set[String]): Try[String] = Try {
    ConnectionFactory.connect withTransaction { implicit transaction =>
      try {
        val query = for (u <- users if u.userId === user.userId) yield u
        val _userId = if (query.exists.run) {
          throw new IllegalStateException
        } else {
          users += user
          user.userId
        }
        rs foreach (role => roles.insertOrUpdate(role))
        // The following does not use insertOrUpdate because id is an
        // auto-incrementing foreign key (bug exists)
        rs foreach (role => userRoles += ((_userId, role)))
        _userId
      } catch {
        case t: Throwable =>
          transaction.rollback
          throw t
      }
    }
  }

  def updateWithRoles(user: User, rs: Set[String]): Try[String] = Try {
    ConnectionFactory.connect withTransaction { implicit transaction =>
      try {
        val query = for (u <- users if u.userId === user.userId) yield u

        val _username: String =
          if (!query.exists.run) throw new IndexOutOfBoundsException
          else { // Update user
            query.update(user)
            query.first.userId
          }
        rs foreach (role => roles.insertOrUpdate(role))
        // The following does not use insertOrUpdate because userId is an
        // auto-incrementing foreign key (bug exists)
        rs foreach (role => userRoles += ((_username, role)))
        _username
      } catch {
        case t: Throwable =>
          transaction.rollback
          throw t
      }
    }
  }

  val modelName = "USERS"
  lazy val modelInfos = Seq(
    ModelInfo("USERS", "userId", "String", false, false, true, Some("Username")),
    ModelInfo("USERS", "password", "String", true, true, true, Some("Password")),
    ModelInfo("USERS", "email", "String", false, true, true, Some("Email")),
    ModelInfo("USERS", "roles", "String[]", false, true, true, Some("Roles")),
    ModelInfo("USERS", "firstName", "String", true, true, true, Some("First name")),
    ModelInfo("USERS", "lastName", "String", true, true, true, Some("Last name")),
    ModelInfo("USERS", "validationCode", "String", true, false, true, Some("Validation code")))
}
