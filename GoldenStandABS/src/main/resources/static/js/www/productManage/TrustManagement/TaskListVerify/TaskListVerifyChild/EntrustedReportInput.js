define(function (require) {
    var $ = require("jquery");
    var common = require("common");
    var GSDialog = require("gsAdminPages");
    var GlobalVariable = require('globalVariable');
    var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
    var trustId;
    var trustCode;
    var EndDate;

    //获取参数对象
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
 

    $(function () {
        //存储开始期数和对比期数到sessionStorage sessionStorage.getItem("StartPeriod")
        //渲染选择专项计划列表
        function RenderTrustList() {
            var executeParams = {
                SPName: 'TrustManagement.usp_GetVerifyTaskListTrustInfo', SQLParams: [
                ]
            };
            common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParams, function (eventData) {
                var html = "";
                $.each(eventData, function (i, v) {
                    html += "<option value='" + v.TrustId + "*" + v.TrustCode + "'>" + v.TrustId + "_" + v.TrustCode + "</option>";
                })
                $("#trustChoice").append(html);
            });
        }
        RenderTrustList()

        //渲染期数列表
        function RenderComparisonList() {
            $("#ComparisonPeriodChoice").html("");
            var len = $("#trustChoice").val().length;
            var porc = $("#trustChoice").val().lastIndexOf("*");
            trustId = $("#trustChoice").val().substring(0, porc);
            trustCode = $("#trustChoice").val().substring(porc + 1, len);
            var executeParams = {
                SPName: 'TrustManagement.usp_GetVerifyTaskListTrustPeriodInfo', SQLParams: [
                     { Name: 'TrustId', value: trustId, DBType: 'string' }
                ]
            };
            common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParams, function (eventData) {
                var html = "";
                $.each(eventData, function (i, v) {
                    html += "<option value='" + v.EndDate + "'>" +(i+1)+". "+ v.EndDate + "</option>";
                })
                $("#ComparisonPeriodChoice").append(html);
            });
        }
        RenderComparisonList();

        $("#trustChoice").change(function () {
            RenderComparisonList()
        })

        $("#upinfo").click(function () {
            var request = getRequest();
            EndDate = $("#ComparisonPeriodChoice").val();
            sessionStorage.setItem("sessionnamecode" + request.SessionId, trustCode + '$' + trustId + '$' + EndDate);//用以更新sessionname
            var sessionnamecode = sessionStorage.getItem("sessionnamecode" + request.SessionId);
            var gs_UserName = sessionStorage.getItem("gs_UserName");
           
            var executeParams = {
                SPName: 'TrustManagement.ConfirmSessionNameCode', SQLParams: [
                    { Name: 'sessionnamecode', value: sessionnamecode, DBType: 'string' },
                    { Name: 'currentsessionid', value: request.SessionId, DBType: 'string' },
                    { Name: 'ImportUser', value: gs_UserName, DBType: 'string' },
                    { Name: 'objCode', value: trustCode, DBType: 'string' },

                ]
            };
            var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
            common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParams, function (res) {
                   if(res[0].result != null) {
                       request.SessionId = res[0].result;
                   }

                   sessionStorage.setItem("currentsession", request.SessionId);

                   if (res[0].MaxImportTimes == null) {
                       sessionStorage.setItem("MaxImportTimes" + request.SessionId, '1');//导入次数初始化
                   } else {
                       sessionStorage.setItem("MaxImportTimes" + request.SessionId, res[0].MaxImportTimes);
                   }

                   EndDate = $("#ComparisonPeriodChoice").val();
                // var liveperiod = $("#ComparisonLivePeriod").val();

                   var ReportValue = {
                       ReportDate: EndDate,
                       TrustCode: trustCode,
                       TrustId: trustId,
                       tid: trustId
                   };
                   sessionStorage.setItem("ReportValue", JSON.stringify(ReportValue));

                   sessionStorage.setItem("sessionnamecode" + request.SessionId, trustCode + '$' + trustId + '$' + EndDate);//更新sessionname
                   sessionStorage.setItem("trustIds" + request.SessionId, trustId);
                   sessionStorage.setItem("trustCodes" + request.SessionId, trustCode);
                   sessionStorage.setItem("ComparisonPeriod" + request.SessionId, EndDate);
                //sessionStorage.setItem("liveperiod" + request.SessionId, liveperiod);
                   $("#showIframe").attr("src", "");
                   $("#showIframe").attr("src", "../../TrustCollectionPicker/TrustCollectionPicker.html?" + "TrustId=" + trustId + "&taskCode=" + trustCode + "&IsDlg=1" + "&mode=111" + "&transform=" + request.transform + "&SessionId=" + request.SessionId + "&ActionDisplayName=" + encodeURIComponent(request.ActionDisplayName))

            });

        })
        sessionStorage.setItem("currentsession", request.SessionId);
    })
})