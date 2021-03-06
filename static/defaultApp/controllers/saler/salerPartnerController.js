(function () {

    var injectParams = ['$scope', '$location', '$routeParams','ngDialog',
                        '$timeout', 'config','modalService', 'dataService','toaster','displayModel','MyCache'];

    var salerPartnerController = function ($scope, $location, $routeParams,ngDialog,
                                           $timeout, config,modalService, dataService,toaster,displayModel,MyCache) {
        var vm = this;
        vm.companys = [];
        vm.missionsUnfinished = [];
        vm.missionsFinished = [];
        vm.partners = [];
        vm.partner = {};
        vm.busy=false;
        vm.isLoad=false;
        vm.keyword='';
        vm.initData={};
        vm.showButton=false;
        vm.display = null;
        var missionLengh=0;
        vm.missions_finished_numbers = 0;
        mission_state = '';
        vm.missions = [];
        vm.showFinishedmissions=false;


        //由url解析
        var partnerId = ($routeParams.partnerId) ? parseInt($routeParams.partnerId) : 0;


        var hr_id_for_manager;

        if(MyCache.get('hr_id_for_manager')){
            hr_id_for_manager = parseInt(MyCache.get('hr_id_for_manager'))
        }else{
            hr_id_for_manager = 0
        }




        //获取特定商户信息
        vm.getPartnerInfo = function(){
            if(vm.busy)return;
            vm.busy=true;

            dataService.getPartnerInfo(partnerId)
            .then(function (data) {
                    vm.partner = data;
                    vm.isLoad=true;
                    MyCache.put('partner',vm.partner);
                    displayModel.title = vm.partner.name;
                $timeout(function () {
                    vm.busy=false;
                }, 1000);
            }, function (error) {
            	toaster.pop('error', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
            });
        };

        //控制导航栏显示 商户信息/商户任务
        vm.setDisplay = function(display){
            vm.display = display;
        };

        //点击已完成的按钮,显示/隐藏 已完成的任务
        vm.clickMore = function(){
            vm.showFinishedmissions= !(vm.showFinishedmissions);
        };


        //获取特定商户的任务
        vm.getPartnerMission = function(mission_state){
            if(vm.busy)return;
            vm.busy=true;
            if(mission_state=='notOk')
                missionLengh = vm.missionsUnfinished.length;
            else{
                missionLengh = vm.missionsFinished.length;
            }

            dataService.getPartnerMission(missionLengh,vm.keyword,partnerId,mission_state,hr_id_for_manager)
            .then(function (data) {
                    var i;
                if(mission_state=='notOk'){

                    if(data['missions_list'].length <10){
                        vm.showButton=true;
                    }
                    for (i = 0; i < data['missions_list'].length; i++) {
                        vm.missionsUnfinished.push(data['missions_list'][i]);
                    }
                }else{
                    for (i = 0; i < data['missions_list'].length; i++) {
                        vm.missionsFinished.push(data['missions_list'][i]);
                    }
                }
                vm.missions_finished_numbers = data['missions_finished_numbers']

                vm.isLoad=true;
                $timeout(function () {
                    vm.busy=false;
                }, 1000);
            }, function (error) {
            	toaster.pop('error', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
            });
        };

        //改变任务状态
        vm.changeMissionState = function(missionsUnfinished){

            if(vm.role != '7' || missionsUnfinished.is_mine == false){
                return;
            }

            var titleText,titleState;
            var showFirstText = false;
            var showSecondText = false;
            var showThirdText = false;

            titleText = missionsUnfinished.mission_name;
            titleState = missionsUnfinished.mission_state_name;
            var missionState = missionsUnfinished.mission_state;

            switch (missionState)
            {
                case 'notstart':
                    showFirstText = true;
                    showSecondText = false;
                    showThirdText = false;
                    break;
                case 'pause':
                    showFirstText = true;
                    showSecondText = false;
                    showThirdText = true;
                    break;
                case 'start':
                    showFirstText = false;
                    showSecondText = true;
                    showThirdText = true;
                    break;
                case 'finished':
                    showFirstText = false;
                    showSecondText = false;
                    showThirdText = false;
                    break;
            }

            $scope.modalOptions = {
                titleText:titleText,
                titleState:titleState,
                closeButtonText: '取消',

                firstActionText:'开始',
                showFirstText:showFirstText,

                secondActionText:'暂停',
                showSecondText:showSecondText,

                thirdActionText:'完成',
                showThirdText:showThirdText
            };

            ngDialog.openConfirm({
                template:'/born_manager/static/defaultApp/partials/modalBottomFive.html',
                className: 'ngdialog',
                scope:$scope
            }).then(function(data){
                var mission_id = missionsUnfinished.mission_id;
                var action = data;
                var changeData = {'mission_id':mission_id,'action':action};
                missionsUnfinished.mission_state  = action;

               if(action == 'finished'){
                    MyCache.put('finishMission_come_from','page_partner_mission');
                    MyCache.put('finishMission_come_from_partnerId',partnerId);
                    MyCache.put('firstComeIntoFinishMission','1');
                    MyCache.put('passedMissionTitle',titleText);

                    $location.path('/saler/finishMission/'+mission_id)
                } else {
                    dataService.changeMissionState(changeData)
                        .then(function (data) {
                        }, function (error) {
                            toaster.pop('error', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
                    });
               }
            });
        };

        //返回按钮
        vm.back = function(){

            if(MyCache.get('keyword')){
                MyCache.put('goToSearch','1');
                $location.path('/search');
                MyCache.remove('partner');
            }else if(MyCache.get('comeFromeNewPartner') == '1'){
                MyCache.remove('partner');
                $location.path('/menu');
                MyCache.remove('comeFromeNewPartner')
            }
            else{
                MyCache.remove('partner');
                MyCache.put('saler_display','partners');
                $location.path('/saler');
            }



        };

        //点击已完成任务跳转到已完成的任务详细页面
        vm.jumpWithCache = function(Id){
            MyCache.put('finishedMission_come_from','page_partner_mission');
            MyCache.put('finishedMission_come_from_partnerId',partnerId);

            $location.path('/saler/finishedMission/'+Id)
        };

        //初始化
        function init() {
            displayModel.displayModel='none';
            displayModel.showHeader='1';
            displayModel.displayConfirm = '0';
            displayModel.displaySubmit = '0';
            displayModel.displayCreate = '0';
            displayModel.displayBack = '1';
            displayModel.displaySearch = '0';
            displayModel.displaySave='0';
            displayModel.displayCancel='0';
            displayModel.headerBack = vm.back;


            vm.role = MyCache.get('role_option');
            vm.getPartnerInfo();

            if(MyCache.get('saler_partnerOrCompany_display')){
                vm.display = MyCache.get('saler_partnerOrCompany_display');
                MyCache.remove('saler_partnerOrCompany_display')

            }else{
                vm.display = 'info';
            }

            if (MyCache.get('showClickMore')=='1'){
                vm.showFinishedmissions = true;
                MyCache.remove('showClickMore')
            }
            else{
                vm.showFinishedmissions = false;
            }
        }

        init();
    };

    salerPartnerController.$inject = injectParams;
    angular.module('managerApp').controller('SalerPartnerController', salerPartnerController);

}());