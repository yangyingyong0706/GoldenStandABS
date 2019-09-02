var viewModel = {};

function asidetest(asideListUrl) {
    $("#accounting").attr({ src: asideListUrl });
}

define(function (require) {
    var $ = require('jquery');
    var ko = require('knockout');
    require('bootstrap');
    require('jquery-ui');
    require('gs/uiFrame/js/gs-admin-2.pages');
    require('asyncbox');
    //var asidetest = require('app/transactionManage/script/test');
    var mapping = require('knockout.mapping');
    var GSAdmin = require('gs/uiFrame/js/gs-admin-2');
    var tm = require('gs/childTabModel');
    var vue = require('Vue');
    webProxy = require('gs/webProxy');
    require('jquery.localizationTool');
    webStorage = require('gs/webStorage');
    require("app/projectStage/js/project_interface");
    lang = {};
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
            'id:title1': {
                'en_GB': 'Home'
            }
        }
    });

    var userLanguage = webStorage.getItem('userLanguage');
    if (userLanguage) {
        $('#selectLanguageDropdown_qcl').localizationTool('translate', userLanguage);
    }
    $('body').show();

    var webStorage = require('gs/webStorage');

    if (userLanguage && userLanguage.indexOf('en') > -1) {
        /*lang.tab1 = 'Import accounting data';
        lang.tab2 = 'Accounting ledger management';
        lang.tab3 = 'Accounting subject management';
        lang.tab4 = 'Accounting scene configuration';
        lang.tab5 = 'Accounting voucher inquiry';
        lang.tab6 = 'Accounting Report';*/
        lang.tab7 ='Accounting record'
    } else {
        /*lang.tab1 = '导入会计数据';
        lang.tab2 = '会计账套管理';
        lang.tab3 = '会计科目管理';
        lang.tab4 = '会计场景配置';
        lang.tab5 = '会计凭证查询';
        lang.tab6 = '会计报表';*/
        lang.tab7 = '会计分录'
    }
    $(function () {

        //var xmlUrl = './ribbon.json';

        //GSAdmin.init(xmlUrl, function () {
        //    viewModel = new tm();
        //    $('.home-tab').click(function () {
        //        viewModel.goList();
        //    });
        //    viewModel.init();
        //    var btnList = $(".ribbonGroup");
        //    for (i = 0; i < btnList.length; i++) {
        //        (function (i) {
        //            btnList[i].onclick = function (i) {
        //                $(this).addClass("active").siblings().removeClass("active");
        //            }
        //        })(i)
        //    };
        //    openMainPage();

        //});

        //$(".fixed_control").click(function () {
        //    if (parseInt($(".work").css("paddingLeft")) == "200") {
        //        $(".work").animate({ "paddingLeft": "0" }, function () {

        //            $(".fixed_control").css("left", "198px");
        //            $(".fixed_control").find("i").css("transform", "rotate(" + 180 + "deg)");
        //        })

        //    } else {
        //        $(".work").animate({ "paddingLeft": "200px" }, function () {
        //            $(".fixed_control").css("left", "198px");
        //            $(".fixed_control").find("i").css("transform", "rotate(" + 0 + "deg)");

        //        })
        //    }
        //})

        //$("#DashBoard").on("click", ".click_direction", function () {
        //    if ($(this).next().is(":visible")) {
        //        $(this).find("i").removeClass("rotate_fr");
        //    } else {
        //        $(this).find("i").addClass("rotate_fr");
        //    }
        //    $(this).next().slideToggle(500);
        //});

        //function openMainPage() {
        //    viewModel.showId('iframeMainContent');
        //    viewModel.tabs.push({
        //        id: 'iframeMainContent',
        //        url: 'updata/viewAccountingUpdata.html',
        //        name: '会计核算'
        //    });
        //};
        viewModel = new tm();
        $('.home-tab').click(function () {
            $("body", window.parent.document).find(".header.clearfix").removeClass("header_bg");
            $("body", window.parent.document).find(".header.clearfix").addClass("header_bg");
            $('.header-nav', top.document).css('display', 'none');
            $('#bussinessSystem', top.document).css('display', 'none');
            $('#others', top.document).css('display', '');
            $('#work', top.document)[0].contentWindow.location.replace('../navigator/main.html');
            viewModel.goList();
        });
        $(".page").on("click", ".click_direction", function () {

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
        var LiGroups = [
             /*{
                  name : lang.tab1,
                  type : "button",
                 icon: "iconfont icon-shujudaorumoban",
                 linkname: "ImportAccountingData",
                 active: "active",
                 linkurl: "javascript:ImportAccountingData",
                 asideUrl: "updata/viewAccountingUpdata.html"
             }, {
                 "name": lang.tab2,
                 "type": "button",
                 "icon": "iconfont icon-zhangtaoguanliicon",
                 "linkname": "AccountingBook",
                 "linkurl": "javascript:AccountingBook",
                 asideUrl: "accountingBook/viewAccountingBook.html"
             }, {
                 "name": lang.tab3,
                 "type": "button",
                 "icon": "iconfont icon-kemuguanli",
                 "linkname": "AccountingSubjects",
                 "linkurl": "javascript:AccountingSubjects",
                 asideUrl: "accountingSubjects/viewAccountingSubjects.html"
             }, {
                 "name": lang.tab4,
                 "type": "button",
                 "icon": "iconfont icon-changjingguanli",
                 "linkname": "AccountingSceneConfig",
                 "linkurl": "javascript:AccountingSceneConfig",
                 asideUrl: "accountingSceneConfig/viewAccountingSceneConfig.html"
             }, {
                 "name": lang.tab5,
                 "type": "button",
                 "icon": "iconfont icon-pingzhengchaxun",
                 "linkname": "AccountingVoucher",
                 "linkurl": "javascript:AccountingVoucher",
                 asideUrl: "accountingVoucher/viewAccountingVoucher.html"
             }, {
                 "name": lang.tab6,
                 "type": "button",
                 "icon": "iconfont icon-pingzhengguanli",
                 "linkname": "AccountingStatements",
                 "linkurl": "javascript:AccountingStatements",
                 asideUrl: "accountingStatements/viewAccountingStatements.html"
             },*/
             {
                 "name": lang.tab7,
                 "type": "button",
                 "icon": "iconfont icon-accountingEntry",
                 "linkname": "accountingEntry",
                 "linkurl": "javascript:accountingEntry",
                 asideUrl: "accountingEntry/accountingEntry.html"
             }

        ]

       

        //var checkUserPermissiondata = permission.checkUserPermission(LiGroups)
        var vm = new vue({
            el: '#wrapper',
            data: {
                liSource: LiGroups,
                sel: LiGroups[0].asideUrl
            },
            methods: {
                switchPage: function (item) {
                    var _this = this;
                    _this.sel = item.asideUrl;
                    $.each(_this.liSource, function (i, v) {
                        v.active = '';
                    })
                    item.active = 'active';
                }
            }
        });

        //点击左边的菜单栏给其添加高亮的效果
        $('.ribbonButton').click(function () {
            $(this).addClass('active').siblings().removeClass('active')
        })
    })
});


