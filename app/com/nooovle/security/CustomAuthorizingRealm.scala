package com.nooovle.security

import com.nooovle.slick.ConnectionFactory
import com.nooovle.User
import org.apache.shiro.authc.credential.HashedCredentialsMatcher
import org.apache.shiro.authc.{
  SimpleAuthenticationInfo,
  AuthenticationInfo,
  UsernamePasswordToken,
  AuthenticationToken
}
import org.apache.shiro.authz.{ SimpleAuthorizationInfo, AuthorizationInfo }
import org.apache.shiro.realm.AuthorizingRealm
import org.apache.shiro.subject.PrincipalCollection
import org.apache.shiro.util.SimpleByteSource
import scala.collection.JavaConversions
import scala.slick.driver.H2Driver.simple._

class CustomAuthorizingRealm extends AuthorizingRealm {
  private val matcher = new HashedCredentialsMatcher()
  matcher.setHashIterations(SecurityTools.hashIterations)
  matcher.setHashAlgorithmName(SecurityTools.algorithmName)
  matcher.setStoredCredentialsHexEncoded(false)
  setCachingEnabled(true)
  super.setCredentialsMatcher(matcher)

  protected override def doGetAuthenticationInfo(token: AuthenticationToken): AuthenticationInfo = {
    val upToken: UsernamePasswordToken = token.asInstanceOf[UsernamePasswordToken]
    val user = ConnectionFactory.connect withSession { implicit session =>
      User.findByUsername(upToken.getUsername()).getOrElse(return null)
    }

    val authInfo = new SimpleAuthenticationInfo(user.username, user.password,
      new SimpleByteSource(user.salt), getName())
    authInfo.setCredentialsSalt(new SimpleByteSource(user.salt))
    getCredentialsMatcher().doCredentialsMatch(upToken, authInfo)
    authInfo
  }

  protected override def doGetAuthorizationInfo(principals: PrincipalCollection): AuthorizationInfo = {
    if (principals.fromRealm(getName()).isEmpty()) return null

    val username = principals.fromRealm(getName()).iterator().next().toString
    val (user, rs) = ConnectionFactory.connect withSession { implicit session =>
      User.findByUsernameWithRoles(username).getOrElse(return null)
    }

    val authInfo: SimpleAuthorizationInfo = new SimpleAuthorizationInfo()
    authInfo.setRoles(JavaConversions.setAsJavaSet(rs))

    authInfo
  }
}
