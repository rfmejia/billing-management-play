package controllers

import com.nooovle._
import com.nooovle.slick.ConnectionFactory
import com.nooovle.slick.models._
import org.joda.time.DateTime
import org.locker47.json.play._
import play.api._
import play.api.libs.json._
import play.api.mvc.{ Action, Controller }
import scala.slick.driver.H2Driver.simple._

object TestEnvironment extends Controller {

  def setup() = Action { implicit request =>
    ConnectionFactory.connect withSession { implicit session =>
      buildTables

      insertModelInfos
      insertUserData
      insertTenantData
      insertInviteData

      import play.api.Play.current
      val ds = play.api.db.DB.getDataSource()
      Ok("Created test session in " + ds.toString)
    }
  }

  def insertModelInfos(implicit session: Session) = {
    Tenant.modelInfo foreach (modelInfo.insertOrUpdate(_))
    User.modelInfo foreach (modelInfo.insertOrUpdate(_))
    Invite.modelInfo foreach (modelInfo.insertOrUpdate(_))
  }

  def insertTenantData(implicit session: Session) = {
    val data = Seq(
      Tenant("Beast Burgers", "Office address 1", "John Doe", "987-4321",
        "jdoe@email.com"),
      Tenant("Salcedo Tools & Supplies, Inc.", "Office address 1", "John Doe",
        "987-4321", "jdoe@email.com"),
      Tenant("Jumpin' Juicers", "Office address 2", "Alex Gomez", "987-4321",
        "agomez@email.com"),
      Tenant("Accolade Trading Corp.", "Office address 3", "Issa Santos",
        "987-4321", "isantos@email.com"))
    data foreach (tenants.insertOrUpdate(_))
  }

  def insertUserData(implicit session: Session) = {
    val data = Seq(
      (User("admin", "techsupport@nooovle.com", "a1b2c3d4f5".getBytes,
        "Administrator", ""), Set("administrator")),
      (User("testuser1", "testuser1@email.com", "testpass1".getBytes,
        "Julius", "Amador"), Set("encoder")))
    data foreach (d => User.insertWithRoles(d._1, d._2))
  }

  def insertInviteData(implicit session: Session) = {
    val date = DateTime.parse("2014-11-30")
    val data = Seq(
      (Invite("testuser2", "testuser2@email.com", date), Set("encoder", "checker")),
      (Invite("testuser3", "testuser3@email.com", date), Set("approver")))
    data foreach (d => Invite.insertWithRoles(d._1, d._2))
  }

  def fail = Action {
    throw new IllegalStateException("Raised an error")
    Ok // Never reached
  }
}
