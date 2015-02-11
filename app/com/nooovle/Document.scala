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
  preparedBy: Option[String] = None,
  preparedOn: Option[DateTime] = None,
  checkedBy: Option[String] = None,
  checkedOn: Option[DateTime] = None,
  approvedBy: Option[String] = None,
  approvedOn: Option[DateTime] = None,
  assigned: Option[String] = None) { // Which user is working on this now?

  // Returns that if exists, else this
  def replaceWith(that: Option[Document]): Document =
    {
      println(that)
      that match {
        case Some(that) => that
        case None => this
      }
    }
}

object Document extends ((Int, Option[String], String, String, String, String, DateTime, Int, DateTime, Double, JsObject, Option[String], Option[DateTime], Option[String], Option[DateTime], Option[String], Option[DateTime], Option[String]) => Document) with ModelTemplate {

  def findById(id: Int): Option[Document] =
    ConnectionFactory.connect withSession { implicit session =>
      (for (d <- documents if d.id === id) yield d).firstOption
    }

  def insert(title: String, docType: String, forTenant: Int, forMonth: DateTime,
    body: JsObject): Try[Document] = {
    val created = new DateTime()
    val creator = "To implement"
    val newDoc = Document(0, None, title, docType, Workflow.start, creator,
      created, forTenant, forMonth, 0.0, body)
    ConnectionFactory.connect withSession { implicit session =>
      Try {
        // Returns ID of newly inserted tenant
        (documents returning documents) += newDoc
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
    ModelInfo("DOCUMENTS", "id", "UUID", Uneditable, Uneditable, Some("ID")),
    ModelInfo("DOCUMENTS", "serialId", "String", Uneditable, Uneditable, Some("Serial ID")),
    ModelInfo("DOCUMENTS", "title", "String", Required, Editable, Some("Title")),
    ModelInfo("DOCUMENTS", "docType", "String", Required, Uneditable, Some("Document type")),
    ModelInfo("DOCUMENTS", "mailbox", "String", Uneditable, Uneditable, Some("Mailbox")),
    ModelInfo("DOCUMENTS", "creator", "String", Uneditable, Uneditable, Some("Created by")),
    ModelInfo("DOCUMENTS", "created", "DateTime", Uneditable, Uneditable, Some("Created on")),
    ModelInfo("DOCUMENTS", "forTenant", "Int", Required, Uneditable, Some("For tenant")),
    ModelInfo("DOCUMENTS", "forMonth", "DateTime", Required, Uneditable, Some("For the month of")),
    ModelInfo("DOCUMENTS", "amountPaid", "Double", Uneditable, Editable, Some("Amount paid")),
    ModelInfo("DOCUMENTS", "body", "String", Required, Editable, Some("Document JSON body (free-form)")),
    ModelInfo("DOCUMENTS", "assigned", "String", Uneditable, Editable, Some("Currently assigned to")))
}
