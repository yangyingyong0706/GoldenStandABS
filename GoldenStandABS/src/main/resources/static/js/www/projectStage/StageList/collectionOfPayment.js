define(function (require) {
    var $ = require('jquery');
    var common = require('common');
    var wcfProxy = require('webProxy');
    var GlobalVariable = require('globalVariable');
    require('anyDialog');
    var Vue = require("Vue");
    var actionstatus;
    var GSDialog = require('gsAdminPages');
    var taskIndicator = require('gs/taskProcessIndicator');
    var sVariableBuilder = require('gs/sVariableBuilder');
    var status = [];
    var taskinfo = common.getUrlParam("Taskinfo");
    var TrustId = common.getUrlParam("TrustId");
    var tid = common.getUrlParam("tid");
    var ProjectId = common.getQueryString("ProjectId");
    var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
    var collectionOfPayment = new Vue({
        el: "#collectionOfPayment",
        data:{
            tableDatas: [
            ],
            collectionOfPaymentExecuteParams: {
                SPName: 'usp_GetTrustBackedOverView', SQLParams: [
                    { Name: 'trustid', value: TrustId, DBType: 'int' }
                ]
            },
        },
        created: function () {
            var _this = this;
            common.ExecuteGetData(false, svcUrl, "TrustManagement", this.collectionOfPaymentExecuteParams, function (data) {
                //this.tableDatas = data;
                $.each(data, function (i, v) {
                    _this.tableDatas.push(v);

                })
            })
        }
    });

})

