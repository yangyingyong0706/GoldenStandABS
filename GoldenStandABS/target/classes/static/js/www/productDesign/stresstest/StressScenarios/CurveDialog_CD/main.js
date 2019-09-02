define(function (require) {
    var $ = require('jquery');
    require('highcharts');
    require('highchartsexporting');
    require('bootstrap');
    require('bootstrap_table');
    require('bootstrap_table_edit');
    var common = require('common');
    var ko = require('knockout');
    ko.mapping = require('knockout.mapping');
    var GSDialog = require('gsAdminPages');
    var appGlobal = require('App.Global');
    var GlobalVariable = require('globalVariable');
    var enter = common.getQueryString('enter') ? common.getQueryString('enter') : '';
    var lineName = '';
    if (enter == 'PD') {
        lineName = '违约率分布曲线';
    } else if (enter == 'PP') {
        lineName = '早偿率分布曲线';
    } else {
        lineName = '预估循环购买回收分布曲线';
    }
    var dataModel = {
        'zh-CN': {
            Fields: [
               { Text: '常数值', Code: 'ConstantValue', UIType: 'Input', Value: '', Disabled: false },
               { Text: '期数', Code: 'Periods', UIType: 'Input', Value: '12', Disabled: false }
            ],
            DisplayText: {
                Refresh: "刷新曲线", Save: "保存数据", PreCurve: lineName, Percent: '百分比(%)', Clear: '清除', Generate: '生成'
            },
            Methods: {
                Generate: Generate, Clear: Clear, RefreshCurve: RefreshCurve, Save: Save
            }
        },
        'en-US': {
            Fields: [
               { Text: 'ConstantValue', Code: 'ConstantValue', UIType: 'Input', Value: '', Disabled: false },
               { Text: 'Periods', Code: 'Periods', UIType: 'Input', Value: '12', Disabled: false }
            ],
            DisplayText: {
                Refresh: "Refresh Curve", Save: "Save Data", PreCurve: 'Prediction Default Curve', Percent: 'Percent(%)', Clear: 'Clear', Generate: 'Generate'
            },
            Methods: {
                Generate: Generate, Clear: Clear, RefreshCurve: RefreshCurve, Save: Save
            }
        }
    };
    var viewModel;
    var set;
    var currentPeriod = 12;
    var currentValue = '0,0,0,0,0,0,0,0,0,0,0,0';
    var chartOperation = {
        ChartData: [],
        Periods: 0,

        Init: function (rateValue, dftPeriods, way) {
            this.Periods = dftPeriods;
            this.ChartData = rateValue.split(',');

            if (this.ChartData.length > 1) {//已保存数组
                this.Periods = this.ChartData.length;
            } else {//尚未保存数组，仅为单个值
                this.DataFill(rateValue, way);
            }

            this.TableInit();
            this.DrawChart();
            currentValue = this.ChartData.join(',');
            return this.Periods;
        }
        , DataFill: function (rate, way) {
            this.ChartData = [];
            if (way == 'Exponent') {
                for (var i = 0; i < this.Periods; i++) {/*方法二：次方概率*/
                    var localRate = (1 - Math.pow(1 - (rate / this.Periods), i + 1)).toFixed(3);
                    this.ChartData.push(localRate);
                }
            } else {
                for (var i = 0; i < this.Periods; i++) {/*方法一：衡定概率*/
                    var localRate = parseFloat(rate);
                    //var localRate = parseFloat(rate).toFixed(3);
                    this.ChartData.push(localRate);
                }
            }
        }
        , TableInit: function () {
            var tblThs = [];
            var tblCol = {};

            for (var i = 0; i < this.Periods; i++) {
                var fieldName = "ColumnValue_" + i;

                var th = { field: fieldName, title: i + 1, align: 'center' }
                tblThs.push(th);
                tblCol[fieldName] = this.ChartData[i];
            }

            $('#tblRates').bootstrapTable('destroy');
            $('#tblRates').bootstrapTable({
                editable: true,//开启编辑模式
                clickToSelect: false,
                columns: tblThs,
                data: [tblCol]
            });
            //$('#tblRates').bootstrapTable("refresh");
        }
        , DrawChart: function () {
            var self = this;
            var cates = [];
            var seriesData = [];
            for (var i = 0; i < self.Periods; i++) {
                cates.push(i + 1);
                var y = parseFloat(self.ChartData[i]);
                seriesData.push(y)
            }
            $('#divRatesChart').highcharts({
                chart: {
                    type: 'line',
                    height: 300
                },
                title: {
                    text: dataModel[set].DisplayText.PreCurve,
                    style: {
                        "color": "#555",
                        "fontSize": "14px",
                        "fontFamily": "Microsoft Yahei"
                    }
                },
                subtitle: { text: '' },
                xAxis: { categories: cates },
                yAxis: { title: { text: dataModel[set].DisplayText.Percent } },
                tooltip: {
                    enabled: false,
                    formatter: function () {
                        return '<b>' + this.series.name + '</b>' + this.x + ': ' + this.y;
                    }
                },
                plotOptions: { line: { dataLabels: { enabled: true }, enableMouseTracking: false } },
                series: [{ name: ' ', data: seriesData }]
            });
        }
    };
    $(function () {
        var rcvData = GSDialog.getData();
        if (!rcvData) { return; }

        set = common.getLanguageSet();

        var itemCode = rcvData.ItemCode;
        var itemValue = rcvData.ItemValue;

        currentValue = itemValue;

        viewModel = ko.mapping.fromJS(dataModel[set]);
        ko.applyBindings(viewModel, $('#page_main_container').get(0));

        currentPeriod = chartOperation.Init(itemValue, currentPeriod);
        viewModel.Fields()[1].Value(currentPeriod);

        $('#loading').fadeOut();
    });

    $('#ConstantValue').focus(function () {

        if ($('#ConstantValue').val() == "输入数据格式有误") {
            $('#ConstantValue').val("");
        }
    })

    $('#ConstantValue').blur(function () {
        var constantValue = $('#ConstantValue').val();
        var reg = new RegExp("^(([0-9]+\\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\\.[0-9]+)|([0-9]*[1-9][0-9]*))$");
        //非纯数字
        if (constantValue != 0 && constantValue != '' && !reg.test(constantValue)) {
            $('#ConstantValue').val("输入数据格式有误");
        }
    })

    $('#Periods').focus(function () {

        if ($('#Periods').val() == "期数只允许为正整数") {
            $('#Periods').val("");
        }
    })

    $('#Periods').blur(function () {
        var Periods = $('#Periods').val();
        var reg = new RegExp("^[0-9]*[1-9][0-9]*$");
        //非纯数字
        if (Periods != 0 && Periods != '' && !reg.test(Periods)) {
            $('#Periods').val("期数只允许为正整数");
        }
    })
    function RefreshCurve() {

        var rateValue = '';

        rateValue = [];
        $('#tblRates tbody tr td').each(function () {
            rateValue.push($(this).text());
        });
        //chartOperation1.DrawChart();
        chartOperation.Init(rateValue.join(','), currentPeriod);
        //console.log(currentValue);
    }

    function Save() {
        var rateValue = [];
        $('#tblRates tbody tr td').each(function () {
            rateValue.push($(this).text());
        });
        currentValue = rateValue.join(',');
        var result = { isSave: true, data: currentValue }
        GSDialog.close(result);
    }

    function Clear() {
        chartOperation.Init('0', currentPeriod);
    }

    function Generate() {

        var constantValue = $('#ConstantValue').val();
        //var Periods = $('#Periods').val();
        if (constantValue == '' || constantValue == "输入数据格式有误") {
            $('#ConstantValue').addClass('red-border');
            return;
        }
        $('#ConstantValue').removeClass('red-border');

        //viewModel.Fields1()[1].Value(0);
        currentPeriod = $('#Periods').val();
        if (currentPeriod == '' || currentPeriod == "期数只允许为正整数") {
            $('#Periods').addClass('red-border');
            return;
        }
        chartOperation.Init(constantValue, currentPeriod);
    }


    $(window).bind("keydown", function () { cellkeydown(event); });
    function cellkeydown(event) {
        if (event.ctrlKey && event.keyCode == 86) {
            var $el = $(event.srcElement);
            if ($el.parents('#tblRates').length < 1) {
                return;
            }

            var ss = document.getElementById("textArea");
            ss.focus();
            ss.select();
            setTimeout("dealwithData()", 50);
        }
    }
    function dealwithData(event) {
        var ss = document.getElementById("textArea");
        ss.blur();

        var str = ss.value;
        var rows = str.split(/[\n\f\r]/)
        var rowCells;
        if (rows && rows.length > 0) {
            rowCells = rows[0].split(/[\t]/);
        }
        //for (i = 0; i < arr.length; i++) {
        //    rowCells = arr[i].split(/[\t]/);
        //}

        if (rowCells && rowCells.length) {
            $.each(rowCells, function (i, v) {
                var selector = '#tblRates .editable-select input[type="text"]:nth(' + i + ')';
                $(selector).val(v);
            });
        }
    }
});