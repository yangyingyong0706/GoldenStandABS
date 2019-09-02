define(function (require) {
    var $ = require('jquery');
    var gv = require('globalVariable');
    var Vue = require('Vue2');
    var common = require('common');
    var GlobalVariable = require('globalVariable');
    require('kendo.all.min');
    require('kendomessagescn');
    var webStorage = require("gs/webStorage");
    var userName = webStorage.getItem('gs_UserName');
    var height = $(window).height() - 105;
    var g_DataSource;
    var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
    var permissionProxy = require('permissionProxy');
    var webProxy = require('webProxyTask');
    require('anyDialog');
    var GSdialog = require("gsAdminPages");
    require('vMessage');
    var timer = 0;
    var prg = 0;
    var variableMtemplate = "<SessionVariable><Name>{0}</Name><Value>{1}</Value><DataType>String</DataType><IsConstant>0</IsConstant><IsKey>0</IsKey><KeyIndex>0</KeyIndex></SessionVariable>";
    var lang = {}
    lang.ProductID = '标识';
    lang.ProductName = '产品名称';
    lang.ProductDescription = '产品描述';
    lang.ProductStatus = '产品状态';
    lang.Organisation = '资产来源';
    lang.AssetType = '资产类型';
    lang.generateReport = '生成报告'
    var vm;

    this.TranToPage = function (TrustId, TrustCode) {
        var html = '<a href="javascript:toThreeStepGenerateReport({0},\'{1}\');">{1}</a>'.format(TrustId, TrustCode);
        return html;
    }
    this.toThreeStepGenerateReport = function (TrustId, TrustCode) {
        var serviceUrl = gv.DataProcessServiceUrl + "CommonExecuteGet?";
        var executeParam = {
            'SPName': "usp_GetTrustPeriodStartDateAndEndDate",
            'SQLParams': [
                { 'Name': 'TrustId', 'Value': TrustId, 'DBType': 'string' }
            ]
        };
        common.ExecuteGetData(true, serviceUrl, 'TrustManagement', executeParam, function (data) {
            if (data.length > 0 && data[0].StartDate) {
                var selectDate = $("#startDateSelect").val();
                if (selectDate) {
                    var periodEndDate = $("#startDateSelect").val() + "-01-01";
                    var prieodDataId = "";
                    if (periodEndDate != null) {
                        prieodDataId = Number(periodEndDate.replace(/-/g, ''))
                    };
                    var url = GlobalVariable.TrustManagementServiceHostURL + "report/threeStepGenerateReport.html?PageName=" + vm.PageName + "&TrustId=" + TrustId + "&TrustCode=" + TrustCode + "&periodEndDate=" + periodEndDate + "&prieodDataId=" + prieodDataId;
                } else {
                    var url = GlobalVariable.TrustManagementServiceHostURL + "report/threeStepGenerateReport.html?PageName=" + vm.PageName + "&TrustId=" + TrustId + "&TrustCode=" + TrustCode;
                }
                var pass = true;
                parent.viewModel.tabs().forEach(function (v, i) {
                    if (TrustId == v.id) {
                        pass = false;
                        parent.viewModel.changeShowId(v);
                        return false;
                    }
                })
                if (pass) {
                    var newTab = {
                        name: lang.generateReport + "_" + TrustId,
                        id: TrustId,
                        url: url,
                        disabledClose: false
                    };
                    parent.viewModel.tabs.push(newTab)
                    parent.viewModel.changeShowId(newTab);
                }
            } else {
                GSdialog.HintWindow('当前产品没有日期！')
            }
        })
        
    }
    $(function () {
        function renderGrid(data) {
            g_DataSource = data;
            $("#reportGetTrustGrid").html("");
            var grid = $("#reportGetTrustGrid").kendoGrid({
                dataSource: g_DataSource,
                height: height,
                filterable: true,
                sortable: true,
                columnMenu: false,//可现实隐藏列
                reorderable: true,//可拖动改变列位置
                //groupable: true,//可拖动分组
                resizable: true,//可拖动改变列大小
                selectable: 'row',
                pageable: {
                    refresh: false,
                    pageSizes: true,
                    buttonCount: 5,
                    page: 1,
                    pageSize: 20,
                    pageSizes: [20, 50, 100, 500]
                },
                columns: [
                    {
                        field: "TrustId", title: lang.ProductID, width: "100px", attributes: { style: 'text-align:left' }, headerAttributes: { style: 'text-align:left' }
                    },
                    { field: "TrustCode", title: lang.ProductName, width: "180px", template: "#=this.TranToPage(TrustId,TrustCode)#", },
                    { field: "TrustName", title: lang.ProductDescription, width: "220px" },
                    { field: "SpecialPlanState", title: lang.ProductStatus, width: "120px", attributes: { style: 'text-align:left' }, headerAttributes: { style: 'text-align:left' } },
                    { field: "AssetTypeDesc", title: lang.AssetType, width: 150, attributes: { style: 'text-align:left' }, headerAttributes: { style: 'text-align:left' } }
                ],
                dataBound: function () {
                },
                change: function (e) {
                    var grid = $("#reportGetTrustGrid").data("kendoGrid");
                    var data = grid.dataItem(grid.select());
                    vm.TrustId = data.get("TrustId")
                    getDateList(vm.TrustId);
                }
            });
            $("#loading").css("display", "none");
        }
        function getTrustDetialDetection() {
            var serviceUrl = gv.DataProcessServiceUrl + "CommonExecuteGet?";
            var executeParam = {
                'SPName': "usp_GetTrustListDataForRiskManagement",
                'SQLParams': [
                    { 'Name': 'UserName', 'Value': userName, 'DBType': 'string' }
                ]
            };
            common.ExecuteGetData(true, serviceUrl, 'RiskManagement', executeParam, function (data) {
                renderGrid(data);
            });
        }

        function getDateList(trustId) {
            var serviceUrl = gv.DataProcessServiceUrl + "CommonExecuteGet?";
            var executeParam = {
                'SPName': "usp_GetTrustPeriodStartDateAndEndDate",
                'SQLParams': [
                    { 'Name': 'TrustId', 'Value': trustId, 'DBType': 'string' }
                ]
            };
            common.ExecuteGetData(true, serviceUrl, 'TrustManagement', executeParam, function (data) {
                $("#startDateSelect").empty();
                if (data.length > 0) {
                    var startDate = data[0].StartDate
                    var endDate = data[0].EndDate
                    var startYear = new Date(parseInt(startDate.slice(6))).getFullYear()
                    var endYear = new Date(parseInt(endDate.slice(6))).getFullYear()
                    for (var year = startYear; year <= endYear ;year ++ ){
                        $("#startDateSelect").append("<option value='" + year + "'>" + year + "</option>");
                    }
                }
            });
        }

        function trustAction(callback) {
            var grid = $("#reportGetTrustGrid").data("kendoGrid");
            if (grid.select().length != 1) {
                GSdialog.HintWindow('请选择数据！');
            } else {
                var dataRows = grid.items();
                // 获取行号
                var rowIndex = dataRows.index(grid.select());
                // 获取行对象
                var data = grid.dataItem(grid.select());
                callback(data);
            }
        }
        function openNewIframe(page, trustId, tabName) {
            var pass = true;
            parent.viewModel.tabs().forEach(function (v, i) {
                if (v.id == trustId) {
                    //if (cb != 1) {
                        pass = false;
                        parent.viewModel.changeShowId(v);
                        //return false;
                    //}

                }
            })
            if (pass) {
                var newTab = {
                    id: trustId,
                    url: page,
                    name: tabName,
                    disabledClose: false
                };
                parent.viewModel.tabs.push(newTab);
                parent.viewModel.changeShowId(newTab);
            };

            //if (tabName.indexOf("编辑年度报告") > -1) {
            //    var btn = $('.chrome-tabs-shell', parent.document).find(".chrome-tab-current").find(".chrome-tab-close");
            //    btn.click(function () {
            //        $('iframe[src*=TrustAnnualReport]', parent.document)[0].contentWindow.location.reload(true);
            //    })
            //}
        }

        kendo.culture("zh-CN");

        vm = new Vue({
            el: '#reportGetTrustDiv',
            data: {
                TrustId: 0,
                TrustCode:'',
                periodEndDate:'',
                prieodDataId:0,
                reportDataTemp: [],
                ReportTypeId: 6,
                PageName: encodeURI(encodeURI('年度年报'))
            },
            mounted: function () {
                getTrustDetialDetection()
            },
            methods: {
                init:function(fn){
                    var self = this;
                    trustAction(function (data) {
                        var periodEndDate = $("#startDateSelect").val()+"-01-01";
                        var prieodDataId = "";
                        if (periodEndDate != null) {
                            prieodDataId = Number(periodEndDate.replace(/-/g, ''))
                        }
                        if (prieodDataId != self.prieodDataId || data.TrustId != self.TrustId){
                            self.TrustId = data.TrustId;
                            self.TrustCode = data.TrustCode;
                            self.periodEndDate = periodEndDate;
                            self.prieodDataId = prieodDataId;
                            var executeParaminfo = {
                                SPName: 'usp_GetReportAndDataSourceState', SQLParams: [
                                    { Name: 'DimReportingDateId', value: prieodDataId, DBType: 'int' },
                                    { Name: 'DimReportingDate', value: periodEndDate, DBType: 'string' },
                                    { Name: 'TrustId', value: self.TrustId, DBType: 'int' },
                                    { Name: 'ReportTypeId', value: self.ReportTypeId, DBType: 'string' }
                                ]
                            };
                            common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParaminfo, function (data) {
                                var status = self.getReportStatus(self.TrustId, self.prieodDataId, self.ReportTypeId)

                                data.selectedReportName = "年度年报";
                                data.selectedReportId = self.ReportTypeId;
                                data.prieodData = self.periodEndDate;
                                data.reportStatus = status;
                                data.reportCurrentStatusName = permissionProxy.getNodeName(status);

                                self.reportDataTemp = data
                                self.$forceUpdate();
                            })
                        }
                        if (fn) {
                            fn();
                        }
                    });
                },
                //数据编辑-点击事件
                EditItemClick:function () {
                    var self = this;
                    self.init(function () {
                        var page = gv.TrustManagementServiceHostURL + "report/TrustAnnualReportEdit.html?PageName=" + self.PageName + "&TrustId=" + self.TrustId + '&DimReportingDateId=' + self.prieodDataId + '&ReportTypeId=' + self.ReportTypeId;
                        var pollId = 'EditReportItem' + self.TrustId;
                        var tabName = '编辑年度报告' + '_' + self.TrustCode;
                        openNewIframe(page, pollId, tabName);
                    });
                },
                //获取数据-点击事件
                taskDetailClick: function () {
                    var self = this;
                    self.init(function () {
                        $.anyDialog({
                            title: "任务完成详情",
                            width: 450,
                            height: 500,
                            changeallow: true,
                            html: $("#task-dialog")
                        })
                    });
                },
                //生产报告-点击事件
                GenerateDocClick: function () {
                    var self = this;
                    self.init(function () {
                        var executeParaminfo = {
                            SPName: "usp_PushIsImportData", SQLParams: [
                                { Name: 'TrustId', value: self.TrustId, DBType: 'int' },
                                { Name: 'ReportDate', value: self.periodEndDate, DBType: 'string' },
                            ]
                        };
                        common.ExecuteGetData(true, svcUrl, 'TrustManagement', executeParaminfo, function (data) {
                            if (data[0].result > 0) {
                                GSdialog.HintWindowTFS("检测到手动导入的资产服务报告文件数据，是否使用该数据导出报告!", function () {
                                    self.genconfirm(self.periodEndDate, self.reportDataTemp)
                                }, function () {
                                    self.genreject(self.periodEndDate, self.reportDataTemp)
                                })
                            } else {
                                self.genconfirm(self.periodEndDate, self.reportDataTemp)
                            }
                        })
                    });
                },
                //下载报告-点击事件
                exportDataClick: function () {
                    var self = this;
                    self.init(function () {
                        self.downLoadReport(self.reportDataTemp);
                    });
                },
                //生产事件-改变事件
                startDateSelectChange:function () {
                    var value = $("#startDateSelect").val() ? $("#startDateSelect").val() : '1900-01-01';
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
                            { Name: 'trustId', value: self.TrustId, DBType: 'int' },
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
                genconfirm: function (periodEndDate, stateList) {
                    var self = this;
                    self.generationReport(periodEndDate, stateList);
                },
                genreject: function (periodEndDate, stateList) {
                    var self = this;
                    self.deleteImportData(periodEndDate, stateList);
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
                //生成报告
                generationReport: function (periodEndDate, stateList) {
                    var self = this;
                    var workflowType = {
                        '009': {
                            workflowDisplayName: '年度报告',
                            taskCode: 'AnnualReportModelFileGeneration',//'IncomeDistributionAnnouncementModelFileGeneration',TrustReportModelFileGeneration
                            sourceTaskAppDomain: 'Task'
                        }
                    };
                    var reportCodeMap = {
                        6: '009'
                    };
                    if (stateList.reportStatus == '3') {
                        return false;
                    }
                    var trustId = self.TrustId
                    console.log(stateList.reportStatus);
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
                                        GSdialog.HintWindow('报告已生成！请下载！');
                                    }, 800)
                                })

                                stateList[0].downLoadUrl = downLoadLink;
                                stateList.isGenerated = '1';
                                self.reportDataTemp = stateList;
                                self.$forceUpdate();

                                self.saveDownLoadLink(downLoadLink, prieodData, trustId, reportTypeId)

                                //self.changeReportStatus(stateList.reportStatus, 1, 'generate', prieodData, reportTypeId, '', function (data) {
                                //    self.$forceUpdate();
                                //    stateList.reportStatus = data[0].result;
                                //    stateList.reportCurrentStatusName = permissionProxy.getNodeName(data[0].result);
                                //})
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
                },
                //判断文件是否存在
                fileExists: function (path) {
                    var isExists;
                    $.ajax({
                        url: path,
                        async: false,
                        type: 'HEAD',
                        error: function () {
                            isExists = 0;
                        },
                        success: function () {
                            isExists = 1;
                        }
                    });
                    if (isExists == 1) {
                        return true;
                    } else {
                        return false;
                    }
                },
            }
        });
    })
});
