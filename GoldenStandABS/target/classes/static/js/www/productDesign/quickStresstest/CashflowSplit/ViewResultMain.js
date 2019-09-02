define(function (require) {
    var $ = require('jquery');
    require('jquery-ui');
    var highcharts = require('highcharts');
    var highchartsexporting = require('highchartsexporting');
    var GlobalVariable = require('globalVariable');
    var common = require('common');
    var webProxy = require('gs/webProxy');
    var Vue = require('Vue');
    require('jquery.datagrid');
    require('jquery.datagrid.options');
    var webStore = require('gs/webStorage');
    var GSDialog = require("gsAdminPages")
    var vm;
    var TrustId = common.getQueryString('tid');
    var poolIds = common.getQueryString('poolIds') ? common.getQueryString('poolIds') : '';
    var reportingDateId = common.getQueryString('reportingDateId') ? common.getQueryString('reportingDateId') : '';
    var scheduleDateId = common.getQueryString('scheduleDateId') ? common.getQueryString('scheduleDateId') : '';
    var schedulePurpose = common.getQueryString('schedulePurpose') ? common.getQueryString('schedulePurpose') : 0;//0-表示拆分工具
    var btnTexts = ['查看已选定组合', '返回'];

    $(function () {
        initVue();
        initData();
        registEvent();
    });

    function initData() {
        getOptionsData(); //获取资产池选项的数据
        Highcharts.setOptions(vm.theme); //初始化highcharts主题
    }
    function initVue() {
        vm = new Vue({
            el: '#app',
            data: {
                chkOptions: [],//资产池选择框
                chkData: [],
                hchartCombo: [],
                hchartSource: [],
                countDate: [],
                dataSelected: [],
                btnViewOrbackText: btnTexts[0],
                chkLastComboData: [],//已选定组合的数据源
                hchartLastComboSource: [],//选中的已选定组合的资产池组合的数据源
                isInLastCombo: false,//是否在查看已选定组合
                chkLastComboOptions: [],//已选定组合资产池选择框
                lastHchartCombo: [],//已选定组合资产池选择框的选择组合
                poolStatus: [{ value: 0, text: '未入池' }, { value: 1, text: '已入池' }, { value: 2, text: '全部' }],
                theme: {
                    colors: ["#7cb5ec", "#f7a35c", "#aaeeee", "#7798BF", "#ff0066", "#90ee7e", "#eeaaee", "#55BF3B", "#DF5353", "#7798BF", "#aaeeee"],
                    chart: { backgroundColor: null, style: { fontFamily: "Dosis, sans-serif" } },
                    credits: { enabled: false },
                    title: { style: { fontSize: '16px', fontWeight: 'bold', textTransform: 'uppercase' } },
                    tooltip: { borderWidth: 0, backgroundColor: 'rgba(219,219,216,0.8)', shadow: false },
                    legend: { itemStyle: { fontWeight: 'bold', fontSize: '13px' } },
                    xAxis: { gridLineWidth: 1, labels: { style: { fontSize: '12px' } } },
                    yAxis: { minorTickInterval: 'auto', title: { style: { textTransform: 'uppercase' } }, labels: { style: { fontSize: '12px' } } },
                    plotOptions: { candlestick: { lineColor: '#404048' } },
                    background2: '#F0F0EA'
                }
            },
            methods: {
                pushDataByPoolId: function (poolid, status) { //获取勾选的PoolId对应的数据
                    var _this = this;
                    _this.chkData.forEach(function (v, i) {
                        if (v.PoolId == poolid && v.Purpose == status) _this.dataSelected.push(v);
                    });
                },
                pushLastComboDataByPoolId: function (poolid, status) {//获取勾选的已选定组合的PoolId对应的数据
                    var _this = this;
                    _this.chkLastComboData.forEach(function (v, i) {
                        if (v.PoolId == poolid && v.Purpose == status) _this.dataSelected.push(v);
                    });
                },
                getSumByEndDate: function (enddate, data) { //获取每个结束日期的数据
                    var startDate = '',
                        sumInterestAmount = 0,
                        sumPrincipalAmount = 0,
                        sumInitialAmount = 0,
                        sumCloseAmount = 0;//利息，本金，期初本金总额，期末本金总额
                    data.forEach(function (v, i) {
                        if (v.EndDate == enddate) {
                            if (!startDate) {
                                //同一个结束日期只给startDate赋值一次
                                startDate = v.StartDate;
                            }
                            sumInterestAmount = FloatAdd(sumInterestAmount, v.InterestAmount);
                            sumPrincipalAmount = FloatAdd(sumPrincipalAmount, v.PrincipalAmount);
                            sumInitialAmount = FloatAdd(sumInitialAmount, v.InitialAmount);
                            sumCloseAmount = FloatAdd(sumCloseAmount, v.CloseAmount);

                            //sumInterestAmount += parseFloat(v.InterestAmount);
                            //sumPrincipalAmount += parseFloat(v.PrincipalAmount);
                            //sumInitialAmount += parseFloat(v.InitialAmount);
                            //sumCloseAmount += parseFloat(v.CloseAmount);
                        };
                    });
                    return {
                        StartDate: startDate,
                        EndDate: enddate,
                        InterestAmount: sumInterestAmount,
                        PrincipalAmount: sumPrincipalAmount,
                        InitialAmount: sumInitialAmount,
                        CloseAmount: sumCloseAmount
                    };
                },
                pushCountOfDate: function (data) { //找出data里面有多少日期
                    var _this = this;
                    if (data) {
                        if ($.inArray(data.EndDate, _this.countDate) < 0) {
                            _this.countDate.push(data.EndDate);
                        }
                    }
                },
                confirmCombo: function () {//选定
                    var _this = this;

                    //清空已选定组合数据
                    _this.chkLastComboData = [];
                    _this.hchartLastComboSource = [];
                    _this.chkLastComboOptions = [];

                    var poolList = ''; //组织资产列表xml
                    if (_this.hchartCombo && _this.hchartCombo.length > 0) {
                        poolList += '<Pools>';
                        _this.hchartCombo.forEach(function (v, i) {
                            var _dimReportingDateId = getDimReportingDateIdByPoolId(v);
                            poolList += '<Pool><Id>{0}</Id><DimReportingDateId>{1}</DimReportingDateId></Pool>'.format(v, _dimReportingDateId);
                        });
                        poolList += '</Pools>';
                    }

                    else {
                        GSDialog.HintWindow('请先选择资产池');
                        return;
                    }
                    function startwork() {
                        executeParam = {
                            SPName: 'usp_RegisterCurrentPaymentSchedule', SQLParams: [
                                {
                                    Name: 'TrustId', value: TrustId, DBType: 'int'
                                },
                                {
                                    Name: 'PoolList', value: poolList.indexOf('Id') > 0 ? poolList : '', DBType: 'xml'
                                },
                                {
                                    Name: 'SchedulePurpose', value: schedulePurpose, DBType: 'int'
                                },  //0-拆分工具
                                { Name: 'ScheduleDateId', value: scheduleDateId, DBType: 'int' }
                            ]
                        };

                        var schedulePurposeKey = TrustId + '_SchedulePurpose';
                        var scheduleDateIdKey = TrustId + '_ScheduleDateId';
                        webStore.removeItem(schedulePurposeKey);
                        webStore.removeItem(scheduleDateIdKey);
                        webStore.setItem(schedulePurposeKey, schedulePurpose);
                        webStore.setItem(scheduleDateIdKey, scheduleDateId);

                        common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function () {
                            GSDialog.HintWindow('选定成功');
                        });
                    }
                    var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
                    var executeParam;
                    var isConfirmCombo = false;
                    if (schedulePurpose == 0) {
                        executeParam = {
                            SPName: 'usp_ComfirmPaymentScheduleData', SQLParams: [
                                { Name: 'TrustId', value: TrustId, DBType: 'int' }
                            ]
                        };
                        common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
                            if (data && data[0].ScheduledateId) {
                                if (data[0].ScheduledateId == 1) {
                                    startwork();
                                } else if (data[0].ScheduledateId.toString().length == 8) {
                                    scheduleDateId = data[0].ScheduledateId;
                                    var temp = scheduleDateId.toString().substr(0, 4) + '-' + scheduleDateId.toString().substr(4, 2) + '-' + scheduleDateId.toString().substr(6, 2);
                                    GSDialog.HintWindowTF("当日无归集数据,是否使用{0}的数据".format(temp), function () {
                                        startwork();
                                    }, function () {
                                        GSDialog.HintWindow('请重新拆分相应数据');
                                    })
                                } else {
                                    GSDialog.HintWindow('注册日期有误！');
                                    return;
                                }
                            } else {
                                GSDialog.HintWindow('数据错误！');
                                return;
                            }
                        });
                    } else {
                        startwork();
                    }
                },
                viewOrbackLastCombo: function () {//查看已选定组合（取消查看）
                    var _this = this;
                    if (!_this.isInLastCombo) {//查看已选定组合
                        _this.isInLastCombo = true;
                        _this.btnViewOrbackText = btnTexts[1];
                        if (!_this.chkLastComboData.length > 0) {//没有查看过已选定组合，数据源为空
                            var svcUrl = webProxy.dataProcessServiceUrl + "CommonGetExecute?connConfig=TrustManagement&appDomain=Asset&executeParams=";
                            var params = [
                                ["TrustId", TrustId, "int"],
                                ["SchedulePurpose", schedulePurpose, "int"],
                                ["ScheduleDateId", scheduleDateId, "int"]
                            ];
                            var promise = webProxy.comGetData(params, svcUrl, 'usp_getLastComboCollection');
                            promise().then(function (response) {
                                var sourceData;
                                if (typeof response === 'string') { sourceData = JSON.parse(response); }
                                else {
                                    sourceData = response;
                                }
                                _this.chkLastComboData = sourceData;
                                if (_this.chkLastComboData.length > 0) {
                                    var temp = [];
                                    _this.chkLastComboData.forEach(function (v, i) {
                                        if ($.inArray(v.PoolId, temp) < 0) {
                                            temp.push(v.PoolId);
                                            if (v.PoolId == -1) {
                                                _this.chkLastComboOptions.push({ type: '基础池', text: changeToDate('-', v.DimReportingDateId.toString()), id: -1, dimreportingdateid: v.DimReportingDateId, sel: 1 })
                                            } else {
                                                _this.chkLastComboOptions.push({ type: '资产池', text: v.PoolId, id: v.PoolId, dimreportingdateid: v.DimReportingDateId, sel: 0 });
                                            }
                                        }
                                    });
                                }
                            });
                        }
                        _this.redraw();
                    } else {//返回
                        _this.isInLastCombo = false;
                        _this.btnViewOrbackText = btnTexts[0];
                        _this.redraw();
                    }

                },
                drawHchart: function (domId, data) { //绘制图表
                    //组织图表参数
                    var options = {
                        title: '现金流图',
                        type: 'column',
                        xRow: data.map(function (v) { return /\//g.test(v.EndDate) ? common.getStringDate(v.EndDate).dateFormat('yyyy-MM-dd') : v.EndDate; }),
                        yTitle: '本金及利息',
                        series: [{
                            name: '利息', data: data.map(function (v) { return v.InterestAmount; })
                        },
                                 { name: '本金', data: data.map(function (v) { return v.PrincipalAmount; }) }]
                    }
                    var hchartOptions = {
                        title: {
                            text: options.title || ''
                        },
                        chart: {
                            type: options.type
                        },
                        xAxis: {
                            categories: options.xRow
                        },
                        yAxis: {
                            min: 0,
                            title: {
                                text: options.yTitle
                            },
                            stackLabels: {
                                enabled: false,
                                style: {
                                    fontWeight: 'bold', color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
                                }
                            }
                        },
                        legend: {
                            align: 'right', x: -25, y: -3, verticalAlign: 'top',
                            floating: true, borderWidth: 1, borderColor: '#CCC', shadow: false,
                            backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || 'white'
                        },
                        tooltip: {
                            headerFormat: '<b>{point.x}</b><br/>',
                            pointFormat: '{series.name}: {point.y:.0f}<br/>共计: {point.stackTotal:.0f}'
                        },
                        plotOptions: {
                            column: {
                                stacking: 'normal',
                                dataLabels: {
                                    enabled: false, style: {
                                        textShadow: '0 0 3px black'
                                    },
                                    color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white'
                                }
                            }
                        },
                        series: options.series
                    }
                    $(domId).highcharts(hchartOptions);
                },
                redraw: function () {//监视资产池组合变化,重新生成hchart,代码逻辑有待优化
                    var _this = this;
                    _this.dataSelected = [];//先清空已选checkbox对应数据的日期数组
                    var newDataSource = [];
                    var selectedCombo = [];
                    if (!_this.isInLastCombo) {
                        if (_this.hchartCombo.length > 0) {
                            _this.hchartCombo.forEach(function (v, i) {
                                var status = '';
                                _this.chkOptions.forEach(function (v2, i) {
                                    if (v2.id == v) {
                                        status = v2.sel;
                                        return;
                                    }
                                });
                                _this.pushDataByPoolId(v, status);
                            });
                        }
                    } else {//在查看已选定组合界面
                        if (_this.lastHchartCombo.length > 0) {
                            _this.lastHchartCombo.forEach(function (v, i) {
                                var status = '';
                                _this.chkLastComboOptions.forEach(function (v2, i) {
                                    if (v2.id == v) {
                                        status = v2.sel;
                                        return;
                                    }
                                });
                                _this.pushLastComboDataByPoolId(v, status);
                            });
                        }
                    }

                    if (_this.dataSelected.length > 0) { //所选中的资产池组合有多少个不同日期
                        _this.countDate = [];
                        _this.dataSelected.forEach(function (v, i) {
                            _this.pushCountOfDate(v);
                        });
                        //console.log(_this.countDate)
                    }
                    if (_this.countDate.length > 0) {
                        _this.countDate.forEach(function (v, i) {
                            var temp = _this.getSumByEndDate(v, _this.dataSelected);
                            newDataSource.push(temp);
                        });
                    }
                    if (!_this.isInLastCombo) {
                        _this.hchartSource = newDataSource;
                        if (_this.hchartSource.length > 0) {
                            _this.drawHchart('#hCharts', _this.hchartSource);
                            _this.bindListView('#hChartsList', _this.hchartSource);
                        }
                    } else {
                        _this.hchartLastComboSource = newDataSource;
                        if (_this.hchartLastComboSource.length > 0) {
                            _this.drawHchart('#hCharts', _this.hchartLastComboSource);
                            _this.bindListView('#hChartsList', _this.hchartLastComboSource);
                        }
                    }
                },
                selChange: function (poolId) {
                    var _this = this;
                    var isRedraw = false;
                    var selectedCombo = [];
                    if (!_this.isInLastCombo) {
                        selectedCombo = _this.hchartCombo;
                    } else {//在查看已选定组合界面
                        selectedCombo = _this.lastHchartCombo;
                    }
                    if (selectedCombo.length > 0) {
                        selectedCombo.forEach(function (v, i) {
                            //如果修改的purpose的select对应的checkbox没有勾选，就不重新画hchart(isRedraw=false)
                            if (poolId == v) {
                                isRedraw = true;
                                return;
                            }
                        });
                    }
                    if (isRedraw) _this.redraw();
                },
                bindListView: function (domId, data) {
                    if ($(domId).datagrid("datagrid"))
                        $(domId).datagrid("destroy");
                    data.map(function (row) {
                        if (/\/Date/g.test(String(row.StartDate)))
                            row.StartDate = common.getStringDate(row.StartDate).dateFormat('yyyy-MM-dd');
                        if (/\/Date/g.test(String(row.EndDate)))
                            row.EndDate = common.getStringDate(row.EndDate).dateFormat('yyyy-MM-dd');
                    });
                    $(domId).datagrid({
                        data: data,
                        col: [{
                            field: "StartDate", title: "开始时间", sortable: true, attrHeader: settable.tableTh, attr: settable.tableTd
                        }
                            , {
                                field: "EndDate", title: "结束时间", sortable: true, attrHeader: settable.tableTh, attr: settable.tableTd
                            }
                            , {
                                field: "InitialAmount", title: "期初剩余本金总额", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd
                            }
                            , {
                                field: "PrincipalAmount", title: "本金", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd
                            },
                              {
                                   field: "InterestAmount", title: "利息", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd
                            }
                            , {
                                field: "CloseAmount", title: "期末剩余本金总额", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd
                            }
                        ],
                        attr: 'mytable',
                        paramsDefault: {
                            paging: 12
                        },
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
            },
            watch: {
                hchartCombo: function () {//监视资产池组合变化
                    var _this = this;
                    if (!_this.isInLastCombo) _this.redraw();
                },
                lastHchartCombo: function () {
                    var _this = this;
                    if (_this.isInLastCombo) _this.redraw();
                }
            }
        });
    }


    //获取checkbox初始化数据
    function initChkOptions() {
        if (reportingDateId) {
            vm.chkOptions.push({ type: '基础池', text: reportingDateId, id: -1, dimreportingdateid: reportingDateId, sel: 1 });
        }
        if (poolIds) {
            var arrPoolIds = poolIds.trim().split('|');
            if (arrPoolIds.length > 0) {
                for (var i = 0; i < arrPoolIds.length; i++) {
                    var temp = arrPoolIds[i].trim().split(',');
                    if (temp.length > 1) {
                        vm.chkOptions.push({ type: '资产池', text: temp[0], id: temp[0], dimreportingdateid: temp[1], sel: 0 });
                    }
                }
            }
        }
    }


    //获取资产池组合的数据
    function getOptionsData() {
        initChkOptions(); //初始化checkbox选项

        var poolList = ''; //组织资产列表xml
        if (vm.chkOptions.length > 0) {
            poolList += '<Pools>';
            for (var i = 0; i < vm.chkOptions.length; i++) {
                if (vm.chkOptions[i].type == '资产池') {
                    poolList += '<Pool><Id>{0}</Id><DimReportingDateId>{1}</DimReportingDateId></Pool>'.format(vm.chkOptions[i].id, vm.chkOptions[i].dimreportingdateid);
                }
                else {
                    //type=='基础池'
                    if (poolList.indexOf('-1') < 0) {
                        //不存在基础池
                        poolList += '<Pool><Id>-1</Id><DimReportingDateId>{0}</DimReportingDateId></Pool>'.format(reportingDateId);
                    }
                }
            }
            poolList += '</Pools>';
        }

        var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
        var executeParam = {
            SPName: 'usp_getCashflowCollection', SQLParams: [
                { Name: 'TrustId', value: TrustId, DBType: 'int' },
                { Name: 'PoolList', value: poolList, DBType: 'xml' },
                { Name: 'SchedulePurpose', value: schedulePurpose, DBType: 'int' } //0-拆分工具
                , { Name: 'ScheduleDateId', value: scheduleDateId, DBType: 'int' }
            ]
        };
        common.ExecuteGetData(false, svcUrl, 'asset', executeParam, function (data) {
            vm.chkData = data
        });
    }

    function registEvent() {
        $('.tab-switch').click(function () {
            $(this).addClass('titlecur').siblings().removeClass('titlecur');
            var view = $(this).attr('data-view');
            if (view) {
                $(view).show().siblings('.viewcontainer').hide();
            }
        });
    }

    function getDimReportingDateIdByPoolId(_poolid) {
        var _dimreportingdateid = '';
        vm.chkOptions.forEach(function (v, i) {
            if (v.id == _poolid) {
                _dimreportingdateid = v.dimreportingdateid;
            }
        });
        return _dimreportingdateid;
    }

    //浮点数加法运算
    function FloatAdd(arg1, arg2) {
        var r1, r2, m;
        try { r1 = arg1.toString().split(".")[1].length } catch (e) { r1 = 0 }
        try { r2 = arg2.toString().split(".")[1].length } catch (e) { r2 = 0 }
        m = Math.pow(10, Math.max(r1, r2));
        n = (r1 >= r2) ? r1 : r2;
        return parseFloat(((arg1 * m + arg2 * m) / m).toFixed(n));
    }

    //yyyyMMdd转成指定形式，如yyyy-MM-dd
    function changeToDate(spe, strDate) {
        if (strDate.length != 8) {
            return;
        }
        var y = strDate.substring(0, 4);
        var m = strDate.substring(4, 6);
        var d = strDate.substring(6, 8);

        spe = spe.trim();

        return y + spe + m + spe + d;
    }
    //function isExistByPoolId(poolId, obj) {
    //    var isExist = false;
    //    if (obj.length > 0) {
    //        for (var i = 0; i < obj.length; i++) {
    //            if (obj[i].PoolId == poolId) {
    //                isExist = true;
    //                break;
    //            }
    //        }
    //    }
    //    return isExist;
    //}
});