/// <reference path="jquery.min.js" />
define(['jquery'],function ($) {
    var GlobalVariable = {
        Language_EN: 'en-US',
        Language_CN: 'zh-CN',
        Language_Default: 'zh-CN',
        Language_Set: 'ck_LanguageSet',

        TaskProcessEngineServiceURL: location.protocol + '//' + location.host + '/TaskProcessEngine/SessionManagementService.svc/jsAccessEP/',
        QuickWizardServiceUrl: location.protocol + '//' + location.host + '/QuickWizardService/WizardService.svc/',
        CashflowStudioURL: location.protocol + '//' + location.host + '/CashFlowEngine/UITaskStudio/index.html?appDomain=Task',
        CashFlowStudioServie: location.protocol + '//' + location.host + '/CashFlowEngine/CashFlowStudioService.svc/jsAccessEP/',

        Business_Unique: 'unique',
        Business_Trust: 'trust',
        Business_User: 'user',
        Business_Org: 'org',

        UiTempl_Stand: 'qw_KO_StandView',
        UiTempl_Grid: 'qw_KO_GridView',
        UiTempl_Tab: 'qw_KO_TabView',

        AssetTypeDBMapping: {
            'ConsumerLoan': { 'DALDB': 'SFM_DAL_ConsumerLoan', 'DALConnStr': 'Data Source=MSSQL;Initial Catalog=SFM_DAL_ConsumerLoan;Integrated Security=SSPI;' },
            'RMBS': { 'DALDB': 'SFM_DAL_Main', 'DALConnStr': 'Data Source=MSSQL;Initial Catalog=SFM_DAL_Main;Integrated Security=SSPI;' },
            'AUTO': { 'DALDB': 'SFM_DAL_Main', 'DALConnStr': 'Data Source=MSSQL;Initial Catalog=SFM_DAL_Main;Integrated Security=SSPI;' },
            'ConsumerCredit': { 'DALDB': 'SFM_DAL_Main', 'DALConnStr': 'Data Source=MSSQL;Initial Catalog=SFM_DAL_Main;Integrated Security=SSPI;' },
            'MicroCredit': { 'DALDB': 'SFM_DAL_Main', 'DALConnStr': 'Data Source=MSSQL;Initial Catalog=SFM_DAL_Main;Integrated Security=SSPI;' },
            'CLO': { 'DALDB': 'SFM_DAL_Main', 'DALConnStr': 'Data Source=MSSQL;Initial Catalog=SFM_DAL_Main;Integrated Security=SSPI;' },
            'Insurance': { 'DALDB': 'SFM_DAL_Others', 'DALConnStr': 'Data Source=MSSQL;Initial Catalog=SFM_DAL_Others;Integrated Security=SSPI;' }
        }
    }

    function CallWCFSvc(svcUrl, isAsync, rqstType, fnCallback) {
        var sourceData;
        $.ajax({
            cache: false,
            type: rqstType,
            async: isAsync,
            url: svcUrl,
            dataType: "json",
            contentType: "application/xml;charset=utf-8",
            data: {},
            success: function (response) {
                if (typeof response == 'string')
                    sourceData = JSON.parse(response);
                else
                    sourceData = response;
                if (fnCallback) fnCallback(sourceData);
            },
            error: function (response) { alert('Error occursed while requiring the remote source data!'); }
        });

        if (!isAsync) { return sourceData; }
    }
    function UploadFile(fileCtrlId, fileName, folder, fnCallback) {
        var fileData = document.getElementById(fileCtrlId).files[0];
        var svcUrl = GlobalVariable.QuickWizardServiceUrl + 'FileUpload?fileName={0}&fileFolder={1}'.format(
            encodeURIComponent(fileName), encodeURIComponent(folder));
        $.ajax({
            url: svcUrl,
            type: 'POST',
            data: fileData,
            cache: false,
            dataType: 'json',
            processData: false, // Don't process the files
            //contentType: "application/octet-stream", // Set content type to false as jQuery will tell the server its a query string request
            success: function (response) {
                var sourceData;
                if (typeof response == 'string')
                    sourceData = JSON.parse(response);
                else
                    sourceData = response;
                if (fnCallback) fnCallback(sourceData);
            },
            error: function (data) {
                alert('File upload failed!');
            }
        });
    }

    return {
        GlobalVariable: GlobalVariable,
        CallWCFSvc: CallWCFSvc,
        UploadFile: UploadFile
    }
});
