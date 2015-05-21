/**
 * Created by juancarlos.yu on 3/31/15.
 */
angular.module("app.mailbox").factory("Cusa", cusaCreator);

function cusaCreator(InvoiceEntry, roundOff) {

    function Cusa(subField, sectionTotal, tenant) {
        this.subField = subField;
        this.sectionTotal = sectionTotal;
        this.tenant = tenant;
    }

    Cusa.prototype = {
        compile : function() {
            return {
                title : "Cusa",
                sectionTotal : this.sectionTotal,
                fields : [this.subField]
            }
        },
        compute : function() {
            this.subField.value = roundOff(this.tenant.cusaDefault, 2);
            this.sectionTotal.value = roundOff(this.subField.value * this.tenant.area, 2);
        },
        clear : function() {
            this.sectionTotal.value = 0;
        }
    };

    Cusa.build = function(cusa, tenant) {
        var subfield = InvoiceEntry.build(cusa.fields[0]);
        var sectionTotal = InvoiceEntry.build(cusa.sectionTotal);

        return new Cusa(subfield, sectionTotal, tenant);
    };

    return Cusa;
}
cusaCreator.$inject = ["InvoiceEntry", "numPrecisionFilter"];