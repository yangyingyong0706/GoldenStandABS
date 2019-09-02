






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
    require("app/projectStage/js/project_interface");
    var trustId = gsUtil.getQueryString('tid');
    //var trustId = gsUtil.getQueryString('tid') ? gsUtil.getQueryString('tid') : "";
    var tab = gsUtil.getHashValue('tab');
    //var tab = gsUtil.getHashValue('tab') ? gsUtil.getHashValue('tab') : "";
    var trustPoolCloseDate;
    // 记录当前列数
    var col = 2;
    // 根据参数显示列
    var columns = function (col) {
        if (parseInt(col) >= 4) col = 4;
        return 12 / parseInt(col);
    };



    require('jquery.localizationTool');
    var webStorage = require('gs/webStorage');



    function getLangvtpbmi() {

        var webStorage = require('gs/webStorage');
        var langtli = {};
        var userLanguage = webStorage.getItem('userLanguage');


        if (userLanguage && userLanguage.indexOf('en') > -1) {
            langtli.ThreeColumns = 'Three Columns';
            langtli.TwoColumns = 'Two Columns';
            langtli.BasicInformation = 'Basic Information';
            langtli.ClassStructure = 'Class Structure';
            langtli.DateSetting = 'Date Setting';
            langtli.FeeIssues = 'Fee Issues';
            //langtli.PaymentSecquence = 'Payment Secquence';
           
            langtli.UpdateModel = 'Update Model';
            langtli.CheckAllocationData = 'Check Allocation Data';
            langtli.AccountInformation = 'Account Information'
        } else {
            langtli.ThreeColumns = '三栏布局';
            langtli.TwoColumns = '两栏布局';
            langtli.BasicInformation = '基础信息';
            langtli.ClassStructure = '分层信息';
            langtli.DateSetting = '日期设置';
            langtli.FeeIssues = '费用信息';
            langtli.PaymentSecquence = '偿付顺序';           
            langtli.UpdateModel = '刷新现金流模型';           
            langtli.AccountInformation = '账户信息';

        }
    };




    // 布局切换
    $(document).on('click', "#changeCols", function () {
        var lang = getLangvtpbmi();
        var $this = $(this);
        col = $this.attr('data-col');
        autoLayout(columns(col));
        if (col == 2) {
            $(this).attr('data-col', '3').html(lang.ThreeColumns);
        } else {
            $(this).attr('data-col', '2').html(lang.TwoColumns);
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
        if (window.location.href.indexOf("step=viewTrust_New") > 0) {
            var autoLayoutPlugins = $((document.getElementsByTagName('iframe')[0].contentWindow.document).getElementsByTagName('iframe')[0].contentWindow.document).find(".autoLayout-plugins");
            autoLayoutPlugins.each(function () {
                var _class = $(this).attr('class');
                $(this).attr('class', _class.replace(/(\d)/, col));
            });
        } else if (window.location.href.indexOf("step=Layered") > 0 || window.location.href.indexOf("step=dateset") > 0 || window.location.href.indexOf("step=FeeSettings") > 0 || window.location.href.indexOf("step=PaymentSetWizard") > 0 || window.location.href.indexOf("step=RefreshCashflowModel") > 0) {
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





        $('#selectLanguageDropdown_vtpbmi').localizationTool({
            'defaultLanguage': 'zh_CN', // this is the language that the server is sending anyway
            'ignoreUnmatchedSelectors': true,
            'showFlag': true,
            'showCountry': false,
            'showLanguage': true,
            'onLanguageSelected': function (languageCode) {
                /*
                 * When the user translates we set the cookie
                 */
                webStorage.setItem('userLanguage', languageCode);
                return true;
            },

            /* 
             * Translate the strings that appear in all the pages below
             */
            'strings': {

                'class:vtpbmi_changeCols': {
                    'en_GB': 'Three Columns'
                },
                'class:vtpbmi_RemoveColButtomSH': {
                    'en_GB': 'Enable Delete'
                }


            }
        });

        var userLanguage = webStorage.getItem('userLanguage');
        if (userLanguage) {
            $('#selectLanguageDropdown_vtpbmi').localizationTool('translate', userLanguage);
        }
        $('body').show();

        
        
        var lang = {};
       


        if (userLanguage && userLanguage.indexOf('en') > -1) {
            lang.ThreeColumns = 'Three Columns';
            lang.TwoColumns = 'Two Columns';
            lang.BasicInformation = 'Basic Information';
            lang.ClassStructure = 'Class Structure';
            lang.DateSetting = 'Date Setting';
            lang.FeeIssues = 'Fee Issues';
            lang.PaymentSecquence = 'Payment Secquence';
            lang.ProductDesignTools = 'ProductDesign Tools';
            lang.EventHandle = 'Event Handle';
            lang.UpdateModel = 'Update Model';
            lang.AccountInformation = 'Account Information';
            lang.CheckAllocationData = 'Verify Product';
        } else {
            lang.ThreeColumns = '三栏布局';
            lang.TwoColumns = '两栏布局';
            lang.BasicInformation = '基础信息';
            lang.ClassStructure = '分层信息';
            lang.DateSetting = '日期设置';
            lang.FeeIssues = '费用信息';
            lang.PaymentSecquence = '偿付顺序';
            lang.ProductDesignTools = '结构化工具';
            lang.EventHandle = "事件处理";
            lang.UpdateModel = '刷新现金流模型';
            lang.AccountInformation = '账户信息';
            lang.VerifyTrust = '产品校验';

        }
        


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
        //lang = getLangvtpbmi();
        qwFrame.RegisterStep(GlobalVariable.Language_CN, '一', 'viewTrust_New', lang.BasicInformation, lang.BasicInformation, 'productManage/TrustManagement/trustWizard_New/trustWizard.html?productPermissionState=' + productPermissionState, 1);
        qwFrame.RegisterStep(GlobalVariable.Language_CN, '二', 'dateset', lang.DateSetting, lang.DateSetting, 'components/viewDateSet/viewDateSet.html?productPermissionState=' + productPermissionState, 0);

        //qwFrame.RegisterStep(GlobalVariable.Language_EN, 'A', 'prepaid', 'Stress Scenarios', 'Stress Scenarios', './StressScenarios/StressScenarios.html');
        qwFrame.RegisterStep(GlobalVariable.Language_CN, '三', 'Layered', lang.ClassStructure, lang.ClassStructure, 'components/Layered/Layered.html?productPermissionState=' + productPermissionState, 0);

        //qwFrame.RegisterStep(GlobalVariable.Language_EN, 'A-1', 'dateset', 'Date Settings', 'Date Settings', './ViewTrustDateSet.html');
        qwFrame.RegisterStep(GlobalVariable.Language_CN, '四', 'AccountInformation', lang.AccountInformation, lang.AccountInformation, 'components/AccountInformation/AccountInformationPortfolio.html?trustId=' + businessIdentifier, 0);
        qwFrame.RegisterStep(GlobalVariable.Language_CN, '五', 'FeeSettings', lang.FeeIssues, lang.FeeIssues, 'components/FeeSettings/FeeSettingsNew.html?productPermissionState=' + productPermissionState, 0);
        

        //qwFrame.RegisterStep(GlobalVariable.Language_EN, 'A', 'prepaid', 'Stress Scenarios', 'Stress Scenarios', './StressScenarios/StressScenarios.html');
        qwFrame.RegisterStep(GlobalVariable.Language_CN, '六', 'PaymentSetWizard', lang.PaymentSecquence, lang.PaymentSecquence, 'components/PaymentSequence/PaymentSequenceSetting.html?tid=' + businessIdentifier + '&productPermissionState=' + productPermissionState, 0);
        qwFrame.RegisterStep(GlobalVariable.Language_CN, '七', 'EventHandle', lang.ProductDesignTools, lang.ProductDesignTools, 'ProductDesignTools/index.html?trustId=' + businessIdentifier, 0);

        qwFrame.RegisterStep(GlobalVariable.Language_CN, '八', 'EventHandle', lang.EventHandle, lang.EventHandle, 'productManage/TrustManagement/PaymentSetWizard/PaymentSetWizard.html?productPermissionState=' + productPermissionState, 0);

      

        qwFrame.RegisterStep(GlobalVariable.Language_CN, '久', 'RefreshCashflowModel', lang.UpdateModel, lang.UpdateModel, 'productManage/TrustManagement/RefreshCashflowModel/RefreshCashflowModel.html?productPermissionState=' + productPermissionState, 0);

        //专项计划校验
        //qwFrame.RegisterStep(GlobalVariable.Language_CN, '七', 'VerifyTrust', lang.VerifyTrust, lang.VerifyTrust, 'productManage/TrustManagement/TrustVerify/TrustVerify.html?trustId=' + businessIdentifier, 0);
        //收益分配数据校验
        //qwFrame.RegisterStep(GlobalVariable.Language_CN, '七', 'DataVerification', lang.CheckAllocationData, lang.CheckAllocationData);

        //qwFrame.RegisterStep(GlobalVariable.Language_EN, 'A-2', 'fee', 'Fee', 'Fee', 'test3.html');
        //qwFrame.RegisterStep(GlobalVariable.Language_CN, '六', 'AssetDetailList', '基础资产信息管理', '基础资产信息管理', 'productManage/TrustManagement/TrustFollowUp/AssetDetailList.html', 0);

        //qwFrame.RegisterStep(GlobalVariable.Language_EN, 'A-1', 'dateset', 'Date Settings', 'Date Settings', './ViewTrustDateSet.html');
        //qwFrame.RegisterStep(GlobalVariable.Language_CN, '七', 'OriginalOwnerList', '原始权益人管理', '专项计划相关文档', 'productManage/TrustManagement/TrustFollowUp/OriginalOwnerList/OriginalOwnerList.html',0);
        //qwFrame.RegisterStep(GlobalVariable.Language_EN, 'A-2', 'fee', 'Fee', 'Fee', 'test3.html');

        //当前页面数据绑定
        qwFrame.PageDataBind(false);
        $(".iframe", parent.document).css({ "padding-bottom": "0" })
        //加载存续期首页
        var loadTrustIndexUrl = location.protocol + '//' + location.hostname + '/GoldenStandABS/www/productManage/TrustManagement/trustWizard_New/trustWizard.html?tid=' + businessIdentifier + '&productPermissionState=' + productPermissionState;
        function loadTrustIndex(loadTrustIndexUrl) {
            clearTimeout(timer);
            var timer = setTimeout(function () {
                $('.step>a').eq(0).trigger("click")
                $("#loading").fadeOut();
            })
          
        }
        function hideLoadingIndicator() {
            $("#loading").fadeOut();
        }
        loadTrustIndex(loadTrustIndexUrl);
        $('.step>a').click(function () {


            qwFrame.ChangeSetp(this);
                //var autoLayoutPlugins = $((document.getElementsByTagName('iframe')[0].contentWindow.document).getElementsByTagName('iframe')[0].contentWindow.document).find(".autoLayout-plugins");
        });
        
    });
   
    
});

       
