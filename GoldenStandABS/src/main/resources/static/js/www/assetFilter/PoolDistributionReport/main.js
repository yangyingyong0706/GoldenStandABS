var viewModel = {};
define(function (require) {
    var $ = require('jquery');
    require('jquery-ui');
    var util = require('gs/gsUtil');
    var common = require('common')
    var webProxy = require('gs/webProxy');
    var Vue = require('Vue2');
    var ssasUrl = webProxy.baseUrl + "/OLAP/msmdpump.dll";
    var poolHeader;
    var poolId = util.getURLParameter("PoolId");
    var catalog = '';//"Job_2_20151231_40238";
    var cube = "Base Pool"//"SFM DAL AUTO";
    var GlobalVariable = require('globalVariable');
    var CallApi = require("callApi");
    require('devExtreme.dx.all');
    var vm = new Vue({ //c_:current表示当前
        el: '#app',
        data: {
            currentPool: {},
            poolList: [], //起始日期下拉数据源
            PoolDistributionList: [], //动态获取的配置信息
            optionList: [],
            off: false,
            offall: true,
            nowShowDistribution: 'Fact',
            poolIds: [],
            poolDBName: 'Job',
            isShowInitialCollteral: true//控制抵押率是否显示
        },
        mounted: function () {
            var self = this;
            self.reloadPoolHeader();
        },
        watch: {
            nowShowDistribution: function (now) {
                this.reloadPoolHeader();
            }
        },
        methods: {
            getPoolIds: function () {
                var self = this;
                var svcUrl = webProxy.dataProcessServiceUrl + "CommonGetExecute?connConfig=DAL_SEC_PoolConfig&appDomain=config&executeParams=";
                var params = [
                    ['PoolId', poolId, 'int']
                ];

                var promise = webProxy.comGetData(params, svcUrl, 'usp_GetPoolHeaderById');
                promise().then(function (response) {
                    if (typeof response === 'string') { poolHeader = JSON.parse(response); }
                    else { poolHeader = response; }
                });
                catalog = poolHeader[0].PoolDBName;
                var Url = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecuteForPool?poolname=' + catalog + '&appDomain=dbo&executeParams=';
                var callApi = new CallApi('CreditFactory', 'dbo.usp_GetPoolId', true);
                var results = callApi.comGetData("", Url, 'usp_GetPoolId');
                results().then(function (response) {

                    if (typeof response === 'string') {
                        self.poolIds = JSON.parse(response);
                    } else { self.poolIds = response; }

                });
            },
            showUI: function () {
                var self = this;
                self.off = !self.off;
            },
            //下载内容
            downloadSeach: function () {
                var self = this;
                var serviceUrl = GlobalVariable.CommonServicesUrl + 'ExportDataPoolToExcel';
                var objParam = { SPName: 'dbo.usp_GetDistributionDownload', SQLParams: [{ Name: 'PoolId', Value: poolId, DBType: 'int' }, { Name: 'Type', Value: self.nowShowDistribution, DBType: 'string' }] };
                var strParam = encodeURIComponent(JSON.stringify(objParam));
                var obj = { connectionName: self.poolDBName, param: strParam, excelName: "Pool", sheetName: '分布统计' };

                var tempform = document.createElement("form");
                tempform.action = serviceUrl;
                tempform.method = "post";
                tempform.style.display = "none";
                for (var x in obj) {
                    var opt = document.createElement("input");
                    opt.name = x;
                    opt.value = obj[x];
                    tempform.appendChild(opt);
                }

                var opt = document.createElement("input");
                opt.type = "submit";
                tempform.appendChild(opt);
                document.body.appendChild(tempform);
                tempform.submit();
                document.body.removeChild(tempform);
            },
            changeShowDistribution: function (e) {
                var DistributionName = e.target.innerText;
                if (DistributionName === '区间分布') {
                    $('.btn-group').find('.btn-default').eq(0).addClass('active');
                    $('.btn-group').find('.btn-default').eq(1).removeClass('active');
                    $("#downloadSeach").html("<i class='dx-icon dx-icon-exportxlsx'></i>区间分布导出")
                    this.nowShowDistribution = 'Fact';
                } else if (DistributionName === '枚举分布') {
                    $('.btn-group').find('.btn-default').eq(1).addClass('active');
                    $('.btn-group').find('.btn-default').eq(0).removeClass('active');
                    $("#downloadSeach").html("<i class='dx-icon dx-icon-exportxlsx'></i>枚举分布导出")
                    this.nowShowDistribution = 'Dim';
                }
            },
            generateReport: function (poolid) {
                poolId = poolid;
                var self = this;
                self.reloadPoolHeader();
            },
            addClass: function (index) {
                if (index == "0") {
                    return "ui-state-default ui-corner-top ui-tabs-active ui-state-active"
                } else {
                    return "ui-state-default ui-corner-top"
                }
            },
            addItem: function (index) {
                var self = this;
                self.PoolDistributionList.push(self.optionList[index]);
                self.optionList.splice(index, 1);
                if (self.optionList.length == 0) {
                    self.offall = false;
                }
            },
            changeTab: function ($event, index) {
                var self = this;
                var index = index;
                var id = self.PoolDistributionList[index].DistributionTypeID
                var target = $event.target;
                $(target).parent().addClass('ui-tabs-active ui-state-active');
                $(target).parent().siblings().removeClass('ui-tabs-active ui-state-active');
                $("#tabs-" + id).show();
                $("#tabs>div").not("#tabs-" + id).hide();
                if (self.PoolDistributionList[index].DistributionTypeCode == "career" || self.PoolDistributionList[index].DistributionTypeCode == "address" || self.PoolDistributionList[index].DistributionTypeCode == "gradeLevel" || self.PoolDistributionList[index].DistributionTypeCode == "credit") {
                    showDistributionEX(ssasUrl, catalog, cube, self.PoolDistributionList[index].DistributionTypeCode, self.PoolDistributionList[index].dimenstion, self.PoolDistributionList[index].DistributionTypeName)
                } else {
                    showDistribution(self.PoolDistributionList[index].DistributionTypeID, catalog, poolId, self.PoolDistributionList[index].DistributionTypeCode, self.PoolDistributionList[index].DistributionTypeName, self.nowShowDistribution);
                }

            },
            reloadPoolHeader: function () {
                var self = this;
                self.PoolDistributionList = [];
                var svcUrl = webProxy.dataProcessServiceUrl + "CommonGetExecute?connConfig=DAL_SEC_PoolConfig&appDomain=config&executeParams=";
                var params = [
                    ['PoolId', poolId, 'int']
                ];

                var promise = webProxy.comGetData(params, svcUrl, 'usp_GetPoolHeaderById');
                promise().then(function (response) {
                    if (typeof response === 'string') { poolHeader = JSON.parse(response); }
                    else { poolHeader = response; }
                });
                catalog = poolHeader[0].PoolDBName;
                self.poolDBName = poolHeader[0].PoolDBName;
                var Url = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecuteForPool?poolname=' + catalog + '&appDomain=dbo&executeParams=';
                var callApi = new CallApi('CreditFactory', 'dbo.usp_GetDistributionConfig', true);
                var results = callApi.comGetData("", Url, 'usp_GetStatisticalDistributions');
                results().then(function (response) {
                    if (typeof response === 'string') {
                        var all = JSON.parse(response);
                        for (var i = 0; i < all.length; i++) {
                            if (all[i].Type === self.nowShowDistribution) {
                                self.PoolDistributionList.push(all[i]);
                            }
                        }
                        $.each(self.PoolDistributionList, function (i, v) {
                            v.DistributionTypeIDS = '#tabs-' + v.DistributionTypeID;
                            v.app = v.DistributionTypeCode + '-chart';
                            v.DistributionTypeIds = 'tabs-' + v.DistributionTypeID
                        })
                    }
                });
                var obj1 = { 'DistributionTypeCode': 'career', 'dimenstion': '[Customer].[Occupation]', 'DistributionTypeName': '贷款行业分布', 'DistributionTypeIds': 'tabs-' + (parseFloat(self.PoolDistributionList.length) + 1), 'app': 'career-chart', 'DistributionTypeIDS': '#tabs-' + (parseFloat(self.PoolDistributionList.length) + 1), "DistributionTypeID": (parseFloat(self.PoolDistributionList.length) + 1) }
                var obj2 = { 'DistributionTypeCode': 'gradeLevel', 'dimenstion': '[Loan].[Loan Grade Level]', 'DistributionTypeName': '五级分类分布', 'DistributionTypeIds': 'tabs-' + (parseFloat(self.PoolDistributionList.length) + 2), 'app': 'gradeLevel-chart', 'DistributionTypeIDS': '#tabs-' + (parseFloat(self.PoolDistributionList.length) + 2), "DistributionTypeID": (parseFloat(self.PoolDistributionList.length) + 2) }
                var obj3 = { 'DistributionTypeCode': 'address', 'dimenstion': '[Customer].[Address]', 'DistributionTypeName': '地域分布', 'DistributionTypeIds': 'tabs-' + (parseFloat(self.PoolDistributionList.length) + 3), 'app': 'address-chart', 'DistributionTypeIDS': '#tabs-' + (parseFloat(self.PoolDistributionList.length) + 3), "DistributionTypeID": (parseFloat(self.PoolDistributionList.length) + 3) }
                var obj4 = { 'DistributionTypeCode': 'credit', 'dimenstion': '[View Credit Score Distribution].[Distributions Desc]', 'DistributionTypeName': '信用分数分布', 'DistributionTypeIds': 'tabs-' + (parseFloat(self.PoolDistributionList.length) + 4), 'app': 'credit-chart', 'DistributionTypeIDS': '#tabs-' + (parseFloat(self.PoolDistributionList.length) + 4), "DistributionTypeID": (parseFloat(self.PoolDistributionList.length) + 4) }
                self.optionList.push(obj1);
                self.optionList.push(obj2);
                self.optionList.push(obj3);
                self.optionList.push(obj4);
                var timer = null;
                clearTimeout(timer);
                $("#tabs>ul>li").siblings().removeClass("ui-tabs-active ui-state-active")
                $("#tabs>ul>li").eq(0).addClass("ui-tabs-active ui-state-active") 
                timer = setTimeout(function () {
                    showSummary(ssasUrl, catalog, cube, "dalSummary");
                    showDistribution(self.PoolDistributionList[0].DistributionTypeID, catalog, poolId, self.PoolDistributionList[0].DistributionTypeCode, self.PoolDistributionList[0].DistributionTypeName, self.nowShowDistribution);
                    $("#tabs>ul>li:first").trigger("click")

                }, 500)
            }

        },
    });

    $(function () {
        //转化百分数
        function toPercent(point) {
            var str = Number(point * 100).toFixed(0);
            str += "%";
            return str;
        }
        function ieshowsinger(id) {
            $("#" + id).show();
            $("#tabs>div").not("#" + id).hide();
        }
    });

    function showDistribution(distributionId, catalog, poolId, pid, title, type) {
        var self = this;
        var svcUrl = webProxy.dataProcessServiceUrl + "CommonGetExecuteForPool?poolname=" + catalog + "&appDomain=dbo&executeParams=";
        var params = [
            ['PoolId', poolId, 'int'],
            ['DistributionTypeID', distributionId, 'int'],
            ['Type', type, 'string']
        ];
        var result = [];

        var promise = webProxy.comGetData(params, svcUrl, 'usp_GetDistributionByPoolAndTypeID');
        promise().then(function (response) {
            if (typeof response === 'string') {
                result = JSON.parse(response);
            }
            else {
            }
        });
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
                }
            },
            size: {
                height: "auto"
            },
            adaptiveLayout: {
                width: 450
            }

        }).dxChart("instance");

        $("#" + pid + "-chart").hide();

        var pivotGrid = $("#" + pid).dxPivotGrid({
            allowSortingBySummary: false,
            allowSorting: false,
            allowFiltering: true,
            allowExpandAll: true,
            height: "auto",
            showBorders: true,
            wordWrapEnabled: true,
            fieldChooser: {
                enabled: false
            },
            "export": {
                enabled: true,
                fileName: "Pool"
            },
            dataSource: {

                fields: [
                    {
                        caption: "BucketDescription",
                        width: 240,
                        height: "auto",
                        dataField: "BucketDescription",
                        area: "row",
                        dataType: "string",
                        format: "fixedPoint",
                        sortBySummaryField: 'BucketNo'
                    },
                    {
                        caption: "序号",
                        dataField: "BucketNo",
                        dataType: "number",
                        height: "auto",
                        summaryType: "sum",
                        format: "fixedPoint",
                        area: "data"
                        , visible: false
                    },

                    {
                        caption: "贷款笔数",
                        dataField: "LoanCount",
                        dataType: "number",
                        height: "auto",
                        summaryType: "sum",
                        format: "fixedPoint",
                        area: "data"
                    },
                    {
                        caption: "贷款笔数占比(%)",
                        dataField: "LoanCountPercentage",
                        dataType: "percentage",
                        height: "auto",
                        format: {
                            type: "decimal",
                            precision: 4
                        },
                        customizeText: function (arg) {
                            var valueText = arg.valueText.split('.');
                            if (valueText[1] != undefined && valueText[1] != '') {
                                var lastval = valueText[1].slice(2, 3);
                                if (lastval != '' && parseInt(lastval) == 5)
                                    return (arg.value + 0.001).toFixed(2) + '%'
                            }
                            return arg.value.toFixed(2) + '%' 
                        },
                        summaryType: "sum",
                        area: "data"
                    },
                    {
                        caption: "剩余本金",
                        dataField: "CurrentPrincipalBalance",
                        dataType: "number",
                        height: "auto",
                        format: function (v) {
                            var val;
                            var settings = $.extend({
                                trigger: '[data-type="money"]',
                                decimal: 2,
                                minus: false, //是否支持负数,默认不支持
                                parent: 'body'
                            }, settings);
                            function doFormat(s) {
                                var _this = this;
                                if (!s) return "";

                                if ($.isNumeric(s)) {
                                    s = s.toString();
                                }
                                if (typeof s === 'string') {
                                    s = s.replace(/^(\d+)((\.\d*)?)$/, function (v1, v2, v3) {
                                        return v2.replace(/\d{1,3}(?=(\d{3})+$)/g, '$&,') + (v3.slice(0, settings.decimal + 1) || '.00');
                                    });
                                }
                                return s.replace(/^\./, "0.");
                            }
                            val = doFormat(v);
                            return val == '' ? '0' : val;
                        },
                        summaryType: "sum",
                        area: "data"
                    },
                {
                    caption: "剩余本金占比(%)",
                    dataField: "CPBPercentage",
                    dataType: "percentage",
                    height: "auto",
                    format: {
                        type: "decimal",
                        precision: 4
                    },
                    customizeText: function (arg) {
                        var valueText = arg.valueText.split('.');
                        if (valueText[1] != undefined && valueText[1] != '') {
                            var lastval = valueText[1].slice(2, 3);
                            if (lastval != '' && parseInt(lastval) == 5)
                                return (arg.value + 0.001).toFixed(2) + '%'
                        }
                        return arg.value.toFixed(2) + '%'
                    },
                    summaryType: "sum",
                    area: "data"
                },
                    {
                        caption: "合同金额",
                        dataField: "ApprovalAmount",
                        dataType: "number",
                        height: "auto",
                        format: function (v) {
                            var val;
                            var settings = $.extend({
                                trigger: '[data-type="money"]',
                                decimal: 2,
                                minus: false, //是否支持负数,默认不支持
                                parent: 'body'
                            }, settings);
                            function doFormat(s) {
                                var _this = this;
                                if (!s) return "";

                                if ($.isNumeric(s)) {
                                    s = s.toString();
                                }
                                if (typeof s === 'string') {
                                    s = s.replace(/^(\d+)((\.\d*)?)$/, function (v1, v2, v3) {
                                        return v2.replace(/\d{1,3}(?=(\d{3})+$)/g, '$&,') + (v3.slice(0, settings.decimal + 1) || '.00');
                                    });
                                }
                                return s.replace(/^\./, "0.");
                            }
                            val = doFormat(v);
                            return val == '' ? '0' : val;
                        },
                        summaryType: "sum",
                        area: "data"
                    },
                {
                    caption: "合同金额占比(%)",
                    dataField: "ApprovalAmountPercentage",
                    dataType: "percentage",
                    height: "auto",
                    format: {
                        type: "decimal",
                        precision: 4
                    },
                    customizeText: function (arg) {
                        var valueText = arg.valueText.split('.');
                        if (valueText[1] != undefined && valueText[1] != '') {
                            var lastval = valueText[1].slice(2, 3);
                            if (lastval != '' && parseInt(lastval) == 5)
                                return (arg.value + 0.001).toFixed(2) + '%'
                        }
                        return arg.value.toFixed(2) + '%'
                    },
                    summaryType: "sum",
                    area: "data"
                },
                {
                    caption: "加权平均初始抵押率占比(%)",
                    dataField: "InitialCollteralPercentage",
                    dataType: "percentage",
                    height: "auto",
                    visible: self.isShowInitialCollteral,//控制是否显示
                    format: {
                        type: "decimal",
                        precision: 4
                    },
                    customizeText: function (arg) {
                        var valueText = arg.valueText.split('.');
                        if (valueText[1] != undefined && valueText[1] != '') {
                            var lastval = valueText[1].slice(2, 3);
                            if (lastval != '' && parseInt(lastval) == 5)
                                return (arg.value + 0.001).toFixed(2) + '%'
                        }
                        return arg.value.toFixed(2) + '%'
                    },
                    summaryType: "sum",
                    area: "data"
                }
                ],
                //                store: result
                store: {
                    type: "array",
                    data: result
                }
            },
        }).dxPivotGrid("instance");

    }
    //特殊分布调用函数
    function showDistributionEX(ssasUrl, catalog, cube, pid, dimenstion, title) {//后三个参数
        var pivotGrid = $("#" + pid).dxPivotGrid({
            allowSortingBySummary: true,
            allowSorting: true,
            allowFiltering: true,
            allowExpandAll: true,
            height: "auto",
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
                    { dataField: "[Pool].[Dim Pool ID]", area: "filter", caption: "资产池", filterValues: [poolId] },
                    { dataField: "[View Dim EC Pass].[EC Pass No]", area: "filter", caption: "筛选结果集", filterValues: ['ECPass3'] },
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
    }
    function showSummary(ssasUrl, catalog, cube, id) {
        $("#" + id).dxPivotGrid({
            allowSortingBySummary: false,
            allowSorting: false,
            allowFiltering: true,
            allowExpandAll: true,
            height: 'auto',
            width: "calc(100% - 40px)",
            showBorders: true,
            wordWrapEnabled: true,
            fieldChooser: {
                allowSearch: true,
            },
            dataSource: {
                store: {
                    type: "xmla",
                    url: ssasUrl,
                    catalog: catalog,
                    cube: cube
                },

                fields: [
                    { dataField: "[Measures].[Tbl Fact Consolidation Loan Count]", area: "data", caption: "合同笔数（笔）", format: "fixedPoint" },
                    { dataField: "[Measures].[Tbl Fact Consolidation Customer Count]", area: "data", caption: "客户数（户）", format: "fixedPoint" },
                    { dataField: "[Measures].[Approval Amount]", area: "data", caption: "合同总金额（元）", format: "###,###.####" },
                    { dataField: "[Measures].[Current Principal Balance]", area: "data", caption: "未偿本金总金额（元）", format: "###,###.####" },
                    { dataField: "[Measures].[Avg Customer Current Principal Balance]", area: "data", caption: "借款人平均未偿本金（元）", format: "###,###.####" },
                    { dataField: "[Measures].[Maximum Current Principal Balance]", area: "data", caption: "单笔贷款最大未偿本金（元）", format: "###,###.####" },
                    { dataField: "[Measures].[Average Loan Balance]", area: "data", caption: "单笔贷款平均未偿本金（元）", format: "###,###.####" },
                    { dataField: "[Measures].[Average Approval Amount]", area: "data", caption: "单笔贷款平均合同金额（元）", format: "###,###.####" },
                    { dataField: "[Measures].[Weighted Average Term]", area: "data", caption: "加权平均合同期限（月）", format: "###,###.##" },
                    { dataField: "[Measures].[Weighted Average Term To Maturity]", area: "data", caption: "加权平均剩余期限（月）", format: "###,###.##" },
                    { dataField: "[Measures].[Weighted Average Seasoning]", area: "data", caption: "加权平均账龄（月）", format: "###,###.##" },
                    { dataField: "[Measures].[Maximum Remaining Term]", area: "data", caption: "单笔贷款最长剩余期限（月）", format: "###,###.##" },
                    { dataField: "[Measures].[Minimum Remaining Term]", area: "data", caption: "单笔贷款最短剩余期限（月）", format: "###,###.##" },
                    {
                        dataField: "[Measures].[Weighted Average Current Rate]", area: "data", caption: "加权平均利率（%）", format: {
                            formatter: function (data) {
                                var str = Number(data * 100).toFixed(4);
                                str += "%";
                                return str;
                            }
                        }
                    },
                    {
                        dataField: "[Measures].[Maximum Current Rate]", area: "data", caption: "单笔贷款最高利率（%）", format: {
                            formatter: function (data) {
                                var str = Number(data * 100).toFixed(4);
                                str += "%";
                                return str;
                            }
                        }
                    },
                    {
                        dataField: "[Measures].[Minimum Current Rate]", area: "data", caption: "单笔贷款最低利率（%）", format: {
                            formatter: function (data) {
                                var str = Number(data * 100).toFixed(4);
                                str += "%";
                                return str;
                            }
                        },
                    }
                ]
            },
            "export": {
                enabled: true,
                fileName: cube,
                ignoreExcelErrors: true,
            },
        })
        $("#dalSummary").css("margin", "auto");

    }

});