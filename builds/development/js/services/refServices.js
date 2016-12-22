(function(){ 
  'use strict';
    
    meetingsApp.factory('RefServices', [ function($firebase) {
        return {
            refUser: function() {
                return firebase.database().ref('users/'); 
            },
            refCaller: function(firebaseUser) {
                return firebase.database().ref('users/' + firebaseUser); 
            },
            refData: function(firebaseUser) {
                return firebase.database().ref('users/' + firebaseUser.uid + '/meetings'); 
            },
            refSettings: function(firebaseUser) {
                return firebase.database().ref('users/' + firebaseUser.uid + '/settings'); 
            },
            refSync: function(firebaseUser) {
                return firebase.database().ref('users/' + firebaseUser + '/meetings'); 
            },
            meetData: function(firebaseUser, key) {
                return firebase.database().ref('users/' + firebaseUser.uid + '/meetings/' + key)
            },
            refMeetChecked: function(checkUser, key) {
                return firebase.database().ref('users/' + checkUser + '/meetings/' + key)
            },
            refCheckin: function(checkUser, key) {
                return firebase.database().ref('users/' + checkUser + '/meetings/' + key + '/checkins')
            },
            refCheckedPerson: function(checkUser, keyMeet, keyCheck) {
                return firebase.database().ref('users/' + checkUser + '/meetings/' + keyMeet + '/checkins/' + keyCheck)
            },
            refCheckedDescription: function(checkUser, keyMeet, keyCheck) {
                return firebase.database().ref('users/' + checkUser + '/meetings/' + keyMeet + '/checkins/' + keyCheck + '/descriptions')
            },
            refDeleteDescription: function(checkUser, keyMeet, keyCheck, keyDes) {
                return firebase.database().ref('users/' + checkUser + '/meetings/' + keyMeet + '/checkins/' + keyCheck + '/descriptions/' + keyDes)
            },
            refInvitations: function(checkUser) {
                return firebase.database().ref('users/' + checkUser + '/invitations/')
            },
            refDeleteInvitation: function(checkUser, key) {
                return firebase.database().ref('users/' + checkUser + '/invitations/' + key)
            }

        };
    }]);
})();
