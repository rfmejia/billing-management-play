package com.nooovle

import com.nooovle.ModelInfo._
import com.nooovle.slick.ConnectionFactory
import com.nooovle.slick.models.tenants
import scala.slick.driver.H2Driver.simple._

case class Tenant(id: Int, tradeName: String, address: String,
  contactPerson: String, contactNumber: String, email: String)

object Tenant extends ((Int, String, String, String, String, String) => Tenant)
  with ModelTemplate {

  def apply(tradeName: String, address: String, contactPerson: String,
    contactNumber: String, email: String): Tenant =
    Tenant(0, tradeName, address, contactPerson, contactNumber, email)

  def findById(id: Int): Option[Tenant] =
    ConnectionFactory.connect withSession { implicit session =>
      (for (t <- tenants if t.id === id) yield t).firstOption
    }

  def findByTradeName(tradeName: String): Option[Tenant] =
    ConnectionFactory.connect withSession { implicit session =>
      (for (t <- tenants if t.tradeName === tradeName) yield t).firstOption
    }

  val modelName = "TENANTS"
  lazy val modelInfos = Seq(
    ModelInfo("TENANTS", "id", "Int", Uneditable, Uneditable, Some("Tennant ID")),
    ModelInfo("TENANTS", "tradeName", "String", Required, Required, Some("Trade name")),
    ModelInfo("TENANTS", "address", "String", Required, Required, Some("Business address")),
    ModelInfo("TENANTS", "contactPerson", "String", Required, Required, Some("Contact person")),
    ModelInfo("TENANTS", "contactNumber", "String", Required, Required, Some("Contact number"), Some("Separate numbers using a semicolon ';'")),
    ModelInfo("TENANTS", "email", "String", Required, Required, Some("Email")))
}
