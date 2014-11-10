package com.nooovle

case class Tenant(id: Int, tradeName: String, address: String,
  contactPerson: String, contactNumber: String, email: String)

object Tenant extends ((Int, String, String, String, String, String) => Tenant)
  with HasModelInfo {

  def apply(tradeName: String, address: String, contactPerson: String,
    contactNumber: String, email: String): Tenant =
    Tenant(0, tradeName, address, contactPerson, contactNumber, email)

  lazy val modelInfo = Seq(
    ModelInfo("TENANTS", "id", "Int", false, false, true, Some("Tennant ID")),
    ModelInfo("TENANTS", "tradeName", "String", true, true, true,
      Some("Trade name")),
    ModelInfo("TENANTS", "address", "String", true, true, true,
      Some("Business address")),
    ModelInfo("TENANTS", "contactPerson", "String", true, true, true,
      Some("Contact person")),
    ModelInfo("TENANTS", "contactNumber", "String", true, true, true,
      Some("Contact number(s)"), Some("Separate numbers using a semicolon ';'")),
    ModelInfo("TENANTS", "email", "String", true, true, true, Some("Email")))
}
