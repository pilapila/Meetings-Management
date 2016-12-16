meetingsApp.factory('Authentication', function($rootScope, $firebase, $location){

		var myObject = {
			register : function(user){
                return firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
                   .then(function(regUser){
					 var messageListRef = RefServices.refCaller(regUser.uid);
								messageListRef.set({
								  'date': Firebase.ServerValue.TIMESTAMP,
			                      'regUser': regUser.uid,
			                      'firstname': user.firstname,
			                      'lastname': user.lastname,
			                      'age': user.age,
			                      'email': user.email
								});
                   });
            },

			login : function(user){
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

			logout : function(){
				return firebase.auth().signOut();
			}, //logout

			signedIn : function(){
				return firebase.auth().currentUser != null;
			} // singnedIn

		} //myObject
		
		$rootScope.signedIn = function(){
			return myObject.signedIn();
		} // add function to rootScope to find it in every where

		return myObject;
         
	   }); 

