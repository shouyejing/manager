(function () {

    var injectParams = ['$scope', '$location', '$routeParams','$route',
                        '$timeout', 'config', 'dataService','toaster','displayModel'];

    var SettingController = function ($scope, $location, $routeParams,$route,
                                           $timeout, config, dataService,toaster,displayModel) {
        var vm = this;
        vm.settings={};
        vm.reset = {};
        vm.image = '';


        function init() {
            displayModel.displayModel='none';
            displayModel.displayEdit = '1';
            displayModel.displaySave = '0';
            displayModel.displaySearch = '0';
            displayModel.displayBack = '1';
            displayModel.flag = '';
            displayModel.title = '设置';
            getSetting();
        }

        vm.edit = function(){
            return displayModel.flag;
        }

        vm.clear = function(type){
            if (type=='name'){
                vm.reset.name = '';
            }else if(type=='email'){
                vm.reset.email = '';
            }else if(type=='password'){
                vm.reset.password = '';
            }
        }

        //修改个人信息
        vm.regiest = function(){
            if(vm.reset.email==''){
                toaster.pop('warning', "系统提示", "请填写邮箱！");
                return;
            }
            if(vm.reset.name=='' ){
                toaster.pop('warning', "系统提示", "请填写姓名！");
                return;
            }
            if(vm.reset.password&&vm.reset.password.length<6){
            	toaster.pop('warning', "系统提示", "请输入六位以上密码！");
                return;
            }
            dataService.regiest(vm.reset)
            .then(function (data) {
         	   toaster.pop('success', "", "个人信息保存成功!");
               $timeout(function () {
                    $route.reload();
               },500);
         	   $route.reload();
            }, function (error) {
             toaster.pop('warning', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
            });
        };
        $scope.getFile= function ($index) {
            var file = $scope.myFile;
            if(file){
                var reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = (function(){
                    vm.reset.image = reader.result;
                    $timeout(function () {
                    },500);
                });
            }
         };
        //获取设置内的用户信息
        function getSetting() {
            dataService.getSetting()
            .then(function (data) {
                vm.settings = data;
                console.info(vm.settings.image);
                vm.reset = data;
                vm.reset.image = '';
                console.info(data);
                $timeout(function () {
                }, 1000);
            }, function (error) {
                toaster.pop('error', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
            });
        }

        init();
    };

    SettingController.$inject = injectParams;
    angular.module('managerApp').controller('SettingController', SettingController);
    
}());
function changeimg(){
    return  $("#File").click();
}