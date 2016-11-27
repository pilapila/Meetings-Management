meetingsApp.factory('addMeetingsServices', function($rootScope, $firebase, $location){

		var myObject = {
			addMeeting : function(meeting){
                return 
                	firebase.database().ref().child('/meetings').push()
                		.set({
			                'name':         meeting.name,
			                'invitees':     meeting.invitees,
			                'dateEnter':    Firebase.ServerValue.TIMESTAMP,
			                'dateMeeting':  meeting.date,
			                'description':  meeting.description
			              }).then(function() {
			            	  clearForm();
			              	  $scope.meeting = '';
			            	  $( $(this).data('click') ).trigger('click'); // close add meeting form
			              });
            }
		} //myObject

		return myObject;
         
	   }); 

