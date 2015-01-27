package controllers

import com.nooovle.User
import com.netaporter.uri.dsl._
import org.locker47.json.play._

trait ApiController[T] extends securesocial.core.SecureSocial[T] {
  def listNavLinks(base: String, offset: Int, limit: Int, total: Int): Map[String, Link] = {
    val uri = base.removeParams("offset").removeParams("limit")
    val startLinks = if (offset > 0) {
      Map("first" -> Link.create(uri ? ("offset" -> 0) & ("limit" -> limit)),
        "prev" -> Link.create(uri ? ("offset" -> (Math.max((offset - limit), 0))) & ("limit" -> limit)))
    } else Map.empty
    val endLinks = if (offset + limit < total) {
      Map("next" -> Link.create(uri ? ("offset" -> (Math.min((offset + limit), total))) & ("limit" -> limit)),
        "last" -> Link.create(uri ? ("offset" -> (Math.max((total - limit), 0))) & ("limit" -> limit)))
    } else Map.empty
    (startLinks ++ endLinks)
  }
}
