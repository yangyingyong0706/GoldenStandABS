define(function (require) {
    var common = require('common');
    var $ = require('jquery');
    var toast = require('toast');
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
    var kendoGridModel = require('gs/Kendo/kendoGridModel');
    require("kendomessagescn");
    require("kendoculturezhCN");
    require("date_input");
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
    
    $(function () {
        $("#loading").hide();
        var cashflowList = [];
        //导入导入现金流归集信息
        $(".openDialog").click(function () {
            GSDialog.open('导入现金流归集信息', './ImportFileWithTemplate.html?trustId=' + trustId + '&uploadType=CashFlowOAAssetPool', '', '', 600, 250, "", true, false, true, false)
        })
        $(".CashflowDialog").click(function () {
                $.anyDialog({
                    title: '归集信息核对图',
                    html: $(".chart-box").show(),
                    width: 900,
                    height: 500,
                    changeallow: false

                })
        });
        function RenderGrid() {
            var h = $("body").height() - 110;
            var cashflowListOne = []//第一层数据（资产编号等信息）
            var executeParams = {
                SPName: 'usp_GetCashFlowOAAssetPool', SQLParams: [
                    { Name: 'TrustId', value: trustId, DBType: 'int' },
                ]
            };
            common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParams, function (eventData) {
                cashflowListOne = eventData;
                cashflowList = eventData
            });
            this.RenturnPrincipalAmt = function (PrincipalAmt_Paid) {
                PrincipalAmt_Paid = PrincipalAmt_Paid ? PrincipalAmt_Paid : 0
                PrincipalAmt_Paid = common.numFormt(PrincipalAmt_Paid)
                return "<input class='PrincipalAmt_Paid input_style' value='" + PrincipalAmt_Paid + "' style='width:100%' autocomplete='off'>"
            }
            this.RenturnInterestAmt = function (InterestAmt_Paid) {
                InterestAmt_Paid = InterestAmt_Paid ? InterestAmt_Paid : 0
                InterestAmt_Paid = common.numFormt(InterestAmt_Paid)
                return "<input class='InterestAmt_Paid input_style' value='" + InterestAmt_Paid + "' style='width:100%' autocomplete='off'>"
            }
            this.RenturnAnnotate = function (Annotate) {
                Annotate = Annotate ? Annotate : ''
                return "<textarea class='Annotate' value='" + Annotate + "' style='width:100%'>" + Annotate + "</textarea>"
            }
            this.RenturnRincipalAmt = function (rincipalAmt_Adjustment) {
                rincipalAmt_Adjustment = rincipalAmt_Adjustment ? rincipalAmt_Adjustment : 0
                rincipalAmt_Adjustment = common.numFormt(rincipalAmt_Adjustment)
                return "<span class='rincipalAmt_Adjustment'>" + rincipalAmt_Adjustment + "</span>"
            }
            this.RenturnAdjustment = function (InterestAmt_Adjustment) {
                InterestAmt_Adjustment = InterestAmt_Adjustment ? InterestAmt_Adjustment : 0
                InterestAmt_Adjustment = common.numFormt(InterestAmt_Adjustment)
                return "<span class='InterestAmt_Adjustment'>" + InterestAmt_Adjustment + "</span>"
            }
            this.RenturnStartDate = function (StartDate) {
                return "<span class='StartDate'>" + StartDate + "</span>"
            }
            this.RenturnEndDate = function (EndDate) {
                return "<span class='EndDate'>" + EndDate + "</span>"
            }
            var pageIndex = 0;
            var selectedRowIndex = -1;
            var gridOptions = {
                dataSource: cashflowListOne,
                scrollable: true,
                sortable: true,
                selectable: "multiple",
                filterable: true,
                reorderable: true,//列的排序,选择一列可以拖动改变她的顺序
                resizable: true,//动态改变列的宽度,在scrollable为true的时候有效,scrollable默认为true
                height: h,
                orderBy: 'StartDate',
                pageable: {
                    refresh: true,
                    pageSizes: true,
                    buttonCount: 5,
                    page: 1,
                    pageSize: 15,
                    pageSizes: [15, 30, 45, 60, 80, 100],
                },
                dataBound: function () {
                    var rows = this.items();
                    var page = this.pager.page() - 1;
                    var pagesize = this.pager.pageSize();
                    if (page != pageIndex) {
                        selectedRowIndex = -1;
                        pageIndex = page;
                    }
                    $(rows).each(function () {
                        var index = $(this).index();
                        var dataIndex = $(this).index() + page * pagesize;
                        var rowLabel = $(this).find(".row-number");
                        $(rowLabel).attr("index", index);
                        $(rowLabel).attr("dataIndex", dataIndex);
                    });

                    if (selectedRowIndex > -1) {
                        selectGridRow(selectedRowIndex);
                    }
                },
                filterable: true,
                columns: [
                    {
                        field: "StartDate",
                        title: "开始日期",
                        width: "120px",
                        locked: true,
                        template: '#=this.RenturnStartDate(StartDate)#'
                    },
                    {
                        field: "EndDate",
                        title: "结束日期间",
                        width: "120px",
                        locked: true,
                        template: '#=this.RenturnEndDate(EndDate)#'
                    },
                    {
                        field: "PrincipalAmt_Due",
                        title: "计划本金",
                        width: "150px",
                        format: "{0:n}"
                    },
                    {
                        field: "PrincipalAmt_Paid",
                        title: "实际回款本金",
                        width: "150px",
                        template: '#=this.RenturnPrincipalAmt(PrincipalAmt_Paid)#',//可修改
                        format: "{0:n}"
                    },
                    {
                        field: "InterestAmt_Due",
                        title: "计划利息",
                        width: "150px",
                        format: "{0:n}"
                    },
                    {
                        field: "InterestAmt_Paid",//可修改
                        title: "实际回款利息",
                        width: "150px",
                        template: '#=this.RenturnInterestAmt(InterestAmt_Paid)#',
                        format: "{0:n}"
                    },
                    {
                        field: "rincipalAmt_Adjustment",
                        title: "新计划应还本金",
                        width: "150px",
                        format: "{0:n}",
                        template: '#=this.RenturnRincipalAmt(rincipalAmt_Adjustment)#',
                    },
                    {
                        field: "InterestAmt_Adjustment",
                        title: "新计划应还利息",
                        width: "150px",
                        format: "{0:n}",
                        template: '#=this.RenturnAdjustment(InterestAmt_Adjustment)#',
                    },
                    {
                        field: "Trust_Status",
                        title: "状态",
                        width: "80px",
                    },
                    {
                        field: "Annotate",
                        title: "注释",
                        width: "300px",
                        template: '#=this.RenturnAnnotate(Annotate)#'
                    },
                ]
            }
            var element = $("#grid").kendoGrid(gridOptions)
            $("<button class='btn btn-default saveGrid'>保存</button>").appendTo($("#grid"))
            SaveItem(cashflowListOne)
        }
        RenderGrid()
        function RenderLine() {
            var data = cashflowList;
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
                xzb.push(v.StartDate + "~" + v.EndDate)
            })
            if (PrincipalAmtDue || PrincipalAmtPaid || PrincipalAmtAdjustment) {
                document.getElementById('linechart').style.display = 'block';
            }
            var linechart = echarts.init(document.getElementById('linechart'));
            var linechartOption = {
                //title: {
                //    text: '归集信息核对',
                //    x: "center",
                //    textStyle: {
                //        fontFamily: 'Microsoft Yahei',
                //        fontSize: 14,
                //        fontWeight: '700',
                //    },
                //},
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
                    data: ['计划回款本金', '实际回款本金', '新计划应还本金'],
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
                         name: '新计划应还本金',
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
        }
        //$('#linechart').height(250)
        RenderLine()
    })
    //刷新页面
    $(".k-pager-refresh.k-link").click(function () {
        location.reload(true)
    })
    //点击保存按钮保存数据
    function SaveItem(cashflowListOne) {
        var cashflowListOne = cashflowListOne;
        $(".saveGrid").click(function () {
            var StartDateList = $(this).parent().find(".StartDate")//开始日期
            var EndDateList = $(this).parent().find(".EndDate")//结束日期
            var RincipalAmtList = $(this).parent().find(".rincipalAmt_Adjustment");//新计划应还本金PrincipalAmt_Adjustment
            var PrincipalAmtPaidList = $(this).parent().find(".PrincipalAmt_Paid");//实际回款本金
            var InterestAmtPaidList = $(this).parent().find(".InterestAmt_Paid")//实际回款利息
            var AnnotateList = $(this).parent().find(".Annotate")//注释
            var InterestAmtAdjList = $(this).parent().find(".InterestAmt_Adjustment")//新计划应还利息
            var xml = "<table>"
            $.each(cashflowListOne, function (i, v) {
                for (k = 0; k < StartDateList.length; k++) {
                    if (v.StartDate == StartDateList.eq(k).html() && v.EndDate == EndDateList.eq(k).html()) {
                        if (PrincipalAmtPaidList.eq(k).val() == "") {
                            PrincipalAmtPaidList.eq(k).val(0)
                        }
                        if (InterestAmtPaidList.eq(k).val() == "") {
                            InterestAmtPaidList.eq(k).val(0)
                        }
                        if (v.InterestAmt_Paid != InterestAmtPaidList.eq(k).val().replace(/,/g, "") || v.PrincipalAmt_Paid != PrincipalAmtPaidList.eq(k).val().replace(/,/g, "") || v.Annotate != AnnotateList.eq(k).val()) {
                            xml += "<row>" + "<TrustId>" + trustId + "</TrustId>" + "<StartDate>" + StartDateList.eq(k).html() + "</StartDate>" + "<PrincipalAmt_Paid>" + PrincipalAmtPaidList.eq(k).val().replace(/,/g, "") + "</PrincipalAmt_Paid>" + "<InterestAmt_Paid >" + InterestAmtPaidList.eq(k).val().replace(/,/g, "") + "</InterestAmt_Paid >" + "<PrincipalAmt_Adjustment>" + RincipalAmtList.eq(k).html().replace(/,/g, "") + "</PrincipalAmt_Adjustment>" + "<InterestAmt_Adjustment>" + InterestAmtAdjList.eq(k).html().replace(/,/g, "") + "</InterestAmt_Adjustment>" + "<Annotate>" + AnnotateList.eq(k).val() + "</Annotate>" + "</row>"
                        }
                    }
                }
            })
            xml += "</table>"
            console.log(xml)
            var executeParams = {
                SPName: 'usp_updateCashFlowOAAssetPool', SQLParams: [
                    { Name: 'Xml', value: xml, DBType: 'xml' },
                ]
            };
            $("#mask").show()
            common.ExecuteGetData(true, svcUrl, 'TrustManagement', executeParams, function (eventData) {
                $("#mask").hide()
                $.toast({
                    type: 'success', message: '保存成功', afterHidden: function () {
                        location.reload(true)
                    }
                })
            });
        })
    }
    //千分位添加
    $("#grid").on("keyup", ".PrincipalAmt_Paid", function () {
        common.MoveNumFormt(this)
    })
    $("#grid").on("keyup", ".InterestAmt_Paid", function () {
        common.MoveNumFormt(this)
    })
})