(function(){ 
  'use strict';
    
meetingsApp.factory('FindMeetAlrServices', 
    function() {

        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth()+1; //January is 0!
        var yyyy = today.getFullYear();
        if(dd<10) {
            dd='0'+dd
        } 
        if(mm<10) {
            mm='0'+mm
        } 
        today = yyyy+'-'+mm+'-'+dd;
        var alarm = 0;
        var meetingAlarm = [];

        return {
            findAlarms: function(meetings) {
                angular.forEach(meetings, function (value, key) {
                    var date1 = new Date(today);
                    var date2 = new Date(value.dateMeeting);
                    var timeDiff = Math.abs(date2.getTime() - date1.getTime());
                    var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

                    if(diffDays <= 2){
                        alarm += 1;
                        meetingAlarm.push(key);
                    }
                }); 
                return alarm;
            }
        };
    });
})();

    
    