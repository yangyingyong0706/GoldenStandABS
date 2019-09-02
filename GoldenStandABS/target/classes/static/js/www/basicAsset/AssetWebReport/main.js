var viewModel = {};
define(function (require) {
    var $ = require('jquery');
    require('jquery-ui');
    var util = require('gs/gsUtil');
    require('devExtreme.dx.all');
    require('devExtreme.jszip.min');
    var webProxy = require('gs/webProxy');
    var common = require('common');
    var ssasUrl = webProxy.baseUrl + "/OLAP/msmdpump.dll";
    var catalog = util.getURLParameter("catalog");//"SFM_DAL_AUTO";
    var cube = util.getURLParameter("cube")//"SFM DAL AUTO";

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
            }
        });

        showSummary(ssasUrl, catalog, cube, "dalSummary");
        showDistribution(ssasUrl, catalog, cube, "loanTerm", "[Loan Term Distribution].[Distributions Desc]");
    });

    function showDistribution(ssasUrl, catalog, cube, pid, dimenstion, title) {
        console.log(title);
        var pivotGridChart = $("#"+pid+"-chart").dxChart({
            commonSeriesSettings: {
                type: "bar"

            },
            argumentAxis: { // or valueAxis
                label: {
                    visible : false
                }
            },
            useAggregation:true,
            title: {
                text: title,
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
                }
            },
            size: {
                height: 'auto'
            },
            adaptiveLayout: {
                width: 450
            }
        }).dxChart("instance");

       var pivotGrid = $("#" + pid).dxPivotGrid({
            allowSortingBySummary: true,
            allowSorting: true,
            allowFiltering: true,
            allowExpandAll: true,
            height: 'auto',
            showBorders: true,
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

    function showSummary(ssasUrl, catalog, cube, id) {
        $("#" + id).dxPivotGrid({
            allowSortingBySummary: true,
            allowSorting: true,
            allowFiltering: true,
            allowExpandAll: true,
            height: 260,
            showBorders: true,
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
                showRowFields: false,
                allowFieldDragging: false,
                visible: true
            },
            dataSource: {
                fields: [
                    { dataField: "[Date].[Date]", area: "filter", caption: "日期" },
                    { dataField: "[Measures].[Loan Count]", area: "data", caption: "合同笔数（笔）", format: "fixedPoint" },
                    { dataField: "[Measures].[FactLoanCustomer Count]", area: "data", caption: "客户数（户）", format: "fixedPoint" },
                    { dataField: "[Measures].[Approval Amount]", area: "data", caption: "合同总金额（元）", format : "fixedPoint" },
                    { dataField: "[Measures].[Current Principal Balance]", area: "data", caption: "未偿本金总金额（元）", format: "fixedPoint" },
                    { dataField: "[Measures].[Avg Customer Current Principal Balance]", area: "data", caption: "借款人平均未偿本金（元）", format: "fixedPoint" },
                    { dataField: "[Measures].[Maximum Current Principal Balance]", area: "data", caption: "单笔贷款最大未偿本金（元）", format: "fixedPoint" },
                    { dataField: "[Measures].[Average Loan Balance]", area: "data", caption: "单笔贷款平均未偿本金（元）", format: "fixedPoint" },
                    { dataField: "[Measures].[Average Approval Amount]", area: "data", caption: "单笔贷款平均合同金额（元）", format: "fixedPoint" },
                    { dataField: "[Measures].[Weighted Average Term]", area: "data", caption: "加权平均合同期限（月）", format: "fixedPoint" },
                    { dataField: "[Measures].[Weighted Average Term To Maturity]", area: "data", caption: "加权平均剩余期限（月）", format: "fixedPoint" },
                    { dataField: "[Measures].[Weighted Average Seasoning]", area: "data", caption: "加权平均账龄（月）", format: "fixedPoint" },
                    { dataField: "[Measures].[Maximum Remaining Term]", area: "data", caption: "单笔贷款最长剩余期限（月）", format: "fixedPoint" },
                    { dataField: "[Measures].[Minimum Remaining Term]", area: "data", caption: "单笔贷款最短剩余期限（月）", format: "fixedPoint" },
                    {
                        dataField: "[Measures].[Weighted Average Current Rate]", area: "data", caption: "加权平均利率（%）", format: {
                            formatter: function (data) {
                                var str = Number(data * 100).toFixed(0);
                                str += "%";
                                return str;
                            }
                        }
                    },
                    {
                        dataField: "[Measures].[Maximum Current Rate]", area: "data", caption: "单笔贷款最高利率（%）", format: {
                            formatter: function (data) {
                                var str = Number(data * 100).toFixed(0);
                                str += "%";
                                return str;
                            }
                        }
                    },
                    {
                        dataField: "[Measures].[Minimum Current Rate]", area: "data", caption: "单笔贷款最低利率（%）", format: {
                            formatter: function (data) {
                                var str = Number(data * 100).toFixed(0);
                                str += "%";
                                return str;
                            }
                        }
                    }
                ],
                store: {
                    type: "xmla",
                    url: ssasUrl,
                    catalog: catalog,
                    cube: cube
                }
            }
        });
    }//showSummary

});