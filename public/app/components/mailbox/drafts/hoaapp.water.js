/**
 * Created by juancarlos.yu on 3/31/15.
 */
angular.module("app.mailbox").factory("Water", waterCreator);

function waterCreator(InvoiceEntry, dateUtils) {

    function Water(date, meterNumber, prevReading, currentReading, grossUsage, rate, consumption, sectionTotal, tenant) {
        this.dates = date;
        this.meterNumber = meterNumber;
        this.prevReading = prevReading;
        this.currentReading = currentReading;
        this.grossUsage = grossUsage;
        this.rate = rate;
        this.consumption = consumption;
        this.tenant = tenant;
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

    Water.prototype = {
        compile : function() {
            return {
                title        : "Water",
                sectionTotal : this.sectionTotal,
                fields       : [
                    this.dates, this.meterNumber, this.prevReading, this.currentReading, this.grossUsage, this.rate, this.consumption
                ]
            }
        },
        compute : function() {
            var startDate = this.dates.start.value;
            this.dates.start.value = dateUtils.draftsFormatDate(startDate);
            var endDate = this.dates.end.value;
            this.dates.end.value = dateUtils.draftsFormatDate(endDate);

            this.grossUsage.value = this.currentReading.value - this.prevReading.value;
            this.consumption.value = this.rate.value * this.grossUsage.value;
            this.sectionTotal.value = this.consumption.value;
        },
        clear : function() {
            this.sectionTotal.value = 0;
        }
    };

    Water.build = function(water, tenant) {
        var date = {
            datatype : "dateperiod",
            start : InvoiceEntry.build(water.fields[0].start),
            end   : InvoiceEntry.build(water.fields[0].end)
        };
        var meterNumber = InvoiceEntry.build(getEntry(water.fields, "water_meter_num"));
        var prevReading = InvoiceEntry.build(getEntry(water.fields, "water_prev_reading"));
        var currentReading = InvoiceEntry.build(getEntry(water.fields, "water_curr_reading"));
        var grossUsage = InvoiceEntry.build(getEntry(water.fields, "water_gross_usage"));
        var rate = InvoiceEntry.build(getEntry(water.fields, "water_rate"));
        var consumption = InvoiceEntry.build(getEntry(water.fields, "water_consumption"));
        var sectionTotal = InvoiceEntry.build(water.sectionTotal);

        meterNumber.value = tenant.waterMeterDefault;

        var startDateString = date.start.value;
        var endDateString = date.end.value;

        date.start.value = dateUtils.draftsStringToDate(startDateString);
        date.end.value = dateUtils.draftsStringToDate(endDateString);

        return new Water(date, meterNumber, prevReading, currentReading, grossUsage, rate, consumption, sectionTotal, tenant);
    };

    return Water;
}

waterCreator.$inject = ["InvoiceEntry", "nvl-dateutils"];