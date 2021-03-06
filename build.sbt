import com.github.play2war.plugin._

name := "hoa-play-scala"

organization := "com.github.rfmejia"

version := "1.0.4"

scalaVersion := "2.11.1"

scalacOptions ++= Seq(
  "-Xlint",
  "-deprecation", 
  "-Xfatal-warnings",
  "-feature", 
  "-unchecked", 
  "-encoding", "utf8")

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
  "org.postgresql" % "postgresql" % "9.4-1201-jdbc41",
  "org.slf4j" % "slf4j-nop" % "1.6.4"
) ++ jodaTimeDependencies

val playDependencies = Seq(
  "ws.securesocial" %% "securesocial" % "3.0-M3",
  "com.netaporter" %% "scala-uri" % "0.4.4"
)

libraryDependencies ++= repositoryDependencies ++ playDependencies ++ Seq(
  javaJdbc,
  javaEbean,
  cache
)

// Enable Play HTTP filters (cors, gzip, etc.)
libraryDependencies += filters

Play2WarPlugin.play2WarSettings

Play2WarKeys.servletVersion := "3.1"

lazy val root = (project in file(".")).enablePlugins(PlayScala, DockerPlugin)

defaultScalariformSettings

