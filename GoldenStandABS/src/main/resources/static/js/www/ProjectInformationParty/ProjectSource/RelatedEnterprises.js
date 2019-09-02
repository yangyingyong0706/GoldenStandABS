define(function (require) {
    var $ = require('jquery');
    var kendoGridModel = require('gs/Kendo/kendoGridModel');
    var GlobalVariable = require('gs/globalVariable');
    var cookie = require('jquery.cookie');
    require("kendomessagescn");
    require("kendoculturezhCN");
    require("app/ProjectInformationParty/js/project_interface");
    var height = $(window).height();
    var GSAdmin = require('gs/uiFrame/js/gs-admin-2');
    var tm = require('gs/childTabModel');
    var webStorage = require('gs/webStorage');
    var common = require('common');
    var GSDialog = require('gs/uiFrame/js/gs-admin-2.pages');
    var ProjectId = common.getQueryString('ProjectId');
    var kendouiGrid;
    var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
    $('.main').css('height', '100%');
    var h = $("body").height() - 55;
    kendouiGrid = new kendoGridModel(h);

    //this.TranToPoolPage = function (PoolId, PoolDBName, PoolName) {
    //    var BasePoolId = PoolDBName.split('_')[3];
    //    var html = '<a style="cursor: pointer" onclick="addAssetPoolItem({0},{1},\'{2}\');">{2}</a>'.format(PoolId, BasePoolId, PoolName);
    //    return html;
    //}
    this.RemoveOptions = function (ProjectId, EnterpriseId) {
        var executeParam = {
            'SPName': "dbo.usp_CancelEnterpriseWithProject", 'SQLParams': [
                { 'Name': 'enterpriseid', 'Value': EnterpriseId, 'DBType': 'int' },
                { 'Name': 'projectid', 'Value': ProjectId, 'DBType': 'int' },
            ]
        };
        common.ExecuteGetData(false, serviceUrl, 'TrustManagement', executeParam, function (data) {
            if (data[0].result == "1") {
                GSDialog.HintWindow('取消关联成功', function () {
                    location.reload(true);
                })
            }
        });
    }
    this.Options = function (EnterpriseId) {
        var html = '<a style="cursor: pointer" onclick="RemoveOptions({0},{1},\'{2}\');">{2}</a>'.format(ProjectId, EnterpriseId, '取消关联');
        return html;
    }
    function RenderGrid() { 
        kendo.culture("zh-CN");
        kendouiGrid.Init({
            renderOptions: {
                columns: [
                            { field: "EnterpriseName", title: '企业名', width: 80, attributes: { style: 'text-align:left' }, headerAttributes: { 'class': 'table_layer_style', style: 'text-align:left' } }
                            , { field: "ProjectName", title: "项目名", width: 80, attributes: { style: 'text-align:left' }, headerAttributes: { 'class': 'table_layer_style', style: 'text-align:left' } }
                            , { field: "ProjectAlert", title: "项目状态", width: 80, attributes: { style: 'text-align:left' }, headerAttributes: { 'class': 'table_layer_style', style: 'text-align:left' } }
                            , { field: "ClassificationName", title: "所属行业", width: 80, attributes: { style: 'text-align:left' }, headerAttributes: { 'class': 'table_layer_style', style: 'text-align:left' } }
                            , { template: "#=this.Options(EnterpriseId)#", title: "操作", width: "100px" }
                ]
            }
            , dataSourceOptions: {
                otherOptions: {
                    orderby: "EnterpriseName"
                     , direction: ""
                     , DBName: 'TrustManagement'
                     , appDomain: 'dbo'
                     , executeParamType: 'extend'
                     , defaultfilter: ''
                     , executeParam: function () {
                         var result = {
                             SPName: 'usp_GetEnterpriseDataWithPager',
                             SQLParams: [
                                     { Name: 'tableOrView', Value: 'dbo.View_GetEnterpriseDataWithPorject', DBType: 'string' }
                             ],
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
        kendouiGrid.RunderGrid();
    }
    function openNewIframe(page, pollId, tabName) {
        var pass = true;
        parent.parent.viewModel.tabs().forEach(function (v, i) {
            if (v.id == pollId) {
                pass = false;
                parent.parent.viewModel.changeShowId(v);
                return false;
            }
        })
        if (pass) {
            var newTab = {
                id: pollId,
                url: page,
                name: tabName,
                disabledClose: false
            };
            parent.parent.viewModel.tabs.push(newTab);
            parent.parent.viewModel.changeShowId(newTab);
            $('.chrome-tabs-shell', parent.parent.document).find('.chrome-tab-current').removeClass('chrome-tab-current');
            $('.chrome-tabs-shell', parent.parent.document).find('.active').addClass('chrome-tab-current');
        }
    }
    //
    $("#RelatedViewAll").click(function () {
        GSDialog.open('关联企业', '../ProjectSource/RelatedEnterprisesAll.html?ProjectId=' + ProjectId, "", "", 900, 600, 'bigwindow', true, false, true, false)
    })
    
    //function getPoolHeader() {
    //    var grid = $("#grid").data("kendoExtGrid") ? $("#grid").data("kendoExtGrid") : $("#grid", parent.document).data("kendoExtGrid");
    //    if (grid.select().length != 2) {
    //        GSDialog.HintWindow('请选择要操作的资产池');
    //    } else {
    //        var data = grid.dataItem(grid.select());
    //        return data;
    //    }
    //}
    $(function () {
        RenderGrid()
    });

});