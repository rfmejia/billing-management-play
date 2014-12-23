package com.nooovle

import play.api.libs.json._

case class ModelInfo(modelName: String, fieldName: String, datatype: String,
  createForm: Boolean, editForm: Boolean, required: Boolean,
  prompt: Option[String] = None, tooltip: Option[String] = None)

object ModelInfo extends ((String, String, String, Boolean, Boolean, Boolean, Option[String], Option[String]) => ModelInfo) {

  def toJsonArray(fields: List[ModelInfo]): JsArray = Json.arr {
    fields map { f =>
      val o1 = Json.obj(
        "name" -> f.fieldName,
        "datatype" -> f.datatype,
        "required" -> f.required)
      val o2 = if (f.prompt.isDefined) o1 + ("prompt" -> JsString(f.prompt.get)) else o1
      val o3 = if (f.tooltip.isDefined) o2 + ("tooltip" -> JsString(f.tooltip.get)) else o2
      o3
    }
  }
}

trait ModelTemplate {
  val modelName: String
  val modelInfos: Seq[ModelInfo]
}
