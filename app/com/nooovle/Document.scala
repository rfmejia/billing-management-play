package com.nooovle

import com.nooovle.ModelInfo._
import com.nooovle.slick.ConnectionFactory
import com.nooovle.slick.models.{ actionLogs, documents }
import com.nooovle.slick.DocumentsModel
import controllers.Templates
import org.joda.time.{ DateTime, YearMonth }
import play.api.libs.json.{ JsNumber, JsObject }
import play.api.Logger
import scala.slick.driver.PostgresDriver.simple._
import scala.util.{ Try, Success, Failure }

case class Document(
  id: Int,
  serialId: Option[SerialNumber],
  docType: String, // Type of subdocument
  mailbox: String,
  creator: String,
  created: DateTime,
  forTenant: Int,
  year: Int,
  month: Int,
  isPaid: Boolean,
  amountPaid: JsObject,
  body: JsObject,
  comments: JsObject,
  assigned: Option[String],
  lastAction: Option[Int] = None,
  preparedAction: Option[Int] = None
)

object Document extends ((Int, Option[SerialNumber], String, String, String, DateTime, Int, Int, Int, Boolean, JsObject, JsObject, JsObject, Option[String], Option[Int], Option[Int]) => Document) with ModelTemplate {

  private val defaultAmountPaid: JsObject =
    JsObject(Seq(
      "previous" -> JsNumber(0.0),
      "rent" -> JsNumber(0.0),
      "electricity" -> JsNumber(0.0),
      "water" -> JsNumber(0.0),
      "cusa" -> JsNumber(0.0)
    ))

  def findById(id: Int): Option[Document] =
    ConnectionFactory.connect withSession { implicit session =>
      (for (d <- documents if d.id === id) yield d).firstOption
    }

  def actionLogsOf(id: Int): List[ActionLog] =
    ConnectionFactory.connect withSession { implicit session =>
      (for (l <- actionLogs if l.what === id) yield l).sortBy(_.when).list
    }

  def insert(creator: User, docType: String, forTenant: Int, forMonth: YearMonth, body: JsObject): Try[Document] = {
    val creationTime = new DateTime()
    val doc = Document(0, None, docType, Mailbox.start.name,
      creator.userId, creationTime, forTenant, forMonth.getYear,
      forMonth.getMonthOfYear, true, defaultAmountPaid, body,
      JsObject(Seq.empty), Some(creator.userId))

    val (_, _, _, _, _, isPaid) = Templates.extractDefaultAmounts(doc)
    val docWithIsPaid = doc.copy(isPaid = isPaid)

    ConnectionFactory.connect withSession { implicit session =>
      // Return ID of newly inserted tenant
      val id = (documents returning documents.map(_.id)) += docWithIsPaid

      // Log this action like this, because we need the new document's generated ID
      ActionLog.log(creator.userId, id, "Created document") map { log =>
        val newDoc = docWithIsPaid.copy(id = id, lastAction = Some(log.id))
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

  // TODO: Add implicit database session instead
  def changeMailbox(doc: Document, oldBox: Mailbox, newBox: Mailbox): Try[Document] = {
    ConnectionFactory.connect withSession { implicit session =>
      Document.update(doc.copy(mailbox = newBox.name, assigned = None)) flatMap {
        withNewBox =>
          (oldBox, newBox, doc.serialId) match {
            case (forApproval, forSending, None) =>
              SerialNumber.create(doc.id) map {
                sn =>
                  Document.update(withNewBox.copy(serialId = Some(sn))) match {
                    case Success(withSerialNumber) => withSerialNumber
                    case Failure(msg) =>
                      Logger.warn(s"Unable to generate serial ID for document ${doc.id}")
                      withNewBox
                  }
              }
            case _ => Success(withNewBox)
          }
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

  val modelName = "DOCUMENTS"
  lazy val modelInfos = Seq(
    ModelInfo("DOCUMENTS", "id", "string", Uneditable, Uneditable, Some("ID")),
    ModelInfo("DOCUMENTS", "serialId", "string", Uneditable, Uneditable, Some("Serial ID")),
    ModelInfo("DOCUMENTS", "docType", "string", Required, Uneditable, Some("Document type")),
    ModelInfo("DOCUMENTS", "mailbox", "string", Uneditable, Uneditable, Some("Mailbox")),
    ModelInfo("DOCUMENTS", "creator", "string", Uneditable, Uneditable, Some("Created by")),
    ModelInfo("DOCUMENTS", "created", "datetime", Uneditable, Uneditable, Some("Created on")),
    ModelInfo("DOCUMENTS", "forTenant", "number", Required, Uneditable, Some("For tenant")),
    ModelInfo("DOCUMENTS", "year", "number", Required, Uneditable, Some("For the year of")),
    ModelInfo("DOCUMENTS", "month", "number", Required, Uneditable, Some("For the month of")),
    ModelInfo("DOCUMENTS", "amountPaid", "json", Uneditable, Editable, Some("Amount paid")),
    ModelInfo("DOCUMENTS", "body", "json", Required, Editable, Some("Document body (free-form JSON object)")),
    ModelInfo("DOCUMENTS", "comments", "json", Uneditable, Editable, Some("Comments (free-form JSON object)")),
    ModelInfo("DOCUMENTS", "assigned", "string", Uneditable, Uneditable, Some("Currently assigned to"))
  )
}
