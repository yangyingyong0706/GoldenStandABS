define(['jquery', 'gs/uiFrame/js/roleOperate', 'gs/webStorage', 'globalVariable'], function ($, RoleOperate, webStorage, gv) {
    var curWwwPath = window.document.location.href;
    var pathName = window.document.location.pathname;
    var pos = curWwwPath.indexOf(pathName);
    var appName = pathName.substring(1, pathName.substr(1).indexOf('/') + 1);
    var quickFrame = gv.TrustManagementServiceHostURL;
    var quickFrameSvc = gv.QuickFrameServiceUrl;
    //var GoldenStandABS = '/GoldenStandABS/www/';
    var index = 0;
    index = curWwwPath.indexOf("?");
    if (index > 0) {
        curWwwPath = curWwwPath.substring(0, index);
    }
    var userName = $.cookie('gs_UserName');
    var IsAdministrator = webStorage.getItem("IsAdministrator");//判断用户是否为管理员

    var UserPermissionData;
    
    function checkAppPermission(tabs) {
        if (IsAdministrator=='1') return tabs
        else{
            if (tabs) {
                var appTmp = [];
                var apps = JSON.parse(webStorage.getItem('apps'));
                var tabFilter = [];
                $.each(apps, function (i, app) {
                    tabFilter.push(app.AppName);
                });

                $.each(tabs, function (i, tab) {
                    if ($.inArray(tab.id, tabFilter) > -1) {
                        appTmp.push(tab);
                    }  
                });
                appTmp = tabs;
                return appTmp;
            }
        }
        };
    //子应用权限管理
    function checkChildrenAppPermission(ChildrenApp) {
        if (IsAdministrator == '1') return ChildrenApp
        else{
            if (ChildrenApp) {
                var ChildrenAppTmp = [];
                var ChildrenApps = JSON.parse(webStorage.getItem('childrenApp'));
                var tabFilter = [];
                $.each(ChildrenApps, function (i, app) {
                    tabFilter.push(app.PathName);
                });
                $.each(ChildrenApp, function (i, tab) {
                    if ($.inArray(tab.id, tabFilter) >-1) {
                        ChildrenAppTmp.push(this);
                    }
                });
                //ChildrenAppTmp = ChildrenApp;
                return ChildrenAppTmp;
            }
        }
    };
    //菜单权限管理
    function checkMenuPermission(ChildrenApp) {
        if (IsAdministrator == '1') { return ChildrenApp }
        else {
            if (ChildrenApp) {
                var ChildrenAppTmp = [];
                var ChildrenAppgroup = [];
                var ChildrenAppgroupData = [];
                var ChildrenApps = JSON.parse(webStorage.getItem("CheckMenuData"));
                if (ChildrenApps && ChildrenApps.length != 0) {
                    var tabFilter = [];
                    $.each(ChildrenApps, function (i, app) {
                        tabFilter.push(app.PathName);
                    });
                    $.each(ChildrenApp.group, function (j, v) {
                        $.each(v.elements, function (index, app) {
                            if (app) {
                                if ($.inArray(app.linkname, tabFilter) < 0) {
                                    delete (v.elements[index]);
                                    //删除没有的LinkName并且返回该数值，绑定的时候过滤掉空的数据
                                }
                            }
                        });
                        v.elements = $.grep(v.elements, function (app, i) {
                            return app != undefined;
                        })
                    });
                    return ChildrenApp;
                }
            }
        }

    };

    //用户是否有修改权限
    function productPermission(TrustId, userName, callback) {

        var sContent = "{'Schema':'QuickFrame','SPName':'usp_GetProductPermission','DBName':'QuickFrame','Params':{" +
                 "'TrustId':'" + TrustId + "'" +
                 ",'UserName':'" + userName + "'" + "}}";
        var json = "<SessionContext>" + sContent + "</SessionContext>";
        var serviceUrl = quickFrameSvc + "DataCUD";
        $.ajax({
            type: "POST",
            url: serviceUrl,
            dataType: "json",
            contentType: "application/xml;charset=utf-8",
            data: json,
            beforeSend: function () {
            },
            success: function (result) {
                if (IsAdministrator == '1') {
                    callback(1)
                } else {
                    callback(result)
                }
            },
            error: function (error) {
                alert("error:" + error);
            }
        });

    };

    //给系统设置加权限控制
    function systemSettingPermission(systemSettingchildrenApp) {
        if (IsAdministrator == '1') return systemSettingchildrenApp
        else{
        if (systemSettingchildrenApp) {
                var SystemappTmp = [];
                var apps = JSON.parse(webStorage.getItem('systemSettingchildrenApp'));
                var tabFilter = [];
                $.each(apps, function (i, app) {
                    tabFilter.push(app.PathName);
                });
                $.each(systemSettingchildrenApp, function (i, tab) {
                            if ($.inArray(tab.PathName, tabFilter) > -1) {
                                SystemappTmp.push(tab)
                            }
                });
                return SystemappTmp;
        }
        }
    };
    //判断用户管理子应用级别的权限
    function checkUserPermission(LiGroups) {
        if (IsAdministrator == '1') return LiGroups
        else {
            RoleOperate.checkChildrenAppPermission(userName, "roleManage", function (res) {
                UserPermissionData = JSON.stringify(res)
            });
            var tabFilter = [];
            var SystemappTmp = [];
            var UserPermissionData = JSON.parse(UserPermissionData)
            $.each(UserPermissionData, function (i, app) {
                tabFilter.push(app.PathName);
            });

            $.each(LiGroups, function (i, tab) {
                 if ($.inArray(tab.desc, tabFilter) > -1) {
                    SystemappTmp.push(tab)
                }
            });
            return SystemappTmp;
        }
    }
    
    var Permission = function () { };
    Permission.prototype = {
        checkAppPermission: checkAppPermission,
        checkMenuPermission: checkMenuPermission,
        checkChildrenAppPermission: checkChildrenAppPermission,
        productPermission: productPermission,
        systemSettingPermission: systemSettingPermission,
        checkUserPermission: checkUserPermission
    }
    return new Permission();
})
