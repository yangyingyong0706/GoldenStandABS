
requirejs(['../../../asset/lib/config'], function (config) {
    require(['jquery', 'gs/webStorage', 'Vue2', 'common', 'webProxyTask', 'callApi', 'globalVariable', 'jquery-ui', 'vuedraggable', 'gsAdminPages', 'permissionProxy', 'toast', 'app/projectStage/js/project_interface', 'anyDialog', 'vMessage']
        , function ($, webStorage, Vue, common, webProxy, CallApi, GlobalVariable, jqueryUi, draggable, GSdialog, permissionProxy, toast) {

            var trustId = common.getQueryString('trustId');
            var tCode = common.getQueryString('TrustCode');
            var reportEntry = common.getQueryString('reportEntry');
            var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
            var TABLE_HEAD = ['报告类型', '报告时间(兑付时间)', '报告任务单', '任务进度', '报告状态', '报告操作'];
            var tabShow = true;

            var prg = 0;
            var timer = 0;
            var reportCodeMap = {
                1: '006',
                2: '005',
                3: '007',
                4: '008',
                5: '006'
            };
            var workflowType = {
                '004': {
                    workflowDisplayName: '兑付兑息流程',//多文件模式
                    taskCode: 'ApprovalModelFileGeneration',//'ApprovalModelFileGeneration',
                    sourceTaskAppDomain: 'Task'
                },
                '005': {
                    workflowDisplayName: '兑付兑息流程',//单文件模式
                    taskCode: 'TrustReportModelFileGeneration',//'ApprovalModelFileGeneration',
                    sourceTaskAppDomain: 'Task'
                },
                '006': {
                    workflowDisplayName: '信托报告流程',
                    taskCode: 'TrustReportModelFileGeneration',//'TrustReportApprovalModelFileGeneration',
                    sourceTaskAppDomain: 'Task'
                },
                '007': {
                    workflowDisplayName: '分配指令流程',
                    taskCode: 'TrustReportModelFileGeneration',//'AssignmentCommandModelFileGeneration',
                    sourceTaskAppDomain: 'Task'
                },
                '008': {
                    workflowDisplayName: '收益分配公告流程',
                    taskCode: 'TrustReportModelFileGeneration',//'IncomeDistributionAnnouncementModelFileGeneration',TrustReportModelFileGeneration
                    sourceTaskAppDomain: 'Task'
                }
            };
            var variableMtemplate = "<SessionVariable><Name>{0}</Name><Value>{1}</Value><DataType>String</DataType><IsConstant>0</IsConstant><IsKey>0</IsKey><KeyIndex>0</KeyIndex></SessionVariable>";

            if (reportEntry === 'guide') {
                tabShow = true;
            } else if (reportEntry === 'report') {
                tabShow = false;
            }
            var vm = new Vue({
                el: '#PageMainContainer',
                data: {
                    TrustID: trustId,
                    Periods: [
                        {
                            selectReportType: '',
                            reportData: {},
                            StartDate: '',
                            EndDate: ''
                        }
                    ],
                    DaysArr: [],
                    reportTypeList: [],
                    nowIndex: 0,
                    pageOne: '',
                    pageTwo: "",
                    pageThree: "",
                    reportDataTemp: [],
                    loading: true,
                    tabShow: tabShow,
                    isMultiple:false,
                    PeriodDetail: {
                        Index: null,
                        Start: null,
                        End: null,
                        Days: 0,
                        Dates: [],
                        Fees: [],
                        FeesParamList: [],//费用元素参数
                        Events: [],
                        Scenarios: [],//偿付情景
                    },
                    table_head: TABLE_HEAD,
                    permissionStatus: {},
                    permissionRoute: [],
                    statusMap: {
                        "0": '待审核',
                        "-1": '待生成',
                        "1": '已通过',
                        "2": '已拒绝'
                    },
                    isGuide1Show:true,
                    
                },
                created: function () {
                    var _this = this;
                    parent.viewModel.tabs().forEach(function (v, i) {
                        var reg = new RegExp("AssetServicesReport");
                        //console.log(reg.test(v.id));
                        if (reg.test(v.id))
                        {
                            _this.isGuide1Show = false;
                            console.log(_this.isGuide1Show);
                        }
                    })
                },
                computed: {
                    
                },
                watch: {
                    Periods: function (val, oldVal) {
                        Vue.nextTick(function () {
                            var nowPeriod = webStorage.getItem('nowPeriod') | this.nowIndex;
                            $("#DC_TimeLine li").eq(nowPeriod).trigger("click");
                        })
                    },
                    nowIndex: function (val, oldVal) {
                        var self = this;
                        var width = $(window).width()
                        var num = Math.floor(width / 190) - 2;
                        var left = $("#DC_TimeLine li").eq(val).offset().left;
                        var right = width - left;
                        if (val > oldVal) {
                            if (right < 200) {
                                $("#DC_TimeLine").scrollLeft((val - num) * 190);
                            }
                        } else if (val < oldVal) {
                            if (left < 300) {
                                $("#DC_TimeLine").scrollLeft((val - 1) * 190);
                            }
                        }


                        self.pageOne = GlobalVariable.TrustManagementServiceHostURL + 'productManage/TrustManagement/ReportWizardEx/ReportWizardExone.html?TrustId=' + trustId + "&&TrustCode=" + tCode + "&&ReportDate=" + self.Periods[val].EndDate,
                            self.pageTwo = GlobalVariable.TrustManagementServiceHostURL + 'productManage/TrustManagement/ReportWizardEx/ReportWizardExtwo.html?TrustId=' + trustId + "&&TrustCode=" + tCode + "&&ReportDate=" + self.Periods[val].EndDate,
                            self.pageThree = GlobalVariable.TrustManagementServiceHostURL + 'productManage/TrustManagement/ReportWizardEx/ReportWizardExthree.html?TrustId=' + trustId + "&&TrustCode=" + tCode + "&&ReportDate=" + self.Periods[val].EndDate
                    }
                },
                methods: {
                    checkOperatePermission: function () {
                        var self = this;
                        var workflowId = 1, moduleId = 1, elem = 'btn_generate,btn_pass,btn_reject';
                        permissionProxy.checkOperatePermission(workflowId, moduleId, elem, function (route, status) {
                            self.permissionRoute = route;
                            self.permissionStatus = status;
                        });
                    },
                    //打开一个iframe
                    openNewIframe: function (page, trustId, tabName, cb) {
                        var pass = true;
                        parent.viewModel.tabs().forEach(function (v, i) {
                            if (v.id == trustId) {
                                GSdialog.HintWindow('您已经打开了一个向导，您可以关闭当前向导打开新向导');
                                pass = false;
                                return false;
                            }
                        })
                        if (pass) {
                            //parent.viewModel.showId(trustId);
                            var newTab = {
                                id: trustId,
                                url: page,
                                name: tabName,
                                disabledClose: false
                            };
                            parent.viewModel.tabs.push(newTab);
                            parent.viewModel.changeShowId(newTab);
                            $('.chrome-tabs-shell', parent.document).find('.chrome-tab-current').removeClass('chrome-tab-current');
                            $('.chrome-tabs-shell', parent.document).find('.active').addClass('chrome-tab-current');
                        };
                    },
                    //tab选项卡切换
                    tabChange: function () {
                        var nowIndex = $('.guide-item ul li.chrome-tab-current').index();
                        $('.guide-main>div').eq(nowIndex).show().siblings().hide();
                        $('.guide-item ul li').click(function () {
                            var index = $(this).index();
                            $(this).addClass('chrome-tab-current').siblings().removeClass('chrome-tab-current');
                            $('.guide-main>div').eq(index).show().siblings().hide();
                        })
                    },
                    //加载日期时间段
                    LoadAllPeriods: function (fnCallback) {
                        var self = this;
                        var callApi = new CallApi('TrustManagement', 'usp_StructureDesign_GetPeriods', true);
                        callApi.AddParam({ Name: 'TrustID', Value: self.TrustID, DBType: 'int' });
                        callApi.ExecuteDataTable(function (response) {
                            self.Periods = response;
                            $.each(self.Periods, function (i, v) {
                                v.selectReportType = '';
                                v.reportData = [];
                            })

                            for (i = 0, length = self.Periods.length; i < length; i++) {
                                self.DaysArr[i] = self.computeDays(self.Periods[i].EndDate, self.Periods[i].StartDate)
                            }
                            if (fnCallback && typeof fnCallback === 'function') {
                                fnCallback();
                            }
                        });
                    },
                    //计算相差的天数
                    computeDays: function (start, end) {
                        var offsetTime = Math.abs((new Date(end) - new Date(start)) + 1);
                        return Math.floor(offsetTime / (3600 * 24 * 1e3));
                    },

                    ShowPeriodDetail: function (event, index, period) {

                        var $li = $(event.currentTarget);
                        $li.addClass('selected').siblings().removeClass('selected');
                        this.PeriodDetail.Index = index;
                        this.PeriodDetail.Start = period.StartDate;
                        this.PeriodDetail.End = period.EndDate;
                        this.PeriodDetail.Days = this.DaysArr[index];
                        var self = this;
                        var callApi = new CallApi('TrustManagement', 'dbo.usp_StructureDesign_GetPeriodDetail', true);
                        callApi.AddParam({ Name: 'TrustID', Value: self.TrustID, DBType: 'int' });
                        callApi.AddParam({ Name: 'StartDate', Value: period.StartDate, DBType: 'date' });
                        callApi.AddParam({ Name: 'EndDate', Value: period.EndDate, DBType: 'date' });

                        callApi.ExecuteDataSet(function (response) {
                            if (!response || response.length < 1) { return; }
                            self.PeriodDetail.Dates = response[0];
                        });

                        var executeParam = {
                            'SPName': "usp_GetTrustFee", 'SQLParams': [
                                { 'Name': 'TrustId', 'Value': self.TrustID, 'DBType': 'int' }
                                , { 'Name': 'TransactionDate', 'Value': this.PeriodDetail.End, 'DBType': 'string' }
                            ]
                        };
                        var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";//appDomain=TrustManagement&executeParams=" + context;

                        common.ExecuteGetData(true, serviceUrl, 'TrustManagement', executeParam, function (data) {
                            self.PeriodDetail.FeesParamList = data
                        });
                    },
                    //获取报告的类型
                    getReportTypeList: function (periodEndDate, index) {
                        var self = this;
                        self.nowIndex = index;
                        webStorage.setItem('nowPeriod', self.nowIndex);
                        if (periodEndDate != null) {
                            var prieodDataId = Number(periodEndDate.replace(/-/g, ''))
                        }
                        var executeParaminfo = {
                            SPName: 'usp_GetReportType', SQLParams: [
                                { Name: 'TrustId', value: trustId, DBType: 'int' },
                                { Name: 'DimReportingDateId', value: prieodDataId, DBType: 'int' },
                                { Name: 'DimReportingDate', value: periodEndDate, DBType: 'string' }
                            ]
                        };
                        common.ExecuteGetData(true, svcUrl, 'TrustManagement', executeParaminfo, function (data) {
                            //data.splice(3);//不显示收益分配公告
                            self.reportTypeList = data;
                        })

                        var executeParaminfo2 = {
                            SPName: 'usp_GetReportResultList', SQLParams: [
                                { Name: 'TrustId', value: trustId, DBType: 'int' },
                                { Name: 'DimReportingDateId', value: prieodDataId, DBType: 'int' },
                                { Name: 'DimReportingDate', value: periodEndDate, DBType: 'string' }
                            ]
                        };
                        common.ExecuteGetData(true, svcUrl, 'TrustManagement', executeParaminfo2, function (data2) {

                            var type1Temp = [], type2Temp = [], type3Temp = [], type4Temp = [], type5Temp = [];//不显示收益分配公告
                            $.each(data2, function (i, v) {
                                var NodeName = permissionProxy.getNodeName(v.checkState);
                                if (v.ReportTypeId == 1) {
                                    type1Temp.selectedReportId = 1;
                                    type1Temp.reportStatus = v.checkState;
                                    type1Temp.reportCurrentStatusName = NodeName;
                                    type1Temp.prieodData = periodEndDate;
                                    type1Temp.selectedReportName = v.ReportTypeName;
                                    type1Temp.push(v)
                                } else if (v.ReportTypeId == 2) {
                                    type2Temp.selectedReportId = 2;
                                    type2Temp.reportStatus = v.checkState;
                                    type2Temp.reportCurrentStatusName = NodeName;
                                    type2Temp.prieodData = periodEndDate;
                                    type2Temp.selectedReportName = v.ReportTypeName;
                                    type2Temp.push(v)
                                }
                                else if (v.ReportTypeId == 3) {
                                    type3Temp.selectedReportId = 3
                                    type3Temp.reportStatus = v.checkState;
                                    type3Temp.reportCurrentStatusName = NodeName;
                                    type3Temp.prieodData = periodEndDate;
                                    type3Temp.selectedReportName = v.ReportTypeName;
                                    type3Temp.push(v)
                                }
                                else if (v.ReportTypeId == 4) {//公告/暂时屏蔽_20180823_zzy
                                    type4Temp.selectedReportId = 4
                                    type4Temp.reportStatus = v.checkState;
                                    type4Temp.reportCurrentStatusName = NodeName;
                                    type4Temp.prieodData = periodEndDate;
                                    type4Temp.selectedReportName = v.ReportTypeName;
                                    type4Temp.push(v)
                                }
                                else if (v.ReportTypeId == 5) {
                                    type5Temp.selectedReportId = 5;
                                    type5Temp.reportStatus = v.checkState;
                                    type5Temp.reportCurrentStatusName = NodeName;
                                    type5Temp.prieodData = periodEndDate;
                                    type5Temp.selectedReportName = v.ReportTypeName;
                                    type5Temp.push(v)
                                }
                            })
                            self.$forceUpdate();
                            self.Periods[index].reportData = []
                            if (type1Temp.length > 0) self.Periods[index].reportData.push(type1Temp);
                            if (type2Temp.length > 0) self.Periods[index].reportData.push(type2Temp);
                            if (type3Temp.length > 0) self.Periods[index].reportData.push(type3Temp);
                            if (type4Temp.length > 0) self.Periods[index].reportData.push(type4Temp);
                            if (type5Temp.length > 0) self.Periods[index].reportData.push(type5Temp);

                            self.loading = false
                        })

                        var executeParaminfo3 = {
                            SPName: 'usp_GetTrustInfoExchangeCenter', SQLParams: [
                                { Name: 'TrustId', value: trustId, DBType: 'int' }
                            ]
                        };
                        common.ExecuteGetData(true, svcUrl, 'TrustManagement', executeParaminfo3, function (data) {
                            if (data)
                            {
                                var seq = data[0].SequenceNo;
                                if (seq == 1 || seq == 2)
                                    self.isMultiple = true;
                                else
                                    self.isMultiple = false;
                            }
                        })

                    },
                    getReportStatus: function (trustId, dimReportingDateId, reportTypeId) {
                        var self = this;
                        var status = null;
                        //获取报告的状态
                        var executeParaminfo = {
                            SPName: 'usp_GetReportStatus', SQLParams: [
                                { Name: 'TrustId', value: trustId, DBType: 'int' },
                                { Name: 'DimReportingDateId', value: dimReportingDateId, DBType: 'int' },
                                { Name: 'ReportTypeId', value: reportTypeId, DBType: 'int' }
                            ]
                        };
                        common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParaminfo, function (data) {
                            if (data[0] && data[0].CurrentStatus) {
                                status = data[0].CurrentStatus
                            } else {
                                //self.$message.error('获取报告状态错误！')
                            }

                        })
                        return status

                    },
                    calcHeight: function () {
                        var wHeight = $(window).height();
                        var height = wHeight - 180;
                        $('.catalog-content').css('height', height)
                    },
                    //添加报告
                    addReport: function (index, type) {
                        var self = this;
                        var flag = true;
                        if (type === "") {
                            this.$message.warning('请选择需要更的报告选项')
                            return
                        } else {

                            $.each(self.Periods[index].reportData, function (i, v) {
                                if (v.selectedReportId == type) {
                                    flag = false;
                                }
                            })
                            if (!flag) {
                                this.$message.warning('该类型的报告已经被选择');
                                return
                            }
                        }
                        if (self.Periods[index].EndDate != null) {
                            var prieodDataId = Number(self.Periods[index].EndDate.replace(/-/g, ''))
                        }

                        var executeParaminfo = {
                            SPName: 'usp_GetReportAndDataSourceState', SQLParams: [
                                { Name: 'DimReportingDateId', value: prieodDataId, DBType: 'int' },
                                { Name: 'DimReportingDate', value: self.Periods[index].EndDate, DBType: 'string' },
                                { Name: 'TrustId', value: trustId, DBType: 'int' },
                                { Name: 'ReportTypeId', value: Number(type), DBType: 'string' }
                            ]
                        };
                        common.ExecuteGetData(true, svcUrl, 'TrustManagement', executeParaminfo, function (data) {
                            var status = self.getReportStatus(trustId, prieodDataId, Number(type))
                            $.each(self.reportTypeList, function (i, v) {
                                if (v.reportTypeId == type) {
                                    data.selectedReportName = v.reporterName;
                                    data.selectedReportId = v.reportTypeId;
                                    data.prieodData = self.Periods[index].EndDate;
                                    data.reportStatus = status;
                                    data.reportCurrentStatusName = permissionProxy.getNodeName(status);
                                }
                            })
                            self.$forceUpdate();
                            self.Periods[index].reportData.push(data)

                        })
                    },
                    getTaskDoneNum: function (sateList) {
                        var num = 0;
                        var self = this;
                        $.each(sateList, function (i, v) {
                            if (v.state == '1') { num++ }
                        })
                        return num
                    },
                    //获取单项报告数据
                    pullReportData: function (stateItem, selectReportId, prieodData) {
                        var self = this;

                        var spName = "usp_DataSource{0}ToReportData".format(stateItem.DataSourceCode)
                        var prieodDataId = Number(prieodData.replace(/-/g, ''))

                        var executeParaminfo = {
                            SPName: spName, SQLParams: [
                                { Name: 'DimReportingDateId', value: prieodDataId, DBType: 'int' },
                                { Name: 'DimReportingDate', value: prieodData, DBType: 'string' },
                                { Name: 'trustId', value: trustId, DBType: 'int' },
                                { Name: 'ReportTypeId', value: selectReportId, DBType: 'int' },
                                { Name: 'DataSourceId', value: stateItem.DataSourceId, DBType: 'int' }
                            ]
                        };
                        common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParaminfo, function (data) {
                            if (data.length > 0) {
                                var strMsg = "";
                                if (data.length > 1)
                                    $.each(data, function (i, v) {
                                        if (v.Result == 0)
                                            strMsg += v.ItemValue + '：数据还未准备好；<br/>';
                                    })
                                else {
                                    if (data[0].Result == 0)
                                        strMsg += data[0].ItemValue + "：数据还未准备好！";
                                }
                                if (strMsg != '') {
                                    self.$message.error(strMsg);
                                    stateItem.state = '2'
                                } else {
                                    self.$message.success('数据获取成功！');
                                    stateItem.state = '1'
                                }
                            } else {
                                self.$message.error('数据还未准备好或数据获取失败！');
                            }

                        })
                    },
                    //获取全部数据
                    pullAllData: function () {
                        var self = this;
                        $.each(self.reportDataTemp, function (i, v) {
                            self.pullReportData(v, self.reportDataTemp.selectedReportId, self.reportDataTemp.prieodData)
                        })
                    },

                    //数据详情
                    taskDetail: function (stateList) {
                        var self = this;
                        self.reportDataTemp = stateList;
                        self.$forceUpdate();

                        $.anyDialog({
                            title: "任务完成详情",
                            width: 450,
                            height: 500,
                            changeallow: true,
                            html: $("#task-dialog")
                        })
                    },
                    //审核
                    checkReport: function (stateList) {
                        var self = this;
                        if (stateList.reportStatus != "3") {
                            return false
                        }
                        self.reportDataTemp = stateList;
                        self.$forceUpdate();
                        anyDialog({
                            title: "审核报告",
                            width: 450,
                            height: 'auto',
                            changeallow: true,
                            html: $("#status-dialog")
                        })
                    },
                    changeReportStatus: function (currentStatus, routetypeId, operate, prieodDataId, selectReportId, reason, callback) {
                        if (currentStatus == 1 && operate != 'generate') {
                            GSdialog.HintWindow('文档还未生成');
                            return;
                        }
                        var executeParaminfo = {
                            SPName: "usp_Workflow_ChangeReportStatus", SQLParams: [
                                { Name: 'TrustId', value: trustId, DBType: 'int' },
                                { Name: 'Operate', value: operate, DBType: 'string' },
                                { Name: 'CurrentNode', value: currentStatus, DBType: 'int' },
                                { Name: 'RouteTypeId', value: routetypeId, DBType: 'int' },
                                { Name: 'Reason', value: reason, DBType: 'string' },
                                { Name: 'DimReportingDateId', value: prieodDataId, DBType: 'int' },
                                { Name: 'ReportTypeId', value: selectReportId, DBType: 'int' }
                            ]
                        };

                        common.ExecuteGetData(true, svcUrl, 'TrustManagement', executeParaminfo, function (data) {
                            callback && callback(data)
                        })

                    },
                    //同意审核
                    addCheckReport: function (operate) {
                        var self = this;
                        var currentStatus = self.reportDataTemp.reportStatus;
                        if (currentStatus == 5 || currentStatus == 6) {
                            self.$message.warning('文档须重新生成后才能改变审核状态！');
                            return
                        }
                        var prieodDataId = self.reportDataTemp.prieodData.replace(/-/g, '');
                        var selectReportId = self.reportDataTemp.selectedReportId;
                        var reason = $("#reason_input").val();
                        self.changeReportStatus(currentStatus, 1, operate, prieodDataId, selectReportId, reason, function (data) {
                            if (data[0].result) {
                                $('#modal-close').trigger('click');
                                self.$message.info('审核完成！');
                                self.$forceUpdate()
                                self.reportDataTemp.reportStatus = data[0].result;
                                self.reportDataTemp.reportCurrentStatusName = permissionProxy.getNodeName(data[0].result);
                            }
                        })
                    },
                    random: function (n) {
                        if (typeof n === 'object') {
                            var times = n[1] - n[0]
                            var offset = n[0]
                            return Math.random() * times + offset
                        } else {
                            return n
                        }
                    },
                    progress: function (dist, speed, delay, callback) {
                        var self = this;
                        var _dist = this.random(dist)
                        var _delay = this.random(delay)
                        var _speed = this.random(speed)
                        window.clearTimeout(timer)
                        timer = window.setTimeout(function () {
                            if (prg + _speed >= _dist) {
                                window.clearTimeout(timer)
                                prg = _dist
                                callback && callback()
                            } else {
                                prg += _speed
                                self.progress(_dist, speed, delay, callback)
                            }

                            $('.progress').html(parseInt(prg) + '%')
                            $('#loading .bar').width(parseInt(prg) + '%')
                        }, _delay)
                    },
                    saveDownLoadLink: function (link, prieodDataId, trustId, selectReportId, callback) {
                        var executeParaminfo = {
                            SPName: "usp_SaveReportDownloadLink", SQLParams: [
                                { Name: 'DownloadLink', value: link, DBType: 'string' },
                                { Name: 'DimReportingDateId', value: prieodDataId, DBType: 'int' },
                                { Name: 'TrustId', value: trustId, DBType: 'int' },
                                { Name: 'ReportTypeId', value: selectReportId, DBType: 'int' },
                            ]
                        };

                        common.ExecuteGetData(true, svcUrl, 'TrustManagement', executeParaminfo, function (data) {
                            callback && callback(data)
                        })
                    },
                    getOpenerSessionVariables: function () {
                        var self = this;
                        var sReturn = '';
                        try {

                            var thisopener = self.getOpenerInWorkflowApproval();

                            var svs = thisopener.WorkFlowSessionVariables;
                            svs = typeof svs == 'function' ? svs(self.objId, self.objType) : svs;
                            for (var sv in svs || []) {
                                sReturn += this.variableMtemplate.format(sv, svs[sv]);
                            }
                        } catch (e) {

                        }
                        return sReturn;
                    },
                    getOpenerInWorkflowApproval: function () {
                        var thisopener = null;
                        try {
                            if (window.opener.location.pathname.toLocaleLowerCase() == '/workflowengine/pages/workflowrun.html')
                                thisopener = window.opener.parent;
                            else if (window.opener.location.pathname.toLocaleLowerCase() == '/workflowengine/pages/workflowrecord.html')
                                thisopener = window.opener.opener.parent;
                        }
                        catch (e) {

                        }
                        return thisopener;
                    },
                    getSourceTaskSessionVarible: function (objId, objType, prieodDataString, reportTypeId) {
                        var self = this;
                        var sReturn = "";
                        sReturn += variableMtemplate.format('TrustId', objId.split('_')[0]);
                        sReturn += variableMtemplate.format('DimReportingDate', prieodDataString);
                        sReturn += variableMtemplate.format('ReportTypeId', reportTypeId);
                        sReturn += variableMtemplate.format('DimReportingDateId', objId.split('_')[1]);
                        sReturn += variableMtemplate.format('MonitorSessionName', objId + "_WFTPM" + objType);
                        sReturn += variableMtemplate.format('ControlSessionName', objId + "_WFTPC" + objType);
                        //todo
                        sReturn += self.getOpenerSessionVariables();
                        //end
                        //sReturn += variableMtemplate.format('Transition', reason);
                        //Return += variableMtemplate.format('CurrentSessionProcessStatusId', currentSessionProcessStatusId);
                        sReturn = '<SessionVariables>{0}</SessionVariables>'.format(sReturn);
                        return sReturn;
                    },
                    //删除报告导入的数据源(如有)
                    deleteImportData: function (periodEndDate, stateList) {
                        var self = this;
                        var executeParaminfo = {
                            SPName: 'usp_PushDeleteImportData', SQLParams: [
                                { Name: 'TrustId', value: trustId, DBType: 'int' },
                                { Name: 'ReportDate', value: periodEndDate, DBType: 'string' }
                            ]
                        };
                        common.ExecuteGetData(true, svcUrl, 'TrustManagement', executeParaminfo, function (data) {

                            self.pushImportData(periodEndDate, stateList);//删除之后需要重新获取数据源
                        })
                    },
                    //删除导入之后重新推送数据
                    pushImportData: function (periodEndDate, stateList) {
                        var self = this;
                        if (periodEndDate != null) {
                            var prieodDataId = Number(periodEndDate.replace(/-/g, ''))
                        }
                        var executeParaminfo = {
                            SPName: 'usp_DataSourceDS_AssetReportPushToReportData', SQLParams: [
                                { Name: 'TrustId', value: trustId, DBType: 'int' },
                                { Name: 'DimReportingDate', value: periodEndDate, DBType: 'string' },
                                { Name: 'DimReportingDateId', value: prieodDataId, DBType: 'int' },
                                { Name: 'ReportTypeId', value: 1, DBType: 'int' },
                                { Name: 'DataSourceId', value: 1, DBType: 'int' }
                            ]
                        };
                        common.ExecuteGetData(true, svcUrl, 'TrustManagement', executeParaminfo, function (data) {

                            self.generationReport(periodEndDate, stateList);
                        })
                    },

                    confirmGenReport: function (periodEndDate, stateList, index) {
                        var self = this;
                        if (stateList.reportStatus == '3') {
                            return false;
                        }
                        var executeParaminfo = {
                            SPName: "usp_PushIsImportData", SQLParams: [
                                { Name: 'TrustId', value: trustId, DBType: 'int' },
                                { Name: 'ReportDate', value: periodEndDate, DBType: 'string' },
                            ]
                        };
                        common.ExecuteGetData(true, svcUrl, 'TrustManagement', executeParaminfo, function (data) {
                            if (data[0].result > 0) {
                                GSdialog.HintWindowTFS("检测到手动导入的资产服务报告文件数据，是否使用该数据导出报告!", function () {
                                    self.genconfirm(periodEndDate, stateList)
                                }, function () {
                                    self.genreject(periodEndDate, stateList)
                                })
                            } else {
                                self.genconfirm(periodEndDate, stateList)
                            }
                        })
                    },

                    genconfirm: function (periodEndDate, stateList) {
                        var self = this;
                        self.generationReport(periodEndDate, stateList);
                    },

                    genreject: function (periodEndDate, stateList) {
                        var self = this;
                        self.deleteImportData(periodEndDate, stateList);
                    },
                    //判断文件是否存在
                    fileExists:function (path){
                        var isExists;
                        $.ajax({
                            url:path,
                            async:false,
                            type:'HEAD',
                            error:function(){
                                isExists=0;
                            },
                            success:function(){
                                isExists=1;
                            }
                        });
                        if(isExists==1){
                            return true;
                        }else{
                            return false;
                        }
                    },
                    //生成报告
                    generationReport: function (periodEndDate, stateList) {
                        if (stateList.reportStatus == '3') {
                            return false;
                        }
                        console.log(stateList.reportStatus);
                        var self = this; 
                        $("#loading").show();
                        self.progress([85, 98], [0.8, 2], 100)
                        var objType = reportCodeMap[stateList.selectedReportId];
                        
                        var prieodData = periodEndDate.replace(/-/g, '');
                        var prieodDataString = periodEndDate;
                        var reportTypeId = stateList.selectedReportId
                        var objId = trustId + "_" + prieodData;
                        var reporterName = stateList.selectedReportName
                        var successOrFalse = true;
                        objType = reporterName === '兑付兑息' ? self.isMultiple ? '004' : objType : objType;

                        if (stateList.selectedReportName === "受托报告") {
                            reporterName = "资产管理"
                        } else if (stateList.selectedReportName === "划款指令") {
                            reporterName = "分配指令"
                        }
                        var downLoadLink = "/TrustManagementService/TrustFiles/" + trustId + "/TaskReportFiles//CMS_" + reporterName + '_' + objId + (reporterName === '兑付兑息' ? self.isMultiple ? '.zip' : '.docx' : '.docx');
                        var sContext = {
                            appDomain: workflowType[objType].sourceTaskAppDomain,
                            sessionVariables: self.getSourceTaskSessionVarible(objId, objType, prieodDataString, reportTypeId),
                            taskCode: workflowType[objType].taskCode
                        };
                        webProxy.createSessionByTaskCode(sContext, function (taskSession) {
                            webProxy.runTaskReportGuide(workflowType[objType].sourceTaskAppDomain, taskSession,
                                //报告生成成功
                                function () {
                                    self.progress(100, [1, 5], 10, function () {
                                        setTimeout(function () {
                                            $("#loading").hide();
                                            prg = 0
                                            $('.progress').html('')
                                            $('#loading .bar').width(0)
                                            $.toast({ type: 'success', message: '报告已生成！请下载！' });
                                            //GSdialog.HintWindow('报告已生成！请下载！');
                                        }, 800)
                                    })

                                    self.$forceUpdate();
                                    stateList[0].downLoadUrl = downLoadLink;
                                    stateList.isGenerated = '1';
                                    self.saveDownLoadLink(downLoadLink, prieodData, trustId, reportTypeId)

                                    self.changeReportStatus(stateList.reportStatus, 1, 'generate', prieodData, reportTypeId, '', function (data) {
                                        self.$forceUpdate();
                                        stateList.reportStatus = data[0].result;
                                        stateList.reportCurrentStatusName = permissionProxy.getNodeName(data[0].result);
                                    })
                                },

                            //报告生成失败
                            function () {
                                self.progress(99, [1, 5], 10, function () {
                                    setTimeout(function () {
                                        $("#loading").hide();
                                        prg = 0
                                        $('.progress').html('')
                                        $('#loading .bar').width(0)
                                        GSdialog.HintWindow('报告生成失败！请重新尝试！');
                                    }, 800)
                                })
                                
                                stateList.reportStatus = 1;
                                return false;
                            });
                        })
                    },
                    //下载报告
                    downLoadReport: function (stateList) {
                        var self = this, link = stateList[0].downLoadUrl;
                        //if (stateList.reportStatus == 1) {
                        //    return false;
                        //}
                        
                        var isFileExists = self.fileExists(link);
                        
                        if (link == '') {
                            GSdialog.HintWindow('报告还未生成!');
                            return;
                        }
                        else if (!isFileExists) {
                            GSdialog.HintWindow('报告生成失败，请重新尝试!');
                            return;
                        }
                        else {
                            //var prieodData = stateList.prieodData.replace(/-/g, '');
                            //var reportTypeId = stateList.selectedReportId;
                            //self.changeReportStatus(stateList.reportStatus, 1, 'reset', prieodData, reportTypeId, '', function (data) {
                            //    self.$forceUpdate();
                            //    stateList.reportStatus = data[0].result;
                            //    stateList.reportCurrentStatusName = permissionProxy.getNodeName(data[0].result);
                            //})
                            location.href = link;
                        }
                    }
                },
                mounted: function () {
                    var self = this;
                    var trustId = common.getQueryString('trustId');
                    if (!trustId || isNaN(trustId)) {
                        return;
                    }
                    this.TrustID = trustId;
                    this.LoadAllPeriods(function () {
                        if (self.Periods.length < 1) {
                            self.loading = false;
                            //GSdialog.HintWindow('产品未配置期数!');
                            return;
                        }
                        self.pageOne =GlobalVariable.TrustManagementServiceHostURL + 'productManage/TrustManagement/ReportWizardEx/ReportWizardExone.html?TrustId=' + trustId + "&&TrustCode=" + tCode + "&&ReportDate=" + self.Periods[self.nowIndex].EndDate,
                        self.pageTwo = GlobalVariable.TrustManagementServiceHostURL + 'productManage/TrustManagement/ReportWizardEx/ReportWizardExtwo.html?TrustId=' + trustId + "&&TrustCode=" + tCode + "&&ReportDate=" + self.Periods[self.nowIndex].EndDate,
                        self.pageThree = GlobalVariable.TrustManagementServiceHostURL + 'productManage/TrustManagement/ReportWizardEx/ReportWizardExthree.html?TrustId=' + trustId + "&&TrustCode=" + tCode + "&&ReportDate=" + self.Periods[self.nowIndex].EndDate
                    });
                    this.tabChange();
                    this.calcHeight();
                    this.checkOperatePermission();
                },

            });
        });


});


