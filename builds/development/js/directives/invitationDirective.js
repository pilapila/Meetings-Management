(function(){
 'use strict';

	meetingsApp.directive("invitationsDirective", function() {
	  return {
	  	templateUrl: 'views/direvtives-views/invitaions.dir.html',
	    scope: {
		  invitationsList: '=invitationsList',
		  firebaseUser: '=firebaseUser',
		  pageSize: '=pageSize',
		  query: '=query',
		  themeColor: '=themeColor'
		},
		controller: 'dataDirController'
	  }

	});

}());