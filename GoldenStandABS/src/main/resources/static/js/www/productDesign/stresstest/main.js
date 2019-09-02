var qwFrame;
define(function (require) {
    var $ = require('jquery');
    var cookie = require('jquery.cookie');
    $.cookie = cookie;
    //require('jquery.hash');
    require('jquery-ui');
    var ko = require('knockout');
    var mapping = require('knockout.mapping');
    ko.mapping = mapping;
    var appGlobal = require('App.Global');
    var GlobalVariable = appGlobal.GlobalVariable;
    require('roleOperate');
    require('permission');
    require('app/productDesign/js/dataOperate');
    var common = require('common');
    require('gs/taskProcessIndicator');
    qwFrame = require('app/productDesign/js/stressWizard');
    require('asyncbox');
    require('anyDialog');
    require('jquery.localizationTool');
    webStorage = require('gs/webStorage');
    webProxy = require('gs/webProxy');
    require("app/projectStage/js/project_interface");
    var userLanguage = webStorage.getItem('userLanguage');
    langx = {};
    if (userLanguage && userLanguage.indexOf('en') > -1) {
        langx.title = "Stress Test";
        langx.tab1 = "CashflowSplit";
        langx.tab2 = "ModelRefresh";
        langx.tab3 = "StressScenarios";
    } else {
        langx.title = "压力测试";
        langx.tab1 = "现金流拆分";
        langx.tab2 = "刷新现金流模型";
        langx.tab3 = "典型情景压力测试";

    }


    var businessIdentifier, steps = [], set = 'zh-CN',isLoad=true;
    $(function () {
        businessIdentifier = common.getQueryString('TrustId');
        if (!businessIdentifier) {
            alert('Business Identifier is Required!');
            return;
        }
        //设置当前模块 业务条目的标识
        qwFrame.SetModuleBusiness(businessIdentifier);

        //设置当前页面浏览器tab页处显示标题
        qwFrame.SetPageTitle(GlobalVariable.Language_CN, langx.title);
        qwFrame.SetPageTitle(GlobalVariable.Language_EN, 'Stress Test');
        //设置当前页面模块名称（左侧导航处大标题）
        qwFrame.SetModuleTitle(GlobalVariable.Language_CN, langx.title);
        qwFrame.SetModuleTitle(GlobalVariable.Language_EN, 'Stress Test');

        qwFrame.RegisterStep(GlobalVariable.Language_CN, '1', 'split', langx.tab1, langx.tab1, 'productDesign/stresstest/CashflowSplit/SplitIndex.html');
        qwFrame.RegisterStep(GlobalVariable.Language_EN, '1', 'split', 'CashflowSplit', 'CashflowSplit', 'productDesign/stresstest/CashflowSplit/SplitIndex.html');

        qwFrame.RegisterStep(GlobalVariable.Language_CN, '2', 'refresh', langx.tab2, langx.tab2, 'productDesign/stresstest/RefreshCashflowModel/ModelRefreshIndex.html?ScenarioId=1');
        qwFrame.RegisterStep(GlobalVariable.Language_EN, '2', 'refresh', 'ModelRefresh', 'ModelRefresh', 'productDesign/stresstest/RefreshCashflowModel/ModelRefreshIndex.html?ScenarioId=1');

        qwFrame.RegisterStep(GlobalVariable.Language_CN, '3', 'stress', langx.tab3, langx.tab3, 'productDesign/stresstest/StressScenarios/StressScenarios.html?ScenarioId=1');
        qwFrame.RegisterStep(GlobalVariable.Language_EN, '3', 'stress', 'StressScenarios', 'StressScenarios', 'productDesign/stresstest/StressScenarios/StressScenarios.html?ScenarioId=1');


        //当前页面数据绑定
        qwFrame.PageDataBind(false);
        $('.step>a').click(function () {
            qwFrame.ChangeSetp(this);
        });
        qwFrame.ChangeSetp($('.step>a[pageCode="split"]')[0]);
        //qwFrame.GotoStep = gotoStep;//注册跳转事件

        steps = qwFrame.PageData[set].Steps;//初始化steps数组
});
   

});

