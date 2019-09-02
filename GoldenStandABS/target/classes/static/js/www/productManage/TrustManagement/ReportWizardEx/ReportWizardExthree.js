define(function (require) {
    var $ = require("jquery");
    var Vue = require("Vue");
    var common = require('common');
    var qwFrame = require('app/productManage/TrustManagement/Common/Scripts/QuickWizard.FrameEnhanceCus');
    var appGlobal = require('App.Global');
    var GlobalVariable = appGlobal.GlobalVariable;
    var trustId = common.getQueryString('trustId');
    var tCode = common.getQueryString('TrustCode');
    var ReportDate = common.getQueryString('ReportDate');
    var vm = new Vue({
        el: "#app",
        data: {
            url: "../../../basicAsset/AssetDataImport/UploadImportData.html?Transform=Transform&&Idcode=" + trustId + "&ReportGuide=1"
        },
        methods: {
            changeIframe: function ($event) {
                var target = $event.target;
                var self = this;
                if (target.id) {
                    $(target).removeClass("current_li").addClass("current_li");
                    $(target).siblings().removeClass("current_li")
                    if (target.id == "comRepet") {
                        self.url = "../TrustCollectionPicker/TrustCollectionPicker.html?TrustId=" + trustId + "&&TrustCode=" + tCode + "&&transform=do"
                    } else if (target.id == "splitcash") {
                        self.url = "../../TrustManagement/TrustFollowUp/CashFlowDisassemblyAndCashFlowList/index.html?TrustId=" + trustId + "&&TrustCode=" + tCode + "&&xd=start"
                    } else if (target.id == "cashback_1") {
                        self.url = "../../TrustManagement/TrustFollowUp/CashflowManagement/ImportRepaymentPlanTwo.html?tid=" + trustId + "&ReportDate=" + ReportDate + "&ReportGuide=1"//+ "&&TrustCode=" + tCode
                    } else if (target.id == "cashback_2") {
                        self.url = "../../TrustManagement/TrustFollowUp/CashflowManagement/ImportPaymentDataTwo.html?tid=" + trustId + "&ReportDate=" + ReportDate + "&ReportGuide=1"//+ "&&TrustCode=" + tCode
                    } else if (target.id == "undergroundIn") {
                        self.url = "../../../basicAsset/AssetDataImport/UploadImportData.html?Transform=Transform&&Idcode=" + trustId + "&ReportGuide=1"
                    } else {
                        self.url = "../../TrustManagement/TrustFollowUp/statistics/statistics.html?TrustId=" + trustId
                    }
                } else {
                    if ($(target).parent()[0].id == "comRepet") {
                        self.url = "../TrustCollectionPicker/TrustCollectionPicker.html?TrustId=" + trustId + "&&TrustCode=" + tCode + "&&transform=do"
                    } else if ($(target).parent()[0].id == "splitcash") {
                        self.url = "../../TrustManagement/TrustFollowUp/CashFlowDisassemblyAndCashFlowList/index.html?TrustId=" + trustId + "&&TrustCode=" + tCode + "&&xd=start"
                    } else if ($(target).parent()[0].id == "cashback_1") {
                        self.url = "../../TrustManagement/TrustFollowUp/CashflowManagement/ImportRepaymentPlanTwo.html?tid=" + trustId + "&ReportDate=" + ReportDate + "&ReportGuide=1"//+ "&&TrustCode=" + tCode
                    } else if ($(target).parent()[0].id == "cashback_2") {
                        self.url = "../../TrustManagement/TrustFollowUp/CashflowManagement/ImportPaymentDataTwo.html?tid=" + trustId + "&ReportDate=" + ReportDate + "&ReportGuide=1"//+ "&&TrustCode=" + tCode
                    } else if ($(target).parent()[0].id == "undergroundIn") {
                        self.url = "../../../basicAsset/AssetDataImport/UploadImportData.html?Transform=Transform&&Idcode=" + trustId + "&ReportGuide=1"
                    } else {
                        self.url = "../../TrustManagement/TrustFollowUp/statistics/statistics.html?TrustId=" + trustId
                    }
                    $(target).parent().removeClass("current_li").addClass("current_li");
                    $(target).parent().siblings().removeClass("current_li")
                }
            }
        }
    })
})