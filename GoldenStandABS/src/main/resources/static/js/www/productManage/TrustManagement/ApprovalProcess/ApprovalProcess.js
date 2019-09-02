define(function (require) {
    
    $(function () {
        var $ = require('jquery');
        var GlobalVariable = require('globalVariable');
        var common = require('gs/uiFrame/js/common');
        var webProxy = require('gs/webProxy');
        require('date_input');
        var btn=$("#btn");
        var Reasons = $("#Reasons");
        var Username = common.getQueryString("Username");
        var TrustId = common.getQueryString("TrustId");
        var Applicant = common.getQueryString("Applicant");
        var ApproveState = common.getQueryString("ApproveState")
        $("#proctTitleId").val(TrustId);
        $('.date-plugins').date_input();
        require("kendomessagescn");
        require("kendoculturezhCN");
        var myDate = new Date();
        var today = myDate.getDate();
        var month = myDate.getMonth() + 1;
        var year = myDate.getFullYear();
        var Tomorrows = today + 1;
        Tomorrow = Tomorrows > 31 ? "1" : today + 1;
        var NextMonth = Tomorrows > 31 ? month + 1 : month;
        var NextYear = NextMonth > 12 ? NextYear + 1 : year;
        if (today < 10)
        { today = "0" + today }
        if(Tomorrow < 10)
        { Tomorrow = "0" + Tomorrow }
        if(NextMonth < 10)
        { NextMonth = "0" + NextMonth }
        if(month < 10)
        { month = "0" + month }

        //var Ed = myDate.toLocaleDateString().replace(/\//g, '-');
        var Ed = year + "-" + month + "-" + today
        var Ad = NextYear + "-" + NextMonth + "-" + Tomorrow
         $("#endDate").val(Ed);
         $("#applyDate").val(Ad);
         function closeWindow() {
             parent.location.reload();
             $("#modal-close", parent.document).trigger("click");
        }
         btn.click(function () {
            var applyDate = $("#applyDate").val().trim();
            var endDate = $("#endDate").val().trim();
            if (!Reasons.val().length == 0) {
                var parameterDatas = [
                  ["Username", Applicant, "string"]//申请人
                , ["TrustId", TrustId, "string"]//产品代码
                , ["Reasons", Reasons.val(), "string"]//原因
                , ["applyDate", applyDate, "string"]//申请修改的开始时间
                , ["endDate", endDate, "string"]//申请修改的结束时间
                , ["creatName", Username, "string"]//产品创建者
                , ["ApproveState", ApproveState, "string"]//状态
                , ["currentTime", new Date().toLocaleString().replace(/\s+/g, ""), "string"]
                ]
                var svcUrls = webProxy.dataProcessServiceUrl + "CommonGetExecute?connConfig=TrustManagement&appDomain=TrustManagement&executeParams=";
                var promise = webProxy.comGetData(parameterDatas, svcUrls, 'usp_SaveProdctApproveOperration');
                promise().then(function (response) {
                    var res = JSON.parse(response);
                    if (res[0].i == 2) {
                        Reasons.removeClass("altMsg");
                        common.alertMsg("申请成功", 1);
                        closeWindow();
                        //$('.iframe', window.parent.document)[0].contentWindow.document.getElementById("stateOperration").innerHTML='等待审批'
                    }
                });
            } else {
                Reasons.addClass("altMsg");
                common.alertMsg("申请原因不能为空", 1);
            }
        })
        
    })
});