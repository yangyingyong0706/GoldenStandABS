/// <reference path="../../../productDesign/stresstest/CashflowSplit/CashflowSplit.html" />
/// <reference path="../stresstest/CashflowSplit/CashflowSplit.html" />
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
    require("app/projectStage/js/project_interface");
    var common = require('common');
    var GSDialog = require("gsAdminPages")
    require('gs/taskProcessIndicator');
    //var qwFrame = require('app/productDesign/js/QuickWizard.FrameEnhanceCus');
    var qwFrame = require('app/productManage/TrustManagement/Common/Scripts/QuickWizard.FrameEnhanceCus');
    require('asyncbox');
    require('anyDialog');
    var webStorage = require('gs/webStorage');
    var businessIdentifier, steps = [], set = 'zh-CN', isLoad = true;
    var scheduleDateItems = webStorage.getItem('scheduleDateItems') ? JSON.parse(webStorage.getItem('scheduleDateItems'))[0] : '';
    showDimReportDate()
    $(function () {
        businessIdentifier = common.getQueryString('TrustId');
        if (!businessIdentifier) {
            alert('Business Identifier is Required!');
            return;
        }
        //设置当前模块 业务条目的标识
        qwFrame.SetModuleBusiness(businessIdentifier);

        //设置当前页面浏览器tab页处显示标题
        qwFrame.SetPageTitle(GlobalVariable.Language_CN, '循环购买');
        qwFrame.SetPageTitle(GlobalVariable.Language_EN, 'revolve purchase');

        //设置当前页面模块名称（左侧导航处大标题）
        qwFrame.SetModuleTitle(GlobalVariable.Language_CN, '循环购买');
        qwFrame.SetModuleTitle(GlobalVariable.Language_EN, 'revolve purchase');


        qwFrame.RegisterStep(GlobalVariable.Language_CN, '1', 'selectAggregateDate', '选择归集日', '选择归集日', 'productManage/TrustManagement/revolvePurchase/selectAggregateDate/selectAggregateDate.html?tid=' + businessIdentifier + '&position=aggregate', 1);
        qwFrame.RegisterStep(GlobalVariable.Language_EN, '1', 'selectAggregateDate', 'SelectAggregateDate', 'SelectAggregateDate', 'productManage/TrustManagement/revolvePurchase/selectAggregateDate/selectAggregateDate.html?tid=' + businessIdentifier + '&position=aggregate', 1);

        qwFrame.RegisterStep(GlobalVariable.Language_CN, '2', 'split', '现金流拆分', '现金流拆分', 'productDesign/stresstest/CashflowSplit/CashflowSplit.html',0);
        qwFrame.RegisterStep(GlobalVariable.Language_EN, '2', 'split', 'CashflowSplit', 'CashflowSplit', 'productDesign/stresstest/CashflowSplit/CashflowSplit.html', 0);

        qwFrame.RegisterStep(GlobalVariable.Language_CN, '3', 'refresh', '刷新现金流模型', '刷新现金流模型', 'productManage/TrustManagement/RefreshCashflowModel/RefreshCashflowModel.html?tid=' + businessIdentifier, 0);
        qwFrame.RegisterStep(GlobalVariable.Language_EN, '3', 'refresh', 'RefreshCashflow', 'RefreshCashflow', 'productManage/TrustManagement/RefreshCashflowModel/RefreshCashflowModel.html?tid=' + businessIdentifier, 0);

        qwFrame.RegisterStep(GlobalVariable.Language_CN, '4', 'stress', '预测压力测试', '预测压力测试', 'productDesign/stresstest/StressScenarios/StressScenarios.html?ScenarioId=1', 0);
        qwFrame.RegisterStep(GlobalVariable.Language_EN, '4', 'stress', 'preperStressTest', 'preperStressTest', 'productDesign/stresstest/StressScenarios/StressScenarios.html?ScenarioId=1', 0);

        //qwFrame.RegisterStep(GlobalVariable.Language_CN, '4', 'RevolvePurchasePreSale', '循环购买预销售', '循环购买预销售');
        //qwFrame.RegisterStep(GlobalVariable.Language_EN, '4', 'RevolvePurchasePreSale', 'preperSale', 'preperSale');

        qwFrame.RegisterStep(GlobalVariable.Language_CN, '5', 'RevolvePurchasePreSale', '循环购买预销售', '循环购买预销售', 'productManage/TrustManagement/revolvePurchase/selectAggregateDate/selectAggregateDate.html?tid=' + businessIdentifier + '&position=presale', 0);
        qwFrame.RegisterStep(GlobalVariable.Language_EN, '5', 'RevolvePurchasePreSale', 'preperSale', 'preperSale', 'productManage/TrustManagement/revolvePurchase/selectAggregateDate/selectAggregateDate.html?tid=' + businessIdentifier + '&position=presale', 0);

        ////loading 
        //if (document.readyState == "complete") //当页面加载状态 
        //{
        //    $("#loading").fadeOut()
        //}
        
        //当前页面数据绑定
        qwFrame.PageDataBind(false);
        clearTimeout(timer);
        var timer = setTimeout(function () {
            $('.step>a').eq(0).trigger("click")
            $("#loading").fadeOut();
        })
        $('.step>a').click(function () {
            var currentStep = $(this).attr('itemindex');
            var apps = JSON.parse(webStorage.getItem('apps'))
            var scheduleDateItems = webStorage.getItem('scheduleDateItems') ? JSON.parse(webStorage.getItem('scheduleDateItems'))[0] : '';
            showDimReportDate()
            //判断
            var currentStepUrl = (qwFrame.DataModel.Steps)()[currentStep].LinkUrl();
            var targetStepUrl = '';
            if (currentStep === '1') {
                if (!scheduleDateItems) {
                    GSDialog.HintWindow("请从选择归集日期页选择未购买的进行现金流拆分！！！");   
                    return;
                } else {
                    if (currentStepUrl.indexOf('scheduleDate') < 0) {
                        //qwFrame.ChangeSetp(this);
                        var addString = '&scheduleDate={0}&schedulePurpose={1}'.format(scheduleDateItems.scheduleDate, scheduleDateItems.schedulePurpose);
                        targetStepUrl = currentStepUrl + addString;
                        (qwFrame.DataModel.Steps)()[currentStep].LinkUrl(targetStepUrl);
                    }
                }
            }
            else if (currentStep === '2') {
                if (!scheduleDateItems) {
                    GSDialog.HintWindow("请完成第二步现金流拆分操作！！！");
                    return;
                }
                else {
                    if (currentStepUrl.indexOf('scheduleDate') < 0) {
                        //qwFrame.ChangeSetp(this);
                        var addString = '&scheduleDate={0}&schedulePurpose={1}'.format(scheduleDateItems.scheduleDate, scheduleDateItems.schedulePurpose);
                        targetStepUrl = currentStepUrl +addString;
                        (qwFrame.DataModel.Steps)()[currentStep].LinkUrl(targetStepUrl);
                        
                        //if ($('#mainContentDisplayer_0', window.parent.document).length>0) {
                        //    $('#mainContentDisplayer_0', window.parent.document)[0].src = currentStepUrl + addString;
                        //}
                        //else {
                        //    $('#mainContentDisplayer_0')[0].src = currentStepUrl + addString;
                        //}
                    }
                }
            }
            qwFrame.ChangeSetp(this);
            //webStorage.removeItem('scheduleDateItems')    
            //if (scheduleDateItems)
            //    qwFrame.ChangeSetp(this);
            //}
        });
        //qwFrame.GotoStep = gotoStep;//注册跳转事件

        steps = qwFrame.PageData[set].Steps;//初始化steps数组
});
    
    function showDimReportDate() {
        if (scheduleDateItems) {
            $('.nowDimReportDate').text('当前归集日：' + scheduleDateItems.scheduleDate)
            $('.nowDimReportDate').show()
        }
    }

});

