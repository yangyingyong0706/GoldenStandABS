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
    var kendoGrid = require('kendo.all.min');
    require("kendomessagescn");
    require("kendoculturezhCN");
    var ContrastiveList = []//对比数据
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
    this.createInput = function (strDate) {
        if (!strDate) {
            return '';
        }
        var str = strDate.replace(new RegExp('\/', 'gm'), '');
        str = eval('new ' + str).dateFormat("yyyy-MM-dd")

        return str;
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
            CashflowPeriod: [],//期数数列
            PayTerm:"",//对应期数
            thNameList: [{
                "thWidth": "11%",
                "thName": "资产编号"
            }, {
                "thWidth": "9.3%",
                "thName": "计划回款日"
            }, {
                "thWidth": "9.3%",
                "thName": "实际回款日"
            },
            {
                "thWidth": "8%",
                "thName": "计划回款本金"
            },
            {
                'thWidth': '8%',
                'thName': '实际回款本金'
            },
            {
                "thWidth": "8%",
                "thName": "计划回款利息"
            },
            {
                "thWidth": "8%",
                "thName": "实际回款利息"
            },
            {
                "thWidth": "9.3%",
                "thName": "调整后回款日"
            },
            {
                "thWidth": "8%",
                "thName": "调整后应还本金"
            },
             {
                 "thWidth": "8%",
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
            ],//渲染表头数据
            cashflowList: [],//现金流数据
        },
        created:function(){
            var self = this;
            self.GetPayTerm();
            self.RenderTabe();
            if (self.CashflowPeriod.length == 0) {
                $(".inline-block-container").hide()
                $(".layertba").hide()
            }else{
                $(".inline-block-container").show()
                $(".layertba").show()
            }
            if (self.cashflowList.length == 0) {
                $(".tableArea").hide();
            } else {
                $(".tableArea").show()
            }
        },
        mounted:function(){
            $("#TimeLine li").eq(0).trigger("click")
            this.inputFileClick()
            if (this.PayTerm != "") {
                this.RenderFoldline(this.cashflowList[0].AccountNo,false)
            }
            $("#loading").hide()
        },
        methods: {
            RenderFoldline: function (AccountNo,flage) {//渲染折线图
                var AccountNo = AccountNo;
                var TrustId = trustId;
                $(".chart-box").show();
                var executeParams = {
                    SPName: 'usp_GetCashFlowOAAccountsByAccount', SQLParams: [
                        { Name: 'TrustId', value: trustId, DBType: 'int' },
                        { Name: 'AccountNo', value: AccountNo, DBType: 'string' },
                    ]
                };
                common.ExecuteGetData(true, svcUrl, 'TrustManagement', executeParams, function (eventData) {
                    var data = eventData[0];
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
                        PrincipalAmtAdjustment.push(v.PrincipalAmt_Adjustment);
                        xzb.push('第'+v.PayTerm+'期')
                    })
                    var linechart = echarts.init(document.getElementById('linechart'));
                    var linechartOption = {
                        title: {
                            text: '',
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
                    linechartOption.title.text = AccountNo;
                    linechart.setOption(linechartOption)
                    if (flage != false) {
                        $("html, body").animate({ scrollTop: $(document).height() }, 30);
                    }

                });
             
            },
            //保存单个数据的值
            saveItem: function (AccountNo, PrincipalAmt_Paid, InterestAmt_Paid, PayDate_Adjustment, PrincipalAmt_Adjustment, InterestAmt_Adjustment, Annotate) {
                var self = this;
                var PayTerm = self.PayTerm;
                PrincipalAmt_Paid = PrincipalAmt_Paid ? PrincipalAmt_Paid : 0;
                InterestAmt_Paid = InterestAmt_Paid ? InterestAmt_Paid : 0;
                PrincipalAmt_Adjustment = PrincipalAmt_Adjustment ? PrincipalAmt_Adjustment : 0;
                InterestAmt_Adjustment = InterestAmt_Adjustment ? InterestAmt_Adjustment : 0;
                PayDate_Adjustment = self.returnDate(PayDate_Adjustment);
                var executeParams = {
                    SPName: 'usp_UpdateCashFlowOAAccountsByAccount', SQLParams: [
                        { Name: 'TrustId', value: parseFloat(trustId), DBType: 'int' },
                        { Name: 'AccountNo', value: AccountNo, DBType: 'string' },
                        { Name: 'PayTerm', value: parseFloat(PayTerm), DBType: 'int' },
                        { Name: 'PrincipalAmt_Paid', value: parseFloat(PrincipalAmt_Paid), DBType: 'decimal' },
                        { Name: 'InterestAmt_Paid', value: parseFloat(InterestAmt_Paid), DBType: 'decimal' },
                        { Name: 'PayDate_Adjustment', value: PayDate_Adjustment, DBType: 'date' },
                        { Name: 'PrincipalAmt_Adjustment', value: parseFloat(PrincipalAmt_Adjustment), DBType: 'decimal' },
                        { Name: 'InterestAmt_Adjustment', value: parseFloat(InterestAmt_Adjustment), DBType: 'decimal' },
                        { Name: 'Annotate', value: Annotate, DBType: 'string' },
                    ]
                };
                common.ExecuteGetData(true, svcUrl, 'TrustManagement', executeParams, function (eventData) {
                    GSDialog.HintWindow("第" + PayTerm + "期" + "&nbsp" + AccountNo + "&nbsp" + "保存成功", function () {
                        location.reload(true)
                    })
                });
            },
            //多项保存
            saveAllItem: function () {
                var self = this;
                var datalist = self.cashflowList;
                var PayTerm=self.PayTerm;
                var xml = "<table>";
                $.each(datalist, function (i, v) {
                    v.InterestAmt_Paid = v.InterestAmt_Paid ? v.InterestAmt_Paid : 0
                    v.PrincipalAmt_Paid = v.PrincipalAmt_Paid ? v.PrincipalAmt_Paid : 0
                    v.PayDate = v.PayDate ? v.PayDate : '1900-01-01'
                    ContrastiveList[i].InterestAmt_Paid = ContrastiveList[i].InterestAmt_Paid ? ContrastiveList[i].InterestAmt_Paid : 0;
                    ContrastiveList[i].PrincipalAmt_Paid = ContrastiveList[i].PrincipalAmt_Paid ? ContrastiveList[i].PrincipalAmt_Paid : 0;
                    ContrastiveList[i].PayDate = ContrastiveList[i].PayDate ? ContrastiveList[i].PayDate : '1900-01-01';
                    if (v.InterestAmt_Paid != ContrastiveList[i].InterestAmt_Paid || v.PrincipalAmt_Paid != ContrastiveList[i].PrincipalAmt_Paid || v.Annotate != ContrastiveList[i].Annotate) {
                        xml += "<row>" + "<TrustId>" + trustId + "</TrustId>" + "<AccountNo>" + v.AccountNo + "</AccountNo>" + "<PayTerm>" + PayTerm + "</PayTerm>" + "<PayDate>" + v.PayDate + "</PayDate>" + "<PrincipalAmt_Paid>" + v.PrincipalAmt_Paid + "</PrincipalAmt_Paid>" + "<InterestAmt_Paid>" + v.InterestAmt_Paid + "</InterestAmt_Paid>" + "<Annotate>" + v.Annotate + "</Annotate>" + "</row>"
                    }
                })
                xml += "</table>"
                console.log(xml)
                var executeParams = {
                    SPName: 'usp_UpdateCashFlowOAAccountsByAccount', SQLParams: [
                        { Name: 'Xml', value: xml, DBType: 'xml' },
                    ]
                };
                common.ExecuteGetData(true, svcUrl, 'TrustManagement', executeParams, function (eventData) {
                    GSDialog.HintWindow("保存成功", function () {
                        location.reload(true)
                    })
                });
            },
            //渲染每期对应的表格数据
            RenderTabe: function () {
                var self = this;
                var PayTerm = self.PayTerm;
                if (PayTerm == "") {
                    return false;
                }
                var executeParams = {
                    SPName: 'usp_GetCashFlowOAAccountsByTerm', SQLParams: [
                        { Name: 'TrustId', value: trustId, DBType: 'int' },
                        { Name: 'PayTerm', value: PayTerm, DBType: 'int' }
                    ]
                };
                common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParams, function (eventData) {
                    self.cashflowList = eventData;
                });
            },
            //获取期数函数
            GetPayTerm: function () {
                var self = this;
                var executeParams = {
                    SPName: 'usp_GetTermsOfCashFlowAccount', SQLParams: [
                        { Name: 'TrustId', value: trustId, DBType: 'int' }
                    ]
                };
                common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParams, function (eventData) {
                    self.CashflowPeriod = eventData;
                    if (eventData.length > 0) {
                        self.PayTerm = eventData[0].PayTerm
                    }
                });
            },
            //添加行高亮
            addHightLight: function ($event) {
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
                var target = $event.srcElement
                var scrollTop = target.scrollTop;
                var scrollLeft = target.scrollLeft;
                $("#table_cont").find("thead").css("transform", "translateY(" + scrollTop + "px)");
                $("#table_cont").find(".tablef_fixed").css("transform", "translateX(" + scrollLeft + "px)")
                $("#table_cont").find("thead>tr>th:first").css({ "transform": "translateX(" + scrollLeft + "px)", "background": "#f8f8f8" })
                
            },
            //点击每期获取不同的表格数据
            loadingPeriod: function (PayTerm, $event) {
                var PayTerm = PayTerm;
                var self = this;
                var target = $event.currentTarget;
                $(target).addClass('selected').siblings().removeClass('selected');
                $(".chart-box").hide();
                self.PayTerm = PayTerm;
                var executeParams = {
                    SPName: 'usp_GetCashFlowOAAccountsByTerm', SQLParams: [
                        { Name: 'TrustId', value: trustId, DBType: 'int' },
                        { Name: 'PayTerm', value: self.PayTerm, DBType: 'int' }
                    ]
                };
                common.ExecuteGetData(true, svcUrl, 'TrustManagement', executeParams, function (eventData) {
                    ContrastiveList = JSON.parse(JSON.stringify(eventData));
                    self.cashflowList = eventData;
                    
                });
            },
            //选择文件函数
             inputFileClick:function() {
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
                var self=this
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
                    xhr:xhrOnProgress(function (e) {
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
                        GSDialog.HintWindow('上传文件错误');;
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
                         sVariableBuilder.ClearVariableItem();
                         location.reload(true);
                     }
                 });
                 tIndicator.show();

             },
             //returnDate: function (strDate) {

             //    var strDate = strDate;
             //    if (!strDate) {
             //        return '';
             //    }
             //    var str = strDate.replace(new RegExp('\/', 'gm'), '');
             //    str = eval('new ' + str).dateFormat("yyyy-MM-dd")

             //    return str;
             //}
        },
    })
})