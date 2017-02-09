(function(){
 'use strict';

	meetingsApp.directive("cancelationDirective", function() {
	  return {
	  	templateUrl: 'views/direvtives-views/cancelation.dir.html',
	    scope: {
		  datameetings: '=datameetings',
		  firebaseUser: '=firebaseUser',
		  pageSize: '=pageSize',
		  themeColor: '=themeColor'
		},
		controller: 'dataDirController'
	  }

	});

}());
