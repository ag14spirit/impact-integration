'use strict';

angular
    .module('app.interview')
    .controller('InterviewController', InterviewController);

InterviewController.$inject = ['interviewService', '$filter', '$mdDialog'];

function InterviewController(interviewService, $filter, $mdDialog) {

    var vm = this;

    vm.setDirection = setDirection;
    vm.dayClick = dayClick;
    vm.prevMonth = prevMonth;
    vm.prevMonth = nextMonth;
    vm.setDayContent = setDayContent;

    vm.selectedDate = null;
    vm.tooltips = true;

    function setDirection (direction) {
        vm.direction = direction;
        vm.dayFormat = direction === "vertical" ? "EEEE, MMMM d" : "d";
    }

    function dayClick(date) {
        vm.msg = "You clicked " + $filter("date")(date, "MMM d, y h:mm:ss a Z");
        vm.selectedDate = $filter("date")(date, "MMMM d, y");
        vm.msg = vm.selectedDate;
        showTimes(date);
    }

    function prevMonth(data) {
        vm.msg = "You clicked (prev) month " + data.month + ", " + data.year;
    }

    function nextMonth(data) {
        vm.msg = "You clicked (next) month " + data.month + ", " + data.year;
    }

    function showTimes(date) {

        $mdDialog.show({
            controller: DialogController,
            templateUrl: 'interview/interview.day.html',
            parent: angular.element(document.body),
            clickOutsideToClose:true,
            bindToController: true,
            locals: {
                selectedDate: vm.selectedDate
            }
        })
            .then(function(answer) {
                vm.msg = 'You said the information was "' + answer + '".';
            }, function() {
                vm.msg = 'You cancelled the dialog.';
            });
    }

    function DialogController($scope, $mdDialog, selectedDate) {
        $scope.selectedDate = selectedDate;
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

        // Can manipulate what goes into the day's here... aka available time slots?
        return "<p></p>";

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