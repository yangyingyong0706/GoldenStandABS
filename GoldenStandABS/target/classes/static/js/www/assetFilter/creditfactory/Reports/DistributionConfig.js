define(function (require) {
    var $ = require("jquery");
    var Vue = require("Vue");
    var common = require('common');
    var qwFrame = require('app/productManage/TrustManagement/Common/Scripts/QuickWizard.FrameEnhanceCus');
    var appGlobal = require('App.Global');
    var GlobalVariable = appGlobal.GlobalVariable;
    var PoolId = common.getQueryString('PoolId');
    require("app/projectStage/js/project_interface");
    var vm = new Vue({
        el: "#app",
        data: {
            url: "./poolDistributionConfig.html?PoolId=" + PoolId
        },
        methods: {
            changeIframe: function ($event) {

                var target = $event.target;
                var self = this;
                if (target.id) {
                    $(target).removeClass("current_li").addClass("current_li");
                    $(target).siblings().removeClass("current_li")
                    if (target.id == "fat") {
                        self.url = "./poolDistributionConfig.html?PoolId=" + PoolId
                    } else {
                        self.url = "./poolDimDistributionConfig.html?PoolId=" + PoolId
                    }
                } else {
                    if ($(target).parent()[0].id == "fat") {
                        self.url = "./poolDistributionConfig.html?PoolId=" + PoolId
                    } else {
                        self.url = "./poolDimDistributionConfig.html?PoolId=" + PoolId
                    }
                    $(target).parent().removeClass("current_li").addClass("current_li");
                    $(target).parent().siblings().removeClass("current_li")
                }
            }
        }
    })
})