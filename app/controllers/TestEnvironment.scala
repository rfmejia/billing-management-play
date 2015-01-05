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
      insertTenantData
      insertDocumentData

      import play.api.Play.current
      val ds = play.api.db.DB.getDataSource()
      Ok("Created test session in " + ds.toString)
    }
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

  def insertDocumentData(implicit session: Session) = {
    (for (d <- documents) yield d).delete
    Tenant.findByTradeName("Beast Burgers").map { tenant =>
      Document.insert("Document 1", "statement-of-account-1", tenant.id,
        DateTime.parse("2015-01-01"), Json.obj())
    }
    Tenant.findByTradeName("Jumpin' Juicers").map { tenant =>
      Document.insert("Document 2", "statement-of-account-1", tenant.id,
        DateTime.parse("2015-02-01"), Json.obj())
    }
    Tenant.findByTradeName("Beast Burgers").map { tenant =>
      Document.insert("Document 3", "statement-of-account-1", tenant.id,
        DateTime.parse("2015-01-01"), Json.obj())
    }
  }

  def fail = Action {
    throw new IllegalStateException("Raised an error")
    Ok // Never reached
  }
}
