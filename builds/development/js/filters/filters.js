meetingsApp.filter("ShortName", function () {
	return function (input) {
		var shortName = "";
    	var nameLength = input.length;
    	var showCountName = nameLength - 15;

    	if (nameLength > 15) {
    		shortName = input.substr(0, nameLength-showCountName) + ' ...';
    	} else {
    		shortName = input;
    	}

		return shortName
	};
});