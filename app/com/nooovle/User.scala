package com.nooovle

import com.nooovle.ModelInfo._
import com.nooovle.slick.ConnectionFactory
import com.nooovle.slick.models.roles
import com.nooovle.slick.models.userRoles
import com.nooovle.slick.models.users
import scala.slick.driver.H2Driver.simple._
import scala.util.Try
import securesocial.core.AuthenticationMethod
import securesocial.core.BasicProfile
import securesocial.core.GenericProfile
import securesocial.core.PasswordInfo

case class User(
  providerId: String,
  userId: String,
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

  lazy val asBasicProfile: BasicProfile = BasicProfile(providerId, userId, firstName,
    lastName, fullName, email, avatarUrl, authMethod, oAuth1Info, oAuth2Info, passwordInfo)
}

object User extends ((String, String, Option[String], Option[String], Option[String], String, String, Option[String]) => User)
  with ModelTemplate {

  def fromBasicProfile(p: BasicProfile) = {
    val hasher = p.passwordInfo.map(_.hasher).getOrElse("")
    val password = p.passwordInfo.map(_.password).getOrElse("")
    val salt = p.passwordInfo.map(_.salt).getOrElse(None)
    User(p.providerId, p.userId, p.firstName, p.lastName, p.email, hasher, password, salt)
  }

  def findById(userId: String): Option[User] =
    ConnectionFactory.connect withSession { implicit session =>
      (for (u <- users if u.userId === userId) yield u).firstOption
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

  def findRoles(userId: String): Set[Role] =
    ConnectionFactory.connect withSession { implicit session =>
      val query = for {
        ur <- userRoles if ur.userId === userId
        rs <- roles if rs.name === ur.roleName
      } yield rs
      query.list.map(Roles.find).flatten.toSet
    }

  // TODO: Simplify when removing role editing in the original PUT request
  def update(userId: String, firstName: Option[String], lastName: Option[String],
    email: Option[String]): Try[User] = Try {
    ConnectionFactory.connect withSession { implicit session =>
      val query = for (u <- users if u.userId === userId) yield u

      if (!query.exists.run) throw new IndexOutOfBoundsException
      else { // Update user
        val _user = query.first.copy(firstName = firstName, lastName = lastName, email = email)
        query.update(_user)
        query.first
      }
    }
  }

  def updateRoles(userId: String, rs: Set[Role]): Try[String] = Try {
    if (!(rs subsetOf Roles.All)) throw new IllegalStateException(
      "Some roles are not valid: " + (rs -- Roles.All))

    ConnectionFactory.connect withTransaction { implicit session =>
      val query = for (u <- users if u.userId === userId) yield u

      if (!query.exists.run) throw new IndexOutOfBoundsException
      else { // Update user
        // Delete existing roles
        userRoles.filter(ur => ur.userId === userId).delete

        rs foreach (role => roles.insertOrUpdate(role.id))
        // The following does not use insertOrUpdate because userId is an
        // auto-incrementing foreign key (bug exists)
        rs foreach (role => userRoles += ((userId, role.id)))
        userId
      }
    }
  }

  val modelName = "USERS"
  lazy val modelInfos = Seq(
    ModelInfo("USERS", "userId", "string", Uneditable, Uneditable, Some("Username")),
    ModelInfo("USERS", "password", "string", Uneditable, Uneditable, Some("Password")),
    ModelInfo("USERS", "email", "email", Uneditable, Uneditable, Some("Email")),
    ModelInfo("USERS", "roles", "string[]", Uneditable, Uneditable, Some("Roles")),
    ModelInfo("USERS", "firstName", "string", Uneditable, Required, Some("First name")),
    ModelInfo("USERS", "lastName", "string", Uneditable, Required, Some("Last name")),
    ModelInfo("USERS", "validationCode", "string", Uneditable, Uneditable, Some("Validation code")))
  // TODO: Remove validation code from model
}
