(function(){
 'use strict';

	meetingsApp.directive("datatableDirective", function() {
	  return {
	  	templateUrl: 'views/direvtives-views/dataTable.dir.html',
	    scope: {
		  datameetings: '=datameetings',
		  pageSize: '=pageSize',
		  query: '=query',
		  themeColor: '=themeColor',
		  animeAction: '=animeAction'
		},
		controller: 'dataDirController'
	  }

	});

}());
