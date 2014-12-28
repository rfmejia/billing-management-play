package com.nooovle.templates

import com.nooovle.ModelTemplate

import play.api.libs.json._

object BillingTemplate {
  val asJsObject: JsObject = Json.obj(
    "docType" -> "statement-of-account-1",
    "name" -> "Statement of Account 1",
    "title" -> "Statement of Account",
    "sections" -> Json.arr(
      Json.obj(
        "name" -> "Previous Charges",
        "fields" -> Json.arr(
          Json.obj("name" -> "Overdue Charges", "datatype" -> "double", "value" -> 0.0),
          Json.obj("name" -> "Other Charges", "datatype" -> "double", "value" -> 0.0),
          Json.obj("name" -> "Total", "datatype" -> "currency", "required" -> true, "value" -> 0.0)
        )
      ),
      Json.obj(
        "name" -> "This Month's Charges",
        "sections" -> Json.arr(
          Json.obj(
            "name" -> "Rent",
            "fields" -> Json.arr(
              Json.obj("name" -> "Base", "datatype" -> "double", "value" -> 0.0),
              Json.obj("name" -> "+12% VAT", "datatype" -> "double", "value" -> 0.0),
              Json.obj("name" -> "Subtotal", "datatype" -> "double", "value" -> 0.0),
              Json.obj("name" -> "-5% Withholding Tax", "datatype" -> "double", "value" -> 0.0),
              Json.obj("name" -> "Total", "datatype" -> "currency", "required" -> true, "value" -> 0.0)
            )
          ),
          Json.obj(
            "name" -> "Electricity",
            "fields" -> Json.arr(
              Json.obj("name" -> "Meter number", "datatype" -> "string", "value" -> ""),
              Json.obj("name" -> "Billing starting", "datatype" -> "date", "value" -> ""),
              Json.obj("name" -> "Billing until", "datatype" -> "date", "value" -> ""),
              Json.obj("name" -> "Previous reading", "datatype" -> "integer", "value" -> 0),
              Json.obj("name" -> "Current reading", "datatype" -> "integer", "value" -> 0),
              Json.obj("name" -> "KW used", "datatype" -> "integer", "value" -> 0),
              Json.obj("name" -> "Multiplier", "datatype" -> "integer", "value" -> 0),
              Json.obj("name" -> "Gross KW usage", "datatype" -> "integer", "value" -> 0),
              Json.obj("name" -> "Meralco", "datatype" -> "double", "value" -> 0.0),
              Json.obj("name" -> "Consumption", "datatype" -> "double", "value" -> 0.0),
              Json.obj("name" -> "Total", "datatype" -> "currency", "required" -> true, "value" -> 0.0)
            )
          ),
          Json.obj(
            "name" -> "Water",
            "fields" -> Json.arr(
              Json.obj("name" -> "Meter number", "datatype" -> "string", "value" -> ""),
              Json.obj("name" -> "Billing starting", "datatype" -> "date", "value" -> ""),
              Json.obj("name" -> "Billing until", "datatype" -> "date", "value" -> ""),
              Json.obj("name" -> "Previous reading", "datatype" -> "integer", "value" -> 0),
              Json.obj("name" -> "Current reading", "datatype" -> "integer", "value" -> 0),
              Json.obj("name" -> "Gross cu m usage", "datatype" -> "integer", "value" -> 0),
              Json.obj("name" -> "Rate/cu m", "datatype" -> "double", "value" -> 0.0),
              Json.obj("name" -> "Consumption", "datatype" -> "double", "value" -> 0.0),
              Json.obj("name" -> "Total", "datatype" -> "currency", "required" -> true, "value" -> 0.0)
            )
          ),
          Json.obj(
            "name" -> "Cusa",
            "fields" -> Json.arr(
              Json.obj("name" -> "Total", "datatype" -> "currency", "required" -> true, "value" -> 0.0)
            )
          )
        ),
        "fields" -> Json.arr(
          Json.obj("name" -> "Total Amount Due", "datatype" -> "currency", "required" -> true)
        )
      )
    ),
    "fields" -> Json.arr(
      Json.obj("name" -> "Total Amount Due", "datatype" -> "currency", "required" -> true)
    )
  )
}
