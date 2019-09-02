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
	var DimECID = common.getQueryString('DimECID');
	var Query = '';
	var flcDimTrustId = '';
	var PoolDBName;
	var poolHeader;
	var ComperPoolbase;
	var Parameter = []; //存放校验结果表里的字段匹配
	var poolfilter = 1;
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
		})
		$('#back').click(function() {
			window.history.go(-1)
		})
		GetXMLSqlQueryDrillThrough();
		initKendouGridByPoolId(PoolDBName);
	})

	function GetXMLSqlQueryDrillThrough() {
	    var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonExecuteGet?',
			appDomain = PoolDBName;
		var executeParam = {
			'SPName': "dbo.GetXMLSqlQueryDrillThrough",
			'SQLParams': [{
				'Name': 'PoolId',
				'Value': PoolId,
				'DBType': 'int'
			}, {
				'Name': 'DimEcId',
				'Value': DimECID,
				'DBType': 'int'
			}]
		};
		common.ExecuteGetData(false, svcUrl, appDomain, executeParam, function(data) {
			var xmlString = data[0].XMLSqlQueryDrillThrough;
			xmlString = $.parseXML(xmlString);
			Query = $(xmlString).find('Query').text()
			getParamerter(Query);//得到匹配的中英文字段表
            console.log(Parameter);
			Query = Query.replace(/\s+/g,"");
		});
	}
	function getParamerter(query) {
	    var select = query.split(/\bselect\b/i);
	    var from = select[1].split(/\bfrom\b/i)
	    var str = from[0].split(',');

	    for (var i = 0; i < str.length ; i++) {
	        var as = str[i].split(/\bas\b/i);
	        Parameter[i] = [as[0].replace(/\s+/g, ""), as[1].replace(/\s+/g, "")];
	    }
	}
	function getFlcDimTrustId() {
		var index = Query.indexOf('DimTrustId')
		var myString = Query.substring(6, index);
		return myString;
	}

	function initKendouGridByPoolId(PoolDBName) {
		var height = $(window).height() - 90; //460;
		kendouGrid = new kendoGridModel(height);
		kendouGrid.Init({
			renderOptions: {
				reorderable: false,
				columns: []
			},
			dataSourceOptions: {
				pageSize: 20,
				params: params,
				otherOptions: {
				    orderby: getFlcDimTrustId() + 'DimTrustId',
					direction: "asc",
					defaultfilter: '',
					appDomain: PoolDBName,
					executeParamType: 'extend',
					executeParam: function() {
						var result = {
							SPName: 'dbo.usp_getXMLSqlQueryDrillThroughforData',
							SQLParams: [{
								Name: 'OrganisationId',
								Value: PoolDBName.split('_')[1],
								DBType: 'int'
							},{
								Name: 'DateId',
								Value: PoolDBName.split('_')[2],
								DBType: 'int'
							},{
								Name: 'PoolId',
								Value: PoolId,
								DBType: 'int'
							},{
								Name: 'DimEcId',
								Value: DimECID,
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