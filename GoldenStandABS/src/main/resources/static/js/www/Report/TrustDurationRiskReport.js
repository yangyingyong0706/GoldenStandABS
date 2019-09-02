define(function (require) {
    var $ = require('jquery');
    var gv = require('globalVariable');
    var common = require('common');
    require('kendo.all.min');
    require('kendomessagescn');
    var height = $(window).height() - 105;
    var g_DataSource;

    function renderGrid(data) {
        g_DataSource = data;
        $("#reportGetTrustGrid").html("");
        var grid = $("#reportGetTrustGrid").kendoGrid({
            dataSource: g_DataSource,
            height: height,
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
            pageable: {
                refresh: false,
                pageSizes: true,
                buttonCount: 5,
                page: 1,
                pageSize: 20,
                pageSizes: [20, 50, 100, 500]
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
            dataBound: function () {
            }
        });
        $("#loading").css("display", "none");
    }

    function eventBind() {
        $("#exportData").bind("click", function () {
            var grid = $("#reportGetTrustGrid").data("kendoGrid");
            grid.saveAsExcel();
        })
        $("#dateSelect").bind("change", function () {
            var value = $(this).find("option:selected").val();
            getTrustBondDetial(value);
        })
    }

    function getDateList() {
        var serviceUrl = gv.DataProcessServiceUrl + "CommonExecuteGet?";
        var executeParam = {
            'SPName': "usp_GetTrustReportDate",
            'SQLParams': []
        };
        common.ExecuteGetData(true, serviceUrl, 'RiskManagement', executeParam, function (data) {
            $("#dateSelect").empty();
            $.each(data, function (index, dom) {
                $("#dateSelect").append("<option value='" + common.getStringDate(dom.importDate).dateFormat("yyyy-MM-dd") + "'>" + common.getStringDate(dom.importDate).dateFormat("yyyy-MM-dd") + "</option>");
            })
            getTrustBondDetial($("#dateSelect option:selected").val());
        });
    }

    function getTrustSubscriberDetial(value) {
        var serviceUrl = gv.DataProcessServiceUrl + "CommonExecuteGet?";
        var executeParam = {
            'SPName': "usp_GetTrustDurationRiskReport",
            'SQLParams': [
                { 'Name': 'date', 'Value': value, 'DBType': 'string' }
            ]
        };
        common.ExecuteGetData(true, serviceUrl, 'RiskManagement', executeParam, function (data) {
            renderGrid(data);
        });
    }

    $(function () {
        //getDateList();
        getTrustSubscriberDetial("");
        eventBind();
        kendo.culture("zh-CN");
    })
});
