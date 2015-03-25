name := "hoa-play-scala"

organization := "com.nooovle"

version := "0.2"

scalaVersion := "2.11.1"

scalacOptions ++= Seq(
  "-Xlint",
  "-deprecation", 
  "-Xfatal-warnings",
  "-feature", 
  "-unchecked", 
  "-encoding", 
  "utf8")

// Sonatype resolvers
resolvers += Resolver.sonatypeRepo("releases")

resolvers += Resolver.sonatypeRepo("snapshots")

val jodaTimeDependencies = Seq(
  "joda-time" % "joda-time" % "2.4",
  "org.joda" % "joda-convert" % "1.6",
  "com.github.tototoshi" %% "slick-joda-mapper" % "1.2.0"
)

val repositoryDependencies = Seq(
  "com.typesafe.play.plugins" %% "play-plugins-mailer" % "2.3.1",
  "com.typesafe.play" %% "play-slick" % "0.8.1",
  "org.slf4j" % "slf4j-nop" % "1.6.4"
) ++ jodaTimeDependencies

val playDependencies = Seq(
  "ws.securesocial" %% "securesocial" % "master-SNAPSHOT",
  "com.netaporter" %% "scala-uri" % "0.4.4"
)

libraryDependencies ++= repositoryDependencies ++ playDependencies ++ Seq(
  javaJdbc,
  javaEbean,
  cache
)

// Enable Play HTTP filters (cors, gzip, etc.)
libraryDependencies += filters

lazy val root = (project in file(".")).enablePlugins(PlayScala)
