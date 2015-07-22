/**
 * Created by juancarlos.yu on 7/13/15.
 */
angular.module("app.mailbox").factory("PaymentHistory", paymentHistoryCreator);

function paymentHistoryCreator(roundoff) {
    function PaymentHistory(paymentHistory) {
        this.withholding_tax = paymentHistory.withholding_tax;
        this.previous_charges = paymentHistory.previous_charges;
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

            var previousCharges = this.withholding_tax + this.previous_charges + this.rent.unpaid + this.water.unpaid + this.electricity.unpaid + this.cusa.unpaid;
            this.rent.penalty_value = getPercentage(this.rent.penalty_percent, this.rent.unpaid);
            this.water.penalty_value = getPercentage(this.water.penalty_percent, this.water.unpaid);
            this.electricity.penalty_value = getPercentage(this.electricity.penalty_percent, this.electricity.unpaid);
            this.cusa.penalty_value = getPercentage(this.cusa.penalty_percent, this.cusa.unpaid);

            var penaltyTotal = roundoff(this.rent.penalty_value + this.water.penalty_value + this.electricity.penalty_value + this.cusa.penalty_value);

            return {
                overdueChargesTotal : roundoff(previousCharges, 2),
                penaltyChargesTotal  : penaltyTotal
            }

        }
    };

    PaymentHistory.build = function(unpaidSummary) {
        return new PaymentHistory(unpaidSummary);
    };

    return PaymentHistory;
}
paymentHistoryCreator.$inject = ["numPrecisionFilter"];