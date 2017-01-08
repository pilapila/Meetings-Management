meetingsApp.controller('RecordController', function
  ( $scope, $rootScope, $firebase, $timeout, $firebaseArray, 
  	$mdToast, $mdDialog, $routeParams, $mdMedia, $filter, RefServices, productListPageCount) {


  	$scope.whichmeeting = $routeParams.mId;
  	$scope.whichuser = $routeParams.uId;
    $scope.isThereOne = false;



    RefServices.refMeetChecked($scope.whichuser, $scope.whichmeeting)
      .on('value', function (snap) {
        $timeout(function () {
          $scope.meetingChecked = snap.val();
        }, 0);
    }); // Ref to meeting's information 


    RefServices.refSummery($scope.whichuser, $scope.whichmeeting)
      .on('value', function (snap) {
        $timeout(function () {
            $scope.summery = snap.val().summery;
            if ($scope.summery) {
              $scope.editSummery = true;
              $("#textarea1").next().addClass("active");
            } else {
              $scope.editSummery = false;
              $("#textarea1").next().removeClass("active");
            }
        }, 0);
    }); // Ref to summery information 



    const audienceListRef = RefServices.refAudience($scope.whichuser, $scope.whichmeeting);
    audienceListRef.on('value', function (snap) {
          $timeout(function () {
            
            $scope.audienceListSync = $firebaseArray(audienceListRef);
            $scope.audienceListSync.$loaded().then(function (list) {

              if ($scope.audienceListSync.length == 0) {
                $scope.isThereOnePresent = false;
              } else {
                $scope.isThereOnePresent = true;
              }

            }.bind(this));
          }, 0);
    });  // ref to audience's list 


    const absentListRef = RefServices.refAbsence($scope.whichuser, $scope.whichmeeting);
    absentListRef.on('value', function (snap) {
          $timeout(function () {
            
            $scope.absentListSync = $firebaseArray(absentListRef);
            $scope.absentListSync.$loaded().then(function (list) {
              if ($scope.absentListSync.length == 0) {
                $scope.isThereOneAbsent = false;
              } else {
                $scope.isThereOneAbsent = true;
              }
            }.bind(this));
          }, 0);
    });  // ref to absent's list  

    const directivesListRef = RefServices.refDirectiveRecord($scope.whichuser, $scope.whichmeeting); 
    directivesListRef.on('value', function (snap) {
          $timeout(function () {
            
            $scope.dataRecord = $firebaseArray(directivesListRef);
            $scope.dataRecord.$loaded().then(function (list) {
              if ($scope.dataRecord.length == 0) {
                $scope.isThereOneDirective = false;
              } else {
                $scope.isThereOneDirective = true;
              }
            }.bind(this));
          }, 0);
    });  // ref to absent's list  


  $scope.refFindRecordList = function() {
    const checkinRecordRef = RefServices.refCheckin($scope.whichuser, $scope.whichmeeting);
    checkinRecordRef.on('value', function (snap) {
        $timeout(function () {
          $scope.usersRecord = $firebaseArray(checkinRecordRef);
          $scope.usersRecord.$loaded().then(function (list) {

            $scope.usersShortRecord = [];

            for (var i = 0; i < $scope.usersRecord.length; i++) {
              if($scope.usersRecord[i].send && !$scope.usersRecord[i].reject) {
                $scope.usersShortRecord.push({
                  "regUser":   $scope.usersRecord[i].regUser,
                  "firstname": $scope.usersRecord[i].firstname,
                  "lastname":  $scope.usersRecord[i].lastname,
                  "image":     $scope.usersRecord[i].image,
                });
              } // end if
            }; // end for
          
            for (var j = 0; j < $scope.audienceListSync.length; j++) {
              for (var i = 0; i < $scope.usersShortRecord.length; i++) {
                if ($scope.usersShortRecord[i].regUser === $scope.audienceListSync[j].regUser) {
                  $scope.usersShortRecord.splice(i,1);
                } // end if
              }; // end for
            }; // end for

            for (var j = 0; j < $scope.absentListSync.length; j++) {
              for (var i = 0; i < $scope.usersShortRecord.length; i++) {
                if ($scope.usersShortRecord[i].regUser === $scope.absentListSync[j].regUser) {
                  $scope.usersShortRecord.splice(i,1);
                } // end if
              }; // end for
            }; // end for

            if ($scope.usersShortRecord.length == 0) {
              $scope.showCheckinList = false;
            } else {
              $scope.showCheckinList = true;
            }

          }.bind(this));
        }, 0);
      });  // Ref to all user and short them
  }
    
  $scope.refFindRecordList();

  $scope.addAudience = function() {
    var dataList = $scope.dataAudience;
    $timeout(function () {      

      for (var i = 0; i < dataList.length; i++) {
        for (var j = 0; j < $scope.usersRecord.length; j++) {
          if ($scope.usersRecord[j].send && $scope.usersRecord[j].regUser == $scope.dataAudience[i].regUser) {
                RefServices.refAudience($scope.whichuser, $scope.whichmeeting).push().set({
                  'firstname':         $scope.dataAudience[i].firstname,
                  'lastname':          $scope.dataAudience[i].lastname,
                  'dateEnter':         firebase.database.ServerValue.TIMESTAMP,
                  'image':             $scope.dataAudience[i].image,
                  'regUser':           $scope.dataAudience[i].regUser,
                  'accept':            $scope.usersRecord[j].accept,
                });
          } // end if
        }; // end for
      };  // end for all

      $scope.refFindRecordList();
      $scope.dataAudience = [];
      $scope.showAgreeAudience = 0;
      $scope.showToast('Added Audience', 'md-toast-add');

    }, 0);
    
  };  // Add Audience 


  $scope.deleteAudience = function(event, checked) {
    var confirm = $mdDialog.confirm()
        .title('Are you sure you want to delete ' +  checked.firstname  + ' ' + checked.lastname + '?')
        .ok('Yes')
        .cancel('Cancel')
        .targetEvent(event);
      $mdDialog.show(confirm).then(function(){
        RefServices.refDeleteAudience($scope.whichuser, $scope.whichmeeting, checked.$id).remove();
        $scope.refFindRecordList();
        $scope.dataAudience = [];
        $scope.showToast(checked.firstname  + ' ' + checked.lastname + ' Deleted!', 'md-toast-delete');
      }, function(){

      });
  }; // delete Audience invitee



  $scope.addAbsent = function() {
    var dataList = $scope.dataAbsent;

    $timeout(function () {      

        for (var i = 0; i < dataList.length; i++) {
          for (var j = 0; j < $scope.usersRecord.length; j++) {
            if ($scope.usersRecord[j].send && $scope.usersRecord[j].regUser == $scope.dataAbsent[i].regUser) {
                  RefServices.refAbsence($scope.whichuser, $scope.whichmeeting).push().set({
                    'firstname':         $scope.dataAbsent[i].firstname,
                    'lastname':          $scope.dataAbsent[i].lastname,
                    'dateEnter':         firebase.database.ServerValue.TIMESTAMP,
                    'image':             $scope.dataAbsent[i].image,
                    'regUser':           $scope.dataAbsent[i].regUser,
                    'accept':            $scope.usersRecord[j].accept,
                  });
            } // end if
          }; // end for
        };  // end for all

      $scope.refFindRecordList();
      $scope.dataAbsent = [];
      $scope.showAgreeAbsent = 0;
      $scope.showToast('Added Absence', 'md-toast-add');
    }, 0);
    
  };  // Add Absent   

  
  $scope.deleteAbsent = function(event, checked) {
    var confirm = $mdDialog.confirm()
        .title('Are you sure you want to delete ' +  checked.firstname  + ' ' + checked.lastname + '?')
        .ok('Yes')
        .cancel('Cancel')
        .targetEvent(event);
      $mdDialog.show(confirm).then(function(){
        RefServices.refDeleteAbsence($scope.whichuser, $scope.whichmeeting, checked.$id).remove();
        $scope.refFindRecordList();
        $scope.dataAbsent = [];
        $scope.showToast(checked.firstname  + ' ' + checked.lastname + ' Deleted!', 'md-toast-delete');
      }, function(){

      });
  }; // delete Audience invitee



  $scope.addDirective = function(record) {
    console.log(record);

    RefServices.refDirectiveRecord($scope.whichuser, $scope.whichmeeting).push().set({
        'description':     record.recordDescription,
        'responsible':    record.responsible,
        'follow':         record.follow,
        'respite':        $( '#api_picker_clear' ).val()
      });

    $scope.showToast('Added Directive', 'md-toast-add');
    $scope.cancelDirective();


  }; // addDirective

  $scope.cancelDirective = function() {
    $("#recordDescription").val("");
    $("#recordDescription").next().removeClass("active");
    $("#responsible").val("");
    $("#responsible").next().removeClass("active");
    $("#follow").val("");
    $("#follow").next().removeClass("active");
    api_calendar_clear.clear();
  }; //cancelDirective


    $scope.deleteDirective = function(event, record) {

        var confirm = $mdDialog.confirm()
        .title('Are you sure you want to delete this directive?')
        .ok('Yes')
        .cancel('Cancel')
        .targetEvent(event);
        $mdDialog.show(confirm).then(function(){
          RefServices.refDirectiveRecordDelete($scope.whichuser, $scope.whichmeeting, record.$id).remove();
          $scope.showToast('Directive Deleted!', 'md-toast-delete');
        });

    };  // delete directive


    $scope.showDetails = function(event, record) {
      
      $scope.dialog = record;
        $mdDialog.show({
          controller: function () { 
            this.parent = $scope; 
            $scope.cancel = function() {
              $mdDialog.cancel();
        }; // cancel
        $scope.reject = function() {
          $mdDialog.cancel();
          $scope.rejectMeeting(event, record, $rootScope.themeColor3);
        }; // reject
          },
          controllerAs: 'ctrl',
          parent: angular.element(document.body),
          template: '<md-dialog aria-label="Directive details" style="border-radius: 12px;min-width:450px;max-width:500px;max-height:350px;">' +
                '<md-toolbar>' +
              '<div class="md-toolbar-tools left left" style="background-color:'+ $rootScope.themeColor3 +'">' +
                '<span flex><h6><img src="images/icon.png" style="margin-bottom:-5px;margin-right:5px"> Meeting details</h6></span>' +
              '</div>' +
            '</md-toolbar>' +
              '<md-dialog-content>' +
             ' <div class="md-dialog-content" style="vertical-align:bottom">' +
                '<p style="margin-top:0px;vertical-align:bottom">  <b style="color:#2ea6c8;vertical-align:bottom"><i class="small material-icons prefix" style="font-size:1.2rem;vertical-align:bottom">subject</i> Description Act: </b> {{ ctrl.parent.dialog.description }} </p>' +
                '<p style="margin-top:-10px;vertical-align:bottom"><b style="color:#2ea6c8;vertical-align:bottom"><i class="material-icons prefix" style="font-size:1.2rem;vertical-align:bottom">view_carousel</i> Responsible: </b> {{ ctrl.parent.dialog.responsible }} </p>' +
                '<p style="margin-top:-10px;vertical-align:bottom"><b style="color:#2ea6c8;vertical-align:bottom"><i class="material-icons prefix" style="font-size:1.2rem;vertical-align:bottom">perm_identity</i> Follow: </b> {{ ctrl.parent.dialog.follow }} </p>' +
                '<p style="margin-top:-10px;vertical-align:bottom"><b style="color:#2ea6c8;vertical-align:bottom"><i class="material-icons prefix" style="font-size:1.2rem;vertical-align:bottom">restore</i>Respite: </b> {{ ctrl.parent.dialog.respite | date }} </p>' +
              '</div>' +
            '</md-dialog-content>' +
            '<md-dialog-actions layout="row">' +
              '<md-button ng-click="ctrl.parent.reject()" ng-show="ctrl.parent.dialog.change">' +
                 'Reject' +
              '</md-button>' +
              '<md-button ng-click="ctrl.parent.cancel()">' +
                 'Ok' +
              '</md-button>' +
            '</md-dialog-actions>' +
          '</md-dialog>',
          targetEvent: event,
          clickOutsideToClose:true,
          fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
        })
        .then(function(answer) {
         
         }, function() {
          
        });
    }; // show record dialog



    $scope.addSummery = function() {
      console.log($scope.summery);
      RefServices.refSummery($scope.whichuser, $scope.whichmeeting).update({
                  'summery':      $scope.summery,
                  'dateEnter':    firebase.database.ServerValue.TIMESTAMP
              });
    };  // addSummery


    $scope.clearSummery = function() {
      $("#textarea1").val("");
      $("#textarea1").next().removeClass("active");
    }; // clear summery


















  $scope.showToast = function(message, color) {
      $mdToast.show(
        $mdToast.simple()
          .toastClass(color)
          .content(message)
          .position('top, right')
          .hideDelay(2000)
      );
  }; // Show Toast


  $scope.dataAudience = [];
  $scope.dataAbsent = [];

  $scope.clearDataAudience = function() {
    
    if ($scope.dataAudience.length) {
      $scope.showAgreeAudience = $scope.dataAudience.length;
    } else {
      $scope.showAgreeAudience = 0;
    }

  }; // clear data


  $scope.clearDataAbsent = function() {
    
    if ($scope.dataAbsent.length) {
      $scope.showAgreeAbsent = $scope.dataAbsent.length;
    } else {
      $scope.showAgreeAbsent = 0;
    }

  }; // clear data


  $scope.isCheckedAudience = function(id){
      var match = false;
      for(var i=0 ; i < $scope.dataAudience.length; i++) {
        if($scope.dataAudience[i].id == id){
          match = true;
        }
      }
      return match;
  };  // checkbox checking
  
  $scope.syncAudience = function(bool, item){
    if(bool){
      // add item
      $scope.dataAudience.push(item);
      $scope.showAgreeAudience = $scope.dataAudience.length;
    } else {
      // remove item
      for(var i=0 ; i < $scope.dataAudience.length; i++) {
        if($scope.dataAudience[i].regUser == item.regUser){
          $scope.dataAudience.splice(i,1);
          $scope.showAgreeAudience = $scope.dataAudience.length;
        }
      }      
    }
  };  // pic data from checkbox


  $scope.isCheckedAbsent = function(id){
      var match = false;
      for(var i=0 ; i < $scope.dataAbsent.length; i++) {
        if($scope.dataAbsent[i].id == id){
          match = true;
        }
      }
      return match;
  };  // checkbox checking
  
  $scope.syncAbsent = function(bool, item){
    if(bool){
      // add item
      $scope.dataAbsent.push(item);
      $scope.showAgreeAbsent = $scope.dataAbsent.length;
    } else {
      // remove item
      for(var i=0 ; i < $scope.dataAbsent.length; i++) {
        if($scope.dataAbsent[i].regUser == item.regUser){
          $scope.dataAbsent.splice(i,1);
          $scope.showAgreeAbsent = $scope.dataAbsent.length;
        }
      }      
    }
  };  // pic data from checkbox



  $('input#meetingPlaces').characterCounter();
  $('textarea#textarea1').characterCounter();

  var inputElement = $('.datepicker').pickadate({
    //selectMonths: true,
      min: new Date(),
      onClose: function() {
          $(document.activeElement).blur();
      },
      onSet: function (ele) {
         if(ele.select){
                this.close();
         }
      },
      selectMonths: true, // Creates a dropdown to control month
      selectYears: 15, // Creates a dropdown of 15 years to control year
      format: 'yyyy-mm-dd'
    });

  var api_picker_clear = $( '#api_picker_clear' ).pickadate({
      min: new Date(),
      onClose: function() {
          $(document.activeElement).blur();
      },
      onSet: function (ele) {
         if(ele.select){
                this.close();
         }
      },
      selectMonths: true, // Creates a dropdown to control month
      selectYears: 15, // Creates a dropdown of 15 years to control year
      format: 'yyyy-mm-dd'
    }),
    api_calendar_clear = api_picker_clear.data( 'pickadate' );

    $('.timepicker').pickatime({
        default: 'now',
        twelvehour: false, // change to 12 hour AM/PM clock from 24 hour
        donetext: 'OK',
        autoclose: true,
        vibrate: true // vibrate the device when dragging clock hand
    });

}); // CheckinsController








