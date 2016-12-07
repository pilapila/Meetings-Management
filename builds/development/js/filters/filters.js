meetingsApp
    .filter("ShortName", function () {
    	return function (input, count) {
    		var shortName = "";
        	var nameLength = input.length;
        	var showCountName = nameLength - count;

        	if (nameLength > count) {
        		shortName = input.substr(0, nameLength-showCountName) + ' ...';
        	} else {
        		shortName = input;
        	}

    		return shortName
    	};
    })
    .filter("range", function ($filter) {
        return function (data, page, size) {
            if (angular.isArray(data) && angular.isNumber(page) && angular.isNumber(size)) {
                var start_index = (page - 1) * size;
                if (data.length < start_index) {
                    return [];
                } else {
                    return $filter("limitTo")(data.splice(start_index), size);
                }
            } else {
                return data;
            }
        };
    })
    .filter("pageCount", function ($rootScope) {
        return function (data, size) {
            if (angular.isArray(data) && angular.isNumber(size)) {
                var result = [];
                for (var i = 0; i < Math.ceil(data.length / size) ; i++) {
                    result.push(i);
                }
                $rootScope.pageCount = result.length;
                return result;
            } else {
                return data;
            }
        };
    });