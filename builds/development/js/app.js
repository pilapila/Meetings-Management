var meetingsApp = angular.module("meetingsApp", ["ngMaterial", "ngRoute", "firebase", "ngMessages"])
	.constant("productListPageCount", 5)
    .config(["$routeProvider", "$mdThemingProvider",
	function($routeProvider, $mdThemingProvider) {
		
		$mdThemingProvider
			.theme('default')
			.primaryPalette('teal')
			.accentPalette('orange');

		$routeProvider
			.when('/login', {
				templateUrl: 'views/login.html',
				controller: 'RegistrationController'
			})
			.when('/register', {
				templateUrl: 'views/register.html',
				controller: 'RegistrationController'
			})
			.when('/meetings', {
				templateUrl: 'views/meetings.html',
				controller: 'MeetingsController'
			})
			.when('/alarm', {
				templateUrl: 'views/alarm.html',
				controller: 'MeetingsController'
			})
			.when('/expired', {
				templateUrl: 'views/expired.html',
				controller: 'MeetingsController'
			})
			.when('/checkins/:uId/:mId/:colorId', {
				templateUrl: 'views/checkins.html',
				controller: 'MeetingsController'
			})
			.when('/invitations/:userId', {
				templateUrl: 'views/invitations.html',
				controller: passDataController,
				resolve: {
					meetingsList: function($firebaseArray, RefServices, $route) {

						return $firebaseArray(RefServices.refSync($route.current.params.userId)).$loaded();
						
					}
				}
			})
			.when('/settings', {
				templateUrl: 'views/settings.html',
				controller: 'SettingsController'
			})
			.when('/profile', {
				templateUrl: 'views/profile.html',
				controller: 'ProfileController'
			})
			.when('/suspension', {
				templateUrl: 'views/suspension.html',
				controller: 'MeetingsController'
			})
			.when('/cancelation', {
				templateUrl: 'views/cancelation.html',
				controller: 'MeetingsController'
			})
			.otherwise({
				redirectTo: '/login'
			});

	}]);


	function passDataController(meetingsList, passDataService) {
		passDataService.addProduct(meetingsList); 
	};  // pass sync data from resolve to passDataService for invitation controller

	// function SyncAllData(syncAllList, passDataService) {
	// 	passDataService.addProduct(syncAllList); 
	// };  // pass sync data from resolve to passDataService for meetings controller


	// resolve: {
	// 	syncAllList: function($firebaseObject, RefServices, $route) {

	// 		return $firebaseObject(RefServices.refCaller($route.current.params.userId)).$loaded();
			
	// 	}
	// }