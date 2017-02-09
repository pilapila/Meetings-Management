(function(){
 'use strict';

	meetingsApp.directive("recordDetailsDirective", function() {
	  return {
	  	templateUrl: 'views/direvtives-views/recordDetailsTable.dir.html',
	    scope: {
		  directiveListRecord: '=directiveListRecord',
		  firebaseUser:        '=firebaseUser',
		  pageSize:            '=pageSize',
		  themeColor:          '=themeColor',
		},
		controller: 'dataDirController'
	  }

	});

}());
