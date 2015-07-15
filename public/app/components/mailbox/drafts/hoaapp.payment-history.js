/**
 * Created by juancarlos.yu on 7/13/15.
 */
angular.module("app.mailbox").factory("PaymentHistory", paymentHistoryCreator);

function paymentHistoryCreator(roundoff) {
    function PaymentHistory(paymentHistory) {
        this.withholdingTax = paymentHistory.withholdingTax;
        this.previousUnpaid = paymentHistory.previousCharges;
        this.rent = paymentHistory.rent;
        this.water = paymentHistory.water;
        this.electricity = paymentHistory.electricity;
        this.cusa = paymentHistory.cusa;

    }

    PaymentHistory.prototype = {
        compute : function() {
            var getPercentage = function(percent, total) {
                return roundoff((percent /100) * total);
            };

            var previousCharges = this.withholdingTax + this.previousUnpaid + this.rent.unpaid + this.water.unpaid + this.electricity.unpaid + this.cusa.unpaid;
            this.rent.penaltyValue = getPercentage(this.rent.penaltyPercent, this.rent.unpaid);
            this.water.penaltyValue = getPercentage(this.water.penaltyPercent, this.water.unpaid);
            this.electricity.penaltyValue = getPercentage(this.electricity.penaltyPercent, this.electricity.unpaid);
            this.cusa.penaltyValue = getPercentage(this.cusa.penaltyPercent, this.cusa.unpaid);

            var penaltyTotal = roundoff(this.rent.penaltyValue + this.water.penaltyValue + this.electricity.penaltyValue + this.cusa.penaltyValue);

            return {
                overdueChargesTotal : roundoff(previousCharges, 2),
                penaltyChargesTotal  : penaltyTotal
            }

        },
        clear   : function() {
            this.rentPenalty = null;
            this.waterPenalty = null;
            this.electricityPenalty = null;
            this.cusaPenalty = null;
            this.witholdingTaxCharge = null;
        }
    };

    PaymentHistory.build = function(unpaidSummary) {
        return new PaymentHistory(unpaidSummary);
    };

    return PaymentHistory;
}
paymentHistoryCreator.$inject = ["numPrecisionFilter"];