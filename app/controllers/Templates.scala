package controllers

import com.nooovle._
import org.locker47.json.play._
import play.api._
import play.api.libs.json._
import scala.slick.driver.H2Driver.simple._
import scala.util.{ Try, Success, Failure }
import securesocial.core.RuntimeEnvironment

class Templates(override implicit val env: RuntimeEnvironment[User])
  extends ApiController[User] {

  val logger = Logger("controllers.Templates")

  val templates: Seq[JsObject] = Seq(Templates.invoice1)

  def show(docType: String) = SecuredAction { implicit request =>
    templates find { template =>
      (template \ "docType").as[String] == docType
    } match {
      case Some(template) =>
        Ok {
          val link = routes.Templates.show(docType)
          HalJsObject.create(link.absoluteURL())
            .withLink("profile", "hoa:template")
            .asJsValue ++ template
        }
      case None => NotFound
    }
  }

  def list(offset: Int = 0, limit: Int = 10) = SecuredAction { implicit request =>
    val objs = templates map { t =>
      val docType = (t \ "docType").as[String]
      val link = routes.Templates.show(docType)
      val obj = HalJsObject.create(link.absoluteURL())
        .withLink("profile", "hoa:template")
        .withField("docType", t \ "docType")
        .withField("name", t \ "name")
      obj.asJsValue
    }

    val self = routes.Templates.list(offset, limit)
    val blank = HalJsObject.create(self.absoluteURL())
      .withCurie("hoa", Application.defaultCurie)
      .withLink("profile", "collection")
      .withLink("up", routes.Application.index().absoluteURL())
      .withField("count", templates.length)
      .withField("total", templates.length)
    val x = blank.withEmbedded(HalJsObject.empty.withField("item", objs))

    Ok(x.asJsValue)
  }
}

object Templates {
  // NOTE: The following is a hard-coded lookup of total values.
  // Either standardize the field in the document type(s) or have a
  // template registration system
  def extractTotal(d: Document): Either[String, Double] = {
    if (d.docType == "invoice-1") {
      if (d.body \ "summary" \ "id" == JsString("invoice_summary")) {

        d.body \ "summary" \ "value" match {
          case JsNumber(value) => Right(value.doubleValue)
          case _ => Left(s"Invoice summary value is not a number")
        }
      } else Left(s"Cannot find invoice_summary field in '${d.docType}'")
    } else Left(s"The document type '${d.docType}' is not registered")
  }

  def doubleOrZero(value: JsValue): Double = value match {
    case JsNumber(x) => x.doubleValue
    case JsNull => 0.0
    case _ =>
      Logger.warn(s"Supplied value '${value.toString}' is a valid number")
      0.0
  }

  def extractWith(extractor: Document => Either[String, Amounts])(doc: Document): Amounts =
    extractor(doc)
      .fold(
        warning => {
          Logger.warn(warning)
          Amounts.ZERO
        }, amount => amount)

  def extractPaid(d: Document): Amounts = extractWith({
    doc =>
      if (doc.docType == "invoice-1") {
        Right(
          Amounts(
            doubleOrZero(doc.amountPaid \ "previous"),
            doubleOrZero(doc.amountPaid \ "rent"),
            doubleOrZero(doc.amountPaid \ "electricity"),
            doubleOrZero(doc.amountPaid \ "water"),
            doubleOrZero(doc.amountPaid \ "cusa")))
      } else Left(s"The document type '${d.docType}' is not registered")
  })(d)

  def extractTotals(d: Document): Amounts = extractWith({
    doc =>
      if (doc.docType == "invoice-1") {
        val sectionTotals = (doc.body \\ "sectionTotal")

        def findSectionTotal(key: String): Double =
          sectionTotals
            .find(_ \ "id" == JsString(key))
            .map(_ \ "value")
            .map(doubleOrZero)
            .getOrElse(0.0)

        Right(
          Amounts(
            findSectionTotal("_previous_total"),
            findSectionTotal("_rent_total"),
            findSectionTotal("_electricity_total"),
            findSectionTotal("_water_total"),
            findSectionTotal("_cusa_total")))
      } else Left(s"The document type '${doc.docType}' is not registered")
  })(d)

  lazy val invoice1: JsObject = {
    val filename = "public/assets/templates/invoice-1.json"
    Play.current.resourceAsStream(filename) match {
      case Some(is) =>
        val str = scala.io.Source.fromInputStream(is).getLines().mkString
        val obj = Try(Json.parse(str)) map { json =>
          json match {
            case obj: JsObject => obj
            case _ =>
              Logger.warn("File '${filename}' is not a valid JSON root object")
              Json.obj()
          }
        }
        obj match {
          case Success(obj) => obj
          case Failure(t) =>
            Logger.warn("Error in reading template file", t)
            Json.obj()
        }
      case None =>
        Logger.warn(s"File '${filename}' was not found")
        Json.obj()
    }
  }
}
