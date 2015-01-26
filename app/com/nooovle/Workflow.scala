package com.nooovle

import play.api.libs.json._

object Workflow {
  val pending = Vector("Drafts", "For checking", "For approval")
  val delivered = Vector("Unpaid", "Paid")

  val start = "Drafts"

  def exists(box: String): Option[String] =
    (pending ++ delivered).find(_ == box)

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

  val asJsObject: JsObject = Json.parse("""
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
                        "queryParam": "for+checking",
                        "subFolders": []
                    },
                    {
                        "title": "For approval",
                        "queryKey": "mailbox",
                        "queryParam": "for+approval",
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
                        "title": "Delivered",
                        "queryKey": "mailbox",
                        "queryParam": "pending",
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
        ]
    }
}
    """).as[JsObject]

}
