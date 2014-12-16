name := "hoa-play-scala"

organization := "com.nooovle"

version := "0.1-SNAPSHOT"

scalaVersion := "2.10.3"

scalacOptions ++= Seq("-feature", "-unchecked", "-deprecation", "-encoding", "utf8")

val jodaTimeDependencies = Seq(
  "joda-time" % "joda-time" % "2.4",
  "org.joda" % "joda-convert" % "1.6",
  "com.github.tototoshi" %% "slick-joda-mapper" % "1.2.0"
)

val repositoryDependencies = Seq(
  "com.typesafe.play.plugins" %% "play-plugins-mailer" % "2.3.1",
  "ws.securesocial" %% "securesocial" % "2.1.4",
  //"ws.securesocial" %% "securesocial" % "3.0-M1",
  "com.typesafe.slick" %% "slick" % "2.1.0",
  "org.slf4j" % "slf4j-nop" % "1.6.4"
) ++ jodaTimeDependencies

libraryDependencies ++= repositoryDependencies ++ Seq(
  javaJdbc,
  javaEbean,
  cache
)

// Enable Play HTTP filters
libraryDependencies += filters

play.Project.playScalaSettings
