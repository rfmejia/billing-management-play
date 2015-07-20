/**
 * Created by juancarlos.yu on 3/31/15.
 */
angular.module("app.mailbox").factory("Previous", previousCreator);

function previousCreator(InvoiceEntry, PaymentHistory, roundOff) {
    function Previous(overdue, other, paymentHistory, sectionTotal) {
        this.overdue = overdue;
        this.other = other;
        this.paymentHistory = paymentHistory;
        this.sectionTotal = sectionTotal;
    }

    function getEntry(data, id) {
        var entry = {};
        angular.forEach(data, function(value) {
            if (value.id === id) {
                entry = value;
            }
        });
        return entry;
    }

    function calculateOverdueCharges(paymentHistory) {
        var compiledPaymentHistory = paymentHistory.compute();
        return
    }

    Previous.prototype = {
        compile : function() {
            return {
                sectionTotal : this.sectionTotal,
                fields : [
                    this.overdue, this.other
                ],
                paymentHistory : this.paymentHistory
            }
        },
        compute : function() {
            var compiledPaymentHistory = this.paymentHistory.compute();
            this.overdue.value = compiledPaymentHistory.overdueChargesTotal;
            this.other.value = compiledPaymentHistory.penaltyChargesTotal;

            this.sectionTotal.value = roundOff(this.overdue.value + this.other.value, 2);
        },
        clear : function() {
            this.sectionTotal.value = null;
        }
    };

    Previous.build = function(previous) {
        var paymentHistory = PaymentHistory.build(previous.paymentHistory);
        var paymentHistoryComputed = paymentHistory.compute();

        var overdue = InvoiceEntry.build(getEntry(previous.fields, "_overdue_charges"));
        overdue.value = paymentHistoryComputed.overdueChargesTotal;

        var other = InvoiceEntry.build(getEntry(previous.fields, "_other_charges"));
        other.value = paymentHistoryComputed.penaltyChargesTotal;

        var sectionTotal = InvoiceEntry.build(previous.sectionTotal);
        sectionTotal.value = roundOff(other.value + overdue.value, 2);

        return new Previous(overdue, other, paymentHistory, sectionTotal);
    };

    return Previous;
}
previousCreator.$inject = ["InvoiceEntry", "PaymentHistory", "numPrecisionFilter"];