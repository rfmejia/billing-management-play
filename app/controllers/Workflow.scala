package controllers

import com.github.rfmejia.hoa._
import com.github.rfmejia.hoa.Mailbox._
import com.github.rfmejia.hoa.slick.models.documents
import org.locker47.json.play._
import play.api._
import play.api.i18n.Messages
import play.api.libs.json._
import play.api.mvc.{ Action, Controller, RequestHeader }
import scala.slick.driver.PostgresDriver.simple._
import scala.util.{ Try, Success, Failure }
import securesocial.core.RuntimeEnvironment

class Workflow(override implicit val env: RuntimeEnvironment[User])
    extends ApiController[User] {

  def listMailboxes = SecuredAction { implicit request =>
    Ok {
      val self = routes.Workflow.listMailboxes
      val obj = HalJsObject.self(self.absoluteURL())
        .withCurie("hoa", Application.defaultCurie)
        .withLink("profile", "collection")
        .withField("mailbox", workflowAsJsObject)
      obj.asJsValue
    }
  }

  def matchRole(box: Mailbox, roles: Set[Role]): Option[String] = box match {
    case Mailbox.drafts => roles.find(_ == Roles.Encoder).map(_.id)
    case _ => Some(s"Mailbox ${box} does not need any special permissions")
  }

  // Only the assigned user can move this mailbox
  // And that assigned user has the correct privileges, or if user is admin
  def hasMovePermission(user: User, doc: Document): Either[String, String] = {
    val roles = User.findRoles(user.userId)

    if (roles.contains(Roles.Admin)) Right(Roles.Admin.id)
    else if (!doc.assigned.contains(user.userId)) {
      Left(Messages("hoa.documents.forbidden.NotAssigned"))
    } else {
      Mailbox.find(doc.mailbox)
        .flatMap(box => matchRole(box, roles))
        .toRight(Messages("hoa.documents.forbidden.IncorrectRole"))
    }
  }

  def moveMailbox(id: Int, mailbox: String) = SecuredAction { implicit request =>
    Document.findById(id) map {
      oldDoc =>
        hasMovePermission(request.user, oldDoc) match {
          case Left(msg) => Forbidden(msg)
          case Right(role) =>
            // TODO: Move this logic in a separate Workflow object for testability
            (Mailbox.find(oldDoc.mailbox), Mailbox.find(mailbox)) match {
              case (Some(oldBox), Some(newBox)) =>
                Document.changeMailbox(oldDoc, oldBox, newBox) match {
                  case Success(newDoc) =>
                    val msg = s"Moved document from '${oldBox.title}' to '${newBox.title}'"
                    ActionLog.log(request.user.userId, newDoc.id, msg) map { log =>
                      // Check if the target box is the next box in the workflow
                      // To properly log for movements
                      if (Option(newBox) == Mailbox.next(oldBox.name)) {
                        oldBox match {
                          case Mailbox.drafts =>
                            Document.logPreparedAction(log)
                          case _ => Document.logLastAction(log)
                        }
                      } else { // Clear existing logs, if any
                        val (clearPrepared, clearChecked, clearApproved) = newBox match {
                          case Mailbox.drafts => (true, true, true)
                          case _ => (false, false, false)
                        }

                        Document.update(
                          newDoc.copy(
                            preparedAction = if (clearPrepared) None else newDoc.preparedAction
                          )
                        ) match {
                            case Success(_) => Document.logLastAction(log)
                            case Failure(err) => InternalServerError(err.getMessage)
                          }
                      }
                    }
                    NoContent
                  case Failure(err) => InternalServerError(err.getMessage)
                }
              case (None, _) => NotFound("Current mailbox cannot be found")
              case (_, None) => NotFound("Target mailbox cannot be found")
            }
        }
    } getOrElse NotFound("Document cannot be found")

  }

  // TODO: Render from the mailbox workflow
  val workflowAsJsObject: JsObject = {
    def boxAsJson(box: Mailbox, subFolders: Vector[JsObject] = Vector.empty): JsObject = {
      JsObject(Seq(
        "title" -> JsString(box.title),
        "queryKey" -> JsString("mailbox"),
        "queryParam" -> JsString(box.name),
        "subFolders" -> JsArray(subFolders)
      ))
    }

    val pendingBoxes = boxAsJson(pending, pendingSubboxes.map(boxAsJson(_)))
    val deliveredBoxes = boxAsJson(delivered, deliveredSubboxes.map(boxAsJson(_)))
    val allBoxes = boxAsJson(Mailbox("all", "Mailbox"), Vector(pendingBoxes, deliveredBoxes))

    allBoxes
  }
}
