var $, webProxy, RoleOperate;
var binddata;
define(function (require) {

    ////////////////////////
    if (!Array.prototype.find) {
        Object.defineProperty(Array.prototype, 'find', {
            value: function (predicate) {
                // 1. Let O be ? ToObject(this value).
                if (this == null) {
                    throw new TypeError('"this" is null or not defined');
                }

                var o = Object(this);

                // 2. Let len be ? ToLength(? Get(O, "length")).
                var len = o.length >>> 0;

                // 3. If IsCallable(predicate) is false, throw a TypeError exception.
                if (typeof predicate !== 'function') {
                    throw new TypeError('predicate must be a function');
                }

                // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
                var thisArg = arguments[1];

                // 5. Let k be 0.
                var k = 0;

                // 6. Repeat, while k < len
                while (k < len) {
                    // a. Let Pk be ! ToString(k).
                    // b. Let kValue be ? Get(O, Pk).
                    // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
                    // d. If testResult is true, return kValue.
                    var kValue = o[k];
                    if (predicate.call(thisArg, kValue, k, o)) {
                        return kValue;
                    }
                    // e. Increase k by 1.
                    k++;
                }

                // 7. Return undefined.
                return undefined;
            }
        });
    }
    ////////////////////////

    $ = require('jquery');
    require('jquery.cookie');
    webProxy = require('gs/webProxy');
    RoleOperate = require('gs/roleOperate');
    var ko = require('knockout');
    var echarts = require('echarts');
    require('uuid');
    var number = require('app/productManage/TrustManagement/Common/Scripts/format.number');

    var chart1 = echarts.init(document.getElementById('chart1'));
    var chart2 = echarts.init(document.getElementById('chart2'));
    var dataStyle = {
        normal: {
            label: { show: false },
            labelLine: { show: false },
            shadowBlur: 40,
            shadowColor: 'rgba(40, 40, 40, 0.5)',
        }
    };
    var chartOption = {
        title: {
            text: '资产总笔数规模',
            x: 'center',
            textStyle: {
                fontFamily: 'Microsoft Yahei',
                fontSize: 14,
                fontWeight: '700',
            },
        },
        tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b} : {c} ({d}%)"
        },
        legend: {
            orient: 'vertical',
            left: 'left'
        },
        series: [
            {
                name: '基础资产类型',
                type: 'pie',
                radius: [90, 115],
                center: ['50%', '50%'],
                itemStyle: dataStyle,
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
                        shadowOffsetx: 0,//阴影水平方向上的偏移
                        shadowOffsetY: 0,//阴影垂直方向上的偏移
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
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }
        ],
        color: ['#E86D6C', 'rgb(106,164,44)', '#53eafb', 'rgb(191,191,191)', 'rgb(143,162,212)', "rgb(96,120,68)", "rgb(0,113,193)"]
    };

    var svcUrl = webProxy.dataProcessServiceUrl + "CommonGetExecute?connConfig=TrustManagement&appDomain=TrustManagement&executeParams=";
    var params = [
        ["UserName", RoleOperate.cookieName(), "string"]
    ];
    var AssetList = function () {
        var self = this;

        this.waitLoading = ko.observable(true);

        this.totalAssetsCount = ko.observable(0);
        this.totalAssetsScale = ko.observable(0);
        this.totalSource = ko.observable(0);
        this.totalTrusts = ko.observable(0);

        this.select1 = ko.observableArray([]);
        this.select2 = ko.observableArray([]);
        this.select3 = ko.observableArray([]);
        this.select4 = ko.observableArray([]);

        this.select1Value = ko.observableArray([]);
        this.select2Value = ko.observableArray([]);
        this.select3Value = ko.observableArray([]);
        this.select4Value = ko.observableArray([]);

        this.formatp = function (p) {
            if (parseFloat(p) == p) {
                var ret = number.convertNumberN(1, p);
                return ret;
            }
            //else
            // return p == "" ? "0.00" : (p == null ? "0.00" : p);
        };
        this.showOption = ko.observable(-1);

        this.selectValue = function (targetSelect, currentSelectValue, data, event) {
            event.stopPropagation();
            if (targetSelect !== null && this.children.length > 0) {
                if (targetSelect === 'select2') {
                    self.select2([]);
                    self.select3([]);
                    self.select4([]);
                    self.select2Value([]);
                    self.select3Value([]);
                    self.select4Value([]);
                }
                var children = this.children;
                self[targetSelect](children);
            }
            self[currentSelectValue]({ value: this.name, id: this.nid });
            self.showOption(-1);
        }
        this.handleShowOption = function (index, data, event) {
            event.stopPropagation();
            this.showOption(index);
        }.bind(this)

        $(document).on('click.select-group', function (event) {
            var event = event || window.event, $box = $('.select');
            if (!$box.is(event.target) &&
                $box.has(event.target).length === 0) {
                this.showOption(-1);
            }
        }.bind(this));
    }

    var getTrustInfoTree = function (vm) {
        var self = vm;
        var parseData = function (data) {
            var temp = [];
            var xnode = {
                name: "全部",
                nid: -99,
                id: Math.uuid(),
                children: []
            };
            temp.push(xnode);

            data.forEach(function (value, index) {
                if (!value.TId) return 0;
                var node = temp.find(function (v) {
                    return v.nid == value.TId;
                });
                if (node) {
                    if (!value.OId) return 0;
                    var t = node.children;
                    if (!t.length) {
                        t.push(xnode);
                    }
                    node = t.find(function (v) {
                        return v.nid == value.OId;
                    });
                    if (node) {
                        if (!value.TrustId)
                            return 0;
                        var o = node.children;
                        if (!o.length) {
                            o.push(xnode);
                        }
                        node = o.find(function (v) {
                            return v.nid == value.TrustId;
                        });
                        if (node) {
                            if (!value.DId)
                                return 0;
                            var a = node.children;
                            if (!a.length) {
                                a.push(xnode);
                            }
                            node = a.find(function (v) {
                                return v.nid == value.DId;
                            });
                            if (node) {
                                node.name = value.DDesc;
                            } else {
                                var dnode = {
                                    name: value.DDesc,
                                    nid: value.DId,
                                    id: Math.uuid()
                                };
                                a.push(dnode);
                            }


                        }
                        else {
                            var dnode = {
                                name: value.DDesc,
                                nid: value.DId,
                                id: Math.uuid()
                            };

                            var anode = {
                                name: value.TrustCode,
                                nid: value.TrustId,
                                id: Math.uuid(),
                                children: []
                            };
                            if (!anode.children.length) {
                                anode.children.push(xnode);
                            }
                            if (value.DId) anode.children.push(dnode);
                            o.push(anode);
                        }


                    } else {
                        var dnode = {
                            name: value.DDesc,
                            nid: value.DId,
                            id: Math.uuid()
                        };

                        var anode = {
                            name: value.TrustCode,
                            nid: value.TrustId,
                            id: Math.uuid(),
                            children: []
                        };
                        if (!anode.children.length) {
                            anode.children.push(xnode);
                        }
                        if (value.DId) anode.children.push(dnode);
                        var onode = {
                            name: value.ODesc,
                            nid: value.OId,
                            id: Math.uuid(),
                            children: []
                        };
                        if (!onode.children.length) {
                            onode.children.push(xnode);
                        }
                        if (value.TrustId) onode.children.push(anode);
                        t.push(onode);

                    }
                } else {
                    var dnode = {
                        name: value.DDesc,
                        nid: value.DId,
                        id: Math.uuid()
                    };

                    var anode = {
                        name: value.TrustCode,
                        nid: value.TrustId,
                        id: Math.uuid(),
                        children: []
                    };
                    if (!anode.children.length) {
                        anode.children.push(xnode);
                    }
                    if (value.DId) anode.children.push(dnode);
                    var onode = {
                        name: value.ODesc,
                        nid: value.OId,
                        id: Math.uuid(),
                        children: []
                    };
                    if (!onode.children.length) {
                        onode.children.push(xnode);
                    }
                    if (value.TrustId) onode.children.push(anode);

                    var tnode = {
                        name: value.TDesc,
                        nid: value.TId,
                        id: Math.uuid(),
                        children: []
                    };
                    if (!tnode.children.length) {
                        tnode.children.push(xnode);
                    }
                    if (value.OId) tnode.children.push(onode);
                    temp.push(tnode);
                }
            });
            return temp;
        }

        var promise = webProxy.comGetData(params, svcUrl, 'usp_GetTrustInfoTree');
        promise().then(function (response) {
            if (typeof response === 'string') {
                var data = JSON.parse(response);
                data = parseData(data);
                binddata = data;
                self.select1(data);
                self.select2(data[0].children);
            }
        });
    }

    var getAll = function (vm) {
        var self = viewModel;
        var promise = webProxy.comGetData(params, svcUrl, 'usp_GetSInfoLevelOne');
        promise().then(function (response) {

            if (typeof response === 'string') {
                var data = JSON.parse(response);
                self.totalAssetsCount(data.reduce(function (s, i) { return s + i['ANO']; }, 0))
                self.totalAssetsScale(data.reduce(function (s, i) { return s + i['CPB']; }, 0))
                self.totalSource(data.reduce(function (s, i) { return s + i['NOID']; }, 0))
                self.totalTrusts(data.reduce(function (s, i) { return s + i['NAID']; }, 0))
                setTimeout(function () { self.waitLoading(false) }, 300);

                chartOption.title.text = "资产总笔数规模";
                chartOption.series[0].name = "基础资产类型";
                chartOption.legend.data = ['住房贷款', '对公贷款', '消费贷款', '资产支持票据', '信用卡', '应收账款', '汽车贷款'];
                var tdata = [{ name: '住房贷款', value: 0 },
                    { name: '对公贷款', value: 0 },
                    { name: '消费贷款', value: 0 },
                { name: '资产支持票据', value: 0 },
                { name: '信用卡', value: 0 },
                { name: '应收账款', value: 0 },
                { name: '汽车贷款', value: 0 }]

                chartOption.series[0].data = tdata.map(function (value) {
                    data.forEach(function (i, index, array) {
                        if (value['name'] == i['TDesc']) {
                            value = { name: i['TDesc'], value: i['ANO'] };
                        }
                    });
                    return value;
                });
                chart1.setOption(chartOption);


                chartOption.title.text = "资产总规模规模";
                chartOption.series[0].data = tdata.map(function (value) {
                    data.forEach(function (i, index, array) {
                        if (value['name'] == i['TDesc']) {
                            value = { name: i['TDesc'], value: i['CPB'] };
                        }
                    });
                    return value;
                });
                chart2.setOption(chartOption);
            }
        });
    }
    var getLevelTwo = function (vm, id) {
        var self = vm;
        var params = [
                ["DimAssetTypeID", id, "int"],
                 ["UserName", RoleOperate.cookieName(), "string"]
        ];
        self.waitLoading(true);
        var promise = webProxy.comGetData(params, svcUrl, 'usp_GetSInfoLevelTwo');
        promise().then(function (response) {
            if (typeof response === 'string') {
                var data = JSON.parse(response);
                self.totalAssetsCount(data.reduce(function (s, i) { return s + i['ANO']; }, 0))
                self.totalAssetsScale(data.reduce(function (s, i) { return s + i['CPB']; }, 0))
                self.totalSource(-1)
                self.totalTrusts(-1)
                self.waitLoading(false);
                chartOption.title.text = "资产总笔数规模";
                chartOption.series[0].name = "基础资产来源";
                chartOption.legend.data = ['兴业银行', '招联金融', '杭州银行', '招商银行', '温州银行', '民生银行'];
                var tdata = [{ name: '兴业银行', value: 0 },
                    { name: '招联金融', value: 0 },
                    { name: '杭州银行', value: 0 },
                { name: '招商银行', value: 0 },
                { name: '温州银行', value: 0 },
                { name: '民生银行', value: 0 }]
                //option.legend.data = sourceData.map(function (i) { return i['ODesc']; });
                //option.series[0].data = sourceData.map(function (i) { return { name: i['ODesc'], value: i['ANO'] }; });
                chartOption.series[0].data = tdata.map(function (value) {
                    data.forEach(function (i, index, array) {
                        if (value['name'] == i['ODesc']) {
                            value = { name: i['ODesc'], value: i['ANO'] };
                        }
                    });
                    return value;
                });
                chart1.setOption(chartOption);

                chartOption.title.text = "资产总规模规模";
                chartOption.series[0].name = "基础资产来源";
                chartOption.series[0].data = tdata.map(function (value) {
                    data.forEach(function (i, index, array) {
                        if (value['name'] == i['ODesc']) {
                            value = { name: i['ODesc'], value: i['CPB'] };
                        }
                    });
                    return value;
                });
                chart2.setOption(chartOption);
            }
        });
    }

    var getLevelThree = function (vm, pid, id) {
        var self = vm;
        var params = [
                ["DimAssetTypeID", pid, "int"],
                ["DimOrganisationID", id, "int"],
                 ["UserName", RoleOperate.cookieName(), "string"]
        ];
        self.waitLoading(true);
        var promise = webProxy.comGetData(params, svcUrl, 'usp_GetSInfoLevelThree');
        promise().then(function (response) {
            if (typeof response === 'string') {
                var data = JSON.parse(response);
                self.totalAssetsCount(data.reduce(function (s, i) { return s + i['ANO']; }, 0))
                self.totalAssetsScale(data.reduce(function (s, i) { return s + i['CPB']; }, 0))
                self.totalSource(-1)
                self.totalTrusts(-1)
                self.waitLoading(false);


                chartOption.title.text = "资产总笔数规模";
                chartOption.series[0].name = "专项计划";


                chartOption.legend.data = data.map(function (i) { return i['TrustCode']; });
                chartOption.series[0].data = data.map(function (i) { return { name: i['TrustCode'], value: i['ANO'] }; });

                chart1.setOption(chartOption);

                chartOption.title.text = "资产总规模规模";
                chartOption.series[0].name = "专项计划";
                chartOption.series[0].data = data.map(function (i) {
                    return { name: i['TrustCode'], value: i['CPB'] };
                });

                chart2.setOption(chartOption);






            }
        });
    }

    var getLevelFour = function (vm, rid, pid, id) {
        var self = vm;
        var params = [
                ["DimAssetTypeID", rid, "int"],
                ["DimOrganisationID", pid, "int"],
                ["DimTrustID", id, "int"],
                 ["UserName", RoleOperate.cookieName(), "string"]
        ];
        self.waitLoading(true);
        var promise = webProxy.comGetData(params, svcUrl, 'usp_GetSInfoLevelFour');
        promise().then(function (response) {
            if (typeof response === 'string') {
                var data = JSON.parse(response);
                self.totalAssetsCount(data.reduce(function (s, i) { return s + i['ANO']; }, 0))
                self.totalAssetsScale(data.reduce(function (s, i) { return s + i['CPB']; }, 0))
                self.totalSource(-1)
                self.totalTrusts(-1)
                self.waitLoading(false);


                chartOption.title.text = "资产总笔数规模";
                chartOption.series[0].name = "日期";


                chartOption.legend.data = data.map(function (i) { return i['DDesc']; });
                chartOption.series[0].data = data.map(function (i) { return { name: i['DDesc'], value: i['ANO'] }; });

                chart1.setOption(chartOption);

                chartOption.title.text = "资产总规模规模";
                chartOption.series[0].name = "日期";
                chartOption.series[0].data = data.map(function (i) {
                    return { name: i['DDesc'], value: i['CPB'] };
                });

                chart2.setOption(chartOption);



            }
        });
    }


    var getLevelFive = function (vm, rid, pid, did, id) {
        var self = vm;
        var params = [
                ["DimAssetTypeID", rid, "int"],
                ["DimOrganisationID", pid, "int"],
                ["DimTrustID", id, "int"],
                ["DimReportingDateID", did, "int"],
                 ["UserName", RoleOperate.cookieName(), "string"]
        ];
        self.waitLoading(true);
        var promise = webProxy.comGetData(params, svcUrl, 'usp_GetSInfoLevelFive');
        promise().then(function (response) {
            if (typeof response === 'string') {
                var data = JSON.parse(response);
                self.totalAssetsCount(data.reduce(function (s, i) { return s + i['ANO']; }, 0))
                self.totalAssetsScale(data.reduce(function (s, i) { return s + i['CPB']; }, 0))
                self.totalSource(-1)
                self.totalTrusts(-1)
                self.waitLoading(false);



                chartOption.title.text = "资产总笔数规模";
                chartOption.series[0].name = "日期";


                chartOption.legend.data = data.map(function (i) { return i['DDesc']; });
                chartOption.series[0].data = data.map(function (i) { return { name: i['DDesc'], value: i['ANO'] }; });

                chart1.setOption(chartOption);

                chartOption.title.text = "资产总规模规模";
                chartOption.series[0].name = "日期";
                chartOption.series[0].data = data.map(function (i) {
                    return { name: i['DDesc'], value: i['CPB'] };
                });

                chart2.setOption(chartOption);


            }
        });
    }



    var viewModel = new AssetList;
    ko.applyBindings(viewModel, document.getElementById('app'));
    getTrustInfoTree(viewModel);
    getAll(viewModel);

    viewModel.select1Value.subscribe(function (v) {
        var id = v.id;
        if (id == -99) {
            getAll(viewModel);
            viewModel.select2([]);

        } else {
            getLevelTwo(viewModel, id);
        }

        viewModel.select3([]);
        viewModel.select4([]);

        viewModel.select2Value([]);
        viewModel.select3Value([]);
        viewModel.select4Value([]);
        return;

    });
    viewModel.select2Value.subscribe(function (v) {
        if (v.length === 0) return;
        var id = v.id;

        var pid = viewModel.select1Value().id;
        if (id == -99) {
            getLevelTwo(viewModel, pid);
            viewModel.select3([]);

        } else {
            getLevelThree(viewModel, pid, id);
        }

        viewModel.select4([]);

        viewModel.select3Value([]);
        viewModel.select4Value([]);
        return;

    });
    viewModel.select3Value.subscribe(function (v) {
        if (v.length === 0) return;
        var id = v.id;

        var rid = viewModel.select1Value().id;
        var pid = viewModel.select2Value().id;
        if (id == -99) {
            getLevelThree(viewModel, rid, pid);
            viewModel.select4([]);

        } else {
            getLevelFour(viewModel, rid, pid, id);
        }
        viewModel.select4Value([]);
        return;


    });
    viewModel.select4Value.subscribe(function (v) {
        if (v.length === 0) return;
        var id = v.id;

        var rid = viewModel.select1Value().id;
        var pid = viewModel.select2Value().id;
        var did = viewModel.select3Value().id;

        if (id == -99) {
            getLevelFour(viewModel, rid, pid, did);

        } else {
            getLevelFive(viewModel, rid, pid, id, did);
        }
        return;

    });


    $(function () {
        var chartS1 = $("#chart1");
        var chartS2 = $("#chart2");
        if (chartS1.html() != "" || chartS2.html() != "") {
            $("#loading").fadeOut();
        }
    })
});
