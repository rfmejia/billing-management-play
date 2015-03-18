package com.nooovle

import play.api.libs.json._

case class Role(id: String) {
  override def toString = id
}

object Roles {
  val Encoder = Role("encoder")
  val Checker = Role("checker")
  val Approver = Role("approver")
  val Admin = Role("admin")

  val All: Set[Role] = Set(Encoder, Checker, Approver, Admin)

  def fromStringSet(rs: Set[String]): Set[Role] = rs.map(Role(_))

  def find(id: String): Option[Role] = All.find(_ == Role(id))
}
