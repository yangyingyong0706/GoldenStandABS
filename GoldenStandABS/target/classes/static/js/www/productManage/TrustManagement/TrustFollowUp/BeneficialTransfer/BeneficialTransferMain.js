define(function (require) {
    var $ = require("jquery");
    var Vue = require("Vue");
    var common = require('common');
    var trustId = common.getUrlParam('tid');
    var enter = common.getUrlParam('enter');
    var PoolDBName = common.getUrlParam('PoolDBName');
    var vm = new Vue({
        el: "#app",
        data: {
            url: "BeneficialTransfer.html?tid=" + trustId,
        },
        mounted: function () {

        },
        methods: {
            changeIframe: function ($event) {
                var target = $event.currentTarget;
                var self = this;
                if (target.id) {
                    $(target).removeClass("current_li").addClass("current_li");
                    $(target).siblings().removeClass("current_li")
                    if (target.id == "ConfirmObject") {
                        self.url = "BeneficialTransfer.html?tid=" + trustId
                    } else if (target.id == "EquityTransfer") {
                      

                    } 
                }
            },
        }
    })
})