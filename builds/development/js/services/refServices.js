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
            refCancellations: function(firebaseUser) {
                return firebase.database().ref('users/' + firebaseUser + '/cancellations'); 
            },
            refDeleteCancellations: function(firebaseUser, key) {
                return firebase.database().ref('users/' + firebaseUser + '/cancellations/' + key); 
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
            refSummery: function(checkUser, key) {
                return firebase.database().ref('users/' + checkUser + '/meetings/' + key + '/summery')
            },
            refGeneral: function(checkUser, key) {
                return firebase.database().ref('users/' + checkUser + '/meetings/' + key + '/general')
            },
            refAudience: function(checkUser, key) {
                return firebase.database().ref('users/' + checkUser + '/meetings/' + key + '/audience')
            },
            refDeleteAudience: function(checkUser, meetingKey, audienceKey) {
                return firebase.database().ref('users/' + checkUser + '/meetings/' + meetingKey + '/audience/' + audienceKey)
            },
            refAbsence: function(checkUser, key) {
                return firebase.database().ref('users/' + checkUser + '/meetings/' + key + '/absence')
            },
            refDirectiveRecord: function(checkUser, key) {
                return firebase.database().ref('users/' + checkUser + '/meetings/' + key + '/directives')
            },
            refDirectiveRecordDelete: function(checkUser, meetingKey, keyDirective) {
                return firebase.database().ref('users/' + checkUser + '/meetings/' + meetingKey + '/directives/' + keyDirective)
            },
            refDeleteAbsence: function(checkUser, meetingKey, absentKey) {
                return firebase.database().ref('users/' + checkUser + '/meetings/' + meetingKey + '/absence/' + absentKey)
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
            },
            refArchive: function(checkUser) {
                return firebase.database().ref('users/' + checkUser + '/archives')
            }

        };
    }]);
})();
