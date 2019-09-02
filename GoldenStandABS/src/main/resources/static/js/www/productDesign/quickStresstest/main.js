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

    $('#selectLanguageDropdown_qcl').localizationTool({
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


            'id:changeCols': {
                'en_GB': 'Three-column layout'
            },
            'id:RemoveColButtomSH': {
                'en_GB': 'Show delete button'
            }

        }
    });

    var userLanguage = webStorage.getItem('userLanguage');
    if (userLanguage) {
        $('#selectLanguageDropdown_qcl').localizationTool('translate', userLanguage);
    }
    $('body').show();

    var businessIdentifier, steps = [], set = 'zh-CN', isLoad = true;
    var isShowRemove = false;
    var lang = {};

    var userLanguage = webStorage.getItem('userLanguage');
    if (userLanguage && userLanguage.indexOf('en') > -1) {
        lang.layout2 = 'Two Layout';
        lang.layout3 = 'Three Layout';
        lang.title = 'QuickStress Test';
        lang.tab1 = 'CashflowImport';
        lang.tab2 = 'ModelRefresh';
        lang.tab3 = 'StressScenarios';
    } else {
        lang.layout2 = '两栏布局';
        lang.layout3 = '三栏布局';
        lang.title = '快速压力测试';
        lang.tab1 = '现金流导入';
        lang.tab2 = '刷新现金流模型';
        lang.tab3 = '典型情景压力测试';

    }

    $(function () {
        businessIdentifier = common.getQueryString('TrustId');
        if (!businessIdentifier) {
            alert('Business Identifier is Required!');
            return;
        }
        //设置当前模块 业务条目的标识
        qwFrame.SetModuleBusiness(businessIdentifier);
        //设置当前页面浏览器tab页处显示标题
        qwFrame.SetPageTitle(GlobalVariable.Language_CN, lang.title);
        qwFrame.SetPageTitle(GlobalVariable.Language_EN, 'QuickStress Test');
        //设置当前页面模块名称（左侧导航处大标题）
        qwFrame.SetModuleTitle(GlobalVariable.Language_CN, lang.title);
        qwFrame.SetModuleTitle(GlobalVariable.Language_EN, 'QuickStress Test');

        qwFrame.RegisterStep(GlobalVariable.Language_CN, '1', 'import', lang.tab1, lang.tab1, 'productDesign/quickStresstest/CashflowImport/ImportIndex.html');
        qwFrame.RegisterStep(GlobalVariable.Language_EN, '1', 'import', 'CashflowImport', 'CashflowImport', 'productDesign/quickStresstest/CashflowImport/ImportIndex.html');

        qwFrame.RegisterStep(GlobalVariable.Language_CN, '2', 'refresh', lang.tab2, lang.tab2, 'productDesign/stresstest/RefreshCashflowModel/ModelRefreshIndex.html?ScenarioId=0');
        qwFrame.RegisterStep(GlobalVariable.Language_EN, '2', 'refresh', 'ModelRefresh', 'ModelRefresh', 'productDesign/stresstest/RefreshCashflowModel/ModelRefreshIndex.html?ScenarioId=0');
                                                          
        qwFrame.RegisterStep(GlobalVariable.Language_CN, '3', 'stress', lang.tab3, lang.tab3, 'productDesign/stresstest/StressScenarios/StressScenarios.html?ScenarioId=0');
        qwFrame.RegisterStep(GlobalVariable.Language_EN, '3', 'stress', 'StressScenarios', 'StressScenarios', 'productDesign/stresstest/StressScenarios/StressScenarios.html?ScenarioId=0');


        //当前页面数据绑定
        qwFrame.PageDataBind(false);
        $('.step>a').click(function () {
            qwFrame.ChangeSetp(this);
        });
        qwFrame.ChangeSetp($('.step>a[pageCode="import"]')[0]);
        //qwFrame.GotoStep = gotoStep;//注册跳转事件

        steps = qwFrame.PageData[set].Steps;//初始化steps数组


        // 记录当前列数
        var col = 2;
        // 根据参数显示列
        var columns = function (col) {
            if (parseInt(col) >= 4) col = 4;
            return 12 / parseInt(col);
        };
        // 自动布局
        var autoLayout = function (col) {
            var autoLayoutPluginsChild = $((document.getElementsByTagName('iframe')[0].contentWindow.document.getElementsByTagName('iframe')[0].contentWindow.document)).find(".autoLayout-plugins");
            var autoLayoutPlugins = $((document.getElementsByTagName('iframe')[0].contentWindow.documentt)).find(".autoLayout-plugins");


            autoLayoutPluginsChild.each(function () {
                var _class = $(this).attr('class');
                $(this).attr('class', _class.replace(/(\d)/, col));
            });
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
   

});

