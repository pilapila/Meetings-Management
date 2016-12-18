(function(){
 'use strict';

	meetingsApp.directive("datatableDirective", function() {
	  return {
	  	templateUrl: 'views/direvtives-views/dataTable.dir.html',
	    scope: {
		  datameetings: '=datameetings',
		  firebaseUser: '=firebaseUser',
		  pageSize: '=pageSize',
		  query: '=query'
		},
		controller: 'dataDirController'
	  }

	});

}());