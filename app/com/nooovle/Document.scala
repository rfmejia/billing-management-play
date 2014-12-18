package com.nooovle

import java.util.UUID
import org.joda.time.DateTime
import play.api.libs.json.JsObject

case class Document(
  id: UUID,
  serialId: Option[String],
  title: String,
  docType: String, // Type of subdocument
  mailbox: String,
  created: DateTime,
  creator: String,
  assigned: Option[String], // Which user is working on this now?
  body: JsObject)

object Document extends ((UUID, Option[String], String, String, String, DateTime, String, Option[String], JsObject) => Document) with HasModelInfo {
  lazy val modelInfo = Seq(
    ModelInfo("DOCUMENTS", "id", "UUID", false, false, true, Some("ID")),
    ModelInfo("DOCUMENTS", "serialId", "String", false, false, true, Some("Serial ID")),
    ModelInfo("DOCUMENTS", "title", "String", true, true, true, Some("Title")),
    ModelInfo("DOCUMENTS", "docType", "String[]", true, false, true, Some("Document type")),
    ModelInfo("DOCUMENTS", "mailbox", "String", false, true, true, Some("Mailbox")),
    ModelInfo("DOCUMENTS", "created", "String", false, false, true, Some("Created on")),
    ModelInfo("DOCUMENTS", "creator", "String", false, false, true, Some("Created by")),
    ModelInfo("DOCUMENTS", "assigned", "String", false, true, false, Some("Currently assigned to")),
    ModelInfo("DOCUMENTS", "body", "String", true, true, true, Some("Document JSON body (free-form)")))
}
