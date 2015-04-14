package controllers

import com.nooovle._
import com.nooovle.slick.ConnectionFactory
import com.github.tototoshi.slick.H2JodaSupport
import com.nooovle.slick.models._
import org.joda.time.YearMonth
import org.locker47.json.play._
import play.api._
import play.api.libs.json._
import play.api.mvc.{ Action, RequestHeader, Result }
import scala.slick.driver.PostgresDriver.simple._
import scala.util.{ Try, Success, Failure }
import securesocial.core._

class Reports(override implicit val env: RuntimeEnvironment[User])
    extends ApiController[User] {

  def show(year: Option[Int], month: Option[Int]) = SecuredAction { implicit request =>
    (year, month) match {
      case (None, _) => listYears()
      case (Some(_year), None) => listMonths(_year)
      case (Some(_year), Some(_month)) =>
        val docs: List[Document] = ConnectionFactory.connect withSession { implicit session =>
          val query = documents
            .filter(d => d.year === _year)
            .filter(d => d.month === _month)
            .filter(d => d.mailbox inSetBind Mailbox.getSubboxes(Mailbox.delivered.name))
          query.list
        }

        val previous: Amounts = docs.map(doc => Templates.extractSection(doc, "previous"))
          .foldLeft(Amounts.Zero)(_ + _)
        val rent = docs.map(doc => Templates.extractSection(doc, "rent"))
          .foldLeft(Amounts.Zero)(_ + _)
        val electricity = docs.map(doc => Templates.extractSection(doc, "electricity"))
          .foldLeft(Amounts.Zero)(_ + _)
        val water = docs.map(doc => Templates.extractSection(doc, "water"))
          .foldLeft(Amounts.Zero)(_ + _)
        val cusa = docs.map(doc => Templates.extractSection(doc, "cusa"))
          .foldLeft(Amounts.Zero)(_ + _)

        val isPaid: Boolean =
          List(previous, rent, electricity, water, cusa).foldLeft(true)(_ && _.isPaid)

        def expandDate(ym: YearMonth): JsObject =
          JsObject(Seq(
            "name" -> JsString(ym.monthOfYear.getAsText),
            "month" -> JsNumber(ym.getMonthOfYear),
            "year" -> JsNumber(ym.getYear)
          ))

        val self = routes.Reports.show(year, month)
        val forMonth = new YearMonth(_year, _month)
        val generationTime = YearMonth.now
        val obj = HalJsObject.create(self.absoluteURL())
          .withCurie("hoa", Application.defaultCurie)
          .withLink("profile", "hoa:report")
          .withLink("hoa:user", routes.Users.show(request.user.userId).absoluteURL(),
            Some("Generated by"))
          .withField("forMonth", expandDate(forMonth))
          .withField("generated", expandDate(generationTime))
          .withField("count", docs.size)
          .withField(
            "amounts",
            HalJsObject.empty
              .withField("isPaid", JsBoolean(isPaid))
              .withField("sections", JsArray(List(
                JsObject(Seq(
                  "name" -> JsString("previous"),
                  "amounts" -> previous.asJsObject
                )),
                JsObject(Seq(
                  "name" -> JsString("rent"),
                  "amounts" -> rent.asJsObject
                )),
                JsObject(Seq(
                  "name" -> JsString("electricity"),
                  "amounts" -> electricity.asJsObject
                )),
                JsObject(Seq(
                  "name" -> JsString("water"),
                  "amounts" -> water.asJsObject
                )),
                JsObject(Seq(
                  "name" -> JsString("cusa"),
                  "amounts" -> cusa.asJsObject
                ))
              )))
              .asJsValue
          )
        Ok(obj.asJsValue)
    }
  }

  def listYears()(implicit request: RequestHeader): Result = {
    val years = ConnectionFactory.connect withSession { implicit session =>
      documents.map(_.year).list.distinct.sorted(Ordering.Int.reverse)
    }

    val links: List[JsObject] = years map { year =>
      HalJsObject.create(routes.Reports.show(Some(year)).absoluteURL())
        .withField("title", s"Reports for ${year}")
        .withField("year", year)
        .asJsValue
    }

    val self = routes.Reports.show().absoluteURL()
    val obj = HalJsObject.create(self)
      .withLink("profile", "hoa:reports")
      .withLink("up", routes.Application.index.absoluteURL())
      .withField("total", links.size)
      .withEmbedded(HalJsObject.empty
        .withField("items", JsArray(links)))

    Ok(obj.asJsValue)
  }

  def listMonths(year: Int)(implicit request: RequestHeader): Result = {
    val yearMonths = ConnectionFactory.connect withSession { implicit session =>
      documents.filter(_.year === year).map(d => (d.year, d.month)).list.distinct
    }

    val links: List[JsObject] = yearMonths map {
      case (year, month) =>
        val ym = new YearMonth(year, month)
        HalJsObject.create(routes.Reports.show(Some(year), Some(month)).absoluteURL())
          .withField("title", s"Reports for ${ym.monthOfYear.getAsText()} ${year}")
          .withField("name", ym.monthOfYear.getAsText)
          .withField("month", ym.getMonthOfYear)
          .withField("year", ym.getYear)
          .asJsValue
    }

    val self = routes.Reports.show().absoluteURL()
    val obj = HalJsObject.create(self)
      .withLink("profile", "hoa:reports")
      .withLink("up", routes.Reports.show().absoluteURL())
      .withField("total", links.size)
      .withEmbedded(HalJsObject.empty
        .withField("items", JsArray(links)))

    Ok(obj.asJsValue)

  }
}
