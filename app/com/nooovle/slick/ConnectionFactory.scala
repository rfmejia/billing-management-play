package com.nooovle.slick

import play.api.db._
import play.api.Play.current
import scala.slick.driver.H2Driver.simple._

object ConnectionFactory {
  def connect(): Database = Database.forDataSource(DB.getDataSource())
}
