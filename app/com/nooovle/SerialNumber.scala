package com.nooovle

import com.nooovle.slick.ConnectionFactory
import com.nooovle.slick.models.serialNumbers
import scala.slick.driver.H2Driver.simple._
import scala.util.Try

case class SerialNumber(id: Int, docId: Int) {
  override def toString = f"${id}%05d"
}

object SerialNumber extends ((Int, Int) => SerialNumber) {

  def get(id: Int): Option[SerialNumber] =
    ConnectionFactory.connect withSession { implicit session =>
      (for(sn <- serialNumbers if sn.id === id) yield sn).firstOption
    }

  def create(docId: Int): Try[SerialNumber] = Try {
    ConnectionFactory.connect withSession { implicit session =>
      val newSerial = SerialNumber(0, docId)
      val id = (serialNumbers returning serialNumbers.map(_.id)) += newSerial
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
