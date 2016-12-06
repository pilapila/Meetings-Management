meetingsApp
    .filter("range", function ($filter) {
        return function (data, page, size) {
            var start_index = (page - 1) * size;
            if (data.length < start_index) {
                return [];
            } else {
                return $filter("limitTo")(data.splice(start_index), size);
            }
        };
    })
    .filter("pageCount", function () {
        return function (data, size) {
                var result = [];
                console.log(data.length);
                for (var i = 0; i < Math.ceil(data.length / size) ; i++) {
                    result.push(i);
                }
                return result;
        };
    })
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
    });