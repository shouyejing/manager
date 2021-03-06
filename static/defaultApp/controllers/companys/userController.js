(function () {

    var injectParams = ['$scope', '$location', '$routeParams',
                        '$timeout', 'config', 'dataService','toaster','displayModel'];

    var userController = function ($scope, $location, $routeParams,
                                           $timeout, config, dataService,toaster,displayModel) {
        var vm = this,
    	companyId = ($routeParams.companyId) ? parseInt($routeParams.companyId) : 0;
        vm.users = [];

        //获取公司明细
        function getUsers() {
            dataService.getUsers(companyId)
            .then(function (data) {
            	vm.users = data;
                $timeout(function () {
                }, 1000);
            }, function (error) {
            	toaster.pop('error', "处理失败", "很遗憾处理失败，由于网络原因无法连接到服务器！");
            });
        }

        //初始化
        function init() {
            displayModel.displayModel='none';
            getUsers();
        }

        init();
    };

    userController.$inject = injectParams;
    angular.module('managerApp').controller('UserController', userController);
    
}());