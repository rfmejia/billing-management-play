package com.nooovle

import org.locker47.json.play._
import play.api.libs.json._

object Workflow {

  case class Mailbox(name: String, title: String) {
    lazy val asJsObject: JsObject = {
      JsObject(Seq(
        "name" -> JsString(name),
        "title" -> JsString(title)))
    }
  }

  val drafts = Mailbox("drafts", "Drafts")
  val forChecking = Mailbox("forChecking", "For checking")
  val forApproval = Mailbox("forApproval", "For approval")
  val forSending = Mailbox("forSending", "For sending")
  val unpaid = Mailbox("unpaid", "Unpaid")
  val paid = Mailbox("paid", "Paid")

  val pending = Vector(drafts, forChecking, forApproval, forSending)
  val delivered = Vector(unpaid, paid)

  val start = drafts

  def find(box: String): Option[Mailbox] =
    (pending ++ delivered).find(_.name == box)

  def next(box: String): Option[Mailbox] = box match {
    case drafts.name => Some(forChecking)
    case forChecking.name => Some(forApproval)
    case forApproval.name => Some(forSending)
    case forSending.name => Some(unpaid)
    case unpaid.name => Some(paid)
    case paid.name => None
    case _ => None
  }

  def prev(box: String): Option[Mailbox] = box match {
    case drafts.name => None
    case forChecking.name => Some(drafts)
    case forApproval.name => Some(forChecking)
    case forSending.name => Some(forApproval)
    case unpaid.name => Some(forSending)
    case paid.name => Some(unpaid)
    case _ => None
  }

  // TODO: Render from the objects given above
  val asJsObject: JsObject = {
    def boxAsJson(box: Mailbox, subFolders: Vector[JsObject] = Vector.empty): JsObject = {
      JsObject(Seq(
        "title" -> JsString(box.title),
        "queryKey" -> JsString("mailbox"),
        "queryParam" -> JsString(box.name),
        "subFolders" -> JsArray(subFolders)))
    }

    val pendingBoxes = boxAsJson(Mailbox("pending", "Pending"), pending.map(boxAsJson(_)))
    val deliveredBoxes = boxAsJson(Mailbox("delivered", "Delivered"), delivered.map(boxAsJson(_)))
    val allBoxes = boxAsJson(Mailbox("all", "Mailbox"), Vector(pendingBoxes, deliveredBoxes))

    allBoxes
  }
}
