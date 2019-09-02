function TranToHtml(index, data, data2) {
    var html;
    switch (index) {
        case 1:
            html = '';//上海信托特殊
            break;
        case 2:
            html = '<a href="{0}">项目计划书</a>'.format(data);
            break;
        case 3:
            html = '<a href="{0}">拟购买资产池</a>'.format(data);
            break;
        case 4:
            var type = { '4': '资产筛选', '5': '目标化', '6': '额度调整', '7': '刷新池', '9': '出入池', '20240': '合并池' };
            if (type[data2] == '出入池' || type[data2] == '合并池') {
                html = '{0}'.format(type[data2]);
            } else {
                html = '<a href="javascript:PoolProcess({0})">{1}</a>'.format(data, type[data2]);
            }

            break;
        case 5:
            var type = { '4': 'Base', '5': 'Parent', '6': 'Child', '7': 'Refresh', '9': 'In-Exclude', '20240': 'Merge' };
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
    var GlobalVariable = require('globalVariable');
    GSDialog = require('gs/uiFrame/js/gs-admin-2.pages');
    require('bootstrap');
    var common = require('gs/uiFrame/js/common')
    var gt = require('app/components/assetPoolList/js/assetPoolList_Interface');
    var Vue = require('Vue');
    var webStorage = require('gs/webStorage');
    var lang = {};
    var userLanguage = webStorage.getItem('userLanguage');

    if (userLanguage && userLanguage.indexOf('en') > -1) {
        lang.sign = 'Identification'
        lang.name = 'Name'
        lang.process = 'Processing components'
        lang.form = 'Report form'
        lang.book = 'project planning paper'
        lang.list = 'Pooling list'
        lang.createDate = 'Creation date'
        lang.status = 'status'
        lang.structure = 'structure'
        lang.number = 'Quantity of credit'
        lang.scale = 'scale'

        lang.targetpool = 'Target asset'
        lang.marketpool = 'Marketable asset'
        lang.presales = 'Generating assets list'
        lang.assetfilter = 'Query Asset'
        lang.assetcontrast = 'Asset Contrast'
        lang.entryandexit = 'Asset entry and exit'
        lang.mergepool = 'Asset merger'
        lang.disAdjust = 'Distribution adjustment'
        lang.report = 'Asset dimension Report'
        lang.delete = 'Delete'
        lang.refresh = 'Refresh'

        lang.update = 'Asset pool update'
        lang.pack = 'Pack and Unpack'
        lang.sales = 'Asset pool sales'
        lang.paper = 'Project planning paper'
    } else {
        lang.sign = '标识'
        lang.name = '名称'
        lang.process = '处理组件'
        lang.form = '报表'
        lang.book = '项目计划书'
        lang.list = '拟购买池列表'
        lang.createDate = '创建日期'
        lang.status = '状态'
        lang.structure = '结构'
        lang.number = '信贷数量'
        lang.scale = '规模'

        lang.targetpool = '生成目标资产池'
        lang.marketpool = '资产池额度调整'
        lang.presales = '生成资产列表'
        lang.assetfilter = '资产查询'
        lang.assetcontrast = '资产池对比'
        lang.entryandexit = '资产出入池'
        lang.mergepool = '资产池合并'
        lang.disAdjust = '资产维度调整'
        lang.report = '资产池维度报告'
        lang.delete = '删除'
        lang.refresh = '刷新'

        lang.update = '资产池更新'
        lang.pack = '封包解包'
        lang.sales = '资产池销售'
        lang.paper = '项目计划书'
    }
    var Permission = require('gs/permission');

    //var tm = require('gs/parentTabModel');

    var height = $(window).height() - 110;

    var BasePoolId = common.getQueryString('PoolId');
    if (!BasePoolId || isNaN(BasePoolId)) {
        alert("PoolId错误");
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
    var PoolName = getQueryString('PoolName');
    $('#spanCurrentPoolName').text(PoolName);

    $('#clearStorge').click(function () {
        sessionStorage.clear();
    });


    //设置缓存
    sessionStorage.PoolId = BasePoolId
    sessionStorage.PoolName = PoolName;
    //
    kendo.culture("zh-CN");
    var kendouiGrid = new kendoGridModel(height);
    kendouiGrid.Init({
        renderOptions: {
            //height: 400,
            //rowNumber: true,
            columns: [
                        { field: "PoolId", title: lang.sign, width: "100px", locked: true, attributes: { style: 'text-align:center' }, headerAttributes: { 'class': 'table_layer_style' } }
                       , { field: "PoolName", title: lang.name, width: "300px", attributes: { style: 'text-align:left' } }
                       , { template: '#=PoolId?TranToHtml(4,PoolId,PoolTypeId):""#', title: lang.process, width: "100px" }
                       , { template: '#=ReportingFilePath?TranToHtml(1,ReportingFilePath,PoolId):""#', title: lang.form, width: "120px" }
                       //, { template: '#=ReportingFilePath?downLoadExcel(eportingFilePath,PoolId,):""#', title: lang.form, width: "120px" }
                       , { template: '#=ProjectPlanFilePath?TranToHtml(2,ProjectPlanFilePath):""#', title: lang.book, width: "100px" }
                       , { template: '#=PurchaseListFilePath?TranToHtml(3,PurchaseListFilePath):""#', title: lang.list, width: "100px" }
                       , { template: '#=CreatedDate?getStringDate(CreatedDate).dateFormat("yyyy-MM-dd"):""#', title: lang.createDate, width: "120px" }
                       //, { title: '状态', template: '#=PoolStatusId?TransStatus(PoolStatusId):""#', width: "9%"  }
                       //, { field: "PoolStatus", title: '状态',  width: "9%"  }
                       , { template: '#=PoolStatus?(PoolStatus=="OPEN"?PoolStatus:(PoolStatus+"<i style=\'padding-left:3px\' class=\'fa fa-lock\'><i>")):""#', title: lang.status, width: "100px" }
                       , { template: '#=PoolTypeId?TranToHtml(5,PoolTypeId):""#', title: lang.structure, width: "100px" }
                       , { template: "#=LoanCount?common.numFormt(LoanCount):''#", title: lang.number, width: "100px" }
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
                     { "title": lang.entryandexit, "type": "button btn-default", "icon": "fa fa-university fa-fw", "linkname": "AssetOutInPool", "linkurl": "javascript:AssetOutInPool" },
                     { "title": lang.mergepool, "type": "button btn-default", "icon": "fa fa-ils fa-fw", "linkname": "AssetPoolMerge", "linkurl": "javascript:AssetPoolMerge" },
                     { "title": lang.disAdjust, "type": "button btn-default", "icon": "icon icon-cog-alt", "linkname": "DistributionConfig", "linkurl": "javascript:DistributionConfig" },
                     { "title": lang.report, "type": "button btn-default", "icon": "fa fa-ils fa-fw", "linkname": "AssetPoolListReport", "linkurl": "javascript:AssetPoolListReport" },
                     { "title": lang.delete, "type": "button btn-danger", "icon": "fa fa-trash-o fa-fw", "linkname": "DeleteAssetPool", "linkurl": "javascript:DeleteAssetPool" },
                     { "title": lang.refresh, "type": "button btn-default", "icon": "icon icon-arrows-ccw", "linkname": "RefreshBasePoolAF", "linkurl": "javascript:RefreshBasePoolAF" }
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
                    show: data.group[0].title == "产品发行" ? false : true
                },
                methods: {
                    clickEvent: function (linkname, linkurl) {
                        parent.gsRibbonButtonClickedEventTransfer(linkname)
                    },
                    asideList: function (asideListUrl) {
                        return "javascript:asidetest('" + asideListUrl + "')";
                    }
                }
            })
        };

        //判断是哪个页面下的资产池列表，获取哪个页面的功能列表
        var ribbonJson = parent.window.location.href.indexOf('productDesign') < 0 ? ribbonJsonAF : ribbonJsonPD;

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




