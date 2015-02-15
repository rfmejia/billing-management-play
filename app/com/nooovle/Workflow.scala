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
    case "Drafts" => Some(forChecking)
    case "For checking" => Some(forApproval)
    case "For approval" => Some(unpaid)
    case "Unpaid" => Some(paid)
    case "Paid" => None
    case _ => None
  }

  def prev(box: String): Option[Mailbox] = box match {
    case "Drafts" => None
    case "For checking" => Some(drafts)
    case "For approval" => Some(forChecking)
    case "Unpaid" => Some(forApproval)
    case "Paid" => Some(unpaid)
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
