package com.github.rfmejia.hoa

import com.nooovle.ModelInfo._
import com.nooovle.slick.ConnectionFactory
import com.nooovle.slick.models.tenants
import scala.slick.driver.PostgresDriver.simple._
import scala.util.Try

case class Tenant(id: Int, tradeName: String, address: String,
  contactPerson: String, contactNumber: String, email: String, area: Double,
  rentalPeriod: String, escalation: Double, cusaDefault: Option[Double],
  waterMeterDefault: Option[String], electricityMeterDefault: Option[String],
  baseRentDefault: Option[Double], standardMultiplierDefault: Option[Double])

object Tenant extends ((Int, String, String, String, String, String, Double, String, Double, Option[Double], Option[String], Option[String], Option[Double], Option[Double]) => Tenant)
    with ModelTemplate {

  def insert(tradeName: String, address: String, contactPerson: String,
    contactNumber: String, email: String, area: Double,
    rentalPeriod: String, escalation: Double, cusaDefault: Double,
    waterMeterDefault: String, electricityMeterDefault: String,
    baseRentDefault: Double, standardMultiplierDefault: Double)(implicit session: Session): Try[Tenant] =
    Try {
      val newTenant = Tenant(0, tradeName, address, contactPerson, contactNumber,
        email, area, rentalPeriod, escalation, Option(cusaDefault), Option(waterMeterDefault),
        Option(electricityMeterDefault), Option(baseRentDefault), Option(standardMultiplierDefault))
      val id = (tenants returning tenants.map(_.id)) += newTenant
      newTenant.copy(id = id)
    }

  def update(tenant: Tenant)(implicit session: Session): Try[Tenant] = Try {
    val query = for (t <- tenants if t.id === tenant.id) yield t
    query.update(tenant)
    query.first
  }

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
    ModelInfo("TENANTS", "id", "number", Uneditable, Uneditable, Some("Tennant ID")),
    ModelInfo("TENANTS", "tradeName", "string", Required, Required, Some("Trade name")),
    ModelInfo("TENANTS", "address", "string", Required, Required, Some("Business address")),
    ModelInfo("TENANTS", "contactPerson", "string", Required, Required, Some("Contact person")),
    ModelInfo("TENANTS", "contactNumber", "string", Required, Required, Some("Contact number"), Some("Separate numbers using a semicolon ';'")),
    ModelInfo("TENANTS", "email", "email", Required, Required, Some("Email")),

    ModelInfo("TENANTS", "area", "number", Required, Required, Some("Area")),
    ModelInfo("TENANTS", "rentalPeriod", "string", Required, Required, Some("Rental period")),
    ModelInfo("TENANTS", "escalation", "number", Required, Required, Some("Escalation")),

    ModelInfo("TENANTS", "cusaDefault", "number", Required, Editable, Some("Cusa (default)")),
    ModelInfo("TENANTS", "waterMeterDefault", "string", Required, Editable, Some("Water meter (default)")),
    ModelInfo("TENANTS", "electricityMeterDefault", "string", Required, Editable, Some("Electricity meter (default)")),
    ModelInfo("TENANTS", "baseRentDefault", "number", Required, Editable, Some("Base rent (default)")),
    ModelInfo("TENANTS", "standardMultiplierDefault", "number", Required, Editable, Some("Standard multiplier (default)"))
  )
}
