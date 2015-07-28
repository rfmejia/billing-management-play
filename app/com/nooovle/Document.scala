package com.nooovle

import com.nooovle.ModelInfo._
import com.nooovle.slick.ConnectionFactory
import com.nooovle.slick.models.{ actionLogs, documents }
import com.nooovle.slick.DocumentsModel
import controllers.Templates
import org.joda.time.{ DateTime, DateTimeZone, YearMonth }
import play.api.libs.json._
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
  isEditable: Boolean,
  isPaid: Boolean,
  amountPaid: JsObject,
  body: JsObject,
  comments: JsObject,
  assigned: Option[String],
  lastAction: Option[Int] = None,
  preparedAction: Option[Int] = None
)

object Document extends ((Int, Option[SerialNumber], String, String, String, DateTime, Int, Int, Int, Boolean, Boolean, JsObject, JsObject, JsObject, Option[String], Option[Int], Option[Int]) => Document) with ModelTemplate {

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

  /**
   * Check if document with the same tenant and current and future year/month do not exist
   */
  private def validCreationParams(forTenant: Int, forMonth: YearMonth): Boolean =
    ConnectionFactory.connect withSession { implicit session =>
      documents.filter(_.forTenant === forTenant).list
        .map(d => new YearMonth(d.year, d.month))
        .filter(_.compareTo(forMonth) >= 0)
        .isEmpty
    }

  /**
   * For a given tenant, return the latest monthly amount up to the given upper bound date.
   */
  private def findLastTenantDocument(forTenant: Int, upperBound: Option[YearMonth] = None): Option[Document] =
    ConnectionFactory.connect withSession { implicit session =>
      val forMonth = upperBound getOrElse YearMonth.now
      val sorted = documents.filter(_.forTenant === forTenant).list
        .map(d => (d, new YearMonth(d.year, d.month)))
        .filter { case (_, date) => date.compareTo(forMonth) < 0 }
        .sortWith { (a, b) => a._2.compareTo(b._2) > 0 }
      println(s"sorted: $sorted")
      sorted.headOption.map(_._1)
    }

  def insert(creator: User, docType: String, forTenant: Int, forMonth: YearMonth, body: JsObject): Try[Document] = {
    if (!validCreationParams(forTenant, forMonth)) {
      Failure(new IllegalStateException(s"Document for tenant ('${forTenant}', ${forMonth}) already exists"))
    } else {
      // Copy the unpaid charges from the previous month, if any
      val previousDoc = findLastTenantDocument(forTenant, Some(forMonth))
      val newBody: JsObject = previousDoc.map { prevDoc =>
        val (prevCurr, _) = Templates.extractAmounts(prevDoc)
        val paymentHistory = Json.obj(
          "withholding_tax" -> 0,
          "previous_charges" -> 0,
          "rent" -> Json.obj(
            "unpaid" -> prevCurr.rent.unpaid,
            "penalty_percent" -> 0,
            "penalty_value" -> 0
          ),
          "electricity" -> Json.obj(
            "unpaid" -> prevCurr.electricity.unpaid,
            "penalty_percent" -> 0,
            "penalty_value" -> 0
          ),
          "water" -> Json.obj(
            "unpaid" -> prevCurr.water.unpaid,
            "penalty_percent" -> 0,
            "penalty_value" -> 0
          ),
          "cusa" -> Json.obj(
            "unpaid" -> prevCurr.cusa.unpaid,
            "penalty_percent" -> 0,
            "penalty_value" -> 0
          )
        )
        val sectionTotal = Json.obj(
          "id" -> "_previous_total",
          "title" -> "Previous charges total",
          "datatype" -> "currency",
          "value" -> prevCurr.total
        )
        val fields = Json.arr(
          Json.obj(
            "id" -> "_overdue_charges",
            "title" -> "Overdue Charges",
            "datatype" -> "currency",
            "value" -> 0
          ),
          Json.obj(
            "id" -> "_other_charges",
            "title" -> "Other Charges",
            "datatype" -> "currency",
            "value" -> 0
          )
        )

        body ++ Json.obj(
          "previous" -> Json.obj(
            "title" -> "Previous charges",
            "sections" -> Json.arr(
              Json.obj("sectionTotal" -> sectionTotal),
              Json.obj("fields" -> fields),
              Json.obj("payment_history" -> paymentHistory)
            )
          )
        )
      } getOrElse body

      val creationTime = new DateTime()
      val doc = Document(0, None, docType, Mailbox.start.name,
        creator.userId, creationTime, forTenant, forMonth.getYear,
        forMonth.getMonthOfYear, true, true, defaultAmountPaid, newBody,
        JsObject(Seq.empty), Some(creator.userId))

      val (current, previous) = Templates.extractAmounts(doc)
      val docWithIsPaid = doc.copy(isPaid = current.isPaid && previous.isPaid)

      ConnectionFactory.connect withSession { implicit session =>
        // Return ID of newly inserted tenant
        val id = (documents returning documents.map(_.id)) += docWithIsPaid

        // Make previous document uneditable
        if (previousDoc.isDefined) update(previousDoc.get.copy(isEditable = false))

        // Log this action like this, because we need the new document's generated ID
        ActionLog.log(creator.userId, id, "Created document") map { log =>
          val newDoc = docWithIsPaid.copy(id = id, lastAction = Some(log.id))
          update(newDoc).get
        }
      }
    }
  }

  def update(doc: Document): Try[Document] = Try {
    ConnectionFactory.connect withSession { implicit session =>
      val query = for (d <- documents if d.id === doc.id) yield d
      if (!query.exists.run) throw new IndexOutOfBoundsException(s"Document '${doc.id}' does not exist")
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
            case (Mailbox.drafts, Mailbox.unpaid, None) =>
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
