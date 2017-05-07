(function(){
 'use strict';

	meetingsApp.factory('Authentication', function($rootScope, $firebase, $location, $window, $timeout, RefServices){

		var myObject = {
			register : function(user) {
                return firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
                   .then(function(regUser){
					 	var messageListRef = RefServices.refCaller(regUser.uid);
						messageListRef.set({
						  'date': Firebase.ServerValue.TIMESTAMP,
	                      'regUser': regUser.uid,
	                      'firstname': user.firstname,
	                      'lastname': user.lastname,
	                      'age': user.age,
	                      'email': user.email,
	                      'settings': {
	                      	"dayId": 1,
	                      	"themeId": 5,
	                      	"anime": true,
	                      	"color1": "pink darken-1",
								"color2": "red lighten-2",
								"color3": "#14978a",
								"image": "back2.png",
								"day": 2
	                      }
						});
                   });
            },

			login : function(user) {
			    firebase.auth().onAuthStateChanged(firebaseUser =>{
                	if(firebaseUser){
			          var userData = RefServices.refCaller(firebaseUser.uid);
			          userData.on('value', function (snapshot) {
			          	$rootScope.currentUser = snapshot.val();
			          });
			        }
                });

                return firebase.auth().signInWithEmailAndPassword(user.email, user.password);

			}, //login

			logout : function() {
				return firebase.auth().signOut().then(function() {
							$timeout(function () {
						  		$window.location.reload();
						  	}, 500);
						}, function(error) {

						});
			}, //logout

			signedIn : function() {
				//console.dir($rootScope.currentUser.firstname);
				return firebase.auth().currentUser != null;
			} // singnedIn

		} //myObject

		$rootScope.signedIn = function() {
			return myObject.signedIn();
		} // add function to rootScope to find it in every where

		return myObject;

	  }); 
}());
