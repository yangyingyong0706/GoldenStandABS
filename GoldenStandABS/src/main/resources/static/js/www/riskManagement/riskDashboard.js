define(function (require) {
    var $ = require('jquery');
    var GlobalVariable = require('globalVariable');
    var kendoGridModel = require('./CreditRiskCheck/kendoGridModel');
    var common = require('common');
    require("kendomessagescn");
    var GSDialog = require('gs/uiFrame/js/gs-admin-2.pages');
    var echarts = require('echarts');
    $(".container-fluid").height($(window).height());
    $(".container-fluid").css("overflow", "auto");
    var height = $(window).height()/2-30;
    var filter = ' ';
    $(function () {
        $("#chartRoom1,#chartRoom2").height(height);
        initGrid();
        createTypeChart();
        createLimitChart();
        eventBind();
    });
    //资产明细列表
    function initGrid() {
        var kdGridPayment = new kendoGridModel(height);
        var paymentOptions = {
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
                    fileName: "兑付收益情况表.xlsx"
                },
                columns: [
                   {
                       field: "TrustName", title: "资产支持专项计划名称",
                       locked: true,//固定列
                       lockable: false,
                       width: "250px", headerAttributes: { "class": "table-header-cell", style: "text-align: center;vertical-align: middle;" }, attributes: { "class": "table-cell", style: "text-align: center" }
                   },
                   {
                       template: "#=!!DssueScale!=0?(kendo.toString((DssueScale-Math.floor(Math.random()*1000000000+1)),'N2')):''#",
                       field: "DssueScale", title: "发行规模", width: "150px", type: "number", format: "{0:N2}", headerAttributes: { "class": "table-header-cell", style: "text-align: center;vertical-align: middle;" }, attributes: { "class": "table-cell", style: "text-align: center" }
                   },
                   {
                       template: "#=!!PrincipalDistributionScale!=0?(kendo.toString((PrincipalDistributionScale-Math.floor(Math.random()*1000000000+1)),'N2')):''#",
                       field: "PrincipalDistributionScale", title: "兑付本金", type: "number", format: "{0:N2}", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center;vertical-align: middle;" }, attributes: { "class": "table-cell", style: "text-align: center" }
                   },
                   {
                       template: "#=!!SurplusDistributionScale!=0?(kendo.toString((SurplusDistributionScale-Math.floor(Math.random()*1000000000+1)),'N2')):''#",
                       field: "SurplusDistributionScale", title: "对付利息", type: "number", format: "{0:N2}", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center;vertical-align: middle;" }, attributes: { "class": "table-cell", style: "text-align: center" }
                   },
                   {
                       template: "#=!!DistributionProportion!=0?(kendo.toString((DistributionProportion-Math.floor(Math.random()*10+1)),'N2')):''#",
                       field: "DistributionProportion", title: "占比", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center;vertical-align: middle;" }, attributes: { "class": "table-cell", style: "text-align: center" }
                   },
                   { field: "Yield", title: "收益率", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center;vertical-align: middle;" }, attributes: { "class": "table-cell", style: "text-align: center" } }
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
                            SPName: 'usp_GetRisk_TrustPaymentWithPager',
                            SQLParams: [],
                        };
                        return result;
                    }
                }
            }
        };
        kdGridPayment.Init(paymentOptions, 'gridPayment');
        kdGridPayment.RunderGrid();

        var kdGridCashFlow = new kendoGridModel(height);
        var cashFlowOptions = {
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
                    fileName: "现金流统计表.xlsx"
                },
                columns: [
                   {
                       field: "TrustName", title: "资产支持专项计划名称",
                       locked: true,//固定列
                       lockable: false,
                       width: "250px", headerAttributes: { "class": "table-header-cell", style: "text-align: center;vertical-align: middle;" }, attributes: { "class": "table-cell", style: "text-align: center" }
                   },
                   {
                       template: "#=!!SurplusDistributionScale!=0?(kendo.toString((SurplusDistributionScale-Math.floor(Math.random()*1000000000+1)),'N2')):''#",
                       field: "SurplusDistributionScale", title: "证券未还本金", type: "number", format: "{0:N2}", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center;vertical-align: middle;" }, attributes: { "class": "table-cell", style: "text-align: center" }
                   },
                   { field: "ManagementFreeRate", title: "资产池CPB", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center;vertical-align: middle;" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                   {
                       template: "#=!!PrincipalDistributionScale!=0?(kendo.toString((PrincipalDistributionScale-Math.floor(Math.random()*1000000000+1)),'N2')):''#",
                       field: "PrincipalDistributionScale", title: "已回收本金", type: "number", format: "{0:N2}", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center;vertical-align: middle;" }, attributes: { "class": "table-cell", style: "text-align: center" }
                   },
                   {
                       template: "#=!!LiquidationAssetsScale!=0?(kendo.toString((LiquidationAssetsScale-Math.floor(Math.random()*1000000000+1)),'N2')):''#",
                       field: "LiquidationAssetsScale", title: "已回收利息", type: "number", format: "{0:N2}", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center;vertical-align: middle;" }, attributes: { "class": "table-cell", style: "text-align: center" }
                   },
                   { field: "CumulativeOverdueRate", title: "累计违约率", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center;vertical-align: middle;" }, attributes: { "class": "table-cell", style: "text-align: center" } },
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
                            SPName: 'usp_GetRisk_TrustCashFlowWithPager',
                            SQLParams: [],
                        };
                        return result;
                    }
                }
            }
        };
        kdGridPayment.Init(cashFlowOptions, 'gridCashFlow');
        kdGridPayment.RunderGrid();
        $("#loading").css("display", "none");
    }

    function createTypeChart() {
        var TypeChart = echarts.init(document.getElementById("chartRoom1"));
        var dataAxis = ['车贷', '房贷', '消费贷', '对公贷', '票据', '信用卡', '应收账款', '融资融券', '信托受益权'];
        var data = [22, 18, 19, 23, 29, 33, 31, 12, 44];
        var yMax = 50;
        var dataShadow = [];
        for (var i = 0; i < data.length; i++) {
            dataShadow.push(yMax);
        }
        typeOption = {
            grid: {
                top: '3%',
                left: '3%',
                right: '5%',
                bottom: '2%',
                containLabel: true
            },
            xAxis: {
                data: dataAxis,
                axisTick: {
                    show: false
                },
                axisLine: {
                    show: false
                },
                axisLabel: {
                    textStyle: {
                        color: '#999'
                    }
                }
            },
            yAxis: {
                axisLine: {
                    show: false
                },
                axisTick: {
                    show: false
                },
                axisLabel: {
                    textStyle: {
                        color: '#777'
                    }
                }
            },
            dataZoom: [
                {
                    type: 'inside'
                }
            ],
            series: [
                { // For shadow
                    type: 'bar',
                    itemStyle: {
                        normal: { color: 'rgba(0,0,0,0.05)' }
                    },
                    data: dataShadow,
                    animation: false
                },
                {
                    type: 'bar',
                    itemStyle: {
                        normal: {
                            color: new echarts.graphic.LinearGradient(
                                0, 0, 0, 1,
                                [
                                    { offset: 0, color: '#83bff6' },
                                    { offset: 0.5, color: '#188df0' },
                                    { offset: 1, color: '#188df0' }
                                ]
                            )
                        },
                        emphasis: {
                            color: new echarts.graphic.LinearGradient(
                                0, 0, 0, 1,
                                [
                                    { offset: 0, color: '#2378f7' },
                                    { offset: 0.7, color: '#2378f7' },
                                    { offset: 1, color: '#83bff6' }
                                ]
                            )
                        }
                    },
                    barGap: '-100%',
                    barCategoryGap: '60%',
                    data: data
                }
            ]
        };
        TypeChart.setOption(typeOption);
        var zoomSize = 6;
        TypeChart.on('click', function (params) {
            console.log(dataAxis[Math.max(params.dataIndex - zoomSize / 2, 0)]);
            TypeChart.dispatchAction({
                type: 'dataZoom',
                startValue: dataAxis[Math.max(params.dataIndex - zoomSize / 2, 0)],
                endValue: dataAxis[Math.min(params.dataIndex + zoomSize / 2, data.length - 1)]
            });
        });
    }

    function createLimitChart() {
        var LimitChart = echarts.init(document.getElementById("chartRoom2"));
        var dataAxis = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'];
        var data = [22, 18, 19, 23, 29, 33, 31, 12, 44, 32, 9, 14, 21, 12, 13, 33, 19, 12, 12, 22];
        var yMax = 50;
        var dataShadow = [];
        for (var i = 0; i < data.length; i++) {
            dataShadow.push(yMax);
        }
        limitOption = {
            grid: {
                top: '3%',
                left: '3%',
                right: '5%',
                bottom: '2%',
                containLabel: true
            },
            xAxis: {
                name:'个月',
                data: dataAxis,
                axisTick: {
                    show: false
                },
                axisLine: {
                    show: false
                },
                axisLabel: {
                    textStyle: {
                        color: '#777'
                    }
                }
            },
            yAxis: {
                axisLine: {
                    show: false
                },
                axisTick: {
                    show: false
                },
                axisLabel: {
                    textStyle: {
                        color: '#999'
                    }
                }
            },
            dataZoom: [
                {
                    type: 'inside'
                }
            ],
            series: [
                { // For shadow
                    type: 'bar',
                    itemStyle: {
                        normal: { color: 'rgba(0,0,0,0.05)' }
                    },
                    data: dataShadow,
                    animation: false
                },
                {
                    type: 'bar',
                    itemStyle: {
                        normal: {
                            color: new echarts.graphic.LinearGradient(
                                0, 0, 0, 1,
                                [
                                    { offset: 0, color: '#83bff6' },
                                    { offset: 0.5, color: '#188df0' },
                                    { offset: 1, color: '#188df0' }
                                ]
                            )
                        },
                        emphasis: {
                            color: new echarts.graphic.LinearGradient(
                                0, 0, 0, 1,
                                [
                                    { offset: 0, color: '#2378f7' },
                                    { offset: 0.7, color: '#2378f7' },
                                    { offset: 1, color: '#83bff6' }
                                ]
                            )
                        }
                    },
                    barGap: '-100%',
                    barCategoryGap: '50%',
                    data: data
                }
            ]
        };
        LimitChart.setOption(limitOption);
        var zoomSize = 6;
        LimitChart.on('click', function (params) {
            console.log(dataAxis[Math.max(params.dataIndex - zoomSize / 2, 0)]);
            LimitChart.dispatchAction({
                type: 'dataZoom',
                startValue: dataAxis[Math.max(params.dataIndex - zoomSize / 2, 0)],
                endValue: dataAxis[Math.min(params.dataIndex + zoomSize / 2, data.length - 1)]
            });
        });
    }

    function eventBind() {
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
