getStringDate = function (strDate) {
    //var str = '/Date(1408464000000)/';
    if (!strDate) {
        return '';
    }
    var str = strDate.replace(new RegExp('\/', 'gm'), '');
    return eval('new ' + str);
}
function IsInTrustStatus(isinTrust) {
    var webStorage = require('gs/webStorage');

    var userLanguage = webStorage.getItem('userLanguage');

    var status;
    switch (isinTrust) {
        case 1:
            status = '已转让';
            break;
        case 0:
            status = '未转让';
            break;
        default:
            x = "未转让";

    }


    if (userLanguage && userLanguage.indexOf('en') > -1) {
        switch (isinTrust) {
            case 1:
                status = 'Transferred';
                break;
            case 0:
                status = 'No Transfer';
                break;
            default:
                x = "No Transfer";

        }
    }

    return status;
}
define(function (require) {
    var $ = require('jquery');
    var kendo = require('kendo.all.min');
    var common = require('gs/uiFrame/js/common');
    require('app/components/assetPoolList/js/PoolCut_Interface')
    var kendoGridModel = require('app/transactionManage/script/kendoGridModel');
    var JqUi = require('jquery-ui');
    var vue = require('Vue');
    var date_input = require('date_input');
    var gs = require('gs/globalVariable');
    GSDialog = require('gs/uiFrame/js/gs-admin-2.pages');
    var filter = '';
    var taskIndicator = require('gs/taskProcessIndicator');
    var sVariableBuilder = require('gs/sVariableBuilder');
    var isProjectUrl = common.getQueryString('isproject');
    require("app/projectStage/js/project_interface");
    var projectId = common.getQueryString('tid');
    require("kendomessagescn");
    require("kendoculturezhCN");
    var GlobalVariable = require('gs/globalVariable');
    var userName = $.cookie('gs_UserName');
    var webProxy = require('gs/webProxy');
    var dataOperate = require('app/transactionManage/script/dataOperate');
    var height = $(window).height() - 100;
    //上面这个方法执行下面的方法，并且将其暴露出去
    
    var SQLParams = [];
    if (isProjectUrl && projectId != '') {
        var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecuteForPool?',
            executeParam = {
                SPName: "TrustManagement.usp_getFilterFromProject",
                SQLParams: [
                               { 'Name': 'projectId', 'Value': parseInt(projectId), 'DBType': 'int' }
                ]
            };
        common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
            if (data) {
                console.log(data)
                SQLParams = [
                    { Name: 'tableName', Value: 'DAL_SEC_PoolConfig.config.view_Pools', DBType: 'string' },
                    { Name: 'fiter', Value: data[0].PoolCutFilter, DBType: 'string' },
                    { Name: 'ProjectShow', Value: 1, DBType: 'int' }
                ]
            }
        });

    }
    AssetTransferMain = (function () {

        require('jquery.localizationTool');
        var webStorage = require('gs/webStorage');
        var lang = {};
        lang.AccountNo = '借据编号';
        lang.ReportingDate = '转让日';
        lang.IsInTrust = '资产状态';
        lang.OrganisationCode = '交易主体';
        lang.LoanStartDate = '计息日';
        lang.LoanMaturityDate = '到期日';
        lang.CurrentRate = '当前利率';
        lang.ApprovalAmount = '合同金额';
        lang.CurrentPrincipalBalance = '剩余本金余额';
        lang.transferred = '已转让';
        lang.nontransfer = '未转让';
        lang.select = '请选择日期';
        var userLanguage = webStorage.getItem('userLanguage');
        if (userLanguage && userLanguage.indexOf('en') > -1) {
            lang.AccountNo = 'IOUNo';
            lang.ReportingDate = 'Assignment Date';
            lang.IsInTrust = 'Asset Status';
            lang.OrganisationCode = 'Organisation Code';
            lang.LoanStartDate = 'Loan Start Date';
            lang.LoanMaturityDate = 'Loan Maturity Date';
            lang.CurrentRate = 'Current Rate';
            lang.ApprovalAmount = 'Approval Amount';
            lang.CurrentPrincipalBalance = 'Current Principal Balance';
            lang.transferred = 'Transferred';
            lang.nontransfer = 'No Transfer';
            lang.select = 'Please select assignment date';
        }
        dataOperate.transationManagerData(transationManagerJson);
        function transationManagerJson() {

            $('.date-plugins').date_input();

            function InitKendoGrid(data) {  //检查用户是否是管理员
                $.each(data, function (i, item) {
                    if (item.IsRoot) {
                        isAdmin = true;
                    }
                });
                //test
                isAdmin = true;

                if (isProjectUrl && projectId != '') {
                    if (isAdmin) {
                        filter = "where ParentPoolId=0 and userName!=''";
                    } else {
                        filter = "where ParentPoolId=0 and (userName = '" + userName + "' or AuditorUserName = '" + userName + "'" + " or IsCheck = 0)";
                    }
                } else {
                    if (!isAdmin) {
                        filter = "and ((UserName='{userName}' and AuditorUserName is null) or (UserName<>'{userName}' and AuditorUserName = '{userName}') or UserName is null)".replace(/\{userName\}/g, userName);
                    } else {
                        filter = "and AuditorUserName is null";
                    }
                }
                kendo.culture("zh-CN");
                var kendouiGrid = new kendoGridModel(height);

                if (isProjectUrl && projectId != '') {
                    kendouiGrid.Init({
                        renderOptions: {
                            creziable: true,
                            scrollable: true,
                            sortable: true,
                            columns: [{ field: "PoolId", title: '标识', locked: true, width: 100, attributes: { style: 'text-align:left' }, headerAttributes: { 'class': 'table_layer_style', style: 'text-align:left' } }
                                , { field: "PoolName", title: '工作组描述', width: 300, attributes: { style: 'text-align:left' } }
                                , { field: "PoolDescription", title: '名称', width: 220, attributes: { style: 'text-align:left' } }
                                , { field: "PoolType", title: '资产池关系', width: 150, attributes: { style: 'text-align:left' } }
                                , { field: "OrganisationDesc", title: '资产来源', width: 150, attributes: { style: 'text-align:left' } }
                                , { field: "CreatedDate", title: '创建日期', width: 150, attributes: { style: 'text-align:left' } }
                                , { field: "PoolStatus", template: '#=PoolStatus?(PoolStatus=="OPEN"?PoolStatus:(PoolStatus+"<i style=\'padding-left:3px\' class=\'fa fa-lock\'><i>")):""#', title: '状态', width: 100, attributes: { style: 'text-align:left' } }
                                , { field: "TrustCode", title: '隶属产品', width: 220, attributes: { style: 'text-align:left' } }
                                , { field: "", title: "", width: "auto" }
                            ]
                        }
                    , dataSourceOptions: {
                        otherOptions: {
                            orderby: "PoolId"
                            , DBName: 'TrustManagement'
                            , appDomain: 'TrustManagement'
                            , defaultfilter: filter
                            , executeParamType: 'extend'
                            , executeParam: {
                                SQLParams: SQLParams
                            }
                        }
                    }
                    });
                }
                else {
                    kendouiGrid.Init({
                        renderOptions: {
                            creziable: true,
                            scrollable: true,
                            sortable: true,
                            columns: [{ field: "AccountNo", title: lang.AccountNo, width: "150px", locked: true }
                                   , { field: "ReportingDate", title: lang.ReportingDate, width: "150px", template: '#=ReportingDate?getStringDate(ReportingDate).dateFormat("yyyy-MM-dd"):""#' }
                                   //, { field: "IsInTrust", title: '资产状态', template: '#=IsInTrust?IsInTrustStatus(IsInTrust):""#', attributes: { "class": "table-IsInTrust" }, width: "150px" }
                                   , {
                                       field: "IsInTrust", title: lang.IsInTrust, template: function (IsInTrust) {
                                           var IsInTrustId = IsInTrust.IsInTrust;
                                           //这里返回的是所有的数据
                                           var hasdatasStatus;
                                           if (IsInTrustId == 1) {
                                               return hasdatasStatus = lang.transferred
                                           } else if (IsInTrustId == 0) {
                                               return hasdatasStatus = lang.nontransfer
                                           } else {
                                               return hasdatasStatus = ''
                                           }
                                       }, attributes: { "class": "table-IsInTrust" }, width: "150px"
                                   }
                                   , { field: "OrganisationCode", title: lang.OrganisationCode, width: "150px" }
                                   , { field: "LoanStartDate", title: lang.LoanStartDate, width: "150px", template: '#=LoanStartDate?getStringDate(LoanStartDate).dateFormat("yyyy-MM-dd"):""#' }
                                   , { field: "LoanMaturityDate", title: lang.LoanMaturityDate, width: "150px", template: '#=LoanMaturityDate?getStringDate(LoanMaturityDate).dateFormat("yyyy-MM-dd"):""#' }
                                   , { field: "CurrentRate", title: lang.CurrentRate, width: "150px" }
                                   , { field: "ApprovalAmount", title: lang.ApprovalAmount, width: "150px" }
                                   , { field: "CurrentPrincipalBalance", title: lang.CurrentPrincipalBalance, width: "150px" }
                                   , { field: "", title: "", width: "auto" }
                                ]
                            }
                         , dataSourceOptions: {
                             otherOptions: {
                                 orderby: "AccountNo"
                                 , DBName: 'TrustManagement'
                                 , appDomain: 'TrustManagement'
                                 , defaultfilter: filter
                                 , executeParamType: 'extend'
                                 , executeParam: {
                                     SQLParams: [
                                         { Name: 'tableName', Value: 'TrustManagement.View_TrustManagementDatas', DBType: 'string' }
                                     ]
                                 }
                             }
                         }
                    });
                }
                
                kendouiGrid.RunderGrid();
            }

            $(function () {



                $('#selectLanguageDropdown_viewAssetTransfer').localizationTool({
                    'defaultLanguage': 'zh_CN', // this is the language that the server is sending anyway
                    'ignoreUnmatchedSelectors': true,
                    'showFlag': true,
                    'showCountry': false,
                    'showLanguage': true,
                    'onLanguageSelected': function (languageCode) {
                        /*
                         * When the user translates we set the cookie
                         */
                        webStorage.setItem('userLanguage', languageCode);
                        return true;
                    },

                    /* 
                     * Translate the strings that appear in all the pages below
                     */
                    'strings': {

                        'id:viewAssetTransfer_ReportingDate': {
                            'en_GB': 'Assignment Date:'
                        },

                        'placeholder::id:viewAssetTransfer_AssetDataVal': {
                            'en_GB': 'Select Reporting Date'
                        },
                        'id:viewAssetTransfer_AssetDataBtn': {
                            'en_GB': 'Transfer'
                        }


                    }
                });

                var userLanguage = webStorage.getItem('userLanguage');
                if (userLanguage) {
                    $('#selectLanguageDropdown_viewAssetTransfer').localizationTool('translate', userLanguage);
                }
                $('body').show();

                InitKendoGrid();
                $("#viewAssetTransfer_AssetDataBtn").click(function () {
                    var grid = $("#" + gridDomId).data("kendoExtGrid");//获得grid对象
                    var dataRows = grid.items();//表格行
                    var data = grid.dataItem(grid.select());//表格行对象
                    //获得新的转让日
                    var AssetDataVal = $("#viewAssetTransfer_AssetDataVal").val();
                    if (AssetDataVal) {
                        if (isProjectUrl) {
                            sVariableBuilder.AddVariableItem('TrustId', 8, 'Int', 0, 0, 0);
                            sVariableBuilder.AddVariableItem('IsInTrust', 1, 'Int', 0, 0, 0);
                            sVariableBuilder.AddVariableItem('UserName', 'goldenstand', 'String', 0, 0, 0);
                            sVariableBuilder.AddVariableItem('AccountNo', 'Nqoo192', 'String', 0, 0, 0);
                            sVariableBuilder.AddVariableItem('NewAssetData', AssetDataVal, 'String', 0, 0, 0);
                            var sVariable = sVariableBuilder.BuildVariables();
                            ShowIndicator(sVariable);
                        } else {
                            //参数
                            var parameterData = [
                                ["TrustId", data.TrustId, "string"]
                                , ["UserName", data.UserName, "string"]
                                , ["IsInTrust", data.IsInTrust, "string"]
                                , ["AccountNo", data.AccountNo, "string"]
                                , ["NewAssetData", AssetDataVal, "string"]
                            ]
                            var svcUrl = webProxy.dataProcessServiceUrl + "CommonGetExecute?connConfig=TrustManagement&appDomain=TrustManagement&executeParams=";
                            var promise = webProxy.comGetData(parameterData, svcUrl, 'usp_SaveAssetDate');
                            promise().then(function (response) {
                                $("#" + gridDomId).data('kendoExtGrid').dataSource.read();
                                $("#" + gridDomId).data('kendoExtGrid').refresh();
                            });
                        }
                    } else {
                        GSDialog.HintWindow(lang.select)
                    }
                })

                $("#poolDetailBtn").click(function () {
                    if (window.location.href.indexOf('viewAssetTransfer') < 0) {
                        GSDialog.HintWindow("此页面不能操作这个动作")
                        return;
                    }
                   
                    var ckdPool = GetCheckedPool();
                    if (!ckdPool) return;
                    var basePoolId = ckdPool.PoolId;//ckdPool.PoolName.split('_')[3];
                    var rcvData = GSDialog.getData();

                    GSDialog.open(langx.asssfilter, '../../assetFilter/AssetsContrast/loanView.html?PoolId=' + basePoolId, { Pool: ckdPool }, function (result) {
                        if (result) {
                            window.location.reload();
                        }
                    }, 1000, 580, '', true, true, true, false);
                })
                function ShowIndicator(sVariable) {
                    var tIndicator = new taskIndicator({
                        width: 500,
                        height: 550,
                        clientName: 'TaskProcess',
                        appDomain: 'Task',
                        taskCode: 'ProjectAssetTransfer', //'DateInfoWizard',
                        sContext: sVariable,
                        callback: function () {
                            $("#" + gridDomId).data('kendoExtGrid').dataSource.read();
                            $("#" + gridDomId).data('kendoExtGrid').refresh();
                            sVariableBuilder.ClearVariableItem();
                        }
                    });
                    tIndicator.show();
                }
                $("#grid .k-grid-header-locked").css("height", 36 + "px")
            })

        }
    })();
});







