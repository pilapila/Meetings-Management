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
				controller: passDataControllerInvitation,
				resolve: {
					meetingsList: function($firebaseArray, RefServices, $route) {

						return $firebaseArray(RefServices.refSync($route.current.params.userId)).$loaded();

					}
				}
			})
			.when('/settings', {
				templateUrl: 'views/settings.html',
				controller: 'SettingsController as vm'
			})
			.when('/profile', {
				templateUrl: 'views/profile.html',
				controller: 'ProfileController as vm'
			})
			.when('/suspension', {
				templateUrl: 'views/suspension.html',
				controller: 'MeetingsController'
			})
			.when('/cancelation', {
				templateUrl: 'views/cancelation.html',
				controller: 'MeetingsController'
			})
			.when('/record/:uId/:mId', {
				templateUrl: 'views/record.html',
				controller: passDataControllerRecord,
				resolve: {
					checkinsList: function($firebaseArray, RefServices, $route) {

						return $firebaseArray(RefServices.refCheckin($route.current.params.uId, $route.current.params.mId)).$loaded();

					}
				}
			})
			.when('/archives/:uId', {
				templateUrl: 'views/archive.html',
				controller: passDataControllerArchive,
				resolve: {
					archiveList: function($firebaseArray, RefServices, $route) {

						return $firebaseArray(RefServices.refArchive($route.current.params.uId)).$loaded();

					}
				}
			})
			.when('/recordDetails/:uId/:recordId', {
				templateUrl: 'views/recordDetails.html',
				controller: passDataControllerArchiveDetails,
				resolve: {
					archiveDetails: function($firebaseArray, RefServices, $route) {

						return $firebaseArray(RefServices.refArchiveKey($route.current.params.uId, $route.current.params.recordId)).$loaded();

					}
				}
			})
			.otherwise({
				redirectTo: '/login'
			});

	}]);


	function passDataControllerInvitation(meetingsList, passDataService) {
		passDataService.addProduct(meetingsList);
	};  // pass sync data from resolve to passDataService for invitation controller


	function passDataControllerRecord(checkinsList, passDataService) {
		passDataService.addProduct(checkinsList);
	};

	function passDataControllerArchive(archiveList, passDataService) {
		passDataService.addProduct(archiveList);
	};

	function passDataControllerArchiveDetails(archiveDetails, passDataService) {
		passDataService.addProduct(archiveDetails);
	};

	// function SyncAllData(syncAllList, passDataService) {
	// 	passDataService.addProduct(syncAllList);
	// };  // pass sync data from resolve to passDataService for meetings controller


	// resolve: {
	// 	syncAllList: function($firebaseObject, RefServices, $route) {

	// 		return $firebaseObject(RefServices.refCaller($route.current.params.userId)).$loaded();

	// 	}
	// }
