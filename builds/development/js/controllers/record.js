(function(){
 'use strict';

 meetingsApp.controller('RecordController', function
  ( $scope, $rootScope, $firebase, $timeout, $firebaseArray,
  	$mdToast, $mdDialog, $routeParams, $mdMedia, $filter, RefServices,
    $location, productListPageCount, passDataService) {

    var vm = this;
    vm.refFindRecordList = refFindRecordList;
    vm.addAudience = addAudience;
    vm.deleteAudience = deleteAudience;
    vm.addAbsent = addAbsent;
    vm.deleteAbsent = deleteAbsent;
    vm.addDirective = addDirective;
    vm.cancelDirective = cancelDirective;
    vm.deleteDirective = deleteDirective;
    vm.showDetails = showDetails;
    vm.addSummery = addSummery;
    vm.clearSummery = clearSummery;
    vm.addGeneral = addGeneral;
    vm.getEditGeneral = getEditGeneral;
    vm.recordMeeting = recordMeeting;
    vm.showToast = showToast;
    vm.clearDataAudience = clearDataAudience;
    vm.clearDataAbsent = clearDataAbsent;
    vm.isCheckedAudience = isCheckedAudience;
    vm.syncAudience = syncAudience;
    vm.isCheckedAbsent = isCheckedAbsent;
    vm.syncAbsent = syncAbsent;

    vm.usersRecordBase = passDataService.getProducts(); // get sync data from meetingsController
    vm.usersRecord = vm.usersRecordBase[0];

  	vm.whichmeeting = $routeParams.mId;
  	vm.whichuser = $routeParams.uId;
    vm.isThereOne = false;
    vm.dateError = false;
    vm.required = '';
    vm.alarmGeneralColor = "#dcdcdc";
    vm.alarmGeneralTitle = "#505050";
    vm.alarmSummeryColor = "#dcdcdc";
    vm.alarmSummeryTitle = "#505050";
    vm.alarmAudienceColor = "#dcdcdc";
    vm.alarmAudienceTitle = "#2ba030";
    vm.alarmAbsentTitle = "#b5192f";
    $rootScope.alarmDirectiveColor = "#dcdcdc";
    $rootScope.alarmDirectiveTitle = "#505050";

    RefServices.refMeetChecked(vm.whichuser, vm.whichmeeting)
      .on('value', function (snap) {
        $timeout(function () {
          vm.meetingChecked = snap.val();
        }, 0);
    }); // Ref to meeting's information

    RefServices.refSummery(vm.whichuser, vm.whichmeeting)
      .on('value', function (snap) {
        $timeout(function () {
            if (snap.val()) {
              vm.summery = snap.val().summery;
              vm.editSummery = true;
              $("#textarea1").next().addClass("active");
            } else {
              vm.editSummery = false;
              $("#textarea1").next().removeClass("active");
            }
        }, 0);
    }); // Ref to summery information

    RefServices.refGeneral(vm.whichuser, vm.whichmeeting)
      .on('value', function (snap) {
        $timeout(function () {
            vm.generalInfo = snap.val();
            if (vm.generalInfo) {
              vm.editGeneral = true;
            } else {
              vm.editGeneral = false;
            }
        }, 0);
    }); // Ref to general information

    const audienceListRef = RefServices.refAudience(vm.whichuser, vm.whichmeeting);
    audienceListRef.on('value', function (snap) {
          $timeout(function () {
            vm.audienceArray = [];
            vm.audienceListSync = $firebaseArray(audienceListRef);
            vm.audienceListSync.$loaded().then(function (list) {
              if (vm.audienceListSync.length == 0) {
                vm.isThereOnePresent = false;
              } else {
                vm.isThereOnePresent = true;
                for (var i = 0; i < vm.audienceListSync.length; i++) {
                  vm.audienceArray.push({
                    'firstname': vm.audienceListSync[i].firstname,
                    'image':     vm.audienceListSync[i].image,
                    'lastname':  vm.audienceListSync[i].lastname
                  });
                };
              }
            }.bind(this));
          }, 0);
    });  // ref to audience's list

    const absentListRef = RefServices.refAbsence(vm.whichuser, vm.whichmeeting);
    absentListRef.on('value', function (snap) {
          $timeout(function () {
            vm.absentArray = [];
            vm.absentListSync = $firebaseArray(absentListRef);
            vm.absentListSync.$loaded().then(function (list) {
              if (vm.absentListSync.length == 0) {
                vm.isThereOneAbsent = false;
              } else {
                vm.isThereOneAbsent = true;
                for (var i = 0; i < vm.absentListSync.length; i++) {
                  vm.absentArray.push({
                    'firstname': vm.absentListSync[i].firstname,
                    'image':     vm.absentListSync[i].image,
                    'lastname':  vm.absentListSync[i].lastname
                  });
                }; // end for
              } // end if
            }.bind(this));
          }, 0);
    });  // ref to absent's list

    const directivesListRef = RefServices.refDirectiveRecord(vm.whichuser, vm.whichmeeting);
    directivesListRef.on('value', function (snap) {
          $timeout(function () {
            vm.directiveArray = [];
            vm.dataRecord = $firebaseArray(directivesListRef);
            vm.dataRecord.$loaded().then(function (list) {
              if (vm.dataRecord.length == 0) {
                vm.isThereOneDirective = false;
              } else {
                vm.isThereOneDirective = true;
                for (var i = 0; i < vm.dataRecord.length; i++) {
                  vm.directiveArray.push({
                    'description':    vm.dataRecord[i].description,
                    'responsible':    vm.dataRecord[i].responsible,
                    'follow':         vm.dataRecord[i].follow,
                    'respite':        vm.dataRecord[i].respite
                  });
                };
              }
            }.bind(this));
          }, 0);
    });  // ref to Directive list

  function refFindRecordList() {
        $timeout(function () {
            vm.usersShortRecord = [];
            for (var i = 0; i < vm.usersRecord.length; i++) {
              if(vm.usersRecord[i].send && !vm.usersRecord[i].reject) {
                vm.usersShortRecord.push({
                  "regUser":   vm.usersRecord[i].regUser,
                  "firstname": vm.usersRecord[i].firstname,
                  "lastname":  vm.usersRecord[i].lastname,
                  "image":     vm.usersRecord[i].image,
                });
              } // end if
            }; // end for

            for (var j = 0; j < vm.audienceListSync.length; j++) {
              for (var i = 0; i < vm.usersShortRecord.length; i++) {
                if (vm.usersShortRecord[i].regUser === vm.audienceListSync[j].regUser) {
                  vm.usersShortRecord.splice(i,1);
                } // end if
              }; // end for
            }; // end for

            for (var j = 0; j < vm.absentListSync.length; j++) {
              for (var i = 0; i < vm.usersShortRecord.length; i++) {
                if (vm.usersShortRecord[i].regUser === vm.absentListSync[j].regUser) {
                  vm.usersShortRecord.splice(i,1);
                } // end if
              }; // end for
            }; // end for

            if (vm.usersShortRecord.length == 0) {
              vm.showCheckinList = false;
            } else if (vm.usersShortRecord.length > 0) {
              vm.showCheckinList = true;
            }

        }, 0);
  }; // refFindRecordList

  refFindRecordList();

  function addAudience() {
    vm.alarmAudienceColor = "#dcdcdc";
    vm.alarmAudienceTitle = "#2ba030";
    vm.alarmAbsentTitle = "#b5192f";
    var dataList = vm.dataAudience;
    $timeout(function () {
      for (var i = 0; i < dataList.length; i++) {
        for (var j = 0; j < vm.usersRecord.length; j++) {
          if (vm.usersRecord[j].send && vm.usersRecord[j].regUser == vm.dataAudience[i].regUser) {
                RefServices.refAudience(vm.whichuser, vm.whichmeeting).push().set({
                  'firstname':         vm.dataAudience[i].firstname,
                  'lastname':          vm.dataAudience[i].lastname,
                  'dateEnter':         firebase.database.ServerValue.TIMESTAMP,
                  'image':             vm.dataAudience[i].image,
                  'regUser':           vm.dataAudience[i].regUser,
                  'accept':            vm.usersRecord[j].accept,
                });
          } // end if
        }; // end for
      };  // end for all

      refFindRecordList();
      vm.dataAudience = [];
      vm.showAgreeAudience = 0;
      showToast('Added Audience', 'md-toast-add');

    }, 0);
  };  // Add Audience

  function deleteAudience(event, checked) {
    var confirm = $mdDialog.confirm()
        .title('Are you sure you want to delete ' +  checked.firstname  + ' ' + checked.lastname + '?')
        .ok('Yes')
        .cancel('Cancel')
        .targetEvent(event);
      $mdDialog.show(confirm).then(function(){
        RefServices.refDeleteAudience(vm.whichuser, vm.whichmeeting, checked.$id).remove();
        refFindRecordList();
        vm.dataAudience = [];
        showToast(checked.firstname  + ' ' + checked.lastname + ' Deleted!', 'md-toast-delete');
      }, function(){
      });
  }; // delete Audience invitee

  function addAbsent() {
    var dataList = vm.dataAbsent;
    $timeout(function () {
        for (var i = 0; i < dataList.length; i++) {
          for (var j = 0; j < vm.usersRecord.length; j++) {
            if (vm.usersRecord[j].send && vm.usersRecord[j].regUser == vm.dataAbsent[i].regUser) {
                  RefServices.refAbsence(vm.whichuser, vm.whichmeeting).push().set({
                    'firstname':         vm.dataAbsent[i].firstname,
                    'lastname':          vm.dataAbsent[i].lastname,
                    'dateEnter':         firebase.database.ServerValue.TIMESTAMP,
                    'image':             vm.dataAbsent[i].image,
                    'regUser':           vm.dataAbsent[i].regUser,
                    'accept':            vm.usersRecord[j].accept,
                  });
            } // end if
          }; // end for
        };  // end for all
      vm.alarmAudienceColor = "#dcdcdc";
      vm.alarmAudienceTitle = "#2ba030";
      vm.alarmAbsentTitle = "#b5192f";
      refFindRecordList();
      vm.dataAbsent = [];
      vm.showAgreeAbsent = 0;
      showToast('Added Absence', 'md-toast-add');
    }, 0);
  };  // Add Absent

  function deleteAbsent(event, checked) {
    var confirm = $mdDialog.confirm()
        .title('Are you sure you want to delete ' +  checked.firstname  + ' ' + checked.lastname + '?')
        .ok('Yes')
        .cancel('Cancel')
        .targetEvent(event);
      $mdDialog.show(confirm).then(function(){
        RefServices.refDeleteAbsence(vm.whichuser, vm.whichmeeting, checked.$id).remove();
        refFindRecordList();
        vm.dataAbsent = [];
        showToast(checked.firstname  + ' ' + checked.lastname + ' Deleted!', 'md-toast-delete');
      }, function(){
      });
  }; // delete Audience invitee

  function addDirective(record) {
    if( $("#api_picker_clear").val() == '' ) {
      vm.dateError = true;
      $("#api_picker_clear").next().addClass("active");
    } else {
      vm.dateError = false;
      $("#api_picker_clear").next().removeClass("active");
      $("#api_picker_clear").next().removeClass('ui-state-highlight');
      RefServices.refDirectiveRecord(vm.whichuser, vm.whichmeeting).push().set({
          'description':     record.recordDescription,
          'responsible':    record.responsible,
          'follow':         record.follow,
          'respite':        $( '#api_picker_clear' ).val()
      });
      $rootScope.alarmDirectiveColor = "#dcdcdc";
      $rootScope.alarmDirectiveTitle = "#505050";
      showToast('Added Directive', 'md-toast-add');
      cancelDirective();
    }
  }; // addDirective

  function cancelDirective() {
    $("#recordDescription").val("");
    $("#recordDescription").next().removeClass("active");
    $("#responsible").val("");
    $("#responsible").next().removeClass("active");
    $("#follow").val("");
    $("#follow").next().removeClass("active");
    api_calendar_clear.clear();
    vm.dateError = false;
    $("#api_picker_clear").next().removeClass("active");
    $("#api_picker_clear").next().removeClass('ui-state-highlight');
  }; //cancelDirective

  function deleteDirective(event, record) {
      var confirm = $mdDialog.confirm()
      .title('Are you sure you want to delete this directive?')
      .ok('Yes')
      .cancel('Cancel')
      .targetEvent(event);
      $mdDialog.show(confirm).then(function(){
        RefServices.refDirectiveRecordDelete(vm.whichuser, vm.whichmeeting, record.$id).remove();
        showToast('Directive Deleted!', 'md-toast-delete');
      });
  };  // delete directive

  function showDetails(event, record) {
      $scope.dialog = record;
        $mdDialog.show({
          controller: function () {
              this.parent = $scope;
              $scope.cancel = function() {
                $mdDialog.cancel();
              }; // cancel
          },
          controllerAs: 'ctrl',
          parent: angular.element(document.body),
          template: '<md-dialog aria-label="Directive details" style="border-radius: 12px;min-width:450px;max-width:500px;max-height:350px;">' +
                '<md-toolbar>' +
              '<div class="md-toolbar-tools left left" style="background-color:'+ $rootScope.themeColor3 +'">' +
                '<span flex><h6><img src="images/icon.png" style="margin-bottom:-5px;margin-right:5px"> Directive details</h6></span>' +
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

    function addSummery() {
      RefServices.refSummery(vm.whichuser, vm.whichmeeting).update({
                  'summery':      vm.summery,
                  'dateEnter':    firebase.database.ServerValue.TIMESTAMP
              });
      vm.alarmSummeryColor = "#dcdcdc";
      vm.alarmSummeryTitle = "#505050";
    };  // addSummery

    function clearSummery() {
      $("#textarea1").val("");
      $("#textarea1").next().removeClass("active");
    }; // clear summery

    function addGeneral() {
      $(document).ready(function () {
          if ( $("#date-picker1").val() == '' ) {
              $("#date-picker1").next().addClass("active");
          }
          if ( $("#time-picker1").val() == '' ) {
              vm.required = "required!";
              $("#time-picker1").next().addClass("active");
          }
          if ( $("#time-picker2").val() == '' ) {
              vm.required = "required!";
              $("#time-picker2").next().addClass("active");
          }
      });

      if ( vm.general.places &&
           $("#date-picker1").val() &&
           $("#time-picker1").val() &&
           $("#time-picker2").val() ) {
                vm.alarmGeneralColor = "#dcdcdc";
                vm.alarmGeneralTitle = "#fff";
                RefServices.refGeneral(vm.whichuser, vm.whichmeeting).update({
                  'date':         $("#date-picker1").val(),
                  'startTime':    $("#time-picker1").val(),
                  'endTime':      $("#time-picker2").val(),
                  'places':       vm.general.places,
                  'dateEnter':    firebase.database.ServerValue.TIMESTAMP
                });
      } // end if
    }; // add general

    function getEditGeneral() {
        vm.editGeneral = false;
        $("#date-picker1").next().addClass("active");
        $("#time-picker1").next().addClass("active");
        $("#time-picker2").next().addClass("active");
        $("#place").next().addClass("active");
        var $inputDate = $('.datepicker').pickadate();
        var pickerDate = $inputDate.pickadate('picker');
        var setDatePicker = pickerDate.set("select", new Date(vm.generalInfo.date));
        var spliceTime1 = vm.generalInfo.startTime.slice(0, 5);
        var spliceTime2 = vm.generalInfo.endTime.slice(0, 5);
        var time1 = new Date(),
            s1 = spliceTime1 + " AM",
            parts1 = s1.match(/(\d+)\:(\d+) (\w+)/),
            hours1 = /am/i.test(parts1[3]) ? parseInt(parts1[1], 10) : parseInt(parts1[1], 10) + 12,
            minutes1 = parseInt(parts1[2], 10);
        var time2 = new Date(),
            s2 = spliceTime2 + " AM",
            parts2 = s2.match(/(\d+)\:(\d+) (\w+)/),
            hours2 = /am/i.test(parts2[3]) ? parseInt(parts2[1], 10) : parseInt(parts2[1], 10) + 12,
            minutes2 = parseInt(parts2[2], 10);
            time1.setHours(hours1);
            time1.setMinutes(minutes1);
            time2.setHours(hours2);
            time2.setMinutes(minutes2);
              vm.general = {
                 'date':         setDatePicker,
                 'startTime':    time1,
                 'endTime':      time2,
                 'places':       vm.generalInfo.places
              }
    }; // editGeneral

  function recordMeeting(event, showCheckinList) {
        if (!vm.generalInfo) {
          vm.alarmGeneralColor = "#d03468";
          vm.alarmGeneralTitle = "#fff";
          $mdDialog.show(
            $mdDialog.alert()
              .parent(angular.element(document.querySelector('#popupContainer')))
              .clickOutsideToClose(true)
              .textContent('You have to fill general information')
              .ok('Ok')
              .targetEvent(event)
          );
        } else if (showCheckinList) {
            vm.alarmAudienceColor = "#d03468";
            vm.alarmAudienceTitle = "#fff";
            vm.alarmAbsentTitle = "#fff";
            $mdDialog.show(
            $mdDialog.alert()
              .parent(angular.element(document.querySelector('#popupContainer')))
              .clickOutsideToClose(true)
              .textContent('You have not done all attendance list')
              .ok('Ok')
              .targetEvent(event)
            );
        } else if (!vm.summery) {
            vm.alarmSummeryColor = "#d03468";
            vm.alarmSummeryTitle = "#fff";
            $mdDialog.show(
            $mdDialog.alert()
              .parent(angular.element(document.querySelector('#popupContainer')))
              .clickOutsideToClose(true)
              .textContent('You have to fill meeting summery')
              .ok('Ok')
              .targetEvent(event)
            );
        } else if (!vm.isThereOneDirective) {
            $rootScope.alarmDirectiveColor = "#d03468";
            $rootScope.alarmDirectiveTitle = "#fff";
            $mdDialog.show(
            $mdDialog.alert()
              .parent(angular.element(document.querySelector('#popupContainer')))
              .clickOutsideToClose(true)
              .textContent('You have to add at least one directive')
              .ok('Ok')
              .targetEvent(event)
            );
        } else if ( vm.generalInfo &&
                    !showCheckinList &&
                    vm.summery &&
                    vm.isThereOneDirective) {
          $timeout(function () {
            for (var i = 0; i < vm.usersRecord.length; i++) {
              if ( vm.usersRecord[i].send &&
                   !vm.usersRecord[i].accept &&
                   !vm.usersRecord[i].reject ) {
                    RefServices.refDeleteInvitation(vm.usersRecord[i].regUser, vm.usersRecord[i].whichInvitation).remove();
                    RefServices.refArchive(vm.usersRecord[i].regUser).push().set({
                       'absence':           vm.absentArray,
                       'audience':          vm.audienceArray,
                       'directives':        vm.directiveArray,
                       'general':           vm.generalInfo,
                       'summery':           vm.summery,
                       'dateMeeting':       vm.meetingChecked.dateMeeting,
                       'name':              vm.meetingChecked.name,
                       'description':       vm.meetingChecked.description,
                       'time':              vm.meetingChecked.time,
                       'dateEnter':         firebase.database.ServerValue.TIMESTAMP,
                    });
              } else if ( vm.usersRecord[i].send &&
                          vm.usersRecord[i].accept ) {
                    RefServices.refMeetChecked(vm.usersRecord[i].regUser, vm.usersRecord[i].inviteeId).remove();
                    RefServices.refArchive(vm.usersRecord[i].regUser).push().set({
                       'absence':           vm.absentArray,
                       'audience':          vm.audienceArray,
                       'directives':        vm.directiveArray,
                       'general':           vm.generalInfo,
                       'summery':           vm.summery,
                       'dateMeeting':       vm.meetingChecked.dateMeeting,
                       'name':              vm.meetingChecked.name,
                       'description':       vm.meetingChecked.description,
                       'time':              vm.meetingChecked.time,
                       'dateEnter':         firebase.database.ServerValue.TIMESTAMP,
                    });
                } // end if
            }; // end for

                RefServices.refMeetChecked(vm.whichuser, vm.whichmeeting).remove();
                RefServices.refArchive(vm.whichuser).push().set({
                   'absence':           vm.absentArray,
                   'audience':          vm.audienceArray,
                   'directives':        vm.directiveArray,
                   'general':           vm.generalInfo,
                   'summery':           vm.summery,
                   'dateMeeting':       vm.meetingChecked.dateMeeting,
                   'name':              vm.meetingChecked.name,
                   'description':       vm.meetingChecked.description,
                   'time':              vm.meetingChecked.time,
                   'dateEnter':         firebase.database.ServerValue.TIMESTAMP,
                }).then(function() {
                    $location.path('/archives/' + vm.whichuser );
                });
              }, 0);
        } // end if
    }; //addRecord

  function showToast(message, color) {
      $mdToast.show(
        $mdToast.simple()
          .toastClass(color)
          .content(message)
          .position('top, right')
          .hideDelay(2000)
      );
  }; // Show Toast

  vm.dataAudience = [];
  vm.dataAbsent = [];

  function clearDataAudience() {
    if (vm.dataAudience.length) {
      vm.showAgreeAudience = vm.dataAudience.length;
    } else {
      vm.showAgreeAudience = 0;
    }
  }; // clear data

  function clearDataAbsent() {
    if (vm.dataAbsent.length) {
      vm.showAgreeAbsent = vm.dataAbsent.length;
    } else {
      vm.showAgreeAbsent = 0;
    }
  }; // clear data

  function isCheckedAudience(id){
      var match = false;
      for(var i=0 ; i < vm.dataAudience.length; i++) {
        if(vm.dataAudience[i].id == id){
          match = true;
        }
      }
      return match;
  };  // checkbox checking

  function syncAudience(bool, item){
    if(bool){
      // add item
      vm.dataAudience.push(item);
      vm.showAgreeAudience = vm.dataAudience.length;
    } else {
      // remove item
      for(var i=0 ; i < vm.dataAudience.length; i++) {
        if(vm.dataAudience[i].regUser == item.regUser){
          vm.dataAudience.splice(i,1);
          vm.showAgreeAudience = vm.dataAudience.length;
        }
      }
    }
  };  // pic data from checkbox

  function isCheckedAbsent(id){
      var match = false;
      for(var i=0 ; i < vm.dataAbsent.length; i++) {
        if(vm.dataAbsent[i].id == id){
          match = true;
        }
      }
      return match;
  };  // checkbox checking

  function syncAbsent(bool, item){
    if(bool){
      // add item
      vm.dataAbsent.push(item);
      vm.showAgreeAbsent = vm.dataAbsent.length;
    } else {
      // remove item
      for(var i=0 ; i < vm.dataAbsent.length; i++) {
        if(vm.dataAbsent[i].regUser == item.regUser){
          vm.dataAbsent.splice(i,1);
          vm.showAgreeAbsent = vm.dataAbsent.length;
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

}());
