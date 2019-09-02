define(function(require) {
	var $ = require('jquery');
	var GlobalVariable = require('globalVariable');
	var common = require('common');
	require('bootstrap');
	require("ischeck");
	var kendoGridModel = require('app/assetFilter/AssetsContrast/js/myKendoGridModel');
	var GSDialog = require('gsAdminPages');
	var CallApi = require("callApi");
	var webStore = require('gs/webStorage');
	var assetTree = null;
	var kendouGrid;
	var webProxy = require('gs/webProxy');
	var self = this;
	var PoolId = common.getQueryString('PoolId'); //GSDialog.getData().Pool.PoolId;
	var params = [];
	var svcUrl = webProxy.dataProcessServiceUrl + "CommonGetExecute?connConfig=DAL_SEC_PoolConfig&appDomain=config&executeParams=";
	var PoolDBName;
	var poolHeader;
	var ComperPoolbase;
	var poolfilter = 1;
	var height = $(window).height() - 73;
	require("kendomessagescn");
	var paramS = [
		['PoolId', PoolId, 'int']
	];

	$(function() {
		var promise = webProxy.comGetData(paramS, svcUrl, 'usp_GetPoolHeaderById');
		promise().then(function(response) {
			if(typeof response === 'string') {
				poolHeader = JSON.parse(response);
			} else {
				poolHeader = response;
			}
			PoolDBName = poolHeader[0].PoolDBName;
			initKendouGridByPoolId(PoolDBName);
		})
	})

	function initKendouGridByPoolId(PoolDBName) {
		kendouGrid = new kendoGridModel(height);
		kendouGrid.Init({
			renderOptions: {
				reorderable: false,
				columns: [{
						field: "DimPoolID",
						title: '资产池编号',
						width: "150px"
					}, {
						field: "DimECID",
						title: 'EC标识',
						width: "100px"
					},
					{
						field: "CriteriaName",
						title: 'EC名称',
						width: "220px",
					},
					{
						field: "CountNum",
						title: '排除量',
						width: "150px"
					},
					{
						field: "CriteriaDescription",
						title: 'EC描述',
						width: "150px"
					},
					{
						title: '操作',
						width: "150px",
						template: function(dataItem) {
							$('.table_title div:nth-child(2) span').text(dataItem.Total + '笔')
							$('.table_title div:nth-child(3) span').text(common.numFormt(dataItem.totalMoney) + '元')
							//$('.table_title div:nth-child(3) span').text(dataItem.totalMoney)
							var Url = 'ecFiltrateResultDetails.html?DimECID=' + dataItem.DimECID + '&PoolId=' + PoolId;
							var html = '<div><a style="color: #45569c;" href="{0}">查看明细</a>'.format(Url);
							html += '</div>';
							return html;
						}
					}
				]
			},
			dataSourceOptions: {
				pageSize: 20,
				params: params,
				otherOptions: {
					orderby: "DimPoolId",
					direction: "asc",
					defaultfilter: '',
					appDomain: PoolDBName,
					executeParamType: 'extend',
					executeParam: function() {
						var result = {
							SPName: 'dbo.usp_GetAllECResult',
							SQLParams: [{
								Name: 'PoolId',
								Value: 11,
								DBType: 'int'
							}]
						};
						return result;
					}
				}
			}
		});
		kendouGrid.RunderGrid();
		$("#loading").hide();
	}
	$(window).resize(function () {
        var a = $(window).height() - 73;
        if ($("#modal-win", window.parent.document).hasClass("icon icon-window-restore")) {
            a -= 40;
        }
        $("#grid").height(a);
        $("#grid").children(".k-grid-content").height(a - 75)
        $("#grid").children(".k-grid-content-locked").height(a - 75)
    })
    $(window).resize()
});