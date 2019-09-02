define(function (require) {
    var $ = require('jquery');
    var common = require('common');
    var RoleOperate = require('roleOperate');
    var GlobalVariable = require('globalVariable');
    require('permission');
    $(function () {
        var url = window.location.href,
        schemaName = common.getQueryString("schemaName"),
        appDomain = schemaName,
        serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonGetExecute?connConfig=TaskProcess&",
        executeParams = {
            SPName: 'usp_GetSessionDetailList', SQLParams: [
                { Name: 'SessionId', value: common.getQueryString("SessionId"), DBType: 'string' }
            ]
        };

        $("#back").click(function () {
            window.location.href = "history.html?schemaName=" + schemaName;
        })
        common.ExecuteGetData(true, serviceUrl, appDomain, executeParams, function (data) {
            console.log(data);
            $.each(data, function (i, item) {
                var tr = '<tr>';
                tr += '<td>' + (item["SequenceNo"] ? item["SequenceNo"] : '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;---') + '</td>'
                    + '<td>' + (item["ProcessActionName"] ? item["ProcessActionName"] : '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;---') + '</td>'
                    + '<td>' + (item["StartTime"] ? common.getStringDate(item["StartTime"]).dateFormat("yyyy-MM-dd  hh:mm:ss") : '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;---') + '</td>'
                    + '<td>' + (item["EndTime"] ? common.getStringDate(item["EndTime"]).dateFormat("yyyy-MM-dd  hh:mm:ss") : '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;---') + '</td>'
                    + '<td>' + (item["ActionMessage"] ? item["ActionMessage"] : '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;---') + '</td>';
                tr += '</tr>';
                $("#showDetail").append(tr);
            });
        });
    });
});
