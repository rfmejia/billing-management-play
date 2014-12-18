package com.nooovle

import play.api.libs.json.JsObject
import java.util.UUID
import org.joda.time.DateTime

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
