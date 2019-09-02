define(function(require) {
	var $ = require('jquery');
	var common = require('gs/uiFrame/js/common');
	var self = this;
	self.getStringDate = common.getStringDate;
	self.numFormt = common.numFormt;
	var CallApi = require("callApi")
	var kendoGridModel = require('gs/Kendo/kendoGridModel');
	var GlobalVariable = require('globalVariable');
	var taskIndicator = require('gs/taskProcessIndicator');
	var sVariableBuilder = require('gs/sVariableBuilder');
	var GSDialog = require("gsAdminPages");
	var Vue = require('Vue2');
	require("kendomessagescn");
	require("kendoculturezhCN");
	kendo.culture("zh-CN");
	var TrustId = common.getQueryString('TrustId');
	var poolCutId = common.getQueryString('PoolDBName');
	self.PoolId = common.getQueryString('PoolId')
	require('date_input');
	self.getOperate = function (tid, accountno) {
	    var viewPageUrl = GlobalVariable.TrustManagementServiceHostURL + 'assetFilter/calculatorDimensionality/SelecterResultDetails.html?trustId=' + tid + '&accountNo=' + accountno + '&poolId=' + app.poolid + '&poolCutId=' + poolCutId;
        var html = '<a href="javascript: window.showDialogPage(\'' + viewPageUrl + '\',\'资产现金流\',1100,500,function(){},true);">现金流</a>';
        return html;
	}
	self.showDialogPage = function (url, title, width, height, fnCallBack, scrolling) {
	    common.showDialogPage(url, title, width, height, fnCallBack, scrolling);
	}
	var app = new Vue({
		el: '#app',
		data: {
		    PoolId: common.getQueryString('PoolId'),
		    TrustId: common.getQueryString('TrustId'),
		    poolCutId: common.getQueryString('PoolDBName'),
			svcUrlTrustManagement: GlobalVariable.DataProcessServiceUrl + "CommonGetExecute?connConfig=TrustManagement&",
			isShow: true,
			//nameList: [],
			//nameListIndex: 0,
		    poolid: ''
		},
		methods: {
		    //selectName: function (index, item) {
            //    console.log(item)
		    //    this.nameListIndex = index
		    //    this.initKendouGridByPoolId(item.DimReportingDateID, item.poolid)
		    //},
		    //返回
		    back: function() {
		        window.location.href = './CashflowSelecter.html?PoolDBName=' + this.poolCutId + '&TrustId=' + this.TrustId + '&PoolId=' + this.PoolId
		    },
		    //获取资产池列表
		    //getAssetData: function () {
		    //    var _this = this;
            //    var executeParam = {
            //        SPName: 'TrustManagement.usp_GetJoinedPools', SQLParams: [
            //            { Name: 'TrustId', value: this.TrustId, DBType: 'int' },
            //            { Name: 'PoolCutDBName', value: this.poolCutId, DBType: 'string' }
            //        ]
            //    };
            //    common.ExecuteGetData(true, this.svcUrlTrustManagement, this.poolCutId, executeParam, function (result) {
            //        console.log(result)
            //        if (result.length > 0) {
            //            _this.nameList = result;
            //            _this.initKendouGridByPoolId(result[0].DimReportingDateID, result[0].poolid)
            //        }
            //    });
            //},
            //初始化kendo
		    initKendouGridByPoolId: function (poolid) {
		        this.poolid = poolid;
                var _this = this;
                var height = $('body').height() - 105;
                var filter = "where DimSourceTrustID = " + _this.TrustId + " and ParentPoolId=0";
                //资产明细列表
                kendouGrid = new kendoGridModel(height);
                kendouGrid.Init({
                    renderOptions: {
                        reorderable: false,
                        columns: [
                            { field: "AccountNo", title: '合同编号', width: "150px" },
                            { field: "StartDate", title: '开始日', template: '#=StartDate?self.getStringDate(StartDate).dateFormat("yyyy-MM-dd"):""#', width: "180px" },
                            { field: "EndDate", title: '到期日', template: '#=EndDate?self.getStringDate(EndDate).dateFormat("yyyy-MM-dd"):""#', width: "180px" },
                            { field: "InterestRate", title: '利率（%）', width: "150px" },
                            { field: "CurrentPrincipalBalance", title: '本金余额（元）', template: '#=self.numFormt(CurrentPrincipalBalance)#', width: "150px" },
                            { field: "IsInTrust", title: '是否入池', template: '#=IsInTrust==1?"是":"否"#', width: "120px" },
                            { field: "PrincipalPaymentType", title: '还本付息方式', width: "150px" },
                            { title: '操作', template: '#=self.getOperate(TrustId, AccountNo)#', width: "100px" }
                        ]
                    },
                    dataSourceOptions: {
                        pageSize: 20,
                        params: [],
                        otherOptions: {
                            orderby: "AccountNo",
                            direction: "",
                            DBName: 'TrustManagement',
                            appDomain: _this.poolCutId,
                            executeParamType: 'extend',
                            executeParam: function () {
                                var result = {
                                    SPName: 'TrustManagement.usp_GetCashFlowDataJoinResult', SQLParams: [
                                        { Name: 'TrustId', Value: _this.TrustId, DBType: 'int' },
                                        { Name: 'PoolId', Value: _this.PoolId, DBType: 'int' }
                                    ]
                                };
                                return result;
                            }
                        }
                    }
                });
                kendouGrid.RunderGrid();
                _this.isShow = false;
            },
		},
		mounted: function () {
		    this.initKendouGridByPoolId(this.PoolId)
		}
	})
})