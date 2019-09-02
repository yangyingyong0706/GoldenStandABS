define(function (require) {
    var $ = require('jquery');
    var kendoGridModel = require('app/assetFilter/AssetsContrast/js/kendoGridModel');
    var CallApi = require("callApi")
    require("kendomessagescn");
    require("kendoculturezhCN");
    var taskIndicator = require('gs/taskProcessIndicator');
    var sVariableBuilder = require('gs/sVariableBuilder');
    var GlobalVariable = require('globalVariable');
    GSDialog = require('gs/uiFrame/js/gs-admin-2.pages');
    var common = require('gs/uiFrame/js/common')
    var Vue = require('Vue');
    var poolId = common.getQueryString('PoolId');
    var app = new Vue({
        el: "#app",
        data: {
            SettingItem: [],
            settingCode: [],
            PoolDBName: '',
            PoolName: '',
            PoolConnection:'',
            SelectSetting: [],
            SelectSettingCode: [],
            SelectDimConfigData: [],
            DimConfigData: [],
            HistoryHistorySelectSetting: [],
            loading: true,
            selectRemainder: false,
            selectLoanPeriod: false
        },
        created: function(){
            this.getPoolConfig()
        },
        methods: {
            getPoolConfig: function () {
                var that = this;
                var callApi = new CallApi('DAL_SEC_PoolConfig', 'dbo.[usp_GetPoolHeader]', true);
                callApi.AddParam({ Name: 'PoolId', Value: poolId, DBType: 'int' });
                callApi.ExecuteDataSet(function (response) {
                    var configInfo = response[0];
                    if (configInfo) {
                        that.PoolName = configInfo.PoolName;
                        that.PoolDBName = configInfo.PoolDBName;
                        that.PoolConnection = configInfo.TargetSqlConnection;
                        that.InitGrid();
                    }
                    that.GetHistorySelectSetting(that.GetDimConfigData);
                });
            },
            GetDimConfigData: function() {
                var self = this;
                var executeParam = {
                    'SPName': "TrustManagement.usp_GetDimDistribution"
                };
                var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonGetExecuteForPool?";
                    
                common.ExecuteGetData(true, serviceUrl, self.PoolDBName, executeParam, function (data) {
                    self.DimConfigData = data;
                    $.each(self.DimConfigData, function (i, v) {
                        self.SettingItem.push({ name: v.DistributionTypeName, boolean: false })
                    })
                    $.each(self.SettingItem, function (i,v) {
                        for (var j = 0; j < self.HistoryHistorySelectSetting.length; j++) {
                            if (v.name == self.HistoryHistorySelectSetting[j].DimName) {
                                self.SettingItem[i].boolean = true
                            }
                        }
                    })
                    self.loading = false;
                });
            },
            GetHistorySelectSetting: function (fn) {
                var self = this;
                //[TrustManagement].[usp_GetDimConfig]
                var executeParam = {
                    SPName: 'TrustManagement.usp_GetDimConfig',
                    SQLParams: [
                        { Name: 'poolId', value: poolId, DBType: 'int' }
                    ]
                };
                var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonGetExecuteForPool?";
                common.ExecuteGetData(true, serviceUrl, self.PoolDBName, executeParam, function (data) {
                    self.HistoryHistorySelectSetting = data;
                    $.each(data,function(i,v){
                        if (v.DimName == '剩余期数') {
                            self.selectRemainder = true;
                        }
                        if (v.DimName == '合同期限') {
                            self.selectLoanPeriod = true;
                        }
                    })
                    if (fn) {
                        fn()
                    }
                });
            },
            GetSelectSetting: function (e) {
                var self = this;
                var $this = e.target;
                $($this).toggleClass('active');
                //if (self.SelectSetting.indexOf(item) === -1) {
                //    self.SelectSetting.push(item);
                //} else {
                //    self.SelectSetting.remove(item);
                //}
            },
            SaveDimConfig: function () {
                //TrustManagement.usp_SaveDimConfig
                var self = this;
                var off = true,offloan=true;
                var $remainder = $('#remainder'), $loanperiod = $('#loanperiod');;
                if ($remainder.hasClass('active')) {
                    off = true;
                } else {
                    off = false   
                }
                if ($loanperiod.hasClass('active')) {
                    offloan = true;
                } else {
                    offloan = false
                }
                self.SelectSetting = [];
                var itemSpan = $('.itemSpan.active');
                $.each(itemSpan, function (i,v) {
                    self.SelectSetting.push($(v).html())
                })
                self.SelectDimConfigData = [];
                $.each(self.DimConfigData, function (i, v) {
                    for (var j = 0; j < self.SelectSetting.length; j++) {
                        if (v.DistributionTypeName.indexOf(self.SelectSetting[j]) > -1) {
                            self.SelectDimConfigData.push({ 'code': v.DistributionTypeCode, 'name': v.DistributionTypeName });
                        }
                    }
                })
                var xml = '<DimConfig>';
                if (off) {
                    xml += '<Config><DimId>1</DimId><DimCode>RemainingTerm</DimCode><DimName>剩余期数</DimName></Config>'
                }
                if (offloan) {
                    xml += '<Config><DimId>2</DimId><DimCode>LoanTerm</DimCode><DimName>合同期限</DimName></Config>'
                }
                $.each(self.SelectDimConfigData, function (i,v) {
                    xml += '<Config>';
                    xml += '<DimId>' + (i+3) + '</DimId>';
                    xml += '<DimCode>' + v.code + '</DimCode>';
                    xml += '<DimName>' + v.name + '</DimName>';
                    xml += '</Config>';
                })
                xml += '</DimConfig>';
                var executeParam = {
                    SPName: 'TrustManagement.usp_SaveDimConfig',
                    SQLParams: [
                        { Name: 'poolId', value: poolId, DBType: 'int' },
						{ Name: 'dimConfigXml', value: xml, DBType: 'xml' }
                    ]
                };
                var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonGetExecuteForPool?";
                common.ExecuteGetData(true, serviceUrl, self.PoolDBName, executeParam, function (data) {
                    sVariableBuilder.AddVariableItem('PoolId', poolId, 'Int', 0, 0, 0);
                    sVariableBuilder.AddVariableItem('PoolDBConnectionStr', self.PoolConnection, 'String', 0, 0, 0);
                    var sVariable = sVariableBuilder.BuildVariables();
                    var tIndicator = new taskIndicator({
                        width: 500,
                        height: 550,
                        clientName: 'TaskProcess',
                        appDomain: 'Task',
                        taskCode: 'PoolCalculateDim', //'DateInfoWizard',
                        sContext: sVariable,
                        callback: function () {
                            //window.location.href = '/GoldenStandABS/www/components/assetPoolList/AssetPoolList.html';
                            //window.location.href = window.location.href;
                            sVariableBuilder.ClearVariableItem();
                            self.InitGrid()
                        }
                    });
                    tIndicator.show();
                });
            },
            InitGrid: function () {
                var self = this;
                kendo.culture("zh-CN");
                var height = $('body').height() - $('#settingDiv').height() - 180;
                var kendouGrid = new kendoGridModel(height);
                kendouGrid.Init({
                    renderOptions: {
                        columns: [
                            { field: "AccountNo", title: '属性维度组合', width: "400px", attributes: { style: 'text-align:left' } },
                            { field: "LoanCount", title: '资产笔数', width: "150px" },
                            { field: "LoanCountPercentage", title: '资产占比（%）', width: "150px" },
                            { field: "CurrentPrincipalBalance", title: '剩余本金（元）', width: "200px", format: "{0:n}" },
                            { field: "CPBPercentage", title: '剩余本金占比（%）', width: "150px" },
                            { field: "ApprovalAmount", title: '合同金额（元）', width: "200px", format: "{0:n}" },
                            { field: "ApprovalAmountPercentage", title: '合同金额占比（%）', width: "150px" },
                            { field: "", title: "", width: "auto" }
                        ]
                    },
                    dataSourceOptions: {
                        pageSize: 20,
                        params: [],
                        otherOptions: {
                            orderby: "DimLoanId",
                            direction: "asc",
                            appDomain: self.PoolDBName,
                            executeParamType: 'extend',
                            defaultfilter: '',
                            executeParam: function () {
                                var result = {
                                    SPName: 'TrustManagement.usp_GetDimAttributeStatistics',
                                    SQLParams: [
                                        { Name: 'PoolID', Value: poolId, DBType: 'int' }
                                    ]
                                };
                                return result;
                            }
                        }
                    }
                });
                kendouGrid.RunderGrid();
            }
        }
    })
})