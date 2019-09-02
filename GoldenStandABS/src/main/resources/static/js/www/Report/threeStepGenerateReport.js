define(function (require) {
    var $ = require('jquery');
    var gv = require('globalVariable');
    var Vue = require('Vue2');
    var common = require('common');
    var GlobalVariable = require('globalVariable');
    require('kendo.all.min');
    require('kendomessagescn');
    require('date_input');
    var webStorage = require("gs/webStorage");
    var userName = webStorage.getItem('gs_UserName');
    var height = $(window).height() - 105;
    var g_DataSource;
    var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
    var permissionProxy = require('permissionProxy');
    var webProxy = require('webProxyTask');
    var PageName = decodeURI(common.getQueryString('PageName'));
    var TrustId = common.getQueryString('TrustId');
    var TrustCode = common.getQueryString('TrustCode');
    var periodEndDate = common.getQueryString('periodEndDate')?common.getQueryString('periodEndDate'):'';
    var prieodDataId = common.getQueryString('prieodDataId')?common.getQueryString('prieodDataId'):'';
    var prieodYear = prieodDataId.substr(0, 4);
    require('anyDialog');
    var GSDialog = require("gsAdminPages");
    require('vMessage')
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



        Vue.directive('date-plugin', {
            inserted: function (el) {
                var self = this;
                $(el).date_input();
            },
        })
        var myCom = Vue.extend({
            template: '<div><span v-for="item in checkboxDataDic">'+
                '<input v-bind:name="item.ItemCode" v-if="item.IsCheckBox" type="checkbox" v-bind:value="item.value" v-model="item.checked" @change="send()"/>' +
                '<input v-bind:name="item.ItemCode" v-if="!item.IsCheckBox" type="radio" v-bind:value="item.value" v-bind:checked="item.checked" @change="send(item.value)"/>' +
                '{{item.value}}</span></div>',
            props: {
                checkboxData: {
                    type: Object
                }
            },
            computed: {
                checkboxDataDic: function () {
                    var self = this;
                    var tempArry = this.checkboxData.ItemValue.split('&')
                    var result = [];
                    for (var i = 0 ;i<tempArry.length;i++) {
                        var itemArr = tempArry[i].split('=');

                        var item = { ItemCode: '', IsCheckBox: true, checked: false, value: '' };
                        item.value = itemArr[1].substr(1)
                        if(itemArr[1].indexOf('☑')>=0){
                            item.checked = true;
                        }
                        item.ItemCode = this.checkboxData.ItemCode
                        item.IsCheckBox = (this.checkboxData.ControlType=="CheckBox")
                        console.log(item);
                        result.push(item);
                    }
                    return result;
                }
            },
            methods: {
                send:function(value){
                    var msg = '';
                    for (var i = 0 ; i < this.checkboxDataDic.length; i++) {
                        if (this.checkboxDataDic[i].IsCheckBox) {
                            if (this.checkboxDataDic[i].checked) {
                                msg += "□" + this.checkboxDataDic[i].value + "=☑" + this.checkboxDataDic[i].value;
                            } else {
                                msg += "□" + this.checkboxDataDic[i].value + "=□" + this.checkboxDataDic[i].value;
                            }
                        } else {
                            if (this.checkboxDataDic[i].value == value) {
                                msg += "□" + this.checkboxDataDic[i].value + "=☑" + this.checkboxDataDic[i].value;
                            } else {
                                msg += "□" + this.checkboxDataDic[i].value + "=□" + this.checkboxDataDic[i].value;
                            }
                        }
                    
                        if(i<this.checkboxDataDic.length-1)
                            msg +="&";
                    }
                    this.checkboxData.ItemValue = msg;
                    this.$emit('child-msg', this.checkboxData);
                }

            }
        })
        var vm = new Vue({
            el: '#app',
            components: {
                'field-checkbox': myCom
            },
            data: {
                loading: false,
                TrustId: TrustId,
                TrustCode: TrustCode,
                periodEndDate: periodEndDate,
                prieodDataId: prieodDataId,
                prieodYear: prieodYear,
                reportDataTemp: [],
                ReportTypeId: 6,
                PageName: PageName,
                GroupNames: [],
                ItemXml: [
                    {
                        ItemName: '',
                        ItemValue: '',
                        ControlType: ''
                    }
                ],
                step: 0,
                reportGenerateStatus: false,
                dateList: [],
                nowDate: '',
                EditStatus: false,
                getDataStatus: false,
            },
            mounted: function () {
                var self = this;
                this.getDateList(self.TrustId, this.GetItemXml, self.init);
            },
            watch: {
                nowDate: function (now) {
                    this.periodEndDate = now + "-01-01";
                    this.prieodDataId = Number(this.periodEndDate.replace(/-/g, ''));
                    this.GetItemXml();
                    this.reportGenerateStatus = this.getReportStatus(this.TrustId, this.prieodDataId, this.ReportTypeId);
                },
                step: function (now) {
                    if (now>0) {
                        $('#startDateSelect').attr('disabled',true)
                    } else {
                        $('#startDateSelect').attr('disabled', false)
                    }
                }
            },
            methods: {
                getDateList: function (trustId, fn1,fn2) {
                    var self = this;
                    var serviceUrl = gv.DataProcessServiceUrl + "CommonExecuteGet?";
                    var executeParam = {
                        'SPName': "usp_GetTrustPeriodStartDateAndEndDate",
                        'SQLParams': [
                            { 'Name': 'TrustId', 'Value': trustId, 'DBType': 'string' }
                        ]
                    };
                    common.ExecuteGetData(true, serviceUrl, 'TrustManagement', executeParam, function (data) {
                        if (data.length > 0) {
                            var startDate = data[0].StartDate
                            var endDate = data[0].EndDate
                            var startYear = new Date(parseInt(startDate.slice(6))).getFullYear()
                            var endYear = new Date(parseInt(endDate.slice(6))).getFullYear()
                            for (var year = startYear; year <= endYear ; year++) {
                                //$("#startDateSelect").append("<option value='" + year + "'>" + year + "</option>");
                                self.dateList.push(year)
                            }
                            if (!self.prieodDataId) {
                                self.nowDate = self.dateList[0];
                                self.periodEndDate = self.dateList[0] + "-01-01";
                                self.prieodDataId = Number(self.periodEndDate.replace(/-/g, ''))
                            } else {
                                self.nowDate = self.prieodDataId.slice(0,4);
                            }
                            console.log("self.dateList: " + self.dateList)
                        }
                        if (fn1) {
                            fn1();
                        }
                        if (fn2) {
                            fn2();
                        }
                    });
                },
                init: function (fn) {
                    var self = this;
                    if (self.prieodDataId && self.TrustId) {
                        var executeParaminfo = {
                            SPName: 'usp_GetReportAndDataSourceState', SQLParams: [
                                { Name: 'DimReportingDateId', value: self.prieodDataId, DBType: 'int' },
                                { Name: 'DimReportingDate', value: self.periodEndDate, DBType: 'string' },
                                { Name: 'TrustId', value: self.TrustId, DBType: 'int' },
                                { Name: 'ReportTypeId', value: self.ReportTypeId, DBType: 'string' }
                            ]
                        };
                        common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParaminfo, function (data) {
                            var status = self.getReportStatus(self.TrustId, self.prieodDataId, self.ReportTypeId);
                            self.reportGenerateStatus = status;
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
                },
                getStepStatus: function (trustId, dimReportingDateId, reportTypeId, type) {
                    var self = this;
                    var status = null;
                    //获取编辑的状态
                    var executeParaminfo = {
                        SPName: 'usp_GetReportEditOrGetStatus', SQLParams: [
                            { Name: 'TrustId', value: trustId, DBType: 'int' },
                            { Name: 'DimReportingDateId', value: dimReportingDateId, DBType: 'int' },
                            { Name: 'ReportTypeId', value: reportTypeId, DBType: 'int' },
                            { Name: 'IsEditOrGetint', value: type, DBType: 'int' }
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
                goSecond: function () {
                    var self = this;
                    self.step = 1;
                    self.EditStatus = this.getStepStatus(self.TrustId, self.prieodDataId, self.ReportTypeId,1)
                },
                gothird: function () {
                    var self = this;
                    self.step = 2;
                    self.getDataStatus = this.getStepStatus(self.TrustId, self.prieodDataId, self.ReportTypeId, 2);
                },
                getChildMsg: function (item) {
                    for (var i = this.ItemXml.length - 1; i >= 0; i--) {
                        if (this.ItemXml[i].ItemCode == item.ItemCode) {
                            this.ItemXml[i].ItemValue = item.ItemValue
                        }
                    }
                },
                //获取数据xml
                GetItemXml: function (fn) {
                    var self = this;
                    var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
                    var executeParam = {
                        'SPName': "TrustManagement.usp_GetTrustReportFieldValue",
                        'SQLParams': [
                            { 'Name': 'TrustId', 'Value': self.TrustId, 'DBType': 'int' },
                            { 'Name': 'DimReportingDateId', 'Value': self.prieodDataId, 'DBType': 'int' },
                            { 'Name': 'ReportTypeId', 'Value': self.ReportTypeId, 'DBType': 'int' }
                        ]
                    };
                    common.ExecuteGetData(true, serviceUrl, 'TrustManagement', executeParam, function (data) {
                        self.GroupNames = []
                        for (var i = 1; i < data.length ; i++) {
                            if (!self.GroupNames.includes(data[i].GroupName)) {
                                self.GroupNames.push(data[i].GroupName)
                            }
                        }
                        self.ItemXml = data;
                        if (fn) {
                            fn()
                        }
                    });
                },
                QueryAsset: function (Value, Id, TableCode, ControlData, DataSourceId) {
                    var item = Value;
                    var self = this;
                    var tableCode = TableCode;
                    if (ControlData == null || TableCode==null) {
                        GSDialog.HintWindow("TableCode或ControlData为空,请联系管理员配置！");
                        return false
                    }
                    var page = gv.TrustManagementServiceHostURL + "report/TrustReportFieldValueEdit.html?PageName=" + PageName + "&TrustId=" + TrustId + '&DimReportingDateId=' + self.prieodDataId + '&ReportTypeId=' + self.ReportTypeId + '&DataSourceId=' + DataSourceId + '&TrustReportField=' + Id + '&TableCode=' + tableCode;
                    GSDialog.open(item, page, null, function (result) {
                        if (result) {
                            window.location.reload();
                        }
                    }, 1000, 580);
                
                },
                SaveProject: function () {
                    var self = this;
                    var saveXml = '<Items>'
                    $.each(self.ItemXml, function (i, v) {
                        if (v.ItemValue != null)
                            saveXml += '<Item ReportTypeId="' + v.ReportTypeId +
                                '" DataSourceId="' + v.DataSourceId +
                                '" TableCode="' + (v.TableCode == null ? '' : v.TableCode) +
                                '" TableRowKey="' + (v.TableRowKey == null ? '' : v.TableRowKey) +
                                '" ControlType="' + (v.ControlType == null ? '' : v.ControlType) +
                                '" ItemSequenceNo="' + (v.ItemSequenceNo == null ? '' : v.ItemSequenceNo) +
                                '" ItemCode="' + v.ItemCode +
                                '" TrustId="' + v.TrustId +
                                '" DimReportingDateId="' + v.DimReportingDateId +
                                '">' + ((v.ControlType == "CheckBox" || v.ControlType == "Radio") ? v.ItemValue.replace(/&/g, ";") : v.ItemValue) + '</Item>'
                    })
                    saveXml += '</Items>'
                    var svcUrl = GlobalVariable.DataProcessServiceUrl + 'PoastData?',
                        executeParam = {
                            SPName: "TrustManagement.usp_SaveTrustReportFieldValue",
                            SQLParams: [
                                { 'Name': 'Xml', 'Value': saveXml, 'DBType': 'xml' }
                            ]
                        };
                    var executeParams = encodeURIComponent(JSON.stringify(executeParam));
                    $.ajax({
                        cache: false,
                        type: "POST",
                        async: false,
                        url: svcUrl + 'appDomain=TrustManagement&executeParams=2&resultType=commom',
                        dataType: "json",
                        processData: false,
                        data: "[{executeParams:\"" + executeParams + "\"}," +
                                "{appDomain:\"TrustManagement\"}," +
                                "{resultType:\"commom\"}]",
                        success: function (response) {
                            GSDialog.HintWindow('保存成功！', function () {
                                //window.location.reload()
                                self.GetItemXml();
                                self.step = 1;
                                self.EditStatus = 1;
                            });
                        },
                        error: function (response) { GSDialog.HintWindow('Error occursed while requiring the remote source data!'); }
                    });
                },
                //生成报告-点击事件
                GenerateDocClick: function () {
                    var self = this;
                    var executeParaminfo = {
                        SPName: "usp_PushIsImportData", SQLParams: [
                            { Name: 'TrustId', value: self.TrustId, DBType: 'int' },
                            { Name: 'ReportDate', value: self.periodEndDate, DBType: 'string' },
                        ]
                    };
                    common.ExecuteGetData(true, svcUrl, 'TrustManagement', executeParaminfo, function (data) {
                        if (data[0].result > 0) {
                            GSDialog.HintWindowTFS("检测到手动导入的资产服务报告文件数据，是否使用该数据导出报告!", function () {
                                self.genconfirm(self.periodEndDate, self.reportDataTemp)
                            }, function () {
                                self.genreject(self.periodEndDate, self.reportDataTemp)
                            })
                        } else {
                            self.genconfirm(self.periodEndDate, self.reportDataTemp)
                        }
                    })
                },
                //下载报告-点击事件
                exportDataClick: function () {
                    var self = this;
                    self.downLoadReport(self.reportDataTemp);
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
                                //self.$message.error();
                                GSDialog.HintWindow(strMsg);
                                stateItem.state = '2'
                            } else {
                                self.$message.success('数据获取成功！');
                                stateItem.state = '1'
                            }
                        } else {
                            //self.$message.error('数据还未准备好或数据获取失败！');
                            GSDialog.HintWindow('数据还未准备好或数据获取失败！');
                        }

                    })
                },
                //获取全部数据
                pullAllData: function () {
                    var self = this;
                    $.each(self.reportDataTemp, function (i, v) {
                        self.pullReportData(v, self.reportDataTemp.selectedReportId, self.reportDataTemp.prieodData)
                    });
                    for (var i = 0; i < self.reportDataTemp.length; i++) {
                        if (self.reportDataTemp[i].state != 1) {
                            GSDialog.HintWindowTF('有未获取的数据！是否继续生成报告？', function () {
                                self.step = 2;
                            });
                        }
                    }
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
                                        GSDialog.HintWindow('报告已生成！请下载！');
                                        self.reportGenerateStatus = true;
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
                                    GSDialog.HintWindow('报告生成失败！请重新尝试！');
                                    self.reportGenerateStatus = false;
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
                        GSDialog.HintWindow('报告还未生成!');
                        return;
                    }
                    else if (!isFileExists) {
                        GSDialog.HintWindow('报告生成失败，请重新尝试!');
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
                toggleNext: function (index) {
                    var $xmlDiv = $('.xmlDiv');
                    $xmlDiv.eq(index).toggle();
                }
            }
        });

});
