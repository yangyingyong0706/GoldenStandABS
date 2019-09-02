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



        var productManagePilot = '/GoldenStandABS/www/productManage/productManagePilot.json';
        lang.trustList = "产品列表";
        var userLanguage = webStorage.getItem('userLanguage');
        if (userLanguage && userLanguage.indexOf('en') > -1) {
            lang.trustList = "Product List";
            productManagePilot = '/GoldenStandABS/www/productManage/productManagePilot_en.json';
        }
        GSAdmin.init(productManagePilot, function () {
            viewModel = new tm();
            $('.home-tab').click(function () {
                viewModel.goList();
            });
            viewModel.init();
            openMainPage();
        });
    })

    function openMainPage() {
        viewModel.showId('iframeMainContent');
        viewModel.tabs.push({
            id: 'iframeMainContent',
            //TrustList为公共页面
            url: '../components/trustList/TrustList.html',
            name: lang.trustList,
            disabledClose: true
        });
    };
    function changeWidth(obj) {
        var w = $("#main").width();
        obj.css("width", w + "px");
    }
    changeWidth($(".chrome-tabs-shell"));
    $(".fixed_control").click(function () {
        if (parseInt($("#wrapper").css("paddingLeft")) == "200") {
            $("#wrapper").animate({ "paddingLeft": "0" }, function () {
                changeWidth($(".chrome-tabs-shell"));
                $(".fixed_control").css("left", "200px");
                $(".fixed_control").find("i").css("transform", "rotate(" + 180 + "deg)");
            })

        } else {
            $("#wrapper").animate({ "paddingLeft": "200px" }, function () {
                changeWidth($(".chrome-tabs-shell"));
                $(".fixed_control").css("left", "200px");
                $(".fixed_control").find("i").css("transform", "rotate(" + 0 + "deg)");

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