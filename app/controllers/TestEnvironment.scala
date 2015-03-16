package controllers

import com.nooovle._
import com.nooovle.slick.ConnectionFactory
import com.nooovle.slick.models._
import org.joda.time.YearMonth
import org.locker47.json.play._
import play.api._
import play.api.libs.json._
import play.api.mvc.{ Action, Controller }
import scala.slick.driver.H2Driver.simple._
import securesocial.core.RuntimeEnvironment

class TestEnvironment(override implicit val env: RuntimeEnvironment[User])
  extends securesocial.core.SecureSocial[User] {

  def setup() = Action { implicit request =>

    def insertTenantData(implicit session: Session) = {
      (for (t <- tenants) yield t).delete
      val data = Seq(
        Tenant("Beast Burgers", "Unit 4D Breakpoint Tower, 458 Emerald Ave., Pasig", "Ronald Macaraig", "987-4321", "r-mac@email.com", "area", "size", "rentalPeriod", "basicRentalRate", "escalation"),
        Tenant("Salcedo Tools & Supplies, Inc.", "6153 South Super Highway, Makati", "Jimmy Galapago", "987-4321", "jimmyg@email.com", "area", "size", "rentalPeriod", "basicRentalRate", "escalation"),
        Tenant("Jumpin' Juicers", "5 Kennedy Drive, Pleasant View Subd., Tandang Sora, Quezon City", "Alex Gomez", "987-4321", "agomez@email.com", "area", "size", "rentalPeriod", "basicRentalRate", "escalation"),
        Tenant("Accolade Trading Corp.", "14 Zaragoza St. San Lorenzo Village, Makati", "Issa Santos", "987-4321", "isantos@email.com", "area", "size", "rentalPeriod", "basicRentalRate", "escalation"))
      data foreach (tenants.insertOrUpdate(_))
    }

    def insertDocumentData(implicit session: Session) = {
      (for (d <- documents) yield d).delete
      // Tenant.findByTradeName("Beast Burgers").map { tenant =>
      //   Document.insert("Document 1", "invoice-1", tenant.id,
      //     DateTime.parse("2015-01-01"), Json.obj())
      // }
      users.firstOption map { creator =>
        Tenant.findByTradeName("Jumpin' Juicers").map { tenant =>
          Document.insert(creator, "invoice-1", tenant.id,
            YearMonth.parse("2015-02"), testDocument)
        }
      }
      // Tenant.findByTradeName("Beast Burgers").map { tenant =>
      //   Document.insert("Document 3", "statement-of-account-1", tenant.id,
      //     DateTime.parse("2015-01-01"), Json.obj())
      // }
    }

    ConnectionFactory.connect withSession { implicit session =>
      insertTenantData
      insertDocumentData

      import play.api.Play.current
      val ds = play.api.db.DB.getDataSource()
      Ok("Created test session in " + ds.toString)
    }
  }

  def fail = Action {
    throw new IllegalStateException("Raised an error")
    Ok // Never reached
  }

  lazy val testDocument = Json.parse("""
{
    "previous": {
        "title": "Previous Charges",
        "sections": [
            {
                "sectionTotal": {
                    "id": "_previous_total",
                    "title": "Previous charges total",
                    "datatype": "double",
                    "value": null,
                    "required": true
                },
                "fields": [
                    {
                        "id": "_overdue_charges",
                        "title": "Overdue Charges",
                        "datatype": "double",
                        "value": null,
                        "required": true
                    },
                    {
                        "id": "_other_charges",
                        "title": "Other Charges",
                        "datatype": "double",
                        "required": false,
                        "value": null
                    }
                ]
            }
        ],
        "summary": {
            "id": "previous_total",
            "title": "Previous Total",
            "datatype": "currency",
            "required": true,
            "value": 0
        }
    },
    "thisMonth": {
        "title": "This Month's Charges",
        "sections": [
            {
                "title": "Rent",
                "sectionTotal": {
                    "id": "_rent_total",
                    "title": "Rent total",
                    "datatype": "double",
                    "value": null,
                    "required": true
                },
                "fields": [
                    {
                        "id": "rent_base",
                        "title": "Base",
                        "datatype": "double",
                        "required": false,
                        "value": null
                    },
                    {
                        "id": "rent_vat",
                        "title": "+12% VAT",
                        "datatype": "double",
                        "required": false,
                        "value": null
                    },
                    {
                        "id": "rent_subtotal",
                        "title": "Subtotal",
                        "datatype": "double",
                        "required": false,
                        "value": null
                    },
                    {
                        "id": "rent_whtax",
                        "title": "-5% Withholding Tax",
                        "datatype": "double",
                        "required": false,
                        "value": null
                    }
                ]
            },
            {
                "title": "Electricity",
                "sectionTotal": {
                    "id": "_electricity_total",
                    "title": "Electricity total",
                    "datatype": "double",
                    "value": null,
                    "required": true
                },
                "fields": [
                    {
                        "datatype": "dateperiod",
                        "required": false,
                        "dates": {
                            "from": {
                                "id": "elec_bill_start",
                                "title": "Billing from",
                                "datatype": "date",
                                "required": false,
                                "value": ""
                            },
                            "to": {
                                "id": "elec_bill_until",
                                "title": "Billing until",
                                "datatype": "date",
                                "required": false,
                                "value": ""
                            }
                        }
                    },
                    {
                        "id": "elec_meter_number",
                        "title": "Meter number",
                        "datatype": "string",
                        "required": false,
                        "value": ""
                    },
                    {
                        "id": "elec_prev_reading",
                        "title": "Previous reading",
                        "datatype": "integer",
                        "required": false,
                        "value": null
                    },
                    {
                        "id": "elec_curr_reading",
                        "title": "Current reading",
                        "datatype": "integer",
                        "required": false,
                        "value": null
                    },
                    {
                        "id": "elec_kw_used",
                        "title": "KW used",
                        "datatype": "integer",
                        "required": false,
                        "value": null
                    },
                    {
                        "id": "elec_multiplier",
                        "title": "Multiplier",
                        "datatype": "integer",
                        "required": false,
                        "value": null
                    },
                    {
                        "id": "elec_gross_usage",
                        "title": "Gross KW usage",
                        "datatype": "integer",
                        "required": false,
                        "value": null
                    },
                    {
                        "id": "elec_meralco",
                        "title": "Meralco",
                        "datatype": "double",
                        "required": false,
                        "value": null
                    },
                    {
                        "id": "elec_consumption",
                        "title": "Consumption",
                        "datatype": "double",
                        "required": false,
                        "value": null
                    }
                ]
            },
            {
                "title": "Water",
                "sectionTotal": {
                    "id": "_water_total",
                    "title": "Water total",
                    "datatype": "double",
                    "value": null,
                    "required": true
                },
                "fields": [
                    {
                        "datatype": "dateperiod",
                        "required": false,
                        "dates": {
                            "from": {
                                "id": "water_bill_start",
                                "title": "Billing from",
                                "datatype": "date",
                                "required": false,
                                "value": ""
                            },
                            "to": {
                                "id": "water_bill_until",
                                "title": "Billing until",
                                "datatype": "date",
                                "required": false,
                                "value": ""
                            }
                        }
                    },
                    {
                        "id": "water_meter_num",
                        "title": "Meter number",
                        "datatype": "string",
                        "required": false,
                        "value": ""
                    },
                    {
                        "id": "water_prev_reading",
                        "title": "Previous reading",
                        "datatype": "integer",
                        "required": false,
                        "value": null
                    },
                    {
                        "id": "water_curr_reading",
                        "title": "Current reading",
                        "datatype": "integer",
                        "required": false,
                        "value": null
                    },
                    {
                        "id": "water_gross_usage",
                        "title": "Gross cu m usage",
                        "datatype": "integer",
                        "required": false,
                        "value": null
                    },
                    {
                        "id": "water_rate",
                        "title": "Rate/cu m",
                        "datatype": "double",
                        "required": false,
                        "value": null
                    },
                    {
                        "id": "water_consumption",
                        "title": "Consumption",
                        "datatype": "double",
                        "required": false,
                        "value": null
                    }
                ]
            },
            {
                "title": "Cusa",
                "sectionTotal": {
                    "id": "_cusa_total",
                    "title": "Cusa total",
                    "datatype": "double",
                    "value": null,
                    "required": true
                },
                "fields": [
                    {
                        "id": "cusa_total",
                        "title": "Total",
                        "datatype": "currency",
                        "required": true,
                        "value": null
                    }
                ]
            }
        ],
        "summary": {
            "id": "current_summary",
            "title": "Total",
            "datatype": "currency",
            "required": true,
            "value": 0
        }
    },
    "summary": {
        "id": "invoice_summary",
        "title": "Total Amount Due",
        "datatype": "currency",
        "required": true,
        "value": 0,
        "remarks": ""
    }
}
    """).as[JsObject]
}
