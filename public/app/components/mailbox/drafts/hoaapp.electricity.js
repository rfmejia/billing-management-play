/**
 * Created by juancarlos.yu on 3/30/15.
 */
angular.module("app.mailbox").factory("Electricity", electricityCreator);

function electricityCreator(InvoiceEntry, dateUtils) {

    /**
     * Constructor
     * @param data document body
     * @constructor
     */
    function Electricity(date, meterNumber, prevReading, currentReading, kwUsed, multiplier, grossUsage, meralco, consumption, sectionTotal, tenant) {
        this.dates = date;
        this.meterNumber = meterNumber;
        this.prevReading = prevReading;
        this.currentReading = currentReading;
        this.kwUsed = kwUsed;
        this.multiplier = multiplier;
        this.grossUsage = grossUsage;
        this.meralco = meralco;
        this.consumption = consumption;
        this.sectionTotal = sectionTotal;
        this.tenant = tenant;
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

    Electricity.prototype = {
        compile : function() {
            return {
                title        : "Electricity",
                sectionTotal : this.sectionTotal,
                fields       : [
                    this.dates, this.meterNumber, this.prevReading, this.currentReading, this.kwUsed, this.multiplier, this.grossUsage, this.meralco, this.consumption
                ]
            }
        },
        compute : function() {
            var startDate = this.dates.start.value;
            this.dates.start.value = dateUtils.draftsFormatDate(startDate);
            var endDate = this.dates.end.value;
            this.dates.end.value = dateUtils.draftsFormatDate(endDate);

            this.kwUsed.value = this.currentReading.value - this.prevReading.value;
            this.grossUsage.value = this.kwUsed.value *  this.tenant.standardMultiplierDefault;
            this.consumption.value = this.grossUsage.value * this.meralco.value;
            this.sectionTotal.value = this.consumption.value;
        },
        clear   : function() {
            this.sectionTotal.value = 0;
        }
    };

    Electricity.build = function(electricity, tenant) {
        var date = {
            datatype : "dateperiod",
            start : InvoiceEntry.build(electricity.fields[0].start),
            end   : InvoiceEntry.build(electricity.fields[0].end)
        };
        var meterNumber = InvoiceEntry.build(getEntry(electricity.fields, "elec_meter_number"));
        var prevReading = InvoiceEntry.build(getEntry(electricity.fields, "elec_prev_reading"));
        var currentReading = InvoiceEntry.build(getEntry(electricity.fields, "elec_curr_reading"));
        var kwUsed = InvoiceEntry.build(getEntry(electricity.fields, "elec_kw_used"));
        var multiplier = InvoiceEntry.build(getEntry(electricity.fields, "elec_multiplier"));
        var grossUsage = InvoiceEntry.build(getEntry(electricity.fields, "elec_gross_usage"));
        var meralco = InvoiceEntry.build(getEntry(electricity.fields, "elec_meralco"));
        var consumption = InvoiceEntry.build(getEntry(electricity.fields, "elec_consumption"));
        var sectionTotal = InvoiceEntry.build(electricity.sectionTotal);

        meterNumber.value = tenant.electricityMeterDefault;
        multiplier.value = tenant.standardMultiplierDefault;

        var startDateString = date.start.value;
        var endDateString = date.end.value;

        date.start.value = dateUtils.draftsStringToDate(startDateString);
        date.end.value = dateUtils.draftsStringToDate(endDateString);

        return new Electricity(date, meterNumber, prevReading, currentReading, kwUsed, multiplier, grossUsage, meralco, consumption, sectionTotal, tenant);
    };

    return Electricity;
}
electricityCreator.$inject = ["InvoiceEntry", "nvl-dateutils"];
