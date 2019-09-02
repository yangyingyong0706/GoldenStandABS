
define(function (require) {

    var $ = require('jquery');

    var common = require('common');

    var GlobalVariable = require('globalVariable');
    var wcfDataServices = require('app/productManage/Scripts/wcfProxy');
    require('app/productManage/interface/trustCollectionPicker_interface');
    require('gsAdminPages');
    require('asyncbox');
    var gsUtil = require('gsUtil');
    var tCode = common.getQueryString('TrustCode');
    var trustId = common.getQueryString('trustId');
    //var taskCode = gsUtil.getQueryString("taskCode") ? gsUtil.getQueryString("taskCode") : "";
    //var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";

    $(function () {
        GetPeriodData(function (list) {
            if (list) {
                var html = '';//'<option value="all">所有</option>';
                //sortData(list, 'OptionValue');
                $.each(list, function (i, item) {
                    //var t = item.EndDate ? getStringDate(item.EndDate).dateFormat('yyyy-MM-dd') : '';
                    html += '<option style="font-size:14px" value="' + item.EndDate + '">' + item.Period + '</option>';
                });
                if (html == "") $("#btnss").attr("disabled", "disabled");
                $('#collectPeriod').html(html);
            }
        });
    })
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
});