define(function (require) {
    var $ = require("jquery");
    var Vue=require("Vue");
    var common = require('common');
    var qwFrame = require('app/productManage/TrustManagement/Common/Scripts/QuickWizard.FrameEnhanceCus');
    var appGlobal = require('App.Global');
    var GlobalVariable = appGlobal.GlobalVariable;
    var trustId = common.getUrlParam('tid');
    var enter = common.getUrlParam('enter');
    var PoolDBName = common.getUrlParam('PoolDBName');
    var url;
    if (enter) {
        $('.left_nav_style').remove();
        $('.iframe_content').css('width', '100%');
        url = "CashflowManagement_New.html?tid=" + trustId + '&PoolDBName=' + PoolDBName + '&enter=assets'
    } else {
        url = "CashflowManagementTotal_New.html?tid=" + trustId
    }
    var vm = new Vue({
        el:"#app",
        data: {
            url: url,
            enterShow: true
        },
        mounted: function () {
            this.ShowOff()
        },
        methods: {
            changeIframe: function ($event) {
                var target = $event.currentTarget;
                var self = this;
                if (target.id) {
                    $(target).removeClass("current_li").addClass("current_li");
                    $(target).siblings().removeClass("current_li")
                    if (target.id == "CashflowManagementTotal") {
                        self.url = "CashflowManagementTotal_New.html?tid=" + trustId
                    } else if (target.id == "CashflowManagementSplit") {
                        if (enter) {
                            self.url = "CashflowManagement_New.html?tid=" + trustId + '&PoolDBName=' + PoolDBName + '&enter=assets'
                        } else {
                            self.url = "CashflowManagement_New.html?tid=" + trustId
                        }
                        
                    } else {
                        self.url = "../statistics/statistics.html?trustId=" + trustId
                    }
                }
            },
            ShowOff: function () {
                if (enter) {
                    this.enterShow = false
                }
            }
        }
    })
})