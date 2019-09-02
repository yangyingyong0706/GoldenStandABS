 //把时间转换函数暴露到window下面
getStringDate = function (strDate) {
    //var str = '/Date(1408464000000)/';
    if (!strDate) {
        return 'null';
    }
    var str = strDate.replace(new RegExp('\/', 'gm'), '');
    return eval('new ' + str);
}
define(function (require) {
    var kendo = require('kendo.all.min');
    var kendoGridModel = require('app/transactionManage/TM_Common/trustList/js/kendoGridModel');
    var webProxy = require('gs/webProxy');
    var $ = require('jquery');
    var cookie = require('jquery.cookie');
    //var kendoGridModel = require('app/components/assetPoolList/js/kendoGridModel');
    var roleOperate = require('app/productManage/TrustManagement/Common/Scripts/roleOperate');
    require('app/productManage/interface/trustList_interface');
    var common = require('common');
    require('gs/globalVariable');
    require('app/transactionManage/TM_Common/trustList/js/MathCalculate');
    require('date_input');
    //var RoleOperate = require('roleOperate');
    //require('app/transactionManage/TM_Common/trustList/js/showModalDialog');
    require('app/transactionManage/TM_Common/trustList/js/wcfProxy');
    require("kendomessagescn");
    require("kendoculturezhCN");
    var gt = require('app/transactionManage/TM_Common/trustList/js/trustList_Interface');
    require("app/projectStage/js/project_interface");
    GSDialog = require('gs/uiFrame/js/gs-admin-2.pages');
    var GSAdmin = require('gs/uiFrame/js/gs-admin-2');
    var tm = require('gs/childTabModel');
    require('jquery.localizationTool');
    var webStorage = require('gs/webStorage');
    //var gridDomId = 'grid';
    var userName = $.cookie('gs_UserName');
    var isAdmin = false;
    var filter = '';
    var height = $(window).height() - 75;
    //初始化交易管理列表
    var svcUrl = webProxy.dataProcessServiceUrl + "CommonGetExecute?connConfig=TrustManagement&appDomain=TrustManagement&executeParams=";
    var params = [
        ["UserName", userName, "string"]
    ];
    var promise = webProxy.comGetData(params, svcUrl, 'usp_GetProductList_TM');
    promise().then(function (response) {});
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

        ////绑定产品管理的功能
        //if (parent.window.location.href.indexOf("productManage") > 0) {
        //    $("#DashBoard").show();
        //    $(".form-panel").css({ "padding-top": "29px" });
        //    var productManageFunction = '/GoldenStandABS/www/productManage/productManageFunction.json';
        //    GSAdmin.init(productManageFunction, function () {
        //        viewModel = new tm();
        //        //console.log(viewModel);
        //        $('.home-tab').click(function () {
        //            viewModel.goList();
        //        });
        //        viewModel.init();
        //        openMainPage();
        //    });
        //    function openMainPage() {
        //        viewModel.tabs.push({
        //            id: 'iframeMainContent',
        //            url: 'TrustManagement/viewTrust_New_iframe/viewTrust.html',
        //            name: '产品管理',
        //        });
        //    };
        //} else {
            //$("#DashBoard").fadeOut();
            $(".form-panel").css({ "padding": "0" });
        //}
        //loading
        //if (document.readyState == "complete") //当页面加载状态 
        //{
        //    $("#loading").fadeOut(300);
        //}
            kendo.culture("zh-CN");
            var kendouiGrid = new kendoGridModel(height);
            var webStorage = require('gs/webStorage');
            var lang = {};
            lang.TrustId = '产品标识';
            lang.StartDate = '产品成立日（转让日）';
            lang.ODesc = '交易主体';
            lang.TransferModel = '转让模式';
            lang.SpecialPlanState = '产品状态';
            lang.TrustCode = '产品编号';
            lang.CPB1 = '交易份额';
            lang.CPB2 = '理论结算金额';
            lang.CPB3 = '实际结算金额';
            var userLanguage = webStorage.getItem('userLanguage');
            if (userLanguage && userLanguage.indexOf('en') > -1) {
                lang.TrustId = 'Trust Id';
                lang.StartDate = 'Assignment Date';
                lang.ODesc = 'Trade Subject';
                lang.TransferModel = 'Transfer Model';
                lang.SpecialPlanState = 'Special Plan State';
                lang.TrustCode = 'Product Code';
                lang.CPB1 = 'Trading Share';
                lang.CPB2 = 'Theoretical Balance';
                lang.CPB3 = 'Actual Balance';
            }
        kendouiGrid.Init({
            renderOptions: {
                creziable: true,
                scrollable: true,
                sortable: true,
                columns: [{ field: "TrustId", title: lang.TrustId, width: "150px", locked: true, attributes: { style: 'text-align:center' }, headerAttributes: { 'class': 'table_layer_style' } }
                       , { field: "StartDate", title: lang.StartDate, width: "150px" }
                       , { field: "ODesc", title: lang.ODesc, width: "100px" }
                       , { field: "TransferModel", title: lang.TransferModel, width: "100px" }
                       , { field: "SpecialPlanState", title: lang.SpecialPlanState, width: "150px" }
                       //, { field: "TransferStatus", title: '转让状态', width: "150px" }
                       , { field: "TrustCode", title: lang.TrustCode, width: "220px", attributes: { style: 'text-align:left' } }
                       , { field: "CPB", title: lang.CPB1, width: "150px" }
                       , { field: "CPB", title: lang.CPB2, width: "150px" }
                       , { field: "CPB", title: lang.CPB3, width: "150px" }
                       , { field: "", title: "", width:"auto" }
                ]
            }
            , dataSourceOptions: {
                otherOptions: {
                    orderby: "TrustId"
                    , DBName: 'TrustManagement'
                    , appDomain: 'TrustManagement'
                    , defaultfilter: filter
                    , executeParamType: 'extend'
                    , executeParam: {
                        SQLParams: [
                            { Name: 'tableName', Value: 'TrustManagement.View_Trusts_TM', DBType: 'string' }
                        ]
                    }
                }
            }
        });
        kendouiGrid.RunderGrid();
    }
    $(function () {
        InitKendoGrid();
        $('#selectLanguageDropdown_transmgel').localizationTool({
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

                'id:home_transmgel': {
                    'en_GB': 'Home'
                }


            }
        });

        var userLanguage = webStorage.getItem('userLanguage');
        if (userLanguage) {
            $('#selectLanguageDropdown_transmgel').localizationTool('translate', userLanguage);
        }
        $('body').show();
        var productManagePilot = '../../ribbon.json';
        if (userLanguage && userLanguage.indexOf('en') > -1) {
            productManagePilot = 'ribbon_en.json';
        }
        GSAdmin.init(productManagePilot, function () {
            viewModel = new tm();
            $('.home-tab').click(function () {
                viewModel.goList();
            });
            viewModel.init();
            openMainPage();
        });
        function openMainPage() {
            viewModel.showId('iframeMainContent');
            viewModel.tabs.push({
                id: 'iframeMainContent',
                url: 'TM_Common/trustList/TrustList.html',
                name: name,
                disabledClose: true
            });
        };
    });
    function changeWidth(obj) {
        var w = $(".main").width();
        obj.css("width", w + "px");
    }
    changeWidth($(".chrome-tabs-shell"));
});