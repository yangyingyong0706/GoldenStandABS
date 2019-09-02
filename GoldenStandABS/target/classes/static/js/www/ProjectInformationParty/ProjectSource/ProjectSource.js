define(function (require) {
    var $ = require("jquery");
    var Vue = require("Vue");
    var common = require('common');
    var appGlobal = require('App.Global');
    var GlobalVariable = appGlobal.GlobalVariable;
    var webStorage = require('gs/webStorage');
    var GSDialog = require('gs/uiFrame/js/gs-admin-2.pages');
    var ProjectId = common.getQueryString('ProjectId');
    var kendoGridModel = require('gs/Kendo/kendoGridModel');
    var GlobalVariable = require('gs/globalVariable');
    require("app/ProjectInformationParty/js/project_interface");
    var vm = new Vue({
        el: "#app",
        data: {
            url: "../../components/trustList/TrustList.html?enter=ProjectApproval&ProjectId=" + ProjectId
        },
        methods: {
            changeIframe: function ($event) {
                var target = $event.target;
                var self = this;
                if (target.id) {
                    $(target).removeClass("current_li").addClass("current_li");
                    $(target).siblings().removeClass("current_li")
                    if (target.id == "RelatedAssets") {
                        self.url = "RelatedAssets.html?ProjectId=" + ProjectId;
                    } else if (target.id == "RelatedProduct") {
                        self.url = "../../components/trustList/TrustList.html?enter=ProjectApproval&ProjectId=" + ProjectId
                    } else if (target.id == "RelatedCashflow") {
                        self.url = "../../projectStage/ProjectSource/RelatedCashflowReal.html?ProjectId=" + ProjectId;
                    } else if (target.id == "RelatedEnterprises") {
                        self.url = "../../projectStage/ProjectSource/RelatedEnterprises.html?ProjectId=" + ProjectId;
                    }
                } else {
                    if ($(target).parent()[0].id == "RelatedAssets") {
                        self.url = "RelatedAssets.html?ProjectId=" + ProjectId;
                    } else if ($(target).parent()[0].id == "RelatedProduct") {
                        self.url = "../../components/trustList/TrustList.html?enter=ProjectApproval&ProjectId=" + ProjectId
                    } else if ($(target).parent()[0].id == "RelatedCashflow") {
                        self.url = "../../projectStage/ProjectSource/RelatedCashflowReal.html?ProjectId=" + ProjectId;
                    } else if ($(target).parent()[0].id == "RelatedEnterprises") {
                        self.url = "../../projectStage/ProjectSource/RelatedEnterprises.html?ProjectId=" + ProjectId;
                    }
                    $(target).parent().removeClass("current_li").addClass("current_li");
                    $(target).parent().siblings().removeClass("current_li")
                }
            }
        }
    })
})