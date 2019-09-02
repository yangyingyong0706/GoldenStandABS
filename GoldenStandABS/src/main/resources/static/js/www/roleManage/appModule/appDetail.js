define(function (require) {
    var $ = require('jquery');
    require('jquery-ui');
    var kendo = require('kendo.all.min');
    var RoleOperate = require('gs/uiFrame/js/roleOperate');
    require('anyDialog');
    var common = require('common');
    var GSDialog = require("gsAdminPages")
    var self = this;
    var HaveDoneAction = false;//用于父页面是否需要刷新,子页面如果有Save操作会给它赋值
    var flag = 0;
    var ApplicationId = null;

    $(function () {
        flag = common.getQueryString("flag");
        ApplicationId = common.getQueryString("appId");
        GetAppInfo(ApplicationId);

    });
    onchange = "validControlValue(this)"
    function registerEvent() {
        $("#btnAppAdd").click(function () {
            common.showDialogPage('appDetail.html?flag=0', '添加', winWidth * 3 / 5, winHeight * 4 / 5, function () {
                //var haveDoneAction = window.frames["dialogIframe"].HaveDoneAction;
                //if (haveDoneAction) {
                //    runderGrid();
                //}
                runderGrid();
            });

        });
        $('.validControlValue').change(function () {
            var inputItem = $(this)
            common.validControlValue(inputItem);
            //= "validControlValue(this)"
        })
    }

    function GetAppInfo(ApplicationId) {
        if (ApplicationId != null) {
            RoleOperate.getAppInfoById(ApplicationId, function (data) {
                $("#appName").val(data[0].ApplicationName);
                $("#appDes").val(data[0].Description);
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
        var xml = '<item><ApplicationName>' + ApplicationName + '</ApplicationName><Description>' + Description + '</Description></item>'
        xml = encodeURIComponent(xml);
        RoleOperate.saveApplicationData(xml, flag, ApplicationId, callback);
        function callback(r) {
            if (r == '1') {
                GSDialog.HintWindow("已添加过此应用名称,请勿重复添加！");

            }
            else if (r == '2') {
                GSDialog.HintWindow("保存成功！", function () {
                    window.parent.refreshGrid();
                });

            }
            else if (r == '3') {  //编辑页面保存后                  
                GSDialog.HintWindow("应用名称重复！请重新命名！");
            }
            else if (r == '4') {
                GSDialog.HintWindow('编辑成功！', function () {
                    window.parent.refreshGrid();
                })


            }
            else { GSDialog.HintWindow(r); }
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




