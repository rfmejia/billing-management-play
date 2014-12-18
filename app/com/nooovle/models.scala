package com.nooovle

import org.joda.time.DateTime

case class LogEntry(id: Int, documentId: Int, message: String,
  timestamp: DateTime, origin: String)
