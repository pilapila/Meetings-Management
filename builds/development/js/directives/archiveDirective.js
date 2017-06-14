(function(){
 'use strict';

	meetingsApp.directive("archiveDirective", function() {
	  return {
	  	templateUrl: 'views/direvtives-views/archive.dir.html',
	    scope: {
		  dataArchive: '=dataArchive',
		  firebaseUser: '=firebaseUser',
		  pageSize: '=pageSize',
		  themeColor: '=themeColor'
		},
		controller: 'dataDirController'
	  }

	});

}());
