define(function (require) {
    var $ = require('jquery');
   
    //var kendoGridModel = require('app/components/assetPoolList/js/kendoGridModel');require('gs/Kendo/kendoGridModel');
    var kendoGridModel = require('gs/Kendo/kendoGridModel');
    var GlobalVariable = require('gs/globalVariable');
    var cookie = require('jquery.cookie');
    var gt = require('app/components/assetPoolList/js/assetPoolList_Interface');
    //var GSAdmin = require('gs/uiFrame/js/gs-admin-2');
    require('app/components/assetPoolList/js/PoolCut_Interface')
    require("kendomessagescn");
    require("kendoculturezhCN");
    require("app/projectStage/js/project_interface");
    var webProxy = require('gs/webProxy');

    var height = $(window).height();
    console.log(height)
    var userName = $.cookie('gs_UserName');
    var filter = '';
    var isAdmin = false;
    var timer;
    var GSAdmin = require('gs/uiFrame/js/gs-admin-2');
    var tm = require('gs/childTabModel');
    var webStorage = require('gs/webStorage');
    var common = require('common');
    var enter = common.getQueryString('enter');
    var status = common.getQueryString('status');
    var ProjectId = common.getQueryString('ProjectId');
    var lang = {};
    var userLanguage = webStorage.getItem('userLanguage')
    var IsAdministrator = webStorage.getItem("IsAdministrator");//判断用户是否为管理员
    var productManageFunction = '/GoldenStandABS/www/components/assetPoolList/ribbonR.json';
    if (userLanguage && userLanguage.indexOf('en') > -1) {
        productManageFunction = '/GoldenStandABS/www/components/assetPoolList/ribbonR_en.json';
    }
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
        viewModel.showId('iframeMainContent');
        viewModel.tabs.push({
            id: 'iframeMainContent',
            url: 'AssetPoolList.html',
            name: '资产池列表',
            disabledClose: true
        });
    };
    var SQLParams = [];
    if (enter === 'projectManage' && ProjectId && status ==='all') {
        var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecuteForPool?',
            executeParam = {
                SPName: "TrustManagement.usp_getFilterFromProject",
                SQLParams: [
                               { 'Name': 'projectId', 'Value': parseInt(ProjectId), 'DBType': 'int' }
                ]
            };
        common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
            if (data) {
                console.log(data)
                SQLParams = [
                    { Name: 'tableName', Value: 'config.view_Pools', DBType: 'string' },
                    { Name: 'fiter', Value: data[0].PoolCutFilter, DBType: 'string' },
                    { Name: 'showAll', Value: 1, DBType: 'int' }
                ]
            }
        });
    
    }else if (enter === 'projectManage' && ProjectId) {
 //       获取筛选条件TrustManagement.usp_getFilterFromProject
 //@projectId bigint
        //ProjectId
        var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecuteForPool?',
            executeParam = {
                SPName: "TrustManagement.usp_getFilterFromProject",
                SQLParams: [
                               { 'Name': 'projectId', 'Value': parseInt(ProjectId), 'DBType': 'int' }
                ]
            };
        common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
            if (data) {
                console.log(data)
                SQLParams = [
                    { Name: 'tableName', Value: 'config.view_Pools', DBType: 'string' },
                    { Name: 'fiter', Value: data[0].PoolCutFilter, DBType: 'string' }   
                ]
            }
        });
    }  else {
        SQLParams = [
            { Name: 'tableName', Value: 'config.view_Pools', DBType: 'string' }
        ]
    }
    var kendouiGrid
    var showId = sessionStorage.getItem('showId');
    if (showId == "assetFilter") {
        kendouiGrid = new kendoGridModel("calc(100% - 40px)");
        $("#DashBoard").show();
    } else if (showId == "productDesign") {
        kendouiGrid = new kendoGridModel("100%");
        $("#DashBoard").hide();
    } else if (showId == "projectManage") {
        $("#DashBoard").show();
        $('.main').css('height', '100%')
        kendouiGrid = new kendoGridModel("calc(100% - 40px)");
    } else if (showId == "IssuePreparation") {
        $('#projectManage').show();
        $("#DashBoard").hide();
        //$('.main').css('height', '100%')
        kendouiGrid = new kendoGridModel("100%");
    }

    this.GetPoolCount = function (PoolCount) {
        return PoolCount ? PoolCount : 0;
    }
    function InitKendoGrid (data) {  //检查用户是否是管理员
        //$.each(data, function (i, item) {
        //    if (item.IsRoot) {
        //        isAdmin = true;
        //    }
        //});
        //debugger;
        ////test
        //isAdmin = true;

        filter = IsAdministrator == '1' ? "where ParentPoolId=0 and userName!=''" : "where ParentPoolId=0 and (userName = '" + userName + "' or AuditorUserName = '" + userName + "'" + " or IsCheck = 0)";
        kendo.culture("zh-CN");
        if (enter === 'projectManage' && ProjectId && status === 'all') {
            kendouiGrid.Init({
                renderOptions: {
                    columns: [
                                { field: "PoolId", title: lang.biaoshi, locked: true, width: 100, attributes: { style: 'text-align:left' }, headerAttributes: { 'class': 'table_layer_style', style: 'text-align:left' } }
                                , { field: "PoolName", title: lang.workdec, width: 300, attributes: { style: 'text-align:left' } }
                                , { field: "PoolDescription", title: lang.name, width: 220, attributes: { style: 'text-align:left' } }
                                , { field: "PoolType",  title: '资产池关系', width: 150, attributes: { style: 'text-align:left' } }
                                , { field: "OrganisationDesc", title: lang.src, width: 150, attributes: { style: 'text-align:left' } }
                                , { field: "CreatedDate", title: lang.createDate, width: 150, attributes: { style: 'text-align:left' } }
                                , { field: "PoolStatus", template: '#=PoolStatus?(PoolStatus=="OPEN"?PoolStatus:(PoolStatus+"<i style=\'padding-left:3px\' class=\'fa fa-lock\'><i>")):""#', title: lang.status, width: 100, attributes: { style: 'text-align:left' } }
                                , { field: "TrustCode", title: lang.plan, width: 220, attributes: { style: 'text-align:left' } }
                                , { field: "", title: "", width: "auto" }
                    ]
                }
           , dataSourceOptions: {
               otherOptions: {
                   orderby: "PoolId"
                    , direction: ""
                    , DBName: 'DAL_SEC_PoolConfig'
                    , appDomain: 'config'
                    , executeParamType: 'extend'
                    , defaultfilter: filter
                    , executeParam: function () {
                        var result = {
                            SPName: 'usp_GetListWithPager'
                            , SQLParams: SQLParams
                        };
                        return result;
                    }
               }
               , pageable: {
                   pageSizes: true,
                   buttonCount: 5,
                   messages: {
                       display: "显示{0}-{1}条，共{2}条",
                       empty: "没有数据",
                       page: "页",
                       of: "/ {0}",
                       itemsPerPage: "条/页",
                       first: "第一页",
                       previous: "前一页",
                       next: "下一页",
                       last: "最后一页",
                       refresh: "刷新"
                   }
               },
           }
            });
        }
        else {
            if (enter === 'projectManage') {
                kendouiGrid.Init({
                    renderOptions: {
                            columns: [
                                        { field: "PoolId", title: lang.biaoshi, locked: true, width: 100, attributes: { style: 'text-align:left' }, headerAttributes: { 'class': 'table_layer_style', style: 'text-align:left' } }
                                        , { field: "PoolName", title: lang.workdec, template: '#=PoolId?TranToPoolPage(PoolId,PoolName):""#', width: 400, attributes: { style: 'text-align:left' } }
                                        , { field: "PoolDescription", title: lang.name, width: 220, attributes: { style: 'text-align:left' } }
                                        , { field: "", template: "#=this.GetPoolCount(PoolCount)#", title: lang.count, width: 100, attributes: { style: 'text-align:left' } }
                                        , { field: "OrganisationDesc", title: lang.src, width: 150, attributes: { style: 'text-align:left' } }
                                        , { field: "CreatedDate", title: lang.createDate, width: 150, attributes: { style: 'text-align:left' } }
                                        , { field: "PoolStatus", template: '#=PoolStatus?(PoolStatus=="OPEN"?PoolStatus:(PoolStatus+"<i style=\'padding-left:3px\' class=\'fa fa-lock\'><i>")):""#', title: lang.status, width: 100, attributes: { style: 'text-align:left' } }
                                        , { field: "TrustCode", title: lang.plan, width: 220, attributes: { style: 'text-align:left' } }
                                        , { field: "", title: "", width: "auto" }
                            ]
                        }
                        , dataSourceOptions: {
                            otherOptions: {
                                orderby: "PoolId"
                                 , direction: ""
                                 , DBName: 'DAL_SEC_PoolConfig'
                                 , appDomain: 'config'
                                 , executeParamType: 'extend'
                                 , defaultfilter: filter
                                 , executeParam: function () {
                                     var result = {
                                         SPName: 'usp_GetListWithPager'
                                         , SQLParams: SQLParams
                                     };
                                     return result;
                                 }
                            }
                            , pageable: {
                                pageSizes: true,
                                buttonCount: 5,
                                messages: {
                                    display: "显示{0}-{1}条，共{2}条",
                                    empty: "没有数据",
                                    page: "页",
                                    of: "/ {0}",
                                    itemsPerPage: "条/页",
                                    first: "第一页",
                                    previous: "前一页",
                                    next: "下一页",
                                    last: "最后一页",
                                    refresh: "刷新"
                                }
                            },
                        }
                });
            } else {//隐藏按钮
                kendouiGrid.Init({
                    renderOptions: {
                        columns: [
                                    { field: "PoolId", title: lang.biaoshi, locked: true, width: 100, attributes: { style: 'text-align:left' }, headerAttributes: { 'class': 'table_layer_style', style: 'text-align:left' } }
                                    , { field: "PoolName", title: lang.workdec, template: '#=PoolId?TranToPoolPagehide(PoolId,PoolName):""#', width: 400, attributes: { style: 'text-align:left' } }
                                    , { field: "PoolDescription", title: lang.name, width: 220, attributes: { style: 'text-align:left' } }
                                    , { field: "", template: "#=this.GetPoolCount(PoolCount)#", title: lang.count, width: 100, attributes: { style: 'text-align:left' } }
                                    , { field: "OrganisationDesc", title: lang.src, width: 150, attributes: { style: 'text-align:left' } }
                                    , { field: "CreatedDate", title: lang.createDate, width: 150, attributes: { style: 'text-align:left' } }
                                    , { field: "PoolStatus", template: '#=PoolStatus?(PoolStatus=="OPEN"?PoolStatus:(PoolStatus+"<i style=\'padding-left:3px\' class=\'fa fa-lock\'><i>")):""#', title: lang.status, width: 100, attributes: { style: 'text-align:left' } }
                                    , { field: "TrustCode", title: lang.plan, width: 220, attributes: { style: 'text-align:left' } }
                                    , { field: "", title: "", width: "auto" }
                        ]
                    }
                      , dataSourceOptions: {
                          otherOptions: {
                              orderby: "PoolId"
                               , direction: ""
                               , DBName: 'DAL_SEC_PoolConfig'
                               , appDomain: 'config'
                               , executeParamType: 'extend'
                               , defaultfilter: filter
                               , executeParam: function () {
                                   var result = {
                                       SPName: 'usp_GetListWithPager'
                                       , SQLParams: SQLParams
                                   };
                                   return result;
                               }
                          }
                          , pageable: {
                              pageSizes: true,
                              buttonCount: 5,
                              messages: {
                                  display: "显示{0}-{1}条，共{2}条",
                                  empty: "没有数据",
                                  page: "页",
                                  of: "/ {0}",
                                  itemsPerPage: "条/页",
                                  first: "第一页",
                                  previous: "前一页",
                                  next: "下一页",
                                  last: "最后一页",
                                  refresh: "刷新"
                              }
                          },
                      }
                });
            }
     
        }
       
        kendouiGrid.RunderGrid();
    }
    function TransStatus(PoolStatusId) {
        var status;
        switch (PoolStatusId) {
            case 148:
                status = 'OPEN';
                break;
            case 149:
                status = 'INVALID';
                break;
            case 150:
                status = 'RESERVE';
                break;
            case 151:
                status = 'PUBLISH';
                break;
            default:
                status = '';
                break;
        }
        return status;
    }

    function getPoolHeader() {
        var grid = $("#" + gridDomId).data("kendoExtGrid");
        if (grid.select().length != 1) {
            alert('请选择要操作的资产池');
        } else {

            var data = grid.dataItem(grid.select());

            return data;
        }
    }

    $(function () {
        var userLanguage = webStorage.getItem('userLanguage');
        if (userLanguage && userLanguage.indexOf('en') > -1) {
            lang.biaoshi = 'Identification';
            lang.workdec = 'Working group description';
            lang.name = 'Name';
            lang.src = 'Source of assets';
            lang.createDate = 'Creation date';
            lang.status = 'Status';
            lang.plan = 'Subordination product';
            lang.count = 'PoolCount';
        } else {
            lang.biaoshi = '标识';
            lang.workdec = '工作组描述';
            lang.name = '名称';
            lang.src = '资产来源';
            lang.createDate = '创建日期';
            lang.status = '状态';
            lang.plan = '隶属产品';
            lang.count = '资产池数量';
        }

        InitKendoGrid();
        $('#projectManage button').click(function () {
            design()
        })
        function trustAction(callback) {
            var $ = require('jquery');
            var grid = $("#grid").data("kendoExtGrid");
            if (grid.select().length != 2) {
                GSDialog.HintWindow('请选择资产池！');
            } else {
                var dataRows = grid.items();
                // 获取行号
                var rowIndex = dataRows.index(grid.select());
                // 获取行对象
                var data = grid.dataItem(grid.select());
                callback(data);
            }
        }
        function design() {
            trustAction(function (data) {
                var PoolId = data.PoolId;
                var page = webProxy.baseUrl + '/GoldenStandABS/www/productDesign/design/productDesign.html?PoolId={0}'.format(PoolId);
                if (PoolId) {
                    openNewIframe(page, PoolId + '_design', "产品设计_" + PoolId);
                }
            })
        }
    });

});