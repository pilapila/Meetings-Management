var meetingsApp = angular.module("meetingsApp", ["ngMaterial", "ngRoute"]);
	
meetingsApp.config(["$routeProvider", "$mdThemingProvider", 
	function($routeProvider, $mdThemingProvider) {
		
		$mdThemingProvider
			.theme('default')
			.primaryPalette('teal')
			.accentPalette('orange');

		$routeProvider
			.when('/login', {
				templateUrl: 'views/login.html'
				//controller: ''
			})
			.when('/register', {
				templateUrl: 'views/register.html'
				//controller: ''
			})
			.when('/meetings', {
				templateUrl: 'views/meetings.html'
				//controller: ''
			})
			.otherwise({
				redirectTo: '/login'
			})

	}]);
