var meetingsApp = angular.module("meetingsApp", 
	["ngMaterial", "ngRoute", "firebase", "ngMessages"])
		.constant("productListPageCount", 5)
	
meetingsApp.config(["$routeProvider", "$mdThemingProvider",
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
			.when('/invitations', {
				templateUrl: 'views/invitations.html',
				controller: 'MeetingsController'
			})
			.otherwise({
				redirectTo: '/login'
			});

	}]);
