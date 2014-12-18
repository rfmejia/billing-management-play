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
      insertModelInfos
      insertUserData
      insertTenantData

      import play.api.Play.current
      val ds = play.api.db.DB.getDataSource()
      Ok("Created test session in " + ds.toString)
    }
  }

  def insertModelInfos(implicit session: Session) = {
    Tenant.modelInfo foreach (modelInfo.insertOrUpdate(_))
    User.modelInfo foreach (modelInfo.insertOrUpdate(_))
    Document.modelInfo foreach (modelInfo.insertOrUpdate(_))
  }

  def insertTenantData(implicit session: Session) = {
    (for (t <- tenants) yield t).delete
    val data = Seq(
      Tenant("Beast Burgers", "Unit 4D Breakpoint Tower, 458 Emerald Ave., Pasig",
        "Ronald Macaraig", "987-4321", "r-mac@email.com"),
      Tenant("Salcedo Tools & Supplies, Inc.", "6153 South Super Highway, Makati",
        "Jimmy Galapago", "987-4321", "jimmyg@email.com"),
      Tenant("Jumpin' Juicers", "5 Kennedy Drive, Pleasant View Subd., Tandang Sora, Quezon City",
        "Alex Gomez", "987-4321", "agomez@email.com"),
      Tenant("Accolade Trading Corp.", "14 Zaragoza St. San Lorenzo Village, Makati",
        "Issa Santos", "987-4321", "isantos@email.com"))
    data foreach (tenants.insertOrUpdate(_))
  }

  def insertUserData(implicit session: Session) = {
    (for (u <- users) yield u).delete
    val data = Seq(
      (User("admin", "techsupport@nooovle.com", "a1b2c3d4f5".getBytes,
        "System", "Administrator"), Set("administrator")),
      (User("testuser1", "testuser1@email.com", "testpass1".getBytes,
        "Julius", "Amador"), Set("encoder", "checker")))
    data foreach (d => User.insertWithRoles(d._1, d._2))
  }

  def fail = Action {
    throw new IllegalStateException("Raised an error")
    Ok // Never reached
  }
}
