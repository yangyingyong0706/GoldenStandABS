define(function (require) {
    var $ = require('jquery');
    var common = require('gs/uiFrame/js/common');
    var CallApi = require("callApi")
    var GlobalVariable = require('globalVariable');
    var taskIndicator = require('gs/taskProcessIndicator');
    var sVariableBuilder = require('gs/sVariableBuilder');
    var GSDialog = require("gsAdminPages");
    var Vue = require('Vue2');
    new Vue({
        el: '#mainDiv',
        data: {
            DateArray: [],
            startDate: '',
            startDateArray: [],
            endDate: '',
            endDateArray: [],
            trustId: common.getQueryString("trustId"),
        },
        methods: {
            Cancel: function() {
                GSDialog.close(0);
            },
            Submit: function () {
                if (this.startDate > this.endDate) {
                    GSDialog.HintWindow("开始期数不能大于结束期数");
                    return false;
                }
                this.uploadDate()
            },
            //上传开始期数、结束期数
            uploadDate: function () {
               
                var startDate = '',
                    endDate = '';
                for(var i = 0; i < this.startDateArray.length; i++) {
                    if(this.startDate == this.startDateArray[i].Period) {
                        startDate = this.startDateArray[i].PaymentDate;
                        startDate = startDate.replace(/-/g, "");
                    }
                    if (this.endDate == this.startDateArray[i].Period) {
                        endDate = this.startDateArray[i].PaymentDate;
                        endDate = endDate.replace(/-/g, "");
                    }
                }
                
                var _this = this;
                var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecuteForPool?',
					appDomain = 'TrustManagement',
					executeParam = {
					    'SPName': "TrustManagement.usp_SaveStressTestPeriod",
					    'SQLParams': [{
					        'Name': 'trustId',
					        'Value': this.trustId,
					        'DBType': 'int'
					    },{
					        'Name': 'startDateId',
					        'Value': startDate,
					        'DBType': 'int'
					    }, {
					        'Name': 'endDateId',
					        'Value': endDate,
					        'DBType': 'int'
					    }, {
					        'Name': 'period',
					        'Value': this.endDate - this.startDate+1,
					        'DBType': 'int'
					    }]
					};
                common.ExecuteGetData(true, svcUrl, appDomain, executeParam, function (data) {
                    GSDialog.close(startDate + ':' + endDate);
                });
            },
            //得到期数列表
            getData: function () {
                var _this = this;
                var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecuteForPool?',
					appDomain = 'TrustManagement',
					executeParam = {
					    'SPName': "TrustManagement.usp_GetPaymentDateAndPeriod",
					    'SQLParams': [{
					        'Name': 'trustId',
					        'Value': this.trustId,
					        'DBType': 'int'
					    }]
					};
                common.ExecuteGetData(true, svcUrl, appDomain, executeParam, function (data) {
                    for (var i = 0; i < data.length; i++) {
                        data[i].PaymentDate = common.getStringDate(data[i].PaymentDate).dateFormat("yyyy-MM-dd")
                    }
                    if (data.length > 0) {
                        _this.startDate = data[0].Period;
                        _this.endDate = data[data.length - 1].Period;
                        _this.startDateArray = JSON.parse(JSON.stringify(data));
                        _this.endDateArray = JSON.parse(JSON.stringify(data));
                    }
                });
            }
        },
        mounted: function () {
            this.getData()
        }
    })
})