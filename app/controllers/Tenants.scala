package controllers

import com.nooovle._
import com.nooovle.DomainModelWrites.tenantWrites
import com.nooovle.slick.models.{ modelTemplates, tenants }
import com.nooovle.slick.ConnectionFactory
import org.locker47.json.play._
import play.api.libs.json._
import play.api._
import play.api.mvc.{ Action, Controller }
import play.api.mvc.BodyParsers._
import scala.slick.driver.PostgresDriver.simple._
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
        val obj = HalJsObject.from(Json.toJson(t))
          .self(self.absoluteURL())
          .withCurie("hoa", Application.defaultCurie)
          .withLink("profile", "hoa:tenant")
          .withLink("collection", routes.Tenants.list().absoluteURL())
          .withField("_template", editForm)
          .withLink("edit", routes.Tenants.edit(id).absoluteURL())
        Ok(obj.asJsValue)
      case None => NotFound
    }
  }

  def list(offset: Int = 0, limit: Int = 10, startsWith: Option[String]) = SecuredAction { implicit request =>
    val (ts, total): (List[Tenant], Int) =
      ConnectionFactory.connect withSession { implicit session =>
        val ts = startsWith map {
          s => tenants.filter(t => t.tradeName.toLowerCase.startsWith(s.toLowerCase))
        } getOrElse tenants

        val query = ts.sortBy(_.tradeName).drop(offset).take(limit)
        (query.list, ts.length.run)
      }

    val objs = ts map { t =>
      val link = routes.Tenants.show(t.id)
      val obj = HalJsObject.from(Json.toJson(t))
        .self(link.absoluteURL())
        .withLink("profile", "hoa:tenant")
        .withField("id", t.id)
        .withField("tradeName", t.tradeName)
      obj.asJsValue
    }

    val self = routes.Tenants.list(offset, limit)
    val blank = HalJsObject.self(self.absoluteURL())
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
    (
      (json \ "tradeName").asOpt[String],
      (json \ "address").asOpt[String],
      (json \ "contactPerson").asOpt[String],
      (json \ "contactNumber").asOpt[String],
      (json \ "email").asOpt[String],
      (json \ "area").asOpt[Double],
      (json \ "rentalPeriod").asOpt[String],
      (json \ "escalation").asOpt[Double],
      (json \ "cusaDefault").asOpt[Double],
      (json \ "waterMeterDefault").asOpt[String],
      (json \ "electricityMeterDefault").asOpt[String],
      (json \ "baseRentDefault").asOpt[Double],
      (json \ "standardMultiplierDefault").asOpt[Double]
    ) match {
        case (Some(tradeName), Some(address), Some(contactPerson),
          Some(contactNumber), Some(email), Some(area),
          Some(rentalPeriod), Some(escalation),
          Some(cusaDefault), Some(waterMeterDefault), Some(electricityMeterDefault),
          Some(baseRentDefault), Some(standardMultiplierDefault)) =>
          val result = ConnectionFactory.connect withSession { implicit session =>
            // Trade name must be unique
            if (Tenant.findByTradeName(tradeName).isDefined) {
              Failure(new IllegalArgumentException(s"Tenant with name '${tradeName}' already exists"))
            } else {
              Tenant.insert(tradeName, address, contactPerson, contactNumber, email,
                area, rentalPeriod, escalation, cusaDefault,
                waterMeterDefault, electricityMeterDefault, baseRentDefault,
                standardMultiplierDefault)
            }
          }
          result match {
            case Success(tenant) =>
              val link = routes.Tenants.show(tenant.id).absoluteURL()
              Created.withHeaders("Location" -> link)
            case Failure(err) =>
              err match {
                case err: IllegalArgumentException => BadRequest(err.getMessage)
                case _ => 
                  err.printStackTrace()
                  InternalServerError(err.getMessage)
              }
          }
        case _ => BadRequest("Some required values are missing. Please check your request.")
      }
  }

  def edit(id: Int) = SecuredAction(parse.json) { implicit request =>
    Tenant.findById(id) match {
      case None => NotFound
      case Some(existingTenant) =>
        val json = request.body
        (
          (json \ "tradeName").asOpt[String],
          (json \ "address").asOpt[String],
          (json \ "contactPerson").asOpt[String],
          (json \ "contactNumber").asOpt[String],
          (json \ "email").asOpt[String],
          (json \ "area").asOpt[Double],
          (json \ "rentalPeriod").asOpt[String],
          (json \ "escalation").asOpt[Double],
          (json \ "cusaDefault").asOpt[Double],
          (json \ "waterMeterDefault").asOpt[String],
          (json \ "electricityMeterDefault").asOpt[String],
          (json \ "baseRentDefault").asOpt[Double],
          (json \ "standardMultiplierDefault").asOpt[Double]
        ) match {
            case (Some(tradeName), Some(address), Some(contactPerson),
              Some(contactNumber), Some(email), Some(area),
              Some(rentalPeriod), Some(escalation),
              cusaDefaultOpt, waterMeterDefaultOpt, electricityMeterDefaultOpt,
              baseRentDefaultOpt, standardMultiplierDefaultOpt) =>
              val result = ConnectionFactory.connect withSession { implicit session =>
                val newTenant =
                  existingTenant.copy(
                    tradeName = tradeName,
                    address = address,
                    contactPerson = contactPerson,
                    contactNumber = contactNumber,
                    email = email,
                    area = area,
                    rentalPeriod = rentalPeriod,
                    escalation = escalation,
                    cusaDefault = cusaDefaultOpt orElse existingTenant.cusaDefault,
                    waterMeterDefault = waterMeterDefaultOpt orElse existingTenant.waterMeterDefault,
                    electricityMeterDefault = electricityMeterDefaultOpt orElse existingTenant.electricityMeterDefault,
                    baseRentDefault = baseRentDefaultOpt orElse existingTenant.baseRentDefault,
                    standardMultiplierDefault = standardMultiplierDefaultOpt orElse existingTenant.standardMultiplierDefault
                  )
                Tenant.update(newTenant)
              }
              result match {
                case Success(id) => NoContent
                case Failure(err) => InternalServerError(err.getMessage)
              }
            case _ => BadRequest("Some required values are missing. Please check your request.")
          }
    }
  }

  def delete(id: Int) = SecuredAction(WithRoles(Roles.Admin)) { implicit request =>
    val deleted = ConnectionFactory.connect withSession { implicit session =>
      val query = for (t <- tenants if t.id === id) yield t
      query.delete
    }
    if (deleted == 0) NotFound
    else Ok
  }
}
