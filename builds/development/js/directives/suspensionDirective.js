(function(){
 'use strict';

	meetingsApp.directive("suspensionDirective", function() {
	  return {
	  	templateUrl: 'views/direvtives-views/suspension.dir.html',
	    scope: {
		  datameetings: '=datameetings',
		  firebaseUser: '=firebaseUser',
		  pageSize: '=pageSize',
		  query: '=query',
		  themeColor: '=themeColor'
		},
		controller: 'dataDirController'
	  }

	});

}());
