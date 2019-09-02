

define(function (require) {
    var $ = require('jquery');
    var anydialog = require('anyDialog');
    //var kendoGridModel = require('app/components/assetPoolList/js/kendoGridModel');
    var kendoGridModel = require('gs/Kendo/kendoGridModel');
    var common = require('common');
    var gsUtil = require('gsUtil');
    var GlobalVariable = require('globalVariable');
    var WcfProxy = require('app/productManage/Scripts/wcfProxy');
    var qwFrame = require('app/productManage/TrustManagement/Common/Scripts/QuickWizard.FrameEnhanceCus');
    var trustId = gsUtil.getQueryString('tid');
    var tab = gsUtil.getHashValue('tab');
    var webProxy = require('gs/webProxy');
    var trustPoolCloseDate;
    // 记录当前列数
    var col = 2;
    // 根据参数显示列
    var columns = function (col) {
        if (parseInt(col) >= 4) col = 4;
        return 12 / parseInt(col);
    };

    // 布局切换
    $(document).on('click', "#changeCols", function () {
        var $this = $(this);
        col = $this.attr('data-col');
        autoLayout(columns(col));
        if (col == 2) {
            $(this).attr('data-col', '3').html('三栏布局');
        } else {
            $(this).attr('data-col', '2').html('两栏布局');
        }
    });
    $('#mainContentDisplayer_0').load(function () { //方法1  
        var iframeHeight = Math.min(iframe.contentWindow.window.document.documentElement.scrollHeight, iframe.contentWindow.window.document.body.scrollHeight);
        var h = $(this).contents().height();
        $(this).height(h + 'px');
    });

    $('#mainContentDisplayer_0').load(function () { //方法2  
        var iframeHeight = $(this).contents().height();
        $(this).height(iframeHeight + 'px');
    });
    // 自动布局
    var autoLayout = function (col) {
        //其他页面
        if (window.location.href.indexOf("step=CatalogManagement") > 0) {
            var autoLayoutPlugins = $((document.getElementsByTagName('iframe')[0].contentWindow.document).getElementsByTagName('iframe')[0].contentWindow.document).find(".autoLayout-plugins");
            autoLayoutPlugins.each(function () {
                var _class = $(this).attr('class');
                $(this).attr('class', _class.replace(/(\d)/, col));
            });
        } else if (window.location.href.indexOf("step=DocumentManagement") > 0 || window.location.href.indexOf("step=ManusrciptReportManagement") > 0
            || window.location.href.indexOf("step=PlanReportManagement") > 0 || window.location.href.indexOf("step=ReviewDocumentManagement") > 0) {
            var autoLayoutPluginss = $(document.getElementsByTagName('iframe')[0].contentWindow.document).find(".autoLayout-plugins");
            autoLayoutPluginss.each(function () {
                var _class = $(this).attr('class');
                $(this).attr('class', _class.replace(/(\d)/, col));
            });
        } else {
            var autoLayoutPlugins = $((document.getElementsByTagName('iframe')[0].contentWindow.document).getElementsByTagName('iframe')[0].contentWindow.document).find(".autoLayout-plugins");
            autoLayoutPlugins.each(function () {
                var _class = $(this).attr('class');
                $(this).attr('class', _class.replace(/(\d)/, col));
            });
        }
        
    };
    
    var businessIdentifier;
    $(function () {
        businessIdentifier = common.getQueryString('tid');

        productPermissionState = common.getQueryString('productPermissionState');
        if (!businessIdentifier) {
            alert('Business Identifier is Required!');
            return;
        }
        //设置当前模块 业务条目的标识
        qwFrame.SetModuleBusiness(businessIdentifier);
        //设置当前页面浏览器tab页处显示标题
        qwFrame.SetPageTitle(GlobalVariable.Language_CN, '存续期管理');
        qwFrame.SetPageTitle(GlobalVariable.Language_EN, 'new');
        //设置当前页面模块名称（左侧导航处大标题）
        qwFrame.SetModuleTitle(GlobalVariable.Language_CN, '存续期管理');
        qwFrame.SetModuleTitle(GlobalVariable.Language_EN, 'Stress Test');
        //注册当前模块的步骤页面（左侧导航各步骤）

        //传的地址的根目录为www
        qwFrame.RegisterStep(GlobalVariable.Language_CN, '一', 'CatalogManagement', '目录规范管理', '目录规范管理', 'productManage/TrustManagement/documentManagement/CatalogManagement.html', 1);

        qwFrame.RegisterStep(GlobalVariable.Language_CN, '二', 'DocumentManagement', '文档管理', '文档管理', 'productManage/TrustManagement/documentManagement/DocumentManagement.html', 0);

        qwFrame.RegisterStep(GlobalVariable.Language_CN, '三', 'ManusrciptReportManagement', '尽调报告管理', '尽调报告管理', 'productManage/TrustManagement/documentManagement/manageDueDiligence.html', 0);

        qwFrame.RegisterStep(GlobalVariable.Language_CN, '四', 'PlanReportManagement', '计划说明书管理', '计划说明书', 'productManage/TrustManagement/documentManagement/manageSpecification.html', 0);

        qwFrame.RegisterStep(GlobalVariable.Language_CN, '五', 'ReviewDocumentManagement', '审核后文档管理', '审核后文档管理', 'productManage/TrustManagement/documentManagement/ReviewDocumentManagement.html', 0);

        //当前页面数据绑定
        qwFrame.PageDataBind(false);
        $(".iframe", parent.document).css({ "padding-bottom": "0" });

        //加载存续期首页
        function loadTrustIndex(){
            clearTimeout(timer);
            var timer = setTimeout(function () {
                $('.step>a').eq(0).trigger("click")
                $("#loading").fadeOut();
            })
        }
        loadTrustIndex();
        $('.step>a').click(function () {
            qwFrame.ChangeSetp(this);
        });

        







    });
   
    
});

       
