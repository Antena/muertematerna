(function() {

    var apiKey = null;
    var _queryUrlHead = 'https://www.googleapis.com/fusiontables/v1/query?sql=';
    // var _queryUrlHead = 'https://fusiontables.googleusercontent.com/fusiontables/api/query?sql=';
    var _queryUrlTail = '&jsonCallback=?';

    ftClient = {
        version : "0.1"
    }

    ftClient.setKey =  function(key){
        this.apiKey = key;
    }

    ftClient.query = function(queryObject, success, error) {
        var self = this;
        if(!self.apiKey)
            throw "You must set an api key ";

        error = error || function() { throw "AJAX error!"; }

        try {
            jQuery.ajax({
                type: "GET",
                url:  self.queryUrl(queryObject),
                dataType: "jsonp",
                success: success,
                error: error
            });
        } catch (e) {
            throw "You must include jQuery to use ftClient!";
        }
    }

    ftClient.queryUrl = function(queryObject) {
        var query = "SELECT ";

        if(queryObject.selectAgreggate){
            query+=queryObject.selectAgreggate.join(",");
        }
        
        if (queryObject.select) {
            if(queryObject.selectAgreggate){
                query+=', ';
            }
            query += " '" + queryObject.select.join("','") + "' " 
        }

        query+="FROM " + queryObject.from;

        if (queryObject.where) {
            query += " WHERE " + queryObject.where;
        }

        if (queryObject.orderBy) {
            query += " ORDER BY " + queryObject.orderBy;
        }

        if (queryObject.groupBy) {
            query += " GROUP BY '" +  queryObject.groupBy.join("','") + "' ";
        }

        if (queryObject.offset != null && queryObject.offset != undefined) {
            query += " OFFSET " + queryObject.offset;
        }

        if (queryObject.limit) {
            query += " LIMIT " + queryObject.limit;
        }

        return encodeURI(_queryUrlHead + query + _queryUrlTail);
    }
})()