/**
 * Created by juancarlos.yu on 3/15/15.
 */
angular
    .module("nvl-utils")
    .factory("nvl-dateutils", nvlDateUtils);

nvlDateUtils.$inject = ["moment"];
function nvlDateUtils(moment) {
    var service = {
        getLocalMonth         : getLocalMonth,
        getLocalYear          : getLocalYear,
        getLocalMonthNow      : getLocalMonthNow,
        getLocalYearNow       : getLocalYearNow,
        getLocalDateNow       : getLocalDateNow,
        getLocalStringDisplay : getLocalStringDisplay,
        getMomentFromString   : getMomentFromString,
        momentToStringDisplay : momentToStringDisplay,
        dateToStringDisplay   : dateToStringDisplay,
        stringTimeStamp       : stringTimeStamp,
        convertToMoment       : convertToMoment,
        draftsFormatDate      : draftsFormatDate,
        draftsStringToDate    : draftsStringToDate
    };

    return service;

    function draftsFormatDate(date) {
        if(date == null) return null;

        var converted = moment.utc([date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0]);
        return converted.isValid() ? converted.clone().toDate() : null;
    }

    function draftsStringToDate(stringDate) {
        var momentObj = moment(stringDate);
        return momentObj.toDate();
    }

    function convertToMoment(date) {
        return moment(date);
    }

    function getLocalMonth(dateString) {
        var tz = moment.parseZone(dateString).zone();
        return moment(dateString).zone(tz).month() + 1;
    }

    function getLocalYear(dateString) {
        var tz = moment.parseZone(dateString).zone();
        return moment(dateString).zone(tz).year();
    }

    function getLocalMonthNow() {
        return getLocalMonth(moment().format());
    }

    function getLocalYearNow() {
        return getLocalYear(moment().format());
    }

    function getLocalDateNow(format) {
        return momentToStringDisplay(moment(), format)
    }

    function momentToStringDisplay(mom, format) {
        return mom.format(format);
    }

    function dateToStringDisplay(date, format) {
        return moment(date).format(format);
    }

    function getLocalStringDisplay(stringDate, format) {
        return moment(stringDate).format(format);
    }

    function getMomentFromString(month, year) {
        month -= 1;
        return moment({year : year, month : month});
    }

    function stringTimeStamp() {
        return moment().format();
    }
}