'use strict';

angular
    .module('app.admin')
    .controller('AdminController', AdminController);

AdminController.$inject = ['adminService','interviewService', 'applicantService', '$filter', '$mdDialog', 'TEST', 'moment','$state','$stateParams', '$q', '$scope', '$mdToast'];

function AdminController(adminService, interviewService, applicantService, $filter, $mdDialog, TEST, moment, $state, $stateParams, $q, $scope, $mdToast)  {
    var vm = this;


    //Login vars/functions
    vm.verifyLogin = verifyLogin;
    vm.validatedLogin = false;
    vm.passwordField = "";
    vm.loginResponse = "";

    //Interview Tab variables
    vm.setDirection = setDirection;
    vm.dayClick = dayClick;
    vm.prevMonth = prevMonth;
    vm.prevMonth = nextMonth;
    vm.setDayContent = setDayContent;
    vm.showTimes = showTimes;
    vm.selectedDate = "";
    vm.currDate = {};
    vm.noInterviewsOnDay = {};
    vm.tooltips = true;
    vm.allInterviews = {};
    vm.formattedInterviews = {};


    //Applicant Tab Variables
    vm.querySearch = querySearch;
    vm.apps = [];
    vm.currApp = {};
    vm.displaySelApp = displaySelApp;
    vm.editAppInterview = editAppInterview;
    vm.deleteApp = deleteApp;
    vm.appActive = false;
    vm.addAppActive=false;
    vm.addingApp=false;
    vm.showAddCalendar = showAddCalendar;
    vm.addAppToDayClick = addAppToDayClick;
    vm.addNewApplicant = addNewApplicant;
    vm.newApplicant = {};
    vm.loadAllFullInterviews = loadAllFullInterviews;
    loadAllFullInterviews();
    vm.appCalDayClick = appCalDayClick;
    vm.appCalSetDayContent = appCalSetDayContent;
    vm.noAvailInterviewsOnDay = {};
    vm.moveIntActive = false;

    //Export Tab Variables
    vm.updateExportLists = updateExportLists;
    vm.allAppSort = [];
    vm.allIntSort = [];
    updateExportLists();

    //Reset Database Functions
    vm.clearAllApps = clearAllApps;
    vm.clearAllInterviews = clearAllInterviews;

    // For the Timer, to reload calendars
    $scope.$on('timer-tick', function (event, args) {
        getAllInterviewsFormattedObject();
        loadAllFullInterviews();
        updateExportLists();
    });


//LOGIN FUNCTION****************************************************************

    //Verify admin login
    function verifyLogin(){
      adminService.verifyLogin(vm.passwordField).then(function(resp) {
        console.log(resp);
        if(resp.isMatch){
          vm.loginResponse = "";
          vm.validatedLogin = true;
          getAllInterviewsFormattedObject();
          loadAllFullInterviews();
        }else{
          vm.loginResponse = "*Invalid Password*";
        }
      }, function(){
        $state.go('error');
      });
    }

//INTERVIEW TAB FUNCTIONS*******************************************************

    // Function to grab all interviews at once for Interview tab calendar
    function getAllInterviewsFormattedObject() {
        console.log('Grabbing all Interviews from server ADMIN');
        vm.allInterviews = interviewService.queryAll().then(function(resp){
            vm.formattedInterviews = {};
            _.forEach(resp, function(interview) {
              //Fill object with days that have interview, and their number of interview slots
                var formatDay = moment(interview.startDate).format('YYYY-MM-DD');
                var interviewDay = vm.formattedInterviews[formatDay];
                if(!interviewDay) {
                    interviewDay = {};
                    interviewDay.numInterviews = 0;
                    interviewDay.numInterviewsAvailable = 0;
                    vm.formattedInterviews[formatDay] = interviewDay;
                }
                interviewDay.numInterviews += 1;
                if(!interview.taken) {
                    interviewDay.numInterviewsAvailable += 1;
                }
            });
            //console.log(vm.formattedInterviews);
            // Broadcasts to the directive to reset the data on the calendar
            $scope.$broadcast("call-setData");
            return resp;
        }, function(){
          $state.go('error');
        });

    }

    /* Interview Tab Calendar Functions */
    function setDirection (direction) {
        vm.direction = direction;
        vm.dayFormat = direction === "vertical" ? "EEEE, MMMM d" : "d";
    }
    //Called when a day is clicked
    function dayClick(date) {
        vm.currDate = date;
        vm.selectedDate = $filter("date")(date, "MMMM d, y");
        //Load the time dialog
        showTimes(moment(date).format('YYYY-MM-DD'));
    }
    function prevMonth(data) {
        vm.msg = "You clicked (prev) month " + data.month + ", " + data.year;
    }

    function nextMonth(data) {
        vm.msg = "You clicked (next) month " + data.month + ", " + data.year;
    }

    //Sets the content of the day for the interview admin calendar
    function setDayContent(date) {
      var formatDay = moment(date).format('YYYY-MM-DD');
      var text = '';
      var interviewDay = vm.formattedInterviews[formatDay];
      if(!interviewDay) {
          text = '0 Interviews';
          vm.noInterviewsOnDay[formatDay] = true;
      }
      else {
          if(interviewDay.numInterviews > 0) {
              vm.noInterviewsOnDay[formatDay] = false;
          }
          else {
              vm.noInterviewsOnDay[formatDay] = true;
          }

          text = '' + interviewDay.numInterviews + ' Interviews';
      }

      return "<p>"+text+"</p>";

    }

      //Shows the interviews for a selected day on the Interview tab
      function showTimes(date) {
          interviewService.queryDayAdmin(date).then(function(resp) {
             //Add the pretty versions of the strings to present to user
             console.log(resp);
              var interviews = formatAdminIntDay(resp);
              //Show a popup dialog with the times, ability to add new times and delete current ones
              $mdDialog.show({
                  controller: DialogController,
                  templateUrl: 'admin/admin.interview.day.html',
                  parent: angular.element(document.body),
                  clickOutsideToClose:true,
                  bindToController: true,
                  locals: {
                      selectedDate: vm.selectedDate,
                      currDate: vm.currDate,
                      showTimes: vm.showTimes,
                      interviews: interviews
                  }
              })
                  .then(function(selectedInterview) {
                    //Closed the dialog
                    setDayContent(date);
                  }, function() {
                    //Clicked outside dialog
                      setDayContent(date);
                      vm.msg = 'You cancelled the dialog.';
                  });
          }, function(error) {
            $state.go('error');
          });
      }

      //function to format incoming interview days for interview calendar
      function formatAdminIntDay(interviews){
        _.forEach(interviews, function(interview){
            console.log(interview);
            interview.startDatePretty = moment(interview.startDate).format('h:mm A');
            interview.endDatePretty = moment(interview.endDate).format('h:mm A');
            if(!_.isEmpty(interview.applicant)){
              interview.applicantFull = interview.applicant.firstName + " " + interview.applicant.lastName;
            }else{
              interview.applicantFull = "<Empty>"
            }
        });
        //Sort by start time
        interviews.sort(function(a,b){
            if ( a.startDate < b.startDate )
              return -1;
            if ( a.startDate > b.startDate )
              return 1;
            return 0;
        });
        return interviews;
      }

      //Controller for Calendar on the Interview Tab
      function DialogController($scope, $mdDialog, selectedDate, currDate, showTimes, interviews, $mdToast) {
          $scope.selectedDate = selectedDate;
          $scope.currDate = currDate;
          $scope.interviews = interviews;
          $scope.showTimes = showTimes;
          $scope.startDate = new Date(selectedDate);
          $scope.endDate = new Date(selectedDate);
          $scope.numberOfSlots=1;
          $scope.newInterview = {};
          //Reload every 30 seconds
          $scope.$on('timer-tick', function (event, args) {
              // after first tick
              if(args.millis > 0) {
                  interviewService.queryDayAdmin(moment(selectedDate).format('YYYY-MM-DD')).then(function(resp) {
                      $scope.interviews = formatAdminIntDay(resp);
                      $mdToast.show(
                          $mdToast.simple({
                              textContent : 'The interview times have been refreshed!',
                              parent : $('[id^=dialogContent]'),
                              hideDelay: 3000,
                              position: 'top'
                          })
                      );
                  }, function(){
                    $state.go('error');
                  });
              }
          });

          //Delete an interview
          $scope.deleteInterview = function (interview){
              //Confirm dialog for interviews that have applicants
              $scope.showConfirm = function() {
                // Appending dialog to document.body to cover sidenav in docs app
                var confirm = $mdDialog.confirm()
                      .title('Are you sure?')
                      .textContent('The applicant scheduled for this interview will need to re-sign up. (Please use the Applicant Time to reasign them to another interview before deleting if you want to handle this yourself!!!!)')
                      .ariaLabel('Delete Interview')
                      .ok('Delete Interview')
                      .cancel('Cancel');

                $mdDialog.show(confirm).then(function() {
                  //Delete anyway
                    console.log(interview.id);
                    var index = $scope.interviews.indexOf(interview);

                    $scope.interviews.splice(index,1);
                    interviewService.removeInterview(interview.id).then(function(resp) {
                        $scope.showTimes(moment($scope.currDate).format('YYYY-MM-DD'));
                    }, function(){
                      $state.go('error');
                    });
                  }, function() {
                    //Cancel the delete
                  });
                };


              //If applicant is in slot, show confirm dialog
            if(interview.applicantFull !== "<Empty>"){
              $scope.showConfirm();
            }else{
              //Check if someone just filled in slot
              interviewService.getInterview(interview.id).then(function(resp) {
                  if(resp.taken) {
                    //If someone just took, then don't delete, tell admin to try again
                    $mdDialog.show(
                      $mdDialog.alert()
                        .parent(angular.element(document.querySelector('#popupContainer')))
                        .clickOutsideToClose(true)
                        .title('Uh oh!')
                        .textContent('It seems that an applicant has just selected this interview time, please confirm deletion by trying again.')
                        .ariaLabel('Alert Dialog Demo')
                        .ok('OK')
                    );
                    //reload calendar
                    getAllInterviewsFormattedObject();
                  }
                  else {
                    //Delete
                    console.log(interview.id);
                    var index = $scope.interviews.indexOf(interview);
                    $scope.interviews.splice(index,1);
                    interviewService.removeInterview(interview.id).then(function(resp) {});
                  }
              }, function(){
                $state.go('error');
              });
            }
          };
          $scope.hide = function() {
              getAllInterviewsFormattedObject();
              $mdDialog.hide();
          };

          $scope.cancel = function() {
              getAllInterviewsFormattedObject();
              $mdDialog.cancel();
          };
          //Adds an interview(s) to database
          $scope.addInterview = function (){
             $scope.newInterview = {
                "startDate": $scope.startDate.getTime(),
                "endDate": $scope.endDate.getTime(),
                "applicant": null,
                "isTaken": false
              };
            for(var i = 0; i < $scope.numberOfSlots; i++){
                interviewService.addInterview($scope.newInterview).then(function(resp) {
                  var addedInteview = resp;
                  addedInteview.startDatePretty = moment(addedInteview.startDate).format('h:mm A');
                  addedInteview.endDatePretty = moment(addedInteview.endDate).format('h:mm A');
                  addedInteview.applicantFull = "<Empty>";
                  $scope.interviews.push(addedInteview);
                }, function(){
                  $state.go('error');
                });
            }
          }
        }




//App tab stuff**************************************************************************

        //Called on page load. Loads all of the interviews that have applicants into global var
        function loadAllFullInterviews() {
              interviewService.getAllFullInterviews().then(function(resp) {
                var apps = [];
                //Add the pretty strings to apps
                _.forEach(resp, function(app){
                  //For searching
                  app.value = app.applicant.firstName.toLowerCase() + " " + app.applicant.lastName.toLowerCase() + " " + app.applicant.emailAddress.toLowerCase(),
                  //For displaying to screen
                  app.fullDisplayName = app.applicant.lastName + ", " + app.applicant.firstName + " @ " + app.applicant.emailAddress
                  apps.push(app);
                });
                //Sort by last name, then first name
                apps.sort(function(a,b){
                  if ( a.applicant.lastName.toLowerCase() < b.applicant.lastName.toLowerCase() )
                    return -1;
                  if ( a.applicant.lastName.toLowerCase() > b.applicant.lastName.toLowerCase() )
                    return 1;
                  if ( a.applicant.firstName.toLowerCase() < b.applicant.firstName.toLowerCase() )
                    return -1;
                  if ( a.applicant.firstName.toLowerCase() > b.applicant.firstName.toLowerCase() )
                    return 1;
                  return 0;
                });
                vm.apps = apps;
                console.log(vm.apps);
              }, function(){
                $state.go('error');
              });
        }

        //Used for the autocomplete to search through applicants
        function querySearch (query) {
          console.log(vm.apps);
          var results = query ? vm.apps.filter( createFilterFor(query) ) : vm.apps;
          return results;
        }
        //Query through, case insensitive
        function createFilterFor(query) {
          var lowercaseQuery = angular.lowercase(query);
          //Match anywhere in the value field
          return function filterFn(app) {
            return (app.value.indexOf(lowercaseQuery) >= 0);
          };
        }
        //Display the selected app in the input fields
        function displaySelApp(app){
          app.datePretty = moment(app.startDate).format('MM/D/YYYY');
          app.startDatePretty = moment(app.startDate).format('h:mm A');
          app.endDatePretty = moment(app.endDate).format('h:mm A');
          vm.currApp = app;
          vm.appActive = true;
        }
        //Show the move time calendar
        function editAppInterview(){
          vm.moveIntActive = true;
        }
        //Delete an applicant from the system
        function deleteApp(){
          //Confirm deletion
          var confirm = $mdDialog.confirm()
                .title('Are you sure?')
                .textContent('This action cannot be undone and the applicant will have to re-sign up. (This action does not delete the interview slot, use the Interview tab to delete interview slots.)')
                .ariaLabel('Delete Applicant')
                .ok('Delete Applicant')
                .cancel('Cancel');
          $mdDialog.show(confirm).then(function() {
              //Delete
              console.log(vm.currApp);
              var applicant = vm.currApp.applicant;
              interviewService.removeApplicantToInterview(vm.currApp, applicant).then(function(resp) {
                applicantService.removeApplicant(vm.currApp.applicant.id).then(function(resp){
                  //Reset the page
                  vm.currApp = {};
                  vm.selectedApplicant = "";
                  loadAllFullInterviews();
                  vm.appActive = false;
                  vm.moveIntActive = false;
                }, function(){
                  $state.go('error');
                });
              }, function(){
                $state.go('error');
              });
            }, function() {
              //JK, don't delete
            });
        }

        //Shows available interviews in the applicant tab for moving interviews
        function appCalDayClick(date) {
          console.log(vm.applicant);
            vm.msg = "You clicked " + $filter("date")(date, "MMM d, y h:mm:ss a Z");
            vm.selectedDate = $filter("date")(date, "MMMM d, y");
            vm.msg = vm.selectedDate;
            showAppCalTimes(moment(date).format('YYYY-MM-DD'));
        }
        //Load dialog with available times to move to
        function showAppCalTimes(date) {

            interviewService.queryDay(date).then(function(resp) {

              var interviews = formatInterviewsOnDay(resp);

                $mdDialog.show({
                    controller: appCalDialogController,
                    templateUrl: 'interview/interview.day.html',
                    parent: angular.element(document.body),
                    clickOutsideToClose:true,
                    bindToController: true,
                    locals: {
                        selectedDate: vm.selectedDate,
                        interviews: interviews
                    }
                })
                    .then(function(selectedInterview) {
                        //Move applicant to new interview time
                        if(!_.isEmpty(vm.currApp)) {
                          interviewService.getInterview(selectedInterview.id).then(function(resp) {
                              //If someone took slot while dialog open, retry
                              if(resp.taken) {
                                $mdDialog.show(
                                  $mdDialog.alert()
                                    .parent(angular.element(document.querySelector('#popupContainer')))
                                    .clickOutsideToClose(true)
                                    .title('Uh oh!')
                                    .textContent('It seems that an applicant has just selected this interview time, please try another slot.')
                                    .ariaLabel('Alert Dialog Demo')
                                    .ok('OK')
                                );
                                getAllInterviewsFormattedObject();
                              }
                              else {
                                //Move applicant
                                interviewService.removeApplicantToInterview(vm.currApp, vm.currApp.applicant).then(function(resp) {
                                  interviewService.assignApplicantToInterview(selectedInterview, vm.currApp.applicant).then(function(resp){
                                      //hide the move calendar, then set the active applicant to new interivew time
                                      getAllInterviewsFormattedObject();
                                      vm.moveIntActive = false;
                                      vm.currApp.datePretty = moment(selectedInterview.startDate).format('MM/D/YYYY');
                                      vm.currApp.startDatePretty = moment(selectedInterview.startDate).format('h:mm A');
                                      vm.currApp.endDatePretty = moment(selectedInterview.endDate).format('h:mm A');
                                      //Show confirmation dialog
                                      $mdDialog.show(
                                        $mdDialog.alert()
                                          .parent(angular.element(document.querySelector('#popupContainer')))
                                          .clickOutsideToClose(true)
                                          .title('Success!')
                                          .textContent('You have moved ' + vm.currApp.applicant.firstName + ' to new interview: ' + vm.currApp.datePretty + " at " + vm.currApp.startDatePretty)
                                          .ariaLabel('Alert Dialog Demo')
                                          .ok('Got it!')
                                      );
                                  });
                                });
                              }
                          });

                        }
                        else {
                            //No applicant to move to new interview
                        }
                    }, function() {
                        //Reload on Dialog cancel
                        getAllInterviewsFormattedObject();
                    });
            }, function(){
              $state.go('error');
            });
        }
        //Controller for the Add/Move calendar
        function appCalDialogController($scope, $mdDialog, $mdToast, selectedDate, interviews) {
            $scope.selectedDate = selectedDate;
            $scope.interviews = interviews;
            //Reload every 30 seconds
            $scope.$on('timer-tick', function (event, args) {
                // after first tick
                if(args.millis > 0) {
                    interviewService.queryDay(moment(selectedDate).format('YYYY-MM-DD')).then(function(resp) {
                        $scope.interviews = formatInterviewsOnDay(resp);
                        $mdToast.show(
                            $mdToast.simple({
                                textContent : 'The available interview times have been refreshed!',
                                parent : $('[id^=dialogContent]'),
                                hideDelay: 3000,
                                position: 'top'
                            })
                        );
                    }, function(){
                      $state.go('error');
                    });
                }
            });
            $scope.hide = function() {
                getAllInterviewsFormattedObject();
                $mdDialog.hide();
            };

            $scope.cancel = function() {
                getAllInterviewsFormattedObject();
                $mdDialog.cancel();
            };

            $scope.answer = function(answer) {
                $mdDialog.hide(answer);
            };
        }

        //Sets the content for the move calendar and add calendar
        function appCalSetDayContent(date) {
          var formatDay = moment(date).format('YYYY-MM-DD');
          var text = '';
          var interviewDay = vm.formattedInterviews[formatDay];
          if(!interviewDay) {
              text = '0 Open';
              vm.noAvailInterviewsOnDay[formatDay] = true;
          }
          else {
              if(interviewDay.numInterviewsAvailable > 0) {
                  vm.noAvailInterviewsOnDay[formatDay] = false;
              }
              else {
                  vm.noAvailInterviewsOnDay[formatDay] = true;
              }

              text = '' + interviewDay.numInterviewsAvailable + ' Open';
          }

          return "<p>"+text+"</p>";

          }



        //Stuff to add  new Applicant
        function addNewApplicant(){
          //Clear current app out
          vm.newApplicant = {};
          vm.currApp = {};
          vm.selectedApplicant = "";
          vm.moveIntActive = false;
          //display add forms
          vm.addingApp = true;
        }
        function showAddCalendar(){
          vm.addAppActive=true;
        }

        //Clicking a day in the add applicant calendar
        function addAppToDayClick(date) {
          console.log(vm.newApplicant);
            vm.msg = "You clicked " + $filter("date")(date, "MMM d, y h:mm:ss a Z");
            vm.selectedDate = $filter("date")(date, "MMMM d, y");
            vm.msg = vm.selectedDate;
            showNewAppTimes(moment(date).format('YYYY-MM-DD'));
        }
        //Show dialog for adding an applicant calendar
        function showNewAppTimes(date) {
            interviewService.queryDay(date).then(function(resp) {
                var interviews = formatInterviewsOnDay(resp);
                $mdDialog.show({
                    controller: appCalDialogController,
                    templateUrl: 'interview/interview.day.html',
                    parent: angular.element(document.body),
                    clickOutsideToClose:true,
                    bindToController: true,
                    locals: {
                        selectedDate: vm.selectedDate,
                        interviews: interviews
                    }
                })
                //Create new applicant, then assign to time
                    .then(function(selectedInterview) {
                        if(!_.isEmpty(vm.newApplicant)) {
                          interviewService.getInterview(selectedInterview.id).then(function(resp) {
                              //If someone took spot while dialog open
                              if(resp.taken) {
                                $mdDialog.show(
                                  $mdDialog.alert()
                                    .parent(angular.element(document.querySelector('#popupContainer')))
                                    .clickOutsideToClose(true)
                                    .title('Uh oh!')
                                    .textContent('It seems that an applicant has just selected this interview time, please try another slot.')
                                    .ariaLabel('Alert Dialog Demo')
                                    .ok('OK')
                                );
                                //reload
                                getAllInterviewsFormattedObject();
                              }
                              else {
                                //Add app to interview
                                applicantService.addApplicant(vm.newApplicant).then(function(resp) {
                                    //resp is the newly added applicant
                                    interviewService.assignApplicantToInterview(selectedInterview, resp).then(function(resp){
                                      //Reset content
                                      getAllInterviewsFormattedObject();
                                      vm.addingApp = false;
                                      vm.addAppActive = false;
                                      //Reload page
                                      loadAllFullInterviews();
                                      vm.currApp = {};
                                      selectedInterview.datePretty = moment(selectedInterview.startDate).format('MM/D/YYYY');
                                      selectedInterview.startDatePretty = moment(selectedInterview.startDate).format('h:mm A');
                                      selectedInterview.endDatePretty = moment(selectedInterview.endDate).format('h:mm A');
                                      //Show confirmation
                                      $mdDialog.show(
                                        $mdDialog.alert()
                                          .parent(angular.element(document.querySelector('#popupContainer')))
                                          .clickOutsideToClose(true)
                                          .title('Success!')
                                          .textContent('You have added ' + vm.newApplicant.firstName + ' to interview: ' + selectedInterview.datePretty + " at " + selectedInterview.startDatePretty)
                                          .ariaLabel('Alert Dialog Demo')
                                          .ok('Got it!')
                                      );
                                  });
                                });
                              }
                            });
                        }
                        else {
                            vm.msg = 'No applicant was available to be sent. Please try logging in again!';
                        }
                    }, function() {
                        vm.msg = 'You cancelled the dialog.';
                        getAllInterviewsFormattedObject();
                    });
            }, function(){
              $state.go('error');
            });
        }

        //Format raw interviews on app page
        function formatInterviewsOnDay(interviews) {
            _.forEach(interviews, function(interview){
                console.log(interview);
                interview.startDatePretty = moment(interview.startDate).format('h:mm A');
                interview.endDatePretty = moment(interview.endDate).format('h:mm A');
            });
            interviews.sort(function(a,b){
                if ( a.startDate < b.startDate )
                    return -1;
                if ( a.startDate > b.startDate )
                    return 1;
                return 0;
            });

            return interviews;
        }



////*********Reset Table functions

      //Delete all apps from database
      function clearAllApps(){
            var confirm = $mdDialog.prompt()
              .title('ARE YOU SURE?????')
              .textContent('Deleting All Apps cannot be undone. This will make all interview slots empty. THIS SHOULD NOT BE DONE BEFORE SELECTIONS FOR COUNSELOR APPS!!!!! Type "DELETE" in the prompt below to confirm delete:')
              .placeholder('Enter Confirmation Here')
              .ariaLabel('Clear all the apps')
              .ok('DELETE')
              .cancel('Cancel');

            $mdDialog.show(confirm).then(function(result) {
              //DELETE
              if(result != "DELETE"){
                //You cant spell, don't delete
                $mdDialog.show(
                  $mdDialog.alert()
                    .parent(angular.element(document.querySelector('#popupContainer')))
                    .clickOutsideToClose(true)
                    .title('Canceled!')
                    .textContent('You did not properly confirm deletion. No Action was taken.')
                    .ariaLabel('Alert Dialog Demo')
                    .ok('OK')
                );
              }else{
                //ACTUALLY DELETE
                interviewService.removeAllAppsFromInterviews().then(function(resp){
                  applicantService.deleteAllApplicants().then(function(resp){
                    $mdDialog.show(
                      $mdDialog.alert()
                        .parent(angular.element(document.querySelector('#popupContainer')))
                        .clickOutsideToClose(true)
                        .title('Deleted!')
                        .textContent('You deleted All Applicants from the Database.')
                        .ariaLabel('Alert Dialog Demo')
                        .ok('OK')
                    );
                  }, function(){
                    $state.go('error');
                  });
                }, function(){
                  $state.go('error');
                });
              }
            }, function() {
              //Cancel
            });
      }

      //Delete all Interviews and Apps from database
      function clearAllInterviews(){
            // Appending dialog to document.body to cover sidenav in docs app
            var confirm = $mdDialog.prompt()
              .title('ARE YOU SURE?????')
              .textContent('Deleting All Interviews cannot be undone. This will clear ALL APPLICANTS AND INTERVIEWS. THIS SHOULD NOT BE DONE BEFORE SELECTIONS FOR COUNSELOR APPS!!!!! Type "DELETE" in the prompt below to confirm delete:')
              .placeholder('Enter Confirmation Here')
              .ariaLabel('Clear all the interviews')
              .ok('DELETE')
              .cancel('Cancel');

            $mdDialog.show(confirm).then(function(result) {
              //DELETE
              if(result != "DELETE"){
                $mdDialog.show(
                  $mdDialog.alert()
                    .parent(angular.element(document.querySelector('#popupContainer')))
                    .clickOutsideToClose(true)
                    .title('Canceled!')
                    .textContent('You did not properly confirm deletion. No Action was taken.')
                    .ariaLabel('Alert Dialog Demo')
                    .ok('OK')
                );
              }else{
                //ACTUALLY DELETE
                interviewService.deleteAllInterviews().then(function(resp){
                  applicantService.deleteAllApplicants().then(function(resp){
                    $mdDialog.show(
                      $mdDialog.alert()
                        .parent(angular.element(document.querySelector('#popupContainer')))
                        .clickOutsideToClose(true)
                        .title('Deleted!')
                        .textContent('You deleted all Applicants and Interviews from Database.')
                        .ariaLabel('Alert Dialog Demo')
                        .ok('OK')
                    );
                  }, function(){
                    $state.go('error');
                  });
                }, function(){
                  $state.go('error');
                });
              }
            }, function() {
              //Cancel
            });
      }


      ///Export to EXCEL function
      //Get the latest database entries and put them in list to be exported to CSV
      function updateExportLists(){
        //Get list sorted by app
        interviewService.getAllFullInterviews().then(function(resp) {
          _.forEach(resp, function(interview){
              interview.datePretty = moment(interview.startDate).format('MM/D/YYYY');
              interview.startDatePretty = moment(interview.startDate).format('h:mm A');
              interview.endDatePretty = moment(interview.endDate).format('h:mm A');
              interview.applicant.fullName = interview.applicant.firstName + " " + interview.applicant.lastName;
              if(interview.applicant.gender){
                interview.applicant.genderPretty = "Male";
              }else{
                interview.applicant.genderPretty = "Female";
              }
          });
          resp.sort(function(a,b){
            if ( a.applicant.lastName.toLowerCase() < b.applicant.lastName.toLowerCase() )
              return -1;
            if ( a.applicant.lastName.toLowerCase() > b.applicant.lastName.toLowerCase() )
              return 1;
            if ( a.applicant.firstName.toLowerCase() < b.applicant.firstName.toLowerCase() )
              return -1;
            if ( a.applicant.firstName.toLowerCase() > b.applicant.firstName.toLowerCase() )
              return 1;
            return 0;
          });
          vm.allAppSort = resp;
        }, function(){
          $state.go('error');
        });
        //get intervies sorted by date
        interviewService.queryAll().then(function(resp) {
          _.forEach(resp, function(interview){
              interview.datePretty = moment(interview.startDate).format('MM/D/YYYY');
              interview.startDatePretty = moment(interview.startDate).format('h:mm A');
              interview.endDatePretty = moment(interview.endDate).format('h:mm A');
              if(!_.isEmpty(interview.applicant)){
                if(interview.applicant.gender){
                  interview.applicant.genderPretty = "Male";
                }else{
                  interview.applicant.genderPretty = "Female";
                }
                interview.applicant.fullName = interview.applicant.firstName + " " + interview.applicant.lastName;
              }
              else{
                interview.applicant = {};
                interview.applicant.fullName = ' ';
                interview.applicant.emailAddress = ' ';
                interview.applicant.genderPretty = ' ';
              }
          });
          resp.sort(function(a,b){
            if (a.startDate < b.startDate){
              return -1;
            }
            if (a.startDate > b.startDate){
              return -1;
            }
            if(!_.isEmpty(a.applicant.lastName) && !_.isEmpty(b.applicant.lastName)){
              if ( a.applicant.lastName.toLowerCase() < b.applicant.lastName.toLowerCase() )
                return -1;
              if ( a.applicant.lastName.toLowerCase() > b.applicant.lastName.toLowerCase() )
                return 1;
              if ( a.applicant.firstName.toLowerCase() < b.applicant.firstName.toLowerCase() )
                return -1;
              if ( a.applicant.firstName.toLowerCase() > b.applicant.firstName.toLowerCase() )
                return 1;
            }
            return 0;
          });
          vm.allIntSort = resp;
        }, function(){
          $state.go('error');
        });
      }


}
