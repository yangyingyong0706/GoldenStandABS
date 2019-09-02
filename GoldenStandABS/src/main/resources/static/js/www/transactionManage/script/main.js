getStringDate = function (strDate) {
    //var str = '/Date(1408464000000)/';
    if (!strDate) {
        return '';
    }
    var str = strDate.replace(new RegExp('\/', 'gm'), '');
    return eval('new ' + str);
}

define(function (require) {
    var $ = require('jquery');
    var ko = require('knockout');
    require('bootstrap');
    require('jquery-ui');
    require('gs/uiFrame/js/gs-admin-2.pages');
    require('asyncbox');
    var gt = require('app/components/trustList/js/trustList_Interface');
    var mapping=require('knockout.mapping');
    var GSAdmin = require('gs/uiFrame/js/gs-admin-2');
    var tm = require('gs/childTabModel');

    require('jquery.localizationTool');
    var webStorage = require('gs/webStorage');


    $(function () {
        $('#selectLanguageDropdown_transmgel').localizationTool({
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

                'id:home_transmgel': {
                    'en_GB': 'Home'
                }


            }
        });

        var userLanguage = webStorage.getItem('userLanguage');
        if (userLanguage) {
            $('#selectLanguageDropdown_transmgel').localizationTool('translate', userLanguage);
        }
        $('body').show();


        $(function () {
            function getWidth(obj) {
            var w = $(".iframe").width();
                obj.css("width", w + "px");
              }
            getWidth($(".chrome-tabs"));
            getWidth($(".chrome-tabs-shell"));
            var productManagePilot = 'ribbon.json';
            if (userLanguage && userLanguage.indexOf('en') > -1) {
                productManagePilot = 'ribbon_en.json';  
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
        var name = '交易管理产品列表';
        if (userLanguage && userLanguage.indexOf('en') > -1) {
            name = 'Transaction Manage Trust List';
        }
        function openMainPage() {
            viewModel.showId('iframeMainContent');
            viewModel.tabs.push({
                id: 'iframeMainContent',
                url: 'TM_Common/trustList/TrustList.html',
                name: name,
                disabledClose: true
            });
        };
        function changeWidth(obj) {
            var w = $("#main").width();
            obj.css("width", w + "px");
        }
        changeWidth($(".chrome-tabs-shell"));
        $(".fixed_control").click(function () {
            if (parseInt($(".work").css("paddingLeft")) == "200") {
                $(".work").animate({ "paddingLeft": "0" }, function () {
                    changeWidth($(".chrome-tabs-shell"));
                    $(".fixed_control").css("left", "200px");
                    $(".fixed_control").find("i").css("transform", "rotate(" + 180 + "deg)");
                })

            } else {
                $(".work").animate({ "paddingLeft": "200px" }, function () {
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
});
