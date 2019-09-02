define(function (require) {
    var $ = require('jquery');
    var GlobalVariable = require('globalVariable');
    var kendoGridModel = require('../CreditRiskCheck/kendoGridModel');
    var common = require('common');
    require("kendomessagescn");
    var GSDialog = require('gs/uiFrame/js/gs-admin-2.pages');
    var trustId = common.getQueryString('tid');
    var height = $(window).height() - 105;
    console.log(screen.height, $(window).height());
    var filter = ' ';// "where DimSourceTrustID = " + trustId + " and ParentPoolId=0";
    $(function () {
        initGrid();
        eventBind();
    });
    //资产明细列表
    function initGrid() {
        var kdGridAssetDetail = new kendoGridModel(height);
        var assetDetailOptions = {
            renderOptions: {
                scrollable: true,
                resizable: true,
                filterable: true,
                sortable: true,
                columnMenu: false,//可现实隐藏列
                reorderable: true,//可拖动改变列位置
                groupable: false,//可拖动分组
                resizable: true,//可拖动改变列大小
                excel: {
                    allPages: true,//是否导出所有页中的数据
                    fileName: "信息披露列表.xlsx"
                },
                columns: [
                   {
                       field: "TrustName", title: "资产支持专项计划名称",
                       width: "250px", headerAttributes: { "class": "table-header-cell", style: "text-align: center;vertical-align: middle;" }, attributes: { "class": "table-cell", style: "text-align: center" }
                   },
                   { field: "TrustBondCode", title: "资产支持证券代码段", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center;vertical-align: middle;" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                   { field: "OriginalEquityHolder", title: "原始权益人", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center;vertical-align: middle;" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                   { field: "PublishType", title: "披露方式", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center;vertical-align: middle;" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                   { field: "PublishDate", title: "披露时间", format: "{0:yyyy-MM-dd}", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center;vertical-align: middle;" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                   { field: "PublishDescription", title: "披露概况", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center;vertical-align: middle;" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                   { field: "Remark", title: "备注", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center;vertical-align: middle;" }, attributes: { "class": "table-cell", style: "text-align: center;vertical-align: middle;" } }
                ],
            },
            dataSourceOptions: {
                pageSize: 20,
                schema: {
                    model: {
                        fields: {
                            TrustName: { type: "string" },
                            TrustBondCode: { type: "string" },
                            OriginalEquityHolder: { type: "string" },
                            PublishType: { type: "string" },
                            PublishDate: { type: "date" },
                            PublishDescription: { type: "string" },
                            Remark: { type: "string" }
                        }
                    },
                    data: function (response) {
                        return jQuery.parseJSON(response).data;
                    },
                    total: function (response) {
                        return jQuery.parseJSON(response).total;
                    }
                },
                otherOptions: {
                    orderby: "Id",
                    direction: "asc",
                    DBName: 'TrustManagement',
                    appDomain: 'RiskManagement',
                    executeParamType: 'extend',
                    defaultfilter: filter,
                    executeParam: function () {
                        var result = {
                            SPName: 'usp_GetCreditInfoPublishwithPager',
                            SQLParams: [],
                        };
                        return result;
                    }
                }
            }
        };
        //初始化资产明细的kendougrid
        kdGridAssetDetail.Init(assetDetailOptions, 'gridAssetDetail');
        kdGridAssetDetail.RunderGrid();
        $("#loading").css("display", "none");
    }

    function eventBind() {
        $('#btnDeleteInvest').bind('click', function () {
            var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
            var boundId = 0;
            var grid = $("#gridAssetDetail").data("kendoExtGrid");
            if (grid.select().length == 0) {
                GSDialog.HintWindow('请选择一条记录');
            } else {
                var data = grid.dataItem(grid.select());
                if (confirm('确认删除该记录吗？')) {
                    var executeParam = {
                        SPName: 'usp_DeleteInfoPublishById', SQLParams: [
                            { Name: 'Id', value: data.Id, DBType: 'int' }
                        ]
                    };
                    common.ExecuteGetData(false, svcUrl, 'RiskManagement', executeParam, function (data) {
                        if (data[0].result == 1) {
                            common.alertMsg('删除成功!', 1);
                            kendoGridModel().RefreshGrid()

                        } else {
                            common.alertMsg('删除失败!', 0);
                        }

                    });
                }
            }


        });
        $('#btnAddInvest').bind('click', function () {
            var webStorage = require('gs/webStorage');
            var userLanguage = webStorage.getItem('userLanguage');
            var tabName;
            if (userLanguage && userLanguage.indexOf('en') > -1) {
                tabName = 'Add info publish';

            } else {
                tabName = '新增信息披露';
            }
            var page = "../riskManagement/InfomationPublish/InfomationPublishDetail.html?tid=0";

            openBottomTabIframe(page, 'InfoPublish0', tabName);
            if (tabName == "新增信息披露" || tabName == "Add info publish") {
                var btn = $('.chrome-tabs-shell', parent.document).find(".chrome-tab-current").find(".chrome-tab-close");
                btn.click(function () {
                    kendoGridModel().RefreshGrid();
                })
            }

        });
        $('#btnEditInvest').bind('click', function () {
            var grid = $("#gridAssetDetail").data("kendoExtGrid");
            if (grid.select().length == 0) {
                GSDialog.HintWindow('请选择一条记录');
            } else {

                var data = grid.dataItem(grid.select());
                var page = "../riskManagement/InfomationPublish/InfomationPublishDetail.html?tid=" + data.Id;
                var webStorage = require('gs/webStorage');
                var userLanguage = webStorage.getItem('userLanguage');
                var tabName;
                if (userLanguage && userLanguage.indexOf('en') > -1) {
                    tabName = 'InfoPublish_' + data.Id;
                } else {
                    tabName = '信息披露_' + data.Id;
                }
                openBottomTabIframe(page, 'RiskCheck' + data.Id, tabName);
                if (tabName == '信息披露_' + data.Id || tabName == 'InfoPublish_' + data.Id) {
                    var btn = $('.chrome-tabs-shell', parent.document).find(".chrome-tab-current").find(".chrome-tab-close");
                    btn.click(function () {
                        kendoGridModel().RefreshGrid();
                    })
                }
            }

        });
        $("#exportData").bind("click", function () {
            var grid = $("#gridAssetDetail").data("kendoGrid");
            grid.saveAsExcel();
        })
    }

    function openBottomTabIframe(url, showId, tabName) {
        var pass = true;
        parent.viewModel.tabs().forEach(function (v, i) {
            if (v.id == showId) {
                pass = false;
                parent.viewModel.changeShowId(v);
                return false;
            }
        })
        if (pass) {
            var newTab = {
                id: showId,
                url: url,
                name: tabName,
                disabledClose: false
            };
            parent.viewModel.tabs.push(newTab);
            parent.viewModel.changeShowId(newTab);
        };
    }
});
