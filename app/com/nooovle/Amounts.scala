package com.nooovle

import play.api.libs.json._

case class Amounts(total: Double, paid: Double) {
  val unpaid: Double = total - paid
  val isPaid: Boolean = unpaid == 0

  def +(that: Amounts) = Amounts(
    this.total + that.total,
    this.paid + that.paid
  )

  def -(that: Amounts) = Amounts(
    this.total - that.total,
    this.paid - that.paid
  )

  val asJsObject = JsObject(Seq(
    "total" -> JsNumber(total),
    "paid" -> JsNumber(paid),
    "unpaid" -> JsNumber(unpaid),
    "isPaid" -> JsBoolean(isPaid)
  ))
}

object Amounts {
  val Zero = Amounts(0.0, 0.0)
}

case class MonthlyAmounts(rent: Amounts, electricity: Amounts, water: Amounts, cusa: Amounts) {
  val isPaid = List(rent, electricity, water, cusa).foldLeft(true)(_ && _.isPaid)
}
