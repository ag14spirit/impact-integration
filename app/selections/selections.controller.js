'use strict';

angular
    .module('app.selections')
    .controller('SelectionsController', SelectionsController);

SelectionsController.$inject = ['selectionsService'];

/* @ngInject */
function SelectionsController(selectionsService) {

    var vm = this;





//**Master Variables present during entire Selections Process
    //List that will contain complete round lists
    //roundOrders[0] is set by the round order functionality
    //roundOrders[1]-roundOrders[maxRounds] contain the order for each round
    //(set by roundOrders[0] on confirmation of round order)
    vm.roundOrders = [[]];
    //Var that contains camps, as well as counselors selected at this point
    vm.masterCampList = [];




    //Vars for setting the current view within the selections Page
    vm.genderSelActive=true;
    vm.sessionSelActive=false;
    vm.tribeSelActive=false;
    vm.campSettActive=false;
    vm.selectionsOrderActive=false;
    vm.startRoundActive = false;
    vm.selectPageActive = false;

    //***Defaults for the settings
    //Will eventually be updated to pull settings from a table
    var settingDefaults = {};
    settingDefaults.sessions = ["Alpha", "Delta", "Omega"];
    settingDefaults.tribes   = ["Asher", "Benji", "Gad", "Issachar", "Judah", "Levi", "Naphtali", "Simeon", "Reuben", "Zebulun"];
    settingDefaults.smallTribes = ["Benji", "Gad", "Issachar", "Levi", "Naphtali"];
    settingDefaults.numberOfRounds = 7;
    settingDefaults.numberOfPrevSel = 5;
    settingDefaults.numberNextUp = 3;
    settingDefaults.loadDefaultApplicants = loadDefaultApplicants;

    //Vars for the Selections settings
    vm.sessions = settingDefaults.sessions;
    vm.tribes = settingDefaults.tribes;
    vm.log = log;
    vm.disableGenderNext = true;
    vm.genderEnableSubmit = genderEnableSubmit;
    vm.genderNextClick = genderNextClick;
    vm.addSession = addSession;
    vm.removeSession = removeSession;
    vm.sessionNextClick = sessionNextClick;
    vm.addTribe = addTribe;
    vm.removeTribe = removeTribe;
    vm.tribeNextClick = tribeNextClick;
    vm.campSetNextClick = campSetNextClick;


    //Vars for setting the selections Order
    vm.selOrderList = [];
    vm.nextCamp = {};
    vm.addCampToSelOrder = addCampToSelOrder;
    vm.removeCampFromSelOrder = removeCampFromSelOrder;
    vm.disableAdd=false;
    vm.disableRemove=true;
    vm.disableConfirmOrder=true;
    vm.selOrderComfirm = selOrderComfirm;
    vm.setRoundOrders = setRoundOrders;



    //Vars for the Start Round Page
    vm.startPageBack = startPageBack;
    vm.startRoundClick = startRoundClick;

    //*** Main Selections Page Variables
    //Var that holds current Selections Round Number
    vm.currRound = 1;
    //Index of the Camp that is up
    //Camp is found at RoundOrders[currRound][currIndex]
    vm.currIndex = 0;
    //Holds the names of the previous counselors selected, maxPrev setting determines
    //the length of this var
    vm.currCamp = {};
    vm.maxPrev = settingDefaults.numberOfPrevSel;
    vm.previousSelections = [];
    //Holds list of the next camps up:
    //Length set by maxNextUp
    vm.nextUp = [];
    vm.maxNextUp = settingDefaults.numberNextUp;

    vm.availApplicants = settingDefaults.loadDefaultApplicants();
    vm.selectedApplicants = [];
    vm.currSessionAvailApplicants = [];
    vm.initializeMainPage = initializeMainPage;







    function log(s) {
        console.log(s);
    }

    //Function to enable Next button when Gender is selected
    function genderEnableSubmit(){
      vm.disableGenderNext = false;
      return;
    }

    //Hide gender selections and bring up Session settings
    function genderNextClick(){
        vm.gender = vm.data.group1;
        vm.genderSelActive=false;
        vm.sessionSelActive=true;
    }

    //Add a session to the session list
    function addSession(){
        if(typeof(vm.newSession.name) !== undefined || vm.newSession.name !== ""){
          vm.sessions.push(vm.newSession.name);
          vm.newSession.name = "";
        }
    }

    //Remove a session from the session list
    function removeSession(s){
      vm.sessions.splice(vm.sessions.indexOf(s),1);
    }

    //Finish inputing sessions, move on to Tribe/Camp confirmation
    function sessionNextClick(){
      vm.sessionSelActive=false;
      vm.tribeSelActive=true;
    }

    //Add Tribe to Tribe list
    function addTribe(){
        if(typeof(vm.newTribe.name) !== undefined && vm.newTribe.name !== ""){
          vm.tribes.push(vm.newTribe.name);
          vm.newTribe.name = "";
        }
    }

    //Remove Tribe from Tribe List
    function removeTribe(s){
      vm.tribes.splice(vm.tribes.indexOf(s),1);
    }

    //Confirm Tribe list, move on to confirming camp sessions
    function tribeNextClick(){
      //Create all the camps in the master camp list, use defaults
      for(var i = 0; i < vm.sessions.length; i++){
        for(var j = 0; j < vm.tribes.length; j++){
          var newcamp = {};
          newcamp.session = vm.sessions[i];
          newcamp.tribe = vm.tribes[j];
          newcamp.fullName = vm.sessions[i] + " " + vm.tribes[j];
           if(settingDefaults.smallTribes.indexOf(vm.tribes[j]) > 0){
             newcamp.numCounselors = settingDefaults.numberOfRounds - 1;
           }else{
            newcamp.numCounselors = settingDefaults.numberOfRounds;
           }
          newcamp.guyCC = "";
          newcamp.girlCC = "";
          vm.masterCampList.push(newcamp);
        }

      }
      vm.tribeSelActive = false;
      vm.campSettActive = true;
    }

    //Confirm Camp Settings, move on to Selections Order
    function campSetNextClick(){
      angular.copy(vm.masterCampList, vm.selOrderList);
      vm.campSettActive=false;
      vm.selectionsOrderActive=true;
    }

    //Add a camp to end of selections order list
    function addCampToSelOrder(){
      var addedCamp = {};
      for(var i = 0; i < vm.selOrderList.length; i++){
        if (vm.nextCamp == vm.selOrderList[i].fullName){
          addedCamp = vm.selOrderList[i];
          break;
        }
        if( i === (vm.selOrderList.length -1)){
          return;
        }
      }
      vm.roundOrders[0].push(addedCamp);
      vm.selOrderList.splice(vm.selOrderList.indexOf(addedCamp), 1);
      vm.nextCamp = "";

      //Make sure the correct buttons are enabled/disabled
      if(vm.selOrderList.length == 0){
        vm.disableAdd=true;
        vm.disableConfirmOrder=false;
      }else{
        vm.disableAdd=false;
        vm.disableConfirmOrder=true;
      }
      if(vm.roundOrders[0].length == 0){
        vm.disableRemove=true;
      }else{
        vm.disableRemove=false;
      }
    }

    //Remove the last Camp Added to the selections Order list
    function removeCampFromSelOrder(){
      vm.selOrderList.push(vm.roundOrders[0].pop());
      //Make sure the correct buttons are enabled/disabled
      if(vm.selOrderList.length == 0){
        vm.disableAdd=true;
        vm.disableConfirmOrder=false;
      }else{
        vm.disableAdd=false;
        vm.disableConfirmOrder=true;
      }
      if(vm.roundOrders[0].length == 0){
        vm.disableRemove=true;
      }else{
        vm.disableRemove=false;
      }
    }

    //Create all the round Order Lists After Confirming the round Order
    function setRoundOrders(){
      var forwardRoundList = [];
      var tempForwardList = [];
      var reverseRoundList = [];
      var maxRounds = -1;
      angular.copy(vm.roundOrders[0], forwardRoundList);
      angular.copy(vm.roundOrders[0], tempForwardList);
      for(var i = 0; i < forwardRoundList.length; i++){
        var tempCamp = tempForwardList.pop();
        if(tempCamp.numCounselors > maxRounds){
          maxRounds = tempCamp.numCounselors;
        }
        reverseRoundList.push(tempCamp);
      }

      for(var i = 1; i <= maxRounds; i++){
        vm.roundOrders.push([]); //Add another round list
        //Snake draft, alternate the order for foward and reverse
        if(i % 2 == 1){
          for(var j = 0; j < vm.masterCampList.length; j++){
            var nextCamp = {};
            angular.copy(forwardRoundList[j],nextCamp);
            if (nextCamp.numCounselors >= i){
              vm.roundOrders[i].push(nextCamp);
            }
          }
        }else{
          for(var j = 0; j < vm.masterCampList.length; j++){
            var nextCamp = {};
            angular.copy(reverseRoundList[j],nextCamp);
            if (nextCamp.numCounselors >= i){
              vm.roundOrders[i].push(nextCamp);
            }
          }
        }
      }
      console.log(vm.roundOrders);
    }

    //Confirm Round Order, Set the round lists, Move on to Round Start Page
    function selOrderComfirm(){
      vm.setRoundOrders();
      vm.selectionsOrderActive=false;
      vm.startRoundActive=true;
    }

    //Back up from current round to end of previous round/back to order confirmation
    function startPageBack(){
      //Go back to order confimration
      if(vm.currRound === 1){
        vm.selectionsOrderActive=true;
        vm.startRoundActive=false;
      //Go back to end of previous Round
      }else{

      }
    }

    //Start the Next Round!
    function startRoundClick(){
      vm.initializeMainPage();
      vm.startRoundActive=false;
      vm.selectPageActive=true;

    }

    function initializeMainPage(){
      vm.currSessionAvailApplicants = [];
      vm.currCamp = vm.roundOrders[vm.currRound][vm.currIndex];
      for(var i = 0; i < vm.availApplicants.length; i++){
        var app = vm.availApplicants[i];
        if(app.sessions.indexOf(vm.currCamp.session) > -1){
          vm.currSessionAvailApplicants.push(app);
        }
      }
      //Get next up list set up
      vm.nextUp = [];
      for(var i = 0; i < vm.maxNextUp; i++){
        var nextIndex = vm.currIndex + 1 + i;
        if(nextIndex == vm.roundOrders[vm.currRound].length){
          vm.nextUp.push("END OF ROUND");
          break;
        }else{
          vm.nextUp.push(vm.roundOrders[vm.currRound][nextIndex].fullName);
        }
      }
      //get previousSelections list
      vm.previousSelections = [];
      for(var i = 0; i < vm.maxPrev; i++){
        var lastIndex = vm.selectedApplicants.length;
        var selIndex = lastIndex - i - 1;
        if(selIndex < 0){
          break;
        }else{
          vm.previousSelections.push(vm.selectedApplicants[selIndex]);
        }
      }
    }




    function loadDefaultApplicants(){
      var appList = [];
      for(var i=0; i < 300; i++){
        var newApp = {};
        newApp.fullName = "Applicant #" + i;
        newApp.email = "email" + i + "@example.com";
        newApp.camp = "";
        newApp.sessions = [];
        if(i < 20){
          newApp.sessions = ["Alpha"];
        }else if (i < 40){
          newApp.sessions = ["Alpha", "Delta"];
        }else{
          newApp.sessions = ["Alpha", "Delta", "Omega"];
        }
        appList.push(newApp);
      }
      return appList;
    }



}
