package com.github.rfmejia.hoa

import com.github.rfmejia.hoa.slick.ConnectionFactory
import com.github.rfmejia.hoa.slick.models.serialNumbers
import play.api.Logger
import scala.slick.driver.PostgresDriver.simple._
import scala.util.Try

case class SerialNumber(id: Int, docId: Int) {
  override def toString = f"${id}%05d"
}

object SerialNumber extends ((Int, Int) => SerialNumber) {
  def get(id: Int): Option[SerialNumber] =
    ConnectionFactory.connect withSession { implicit session =>
      (for (sn <- serialNumbers if sn.id === id) yield sn).firstOption
    }

  def create(docId: Int): Try[SerialNumber] = Try {
    ConnectionFactory.connect withSession { implicit session =>
      val newSerial = SerialNumber(0, docId)
      val id = (serialNumbers returning serialNumbers.map(_.id)) += newSerial
      Logger.debug(s"Generated serial number ${id} for document ${docId}")
      newSerial.copy(id = id)
    }
  }

  def documentOf(id: Int): Option[Document] =
    ConnectionFactory.connect withSession { implicit session =>
      val query = for {
        sn <- serialNumbers if sn.id === id
        doc <- sn.document
      } yield doc
      query.firstOption
    }
}
