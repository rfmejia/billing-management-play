package com.nooovle

import com.nooovle.ModelInfo._
import com.nooovle.slick.ConnectionFactory
import com.nooovle.slick.models.{ actionLogs, documents }
import com.nooovle.slick.DocumentsModel
import org.joda.time.{ DateTime, YearMonth }
import play.api.libs.json.{ JsNumber, JsObject }
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
  year: Int,
  month: Int,
  amountPaid: JsObject,
  body: JsObject,
  comments: JsObject,
  assigned: Option[String],
  lastAction: Option[Int] = None,
  preparedAction: Option[Int] = None,
  checkedAction: Option[Int] = None,
  approvedAction: Option[Int] = None)

object Document extends ((Int, Option[String], String, String, String, String, DateTime, Int, Int, Int, JsObject, JsObject, JsObject, Option[String], Option[Int], Option[Int], Option[Int], Option[Int]) => Document) with ModelTemplate {

  private val defaultAmountPaid: JsObject =
    JsObject(Seq(
      "previous" -> JsNumber(0.0),
      "rental" -> JsNumber(0.0),
      "electricity" -> JsNumber(0.0),
      "water" -> JsNumber(0.0),
      "cusa" -> JsNumber(0.0)))

  def findById(id: Int): Option[Document] =
    ConnectionFactory.connect withSession { implicit session =>
      (for (d <- documents if d.id === id) yield d).firstOption
    }

  def actionLogsOf(id: Int): List[ActionLog] =
    ConnectionFactory.connect withSession { implicit session =>
      (for (l <- actionLogs if l.what === id) yield l).sortBy(_.when).list
    }

  def insert(creator: User, title: String, docType: String, forTenant: Int, forMonth: YearMonth, body: JsObject): Try[Document] = {
    val creationTime = new DateTime()
    val doc = Document(0, None, title, docType, Workflow.start.name, creator.userId,
      creationTime, forTenant, forMonth.getYear, forMonth.getMonthOfYear, defaultAmountPaid, body, JsObject(Seq.empty), Some(creator.userId))

    ConnectionFactory.connect withSession { implicit session =>
      // Return ID of newly inserted tenant
      val id = (documents returning documents.map(_.id)) += doc

      // Log this action like this, because we need the new document's generated ID
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

  private def logAction(log: ActionLog, doc: Query[scala.slick.lifted.Column[Option[Int]], Option[Int], Seq]): Try[ActionLog] = Try {
    ConnectionFactory.connect withSession { implicit session =>
      if (!doc.exists.run) throw new IndexOutOfBoundsException
      else {
        doc.update(Some(log.id))
        log
      }
    }
  }

  def logLastAction(log: ActionLog): Try[ActionLog] =
    logAction(log, for (d <- documents if d.id === log.what) yield d.lastAction)

  def logPreparedAction(log: ActionLog): Try[ActionLog] = {
    logAction(log, for (d <- documents if d.id === log.what) yield d.preparedAction)
      .flatMap(logLastAction(_))
  }

  def logCheckedAction(log: ActionLog): Try[ActionLog] = {
    logAction(log, for (d <- documents if d.id === log.what) yield d.checkedAction)
      .flatMap(logLastAction(_))
  }

  def logApprovedAction(log: ActionLog): Try[ActionLog] = {
    logAction(log, for (d <- documents if d.id === log.what) yield d.approvedAction)
      .flatMap(logLastAction(_))
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
    ModelInfo("DOCUMENTS", "amountPaid", "json", Uneditable, Editable, Some("Amount paid")),
    ModelInfo("DOCUMENTS", "body", "json", Required, Editable, Some("Document body (free-form JSON object)")),
    ModelInfo("DOCUMENTS", "comments", "json", Uneditable, Editable, Some("Comments (free-form JSON object)")),
    ModelInfo("DOCUMENTS", "assigned", "string", Uneditable, Uneditable, Some("Currently assigned to")))
}
