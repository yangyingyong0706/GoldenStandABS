define(['jquery', 'knockout', 'knockout.mapping', 'gs/webStorage', 'gs/webProxy', 'gs/permission', 'gs/uiFrame/js/roleOperate', 'toast', 'jquery.cookie', 'jquery.localizationTool'], function ($, ko, mapping, webStorage, webProxy, Permission, RoleOperate, toast) {
    require('anyDialog');
    //require('app/productManage/TrustManagement/ViewTrustItem/renderControl');
    var GlobalVariable = require('globalVariable');
    var webProxy = require('gs/webProxy');
    // test ABS ci
    var common = require('common');
    //var toast = require('toast');
    Permission = Permission;
    var userName = RoleOperate.cookieName();
    var GSDialog = require('gsAdminPages');
    //获取客户端ip地址
    var ip;
    function setCookie(cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        var expires = "expires=" + d.toUTCString();
        document.cookie = cname + "=" + cvalue + "; " + expires + "; path=/";//path=/是根路径
    }
    $.ajax({
        cache: false,
        type: "GET",
        async: false,
        url: GlobalVariable.DataProcessServiceUrl + 'getIP',
        dataType: "json",
        contentType: "application/xml;charset=utf-8",
        data: {},
        success: function (response) {
            if (typeof response === 'string') {
                ip = response;
            }
        },
        error: function () {
            alert: '网络连接异常'
        }
    });
    webStorage.setItem('IPAddress', ip);

    function productPath(url) {
        var basicPath = '/GoldenStandABS/www/';
        return basicPath + url;

    };
    var userLanguage = webStorage.getItem('userLanguage');
    if (userLanguage && userLanguage.indexOf('en') > -1) {
        var _tabs = [{
            id: "basicAsset",
            name: 'Base Assets',
            isLoaded: true,
            url: productPath('basicAsset/nindex.html')
        },
            {
                id: "assetFilter",
                name: 'Asset Screening',
                isLoaded: false,
                url: productPath('assetFilter/index.html')
            },
            {
                id: "productDesign",
                name: 'Product Design',
                isLoaded: false,
                url: productPath('productDesign/index.html')
            },
            {
                id: "productManage",
                name: 'Product Management',
                isLoaded: false,
                url: productPath('productManage/index.html')
            },
            {
                id: "transactionManage",
                name: 'Transaction Management',
                isLoaded: false,
                url: productPath('transactionManage/index.html')
            },
            {
                id: "accounting",
                name: 'Accounting',
                isLoaded: false,
                url: productPath('accounting/index.html')
            },
            {
                id: "financialreport",
                name: 'Financial Reports',
                isLoaded: false,
                url: productPath('financialReport/Reporting.html')
            }
        ];
    } else {
        var _tabs = [
            {
                id: "basicAsset",
                name: '基础资产',
                isLoaded: true,
                url: productPath('basicAsset/nindex.html')

            },
            {
                id: "assetFilter",
                name: '资产筛选',
                isLoaded: false,
                url: productPath('assetFilter/index.html')
            },
            {
                id: "productDesign",
                name: '产品设计发行',
                isLoaded: false,
                url: productPath('productDesign/index.html')
            },
            {
                id: "productManage",
                name: '产品管理',
                isLoaded: false,
                url: productPath('productManage/index.html')
            }
        ];
    }
    var Model = function () {
        var self = this;
        self.tabs = ko.observableArray(),
        //bind($parent,$data)使得this指向model对象,item对应$data
        self.showId = ko.observable('');
        self.changeIframe = function (item, index) {
            //获取菜单数据
            var CheckMenuData = item.id();
            var userName = RoleOperate.cookieName();
            RoleOperate.GetChildrenPathsPermission(userName, CheckMenuData, function (res) {
                webStorage.setItem('CheckMenuData', JSON.stringify(res));
            })
            //var context = ko.contextFor(event.target); //获取绑定元素的上下文;event.target绑定View Model的DOM元素
            this.showId(item.id());
            if (!viewModel.tabs()[index()].isLoaded()) {
                viewModel.tabs()[index()].isLoaded('true');
            }
            webStorage.setItem('showId', item.id());
        }
        self.loginLogs = function () {
            common.showDialogPage('./roleManage/userManage/loginLogs.html?UserName=' + userName, '登录日志', parseInt(window.parent.innerWidth * 3 / 5), parseInt(window.parent.innerHeight * 4 / 5), function () {
                //runderGrid();
            }, null, false, null, true, false);
        }
        //清理缓存，取带ctrl+shift+del按钮的手动删除方法
        self.clearCache = function () {
            var time = (new Date()).getTime();
            webStorage.setItem('absVersion', time);
            $.toast({ type: 'success', message: '清理缓存成功' });
            //alert('清理缓存成功');
        }

        self.changePassword = function () {
            common.showDialogPage('./roleManage/userManage/changePassword.html?UserName=' + userName, '修改密码', parseInt(window.parent.innerWidth * 3 / 8), parseInt(window.parent.innerHeight * 4 / 10), function () {
            }, null, false, null, true, false);
        }

        self.loginOut = function () {
            //$.cookie('gs_UserName', null);
            //存入退出数据
            insertLoginlogs(false, userName, '退出', ip, '', '', '');

            var userLanguage = webStorage.getItem('userLanguage');
            webStorage.clear();
            setCookie("gs_UserName", "", -1);
            if (userLanguage) {
                webStorage.setItem('userLanguage', userLanguage);
            }

            window.location.href = webProxy.baseUrl + '/GoldenStandABS/www/login/login.html';
        }

        self.setting = function () {
            console.log("set");
        }

        //设置弹出自身资料修改的函数，暂关闭
        //function () {
        //RoleOperate.checkUserIdForSetting(userName, function (Userid) {

        //    var userid = JSON.parse(Userid)[0].UserId
        //    if (userid != 'delete' && userid != 'enable') {
        //        var set = "zh-CN";
        //        var editPageUrl = 'roleManage/userManage/membership.html?UserId=' + userid + '&set=' + set;
        //        var title = '编辑用户详情';
        //        var winHeight = $(window.parent.document).height();
        //        var winWidth = $(window.parent.document).width();
        //        common.showDialogPage(editPageUrl, title, winWidth * 3 / 5, winHeight * 4 / 5, function () {
        //            console.log('123');
        //        });

        //    }

        //})

        //}


    }
    //if (!webStorage.getItem('gs_UserName')) { 
    if (!userName) {
        window.location.href = './login/login.html';
        return
    }
    var model = new Model();

    //if (webStorage.getItem(model.showId())) {
    //    model.showId(webStorage.getItem(model.showId()));
    //} else { model.showId('basicAsset') }
    //Permission.init()


    //给子应用添加权限

    model.tabs = Permission.checkChildrenAppPermission(_tabs);
    var firstAppName = '';
    if (model.tabs.length > 0) {
        firstAppName = model.tabs[0].id;
        model.tabs[0].isLoaded = true;
    }

    //model.showId = firstAppName;
    var viewModel = mapping.fromJS(model),
    container = document.getElementById("container");
    ko.applyBindings(viewModel, container);
    if (firstAppName != '') {
        $('#' + firstAppName, parent.document).addClass('z-hide');
    }

    //默认选中第一个
    //var defaultModule = document.querySelector('.list .list-item a');
    //var defaultModule = $('#' + viewModel.showId())
    //defaultModule.click();
    //webStorage.setItem('showId', viewModel.showId());
    $(function () {

        $(".user-info").click(function () {
            $(".user-options").toggle();
        });

        //替换登陆者的UserName
        $(".user-name").html(userName)
        //给菜单配权限
        if (firstAppName != '') {
            RoleOperate.GetChildrenPathsPermission(userName, firstAppName, function (res) {
                webStorage.setItem("CheckMenuData", JSON.stringify(res));
            })
        }

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
                return true;
            },
            /* 
             * Translate the strings that appear in all the pages below
             */
            'strings': {
                'element:title': {
                    'en_GB': 'Goldenstand ABS'

                },
                'id:logo-wrap': {
                    'en_GB': 'ABS'

                },

                'id:setting': {
                    'en_GB': 'Setting'

                },

                'id:logout': {
                    'en_GB': 'Logout'

                }

            }
        });

        var userLanguage = webStorage.getItem('userLanguage');

        if (userLanguage) {
            $('#selectLanguageDropdown').localizationTool('translate', userLanguage);
        }
        $('body').show();

        //给应用加权限如果有就显示，没有就隐藏
        var apps = JSON.parse(webStorage.getItem('apps'));
        var IsAdministrator = webStorage.getItem("IsAdministrator");//判断用户是否为管理员
        //关闭页面，更换窗口时需要重新登陆
        if (apps == null && IsAdministrator == null) {
            window.location.href = './login/login.html';
            return
        }
        if (IsAdministrator == 1) {
            $("#work").contents().find("#bussinessSystem").show();
            $("#work").contents().find("#workBench").show();
            $("#work").contents().find("#systemSetting").show();
            $("#work").contents().find("#roleManage").show();
        } else {
            if (!apps.length == 0) {
                $.each(apps, function (i, v) {
                    $("#work").contents().find("#" + v.AppName).show();
                });
            }
        }
        //用户管理不用被控制


        $('.logo-wrap').click(function () {
            location.reload();

        });

        if (firstAppName != '') {
            $("li[class='list-item'][name=" + firstAppName + "]").addClass('active');
        }
    })
    $(window).unload(function () {
        insertLoginlogs(false, userName, '退出', ip, '', '', '');
    });

    insertLoginlogs = function (async, userName, act, ip, srcPage, desPage, url) {
        var executeParam = {
            SPName: 'QuickFrame.usp_InsertSystemLoginLogs', SQLParams: [
            { Name: 'UserName', value: userName, DBType: 'string' },
            { Name: 'Act', value: act, DBType: 'string' },
            { Name: 'IPAddress', value: ip, DBType: 'string' },
            { Name: 'SourcePage', value: srcPage, DBType: 'string' },
            { Name: 'destinationPage', value: desPage, DBType: 'string' },
            { Name: 'Url', value: url, DBType: 'string' }
            ]
        }
        var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonExecuteGet?';

        common.ExecuteGetData(async, svcUrl, 'QuickFrame', executeParam);
    }
});
