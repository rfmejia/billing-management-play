/**
 * Created by juancarlos.yu on 3/31/15.
 */
angular.module("app.mailbox").factory("Invoice", invoiceCreator);

function invoiceCreator(InvoiceEntry, Previous, Rent, Electricity, Water, Cusa) {

    function Invoice(previous, rent, electricity, water, cusa, previousSummary, thisMonthSummary, totalValue, remarks) {
        this.previous = previous;
        this.rent = rent;
        this.electricity = electricity;
        this.water = water;
        this.cusa = cusa;
        this.summaryValue = totalValue;
        this.remarks = remarks;
        this.previousSummary = previousSummary;
        this.thisMonthSummary = thisMonthSummary;
    }

    Invoice.prototype = {
        compile : function() {
            return {
                body : {
                    previous  : {
                        title    : "Previous charges",
                        sections : [this.previous.compile()],
                        summary  : this.previousSummary
                    },
                    thisMonth : {
                        title    : "This Month's Charges",
                        sections : [
                            this.rent.compile(), this.electricity.compile(), this.water.compile(), this.cusa.compile()
                        ],
                        summary  : this.thisMonthSummary
                    },
                    summary   : {
                        id       : "invoice_summary",
                        title    : "Total Amount due",
                        datatype : "currency",
                        required : true,
                        value    : this.summaryValue,
                        remarks  : this.remarks
                    }
                }
            }
        }
    };

    Invoice.build = function(body, tenant) {
        var previous = Previous.build(body.previous.sections[0]);
        var rent = Rent.build(body.thisMonth.sections[0], tenant);
        var electricity = Electricity.build(body.thisMonth.sections[1], tenant);
        var water = Water.build(body.thisMonth.sections[2], tenant);
        var cusa = Cusa.build(body.thisMonth.sections[3], tenant);
        var previousSummary = InvoiceEntry.build(body.previous.summary);
        var currentSummary = InvoiceEntry.build(body.thisMonth.summary, tenant);
        var totalValue = body.summary.value;
        var remarks = body.summary.remarks;

        return new Invoice(previous, rent, electricity, water, cusa, previousSummary, currentSummary, totalValue, remarks)
    };

    return Invoice;
}
invoiceCreator.$inject = ["InvoiceEntry", "Previous", "Rent", "Electricity", "Water", "Cusa"];