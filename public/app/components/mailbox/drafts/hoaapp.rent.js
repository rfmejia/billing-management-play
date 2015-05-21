/**
 * Created by juancarlos.yu on 3/31/15.
 */
angular.module("app.mailbox").factory("Rent", rentCreator);

function rentCreator(InvoiceEntry, roundOff) {

    function Rent(baseRent, vat, subtotal, whTax, sectionTotal, tenant) {
        this.baseRent = baseRent;
        this.vat = vat;
        this.subtotal = subtotal;
        this.whTax = whTax;
        this.sectionTotal = sectionTotal;
        this.tenant = tenant;
    }

    function getEntry(data, id) {
        var entry = {};
        angular.forEach(data, function(value) {
            if(value.id === id) {
                entry = value;
            }
        });
        return entry;
    }

    var vatPercentage = 0.12;

    Rent.prototype = {
        compile : function () {
            return {
                title : "Rent",
                sectionTotal : this.sectionTotal,
                fields : [
                    this.baseRent, this.vat, this.subtotal, this.whTax
                ]
            }
        },
        compute : function() {
            this.sectionTotal.value = roundOff(this.subtotal.value + this.whTax.value, 2);
        },
        clear : function() {
            this.sectionTotal.value = 0;
        }
    };

    Rent.build = function(rent, tenant) {
        var rentBase = InvoiceEntry.build(getEntry(rent.fields, "rent_base"));
        var vat = InvoiceEntry.build(getEntry(rent.fields, "rent_vat"));
        var subtotal = InvoiceEntry.build(getEntry(rent.fields, "rent_subtotal"));
        var whTax = InvoiceEntry.build(getEntry(rent.fields, "rent_whtax"));
        var sectionTotal = InvoiceEntry.build(rent.sectionTotal);

        rentBase.value = roundOff(tenant.baseRentDefault * tenant.area, 2);
        vat.value = roundOff(rentBase.value * vatPercentage, 2);
        subtotal.value = roundOff(rentBase.value + vat.value, 2);

        return new Rent(rentBase, vat, subtotal, whTax, sectionTotal, tenant);
    };

    return Rent;
}
rentCreator.$inject = ["InvoiceEntry", "numPrecisionFilter"];
