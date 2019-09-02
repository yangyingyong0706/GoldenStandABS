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
                fileName: "延付本息表.xlsx"
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
                        width: "250px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" }
                    },
                    { field: "BondType", title: "产品编码", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                    { field: "BondName", title: "产品类型", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                    { field: "DssueScale", title: "产品设立日期", type: "number", template: "#=!!DssueScale!=0?(kendo.toString(DssueScale,'N2')):''#", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                    { field: "StartDate", title: "产品到期日期", type: "date", format: "{0:yyyy-MM-dd}", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                    { field: "DueDate", title: "首次发生延付本息日期", type: "date", format: "{0:yyyy-MM-dd}", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                    { field: "FaceAmount", title: "是否当期新增报送", type: "number", template: "#=!!FaceAmount!=0?(kendo.toString(FaceAmount,'N2')):''#", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                    { field: "AnticipatedYield", title: "是否为风险承担主体", type: "number", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                    { field: "CreditRatings", title: "提供投资建议的第三方机构或GP名称", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                    { field: "InterestCalculatingType", title: "担保方", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                    { field: "FloatInterestClause", title: "资金监管情况", width: "250px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                    { field: "OtherInterestClause", title: "产品期末规模", width: "250px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                    { field: "InterestPayingWay", title: "投资者数量", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                    { field: "InterestPayingTimes", title: "自然人客户数", type: "number", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                    { field: "DebtWay", title: "自然人客户委托资金规模", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                    { field: "AheadDebtClause", title: "机构客户数", width: "250px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                    { field: "AheadDebtClause", title: "机构客户委托资金规模", width: "250px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                    { field: "AheadDebtClause", title: "延期偿还的本金金额", width: "250px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
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
            getTrustDelayPaymentDetail($("#dateSelect option:selected").val());
        });
    }

    function getTrustDelayPaymentDetail(value) {
        var serviceUrl = gv.DataProcessServiceUrl + "CommonExecuteGet?";
        var executeParam = {
            'SPName': "usp_GetTrustDelayPaymentDetail",
            'SQLParams': [
                { 'Name': 'date', 'Value': value, 'DBType': 'string' }
            ]
        };
        //common.ExecuteGetData(true, serviceUrl, 'RiskManagement', executeParam, function (data) {
        //    renderGrid(data);
        //});
        renderGrid(data=[]);
    }

    $(function () {
        //getDateList();
        getTrustDelayPaymentDetail("");
        eventBind();
        kendo.culture("zh-CN");
    })
});
