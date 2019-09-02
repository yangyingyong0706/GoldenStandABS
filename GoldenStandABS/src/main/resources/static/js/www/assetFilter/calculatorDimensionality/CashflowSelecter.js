define(function (require) {
    var $ = require('jquery');
    var kendoGridModel = require('gs/Kendo/kendoGridModel');
    require("kendomessagescn");
    require("kendoculturezhCN");
    require('date_input');
    var GlobalVariable = require('globalVariable');
    GSDialog = require('gs/uiFrame/js/gs-admin-2.pages');
    var common = require('gs/uiFrame/js/common')
    var taskIndicator = require('gs/taskProcessIndicator');
    var sVariableBuilder = require('gs/sVariableBuilder');
    var Vue = require('Vue2');
    var PoolDBName = common.getQueryString('PoolDBName');
    var TrustId = common.getQueryString('TrustId');
    var PoolId = common.getQueryString('PoolId');
    var widthOx = 1;
    function getDate(datestr) {
        var temp = datestr.split("-");
        if (temp[1] === '01') {
            temp[0] = parseInt(temp[0], 10) - 1;
            temp[1] = '12';
        } else {
            temp[1] = parseInt(temp[1], 10) - 1;
        }
        //new Date()的月份入参实际都是当前值-1
        var date = new Date(temp[0], temp[1], temp[2]);
        return date;
    }
    /**
     ***获取两个日期间的所有日期
     ***默认start<end
     **/
    function getDiffDate(start, end) {
        var startTime = getDate(start);
        var endTime = getDate(end);
        if (start == end) {
            var dateArr = [];
            dateArr.push(end);
            return dateArr;
        } else if (startTime < endTime) {
            var dateArr = [];
            while ((endTime.getTime() - startTime.getTime()) != 0) {
                var year = startTime.getFullYear();
                var month = (startTime.getMonth() + 1).toString().length === 1 ? "0" + (parseInt(startTime.getMonth().toString(), 10) + 1) : (startTime.getMonth() + 1);
                var day = startTime.getDate().toString().length === 1 ? "0" + startTime.getDate() : startTime.getDate();
                dateArr.push(year + "-" + month + "-" + day);
                startTime.setDate(startTime.getDate() + 1);
            }
            dateArr.push(end);
            return dateArr;
        } else {
            alert('开始日期小于结束日期！')
        }
        
        
    }
    function getAllDate(start, end) {
        var arr = [];
        arr = getBetweenDateStr(start, end);
        return arr;
    }
    function getBetweenDateStr(start, end) {
        var result = [];
        var beginDay = start.split("-");
        var endDay = end.split("-");
        var diffDay = new Date();
        var dateList = new Array;
        var i = 0;
        diffDay.setDate(beginDay[2]);
        diffDay.setMonth(beginDay[1] - 1);
        diffDay.setFullYear(beginDay[0]);
        result.push(start);
        while (i == 0) {
            var countDay = diffDay.getTime() + 24 * 60 * 60 * 1000;
            diffDay.setTime(countDay);
            dateList[2] = diffDay.getDate();
            dateList[1] = diffDay.getMonth() + 1;
            dateList[0] = diffDay.getFullYear();
            if (String(dateList[1]).length == 1) { dateList[1] = "0" + dateList[1] };
            if (String(dateList[2]).length == 1) { dateList[2] = "0" + dateList[2] };
            result.push(dateList[0] + "-" + dateList[1] + "-" + dateList[2]);
            if (dateList[0] == endDay[0] && dateList[1] == endDay[1] && dateList[2] == endDay[2]) {
                i = 1;
            }
        }
        return result;
    }
    
    var vm = new Vue({
        el: '#app',
        data: {
            timeArr: [],
            splitDot: {
            },
            endDot: [],
            startDot: [],
            centerDot: [],
            radioValue: '',
            noShow: false,
            yesShow: true,
            loading: false,
            StartDate: '',
            DimReportingDate: '',
            EndDate: '',
            dataSouceNo: '0',
            dataSouceYes: '0',
            DivideDate: ''
        },
        mounted: function () {
            this.GetRadioValue()
            this.GetAssetsDate()
        },
        watch: {
            radioValue: function (now, old) {
                var self = this;
                if (now == 'true' || now == true) {
                    self.yesShow = true;
                    self.noShow = false;
                } else {
                    self.yesShow = false;
                    self.noShow = true;
                }
            },
            splitDot: {
                deep:true,
                handler: function (val, oldVal){
                    this.$nextTick(function () {
                        this.InitDatePlugin()
                    })
                }
            }
        },
        methods: {
            GetRadioValue: function(){
                var self = this;
                //获取现金流拼接历史记录
                //AppDomain : PoolDBName
                //SPName : Asset.usp_GetCashFlowDataJoinRecords
                //参数 PoolId int
                //返回值：IsJoinHistoryRepayment 是否拼接还款计划  值： True  False
                //CashFlowSource 计划现金流 值 0 1 2 3
                //DivideDate 分割点日期
                var executeParam = {
                    SPName: 'Asset.usp_GetCashFlowDataJoinRecords',
                    SQLParams: [
                        { Name: 'PoolId', value: PoolId, DBType: 'string' }
                    ]
                };
                var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonGetExecuteForPool?&connConfig=DAL_SEC_PoolConfig&";

                common.ExecuteGetData(false, serviceUrl, PoolDBName, executeParam, function (data) {
                    if (data.length>0) {
                        self.radioValue = data[0].IsJoinHistoryRepayment
                        if (data[0].IsJoinHistoryRepayment == true) {
                            self.dataSouceYes = data[0].CashFlowSource
                        } else {
                            self.dataSouceNo = data[0].CashFlowSource 
                        }
                        self.DivideDate = data[0].DivideDate != '1900-01-01'?data[0].DivideDate:''
                    } else {
                        self.radioValue = true
                    }
                });
            },
        	checkResult: function() {
        		window.location.href = './CashflowSelecterResult.html?PoolDBName=' + PoolDBName + '&TrustId=' + TrustId + '&PoolId=' + PoolId
        	},
            GetAssetsDate: function () {
                var self = this;
                var executeParam = {
                    SPName: 'Asset.usp_GetAssetsDate',
                    SQLParams: [
                        { Name: 'PoolDBName', value: PoolDBName, DBType: 'string' },
                        { Name: 'PoolId', value: PoolId, DBType: 'string' }
                    ]
                };
                var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonGetExecuteForPool?&connConfig=DAL_SEC_PoolConfig&";

                common.ExecuteGetData(false, serviceUrl, PoolDBName, executeParam, function (data) {
                    console.log(data)
                    self.StartDate = data[0].StartDate;
                    self.DimReportingDate = data[0].DimReportingDate;
                    self.EndDate = data[0].EndDate;

                    if (self.StartDate > self.DimReportingDate || self.StartDate > self.EndDate || self.DimReportingDate > self.EndDate || !self.StartDate || !self.DimReportingDate || !self.EndDate) {
                        GSDialog.HintWindow('获取的日期有误！')
                        self.$nextTick(function () {
                            self.loading = false;
                            $(".bottomSelecter").find(".date-plugins").date_input();
                            $('.timeAxis').hide();
                            $('#saveSetting').attr('disabled',true)
                        })
                    } else {
                        self.InitTimeline();
                    }
                });
            },
            InitTimeline: function () {
                var self = this;
                var DivideDate = self.DivideDate ? self.DivideDate : self.DimReportingDate;
                var timeJson1 = [self.StartDate, DivideDate,self.DimReportingDate];
                var timeJson2 = [self.DimReportingDate, self.EndDate];
                var timeArrHistory = getDiffDate(self.StartDate, self.DimReportingDate);
                var timeArrFuture = getDiffDate(self.DimReportingDate, self.EndDate);
                var timeArr = getDiffDate(self.StartDate, self.EndDate);
                //var timeArrHistory = getBetweenDateStr(self.StartDate, self.DimReportingDate);
                //var timeArrFuture = getBetweenDateStr(self.DimReportingDate, self.EndDate);
                //var timeArr = getBetweenDateStr(self.StartDate, self.EndDate);
                this.timeArr = timeArr;
                //var winWidth = $(window).width();
                //calWidth = (winWidth - 280) / timeArrHistory.length;
                //if (calWidth > 1) {
                //    widthOx = 1
                //} else {
                //    widthOx = calWidth
                //}
                $('.timeLine.timeLine1').width(timeArrHistory.length * widthOx + 16);
                $('.timeLine.timeLine2').width(timeArrFuture.length * widthOx);
                var timeIndex1 = [];
                var timeIndex2 = [];
                var timeIndexInput = 0;
                $.each(timeArr, function (i, v) {
                    $.each(timeJson1, function (j, n) {
                        if (v == n) {
                            timeIndex1.push(i);
                        }
                    })
                });
                $.each(timeArr, function (i, v) {
                    $.each(timeJson2, function (j, n) {
                        if (v == n) {
                            timeIndex2.push(i);
                        }
                    })
                });
                var timeLastJson1 = [];
                var timeLastJson2 = [];
                $.each(timeJson1, function (i, v) {
                    timeLastJson1.push({ 'index': i, 'date': v, 'leftIndex': timeIndex1[i], 'widthOx': widthOx })
                });
                $.each(timeJson2, function (i, v) {
                    timeLastJson2.push({ 'index': i, 'date': v, 'leftIndex': timeIndex2[i], 'widthOx': widthOx })
                });
                self.splitDot = timeLastJson1[1]
                this.endDot = timeLastJson2[1],
                this.startDot = timeLastJson1[0],
                this.centerDot = timeLastJson2[0];
                $('.history').width(timeLastJson1[2].leftIndex * widthOx + 10);
                this.$nextTick(function () {
                    self.loading = false;
                    //self.InitDatePlugin();
                })
            },
            InitDatePlugin: function () {
                $(".bottomSelecter").find(".date-plugins").date_input();
            },
            moveDot: function () {
                var self = this;
                var dotIndex = 0,
                onOff = false,
                splitDotLeftIndex = self.splitDot.leftIndex,
                splitDotDate = self.splitDot.date;
                var endDotTag = false, endDotOx = 0, endDotLeft, moveOx = 0, arrIndex = 0, oringeLeft, scrollLeft = 0;
                $('.splitDotDiv .prev-dot').mousedown(function (e) {
                    endDotLeft = $('.splitDotDiv .prev-dot').position().left;
                    oringeLeft = $('.splitDotDiv .prev-dot').position().left;
                    endDotOx = e.pageX - endDotLeft;
                    endDotTag = true;
                    onOff = true;
                    scrollLeft = $(".scrollTimeLine .ul").scrollLeft();
                });
                $(document).mouseup(function () {
                    endDotTag = false;
                    if (onOff) {
                        self.splitDot.leftIndex = splitDotLeftIndex;
                        onOff = false;
                    }
                });
                $('.ul').mousemove(function (e) {//鼠标移动
                    if (endDotTag) {
                        $('.tipsWord').text('');
                        endDotLeft = e.pageX - endDotOx + scrollLeft;
                        if (endDotLeft > (self.centerDot.leftIndex) * widthOx + 30) {
                            endDotLeft = (self.centerDot.leftIndex) * widthOx + 30;
                        }
                        if (endDotLeft <= (self.startDot.leftIndex) * widthOx + 30) {
                            endDotLeft = (self.startDot.leftIndex) * widthOx + 30;
                        }
                        moveOx = endDotLeft - scrollLeft - oringeLeft;
                        if (moveOx < 0) {
                            arrIndex = parseInt(Math.abs(moveOx) / widthOx);
                            $('.splitDotDiv .prev-dot').css('left', endDotLeft);
                            $('.splitDotDiv .dotTime').css('left', endDotLeft + 76);
                            $('.splitDotDiv .dotTimeDes').css('left', endDotLeft);
                            $('.splitDotDiv .splitLine').css('left', endDotLeft + 10);
                            splitDotLeftIndex = self.splitDot.leftIndex - arrIndex;
                            self.splitDot.date = self.timeArr[self.splitDot.leftIndex - arrIndex];
                        } else {
                            arrIndex = parseInt(moveOx / widthOx);
                            $('.splitDotDiv .prev-dot').css('left', endDotLeft);
                            $('.splitDotDiv .dotTime').css('left', endDotLeft + 76);
                            $('.splitDotDiv .dotTimeDes').css('left', endDotLeft);
                            $('.splitDotDiv .splitLine').css('left', endDotLeft + 10);
                            splitDotLeftIndex = arrIndex + self.splitDot.leftIndex;
                            self.splitDot.date = self.timeArr[arrIndex + self.splitDot.leftIndex];
                        }
                    }
                });
            },
            checkSpanClick: function (e) {
                var target = e.target;
                $(target).addClass('active').siblings().removeClass('active')
            },
            SaveSetting: function () {
                var self = this;
                var IsJoinHistoryRepayment;
                var RepaymentSource;
                var CashFlowSource;
                var DivideDate;
                if (this.yesShow) {
                    IsJoinHistoryRepayment = 1
                    RepaymentSource = '';
                    CashFlowSource = self.dataSouceYes;
                    var DivideDate = self.splitDot.date;
                } else {
                    IsJoinHistoryRepayment = 0
                    RepaymentSource = '';
                    CashFlowSource = self.dataSouceNo;
                    DivideDate = '';
                }
                //TaskCode: CashFlowJoin
                //PoolDBName string 
                //IsJoinHistoryRepayment string 是否拼接历史回款
                //RepaymentSource string 回款数据源
                //CashFlowSource string 现金流数据源
                //DivideDate string  分割日

                sVariableBuilder.AddVariableItem('PoolDBName', PoolDBName, 'String', 0, 0, 0);
                sVariableBuilder.AddVariableItem('IsJoinHistoryRepayment', IsJoinHistoryRepayment, 'Int', 0, 0, 0);
                sVariableBuilder.AddVariableItem('RepaymentSource', RepaymentSource, 'String', 0, 0, 0);
                sVariableBuilder.AddVariableItem('CashFlowSource', CashFlowSource, 'String', 0, 0, 0);
                sVariableBuilder.AddVariableItem('DivideDate', DivideDate, 'String', 0, 0, 0);
                sVariableBuilder.AddVariableItem('PoolId', PoolId, 'String', 0, 0, 0);
                sVariableBuilder.AddVariableItem('PoolDBConnectionStr', "Data Source=MSSQL;Initial Catalog=" + PoolDBName + ";Integrated Security=SSPI;", 'String', 1);
                var sVariable = sVariableBuilder.BuildVariables();
                var tIndicator = new taskIndicator({
                    width: 900,
                    height: 550,
                    clientName: 'TaskProcess',
                    appDomain: 'Task',
                    taskCode: 'CashFlowJoin',
                    sContext: sVariable,
                    callback: function () {
                        console.log(111111111111)
                    }
                });
                tIndicator.show();
            }
        }
    });

    $(function () {
        $('#txtRDate').attr('placeholder', '输入日期不得大于切片日或者小于封包日');
        $('#txtRDate').focus(function () {
            $('.tipsWord').text('');
        })
        $('#txtRDate').change(function () {
            var ImportDate = $('#txtRDate').val();
            var formatData = common.formatData(ImportDate);
            if (formatData.code == 1) {
                var ValidImportDate = formatData.info.replace(/-/g, '');
                var endDate = vm.DimReportingDate.replace(/-/g, '');
                var startDate = vm.StartDate.replace(/-/g, '');
                if (parseInt(ValidImportDate) > parseInt(endDate)) {
                    $('.tipsWord').text('输入日期大于资产池切面日，请重新输入');
                    $('#txtRDate').val('')
                } else if (parseInt(ValidImportDate) < parseInt(startDate)) {
                    $('.tipsWord').text('输入日期小于封包日，请重新输入');
                    $('#txtRDate').val('')
                } else {
                    $.each(vm.timeArr, function (i, v) {
                        if (v == formatData.info) {
                            InputIndex = i;
                        }
                    });
                    vm.splitDot.leftIndex = InputIndex;
                    vm.splitDot.date = formatData.info;
                }
            } else {
                $('.tipsWord').text('输入日期格式不合法，请重新输入');
                $('#txtRDate').val('')
            }
        })
        vm.moveDot()
    })
})