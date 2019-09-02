var $, webProxy, RoleOperate;
var binddata;
var viewModel = {};
define(function (require) {
    var GlobalVariable = require("globalVariable");
    function format(num) {
        return num ? (num.toFixed(2) + '').replace(/\d{1,3}(?=(\d{3})+(\.\d*)?$)/g, '$&,'):'';
    }//千分位显示
    function formatno(num) {
        return num ? (num + '').replace(/\d{1,3}(?=(\d{3})+(\.\d*)?$)/g, '$&,') : '';
    }//千分位显示不保留2位小数
    function getRandomColor() {
        return "#" + ("00000" + ((Math.random() * 16777215 + 0.5) >> 0).toString(16)).slice(-6);
    }

    function canvasHeight() {
        var h = $("body").height();
        var dish = h - 240;
        $(".chart-display  .chart-box .chart").css("height", dish + "px");
    }

    //canavs宽度
    var w = $(".select-group").width();
    var eachw = w * (1 / 2);
    var h = $("body", window.top.frames[0].document).height();
    var dish = h - 240;
    $(".chart-box").css({ "width": eachw + "px" });
    $(".chart-display  .chart-box .chart").css("height", dish + "px");
    var len = $(".chart-display").find(".chart-box:visible").length;//找到显示元素的个数
    var n = 0;
    len = Math.round(len / 2);
    function canavschange() {
        $("#next").click(function () {
            n++;
            if (n > len - 1 && len - 1 != -1) { n = len - 1; }
            $(".chart-display").animate({ "left": -n * w + "px" }, 300, 'linear', function () {
                $(this).css("left", -n * w + "px");
            })
        })
        $("#prev").click(function () {
            n--;
            if (n < 0) n = 0;
            $(".chart-display").animate({ "left": -n * w + "px" }, 300, 'linear', function () {
                $(this).css("left", -n * w + "px");
            })
        })
    }
    canavschange();
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
    var c = '237aff';
    $ = require('jquery');

    var webStorage;
    require('jquery.localizationTool');
    webStorage = require('gs/webStorage');
    var vue = require("Vue");
    require('gs/uiFrame/js/gs-admin-2.pages');
    var mapping = require('knockout.mapping');
    var tm = require('gs/childTabModel');
    var webStorage = require('gs/webStorage');
    var Permission = require('gs/permission');
    var GSAdmin = require('gs/uiFrame/js/gs-admin-2');
    var userLanguage = webStorage.getItem('userLanguage');
    var langall = {};
    //
    var xmlUrl = '/GoldenStandABS/www/basicAsset/js/ribbon.json';
    if (userLanguage && userLanguage.indexOf('en') > -1) {
        console.log(1);
        xmlUrl = '/GoldenStandABS/www/basicAsset/js/ribbon_en.json';
    }
    function loadSiteRibbon(configURL) {
        var deferred = $.Deferred();
        $.ajax({
            url: configURL,

            type: 'GET',
            cache: false,
            error: function (xml) {
                deferred.reject(xml);
                alert("加载JSON文档出错!");
            },
            success: function (response) {
                //和权限做对比
                var ribbon = Permission.checkMenuPermission(response);
                renderRibbon(ribbon);
                deferred.resolve(ribbon);


            }
        });
        return deferred.promise;
    }
    loadSiteRibbon(xmlUrl);
    function renderRibbon(data) {
        new vue({
            el: "#app",
            data: {
                obj: data // needs to be filtered, 需要和实际权限比较过滤一下
            },
            methods: {
                creatLink: function (linkname, linkurl) {
                    return "" + linkname + "()";
                },
                asideList: function (asideListUrl) {
                    return "javascript:asidetest('" + asideListUrl + "')";
                }
            }
        })
    };
    //
    if (userLanguage && userLanguage.indexOf('en') > -1) {
        langall.lineChart = 'Line Chart';
        langall.barGraph = 'Bar Graph';
        langall.closed = 'Close';
        langall.saveAsImage = 'Save As Image';
        langall.dataView = 'Data View';
        langall.all = 'All';
        langall.personalHousingLoan = 'Residential Mortgage-Backed Security';
        langall.publicLoan = "Collaterized Loan Obligation";
        langall.consumerLoan = 'Consumer Loan';
        langall.asset_backedCommercialPaper = 'Asset Backed Medium-term Notes';
        langall.creditCard = 'Credit Card';
        langall.accountsReceivable = 'Receivable';
        langall.carLoan = 'Automoblie Loan';
        langall.financing = 'Margin financing';
        langall.IndustrialBank = 'Industrial Bank';
        langall.mucfc = 'MUCFC';
        langall.BankofHangzhou = 'Bank Of Hangzhou';
        langall.ChinaMerchantsBank = 'China Merchants Bank';
        langall.BankofWenzhou = 'Bank Of Wenzhou';
        langall.ChinaMinshengBank = 'China Minsheng Bank';
        langall.date = 'Date';
        langall.trust = 'Trust';
        langall.assetType = 'Asset Type';
        langall.assetOrigin = 'Asset Origin';
        langall.assetNumberTotle = 'Asset Amount';
        langall.assetScaleTotle = 'Asset Scale';
        langall.tiao = '';
        langall.yuan = '';
        langall.dataDate = "Data Date";
        langall.distributionDiagram_NumberTotle = "distributionDiagram(NumberTotle)";
        langall.distributionDiagram_ScaleTotle = "distributionDiagram(ScaleTotle)";

    } else {
        langall.lineChart = '切换成折线图';
        langall.barGraph = '切换成柱状图';
        langall.closed = '关闭';
        langall.saveAsImage = '保存为图片';
        langall.dataView = '数据视图';
        langall.all = '全部';
        langall.personalHousingLoan = '住房贷款';
        langall.publicLoan = "对公贷款";
        langall.consumerLoan = '消费贷款';
        langall.asset_backedCommercialPaper = '资产支持票据';
        langall.creditCard = '信用卡';
        langall.accountsReceivable = '应收账款';
        langall.carLoan = '汽车贷款';
        langall.financing = '融资融券';
        langall.IndustrialBank = '兴业银行';
        langall.mucfc = '招联金融';
        langall.BankofHangzhou = '杭州银行';
        langall.ChinaMerchantsBank = '招商银行';
        langall.BankofWenzhou = '温州银行';
        langall.ChinaMinshengBank = '民生银行';
        langall.date = '日期';
        langall.trust = '产品';
        langall.assetType = '资产类型';
        langall.assetOrigin = '资产来源';
        langall.assetNumberTotle = '资产总笔数';
        langall.assetScaleTotle = '资产总规模';
        langall.tiao = '条';
        langall.yuan = '元';
        langall.dataDate = "数据日期";
        langall.distributiondiagram_NumberTotle = "分布图(总笔数)";
        langall.distributiondiagram_ScaleTotle = "分布图(总规模)";
    }

    require('jquery.cookie');
    webProxy = require('gs/webProxy');
    RoleOperate = require('gs/roleOperate');
    var ko = require('knockout');
    var echarts = require('echarts');
    var chart1 = echarts.init(document.getElementById('chart1'));
    var chart2 = echarts.init(document.getElementById('chart2'));
    var chart3_1 = echarts.init(document.getElementById('chart3_1'));
    var chart3_2 = echarts.init(document.getElementById('chart3_2'));
    var chart4_1 = echarts.init(document.getElementById('chart4_1'));
    var chart4_2 = echarts.init(document.getElementById('chart4_2'));

    require('uuid');
    var number = require('app/productManage/TrustManagement/Common/Scripts/format.number');
    function strToHexCharCode(str) {
        if (str === "")
            return "";
        var hexCharCode = [];
        hexCharCode.push("0x");
        for (var i = 0; i < str.length; i++) {
            hexCharCode.push((str.charCodeAt(i)).toString(16));
        }
        return hexCharCode.join("");
    }

    function hexCharCodeToStr(hexCharCodeStr) {
        var trimedStr = hexCharCodeStr.trim();
        var rawStr =
        trimedStr.substr(0, 2).toLowerCase() === "0x"
        ?
        trimedStr.substr(2)
        :
        trimedStr;
        var len = rawStr.length;
        if (len % 2 !== 0) {
            alert("Illegal Format ASCII Code!");
            return "";
        }
        var curCharCode;
        var resultStr = [];
        for (var i = 0; i < len; i = i + 2) {
            curCharCode = parseInt(rawStr.substr(i, 2), 16); // ASCII Code Value
            resultStr.push(String.fromCharCode(curCharCode));
        }
        return resultStr.join("");
    }
    function canvasRender() {
        chart1.resize()
        chart2.resize()
        chart3_1.resize()
        chart3_2.resize()
        chart4_1.resize()
        chart4_2.resize()
    }
    function resizehandler() {
        $(".chart-display").css("left", "0px");
        n = 0;
        w = $(".select-group").width();
        eachw = w * (1 / 2);
        h = $("body", window.top.frames[0].document).height();
        dish = h * 0.73;
        $(".chart-box").css({ "width": eachw + "px" });
        canvasRender()
    }

    function throttle(method, context) {
        clearTimeout(method.tId);
        method.tId = setTimeout(function () {
            method.call(context);
        }, 100);
    }
    $(function () {
        $('#selectLanguageDropdown_all').localizationTool({
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

                'placeholder::id:assetType_all': {
                    'en_GB': 'Asset Type'
                },
                'placeholder::id:origin_all': {
                    'en_GB': 'Organisation'
                },
                'placeholder::id:trust_all': {
                    'en_GB': 'Trust'
                },
                'placeholder::id:date_all': {
                    'en_GB': 'Date'
                },
                'placeholder::id:scale_number_all_i': {
                    'en_GB': 'Amount+Scale'
                },
                'placeholder::id:function_options':{
                    'en_GB':'Function Options'
                },
                'id:scale_number_all_l': {
                    'en_GB': 'Amount+Scale'
                },
                'id:scale_all': {
                    'en_GB': 'Scale'
                },
                'id:number_all': {
                    'en_GB': 'Amount'
                },
                'data-bind::id:assetNumberTotle_all': {
                    'en_GB': "css:{'wait-loading':waitLoading},text:'Asset Amount'"
                },
                'data-bind::id:assetScaleTotle_all': {
                    'en_GB': "css:{'wait-loading':waitLoading},text:'Asset Scale'"
                },
                'data-bind::id:assetOriginTotle_all': {
                    'en_GB': "css:{'wait-loading':waitLoading},text:'Asset Origin'"
                },
                'data-bind::id:trustTotle_all': {
                    'en_GB': "css:{'wait-loading':waitLoading},text:'Trust'"
                }


            }
        });

        var userLanguage = webStorage.getItem('userLanguage');
        if (userLanguage) {
            $('#selectLanguageDropdown_all').localizationTool('translate', userLanguage);
        }
        $('body').show();
        w = $(".select-group").width();
        eachw = w * (1 / 2);
        h = $("body", window.top.frames[0].document).height();
        dish = h - 225;  
        $(".chart-box").css({ "width": eachw + "px" });
        $(".chart-display  .chart-box .chart").css("height", dish + "px");

        window.onresize = function () {
            throttle(resizehandler, window);
        };
    })

    var dataStyle = {
        normal: {
            label: { show: false },
            labelLine: { show: false },
            shadowBlur: 4,
            shadowColor: 'rgba(40, 40, 40, 0.5)',
        }
    };

    var chartOption1 = {
        backgroundColor: '#ffffff',
        title: {
            text: langall.assetType + '-' + langall.assetNumberTotle,
            x: 'center',
            textStyle: {
                fontFamily: 'Microsoft Yahei',
                fontSize: 14,
                fontWeight: '700',
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
                var str = langall.assetType + ":" + res + "<br>";
                str += langall.assetNumberTotle + ":" + formatno(value) + langall.tiao;
                return str
            }
        },
        legend: {
            data: []
        },
        toolbox: {
            right: '30',
            top: 'top',
            feature: {
                magicType: {
                    //type: ['line', 'bar'],
                    //title: {
                    //    line: langall.lineChart,
                    //    bar: langall.barGraph
                    //}
                },
                dataView: {
                    show: true,
                    title: langall.dataView,
                    readOnly: true,
                    lang: [langall.dataView, langall.closed],
                    optionToContent: function (opt) {
                        var axisData = opt.xAxis[0].data;
                        var series = opt.series;
                        var table = '<table style="width:80%;text-align:left;margin:auto;height:95%"><tbody>'
                        for (var i = 0, l = axisData.length; i < l; i++) {
                            table += '<tr>'
                                     + '<td>' + series[0].data[i].name + '</td>'
                                     + '<td style="text-align:right">' + series[0].data[i].value + '</td>'
                                     + '</tr>';
                        }
                        table += '</tbody></table>';
                        return table;
                    },
                    buttonColor: "rgba(69,86,156,1)",
                    buttonTextColor: "#ffffff"
                },
                saveAsImage: {
                    show: true,
                    title: langall.saveAsImage
                }
            }
        },
        animation: false,
        dataZoom: [{
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

        }],
        grid: {
            left: '3%',
            right: '4%',
            bottom: '10%',
            containLabel: true
        },
        xAxis: [
        {
            type: 'category',
            //data: ['住房贷款', '对公贷款', '消费贷款', '资产支持票据', '信用卡', '应收账款', '汽车贷款'],
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
                        shadowBlur: 4,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }
        ]
    }
    var chartOption2 = {
        backgroundColor: '#ffffff',
        title: {
            text: langall.assetType + '-' + langall.assetScaleTotle,
            x: 'center',
            textStyle: {
                fontFamily: 'Microsoft Yahei',
                fontSize: 14,
                fontWeight: '700',
            },
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {            // 坐标轴指示器，坐标轴触发有效    // 默认为直线，可选为：'line' | 'shadow'
                type: "line"
            },
            formatter: function (datas) {
                var res = datas[0].name;
                var value = datas[0].value;
                var str = langall.assetType + ":" + res + "<br>";
                str += langall.assetScaleTotle + ":" + format(value) + langall.yuan;
                return str
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '10%',
            containLabel: true
        },
        animation: false,
        dataZoom: [{
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

        }],
        xAxis: [
        {
            type: 'category',
            //data: ['住房贷款', '对公贷款', '消费贷款', '资产支持票据', '信用卡', '应收账款', '汽车贷款'],
            boundaryGap: true,
            textStyle: {
                fontsize: 12
            },
            axisTick: {
                alignWithLabel: true
            },
            "axisLabel": {
                interval: 0,
                rotate: 0,
                margin: 2
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
          }
      },

        ],
        legend: {
            orient: 'vertical',
            left: 'left',
            data: []
        },
        toolbox: {
            right: '30',
            top: 'top',
            feature: {
                magicType: {
                    //type: ['line', 'bar'],
                    //title: {
                    //    line: langall.lineChart,
                    //    bar: langall.barGraph
                    //}
                },
                dataView: {
                    show: true,
                    title: langall.dataView,
                    readOnly: true,
                    lang: [langall.dataView, langall.closed],
                    optionToContent: function (opt) {
                        var axisData = opt.xAxis[0].data;
                        var series = opt.series;
                        var table = '<table style="width:80%;text-align:left;margin:auto;height:95%"><tbody>'
                        for (var i = 0, l = axisData.length; i < l; i++) {
                            table += '<tr>'
                                     + '<td>' + series[0].data[i].name + '</td>'
                                     + '<td style="text-align:right">' + series[0].data[i].value + '</td>'
                                     + '</tr>';
                        }
                        table += '</tbody></table>';
                        return table;
                    },
                    buttonColor: "rgba(69,86,156,1)",
                    buttonTextColor: "#ffffff"
                },
                saveAsImage: {
                    show: true,
                    title: langall.saveAsImage,
                }
            }
        },
        series: [
            {
                name: langall.assetType,
                type: 'bar',
                barWidth: "20",
                data: [],
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
        ]
    }




    ////////////////////////////////////
    var chartOption3_1 = {
        backgroundColor: '#ffffff',
        title: {
            text: langall.trust + '-' + langall.assetNumberTotle,
            x: 'center',
            textStyle: {
                fontFamily: 'Microsoft Yahei',
                fontSize: 14,
                fontWeight: '700',
            },
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                type: 'line'      // 默认为直线，可选为：'line' | 'shadow'
            },
            formatter: function (datas) {
                var res = datas[0].data.name;
                var value = datas[0].value;
                var str = langall.trust + ":" + res + "<br>";
                str += langall.assetNumberTotle + ":" + formatno(value) + langall.tiao;
                return str
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '20%',
            containLabel: true
        },
        animation: false,
        dataZoom: [{
            xAxisIndex: [0],
            type: 'inside',
            show: true,
            start: 40,
            end: 60,
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

        }],
        xAxis: [
{
    type: 'category',
    //data: ['住房贷款', '对公贷款', '消费贷款', '资产支持票据', '信用卡', '应收款', '汽车贷款'],
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
        }
    },

        ],
        legend: {
            orient: 'vertical',
            left: 'left'
        },
        toolbox: {
            right: '30',
            top: 'top',
            feature: {
                magicType: {
                    //type: ['line', 'bar'],
                    //title: {
                    //    line: langall.lineChart,
                    //    bar: langall.barGraph
                    //}
                },
                dataView: {
                    show: true,
                    title: langall.dataView,
                    lang: [langall.dataView, langall.closed],
                    readOnly: true,
                    optionToContent: function (opt) {
                        var axisData = opt.xAxis[0].data;
                        var series = opt.series;
                        var table = '<table style="width:80%;text-align:left;margin:auto;height:95%"><tbody>'
                        for (var i = 0, l = axisData.length; i < l; i++) {
                            table += '<tr>'
                                     + '<td>' + series[0].data[i].name + '</td>'
                                     + '<td style="text-align:right">' + series[0].data[i].value + '</td>'
                                     + '</tr>';
                        }
                        table += '</tbody></table>';
                        return table;
                    },
                    buttonColor: "rgba(69,86,156,1)",
                    buttonTextColor: "#ffffff"
                },
                saveAsImage: {
                    show: true,
                    title: langall.saveAsImage
                }
            }
        },
        series: [
        {
            name: langall.trust,
            type: 'bar',
            barWidth: "15",
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
                        var colorList = ["#ccc", "#66cc99", "#ff6666", "#ccff99", '#ccffcc', '#99cccc', '#fffcc', "#ccccff"];
                        if (params.dataIndex > colorList.length) {
                            if (params.dataIndex % colorList.length != 0) {
                                var n = params.dataIndex % colorList.length - 1
                                return colorList[n]
                            } else {
                                return colorList[colorList.length - 1]
                            }
                        } else {
                            return colorList[params.dataIndex]
                        }
                    },
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
                    shadowBlur: 4,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            }
        }
        ]
    }
    var chartOption3_2 = {
        backgroundColor: '#ffffff',
        title: {
            text: langall.trust + '-' + langall.assetScaleTotle,
            x: 'center',
            textStyle: {
                fontFamily: 'Microsoft Yahei',
                fontSize: 14,
                fontWeight: '700',
            },
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {            // 坐标轴指示器，坐标轴触发有效    // 默认为直线，可选为：'line' | 'shadow'
                type: "line"
            },
            formatter: function (datas) {
                var res = datas[0].data.name;
                var value = datas[0].value;
                var str = langall.trust + ":" + res + "<br>";
                str += langall.assetScaleTotle + ":" + format(value) + langall.yuan;
                return str
            }
        },
        legend: {
            data: []
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '20%',
            containLabel: true
        },
        animation: false,
        dataZoom: [{
            xAxisIndex: [0],
            show: true,
            start: 40,
            end: 60,
            type: 'slider',
            height: 18,
            bottom: 0,
            handleColor: 'rgba(0,0,0,0.3)',    // 手柄颜色
            borderColor: "#ddd",                     //边框颜色。  
            filterMode: 'filter',
            handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
            handleSize: '80%',
            throttle: 0,
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
            }
        }],
        xAxis: [
    {
        type: 'category',
        //data: ['住房贷款', '对公贷款', '消费贷款', '资产支持票据', '信用卡', '应收账款', '汽车贷款'],
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
        toolbox: {
            right: '30',
            top: 'top',
            feature: {
                magicType: {
                    //type: ['line', 'bar'],
                    //title: {
                    //    line: langall.lineChart,
                    //    bar: langall.barGraph
                    //}
                },
                dataView: {
                    show: true,
                    title: langall.dataView,
                    lang: [langall.dataView, langall.closed],
                    readOnly: true,
                    optionToContent: function (opt) {
                        var axisData = opt.xAxis[0].data;
                        var series = opt.series;
                        var table = '<table style="width:80%;text-align:left;margin:auto;height:95%"><tbody>'
                        for (var i = 0, l = axisData.length; i < l; i++) {
                            table += '<tr>'
                                     + '<td>' + series[0].data[i].name + '</td>'
                                     + '<td style="text-align:right">' + series[0].data[i].value + '</td>'
                                     + '</tr>';
                        }
                        table += '</tbody></table>';
                        return table;
                    },
                    buttonColor: "rgba(69,86,156,1)",
                    buttonTextColor: "#ffffff"
                },
                saveAsImage: {
                    show: true,
                    title: langall.saveAsImage
                }
            }
        },
        yAxis: [
        {
            type: 'value',
            axisLine: {
                lineStyle: {
                    color: "#777"
                }
            }
        },

        ],
        series: [
            {
                name: langall.trust,
                type: 'bar',
                barWidth: "15",
                itemStyle: {
                    normal: {
                        color: function (params) {
                            var colorList = ["#ccc", "#66cc99", "#ff6666", "#ccff99", '#ccffcc', '#99cccc', '#fffcc', "#ccccff"];
                            if (params.dataIndex > colorList.length) {
                                if (params.dataIndex % colorList.length != 0) {
                                    var n = params.dataIndex % colorList.length - 1
                                    return colorList[n]
                                } else {
                                    return colorList[colorList.length - 1]
                                }
                            } else {
                                return colorList[params.dataIndex]
                            }
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
    }
    ////////////////////////////////////

    ////////////////////////////////////
    var chartOption4_1 = {
        backgroundColor: '#ffffff',
        title: {
            text: langall.assetOrigin + '-' + langall.assetNumberTotle,
            x: 'center',
            textStyle: {
                fontFamily: 'Microsoft Yahei',
                fontSize: 14,
                fontWeight: '700',
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
                var str = langall.assetOrigin + ":" + res + "<br>";
                str += langall.assetNumberTotle + ":" + formatno(value) + langall.tiao;
                return str
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '10%',
            containLabel: true
        },
        animation: false,
        dataZoom: [{
            xAxisIndex: [0],
            show: true,
            start: 0,
            end: 30,
            type: 'slider',
            height: 18,
            bottom: 0,
            handleColor: 'rgba(0,0,0,0.3)',    // 手柄颜色
            borderColor: "#ddd",                     //边框颜色。  
            filterMode: 'filter',
            handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
            handleSize: '80%',
            throttle: 0,
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
            }
        }],
        xAxis: [
{
    type: 'category',
    //data: ['住房贷款', '对公贷款', '消费贷款', '资产支持票据', '信用卡', '应收账款', '汽车贷款'],
    boundaryGap: true,
    textStyle: {
        fontsize: 12
    },
    axisTick: {
        alignWithLabel: true
    },
    "axisLabel": {
        interval: 0,
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
        axisLine: {
            lineStyle: {
                color: "#777"
            }
        }
    },

        ],
        legend: {
            orient: 'vertical',
            left: 'left'
        },
        toolbox: {
            right: '30',
            top: 'top',
            feature: {
                magicType: {
                    //type: ['line', 'bar'],
                    //title: {
                    //    line: langall.lineChart,
                    //    bar: langall.barGraph
                    //}
                },
                dataView: {
                    show: true,
                    title: langall.dataView,
                    readOnly: true,
                    lang: [langall.dataView, langall.closed],
                    optionToContent: function (opt) {
                        var axisData = opt.xAxis[0].data;
                        var series = opt.series;
                        var table = '<table style="width:80%;text-align:left;margin:auto;height:95%"><tbody>'
                        for (var i = 0, l = axisData.length; i < l; i++) {
                            table += '<tr>'
                                     + '<td>' + series[0].data[i].name + '</td>'
                                     + '<td style="text-align:right">' + series[0].data[i].value + '</td>'
                                     + '</tr>';
                        }
                        table += '</tbody></table>';
                        return table;
                    },
                    buttonColor: "rgba(69,86,156,1)",
                    buttonTextColor: "#ffffff"
                },
                saveAsImage: {
                    show: true,
                    title: langall.saveAsImage
                }
            }
        },
        series: [
        {
            name: langall.assetOrigin,
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
                        var colorList = ["#ccc", "#66cc99", "#ff6666", "#ccff99", '#ccffcc', '#99cccc', '#fffcc', "#ccccff"]
                        return colorList[params.dataIndex]
                    },
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
                    shadowBlur: 4,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            }
        }
        ]
    }
    var chartOption4_2 = {
        backgroundColor: '#ffffff',
        title: {
            text: langall.assetOrigin + '-' + langall.assetScaleTotle,
            x: 'center',
            textStyle: {
                fontFamily: 'Microsoft Yahei',
                fontSize: 14,
                fontWeight: '700',
            },
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {            // 坐标轴指示器，坐标轴触发有效    // 默认为直线，可选为：'line' | 'shadow'
                type: "line"
            },
            formatter: function (datas) {
                var res = datas[0].name;
                var value = datas[0].value;
                var str = langall.assetOrigin + ":" + res + "<br>";
                str += langall.assetScaleTotle + ":" + format(value) + langall.yuan;
                return str
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '10%',
            containLabel: true
        },
        animation: false,
        dataZoom: [{
            xAxisIndex: [0],
            show: true,
            start: 0,
            end: 30,
            type: 'slider',
            height: 18,
            bottom: 0,
            handleColor: 'rgba(0,0,0,0.3)',    // 手柄颜色
            borderColor: "#ddd",                     //边框颜色。  
            filterMode: 'filter',
            handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
            handleSize: '80%',
            throttle: 0,
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
            }
        }],
        xAxis: [
    {
        type: 'category',
        //data: ['住房贷款', '对公贷款', '消费贷款', '资产支持票据', '信用卡', '应收账款', '汽车贷款'],
        boundaryGap: true,
        textStyle: {
            fontsize: 12
        },
        axisTick: {
            alignWithLabel: true
        },
        "axisLabel": {
            interval: 0,
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
            axisLine: {
                lineStyle: {
                    color: "#777"
                }
            }
        },

        ],
        legend: {
            orient: 'vertical',
            left: 'left'
        },
        toolbox: {
            right: '30',
            top: 'top',
            feature: {
                magicType: {
                    //type: ['line', 'bar'],
                    //title: {
                    //    line: langall.lineChart,
                    //    bar: langall.barGraph
                    //}
                },
                dataView: {
                    show: true,
                    title: langall.dataView,
                    readOnly: true,
                    lang: [langall.dataView, langall.closed],
                    optionToContent: function (opt) {
                        var axisData = opt.xAxis[0].data;
                        var series = opt.series;
                        var table = '<table style="width:80%;text-align:left;margin:auto;height:95%"><tbody>'
                        for (var i = 0, l = axisData.length; i < l; i++) {
                            table += '<tr>'
                                     + '<td>' + series[0].data[i].name + '</td>'
                                     + '<td style="text-align:right">' + series[0].data[i].value + '</td>'
                                     + '</tr>';
                        }
                        table += '</tbody></table>';
                        return table;
                    },
                    buttonColor: "rgba(69,86,156,1)",
                    buttonTextColor: "#ffffff"
                },
                saveAsImage: {
                    show: true,
                    title: langall.saveAsImage
                }
            }
        },
        series: [
            {
                name: langall.assetOrigin,
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
        ]
    }
    ////////////////////////////////////







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
            self[currentSelectValue]({
                value: this.name, id: this.nid
            });
            self.showOption(-1);
        }
        this.handleShowOption = function (index, data, event) {
            var nowMenu = $(event.target).parents('.select').find('.options-list')
            //event.stopPropagation();
            if (nowMenu.is(":hidden")) {
                this.showOption(index);
            }else {
                this.showOption(-1);
            }
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
                name: langall.all,
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

        var promise = webProxy.comGetData(params, svcUrl, 'usp_GetTrustInfoTree_new');
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
    //function getColor(data) {
    //    var colorList = ['rgb(164,205,238)', 'rgb(42,170,227)', 'rgb(25,46,94)', 'rgb(195,229,235)'];
    //}
    var getAll = function (vm) {
        $(".chart-display").css("left", "0px");
        $('#chart1').parent().css('display', 'block');
        $('#chart2').parent().css('display', 'block');
        $('#chart3_1').parent().css('display', 'block');
        $('#chart3_2').parent().css('display', 'block');
        $('#chart4_1').parent().css('display', 'block');
        $('#chart4_2').parent().css('display', 'block');
        canvasRender()
        n = 0;
        len = $(".chart-display").find(".chart-box:visible").length;
        len = Math.round(len / 2);
        $("#count_five").find(".select-input")[0].value = "";
        //canavschange($(".chart-display").find(".chart-box:visible").length);
        $("#showself>li").click(function () {
            var value = $(this)[0].innerHTML;
            $("#count_five").find(".select-input")[0].value = value;
            var v = $("#count_five").find(".select-input")[0].value;
            if (v == "规模+笔数" || v == "scale+number") {
                len = 3;
                $(".chart-display").css("left", "0px");
                $('#chart1').parent().css('display', 'block');
                $('#chart2').parent().css('display', 'block');
                $('#chart3_1').parent().css('display', 'block');
                $('#chart3_2').parent().css('display', 'block');
                $('#chart4_1').parent().css('display', 'block');
                $('#chart4_2').parent().css('display', 'block');
            }
            if (v == "规模" || v == "scale") {
                len = 2;
                $(".chart-display").css("left", "0px");
                $('#chart1').parent().css('display', 'none');
                $('#chart2').parent().css('display', 'block');
                $('#chart3_1').parent().css('display', 'none');
                $('#chart3_2').parent().css('display', 'block');
                $('#chart4_1').parent().css('display', 'none');
                $('#chart4_2').parent().css('display', 'block');
            }
            if (v == "笔数" || v == "number") {
                len = 2;
                $(".chart-display").css("left", "0px");
                $('#chart1').parent().css('display', 'block');
                $('#chart2').parent().css('display', 'none');
                $('#chart3_1').parent().css('display', 'block');
                $('#chart3_2').parent().css('display', 'none');
                $('#chart4_1').parent().css('display', 'block');
                $('#chart4_2').parent().css('display', 'none');
            }
        })

        var self = viewModel;
        var promise = webProxy.comGetData(params, svcUrl, 'usp_GetSInfoLevelOne_new');
        promise().then(function (response) {
            console.log(response);
            if (typeof response === 'string') {
                var data = JSON.parse(response);
                var thatdata = JSON.parse(response);
                self.totalAssetsCount(data.reduce(function (s, i) { return s + i['ANO']; }, 0))
                self.totalAssetsScale(data.reduce(function (s, i) { return s + i['CPB']; }, 0))
                if (data && data[0]) {
                    self.totalSource(data[0]['NOID']);
                }
                //self.totalSource(data.reduce(function (s, i) { return s + i['NOID']; }, 0))
                self.totalTrusts(data.reduce(function (s, i) { return s + i['NAID']; }, 0))
                setTimeout(function () { self.waitLoading(false) }, 300);
                chartOption1.title.text = langall.assetType + '-' + langall.assetNumberTotle;
                chartOption1.series[0].name = langall.assetType;
                //chartOption1.xAxis[0].data = ['住房贷款', '对公贷款', '消费贷款', '资产支持票据', '信用卡', '应收账款', '汽车贷款'];
                var executeParam = { SPName: 'dbo.usp_GetDimAssetID', SQLParams: [] };
                var executeParams = encodeURIComponent(JSON.stringify(executeParam));
                var serviceUrl = GlobalVariable.PoolCutServiceURL + 'CommonGet?connName=PoolCut_Database&exeParams=' + executeParams;
                CallWCFSvc(serviceUrl, true, 'GET', function (data) {
                    var array = [];
                    var tdata = [];
                    $.each(data, function (i, v) {
                        array.push(v.AssetTypeDesc);
                        tdata.push({ name: v.AssetTypeDesc, value:0})
                    })
                    chartOption1.xAxis[0].data = array;
    //                chartOption1.xAxis[0].data = [langall.personalHousingLoan, langall.publicLoan, langall.consumerLoan,
    //langall.asset_backedCommercialPaper, langall.creditCard, langall.accountsReceivable, langall.carLoan, langall.financing];
                    //var tdata = [{
                    //    name: langall.personalHousingLoan, value: 0
                    //},
                    //        {
                    //            name: langall.publicLoan, value: 0
                    //        },
                    //        {
                    //            name: langall.consumerLoan, value: 0
                    //        },
                    //    {
                    //        name: langall.asset_backedCommercialPaper, value: 0
                    //    },
                    //    {
                    //        name: langall.creditCard, value: 0
                    //    },
                    //    {
                    //        name: langall.accountsReceivable, value: 0
                    //    },
                    //    {
                    //        name: langall.carLoan, value: 0
                    //    },
                    //    {
                    //        name: langall.financing, value: 0
                    //    }
                    //]
                    chartOption1.tooltip.formatter = function (datas) {
                        var res = datas[0].name;
                        var value = datas[0].value;
                        var str = langall.assetType + ":" + res + "<br>";
                        str += langall.assetNumberTotle + ":" + formatno(value) + langall.tiao;
                        return str
                    };
                    chartOption1.series[0].data = tdata.map(function (value) {
                        thatdata.forEach(function (i, index, array) {
                            if (value['name'] == i['TDesc']) {
                                value = {
                                    name: i['TDesc'], value: i['ANO']
                                };
                            }
                        });
                        return value;
                    });
                    chart1.setOption(chartOption1);


                    chartOption2.title.text = langall.assetType + '-' + langall.assetScaleTotle;
                    chartOption2.xAxis[0].data=array
                    //chartOption2.xAxis[0].data = [langall.personalHousingLoan, langall.publicLoan, langall.consumerLoan,
                    //    langall.asset_backedCommercialPaper, langall.creditCard, langall.accountsReceivable, langall.carLoan, langall.financing];
                    chartOption2.series.barWidth = '20';
                    chartOption2.series[0].data = tdata.map(function (value) {
                        thatdata.forEach(function (i, index, array) {
                            if (value['name'] == i['TDesc']) {
                                value = {
                                    name: i['TDesc'], value: i['CPB']
                                };
                            }
                        });
                        return value;
                    });
                    chartOption2.tooltip.formatter = function (datas) {
                        var res = datas[0].name;
                        var value = datas[0].value;
                        var str = langall.assetType + ":" + res + "<br>";
                        str += langall.assetScaleTotle + ":" + format(value) + langall.yuan;
                        return str
                    };
                    chart2.setOption(chartOption2);
                });
            }
        });



        ////////////////////////

        promise = webProxy.comGetData(params, svcUrl, 'usp_GetSInfoLevelOneA_new');
        promise().then(function (response) {
            if (typeof response === 'string') {
                var data = JSON.parse(response);
                //self.totalAssetsCount(data.reduce(function (s, i) { return s + i['ANO']; }, 0))
                //self.totalAssetsScale(data.reduce(function (s, i) { return s + i['CPB']; }, 0))
                //self.totalSource(-1)
                //self.totalTrusts(-1)
                self.waitLoading(false);

                chartOption3_1.xAxis[0].data = data.map(function (i) {
                    if (i['TrustCode'].length > 15) {
                        return i['TrustCode'].substr(0, 15) + "..";
                    } else {
                        return i['TrustCode'];
                    }

                });
                chartOption3_1.series[0].data = data.map(function (i) {
                    return {
                        name: i['TrustCode'], value: i['ANO']
                    };
                });
                chart4_1.setOption(chartOption3_1);



                chartOption3_2.xAxis[0].data = data.map(function (i) {
                    if (i['TrustCode'].length > 15) {
                        return i['TrustCode'].substr(0, 15) + "..";
                    } else {
                        return i['TrustCode'];
                    }
                });
                chartOption3_2.series[0].data = data.map(function (i) {
                    return {
                        name: i['TrustCode'], value: i['CPB']
                    };
                });
                chart4_2.setOption(chartOption3_2);
            }
        });


        promise = webProxy.comGetData(params, svcUrl, 'usp_GetSInfoLevelOneO_new');
        promise().then(function (response) {
            if (typeof response === 'string') {
                var data = JSON.parse(response);

                self.waitLoading(false);

                chartOption4_1.series[0].name = langall.assetOrigin;
                chartOption4_1.title.text = langall.assetOrigin + '-' + langall.assetNumberTotle;
                chartOption4_1.xAxis[0].data = data.map(function (i) {
                    return i['ODesc'];
                });
                chartOption4_1.series[0].data = data.map(function (i) {
                    return {
                        name: i['ODesc'], value: i['ANO']
                    };
                });
                chart3_1.setOption(chartOption4_1, true);


                chartOption4_2.series[0].name = langall.assetOrigin;
                chartOption4_2.title.text = langall.assetOrigin + '-' + langall.assetScaleTotle;
                chartOption4_2.xAxis[0].data = data.map(function (i) { return i['ODesc']; });
                chartOption4_2.series[0].data = data.map(function (i) {
                    return {
                        name: i['ODesc'], value: i['CPB']
                    };
                });
                chart3_2.setOption(chartOption4_2, true);
            }
        });




    }
    var getLevelTwo = function (vm, id) {
        $(".chart-display").css("left", "0px");
        $('#chart1').parent().css('display', 'block');
        $('#chart2').parent().css('display', 'block');
        $('#chart3_1').parent().css('display', 'block');
        $('#chart3_2').parent().css('display', 'block');
        $('#chart4_1').parent().css('display', 'none');
        $('#chart4_2').parent().css('display', 'none');
        canvasRender()
        n = 0;
        len = $(".chart-display").find(".chart-box:visible").length;
        len = Math.round(len / 2);

        $("#count_five").find(".select-input")[0].value = "";
        $("#showself>li").click(function () {
            var value = $(this)[0].innerHTML;
            $("#count_five").find(".select-input")[0].value = value;
            var v = $("#count_five").find(".select-input")[0].value;

            if (v == "规模+笔数" || v == "scale+number") {
                len = 2;
                $(".chart-display").css("left", "0px");
                $('#chart1').parent().css('display', 'block');
                $('#chart2').parent().css('display', 'block');
                $('#chart3_1').parent().css('display', 'block');
                $('#chart3_2').parent().css('display', 'block');
            }

            if (v == "规模" || v == "scale") {
                len = 1;
                $(".chart-display").css("left", "0px");
                $('#chart1').parent().css('display', 'none');
                $('#chart2').parent().css('display', 'block');
                $('#chart3_1').parent().css('display', 'none');
                $('#chart3_2').parent().css('display', 'block');
            }

            if (v == "笔数" || v == "number") {
                len = 1;
                $(".chart-display").css("left", "0px");
                $('#chart1').parent().css('display', 'block');
                $('#chart2').parent().css('display', 'none');
                $('#chart3_1').parent().css('display', 'block');
                $('#chart3_2').parent().css('display', 'none');
            }
        })

        var self = vm;

        var params = [
                ["DimAssetTypeID", id, "int"],
                 ["UserName", RoleOperate.cookieName(), "string"]
        ];

        self.waitLoading(true);
        var promise = webProxy.comGetData(params, svcUrl, 'usp_GetSInfoLevelTwo_new');
        promise().then(function (response) {
            if (typeof response === 'string') {
                var data = JSON.parse(response);
                self.totalAssetsCount(data.reduce(function (s, i) { return s + i['ANO']; }, 0))
                self.totalAssetsScale(data.reduce(function (s, i) { return s + i['CPB']; }, 0))
                self.totalSource(-1)
                self.totalTrusts(-1)
                self.waitLoading(false);
                chartOption4_1.title.text = langall.assetOrigin + '-' + langall.assetNumberTotle;
                chartOption4_1.series[0].name = langall.assetOrigin;
                var arryx = [];
                var tdata=[]
                $.each(self.select2(), function (i, v) {
                    if (v.name != '全部') {
                        arryx.push(v.name);
                        var obj = {};
                        obj.name = v.name;
                        obj.value = 0;
                        tdata.push(obj)
                    }
                })
                chartOption4_1.xAxis[0].data = arryx
                //chartOption4_1.xAxis[0].data = [langall.IndustrialBank, langall.mucfc,
                //    langall.BankofHangzhou, langall.ChinaMerchantsBank, langall.BankofWenzhou, langall.ChinaMinshengBank];
                //var tdata = [{
                //    name: langall.IndustrialBank, value: 0
                //},
                //        {
                //            name: langall.mucfc, value: 0
                //        },
                //        {
                //            name: langall.BankofHangzhou, value: 0
                //        },
                //    {
                //        name: langall.ChinaMerchantsBank, value: 0
                //    },
                //    {
                //        name: langall.BankofWenzhou, value: 0
                //    },
                //    {
                //        name: langall.ChinaMinshengBank, value: 0
                //    }]

                chartOption4_1.series[0].data = tdata.map(function (value) {
                    data.forEach(function (i, index, array) {
                        if (value['name'] == i['ODesc']) {
                            value = {
                                name: i['ODesc'], value: i['ANO']
                            };
                        }
                    });
                    return value;
                });
                chart1.setOption(chartOption4_1,true);
                chart1.resize()
                chartOption4_2.title.text = langall.assetOrigin + '-' + langall.assetScaleTotle;
                chartOption4_2.series[0].name = langall.assetOrigin;
                //chartOption4_2.xAxis[0].data = [langall.IndustrialBank, langall.mucfc,
                //    langall.BankofHangzhou, langall.ChinaMerchantsBank, langall.BankofWenzhou, langall.ChinaMinshengBank];
                chartOption4_2.xAxis[0].data = arryx
                chartOption4_2.series[0].data = tdata.map(function (value) {
                    data.forEach(function (i, index, array) {
                        if (value['name'] == i['ODesc']) {
                            value = {
                                name: i['ODesc'], value: i['CPB']
                            };
                        }
                    });
                    return value;
                });
                chart2.setOption(chartOption4_2,true);
            }
        });

        ////////////////////////

        promise = webProxy.comGetData(params, svcUrl, 'usp_GetSInfoLevelTwoAss_new');
        promise().then(function (response) {
            if (typeof response === 'string') {
                var data = JSON.parse(response);

                self.waitLoading(false);

                chartOption3_1.xAxis[0].data = data.map(function (i) {
                    return i['TrustCode'];
                });
                chartOption3_1.series[0].data = data.map(function (i) {
                    return {
                        name: i['TrustCode'], value: i['ANO']
                    };
                });
                chart3_1.setOption(chartOption3_1);



                chartOption3_2.xAxis[0].data = data.map(function (i) { return i['TrustCode']; });
                chartOption3_2.series[0].data = data.map(function (i) {
                    return {
                        name: i['TrustCode'], value: i['CPB']
                    };
                });
                chart3_2.setOption(chartOption3_2);
            }
        });


    }

    var getLevelThree = function (vm, pid, id) {
        $(".chart-display").css("left", "0px");
        $('#chart1').parent().css('display', 'none');
        $('#chart2').parent().css('display', 'none');
        $('#chart3_1').parent().css('display', 'block');
        $('#chart3_2').parent().css('display', 'block');
        $('#chart4_1').parent().css('display', 'none');
        $('#chart4_2').parent().css('display', 'none');
        canvasRender()
        console.log("111")
        n = 0;
        len = $(".chart-display").find(".chart-box:visible").length;
        len = Math.round(len / 2);
        $("#count_five").find(".select-input")[0].value = "";
        $("#showself>li").click(function () {
            var value = $(this)[0].innerHTML;
            $("#count_five").find(".select-input")[0].value = value;
            var v = $("#count_five").find(".select-input")[0].value;

            if (v == "规模+笔数" || v == "scale+number") {
                len = 1;
                $(".chart-display").css("left", "0px");
                $('#chart1').parent().css('display', 'none');
                $('#chart2').parent().css('display', 'none');
                $('#chart3_1').parent().css('display', 'block');
                $('#chart3_2').parent().css('display', 'block');
                $('#chart4_1').parent().css('display', 'none');
                $('#chart4_2').parent().css('display', 'none');
            }

            if (v == "规模" || v == "scale") {
                len = 1;
                $(".chart-display").css("left", "0px");
                $('#chart1').parent().css('display', 'none');
                $('#chart2').parent().css('display', 'none');
                $('#chart3_1').parent().css('display', 'none');
                $('#chart3_2').parent().css('display', 'block');
                $('#chart4_1').parent().css('display', 'none');
                $('#chart4_2').parent().css('display', 'none');
            }

            if (v == "笔数" || v == "number") {
                len = 1;
                $(".chart-display").css("left", "0px");
                $('#chart1').parent().css('display', 'none');
                $('#chart2').parent().css('display', 'none');
                $('#chart3_1').parent().css('display', 'block');
                $('#chart3_2').parent().css('display', 'none');
                $('#chart4_1').parent().css('display', 'none');
                $('#chart4_2').parent().css('display', 'none');
            }
        })

        var self = vm;

        var params = [
                ["DimAssetTypeID", pid, "int"],
                ["DimOrganisationID", id, "int"],
                 ["UserName", RoleOperate.cookieName(), "string"]
        ];

        self.waitLoading(true);

        var promise = webProxy.comGetData(params, svcUrl, 'usp_GetSInfoLevelThree_new');

        promise().then(function (response) {
            if (typeof response === 'string') {
                var data = JSON.parse(response);
                self.totalAssetsCount(data.reduce(function (s, i) { return s + i['ANO']; }, 0))
                self.totalAssetsScale(data.reduce(function (s, i) { return s + i['CPB']; }, 0))
                self.totalSource(-1)
                self.totalTrusts(-1)
                self.waitLoading(false);
                chartOption3_1.title.text = langall.trust + '-' + langall.assetNumberTotle;
                //chartOption3_1.tooltip.formatter = function (data) {
                //    var res = data[0].name;
                //    var value = data[0].value;
                //    var str = langall.trust + ":" + res + "<br>";
                //    str += langall.assetNumberTotle + ":" + formatno(value) + langall.tiao;
                //    return str
                //};
                chartOption3_1.series[0].name = langall.trust;


                chartOption3_1.xAxis[0].data = data.map(function (i) {
                    return i['TrustCode'];
                });

                chartOption3_1.series[0].data = data.map(function (i) {
                    return { name: i['TrustCode'], value: i['ANO'] };
                });

                chart3_1.setOption(chartOption3_1);

                chartOption3_2.title.text = langall.trust + '-' + langall.assetScaleTotle;

                //chartOption3_2.tooltip.formatter = function (data) {
                //    var res = data[0].name;
                //    var value = data[0].value;
                //    var str = langall.trust + ":" + res + "<br>";
                //    str += langall.assetScaleTotle + ":" + formatno(value) + langall.tiao;
                //    return str
                //};

                chartOption3_2.series[0].name = langall.trust;
                chartOption3_2.xAxis[0].data = data.map(function (i) {
                    return i['TrustCode'];
                });

                chartOption3_2.series[0].data = data.map(function (i) {
                    return {
                        name: i['TrustCode'], value: i['CPB']
                    };
                });

                chart3_2.setOption(chartOption3_2);






            }
        });
    }

    var getLevelFour = function (vm, rid, pid, id) {
        $(".chart-display").css("left", "0px");
        $('#chart1').parent().css('display', 'block');
        $('#chart2').parent().css('display', 'block');
        $('#chart3_1').parent().css('display', 'none');
        $('#chart3_2').parent().css('display', 'none');
        $('#chart4_1').parent().css('display', 'none');
        $('#chart4_2').parent().css('display', 'none');

        canvasRender()

        n = 0;

        len = $(".chart-display").find(".chart-box:visible").length;
        len = Math.round(len / 2);
        $("#count_five").find(".select-input")[0].value = "";

        $("#showself>li").click(function () {
            var value = $(this)[0].innerHTML;
            $("#count_five").find(".select-input")[0].value = value;
            var v = $("#count_five").find(".select-input")[0].value;

            if (v == "规模+笔数" || v == "scale+number") {
                len = 1;
                $(".chart-display").css("left", "0px");
                $('#chart1').parent().css('display', 'block');
                $('#chart2').parent().css('display', 'block');
                $('#chart3_1').parent().css('display', 'none');
                $('#chart3_2').parent().css('display', 'none');
                $('#chart4_1').parent().css('display', 'none');
                $('#chart4_2').parent().css('display', 'none');
            }

            if (v == "规模" || v == "scale") {
                len = 1;
                $(".chart-display").css("left", "0px");
                $('#chart1').parent().css('display', 'none');
                $('#chart2').parent().css('display', 'block');
                $('#chart3_1').parent().css('display', 'none');
                $('#chart3_2').parent().css('display', 'none');
                $('#chart4_1').parent().css('display', 'none');
                $('#chart4_2').parent().css('display', 'none');
            }

            if (v == "笔数" || v == "number") {
                len = 1;
                $(".chart-display").css("left", "0px");
                $('#chart1').parent().css('display', 'block');
                $('#chart2').parent().css('display', 'none');
                $('#chart3_1').parent().css('display', 'none');
                $('#chart3_2').parent().css('display', 'none');
                $('#chart4_1').parent().css('display', 'none');
                $('#chart4_2').parent().css('display', 'none');
            }
        })

        var self = vm;

        var params = [
                ["DimAssetTypeID", rid, "int"],
                ["DimOrganisationID", pid, "int"],
                ["DimTrustID", id, "int"],
                 ["UserName", RoleOperate.cookieName(), "string"]
        ];

        self.waitLoading(true);
        var promise = webProxy.comGetData(params, svcUrl, 'usp_GetSInfoLevelFour_new');

        promise().then(function (response) {
            if (typeof response === 'string') {
                var data = JSON.parse(response);
                self.totalAssetsCount(data.reduce(function (s, i) { return s + i['ANO']; }, 0))
                self.totalAssetsScale(data.reduce(function (s, i) { return s + i['CPB']; }, 0))
                self.totalSource(-1)
                self.totalTrusts(-1)
                self.waitLoading(false);

                chartOption1.title.text = langall.dataDate + '-' + langall.distributiondiagram_NumberTotle;
                //chartOption1.tooltip.formatter = function (data) {
                //    var res = data[0].name;
                //    var value = data[0].value;
                //    var str = langall.dataDate + ":" + res + "<br>";
                //    str += langall.assetNumberTotle + ":" + formatno(value) + langall.tiao;
                //    return str
                //};
                chartOption1.series[0].name = langall.date;


                chartOption1.xAxis[0].data = data.map(function (i) {
                    return i['DDesc'];
                });
                chartOption1.series[0].data = data.map(function (i) {
                    return { name: i['DDesc'], value: i['ANO'] };
                });
                chartOption1.tooltip.formatter = function (datas) {
                    var res = datas[0].name;
                    var value = datas[0].value;
                    var str = langall.dataDate + ":" + res + "<br>";
                    str += langall.assetNumberTotle + ":" + formatno(value) + langall.tiao;
                    return str
                }
                chart1.setOption(chartOption1);

                chartOption2.title.text = langall.dataDate + '-' + langall.distributiondiagram_ScaleTotle;
                chartOption2.tooltip.formatter = function (data) {
                    var res = data[0].name;
                    var value = data[0].value;
                    var str = langall.dataDate + ":" + res + "<br>";
                    str += langall.assetScaleTotle + ":" + format(value) + langall.yuan;
                    return str
                };

                chartOption2.series[0].name = langall.date;
                chartOption2.xAxis[0].data = data.map(function (i) {
                    return i['DDesc'];
                });

                chartOption2.series[0].data = data.map(function (i) {
                    return {
                        name: i['DDesc'], value: i['CPB']
                    };
                });

                chart2.setOption(chartOption2);



            }
        });
    }


    var getLevelFive = function (vm, rid, pid, did, id) {
        $(".chart-display").css("left", "0px");
        $('#chart1').parent().css('display', 'block');
        $('#chart2').parent().css('display', 'block');
        $('#chart3_1').parent().css('display', 'none');
        $('#chart3_2').parent().css('display', 'none');
        $('#chart4_1').parent().css('display', 'none');
        $('#chart4_2').parent().css('display', 'none');
        canvasRender()
        n = 0;
        len = $(".chart-display").find(".chart-box:visible").length;
        len = Math.round(len / 2);
        $("#count_five").find(".select-input")[0].value = "";

        $("#showself>li").click(function () {
            var value = $(this)[0].innerHTML;
            $("#count_five").find(".select-input")[0].value = value;
            var v = $("#count_five").find(".select-input")[0].value;

            if (v == "规模+笔数" || v == "scale+number") {
                len = 1;
                $(".chart-display").css("left", "0px");
                $('#chart1').parent().css('display', 'block');
                $('#chart2').parent().css('display', 'block');
                $('#chart3_1').parent().css('display', 'none');
                $('#chart3_2').parent().css('display', 'none');
                $('#chart4_1').parent().css('display', 'none');
                $('#chart4_2').parent().css('display', 'none');
            }

            if (v == "规模" || v == "scale") {
                len = 1;
                $(".chart-display").css("left", "0px");
                $('#chart1').parent().css('display', 'none');
                $('#chart2').parent().css('display', 'block');
                $('#chart3_1').parent().css('display', 'none');
                $('#chart3_2').parent().css('display', 'none');
                $('#chart4_1').parent().css('display', 'none');
                $('#chart4_2').parent().css('display', 'none');
            }

            if (v == "笔数" || v == "number") {
                len = 1;
                $(".chart-display").css("left", "0px");
                $('#chart1').parent().css('display', 'block');
                $('#chart2').parent().css('display', 'none');
                $('#chart3_1').parent().css('display', 'none');
                $('#chart3_2').parent().css('display', 'none');
                $('#chart4_1').parent().css('display', 'none');
                $('#chart4_2').parent().css('display', 'none');
            }
        })
        var self = vm;

        var params = [
                ["DimAssetTypeID", rid, "int"],
                ["DimOrganisationID", pid, "int"],
                ["DimTrustID", id, "int"],
                ["DimReportingDateID", did, "int"],
                 ["UserName", RoleOperate.cookieName(), "string"]
        ];

        self.waitLoading(true);
        var promise = webProxy.comGetData(params, svcUrl, 'usp_GetSInfoLevelFive_new');

        promise().then(function (response) {
            if (typeof response === 'string') {
                var data = JSON.parse(response);
                self.totalAssetsCount(data.reduce(function (s, i) { return s + i['ANO']; }, 0))
                self.totalAssetsScale(data.reduce(function (s, i) { return s + i['CPB']; }, 0))
                self.totalSource(-1)
                self.totalTrusts(-1)
                self.waitLoading(false);


                chartOption1.title.text = langall.dataDate + '-' + langall.distributiondiagram_NumberTotle;

                chartOption1.tooltip.formatter = function (data) {
                    var res = data[0].name;
                    var value = data[0].value;
                    var str = langall.dataDate + ":" + res + "<br>";
                    str += langall.assetNumberTotle + ":" + formatno(value) + langall.tiao;
                    return str
                };
                chartOption1.series[0].name = langall.date;


                chartOption1.xAxis[0].data = data.map(function (i) {
                    return i['DDesc'];
                });

                chartOption1.series[0].data = data.map(function (i) {
                    return { name: i['DDesc'], value: i['ANO'] };
                });

                chart1.setOption(chartOption1);

                chartOption2.title.text = langall.dataDate + '-' + langall.distributiondiagram_ScaleTotle;

                chartOption2.tooltip.formatter = function (data) {
                    var res = data[0].name;
                    var value = data[0].value;
                    var str = langall.dataDate + ":" + res + "<br>";
                    str += langall.assetScaleTotle + ":" + format(value) + langall.yuan;
                    return str
                };

                chartOption2.series[0].name = langall.date;
                chartOption2.xAxis[0].data = data.map(function (i) {
                    return i['DDesc'];
                });

                chartOption2.series[0].data = data.map(function (i) {
                    return {
                        name: i['DDesc'], value: i['CPB']
                    };
                });

                chart2.setOption(chartOption2);


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
    $("#count_five").click(function () {
        $("#showself").toggle();
        $("#funselect").hide();
    })
    $("#applist").click(function () {
        $("#showself").hide();
        $("#funselect").toggle();
    })
    $(document).on('click.select-group', function (event) {
        var event = event || window.event, $box = $('.select2');
        if (!$box.is(event.target) &&
            $box.has(event.target).length === 0) {
            $("#funselect").hide();
            $("#showself").hide();
        }
    }.bind(this));
    userLanguage = webStorage.getItem('userLanguage')

    function echartschange(obj1, obj2, x, y, z) {
        obj1.grid.bottom = x
        obj1.grid.left = y
        obj1.xAxis[0].axisLabel.rotate = z;
        obj2.setOption(obj1);
    }
    if (userLanguage == "en_GB") {
        echartschange(chartOption1, chart1, "30%", "6.5%", "45");
        //
        echartschange(chartOption2, chart2, "30%", "6.5%", "45");
        //      
        echartschange(chartOption4_1, chart4_1, "20%", "3%", "40");
        //
        echartschange(chartOption4_2, chart4_2, "20%", "3%", "40");
    } else {
        echartschange(chartOption1, chart1, "10%", "3%", "0");
        //
        echartschange(chartOption2, chart2, "10%", "3%", "0");
        //
        echartschange(chartOption4_1, chart4_1, "10%", "3%", "0");
        //
        echartschange(chartOption4_2, chart4_2, "10%", "3%", "0");
    }
    $(".select-group>.select:first>.select-wrap>.options-list").find("li:first").trigger('click');
    if (userLanguage == "en_GB") {
        $("#assetType_all").attr("placeholder", langall.assetType).val('');
    } else {
        $("#assetType_all").attr("placeholder", "资产类型").val('');
    }

});
