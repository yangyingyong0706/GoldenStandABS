var TargetSqlConnection = 'Server=DAL_SEC;Database=DAL_SEC_PoolConfig;Trusted_Connection=True;';
define(['jquery', 'app/assetFilter/js/dataProcess', 'gs/webProxy', 'gsAdminPages'], function ($, dataProcess, webProxy, GSDialog) {// 'gs/uiFrame/js/gs-admin-2.pages'GSDialog
    var PoolId = common.getQueryString('PoolId');
    var ParentPoolId = common.getQueryString('ParentPoolId');
    var poolHeader;
    $(function () {
        var TaskCode = common.getQueryString('TaskCode');
        dataProcess.getBasePoolContent(ParentPoolId, function (response) {
            var $sel = $('#selAssociatedAssetPool')
            var options = '';
            $.each(response, function (i, v) {
                if (v.PoolId != PoolId) {
                    options += '<option value="{0}">{1}</options>'.format(v.PoolId, v.PoolName);
                }
               
            });
            $sel.append(options);
        })
        $('#btnSubmit').click(function () { SubmitPage(TaskCode, PoolId); });
        $('#cancel').click(function () { Cancel(); });
    });

    function SubmitPage(taskCode, poolId) {
        var poolHeader;
        var dimAssetTypeId;
        var svcUrl = webProxy.dataProcessServiceUrl + "CommonGetExecute?connConfig=DAL_SEC_PoolConfig&appDomain=config&executeParams=";
        var params = [
            ['PoolId', poolId, 'int']
        ];

        var promise = webProxy.comGetData(params, svcUrl, 'usp_GetPoolHeaderById');
        promise().then(function (response) {
            if (typeof response === 'string') { poolHeader = JSON.parse(response); }
            else { poolHeader = response; }
        });

        svcUrl = webProxy.dataProcessServiceUrl + "CommonGetExecute?connConfig=DAL_SEC_PoolConfig&appDomain=dbo&executeParams=";
        promise = webProxy.comGetData(params, svcUrl, 'usp_GetPoolHeaderExtById');

        promise().then(function (response) {
            if (typeof response === 'string') { dimAssetTypeId = JSON.parse(response)[0].DimAssetTypeId; }
            else { dimAssetTypeId = response[0].DimAssetTypeId; }
        });

        
        var source2PoolId = $('#selAssociatedAssetPool option:selected').val();
        if (!source2PoolId) {
            GSDialog.HintWindow('没有选择的资产池！');
            return;
        }

        sVariableBuilder.AddVariableItem('ParentPoolId', poolId, 'Int', 0, 0, 0);
        sVariableBuilder.AddVariableItem('Source2PoolId', source2PoolId, 'Int', 0, 0, 0);
        sVariableBuilder.AddVariableItem('IsParent', 0, 'Int', 0, 0, 0);
        sVariableBuilder.AddVariableItem('ActionPoolType', 'PoolMergeProcess', 'String', 0, 0, 0);
        sVariableBuilder.AddVariableItem('DimOrganisationId', poolHeader[0].DimOrganisationID, 'Int', 0, 0, 0);
        sVariableBuilder.AddVariableItem('DimAssetTypeID', dimAssetTypeId, 'Int', 0, 0, 0);
        sVariableBuilder.AddVariableItem('DimReportingDateId', poolHeader[0].DimReportingDateID, 'Int', 0, 0, 0);
        
        var sVariable = sVariableBuilder.BuildVariables();

        var tIndicator = new taskIndicator({
            width: 500,
            height: 550,
            clientName: 'TaskProcess',
            appDomain: 'ConsumerLoan',
            taskCode: taskCode,
            sContext: sVariable,
            callback: function () {

                sVariableBuilder.ClearVariableItem();
                parent.location.href = parent.location.href;
                $('#modal-close', window.parent.document).trigger('click');
            }
        });
        tIndicator.show();


    }
    function Cancel() {
        $('#modal-close', parent.document).trigger('click');

    }


})

