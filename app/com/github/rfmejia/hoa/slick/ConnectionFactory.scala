package com.github.rfmejia.hoa.slick

import play.api.db._
import play.api.Play.current
import scala.slick.driver.PostgresDriver.simple._

object ConnectionFactory {
  def connect(): Database = Database.forDataSource(DB.getDataSource())
}
