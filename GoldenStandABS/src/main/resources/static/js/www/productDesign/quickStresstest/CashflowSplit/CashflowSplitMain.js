/// <reference path="../../../components/CashflowSplit/CashflowSplit.html" />
var viewModel = {};
define(function (require) {
    var $ = require('jquery');
    var GlobalVariable = require('globalVariable');
    var common = require('common');
    var taskIndicator = require('gs/taskProcessIndicator');
    var sVariableBuilder = require('gs/sVariableBuilder');
    var Vue = require('Vue');
    var webProxy = require('gs/webProxy');
    require('jquery.ztree.core');
    require('jquery.ztree.excheck');
    require('jquery.ztree.exedit');
    var kendoGridModel = require('app/productDesign/js/kendoGridModel');
    var GSDialog = require('gsAdminPages');
    var webStore = require('gs/webStorage');
    var tm = require('gs/parentTabModel');
    var TrustId = common.getQueryString('tid');
    var schedulePurpose = common.getQueryString('schedulePurpose') ? common.getQueryString('schedulePurpose') : 0;//0-表示拆分工具
    var scheduleDateId = common.getQueryString('scheduleDate') ? common.getQueryString('scheduleDate') : getCurrentDate();
    var TrustCode = '';
    var svcUrlTrustManagement = GlobalVariable.DataProcessServiceUrl + "CommonGetExecute?connConfig=TrustManagement&";
    var assetTree = null;
    var vm;
    var kendouGrid;
    var self = this;
    var step = common.getQueryString('step');
    $(function () {
        initData();
        reisterEvent();
        storageUnfoldRule();
        initReportDate();
        initTreeAsset();
        TrustCode = getTrustCodeByTrustId(TrustId);

        //tabModel = new tm();
        //viewModel = tabModel.init();
    });

    function reisterEvent() {
        //$('#show-options-btn').click(function () {
        //    var $this = $(this);
        //    $('#more-options').slideToggle(200, function () {
        //        if ($(this).is(":visible")) {
        //            $this.css('background', '#f8f8f8').find('i').text('▲');
        //        } else {
        //            $this.css('background', '#fff').find('i').text('▼');
        //        }
        //    });
        //});
        //$('#PeriodsCalRule').on('change', function () {
        //    var value = $(this).val(), $Direction = $('#Direction');
        //    if (value == 0) {
        //        $Direction.html(
        //            '<option value="1">从资产到期日开始往前推算，资产到期日到前一还款日的区间作为单独一期</option>' +
        //            '<option value="2">从资产到期日开始往前推算，资产到期日到前一还款日的区间不作为单独一期</option>' +
        //            '<option value="3">从资产到期日开始往前推算，资产到期日所在月的还款日为最后一期还款日</option>'
        //        );
        //    } else {
        //        $Direction.html(
        //            '<option value="1">以导入剩余期数（remaining term）为准，从下一个还款日开始往后推算</option>'
        //        );
        //    }
        //});
        //$('#CalculateRTBySystem').on('change', function () {
        //    var $RTCalculationRuleOptions = $('#RTCalculationRule-Options');
        //    if ($(this).is(':checked')) {
        //        $RTCalculationRuleOptions.show();
        //    } else {
        //        $RTCalculationRuleOptions.hide();
        //    }
        if (step == "3") {
            $('#btnSplit')[0].innerHTML = "新拆分与归集"
            $('#btnSplit').on('click', function () {
                var page = '';
                if (vm.selected != undefined && vm.poolIds != undefined) {
                    if (vm.selected != '' && vm.poolIds != '') {
                        operationType = 3;
                        page = webProxy.baseUrl + '/GoldenStandABS/www/components/NewCashflowSplit/NewCashflowSplit.html?TrustId={0}&TrustCode={1}&ScheduleDateId={2}&DimReportingDateId={3}&PoolIds={4}&OperationType={5}&schedulePurpose={6}';
                        page = page.format(TrustId, TrustCode, scheduleDateId, vm.selected.replace(/-/g, ''), vm.poolIds, operationType, schedulePurpose)
                    } else if (vm.selected != '' && vm.poolIds == '') {
                        operationType = 1;
                        page = webProxy.baseUrl + '/GoldenStandABS/www/components/NewCashflowSplit/NewCashflowSplit.html?TrustId={0}&TrustCode={1}&ScheduleDateId={2}&DimReportingDateId={3}&OperationType={4}&schedulePurpose={5}';
                        page = page.format(TrustId, TrustCode, scheduleDateId, vm.selected.replace(/-/g, ''), operationType, schedulePurpose)
                    } else if (vm.poolIds != '' && vm.selected == '') {
                        operationType = 2;
                        page = webProxy.baseUrl + '/GoldenStandABS/www/components/NewCashflowSplit/NewCashflowSplit.html?TrustId={0}&TrustCode={1}&ScheduleDateId={2}&PoolIds={3}&OperationType={4}&schedulePurpose={5}&rk=3';
                        page = page.format(TrustId, TrustCode, scheduleDateId, vm.poolIds, operationType, schedulePurpose)
                    } else {
                        GSDialog.HintWindow('请先选择资产池');
                        return;
                    }
                } else {
                    GSDialog.HintWindow('请先选择资产池');
                    return;
                }


                var schedulePurposeKey = TrustId + '_SchedulePurpose';
                var scheduleDateIdKey = TrustId + '_ScheduleDateId';
                webStore.removeItem(schedulePurposeKey);
                webStore.removeItem(scheduleDateIdKey);
                webStore.setItem(schedulePurposeKey, schedulePurpose);
                webStore.setItem(scheduleDateIdKey, scheduleDateId);

                if (TrustId) {
                    if (schedulePurpose && schedulePurpose == 1) {
                        openNewIframe(page, TrustId + '_Newcashflowsplit', '新现金拆分: ' + TrustId, parent.parent.viewModel);
                    }
                    else {
                        openNewIframe(page, TrustId + '_Newcashflowsplit', '新现金拆分: ' + TrustId, parent.parent.parent.viewModel);
                    }

                }
            });
        } else {
            $('#btnSplit').on('click', function () {
                var page = '';
                if (vm.selected != undefined && vm.poolIds != undefined) {
                    if (vm.selected != '' && vm.poolIds != '') {
                        operationType = 3;
                        page = webProxy.baseUrl + '/GoldenStandABS/www/components/CashflowSplit/CashflowSplit.html?TrustId={0}&TrustCode={1}&ScheduleDateId={2}&DimReportingDateId={3}&PoolIds={4}&OperationType={5}&schedulePurpose={6}';
                        page = page.format(TrustId, TrustCode, scheduleDateId, vm.selected.replace(/-/g, ''), vm.poolIds, operationType, schedulePurpose)
                    } else if (vm.selected != '' && vm.poolIds == '') {
                        operationType = 1;
                        page = webProxy.baseUrl + '/GoldenStandABS/www/components/CashflowSplit/CashflowSplit.html?TrustId={0}&TrustCode={1}&ScheduleDateId={2}&DimReportingDateId={3}&OperationType={4}&schedulePurpose={5}';
                        page = page.format(TrustId, TrustCode, scheduleDateId, vm.selected.replace(/-/g, ''), operationType, schedulePurpose)
                    } else if (vm.poolIds != '' && vm.selected == '') {
                        operationType = 2;
                        page = webProxy.baseUrl + '/GoldenStandABS/www/components/CashflowSplit/CashflowSplit.html?TrustId={0}&TrustCode={1}&ScheduleDateId={2}&PoolIds={3}&OperationType={4}&schedulePurpose={5}';
                        page = page.format(TrustId, TrustCode, scheduleDateId, vm.poolIds, operationType, schedulePurpose)
                    } else {
                        GSDialog.HintWindow('请先选择资产池');
                        return;
                    }
                } else {
                    GSDialog.HintWindow('请先选择资产池');
                    return;
                }


                var schedulePurposeKey = TrustId + '_SchedulePurpose';
                var scheduleDateIdKey = TrustId + '_ScheduleDateId';
                webStore.removeItem(schedulePurposeKey);
                webStore.removeItem(scheduleDateIdKey);
                webStore.setItem(schedulePurposeKey, schedulePurpose);
                webStore.setItem(scheduleDateIdKey, scheduleDateId);

                if (TrustId) {
                    if (schedulePurpose && schedulePurpose == 1) {
                        openNewIframe(page, TrustId + '_cashflowsplit', '现金拆分: ' + TrustId, parent.parent.viewModel);
                    }
                    else {
                        openNewIframe(page, TrustId + '_cashflowsplit', '现金拆分: ' + TrustId, parent.parent.parent.viewModel);
                    }

                }
            });

        }
        $('#btnViewResult').on('click', function () {
            var url = GlobalVariable.TrustManagementServiceHostURL + 'productDesign/stresstest/CashflowSplit/ViewResult.html?tid=' + TrustId;
            url += '&schedulePurpose=' + schedulePurpose;
            if (vm.selected) url += '&reportingDateId=' + vm.selected.replace(/-/g, '');
            url += '&scheduleDateId=' + scheduleDateId;
            if (vm.asset && vm.asset.length > 0) {
                var res = '';
                vm.asset.forEach(function (v) { res += v.id + ',' + v.dimreportingdateid + '|'; });
                url += '&poolIds=' + res.substring(0, res.length - 1);
            }
            GSDialog.open('查看结果', url, null, function () { }, 1000, 540);
        });
    }

    // 缓存拆分规则
    function storageUnfoldRule() {
        if (window.localStorage) {
            var splitOptions = localStorage.getItem('splitOptions');
            if (splitOptions) {
                splitOptions = JSON.parse(splitOptions);
                $.each(splitOptions, function (k, v) {
                    var obj = $('#' + k);
                    if (obj[0]) {
                        if (obj[0].tagName.toLowerCase() == 'input') {
                            var type = obj.attr('type');
                            if (type == 'radio') {
                                $("input[name='" + k + "'][value='" + v + "']").prop('checked', true);
                            } else {
                                obj.prop('checked', (v === '1') ? true : false);
                                if (k === 'CalculateRTBySystem') {
                                    if (v == '1') {
                                        obj.trigger('change');
                                    }
                                }
                            }
                        } else {
                            obj.val(v);
                            if (k === 'PeriodsCalRule') {
                                if (v == '1') {
                                    obj.trigger('change');
                                }
                            }
                        }
                    }
                });
            }
        }
    }

    //初始化报告日期
    function initReportDate() {
        var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
        var executeParam = { SPName: 'usp_GetSelectedFactLoanDate', SQLParams: [] };
        executeParam.SQLParams.push({ Name: 'TrustId', Value: TrustId, DBType: 'int' });
        
        executeParams = encodeURIComponent(JSON.stringify(executeParam));
        $.ajax({
            cache: false,
            type: "GET",
            async: false,
            url: svcUrl + 'appDomain=dbo&executeParams=' + executeParams,
            dataType: "json",
            contentType: "application/xml;charset=utf-8",
            data: {},
            success: function (response) {
                if (typeof response === 'string') { sourceData = JSON.parse(response); }
                else { sourceData = response; }

                vm.selected = sourceData[0] != undefined && sourceData[0].SelectedDate != undefined ? sourceData[0].SelectedDate : "";
                if (vm.selected) vm.selectAsset();//初始化默认基础池的资产明细grid
            },
            error: function (response) { alert('Error occursed while requiring the remote source data!'); }
        });

        executeParam = { SPName: 'usp_GetFactLoanDate', SQLParams: [] };
        executeParam.SQLParams.push({ Name: 'TrustId', Value: TrustId, DBType: 'int' });
        var executeParams = encodeURIComponent(JSON.stringify(executeParam));
        $.ajax({
            cache: false,
            type: "GET",
            async: false,
            url: svcUrl + 'appDomain=dbo&executeParams=' + executeParams,
            dataType: "json",
            contentType: "application/xml;charset=utf-8",
            data: {},
            success: function (response) {
                var sourceData;
                if (typeof response === 'string') { sourceData = JSON.parse(response); }
                else { sourceData = response; }
                vm.source = sourceData;
                vm.source.splice(0, 0, { ReportingDate: vm.tip });//加入一个空选项
            },
            error: function (response) { alert('Error occursed while requiring the remote source data!'); }
        });
    }
    //获取站位列的宽度
    self.disw = function(a, b, c, d, e, f, g, x, y) {
        if (a == undefined) a = 0;
        if (b == undefined) b = 0;
        if (c == undefined) c = 0;
        if (d == undefined) d = 0;
        if (e == undefined) e = 0;
        if (f == undefined) f = 0;
        if (g == undefined) g = 0;
        if (x == undefined) x = 0;
        if (y == undefined) y = 0;
        var w = $("#grid").width();
        disw = w - a - b - c - d - e - f - g - x - y - 21;
        return disw;
    }
    //初始化资产明细kendougrid
    function initKendouGridByPoolId(dimreportingdateid, poolid) {
        vm.selPoolId = poolid;
        var height = $('body', window.top.frames[0].document).height() - 275;
        var filter = "where DimSourceTrustID = " + TrustId + " and ParentPoolId=0";
        //资产明细列表
        kendouGrid = new kendoGridModel(height);
        kendouGrid.Init({
            renderOptions: {
                //scrollable: true,
                //rowNumber: true,
                 columns: [
                            //{ template: '#=ReportingDate?vm.getStringDate(ReportingDate).dateFormat("yyyy-MM-dd"):""#', filterable: false, sortable: false, title: '报告日', width: "12%", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                            { field: "AccountNo", title: '合同编号', width: "150px"}
                            //, { field: "CustomerName", title: '债务人名称', width: "150px" }
                            , { field: "StartDate", title: '开始日', template: '#=StartDate?self.getStringDate(StartDate).dateFormat("yyyy-MM-dd"):""#', width: "180px" }
                            , { field: "EndDate", title: '到期日', template: '#=EndDate?self.getStringDate(EndDate).dateFormat("yyyy-MM-dd"):""#', width: "180px" }
                            , { field: "InterestRate", title: '利率（%）', width: "150px" }
                            , { field: "CurrentPrincipalBalance", title: '本金余额（元）', width: "150px" }
                            //, { field: "status", title: '状态', width: "90px" }
                            , { field: "IsInTrust", title: '是否入池', template: '#=IsInTrust?"是":"否"#', width: "120px" }
                            , { field: "PrincipalPaymentType", title: '还本付息方式', width: "150px" }
                            , { title: '操作', template: '#=self.getOperate(TrustId,AccountNo)#', width: "100px" }
                            , { field: "", title: "",width:"auto" }
                ]
            }
            , dataSourceOptions: {
                pageSize: 20
                , otherOptions: {
                    orderby: "AccountNo"
                    , direction: ""
                    , DBName: 'TrustManagement'
                    , appDomain: 'TrustManagement'
                    , executeParamType: 'extend'
                    , executeParam: function () {
                        var result = {
                            SPName: 'usp_GetAssetsForPool', SQLParams: [
                                { Name: 'TrustId', Value: TrustId, DBType: 'int' },
                                { Name: 'PoolId', Value: poolid, DBType: 'int' },
                                { Name: 'DimReportingDateId', Value: dimreportingdateid, DBType: 'int' }
                            ]
                        };
                        //if (typeof getPayDate() != "undefined")
                        //    result.SQLParams.push({ Name: 'payDate', Value: (getPayDate()) ? getPayDate() : null, DBType: 'string' });
                        return result;
                    }
                }
            }
        });
        kendouGrid.RunderGrid();
    }
    self.getStringDate = function (strDate) {
        //var str = '/Date(1408464000000)/';
        if (!strDate) {
            return '';
        }
        var str = strDate.replace(new RegExp('\/', 'gm'), '');
        return eval('new ' + str);
    };
    self.getOperate = function (tid, accountno) {
        var viewPageUrl = GlobalVariable.TrustManagementServiceHostURL + 'productManage/TrustManagement/TrustFollowUp/AssetPayMentSchedule/AssetPaymentSchedule.html?trustId=' + tid + '&accountNo=' + accountno + '&poolId=' + vm.selPoolId;
        var html = '<a href="javascript: self.showDialogPage(\'' + viewPageUrl + '\',\'资产现金流\',1000,500,function(){},true);">现金流</a>';
        return html;
    };
    self.showDialogPage = function (url, title, width, height, fnCallBack, scrolling) {
        common.showDialogPage(url, title, width, height, fnCallBack, scrolling);
    }

    //初始化已选中资产池区域
    function initData() {
        vm = new Vue({
            el: '#app',
            data: {
                source: [],//基础资产日期选项数据源
                selected: '',//选中的基础资产日期
                asset: [],//资产池选项数据源
                poolIds: '',//ztree中所有勾选的资产池
                isSplit: true,//是否已经拆分
                tip: '',
                selPoolId:-1 //当前选中的PoolId
            },
            methods: {
                //已选资产池选中事件
                selectAsset: function (dimreportingdateid, poolid) {
                    var _this = this;
                    if (event.target.tagName.toLowerCase()=='div') {
                        $(event.target).addClass('btn-active').siblings().removeClass('btn-active');
                        $(event.target).parent().siblings().children().removeClass('btn-active');
                    }
                    poolid = poolid ? poolid : -1;//资产池传入对应poolid,不传表示基础池为-1（对接存储过程）
                    dimreportingdateid = dimreportingdateid ? dimreportingdateid : vm.selected.replace(/-/g, '');
                    if (_this.isSplit) {
                        initKendouGridByPoolId(dimreportingdateid,poolid);
                    } else {
                        GSDialog.HintWindow('请先进行拆分与归集');
                    }
                }
            }
        })
    }

    //初始化多选资产池下拉
    function initTreeAsset() {
        assetTree = new zTreeObj();
        var assetList = getAssetData();
        var assetNodes = [], tmpCode = [];
        $.each(assetList, function (i, n) {
            if ($.inArray(n.poolid, tmpCode) < 0) {
                assetNodes.push({ id: n.poolid,dimreportingdateid:n.DimReportingDateID, pId: 0, name: n.poolid + '：' + n.PoolDescription });
                tmpCode.push(n.poolid);
            }
        });
        sortData(assetNodes, 'name', 'desc');
        assetTree.Init('treeAsset', assetNodes, $('#menucontentasset'));
        $("#assetSelect").bind("click", assetTree.ShowMenu).attr('readonly', 'readonly');
    }

    /*******zTree，下拉树生成方法*******/
    function zTreeObj() {
        var treeDomId, $mySelfDom, $menuContent;
        function getMySelfDom() {
            return $mySelfDom;
        }
        var setting = {
            check: {
                enable: true,
                chkboxType: {
                    "Y": "", "N": ""
                }
            },
            view: {
                dblClickExpand: false
            },
            data: {
                simpleData: {
                    enable: true
                }
            },
            callback: {
                beforeClick: beforeClick,
                onCheck: onCheck
            }
        };

        function beforeClick(treeId, treeNode) {
            var zTree = $.fn.zTree.getZTreeObj(treeDomId);
            zTree.checkNode(treeNode, null, null, true);
            return false;
        }

        function onCheck(e, treeId, treeNode) {
            var zTree = $.fn.zTree.getZTreeObj(treeDomId),
            nodes = zTree.getCheckedNodes(true),
            v = "";
            vm.asset = []; //清空数组
            for (var i = 0, l = nodes.length; i < l; i++) {
                v += nodes[i].id + ",";
                if ($.inArray(nodes[i], vm.asset) < 0) {
                    vm.asset.push(nodes[i]);
                }
            }
            if (v.length > 0) v = v.substring(0, v.length - 1);
            vm.poolIds = v.trim();
            var cityObj = $mySelfDom;
            cityObj.prop("value", v);
        }

        function showMenu() {
            $mySelfDom = $(event.target);
            var cityObj = $mySelfDom;
            var cityOffset = $mySelfDom.offset();
            $menuContent.css({ left: cityOffset.left + "px", top: cityOffset.top + cityObj.outerHeight() + "px" }).slideDown("fast");

            $("body").bind("mousedown", onBodyDown);
        }
        function hideMenu() {
            $menuContent.fadeOut("fast");
            $("body").unbind("mousedown", onBodyDown);
        }
        function onBodyDown(event) {
            if (!(event.target.id == "menuBtn" || event.target.id == $mySelfDom.attr('id') || event.target.id == $menuContent.attr('id') || $(event.target).parents("#" + $menuContent.attr('id')).length > 0)) {
                hideMenu();
            }
        }
        function checkedAllNodes(checked) {
            var treeObj = $.fn.zTree.getZTreeObj(treeDomId);
            treeObj.checkAllNodes(checked);
        }
        function init(treeDemoId, zNodes, menuContent) {
            treeDomId = treeDemoId;
            $menuContent = menuContent;
            $.fn.zTree.init($("#" + treeDomId), setting, zNodes);
        }

        return {
            Init: init
            , ShowMenu: showMenu
            , CheckedAllNodes: checkedAllNodes
        }
    }
    /**********************************/

    //获取资产池下拉树的数据
    function getAssetData() {
        var executeParam = {
            SPName: 'usp_GetRelatedPools', SQLParams: [
                { Name: 'TrustId', value: TrustId, DBType: 'int' }
            ]
        };
        var result = common.ExecuteGetData(false, svcUrlTrustManagement, 'TrustManagement', executeParam);
        return result;
    }

    //数组排序
    function sortData(datalist, column, ascOrDesc) {
        ascOrDesc = ascOrDesc ? ascOrDesc : 'asc';
        ascOrDesc = ascOrDesc == 'asc' ? [1, -1] : [-1, 1];
        datalist = datalist.sort(function (b, a) {
            return a[column] > b[column] ? ascOrDesc[0] : ascOrDesc[1];
        });
    }

    //根据trustid获取trustcode
    function getTrustCodeByTrustId(trustid) {
        var executeParam = {
            SPName: 'usp_GetTrustInfo', SQLParams: [
                { Name: 'trustId', value: trustid, DBType: 'int' }
            ]
        };

        var result = common.ExecuteGetData(false, svcUrlTrustManagement, 'TrustManagement', executeParam);

        var res = ''
        if (result.length > 0) {
            result.forEach(function (v, i) {
                if (v.ItemCode == 'TrustCode') {
                    res = v.ItemValue;
                    return;
                }
            });
        }
        return res;
    }

    //获取当前时间
    function getCurrentDate() {
        var currentDate = '';
        var now = new Date();
        var y = now.getFullYear();
        var m = (now.getMonth() + 1 < 10) ? '0' + (now.getMonth() + 1) : (now.getMonth() + 1);
        var d = now.getDate() < 10 ? '0' + now.getDate() : now.getDate();
        currentDate = y + '' + m + '' + d;
        return currentDate;
    }

    //yyyyMMdd转成指定形式，如yyyy-MM-dd
    function changeToDate(spe, strDate) {
        if (strDate.length != 8) {
            return;
        }
        var y = strDate.substring(0, 4);
        var m = strDate.substring(4, 6);
        var d = strDate.substring(6, 8);

        spe = spe.trim();

        return y + spe + m + spe + d;
    }

    function openNewIframe(page, trustId, tabName,viewModel) {
        var pass = true;
        viewModel.tabs().forEach(function (v, i) {
            if (v.id == trustId) {
                pass = false;
                viewModel.changeShowId(v);
                return false;
            }
        })
        if (pass) {
            //parent.viewModel.showId(trustId);
            var newTab = {
                id: trustId,
                url: page,
                name: tabName,
                disabledClose: false
            };
            viewModel.tabs.push(newTab);
            viewModel.changeShowId(newTab);
            //$('.chrome-tabs-shell', parent.document).find('.chrome-tab-current').removeClass('chrome-tab-current');
            //$('.chrome-tabs-shell', parent.document).find('.active').addClass('chrome-tab-current');
        };
    }
});