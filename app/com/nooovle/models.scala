package com.nooovle

import org.joda.time.DateTime

case class LogEntry(id: Int, documentId: Int, message: String,
  timestamp: DateTime, origin: String)

trait Document {
  val id: Int
  val box: String
  val assigned: Option[String]
}

trait HasModelInfo {
  val modelInfo: Seq[ModelInfo]
}
