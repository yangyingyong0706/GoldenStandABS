define(function (require) {
    var $ = require('jquery');
    var GlobalVariable = require('globalVariable');
    require('date_input');
    var kendoGridModel = require('./kendoGridModel');
    var common = require('common');
    var Vue = require('Vue2');
    require("kendomessagescn");
    var GSDialog = require('gs/uiFrame/js/gs-admin-2.pages');
    var trustId = common.getQueryString('tid');

    var height = $(window).height() - 120;
    var h = $(window).height() - 105;
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
                height: h,
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
                    fileName: "存续期信用风险管理报告.xlsx"
                },
                columns: [
                   {
                       field: "TrustName", title: "资产支持专项计划名称",
                       locked: true,//固定列
                       lockable: false,
                       width: "250px", headerAttributes: { "class": "table-header-cell", style: "text-align: center;vertical-align: middle;" }, attributes: { "class": "table-cell", style: "text-align: center" }
                   },
                   { field: "RiskType", title: "风险类别", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center;vertical-align: middle;" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                   { field: "TrustBondCode", title: "资产支持证券代码段", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center;vertical-align: middle;" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                   { field: "OriginalEquityHolder", title: "原始权益人", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center;vertical-align: middle;" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                   {
                       title: "监测与排查过程", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" },
                       columns: [{
                           title: "现场排查", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" },
                           columns: [
                               { field: "CheckDate", title: "时间", type: "date", format: "{0:yyyy-MM-dd}", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                               { field: "Participant", title: "参与人员/部门/职务", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                               { field: "CheckContent", title: "简述方法、过程", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                           ]
                       },
                       {
                           title: "非现场排查", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" },
                           columns: [
                               { field: "CheckDate_fxc", title: "时间或频率", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                               { field: "CheckContent_fxc", title: "简述方法、过程", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                           ]
                       }]
                   },
                   { field: "CheckResult", title: "监测与排查结果", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center;vertical-align: middle;" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                   {
                       title: "化解与处置情况", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" },
                       columns: [
                           { field: "IsSubmitReport", title: "是否报送临时风险管理报告", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center;vertical-align: middle;" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                           { field: "IsSubmitPlan", title: "是否报送风险化解处置预案", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center;vertical-align: middle;" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                           { field: "DisposalContent", title: "简述处置情况", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center;vertical-align: middle;" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                       ]
                   },
                   { field: "IsPreliminaryClassify", title: "是否初步分类", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: cente;vertical-align: middle;" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                   { field: "Remark", title: "备注", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center;vertical-align: middle;" }, attributes: { "class": "table-cell", style: "text-align: center;vertical-align: middle;" } }
                ],
            },
            dataSourceOptions: {
                pageSize: 20,
                schema: {
                    model: {
                        fields: {
                            TrustName: { type: "string" },
                            RiskType: { type: "string" },
                            TrustBondCode: { type: "string" },
                            OriginalEquityHolder: { type: "string" },
                            CheckDate: { type: "date" },
                            Participant: { type: "string" },
                            CheckContent: { type: "string" },
                            CheckDate_fxc: { type: "string" },
                            CheckContent_fxc: { type: "string" },
                            IsSubmitReport: { type: "string" },
                            IsSubmitPlan: { type: "string" },
                            DisposalContent: { type: "string" },
                            IsPreliminaryClassify: { type: "string" },
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
                            SPName: 'usp_GetCreditRiskCheckwithPager',
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
                        SPName: 'usp_DeleteCreditRiskCheckById', SQLParams: [
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
                tabName = 'Add Risk Check';

            } else {
                tabName = '新增风险排查';
            }
            var page = "../riskManagement/CreditRiskCheck/CreditRiskCheckDetail.html?tid=" + 0;

            openBottomTabIframe(page, 'RiskCheck0', tabName);
            if (tabName == "新增风险排查" || tabName == "Add Risk Check") {
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
                var page = "../riskManagement/CreditRiskCheck/CreditRiskCheckDetail.html?tid=" + data.Id;
                var webStorage = require('gs/webStorage');
                var userLanguage = webStorage.getItem('userLanguage');
                var tabName;
                if (userLanguage && userLanguage.indexOf('en') > -1) {
                    tabName = 'Risk Check_' + data.Id;
                } else {
                    tabName = '风险排查_' + data.Id;
                }
                openBottomTabIframe(page, 'RiskCheck' + data.Id, tabName);
                if (tabName == '风险排查_' + data.Id || tabName == 'Risk Check_' + data.Id) {
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
