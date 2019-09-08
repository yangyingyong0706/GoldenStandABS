define(function (require) {
    var $ = require("jquery");
    var Vue = require("Vue2");
    var common = require('common');
    var appGlobal = require('App.Global');
    var GlobalVariable = appGlobal.GlobalVariable;
    var trustId = common.getQueryString('trustId');
    var vm = new Vue({
        el: "#app",
        data: {
        	//TODO YANGYINGYONG
//            url: location.protocol + "//" + location.host + "/GoldenStandABS/www/components/AccountInformation/AccountInformation.html?tid=" + trustId,
            url: location.protocol + "//" + location.host + "/GoldenStandABS/www/components/AccountInformation/AccountInformation.html?tid=" + trustId,
        },
        methods: {
            changeIframe: function ($event) {
                var target = $event.currentTarget;
                var self = this;
                if (target.id) {
                    $(target).removeClass("current_li").addClass("current_li");
                    $(target).siblings().removeClass("current_li")
                    if (target.id == "At") {
                        self.url = location.protocol + "//" + location.host + "/GoldenStandABS/www/components/AccountInformation/AccountInformation.html?tid=" + trustId
                    } else {
                        self.url = location.protocol + "//" + location.host + "/GoldenStandABS/www/components/PaymentSequence/PayoffOrderFormula.html?tid=" + trustId
                    }
                }
            }
        }
    })
})