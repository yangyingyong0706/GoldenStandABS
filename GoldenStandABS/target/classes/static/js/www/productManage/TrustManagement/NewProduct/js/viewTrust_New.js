
define(function (require) {

    var $ = require('jquery');
    var anydialog = require('anyDialog');
    //var kendoGridModel = require('app/components/assetPoolList/js/kendoGridModel'); require('gs/Kendo/kendoGridModel');
    var kendoGridModel = require('gs/Kendo/kendoGridModel');
    var common = require('common');
    var gsUtil = require('gsUtil');
    var appGlobal = require('App.Global');
    var webStorage = require('gs/webStorage');
    var GlobalVariable = appGlobal.GlobalVariable;
    require('app/productManage/interface/numberFormat_interface');
    require('asyncbox');
    require('date_input');
    require('calendar');
    var qwFrame = require('app/productManage/TrustManagement/Common/Scripts/QuickWizard.FrameEnhanceCus');
    var trustId = gsUtil.getQueryString('tid');
    var tab = gsUtil.getHashValue('tab');
    var trustPoolCloseDate;
    var businessIdentifier;

    require('jquery.localizationTool');
    var webStorage = require('gs/webStorage');

    var lang = {};

    var userLanguage = webStorage.getItem('userLanguage');
    if (userLanguage && userLanguage.indexOf('en') > -1) {
        lang.ProductCreation = 'Product Creation';
        lang.ProductInformation = 'Product Info';
        lang.PartiesToTheTransaction = 'Related party';
        lang.TransactionDocuments = 'Trading Doc';
        lang.layout2 = 'Two Layout';
        lang.layout3 = 'Three Layout';
    } else {
        lang.ProductCreation = '新建产品向导';
        lang.ProductInformation = '产品信息';
        lang.PartiesToTheTransaction = '相关参与方';
        lang.TransactionDocuments = '交易文档';
        lang.layout2 = '两栏布局';
        lang.layout3 = '三栏布局';
    }



    $(function () {


        $('#selectLanguageDropdown_vtn').localizationTool({
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

                'class:changeCols': {
                    'en_GB': 'Three Layout'
                },
                'class:RemoveColButtomSH': {
                    'en_GB': 'Show Delete Button'
                }
            }
        });

        var userLanguage = webStorage.getItem('userLanguage');
        if (userLanguage) {
            $('#selectLanguageDropdown_vtn').localizationTool('translate', userLanguage);
        }
        $('body').show();


        console.log($("#RemoveColButtomSH"))
        //iframe取值，并且把该值暴露到top中去
        var stepList = $(".step", top.frames["asyncbox_1000_content"])[0].children;
        top.stepList = stepList;
        businessIdentifier = common.getQueryString('tid');
        if (common.getQueryString('tid')) {
            businessIdentifier = common.getQueryString('tid');
            $("#ModuleTitle").val("存续期配置向导");
        } else {
            businessIdentifier = 0;
            $("#navbarTitle").val("新建产品");
            $("#ModuleTitle").val("新建产品");
        }
        if (!businessIdentifier) {
            alert('Business Identifier is Required!');
            return;
        }
        //设置当前模块 业务条目的标识
        qwFrame.SetModuleBusiness(businessIdentifier);
        //设置当前页面浏览器tab页处显示标题
        qwFrame.SetPageTitle(GlobalVariable.Language_CN, lang.ProductCreation);
        qwFrame.SetPageTitle(GlobalVariable.Language_EN, 'new');
        //设置当前页面模块名称（左侧导航处大标题）
        qwFrame.SetModuleTitle(GlobalVariable.Language_CN, lang.ProductCreation);
        qwFrame.SetModuleTitle(GlobalVariable.Language_EN, 'Stress Test');
        //注册当前模块的步骤页面（左侧导航各步骤）
        qwFrame.RegisterStep(GlobalVariable.Language_CN, '1', 'prepaid', lang.ProductInformation, lang.ProductInformation, 'productManage/TrustManagement/ViewTrustItem/ViewTrustItem.html', 1);
        //qwFrame.RegisterStep(GlobalVariable.Language_EN, 'A', 'prepaid', 'Stress Scenarios', 'Stress Scenarios', './StressScenarios/StressScenarios.html');

        qwFrame.RegisterStep(GlobalVariable.Language_CN, '2', 'dateset', lang.PartiesToTheTransaction, lang.PartiesToTheTransaction, 'productManage/TrustManagement/TrustSPRole/TrustSPRole.html', 0);
        //qwFrame.RegisterStep(GlobalVariable.Language_EN, 'A-1', 'dateset', 'Date Settings', 'Date Settings', './ViewTrustDateSet.html');

        qwFrame.RegisterStep(GlobalVariable.Language_CN, '3', 'fee', lang.TransactionDocuments, lang.TransactionDocuments, 'productManage/TrustManagement/viewTrustAttatchedFiles/viewTrustAttatchedFiles.html', 0);
        //qwFrame.RegisterStep(GlobalVariable.Language_EN, 'A-2', 'fee', 'Fee', 'Fee', 'test3.html');

        //当前页面数据绑定
        qwFrame.PageDataBind(false);
        clearTimeout(timer);
        var timer = setTimeout(function () {
            $('.step>a').eq(0).trigger("click")
        })
        $('.step>a').click(function () {
            qwFrame.ChangeSetp(this);
        });
    });
    // 记录当前列数
    var col = 2;
    // 根据参数显示列
    var columns = function (col) {
        if (parseInt(col) >= 4) col = 4;
        return 12 / parseInt(col);
    };
    // 自动布局
    var autoLayout = function (col) {
        var autoLayoutPlugins = $((document.getElementsByTagName('iframe')[0].contentWindow.document)).find(".autoLayout-plugins");
        autoLayoutPlugins.each(function () {
            var _class = $(this).attr('class');
            $(this).attr('class', _class.replace(/(\d)/, col));
        });
    };
    // 布局切换
    $(document).on('click', "#changeCols", function () {
        var $this = $(this);
        col = $this.attr('data-col');
        autoLayout(columns(col));
        if (col == 2) {
            $(this).attr('data-col', '3').html(lang.layout3);
        } else {
            $(this).attr('data-col', '2').html(lang.layout2);
        }
    });

});


