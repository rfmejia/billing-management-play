package controllers

import com.nooovle._
import com.nooovle.Mailbox._
import com.nooovle.slick.models.documents
import org.locker47.json.play._
import play.api._
import play.api.i18n.Messages
import play.api.libs.json._
import play.api.mvc.{ Action, Controller, RequestHeader }
import scala.slick.driver.H2Driver.simple._
import scala.util.{ Try, Success, Failure }
import securesocial.core.RuntimeEnvironment

class Workflow(override implicit val env: RuntimeEnvironment[User])
  extends ApiController[User] {

  def listMailboxes = SecuredAction { implicit request =>
    Ok {
      val self = routes.Workflow.listMailboxes
      val obj = HalJsObject.create(self.absoluteURL())
        .withCurie("hoa", Application.defaultCurie)
        .withLink("profile", "collection")
        .withField("mailbox", workflowAsJsObject)
      obj.asJsValue
    }
  }

  def matchRole(box: Mailbox, roles: Set[Role]): Option[String] = box match {
    case Mailbox.drafts => roles.find(_ == Roles.Encoder).map(_.id)
    case Mailbox.forChecking => roles.find(_ == Roles.Checker).map(_.id)
    case Mailbox.forApproval => roles.find(_ == Roles.Approver).map(_.id)
    case _ => Some(s"Mailbox ${box} does not need any special permissions")
  }

  // TODO: Only the assigned user can move this mailbox
  // And that assigned user has the correct privileges, or if user is admin
  def hasMovePermission(user: User, doc: Document): Either[String, String] = {
    val roles = User.findRoles(user.userId)

    if (roles.contains(Roles.Admin)) Right(Roles.Admin.id)
    else if (!doc.assigned.contains(user.userId))
      Left(Messages("hoa.documents.forbidden.NotAssigned"))
    else {
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
                Document.update(oldDoc.copy(mailbox = newBox.name, assigned = None)) match {
                  case Success(newDoc) =>
                    val msg = s"Moved document from '${oldBox.title}' to '${newBox.title}'"
                    ActionLog.log(request.user.userId, newDoc.id, msg) map { log =>
                      // Check if the target box is the next box in the workflow
                      // To properly log for movements
                      if (Option(newBox) == Mailbox.next(oldBox.name)) {
                        oldBox match {
                          case Mailbox.drafts =>
                            Document.logPreparedAction(log)
                          case Mailbox.forChecking =>
                            Document.logCheckedAction(log)
                          case Mailbox.forApproval =>
                            Document.logApprovedAction(log)
                          case _ => Document.logLastAction(log)
                        }
                      } else { // Clear existing logs, if any
                        val (clearPrepared, clearChecked, clearApproved) = newBox match {
                          case Mailbox.drafts => (true, true, true)
                          case Mailbox.forChecking => (false, true, true)
                          case Mailbox.forApproval => (false, false, true)
                          case _ => (false, false, false)
                        }

                        Document.update(
                          newDoc.copy(
                            preparedAction = if (clearPrepared) None else newDoc.preparedAction,
                            checkedAction = if (clearChecked) None else newDoc.checkedAction,
                            approvedAction = if (clearApproved) None else newDoc.approvedAction)) match {
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
        "subFolders" -> JsArray(subFolders)))
    }

    val pendingBoxes = boxAsJson(pending, pendingSubboxes.map(boxAsJson(_)))
    val deliveredBoxes = boxAsJson(delivered, deliveredSubboxes.map(boxAsJson(_)))
    val allBoxes = boxAsJson(Mailbox("all", "Mailbox"), Vector(pendingBoxes, deliveredBoxes))

    allBoxes
  }
}
