(function(){
 'use strict';

meetingsApp.controller('SettingsController', function
  ($scope, $rootScope, $firebase, $timeout, $firebaseArray, $mdToast, $mdDialog, 
   $mdMedia, $filter, RefServices) {


firebase.auth().onAuthStateChanged(firebaseUser =>{
  if(firebaseUser !== null){

  	$scope.selectSettings = function(theme, day) {
  		RefServices.refSettings(firebaseUser).update({
  				   'anime':         $scope.roleAnime,
	               'color1':        theme.color1,
	               'color2': 		theme.color2,
	               'color3': 		theme.color3,
	               'day':    		day,
	               'dayId':  		day-1,
	               'image':  		theme.image,
	               'themeId':       theme.id
	            }).then(function() {
	            	//$scope.setAllCount(day);
	            	$scope.$emit('newSetAllCount', day);
				});
  	}

  	$scope.changeAnime = function() {
  		$scope.roleAnime = !$scope.roleAnime;
  	}

  	const settingsRef = RefServices.refSettings(firebaseUser);
	settingsRef.on('value', function (snap) {
		$timeout(function () {

			$scope.themeChecked  = snap.val().themeId;
			$scope.alarmChecked = snap.val().dayId;
			$scope.roleAnime = snap.val().anime;
		   	$scope.settingTheme = [
		   			
		   			{
		   				"name": "Purple",
		   				"theme": {
		   					"id": 0,
		   					"color1": "pink darken-3",
			   				"color2": "red lighten-2",
			   				"color3": "#0195a7 ",
			   				"image": "back8.png"
		   				}
		   			},
		   			{
		   				"name": "Blue",
		   				"theme": {
		   					"id": 1,
			   				"color1": "cyan darken-3",
			   				"color2": "cyan lighten-1",
			   				"color3": "#daa310",
			   				"image": "back9.png"
		   				}
		   			},
		   			{
		   				"name": "Green",
		   				"theme": {
		   					"id": 2,
			   				"color1": "green darken-3",
			   				"color2": "light-green",
			   				"color3": "#b08155",
			   				"image": "back7.png"
		   				}
		   			},
		   			{
		   				"name": "Cyan",
		   				"theme": {
		   					"id": 3,
			   				"color1": "teal darken-1",
			   				"color2": "teal accent-4",
			   				"color3": "#8f6787",
			   				"image": "back6.png"
		   				}
		   			},
		   			{
		   				"name": "Brown",
		   				"theme": {
		   					"id": 4,
			   				"color1": "brown",
			   				"color2": "brown lighten-2",
			   				"color3": "#26a69a",
			   				"image": "back3.png"
		   				}
		   			},
		   			{
		   				"name": "Pink",
		   				"theme": {
		   					"id": 5,
		   					"color1": "pink darken-1",
			   				"color2": "red lighten-2",
			   				"color3": "#14978a",
			   				"image": "back2.png"
		   				}
		   			},
		   			{
		   				"name": "Red",
		   				"theme": {
		   					"id": 6,
		   					"color1": "red darken-4",
			   				"color2": "red lighten-2",
			   				"color3": "#688f67",
			   				"image": "back5.png"
		   				}
		   			},
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