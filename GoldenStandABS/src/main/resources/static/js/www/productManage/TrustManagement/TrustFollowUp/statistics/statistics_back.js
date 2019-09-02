define(['jquery', 'highcharts', 'highchartsexporting', 'globalVariable', 'common','Vue2','jquery.datagrid', 'jquery.datagrid.options'], function ($, highcharts, highchartsexporting, GlobalVariable, common,Vue) {
    var trustId = common.getQueryString('trustId');
    var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
    Vue.filter("returndate", function (data) {
        return  data?common.getStringDate(data).dateFormat('yyyy-MM-dd') : '';
    })
    Highcharts.theme = {
        colors: ["#7cb5ec", "#f7a35c", "#90ee7e", "#7798BF", "#aaeeee", "#ff0066", "#eeaaee", "#55BF3B", "#DF5353", "#7798BF", "#aaeeee"],
        chart: { backgroundColor: null, style: { fontFamily: "Dosis, sans-serif" } },
        credits: { enabled: false },
        title: { style: { fontSize: '16px', fontWeight: 'bold', textTransform: 'uppercase' } },
        tooltip: { borderWidth: 0, backgroundColor: 'rgba(219,219,216,0.8)', shadow: false },
        legend: { itemStyle: { fontWeight: 'bold', fontSize: '13px' } },
        xAxis: { gridLineWidth: 1, labels: { style: { fontSize: '12px' } } },
        yAxis: { minorTickInterval: 'auto', title: { style: { textTransform: 'uppercase' } }, labels: { style: { fontSize: '12px' } } },
        plotOptions: { candlestick: { lineColor: '#404048' } },
        background2: '#F0F0EA'
    };
    Highcharts.setOptions(Highcharts.theme);
    var Vue = new Vue({
        el: "#app",
        data: {
            datelist: [],//日期列表
            seiresCurrent: [],//当期
            seiresHistory:[]//历史
        },
        created: function () {
            this.GetPeriodData();
        },
        mounted: function () {
            this.RenderView();
            $(".history_view").hide();
            $("#loading").hide();
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
                        self.datelist = data;
                    }
                });
            },
            //渲染hightchart数据
            RenderView: function () {
                var self = this;
                var executeParam = {
                    SPName: 'usp_AssetPoolStatistics', SQLParams: [
                        { Name: 'TrustId', value: trustId, DBType: 'int' }
                    ]
                };
                //渲染历史表和当前表
                var reportingDate = $("#pared").val($("#pared").find("option").eq(0).val())
                reportingDate = $("#pared").val()
                //历史数据
                common.ExecuteGetData(false, svcUrl, 'Asset', executeParam, function (data) {
                    self.seiresHistory = data;
                    var series = [{
                        //name: '',
                        data: [
                            ['正常', data[0].totalNormal],
                            ['部分早偿', data[0].totalPartialPrePaid],
                            ['全部早偿', data[0].totalFullyPrePaid],
                            ['违约', data[0].totalDefault]
                        ]
                    }];
                    var tmp1 = { titleText: "资产池回款数量统计", yAxisTitle: "", categories: {}, series: series, isPool: true };
                    $('#container3').highcharts(self.columnTemplate(tmp1));
                    series[0].type = 'pie';
                    var tmp = { titleText: "资产池回款状态", series: series, isPool: true };
                    $('#container2').highcharts(self.pieTemplate(tmp));
                })
                if ($("#pared").val()) {//当前数据
                    executeParam.SQLParams.push({ Name: '@ReportingDate', value: reportingDate, DBType: 'string' });
                    common.ExecuteGetData(false, svcUrl, 'Asset', executeParam, function (data) {
                        self.seiresCurrent = data;
                        var series = [{
                            //name: 'Browser share',
                            data: [
                                ['正常', data[0].totalNormal],
                                ['部分早偿', data[0].totalPartialPrePaid],
                                ['全部早偿', data[0].totalFullyPrePaid],
                                ['违约', data[0].totalDefault],
                                ['逾期', data[0].totalInArrears]
                            ]
                        }];
                        var tmp1 = { titleText: "资产回款数量统计", yAxisTitle: "", categories: {}, series: series, isPool: false };
                        $('#container1').highcharts(self.columnTemplate(tmp1));
                        var s = series[0].type = 'pie';
                        var tmp = { titleText: "资产回款状态", series: series, isPool: false };
                        $('#container').highcharts(self.pieTemplate(tmp));
                    })
                }
            },
            columnTemplate: function (params) {
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
                        headerFormat: '',
                        pointFormat: '{point.name}: {point.y:,.0f}'
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
                                    GetAssetByStatus.ShowList({ Status: event.point.name, isPool: params.isPool });
                                }
                            }
                        }
                    },
                    series: params.series
                }
            },
            pieTemplate: function (params) {
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
                                    GetAssetByStatus.ShowList({ Status: event.point.name, isPool: params.isPool });
                                }
                            }
                        }
                    },
                    series: params.series
                }
            }
        }
    })
    function CurPeriodCharts(data) {
        var series = [{
            //name: 'Browser share',
            data: [
                ['正常', data[0].totalNormal],
                ['部分早偿', data[0].totalPartialPrePaid],
                ['全部早偿', data[0].totalFullyPrePaid],
                ['违约', data[0].totalDefault],
                ['逾期', data[0].totalInArrears]
            ]
        }];
        var tmp1 = { titleText: "资产回款数量统计", yAxisTitle: "", categories: {}, series: series, isPool: false };
        $('#container1').highcharts(columnTemplate(tmp1));
        var s = series[0].type = 'pie';
        var tmp = { titleText: "资产回款状态", series: series, isPool: false };
        $('#container').highcharts(pieTemplate(tmp));
    }

    function AllPeriodCharts(data) {
        var series = [{
            //name: '',
            data: [
                ['正常', data[0].totalNormal],
                ['部分早偿', data[0].totalPartialPrePaid],
                ['全部早偿', data[0].totalFullyPrePaid],
                ['违约', data[0].totalDefault]
            ]
        }];
        var tmp1 = { titleText: "资产池回款数量统计", yAxisTitle: "", categories: {}, series: series, isPool: true };
        $('#container3').highcharts(columnTemplate(tmp1));
        series[0].type = 'pie';
        var tmp = { titleText: "资产池回款状态", series: series, isPool: true };
        $('#container2').highcharts(pieTemplate(tmp));
    }

    function showListByType(cType) {
        GetAcumulativeRateByType.ShowList(cType);
    }

    function ExecuteGetAcumulativeData(async, svcUrl, appDomain, executeParam, callback) {
        var executeParams = encodeURIComponent(JSON.stringify(executeParam));
        var sourceData = [];

        $.ajax({
            cache: false,
            type: "GET",
            async: async,
            url: svcUrl + 'appDomain=' + appDomain + '&executeParams=' + executeParams + '&resultType=AcumulativeData',
            dataType: "json",
            contentType: "application/xml;charset=utf-8",
            data: {},
            success: function (response) {
                if (typeof response === 'string') { sourceData = JSON.parse(response.replace(/\s,/g, '"",')); }
                else { sourceData = response; }
                if (callback)
                    callback(sourceData);
            },
            error: function (response) { alert('Error occursed while requiring the remote source data!'); }
        });
        return sourceData;
    }

    /////////////////////////////////////////////////////////////////
    var GetAssetByStatus = (function () {
        var poolData = [], singData = [];
        function initData(params) {
            var spName = 'usp_GetAssetByStatus';
            var executeParam = { SPName: spName, SQLParams: [] };
            executeParam.SQLParams.push({ Name: 'TrustId', value: trustId, DBType: 'int' });
            if (params.reportingDate) {
                executeParam.SQLParams.push({ Name: '@ReporintDate', value: params.reportingDate, DBType: 'string' });
                singData = common.ExecuteGetData(false, svcUrl, 'Asset', executeParam);
                tmp(singData);
            } else {
                poolData = common.ExecuteGetData(false, svcUrl, 'Asset', executeParam);
                tmp(poolData);
            }

            function tmp(data) {
                $.each(data, function (i, n) {
                    data[i].PayDate = data[i].PayDate ? common.getStringDate(data[i].PayDate).dateFormat('yyyy-MM-dd') : '';
                    data[i].Status = (data[i].Status == 'Normal' ? '正常' : (data[i].Status == 'IsPartitialPrepaid' ? '部分早偿' : (data[i].Status == 'IsFullyPrePaid' ? '全部早偿' : (data[i].Status == 'IsDefault' ? '违约' : (data[i].Status == 'IsInArrears' ? '逾期' : '')))));
                });
            }
        }
        function showList(params) {
            //var s = params.Status == '正常' ? 'Normal' : (params.Status == '早偿' ? 'IsPartitialPrepaid' : (params.Status == '全部早偿' ? 'IsFullyPrePaid' : 'IsDefault'))
            var data = params.isPool ? poolData : singData;
            var curDataList = $.grep(data, function (n, i) {
                return n.Status == params.Status;
            });
            bindListView(curDataList);
            var ht = $('#dataListView').clone(true)
            $.anyDialog({
                width: 900,	// 弹出框内容宽度
                height: 500, // 弹出框内容高度
                title: '资产回款数量',	// 弹出框标题
                html: ht.show(),
                onClose: function () {
                    //$('#listViewContainer').empty();
                    $('#dataListView').datagrid("destroy");
                }
            });
        }
        function bindListView(datalist) {
            if ($('#dataListView').datagrid("datagrid"))
                $('#dataListView').datagrid("destroy");
            $('#dataListView').datagrid({
                data: datalist,
                col: [{ field: "PayDate", title: "回款日期", sortable: true, attrHeader: settable.tableTh, attr: settable.tableTd }
                    , {
                        field: "AccountNo", title: "合同编号", sortable: true, attrHeader: settable.tableTh, attr: settable.tableTd
                        , render: function (data) {
                            var viewPageUrl = '../AssetPayMentSchedule/AssetPaymentSchedule.html?trustId={0}&accountNo={1}'.StringFormat(trustId, data.value);
                            var html = '<a style="color:blue" href="javascript: showDialogPage(\'' + viewPageUrl + '\',\'资产现金流\',900,500,function(){});">' + data.value + '</a>';
                            return html;
                        }
                    }
                    , { field: "PrincipalPayAmount", title: "实际收(本金)", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd }
                    , { field: "InterestPayAmount", title: "实际收(利息)", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd }
                    , { field: "Status", title: "状态", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd }
                ],
                attr: 'mytable',
                paramsDefault: { paging: 30 },
                noData: "<p class='noData'>当前视图没有可显示记录。</p>",
                pagerPosition: "bottom",
                pager: "mypager",
                sorter: "mysorter",
                onComplete: function () {
                    $(".mytable").on("click", ".table-td", function () {
                        $(".mytable .table-td").removeClass("active");
                        $(this).addClass("active");
                    })
                }
            });
        }

        return { InitData: initData, ShowList: showList }
    })();

    var GetAcumulativeRateByType = (function () {
        var dataAcu = [];
        var dataforBRate = [];
        var dataforPreRate = [];
        function initData(param) {
            var spName = 'usp_GetCalRateByType';
            var executeParam = { SPName: spName, SQLParams: [] };
            executeParam.SQLParams.push({ Name: 'TrustId', value: trustId, DBType: 'int' });
            executeParam.SQLParams.push({ Name: 'CType', value: param, DBType: 'string' });
            dataAcu = ExecuteGetAcumulativeData(false, svcUrl, 'Asset', executeParam);
            $.each(dataAcu.data, function (i, n) {
                dataAcu.data[i].PayDate = dataAcu.data[i].PayDate ? common.getStringDate(dataAcu.data[i].PayDate).dateFormat('yyyy-MM-dd') : '';
            });

            if (param == "CumulativeBrenchRate") {
                $("#cumulativeBRate").text(dataAcu.AcumulatvieRate);
                dataforBRate = dataAcu;
            }
            else if (param == "CumulativePrePaidRate") {
                $("#cumulativePreRate").text(dataAcu.AcumulatvieRate);
                dataforPreRate = dataAcu;
            }
            console.log(dataAcu);
        }
        function showList(type) {
            var dialogTitle = '';
            var header = "";
            var typeName = '';
            var span2title = '累计{0}资产总剩余本金：'
            var currentData = [];
            if (type == "CumulativeBrenchRate") {
                typeName = '违约';
                dialogTitle = '累计违约率明细';
                header = '累计违约率';
                currentData = dataforBRate;
                //bindListView(dataforBRate.data);
            }
            else if (type == "CumulativePrePaidRate") {
                typeName = '早偿';
                dialogTitle = '累计早偿率明细';
                header = '累计早偿率';
                currentData = dataforPreRate;
                //bindListView(dataforPreRate.data);
            }

            bindListView(currentData.data);
            $("#span1").html(currentData.TotalCPBalance);
            $("#span2").prev().html(span2title.StringFormat(typeName));
            $("#span2").html(currentData.AcumulativePBalance);
            $("#span3").html(currentData.AcumulatvieRate);
            $("#rateSpan").html(header + "：");
            $("#description").show();

            $.anyDialog({
                width: 900,	// 弹出框内容宽度
                height: 500, // 弹出框内容高度
                title: dialogTitle,	// 弹出框标题
                html: $('#dataListView').show(),
                onClose: function () {
                    //$('#listViewContainer').empty();
                    $("#description").hide();
                    $('#dataListView').datagrid("destroy");
                },
                onMaskClick: function () {
                    $("#description").hide();
                    $('#dataListView').datagrid("destroy");
                }
            });
        }
        function bindListView(data) {
            if ($('#dataListView').datagrid("datagrid"))
                $('#dataListView').datagrid("destroy");
            $('#dataListView').datagrid({
                data: data,
                col: [{ field: "PayDate", title: "回款日期", sortable: true, attrHeader: settable.tableTh, attr: settable.tableTd }
                    , {
                        field: "AccountNo", title: "合同编号", sortable: true, attrHeader: settable.tableTh, attr: settable.tableTd
                        , render: function (data) {
                            var viewPageUrl = '../AssetPayMentSchedule/AssetPaymentSchedule.html?trustId={0}&accountNo={1}'.StringFormat(trustId, data.value);
                            var html = '<a style="color:blue" href="javascript: showDialogPage(\'' + viewPageUrl + '\',\'资产现金流\',900,500,function(){});">' + data.value + '</a>';
                            return html;
                        }
                    }
                    , { field: "CurrentPrincipalBalance", title: "封包日剩余本金", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd }
                    , { field: "PayAmount", title: "已收金额", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd }
                    , { field: "CurrentCPrincipalBalance", title: "剩余本金", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd }
                ],
                attr: 'mytable',
                paramsDefault: { paging: 30 },
                noData: "<p class='noData'>当前视图没有可显示记录。</p>",
                pagerPosition: "bottom",
                pager: "mypager",
                sorter: "mysorter",
                onComplete: function () {
                    $(".mytable").on("click", ".table-td", function () {
                        $(".mytable .table-td").removeClass("active");
                        $(this).addClass("active");
                    })
                }
            });
        }

        return { InitData: initData, ShowList: showList }
    })();

    function Init() {
        //全部
        GetSourceData(null, AllPeriodCharts);
        //部分
        if (!$('#pared').val()) {
            $(".pared_select_layer").hide()
        }
        GetSourceData($('#pared').val(), CurPeriodCharts);
        //列表
        GetAssetByStatus.InitData({ reportingDate: $('#pared').val() });
        GetAssetByStatus.InitData({});
        GetAcumulativeRateByType.InitData("CumulativeBrenchRate");
        GetAcumulativeRateByType.InitData("CumulativePrePaidRate");
    }

    $(function () {
        //Init();
        var timer = null;
        clearTimeout(timer);
        timer = setTimeout(function () {

        },500)
        $('#pared').change(function () {
            GetSourceData($('#pared').val(), CurPeriodCharts);
            GetAssetByStatus.InitData({ reportingDate: $('#pared').val()});
        });
        $(".tab_area").on("click", "li", function () {
            var index = $(this).index();
            $(this).removeClass("active").addClass("active").siblings().removeClass("active");
            if (index == 0) {
                $(".history_view").fadeOut(300);
                $(".current_view").fadeIn(300);
                $(".pared_select_layer").show();
            } else if (index==1) {
                $(".current_view").fadeOut(300);
                $(".history_view").fadeIn(300);
                $(".pared_select_layer").fadeOut(300);
            }
        })
    });
    this.showDialogPage = function (url, title, width, height, fnCallBack) {
        common.showDialogPage(url, title, width, height, fnCallBack);
    }
});