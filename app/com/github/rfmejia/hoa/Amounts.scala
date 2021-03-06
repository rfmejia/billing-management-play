package com.github.rfmejia.hoa

import play.api.libs.json._

case class Amounts(total: Double, paid: Double) {
  val unpaid: Double = total - paid
  val isPaid: Boolean = unpaid == 0.0

  def +(that: Amounts) = Amounts(
    this.total + that.total,
    this.paid + that.paid
  )

  def -(that: Amounts) = Amounts(
    this.total - that.total,
    this.paid - that.paid
  )
}

object Amounts {
  val Zero = Amounts(0.0, 0.0)
}

