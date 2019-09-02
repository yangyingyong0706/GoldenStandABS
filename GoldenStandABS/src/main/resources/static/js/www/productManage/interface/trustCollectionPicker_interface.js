function getRequest() {
    var url = location.search; //获取url中"?"符后的字串   
    var theRequest = new Object();
    if (url.indexOf("?") != -1) {
        var str = url.substr(1);
        strs = str.split("&");
        for (var i = 0; i < strs.length; i++) {
            theRequest[strs[i].split("=")[0]] = decodeURIComponent(strs[i].split("=")[1]);
        }
    }
    return theRequest;
};

function Submit() {
    var $ = require('jquery');
    var GSDialog = require('gsAdminPages');
    var endDate = $('#collectPeriod').val();
    var period = $('#period').val();
    var request = getRequest();
    var SessionId = request.SessionId;
    var tid = sessionStorage.getItem("trustIds" + SessionId);
    var tCode = sessionStorage.getItem("trustCodes" + SessionId);
    var dparts = endDate.split('-');
    var DimReportingDateId = dparts[0] + dparts[1] + dparts[2];
    var startPeriod = 0;
    var endPeriod = 2;
    sessionStorage.setItem("endDate" + SessionId, endDate);
    sessionStorage.setItem("period" + SessionId, period);
    sessionStorage.setItem("DimReportingDateId" + SessionId, DimReportingDateId);
    sessionStorage.setItem("startPeriod" + SessionId, startPeriod);
    sessionStorage.setItem("endPeriod" + SessionId, endPeriod);
    sessionStorage.setItem("liveperiod" + SessionId, period - 1);
   
    if (parent.parent.frames[0].RunTrustWaterFall) {
        parent.parent.frames[0].RunTrustWaterFall(endDate, period);
        GSDialog.close('');
    } else {
        RunTrustWaterFall(endDate, period)
    }

}
function RunTrustWaterFall(reportingDate, periods) {
    var $ = require('jquery');
    var taskIndicator = require('gs/taskProcessIndicator');
    var sVariableBuilder = require('gs/sVariableBuilder');
    var common = require('common')
    var GlobalVariable = require('globalVariable');
    // 获取行号
    var tid = JSON.parse(sessionStorage.getItem("ReportValue")) ? JSON.parse(sessionStorage.getItem("ReportValue")).TrustId : common.getQueryString("TrustId");
    var tCode = JSON.parse(sessionStorage.getItem("ReportValue")) ? JSON.parse(sessionStorage.getItem("ReportValue")).TrustCode : common.getQueryString("TrustCode");
    var dparts = reportingDate.split('-');
    var DimReportingDateId = dparts[0] + dparts[1] + dparts[2];
    var startPeriod = 0;
    var endPeriod = 0;
    var period = 1;
    if (periods.length != 0) {
        if (periods.indexOf(',') != -1) {
            var parts = periods.split(',');
            startPeriod = parts[0];
            endPeriod = parts[1];
            period = parseInt(endPeriod) + 1;
        }
        else {
            period = parseInt(periods);
            endPeriod = period - 1;
        }
    }
    sVariableBuilder.AddVariableItem('TrustId', tid, 'Int', 0, 0, 0);
    sVariableBuilder.AddVariableItem('ReportingDate', reportingDate, 'String', 0, 0, 0);
    sVariableBuilder.AddVariableItem('StartPeriod', startPeriod, 'Int', 1, 0, 0);
    sVariableBuilder.AddVariableItem('EndPeriod', endPeriod, 'Int', 1, 0, 0);
    sVariableBuilder.AddVariableItem('Period', period, 'Int', 1, 0, 0);
    sVariableBuilder.AddVariableItem('CashFlowECSet', tCode, 'Int', 1, 0, 0);
    sVariableBuilder.AddVariableItem('InterestRate', 0.05, 'Int', 1, 0, 0);
    sVariableBuilder.AddVariableItem('DimReportingDateId', DimReportingDateId, 'Int', 1, 0, 0);

    var sVariable = sVariableBuilder.BuildVariables();

    var tIndicator = new taskIndicator({
        width: 600,
        height: 550,
        clientName: 'CashFlowProcess',
        appDomain: 'Task',
        taskCode: tCode,
        sContext: sVariable,
        callback: function () {
            //alert('done');
            if (decodeURI(escape(common.getQueryString('ActionDisplayName'))) && common.getQueryString('SessionId')) {
                var executeParams = {
                    SPName: 'TrustManagement.usp_UpdateTaskListStatus', SQLParams: [
                        { Name: 'SessionId', value: common.getQueryString('SessionId'), DBType: 'string' },
                        { Name: 'ProcessActionName', value: decodeURI(escape(common.getQueryString('ActionDisplayName'))), DBType: 'string' }

                    ]
                };
                var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
                common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParams, function (res) {
                    GSDialog.HintWindow('运行成功');
                });

            }
        }
    });
    tIndicator.show();
}
function Cancel() {
    var GSDialog = require('gsAdminPages');
    GSDialog.close('');
}

function OpenTransactionInput() {
    var gsUtil = require('gsUtil');
    var GSDialog = require('gsAdminPages');
    var GlobalVariable = require('globalVariable');
    var trustId = gsUtil.getQueryString("TrustId") ? gsUtil.getQueryString("TrustId") : "";
    if (!trustId) {
        trustId = sessionStorage.getItem("trustIds") ? sessionStorage.getItem("trustIds") : "";
    }
    var w = document.documentElement.clientWidth;
    var h = document.documentElement.clientHeight;
    var htmlurl = GlobalVariable.TrustManagementServiceHostURL + 'productManage/TrustManagement/TrustWizard/TrustTransactionInput.html?tid=' + trustId + '&IsDlg=1&random=' + Math.random();
    GSDialog.topOpen('交易现金流信息', htmlurl, { a: 1, b: 2 }, function (res) { }, 900, 500, "", true, true, "", false);
}