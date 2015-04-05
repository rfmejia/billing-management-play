package com.nooovle.slick

import controllers.InvitationInfo

import scala.slick.driver.PostgresDriver.simple._
import scala.slick.jdbc.meta.MTable
import scala.util.{ Success, Try }

import org.joda.time.DateTime

import com.github.tototoshi.slick.H2JodaSupport._
import com.nooovle._

import play.api.libs.json._
import securesocial.core.providers.MailToken

object models {
  val modelTemplates = TableQuery[ModelInfosModel]
  val roles = TableQuery[RolesModel]
  val settings = TableQuery[SettingsModel]
  val tenants = TableQuery[TenantsModel]
  val users = TableQuery[UsersModel]
  val documents = TableQuery[DocumentsModel]
  val userRoles = TableQuery[UserRolesModel]
  val mailTokens = TableQuery[MailTokensModel]
  val invitations = TableQuery[InvitationsModel]
  val actionLogs = TableQuery[ActionLogsModel]
  val serialNumbers = TableQuery[SerialNumbersModel]

  val tables = List(modelTemplates, roles, settings, tenants, users, documents,
    userRoles, mailTokens, invitations, actionLogs, serialNumbers)
  lazy val ddl = {
    val ts = tables.map(_.ddl)
    ts.tail.foldLeft(ts.head)(_ ++ _)
  }

  /**
   *  Builds tables one by one if they do not exist.
   *  !Note that this does not upgrade a table schema if they are changed.
   */
  def buildTables(implicit session: Session): List[Try[String]] = {
    tables.map(t => {
      val tableName = t.baseTableRow.tableName
      if (MTable.getTables(tableName).list.isEmpty) {
        Try {
          t.ddl.create
          s"Table '${tableName}' created successfully. "
        }
      } else Success {
        s"Warning: Table ${tableName} already exists; no action taken"
      }
    })
  }

  implicit val jsToString = MappedColumnType.base[JsObject, String](_.toString, {
    Json.parse(_) match {
      case o: JsObject => o
      case _ => throw new IllegalStateException("Malformed JSON object")
    }
  })
}

class SettingsModel(tag: Tag) extends Table[(String, String)](tag, "SETTINGS") {
  def key = column[String]("KEY", O.PrimaryKey)
  def value = column[String]("VALUE", O.NotNull)

  def * = (key, value)
}

class ModelInfosModel(tag: Tag) extends Table[ModelInfo](tag,
  "MODEL_INFOS") {
  def modelName = column[String]("MODEL_NAME", O.NotNull)
  def fieldName = column[String]("FIELD_NAME", O.NotNull)
  def datatype = column[String]("DATATYPE", O.NotNull)
  def createForm = column[Boolean]("CREATE_FORM", O.NotNull)
  def createRequired = column[Boolean]("CREATE_REQUIRED", O.NotNull)
  def editForm = column[Boolean]("EDIT_FORM", O.NotNull)
  def editRequired = column[Boolean]("EDIT_REQUIRED", O.NotNull)

  def prompt = column[Option[String]]("PROMPT")
  def tooltip = column[Option[String]]("TOOLTIP")

  def pk = primaryKey("MODEL_INFOS_PK", (modelName, fieldName))

  def * = (modelName, fieldName, datatype, (createForm, createRequired), (editForm, editRequired), prompt, tooltip) <> (ModelInfo.tupled, ModelInfo.unapply)
}

class UsersModel(tag: Tag) extends Table[User](tag, "USERS") {
  def userId = column[String]("USER_ID", O.PrimaryKey)
  def providerId = column[String]("PROVIDER_ID", O.NotNull)
  def firstName = column[Option[String]]("FIRST_NAME")
  def lastName = column[Option[String]]("LAST_NAME")
  def email = column[Option[String]]("EMAIL")
  def hasher = column[String]("HASHER", O.NotNull)
  def password = column[String]("PASSWORD", O.NotNull)
  def salt = column[Option[String]]("SALT")

  def * = (providerId, userId, firstName, lastName, email, hasher, password, salt) <>
    (User.tupled, User.unapply)
}

class TenantsModel(tag: Tag) extends Table[Tenant](tag, "TENANTS") {
  def id = column[Int]("ID", O.PrimaryKey, O.AutoInc)
  def tradeName = column[String]("TRADE_NAME", O.NotNull)
  def address = column[String]("ADDRESS", O.NotNull)
  def contactPerson = column[String]("CONTACT_PERSON", O.NotNull)
  def contactNumber = column[String]("CONTACT_NUMBER", O.NotNull)
  def email = column[String]("EMAIL", O.NotNull)

  def area = column[Double]("AREA", O.NotNull)
  def rentalPeriod = column[String]("RENTAL_PERIOD", O.NotNull)
  def escalation = column[Double]("ESCALATION", O.NotNull)

  def cusaDefault = column[Option[Double]]("CUSA_DEFAULT")
  def waterMeterDefault = column[Option[String]]("WATER_METER_DEFAULT")
  def electricityMeterDefault = column[Option[String]]("ELECTRICITY_METER_DEFAULT")
  def baseRentDefault = column[Option[Double]]("BASE_RENT_DEFAULT")
  def standardMultiplierDefault = column[Option[Double]]("STANDARD_MULTIPLIER_DEFAULT")

  def * = (id, tradeName, address, contactPerson, contactNumber, email, area, rentalPeriod, escalation, cusaDefault, waterMeterDefault, electricityMeterDefault, baseRentDefault, standardMultiplierDefault) <>
    (Tenant.tupled, Tenant.unapply)
}

class RolesModel(tag: Tag) extends Table[String](tag, "ROLES") {
  def name = column[String]("NAME", O.PrimaryKey)

  def * = (name)
}

class UserRolesModel(tag: Tag) extends Table[(String, String)](tag, "USER_ROLES") {
  def userId = column[String]("USERNAME", O.NotNull)
  def roleName = column[String]("ROLE_NAME", O.NotNull)

  def pk = primaryKey("USER_ROLES_PK", (userId, roleName))
  def user = foreignKey("USER_FK", userId, models.users)(_.userId, onDelete = ForeignKeyAction.Cascade)
  def role = foreignKey("ROLE_FK", roleName, models.roles)(_.name, onDelete = ForeignKeyAction.Cascade)

  def * = (userId, roleName)
}

class DocumentsModel(tag: Tag) extends Table[Document](tag, "DOCUMENTS") {
  import models._
  def id = column[Int]("ID", O.PrimaryKey, O.AutoInc)
  def serialId = column[Option[Int]]("SERIAL_ID")
  def docType = column[String]("DOC_TYPE", O.NotNull)
  def mailbox = column[String]("MAILBOX", O.NotNull)
  def creator = column[String]("CREATOR", O.NotNull)
  def created = column[DateTime]("CREATED", O.NotNull)
  def forTenant = column[Int]("FOR_TENANT", O.NotNull)
  def year = column[Int]("YEAR", O.NotNull)
  def month = column[Int]("MONTH", O.NotNull)
  def isPaid = column[Boolean]("IS_PAID", O.NotNull)
  def amountPaid = column[JsObject]("AMOUNT_PAID", O.NotNull)
  def body = column[JsObject]("BODY", O.NotNull)
  def comments = column[JsObject]("COMMENTS", O.NotNull)
  def assigned = column[Option[String]]("ASSIGNED")

  def lastAction = column[Option[Int]]("LAST_ACTION_ID")
  def preparedAction = column[Option[Int]]("PREPARED_ACTION_ID")
  def checkedAction = column[Option[Int]]("CHECKED_ACTION_ID")
  def approvedAction = column[Option[Int]]("APPROVED_ACTION_ID")

  def * = (id, serialId, docType, mailbox, creator, created, forTenant, year, month, isPaid, amountPaid, body, comments, assigned, lastAction, preparedAction, checkedAction, approvedAction) <> (Document.tupled, Document.unapply)
}

class MailTokensModel(tag: Tag) extends Table[MailToken](tag, "MAIL_TOKENS") {
  def uuid = column[String]("UUID", O.PrimaryKey)
  def email = column[String]("EMAIL", O.NotNull)
  def creationTime = column[DateTime]("CREATION_TIME", O.NotNull)
  def expirationTime = column[DateTime]("EXPIRATION_TIME", O.NotNull)
  def isSignUp = column[Boolean]("IS_SIGN_UP", O.NotNull)

  def * = (uuid, email, creationTime, expirationTime, isSignUp) <>
    (MailToken.tupled, MailToken.unapply)
}

class InvitationsModel(tag: Tag) extends Table[InvitationInfo](tag, "INVITATIONS") {
  def email = column[String]("EMAIL", O.PrimaryKey)
  def isEncoder = column[Boolean]("IS_ENCODER", O.NotNull)
  def isChecker = column[Boolean]("IS_CHECKER", O.NotNull)
  def isApprover = column[Boolean]("IS_APPROVER", O.NotNull)
  def isAdmin = column[Boolean]("IS_ADMIN", O.NotNull)

  def * = (email, isEncoder, isChecker, isApprover, isAdmin) <>
    (InvitationInfo.tupled, InvitationInfo.unapply)
}

class ActionLogsModel(tag: Tag) extends Table[ActionLog](tag, "ACTION_LOGS") {
  def id = column[Int]("ID", O.PrimaryKey, O.AutoInc)
  def who = column[String]("WHO")
  def what = column[Int]("WHAT", O.NotNull)
  def when = column[DateTime]("WHEN", O.NotNull)
  def why = column[String]("WHY", O.NotNull)

  def _who = foreignKey("USER_FK", who, models.users)(_.userId, onDelete = ForeignKeyAction.SetNull)
  def _what = foreignKey("DOCUMENT_FK", what, models.documents)(_.id, onDelete = ForeignKeyAction.Cascade)

  def * = (id, who, what, when, why) <> (ActionLog.tupled, ActionLog.unapply)
}

class SerialNumbersModel(tag: Tag) extends Table[SerialNumber](tag, ("SERIAL_NUMBERS")) {
  def id = column[Int]("ID", O.PrimaryKey, O.AutoInc)
  def docId = column[Int]("DOC_ID")

  def document = foreignKey("DOCUMENT_FK", docId, models.documents)(_.id, onDelete = ForeignKeyAction.Cascade)

  def * = (id, docId) <> (SerialNumber.tupled, SerialNumber.unapply)
}
