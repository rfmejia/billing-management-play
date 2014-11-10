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
  "org.apache.shiro" % "shiro-core" % "1.2.3",
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
