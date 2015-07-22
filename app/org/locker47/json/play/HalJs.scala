package org.locker47.json.play

import play.api.libs.json._
import scala.collection.{ immutable, mutable }
import scala.language.implicitConversions

case class HalJsObject(fields: immutable.Map[String, JsValue], links: HalJsLinks,
    embedded: Option[HalJsObject]) {

  val self = links.self
  def self(href: String) = this.withLink("self", href)

  def withField(name: String, value: JsValue): HalJsObject =
    this.copy(fields = fields + ((name, value)))

  def withField(name: String, opt: Option[Any]): HalJsObject = opt match {
    case Some(value) => withField(name, HalJsObject.anyToJsValue(value))
    case None => withField(name, JsNull)
  }

  def withField(name: String, value: Any): HalJsObject =
    withField(name, Option(value))

  def withLink(rel: String, href: String, title: Option[String] = None): HalJsObject =
    this.copy(links = links.add(rel, href, title))

  def withCurie(name: String, href: String): HalJsObject =
    this.copy(links = links.curie(name, href))

  def withEmbedded(obj: HalJsObject): HalJsObject =
    this.copy(embedded = Some(obj))

  def merge(that: HalJsObject): HalJsObject = {
    val e: Option[HalJsObject] = (this.embedded, that.embedded) match {
      case (Some(e1), Some(e2)) => Some(e1 ++ e2)
      case (Some(_), None) => this.embedded
      case (None, Some(_)) => that.embedded
      case _ => None
    }
    HalJsObject(this.fields ++ that.fields, this.links ++ that.links, e)
  }

  def ++(that: HalJsObject): HalJsObject = merge(that)

  lazy val asJsValue: JsObject = {
    val temp = mutable.MutableList.empty[(String, JsValue)]

    if (!links.isEmpty) temp += (("_links", links.asJsValue))

    temp ++= fields

    embedded map (obj => temp += (("_embedded", obj.asJsValue)))

    JsObject(temp.toList)
  }
}

object HalJsObject {
  val mediaType = "application/hal+json"

  val empty = HalJsObject(immutable.Map.empty, HalJsLinks.empty, None)

  def self(href: String) = empty.self(href)

  def from(json: JsValue) = json match {
    case JsObject(fields) => HalJsObject(fields.toMap, HalJsLinks.empty, None)
    case _ => empty
  }

  def anyToJsValue(any: Any): JsValue = any match {
    case s: String => JsString(s)
    case n: Int => JsNumber(n)
    case n: Long => JsNumber(n)
    case n: Double => JsNumber(n)
    case b: Boolean => JsBoolean(b)
    case ls: Iterable[_] =>
      val arr: List[JsValue] = ls.map(l => anyToJsValue(l)).toList
      JsArray(arr)
    case js: JsValue => js
    case _ => JsString(any.toString)
  }
}

/**
 * Holds the '_links' reserved field. Automatically renders as an array if there
 * are two or more links assigned to a relation.
 */
case class HalJsLinks(
    links: immutable.Map[String, List[Link]],
    curies: List[Curie]
) {

  val isEmpty = links.isEmpty && curies.isEmpty

  def self(href: String) = this.add("self", href)

  // Only returns the last result, if any
  val self: Option[Link] = links.get("self").map(_.head)

  def curie(name: String, href: String) =
    this.copy(curies = curies :+ Curie.create(name, href))

  def add(rel: String, href: String, title: Option[String] = None): HalJsLinks = {
    val link = Link.create(href, title)
    val newList = links.get(rel) match {
      case Some(list) => list :+ link
      case None => List(link)
    }
    this.copy(links = links + ((rel, newList)))
  }

  lazy val asJsValue = {
    // Selects rendering type: Single object, JSON array of objects, or none
    def render(rel: String, ls: List[Link]): Option[(String, JsValue)] = {
      if (ls.isEmpty) None
      else if (ls.size == 1) Some((rel, ls.head.asJsValue))
      else Some((rel, JsArray(ls map (_.asJsValue))))
    }

    val ls = links.map(e => render(e._1, e._2)).toList.flatten

    if (curies.isEmpty) JsObject(ls)
    else {
      val cs = ("curies", JsArray(curies.map(_.asJsValue)))
      JsObject(cs +: ls)
    }
  }

  def merge(that: HalJsLinks): HalJsLinks = HalJsLinks(
    this.links ++ that.links,
    this.curies ++ that.curies
  )

  def ++(that: HalJsLinks): HalJsLinks = merge(that)
}

object HalJsLinks {
  val empty = HalJsLinks(immutable.Map.empty, List.empty)

  def create(href: String) = empty.self(href)
}

case class Link(href: String, title: Option[String] = None, templated: Boolean = false) {
  lazy val asJsValue = {
    val o1 = Json.obj("href" -> href)
    val o2 = if (title.isDefined) o1 + ("title" -> JsString(title.get)) else o1
    val o3 = if (templated) o2 + ("templated" -> JsBoolean(true)) else o2
    o3
  }
}

object Link {
  val templatePattern = "\\{[a-zA-Z0-9_]+\\}".r

  def create(href: String, title: Option[String] = None): Link = {
    val t = templatePattern.findFirstIn(href).isDefined
    Link(href, title, t)
  }
}

case class Curie(name: String, link: Link) {
  lazy val asJsValue = {
    val o1 = Json.obj("name" -> name, "href" -> link.href)
    val o2 = link.asJsValue
    o1 ++ o2
  }

}

object Curie {
  def create(name: String, href: String): Curie = Curie(name, Link.create(href))
}
