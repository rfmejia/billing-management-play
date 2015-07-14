package com.nooovle

import org.locker47.json.play._
import play.api.libs.json._

case class Mailbox(name: String, title: String) {
  lazy val asJsObject: JsObject = {
    JsObject(Seq(
      "name" -> JsString(name),
      "title" -> JsString(title)
    ))
  }
}

object Mailbox {
  val drafts = Mailbox("drafts", "Drafts")
  val forSending = Mailbox("forSending", "For sending")
  val unpaid = Mailbox("unpaid", "Unpaid")
  val paid = Mailbox("paid", "Paid")

  val pending = Mailbox("pending", "Pending")
  val pendingSubboxes = Vector(drafts, forSending)

  val delivered = Mailbox("delivered", "Delivered")
  val deliveredSubboxes = Vector(unpaid, paid)

  val start = drafts

  def find(box: String): Option[Mailbox] =
    (pendingSubboxes ++ deliveredSubboxes).find(_.name == box)

  def getSubboxes(box: String): Set[String] = box match {
    case pending.name => pendingSubboxes.map(_.name).toSet
    case delivered.name => deliveredSubboxes.map(_.name).toSet
    case _ => find(box) match {
      case Some(_) => Set(box)
      case None => Set.empty
    }
  }

  def next(box: String): Option[Mailbox] = box match {
    case drafts.name => Some(forSending)
    case forSending.name => Some(unpaid)
    case unpaid.name => Some(paid)
    case paid.name => None
    case _ => None
  }

  def prev(box: String): Option[Mailbox] = box match {
    case drafts.name => None
    case forSending.name => Some(drafts)
    case unpaid.name => Some(forSending)
    case paid.name => Some(unpaid)
    case _ => None
  }
}
