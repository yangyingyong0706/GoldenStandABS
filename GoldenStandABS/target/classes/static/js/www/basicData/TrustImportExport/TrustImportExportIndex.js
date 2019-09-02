define(function (require) {
    var $ = require('jquery');
    var Vue = require("Vue2");
    GSDialog = require('gsAdminPages');   
    var Vm = new Vue({
        el: "#app",
        data: {
            url: "TrustImportExport.html"
        },
        methods: {
            changeUrl: function ($event) {
                var self = this;
                var id = $event.currentTarget.id;
                $($event.currentTarget).removeClass("active").addClass("active").siblings().removeClass("active");
                if (id == "exportin") {
                    self.url = "TrustImportExport.html"
                } else if (id == "exportout") {
                    self.url = "UpImportTrustPlan.html"
                }
            }
        }
    })
})