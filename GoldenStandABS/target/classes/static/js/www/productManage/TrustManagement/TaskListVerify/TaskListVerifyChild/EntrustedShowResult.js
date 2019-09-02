define(function (require) {
    var $ = require('jquery');
    var common = require('common');
    var GlobalVariable = require('globalVariable');
    var GSDialog = require("gsAdminPages");
    var url = "TaskListVerifyChild/EntrustedKendoGridPage.html?"
    var SessionId = common.getQueryString("SessionId");
    var ScenarioCode = common.getQueryString("ScenarioCode");
    //$("#showGridone").click(function () {
    //    url = url + "ScenarioCode="+"'"+"TrustConfig"+"'"+"&SessionId=" + SessionId;
    //    GSDialog.topOpen("专项计划配置对比结果", url , "", "", "","", "bigwindow", false, false, false, false)
    //})

    switch (ScenarioCode)
    {
        case "AssetReportTwo":
            $("#showGridtwo").parents('.income').hide();
            $("#showGridthree").parents('.First').hide();
            $("#showGridfive").parents('.Third').hide();
            break;
        case "AssetReportThre":
            $("#showGridtwo").parents('.income').hide();
            $("#showGridthree").parents('.First').hide();
            $("#showGridfour").parents('.Second').hide();
            break;
        case "FiduciaryReport":
            $("#showGridfour").parents('.Second').hide();
            $("#showGridfive").parents('.Third').hide();
            break;
    }

    $("#showGridtwo").click(function () {
        url = url + "ScenarioCode=" + "'" + "CaculationImcome" + "'" + "&SessionId=" + SessionId;
        GSDialog.topOpen("收益分配对比结果", url, "", "", "","", "bigwindow", false, false, false, false)
    })
    $("#showGridthree").click(function () {
        url = url + "ScenarioCode=" + "'" + "FiduciaryReport" + "'" + "&SessionId=" + SessionId;
        GSDialog.topOpen("受托报告对比结果", url, "", "", "", "","bigwindow", false, false, false, false)
    })
    $("#showGridfour").click(function () {
        url = url + "ScenarioCode=" + "'" + "AssetReportTwo" + "'" + "&SessionId=" + SessionId;
        GSDialog.topOpen("受托报告对比结果", url, "", "", "", "", "bigwindow", false, false, false, false)
    })
    $("#showGridfive").click(function () {
        url = url + "ScenarioCode=" + "'" + "AssetReportThre" + "'" + "&SessionId=" + SessionId;
        GSDialog.topOpen("受托报告对比结果", url, "", "", "", "", "bigwindow", false, false, false, false)
    })
})