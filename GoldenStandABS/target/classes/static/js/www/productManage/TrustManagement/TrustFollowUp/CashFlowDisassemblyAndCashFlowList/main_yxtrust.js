
define(function (require) {
    var $ = require('jquery');
    var GlobalVariable = require('globalVariable');
    var common = require('common');
    require('jquery.datagrid');
    require('jquery.datagrid.options');
    //require("kendomessagescn");
    //require("kendoculturezhCN");
    var FormatNumber = require('gs/format.number');
    var webProxy = require('gs/webProxy');
    var accountNo = common.getQueryString('accountNo');
    var kendoGridModel = require('app/productManage/TrustManagement/TrustFollowUp/CashFlowDisassemblyAndCashFlowList/kendoGridModel');
    var GSDialog = require('gs/uiFrame/js/gs-admin-2.pages')
    var self = this;
    var trustId = common.getQueryString('TrustId');
    var TrustCode = common.getQueryString('TrustCode');
    var height = $(window).height();
    console.log(height);
    var h = screen.height - 250;
    var filter = null;
    this.CashFlowResult = function (hasdata) {
        var hasdatasStatus;
        switch (hasdata) {
            case 1:
                hasdatasStatus = '<button type="button" class="btn normal_small_button btnResults" style="font-size:13px" id="btnResults">查看结果</button>&nbsp&nbsp<button type="button" class="openImportTrustAsset btn normal_small_button" style="font-size:13px" id="openImportTrustAsset">再次拆分</button>';
                break;
            case 0:
                hasdatasStatus = '无结果&nbsp&nbsp<button type="button" class="btn normal_small_button openImportTrustAsset" style="font-size:13px" id="openImportTrustAsset">再次拆分</button>';
                break;
                //default:
                //    hasdatasStatus = '';
                //    break;
        }
        return hasdatasStatus;
    }
    $(function () {
        //现金流拆分、归集与现金流一览
        kendo.culture("zh-CN");
        var AssetAggregationStatsForTrust = new kendoGridModel(height);

        var CashFlowPoolListOptions = {
            renderOptions: {
                height: height,
                columns: [
                            { field: "enddate", title: '归集日', template: '#=enddate?getStringDate(enddate).dateFormat("yyyy-MM-dd"):""#', headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                           , { field: "hasdata", title: '是否有拆分结果', template: "#=this.CashFlowResult(hasdata)#", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                ]
            }
               , dataSourceOptions: {
                   pageSize: 20
                   , otherOptions: {
                       orderby: "enddate"
                       , direction: ""
                       , DBName: 'TrustManagement'
                       , appDomain: 'TrustManagement'
                       , executeParamType: 'extend'
                       , defaultfilter: filter
                       , executeParam: function () {
                           var result = {
                               SPName: 'usp_GetAssetAggregationStatsForTrust',
                               SQLParams: [
                                   {
                                       Name: 'trustId', Value: trustId, DBType: 'int',
                                   }
                               ],
                               //把TrustCode传到kendoGridModel里
                               TrustCode: TrustCode
                           };
                           return result;
                       }
                   }
               },


        };
        //初始化相关资产池
        AssetAggregationStatsForTrust.Init(CashFlowPoolListOptions);
        AssetAggregationStatsForTrust.RunderGrid();







    });
});