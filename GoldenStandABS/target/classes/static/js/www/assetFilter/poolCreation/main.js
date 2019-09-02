define(function (require) {
    var $ = require('jquery');
    //require('jquery-ui');
    var common = require('gs/uiFrame/js/common');
    require('date_input');
    //require('gs/uiFrame/js/gs-admin-2.pages');
    require('app/components/assetPoolList/js/PoolCut_Interface')
    var GlobalVariable = require('gs/globalVariable');
    //var GSDialog = require('gs/uiFrame/js/gs-admin-2.pages');
    //require('anyDialog');

    var taskIndicator = require('gs/taskProcessIndicator');
    var sVariableBuilder = require('gs/sVariableBuilder');

    function init() {
        $('.date-plugins').date_input();
        $('#AssetPoolCreationForm .form-control').change(function () {
            CommonValidation.ValidControlValue($(this));
        });

        var executeParam = { SPName: 'dbo.usp_GetDimOrganisationID', SQLParams: [] };
        var executeParams = encodeURIComponent(JSON.stringify(executeParam));
        var serviceUrl = GlobalVariable.PoolCutServiceURL + 'CommonGet?connName=TrustManagement&exeParams=' + executeParams;

        CallWCFSvc(serviceUrl, true, 'GET', function (data) {
            var $sel = $('#OrganisationCode')
            var options = '';
            $.each(data, function (i, v) {
                options += '<option value="{0}">{1}</options>'.format(v.DimOrganisationID, v.OrganisationDesc);
            });

            $sel.append(options);
        });

        var executeParam = { SPName: 'dbo.usp_GetDimAssetID', SQLParams: [] };
        var executeParams = encodeURIComponent(JSON.stringify(executeParam));
        var serviceUrl = GlobalVariable.PoolCutServiceURL + 'CommonGet?connName=TrustManagement&exeParams=' + executeParams;

        CallWCFSvc(serviceUrl, true, 'GET', function (data) {
            var $sel = $('#AssetType')
            var options = '';
            $.each(data, function (i, v) {
                options += '<option value="{0}">{1}</options>'.format(v.DimAssetTypeID, v.AssetTypeDesc);
            });

            $sel.append(options);
        });

        var executeParam = { SPName: 'TrustManagement.usp_GetTrusts', SQLParams: [] };
        executeParam.SQLParams.push({ Name: 'language', Value: 'zh-cn', DBType: 'string' });
        var executeParams = encodeURIComponent(JSON.stringify(executeParam));
        var serviceUrl = GlobalVariable.PoolCutServiceURL + 'CommonGet?connName=TrustManagement&exeParams=' + executeParams;

        CallWCFSvc(serviceUrl, true, 'GET', function (data) {
            var $sel = $('#TrustId')
            var options = '';
            $.each(data, function (i, v) {
                options += '<option value="{0}">{1}</options>'.format(v.TrustId, v.TrustName);
            });

            $sel.append(options);
        });


    }

    function CreatePool() {
        var isFormFieldsAllValid = true;
        var element = $("#taskIndicatorArea", parent.document)

        

        $('#AssetPoolCreationForm .form-control').each(function () {
            if (!CommonValidation.ValidControlValue($(this))) isFormFieldsAllValid = false;
        });

        if (!isFormFieldsAllValid)
            return false;

        sVariableBuilder.AddVariableItem('PoolName', $('#txtPoolName').val(), 'String', 1, 1, 1);
        sVariableBuilder.AddVariableItem('DimOrganisationId', $('#OrganisationCode').val(), 'String', 1, 1);
        sVariableBuilder.AddVariableItem('DimAssetTypeId', $('#AssetType').val(), 'String', 1, 1);
        sVariableBuilder.AddVariableItem('DimReportingDateId', $('#txtRDate').val().replace(/-/g, ''), 'String', 1);
        sVariableBuilder.AddVariableItem('PoolType', $('#selPoolType').val(), 'String', 1);
        sVariableBuilder.AddVariableItem('PoolCutTypeCode', $('#selPoolCutType').val(), 'String', 1);
        sVariableBuilder.AddVariableItem('SoldUnSoldTypeCode', 'OnlyUnsold', 'String', 1);
        sVariableBuilder.AddVariableItem('TargetTrust', '', 'String', 1);
        sVariableBuilder.AddVariableItem('SourceTrust', $('#TrustId').val(), 'String', 1);
        sVariableBuilder.AddVariableItem('UserName', '0#.w|deve\\ningwei', 'String', 1);
        sVariableBuilder.AddVariableItem('Overlap', 'true', 'String', 1);
        sVariableBuilder.AddVariableItem('ConfigSqlConnection', 'Server=DAL_SEC;Database=DAL_SEC_PoolConfig;Trusted_Connection=True;', 'String', 1);
        var sVariable = sVariableBuilder.BuildVariables();

        var tIndicator = new taskIndicator({
            width: 500,
            height: 550,
            clientName: 'TaskProcess',
            appDomain: 'ConsumerLoan',
            taskCode: 'ConsumerLoanPoolBaseInit',
            sContext: sVariable,
            callback: function () {
                parent.window.location.reload();//href = '/GoldenStandABS/www/components/assetPoolList/AssetPoolList.html';
                $('#modal-close', parent.document)[0].click()
                sVariableBuilder.ClearVariableItem();
            }
        });

        tIndicator.show();
    }
    function CancelCreation() {
        GSDialog.close(0);
    }

    $(function () {
        init();
        $('#createpool').click(function () {
            CreatePool();
        });
        $('#cancelcreation').click(function () {
            CancelCreation();
        });
    })
})