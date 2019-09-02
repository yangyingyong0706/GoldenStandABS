define(function (require) {
    var $ = require('jquery');
    //require('jquery.cookie');
    //var ko = require('knockout');
    var common = require('gs/uiFrame/js/common');
    var echarts = require('echarts');
    var webProxy = require('gs/webProxy');
    //var RoleOperate = require('gs/roleOperate');
    var GlobalVariable = require('gs/globalVariable');
    $(function () {
        var TargetSqlConnection, currenRateX;
        function format(num) {
            return (num.toFixed(2) + '').replace(/\d{1,3}(?=(\d{3})+(\.\d*)?$)/g, '$&,');
        }
        //连接动态库server存在DAL_SEC_PoolConfig.config.PoolHeade这张表里面
        var PoolId = common.getQueryString('PoolId');
        var executeParam = { SPName: 'config.usp_GetPoolHeaderById', SQLParams: [] };
        executeParam.SQLParams.push({ Name: 'PoolId', Value: PoolId, DBType: 'int' });

        var executeParams = encodeURIComponent(JSON.stringify(executeParam));
        var serviceUrl = GlobalVariable.PoolCutServiceURL + 'CommonGet?connName=DAL_SEC_PoolConfig&exeParams=' + executeParams;

        webProxy.callWCFSvc(serviceUrl, false, 'GET', function (data) {
            console.log(data)
            var poolHeader = data[0];
            TargetSqlConnection = poolHeader.TargetSqlConnection;
        })

        //获取RemainingTermdata
        var executeParamss = { SPName: 'dbo.usp_GetRemainingTermData', SQLParams: [] };
        executeParamss.SQLParams.push({ Name: 'PoolId', value: PoolId, DBType: 'int' });
        var executeParamsss = encodeURIComponent(JSON.stringify(executeParamss));
        var serviceUrls = GlobalVariable.PoolCutServiceURL
            + 'CommonGetWithConnStr?connStr={0}&exeParams={1}'.format(encodeURIComponent(TargetSqlConnection), executeParamsss);

        webProxy.callWCFSvc(serviceUrls, true, 'GET', function (response) {
            RemainingTermx = response;
            //绑定横轴数据
            function RemainingTermXData(RemainingTermx) {
                var DistributionsDescAry = [];
                $.each(RemainingTermx, function (i, v) {
                    DistributionsDescAry.push(v.RemainingTerms);
                })
                return DistributionsDescAry
            }

            function DistributionsDescAryY(RemainingTermx) {
                var DistributionsDescAryYY = [];
                $.each(RemainingTermx, function (i, v) {
                    DistributionsDescAryYY.push(v.CurrentPrincipalBalance);
                })
                return DistributionsDescAryYY
            }

            // 基于准备好的dom，初始化echarts实例
            var myChart = echarts.init(document.getElementById('main'));

            // 指定图表的配置项和数据
            var option = {
                title: {
                    text: 'RemainingTerm分布区间',
                    x: 'center',
                    textStyle: {
                        fontFamily: 'Microsoft Yahei',
                        fontSize: 14,
                        fontWeight: '700',
                    },
                },

                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '20%',
                    containLabel: true
                },

                tooltip: {
                    trigger: 'axis',
                    axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                        type: 'line'      // 默认为直线，可选为：'line' | 'shadow'
                    },
                    formatter: function (datas) {
                        var res = datas[0].name;
                        var value = datas[0].value;
                        var str = "RemainingTerm分布区间" + ":" + res + "<br>";
                        str += "资产总额" + ":" + format(value) + "(元)";
                        return str
                    }
                },

                legend: {
                    data: ['分布区间']
                },
                xAxis: {
                    data: RemainingTermXData(RemainingTermx),
                    axisLabel: {
                        interval: 0,
                        rotate: 30
                    },
                },
               
                yAxis: [
                  {
                      type: 'value',
                      axisLine: {
                          lineStyle: {
                              color: "#777"
                          }
                      }
                  }],

                legend: {
                    orient: 'vertical',
                    left: 'left'
                },

                series: [
                        {
                            data: DistributionsDescAryY(RemainingTermx),
                            name: '资产总额',
                            type: 'bar',
                            barWidth: "20",
                            label: {
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
                                        var colorList = ['#ccffcc', '#99cccc', '#fffcc', "#ccccff", "#ccc", "#66cc99", "#ff6666", "#ccff99"]
                                        return colorList[params.dataIndex]
                                    },
                                    label: {
                                        show: false,
                                        formatter: '{b} : {c} \n ({d}%)'
                                    },
                                    labelLine: {
                                        show: true
                                    }
                                },

                                emphasis: {
                                    shadowBlur: 10,
                                    shadowOffsetX: 0,
                                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                                }
                            }
                        }
                ]
            };

            // 使用刚指定的配置项和数据显示图表。
            myChart.setOption(option);
        });

    })

})