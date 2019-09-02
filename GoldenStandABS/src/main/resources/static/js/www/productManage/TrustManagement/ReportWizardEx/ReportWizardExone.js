define(function (require) {
    var $ = require("jquery");
    var Vue=require("Vue");
    var common = require('common');
    var qwFrame = require('app/productManage/TrustManagement/Common/Scripts/QuickWizard.FrameEnhanceCus');
    var appGlobal = require('App.Global');
    var GlobalVariable = appGlobal.GlobalVariable;
    var trustId = common.getQueryString('trustId');
    var tCode = common.getQueryString('TrustCode');
    var reportDate = common.getQueryString('ReportDate');
    console.log(trustId, tCode, reportDate)
    var vm = new Vue({
        el:"#app",
        data: {
            url: location.protocol + "//" + location.host + "/GoldenStandABS/www/basicData/PythonReport/LoanServiceReportMapping.html?tid=" + trustId + "&TrustCode=" + tCode + "&NewRull=1"
        },
        methods: {
            changeIframe: function ($event) {
                
                var target = $event.currentTarget;
                var self = this;
                if (target.id) {
                    $(target).removeClass("current_li").addClass("current_li");
                    $(target).siblings().removeClass("current_li")
                    if (target.id == "comRepet") {
                        self.url = "../TrustCollectionPicker/TrustCollectionPicker.html?TrustId=" + trustId + "&&TrustCode=" + tCode + "&&transform=do"
                    } else if (target.id == "ReportSevers") {
                        self.url = "DoReport.html?TrustId=" + trustId + "&&TrustCode=" + tCode + "&&ReportDate=" + reportDate + "&ReportGuide=1"
                    } else if (target.id == "LoanServiceReportAnalysis") {
                        self.url = location.protocol + "//" + location.host + "/GoldenStandABS/www/basicData/PythonReport/LoanServiceReportMapping.html?tid=" + trustId + "&TrustCode=" + tCode + "&NewRull=1";
                       
                    }
                }
            }
        }
    })
})