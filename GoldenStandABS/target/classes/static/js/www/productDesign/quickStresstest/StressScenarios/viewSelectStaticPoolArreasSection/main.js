define(function (require) {
    var $ = require('jquery');
    var common = require('common');
    var GSDialog = require('gsAdminPages');
    var appGlobal = require('App.Global');
    var GlobalVariable = require('globalVariable');

    var CallWCFSvc = appGlobal.CallWCFSvc;

    $(function () {
        var trustId = BusinessIdentifier = common.getQueryString("trustId");

        var executeParam = { SPName: 'TrustManagement.usp_GetArrearsSectionsByTrustId', SQLParams: [] };
        executeParam.SQLParams.push({ Name: 'TrustId', Value: trustId, DBType: 'string' });
        var serviceUrl = GlobalVariable.QuickWizardServiceUrl + 'CommonGetWithConnName?connName=TrustManagement&exeParams=' + encodeURIComponent(JSON.stringify(executeParam));
        CallWCFSvc(serviceUrl, true, 'GET', function (d) {
            var options = '';
            $.each(d, function (i, v) {
                options += '<option value="{0}">{1}</option>'.format(v.Section, v.SectionDescription);
            });
            $('#selArrearsSectionList').html(options);
        });
        registerButton();//注册按钮事件
    });

    //按钮事件
    function registerButton() {
        $('.normal_small_button').click(Confirm);
        $('.delet_normal_small_button').click(Cancel);
    }
    function Confirm() {
        //确定
        var selected = $('#selArrearsSectionList').val();
        var recovery = $('#recoveryRatio').val() * 1.0000 / 100;
        GSDialog.close(selected + ':' + recovery);
    }
    function Cancel() {
        //取消
        GSDialog.close(0);
    }
});