package com.nooovle.security

import com.nooovle.User
import java.security.SecureRandom
import org.apache.shiro.authc.{ AuthenticationException, UsernamePasswordToken }
import org.apache.shiro.crypto.hash.Sha512Hash
import org.apache.shiro.SecurityUtils
import org.apache.shiro.subject.Subject
import scala.collection.JavaConversions

object SecurityTools {
  private[security] val hashIterations = 50000
  private[security] val algorithmName = Sha512Hash.ALGORITHM_NAME
  private lazy val generator = new SecureRandom()

  def generateSalt(length: Int = 32): Array[Byte] = {
    val bytes = new Array[Byte](length)
    generator.nextBytes(bytes)
    bytes
  }

  def hashPassword(password: Array[Byte], salt: Array[Byte]): Array[Byte] =
    new Sha512Hash(password, salt, hashIterations).getBytes

  def authenticate(token: UsernamePasswordToken): Either[String, Subject] = {
    val currentUser = SecurityUtils.getSubject()
    try {
      currentUser.login(token)
      User.findByUsername(token.getUsername()) match {
        case None => Left("Invalid username or password")
        case Some(u) => Right(currentUser)
      }
    } catch {
      case e: AuthenticationException =>
        Left("Invalid username or password : " + e.getMessage)
    }
  }

  def authorize(subj: Subject, rs: Set[String]): Boolean =
    subj.hasAllRoles(JavaConversions.setAsJavaSet(rs))

  def logout(u: User) = SecurityUtils.getSubject.logout()
}
