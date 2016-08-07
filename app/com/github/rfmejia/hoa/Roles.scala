package com.github.rfmejia.hoa

import play.api.libs.json._

case class Role(id: String, name: String) {
  override def toString = id
}

object Roles {
  val Encoder = Role("encoder", "Encoder")
  val Admin = Role("admin", "Administrator")

  val All: Set[Role] = Set(Encoder, Admin)

  def fromStringSet(rs: Set[String]): Set[Role] = rs.map(r => find(r)).flatten.toSet

  def find(id: String): Option[Role] = All.find(_.id == id)
}
