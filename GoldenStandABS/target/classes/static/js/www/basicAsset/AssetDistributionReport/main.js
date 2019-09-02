var viewModel = {};
define(function (require) {
    var $ = require('jquery');
    require('jquery-ui');
    var util = require('gs/gsUtil');
    require('devExtreme.dx.all');
    //require('devExtreme.jszip.min');
    var webProxy = require('gs/webProxy');
    var Vue = require('Vue2');
    var ssasUrl = webProxy.baseUrl + "/OLAP/msmdpump.dll";
    var catalog = util.getURLParameter("catalog");//"SFM_DAL_AUTO";
    var cube = util.getURLParameter("cube")//"SFM DAL AUTO"
    var common=require('common');
    var vm = new Vue({ //c_:current表示当前
        el: '#app',
        data: {

        },
        mounted: function () {
            var self = this;

            //self.getPoolList();
            self.generateSummaryReport();
        },
        methods: {
            generateSummaryReport: function () {
                var timer = null;
                clearTimeout(timer);
                timer = setTimeout(function () {
                    showSummary("dalSummary");
                    //showBuyBackInfo("dalBuyBack");
                    //showPaymentInfo("dalPaymentInfo");
                    //showPaymentInfo("dalPaymentInfo");
                    showPaymentInfoBuyBackPrincipalAmount("dalBuyBackPrincipalAmount");
                    showPaymentInfoActualPrincipalPaid("dalActualPrincipalPaid");
                    showWarehouseListInfo("dalWarehouseList");
                },500)

            }
        }
    });

    $(function () {
        function ieshowsinger(id) {
            $("#" + id).show();
            $("#tabs>div").not("#" + id).hide();
        }
        $("#tabs").tabs({
            activate: function (event, ui) {
                if (event.currentTarget.hash == "#tabs-1") {
                    ieshowsinger("tabs-1")
                    showDistribution(ssasUrl, catalog, cube, "loanTerm", "[Loan Term Distribution].[Distributions Desc]", "合同期限分布");
                }
                else if (event.currentTarget.hash == "#tabs-2") {
                    ieshowsinger("tabs-2")
                    showDistribution(ssasUrl, catalog, cube, "seasoning", "[Seasoning Distribution].[Distributions Desc]", "账龄分布");
                }
                else if (event.currentTarget.hash == "#tabs-3") {
                    ieshowsinger("tabs-3")
                    showDistribution(ssasUrl, catalog, cube, "remainingTerm", "[Remaining Term Distribution].[Distributions Desc]", "剩余期限分布");
                }
                else if (event.currentTarget.hash == "#tabs-4") {
                    ieshowsinger("tabs-4")
                    showDistribution(ssasUrl, catalog, cube, "rate", "[Current Rate Distribution].[Distributions Desc]", "利率分布");
                }
                else if (event.currentTarget.hash == "#tabs-5") {
                    ieshowsinger("tabs-5")
                    showDistribution(ssasUrl, catalog, cube, "loanAmount", "[View Approval Amount Distribution].[Distributions Desc]", "合同金额分布");
                }
                else if (event.currentTarget.hash == "#tabs-6") {
                    ieshowsinger("tabs-6")
                    showDistribution(ssasUrl, catalog, cube, "cpr", "[Principal Balance Distribution].[Distributions Desc]", "本金余额分布");
                }
                else if (event.currentTarget.hash == "#tabs-7") {
                    ieshowsinger("tabs-7")
                    showDistribution(ssasUrl, catalog, cube, "career", "[Customer].[Occupation]", "贷款行业分布");
                }
                else if (event.currentTarget.hash == "#tabs-8") {
                    ieshowsinger("tabs-8")
                    showDistribution(ssasUrl, catalog, cube, "income", "[View Annual Income Distribution].[Distributions Desc]", "年收入分布");
                }
                else if (event.currentTarget.hash == "#tabs-9") {
                    ieshowsinger("tabs-9")
                    showDistribution(ssasUrl, catalog, cube, "age", "[View Age Distribution].[Distributions Desc]", "年龄分布");
                }
                else if (event.currentTarget.hash == "#tabs-10") {
                    ieshowsinger("tabs-10")
                    showDistribution(ssasUrl, catalog, cube, "credit", "[View Credit Score Distribution].[Distributions Desc]", "信用分数分布");
                }
                else if (event.currentTarget.hash == "#tabs-11") {
                    ieshowsinger("tabs-11")
                    showDistribution(ssasUrl, catalog, cube, "gradeLevel", "[Loan].[Loan Grade Level]", "五级分类分布");
                }
                else if (event.currentTarget.hash == "#tabs-12") {
                    ieshowsinger("tabs-12")
                    showDistributionBySP("creditRating", "usp_GetCreditRatingReport", "客户级别");
                }
                else if (event.currentTarget.hash == "#tabs-13") {
                    ieshowsinger("tabs-13")
                    showDistributionBySP("isCusInArrears", "usp_GetIsCusInArrearsReport", "客户逾期");
                }
                else if (event.currentTarget.hash == "#tabs-14") {
                    ieshowsinger("tabs-14")
                    showDistributionBySP("isCusInDefault", "usp_GetIsCusInDefaultReport", "客户违约");
                }
                else if (event.currentTarget.hash == "#tabs-15") {
                    ieshowsinger("tabs-15")
                    showDistributionBySP("loanStatus", "usp_GetLoanStatusReport", "仓单状态");
                }
                else if (event.currentTarget.hash == "#tabs-16") {
                    ieshowsinger("tabs-16")
                    showDistributionBySP("isLoanInArrears", "usp_GetIsLoanInArrearsReport", "仓单逾期");
                }
                else if (event.currentTarget.hash == "#tabs-17") {
                    ieshowsinger("tabs-17")
                    showDistributionBySP("isLoanInDefault", "usp_GetIsLoanInDefaultReport", "仓单违约");
                }
                else if (event.currentTarget.hash == "#tabs-18") {
                    ieshowsinger("tabs-18")
                    showDistributionBySP("buyBackStatus", "usp_GetBuyBackStatusReport", "回购状态");
                }
                else if (event.currentTarget.hash == "#tabs-19") {
                    ieshowsinger("tabs-19")
                    showDistributionBySP("isForcedClosed", "usp_GetIsForcedClosedReport", "仓单强平");
                }
            }
        });

        //showSummary(ssasUrl, catalog, cube, "dalSummary");
        showDistribution(ssasUrl, catalog, cube, "loanTerm", "[Loan Term Distribution].[Distributions Desc]");
    });



    function showDistribution(ssasUrl, catalog, cube, pid, dimenstion, title) {
        var pivotGridChart = $("#" + pid + "-chart").dxChart({
            commonSeriesSettings: {
                type: "bar"

            },
            argumentAxis: { // or valueAxis
                label: {
                    visible: false
                }
            },
            useAggregation: true,
            title: {
                text: title
            },
            tooltip: {
                enabled: true,
                customizeTooltip: function (args) {
                    //var valueText = (args.seriesName.indexOf("Total") != -1) ?
                    //        Globalize.formatCurrency(args.originalValue,
                    //            "USD", { maximumFractionDigits: 0 }) :
                    //        args.originalValue;

                    //return {
                    //    html: args.seriesName + "<div class='currency'>"
                    //        + valueText + "</div>"
                    //};
                    return {
                        html: common.numFormt(args.originalValue)
                    }
                    console.log(args)
                }
            },
            size: {
                height: "auto"
            },
            adaptiveLayout: {

            }
        }).dxChart("instance");

        var pivotGrid = $("#" + pid).dxPivotGrid({
            allowSortingBySummary: true,
            allowSorting: true,
            allowFiltering: true,
            allowExpandAll: true,
            height: "auto",
            showBorders: true,
            wordWrapEnabled: true,
            "export": {
                enabled: true,
                fileName: cube
            },
            fieldChooser: {
                allowSearch: true
            },
            fieldPanel: {
                showColumnFields: false,
                showDataFields: false,
                showFilterFields: true,
                showRowFields: true,
                allowFieldDragging: false,
                visible: true
            },
            dataSource: {
                fields: [
                    { dataField: "[Date].[Date]", area: "filter", caption: "日期" },
                    { dataField: dimenstion, area: "row", caption: "分布描述" },
                    { dataField: "[Measures].[Loan Count]", area: "data", caption: "贷款笔数", format: "fixedPoint" }
                ],
                store: {
                    type: "xmla",
                    url: ssasUrl,
                    catalog: catalog,
                    cube: cube
                }
            }
        }).dxPivotGrid("instance");

        pivotGrid.bindChart(pivotGridChart, {
            dataFieldsDisplayMode: "splitPanes",
            alternateDataFields: false
        });
    }//showDistribution

    function showBuyBackInfo(pid) {
        var svcUrl = webProxy.dataProcessServiceUrl + "CommonGetExecute?connConfig=SFM_DAL_MarginTrading&appDomain=dbo&executeParams=";
        var params;
        var result;

        var promise = webProxy.comGetData(params, svcUrl, 'usp_GetBuyBackReport');
        promise().then(function (response) {
            if (typeof response === 'string') { result = JSON.parse(response); }
            else { result = response; }
        });


        var pivotGrid = $("#" + pid).dxPivotGrid({
            allowSortingBySummary: false,
            allowSorting: false,
            allowFiltering: true,
            allowExpandAll: true,
            showBorders: true,
            wordWrapEnabled: true,
            fieldChooser: {
                enabled: true
            },
            "export": {
                enabled: true,
                fileName: "Pool"
            },
            dataSource: {
                fields: [{
                    caption: "日期",
                    width:120,
                    dataField: "DimReportingDateID",

                    area: "row",
                    sortBySummaryField: 'RowNo'

                },
                {
                    caption: "序号",
                    dataField: "RowNo",
                    dataType: "number",
                    summaryType: "sum",
                    area: "data"
                    , visible: false
                },

                {
                    caption: "专项计划",
                    dataField: "TrustCode",

                    area: "column"
                },
                {
                    caption: "回购资产笔数",
                    dataField: "loannumber",
                    dataType: "fixedpoint",
                    summaryType: "sum",
                    area: "data"
                },
                {
                    caption: "回购涉及客户数量",
                    dataField: "customernumber",
                    dataType: "fixedpoint",
                    summaryType: "sum",
                    area: "data"
                },
                {
                    caption: "回购本金",
                    dataField: "currentprincipalbalance",
                    format: "###,###.##",
                    summaryType: "sum",
                    area: "data"
                }
                ],
                store: result

            }
        });

    }

    function showPaymentInfo(pid) {
        var svcUrl = webProxy.dataProcessServiceUrl + "CommonGetExecute?connConfig=SFM_DAL_MarginTrading&appDomain=dbo&executeParams=";
        var params;
        var result;

        var promise = webProxy.comGetData(params, svcUrl, 'usp_GetPaymentStatsReport');
        promise().then(function (response) {
            if (typeof response === 'string') { result = JSON.parse(response); }
            else { result = response; }
        });


        var pivotGrid = $("#" + pid).dxPivotGrid({
            allowSortingBySummary: false,
            allowSorting: false,
            allowFiltering: true,
            allowExpandAll: true,
            showBorders: true,
            wordWrapEnabled: true,
            fieldChooser: {
                enabled: true
            },
            "export": {
                enabled: true,
                fileName: "Pool"
            },
            dataSource: {
                fields: [{
                    caption: "日期",
                    width: 120,
                    dataField: "DimReportingDateID",

                    area: "row",
                    sortBySummaryField: 'RowNo'

                },
                {
                    caption: "序号",
                    dataField: "RowNo",
                    dataType: "number",
                    summaryType: "sum",
                    area: "data"
                    , visible: false
                },

                {
                    caption: "专项计划",
                    dataField: "TrustCode",

                    area: "column"
                },
                {
                    caption: "当日还款本金",
                    dataField: "principalpaidfortheday",
                    dataType: "fixedpoint",
                    summaryType: "sum",
                    area: "data"
                },
                {
                    caption: "当日还款利息",
                    dataField: "interestpaidfortheday",
                    format: "###,###.##",
                    summaryType: "sum",
                    area: "data"
                }
                ],
                store: result

            }
        });

    }

    function showSummary(pid) {
        var svcUrl = webProxy.dataProcessServiceUrl + "CommonGetExecute?connConfig=SFM_DAL_MarginTrading&appDomain=dbo&executeParams=";
        var params;
        var result;

        var promise = webProxy.comGetData(params, svcUrl, 'usp_GetSummaryReport');
        promise().then(function (response) {
            if (typeof response === 'string') { result = JSON.parse(response); }
            else { result = response; }
        });


        var pivotGrid = $("#" + pid).dxPivotGrid({
            allowSortingBySummary: false,
            allowSorting: false,
            allowFiltering: true,
            allowExpandAll: true,
            showBorders: true,
            wordWrapEnabled: true,
            fieldChooser: {
                enabled: true
            },
            "export": {
                enabled: true,
                fileName: "Pool"
            },
            dataSource: {
                fields: [{
                    caption: "日期",
                    width: 120,
                    dataField: "DimReportingDateID",

                    area: "row",
                    sortBySummaryField: 'RowNo'

                },
                {
                    caption: "序号",
                    dataField: "RowNo",
                    dataType: "number",
                    summaryType: "sum",
                    area: "data"
                    , visible: false
                },

                {
                    caption: "专项计划",
                    dataField: "TrustCode",

                    area: "column"
                },
                {
                    caption: "贷款笔数",
                    dataField: "loannumber",
                    dataType: "fixedpoint",
                    summaryType: "sum",
                    format: "###,###",
                    area: "data"
                },
                {
                    caption: "客户数量",
                    dataField: "customernumber",
                    dataType: "fixedpoint",
                    format: "###,###",
                    summaryType: "sum",
                    area: "data"
                },
                {
                    caption: "应收本金",
                    dataField: "approvalamount",
                    format: "###,###.##",
                    summaryType: "sum",
                    area: "data"
                }
                ,
                {
                    caption: "应收利息",
                    dataField: "totalinterestaccureddue",
                    format: "###,###.##",
                    summaryType: "sum",
                    area: "data"
                },
                {
                    caption: "剩余本金",
                    dataField: "currentprincipalbalance",
                    format: "###,###.##",
                    summaryType: "sum",
                    area: "data"
                }
                ,
                {
                    caption: "剩余利息",
                    dataField: "totalinterestaccuredbalance",
                    format: "###,###.##",
                    summaryType: "sum",
                    area: "data"
                }
                , {
                    caption: "已收本金",
                    dataField: "principalpaid",
                    format: "###,###.##",
                    summaryType: "sum",
                    area: "data"
                }
                ,
                {
                    caption: "已收利息",
                    dataField: "totalinterestpaid",
                    format: "###,###.##",
                    summaryType: "sum",
                    area: "data"
                }
                ],
                store: result

            }
        });


    }//showSummary



    function showPaymentInfoBuyBackPrincipalAmount(pid) {
        var svcUrl = webProxy.dataProcessServiceUrl + "CommonGetExecute?connConfig=SFM_DAL_MarginTrading&appDomain=dbo&executeParams=";
        var params;
        var result;

        var promise = webProxy.comGetData(params, svcUrl, 'usp_GetBuyBackPrincipalAmountReport');
        promise().then(function (response) {
            if (typeof response === 'string') { result = JSON.parse(response); }
            else { result = response; }
        });


        var pivotGrid = $("#" + pid).dxPivotGrid({
            allowSortingBySummary: false,
            allowSorting: false,
            allowFiltering: true,
            allowExpandAll: true,
            showBorders: true,
            wordWrapEnabled: true,
            fieldChooser: {
                enabled: true
            },
            "export": {
                enabled: true,
                fileName: "Pool"
            },
            dataSource: {
                fields: [{
                    caption: "日期",
                    width: 120,
                    dataField: "DimReportingDateID",

                    area: "row",
                    sortBySummaryField: 'RowNo'

                },
                {
                    caption: "序号",
                    dataField: "RowNo",
                    dataType: "number",
                    summaryType: "sum",
                    area: "data"
                    , visible: false
                },

                {
                    caption: "专项计划",
                    dataField: "TrustCode",

                    area: "column"
                },

                {
                    caption: "回购本金发生额",
                    dataField: "BuyBackPrincipalAmount",
                    format: "###,###.##",
                    summaryType: "sum",
                    area: "data"
                },
                {
                    caption: "回购利息发生额",
                    dataField: "BuyBackInterestAmount",
                    format: "###,###.##",
                    summaryType: "sum",
                    area: "data"
                }
                ],
                store: result

            }
        });

    }


    function showPaymentInfoActualPrincipalPaid(pid) {
        var svcUrl = webProxy.dataProcessServiceUrl + "CommonGetExecute?connConfig=SFM_DAL_MarginTrading&appDomain=dbo&executeParams=";
        var params;
        var result;

        var promise = webProxy.comGetData(params, svcUrl, 'usp_GetBuyBackActualPrincipalPaid');
        promise().then(function (response) {
            if (typeof response === 'string') { result = JSON.parse(response); }
            else { result = response; }
        });


        var pivotGrid = $("#" + pid).dxPivotGrid({
            allowSortingBySummary: false,
            allowSorting: false,
            allowFiltering: true,
            allowExpandAll: true,
            showBorders: true,
            wordWrapEnabled: true,
            fieldChooser: {
                enabled: true
            },
            "export": {
                enabled: true,
                fileName: "Pool"
            },
            dataSource: {
                fields: [{
                    caption: "日期",
                    width: 120,
                    dataField: "DimReportingDateID",
                    area: "row",
                    sortBySummaryField: 'RowNo'

                },
                {
                    caption: "序号",
                    dataField: "RowNo",
                    dataType: "number",
                    summaryType: "sum",
                    area: "data"
                    , visible: false
                },

                {
                    caption: "专项计划",
                    dataField: "TrustCode",

                    area: "column"
                },
                {
                    caption: "还款本金发生额",
                    dataField: "ActualPrincipalPaid",
                    format: "###,###.##",
                    summaryType: "sum",
                    area: "data"
                },
                {
                    caption: "还款利息发生额",
                    dataField: "ActualInterestPaid",
                    format: "###,###.##",
                    summaryType: "sum",
                    area: "data"
                }
                ],
                store: result

            }
        });

    }


    function showWarehouseListInfo(pid) {
        var svcUrl = webProxy.dataProcessServiceUrl + "CommonGetExecute?connConfig=SFM_DAL_MarginTrading&appDomain=dbo&executeParams=";
        var params;
        var result;

        var promise = webProxy.comGetData(params, svcUrl, 'usp_GetNewPurchaseInfo');
        promise().then(function (response) {
            if (typeof response === 'string') { result = JSON.parse(response); }
            else { result = response; }
        });


        var pivotGrid = $("#" + pid).dxPivotGrid({
            allowSortingBySummary: false,
            allowSorting: false,
            allowFiltering: true,
            allowExpandAll: true,
            showBorders: true,
            wordWrapEnabled: true,
            fieldChooser: {
                enabled: true
            },
            "export": {
                enabled: true,
                fileName: "Pool"
            },
            dataSource: {
                fields: [{
                    caption: "日期",
                    width: 120,
                    dataField: "DimReportingDateID",
                    area: "row",
                    sortBySummaryField: 'RowNo'

                },
                {
                    caption: "序号",
                    dataField: "RowNo",
                    dataType: "number",
                    summaryType: "sum",
                    area: "data"
                    , visible: false
                },

                {
                    caption: "专项计划",
                    dataField: "TrustCode",

                    area: "column"
                },
                {
                    caption: "总资产",
                    dataField: "totalassets",
                    format: "###,###.##",
                    summaryType: "sum",
                    area: "data"
                },
                {
                    caption: "审批总额",
                    dataField: "totalapprovalamount",
                    format: "###,###.##",
                    summaryType: "sum",
                    area: "data"
                },
                {
                caption: "应收利息",
                dataField: "TotalInterestAccuredDue",
                format: "###,###.##",
                summaryType: "sum",
                area: "data"
            }
                ],
                store: result

            }
        });

    }



    function showDistributionBySP(pid, sp, title) {
        var svcUrl = webProxy.dataProcessServiceUrl + "CommonGetExecute?connConfig=SFM_DAL_MarginTrading&appDomain=dbo&executeParams=";
        var params;
        var result;

        var promise = webProxy.comGetData(params, svcUrl, sp);
        promise().then(function (response) {
            if (typeof response === 'string') { result = JSON.parse(response); }
            else { result = response; }
        });


        var pivotGrid = $("#" + pid).dxPivotGrid({
            allowSortingBySummary: false,
            allowSorting: false,
            allowFiltering: true,
            allowExpandAll: true,
            showBorders: true,
            wordWrapEnabled: true,
            fieldChooser: {
                enabled: true
            },
            title: {
                text: title
            },
            "export": {
                enabled: true,
                fileName: "Pool"
            },
            dataSource: {
                fields: [{
                    caption: "日期",
                    width: 120,
                    dataField: "DimReportingDateID",

                    area: "row",
                    sortBySummaryField: 'RowNo'

                },
                {
                    caption: "序号",
                    dataField: "RowNo",
                    dataType: "number",
                    summaryType: "sum",
                    area: "data"
                    , visible: false
                },

                {
                    caption: "专项计划",
                    dataField: "TrustCode",

                    area: "column"
                },
                {
                    caption: "维度信息",
                    dataField: "Dimension",

                    area: "row"
                },
                {
                    caption: "统计",
                    dataField: "Fact1",
                    dataType: "fixedpoint",
                    format: "###,###.##",
                    summaryType: "sum",
                    area: "data"
                }
                ],
                store: result

            }
        });

    }
});