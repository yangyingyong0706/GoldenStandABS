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
    var lang = {};
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
    require('jquery.localizationTool');
    webProxy = require('gs/webProxy');
    var webStorage = require('gs/webStorage');
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
                'en_GB': 'Three Layout'
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

    var userLanguage = webStorage.getItem('userLanguage');
    if (userLanguage && userLanguage.indexOf('en') > -1) {
        lang.layout2 = 'Two Layout';
        lang.layout3 = 'Three Layout';
        lang.show = 'Show delete button'
        lang.hide = 'Hide delete button'
        lang.title = 'CashflowSplit'
        lang.tab1 = 'Dateset'
        lang.tab2 = 'CashflowSplit'

    } else {
        lang.layout2 = '两栏布局';
        lang.layout3 = '三栏布局';
        lang.show = '显示删除按钮'
        lang.hide = '隐藏删除按钮'
        lang.title = '现金流拆分'
        lang.tab1 = '日期设置'
        lang.tab2 = '现金流拆分'
    }
    $(function () {
        if (!TrustId) {
            alert('Business Identifier is Required!');
            return;
        }
        //设置当前模块 业务条目的标识
        qwFrame.SetModuleBusiness(TrustId);

        //设置当前页面浏览器tab页处显示标题
        qwFrame.SetPageTitle(GlobalVariable.Language_CN, lang.title);
        qwFrame.SetPageTitle(GlobalVariable.Language_EN, 'CashflowSplit');

        //设置当前页面模块名称（左侧导航处大标题）
        qwFrame.SetModuleTitle(GlobalVariable.Language_CN, lang.title);
        qwFrame.SetModuleTitle(GlobalVariable.Language_EN, 'CashflowSplit');

        qwFrame.RegisterStep(GlobalVariable.Language_CN, '1', StepsCode.Dateset, lang.tab1, lang.tab1, 'components/viewDateSet/viewDateSet.html');
        qwFrame.RegisterStep(GlobalVariable.Language_EN, '1', StepsCode.Dateset, 'Dateset', 'Dateset', 'components/viewDateSet/viewDateSet.html');

        qwFrame.RegisterStep(GlobalVariable.Language_CN, '2', StepsCode.Split, lang.tab2, lang.tab2, 'productDesign/stresstest/CashflowSplit/CashflowSplit.html');
        qwFrame.RegisterStep(GlobalVariable.Language_EN, '2', StepsCode.Split, 'CashflowSplit', 'CashflowSplit', 'productDesign/stresstest/CashflowSplit/CashflowSplit.html');

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
    //function getHeight() {
    //    var h = $(window).height();
    //    //$(".work").css("height", h - 150 + "px");
    //}
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

    // 记录当前列数
    var col = 2;
    // 根据参数显示列
    var columns = function (col) {
        if (parseInt(col) >= 4) col = 4;
        return 12 / parseInt(col);
    };
    // 自动布局
    var autoLayout = function (col) {
        var autoLayoutPluginsChild =document.getElementsByTagName('iframe')[0].contentWindow.document.getElementsByTagName('iframe')[0] && $((document.getElementsByTagName('iframe')[0].contentWindow.document.getElementsByTagName('iframe')[0].contentWindow.document)).find(".autoLayout-plugins");
        var autoLayoutPlugins = $((document.getElementsByTagName('iframe')[0].contentWindow.document)).find(".autoLayout-plugins");


        autoLayoutPluginsChild && autoLayoutPluginsChild.each(function () {
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
    //显示隐藏删除按钮
    var isShowRemove = false;
    $("#RemoveColButtomSH").click(function () {
        var $this = $(this);
        isShowRemove = !isShowRemove;
        if (isShowRemove == true)
            $this.text(lang.hide);
        else
            $this.text(lang.show);
        RemoveColButtomSH(isShowRemove);
    });
    function RemoveColButtomSH(show) {
        var sytles = document.CSSStyleSheet ? document.CSSStyleSheet : document.styleSheets;
        $.each(sytles, function (i, sheet) {
            if (sheet.href && sheet.href.indexOf("trustWizard.css") > -1) {
                var rs = sheet.cssRules ? sheet.cssRules : sheet.rules;
                $.each(rs, function (j, cssRule) {
                    if (cssRule.selectorText && cssRule.selectorText.indexOf(".btn") > -1 && cssRule.selectorText.indexOf(".btn-remove") > -1) {
                        if (show == true) {
                            cssRule.style.display = "inline-block";
                        } else {
                            cssRule.style.display = "none";
                        }
                        return false;
                    }
                });
                return false;
            }
        });
    }
});