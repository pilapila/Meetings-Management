(function(){ 
  'use strict';
    
    meetingsApp.factory('RefServices', [ function($firebase) {
        return {
            refData: function(firebaseUser) {
                return firebase.database().ref().child('users/' + firebaseUser.uid + '/meetings'); 
            },
            meetData: function(firebaseUser, key) {
                return firebase.database().ref('users/' + firebaseUser.uid + '/meetings/' + key)
            }
        };
    }]);
})();
