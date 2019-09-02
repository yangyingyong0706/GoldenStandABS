define(function (require) {
    var $ = require('jquery');
    require('jquery.cookie');
    require('jquery.localizationTool');
    var webStorage = require('gs/webStorage');
    var RoleOperate = require('gs/uiFrame/js/roleOperate');
    var userName = $.cookie('gs_UserName');
    var lastCheckMenuData = webStorage.getItem("CheckMenuData");

    $('#quite').click(function () {
        $.cookie('gs_UserName', null);
        window.location.href = location.protocol + '//' + location.host + '/GoldenStandABS/www/login/login.html';
    });
    $(function () {
        var apps = JSON.parse(webStorage.getItem('apps'));
        var IsAdministrator = webStorage.getItem("IsAdministrator");//判断用户是否为管理员
        // 四个模块下功能ID集合
        var assetsId = ['assetSideDataCenter', 'assetManageDataCenter', 'creditLoan', 'enterpriseInfo'];
        var businessId = ['bussinessSystem', 'quickDeal', 'quickBook', 'projectStage'];
        var investId = ['riskManagement', 'informationDisclosure'];
        var systemId = ['workBench', 'teamWork', 'roleManage', 'systemSetting'];
        //关闭页面，更换窗口时需要重新登陆
        if (apps == null && IsAdministrator == null) {
            window.location.href = location.protocol + '//' + location.host + '/GoldenStandABS/www/login/login.html';
        }
        // 超级管理员所有模块可见
        if (IsAdministrator == 1) {
            $('.assortDiv').css('display', 'block');
            $('.control-service-item').css('display', 'inline-block');
        } else {
            if (apps && apps.length) {
                var assetsModuleLen = moduleGrouping(assetsId, 'assetsDatas').length
                var businessModuleLen = moduleGrouping(businessId, 'businessManagement').length;
                if (businessModuleLen < 5) {
                    $("#businessManagement li").css("width", "50%");
                }
                var investModuleLen = moduleGrouping(investId, 'investManagement').length
                var systemModuleLen = moduleGrouping(systemId, 'systemLayout').length

                assetsModuleLen != 0 ? $("#assetsDatas").css('display', 'block') : ''
                businessModuleLen != 0 ? $("#businessManagement").css('display', 'block') : ''
                investModuleLen != 0 ? $("#investManagement").css('display', 'block') : ''
                systemModuleLen != 0 ? $("#systemLayout").css('display', 'block') : ''
            }
        }
        // 根据角色权限分组
        function moduleGrouping(ArrNames, id) {
            var _newArray = [], _developHtml = '';
            _developHtml += '<li class="control-service-item disabled" id="develop1" style="display:inline-block">'
            _developHtml += '<a href="#" style="padding-top:42px">'
            _developHtml += '<div class="home-service-icon">'
            _developHtml += '<svg t="1560910979468" class="icon" style="" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4442" xmlns:xlink="http://www.w3.org/1999/xlink" width="200" height="200">'
            _developHtml += '<defs><style type="text/css"></style></defs>'
            _developHtml += '<path d="M972.494885 554.512558h-418.017159v418.187779a43.273307 43.273307 0 1 1-85.075023 0V554.512558H51.321561a43.273307 43.273307 0 1 1 0-85.09635H469.338721V51.185775a43.273307 43.273307 0 1 1 85.075023 0v418.166451h418.017159A43.273307 43.273307 0 1 1 972.494885 554.512558z" p-id="4443"></path>'
            _developHtml += '</svg>'
            _developHtml += '</div>'
            _developHtml += '</a>'
            _developHtml += '</li>'

                $.each(apps, function (i, v) {
                var _index = $.inArray(v.AppName, ArrNames);
                if (_index >= 0) {
                    _newArray.push(v.AppName);
                        $("#" + v.AppName).removeClass('goldClass');
                    $("#" + v.AppName).css('display', 'inline-block');
                }
                });
                // 对于没有权限位置采用待开发图标+替换（每个模块4个功能项）
                for (var i = _newArray.length ; i < 4 ; i++) {
                    $("#" + id + " ul").append(_developHtml)
                }
                // 删除被隐藏的li元素(方便定义边框样式)
                $("#" + id + " ul li").remove('.goldClass');

            return _newArray
        }

        //控制系统设置功能向导
        function getCheckChildrenApp() {
            RoleOperate.checkChildrenAppPermission(userName, "systemSetting", function (res) {
                webStorage.setItem("systemSettingchildrenApp", JSON.stringify(res));
            })
        }
        getCheckChildrenApp()

        function projectStagechildrenApp() {
            RoleOperate.checkChildrenAppPermission(userName, "projectStage", function (res) {
                webStorage.setItem("projectStagechildrenApp", JSON.stringify(res));
            })
        }
        projectStagechildrenApp();

        function assetManageDataCenterchildrenApp() {
            RoleOperate.checkChildrenAppPermission(userName, "assetManageDataCenter", function (res) {
                webStorage.setItem("assetManageDataCenterchildrenApp", JSON.stringify(res));
            })
        }
        assetManageDataCenterchildrenApp();

        function riskManagementchildrenApp() {
            RoleOperate.checkChildrenAppPermission(userName, "riskManagement", function (res) {
                webStorage.setItem("riskManagementchildrenApp", JSON.stringify(res));
            })
        }
        riskManagementchildrenApp();

        $('#selectLanguageDropdown').localizationTool({
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
                parent.location.reload()
                return true;
            },

            /* 
             * Translate the strings that appear in all the pages below
             */
            'strings': {
                'element:title': {
                    'en_GB': 'Goldenstand ABS'

                },
                'element:p': {
                    'en_GB': '<p style="font: italic 16px Georgia, serif">Please select the following selection to start working.</p>'

                },
                'id:bussinessSystemLabel': {
                    'en_GB': 'ABS Business'

                },

                'id:workBenchLabel': {
                    'en_GB': 'My Works/Workbench'

                },

                'id:systemSettingLabel': {
                    'en_GB': 'Setting'

                },

                'id:roleManageLabel': {
                    'en_GB': 'User Management'

                }

            }

        });

        var userLanguage = webStorage.getItem('userLanguage');

        if (userLanguage) {
            $('#selectLanguageDropdown').localizationTool('translate', userLanguage);
        }
        $('body').show();


        var workUrl = {
            'workBench': '../WorkBench/WorkBench.html?workBench=' + "workBench",
            'quickDeal': '/quickdeal/#/login?redirectURL=%2F',
            'systemSetting': '../basicData/index.html?systemSetting=' + "systemSetting",
            'roleManage': '../roleManage/roles.html?roleManage=' + "roleManage",
            'riskManagement': '../riskManagement/index.html?riskManagement=' + "riskManagement",
            'projectStage': '../projectStage/Stage.html?projectStage=' + "projectStage",
            'ProjectInformationParty': '../ProjectInformationParty/Stage.html?projectStage=' + "projectStage",
            'enterpriseInfo': '/QuickEnterpriseManagement/Pages/NewEnterprise/EnterpriseList.html',//企业信息管理
            'informationDisclosure': '/IMAdmin/index.html',
            'creditLoan': '',
            'assetManageDataCenter': '../managementDataCenter/index.html',
            'assetSideDataCenter': '/AssetDataCenter/www/index.html',
            'quickBook': 'http://10.0.0.170/QuickBook_Product/www/login/login.html',
            'teamWork': 'http://192.168.1.213/quickteam/index.html'
        }

        function iframeChange() {
            $("#work")
        }
        $('.control-service-item').click(function () {
            
            //子应用权限配置
            $("body", window.parent.document).find(".header.clearfix").removeClass("header_bg");   
            var workId = $(this).attr('id');
            if (workId == "bussinessSystem") {
                webStorage.setItem("CheckMenuData", lastCheckMenuData);
                $('.header-nav', parent.document).css('display', '');
                $('.ads', parent.document).css('display', 'none');
                $('#work', parent.document).addClass('z-hide');
                $('#' + webStorage.getItem('showId'), parent.document).removeClass('z-hide');

            }
            else if (workId == "quickDeal") {//当为quickDeal，新打开一个tab
                window.open(workUrl[workId], "_blank");
            }
            else if (workId == "assetSideDataCenter") {
                window.open(workUrl[workId], "_blank");
            }
            else if (workId == "quickBook") {
                window.open(workUrl[workId], "_blank");
            }
            else if (workId == "teamWork") {
                window.open(workUrl[workId], "_blank");
            }
            else if (workId == 'projectStage') {
                webStorage.setItem("CheckMenuData", webStorage.getItem("projectStagechildrenApp"));
                $('#work', parent.document).removeClass('z-hide');
                $('#work', parent.document)[0].contentWindow.location.replace(workUrl[workId]);
                $('.ads', parent.document).css('display', '');
            }
            else if (workId == 'ProjectInformationParty') {
                webStorage.setItem("CheckMenuData", webStorage.getItem("ProjectInformationPartychildrenApp"));
                $('#work', parent.document).removeClass('z-hide');
                $('#work', parent.document)[0].contentWindow.location.replace(workUrl[workId]);
                $('.ads', parent.document).css('display', '');
            }
            else if (workId == 'riskManagement') {
                webStorage.setItem("CheckMenuData", webStorage.getItem("riskManagementchildrenApp"));
                $('#work', parent.document).removeClass('z-hide');
                $('#work', parent.document)[0].contentWindow.location.replace(workUrl[workId]);
                $('.ads', parent.document).css('display', '');
            }
            else if (workId == "informationDisclosure") {//当为informationDisclosure，新打开一个tab
                window.open(workUrl[workId], "_blank");
            }
            else if (workId == "creditLoan") {
                alert('此功能还在开发中')
            }
            else if (workId == "assetManageDataCenter") {
                webStorage.setItem("CheckMenuData", webStorage.getItem("assetManageDataCenterchildrenApp"));
                $('#work', parent.document).removeClass('z-hide');
                $('#work', parent.document)[0].contentWindow.location.replace(workUrl[workId]);
                $('.ads', parent.document).css('display', '');
            }
            else if (workId == "enterpriseInfo") {
                webStorage.setItem("CheckMenuData", webStorage.getItem("enterpriseInfochildrenApp"));
                $('#work', parent.document).removeClass('z-hide');
                $('#work', parent.document)[0].contentWindow.location.replace(workUrl[workId]);
                $('.ads', parent.document).css('display', '');
            }
            else if (workId == "systemSetting") {
                webStorage.setItem("CheckMenuData", webStorage.getItem("systemSettingchildrenApp"));
                $('#work', parent.document).removeClass('z-hide');
                $('#work', parent.document)[0].contentWindow.location.replace(workUrl[workId]);
                $('.ads', parent.document).css('display', '');
            } else {
                $('#work', parent.document).removeClass('z-hide');
                $('#work', parent.document)[0].contentWindow.location.replace(workUrl[workId]);
                $('.ads', parent.document).css('display', '');
            }


        });
    })

})