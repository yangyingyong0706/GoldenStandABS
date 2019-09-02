
define(function (require) {
    var $ = require('jquery');
    require('bootstrap');
    require('asyncbox');
    var GlobalVariable = require('globalVariable');
    //var common = require('common');
    var permission = require('permission');
    var GSAdmin = require('gs/uiFrame/js/gs-admin-2');
    var tm = require('gs/childTabModel');
    var ko = require('knockout');
    var mapping = require('knockout.mapping');
    var Vue = require('Vue');


    var vm;
    var self = this;

    $(function () {

        $('.home-tab').click(function () {

            $("body", window.parent.document).find(".header.clearfix").removeClass("header_bg");
            $("body", window.parent.document).find(".header.clearfix").addClass("header_bg");
            $('.header-nav', top.document).css('display', 'none');
            $('#bussinessSystem', top.document).css('display', 'none');
            $('#others', top.document).css('display', '');
            $('#work', top.document)[0].contentWindow.location.replace('../navigator/main.html');

        });

        var basicDataPilot = '/GoldenStandABS/www/basicData/basicDataPilot.json';
        GSAdmin.init(basicDataPilot, function () {
            viewModel = new tm();
            $('.home-tab').click(function () {
                viewModel.goList();
            });
            viewModel.init();
            openMainPage();
            $('.chrome-tabs-shell').find('.active').addClass('chrome-tab-current');
        });
        function openMainPage() {
            viewModel.showId('iframeMainContent');
            viewModel.tabs.push({
                id: 'iframeMainContent',
                url: '../basicData/SystemSettings/CalendarDate/CalendarDateList.html',
                name: '系统设置',
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
        //内容管理权限控制
        //var liGroupsPermission=permission.systemSettingPermission(liGroups);
    });

});
