define(function (require) {

    var $ = require('jquery');
    require('jquery-ui');
    require('jquery.md5');
    require('jquery.cookie');
    require('jquery.localizationTool');
    require('bootstrap');
    var RoleOperate = require('gs/uiFrame/js/roleOperate');
    var common = require('common');
    var webStorage = require('gs/webStorage');
    var GlobalVariable = require('globalVariable');


    var ip
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

    $(function () {
        //$(document).keydown(function (event) {
        //    if (event.keyCode == 13) { //绑定回车 
        //        $("#login").click();
        //    }
        //});

        function alert(text) {
            $('#alertinfo').text(text);
            $('#alertinfo').css('display', 'block');

            setTimeout(function () {

                $('#alertinfo').css('display', 'none');
            }, 3000)

        }



        $("#login").click(function () {
            var self = $(this);
            //Disable the button，prevent duplicate submit.
            self.text('登录中...').prop("disabled", true);

            var UserName = $("#username").val();
            var Password = $.md5($("#password").val());
            var userLanguage = webStorage.getItem('userLanguage');

            RoleOperate.isExistUsername(UserName, function (r) {
                if (r == '0') {
                    self.text('登录').prop("disabled", false);
                    if (userLanguage && userLanguage.indexOf('en') > -1) {
                        alert("username is invalid")
                        //common.alertMsg("username is invalid", 0);
                    } else {
                        alert("用户名不存在！")
                        //common.alertMsg("用户名不存在", 0);

                    }
                }
                else  {
                    RoleOperate.isExistPassword(UserName, Password, function (r) {
                        self.text('登录').prop("disabled", false);

                        if (r == '1') {

                            var DataServices = {
                                insertLoginlogs: function (async, userName, act, ip) {
                                    insertLoginlogs(false, userName, '登入', ip, '', '', '')
                                },
                                cookieNameCreate: function (userName) {
                                    RoleOperate.cookieNameCreate(userName)
                                },
                                updateLastLoginDate: function (userName) {
                                    RoleOperate.updateLastLoginDate(userName);
                                },
                                isAdministrator: function (userName) {
                                    //判断是否是管理员(是超级管理员不控制，否则控制)
                                    RoleOperate.IsAdministrator(userName, function (res) {
                                        if (res[0].a != null) {
                                            webStorage.setItem("IsAdministrator", JSON.stringify(res[0].a));
                                        }
                                    })
                                },
                                checkChildrenAppPermission: function (userName) {
                                    //给子应用配置权限，默认先给bussinessSystem配置
                                    
                                    RoleOperate.checkChildrenAppPermission(userName, "bussinessSystem", function (res) {
                                        webStorage.setItem("childrenApp", JSON.stringify(res));
                                    })
                                    RoleOperate.checkChildrenAppPermission(UserName, "assetbussinessSystem", function (res) {
                                        webStorage.setItem("childrenAppAsset", JSON.stringify(res));
                                    })
                                },
                                getChildrenPathsPermission: function (userName) {
                                    //给菜单配权限,默认是基础资产
                                    RoleOperate.GetChildrenPathsPermission(userName, "basicAsset", function (res) {
                                        webStorage.setItem("CheckMenuData", JSON.stringify(res));
                                    })
                                },
                                getChildrenPathsPermission: function (userName) {
                                    //给菜单配权限,默认是基础资产
                                    RoleOperate.GetChildrenPathsPermission(userName, "dataImport", function (res) {
                                        webStorage.setItem("CheckMenuDataAsset", JSON.stringify(res));
                                    })
                                },
                                getApplicationsByUserName: function (userName) {
                                    //给应用配置权限
                                    RoleOperate.getApplicationsByUserName(userName, function (response) {
                                        webStorage.setItem('apps', JSON.stringify(response));
                                        webStorage.setItem('gs_UserName', userName);
                                    });
                                }
                            };

                            var defer = $.Deferred();
                            var filter = function (defer) {
                                if (true) {
                                    var promises = [
                                            DataServices.insertLoginlogs(false, UserName, '登入', ip),
                                            DataServices.cookieNameCreate(UserName),
                                            DataServices.updateLastLoginDate(UserName),
                                            DataServices.isAdministrator(UserName),
                                            DataServices.checkChildrenAppPermission(UserName),
                                            DataServices.getChildrenPathsPermission(UserName),
                                            DataServices.getApplicationsByUserName(UserName)
                                    ];
                              
                                    return $.when.apply($, promises);
                                }
                                defer.resolve();
                                return defer.promise();
                            };
                      
                          $.when(filter(defer)).then(function (res) {
                                    window.location.href = '../index.html';
                          })
                        
                        }
                        else if (r == '0') {
                            if (userLanguage && userLanguage.indexOf('en') > -1) {
                                alert("password is wrong！");
                                //common.alertMsg("password is wrong", 0);
                            } else {
                                alert("用户名或密码错误");
                                //common.alertMsg("密码错误", 0);
                            }

                        }
                        else {
                            alert("服务器异常稍后再试");
                        }
                    });
                }
            });

        });

        $('.form').keydown(function (event) {
            if (event.keyCode == 13) {
                $("#login").click();
            }
        })


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
                    'en_GB': 'Goldenstand ABS Login'

                },
                'element:a': {
                    'en_GB': 'ABS'

                },
                'class:alert-msg': {
                    'en_GB': 'password is wrong'
                },
                'id:userlabel': {
                    'en_GB': 'User Name'
                },
                'id:passlabel': {
                    'en_GB': 'Password'
                },
                'class:login_x': {
                    'en_GB': 'Account login'
                },
                'id:login': {
                    'en_GB': 'Login'
                },
                'placeholder::id:username': {
                    'en_GB': 'User Name'
                },
                'placeholder::id:password': {
                    'en_GB': 'Password'
                }

            }
        });

        var userLanguage = webStorage.getItem('userLanguage');
        if (userLanguage) {
            $('#selectLanguageDropdown').localizationTool('translate', userLanguage);
        }
        $('body').show();

    })
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


