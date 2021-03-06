'use strict';

angular
    .module('app.interview')
    .controller('InterviewController', InterviewController);

InterviewController.$inject = ['interviewService', 'applicantService', '$filter', '$mdDialog', 'moment', 'closed', '$state','$stateParams', '$scope', '$analytics'];

function InterviewController(interviewService, applicantService, $filter, $mdDialog, moment, closed, $state, $stateParams, $scope, $analytics) {

    var vm = this;
    vm.setDirection = setDirection;
    vm.dayClick = dayClick;
    vm.prevMonth = prevMonth;
    vm.prevMonth = nextMonth;
    vm.setDayContent = setDayContent;
    vm.getInterviewForDay = getInterviewForDay;
    vm.addApplicant = addApplicant;

    vm.selectedDate = null;
    vm.tooltips = true;
    vm.applicant = $stateParams.applicant;
    vm.noInterviewsOnDay = {};
    vm.appHasInterview = false;
    vm.completedSignup = false;
    vm.dataLoaded = false;

    vm.displayInterviewMsg = false;
    vm.displayInterviewMsgHasError = false;

    vm.completedInt = {};
    vm.allInterviews = {};
    vm.formattedInterviews = {};

    // For the Timer
    $scope.$on('timer-tick', function (event, args) {
        getAllInterviewsFormattedObject();
    });

    checkifHasInterview();

    // Function to grab all interviews at once
    function getAllInterviewsFormattedObject() {
        vm.allInterviews = interviewService.queryAll().then(function(resp){
            vm.formattedInterviews = {};
            _.forEach(resp, function(interview) {
                var formatDay = moment(interview.startDate).format('YYYY-MM-DD');
                var interviewDay = vm.formattedInterviews[formatDay];
                if(!interviewDay) {
                    interviewDay = {};
                    interviewDay.numInterviewsAvailable = 0;
                    vm.formattedInterviews[formatDay] = interviewDay;
                }
                if(!interview.taken) {
                    interviewDay.numInterviewsAvailable += 1;
                }
            });
            vm.dataLoaded = true;
            // Broadcasts to the directive to reset the data on the calendar
            $scope.$broadcast("call-setData");
            return resp;
        }, function(){
          $state.go('error');
        });
    }

    //Determines if applicant has interview. if does, displays time:
    function checkifHasInterview(){
      if (_.isEmpty(vm.applicant)){
        vm.appHasInterview = false;
        //Go to login page if they are not logged in
        $state.go('login');
      }else{
        interviewService.getAllFullInterviews().then(function(resp) {
          //Match email, firstName, and LastName
            _.forEach(resp, function(interview){
                if( (interview.applicant.firstName.toLowerCase() == vm.applicant.firstName.toLowerCase()) &&
                    (interview.applicant.lastName.toLowerCase() == vm.applicant.lastName.toLowerCase()) &&
                    (interview.applicant.emailAddress == vm.applicant.emailAddress) ) {
                        vm.appHasInterview = true;
                        vm.existingInterview = interview;
                        vm.existingInterview.datePretty = moment(interview.startDate).format('MM/D/YYYY');
                        vm.existingInterview.startDatePretty = moment(interview.startDate).format('h:mm A');
                        vm.existingInterview.endDatePretty = moment(interview.endDate).format('h:mm A');

                        $analytics.eventTrack('Successful Login', {  category: 'Login', label: JSON.stringify(vm.applicant) });
                        return false;
                  }
              });
            // Used to direct new logins to closed page if signups are closed
            if(!vm.appHasInterview && closed) {
                $analytics.eventTrack('Attempted New Sign-up, but Closed', {  category: 'Login', label: JSON.stringify(vm.applicant) });
                $state.go('closed');
            }
        }, function(){
          $state.go('error');
        });
      }
    }

    /* Helper Functions */
    function getInterviewForDay(day) {
        var formatDay = moment(day).format('YYYY-MM-DD');

        return interviewService.queryDay(formatDay).$promise;

    }

    function addApplicant() {
        applicantService.addApplicant(vm.applicant);
    }

    /* Calendar Functions */

    function setDirection (direction) {
        vm.direction = direction;
        vm.dayFormat = direction === "vertical" ? "EEEE, MMMM d" : "d";
    }

    function dayClick(date) {
        vm.selectedDate = $filter("date")(date, "MMMM d, y");
        showTimes(moment(date).format('YYYY-MM-DD'));
    }

    function prevMonth(data) {
        vm.msg = "You clicked (prev) month " + data.month + ", " + data.year;
    }

    function nextMonth(data) {
        vm.msg = "You clicked (next) month " + data.month + ", " + data.year;
    }

    function showTimes(date) {

        interviewService.queryDay(date).then(function(resp) {

            resp = formatInterviewsOnDay(resp);

            $mdDialog.show({
                controller: DialogController,
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
                    if(!_.isEmpty(vm.applicant)) {
                        interviewService.getInterview(selectedInterview.id).then(function(resp) {
                            if(resp.taken) {
                                vm.msg = 'It seems someone has just selected this interview time. Please try selecting a different time!';
                                vm.displayInterviewMsgHasError = true;
                                vm.displayInterviewMsg = true;
                            }
                            else {
                                vm.msg = 'You selected interview "' + selectedInterview + '".';
                                vm.displayInterviewMsgHasError = false;
                                applicantService.addApplicant(vm.applicant).then(function(resp) {
                                    //resp is the newly added applicant
                                    interviewService.assignApplicantToInterview(selectedInterview, resp).then(function(resp){
                                        vm.completedInt = selectedInterview;
                                        vm.completedInt.datePretty = moment(vm.completedInt.startDate).format('MM/D/YYYY');
                                        vm.completedInt.startDatePretty = moment(vm.completedInt.startDate).format('h:mm A');
                                        vm.completedInt.endDatePretty = moment(vm.completedInt.endDate).format('h:mm A');
                                        vm.completedSignup = true;
                                    }, function(){
                                      $state.go('error');
                                    });
                                }, function(){
                                  $state.go('error');
                                });
                            }
                        }, function(){
                          $state.go('error');
                        });
                    }
                    else {
                        vm.msg = 'No applicant was available to be sent. Please try logging in again!';
                        vm.displayInterviewMsgHasError = true;
                        vm.displayInterviewMsg = true;
                    }
                }, function() {
                    // On cancel of the dialog
                    vm.msg = '';
                    vm.displayInterviewMsgHasError = false;
                    vm.displayInterviewMsg = false;
                });
        }, function(){
          $state.go('error');
        });
    }

    function formatInterviewsOnDay(interviews) {
        //Allows us to put Room#i next to interviews with same start times
        // 1<= i <= Number of identical times, room number is not stored in database
        var interviewMap = new Map();
        _.forEach(interviews, function(interview){
            interview.startDatePretty = moment(interview.startDate).format('h:mm A');
            interview.endDatePretty = moment(interview.endDate).format('h:mm A');
            if(interviewMap.has(interview.startDatePretty)){
                var num = interviewMap.get(interview.startDatePretty);
                num = num + 1;
                interview.Room = "(Room #" + num + ")";
                interviewMap.set(interview.startDatePretty, num);
            }else{
                interview.Room = "(Room #1)";
                interviewMap.set(interview.startDatePretty, 1);
            }
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

    function DialogController($scope, $mdDialog, $mdToast, selectedDate, interviews) {
        $scope.selectedDate = selectedDate;
        $scope.interviews = interviews;

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
            $mdDialog.hide();
        };

        $scope.cancel = function() {
            $mdDialog.cancel();
        };

        $scope.answer = function(answer) {
            $mdDialog.hide(answer);
        };
    }

    function setDayContent(date) {
        var formatDay = moment(date).format('YYYY-MM-DD');
        var text = '';
        var interviewDay = vm.formattedInterviews[formatDay];
        if(!interviewDay) {
            text = '0 Open';
            vm.noInterviewsOnDay[formatDay] = true;
        }
        else {
            if(interviewDay.numInterviewsAvailable > 0) {
                vm.noInterviewsOnDay[formatDay] = false;
            }
            else {
                vm.noInterviewsOnDay[formatDay] = true;
            }

            text = '' + interviewDay.numInterviewsAvailable + ' Open';
        }

        return "<p>"+text+"</p>";

    }

}