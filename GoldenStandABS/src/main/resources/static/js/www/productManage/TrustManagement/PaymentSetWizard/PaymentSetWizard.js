/// <reference path="PaymentSetWizard.js" />
/// <reference path="PaymentSetWizard.html" />
define(function (require) {
    var common = require('common');
    //var qwFrame = require('app/productDesign/js/QuickWizard.FrameEnhanceCus');
    var qwFrame = require('app/productManage/TrustManagement/Common/Scripts/QuickWizard.FrameEnhanceCus');
    var appGlobal = require('App.Global');
    var GlobalVariable = appGlobal.GlobalVariable;
    //var businessIdentifier;
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
        qwFrame.SetPageTitle(GlobalVariable.Language_CN, '偿付顺序配置向导');
        qwFrame.SetPageTitle(GlobalVariable.Language_EN, 'PaymentSetWizard');

        //设置当前页面模块名称（左侧导航处大标题）
        qwFrame.SetModuleTitle(GlobalVariable.Language_CN, '偿付顺序配置向导');
        qwFrame.SetModuleTitle(GlobalVariable.Language_EN, 'PaymentSetWizard');

        //注册当前模块的步骤页面（左侧导航各步骤）
        //qwFrame.RegisterStep(GlobalVariable.Language_CN, '1', 'sequence', '偿付顺序视图', '偿付顺序视图', 'components/PaymentSequence/PaymentSequenceSetting.html?tid=' + businessIdentifier + '&productPermissionState=' + productPermissionState, 1);
        //qwFrame.RegisterStep(GlobalVariable.Language_EN, '1', 'sequence', 'sequence', 'sequence', 'components/PaymentSequence/PaymentSequenceSetting.html?tid=' + businessIdentifier + '&productPermissionState=' + productPermissionState, 1);
        
        qwFrame.RegisterStep(GlobalVariable.Language_CN, '1', 'TrustEvents', '事件管理', '事件管理', 'productManage/TrustManagement/PaymentSetWizard/EventManagement.html?tid=' + businessIdentifier + '&productPermissionState=' + productPermissionState, 1);
        qwFrame.RegisterStep(GlobalVariable.Language_EN, '1', 'TrustEvents', '事件管理', '事件管理', 'productManage/TrustManagement/PaymentSetWizard/EventManagement.html?tid=' + businessIdentifier + '&productPermissionState=' + productPermissionState, 1);

        qwFrame.RegisterStep(GlobalVariable.Language_CN, '2', 'TrustEvents', '情景视图', '情景视图', 'productManage/TrustManagement/PaymentSetWizard/ScenarioView.html?tid=' + businessIdentifier + '&productPermissionState=' + productPermissionState, 0);
        qwFrame.RegisterStep(GlobalVariable.Language_EN, '2', 'TrustEvents', 'ScenarioView', 'ScenarioView', 'productManage/TrustManagement/PaymentSetWizard/ScenarioView.html?tid=' + businessIdentifier + '&productPermissionState=' + productPermissionState, 0);

        //qwFrame.RegisterStep(GlobalVariable.Language_CN, '1', 'maintainDesigner', '事件条目', '事件条目', 'productManage/TrustManagement/EventMaintain/maintainDesigner-Huaneng.html?tid=' + businessIdentifier + '&productPermissionState=' + productPermissionState, 0);
        //qwFrame.RegisterStep(GlobalVariable.Language_EN, '1', 'maintainDesigner', 'maintainDesigner', 'maintainDesigner', 'productManage/TrustManagement/EventMaintain/maintainDesigner-Huaneng.html?tid=' + businessIdentifier + '&productPermissionState=' + productPermissionState, 0);

        //qwFrame.RegisterStep(GlobalVariable.Language_CN, '2', 'ScenarioWithEvent', '偿付情景设置', '偿付情景设置', 'productManage/TrustManagement/ScenarioWithEvent/ScenarioWithEvent.html?tid=' + businessIdentifier + '&productPermissionState=' + productPermissionState, 0);
        //qwFrame.RegisterStep(GlobalVariable.Language_EN, '2', 'ScenarioWithEvent', 'ScenarioWithEvent', 'ScenarioWithEvent', '../ScenarioWithEvent/ScenarioWithEvent.html?tid=' + businessIdentifier + '&productPermissionState=' + productPermissionState, 0);

        //qwFrame.RegisterStep(GlobalVariable.Language_CN, '3', 'TrustEvents', '信托事件', '信托事件', 'productManage/TrustManagement/TrustEvents/TrustEvents.html?tid=' + businessIdentifier + '&productPermissionState=' + productPermissionState, 0);
        //qwFrame.RegisterStep(GlobalVariable.Language_EN, '3', 'TrustEvents', 'TrustEvents', 'TrustEvents', 'productManage/TrustManagement/TrustEvents/TrustEvents.html?tid=' + businessIdentifier + '&productPermissionState=' + productPermissionState, 0);

        //当前页面数据绑定
        qwFrame.PageDataBind(false);
        clearTimeout(timer);
        var timer = setTimeout(function () {
            $('.step>a').eq(0).trigger("click")
        })
        $('.step>a').click(function () {
            qwFrame.ChangeSetp(this);
            var index = $(this).index();
            if (index == 3) {
                var h = $("iframe").contents().find("#sortable_div").height();
                var dish = $("iframe").contents().find("body").height() - 1 - h;
                var wh = $("iframe").contents().find("#divBody").height()
                $("iframe").contents().find(".payment-container").css({ "paddingBottom": h + "px", "height": dish + "px" });
                $("iframe").contents().find(".k-grid").css("height", dish - 54-wh + "px");
                $("iframe").contents().find(".k-grid-content").css("height",$("iframe").contents().find(".k-grid").height() - 36 + "px");              
            }
        });
    });


});

