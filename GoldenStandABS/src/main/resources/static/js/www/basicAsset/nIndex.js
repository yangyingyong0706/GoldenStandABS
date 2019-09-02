
var viewModel = {};
define(function (require) {
    var $ = require('jquery');
    var ko = require('knockout');
    require('bootstrap');
    require('jquery-ui');
    require('gs/uiFrame/js/gs-admin-2.pages');
    require('asyncbox');
    var ko = require('knockout');
    var mapping = require('knockout.mapping');
    var GSAdmin = require('gs/uiFrame/js/gs-admin-2');
    var echarts = require('echarts');
    var tm = require('gs/childTabModel');
    require('jquery.localizationTool');
    var webStorage = require('gs/webStorage');
    var permission = require('gs/permission');

    $(function () {
        $('#selectLanguageDropdown_bal').localizationTool({
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

                'id:home_bal': {
                    'en_GB': 'Home'
                }
            }
        });

        var userLanguage = webStorage.getItem('userLanguage');
        if (userLanguage) {
            $('#selectLanguageDropdown_bal').localizationTool('translate', userLanguage);
        }
        $('body').show();

        var xmlUrl = '/GoldenStandABS/www/basicAsset/js/ribbon.json';
        if (userLanguage && userLanguage.indexOf('en') > -1) {
            xmlUrl = '/GoldenStandABS/www/basicAsset/js/ribbon_en.json';
        }
        GSAdmin.init(xmlUrl, function () {
            viewModel = new tm();
            $('.home-tab').click(function () {
                viewModel.goList();
            });
            viewModel.init();
            openMainPage();
            $('.chrome-tabs-shell').find('.active').addClass('chrome-tab-current');
        });

        $("#DashBoard").on("click", ".click_direction", function () {

            if ($(this).next().is(":visible")) {
                $(this).find("i").removeClass("rotate_fr");
            } else {
                $(this).find("i").addClass("rotate_fr");
            }
            $(this).next().slideToggle(500);
        })
        $(".fixed_control").click(function () {
            if (parseInt($("#wrapper").css("paddingLeft")) == "200") {
                $("#wrapper").animate({ "paddingLeft": "0" }, function () {
                    $(".fixed_control").css("left", "200px");
                    $(".fixed_control").find("i").css("transform", "rotate(" + 180 + "deg)");
                })

            } else {
                $("#wrapper").animate({ "paddingLeft": "200px" }, function () {
                    $(".fixed_control").css("left", "200px");
                    $(".fixed_control").find("i").css("transform", "rotate(" + 0 + "deg)");
                })
            }
        })
    })
    function openMainPage() {
        viewModel.showId('iframeMainContent');
        viewModel.tabs.push({
            id: 'iframeMainContent',
            url: './AssetList/AssetList.html',
            name: '基础资产一览',
            disabledClose: true
        });
    };
});

