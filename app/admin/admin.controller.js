'use strict';

angular
    .module('app.admin')
    .controller('AdminController', AdminController);

AdminController.$inject = ['interviewService', 'applicantService', '$filter', '$mdDialog', 'TEST', 'moment','$state','$stateParams', '$q'];

function AdminController(interviewService, applicantService, $filter, $mdDialog, TEST, moment, $state, $stateParams, $q)  {
    var vm = this;

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
    vm.interviewDayClick = interviewDayClick;
    vm.interviewSetDayContent = interviewSetDayContent;
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


    /* Interview Tab Calendar Functions */
    function setDirection (direction) {
        vm.direction = direction;
        vm.dayFormat = direction === "vertical" ? "EEEE, MMMM d" : "d";
    }
    //Called when a day is clicked
    function dayClick(date) {
        vm.currDate = date;
        vm.selectedDate = $filter("date")(date, "MMMM d, y");
        showTimes(moment(date).format('YYYY-MM-DD'));
    }
    function prevMonth(data) {
        vm.msg = "You clicked (prev) month " + data.month + ", " + data.year;
    }

    function nextMonth(data) {
        vm.msg = "You clicked (next) month " + data.month + ", " + data.year;
    }

    //Sets the content of the day boxes on the calendar
    function setDayContent(date) {
        var formatDay = moment(date).format('YYYY-MM-DD');
        return interviewService.queryDayAdmin(formatDay).then(function(resp) {
          var text = '';
          var count = 0;
            // If there are any interview returned
            if(resp.length > 0){
                console.log(date);
                vm.noInterviewsOnDay[formatDay] = false;
                _.forEach(resp, function(index){
                    count  = count + 1;
                });
                text = count + ' interivews';
            }
            //No interviews on that day
            else {
                 vm.noInterviewsOnDay[formatDay] = true;
                 text = '0 Interviews';
            }
            return "<p>"+text+"</p>";//Use blank to hold space on dates
        });

    }

      //Shows the interviews for a selected day on the Interview tab
      function showTimes(date) {
          interviewService.queryDayAdmin(date).then(function(resp) {
             //Add the pretty versions of the strings to present to user
              _.forEach(resp, function(interview){
                  console.log(interview);
                  interview.startDatePretty = moment(interview.startDate).format('h:mm a');
                  interview.endDatePretty = moment(interview.endDate).format('h:mm a');
                  if(!_.isEmpty(interview.applicant)){
                    interview.applicantFull = interview.applicant.firstName + " " + interview.applicant.lastName;
                  }else{
                    interview.applicantFull = "<Empty>"
                  }
              });
              //Sort by start time
              resp.sort(function(a,b){
                  if ( a.startDate < b.startDate )
                    return -1;
                  if ( a.startDate > b.startDate )
                    return 1;
                  return 0;
              });
              //Show a popup dialog with the times
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
                      interviews: resp
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

          });
      }

      //Controller for Calendar on the Interview Tab
      function DialogController($scope, $mdDialog, selectedDate, currDate, showTimes, interviews) {
          $scope.selectedDate = selectedDate;
          $scope.currDate = currDate;
          $scope.interviews = interviews;
          $scope.showTimes = showTimes;
          $scope.startDate = new Date(selectedDate);
          $scope.endDate = new Date(selectedDate);
          $scope.numberOfSlots=1;
          $scope.newInterview = {};

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
                  });
                }, function() {
                  //Cancel the delete
                });
              };


              //If applicant is in slot, show confirm dialog
            if(interview.applicantFull !== "<Empty>"){
              $scope.showConfirm();
            }else{
              //Delete without confirm for empty interviews
              console.log(interview.id);
              var index = $scope.interviews.indexOf(interview);

              $scope.interviews.splice(index,1);
              interviewService.removeInterview(interview.id).then(function(resp) {

              });
            }

          }
          $scope.hide = function() {
              setDayContent($scope.currDate);
              $mdDialog.hide();
          };

          $scope.cancel = function() {
              setDayContent($scope.currDate);
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
                  addedInteview.startDatePretty = moment(addedInteview.startDate).format('h:mm a');
                  addedInteview.endDatePretty = moment(addedInteview.endDate).format('h:mm a');
                  addedInteview.applicantFull = "<Empty>";
                  $scope.interviews.push(addedInteview);
                });
            }
          }
        }




//App page stuff**************************************************************************

        //Called on page load. Loads all of the interviews that have applicants into global var
        function loadAllFullInterviews() {
              //curr app to be examined
              vm.currApp = {};
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
          app.startDatePretty = moment(app.startDate).format('h:mm a');
          app.endDatePretty = moment(app.endDate).format('h:mm a');
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
                  vm.currApp = {};
                  loadAllFullInterviews();
                  vm.appActive = false;
                  vm.moveIntActive = false;
                });
              });
            }, function() {
              //Cancel the delete
            });
        }

        //Shows available interviews in the applicant tab for moving interviews
        function interviewDayClick(date) {
          console.log(vm.applicant);
            vm.msg = "You clicked " + $filter("date")(date, "MMM d, y h:mm:ss a Z");
            vm.selectedDate = $filter("date")(date, "MMMM d, y");
            vm.msg = vm.selectedDate;
            showIntTimes(moment(date).format('YYYY-MM-DD'));
        }
        //Load dialog with available times to move to
        function showIntTimes(date) {

            interviewService.queryDay(date).then(function(resp) {

                _.forEach(resp, function(interview){
                    console.log(interview);
                    interview.startDatePretty = moment(interview.startDate).format('h:mm a');
                    interview.endDatePretty = moment(interview.endDate).format('h:mm a');
                });
                resp.sort(function(a,b){
                    if ( a.startDate < b.startDate )
                      return -1;
                    if ( a.startDate > b.startDate )
                      return 1;
                    return 0;
                });

                $mdDialog.show({
                    controller: IntDialogController,
                    templateUrl: 'interview/interview.day.html',
                    parent: angular.element(document.body),
                    clickOutsideToClose:true,
                    bindToController: true,
                    locals: {
                        selectedDate: vm.selectedDate,
                        interviews: resp
                    }
                })
                    .then(function(selectedInterview) {
                        //Move applicant to new interview time
                        if(!_.isEmpty(vm.currApp)) {
                          interviewService.removeApplicantToInterview(vm.currApp, vm.currApp.applicant).then(function(resp) {
                            interviewService.assignApplicantToInterview(selectedInterview, vm.currApp.applicant).then(function(resp){
                                //hide the move calendar, then set the active applicant to new interivew time
                                interviewSetDayContent(date);
                                vm.moveIntActive = false;
                                vm.currApp.datePretty = moment(selectedInterview.startDate).format('MM/D/YYYY');
                                vm.currApp.startDatePretty = moment(selectedInterview.startDate).format('h:mm a');
                                vm.currApp.endDatePretty = moment(selectedInterview.endDate).format('h:mm a');
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
                        else {
                            //No applicant to move to new interview
                        }
                    }, function() {
                        vm.msg = 'You cancelled the dialog.';
                        interviewSetDayContent(date);
                    });
            }, function(error) {

            });
        }
        //Controller for the Move calendar
        function IntDialogController($scope, $mdDialog, selectedDate, interviews) {
            $scope.selectedDate = selectedDate;
            $scope.interviews = interviews;
            $scope.hide = function() {
                $mdDialog.hide();
            };

            $scope.cancel = function() {
                $mdDialog.cancel();
            };

            $scope.answer = function(answer) {
                $mdDialog.hide(answer);
            };
        }
        //Sets the content for the move calendar and add calendar
        function interviewSetDayContent(date) {
            var formatDay = moment(date).format('YYYY-MM-DD');
            return interviewService.queryDay(formatDay).then(function(resp) {
                var text = '';
                var count = 0;
                // If there are any interview returned
                if(resp.length > 0){
                    vm.noAvailInterviewsOnDay[formatDay] = false;
                    _.forEach(resp, function(index){
                        count  = count + 1;
                    });
                    text = count + ' open';
                }
                //no interviews
                else {
                    var day = moment(date).format('D');
                    vm.noAvailInterviewsOnDay[formatDay] = true;
                    text = '0 Open';
                }
                return "<p>"+text+"</p>";
            });
          }



        //Stuff to add  new Applicant
        function addNewApplicant(){
          vm.newApplicant = {};
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
                _.forEach(resp, function(interview){
                    console.log(interview);
                    interview.startDatePretty = moment(interview.startDate).format('h:mm a');
                    interview.endDatePretty = moment(interview.endDate).format('h:mm a');
                });
                resp.sort(function(a,b){
                    if ( a.startDate < b.startDate )
                      return -1;
                    if ( a.startDate > b.startDate )
                      return 1;
                    return 0;
                });
                $mdDialog.show({
                    controller: IntDialogController,
                    templateUrl: 'interview/interview.day.html',
                    parent: angular.element(document.body),
                    clickOutsideToClose:true,
                    bindToController: true,
                    locals: {
                        selectedDate: vm.selectedDate,
                        interviews: resp
                    }
                })
                //Create new applicant, then assign to time
                    .then(function(selectedInterview) {
                        if(!_.isEmpty(vm.newApplicant)) {
                          applicantService.addApplicant(vm.newApplicant).then(function(resp) {
                              //resp is the newly added applicant
                              interviewService.assignApplicantToInterview(selectedInterview, resp).then(function(resp){
                                //Reset content
                                interviewSetDayContent(date);
                                vm.addingApp = false;
                                vm.addAppActive = false;
                                loadAllFullInterviews();
                                vm.currApp = {};
                                selectedInterview.datePretty = moment(selectedInterview.startDate).format('MM/D/YYYY');
                                selectedInterview.startDatePretty = moment(selectedInterview.startDate).format('h:mm a');
                                selectedInterview.endDatePretty = moment(selectedInterview.endDate).format('h:mm a');
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
                        else {
                            vm.msg = 'No applicant was available to be sent. Please try logging in again!';
                        }
                    }, function() {
                        vm.msg = 'You cancelled the dialog.';
                        interviewSetDayContent(date);
                    });
            }, function(error) {

            });
        }



////*********Reset Table functions

      //Delete all apps from database
      function clearAllApps(){
            var confirm = $mdDialog.prompt()
              .title('ARE YOU SURE?????')
              .textContent('Deleting All Apps cannot be undone. This will make all interview slots empty. THIS SHOULD NOT BE DONE BEFORE SELECTIONS FOR COUNSELOR APPS!!!!! Type "DELETE" in the prompt below to confirm delete:')
              .placeholder('Enter Confirmation Here')
              .ariaLabel('Dog name')
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
                  });
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
              .ariaLabel('Dog name')
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
                  });
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
              interview.startDatePretty = moment(interview.startDate).format('h:mm a');
              interview.endDatePretty = moment(interview.endDate).format('h:mm a');
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
        });
        //get intervies sorted by date
        interviewService.queryAll().then(function(resp) {
          _.forEach(resp, function(interview){
              interview.datePretty = moment(interview.startDate).format('MM/D/YYYY');
              interview.startDatePretty = moment(interview.startDate).format('h:mm a');
              interview.endDatePretty = moment(interview.endDate).format('h:mm a');
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
        });
      }


}
