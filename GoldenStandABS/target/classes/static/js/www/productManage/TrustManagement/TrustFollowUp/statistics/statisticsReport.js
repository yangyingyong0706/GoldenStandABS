define(['jquery', 'require', 'globalVariable', 'common', 'gsAdminPages', 'Vue2', 'echarts', 'taskProcessIndicator', 'sVariableBuilder', 'highcharts', 'highchartsexporting', 'kendomessagescn', 'kendoculturezhCN', 'macarons'], function ($, require, GlobalVariable, common, GSDialog, Vue, echarts, taskIndicator, sVariableBuilder) {
    var trustId = common.getQueryString('trustId');
    var typeState = 1;
    var type = 3;
    var Identification = 0;
    //var taskIndicator = require('gs/taskProcessIndicator');
    //var sVariableBuilder = require('gs/sVariableBuilder');
    var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
    Highcharts.theme = {
        colors: ["#69AFC7", "#EBCC85", "#EBCC85", "#eaa974", "#f79240", "#FF9F80", "#27b742", "#1fd040"],
        chart: { backgroundColor: null, style: { fontFamily: "Dosis, sans-serif" } },
        credits: { enabled: false },
        title: { style: { fontSize: '16px', fontWeight: 'bold', textTransform: 'uppercase' } },
        tooltip: { borderWidth: 0, backgroundColor: 'rgba(219,219,216,0.8)', shadow: false },
        legend: { itemStyle: { fontWeight: 'bold', fontSize: '13px' } },
        xAxis: { gridLineWidth: 1, labels: { style: { fontSize: '12px' } } },
        yAxis: { minorTickInterval: 'auto', title: { style: { textTransform: 'uppercase' } }, labels: { style: { fontSize: '12px' } } },
        plotOptions: { candlestick: { lineColor: '#404048' } },
    };
    Highcharts.setOptions(Highcharts.theme);
    Vue.filter("rentrunThrouns", function (data) {
        var res
        if (!data) {
            res = data
        } else {
            if (data.length <= 3) {
                return res = data;
            }
            if (!/^(\+|-)?(\d+)(\.\d+)?$/.test(data)) {
                return res = data;
            }
            var a = RegExp.$1,
                b = RegExp.$2,
                c = RegExp.$3;
            var re = new RegExp();
            re.compile("(\\d)(\\d{3})(,|$)");
            while (re.test(b)) {
                b = b.replace(re, "$1,$2$3");
            }
            return res = a + "" + b + "" + c;
        }

        return res;
    })
    var chart;
    var Vue = new Vue({
        el: "#app",
        data: {
            datelist: [],//日期列表
            Startyear: false,
            Endyear: true,//是否显示截止目前的数据
            StartDate: "",//开始日期
            EndDate: "",//结束日期
            PrincipalDue_Total: "",//计划回款总额(本金)
            InterestDue_Total: "",//计划回款总额利息(利息)
            PrincipalPaid_Total: "",//实际回款总额(本金)
            InterestPaid_Total: "",//实际回款总额(利息)
            PrincipalDiff_Total: "",//总差额（本金)
            InterestDiff_Total: "",//总差额（利息)
            PartAccountTotal: "",//部分早偿(笔数)
            PartAmountDiff_Total: "",//部分早偿(差额)
            AllAccountTotal: "",//全部早偿(笔数)
            AllAmountDiff_Total: "",//全部早偿(差额)
            OverAccountTotal: "",//逾期(笔数)
            OverAmountDiff_Total: "",//逾期(差额)
            tableTreeList: [],//下部表格的数据
            selectDate: [],//选择区间数据源
            EndYearDate: [],//截止目前数据源
            Arrears: [],//资产池当前回款状态名称
            fontinfo: "",//回款期间统计文字信息
            fontinfo2: "",//资产池状态文字信息
            endday: ""//今天的时间
        },
        created: function () {
            this.GetPeriodData();
        },
        mounted: function () {
            var self = this;
            self.SelectDateFromDIy();
            self.getArrears();
            self.RenderView('3', null, null);
            $("#loading").hide();
            $("body,html").css("overflow", "auto");
        },
        methods: {
            //日期获取
            GetPeriodData: function () {
                var self = this;
                var executeParam = {
                    SPName: 'usp_GetTrustPeriod', SQLParams: [
                        { Name: 'TrustId', value: trustId, DBType: 'int' },
                        { Name: 'TrustPeriodType', value: 'CollectionDate_NW', DBType: 'string' }
                    ]
                };
                common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
                    if (data) {
                        $.each(data, function (i, v) {
                            v.StartDate = v.StartDate ? common.getStringDate(v.StartDate).dateFormat('yyyy-MM-dd') : "1990-01-01";
                            v.EndDate = v.EndDate ? common.getStringDate(v.EndDate).dateFormat('yyyy-MM-dd') : "1990-01-01";
                        })
                        self.datelist = data;
                    }
                });
            },
            getArrears: function () {
                var self = this;
                var executeParam = {
                    SPName: 'TrustManagement.usp_GetArrearsIndicatorCode', SQLParams: [
                    ]
                };
                self.Arrears = common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam);
            },
            //自定义select框选取数据
            SelectDateFromDIy: function () {
                common.SelectDateFromDIy(true, "date");
            },
            //渲染数据图表
            RenderView: function (types, StartDate, EndDate) {
                var self = this;
                var boor = true;
                if (EndDate == null) {
                    var executeParamsDate = {
                        SPName: 'usp_AssetPooltTemporaryDate', SQLParams: [
							{ Name: 'TrustId', value: trustId, DBType: 'int' }
                        ]
                    }
                    executeParamsDate.SQLParams.push({ Name: 'type', value: types, DBType: 'string' });
                    common.ExecuteGetData(false, svcUrl, 'Asset', executeParamsDate, function (data) {
                        if (data.length > 0) {
                            StartDate = data[0].startDate;
                            EndDate = data[0].endDate;
                            if (types == 3) {
                                self.endday = EndDate
                            } else {
                                self.StartDate = StartDate;
                                self.EndDate = EndDate;
                                $("#StartDay").val(self.StartDate);
                                $("#EndDay").val(self.EndDate);
                            }
                        } else {
                            boor = false;
                        }
                    });
                }
                if (!boor) {
                    GSDialog.HintWindow("暂无初始值！");
                    //alert("暂无初始值！");
                    return;
                }
                //alert(123);
                var executeParams = {
                    SPName: 'usp_AssetPoolTemporary', SQLParams: [
                        { Name: 'TrustId', value: trustId, DBType: 'int' }
                    ]
                }
                //debugger
                executeParams.SQLParams.push({ Name: 'type ', value: type, DBType: 'string' });
                executeParams.SQLParams.push({ Name: 'startDate ', value: StartDate, DBType: 'string' });
                executeParams.SQLParams.push({ Name: 'endDate ', value: EndDate, DBType: 'string' });
                common.ExecuteGetData(false, svcUrl, 'Asset', executeParams, function (data) {
                    if (self.Endyear) {//
                        self.EndYearDate = data
                        //self.drawChartEndyear(self.EndYearDate);
                        self.drawChartSelect(self.EndYearDate);
                        self.RenderTables(self.EndYearDate);
                        self.fontinfo = "截止到 " + self.endday;
                        self.fontinfo2 = "截止到 " + self.endday;
                        self.drawLineBar(self.EndYearDate);
                    } else {//
                        self.selectDate = data
                        // self.drawChartEndyear(self.selectDate);
                        self.RenderTables(self.selectDate);
                        self.drawChartSelect(self.selectDate);
                        self.fontinfo = "从 " + self.StartDate + " 到 " + self.EndDate;
                        self.fontinfo2 = "截止到 " + self.EndDate;
                        self.drawLineBar(self.selectDate);
                        self.Startyear = true;
                    }
                })
            },
            //选择区间渲染数据
            /*changeSelect: function () {
                var self = this;
                self.StartDate = $("#StartDay").val() ? $("#StartDay").val() : "1900-01-01";//初始化赋值开始日赋值
                self.EndDate = $("#EndDay").val() ? $("#EndDay").val() : "1900-01-01";//初始化结束日赋值
                if (self.EndDate == '1900-01-01') {
                    return false;
                }
                var executeParam = {
                    SPName: 'usp_AssetPoolStatistics', SQLParams: [
                        { Name: 'TrustId', value: trustId, DBType: 'int' }
                    ]
                };
                if (self.StartDate != "1900-01-01") {
                    var startyear = self.StartDate.substring(0, 4);
                    var startmouth = self.StartDate.substring(5, 7);
                    var startday = self.StartDate.substring(8, 10);
                    var endyear = self.EndDate.substring(0, 4);
                    var endmouth = self.EndDate.substring(5, 7);
                    var endday = self.EndDate.substring(8, 10);
                    if (startyear > endyear) {
                        $("#StartDay").val("")
                        $("#StartDay").attr("placeholder", "开始日不能大于截止日");
                        return false;
                    } else if (startyear == endyear && startmouth > endmouth) {
                        $("#StartDay").val("")
                        $("#StartDay").attr("placeholder", "开始日不能大于截止日");
                        return false;
                    } else if (startyear == endyear && startmouth == endmouth && startday > endday) {
                        $("#StartDay").val("")
                        $("#StartDay").attr("placeholder", "开始日不能大于截止日");
                        return false;
                    } else {
                        $("#StartDay").removeAttr("placeholder");
                        executeParam.SQLParams.push({ Name: 'StartDate ', value: self.StartDate, DBType: 'string' });
                        executeParam.SQLParams.push({ Name: 'EndDate', value: self.EndDate, DBType: 'string' });
                        common.ExecuteGetData(false, svcUrl, 'Asset', executeParam, function (data) {
                            self.selectDate = data
                            self.RenderTables(self.selectDate);
                            self.fontinfo = "从 " + self.StartDate + " 到 " + self.EndDate;
                            self.fontinfo2 = "截止到 " + self.EndDate;
                            self.drawChartSelect(self.selectDate);
                            self.drawLineBar(self.selectDate);
                        })
                    }
                } else {
                    $("#StartDay").removeAttr("placeholder");
                    executeParam.SQLParams.push({ Name: 'StartDate ', value: self.StartDate, DBType: 'string' });
                    executeParam.SQLParams.push({ Name: 'EndDate', value: self.EndDate, DBType: 'string' });
                    common.ExecuteGetData(false, svcUrl, 'Asset', executeParam, function (data) {
                        self.selectDate = data
                        self.RenderTables(self.selectDate);
                        self.fontinfo = "从 " + self.StartDate + " 到 " + self.EndDate;
                        self.fontinfo2 = "截止到 " + self.EndDate;
                        self.drawChartSelect(self.selectDate);
                        self.drawLineBar(self.selectDate);
                    })
                }
            },*/
            //渲染tab表格
            RenderTables: function (parmas) {
                var self = this;
                self.tableTreeList = [];
                if (parmas.length <= 0) {
                    return;
                }
                $.each(parmas[1], function (i, v) {
                    self.PrincipalDue_Total = v.PrincipalDue_Total;
                    self.InterestDue_Total = v.InterestDue_Total
                    self.PrincipalPaid_Total = v.PrincipalPaid_Total
                    self.InterestPaid_Total = v.InterestPaid_Total
                    self.PrincipalDiff_Total = v.PrincipalDiff_Total
                    self.InterestDiff_Total = v.InterestDiff_Total
                })
                $.each(parmas[0], function (i, v) {
                    if (v.StatusDescription == "部分早偿") {
                        self.PartAccountTotal = v.Account_Total;
                        self.PartAmountDiff_Total = v.AmountDiff_Total;
                    }
                    if (v.StatusDescription == "全部早偿") {
                        self.AllAccountTotal = v.Account_Total;
                        self.AllAmountDiff_Total = v.AmountDiff_Total;
                    }
                    if (v.StatusDescription == "逾期") {
                        self.OverAccountTotal = v.Account_Total;
                        self.OverAmountDiff_Total = v.AmountDiff_Total;
                    }
                });
                var nub180;
                $.each(parmas[2], function (i, v) {
                    debugger
                    if (v.StatusDescription == "正常") {
                        self.tableTreeList.push(v)
                    }
                    if (v.StatusDescription == "逾期1-30天") {
                        self.tableTreeList.push(v)
                    }
                    if (v.StatusDescription == "逾期31-60天") {
                        self.tableTreeList.push(v)
                    }
                    if (v.StatusDescription == "逾期61-90天") {
                        self.tableTreeList.push(v)
                    }
                    if (v.StatusDescription == "逾期91-180天") {
                        self.tableTreeList.push(v);
                        self.tableTreeList.push(nub180)
                    }
                    if (v.StatusDescription == "逾期180天以上") {
                        nub180 = v;
                        // self.tableTreeList.push(v)
                    }
                })
                var obj = '{"StatusDescription":"合计",'
                var AmountDiff_Total = 0;//拖欠金额
                var AccountTotal = 0;//资产笔数
                var AmountDiffRate = 0;//拖欠金额占比
                var AccountRate = 0;//资产笔数占比
                var AmountDiff_Avg = 0;//平均差额
                $.each(self.tableTreeList, function (i, v) {
                    AmountDiff_Total += parseFloat(v.AmountDiff_Total);
                    AccountTotal += parseFloat(v.AccountTotal);
                    AmountDiffRate += parseFloat(v.AmountDiffRate);
                    AccountRate += parseFloat(v.AccountRate);
                    AmountDiff_Avg += parseFloat(v.AmountDiff_Avg);
                });
                AmountDiff_Total = AmountDiff_Total.toFixed(2);
                AccountRate = AccountRate.toFixed(2);
                AmountDiffRate = AmountDiffRate.toFixed(2);
                AccountTotal = AccountTotal.toFixed(2);
                AmountDiff_Avg = AmountDiff_Avg.toFixed(2);
                obj += '"AmountDiff_Total":' + AmountDiff_Total + "," + '"AmountDiffRate":' + '"' + AmountDiffRate + '%"' + "," + '"AccountTotal":' + AccountTotal + "," + '"AccountRate":' + '"' + AccountRate + "%" + '"' + "," + '"AmountDiff_Avg":' + AmountDiff_Avg + "}";
                self.tableTreeList.push(JSON.parse(obj))
            },
            //table切换
            changeTabone: function () {
                var self = this;
                self.Startyear = true;
                self.Endyear = false;
                self.fontinfo = "从 " + self.StartDate + " 到 " + self.EndDate;
                self.fontinfo2 = "截止到 " + self.EndDate;
                typeState = 2;
                type = 4;
                if (self.selectDate.length <= 0) {
                    self.PrincipalDue_Total = "";//计划回款总额(本金)
                    self.InterestDue_Total = "";//计划回款总额利息(利息)
                    self.PrincipalPaid_Total = "";//实际回款总额(本金)
                    self.InterestPaid_Total = "";//实际回款总额(利息)
                    self.PrincipalDiff_Total = "";//总差额（本金)
                    self.InterestDiff_Total = "";//总差额（利息)
                    self.PartAccountTotal = "";//部分早偿(笔数)
                    self.PartAmountDiff_Total = "";//部分早偿(差额)
                    self.AllAccountTotal = "";//全部早偿(笔数)
                    self.AllAmountDiff_Total = "";//全部早偿(差额)
                    self.OverAccountTotal = "";//逾期(笔数)
                    self.OverAmountDiff_Total = "";//逾期(差额)
                }
                self.drawChartSelect(self.selectDate);
                self.RenderTables(self.selectDate);
                self.drawLineBar(self.selectDate);
                if (Identification == 0) {
                    self.RenderView('4', null, null);
                }
                Identification = 1;
            },
            changeTabtwo: function () {
                var self = this;
                self.Startyear = false;
                self.Endyear = true;
                self.fontinfo = "截止到 " + self.endday;
                self.fontinfo2 = "截止到 " + self.endday;
                typeState = 1;
                type = 3;
                if (self.EndYearDate.length <= 0) {
                    self.PrincipalDue_Total = "";//计划回款总额(本金)
                    self.InterestDue_Total = "";//计划回款总额利息(利息)
                    self.PrincipalPaid_Total = "";//实际回款总额(本金)
                    self.InterestPaid_Total = "";//实际回款总额(利息)
                    self.PrincipalDiff_Total = "";//总差额（本金)
                    self.InterestDiff_Total = "";//总差额（利息)
                    self.PartAccountTotal = "";//部分早偿(笔数)
                    self.PartAmountDiff_Total = "";//部分早偿(差额)
                    self.AllAccountTotal = "";//全部早偿(笔数)
                    self.AllAmountDiff_Total = "";//全部早偿(差额)
                    self.OverAccountTotal = "";//逾期(笔数)
                    self.OverAmountDiff_Total = "";//逾期(差额)
                }
                self.drawChartSelect(self.EndYearDate);
                self.RenderTables(self.EndYearDate);
                self.drawLineBar(self.EndYearDate);
            },
            drawChartSelect: function (data) {//绘制图表(选中)
                var self = this;
                /*var executeParam = {
                    SPName: 'TrustManagement.usp_GetArrearsIndicatorCode', SQLParams: [
                    ]
                };
                var data1 = common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam);*/
                var series = [{
                    data: [

                    ]
                }];
                $.each(self.Arrears, function (i, v) {
                    var name = v.StatusDescription;
                    var obj = [];
                    obj.push(name);
                    $.each(data[0], function (j, k) {
                        if (name == k.StatusDescription) {
                            obj.push(k.Account_Total);
                            series[0].data.push(obj);
                            return false
                        }
                    })
                })
                //选中区间
                var tmp1 = { titleText: "资产池当期回款状态数量统计", yAxisTitle: "", categories: {}, series: series, isPool: false };
                //$('#select-bar').highcharts(self.columnTemplate(tmp1, data[0]));
                //var s = series[0].type = 'pie';
                var tmp = { titleText: "资产池当期回款状态", series: series, isPool: false };
                //$('#select-pie').highcharts(self.pieTemplate(tmp));				
                if (self.Endyear) {
                    $('#select-bar').highcharts(self.columnTemplate(tmp1, data[0], false));
                    var s = series[0].type = 'pie';
                    $('#select-pie').highcharts(self.pieTemplate(tmp, false));
                } else {
                    $('#select-bar').highcharts(self.columnTemplate(tmp1, data[0], true));
                    var s = series[0].type = 'pie';
                    $('#select-pie').highcharts(self.pieTemplate(tmp, true));
                }
            },
            drawLineBar: function (data) {
                //折线柱状图;
                function formatNum(strNum) {
                    if (strNum.length <= 3) {
                        return strNum;
                    }
                    if (!/^(\+|-)?(\d+)(\.\d+)?$/.test(strNum)) {
                        return strNum;
                    }
                    var a = RegExp.$1,
                        b = RegExp.$2,
                        c = RegExp.$3;
                    var re = new RegExp();
                    re.compile("(\\d)(\\d{3})(,|$)");
                    while (re.test(b)) {
                        b = b.replace(re, "$1,$2$3");
                    }
                    return a + "" + b + "" + c;
                }
                chart = echarts.init(document.getElementById('hightchart-linebar'), 'macarons');
                chart.clear();
                if (data.length <= 0) {
                    return;
                }
                var datalist = data[3];
                var date = [];//日期
                var money = [];//金额
                var rate = [];//比率

                var options = {
                    tooltip: {
                        trigger: 'axis',
                        formatter: function (datas) {
                            var monyname = datas[0] ? datas[0].seriesName : "";
                            var monyvalue = datas[0] ? datas[0].value : "";
                            var ratename = datas[1] ? datas[1].seriesName : "";
                            var ratevalue = datas[1] ? datas[1].value : "";
                            var str = "";
                            if (datas.length == 2) {
                                str += monyname + ":" + formatNum(monyvalue) + "元" + "<br>";
                                str += ratename + ":" + ratevalue + "%";
                            }
                            if (datas.length == 0) {
                                str = ""
                            }
                            if (datas.length == 1 && datas[0].seriesName == "逾期金额") {
                                str += datas[0].seriesName + ":" + formatNum(datas[0].value) + "元"
                            }
                            if (datas.length == 1 && datas[0].seriesName == "逾期率") {
                                str += datas[0].seriesName + ":" + datas[0].value + "%";
                            }
                            return str
                        }
                    },
                    toolbox: {
                        show: true,
                        feature: {
                            mark: { show: true },
                        }
                    },
                    color: ['#69AFC7', '#dc8a32'],
                    animation: false,
                    dataZoom: [{
                        xAxisIndex: [0],
                        type: 'inside',
                        show: true,
                        start: 0,
                        end: 100,
                        type: 'slider',
                        filterMode: 'filter',
                        throttle: 0,
                        fillerColor: "rgba(220,210,230,0.6)", /*被start和end遮住的背景*/
                        labelFormatter: function (value, params) { /*拖动时两端的文字提示*/
                            var str = "";
                            if (params.length > 15) {
                                str = params.substring(0, 15) + "…";
                            } else {
                                str = params;
                            }
                            return str;
                        },

                    }],
                    grid: {
                        left: '3%',
                        right: '4%',
                        bottom: '10%',
                        containLabel: true
                    },
                    calculable: true,
                    legend: {
                        data: ['逾期金额', '逾期率']
                    },
                    xAxis: [
                        {
                            type: 'category',
                            data: []
                        }
                    ],
                    yAxis: [
                        {
                            type: 'value',
                            name: '逾期金额',
                            axisLabel: {
                                formatter: '{value}'
                            }
                        },
                        {
                            type: 'value',
                            name: '逾期率',
                            axisLabel: {
                                formatter: '{value} %'
                            }
                        }
                    ],
                    series: [

                        {
                            name: '逾期金额',
                            type: 'bar',
                            barWidth: "20",
                            data: []
                        },
                        {
                            name: '逾期率',
                            type: 'line',
                            yAxisIndex: 1,
                            data: []
                        }
                    ]
                };
                if (data[3].length > 0) {
                    $.each(data[3], function (i, v) {
                        date.push(v.Month)
                        money.push(v.ArrearsMount);
                        rate.push(v.ArrearsRate);
                    })
                }
                options.xAxis[0].data = date;
                options.series[0].data = money;
                options.series[1].data = rate;
                chart.setOption(options)
            },
            /*drawChartEndyear: function (data) {
                var self = this;
                var executeParam = {
                    SPName: 'TrustManagement.usp_GetArrearsIndicatorCode', SQLParams: [
                    ]
                };
                var data1 = common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam);
                var series = [{
                    data: [

                    ]
                }];
                $.each(data1, function (i, v) {
                    var name = v.StatusDescription;
                    var obj = [];
                    obj.push(name);
                    $.each(data[0], function (j, k) {
                        if (name == k.StatusDescription) {
                            obj.push(k.Account_Total);
                            series[0].data.push(obj);
                            return false
                        }
                    })
                })
                //截止目前
                var tmp2 = { titleText: "资产池当前回款状态数量统计", yAxisTitle: "", categories: {}, series: series, isPool: true };
                $('#Endyear-bar').highcharts(self.columnTemplate(tmp2, data[0], 2));
                series[0].type = 'pie';
                var tmp1 = { titleText: "资产池当前回款状态", series: series, isPool: true };
                $('#Endyear-pie').highcharts(self.pieTemplate(tmp1, 2));
                self.Startyear = false;
            },*/
            columnTemplate: function (params, data, mode) {
                function formatNum(strNum) {
                    if (strNum.length <= 3) {
                        return strNum;
                    }
                    if (!/^(\+|-)?(\d+)(\.\d+)?$/.test(strNum)) {
                        return strNum;
                    }
                    var a = RegExp.$1,
                        b = RegExp.$2,
                        c = RegExp.$3;
                    var re = new RegExp();
                    re.compile("(\\d)(\\d{3})(,|$)");
                    while (re.test(b)) {
                        b = b.replace(re, "$1,$2$3");
                    }
                    return a + "" + b + "" + c;
                }
                var self = this;
                return {
                    chart: {
                        type: 'column', zoomType: 'x'
                    },
                    title: { text: params.titleText },
                    xAxis: { type: 'category' },//categories: params.categories
                    yAxis: {
                        min: 0, title: { text: params.yAxisTitle },
                        stackLabels: {
                            enabled: false,
                            style: { fontWeight: 'bold', color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray' }
                        }
                    },
                    tooltip: {
                        formatter: function () {
                            var datalist = data;
                            var self = this;
                            var str = "";
                            $.each(data, function (i, v) {
                                if (v.StatusDescription == self.key) {
                                    str += self.key + "笔数" + ":" + v.Account_Total + "笔" + "<br>" + self.key + "总额" + ":" + formatNum(v.Amount_Total) + "元";
                                    return false
                                }
                            })
                            return str;
                        }
                    },
                    legend: { enabled: false },
                    plotOptions: {
                        column: {
                            dataLabels: {
                                enabled: true
                            }
                        }
                        , series: {
                            cursor: 'pointer',
                            events: {
                                click: function (event) {
                                    self.showList(event.point.name, mode);
                                }
                            }
                        }
                    },
                    series: params.series
                }
            },
            pieTemplate: function (params, mode) {
                var self = this;
                return {
                    chart: {
                        plotBackgroundColor: null,
                        plotBorderWidth: null,
                        plotShadow: false
                    },
                    title: {
                        text: params.titleText
                    },
                    credits: { enabled: false },
                    tooltip: {
                        formatter: function () {
                            return '<b>' + this.point.name + '</b>: ' + Highcharts.numberFormat(this.percentage, 1) + '% (' +
                                         Highcharts.numberFormat(this.y, 0, ',') + ' 个)';
                        }
                    },
                    plotOptions: {
                        pie: {
                            allowPointSelect: true,
                            cursor: 'pointer',
                            dataLabels: {
                                enabled: true,
                                color: '#000000',
                                connectorColor: '#000000',
                                formatter: function () {
                                    return '<b>' + this.point.name + '</b>: ' + Highcharts.numberFormat(this.percentage, 1) + '% (' +
                                               Highcharts.numberFormat(this.y, 0, ',') + ' 个)';
                                    //return Highcharts.numberFormat(this.y, 0, ',');
                                }
                                //,distance:-30
                            },
                            showInLegend: true
                        }
                        , series: {
                            cursor: 'pointer',
                            events: {
                                click: function (event) {

                                    self.showList(event.point.name, mode);
                                }
                            }
                        }
                    },
                    series: params.series
                }
            },
            showList: function (params, mode1) {
                var self = this;
                var Type = params;
                var endDate = $('#EndDay').val()
                var startDate = $("#StartDay").val()
                var data;
                var mode = 0;
                if (mode1) {
                    mode = 1;
                    var title = '资产池当期回款状态数量统计'
                } /*else {
                    var mode = 0;
                    var title = '资产池当前回款状态数量统计'
                }*/
                $.anyDialog({
                    title: title,
                    url: './statisticsviewReport.html?tid=' + trustId + '&&Type=' + Type + "&&mode=" + mode + "&&startDate=" + startDate + "&&endDate=" + endDate,
                    width: '900',
                    height: '500',
                    draggable: false,
                    changeallow: false,
                    scrolling: false
                })
            },
            // ----start  yangpiao  2019/6/4-------
            statiscsTIndicatoropen: function () {//点击查询触发事件
                var self = this;
                var myDate = new Date();
                var year = myDate.getFullYear();
                var mouth = myDate.getMonth() + 1;
                var day = myDate.getDate();
                mouth = mouth < 10 ? "0" + mouth : mouth;
                day = day < 10 ? "0" + day : day;
                var endday = year + "-" + mouth + "-" + day;
                self.endday = endday
                console.log(endday)
                var startdate;
                var enddate;
                if (self.Endyear) {
                    startdate = '1900-01-01';
                    enddate = endday;
                } else {
                    startdate = $("#StartDay").val() ? $("#StartDay").val() : "1900-01-01";//初始化赋值开始日赋值
                    enddate = $("#EndDay").val() ? $("#EndDay").val() : "1900-01-01";//初始化结束日赋值
                    self.StartDate = startdate;
                    self.EndDate = enddate;
                    self.fontinfo = "从 " + self.StartDate + " 到 " + self.EndDate;
                    self.fontinfo2 = "截止到 " + self.EndDate;
                    var startyear = self.StartDate.substring(0, 4);
                    var startmouth = self.StartDate.substring(5, 7);
                    var startday = self.StartDate.substring(8, 10);
                    var endyear = self.EndDate.substring(0, 4);
                    var endmouth = self.EndDate.substring(5, 7);
                    var endday = self.EndDate.substring(8, 10);
                    if (startyear > endyear) {
                        $("#StartDay").val("")
                        $("#StartDay").attr("placeholder", "开始日不能大于截止日");
                        return false;
                    } else if (startyear == endyear && startmouth > endmouth) {
                        $("#StartDay").val("")
                        $("#StartDay").attr("placeholder", "开始日不能大于截止日");
                        return false;
                    } else if (startyear == endyear && startmouth == endmouth && startday > endday) {
                        $("#StartDay").val("")
                        $("#StartDay").attr("placeholder", "开始日不能大于截止日");
                        return false;
                    }
                }
                //var TemporaryIds = self.GenNonDuplicateID();
                sVariableBuilder.AddVariableItem('TrustId', trustId, 'Int', 0, 0, 0);
                sVariableBuilder.AddVariableItem('type', type, 'String', 0, 0, 0);
                sVariableBuilder.AddVariableItem('startDate', startdate, 'String', 0, 0, 0);
                sVariableBuilder.AddVariableItem('endDate', enddate, 'String', 0, 0, 0);
                var sVariable = sVariableBuilder.BuildVariables();
                var tIndicator = new taskIndicator({
                    width: 500,
                    height: 550,
                    clientName: 'TaskProcess',
                    appDomain: 'Task',
                    taskCode: 'statisticsReportAll',
                    sContext: sVariable,
                    callback: function () {
                        //debugger	
                        //TemporaryId = TemporaryIds;
                        self.RenderView(type, startdate, enddate);
                        sVariableBuilder.ClearVariableItem();
                    }
                });
                tIndicator.show();
            },
            //-------------------end----------------------------------

        }
    })
    $(function () {
        $(window).resize(function () {
            chart.resize()
        })
    })
});