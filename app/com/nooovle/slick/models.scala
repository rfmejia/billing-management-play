package com.nooovle.slick

import com.github.tototoshi.slick.H2JodaSupport._
import com.nooovle._
import java.util.UUID
import org.joda.time.DateTime
import play.api.libs.json._
import scala.slick.driver.H2Driver.simple._
import scala.slick.jdbc.meta.MTable
import scala.util.{ Try, Success }
import securesocial.core.{ IdentityId, PasswordInfo }

object models {
  val modelInfo = TableQuery[ModelInfosModel]
  val roles = TableQuery[RolesModel]
  val settings = TableQuery[SettingsModel]
  val tenants = TableQuery[TenantsModel]
  val users = TableQuery[UsersModel]
  val documents = TableQuery[DocumentsModel]
  val userRoles = TableQuery[UserRolesModel]

  /**
   *  Builds tables one by one if they do not exist.
   *  !Note that this does not upgrade a table schema if they are changed.
   */
  def buildTables(implicit session: Session): List[Try[String]] = {
    val tables = List(modelInfo, roles, settings, tenants, users, documents,
      userRoles)
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

  implicit val uuidToString = MappedColumnType.base[UUID, String](_.toString, UUID.fromString(_))
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
  def editForm = column[Boolean]("EDIT_FORM", O.NotNull)
  def required = column[Boolean]("REQUIRED", O.NotNull)

  def prompt = column[Option[String]]("PROMPT")
  def tooltip = column[Option[String]]("TOOLTIP")

  def pk = primaryKey("PK", (modelName, fieldName))

  def * = (modelName, fieldName, datatype, createForm, editForm, required,
    prompt, tooltip) <> (ModelInfo.tupled, ModelInfo.unapply)
}

class UsersModel(tag: Tag) extends Table[User](tag, "USERS") {
  def userId = column[String]("USER_ID", O.NotNull)
  def providerId = column[String]("PROVIDER_ID", O.NotNull)
  def firstName = column[String]("FIRST_NAME", O.NotNull)
  def lastName = column[String]("LAST_NAME", O.NotNull)
  def email = column[Option[String]]("EMAIL")
  def hasher = column[String]("HASHER", O.NotNull)
  def password = column[String]("PASSWORD", O.NotNull)
  def salt = column[Option[String]]("SALT")

  def pk = primaryKey("PK", (userId, providerId))

  def * = (userId, providerId, firstName, lastName, email, hasher, password, salt) <>
    (User.tupled, User.unapply)
}

class TenantsModel(tag: Tag) extends Table[Tenant](tag, "TENANTS") {
  def id = column[Int]("ID", O.PrimaryKey, O.AutoInc)
  def tradeName = column[String]("TRADE_NAME", O.NotNull)
  def address = column[String]("ADDRESS", O.NotNull)
  def contactPerson = column[String]("CONTACT_PERSON", O.NotNull)
  def contactNumber = column[String]("CONTACT_NUMBER", O.NotNull)
  def email = column[String]("EMAIL", O.NotNull)

  def * = (id, tradeName, address, contactPerson, contactNumber, email) <>
    (Tenant.tupled, Tenant.unapply)
}

class RolesModel(tag: Tag) extends Table[String](tag, "ROLES") {
  def name = column[String]("NAME", O.PrimaryKey)

  def * = (name)
}

class UserRolesModel(tag: Tag) extends Table[(String, String)](tag, "USER_ROLES") {
  def username = column[String]("USERNAME", O.NotNull)
  def roleName = column[String]("ROLE_NAME", O.NotNull)

  def pk = primaryKey("PK", (username, roleName))
  // def user = foreignKey("USER_FK", username, models.users)(_.username)
  def role = foreignKey("ROLE_FK", roleName, models.roles)(_.name)

  def * = (username, roleName)
}

class DocumentsModel(tag: Tag) extends Table[Document](tag, "DOCUMENTS") {
  import models.{ jsToString, uuidToString }
  def id = column[UUID]("ID", O.PrimaryKey)
  def serialId = column[Option[String]]("SERIAL_ID")
  def title = column[String]("TITLE", O.NotNull)
  def docType = column[String]("DOC_TYPE", O.NotNull)
  def mailbox = column[String]("MAILBOX", O.NotNull)
  def created = column[DateTime]("CREATED", O.NotNull)
  def creator = column[String]("CREATOR", O.NotNull)
  def assigned = column[Option[String]]("ASSIGNED")
  def body = column[JsObject]("BODY", O.NotNull)

  // def _creator = foreignKey("CREATOR_FK", creator, models.users)(_.username)
  // def _assigned = foreignKey("ASSIGNED_FK", assigned, models.users)(_.username)

  def * = (id, serialId, title, docType, mailbox, created, creator, assigned, body) <>
    (Document.tupled, Document.unapply)
}

// class LogEntriesModel(tag: Tag) extends Table[LogEntry](tag, "LOG_ENTRIES") {}
