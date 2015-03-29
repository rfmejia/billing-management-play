/**
 * Created by juancarlos.yu on 3/29/15.
 */
angular.module("hoa-app").factory("queryParams", queryParams);

function queryParams(dateUtils) {
    var service = {
        getDocsListParams        : getDocsListParams,
        getDocsListFilters       : getListFilters,
        getDocsListFilterById    : getListFilter,
        getTenantDocs            : getTenantDocsParams,
        getTenantsDocsFilters    : getTenantsFilters,
        getTenantsDocsFilterById : getTenantListFilter,
        getReportsParams         : getReports,
        getReportsFilters        : getReportsFilters,
        getReportsFiltersById    : getReportsFilter
    };

    var docsParams = {
        mailbox    : null,
        limit      : null,
        offset     : null,
        forTenant  : null,
        creator    : null,
        assigned   : null,
        isPaid     : null,
        others     : null,
        isAssigned : null,
        year       : null,
        month      : null,
        filterId   : null
    };

    var tenantsDocsParams = {
        id       : null,
        mailbox  : null,
        isPaid   : null,
        limit    : 10,
        offset   : null,
        filterId : null
    };

    var reportsDocsParams = {
        mailbox  : "delivered",
        limit    : 10,
        offset   : null,
        year     : null,
        month    : null,
        isPaid   : null,
        filterId : null
    };

    return service;

    function getDocsListParams(mailbox, offset, filterId) {
        if (filterId === "mine") {
            var params = {};
            angular.copy(docsParams, params);
            params.mailbox = mailbox;
            params.offset = offset;
            params.others = false;
            params.mailbox = mailbox;
            params.limit = 10;
            params.filterId = filterId;
            return params;

        }
        else if (filterId === "others") {
            return getOthersDocsParams(mailbox, offset, filterId);
        }
        else if (filterId === "open") {
            return getOpenDocsParams(mailbox, offset, filterId)
        }
    }

    function getOthersDocsParams(mailbox, offset) {
        var params = {};
        angular.copy(docsParams, params);
        params.mailbox = mailbox;
        params.limit = 10;
        params.offset = offset;
        params.others = true;
        params.filterId = "others";
        return params;
    }

    function getOpenDocsParams(mailbox, offset) {
        var params = {};
        angular.copy(docsParams, params);
        params.mailbox = mailbox;
        params.limit = 10;
        params.offset = offset;
        params.filterId = "open";
        params.isAssigned = false;
        return params;
    }

    function getTenantDocsParams(offset, tenantId, filterId) {

        if (filterId === "all") {
            var params = {};
            angular.copy(tenantsDocsParams, params);
            params.id = tenantId;
            params.offset = offset;
            params.forTenant = tenantId;
            params.filterId = "all";
            return params;
        }
        else if (filterId === "pending") {
            return getTenantDocsPending(offset, tenantId)
        }

        else if (filterId === "delivered") {
            return getTenantDocsDelivered(offset, tenantId);
        }

        else if (filterId === "paid") {
            return getTenantDocsPaid(offset, tenantId);
        }

        else if (filterId === "unpaid") {
            return getTenantDocsUnpaid(offset, tenantId);
        }
    }

    function getTenantDocsPending(offset, tenantId) {
        var params = {};
        angular.copy(tenantsDocsParams, params);
        params.id = tenantId;
        params.mailbox = "pending";
        params.offset = offset;
        params.filterId = "pending"
        return params;
    }

    function getTenantDocsDelivered(offset, tenantId) {
        var params = {};
        angular.copy(tenantsDocsParams, params);
        params.filterId = "delivered";
        params.mailbox = "delivered";
        params.offset = offset;
        params.id = tenantId;
        return params;
    }

    function getTenantDocsPaid(offset, tenantId) {
        var params = {};
        angular.copy(tenantsDocsParams, params);
        params.filterId = "paid";
        params.mailbox = "delivered";
        params.offset = offset;
        params.id = tenantId;
        params.isPaid = true;
        return params;
    }

    function getTenantDocsUnpaid(offset, tenantId) {
        var params = {};
        angular.copy(tenantsDocsParams, params);
        params.filterId = "unpaid";
        params.mailbox = "delivered";
        params.offset = offset;
        params.id = tenantId;
        params.isPaid = false;
        return params;
    }

    function getReports(offset, date, filterId) {
        var year = dateUtils.getLocalYear(date);
        var month = dateUtils.getLocalMonth(date);
        var paid;
        if(filterId === "all") paid = null;
        else paid = filterId === "paid";

        var params = {};
        angular.copy(reportsDocsParams, params);
        params.year = year;
        params.month = month;
        params.isPaid = paid;
        params.offset = offset;
        params.filterId = filterId;
        return params;
    }

    function getListFilters() {
        return [
            {
                id           : "mine",
                title        : "Mine",
                toolbarTitle : "Assigned to me",
                isActive     : false,
                icon         : "fa-user"
            },
            {
                id           : "open",
                title        : "Open",
                toolbarTitle : "Open documents",
                isActive     : false,
                icon         : "fa-chain-broken"
            },
            {
                id           : "others",
                title        : "Others",
                toolbarTitle : "Assigned to others",
                isActive     : false,
                icon         : "fa-group"
            }
        ];
    }

    function getTenantsFilters() {
        return [
            {
                id           : "all",
                title        : "All",
                toolbarTitle : "Tenant documents",
                isActive     : false,
                icon         : "fa-files-o"
            },
            {
                id           : "pending",
                title        : "Pending",
                toolbarTitle : "Tenant pending documents",
                isActive     : false,
                icon         : "fa-spinner"
            },
            {
                id           : "delivered",
                title        : "Delivered",
                toolbarTitle : "Tenant delivered documents",
                isActive     : false,
                icon         : "fa-paper-plane-o"
            },
            {
                id           : "paid",
                title        : "Paid",
                toolbarTitle : "Tenant paid documents",
                isActive     : false,
                icon         : "fa-check-circle-o"
            },
            {
                id           : "unpaid",
                title        : "Unpaid",
                toolbarTitle : "Tenant unpaid documents",
                isActive     : false,
                icon         : "fa-times"
            }
        ]
    }

    function getReportsFilters() {
        return [
            {
                id           : "all",
                title        : "All",
                toolbarTitle : "All invoices",
                isActive     : false,
                icon         : "fa-files-o"
            },
            {
                id           : "paid",
                title        : "Paid",
                toolbarTitle : "Paid invoices",
                isActive     : false,
                icon         : "fa-check-circle-o"
            },
            {
                id           : "unpaid",
                title        : "Unpaid",
                toolbarTitle : "Unpaid invoices",
                isActive     : false,
                icon         : "fa-times"
            }
        ];
    }

    function getListFilter(id) {
        var current = {};
        angular.forEach(getListFilters(), function(filter) {
            if (filter.id === id) {
                current = filter;
            }
        });
        return current;
    }

    function getTenantListFilter(id) {
        var current = {};
        angular.forEach(getTenantsFilters(), function(filter) {
            if (filter.id === id) {
                current = filter;
            }
        });
        return current;
    }

    function getReportsFilter(id) {
        var current = {};
        angular.forEach(getReportsFilters(), function(filter) {
            if (filter.id === id) {
                current = filter;
            }
        });
        return current;
    }

}
queryParams.$inject = ["nvl-dateutils"];
