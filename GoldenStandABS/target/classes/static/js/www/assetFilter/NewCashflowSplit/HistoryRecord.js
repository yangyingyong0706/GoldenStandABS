define(function(require) {
	var $ = require('jquery');
	var GlobalVariable = require('globalVariable');
	var common = require('common');
	require('gs/renderControl');
	var taskIndicator = require('gs/taskProcessIndicator');
	var sVariableBuilder = require('gs/sVariableBuilder');
	var GSDialog = require("gsAdminPages");
	var rk = common.getQueryString('rk');
	var entry = common.getQueryString('entry');
	var kendoGridModel = require('gs/Kendo/kendoGridModel');
	require("kendomessagescn");
    require("kendoculturezhCN");
	require("bootstrap");
	require("ischeck");
	var showMore = false;
	var webStorage = require('gs/webStorage');
	var self = this;
	self.getStringDate = common.getStringDate;
	
	var height = $(window).height() - 40;
	var kendouiGrid = new kendoGridModel(height);
	kendouiGrid.Init({
		renderOptions: {
		    columns: [{
				field: "HEinfoH",
				title: '首期规则',
				width: "100px"
            }, {
				field: "HEinfoE",
				title: '尾期规则',
				width: "100px",
				attributes: {
					style: 'text-align:left'
				}
            }, {
                field: "HEinfoStep",
                title: '计算规则',
                width: "100px"
            }, {
                field: "assettype",
                title: '资产类型',
                width: "130px"
            }, {
                field: "Operater",
                title: '操作者',
                width: "100px"
            }, {
				template: '#=CreateTime?self.getStringDate(CreateTime).dateFormat("yyyy-MM-dd"):""#',
				title: '时间',
				width: "100px",
				attributes: {
					style: 'text-align:left'
				}
			}, {
				template: function(dataItem) {
					let desPath = dataItem.desPath;
					let index = desPath.lastIndexOf('\\');
					desPath = desPath.substring(index + 1, desPath.length)
					let downloadUrl = `/PoolCut/Files/RequireField/${desPath}`
					var html = '<div><a style="color: #337ab7;" href="{0}">获取记录下载</a>'.format(downloadUrl);
					html += '</div>';
					return html;
				},
				title: '下载',
				width: "100px"
			}]
		},
		dataSourceOptions: {
			pageSize: 20,
			otherOptions: {
				orderby: "id desc",
				direction: "asc",
				DBName: 'TrustManagement',
				appDomain: 'TrustManagement',
				defaultfilter: '',
				executeParam: function() {
					var result = {
						SPName: 'usp_GetMarkExcelAndExportHistory',
						SQLParams: [{
							Name: 'tableOrView',
							value: 'TrustManagement.tblMarkExcelAndExportHistory',
							DBType: 'string'
						}, ]
					};
					return result;
				}
			}
		}
	});
	$(function() {
		kendouiGrid.RunderGrid();
		refreshKendouGrid = function() {
			kendouiGrid.RefreshGrid();
		}
	});
	/*app = new vue({
		el: '#app',
		data: {
			
		},
		watch: {
			
		},
		mounted: function() {
			
		},
		methods: {
			
		}
	})*/
});