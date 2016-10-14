'use strict';

angular
    .module('app.selections')
    .controller('SelectionsController', SelectionsController);

SelectionsController.$inject = ['selectionsService'];

/* @ngInject */
function SelectionsController(selectionsService) {

    var vm = this;

    //Will eventually be updated to pull settings from a table
    var settingDefaults = {};
    settingDefaults.sessions = ["Alpha", "Delta", "Omega"];
    settingDefaults.tribes   = ["Asher", "Benji", "Gad", "Issachar", "Judah", "Levi", "Naphtali", "Simeon", "Reuben", "Zebulun"];
    settingDefaults.smallTribes = ["Benji", "Gad", "Issachar", "Levi", "Naphtali"];
    settingDefaults.numberOfRounds = 7;
    settingDefaults.numberOfPrevSel = 5;
    settingDefaults.numberNextUp = 3;



    //List that will contain complete round lists
    vm.roundOrders = [];
    //Var that contains camps, as well as counselors selected at this point
    vm.masterCampList = [];
    vm.roundNumber = 1;

    //setting vars
    vm.sessions = settingDefaults.sessions;
    vm.tribes = settingDefaults.tribes;
    vm.log = log;
    vm.genderNextClick = genderNextClick;
    vm.addSession = addSession;
    vm.removeSession = removeSession;
    vm.sessionNextClick = sessionNextClick;
    vm.addTribe = addTribe;
    vm.removeTribe = removeTribe;
    vm.tribeNextClick = tribeNextClick;
    vm.gender = "Girls";

    //View vars: setting one to true will bring up that div
    vm.genderSelActive=true;
    vm.sessionSelActive=false;
    vm.tribeSelActive=false;
    vm.campSettActive=false;





    function log(s) {
        console.log(s);
    }

    function genderNextClick(){
      vm.gender = vm.data.group1;
      vm.log(vm.gender);
      vm.genderSelActive=false;
      vm.sessionSelActive=true;
    }

    function addSession(){
        if(typeof(vm.newSession.name) !== undefined && vm.newSession.name !== ""){
          vm.sessions.push(vm.newSession.name);
          vm.newSession.name = "";
        }
    }

    function removeSession(s){
      vm.sessions.splice(vm.sessions.indexOf(s),1);
    }

    function sessionNextClick(){
      vm.sessionSelActive=false;
      vm.tribeSelActive=true;
    }

    function addTribe(){
        if(typeof(vm.newTribe.name) !== undefined && vm.newTribe.name !== ""){
          vm.tribes.push(vm.newTribe.name);
          vm.newTribe.name = "";
        }
    }

    function removeTribe(s){
      vm.tribes.splice(vm.tribes.indexOf(s),1);
    }

    function tribeNextClick(){
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







}
