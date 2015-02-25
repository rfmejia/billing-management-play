/**
 * Created by juancarlos.yu on 2/25/15.
 */
angular
    .module('hoaApp')
    .filter('momentString', format);

function momentToString(dateString, format) {
    return moment(dateString).format(format);
}