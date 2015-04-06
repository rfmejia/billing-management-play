package com.nooovle

import org.joda.time.DateTime
import scala.slick.driver.PostgresDriver.simple._
import com.nooovle.slick.ConnectionFactory
import com.nooovle.slick.models.actionLogs
import scala.util.Try

case class ActionLog(id: Int, who: String, what: Int, when: DateTime, why: String)

object ActionLog extends ((Int, String, Int, DateTime, String) => ActionLog) {

  def findById(id: Int): Option[ActionLog] =
    ConnectionFactory.connect withSession { implicit session =>
      (for (l <- actionLogs if l.id === id) yield l).firstOption
    }

  def log(who: String, what: Int, why: String): Try[ActionLog] = Try {
    val when = new DateTime()
    val newLog = ActionLog(0, who, what, when, why)
    ConnectionFactory.connect withSession { implicit session =>
      val id = (actionLogs returning actionLogs.map(_.id)) += newLog
      newLog.copy(id = id)
    }
  }
}
