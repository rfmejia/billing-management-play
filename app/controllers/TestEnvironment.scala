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

import play.api.mvc.Result
import scala.concurrent._
import scala.concurrent.duration._
import play.api.libs.ws._
import play.api.libs.ws.ning._
import play.api.Play.current

class TestEnvironment(override implicit val env: RuntimeEnvironment[User])
  extends securesocial.core.SecureSocial[User] {

  private def bulkUpload(url: String, data: JsArray, token: String,
    timeout: Int)(f: Seq[WSResponse] => Result): Future[Result] = {
    Logger.info(s"Received testdata, uploading ${data.value.size} objects")

    val results: Seq[Future[WSResponse]] = {
      val requests = data.value map {
        jsObj =>
          WS.url(url)
            .withRequestTimeout(timeout)
            .withHeaders("X-Auth-Token" -> token)
            .post(jsObj)
      }

      for (req <- requests) yield req
    }

    val combined: Future[Seq[WSResponse]] = Future.sequence(results)
    combined.map(f)
  }

  def uploadTenants(timeout: Int) = SecuredAction.async(parse.json) { implicit request =>
    val url = routes.Tenants.create().absoluteURL()
    val data = request.body.as[JsArray]
    val token = request.headers("X-Auth-Token")

    bulkUpload(url, data, token, timeout) {
      results =>
        Ok {
          results.map(_ match {
            case r: NingWSResponse =>
              Logger.debug(r.status + " " + r.statusText)
          })
          results.toString
        }
    }
  }

  def uploadDocuments(timeout: Int) = SecuredAction.async(parse.json(maxLength = 1024 * 5000)) { implicit request =>
    val url = routes.Documents.create().absoluteURL()
    val data = request.body.as[JsArray]
    val token = request.headers("X-Auth-Token")

    bulkUpload(url, data, token, timeout) {
      results =>
        Ok {
          results.map(_ match {
            case r: NingWSResponse =>
              Logger.debug(r.status + " " + r.statusText)
              Logger.debug(r.body)
          })
          results.toString
        }
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
