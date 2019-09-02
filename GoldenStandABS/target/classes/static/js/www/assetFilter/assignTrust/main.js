define(function (require) {
    var $ = require('jquery');
    //require('jquery-ui');
    var GlobalVariable = require('gs/globalVariable');
    var common = require('gs/uiFrame/js/common');
    var GSDialog = require('gs/uiFrame/js/gs-admin-2.pages');
    require('app/components/assetPoolList/js/PoolCut_Interface');
    var taskIndicator = require('gs/taskProcessIndicator');
    var sVariableBuilder = require('gs/sVariableBuilder');
    $(function () {
        var rcvData = GSDialog.getData();
        var TaskCode = rcvData.TaskCode;
        var PoolId = rcvData.Pool.PoolId;
        if (!TaskCode || !PoolId || isNaN(PoolId)) { return; }

        $('#spanPageTitle').text(rcvData.title);

        var executeParam = { SPName: 'TrustManagement.usp_GetTrusts', SQLParams: [] };
        executeParam.SQLParams.push({ Name: 'language', Value: 'zh-cn', DBType: 'string' });

        var executeParams = encodeURIComponent(JSON.stringify(executeParam));

        var serviceUrl = GlobalVariable.PoolCutServiceURL + 'CommonGet?connName=TrustManagement&exeParams=' + executeParams;

        CallWCFSvc(serviceUrl, true, 'GET', function (data) {
            var $sel = $('#selAssociatedTrust')
            var options = '';
            $.each(data, function (i, v) {
                options += '<option value="{0}">{1}</options>'.format(v.TrustId, v.TrustCode);
            });

            $sel.append(options);
        });

        $('#btnSubmit').click(function () { SubmitPage(TaskCode, PoolId); });
        $('#cancel').click(function () { Cancel(); });
    });

    function SubmitPage(taskCode, poolId) {
        var element = $("#taskIndicatorArea", parent.document)
        sVariableBuilder.AddVariableItem('DimReportingDateId', (new Date()).dateFormat('yyyyMMdd'), 'Int', 1, 0, 0);
        sVariableBuilder.AddVariableItem('TrustId', $('#selAssociatedTrust').val(), 'Int', 1, 0);
        sVariableBuilder.AddVariableItem('TrustName', $('#selAssociatedTrust option:selected').text(), 'String', 1, 0);
        sVariableBuilder.AddVariableItem('PoolID', poolId, 'Int', 1, 0);
        sVariableBuilder.AddVariableItem('TemplateFolder', 'E:\\TSSWCFServices\\PoolCut\\ConsumerLoan\\Document\\' + $('#selAssociatedTrust').val(), 'Int', 1, 0);
        sVariableBuilder.AddVariableItem('HostUrl', GlobalVariable.SslHost, 'String', 1, 0);

        var sVariable = sVariableBuilder.BuildVariables();

        var tIndicator = new taskIndicator({
            width: 500,
            height: 550,
            clientName: 'TaskProcess',
            appDomain: 'ConsumerLoan',
            taskCode: taskCode,
            sContext: sVariable,
            callback: function () {
                $('iframe[src*=basePoolContent]', parent.document)[0].contentWindow.location.reload(true);
                $('.ab_close', parent.document)[0].click()
                sVariableBuilder.ClearVariableItem();
            }
        });

        tIndicator.show();

    }
    function Cancel() {
        GSDialog.close(0);
    }
})
