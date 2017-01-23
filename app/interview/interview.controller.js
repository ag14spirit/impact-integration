'use strict';

angular
    .module('app.interview')
    .controller('InterviewController', InterviewController);

InterviewController.$inject = ['interviewService', 'applicantService', '$filter', '$mdDialog', 'TEST', 'moment','$state','$stateParams', '$q'];

function InterviewController(interviewService, applicantService, $filter, $mdDialog, TEST, moment, $state, $stateParams, $q) {

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
    checkifHasInterview();


    // vm.applicant = {
    //     firstName : "Bob",
    //     lastName : "Sagot",
    //     emailAddress : "bsag@gmail.com",
    //     gender : true
    // };

    function checkifHasInterview(){
      if (_.isEmpty(vm.applicant)){
        vm.appHasInterview = false;
      }else{
        console.log(vm.applicant);
        interviewService.getAllFullInterviews().then(function(resp) {
          //Match email, firstName, and LastName
          console.log(resp);
          _.forEach(resp, function(interview){
            if(
                (interview.applicant.firstName.toLowerCase() == vm.applicant.firstName.toLowerCase()) &&
                (interview.applicant.lastName.toLowerCase() == vm.applicant.lastName.toLowerCase()) &&
                (interview.applicant.emailAddress == vm.applicant.emailAddress)
              ){
                vm.appHasInterview = true;
                vm.existingInterview = interview;
                console.log("test");
                vm.existingInterview.datePretty = moment(interview.startDate).format('MM/D/YYYY');
                vm.existingInterview.startDatePretty = moment(interview.startDate).format('h:mm a');
                vm.existingInterview.endDatePretty = moment(interview.endDate).format('h:mm a');
              }
          });
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
      console.log(vm.applicant);
        //getInterviewForDay(date);
        vm.msg = "You clicked " + $filter("date")(date, "MMM d, y h:mm:ss a Z");
        vm.selectedDate = $filter("date")(date, "MMMM d, y");
        vm.msg = vm.selectedDate;
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
                        vm.msg = 'You selected interview "' + selectedInterview + '".';
                        applicantService.addApplicant(vm.applicant).then(function(resp) {
                            //resp is the newly added applicant
                            interviewService.assignApplicantToInterview(selectedInterview, resp).then(function(resp){
                                setDayContent(date);
                            })
                        })
                    }
                    else {
                        vm.msg = 'No applicant was available to be sent. Please try logging in again!';
                    }
                }, function() {
                    vm.msg = 'You cancelled the dialog.';
                });
        }, function(error) {

        });
    }

    function DialogController($scope, $mdDialog, selectedDate, interviews) {
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

    function setDayContent(date) {
      var formatDay = moment(date).format('YYYY-MM-DD');
      return interviewService.queryDay(formatDay).then(function(resp) {
          var text = '';
          var count = 0;
          // If there are any interview returned
          if(resp.length > 0){
              vm.noInterviewsOnDay[formatDay] = false;
              _.forEach(resp, function(index){
                  count  = count + 1;
              });
              text = count + ' open';
          }
          //no interviews
          else {
              var day = moment(date).format('D');
              vm.noInterviewsOnDay[formatDay] = true;
              text = '0 Open';
          }
          return "<p>"+text+"</p>";
        });



        // You could also use a promise.
        // var deferred = $q.defer();
        // $timeout(function() {
        //     deferred.resolve("<p></p>");
        // }, 1000);
        // return deferred.promise;

        // OR
        // var innerHtml;
        // interviewService.query(date).then( function(resp) {
        // resp contains data returned by controller (aka a list of times)
        // for each ()
        // innerHtml += data.get(i)
        // return innerHtml

        //OR
        // Just tell the user if there are any available times left for that day, and then display the times after they choose
        // this is probably the right call
        // interviewService.checkDay(date).then(function(resp) {
        // resp is just a boolean, true of false
        // if (resp)
        // return "there is stuff here. Maybe highlight the day?

    }

}
