(function(){
 'use strict';

meetingsApp.controller('SettingsController', function
  ($scope, $rootScope, $firebase, $timeout, $firebaseArray, $mdToast, $mdDialog, 
   $mdMedia, $filter, RefServices) {


firebase.auth().onAuthStateChanged(firebaseUser =>{
  if(firebaseUser !== null){

  	$scope.selectSettings = function(theme, day) {
  		RefServices.refSettings(firebaseUser).update({
	               'color1':        theme.color1,
	               'color2': 		theme.color2,
	               'day':    		day,
	               'dayId':  		day-1,
	               'image':  		theme.image,
	               'themeId':       theme.id
	            }).then(function() {
	            	//$scope.setAllCount(day);
	            	$scope.$emit('newSetAllCount', day);
				});
  	}

  	const settingsRef = RefServices.refSettings(firebaseUser);
	settingsRef.on('value', function (snap) {
		$timeout(function () {

			$scope.themeChecked  = snap.val().themeId;
			$scope.alarmChecked = snap.val().dayId;

		   	$scope.settingTheme = [
		   			{
		   				"name": "Pink",
		   				"theme": {
		   					"id": 0,
		   					"color1": "pink darken-1",
			   				"color2": "red lighten-2",
			   				"image": "back1.png"
		   				}
		   			},
		   			{
		   				"name": "Blue",
		   				"theme": {
		   					"id": 1,
			   				"color1": "light-blue darken-3",
			   				"color2": "light-blue lighten-2",
			   				"image": "back1.png"
		   				}
		   			},
		   			{
		   				"name": "Green",
		   				"theme": {
		   					"id": 2,
			   				"color1": "green darken-3",
			   				"color2": "light-green",
			   				"image": "back1.png"
		   				}
		   			},
		   			{
		   				"name": "Cyan",
		   				"theme": {
		   					"id": 3,
			   				"color1": "teal darken-1",
			   				"color2": "teal accent-4",
			   				"image": "back1.png"
		   				}
		   			},
		   			{
		   				"name": "Brown",
		   				"theme": {
		   					"id": 4,
			   				"color1": "brown",
			   				"color2": "brown lighten-2",
			   				"image": "back1.png"
		   				}
		   			}
		   	];


		   	$scope.settingAlarm = [
		   			{
		   				"name": "One day",
		   				"day": 1
		   			},
		   			{
		   				"name": "Two day",
		   				"day": 2
		   			},
		   			{
		   				"name": "Three day",
		   				"day": 3
		   			},
		   			{
		   				"name": "Four day",
		   				"day": 4
		   			}
		   	];
		}, 0);
	}); //ref to setting

 }   //if statement
 }); //firebaseUser
 }); // SettingsController
}());