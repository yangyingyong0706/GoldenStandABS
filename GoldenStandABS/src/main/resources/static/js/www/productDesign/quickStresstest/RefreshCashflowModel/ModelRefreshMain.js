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
        Refresh: 'refresh',
        Prepaid: 'prepaid',
        DataVerification: 'DataVerification'
    };
    function getHeight() {
        var h = $("body").height();
        $(".work").css("height", h - 35 + "px");
    }
    getHeight();
    $(function () {
        if (!TrustId) {
            alert('Business Identifier is Required!');
            return;
        }
        //设置当前模块 业务条目的标识
        qwFrame.SetModuleBusiness(TrustId);

        //设置当前页面浏览器tab页处显示标题
        qwFrame.SetPageTitle(GlobalVariable.Language_CN, '刷新现金流模型');
        qwFrame.SetPageTitle(GlobalVariable.Language_EN, 'Stress Test');

        //设置当前页面模块名称（左侧导航处大标题）
        qwFrame.SetModuleTitle(GlobalVariable.Language_CN, '刷新现金流模型');
        qwFrame.SetModuleTitle(GlobalVariable.Language_EN, 'Stress Test');

        qwFrame.RegisterStep(GlobalVariable.Language_CN, '1', StepsCode.Layer, '分层结构化设计', '分层结构化设计', 'components/Layered/Layered.html');
        qwFrame.RegisterStep(GlobalVariable.Language_EN, '1', StepsCode.Layer, 'Bond Layers', 'Bond Layers settings', 'components/Layered/Layered.html');

        qwFrame.RegisterStep(GlobalVariable.Language_CN, '2', StepsCode.Fee, '费用信息', '费用信息', 'components/FeeSettings/FeeSettings.html');//'../../components/FeeSettings/FeeSettings.html'
        qwFrame.RegisterStep(GlobalVariable.Language_EN, '2', StepsCode.Fee, 'Fee', 'Fee', 'components/FeeSettings/FeeSettings.html');

        qwFrame.RegisterStep(GlobalVariable.Language_CN, '3', StepsCode.Sequence, '分层偿付顺序', '分层偿付顺序', 'components/PaymentSequence/PaymentSequenceSetting.html');//'../../components/PaymentSequenceSetting/PaymentSequenceSetting.html'
        qwFrame.RegisterStep(GlobalVariable.Language_EN, '3', StepsCode.Sequence, 'PaymentSequence', 'PaymentSequence', 'components/PaymentSequence/PaymentSequenceSetting.html');

        qwFrame.RegisterStep(GlobalVariable.Language_CN, '4', StepsCode.Refresh, '刷新现金流模型', '刷新现金流模型', 'productDesign/stresstest/RefreshCashflowModel/RefreshCashflowModel.html');
        qwFrame.RegisterStep(GlobalVariable.Language_EN, '4', StepsCode.Refresh, 'RefreshModel', 'RefreshModel', 'productDesign/stresstest/RefreshCashflowModel/RefreshCashflowModel.html');

        qwFrame.RegisterStep(GlobalVariable.Language_CN, '5', StepsCode.DataVerification, '收益分配数据校验', '收益分配数据校验');//'../../components/PaymentSequenceSetting/PaymentSequenceSetting.html'
        qwFrame.RegisterStep(GlobalVariable.Language_EN, '5', StepsCode.DataVerification, 'DataVerification', 'DataVerification');

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
        qwFrame.ChangeSetp($('.step>a[pageCode="'+StepsCode.Layer+'"]')[0]);
        qwFrame.GotoStep = gotoStep;//注册跳转事件

        steps = qwFrame.PageData[set].Steps;//初始化steps数组
    });

    function gotoStep(stepCode) {
        //压力测试页面实现跳转接口GotoStep
        var nextCode = '';
        if (stepCode != '') {
            switch (stepCode) {
                case StepsCode.Layer:
                    nextCode = StepsCode.Fee;
                    break;
                case StepsCode.Fee:
                    nextCode = StepsCode.Sequence;
                    break;
                case StepsCode.Sequence:
                    nextCode = StepsCode.Refresh;
                    break;
            }
        }
        if (nextCode) {
            var stepNext = $('.step>a[pageCode="' + nextCode + '"]')[0];
            qwFrame.ChangeSetp(stepNext);
        }
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