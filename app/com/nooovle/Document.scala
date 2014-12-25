package com.nooovle

import com.nooovle.slick.ConnectionFactory
import com.nooovle.slick.models.documents
import java.util.UUID
import org.joda.time.DateTime
import play.api.libs.json.JsObject
import scala.slick.driver.H2Driver.simple._
import scala.util.Try

case class Document(
  id: UUID,
  serialId: Option[String],
  title: String,
  docType: String, // Type of subdocument
  mailbox: String,
  creator: String,
  created: DateTime,
  body: JsObject,
  preparedBy: Option[String] = None,
  preparedOn: Option[DateTime] = None,
  checkedBy: Option[String] = None,
  checkedOn: Option[DateTime] = None,
  approvedBy: Option[String] = None,
  approvedOn: Option[DateTime] = None,
  assigned: Option[String] = None // Which user is working on this now?
  )

object Document extends ((UUID, Option[String], String, String, String, String, DateTime, JsObject, Option[String], Option[DateTime], Option[String], Option[DateTime], Option[String], Option[DateTime], Option[String]) => Document) with ModelTemplate {

  def findById(id: UUID): Option[Document] =
    ConnectionFactory.connect withSession { implicit session =>
      (for (d <- documents if d.id === id) yield d).firstOption
    }

  def insert(title: String, docType: String, body: JsObject): Try[Document] = {
    val id = UUID.randomUUID()
    val created = new DateTime()
    val creator = "To implement"
    val newDoc = Document(id, None, title, docType, Workflow.start, creator,
      created, body)
    ConnectionFactory.connect withSession { implicit session =>
      Try {
        // Returns ID of newly inserted tenant
        documents += newDoc
        newDoc
      }
    }
  }

  def update(doc: Document): Try[Document] = Try {
    ConnectionFactory.connect withSession { implicit session =>
      val query = for (d <- documents if d.id === doc.id) yield d

      if (!query.exists.run) throw new IndexOutOfBoundsException
      else {
        query.update(doc)
        query.first
      }
    }
  }

  val modelName = "DOCUMENTS"
  lazy val modelInfos = Seq(
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
