
function show() {
    var name = 'PoolId'
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    //var r = decodeURI(window.location.search.substr(1)).match(reg);
    var r = window.location.search.substr(1).match(reg);
    var ckdPool = GetCheckedPool();
    console.log(ckdPool)
    if (!ckdPool) {
        GSDialog.HintWindow('请选择要操作的资产池');
    }
    else {
        GSDialog.open('压力测试', '../../stressTesting/stressTesting.html?PoolId=' + decodeURI(r[2]), '', function (result) {
            if (result) {
                //window.location.reload();
            }
        }, 550, 580, '', true, true, true, false);
    }
}
function TranToHtml(index, data, data2) {
    var html;
    switch (index) {
        case 1:
            //html = '<a href="javascript:PoolWebReport({0})">查看</a>'.format(data2) + ' <a href="javascript:downLoadExcel(' + "'" + data + "'" + ')">Excel</a>';
            html = '<a href="javascript:PoolWebReport({0})">查看</a>'.format(data2) + ' <a href ="{0}">Excel</a>'.format(data);
            //var names = data.split('/');
            //var name = names[names.length - 1];
            //downLoadExcelForAsyn(data, name, function (datas) {
            //    html = '<a href="javascript:PoolWebReport({0})">查看</a>'.format(data2) + ' <a download="{0}" href="{1}">Excel</a>'.format(datas.download, datas.href);
            //});
            //html = '<a href="javascript:PoolWebReport({0})">查看</a>'.format(data2) + ' <a download="cheshi.xlsm" href="{0}">Excel</a>'.format(elink.href);
            break;
        case 2:
            html = '<a href="{0}">项目计划书</a>'.format(data);
            break;
        case 3:
            html = '<a href="{0}">拟购买资产池</a>'.format(data);
            break;
        case 4:
            var type = { '4': '资产筛选', '5': '目标化', '6': '额度调整', '7': '刷新池', '9': '出入池', '20240': '合并池', '20268': '已销售池', '20269': '备选池' };
            if (type[data2] == '出入池' || type[data2] == '合并池' || type[data2] == '已销售池' || type[data2] == '备选池') {
                html = '{0}'.format(type[data2]);
            } else {
                html = '<a href="javascript:PoolProcess({0})">{1}</a>'.format(data, type[data2]);
            }

            break;
        case 5:
            var type = { '4': 'Base', '5': 'Parent', '6': 'Child', '7': 'Refresh', '9': 'In-Exclude', '20240': 'Merge', '20268': 'Sold', '20269': 'Alternative' };
            html = '<a>{0}</a>'.format(type[data]);
            break;
    }
    return html;
}
//同步加载文件，字节流
function downLoadExcelForAsyn(filePath, desName, callback) {
    var xmlRequest = new XMLHttpRequest();
    var uriHostInfo = location.protocol + "//" + location.host;
    var url = uriHostInfo + "/GoldenStandABS/service/DataProcessService.svc/jsAccessEP/" + "getStream?" + 'filePath=' + filePath;

    xmlRequest.open("post", url, false);
    xmlRequest.overrideMimeType('application/vnd.ms-excel;charset=x-user-defined');//这里是关键，不然 this.responseText;的长度不等于文件的长度  charset=blob
    xmlRequest.onreadystatechange = function (e) {
        if (this.readyState == 4 && this.status == 200) {
            var text = this.responseText;
            var length = text.length;
            var array = new Uint8Array(length);
            var elink = document.createElement('a');
            //elink.innerHTML = innerText;
            elink.download = desName;

            for (var i = 0; i < length; ++i) {
                array[i] = text.charCodeAt(i);
            }
            var blob = new Blob([array], { "type": "application/octet-stream" });
            elink.href = URL.createObjectURL(blob);
            if (callback) {
                callback(elink);
            }
            //document.getElementById(id).appendChild(elink);
            //img.src = window.URL.createObjectURL(blob);
        }
    }
    xmlRequest.send();
}

var viewModel = {};
var optViewModel;
var datesModel;
//var kendouiGrid;
var refreshKendouGrid;

define(function (require) {
    var $ = require('jquery');
    var ko = require('knockout');
    ko.mapping = require('knockout.mapping');
    //var kendoGridModel = require('app/components/assetPoolList/js/kendoGridModel');
    var kendoGridModel = require('gs/Kendo/kendoGridModel');
    require('app/components/assetPoolList/js/PoolCut_Interface')
    require("kendomessagescn");
    require("kendoculturezhCN");
    require("app/projectStage/js/project_interface");
    var GlobalVariable = require('globalVariable');
    GSDialog = require('gs/uiFrame/js/gs-admin-2.pages');
    require('bootstrap');
    var common = require('gs/uiFrame/js/common')
    var enter = common.getQueryString('enter');
    var hidbt = common.getQueryString('hidbt');
    var gt = require('app/components/assetPoolList/js/assetPoolList_Interface');
    var Vue = require('Vue');
    var webStorage = require('gs/webStorage');
    var lang = {};
    var userLanguage = webStorage.getItem('userLanguage');
    var ShowId = sessionStorage.getItem('showId');
    if (userLanguage && userLanguage.indexOf('en') > -1) {
        lang.sign = 'Identification'
        lang.name = 'Name'
        lang.process = 'Processing components'
        lang.form = 'Report form'
        lang.book = 'project planning paper'
        //lang.list = 'Pooling list'
        lang.createDate = 'Creation date'
        lang.exclude = 'Exclude Pool'
        lang.status = 'status'
        lang.structure = 'structure'
        lang.number = 'Quantity of credit'
        lang.scale = 'scale'
        
        lang.collectionGuide = 'collection guide'
        lang.targetpool = 'Target poolcut'
        lang.marketpool = 'Amount of poolcut adjust'
        lang.presales = 'Generating assets list'
        lang.assetfilter = 'Query Asset'
        lang.assetcontrast = 'Asset Contrast'
        lang.filtrateResult = 'EC filtrate result'
        lang.entryandexit = 'Asset entry and exit'
        lang.mergepool = 'Asset merger'
        lang.disAdjust = 'Distribution adjustment'
        lang.report = 'Asset dimension Report'
        lang.delete = 'Delete'
        lang.refresh = 'Refresh'
        lang.poolpresales = 'Asset pool presales'

        lang.salespool = 'CreateSalesPool'
        lang.alternativepool = 'Create AlternativePool'
        lang.update = 'Asset pool update'
        lang.pack = 'Pack and Unpack'
        lang.sales = 'Asset pool sales'
        lang.paper = 'Project planning paper'
        lang.CashflowManagement = 'CashflowManagement'
        lang.OpenCashflowSelecter = 'CashflowSelecter'
        lang.ReimbursementManagement = 'Reimbursement Management'
        lang.NoPrincipalSplit = 'No Principal Split'   
    } else {
        lang.sign = '标识'
        lang.name = '名称'
        lang.process = '处理组件'
        lang.form = '报表'
        lang.book = '项目计划书'
        //lang.list = '拟购买池列表'
        lang.exclude = '互斥池'
        lang.createDate = '创建日期'
        lang.status = '状态'
        lang.structure = '结构'
        lang.number = '信贷数量'
        lang.scale = '规模'

        lang.collectionGuide = '资产现金流归集向导'
        lang.targetpool = '资产池目标化'
        lang.marketpool = '资产池额度调整'
        lang.presales = '生成资产列表'
        lang.assetfilter = '资产查询'
        lang.assetcontrast = '资产池对比'
        lang.filtrateResult = 'EC筛选结果'
        lang.entryandexit = '资产出入池'
        lang.mergepool = '资产池合并'
        lang.disAdjust = '资产池统计计算'
        lang.report = '资产池维度报告'
        lang.delete = '删除'
        lang.refresh = '刷新'
        lang.poolpresales = '资产池预销售'

        lang.salespool = '生成已销售池'
        lang.alternativepool='生成备选池'
        lang.update = '资产池更新'
        lang.pack = '封包解包'
        lang.sales = '资产池销售'
        lang.paper = '项目计划书'
        lang.CashflowManagement = '计划现金流拆分'
        lang.OpenCashflowSelecter = '资产现金流拼接'
        lang.ReimbursementManagement = '回款现金流管理'
        lang.NoPrincipalSplit='信用卡抛帐拆分'
    }
    var Permission = require('gs/permission');

    var height = $(window).height() - 110;
    var SQLParams = [];
    var SPName = [];
    if (enter == 'projectManage') {
        var TrustId = common.getQueryString('tid');
        var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecuteForPool?',
            executeParam = {
                SPName: "config.usp_getTrustCodeFromTrustId",
                SQLParams: [
                    { 'Name': 'TrustId', 'Value': parseInt(TrustId), 'DBType': 'int' }
                ]
            };
        common.ExecuteGetData(false, svcUrl, 'DAL_SEC_PoolConfig', executeParam, function (data) {
            $('#spanCurrentPoolName').text(data[0].TrustCode);
        })

        SPName = 'usp_getAllPoolCutfromTrustId';
        SQLParams = [
           { Name: 'TrustId', Value: parseInt(TrustId), DBType: 'int' }
        ]
    } else {
        var BasePoolId = common.getQueryString('PoolId');
        if (!BasePoolId || isNaN(BasePoolId)) {
            alert("PoolId错误");
        }
        var PoolName = getQueryString('PoolName');
        $('#spanCurrentPoolName').text(PoolName);
        //设置缓存
        sessionStorage.PoolId = BasePoolId
        sessionStorage.PoolName = PoolName;
        SQLParams = [
           { Name: 'BasePoolId', Value: BasePoolId, DBType: 'int' }
        ];
        SPName = 'usp_GetBasePoolContent';
    }
    //common的unescape解码方式对中文出现乱码，单独提出
    function getQueryString(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        //var r = decodeURI(window.location.search.substr(1)).match(reg);
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return decodeURI(r[2]);
        return null;
    }
    //
    

    $('#clearStorge').click(function () {
        sessionStorage.clear();
    });

    
    kendo.culture("zh-CN");
    var kendouiGrid = new kendoGridModel(height);
    //判断是否加载组件处理
    if (ShowId.indexOf('productDesign') < 0) {
        kendouiGrid.Init({
            renderOptions: {
                //height: 400,
                //rowNumber: true,
                columns: [
                            { field: "PoolId", title: lang.sign, width: "100px", locked: true, attributes: { style: 'text-align:left' }, headerAttributes: { 'class': 'table_layer_style' } }
                           , { field: "PoolName", title: lang.name, width: "300px", attributes: { style: 'text-align:left' } }
                           , { template: '#=PoolId?TranToHtml(4,PoolId,PoolTypeId):""#', title: lang.process, width: "100px" }
                           , { template: '#=ReportingFilePath?TranToHtml(1,ReportingFilePath,PoolId):""#', title: lang.form, width: "120px" }
                           //, { template: '#=ReportingFilePath?downLoadExcel(eportingFilePath,PoolId,):""#', title: lang.form, width: "120px" }
                           , { template: '#=ProjectPlanFilePath?TranToHtml(2,ProjectPlanFilePath):""#', title: lang.book, width: "100px" }
                           //, { template: '#=PurchaseListFilePath?TranToHtml(3,PurchaseListFilePath):""#', title: lang.list, width: "100px" }
                           , { field: "Exclude", title: lang.exclude, width: "100px", attributes: { style: 'text-align:left' } }
                           , { template: '#=CreatedDate?getStringDate(CreatedDate).dateFormat("yyyy-MM-dd"):""#', title: lang.createDate, width: "120px" }
                           //, { title: '状态', template: '#=PoolStatusId?TransStatus(PoolStatusId):""#', width: "9%"  }
                           //, { field: "PoolStatus", title: '状态',  width: "9%"  }
                           , { template: '#=PoolStatus?(PoolStatus=="OPEN"?PoolStatus:(PoolStatus+"<i style=\'padding-left:3px\' class=\'fa fa-lock\'><i>")):""#', title: lang.status, width: "100px" }
                           , { template: '#=PoolTypeId?TranToHtml(5,PoolTypeId):""#', title: lang.structure, width: "100px" }
                           , { template: "#=LoanCount?common.numFormt(LoanCount):'0'#", title: lang.number, width: "100px" }
                           , { template: "#=CurrentPrincipalBalance?common.numFormt(CurrentPrincipalBalance):'0'#", title: lang.scale, width: "150px" }
                           , { field: "", title: "", width: "auto" }
                ]
            }
        , dataSourceOptions: {
            pageSize: 20
            , otherOptions: {
                orderby: "PoolId"
                , direction: "asc"
                , DBName: 'DAL_SEC_PoolConfig'
                , appDomain: 'config'
                , executeParamType: 'extend'
                , defaultfilter: ''
                , executeParam: function () {
                    var result = {
                        SPName: 'usp_GetBasePoolContent'
                        , SQLParams: [
                            { Name: 'BasePoolId', Value: BasePoolId, DBType: 'int' }
                        ]
                    };
                    return result;
                }
            }
        }
        });

    } else {
        kendouiGrid.Init({
            renderOptions: {
                //height: 400,
                //rowNumber: true,
                columns: [
                            { field: "PoolId", title: lang.sign, width: "100px", locked: true, attributes: { style: 'text-align:center' }, headerAttributes: { 'class': 'table_layer_style' } }
                           , { field: "PoolName", title: lang.name, width: "300px", attributes: { style: 'text-align:left' } }
                           , { template: '#=ReportingFilePath?TranToHtml(1,ReportingFilePath,PoolId):""#', title: lang.form, width: "120px" }
                           //, { template: '#=ReportingFilePath?downLoadExcel(eportingFilePath,PoolId,):""#', title: lang.form, width: "120px" }
                           , { template: '#=ProjectPlanFilePath?TranToHtml(2,ProjectPlanFilePath):""#', title: lang.book, width: "100px" }
                           //, { template: '#=PurchaseListFilePath?TranToHtml(3,PurchaseListFilePath):""#', title: lang.list, width: "100px" }
                           , { field: "Exclude", title: lang.exclude, width: "100px", attributes: { style: 'text-align:left' } }
                           , { template: '#=CreatedDate?getStringDate(CreatedDate).dateFormat("yyyy-MM-dd"):""#', title: lang.createDate, width: "120px" }
                           //, { title: '状态', template: '#=PoolStatusId?TransStatus(PoolStatusId):""#', width: "9%"  }
                           //, { field: "PoolStatus", title: '状态',  width: "9%"  }
                           , { template: '#=PoolStatus?(PoolStatus=="OPEN"?PoolStatus:(PoolStatus+"<i style=\'padding-left:3px\' class=\'fa fa-lock\'><i>")):""#', title: lang.status, width: "100px" }
                           , { template: '#=PoolTypeId?TranToHtml(5,PoolTypeId):""#', title: lang.structure, width: "100px" }
                           , { template: "#=LoanCount?common.numFormt(LoanCount):'0'#", title: lang.number, width: "100px" }
                           , { template: "#=CurrentPrincipalBalance?common.numFormt(CurrentPrincipalBalance):'0'#", title: lang.scale, width: "150px" }
                           , { field: "", title: "", width: "auto" }
                ]
            }
        , dataSourceOptions: {
            pageSize: 20
            , otherOptions: {
                orderby: "PoolId"
                , direction: "asc"
                , DBName: 'DAL_SEC_PoolConfig'
                , appDomain: 'config'
                , executeParamType: 'extend'
                , defaultfilter: ''
                , executeParam: function () {
                    var result = {
                        SPName: SPName
                        , SQLParams: SQLParams
                    };
                    return result;
                }
            }
        }
        });
    }


    $(function () {


        var tableCell = $(".table-cell");
        if (tableCell[3] != "") //当页面加载状态 
        {
            $("#loading").fadeOut();
        }

        kendouiGrid.RunderGrid();
        refreshKendouGrid = function () { kendouiGrid.RefreshGrid(); }
        var ribbonJsonAF = {
            "group": [
                {
                    "module": "Index",
                    "title": "管理",
                    "elements": [
                     { "title": lang.targetpool, "type": "button btn-default", "icon": "fa fa-gg fa-fw", "linkname": "OpenPoolTargetingPage", "linkurl": "javascript:OpenPoolTargetingPage" },
                     { "title": lang.marketpool, "type": "button btn-default", "icon": "fa fa-dollar fa-fw", "linkname": "OpenSalablePoolPage", "linkurl": "javascript:OpenSalablePoolPage" },
                     //{ "title": lang.presales, "type": "button btn-default", "icon": "fa fa-sign-out fa-fw", "linkname": "GeneratingAssets", "linkurl": "javascript:GeneratingAssets" },
                     { "title": lang.assetfilter, "type": "button btn-default", "icon": "fa fa-search fa-fw", "linkname": "AssetFilter", "linkurl": "javascript:AssetFilter" },
                     { "title": lang.assetcontrast, "type": "button btn-default", "icon": "fa fa-exchange fa-fw", "linkname": "AssetContrast", "linkurl": "javascript:AssetContrast" },
                     { "title": lang.filtrateResult, "type": "button btn-default", "icon": "fa fa-sign-out fa-fw", "linkname": "FiltrateResult", "linkurl": "javascript:FiltrateResult" },
                     { "title": lang.salespool, "type": "button btn-default", "icon": "fa fa-gg fa-fw", "linkname": "SalesPool", "linkurl": "javascript:SalesPool" },
                     { "title": lang.alternativepool, "type": "button btn-default", "icon": "fa fa-gg fa-fw", "linkname": "AlternativePool", "linkurl": "javascript:AlternativePool" },
                     { "title": lang.entryandexit, "type": "button btn-default", "icon": "fa fa-university fa-fw", "linkname": "AssetOutInPool", "linkurl": "javascript:AssetOutInPool" },
                     { "title": lang.mergepool, "type": "button btn-default", "icon": "fa fa-ils fa-fw", "linkname": "AssetPoolMerge", "linkurl": "javascript:AssetPoolMerge" },
                     { "title": lang.poolpresales, "type": "button btn-default", "icon": "fa fa-ils fa-fw", "linkname": "PoolPreSales", "linkurl": "javascript:PoolPreSales" },
                     { "title": lang.disAdjust, "type": "button btn-default", "icon": "icon icon-cog-alt", "linkname": "DistributionConfig", "linkurl": "javascript:DistributionConfig" },
                     { "title": lang.report, "type": "button btn-default", "icon": "fa fa-ils fa-fw", "linkname": "AssetPoolListReport", "linkurl": "javascript:AssetPoolListReport" },
                     { "title": lang.delete, "type": "button btn-danger", "icon": "fa fa-trash-o fa-fw", "linkname": "DeleteAssetPool", "linkurl": "javascript:DeleteAssetPool" },
                     { "title": lang.refresh, "type": "button btn-default", "icon": "icon icon-arrows-ccw", "linkname": "RefreshBasePoolAF", "linkurl": "javascript:RefreshBasePoolAF" },
                     { "title": lang.CashflowManagement, "type": "button btn-default", "icon": "fa fa-gg fa-fw", "linkname": "OpenCashflowManagement", "linkurl": "javascript:OpenCashflowManagement" },
                     { "title": lang.NoPrincipalSplit, "type": "button btn-default", "icon": "fa fa-gg fa-fw", "linkname": "NoPrincipalSplit", "linkurl": "javascript:NoPrincipalSplit" },
                     { "title": lang.ReimbursementManagement, "type": "button btn-default", "icon": "fa fa-gg fa-fw", "linkname": "ReimbursementManagement", "linkurl": "javascript:ReimbursementManagement" },
                     //{ "title": lang.OpenCashflowSelecter, "type": "button btn-default", "icon": "fa fa-gg fa-fw", "linkname": "OpenCashflowSelecter", "linkurl": "javascript:OpenCashflowSelecter" },
                     { "title": lang.collectionGuide, "type": "button btn-default", "icon": "fa fa-gg fa-fw", "linkname": "OpenCollectionGuidePage", "linkurl": "javascript:OpenCollectionGuidePage" },
                    ]
                }
            ]
        }

        //产品设计的功能json
        var ribbonJsonPD = {
            "group": [
                        {
                            "module": "Index",
                            "title": "产品发行",
                            "elements": [
                        {
                            "title": lang.update,
                            "type": "button btn-default",
                            "icon": "icon icon-ccw",
                            "linkname": "AssetPoolRefresh",
                            "linkurl": "javascript:AssetPoolRefresh"
                        },
                        {
                            "title": lang.pack,
                            "type": "button btn-default",
                            "icon": "icon icon-lock-open",
                            "linkname": "AssetPoolClose",
                            "linkurl": "javascript:AssetPoolClose"
                        },
                        {
                            "title": lang.sales,
                            "type": "button btn-default",
                            "icon": "icon icon-asset",
                            "linkname": "AssetPoolSale",
                            "linkurl": "javascript:AssetPoolSale"
                        },
                        {
                            "title": lang.paper,
                            "type": "button btn-default",
                            "icon": "icon icon-file-word",
                            "linkname": "ProductDoc",
                            "linkurl": "javascript:ProductDoc"
                        }, {
                            "title": lang.refresh,
                            "type": "button btn-default refresh",
                            "icon": "icon icon-arrows-ccw",
                            "linkname": "RefreshBasePool",
                            "linkurl": "javascript:RefreshBasePool"
                        }
                            ]
                        }
            ]
        }
        function renderRibbon(data) {
            new Vue({
                el: "#DashBoard",
                data: {
                    obj: data, // needs to be filtered, 需要和实际权限比较过滤一下
                    show: data.group[0].title == "产品发行" ? false : true,
                    hidebox: hidbt
                },
               	created:function(){
					var self=this;
					Vue.nextTick(function(){
						if (self.hidebox == '1') {
						    $(".dropdown-menu").eq(1).find("li.PoolPreSales").hide()
						}
					})


				},
                methods: {
                    clickEvent: function (linkname, linkurl) {
                        if (linkname == 'FiltrateResult') {
            
                            GSDialog.open('EC查询结果', '../AssetsContrast/ecFiltrateResult.html?PoolId=' + BasePoolId, '', function (result) {
                                if (result) {
                                    window.location.reload();
                                }
                            }, 1100, 580, '', true, true, true, false);
                        } else {
                            parent.gsRibbonButtonClickedEventTransfer(linkname)
                        }
                    },
                    asideList: function (asideListUrl) {
                        return "javascript:asidetest('" + asideListUrl + "')";
                    }
                }
            })
        };

        //判断是哪个页面下的资产池列表，获取哪个页面的功能列表
        var ribbonJson = ShowId.indexOf('productDesign') < 0 ? ribbonJsonAF : ribbonJsonPD;

        //配置权限
        var ribbon = Permission.checkMenuPermission(ribbonJson);
        //渲染功能模块
        renderRibbon(ribbon);
        datesModel = {
            selectedDateId: '',
            datesId: []
        }
        var node = document.getElementById('dates');
        optViewModel = ko.mapping.fromJS(datesModel);
        ko.applyBindings(optViewModel, node);
        $('.select').click(function () {
            $(this).find('.ribbonGroup_wrap').toggle()
        })
        $('.btn-group').each(function () {
            $(this).find('.dropdown-menu').css('min-width', $(this).width())
        })
    });
})




