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
    var common = require('gs/uiFrame/js/common');
    var dataOperate = require('app/transactionManage/script/dataOperate');
    var kendoGridModel = require('app/transactionManage/script/kendoGridModel');
    //var kendoGridModel = require('gs/Kendo/kendoGridModel');
    var JqUi = require('jquery-ui');
    var vue = require('Vue');
    var date_input = require('date_input');
    var gs = require('gs/globalVariable');
    var filter = '';
    var userName = $.cookie('gs_UserName');
    var height = $(window).height() - 66;
    require("kendomessagescn");
    require("kendoculturezhCN");
    //上面这个方法执行下面的方法，并且将其暴露出去
    AssetTransferMain = (function () {
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

                if (!isAdmin) {
                    filter = "and ((UserName='{userName}' and AuditorUserName is null) or (UserName<>'{userName}' and AuditorUserName = '{userName}') or UserName is null)".replace(/\{userName\}/g, userName);
                } else {
                    filter = "and AuditorUserName is null";
                }
                kendo.culture("zh-CN");
                var kendouiGrid = new kendoGridModel(height);

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
                    lang.nontransfer = 'No transfer';
                }


                kendouiGrid.Init({
                    renderOptions: {
                        creziable: true,
                        scrollable: true,
                        sortable: true,
                        columns: [{ field: "AccountNo", title: lang.AccountNo, width: "150px", locked: true }
                               , { field: "ReportingDate", title: lang.ReportingDate, width: "150px", template: '#=ReportingDate?getStringDate(ReportingDate).dateFormat("yyyy-MM-dd"):""#' }
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
                               , { field: "", title: "", width:"auto" }
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
           
            $(function () {
                InitKendoGrid();
                //获取iframe适应宽度
                //function getHight(obj) {
                //    var w = window.screen.height;
                //    obj.css({ "height": w * 0.65 + "px" });
                //}
                //获取iframe宽度
                function changeWidth(obj) {
                    var w = $("body").width();
                    obj.css("width", w + "px");
                }
                changeWidth($(".chrome-tabs-shell"));
                $("#grid .k-grid-header-locked").css("height", 36 + "px");
                function gridHeight() {
                    var h = $("body").height()
                    $("#grid").css("height", h - 66 + "px");
                }
                gridHeight();
            })
        }
    })();
});







