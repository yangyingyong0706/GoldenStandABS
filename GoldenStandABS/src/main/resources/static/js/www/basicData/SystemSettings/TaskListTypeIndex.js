
define(function (require) {
    var $ = require('jquery');
    var Vue = require("Vue2");
    GSDialog = require('gsAdminPages');
    var webProxy = require('gs/webProxy');
    var Vm = new Vue({
        el: "#app",
        data: {
            url: webProxy.baseUrl + "/GoldenStandABS/www/basicData/TrustImportExport/UpImportTrustPlan.html?enter=taskList"
        },
        methods: {
            changeUrl: function ($event) {
                var self = this;
                var id = $event.currentTarget.id;
                $($event.currentTarget).removeClass("active").addClass("active").siblings().removeClass("active");
                if (id == "exportin") {
                    self.url = webProxy.baseUrl + "/GoldenStandABS/www/basicData/TrustImportExport/UpImportTrustPlan.html?enter=taskList"   
                } else if (id == "taskList") {
                    self.url = webProxy.baseUrl + "/GoldenStandABS/www/productManage/TrustManagement/TaskListVerify/TaskListType.html"
                }
            }
        }
    })
})