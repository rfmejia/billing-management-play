package com.nooovle

import play.api.libs.json._

object Workflow {

  case class Mailbox(name: String, title: String)

  val drafts = Mailbox("drafts", "Drafts")
  val forChecking = Mailbox("forChecking", "For checking")
  val forApproval = Mailbox("forApproval", "For approval")
  val unpaid = Mailbox("unpaid", "Unpaid")
  val paid = Mailbox("paid", "Paid")

  val pending = Vector(drafts, forChecking, forApproval)
  val delivered = Vector(unpaid, paid)

  val start = drafts

  def exists(box: String): Option[Mailbox] =
    (pending ++ delivered).find(_.name == box)

  def next(box: String): Option[Mailbox] = box match {
    case drafts.name => Some(forChecking)
    case forChecking.name => Some(forApproval)
    case forApproval.name => Some(unpaid)
    case unpaid.name => Some(paid)
    case paid.name => None
    case _ => None
  }

  def prev(box: String): Option[Mailbox] = box match {
    case drafts.name => None
    case forChecking.name => Some(drafts)
    case forApproval.name => Some(forChecking)
    case unpaid.name => Some(forApproval)
    case paid.name => Some(unpaid)
    case _ => None
  }

  val asJsObject: JsObject = {
    Json.parse("""
{
    "_links": {
        "curies": [
            {
                "name": "hoa",
                "href": "http://localhost:9000/api/docs/{rel}",
                "templated": true
            }
        ],
        "self": {
            "href": "http://localhost:9000/api/mailboxes"
        },
        "profile": {
            "href": "collection"
        }
    },
    "mailbox": {
        "title": "Mailbox",
        "queryKey": "",
        "queryParam": "",
        "subFolders": [
            {
                "title": "Pending",
                "queryKey": "mailbox",
                "queryParam": "pending",
                "subFolders": [
                    {
                        "title": "Drafts",
                        "queryKey": "mailbox",
                        "queryParam": "drafts",
                        "subFolders": []
                    },
                    {
                        "title": "For checking",
                        "queryKey": "mailbox",
                        "queryParam": "forChecking",
                        "subFolders": []
                    },
                    {
                        "title": "For approval",
                        "queryKey": "mailbox",
                        "queryParam": "forApproval",
                        "subFolders": []
                    }
                ]
            },
            {
                "title": "Delivered",
                "queryKey": "mailbox",
                "queryParam": "delivered",
                "subFolders": [
                    {
                        "title": "Paid",
                        "queryKey": "mailbox",
                        "queryParam": "paid",
                        "subFolders": []
                    },
                    {
                        "title": "unpaid",
                        "queryKey": "mailbox",
                        "queryParam": "unpaid",
                        "subFolders": []
                    }
                ]
            }
        ]
    }
}
    """).as[JsObject]
  }
}
