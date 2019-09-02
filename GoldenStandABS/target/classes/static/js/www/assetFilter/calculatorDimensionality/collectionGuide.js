define(function (require) {
    var $ = require("jquery");
    var Vue = require("Vue");
    var common = require('common');
    var appGlobal = require('App.Global');
    var GlobalVariable = require('globalVariable');
    var GSDialog = require("gsAdminPages");
    var CallApi = require("callApi");
    var PoolId = common.getUrlParam('PoolId');
    new Vue({
        el: "#app",
        data: {
            url: "calculator.html?PoolId=" + PoolId,
            PoolDBName: ''
        },
        methods: {
            changeIframe: function ($event) {
                var isCashFlow = this.isCashFlow();
                var self = this;
                var target = $event.currentTarget;
                if (target.id) {
                    $(target).removeClass("current_li").addClass("current_li");
                    $(target).siblings().removeClass("current_li")
                    if (target.id == "CashflowManagementTotal") {
                        self.url = "calculator.html?PoolId=" + PoolId
                    } else if (target.id == "CashflowManagementSplit") {
                        self.url = "Dimensionality.html?PoolId=" + PoolId
                    } else {
                        self.url = "CreateAssets.html?PoolId=" + PoolId
                    }
                }
            },
            getPoolConfig: function () {
                var that = this;
                var callApi = new CallApi('DAL_SEC_PoolConfig', 'dbo.[usp_GetPoolHeader]', true);
                callApi.AddParam({
                    Name: 'PoolId',
                    Value: PoolId,
                    DBType: 'int'
                });
                callApi.ExecuteDataSet(function (response) {
                    var configInfo = response[0];
                    if (configInfo) {
                        that.PoolDBName = configInfo.PoolDBName;
                    };
                    var isCashFlow = that.isCashFlow();
                    if (!isCashFlow) {
                        //GSDialog.HintWindow("没有可供归集的现金流")
                        return false;
                    }
                });
            },
            //验证是否有可供操作的归集现金流
            isCashFlow: function () {
                var _this = this;
                var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecuteForPool?',
					appDomain = _this.PoolDBName,
					executeParam = {
					    'SPName': "TrustManagement.usp_GetHasCashFlow",
					    'SQLParams': [{
					        'Name': 'PoolId',
					        'Value': PoolId,
					        'DBType': 'int'
					    }]
					};

                var myData = false;
                common.ExecuteGetData(false, svcUrl, appDomain, executeParam, function (data) {
                    if (data[0].Result) {
                        if (data[0].Result == 1) {
                            myData = true
                        } else {
                            myData = false
                        }
                    }
                });
                return myData
            }
        },
        created: function () {
            this.getPoolConfig()

        }
    })
})