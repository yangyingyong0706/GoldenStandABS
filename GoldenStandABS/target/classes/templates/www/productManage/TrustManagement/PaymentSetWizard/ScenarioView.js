/// <reference path="PaymentSetWizard.js" />
/// <reference path="PaymentSetWizard.html" />
define(function (require) {
    var common = require('common');
    var appGlobal = require('App.Global');
    var d3 = require('d3');
    var dagreD3 = require('dagreD3');
    var Vue = require("Vue2");
    var appGlobal = require('App.Global');
    var GlobalVariable = require('globalVariable');
    var webProxy = require("webProxy");
    var trustId = common.getUrlParam('tid');
    var adminDiaLog = require('gs/uiFrame/js/gs-admin-2.pages');
    $(function () {
        var vm = new Vue({
            el: "#App",
            data: {
                Common: common,
                AppGlobal: appGlobal,
                GlobalVariable: GlobalVariable,
                AdminDiaLog: adminDiaLog,
                WebProxy: webProxy,
                svcUrl: GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?",
                TrustId: trustId,
                AllData:[],//所有数据
                PriodDate: []//循环期
                , CycleDate: []//摊还期
            },
            mounted: function () {
                this.Render();
            },
            updated: function () {
                //this.SelectDate();
            },
            methods: {
                Render: function () {
                    this.getScenarioListByTrustId();
                    this.drawView(this.ViewData())
                },
                //专项对应的偿付情景和事件
                getScenarioListByTrustId: function () {
                    var self = this;
                    var executeParam = {
                        'SPName': "usp_GetPaymentScenarioViewData", 'SQLParams': [
                            { 'Name': 'TrustId', 'Value': self.TrustId, 'DBType': 'int' }
                        ]
                    };
                    var serviceUrl = self.GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
                    self.Common.ExecuteGetData(false, serviceUrl, 'TrustManagement', executeParam, function (data) {
                        self.AllData = data;
                        $.each(data, function (i, v) {
                            //循环期数据
                            if (v.IsTopUpA == '循环期') {
                                self.CycleDate.push(v)
                            } else if (v.IsTopUpA == '摊还期') {
                                self.PriodDate.push(v)
                            } 
                        })
                    });
                },
                drawView: function (data) {
                    var self = this;

                    function getData(data) {
                        var Allname=[];
                        $.each(data, function (i, v) {
                            if (v.dataList.length) {
                                g.setNode(v.Code, { label: v.DisplayName, shape: 'ellipse', style: "fill:#888", Discraption: '' });//第一个节点
                                $.each(v.dataList, function (i2, v2) {
                                    if (v2.IsShow == 'Y') {
                                        if (v2.ScenarioStatus == 'Y') {
                                            g.setNode(v2.Name+i2, { label: v2.DisplayName, style: "fill:#6fecea", Discraption: v2.Discraption });//第二个节点
                                            g.setEdge(v.Code, v2.Name + i2, { curve: d3.curveLinear })
                                        } else {
                                            g.setNode(v2.Name + i2, { label: v2.DisplayName, style: "fill:#d6d4d3", Discraption: v2.Discraption });//第二个节点
                                            g.setEdge(v.Code, v2.Name + i2, { curve: d3.curveLinear })
                                        }
                                    }
                                        //g.setEdge(v.Code, v2.Name+i2, { curve: d3.curveLinear })
                                        $.each(v2.Scenarios, function (i3, v3) {
                                            if (v3.Name.indexOf(v2.Name)>-1) {
                                                if (v3.ScenarioStatus == 'Y') {
                                                    g.setNode(v3.Name + i3, { label: v3.DisplayName, style: "fill:#6fecea;color:#fff", Discraption: v3.Discraption });//第三个节点
                                                    g.setEdge(v2.Name + i2, v3.Name + i3, { curve: d3.curveLinear })
                                                    } else {
                                                    g.setNode(v3.Name + i3, { label: v3.DisplayName, style: "fill:#d6d4d3", Discraption: v3.Discraption });//第三个节点
                                                    g.setEdge(v2.Name + i2, v3.Name + i3, { curve: d3.curveLinear })
                                                }
                                            }
                                        })
                                    //if (v2.ScenarioStatus == 'Y') {
                                    //    g.setNode(v2.Name , { label: v2.DisplayName, style: "fill:#6fecea", Discraption: v2.Discraption });//第二个节点
                                    //    g.setEdge(v.Code, v2.Name, { curve: d3.curveLinear })
                                    //    $.each(v2.Scenarios, function (i3, v3) {
                                    //        var INAllName=self.InArray(v3.Name,Allname)
                                    //        if (INAllName == -1) {
                                    //            Allname.push(v3.Name)
                                    //            if (v3.ScenarioStatus == 'Y') {
                                    //                g.setNode(v3.Name, { label: v3.DisplayName, style: "fill:#6fecea;color:#fff", Discraption: v3.Discraption });//第三个节点
                                    //                g.setEdge(v2.Name, v3.Name, { curve: d3.curveLinear })
                                    //            } else {
                                    //                g.setNode(v3.Name, { label: v3.DisplayName, style: "fill:#d6d4d3", Discraption: v3.Discraption });//第三个节点
                                    //                g.setEdge(v2.Name, v3.Name, { curve: d3.curveLinear })
                                    //            }
                                    //        }

                                    //    })
                                    //} else {
                                    //    g.setNode(v2.Name, { label: v2.DisplayName, style: "fill:#d6d4d3", Discraption: v2.Discraption });//第二个节点
                                    //    g.setEdge(v.Code, v2.Name, { curve: d3.curveLinear })
                                    //    $.each(v2.Scenarios, function (i3, v3) {
                                    //        var INAllName=self.InArray(v3.Name,Allname)
                                    //        if (INAllName == -1) {
                                    //            Allname.push(v3.Name);
                                    //            if (v3.ScenarioStatus == 'Y') {
                                    //                g.setNode(v3.Name, { label: v3.DisplayName, style: "fill:#6fecea;color:#fff", Discraption: v3.Discraption });//第三个节点
                                    //                g.setEdge(v2.Name, v3.Name + 's', { curve: d3.curveLinear })
                                    //                } else {
                                    //                g.setNode(v3.Name, { label: v3.DisplayName, style: "fill:#d6d4d3", Discraption: v3.Discraption });//第三个节点
                                    //                g.setEdge(v2.Name, v3.Name + 's', { curve: d3.curveLinear })
                                    //                }
                                    //        }

                                    //    })

                                    //}
                                   
                                    
                                })
                            }

                        })
                    }
                    var g = new dagreD3.graphlib.Graph({ compound: true }).setGraph({})
                    .setDefaultEdgeLabel(function () { return {}; });
                    //var root = { Code: 'root', DisplayName: '开始' }
                    //g.setNode(root.Code, { label: root.DisplayName, style: "fill:#16c75a;color:#fff" });
                    getData(data)
                    var svg = d3.select('svg'),
                        inner = svg.select('g')
                    var zoom = d3.zoom().on("zoom", function () {
                        inner.attr("transform", d3.event.transform);
                    });
                    svg.call(zoom);
                    var render = new dagreD3.render();
                    render(inner, g);
                    inner.selectAll("g.node")
                      .attr("title", function (v) {
                          return g.node(v).Discraption && g.node(v).Discraption
                      })
                      .each(function (v) {
                          //$(this).tipsy({ gravity: "w", opacity: 1, html: true 
                          //});
                      });
                    //Svg配置视图样式
                    var svgOption = {
                        height: 400,
                        width: 1000,
                        Color: "#333"
                    }
                    // Center the graph
                    var initialScale = 0.85;//放大倍数
                    svg.call(zoom.transform, d3.zoomIdentity.translate((svg.attr("width") - g.graph().width * initialScale) / 2, 20).scale(initialScale));
                    svg.attr('height', svgOption.height)
                       .style('fill', function (node) {
                           var color;//文字颜色
                           color = svgOption.Color;
                           return color;
                       })
                        .attr('width', svgOption.width)
                    //.attr('markerUnits', "userSpaceOnUse")
                    //.attr("viewBox", "10 10 10 0")//坐标系的区域
                    //.attr("refX", 100)//箭头坐标
                },
                //判断元素是否存在数组中
                InArray: function (val, array) {
                    var self = this;
                    var InArrayVal;
                    if (array.length == 0) {
                        InArrayVal = -1;
                    } else {
                        if ($.inArray(val, array) == -1) {
                            InArrayVal = -1;
                        } else {
                            InArrayVal = 0;
                        }
                    }
                    return InArrayVal;
                },
                ViewData: function () {
                    var getViewData = [{
                        Code: 'ViewStatus',
                        DisplayName: '开始',
                        dataList: [{
                            Name: 'Cycle',
                            DisplayName: '循环期',
                            ScenarioStatus: '',
                            IsShow: '',
                            Scenarios: []
                        }, {
                            Name: 'Amortization',
                            DisplayName: '摊还期',
                            ScenarioStatus: '',
                            IsShow: '',
                            Scenarios:[]
                        }]
                    }]//视图数据源
                    var self = this;
                   
                    $.each(getViewData, function (i, v) {
                        $.each(v.dataList, function (i1, v1) {
                            $.each(self.AllData, function (i2, v2) {
                                if (v1.Name ==v2.CycleOrPriod) {
                                    var obj = {
                                        Name: '',
                                        DisplayName: '',
                                        ScenarioStatus:''
                                    }
                                    obj.Name = v2.CycleOrPriod + '_Children'
                                    obj.DisplayName = v2.ScenarioName
                                    obj.ScenarioStatus = v2.ScenarioStatus;
                                    if (v2.ScenarioStatus == 'Y') {
                                        v.dataList[i1].ScenarioStatus = 'Y'
                                    }
                                    v.dataList[i1].Scenarios.push(obj);
                                    v.dataList[i1].IsShow='Y'
                                }
                            })
                        })
                        
                    })
                    return getViewData
                }

            },
        })

    })

});

