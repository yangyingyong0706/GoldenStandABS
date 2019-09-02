define(function (require) {
    var $ = require('jquery');
    var kendoGridModel = require('app/assetFilter/AssetsContrast/js/kendoGridModel');
    var CallApi = require("callApi")
    require("kendomessagescn");
    require("kendoculturezhCN");
    var GlobalVariable = require('globalVariable');
    GSDialog = require('gs/uiFrame/js/gs-admin-2.pages');
    var common = require('gs/uiFrame/js/common')
    var Vue = require('Vue');
    var webProxy = require('webProxy');
    var taskIndicator = require('gs/taskProcessIndicator');
    var sVariableBuilder = require('gs/sVariableBuilder');
    var poolId = common.getQueryString('PoolId');
    var window = this;
    require('bootstrap');
    window.getOperate = function (poolId,DimloanId) {
        //tid, accountno
        var viewPageUrl = GlobalVariable.TrustManagementServiceHostURL + 'assetFilter/cashFlowSplit/AssetPayMentSchedule/AssetPaymentSchedule.html?poolId=' + poolId + '&DimloanId=' + DimloanId + '&enter=creatAssets' + '&PoolDBName=' + app.PoolDBName;
        var html = '<a href="javascript: window.showDialogPage(\'' + viewPageUrl + '\',\'资产现金流\',1100,500,function(){},false);">现金流</a>';
        return html;   
    };
    window.showDialogPage = function (url, title, width, height, fnCallBack, scrolling) {
        common.showDialogPage(url, title, width, height, fnCallBack, scrolling);
    }
    var app = new Vue({
        el: "#app",
        data: {
            PoolDBName: '',
            PoolName: '',
            PoolConnection: '',
            DimConfigData: [],
            loading: true
        },
        created: function () {
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
                        that.InitGrid("");         
                    }
                });
            },
            GetDimConfigData: function (CashFlowSource, type) {
                debugger
                var _this = this;
                if (type === 'menu') {
                    var taskCode = 'PoolCreateInstallAsset';
                } else {
                    var taskCode = 'PoolCreateAsset';
                }
                sVariableBuilder.AddVariableItem('PoolDBName', _this.PoolDBName, 'String', 0, 0, 0);
                sVariableBuilder.AddVariableItem('CashFlowSource', CashFlowSource, 'String', 0, 0, 0);
                sVariableBuilder.AddVariableItem('PoolId', poolId, 'Int', 0, 0, 0);
                sVariableBuilder.AddVariableItem('PoolDBConnectionStr', _this.PoolConnection, 'String', 0, 0, 0);
                var sVariable = sVariableBuilder.BuildVariables();
                var tIndicator = new taskIndicator({
                    width: 500,
                    height: 550,
                    clientName: 'TaskProcess',
                    appDomain: 'Task',
                    taskCode: taskCode, //'DateInfoWizard',
                    sContext: sVariable,
                    callback: function () {
                        _this.InitGrid("");
                        sVariableBuilder.ClearVariableItem();
                    }
                });
                tIndicator.show();
               
            },
            InitGrid: function (SelectSettingCode) {
                var self = this;
                kendo.culture("zh-CN");
                var height = $('body').height() - 125;
                var kendouGrid = new kendoGridModel(height);
                kendouGrid.Init({
                    renderOptions: {
                        columns: [
                            { field: "AccountNo", title: '新资产编号', width: "300px", attributes: { style: 'text-align:left' } },
                            { field: "AssetType", title: '资产类型', width: "200px" },
                            { field: "LoanCount", title: '资产笔数', width: "200px" },
                            { field: "ApprovalAmount", title: '合同金额', width: "200px", format: "{0:n}" },
                            { field: "RemainingTerm", title: '加权平均剩余期数', width: "200px" },
                            { field: "CurrentRate", title: '加权平均利率', width: "200px" },
                            { field: "PrincipalAmount", title: '本金归集', width: "200px", format: "{0:n}" },
                            { field: "InterestAmount", title: '利息归集', width: "200px", format: "{0:n}" },
                            { title: '操作', template: '#=window.getOperate(DimPoolId,DimLoanId)#', width: "150px" },  //TrustId,AccountNo
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
                                    SPName: 'TrustManagement.usp_GetDimResultAsset',
                                    SQLParams: [
                                        { Name: 'PoolId', Value: poolId, DBType: 'int' }
                                    ]
                                };
                                return result;
                            }
                        }
                    }
                });
                kendouGrid.RunderGrid();
                self.loading = false;
            },
            CreateAssets: function (CashFlowSource,type) {
                this.GetDimConfigData(CashFlowSource,type)
            },
            //导出资产明细
            DimResultExportExcel: function () {
                var self = this;
                var serviceUrl = GlobalVariable.CommonServicesUrl + 'ExportDataPoolToExcel';
                var objParam = { SPName: 'TrustManagement.ExportDimresult', SQLParams: [{ Name: 'PoolId', Value: poolId, DBType: 'int' }] };
                var strParam = encodeURIComponent(JSON.stringify(objParam));
                var obj = { connectionName: self.PoolDBName, param: strParam, excelName: "资产明细", sheetName: 'Sheet1' };

                var tempform = document.createElement("form");
                tempform.action = serviceUrl;
                tempform.method = "post";
                //tempform.target = "downloadTarget";
                tempform.style.display = "none";
                for (var x in obj) {
                    var opt = document.createElement("input");
                    opt.name = x;
                    opt.value = obj[x];
                    tempform.appendChild(opt);
                }

                var opt = document.createElement("input");
                opt.type = "submit";
                tempform.appendChild(opt);
                document.body.appendChild(tempform);
                tempform.submit();
                document.body.removeChild(tempform);
                //以下为弹窗等待方式(不要删除即可)
                //var ceshi = document.createElement("div");
                //var icon = document.createElement("i");
                //icon.className = "fa fa-spinner fa-pulse fa-4x fa-fw margin-bottom";
                //ceshi.className = "loadingUpload"
                //ceshi.appendChild(icon)
                //document.body.appendChild(ceshi);
                //var oFrm = document.getElementById("Iframe");
                //oFrm.name = "downloadTarget";
                //oFrm.src = serviceUrl;
                //oFrm.onload = function () {
                //    console.log(666)
                //    document.body.removeChild(ceshi);
                //}
            },
            //导出现金流
            VirtualScheduleExportExcel: function () {
                var self = this;
                var serviceUrl = GlobalVariable.CommonServicesUrl + 'ExportDataPoolToExcel';
                var objParam = { SPName: 'TrustManagement.ExportVirtualSchedule', SQLParams: [{ Name: 'PoolId', Value: poolId, DBType: 'int' }] };
                var strParam = encodeURIComponent(JSON.stringify(objParam));
                var obj = { connectionName: self.PoolDBName, param: strParam, excelName: "资产归集现金流", sheetName: 'Sheet1' };
                var tempform = document.createElement("form");
                tempform.action = serviceUrl;
                tempform.method = "post";
                //tempform.target = "downloadTarget";
                tempform.style.display = "none";
                for (var x in obj) {
                    var opt = document.createElement("input");
                    opt.name = x;
                    opt.value = obj[x];
                    tempform.appendChild(opt);
                }
                var opt = document.createElement("input");
                opt.type = "submit";
                tempform.appendChild(opt);
                document.body.appendChild(tempform);
                tempform.submit();
                document.body.removeChild(tempform);
                //以下为弹窗等待方式(不要删除即可)
                //var ceshi = document.createElement("div");
                //var icon = document.createElement("i");
                //icon.className = "fa fa-spinner fa-pulse fa-4x fa-fw margin-bottom";
                //ceshi.className = "loadingUpload"
                //ceshi.appendChild(icon)
                //document.body.appendChild(ceshi);
                //var oFrm = document.getElementById("Iframe");
                //oFrm.name = "downloadTarget";
                //oFrm.src = serviceUrl;
                //oFrm.onload = function () {
                //    console.log(666)
                //    document.body.removeChild(ceshi);
                //}
            }
        }
    })
})