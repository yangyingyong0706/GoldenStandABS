getStringDate = function (strDate) {
    //var str = '/Date(1408464000000)/';
    if (!strDate) {
        return '';
    }
    var str = strDate.replace(new RegExp('\/', 'gm'), '');
    return eval('new ' + str);
}
function IsInTrustTest(IsInTrust) {

    var webStorage = require('gs/webStorage');

    var userLanguage = webStorage.getItem('userLanguage');

    var status;
    switch (IsInTrust) {
        case 1:
            status = '已转让';
            break;
        default:
            status = '未转让';
            break;
    }

    if (userLanguage && userLanguage.indexOf('en') > -1) {
        switch (IsInTrust) {
            case 1:
                status = 'Transferred';
                break;
            default:
                status = 'No Transfer';
                break;
        }
    }

    return status;
}
define(function (require) {
    var $ = require('jquery');
    var kendo = require('kendo.all.min');
    var dataOperate = require('app/transactionManage/script/dataOperate');
    var kendoGridModel = require('app/transactionManage/script/kendoGridModel');
    //var kendoGridModel = require('gs/Kendo/kendoGridModel');
    var JqUi = require('jquery-ui');
    var vue = require('Vue');
    var date_input = require('date_input');
    var gs = require('gs/globalVariable');
    var taskIndicator = require('gs/taskProcessIndicator');
    var sVariableBuilder = require('gs/sVariableBuilder');
    var filter = '';
    var userName = $.cookie('gs_UserName');
    var common = require('common');
    var trustId = common.getQueryString('tid');
    var isProjectUrl = common.getQueryString('isproject');
    var webProxy = require('gs/webProxy');
    var height = $(window).height() - 106;
    require("kendomessagescn");
    require("kendoculturezhCN");

    require("app/projectStage/js/project_interface");
    require('jquery.localizationTool');
    var webStorage = require('gs/webStorage');
    var lang = {};
    lang.AccountNo = '借据编号';
    lang.ReportingDate = '赎回日';
    lang.IsInTrust = '资产状态';
    lang.OrganisationCode = '交易主体';
    lang.LoanStartDate = '计息日';
    lang.LoanMaturityDate = '到期日';
    lang.CurrentRate = '当前利率';
    lang.ApprovalAmount = '合同金额';
    lang.CurrentPrincipalBalance = '剩余本金余额';
    lang.redemption = '已赎回';
    lang.noRedemption = '未赎回';
    lang.select = '请先选中数据！';
    lang.date = '请选择日期';

    var userLanguage = webStorage.getItem('userLanguage');
    if (userLanguage && userLanguage.indexOf('en') > -1) {
        lang.AccountNo = 'IOUNo';
        lang.ReportingDate = 'Redemption Date';
        lang.IsInTrust = 'Asset Status';
        lang.OrganisationCode = 'Organisation Code';
        lang.LoanStartDate = 'Loan Start Date';
        lang.LoanMaturityDate = 'Loan Maturity Date';
        lang.CurrentRate = 'Current Rate';
        lang.ApprovalAmount = 'Approval Amount';
        lang.CurrentPrincipalBalance = 'Current Principal Balance';
        lang.redemption = 'Redeemed';
        lang.noRedemption = 'No Redeemed';
        lang.select = 'Please select an item';
        lang.date = 'Please select redemption date';
    }



    //上面这个方法执行下面的方法，并且将其暴露出去
    AssetTransferMain = (function () {




        $('#selectLanguageDropdown_viewAssetRedemption').localizationTool({
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

                'class:viewAssetRedemption_RedemptionDate': {
                    'en_GB': 'Redemption Date: '
                },
                'class:viewAssetRedemption_Redemption': {
                    'en_GB': 'Redemption'
                }


            }
        });

        var userLanguage = webStorage.getItem('userLanguage');
        if (userLanguage) {
            $('#selectLanguageDropdown_viewAssetRedemption').localizationTool('translate', userLanguage);
        }
        $('body').show();





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
                if (isProjectUrl && trustId != '') {
                    if (!isAdmin) {
                        filter = "and ((UserName='{userName}' and AuditorUserName is null) or (UserName<>'{userName}' and AuditorUserName = '{userName}') or UserName is null)".replace(/\{userName\}/g, userName) + " AND TrustId IN (SELECT TrustId FROM TrustManagement.ProjectOnTrust WHERE ProjectId=" + trustId + ")";
                    } else {
                        filter = "and AuditorUserName is null AND TrustId IN (SELECT TrustId FROM TrustManagement.ProjectOnTrust WHERE ProjectId=" + trustId + ")";
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
                kendouiGrid.Init({

                    renderOptions: {
                        creziable: true,
                        sortable: true,
                        //persistSelection: true,
                        pageable: true,
                        scrollable: true,
                        columns: [
                                { selectable: false, width: "50px", template: "<input name='AccountNoCkbox' class='ob-paid' type='checkbox' data-bind='checked:IsInTrust' #=IsInTrust#/>" }
                               , { field: "AccountNo", title: lang.AccountNo, attributes: { "class": "table-AccountNo" }, width: "150px" }
                               , { field: "ReportingDate", title: lang.ReportingDate, width: "150px", template: '#=ReportingDate?getStringDate(ReportingDate).dateFormat("yyyy-MM-dd"):""#' }
                               , {
                                   field: "IsInTrust", title: lang.IsInTrust, template: function (IsInTrust) {
                                       var IsInTrustId = IsInTrust.IsInTrust;
                                       //这里返回的是所有的数据
                                       var hasdatasStatus;
                                       if (IsInTrustId == 1) {
                                           return hasdatasStatus = lang.redemption
                                       } else if (IsInTrustId == 0) {
                                           return hasdatasStatus = lang.noRedemption
                                       } else {
                                           return hasdatasStatus = ''
                                       }
                                   }, attributes: { "class": "table-IsInTrust" }, width: "150px"
                               }
                               , { field: "OrganisationCode", title: lang.OrganisationCode, width: "100px" }
                               , { field: "LoanStartDate", title: lang.LoanStartDate, width: "150px", template: '#=LoanStartDate?getStringDate(LoanStartDate).dateFormat("yyyy-MM-dd"):""#' }
                               , { field: "LoanMaturityDate", title: lang.LoanMaturityDate, width: "150px", template: '#=LoanMaturityDate?getStringDate(LoanMaturityDate).dateFormat("yyyy-MM-dd"):""#' }
                               , { field: "CurrentRate", title: lang.CurrentRate, width: "150px" }
                               , { field: "ApprovalAmount", title: lang.ApprovalAmount, width: "150px" }
                               , { field: "CurrentPrincipalBalance", title: lang.CurrentPrincipalBalance, width: "150px" }
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
                kendouiGrid.RunderGrid();
            }

            function getDate() {
                var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecuteForPool?',
                executeParam = {
                    SPName: "dbo.usp_GetFactLoanDateProjectStage",
                    SQLParams: [
                        { 'Name': 'ProjectId', 'Value': trustId, 'DBType': 'int' }
                    ]
                };
                common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {

                    $.each(data, function (i, v) {
                        $("#AssetDataVal").append("<option value=" + v.ReportingDate + ">" + v.ReportingDate + "</option>");
                    })


                })

            }


            $(function () {

                getDate();

                InitKendoGrid();
                //$($(".k-state-selected")[0]).click(function () {
                //    $(this).find(".AccountNoCkbox").attr("checked", true)
                //})
                $("#AssetDataBtn").click(SaveAssetRedemptionDate)
                function SaveAssetRedemptionDate() {
                    var AccountNo, IsInTrust;
                    var checkedBox = $(":checked");//选择中checked
                    if (checkedBox) {
                        var tdData = $(":checked").parent().parent().find("td");
                        tdData.each(function (i, v) {
                            if ($(v).hasClass("table-AccountNo")) {
                                AccountNo = $(this).html();
                            } else if ($(v).hasClass("table-IsInTrust")) {
                                if ($(this).html() == '未赎回' || $(this).html() == lang.noRedemption) {
                                    IsInTrust = 0;
                                } else {
                                    IsInTrust = 1;
                                }
                            }
                        })
                    } else {
                        alert(lang.select)
                    }
                    //获得新的日期
                    var AssetDataVal = $("#AssetDataVal").val();
                    if (AssetDataVal) {
                        if (isProjectUrl) {
                            sVariableBuilder.AddVariableItem('TrustId', trustId, 'Int', 0, 0, 0);
                            sVariableBuilder.AddVariableItem('IsInTrust', IsInTrust?IsInTrust:0, 'Int', 0, 0, 0);
                            sVariableBuilder.AddVariableItem('UserName', userName, 'String', 0, 0, 0);
                            sVariableBuilder.AddVariableItem('AccountNo', AccountNo?AccountNo:0, 'String', 0, 0, 0);
                            sVariableBuilder.AddVariableItem('NewAssetData', AssetDataVal, 'String', 0, 0, 0);
                            var sVariable = sVariableBuilder.BuildVariables();
                            ShowIndicator(sVariable);
                        } else {
                            //参数
                            var parameterData = [
                                ["TrustId", trustId, "string"]
                                , ["UserName", userName, "string"]
                                , ["IsInTrust", IsInTrust, "string"]
                                , ["AccountNo", AccountNo, "string"]
                                , ["NewAssetData", AssetDataVal, "string"]
                            ]
                            console.log(parameterData)
                            var svcUrl = webProxy.dataProcessServiceUrl + "CommonGetExecute?connConfig=TrustManagement&appDomain=TrustManagement&executeParams=";
                            var promise = webProxy.comGetData(parameterData, svcUrl, 'usp_SaveAssetDate');
                            promise().then(function (response) {
                                $("#" + gridDomId).data('kendoExtGrid').dataSource.read();
                            });
                        }
                    } else {
                        alert(lang.date);
                    }
                }
                function changeWidth(obj) {
                    var w = $("body").width();
                    obj.css("width", w + "px");
                }
                changeWidth($(".chrome-tabs-shell"));
                $("#grid .k-grid-header-locked").css("height", 36 + "px");

                function ShowIndicator(sVariable) {
                    var tIndicator = new taskIndicator({
                        width: 500,
                        height: 550,
                        clientName: 'TaskProcess',
                        appDomain: 'Task',
                        taskCode: 'ProjectRedemptions', //'DateInfoWizard',
                        sContext: sVariable,
                        callback: function () {
                            $("#" + gridDomId).data('kendoExtGrid').dataSource.read();
                            sVariableBuilder.ClearVariableItem();
                        }
                    });
                    tIndicator.show();
                }
            })
        }
    })();
});













