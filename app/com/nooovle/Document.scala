package com.nooovle

import com.nooovle.ModelInfo._
import com.nooovle.slick.ConnectionFactory
import com.nooovle.slick.models.documents
import org.joda.time.DateTime
import play.api.libs.json.JsObject
import scala.slick.driver.H2Driver.simple._
import scala.util.Try

case class Document(
  id: Int,
  serialId: Option[String],
  title: String,
  docType: String, // Type of subdocument
  mailbox: String,
  creator: String,
  created: DateTime,
  forTenant: Int,
  forMonth: DateTime,
  amountPaid: Double,
  body: JsObject,
  comments: JsObject,
  assigned: Option[String],
  lastAction: Option[Int] = None,
  preparedAction: Option[Int] = None,
  checkedAction: Option[Int] = None,
  approvedAction: Option[Int] = None)

object Document extends ((Int, Option[String], String, String, String, String, DateTime, Int, DateTime, Double, JsObject, JsObject, Option[String], Option[Int], Option[Int], Option[Int], Option[Int]) => Document) with ModelTemplate {

  def findById(id: Int): Option[Document] =
    ConnectionFactory.connect withSession { implicit session =>
      (for (d <- documents if d.id === id) yield d).firstOption
    }

  def insert(creator: User, title: String, docType: String, forTenant: Int, forMonth: DateTime,
    body: JsObject): Try[Document] = {
    val creationTime = new DateTime()
    val doc = Document(0, None, title, docType, Workflow.start.name, creator.userId,
      creationTime, forTenant, forMonth, 0.0, body, JsObject(Seq.empty), Some(creator.userId))

    ConnectionFactory.connect withSession { implicit session =>
      // Return ID of newly inserted tenant
      val id = (documents returning documents.map(_.id)) += doc

      // Log this action
      ActionLog.log(creator.userId, id, "Created document") map { log =>
        val newDoc = doc.copy(id = id, lastAction = Some(log.id))
        update(newDoc).get
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
    ModelInfo("DOCUMENTS", "id", "string", Uneditable, Uneditable, Some("ID")),
    ModelInfo("DOCUMENTS", "serialId", "string", Uneditable, Uneditable, Some("Serial ID")),
    ModelInfo("DOCUMENTS", "title", "string", Required, Editable, Some("Title")),
    ModelInfo("DOCUMENTS", "docType", "string", Required, Uneditable, Some("Document type")),
    ModelInfo("DOCUMENTS", "mailbox", "string", Uneditable, Uneditable, Some("Mailbox")),
    ModelInfo("DOCUMENTS", "creator", "string", Uneditable, Uneditable, Some("Created by")),
    ModelInfo("DOCUMENTS", "created", "datetime", Uneditable, Uneditable, Some("Created on")),
    ModelInfo("DOCUMENTS", "forTenant", "number", Required, Uneditable, Some("For tenant")),
    ModelInfo("DOCUMENTS", "forMonth", "datetime", Required, Uneditable, Some("For the month of")),
    ModelInfo("DOCUMENTS", "amountPaid", "number", Uneditable, Editable, Some("Amount paid")),
    ModelInfo("DOCUMENTS", "body", "json", Required, Editable, Some("Document body (free-form JSON object)")),
    ModelInfo("DOCUMENTS", "comments", "json", Uneditable, Editable, Some("Comments (free-form JSON object)")),
    ModelInfo("DOCUMENTS", "assigned", "string", Uneditable, Editable, Some("Currently assigned to")))
}
