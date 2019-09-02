var viewModel = {};
define(function (require) {
    var $ = require('jquery');
    require('jquery-ui');
    require('bootstrap');
    require('gs/uiFrame/js/gs-admin-2.pages');
    require('asyncbox');
    require('jquery.localizationTool');
    var webStorage = require('gs/webStorage');
    var ko = require('knockout');
    var mapping=require('knockout.mapping');
    var GSAdmin = require('gs/uiFrame/js/gs-admin-2');
    var RoleOperate = require('gs/uiFrame/js/roleOperate');
    var tm = require('gs/childTabModel');
    var Vue = require('Vue');
    var lang = {};
    $(function () {
        $('#selectLanguageDropdown_pmhome').localizationTool({
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
                'class:pmhome': {
                    'en_GB': 'Home'
                }
            }
        });

        var userLanguage = webStorage.getItem('userLanguage');
        if (userLanguage) {
            $('#selectLanguageDropdown_pmhome').localizationTool('translate', userLanguage);
        }
        $('body').show();
        var riskManageMenus = './riskManageMenus.json';
        lang.trustList = "投后总览";
        var userLanguage = webStorage.getItem('userLanguage');
        if (userLanguage && userLanguage.indexOf('en') > -1) {
            lang.trustList = "Risk DashBoard";
            riskManageMenus = './riskManageMenus_en.json';
        }

        GSAdmin.init(riskManageMenus, function () {
            viewModel = new tm();
            $('.home-tab').click(function () {
                viewModel.goList();
            });
            viewModel.init();
            openMainPage();
        });
    })

    function openMainPage() {
        var Tab = {
            id: 'RiskDashBoard',
            url: './riskDashboard.html',
            name: lang.trustList,
            disabledClose: true
        };
        viewModel.tabs.push(Tab);
        viewModel.changeShowId(Tab);
    };

    function changeWidth(obj) {
        var w = $("#main").width();
        obj.css("width", w + "px");
    }
    changeWidth($(".chrome-tabs-shell"));

    $(".fixed_control").click(function () {
        var self = this;
        if (parseInt($("#riskWrapper").css("paddingLeft")) == "200") {
            $("#riskWrapper").animate({ "paddingLeft": "0px" }, function () {
                changeWidth($(".chrome-tabs-shell"));
                $(self).css("left", "200px");
                $(self).find("i").css("transform", "rotate(" + 180 + "deg)");
            })
        } else {
            $("#riskWrapper").animate({ "paddingLeft": "200px" }, function () {
                changeWidth($(".chrome-tabs-shell"));
                $(self).css("left", "200px");
                $(self).find("i").css("transform", "rotate(" + 0 + "deg)");

            })
        }
    })

    $("#DashBoard").on("click", ".click_direction", function () {
        if ($(this).next().is(":visible")) {
            $(this).find("i").removeClass("rotate_fr");
        } else {
            $(this).find("i").addClass("rotate_fr");
        }
        $(this).next().slideToggle(500);
    })

});