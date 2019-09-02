define(function (require) {
    var $ = require('jquery');
    require('gs/globalVariable');
    var GSDialog = require('gs/uiFrame/js/gs-admin-2.pages');
    var tm = require('gs/childTabModel');
    var common = require('common');
    var taskIndicator = require('gs/taskProcessIndicator');
    var sVariableBuilder = require('gs/sVariableBuilder');
    webProxy = require('gs/webProxy');
    var GlobalVariable = require('globalVariable');
    require('app/projectStage/js/project_interface');
    var echarts = require('echarts')
    var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
    var w = $(".body-container").width() + 10;
    var eachw = w * (1 / 2);
    var h = $("body").height();
    var dish = h - 210;
    $(".chart-box").css({ "width": eachw + "px" });
    $(".chart-display  .chart-box .chart").css("height", dish + "px");
    var len = $(".chart-display").find(".chart-box").length;
    var n = 0;
    len = Math.round(len / 2);
    function canavschange() {
        $("body").on("click", "#next", function () {
            n++;
            if (n > len - 1 && len - 1 != -1) { n = len - 1; }
            $(".chart-display").animate({ "left": -n * w + "px" }, 300, 'linear', function () {
                $(this).css("left", -n * w + "px");
            })
        })
        $("body").on("click", "#prev", function () {
            n--;
            if (n < 0) n = 0;
            $(".chart-display").animate({ "left": -n * w + "px" }, 300, 'linear', function () {
                $(this).css("left", -n * w + "px");
            })
        })
    }
    var chart1 = echarts.init(document.getElementById('chart1'));
    var chart2 = echarts.init(document.getElementById('chart2'));
    var chart3_1 = echarts.init(document.getElementById('chart3_1'));
    var chart3_2 = echarts.init(document.getElementById('chart3_2'));
    canavschange();
    function canvasRender() {
        chart1.resize()
        chart2.resize()
        chart3_1.resize()
        chart3_2.resize()
    }
    function resizehandler() {
        $(".chart-display").css("left", "0px");
        n = 0;
        w = $(".body-container").width() + 10;
        eachw = w * (1 / 2);
        h = $("body").height();
        dish = h - 210;
        $(".chart-box").css({ "width": eachw + "px" });
        $(".chart-display  .chart-box .chart").css("height", dish + "px");
        canvasRender()
    }

    function throttle(method, context) {
        clearTimeout(method.tId);
        method.tId = setTimeout(function () {
            method.call(context);
        }, 100);
    }
    function format(num) {
        return num ? (num.toFixed(2) + '').replace(/\d{1,3}(?=(\d{3})+(\.\d*)?$)/g, '$&,') : '';
    }//千分位显示
    window.onresize = function () {
        throttle(resizehandler, window);
    };
    //获取上面的产品信息等数据
    function GetProductInfo() {
        var UserName = sessionStorage.getItem('gs_UserName')
        var list;
        if (!UserName) {
            return false;
        }
        var executeParam = {
            SPName: 'usp_GetProjectStatistical', SQLParams: [
                { Name: 'UserName', value: UserName, DBType: 'string' },
                { Name: 'ProjectType', value: 0, DBType: 'int' }
            ]
        };
        common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
              list= data;
        });
        
        $.each(list, function (i, v) {
            $(".big-number").eq(0).html(common.numFormt(v.ANO?v.ANO.toString():0))
            $(".big-number").eq(1).html(common.numFormt(v.CPB?v.CPB.toString():0))
            $(".big-number").eq(2).html(v.PRO)
            $(".big-number").eq(3).html(v.TN)
        })
    }
    ////渲染图表
    function RenderEcharts() {
        var list1, list2,list3;
        var UserName = sessionStorage.getItem('gs_UserName')
        if (!UserName) {
            return false;
        }
        //资产类型
        var executeParam = {
            SPName: 'usp_GetProjectAssetStatistical', SQLParams: [
                { Name: 'UserName', value: UserName, DBType: 'string' },
                { Name: 'ProjectType', value: 0, DBType: 'int' }
            ]
        };
        common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
            list1 = data;
        });
        //项目阶段
        var executeParams = {
            SPName: 'usp_GetProjectStatusStatistical', SQLParams: [
                { Name: 'UserName', value: UserName, DBType: 'string' },
                { Name: 'ProjectType', value: 0, DBType: 'int' }
            ]
        };
        common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParams, function (data) {
            list2 = data;
        });
        //预警状态分布
        var executeParamex = {
            SPName: 'usp_GetProjectAlertStatistical', SQLParams: [
                { Name: 'UserName', value: UserName, DBType: 'string' },
                { Name: 'ProjectType', value: 0, DBType: 'int' },
            ]
        };
        common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParamex, function (data) {
            list3 = data;
        });
        var chartOption1 = {
            backgroundColor: '#ffffff',
            title: {
                text: '资产类型分布-资产总规模',
                x: 'center',
                textStyle: {
                    fontFamily: 'Microsoft Yahei',
                    fontSize: 14,
                    fontWeight: '700',
                    top: '10'
                },
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                    type: 'line'      // 默认为直线，可选为：'line' | 'shadow'
                },
                formatter: function (datas) {
                    var res = datas[0].name;
                    var value = datas[0].value;
                    var str = '资产类型' + ":" + res + "<br>";
                    str += '资产总规模' + ":" + format(value) + "元";
                    return str
                }
            },
            legend: {
                data: []
            },
            animation: false,
            grid: {
                left: '3%',
                right: '4%',
                bottom: '10%',
                containLabel: true
            },
            xAxis: [
            {
                type: 'category',
                boundaryGap: true,
                textStyle: {
                    fontsize: 12
                },
                axisTick: {
                    alignWithLabel: true
                },
                "axisLabel": {
                    rotate: 40,
                },
                axisLine: {
                    lineStyle: {
                        color: '#777'
                    }
                }
            }
            ],
            yAxis: [
          {
              type: 'value',
              axisLine: {
                  lineStyle: {
                      color: "#777"
                  }
              },
              axisLabel: {
                  formatter: '{value} （元）'
              }
          },
            ],
            series: [
                {
                    type: 'bar',
                    barWidth: '20',
                    label: {
                        formatter: "{a} {b} {c}",
                        normal: {
                            formatter: '{b}:{c}: ({d}%)',
                            textStyle: {
                                fontWeight: 'normal',
                                fontSize: 12
                            }
                        }
                    },
                    itemStyle: {
                        normal: {
                            color: function (params) {
                                var colorList = ["#ccc", "#66cc99", "#ff6666", "#ccff99", '#ccffcc', '#99cccc', '#fffcc', "#ccccff"]
                                return colorList[params.dataIndex]
                            },
                            shadowOffsetx: 0,
                            shadowOffsetY: 0,
                            shadowColor: "rgba(0,0,0,0.5)",
                            label: {
                                show: false,
                                formatter: '{b} : {c} \n ({d}%)'
                            },
                            labelLine: {
                                show: false
                            }
                        },
                        emphasis: {
                            shadowBlur: 4,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                },
            ]
        }
        var chartOption2 = {
            backgroundColor: '#ffffff',
            title: {
                text: '项目阶段分布',
                x: 'center',
                textStyle: {
                    fontFamily: 'Microsoft Yahei',
                    fontSize: 14,
                    fontWeight: '700',
                    top: '10'
                },
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                    type: 'line'      // 默认为直线，可选为：'line' | 'shadow'
                },
                formatter: function (datas) {
                    var res = datas[0].name;
                    var value = datas[0].value;
                    var str = '项目阶段' + ":" + res + "<br>";
                    str += '项目数量' + ":" + value+"个";
                    return str
                }
            },
            legend: {
                data: []
            },
            animation: false,
            grid: {
                left: '3%',
                right: '4%',
                bottom: '10%',
                containLabel: true
            },
            xAxis: [
            {
                type: 'category',
                boundaryGap: true,
                textStyle: {
                    fontsize: 12
                },
                axisTick: {
                    alignWithLabel: true
                },
                "axisLabel": {
                    rotate: 0,
                },
                axisLine: {
                    lineStyle: {
                        color: '#777'
                    }
                }
            }
            ],
            yAxis: [
          {
              type: 'value',
              name: '项目数量',
              axisLine: {
                  lineStyle: {
                      color: "#777"
                  }
              }
          },

            ],
            series: [
                {
                    type: 'bar',
                    name: '项目数量',
                    barWidth: '20',
                    label: {
                        formatter: "{a} {b} {c}",
                        normal: {
                            formatter: '{b}:{c}: ({d}%)',
                            textStyle: {
                                fontWeight: 'normal',
                                fontSize: 12
                            }
                        }
                    },
                    itemStyle: {
                        normal: {
                            color: function (params) {
                                var colorList = ["#ccc", "#66cc99", "#ff6666", "#ccff99", '#ccffcc', '#99cccc', '#fffcc', "#ccccff"]
                                return colorList[params.dataIndex]
                            },
                            shadowOffsetx: 0,
                            shadowOffsetY: 0,
                            shadowColor: "rgba(0,0,0,0.5)",
                            label: {
                                show: false,
                                formatter: '{b} : {c} \n ({d}%)'
                            },
                            labelLine: {
                                show: false
                            }
                        },
                        emphasis: {
                            shadowBlur: 4,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }
            ]
        }
        var array1 = [];
        var tdata1 = [];//资产总规模
        var tdataS = [];//资产总笔数
        var array2 = [];
        var tdata2 = [];
        var darryX = []//预警X轴
        var darryY=[]//预警Y轴
        $.each(list1, function (i, v) {
            array1.push(v.TDesc);
            tdataS.push(v.ANO);
            tdata1.push(v.CPB)
        })
        $.each(list2, function (i, v) {
            array2.push(v.StatusDesc);
            tdata2.push(v.ProjectCount)
        })
        console.log(list3);
        $.each(list3, function (i, v) {
            darryX.push(v.ProjectAlert);
            darryY.push(v.ProjectCount)
        })
        //资产总规模
        chartOption1.xAxis[0].data = array1;
        chartOption1.series[0].data = tdata1;
        chartOption1.dataZoom = [{
            xAxisIndex: [0],
            type: 'inside',
            show: true,
            start: 0,
            end: 50,
            type: 'slider',
            height: 18,
            bottom: 0,
            fillerColor: 'rgba(144,197,237,0.2)',   // 填充颜色
            handleColor: 'rgba(0,0,0,0.3)',    // 手柄颜色
            borderColor: "#ddd",                     //边框颜色。  
            filterMode: 'filter',
            throttle: 0,
            handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
            handleSize: '80%',
            handleStyle: {
                color: '#fff',
                shadowBlur: 3,
                shadowColor: 'rgba(0, 0, 0, 0.6)',
                shadowOffsetX: 2,
                shadowOffsetY: 2
            },
            backgroundColor: "#f7f7f7", /*背景 */
            dataBackground: { /*数据背景*/
                lineStyle: {
                    color: "#dfdfdf"
                },
                areaStyle: {
                    color: "#dfdfdf"
                }
            },
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

        }];
        chart3_1.setOption(chartOption1);
        //
        //资产总笔数
        chartOption1.xAxis[0].data = array1;
        chartOption1.series[0].data = tdataS
        chartOption1.title.text = '资产总规模-资产总笔数'
        chartOption1.yAxis[0].axisLabel.formatter = '{value} （笔）'
        chartOption1.tooltip.formatter = function (datas) {
            var res = datas[0].name;
            var value = datas[0].value;
            var str = '资产类型' + ":" + res + "<br>";
            str += '资产总笔数' + ":" + format(value) + "笔";
            return str
        }
        chart3_2.setOption(chartOption1);
        //项目阶段分布
        chartOption2.xAxis[0].data = array2;
        chartOption2.series[0].data = tdata2
        chart1.setOption(chartOption2);
        //项目预警
        chartOption2.xAxis[0].data = darryX;
        chartOption2.series[0].data = darryY;
        chartOption2.title.text = '项目预警分布'
        chartOption1.tooltip.formatter = function (datas) {
            var res = datas[0].name;
            var value = datas[0].value;
            var str = '预警状态' + ":" + res + "<br>";
            str += '项目数量' + ":"+ value + "个";
            return str
        }
        chart2.setOption(chartOption2);
        $('#loading').hide();
    }
    GetProductInfo();
    RenderEcharts();
    function changeWidth(obj) {
        var w = $(".main").width();
        obj.css("width", w + "px");
    }
    //阻止grid滚动条的默认行为
    function preventDef(e) {
        e.preventDefault && e.preventDefault();
        e.stopPropagation && e.stopPropagation();
        e.cancelBubble = true;
        e.returnValue = false;
    }
    $(".k-grid-content").scroll(function (e) {
        preventDef(e)
    })
    changeWidth($(".chrome-tabs-shell"));



    //
    $("body").on("click", "#refreshinfo", function () {
        UpdateBaseAssetInfo();
    })




    function UpdateBaseAssetInfo() {
        sVariableBuilder.AddVariableItem('TrustId', '0', 'String', 0, 0, 0);
        var sVariable = sVariableBuilder.BuildVariables();
        var tIndicator = new taskIndicator({
            width: 500,
            height: 550,
            clientName: 'TaskProcess',
            appDomain: 'Task',
            taskCode: 'UpdateBaseAssetInfo',
            sContext: sVariable,
            callback: function () {
                sVariableBuilder.ClearVariableItem();
                $("#modal-close", window.parent.document).trigger("click");
                location.reload(true);
            }
        });
        tIndicator.show();
    }
});