package com.github.rfmejia.hoa

trait MonthlyAmount {
  val all: List[Amounts]

  lazy val isPaid: Boolean = all.foldLeft(true)(_ && _.isPaid)
  lazy val unpaid: Double = all.map(_.unpaid).sum
  lazy val paid: Double = all.map(_.paid).sum
  lazy val total: Double = all.map(_.total).sum
}

case class CurrentMonth(rent: Amounts, electricity: Amounts, water: Amounts, cusa: Amounts) extends MonthlyAmount {
  val all = List(rent, electricity, water, cusa)

  def +(that: CurrentMonth) = CurrentMonth(
    this.rent + that.rent,
    this.electricity + that.electricity,
    this.water + that.water,
    this.cusa + that.cusa
  )

  def -(that: CurrentMonth) = CurrentMonth(
    this.rent - that.rent,
    this.electricity - that.electricity,
    this.water - that.water,
    this.cusa - that.cusa
  )
}

object CurrentMonth {
  val Zero = CurrentMonth(Amounts.Zero, Amounts.Zero, Amounts.Zero, Amounts.Zero)
}

case class PreviousMonth(rent: Amounts, electricity: Amounts, water: Amounts, cusa: Amounts, withholdingTax: Amounts, previousCharges: Amounts) extends MonthlyAmount {
  val all = List(rent, electricity, water, cusa, withholdingTax, previousCharges)

  def +(that: PreviousMonth) = PreviousMonth(
    this.rent + that.rent,
    this.electricity + that.electricity,
    this.water + that.water,
    this.cusa + that.cusa,
    this.withholdingTax + that.withholdingTax,
    this.previousCharges + that.previousCharges
  )

  def -(that: PreviousMonth) = PreviousMonth(
    this.rent - that.rent,
    this.electricity - that.electricity,
    this.water - that.water,
    this.cusa - that.cusa,
    this.withholdingTax - that.withholdingTax,
    this.previousCharges - that.previousCharges
  )
}

object PreviousMonth {
  val Zero = PreviousMonth(Amounts.Zero, Amounts.Zero, Amounts.Zero, Amounts.Zero, Amounts.Zero, Amounts.Zero)
}

