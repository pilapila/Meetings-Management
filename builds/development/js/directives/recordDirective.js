(function(){
 'use strict';

	meetingsApp.directive("recordDirective", function() {
	  return {
	  	templateUrl: 'views/direvtives-views/recordTable.dir.html',
	    scope: {
		  dataRecord:          '=dataRecord',
		  firebaseUser:        '=firebaseUser',
		  pageSize:            '=pageSize',
		  themeColor:          '=themeColor',
		  isThereOneDirective: '=isThereOneDirective',
		  alarmDirectiveColor: '=alarmDirectiveColor',
		  alarmDirectiveTitle: '=alarmDirectiveTitle'
		},
		controller: 'dataDirController'
	  }

	});

}());