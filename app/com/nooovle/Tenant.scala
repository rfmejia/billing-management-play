package com.nooovle

import com.nooovle.ModelInfo._
import com.nooovle.slick.ConnectionFactory
import com.nooovle.slick.models.tenants
import scala.slick.driver.H2Driver.simple._
import scala.util.Try

case class Tenant(id: Int, tradeName: String, address: String,
  contactPerson: String, contactNumber: String, email: String, area: String,
  size: String, rentalPeriod: String, basicRentalRate: String, escalation: String,
  cusaDefault: Option[String], waterMeterDefault: Option[String], electricityMeterDefault: Option[String], 
  baseRentDefault: Option[String], standardMultiplierDefault: Option[Double])

object Tenant extends ((Int, String, String, String, String, String, String, String, String, String, String, Option[String], Option[String], Option[String], Option[String], Option[Double]) => Tenant)
  with ModelTemplate {

  def insert(tradeName: String, address: String, contactPerson: String,
    contactNumber: String, email: String, area: String, size: String,
    rentalPeriod: String, basicRentalRate: String, escalation: String, 
    cusaDefault: Option[String], waterMeterDefault: Option[String], 
    electricityMeterDefault: Option[String], baseRentDefault: Option[String], 
    standardMultiplierDefault: Option[Double])(implicit session: Session): Try[Tenant] = Try {
    val newTenant = Tenant(0, tradeName, address, contactPerson, contactNumber, 
      email, area, size, rentalPeriod, basicRentalRate, escalation, cusaDefault, 
      waterMeterDefault, electricityMeterDefault, baseRentDefault, standardMultiplierDefault)
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

    ModelInfo("TENANTS", "area", "string", Required, Required, Some("Area")),
    ModelInfo("TENANTS", "size", "string", Required, Required, Some("Size")),
    ModelInfo("TENANTS", "rentalPeriod", "string", Required, Required, Some("Rental period")),
    ModelInfo("TENANTS", "basicRentalRate", "string", Required, Required, Some("Basic rental rate")),
    ModelInfo("TENANTS", "escalation", "string", Required, Required, Some("Escalation")),
    
    ModelInfo("TENANTS", "cusaDefault", "string", Editable, Editable, Some("Cusa (default)")),
    ModelInfo("TENANTS", "waterMeterDefault", "string", Editable, Editable, Some("Water meter (default)")),
    ModelInfo("TENANTS", "electricityMeterDefault", "string", Editable, Editable, Some("Electricity meter (default)")),
    ModelInfo("TENANTS", "baseRentDefault", "string", Editable, Editable, Some("Base rent (default)")),
    ModelInfo("TENANTS", "standardMultiplierDefault", "number", Editable, Editable, Some("Standard multiplier (default)")))
}
