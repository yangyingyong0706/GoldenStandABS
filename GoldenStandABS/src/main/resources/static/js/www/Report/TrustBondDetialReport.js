define(function (require) {
    var $ = require('jquery');
    var gv = require('globalVariable');
    var common = require('common');
    require('kendo.all.min');
    require('kendomessagescn');
    var webStorage = require("gs/webStorage");
    var userName = webStorage.getItem('gs_UserName');
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
            groupable: true,//可拖动分组
            resizable: true,//可拖动改变列大小
            excel: {
                allPages: true,//是否导出所有页中的数据
                fileName: "产品结构表.xlsx"
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
                        field: "TrustName", title: "产品名称",
                        locked: true,//固定列
                        lockable: false,
                        width: "270px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" }
                    },
                    { field: "BondType", title: "分层类型", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                    { field: "BondName", title: "分层名称", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                    { field: "DssueScale", title: "规模（元）", type: "number", template: "#=!!DssueScale!=0?(kendo.toString(DssueScale,'N2')):''#", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                    { field: "StartDate", title: "起息日", type: "date", format: "{0:yyyy-MM-dd}", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                    { field: "DueDate", title: "到期日", type: "date", format: "{0:yyyy-MM-dd}", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                    { field: "FaceAmount", title: "票面金额（元）", type: "number", template: "#=!!FaceAmount!=0?(kendo.toString(FaceAmount,'N2')):''#", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                    { field: "AnticipatedYield", title: "预期收益率（%）", type: "number", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                    { field: "CreditRatings", title: "信用级别", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                    { field: "InterestCalculatingType", title: "计息方式", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                    { field: "FloatInterestClause", title: "附息式浮动利率具体条款", width: "250px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                    { field: "OtherInterestClause", title: "其他计息方式具体条款", width: "250px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                    { field: "InterestPayingWay", title: "付息次数方式", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                    { field: "InterestPayingTimes", title: "付息次数", type: "number", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                    { field: "DebtWay", title: "还本方式", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                    { field: "AheadDebtClause", title: "提前还本具体条款", width: "250px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
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
            var value = $(this).find("option:selected").val() ? $(this).find("option:selected").val() : '1900-01-01';
            getTrustBondDetial(value);
        })
    }

    function getDateList() {
        var serviceUrl = gv.DataProcessServiceUrl + "CommonExecuteGet?";
        var executeParam = {
            'SPName': "usp_GetTrustReportDate",
            'SQLParams': [
                { 'Name': 'UserName', 'Value': userName, 'DBType': 'string' }
            ]
        };
        common.ExecuteGetData(true, serviceUrl, 'RiskManagement', executeParam, function (data) {
            $("#dateSelect").empty();
            $.each(data, function (index, dom) {
                $("#dateSelect").append("<option value='" + common.getStringDate(dom.importDate).dateFormat("yyyy-MM-dd") + "'>" + common.getStringDate(dom.importDate).dateFormat("yyyy-MM-dd") + "</option>");
            })
            getTrustBondDetial($("#dateSelect option:selected").val() ? $("#dateSelect option:selected").val() : '1900-01-01');
        });
    }

    function getTrustBondDetial(value) {
        var serviceUrl = gv.DataProcessServiceUrl + "CommonExecuteGet?";
        var executeParam = {
            'SPName': "usp_GetTrustBondDetailReport",
            'SQLParams': [
                { 'Name': 'date', 'Value': value, 'DBType': 'string' },
                { 'Name': 'UserName', 'Value': userName, 'DBType': 'string' }
            ]
        };
        common.ExecuteGetData(true, serviceUrl, 'RiskManagement', executeParam, function (data) {
            renderGrid(data);
        });
    }

    $(function () {
        getDateList();
        eventBind();
        kendo.culture("zh-CN");
    })
});
