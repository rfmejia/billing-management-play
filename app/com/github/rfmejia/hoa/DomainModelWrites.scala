package com.github.rfmejia.hoa

import org.joda.time.{ DateTime, YearMonth }
import play.api.libs.json._
import play.api.libs.functional.syntax._

object DomainModelWrites {

  implicit val dateTimeWrites: Writes[DateTime] = Writes {
    dt => JsString(dt.toString)
  }

  implicit val amountWrites: Writes[Amounts] = Writes {
    amount =>
      Json.obj(
        "total" -> amount.total,
        "paid" -> amount.paid,
        "unpaid" -> amount.unpaid,
        "isPaid" -> amount.isPaid
      )
  }

  implicit val monthlyAmountWrites: Writes[MonthlyAmount] = Writes {
    month =>
      month match {
        case m: CurrentMonth =>
          Json.obj(
            "isPaid" -> m.isPaid,
            "sections" -> Json.arr(
              Json.obj(
                "name" -> "rent",
                "title" -> "Rent",
                "amounts" -> m.rent
              ),
              Json.obj(
                "name" -> "electricity",
                "title" -> "Electricity",
                "amounts" -> m.electricity
              ),
              Json.obj(
                "name" -> "water",
                "title" -> "Water",
                "amounts" -> m.water
              ),
              Json.obj(
                "name" -> "cusa",
                "title" -> "CUSA",
                "amounts" -> m.cusa
              )
            )
          )
        case m: PreviousMonth =>
          Json.obj(
            "isPaid" -> m.isPaid,
            "sections" -> Json.arr(
              Json.obj(
                "name" -> "rent",
                "title" -> "Rent",
                "amounts" -> m.rent
              ),
              Json.obj(
                "name" -> "electricity",
                "title" -> "Electricity",
                "amounts" -> m.electricity
              ),
              Json.obj(
                "name" -> "water",
                "title" -> "Water",
                "amounts" -> m.water
              ),
              Json.obj(
                "name" -> "cusa",
                "title" -> "CUSA",
                "amounts" -> m.cusa
              ),
              Json.obj(
                "name" -> "withholding_tax",
                "title" -> "Withholding Tax",
                "amounts" -> m.withholdingTax
              ),
              Json.obj(
                "name" -> "previous_charges",
                "title" -> "Previous Charges",
                "amounts" -> m.previousCharges
              )
            )
          )
      }
  }

  implicit val roleWrites: Writes[Role] = Writes {
    role =>
      Json.obj(
        "id" -> role.id,
        "name" -> role.name
      )
  }

  implicit val userWrites: Writes[User] = Writes {
    user =>
      Json.obj(
        "userId" -> user.userId,
        "email" -> user.email,
        "firstName" -> user.firstName,
        "lastName" -> user.lastName,
        "fullName" -> user.fullName,
        "roles" -> User.findRoles(user.userId).toList
      )
  }

  implicit val tenantWrites: Writes[Tenant] = Writes {
    tenant =>
      Json.obj(
        "id" -> tenant.id,
        "tradeName" -> tenant.tradeName,
        "address" -> tenant.address,
        "contactPerson" -> tenant.contactPerson,
        "contactNumber" -> tenant.contactNumber,
        "email" -> tenant.email,
        "area" -> tenant.area,
        "rentalPeriod" -> tenant.rentalPeriod,
        "escalation" -> tenant.escalation,
        "cusaDefault" -> tenant.cusaDefault,
        "waterMeterDefault" -> tenant.waterMeterDefault,
        "electricityMeterDefault" -> tenant.electricityMeterDefault,
        "baseRentDefault" -> tenant.baseRentDefault,
        "standardMultiplierDefault" -> tenant.standardMultiplierDefault
      )
  }

  implicit val actionWrites: Writes[ActionLog] = Writes {
    log =>
      Json.obj(
        "id" -> log.id,
        "who" -> log.who,
        "what" -> log.what,
        "when" -> log.when.toString,
        "why" -> log.why
      )
  }

  implicit val mailboxWrites: Writes[Mailbox] = Writes {
    mailbox =>
      Json.obj(
        "name" -> mailbox.name,
        "title" -> mailbox.title
      )
  }

  implicit val serialNumberWrites: Writes[SerialNumber] = Writes {
    sn => JsString(sn.toString)
  }

  implicit val documentWrites: Writes[Document] = Writes {
    d =>
      val assigned = (d.assigned flatMap (User.findById))
      val forMonth = (new YearMonth(d.year, d.month)).toString

      val lastAction = d.lastAction flatMap (ActionLog.findById)
      val preparedAction = d.preparedAction flatMap (ActionLog.findById)

      Json.obj(
        "id" -> d.id,
        "serialId" -> d.serialId,
        "docType" -> d.docType,
        "mailbox" -> d.mailbox,
        "creator" -> d.creator,
        "created" -> d.created,
        "forTenant" -> Tenant.findById(d.forTenant),
        "forMonth" -> forMonth,
        "year" -> d.year,
        "month" -> d.month,
        "isEditable" -> d.isEditable,
        "isPaid" -> d.isPaid,
        "amountPaid" -> d.amountPaid,
        "body" -> d.body,
        "comments" -> d.comments,
        "lastAction" -> lastAction,
        "preparedAction" -> preparedAction,
        "assigned" -> assigned,
        "hoa:nextBox" -> Mailbox.next(d.mailbox),
        "hoa:prevBox" -> Mailbox.prev(d.mailbox)
      )
  }
}
