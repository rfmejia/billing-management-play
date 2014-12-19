package com.nooovle.security

import com.nooovle.slick.ConnectionFactory
import com.nooovle.slick.models.users
import com.nooovle.User
import play.api.{ Logger, Application }
import scala.slick.driver.H2Driver.simple._
import securesocial.core._
import securesocial.core.providers.Token

class UserService(application: Application) extends UserServicePlugin(application) {
  private var tokens = Map[String, Token]()

  def find(id: IdentityId): Option[Identity] = User.findByIdentityId(id)

  def findByEmailAndProvider(email: String, providerId: String): Option[Identity] =
    ConnectionFactory.connect withSession { implicit session =>
      (for (u <- users if u.email === Option(email)) yield u).firstOption
        .filter(u => u.providerId == providerId)
    }

  def save(user: Identity): Identity =
    ConnectionFactory.connect withSession { implicit session =>
      users += User.fromIdentity(user)
      user
    }

  def save(token: Token) {
    tokens += (token.uuid -> token)
  }

  def findToken(token: String): Option[Token] = {
    tokens.get(token)
  }

  def deleteToken(uuid: String) {
    tokens -= uuid
  }

  def deleteTokens() {
    tokens = Map()
  }

  def deleteExpiredTokens() {
    tokens = tokens.filter(!_._2.isExpired)
  }
}
