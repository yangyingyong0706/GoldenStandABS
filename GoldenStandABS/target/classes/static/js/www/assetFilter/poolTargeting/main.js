/// <reference path="E:\TFS-Local\SFM\Products\PoolCut\PoolCut\Scripts/jquery-1.7.2.min.js" />
/// <reference path="E:\TFS-Local\SFM\Products\PoolCut\PoolCut\Scripts/App.Global.js" />
/// <reference path="E:\TFS-Local\SFM\Products\PoolCut\PoolCut\Scripts/PoolCutCommon.js" />
var PoolCutPurpose = 'targeting';

var PoolId;
var PoolHeader;
var TaskCodes = { 'PoolTargetParent': 'PoolTargetParentInit', 'PoolTargetChild': 'PoolTargetChildInit', '6': 'PoolTargetChildInit' };//task codes for create subpool and make pool salable
let titleText = '';
define(function (require) {

    var $ = require('jquery');
    //require('jquery-ui');
    var GlobalVariable = require('gs/globalVariable');
    var common = require('gs/uiFrame/js/common');
    require('app/components/assetPoolList/js/PoolCut_Interface');
    var Vue = require('Vue');
    require("app/projectStage/js/project_interface");
    var ECPreviewControl = require('app/assetFilter/js/ecPreviewControl');
    //var gsAdmin = require('gs/uiFrame/js/gs-admin-2.pages');
    var webStorage = require('gs/webStorage');
    var louti = require('app/assetFilter/js/stairsNavgation')
    louti.bindStairsNavgation()
    $('body').show();
    $(function () {
        PoolId = common.getQueryString('PoolId');
        PoolCutPurpose = common.getQueryString('ActionPoolType');
        if (!PoolId || isNaN(PoolId)) {
            alert('PoolId is required!');
            return;
        }

        BindingPoolInfo(PoolId);
        new Vue(ECPreviewControl);
        //增加toggle箭头
        $(document).on('click', " .desc-wraper", function (e) {
            e.stopPropagation();
            if ($(e.target).is(".desc-wraper>.virtual-label>.virtual-checkbox") || $(e.target).is(".desc-wraper>.virtual-label>.virtual-checkbox>.virtual-icon") || $(e.target).is(".desc-wraper>.virtual-label>.org-checkbox")) {
                return;
            };
            $(this).find("i.fa").toggleClass("fa-angle-down fa-angle-up");
            $(this).parent(".btns-wraper").next().slideToggle(300);
            $(this).next().slideToggle(300);

        })
    });

    function BindingPoolInfo(poolId) {
        var executeParam = { SPName: 'config.usp_GetPoolHeaderById', SQLParams: [] };
        executeParam.SQLParams.push({ Name: 'PoolId', Value: poolId, DBType: 'int' });

        var executeParams = encodeURIComponent(JSON.stringify(executeParam));
        var serviceUrl = GlobalVariable.PoolCutServiceURL + 'CommonGet?connName=DAL_SEC_PoolConfig&exeParams=' + executeParams;

        CallWCFSvc(serviceUrl, false, 'GET', function (data) {
            var poolHeader = data[0];
            $('.poolDetail').each(function (i, v) {
                var $this = $(this);
                var proName = $this.attr('data-name');
                if (proName && poolHeader[proName])
                    $this.text(poolHeader[proName]);
            });

            TargetSqlConnection = poolHeader.TargetSqlConnection;
            webStorage.setItem("TargetSqlConnection", poolHeader.TargetSqlConnection);

            PoolHeader = poolHeader;
            var html = { 'PoolTargetParent': '创建目标化资产池', 'PoolTargetChild': '创建子资产池', '6': '销售资产池' };
            //var html = { '4': '创建目标化资产池', '5': '创建子资产池', '6': '销售资产池' };
            $('#spanPageTitle, #btnRunTask').html(html[PoolCutPurpose]);
            titleText = common.getQueryString("ActionPoolType");
            $('iframe[id="trustList"]', window.document).load(function () {
                //产品列表加载完之后,切换回资产池列表assetPoolList进行加载
                viewModel.changeShowId(viewModel.tabs()[0]);
            });
            
        });
    }
})
