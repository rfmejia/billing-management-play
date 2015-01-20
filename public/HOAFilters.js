var hoaFilters = angular.module("hoaApp");

hoaFilters.filter("sidebarListFilter", function() {
    return function(input, header) {
        var out = [];
        for(var i = 0;  i < input.length; i++) {
            if(input[i].header == header) out.push(input[i]);
        }
        return out;
    }
});