/**
 * Created by juancarlos.yu on 3/30/15.
 */
angular.module("app.mailbox").factory("InvoiceEntry", invoiceEntryCreator);

function invoiceEntryCreator() {

    function InvoiceEntry(id, title, datatype, value) {
        this.id = id;
        this.title = title;
        this.datatype = datatype;
        this.value = value;
    }

    InvoiceEntry.prototype = {

    };

    InvoiceEntry.build = function(rawEntry) {
        return new InvoiceEntry(
            rawEntry.id,
            rawEntry.title,
            rawEntry.datatype,
            rawEntry.value
        );
    };

    return InvoiceEntry;
}
