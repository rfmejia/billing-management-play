package com.nooovle

import play.api.libs.json._

case class ModelInfo(modelName: String, fieldName: String, datatype: String,
  createForm: (Boolean, Boolean), editForm: (Boolean, Boolean),
  prompt: Option[String] = None, tooltip: Option[String] = None)

object ModelInfo extends ((String, String, String, (Boolean, Boolean), (Boolean, Boolean), Option[String], Option[String]) => ModelInfo) {

  def toJsonArray(action: DocAction)(fields: List[ModelInfo]): JsArray = Json.arr {
    fields map { f =>
      val o1 = Json.obj(
        "name" -> f.fieldName,
        "datatype" -> f.datatype)
      val o2 = if (f.prompt.isDefined) o1 + ("prompt" -> JsString(f.prompt.get)) else o1
      val o3 = if (f.tooltip.isDefined) o2 + ("tooltip" -> JsString(f.tooltip.get)) else o2
      val o4 = {
        if (action == DocCreate) o3 + ("required" -> JsBoolean(f.createForm._2))
        else if (action == DocEdit) o3 + ("required" -> JsBoolean(f.editForm._2))
        else o3
      }
      o4
    }
  }

  type DocAction = String
  val DocCreate: DocAction = "create"
  val DocEdit: DocAction = "edit"

  type FieldAction = (Boolean, Boolean) // (render field?, is required?)
  val Editable: FieldAction = (true, false)
  val Required: FieldAction = (true, true)
  val Uneditable: FieldAction = (false, false)
}

trait ModelTemplate {
  val modelName: String
  val modelInfos: Seq[ModelInfo]
}
