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

  val All = Set(Encoder.id, Checker.id, Approver.id, Admin.id)

  def isRegistered(id: String): Boolean = All.contains(id)
}
