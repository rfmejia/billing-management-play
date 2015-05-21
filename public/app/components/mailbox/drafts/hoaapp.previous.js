/**
 * Created by juancarlos.yu on 3/31/15.
 */
angular.module("app.mailbox").factory("Previous", previousCreator);

function previousCreator(InvoiceEntry, roundOff) {
    function Previous(overdue, other, sectionTotal) {
        this.overdue = overdue;
        this.other = other;
        this.sectionTotal = sectionTotal
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

    Previous.prototype = {
        compile : function() {
            return {
                sectionTotal : this.sectionTotal,
                fields : [
                    this.overdue, this.other
                ]
            }
        },
        compute : function() {
            this.sectionTotal.value = roundOff(this.overdue.value + this.other.value, 2);
        },
        clear : function() {
            this.sectionTotal.value = null;
        }
    };

    Previous.build = function(previous) {
        var overdue = InvoiceEntry.build(getEntry(previous.fields, "_overdue_charges"));
        var other = InvoiceEntry.build(getEntry(previous.fields, "_other_charges"));
        var sectionTotal = InvoiceEntry.build(previous.sectionTotal);

        return new Previous(overdue, other, sectionTotal);
    };

    return Previous;
}
previousCreator.$inject = ["InvoiceEntry", "numPrecisionFilter"];