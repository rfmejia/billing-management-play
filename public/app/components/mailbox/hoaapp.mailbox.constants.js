/**
 * Created by juancarlos.yu on 3/15/15.
 */
angular
    .module("app.mailbox")
    .constant("MAILBOX_PARAMS", {
                  pending     : "pending",
                  drafts      : "drafts",
                  forChecking : "forChecking",
                  forApproval : "forApproval",
                  delivered   : "delivered",
                  paid        : "paid",
                  unpaid      : "unpaid"
              });


