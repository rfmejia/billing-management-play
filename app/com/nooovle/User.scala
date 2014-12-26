package com.nooovle

import com.nooovle.slick.ConnectionFactory
import com.nooovle.slick.models.{ roles, users, userRoles }
import org.joda.time.DateTime
import scala.slick.driver.H2Driver.simple._
import scala.util.Try

case class User(userId: String,
  providerId: String,
  firstName: String,
  lastName: String,
  email: Option[String],
  hasher: String,
  password: String,
  salt: Option[String]) {
  // val identityId = IdentityId(userId, providerId)
  // val fullName = s"${firstName} ${lastName}"
  // val authMethod = AuthenticationMethod.UserPassword
  // val avatarUrl = None
  // val oAuth1Info = None
  // val oAuth2Info = None
  // val passwordInfo = Option(PasswordInfo(hasher, password, salt))
}

object User extends ((String, String, String, String, Option[String], String, String, Option[String]) => User)
  with ModelTemplate {

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

  // def findByUsernameWithRoles(username: String): Option[(User, Set[String])] =
  //   ConnectionFactory.connect withSession { implicit session =>
  //     val user = for (u <- users if u.username === username) yield u
  //     val rs = for {
  //       ur <- userRoles if ur.username === username
  //       rs <- roles if rs.name === ur.roleName
  //     } yield rs
  //     user.firstOption map (u => (u, rs.list.toSet))
  //   }

  // def insertWithRoles(user: User, rs: Set[String]): Try[String] = Try {
  //   ConnectionFactory.connect withTransaction { implicit transaction =>
  //     try {
  //       val query = for (u <- users if u.username === user.username) yield u
  //       val _username = if (query.exists.run) {
  //         throw new IllegalStateException
  //       } else {
  //         users += user
  //         user.username
  //       }
  //       rs foreach (role => roles.insertOrUpdate(role))
  //       // The following does not use insertOrUpdate because id is an
  //       // auto-incrementing foreign key (bug exists)
  //       rs foreach (role => userRoles += ((_username, role)))
  //       _username
  //     } catch {
  //       case t: Throwable =>
  //         transaction.rollback
  //         throw t
  //     }
  //   }
  // }

  // def updateWithRoles(user: User, rs: Set[String]): Try[String] = Try {
  //   ConnectionFactory.connect withTransaction { implicit transaction =>
  //     try {
  //       val query = for (u <- users if u.username === user.username) yield u

  //       val _username: String =
  //         if (!query.exists.run) throw new IndexOutOfBoundsException
  //         else { // Update user
  //           query.update(user)
  //           query.first.username
  //         }
  //       rs foreach (role => roles.insertOrUpdate(role))
  //       // The following does not use insertOrUpdate because username is an
  //       // auto-incrementing foreign key (bug exists)
  //       rs foreach (role => userRoles += ((_username, role)))
  //       _username
  //     } catch {
  //       case t: Throwable =>
  //         transaction.rollback
  //         throw t
  //     }
  //   }
  // }

  val modelName = "USERS"
  lazy val modelInfos = Seq(
    ModelInfo("USERS", "username", "String", false, false, true, Some("Username")),
    ModelInfo("USERS", "password", "String", true, true, true, Some("Password")),
    ModelInfo("USERS", "email", "String", false, true, true, Some("Email")),
    ModelInfo("USERS", "roles", "String[]", false, true, true, Some("Roles")),
    ModelInfo("USERS", "firstName", "String", true, true, true, Some("First name")),
    ModelInfo("USERS", "lastName", "String", true, true, true, Some("Last name")),
    ModelInfo("USERS", "validationCode", "String", true, false, true, Some("Validation code")))
}
