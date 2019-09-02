define(function (require) {
    var common = require('common');
    var appGlobal = require('App.Global');
    var GlobalVariable = require('globalVariable');
    var webProxy = require("webProxy");
    var Vue = require("Vue2");
    var trustId = common.getUrlParam('tid');
    var adminDiaLog = require('gs/uiFrame/js/gs-admin-2.pages');
    var GSDialog = require("gsAdminPages");
    var echarts = require('echarts');
    var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
    var taskIndicator = require('gs/taskProcessIndicator');
    var sVariableBuilder = require('gs/sVariableBuilder');
    var xhrOnProgress = function (fun) {
        xhrOnProgress.onprogress = fun;
        return function () {
            var xhr = $.ajaxSettings.xhr();
            if (typeof xhrOnProgress.onprogress !== 'function')
                return xhr
            if (xhrOnProgress.onprogress && xhr.upload) {
                xhr.upload.onprogress = xhrOnProgress.onprogress;
            }
            return xhr
        }
    }

    Vue.filter('returnDate', function (strDate) {
        if (!strDate) {
            return '';
        }
        var str = strDate.replace(new RegExp('\/', 'gm'), '');
        str = eval('new ' + str).dateFormat("yyyy-MM-dd")
        
        return str;
    })
    var vm = new Vue({
        el: '#app',
        data: {
            thNameList: [{
                "thWidth": "11%",
                "thName": "开始日期"
            }, {
                "thWidth": "9.3%",
                "thName": "结束日期间"
            }, {
                "thWidth": "9.3%",
                "thName": "计划本金"
            },
            {
                "thWidth": "8%",
                "thName": "实际回款本金"
            },
            {
                'thWidth': '8%',
                'thName': '计划利息'
            },
            {
                "thWidth": "8%",
                "thName": "实际回款利息"
            },
            {
                "thWidth": "8%",
                "thName": "调整后应还本金"
            },
            {
                "thWidth": "9.3%",
                "thName": "调整后应还利息"
            },
             {
                 "thWidth": "5%",
                 "thName": "状态"
             },
             {
                 "thWidth": "12%",
                 "thName": "注释"
             },
             {
                 "thWidth": "5%",
                 "thName": "保存按钮"
             },
            ],//渲染表头数据
            cashflowList: []//现金流数据
        },
        created: function () {
            var self = this;
            self.Render();
        },
        mounted: function () {
            var self = this;
            self.inputFileClick()
            self.renderLine();
            $("#loading").hide();
        },
        methods: {
            Render: function () {//表格和折线图
                var TrustId = trustId;
                var self = this;
                var executeParams = {
                    SPName: 'usp_GetCashFlowOAAssetPool', SQLParams: [
                        { Name: 'TrustId', value: trustId, DBType: 'int' },
                    ]
                };
                common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParams, function (eventData) {
                    self.cashflowList = eventData;
                });
              
            },
            //添加行高亮
            addHightLight:function($event){
                var target = $event.target
                target = $(target).parent();
                if (target[0].tagName == "TD") {
                    target.parent().addClass("hight_light").siblings().removeClass("hight_light");
                } else {
                    target.addClass("hight_light").siblings().removeClass("hight_light");
                }

            },
            //固定列表头
            tableHeader: function ($event) {
                var target = $event.srcElement;
                var scrollTop = target.scrollTop;
                $("#table_cont").find("thead").css("transform", "translateY(" + scrollTop + "px)")
            },
            //返回日期值
            TobackDate: function (strDate) {
                if (!strDate) {
                    return '';
                }
                var str = strDate.replace(new RegExp('\/', 'gm'), '');
                str = eval('new ' + str).dateFormat("yyyy-MM-dd")

                return str;
            },
            //渲染折线图
            renderLine:function(){
                var self = this;
                var data = self.cashflowList;
                if (data.length == 0) {
                    return false
                }
                //PrincipalAmt_Due 计划回款本金
                var PrincipalAmtDue = [];
                //PrincipalAmt_Paid 实际回款本金
                var PrincipalAmtPaid = [];
                //PrincipalAmt_Adjustment 调整后应还本金
                var PrincipalAmtAdjustment = [];
                var xzb = [];//x轴坐标
                $.each(data, function (i, v) {
                    PrincipalAmtDue.push(v.PrincipalAmt_Due);
                    PrincipalAmtPaid.push(v.PrincipalAmt_Paid);
                    PrincipalAmtAdjustment.push(v.rincipalAmt_Adjustment);
                    xzb.push(self.TobackDate(v.StartDate) + "~" + self.TobackDate(v.EndDate))
                })
                var linechart = echarts.init(document.getElementById('linechart'));
                var linechartOption = {
                    title: {
                        text: '归集信息核对',
                        x: "center",
                        textStyle: {
                            fontFamily: 'Microsoft Yahei',
                            fontSize: 14,
                            fontWeight: '700',
                        },
                    },
                    tooltip: {
                        trigger: 'axis'
                    },
                    animation: false,
                    dataZoom: [{
                        xAxisIndex: [0],
                        type: 'inside',
                        show: true,
                        start: 0,
                        end: 100,
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
                    legend: {
                        data: ['计划回款本金', '实际回款本金', '调整后应还本金'],
                        x: 'left'
                    },
                    xAxis: [
                        {
                            type: 'category',
                            boundaryGap: false,
                            data: []
                        }
                    ],
                    yAxis: [
                        {
                            type: 'value',
                            axisLabel: {
                                formatter: '{value}'
                            }
                        }
                    ],
                    series: [
                        {
                            name: '计划回款本金',
                            type: 'line',
                            data: [],

                        },
                        {
                            name: '实际回款本金',
                            type: 'line',
                            data: [],
                            //markPoint: {
                            //    symbol: 'arrow',
                            //    data: [
                            //        { type: 'max', name: '最大值' },
                            //        { type: 'min', name: '最小值' }
                            //    ]
                            //}
                        },
                         {
                             name: '调整后应还本金',
                             type: 'line',
                             data: [],
                         }
                    ]
                };
                linechartOption.xAxis[0].data = xzb
                linechartOption.series[0].data = PrincipalAmtDue;
                linechartOption.series[1].data = PrincipalAmtPaid;
                linechartOption.series[2].data = PrincipalAmtAdjustment;
                linechart.setOption(linechartOption)
            },//保存单个数据的值
            saveItem: function ($event) {
                var self = this;
                var target = $event.target;
                var dis = $(target).parent().parent();
                var StartDate = dis.find("#StartDate").text();
                var EndDate=dis.find("#EndDate").text();
                var InterestAmt_Paid = dis.find("#InterestAmt_Paid").val()==""?0:dis.find("#InterestAmt_Paid").val();
                var PrincipalAmt_Paid = dis.find("#PrincipalAmt_Paid").val()==""?0:dis.find("#PrincipalAmt_Paid").val();
                var PrincipalAmt_Adjustment = dis.find("#PrincipalAmt_Adjustment").val()==""?0:dis.find("#PrincipalAmt_Adjustment").val();
                var InterestAmt_Adjustment = dis.find("#InterestAmt_Adjustment").val() == "" ? 0 : dis.find("#InterestAmt_Adjustment").val();
                var Annotate = dis.find("#Annotate").val();
                var executeParams = {
                    SPName: 'usp_updateCashFlowOAAssetPool', SQLParams: [
                        { Name: 'TrustId', value: parseFloat(trustId), DBType: 'int' },
                        { Name: 'StartDate', value: StartDate, DBType: 'date' },
                        { Name: 'PrincipalAmt_Paid', value: parseFloat(PrincipalAmt_Paid), DBType: 'decimal' },
                        { Name: 'InterestAmt_Paid', value: parseFloat(InterestAmt_Paid), DBType: 'decimal' },
                        { Name: 'PrincipalAmt_Adjustment', value: parseFloat(PrincipalAmt_Adjustment), DBType: 'decimal' },
                        { Name: 'InterestAmt_Adjustment', value: parseFloat(InterestAmt_Adjustment), DBType: 'decimal' },
                        { Name: 'Annotate', value: Annotate, DBType: 'string' },
                    ]
                };
                console.log(executeParams)
                common.ExecuteGetData(true, svcUrl, 'TrustManagement', executeParams, function (eventData) {
                    GSDialog.HintWindow('区间:' + "&nbsp" + StartDate + "&nbsp" + "至" + "&nbsp" + EndDate + "&nbsp" + "保存成功", function () {
                        location.reload(true)
                    })
                });
            },
          
            //选择文件函数
            inputFileClick: function () {
                $(".input_file_style").find("input").change(function () {
                    var value = $(this)[0].value;
                    if (value != "") {
                        $(this).next()[0].innerHTML = "浏览";
                        value = value.substring(value.lastIndexOf('\\') + 1);
                        $(this).parent().prev().html(value);
                        $(this).parent().next().show();
                    } else {
                        $(this).next()[0].innerHTML = "选择文件";
                        $(this).parent().prev().html("");
                        $(this).parent().next().hide();
                    }
                })
            },
            //上传导入现金流详细信息函数
            UpCashflowDetails: function () {
                var self = this
                var filePath = $('#ImportCashFlowOAAccounts').val();
                var fileName = filePath.substring(filePath.lastIndexOf('\\') + 1);
                var fileType = fileName.substring(fileName.lastIndexOf('.') + 1);
                var args = 'trustId=' + trustId + '&fileFolder=Asset&fileName=' + encodeURIComponent(fileName);
                if (fileType !== 'xls' && fileType !== 'xlsx') {
                    GSDialog.HintWindow('文件不是XLS或XLSX文件');
                    return;
                }
                var fileData = document.getElementById('ImportCashFlowOAAccounts').files[0]
                $.ajax({
                    url: GlobalVariable.DataProcessServiceUrl + 'CommonFileUpload?' + args,
                    type: 'POST',
                    data: fileData,
                    cache: false,
                    dataType: 'json',
                    processData: false, // Don't process the files
                    //contentType: "application/octet-stream", // Set content type to false as jQuery will tell the server its a query string request
                    xhr: xhrOnProgress(function (e) {
                        var percent = Math.floor(e.loaded / e.total * 100);
                        if (percent > 0) {
                            $(".progress").eq(0).css("display", "block");
                            $(".progress").eq(0).find(".progress-bar").css("width", percent + "%");
                            $(".progress").eq(0).find(".progress-bar>span").html("" + percent + "%");
                        }
                        if (percent == 100) {
                            $(".progress").eq(0).css("display", "none");
                        }
                    }),
                    success: function (data) {
                        var path = data.CommonTrustFileUploadResult;
                        self.UpCashflowDetailsTaskProcess(path)

                    },
                    error: function (data) {
                        GSDialog.HintWindow('上传文件错误');
                    }
                })
            },
            //调用导入现金流详细信息task
            UpCashflowDetailsTaskProcess: function (filePath) {
                var fileName = filePath.substring(filePath.lastIndexOf('\\') + 1);
                var fileDirectory = filePath.substring(0, filePath.lastIndexOf('\\')) + '\\' + fileName;
                sVariableBuilder.AddVariableItem('FilePath', fileDirectory, 'String', 0, 0, 0);
                sVariableBuilder.AddVariableItem('TrustId', trustId, 'String', 0, 0, 0);
                //sVariableBuilder.AddVariableItem('ExcelFileName', fileName, 'String', 0, 0, 0);
                var sVariable = sVariableBuilder.BuildVariables();
                var tIndicator = new taskIndicator({
                    width: 500,
                    height: 550,
                    clientName: 'TaskProcess',
                    appDomain: 'ConsumerLoan',
                    taskCode: 'ImportCashFlowOAAccounts',
                    sContext: sVariable,
                    callback: function () {
                        //window.location.href = window.location.href;
                        sVariableBuilder.ClearVariableItem();
                        location.reload(true);
                    }
                });
                tIndicator.show();

            },
            //上传导入现金流归集函数
            UpCashflowCollection: function () {
                var self = this
                var filePath = $('#ImportCashFlowOAAssetPool').val();
                var fileName = filePath.substring(filePath.lastIndexOf('\\') + 1);
                var fileType = fileName.substring(fileName.lastIndexOf('.') + 1);
                var args = 'trustId=' + trustId + '&fileFolder=Asset&fileName=' + encodeURIComponent(fileName);
                if (fileType !== 'xls' && fileType !== 'xlsx') {
                    GSDialog.HintWindow('文件不是XLS或XLSX文件');
                    return;
                }
                var fileData = document.getElementById('ImportCashFlowOAAssetPool').files[0]
                $.ajax({
                    url: GlobalVariable.DataProcessServiceUrl + 'CommonFileUpload?' + args,
                    type: 'POST',
                    data: fileData,
                    cache: false,
                    dataType: 'json',
                    processData: false, // Don't process the files
                    //contentType: "application/octet-stream", // Set content type to false as jQuery will tell the server its a query string request
                    xhr: xhrOnProgress(function (e) {
                        var percent = Math.floor(e.loaded / e.total * 100);
                        if (percent > 0) {
                            $(".progress").eq(1).css("display", "block");
                            $(".progress").eq(1).find(".progress-bar").css("width", percent + "%");
                            $(".progress").eq(1).find(".progress-bar>span").html("" + percent + "%");
                        }
                        if (percent == 100) {
                            $(".progress").eq(1).css("display", "none");
                        }
                    }),
                    success: function (data) {
                        var path = data.CommonTrustFileUploadResult;
                        self.UpCashflowCollectionTaskProcess(path)

                    },
                    error: function (data) {
                        GSDialog.HintWindow('上传文件错误');;
                    }
                })
            },
            //调用导入现金流归集task
            UpCashflowCollectionTaskProcess: function (filePath) {
                var fileName = filePath.substring(filePath.lastIndexOf('\\') + 1);
                var fileDirectory = filePath.substring(0, filePath.lastIndexOf('\\')) + '\\' + fileName;
                sVariableBuilder.AddVariableItem('FilePath', fileDirectory, 'String', 0, 0, 0);
                sVariableBuilder.AddVariableItem('TrustId', trustId, 'String', 0, 0, 0);
                //sVariableBuilder.AddVariableItem('ExcelFileName', fileName, 'String', 0, 0, 0);
                var sVariable = sVariableBuilder.BuildVariables();
                var tIndicator = new taskIndicator({
                    width: 500,
                    height: 550,
                    clientName: 'TaskProcess',
                    appDomain: 'ConsumerLoan',
                    taskCode: 'ImportCashFlowOAAssetPool',
                    sContext: sVariable,
                    callback: function () {
                        //window.location.href = window.location.href;
                        sVariableBuilder.ClearVariableItem();
                        location.reload(true);
                    }
                });
                tIndicator.show();

            },
        },
    })
})