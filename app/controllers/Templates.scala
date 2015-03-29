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
          Amounts.Zero
        }, amount => amount)

  def extractSection(d: Document, s: String): Amounts = extractWith({
    doc =>
      if (doc.docType == "invoice-1") {
        val total: Double = {
          val fieldName = s"_${s}_total"

          (doc.body \\ "sectionTotal")
            .find(_ \ "id" == JsString(fieldName))
            .map(_ \ "value")
            .map(doubleOrZero)
            .getOrElse(0.0)
        }
        val paid: Double = doubleOrZero(doc.amountPaid \ s)
        Right(Amounts(total, paid))
      } else Left(s"The document type '${doc.docType}' is not registered")
  })(d)

  def extractDefaultAmounts(doc: Document): (Amounts, Amounts, Amounts, Amounts, Amounts, Boolean) = {
    val previous = Templates.extractSection(doc, "previous")
    val rent = Templates.extractSection(doc, "rent")
    val electricity = Templates.extractSection(doc, "electricity")
    val water = Templates.extractSection(doc, "water")
    val cusa = Templates.extractSection(doc, "cusa")

    val isPaid: Boolean =
      List(previous, rent, electricity, water, cusa)
        .foldLeft(true)(_ && _.isPaid)

    (previous, rent, electricity, water, cusa, isPaid)
  }

  lazy val invoice1: JsObject = {
    val filename = "public/assets/templates/invoice-1.json"
    Play.current.resourceAsStream(filename) match {
      case Some(is) =>
        val str = scala.io.Source.fromInputStream(is).getLines().mkString
        val obj = Try(Json.parse(str)) map { json =>
          json match {
            case obj: JsObject => obj
            case _ =>
              Logger.warn(s"File '${filename}' is not a valid JSON root object")
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
