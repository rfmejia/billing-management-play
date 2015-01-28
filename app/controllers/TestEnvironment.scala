package controllers

import com.nooovle._
import com.nooovle.slick.ConnectionFactory
import com.nooovle.slick.models._
import org.joda.time.DateTime
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
        Tenant("Beast Burgers", "Unit 4D Breakpoint Tower, 458 Emerald Ave., Pasig",
          "Ronald Macaraig", "987-4321", "r-mac@email.com"),
        Tenant("Salcedo Tools & Supplies, Inc.", "6153 South Super Highway, Makati",
          "Jimmy Galapago", "987-4321", "jimmyg@email.com"),
        Tenant("Jumpin' Juicers", "5 Kennedy Drive, Pleasant View Subd., Tandang Sora, Quezon City",
          "Alex Gomez", "987-4321", "agomez@email.com"),
        Tenant("Accolade Trading Corp.", "14 Zaragoza St. San Lorenzo Village, Makati",
          "Issa Santos", "987-4321", "isantos@email.com"))
      data foreach (tenants.insertOrUpdate(_))
    }

    def insertDocumentData(implicit session: Session) = {
      (for (d <- documents) yield d).delete
      Tenant.findByTradeName("Beast Burgers").map { tenant =>
        Document.insert("Document 1", "invoice-1", tenant.id,
          DateTime.parse("2015-01-01"), Json.obj())
      }
      Tenant.findByTradeName("Jumpin' Juicers").map { tenant =>
        Document.insert("Document 2", "invoice-1", tenant.id,
          DateTime.parse("2015-02-01"), testDocument)
      }
      Tenant.findByTradeName("Beast Burgers").map { tenant =>
        Document.insert("Document 3", "statement-of-account-1", tenant.id,
          DateTime.parse("2015-01-01"), Json.obj())
      }
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
    "name": "Statement of Account 1",
    "docType": "invoice-1",
    "breakdown": [
        {
            "title": "Previous Charges",
            "sections": [
                {
                    "title": "",
                    "fields": [
                        {
                            "id": "_overdue_charges",
                            "title": "Overdue Charges",
                            "datatype": "double",
                            "value": 950,
                            "required": true
                        },
                        {
                            "id": "_other_charges",
                            "title": "Other Charges",
                            "datatype": "double",
                            "required": false,
                            "value": 50
                        }
                    ]
                }
            ],
            "summary": {
                "id": "previous_total",
                "title": "Total",
                "datatype": "currency",
                "required": true,
                "value": 1000
            }
        },
        {
            "title": "This Month's Charges",
            "sections": [
                {
                    "title": "Rent",
                    "fields": [
                        {
                            "id": "rent_base",
                            "title": "Base",
                            "datatype": "double",
                            "required": false,
                            "value": 0
                        },
                        {
                            "id": "rent_vat",
                            "title": "+12% VAT",
                            "datatype": "double",
                            "required": false,
                            "value": 0
                        },
                        {
                            "id": "rent_subtotal",
                            "title": "Subtotal",
                            "datatype": "double",
                            "required": false,
                            "value": 0
                        },
                        {
                            "id": "rent_whtax",
                            "title": "-5% Withholding Tax",
                            "datatype": "double",
                            "required": false,
                            "value": 0
                        },
                        {
                            "id": "rent_total",
                            "title": "Total",
                            "datatype": "currency",
                            "required": true,
                            "value": 6500
                        }
                    ]
                },
                {
                    "title": "Electricity",
                    "fields": [
                        {
                            "id": "elec_meter_number",
                            "title": "Meter number",
                            "datatype": "string",
                            "required": false,
                            "value": ""
                        },
                        {
                            "id": "elec_bill_start",
                            "title": "Billing starting",
                            "datatype": "date",
                            "required": false,
                            "value": ""
                        },
                        {
                            "id": "elec_bill_until",
                            "title": "Billing until",
                            "datatype": "date",
                            "required": false,
                            "value": ""
                        },
                        {
                            "id": "elec_prev_reading",
                            "title": "Previous reading",
                            "datatype": "integer",
                            "required": false,
                            "value": 0
                        },
                        {
                            "id": "elec_curr_reading",
                            "title": "Current reading",
                            "datatype": "integer",
                            "required": false,
                            "value": 0
                        },
                        {
                            "id": "elec_kw_used",
                            "title": "KW used",
                            "datatype": "integer",
                            "required": false,
                            "value": 0
                        },
                        {
                            "id": "elec_multiplier",
                            "title": "Multiplier",
                            "datatype": "integer",
                            "required": false,
                            "value": 0
                        },
                        {
                            "id": "elec_gross_usage",
                            "title": "Gross KW usage",
                            "datatype": "integer",
                            "required": false,
                            "value": 0
                        },
                        {
                            "id": "elec_meralco",
                            "title": "Meralco",
                            "datatype": "double",
                            "required": false,
                            "value": 0
                        },
                        {
                            "id": "elec_consumption",
                            "title": "Consumption",
                            "datatype": "double",
                            "required": false,
                            "value": 0
                        },
                        {
                            "id": "elec_total",
                            "title": "Total",
                            "datatype": "currency",
                            "required": true,
                            "value": 2500
                        }
                    ]
                },
                {
                    "title": "Water",
                    "fields": [
                        {
                            "id": "water_meter_num",
                            "title": "Meter number",
                            "datatype": "string",
                            "required": false,
                            "value": ""
                        },
                        {
                            "id": "water_bill_start",
                            "title": "Billing starting",
                            "datatype": "date",
                            "required": false,
                            "value": ""
                        },
                        {
                            "id": "water_bill_until",
                            "title": "Billing until",
                            "datatype": "date",
                            "required": false,
                            "value": ""
                        },
                        {
                            "id": "water_prev_reading",
                            "title": "Previous reading",
                            "datatype": "integer",
                            "required": false,
                            "value": 0
                        },
                        {
                            "id": "water_curr_reading",
                            "title": "Current reading",
                            "datatype": "integer",
                            "required": false,
                            "value": 0
                        },
                        {
                            "id": "water_gross_usage",
                            "title": "Gross cu m usage",
                            "datatype": "integer",
                            "required": false,
                            "value": 0
                        },
                        {
                            "id": "water_rate",
                            "title": "Rate/cu m",
                            "datatype": "double",
                            "required": false,
                            "value": 0
                        },
                        {
                            "id": "water_consumption",
                            "title": "Consumption",
                            "datatype": "double",
                            "required": false,
                            "value": 0
                        },
                        {
                            "id": "water_total",
                            "title": "Total",
                            "datatype": "currency",
                            "required": true,
                            "value": 700
                        }
                    ]
                },
                {
                    "title": "Cusa",
                    "fields": [
                        {
                            "id": "cusa_total",
                            "title": "Total",
                            "datatype": "currency",
                            "required": true,
                            "value": 20.50
                        }
                    ]
                }
            ],
            "summary": {
                "id": "current_summary",
                "title": "Total",
                "datatype": "currency",
                "required": true,
                "value": 9720.50
            }
        }
    ],
    "summary": {
        "id": "invoice_summary",
        "title": "Total Amount Due",
        "datatype": "currency",
        "required": true,
        "value": 10720.50
    }
}
    """).as[JsObject]
}
