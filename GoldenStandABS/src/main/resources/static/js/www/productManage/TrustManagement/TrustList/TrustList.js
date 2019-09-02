//var gridDomId = 'grid';
//330是经验值
var viewModel = {};
define(function (require) {

    var $ = require('jquery');
    var anydialog = require('anyDialog');
    //var kendoGridModel = require('app/components/assetPoolList/js/kendoGridModel');
    var kendoGridModel = require('gs/Kendo/kendoGridModel');
    var roleOperate = require('app/productManage/TrustManagement/Common/Scripts/roleOperate'); 
    require('app/productManage/interface/trustList_interface');
    var userName = roleOperate.cookieName();
    var isAdmin = false;
    var filter = '';
    var height = $(window).height() - 30;
    var GSAdmin = require('gs/uiFrame/js/gs-admin-2');
    var tm = require('gs/childTabModel');
    roleOperate.getRolesByUserName(userName, function (data) {  //检查用户是否是管理员
        $.each(data, function (i, item) {
            if (item.IsRoot) {
                isAdmin = true;
            }
        });
        if (!isAdmin) {
            filter = "and ((UserName='{userName}' and AuditorUserName is null) or (UserName<>'{userName}' and AuditorUserName = '{userName}') or UserName is null)".replace(/\{userName\}/g, userName);
        } else {
            filter = "and AuditorUserName is null";
        }
        //绑定产品管理的功能
        var productManageFunction = '/GoldenStandABS/www/productManage/productManageFunction.json';
        GSAdmin.init(productManageFunction, function () {
            viewModel = new tm();
            //console.log(viewModel);
            $('.home-tab').click(function () {
                viewModel.goList();
            });
            viewModel.init();
            openMainPage();
        });
        function openMainPage() {
            viewModel.tabs.push({
                id: 'iframeMainContent',
                url: 'TrustManagement/viewTrust_New_iframe/viewTrust.html',
                name: '产品管理',
            });
        };


        //loading
        if (document.readyState == "complete") //当页面加载状态 
        {
            $("#loading").fadeOut();
        }
        var kendouiGrid = new kendoGridModel(height);
        kendouiGrid.Init({

            renderOptions: {
                //rowNumber: true,
                //reziable: true,
                //scrollable: true,
                //sortable: true,
                columns: [{ field: "TrustId", title: '专项计划标识', width: "60px", locked: true } //, headerAttributes: { "class": "table-header-cell", style: "text-align: center;font-size: 13px" }, attributes: { "class": "table-cell", style: "text-align: center;font-size: 13px" }
                        , { field: "TrustCode", title: '专项计划名称', width: "200px" }
                        , { field: "TrustNameShort", title: '专项计划简称', width: "150px" }
                        , { field: "TrustName", title: '专项计划描述', width: "280px" }
                        , { field: "OrganisationCode", title: '信托所属单位', width: "100px" }
                        , { field: "OrganisationDesc", title: '信托所属单位名称', width: "150px" }
                        , { field: "UserName", title: '创建人', width: "150px" }
                        , { field: "AuditorUserName", title: '审批人', width: "150px" }]
            },
            dataSourceOptions: {
                pageSize: 20,
                otherOptions: {
                    orderby: "TrustId",
                    DBName: 'TrustManagement',
                    appDomain: 'TrustManagement',
                    defaultfilter: filter,
                    executeParamType: 'extend',//{ SQLParams: [{ Name: 'tableName', Value: 'TrustManagement.View_Trusts', DBType: 'string' }] }
                    executeParam: function () {
                        var result = {
                            SPName: 'usp_GetListWithPager',
                            SQLParams: [{ Name: 'tableName', Value: 'TrustManagement.View_Trusts', DBType: 'string' }]
                        };
                        return result;
                    }
                }
             }
        });
        kendouiGrid.RunderGrid();
       
    });
});