
define(function (require) {
    var $ = require('jquery');
    var Vue = require("Vue2");
    var webProxy = require('gs/webProxy');
    var Vm = new Vue({
        el: "#app",
        data: {
            url: webProxy.baseUrl + "/GoldenStandABS/www/basicData/SystemSettings/TrustPlan.html"
        },
        methods: {
            changeUrl: function ($event) {
                var self = this;
                var id = $event.currentTarget.id;
                $($event.currentTarget).removeClass("active").addClass("active").siblings().removeClass("active");
                if (id == "TrustPlan") {
                    self.url = webProxy.baseUrl + "/GoldenStandABS/www/basicData/SystemSettings/TrustPlan.html"
                } else if (id == "PoolPlan") {
                    self.url = webProxy.baseUrl + "/GoldenStandABS/www/basicData/SystemSettings/PoolPlan.html"
                }
            }
        }
    })
})