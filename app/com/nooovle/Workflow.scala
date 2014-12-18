package com.nooovle

object Workflow {
  val pending = Vector("Drafts", "For checking", "For approval")
  val delivered = Vector("Unpaid", "Paid")

  val start = "Drafts"

  def next(box: String): Option[String] = box match {
    case "Drafts" => Some("For checking")
    case "For checking" => Some("For approval")
    case "For approval" => Some("Unpaid")
    case "Unpaid" => Some("Paid")
    case "Paid" => None
    case _ => None
  }

  def prev(box: String): Option[String] = box match {
    case "Drafts" => None
    case "For checking" => Some("Drafts")
    case "For approval" => Some("For checking")
    case "Unpaid" => Some("For approval")
    case "Paid" => Some("Unpaid")
    case _ => None
  }
}
