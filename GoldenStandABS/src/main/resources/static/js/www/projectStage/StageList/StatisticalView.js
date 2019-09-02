define(function (require) {
    var $ = require('jquery');
    var common = require('common');
    var wcfProxy = require('webProxy');
    var GlobalVariable = require('globalVariable');
    require('anyDialog');
    var Vue = require("Vue");
    var actionstatus;
    var GSDialog=require('gsAdminPages');
    var taskIndicator = require('gs/taskProcessIndicator');
    var sVariableBuilder = require('gs/sVariableBuilder');
    var status = [];
    var taskinfo = common.getUrlParam("Taskinfo");
    var TrustId = common.getUrlParam("TrustId");
    var tid = common.getUrlParam("tid");
    var ProjectId = common.getQueryString("ProjectId");
    var ScenarioCode = common.getQueryString("ScenarioCode");

    var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
    var StatisticalView = new Vue({
        el: "#StatisticalView",
        data: {
            activeTab: 1,
            tabs: [
                { index: 1, title: '回款一览' },
                { index: 2, title: '区间统计' },
                { index: 3, title: '资产明细' }
            ],
        },
        computed: {
            collectionOfPaymentPath: function () {
                return GlobalVariable.TrustManagementServiceHostURL+"projectStage/StageList/collectionOfPayment.html?&ProjectId=" + ProjectId + "&tid=" + tid + "&TrustId=" + TrustId;
            },
            intervalStatisticsPath: function () {
                return GlobalVariable.TrustManagementServiceHostURL + "projectStage/StageList/intervalStatistics.html?&ProjectId=" + ProjectId + "&tid=" + tid + "&TrustId=" + TrustId;
            },
            assetDetailsPath: function () {
                var PoolId = sessionStorage.getItem("TaskSetCKPoolId");
                if (ScenarioCode == "RecyclingList") {
                    if (PoolId) {
                        return GlobalVariable.TrustManagementServiceHostURL + "assetFilter/AssetsContrast/loanView.html?&ProjectId=" + ProjectId + "&tid=" + tid + "&TrustId=" + TrustId + "&PoolId=" + PoolId + "&IsTask=1";

                    } else {
                        GSDialog.HintWindow('请先确认购买资产清单！');
                    }
                } else {

                    return GlobalVariable.TrustManagementServiceHostURL + "assetFilter/AssetsContrast/loanView.html?&ProjectId=" + ProjectId + "&tid=" + tid + "&TrustId=" + TrustId + "&PoolId=" + PoolId + "&IsTask=1";

                }
             },
        },
        methods: {
            changeFrameShow: function (index) {
                switch (index) {
                    case 1:
                        this.activeTab = 1;
                        break;
                    case 2:
                        this.activeTab = 2;
                        break;
                    case 3:
                        this.activeTab = 3;
                        break;
                }
            },
            
        }
    });



})


