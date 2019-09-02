var RunTask;
define(function (require) {

    var $ = require('jquery');

    var common = require('common');

    var GlobalVariable = require('globalVariable');
    var taskIndicator = require('gs/taskProcessIndicator');
    var sVariableBuilder = require('gs/sVariableBuilder');
    var wcfDataServices = require('app/productManage/Scripts/wcfProxy');
    require('gsAdminPages');
    require('asyncbox');
    require('app/productManage/interface/trustCollectionPicker_interface');
    var gsUtil = require('gsUtil');
    var GSDialog = require("gsAdminPages");
    var trustId = gsUtil.getQueryString("TrustId") ? gsUtil.getQueryString("TrustId") : "";
    var transform = common.getQueryString("transform");
    //var taskCode = gsUtil.getQueryString("taskCode") ? gsUtil.getQueryString("taskCode") : "";
    //var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";

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
        if (!trustId) {
            trustId = sessionStorage.getItem("trustIds")?sessionStorage.getItem("trustIds"):"";
        }

        GetPeriodData(function (list) {
            if (list) {
                var html = '';//'<option value="all">所有</option>';
                //sortData(list, 'OptionValue');
                $.each(list, function (i, item) {
                    //var t = item.EndDate ? getStringDate(item.EndDate).dateFormat('yyyy-MM-dd') : '';
                    html += '<option style="font-size:14px" value="' + item.EndDate + '">' + (parseInt(i)+1)+'.'+'&nbsp'+item.Period + '</option>';
                });
                if (html == "") $("#btnss").attr("disabled", "disabled");
                $('#collectPeriod').html(html);
            }
        });
    })
    if (transform) {
        $(".col-10").css("width", "100%");
        $(".col-3").css("width", "30%");
        $(".col-7").css("width", "70%");
        $(".autoLayout-plugins").css("marginBottom", "20px")
        $(".main").css("padding", "15px");
        $("#Submits").hide();
        $(".stitle").show()
    }
    if (transform == "TaskList") {
        $("#Submit").css("display", "none");
        $("#runtask").css("display", "inline");

    }
    //期数校验
    $("#period").keyup(function () {
        var val = $(this).val();
        var tex = new RegExp("[^0-9]");
        if (tex.test(val)) {
            $(this).val("")
        }

    })
    function GetPeriodData(callback) {
        var executeParam = {
            SPName: 'usp_GetTrustCollectionPeriods', SQLParams: [
                {
                    Name: 'TrustId',
                    value: trustId,
                    DBType: 'int'
                },
            ]
        };
        
        var data = common.ExecuteGetData(false, GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?", 'TrustManagement', executeParam);
        callback(data);
    }


    RunTask = function RunTask() {
        //
        var request = getRequest();
        var SessionId = request.SessionId;
        var tid = sessionStorage.getItem("trustIds" + SessionId);
        var tCode = sessionStorage.getItem("trustCodes" + SessionId);
        var endDate = $('#collectPeriod').val();
        var period = $('#period').val();
        var dparts = endDate.split('-');
        var DimReportingDateId = dparts[0] + dparts[1] + dparts[2];
        var startPeriod = 0;
        var endPeriod = 2;
        sessionStorage.setItem("endDate" + SessionId, endDate);
        sessionStorage.setItem("period" + SessionId, period);
        sessionStorage.setItem("DimReportingDateId" + SessionId, DimReportingDateId);
        sessionStorage.setItem("startPeriod" + SessionId, startPeriod);
        sessionStorage.setItem("endPeriod" + SessionId, endPeriod);
        sessionStorage.setItem("liveperiod" + SessionId, period-1);


        var ActionDisplayName = request.ActionDisplayName;
        if (SessionId && ActionDisplayName) {
            var executeParams = {
                SPName: 'TrustManagement.usp_UpdateTaskListStatus', SQLParams: [
                    { Name: 'SessionId', value: SessionId, DBType: 'string' },
                    { Name: 'ProcessActionName', value: ActionDisplayName, DBType: 'string' }

                ]
            };
            var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
            common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParams, function (res) {
                GSDialog.HintWindow('保存成功');
            });

        }
    }
});