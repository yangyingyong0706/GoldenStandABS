define(function (require) {
    var $ = require('jquery');
    var kendoGrid = require('kendo.all.min');
    require('gs/globalVariable');
    var GSAdmin = require('gs/uiFrame/js/gs-admin-2');
    require('app/components/trustList/js/wcfProxy');
    require("kendomessagescn");
    require("kendoculturezhCN");
    var highstock = require('highstock');
    require('highstockexporting');
    var GSDialog = require('gs/uiFrame/js/gs-admin-2.pages');
    var tm = require('gs/childTabModel');
    var webStorage = require("gs/webStorage");
    var common = require('common');
    webProxy = require('gs/webProxy');
    require('jquery.localizationTool');
    var Vue = require('Vue2');
    require('date_input');
    var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";

    $('#selectLanguageDropdown_qcl').localizationTool({
        'defaultLanguage': 'zh_CN', // this is the language that the server is sending anyway
        'ignoreUnmatchedSelectors': true,
        'showFlag': true,
        'showCountry': false,
        'showLanguage': true,
        'onLanguageSelected': function (languageCode) {
            /*
             * When the user translates we set the cookie
             */
            webStorage.setItem('userLanguage', languageCode);
            return true;
        },

        /* 
         * Translate the strings that appear in all the pages below
         */
        'strings': {
            'id:select1': {
                'en_GB': 'Continuing Report'
            },
            'id:select2': {
                'en_GB': 'office automation'
            },
            'id:select3': {
                'en_GB': 'Income distribution and results'
            },

            'id:select4': {
                'en_GB': 'Special plan management'
            }
        }
    });


    var userLanguage = webStorage.getItem('userLanguage');
    if (userLanguage) {
        $('#selectLanguageDropdown_qcl').localizationTool('translate', userLanguage);
    }

    var lang = {};
    var userLanguage = webStorage.getItem('userLanguage');
    var IsAdministrator = webStorage.getItem("IsAdministrator");//判断用户是否为管理员
    if (userLanguage && userLanguage.indexOf('en') > -1) {
        lang.handle = 'handle';
    }
    else {
        lang.handle = '操作';
    }
    var app = new Vue({
        el: '#app',
        data: {
            loading: true,
            curIndex: 0,
            filterOr: false,
            filterData: {
                Trust: [],
                ReportingDate: []
            },
            filterModelReportingDateId: '',
            filterModelTrustCode: '',
            allData: [],
            trustStatistics: [],
            distributions: [],
            columsLabel: [], //动态列表名
            AllColumns: [
                { Name: "Count", DisplayName: "笔数", Type: "int" },
                { Name: "CountPercentage", DisplayName: "笔数占比(%)", Type: "percent" },
                { Name: "Amount", DisplayName: "剩余本金金额", Type: "decimal" },
                { Name: "AmountPercentage", DisplayName: "剩余本金金额占比(%)", Type: "percent" },
                { Name: "ApprovalAmount", DisplayName: "合同金额", Type: "decimal" },
                { Name: "ApprovalAmountPercentage", DisplayName: "合同金额占比(%)", Type: "decimal" },
            ],
            ColumnSuffix: {
                Count: { legend: '笔数', title: '笔数', unit: '笔' },
                CountPercentage: { legend: '笔数占比（%）', title: '笔数占比（%）', unit: '%' },
                Amount: { legend: '剩余本金金额', title: '剩余本金金额', unit: '元' },
                AmountPercentage: { legend: '剩余本金金额占比（%）', title: '剩余本金金额占比（%）', unit: '%' },
                ApprovalAmount: { legend: '合同金额', title: '余额（元）', unit: '元' },
                ApprovalAmountPercentage: { legend: '合同金额占比(%)', title: '余额（元）', unit: '元' }
            },
            allReportingDate: []
        },
        watch: {
            filterModelReportingDateId: function (now) {
                if (now) {
                    var self = this;
                    var executeParam = {
                        'SPName': "dbo.usp_AssetTypeGetCascade1", 'SQLParams': [
                            { Name: 'TrustCode', Value: '', DBType: 'string' },
                            { Name: 'sliceDate', Value: self.filterModelReportingDateId, DBType: 'string' },
                            { Name: 'Type', Value: 'SliceDate', DBType: 'string' },
                        ]
                    };
                    common.ExecuteGetData(true, svcUrl, 'AssetDataCenterManagement', executeParam, function (data) {
                        self.filterData.Trust = data[0];
                        self.filterData.ReportingDate = [{ SliceDate: now }];
                    })
                } 
            }
            //filterModelTrustCode: function (now) {
            //    //if (now) {
            //    var self = this;
            //    var executeParam = {
            //        'SPName': "dbo.usp_AssetTypeGetCascade1", 'SQLParams': [
            //             { Name: 'TrustCode', Value: self.filterModelTrustCode, DBType: 'string' },
            //            { Name: 'sliceDate', Value: self.filterModelReportingDateId, DBType: 'string' },
            //            { Name: 'Type', Value: 'TrustCode', DBType: 'string' },
            //        ]
            //    };
            //    common.ExecuteGetData(true, svcUrl, 'AssetDataCenterManagement', executeParam, function (data) {
            //        self.filterData.OrganisationCode = data[2];
            //        self.filterData.AssetType = data[1];
            //        self.filterData.DataSource = data[3];
            //    })
            //}
        },
        methods: {
            //显示筛选框
            searchShow: function () {
                this.filterOr = !this.filterOr
            },
            //清除筛选条件
            clearFilter: function () {
                this.filterModelOrganisationCodeDefault = null;
                window.location.reload()
            },
            //筛选 重新获取数据
            dataFilter: function () {
                var self = this;
                this.filterOr = false;
                if (!self.filterModelReportingDateId) {
                    GSDialog.HintWindow('请选择日期');
                    return;
                } else if (self.filterModelReportingDateId && !self.filterModelTrustCode) {
                    GSDialog.HintWindow('请选择日期+产品');
                    return;
                } 
                this.getTrustDistribution();
                this.loading = false;
            },
            //获取产品
            GetTrust: function () {
                var self = this;
                var executeParam = {
                    'SPName': "dbo.usp_GetTrust", 'SQLParams': []
                };
                common.ExecuteGetData(true, svcUrl, 'AssetDataCenterManagement', executeParam, function (data) {
                    self.filterData.Trust = data
                })
            },
            //获取切片日期
            getReportingDate: function () {
                var self = this;
                if (self.filterModelReportingDateId) {
                    self.filterData.ReportingDate.push({ SliceDate: self.filterModelReportingDateId });
                } else {
                    var executeParam = {
                        'SPName': "dbo.usp_GetReportingDate", 'SQLParams': []
                    };
                    common.ExecuteGetData(true, svcUrl, 'AssetDataCenterManagement', executeParam, function (data) {
                        self.filterData.ReportingDate = [];
                        self.allReportingDate = [];
                        $.each(data, function (i, v) {
                            self.filterData.ReportingDate.push({ SliceDate: self.DateFormat(v.SliceDate) });
                            self.allReportingDate.push({ SliceDate: self.DateFormat(v.SliceDate) })
                        })
                    });
                }
            },
            //转换时间戳
            DateFormat: function (val) {
                if (val) {
                    var date = new Date(parseInt(val.replace("/Date(", "").replace(")/", ""), 10));
                    var month = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;
                    var currentDate = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
                    if (date.getFullYear() != '' && month != '' && currentDate != '') {
                        return date.getFullYear() + "-" + month + "-" + currentDate;
                    }
                }
                return "";
            },
            //获取筛选数据
            GetFilterData: function () {
                var self = this;
                self.GetTrust()
                self.getReportingDate()
            },
            //底层资产维度分析
            getTrustDistribution: function () {
                var self = this;
                var executeParam = {
                    SPName: "Analysis.usp_GetAssetDistributions", SQLParams: [
                        { Name: 'TrustCode', Value: self.filterModelTrustCode ? self.filterModelTrustCode : null, DBType: 'string' },
                        { Name: 'ReportingDate', Value: self.filterModelReportingDateId, DBType: 'string' },
                        { Name: 'DataSourceID', Value: self.filterModelDataSource ? self.filterModelDataSource : null, DBType: 'int' },
                        { Name: 'OrganisationID', Value: self.filterModelOrganisationId ? self.filterModelOrganisationId : (self.filterModelDataSource == '' && self.filterModelAssetType == '') ? self.filterModelOrganisationCodeDefault : null, DBType: 'int' },
                        { Name: 'AssetType', Value: self.filterModelAssetType ? self.filterModelAssetType : null, DBType: 'string' }
                    ]
                };
                common.ExecuteGetData(true, svcUrl, 'AssetDataCenterManagement', executeParam, function (data) {
                    $.each(data, function (i, v) {
                        $.each(v, function (j, n) {
                            if (j == 'Bucket') {
                                data[i]['Bucket'] = data[i]['Bucket'].replace(/[0]{4}[^0,.,\,,\],，,\)]/g, '');
                                data[i]['Bucket'] = data[i]['Bucket'].replace(/[0]{4}$/, '');
                                data[i]['Bucket'] = data[i]['Bucket'].replace(/[0]{4}\,/, ', ');
                                data[i]['Bucket'] = data[i]['Bucket'].replace(/[0]{4}\]/, ']');
                                data[i]['Bucket'] = data[i]['Bucket'].replace(/[0]{4}，/, ', ');
                                data[i]['Bucket'] = data[i]['Bucket'].replace(/[0]{4}\)/, ')');
                            }
                        })
                    })
                    self.distributions = [];
                    self.allData = data;
                    var obj = {};
                    $.each(data, function (i, v) {
                        if (!obj[v.DistributionType]) {
                            self.distributions.push({
                                name: v.DistributionType,
                                nameAlias: v.DistributionDesc,
                                chartName: v.DistributionType + 'Chart'
                            });
                            obj[v.DistributionType] = 1;
                        }
                    })
                    Vue.nextTick(function () {
                        $.each(self.distributions, function (i, distribution) {
                            var items = $.grep(data, function (item) { return item.DistributionType == distribution.name });
                            self.renderGrid(distribution.name, items);
                            self.renderPieCharts(distribution.name, items);
                        });
                    })

                })
            },
            //底层资产维度分析表格
            renderGrid: function (cType, cData) {
                var self = this;
                $("#" + cType).height('350px');
                $("#" + cType).empty().kendoGrid({
                    dataSource: {
                        data: cData,
                        schema: {
                            model: {
                                fields: {
                                    Bucket: { type: "string" },
                                    Count: { type: "number" },
                                    CountPercentage: { type: "number" },
                                    Amount: { type: "number" },
                                    AmountPercentage: { type: 'number' },
                                    ApprovalAmount: { type: "number" },
                                    ApprovalAmountPercentage: { type: 'number' }
                                }
                            }
                        }

                    },
                    height: 350,
                    scrollable: true,
                    sortable: true,
                    resizable: true,
                    filterable: false,
                    pageable: false,
                    columns: self.getColumnsByType(self.columsLabel)
                });
                $('.k-grid-content.k-auto-scrollable').height(313);
            },
            //底层资产维度分析饼图
            renderPieCharts: function (cType, cData) {
                var self = this;
                var chart = null;

                //生成饼图所需数据
                var title = "<span style='font-size:8px'>{0}元</span><br />合计";
                var xData = [];
                var amount = 0;
                $.each(cData, function (n, item) {
                    if (item.Bucket != "合计") {
                        amount = amount + parseFloat(item.Amount);
                        var objItem = new Object();
                        //objItem = item;
                        //objItem.Title = DimTypeDescNames[chartName];
                        objItem.name = item.Bucket;
                        objItem.y = parseFloat(item.Amount);
                        xData.push(objItem);
                    }
                });

                $('#' + cType + 'Chart').html("");
                if (xData.length > 0) {
                    $('#' + cType + 'Chart').highcharts({
                        chart: {
                            plotBackgroundColor: null,
                            plotBorderWidth: false,
                            plotShadow: false,
                            height: 350,
                            width: 250,
                            spacing: [-5, 0, 0, 48],
                            marginLeft: 20,
                            marginRight: 14
                        },
                        credits: {
                            enabled: false
                        },
                        exporting: { enabled: false },
                        title: {
                            floating: true,
                            text: title.format(amount.toFixed(2)),

                            style: { fontSize: '12px', paddingRight: '10px!important' }

                        },
                        tooltip: {
                            useHTML: true,
                            headerFormat: self.generateHeaderText(cType),
                            pointFormat: self.generateTooltipText(cType),
                            style: { fontSize: '12px' }
                        },
                        plotOptions: {
                            pie: {
                                allowPointSelect: true,
                                cursor: 'pointer',
                                dataLabels: {
                                    enabled: false
                                },
                                showInLegend: true
                            }
                        },
                        legend: {
                            width: 300,
                            itemWidth: 140,
                            itemStyle: {
                                "overflow": "hidden",
                                "color": "#808080",
                                "fill": "#808080"
                            }
                        },
                        //colors: ['#7cb5ec',  '#90ed7d', '#f7a35c', '#8085e9', '#f15c80', '#e4d354', '#8085e8', '#8d4653', '#91e8e1'], 
                        colors: ['#4381BE', '#ace3ff', '#E97F35', '#7BC04B', '#424F93', '#DC352F', '#FFCD3A', '#5EB646', '#B7669E', '#DF4A2A', '#AFD54C', '#80C7C9'],
                        //colors: ['#4381BE', '#424F93', '#B7669E', '#E03373', '#E97F35', '#7BC04B', '#DC352F', '#FFCD3A', '#5EB646', '#B7669E', '#DF4A2A', '#AFD54C', '#80C7C9'],
                        series: [{
                            type: 'pie',
                            innerSize: '60%',
                            data: xData
                        }]

                    }, function (c) {
                        // 环形图圆心
                        var centerY = c.series[0].center[1],
                            titleHeight = parseInt(c.title.styles.fontSize);
                        c.setTitle({
                            y: centerY + titleHeight / 2 - 12,
                            x: -20
                        });
                        chart = c;
                    });
                }
            },
            //渲染底层资产现金流图
            renderColumnCharts: function (cData) {
                var self = this;
                var chart = null;

                var xData = [];
                var pData = [];
                var iData = [];

                $.each(cData, function (n, item) {
                    xData.push(common.getStringDate(item.endDate).dateFormat("yyyy-MM-dd"));
                    pData.push(item.PrincipalDue);
                    iData.push(item.InterestDue);
                });
                var widthChart = $(document).width() - 100;
                $('#cashflowChart').width(widthChart);
                $('#cashflowChart').html("");
                if (xData.length > 0) {
                    $('#cashflowChart').highcharts({
                        chart: {
                            type: 'column'
                        },
                        title: {
                            useHTML: true,
                            text: "<div style='height:20px'></div>",

                        },
                        credits: {
                            enabled: false
                        },
                        xAxis: {
                            categories: xData,
                            //min: 0,
                            //max: 15,
                            plotLines: [{
                                value: self.getDateIndex(xData, (new Date()).dateFormat("yyyy-MM-dd")),
                                width: 1,
                                color: 'red',
                                zIndex: 99,
                                label: {
                                    text: 'Today ' + (new Date()).dateFormat("yyyy-MM-dd")
                                }
                            }],
                        },
                        scrollbar: {
                            enabled: xData.length > 16 ? true : false
                        },
                        exporting: { enabled: false },
                        tooltip: {
                            shared: true,
                            style: { fontSize: '12px' }
                        },
                        plotOptions: {
                            column: {
                                stacking: 'normal',
                                dataLabels: {
                                    enabled: false,
                                }
                            }
                        },
                        legend: {
                            width: 300,
                            itemWidth: 140
                        },
                        yAxis: {
                            title: {
                                text: '金额（元）',
                                align: 'high',
                                offset: -10,
                                rotation: 0,
                                y: -20
                            }
                        },
                        colors: ["rgba(69,86,156,1)", 'rgba(69,86,156,0.7)'],
                        series: [{
                            name: '利息',
                            data: iData
                        },
                        {
                            name: '本金',
                            data: pData
                        }
                        ]

                    });
                }
            },
            //底层资产维度分析饼图HeaderText
            generateHeaderText: function (type) {
                return "<table><tr><td style='width:65%'>" + "分布" + ": </td><td style='width:35%'>{point.key}</td><tr/>";
            },
            //底层资产维度分析饼图TooltipText
            generateTooltipText: function (type) {
                var tooltipText = "";
                tooltipText += "<tr><td>金额: </td><td>{point.y}</td><tr/>";
                tooltipText += "</table>";
                return tooltipText;
            },
            getDateIndex: function (list, cDate) {
                let jIndex = 0;
                let cDateInt = parseInt(cDate.substr(0, 4) + cDate.substr(5, 2) + cDate.substr(8, 2));
                for (let j = 0; j < list.length; j++) {
                    let jDateInt = parseInt(list[j].substr(0, 4) + list[j].substr(5, 2) + list[j].substr(8, 2));
                    if (jDateInt <= cDateInt) jIndex = jIndex + 1;
                }

                let jDown = 0;
                if (list.indexOf(cDate) < 0) {
                    jDown = parseFloat((parseInt(cDate.substr(8, 2)) / 31).toFixed(2));
                }

                return jIndex + jDown - 1;
            },
            filterBoxHide: function () {
                var self = this;
                $(document).bind("click", function (e) {
                    var target = $(e.target);
                    if (target.closest(".filter_box").length == 0 && target.closest(".seachShow").length == 0) {
                        self.filterOr = false;
                    }
                    if (target.closest(".d_popup").length == 0 && target.closest(".editChart").length == 0) {
                        $('.d_popup').hide()
                    }
                })
            },
            //动态生成折柱混合图
            generateColumnChart: function (chartName, cParameter) {
                var self = this;
                //动态生成图表数据
                var xData = [];
                var y1Data = [];
                var y2Data = [];
                var chartData = $.grep(self.allData, function (citem) { return citem.DistributionType == chartName.replace('Chart', '') });
                $.each(chartData, function (n, item) {
                    if (item.Bucket == "合计") {
                        return true;
                    }
                    xData.push(item.Bucket);
                    if (cParameter.Secondary.Name == "0") {
                        //var y1Item = cloneObj(item);
                        var y1Item = item;
                        y1Item.y = y1Item[cParameter.Primary.Name];
                        y1Data.push(y1Item);
                    }
                    else {

                        //var y1Item = cloneObj(item);
                        var y1Item = item;
                        y1Item.y = y1Item[cParameter.Primary.Name];
                        y1Data.push(y1Item);

                        //var y2Item = cloneObj(item);
                        var y2Item = item;
                        y2Item.y = y2Item[cParameter.Secondary.Name];
                        y2Data.push(y2Item);
                    }
                });

                var series = [];
                var yAxisArr = [];
                if (cParameter.Secondary.Name == "0") {
                    var series0 =
                    {
                        name: self.ColumnSuffix[cParameter.Primary.Name].legend,
                        type: cParameter.Primary.Type,
                        yAxis: 0,
                        data: y1Data,
                        color: '#1B94E8'
                    };
                    series.push(series0);

                    var yAxis0 = {
                        labels: {
                            format: '{value}',
                            style: {
                                color: '#1B94E8'
                            }
                        },
                        title: {
                            text: ''
                        },
                    };
                    yAxisArr.push(yAxis0);
                }
                else {
                    var series1 =
                     {
                         name: self.ColumnSuffix[cParameter.Primary.Name].legend,
                         type: cParameter.Primary.Type,
                         yAxis: 0,
                         data: y1Data,
                         color: '#1B94E8'
                     };
                    series.push(series1);
                    var series2 =
                     {
                         name: self.ColumnSuffix[cParameter.Secondary.Name].legend,
                         type: cParameter.Secondary.Type,
                         data: y2Data,
                         yAxis: 1,
                         color: Highcharts.getOptions().colors[3]

                     };
                    series.push(series2);

                    var yAxis1 = {
                        labels: {
                            format: '{value}',
                            style: {
                                color: '#1B94E8'
                            }
                        },
                        title: {
                            text: ''
                        },
                    };
                    yAxisArr.push(yAxis1);
                    var yAxis2 = {
                        labels: {
                            format: '{value}',
                            style: {
                                color: Highcharts.getOptions().colors[1]
                            }
                        },
                        title: {
                            text: ''
                        },
                        opposite: true
                    };
                    yAxisArr.push(yAxis2);
                }

                $('#' + chartName).html("");
                $('#' + chartName).highcharts({
                    chart: {
                        zoomType: 'xy'
                    },
                    title: {
                        useHTML: true,
                        text: "<div style='height:10px'><div>"
                    },
                    credits: {
                        enabled: false
                    },
                    exporting: { enabled: false },
                    xAxis: [{
                        categories: xData,
                        crosshair: true
                    }],
                    yAxis: yAxisArr,
                    tooltip: {
                        useHTML: true,
                        headerFormat: self.generateHeaderText(chartName.replace('Chart', '')),
                        pointFormat: self.generateTooltipText(chartName.replace('Chart', '')),
                        style: { fontSize: '12px' }
                    },
                    legend: {
                        enable: true,
                        itemStyle: {
                            cursor: 'pointer',
                            fontWeight: 'normal'
                        },
                        width: 300,
                        itemWidth: 140
                    },
                    plotOptions: {
                        series: {
                            marker: {
                                enabled: false
                            }
                        },
                    },
                    series: series
                });
            },
            //动态生成饼状图
            generatePieChart: function (chartName, fieldName) {
                var self = this;
                var chart = null;
                var items = $.grep(self.allData, function (item) { return item.DistributionType == chartName.replace('Chart', '') });

                //生成饼图所需数据
                var title = "<span style='font-size:8px'>{0}{1}</span><br />合计";
                var xData = [];
                var amount = 0;
                $.each(items, function (n, item) {
                    if (item.Bucket != "合计") {
                        amount = amount + parseFloat(item[fieldName]);
                    }
                    var objItem = new Object();
                    objItem = item;
                    //objItem.Title = DimTypeDescNames[chartName];
                    objItem.name = item.Bucket;
                    objItem.y = item[fieldName];
                    xData.push(objItem);
                });

                $('#' + chartName).html("");
                if (xData.length > 0) {
                    $('#' + chartName).highcharts({
                        chart: {
                            plotBackgroundColor: null,
                            plotBorderWidth: false,
                            plotShadow: false,
                            height: 400,
                            width: 250,
                            spacing: [-5, 0, 0, 48],
                            marginLeft: 20,
                            marginRight: 14
                        },
                        credits: {
                            enabled: false
                        },
                        exporting: { enabled: false },
                        title: {
                            floating: true,
                            text: title.format(amount.toFixed(2), self.ColumnSuffix[fieldName].unit),
                            style: { fontSize: '12px', paddingRight: '10px!important' }

                        },
                        tooltip: {
                            useHTML: true,
                            headerFormat: self.generateHeaderText(chartName.replace('Chart', '')),
                            pointFormat: self.generateTooltipText(chartName.replace('Chart', '')),
                            style: { fontSize: '12px' }
                        },
                        plotOptions: {
                            pie: {
                                allowPointSelect: true,
                                cursor: 'pointer',
                                dataLabels: {
                                    enabled: false
                                },
                                showInLegend: true
                            }
                        },
                        legend: {
                            width: 300,
                            itemWidth: 140
                        },
                        colors: ['#4381BE', '#ace3ff', '#E97F35', '#7BC04B', '#424F93', '#DC352F', '#FFCD3A', '#5EB646', '#B7669E', '#DF4A2A', '#AFD54C', '#80C7C9'],
                        series: [{
                            type: 'pie',
                            innerSize: '60%',
                            data: xData
                        }]

                    }, function (c) {
                        // 环形图圆心
                        var centerY = c.series[0].center[1],
                            titleHeight = parseInt(c.title.styles.fontSize);
                        c.setTitle({
                            y: centerY + titleHeight / 2 - 12,
                            x: -20
                        });
                        chart = c;
                    });
                }

            },
            //展开表格
            gridSpread: function (event) {
                var $target = $(event.target);
                if ($target.text() == '展开') {
                    $target.text('合并');
                    var parents = $target.parent().parent();
                    parents.next().hide();
                    parents.width('calc(100% - 15px)');
                } else {
                    $target.text('展开');
                    var parents = $target.parent().parent();
                    parents.next().show();
                    parents.width('calc(100% - 316px)');
                }
            },
            //下载图表
            downloadChart: function (event) {
                var $target = $(event.target);
                //var chart = $('#' + currentDimType + 'Chart').highcharts();
                var chart = $target.parent().next().highcharts();
                chart.exportChart({
                    exportFormat: 'PNG'
                });
            },
            //获取动态列
            getColumnsByType: function (type) {

                var self = this;
                var columns = [];
                var allColums = [
                    { field: "Bucket", title: '分布', width: "180px", attributes: { "class": "table-cell", style: "text-align: left" } },
                    { field: "Count", title: '笔数', width: "150px", format: '{0:n0}', attributes: { "class": "table-cell", style: "text-align: left" } },
                    { field: "CountPercentage", title: '笔数占比(%)', width: "150px", format: '{0:n2}', attributes: { "class": "table-cell", style: "text-align: left" } },
                    { field: "Amount", title: '剩余本金金额', width: "150px", format: '{0:n}', attributes: { "class": "table-cell", style: "text-align: left" } },
                    { field: "AmountPercentage", title: '剩余本金金额占比(%)', width: "150px", format: '{0:n2}', attributes: { "class": "table-cell", style: "text-align: left" } },
                    { field: "ApprovalAmount", title: '合同金额', width: "150px", format: '{0:n}', attributes: { "class": "table-cell", style: "text-align: left" } },
                    { field: "ApprovalAmountPercentage", title: '合同金额占比(%)', width: "150px", format: '{0:n2}', attributes: { "class": "table-cell", style: "text-align: left" } }
                ];
                if (type.length == 0) {
                    columns = allColums;
                } else {
                    $.each(allColums, function (index, item) {
                        $.each(self.columsLabel, function (i, n) {
                            if (item.title == n) {
                                columns.push(item)
                            }
                        })
                    })
                }

                return columns;
            },
            //展示字段选择框
            showFieldsSelect: function (event) {
                //根据当前缓存选择已选字段
                var currentDimType = $(event.target).parent().next().attr("id");
                $('#columsSelect' + currentDimType + " .btnSaveFields").attr("codename", currentDimType);
                $.anyDialog({
                    modal: true,
                    closeText: "",
                    html: $('#columsSelect' + currentDimType).show(),
                    height: 240,
                    width: 500,
                    onClose: function (event, ui) {

                    },
                    onSuccess: function (event, ui) {

                    },
                    title: "选择字段"
                });
            },
            //表格选择字段重置
            btnReset: function () {
                var nowCheckbox = $(event.target).parent().prev().find('input[type=checkbox]');
                nowCheckbox.removeAttr("checked");
            },
            //表格选择字段确定
            btnSaveField: function (event) {
                var self = this;
                var dim = $(event.target).attr("codename");
                if ($("#columsSelect" + dim + " .showDivFields input:checked").length < 1) {
                    $("#columsSelect" + dim + " .btnGroup .tips").css('display', 'inline-block');
                    return false;
                }
                else if ($("#columsSelect" + dim + " .showDivFields input:checked").length > 0) {
                    $("#columsSelect" + dim + " .btnGroup .tips").css('display', 'none');
                }

                var cols = ['分布'];
                $("#columsSelect" + dim + " .showDivFields input:checked").each(function () {
                    var name = $(this).next().text();
                    cols.push(name);
                });
                self.columsLabel = cols;
                $('#modal-close').trigger('click');
                var items = $.grep(self.allData, function (item) { return item.DistributionType == dim });
                self.renderGrid(dim, items);
            },
            //点击chart编辑按钮
            editChart: function (event) {
                event.stopPropagation();
                var a = event.pageY + 21 + 'px';
                event.stopPropagation();
                $(".popup").css({ "display": "block" });
                event.stopPropagation();
                $(".d_popup").css({ "display": "block", "top": a, "right": "35px" });
                var currentDimType = $(event.target).parent().next().attr("id");

                $("#chartSave").attr("codename", currentDimType);
            },
            //取消chart编辑
            chartCancel: function () {
                $(".d_popup").hide();
                $(".popup").hide();
            },
            //chart编辑确定
            chartSave: function (event) {
                var self = this;
                var dim = $(event.target).attr("codename");
                var chartType = "";
                if (self.curIndex == 1) {
                    chartType = "pie";
                }
                else {
                    chartType = "column";
                }

                if (chartType == "column") {
                    var priName = $("#primarySelect").val();
                    if (priName == "0") {
                        GSDialog.HintWindow("请至少选择一组数据！");
                        return;
                    }
                    var priType = $('input:radio[name="z"]:checked').val();
                    var secName = $("#secondarySelect").val();
                    var secType = $('input:radio[name="c"]:checked').val();
                    var ChartParameter = { Primary: { Name: priName, Type: priType }, Secondary: { Name: secName, Type: secType } };
                    self.generateColumnChart(dim, ChartParameter);
                }
                else {
                    var pieName = $("#pieSelect").val();
                    if (pieName == "0") {
                        GSDialog.HintWindow("请至少选择一组数据！");
                        return;
                    }
                    self.generatePieChart(dim, pieName);
                }
                $(".d_popup").css({ "display": "none" });
                $(".popup").css({ "display": "none" });
            },
            //填充下拉框
            addSelect: function (ead, selectId) {
                for (var j = 0; j < ead.length; j++) {
                    col_add(ead[j].Name, ead[j].DisplayName, $("#" + selectId))
                    function col_add(a, b, className) {
                        var selObj = className;
                        var value = a;
                        var text = b;
                        selObj.append("<option value='" + value + "'>" + text + "</option>");
                    }
                }
            }
        },
        mounted: function () {
            var self = this;
            self.filterBoxHide();
            Vue.nextTick(function () {
                $('.date-plugins').date_input();
                self.addSelect(self.AllColumns, "primarySelect");
                self.addSelect(self.AllColumns, "secondarySelect");
                self.addSelect(self.AllColumns, "pieSelect");
            })
            self.GetFilterData();
            this.loading = false;
            
        }
    })
})