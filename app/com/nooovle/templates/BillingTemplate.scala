package com.nooovle.templates

import com.nooovle.ModelTemplate

import play.api.libs.json._

object BillingTemplate {
  val asJsValue: JsValue = Json.obj(
    "id" -> "billing_template-1",
    "name" -> "Billing template 1",
    "sections" -> Json.arr(
      Json.obj(
        "name" -> "Previous Charges",
        "fields" -> Json.arr(
          Json.obj("name" -> "Overdue Charges", "datatype" -> "currency"),
          Json.obj("name" -> "Other Charges", "datatype" -> "currency"),
          Json.obj("name" -> "Total", "datatype" -> "currency", "required" -> true, "value" -> 0.0)
        )
      ),
      Json.obj(
        "name" -> "This Month's Charges",
        "sections" -> Json.arr(
          Json.obj(
            "name" -> "Rent",
            "fields" -> Json.arr(
              Json.obj("name" -> "Base", "datatype" -> "double"),
              Json.obj("name" -> "+12% VAT", "datatype" -> "double"),
              Json.obj("name" -> "Subtotal", "datatype" -> "double"),
              Json.obj("name" -> "-5% Withholding Tax", "datatype" -> "double"),
              Json.obj("name" -> "Total", "datatype" -> "currency", "required" -> true, "value" -> 0.0)
            )
          ),
          Json.obj(
            "name" -> "Electricity",
            "fields" -> Json.arr(
              Json.obj("name" -> "Meter number", "datatype" -> "string"),
              Json.obj("name" -> "Billing starting", "datatype" -> "date"),
              Json.obj("name" -> "Billing until", "datatype" -> "date"),
              Json.obj("name" -> "Previous reading", "datatype" -> "integer"),
              Json.obj("name" -> "Current reading", "datatype" -> "integer"),
              Json.obj("name" -> "KW used", "datatype" -> "integer"),
              Json.obj("name" -> "Multiplier", "datatype" -> "integer"),
              Json.obj("name" -> "Gross KW usage", "datatype" -> "integer"),
              Json.obj("name" -> "Meralco", "datatype" -> "double"),
              Json.obj("name" -> "Consumption", "datatype" -> "double"),
              Json.obj("name" -> "Total", "datatype" -> "currency", "required" -> true, "value" -> 0.0)
            )
          ),
          Json.obj(
            "name" -> "Water",
            "fields" -> Json.arr(
              Json.obj("name" -> "Meter number", "datatype" -> "string"),
              Json.obj("name" -> "Billing starting", "datatype" -> "date"),
              Json.obj("name" -> "Billing until", "datatype" -> "date"),
              Json.obj("name" -> "Previous reading", "datatype" -> "integer"),
              Json.obj("name" -> "Current reading", "datatype" -> "integer"),
              Json.obj("name" -> "Gross cu m usage", "datatype" -> "integer"),
              Json.obj("name" -> "Rate/cu m", "datatype" -> "double"),
              Json.obj("name" -> "Consumption", "datatype" -> "double"),
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
