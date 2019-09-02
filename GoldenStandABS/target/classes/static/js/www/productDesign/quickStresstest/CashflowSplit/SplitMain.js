var qwFrame;
define(function (require) {
    var $ = require('jquery');
    var GlobalVariable = require('globalVariable');
    var common = require('common');
    var Vue = require('Vue');
    qwFrame = require('app/productDesign/js/stressWizard');

    var TrustId = common.getQueryString('tid');
    var svcUrlTrustManagement = GlobalVariable.DataProcessServiceUrl + "CommonGetExecute?connConfig=TrustManagement&";
    var self = this;
    var steps = [],set = 'zh-CN';

    var StepsCode = {
        Layer: 'layer',
        Dateset: 'dateset',
        Fee: 'fee',
        Sequence: 'sequence',
        Split: 'split',
        NewSplit:'NewSplit',
        Refresh: 'refresh',
        Prepaid: 'prepaid'
    };

    $(function () {
        getHeight();
        if (!TrustId) {
            alert('Business Identifier is Required!');
            return;
        }
        //设置当前模块 业务条目的标识
        qwFrame.SetModuleBusiness(TrustId);

        //设置当前页面浏览器tab页处显示标题
        qwFrame.SetPageTitle(GlobalVariable.Language_CN, '现金流拆分');
        qwFrame.SetPageTitle(GlobalVariable.Language_EN, 'CashflowSplit');

        //设置当前页面模块名称（左侧导航处大标题）
        qwFrame.SetModuleTitle(GlobalVariable.Language_CN, '现金流拆分');
        qwFrame.SetModuleTitle(GlobalVariable.Language_EN, 'CashflowSplit');

        qwFrame.RegisterStep(GlobalVariable.Language_CN, '1', StepsCode.Dateset, '日期设置', '日期设置', 'components/viewDateSet/viewDateSet.html');
        qwFrame.RegisterStep(GlobalVariable.Language_EN, '1', StepsCode.Dateset, 'Dateset', 'Dateset', 'components/viewDateSet/viewDateSet.html');

        qwFrame.RegisterStep(GlobalVariable.Language_CN, '2', StepsCode.Split, '现金流拆分', '现金流拆分', 'productDesign/stresstest/CashflowSplit/CashflowSplit.html');
        qwFrame.RegisterStep(GlobalVariable.Language_EN, '2', StepsCode.Split, 'CashflowSplit', 'CashflowSplit', 'productDesign/stresstest/CashflowSplit/CashflowSplit.html');

        qwFrame.RegisterStep(GlobalVariable.Language_CN, '3', StepsCode.NewSplit, '新现金流拆分', '新现金流拆分', 'productDesign/stresstest/CashflowSplit/CashflowSplit.html?step=3');
        qwFrame.RegisterStep(GlobalVariable.Language_EN, '3', StepsCode.NewSplit, 'NewCashflowSplit', 'NewCashflowSplit', 'productDesign/stresstest/CashflowSplit/CashflowSplit.html?step=3');
        
        ////loading 
        //if (document.readyState == "complete") //当页面加载状态 
        //{
        //    $("#loading").fadeOut()
        //}

        //当前页面数据绑定
        qwFrame.PageDataBind(false);
        $('.step>a').click(function () {
            qwFrame.ChangeSetp(this);
        });
        qwFrame.ChangeSetp($('.step>a[pageCode="'+StepsCode.Dateset+'"]')[0]);
        qwFrame.GotoStep = gotoStep;//注册跳转事件

        steps = qwFrame.PageData[set].Steps;//初始化steps数组
    });


    function gotoStep(stepCode) {
        //压力测试页面实现跳转接口GotoStep
        var nextCode = '';
        if (stepCode != '') {
            switch (stepCode) {
                case StepsCode.Dateset:
                    nextCode = StepsCode.Split;
                    break;
            }
        }
        if (nextCode) {
            var stepNext = $('.step>a[pageCode="' + nextCode + '"]')
            qwFrame.ChangeSetp(stepNext);
        }
    }
    function getHeight() {
        var h = $("body").height();
        $(".work").css("height", h - 35 + "px");
    }
    ////从json数组里找出attr==val的数据
    //function findStep(obj, attr, val) {
    //    var res = '';
    //    if (val != '') {
    //        if (obj && obj.length > 0) {
    //            res = obj.filter(function (v, i) {
    //                if (v[attr] && v[attr] == val) {
    //                    return v;
    //                }
    //            })[0];
    //        }
    //    }
    //    return res;
    //}


});