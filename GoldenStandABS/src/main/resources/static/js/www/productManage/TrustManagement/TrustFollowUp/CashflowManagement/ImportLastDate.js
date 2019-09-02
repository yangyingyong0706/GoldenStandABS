define(function (require) {
    var GlobalVariable = require('globalVariable');
    var common = require('common');
    require('date_input');
    var GSDialog = require("gsAdminPages");
    var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
    var trustId = common.getUrlParam('tid');
    var enter = common.getUrlParam('enter');
    var PoolDBName = common.getUrlParam('PoolDBName');
    PoolDBName = PoolDBName ? PoolDBName : 'TrustManagement';
    var taskIndicator = require('gs/taskProcessIndicator');
    var sVariableBuilder = require('gs/sVariableBuilder');
    
    var endDate = '';
    $("#ImportDate").find(".date-plugins").date_input();

    var executeParam = {
        'SPName': "TrustManagement.usp_GetCashFlowOAAcountsMaxDueDate",
        'SQLParams': [{ 'Name': 'TrustId', 'Value': trustId, 'DBType': 'int' }]
    };
    
    common.ExecuteGetData(false, svcUrl, PoolDBName, executeParam, function (data) {
        console.log(data)
        endDate = data[0].Column1;
    });
    $('#date-plugins').attr('placeholder', '最后还款日: ' + endDate);
    $('#date-plugins').focus(function () {
        $('.tipsWord').text('');
    })
    $('#date-plugins').change(function () {
        var ImportDate = $('#date-plugins').val();
        var ValidImportDate = ImportDate.replace(/-/g, '');
        endDate = endDate.replace(/-/g, '');
        //if (parseInt(ValidImportDate) > parseInt(endDate)) {
        //    $('.tipsWord').text('输入日期大于最后还款日，请重新输入');
        //    $('#date-plugins').val('')
        //}
    })
    $('#SureBtn').click(function () {
        var ImportDate = $('#date-plugins').val();
        if (ImportDate === '') {
            $('.tipsWord').text('还款日不能为空');
        } else {
            $("#mask").show();
            sVariableBuilder.AddVariableItem('endDate', ImportDate, 'String', 0, 0, 0);
            sVariableBuilder.AddVariableItem('TrustId', trustId, 'String', 0, 0, 0);
            sVariableBuilder.AddVariableItem('ConnectionString', 'Data Source=MSSQL;Initial Catalog=' + PoolDBName + ';Integrated Security=SSPI', 'String', 0, 0, 0);
                
            var sVariable = sVariableBuilder.BuildVariables();
            var tIndicator = new taskIndicator({
                width: 500,
                height: 550,
                clientName: 'TaskProcess',
                appDomain: 'Task',
                taskCode: 'GenerateCashFLowOAAccountsPaid',
                sContext: sVariable,
                callback: function () {
                    sVariableBuilder.ClearVariableItem();
                    $("#modal-close", window.parent.document).trigger("click");
                    window.location.reload(true);
                }
            });
            tIndicator.show();
        }
    })

})