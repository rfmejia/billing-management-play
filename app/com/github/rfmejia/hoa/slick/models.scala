package com.github.rfmejia.hoa.slick

import controllers.InvitationInfo

import scala.slick.driver.PostgresDriver.simple._
import scala.slick.jdbc.meta.MTable
import scala.util.{ Success, Try }

import org.joda.time.DateTime

import com.github.tototoshi.slick.H2JodaSupport._
import com.github.rfmejia.hoa._

import play.api.libs.json._
import securesocial.core.providers.MailToken

object models {
  val modelTemplates = TableQuery[ModelInfosModel]
  val settings = TableQuery[SettingsModel]
  val tenants = TableQuery[TenantsModel]
  val users = TableQuery[UsersModel]
  val documents = TableQuery[DocumentsModel]
  val userRoles = TableQuery[UserRolesModel]
  val mailTokens = TableQuery[MailTokensModel]
  val invitations = TableQuery[InvitationsModel]
  val actionLogs = TableQuery[ActionLogsModel]
  val serialNumbers = TableQuery[SerialNumbersModel]

  val tables = List(modelTemplates, settings, tenants, users, documents,
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

  implicit val snToString = MappedColumnType.base[SerialNumber, Int](_.id, {
    SerialNumber.get(_) match {
      case Some(sn) => sn
      case None => throw new IllegalStateException("Malformed JSON object")
    }
  })
}

class SettingsModel(tag: Tag) extends Table[(String, String)](tag, "SETTINGS") {
  def key = column[String]("KEY", O.PrimaryKey, O.DBType("TEXT"))
  def value = column[String]("VALUE", O.NotNull, O.DBType("TEXT"))

  def * = (key, value)
}

class ModelInfosModel(tag: Tag) extends Table[ModelInfo](tag, "MODEL_INFOS") {
  def modelName = column[String]("MODEL_NAME", O.NotNull, O.DBType("TEXT"))
  def fieldName = column[String]("FIELD_NAME", O.NotNull, O.DBType("TEXT"))
  def datatype = column[String]("DATATYPE", O.NotNull, O.DBType("TEXT"))
  def createForm = column[Boolean]("CREATE_FORM", O.NotNull)
  def createRequired = column[Boolean]("CREATE_REQUIRED", O.NotNull)
  def editForm = column[Boolean]("EDIT_FORM", O.NotNull)
  def editRequired = column[Boolean]("EDIT_REQUIRED", O.NotNull)

  def prompt = column[Option[String]]("PROMPT", O.DBType("TEXT"))
  def tooltip = column[Option[String]]("TOOLTIP", O.DBType("TEXT"))

  def pk = primaryKey("MODEL_INFOS_PK", (modelName, fieldName))

  def * = (modelName, fieldName, datatype, (createForm, createRequired), (editForm, editRequired), prompt, tooltip) <> (ModelInfo.tupled, ModelInfo.unapply)
}

class UsersModel(tag: Tag) extends Table[User](tag, "USERS") {
  def userId = column[String]("USER_ID", O.PrimaryKey, O.DBType("TEXT"))
  def providerId = column[String]("PROVIDER_ID", O.NotNull, O.DBType("TEXT"))
  def firstName = column[Option[String]]("FIRST_NAME", O.DBType("TEXT"))
  def lastName = column[Option[String]]("LAST_NAME", O.DBType("TEXT"))
  def email = column[Option[String]]("EMAIL", O.DBType("TEXT"))
  def hasher = column[String]("HASHER", O.NotNull, O.DBType("TEXT"))
  def password = column[String]("PASSWORD", O.NotNull, O.DBType("TEXT"))
  def salt = column[Option[String]]("SALT", O.DBType("TEXT"))

  def * = (providerId, userId, firstName, lastName, email, hasher, password, salt) <>
    (User.tupled, User.unapply)
}

class TenantsModel(tag: Tag) extends Table[Tenant](tag, "TENANTS") {
  def id = column[Int]("ID", O.PrimaryKey, O.AutoInc)
  def tradeName = column[String]("TRADE_NAME", O.NotNull, O.DBType("TEXT"))
  def address = column[String]("ADDRESS", O.NotNull, O.DBType("TEXT"))
  def contactPerson = column[String]("CONTACT_PERSON", O.NotNull, O.DBType("TEXT"))
  def contactNumber = column[String]("CONTACT_NUMBER", O.NotNull, O.DBType("TEXT"))
  def email = column[String]("EMAIL", O.NotNull, O.DBType("TEXT"))

  def area = column[Double]("AREA", O.NotNull)
  def rentalPeriod = column[String]("RENTAL_PERIOD", O.NotNull, O.DBType("TEXT"))
  def escalation = column[Double]("ESCALATION", O.NotNull)

  def cusaDefault = column[Option[Double]]("CUSA_DEFAULT")
  def waterMeterDefault = column[Option[String]]("WATER_METER_DEFAULT", O.DBType("TEXT"))
  def electricityMeterDefault = column[Option[String]]("ELECTRICITY_METER_DEFAULT", O.DBType("TEXT"))
  def baseRentDefault = column[Option[Double]]("BASE_RENT_DEFAULT")
  def standardMultiplierDefault = column[Option[Double]]("STANDARD_MULTIPLIER_DEFAULT")

  def * = (id, tradeName, address, contactPerson, contactNumber, email, area, rentalPeriod, escalation, cusaDefault, waterMeterDefault, electricityMeterDefault, baseRentDefault, standardMultiplierDefault) <>
    (Tenant.tupled, Tenant.unapply)

  def tradeNameIndex = index("IDX_TRADE_NAME", tradeName, unique = true)
}

class UserRolesModel(tag: Tag) extends Table[(String, String)](tag, "USER_ROLES") {
  def userId = column[String]("USERNAME", O.NotNull, O.DBType("TEXT"))
  def roleName = column[String]("ROLE_NAME", O.NotNull, O.DBType("TEXT"))

  def pk = primaryKey("USER_ROLES_PK", (userId, roleName))
  def user = foreignKey("USER_FK", userId, models.users)(_.userId, onDelete = ForeignKeyAction.Cascade)

  def * = (userId, roleName)
}

class DocumentsModel(tag: Tag) extends Table[Document](tag, "DOCUMENTS") {
  import models._
  def id = column[Int]("ID", O.PrimaryKey, O.AutoInc)
  def serialId = column[Option[SerialNumber]]("SERIAL_ID")
  def docType = column[String]("DOC_TYPE", O.NotNull, O.DBType("TEXT"))
  def mailbox = column[String]("MAILBOX", O.NotNull, O.DBType("TEXT"))
  def creator = column[String]("CREATOR", O.NotNull, O.DBType("TEXT"))
  def created = column[DateTime]("CREATED", O.NotNull)
  def forTenant = column[Int]("FOR_TENANT", O.NotNull)
  def year = column[Int]("YEAR", O.NotNull)
  def month = column[Int]("MONTH", O.NotNull)
  def isEditable = column[Boolean]("IS_EDITABLE", O.NotNull)
  def isPaid = column[Boolean]("IS_PAID", O.NotNull)
  def amountPaid = column[JsObject]("AMOUNT_PAID", O.NotNull)
  def body = column[JsObject]("BODY", O.NotNull)
  def comments = column[JsObject]("COMMENTS", O.NotNull)
  def assigned = column[Option[String]]("ASSIGNED", O.DBType("TEXT"))

  def lastAction = column[Option[Int]]("LAST_ACTION_ID")
  def preparedAction = column[Option[Int]]("PREPARED_ACTION_ID")

  def * = (id, serialId, docType, mailbox, creator, created, forTenant, year, month, isEditable, isPaid, amountPaid, body, comments, assigned, lastAction, preparedAction) <> (Document.tupled, Document.unapply)
}

class MailTokensModel(tag: Tag) extends Table[MailToken](tag, "MAIL_TOKENS") {
  def uuid = column[String]("UUID", O.PrimaryKey, O.DBType("TEXT"))
  def email = column[String]("EMAIL", O.NotNull, O.DBType("TEXT"))
  def creationTime = column[DateTime]("CREATION_TIME", O.NotNull)
  def expirationTime = column[DateTime]("EXPIRATION_TIME", O.NotNull)
  def isSignUp = column[Boolean]("IS_SIGN_UP", O.NotNull)

  def * = (uuid, email, creationTime, expirationTime, isSignUp) <>
    (MailToken.tupled, MailToken.unapply)
}

class InvitationsModel(tag: Tag) extends Table[InvitationInfo](tag, "INVITATIONS") {
  def email = column[String]("EMAIL", O.PrimaryKey, O.DBType("TEXT"))
  def isEncoder = column[Boolean]("IS_ENCODER", O.NotNull)
  def isAdmin = column[Boolean]("IS_ADMIN", O.NotNull)

  def * = (email, isEncoder, isAdmin) <>
    (InvitationInfo.tupled, InvitationInfo.unapply)
}

class ActionLogsModel(tag: Tag) extends Table[ActionLog](tag, "ACTION_LOGS") {
  def id = column[Int]("ID", O.PrimaryKey, O.AutoInc)
  def who = column[String]("WHO", O.DBType("TEXT"))
  def what = column[Int]("WHAT", O.NotNull)
  def when = column[DateTime]("WHEN", O.NotNull)
  def why = column[String]("WHY", O.NotNull, O.DBType("TEXT"))

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
