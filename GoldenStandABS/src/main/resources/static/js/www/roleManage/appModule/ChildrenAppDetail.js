define(function (require) {
    var $ = require('jquery');
    require('jquery-ui');
    var kendo = require('kendo.all.min');
    RoleOperate = require('gs/uiFrame/js/roleOperate');
    require('anyDialog');
    var common = require('common');

    var self = this;
    var HaveDoneAction = false;//用于父页面是否需要刷新,子页面如果有Save操作会给它赋值
    var flag = 0;
     PathId = null;

    $(function () {
        flag = common.getQueryString("flag");
        PathId = common.getQueryString("appId");
        GetAppInfo(PathId);

    });
    function GetAppInfo(PathId) {
        if (PathId != null) {
            RoleOperate.getChildrenAppInfoById(PathId, function (data) {
                $("#appName").val(data[0].PathName);
                $("#appDes").val(data[0].PathDescription);
            });
        }
    }


    this.saveItems = function () {
        var pass = validation();
        if (!pass) {
            return;
        }
        var ApplicationName = $("#appName").val();
        var Description = $("#appDes").val();
        //if (ApplicationName == '' || Description == '') {
        //    alert('请将应用信息填写完整！');
        //}
        //else {
        var xml = '<item><PathName>' + ApplicationName + '</PathName><Description>' + Description + '</Description></item>'
        xml = encodeURIComponent(xml);
        RoleOperate.saveChildrenAppData(xml, flag, PathId, callback);
        function callback(r) {
            if (r == '1') {
                common.alertMsg("已添加过此应用名称,请勿重复添加！");
            }
            else if (r == '2') {
                common.alertMsg("保存成功！");
                window.parent.refreshGrid();
            }
            else if (r == '3') {  //编辑页面保存后                  
                common.alertMsg("应用名称重复！请重新命名！");
            }
            else if (r == '4') {
                common.alertMsg('编辑成功！');
                //RoleOperate.getChildrenAppInfoById(PathId, function (data) {
                //    $("#appName").val(data[0].PathName);
                //    $("#appDes").val(data[0].PathDescription);
                //});
                window.parent.refreshGrid();

            }
            else { common.alertMsg(r); }
        }
        //} 
    }

    function validation() {
        var inputs = $("#ItemDiv").find("input");
        var textareas = $("#ItemDiv").find("textarea");
        var pass1 = common.validControls(inputs);
        var pass2 = common.validControls(textareas);
        if (pass1 && pass2) {
            return true;
        }
        else {
            return false;
        }

    }
});




