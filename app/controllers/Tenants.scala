package controllers

import com.nooovle._
import com.nooovle.slick.models.{ modelTemplates, tenants }
import com.nooovle.slick.ConnectionFactory
import org.locker47.json.play._
import play.api.libs.json._
import play.api._
import play.api.mvc.{ Action, Controller }
import play.api.mvc.BodyParsers._
import scala.slick.driver.H2Driver.simple._
import scala.util.{ Try, Success, Failure }
import securesocial.core.RuntimeEnvironment

class Tenants(override implicit val env: RuntimeEnvironment[User])
  extends ApiController[User] {

  lazy val createForm: JsObject = getCreateTemplate("TENANTS")
  lazy val editForm: JsObject = getEditTemplate("TENANTS")

  def show(id: Int) = SecuredAction { implicit request =>
    Tenant.findById(id) match {
      case Some(t) =>
        val self = routes.Tenants.show(id)
        val obj = HalJsObject.create(self.absoluteURL())
          .withCurie("hoa", Application.defaultCurie)
          .withLink("profile", "hoa:tenant")
          .withLink("collection", routes.Tenants.list().absoluteURL())
          .withField("_template", editForm)
          .withLink("edit", routes.Tenants.edit(id).absoluteURL())
          .withField("id", t.id)
          .withField("tradeName", t.tradeName)
          .withField("address", t.address)
          .withField("contactPerson", t.contactPerson)
          .withField("contactNumber", t.contactNumber)
          .withField("email", t.email)
          .withField("area", t.area)
          .withField("size", t.size)
          .withField("rentalPeriod", t.rentalPeriod)
          .withField("basicRentalRate", t.basicRentalRate)
          .withField("escalation", t.escalation)
        Ok(obj.asJsValue)
      case None => NotFound
    }
  }

  def list(offset: Int = 0, limit: Int = 10) = SecuredAction { implicit request =>
    val (ts, total) = ConnectionFactory.connect withSession { implicit session =>
      val query = tenants.drop(offset).take(limit).sortBy(_.tradeName)
      (query.list, tenants.length.run)
    }

    val objs = ts map { t =>
      val link = routes.Tenants.show(t.id)
      val obj = HalJsObject.create(link.absoluteURL())
        .withLink("profile", "hoa:tenant")
        .withField("id", t.id)
        .withField("tradeName", t.tradeName)
      obj.asJsValue
    }

    val self = routes.Tenants.list(offset, limit)
    val blank = HalJsObject.create(self.absoluteURL())
      .withCurie("hoa", Application.defaultCurie)
      .withLink("profile", "collection")
      .withLink("up", routes.Application.index().absoluteURL())
      .withLink("create", routes.Tenants.create().absoluteURL())
      .withField("_template", createForm)
      .withField("count", ts.length)
      .withField("total", total)

    val x = blank.withEmbedded(HalJsObject.empty.withField("item", objs))
    val y = listNavLinks(self.absoluteURL(), offset, limit, total).foldLeft(x) {
      (obj, pair) => obj.withLink(pair._1, pair._2.href)
    }

    Ok(y.asJsValue)
  }

  def create() = SecuredAction(parse.json) { implicit request =>
    val json = request.body
    ((json \ "tradeName").asOpt[String],
      (json \ "address").asOpt[String],
      (json \ "contactPerson").asOpt[String],
      (json \ "contactNumber").asOpt[String],
      (json \ "email").asOpt[String],
      (json \ "area").asOpt[String],
      (json \ "size").asOpt[String],
      (json \ "rentalPeriod").asOpt[String],
      (json \ "basicRentalRate").asOpt[String],
      (json \ "escalation").asOpt[String]) match {
        case (Some(tradeName), Some(address), Some(contactPerson), Some(contactNumber), Some(email), Some(area), Some(size), Some(rentalPeriod), Some(basicRentalRate), Some(escalation)) =>
          val newTenant = Tenant(tradeName, address, contactPerson, contactNumber, email, area, size, rentalPeriod, basicRentalRate, escalation)
          val result = ConnectionFactory.connect withSession { implicit session =>
            Try {
              // Returns ID of newly inserted tenant
              (tenants returning tenants.map(_.id)) += newTenant
            }
          }
          result match {
            case Success(id) =>
              val link = routes.Tenants.show(id).absoluteURL()
              Created.withHeaders("Location" -> link)
            case Failure(err) => InternalServerError(err.getMessage)
          }
        case _ => BadRequest("Some required values are missing. Please check your request.")
      }
  }

  def edit(id: Int) = SecuredAction(parse.json) { implicit request =>
    Tenant.findById(id) match {
      case None => NotFound
      case Some(tenant) =>
        val json = request.body
        ((json \ "tradeName").asOpt[String],
          (json \ "address").asOpt[String],
          (json \ "contactPerson").asOpt[String],
          (json \ "contactNumber").asOpt[String],
          (json \ "email").asOpt[String],
          (json \ "area").asOpt[String],
          (json \ "size").asOpt[String],
          (json \ "rentalPeriod").asOpt[String],
          (json \ "basicRentalRate").asOpt[String],
          (json \ "escalation").asOpt[String]) match {
            case (Some(tradeName), Some(address), Some(contactPerson), Some(contactNumber), Some(email), Some(area), Some(size), Some(rentalPeriod), Some(basicRentalRate), Some(escalation)) =>
              val result = ConnectionFactory.connect withSession { implicit session =>
                Try {
                  val tenant = for (t <- tenants if t.id === id)
                    yield (t.tradeName, t.address, t.contactPerson, t.contactNumber, t.email,
                      t.area, t.size, t.rentalPeriod, t.basicRentalRate, t.escalation)
                  tenant.update(tradeName, address, contactPerson, contactNumber, email, area, size, rentalPeriod, basicRentalRate, escalation)
                }
              }
              result match {
                case Success(id) => NoContent
                case Failure(err) => InternalServerError(err.getMessage)
              }
            case _ => BadRequest("Some required values are missing. Please check your request.")
          }
    }
  }

  def delete(id: Int) = SecuredAction(WithRoles(Roles.Admin.id)) { implicit request =>
    val deleted = ConnectionFactory.connect withSession { implicit session =>
      val query = for (t <- tenants if t.id === id) yield t
      query.delete
    }
    if (deleted == 0) NotFound
    else Ok
  }
}
