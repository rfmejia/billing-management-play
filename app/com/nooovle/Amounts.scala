package com.nooovle

import play.api.libs.json._

case class Amounts(
  previous: Double,
  rent: Double,
  electricity: Double,
  water: Double,
  cusa: Double) {

  val total = List(previous, rent, electricity, water, cusa).sum

  def +(that: Amounts) = Amounts(
    this.previous + that.previous,
    this.rent + that.rent,
    this.electricity + that.electricity,
    this.water + that.water,
    this.cusa + that.cusa)

  def -(that: Amounts) = Amounts(
    this.previous - that.previous,
    this.rent - that.rent,
    this.electricity - that.electricity,
    this.water - that.water,
    this.cusa - that.cusa)

  val asJsObject = JsObject(Seq(
    "previous" -> JsNumber(previous),
    "rent" -> JsNumber(rent),
    "electricity" -> JsNumber(electricity),
    "water" -> JsNumber(water),
    "cusa" -> JsNumber(cusa),
    "total" -> JsNumber(total)))
}

object Amounts {
  val ZERO = Amounts(0.0, 0.0, 0.0, 0.0, 0.0)
}
