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
                fileName: "认购人信息表.xlsx"
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
                    //{ field: "BondType", title: "分层类型", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                    { field: "TrustBondName", title: "分层名称", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                    { field: "SubscriberName", title: "认购人名称", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                    { field: "SubscriberCode", title: "身份证号/组织机构代码/产品管理人组织机构代码", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                    { field: "SubscribeAmount", title: "认购金额（元）", type: "number", template: "#=!!SubscribeAmount!=0?(kendo.toString(SubscribeAmount,'N2')):''#", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                    { field: "AssociationRelationship", title: "关联关系说明", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                    { field: "SubscribeType_1", title: "认购人类型一级", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                    { field: "SubscribeType_2", title: "认购人类型二级", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                    { field: "SocialSecurity", title: "社保等具体类型说明", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                    { field: "OtherFund", title: "其他私募投资基金具体说明", width: "250px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                    { field: "OtherPlan", title: "其他投资计划具体类型说明", width: "250px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                    { field: "OtherInvestor", title: "中国证监会规定的其他投资者具体类型说明", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
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
            getTrustSubscriberDetial(value);
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
            'SPName': "usp_GetTrustSubscriberListReport",
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
        //getDateList();
        getTrustSubscriberDetial("");
        eventBind();
        kendo.culture("zh-CN");
    })
});
