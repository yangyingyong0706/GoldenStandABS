define(['jquery', 'common', 'jquery.cookie'], function ($, common) {
    function siteApp() {
        var curWwwPath = window.document.location.href;
        var pathName = window.document.location.pathname;
        var pos = curWwwPath.indexOf(pathName);
        var siteApp = pathName.substring(1, pathName.substr(1).indexOf('/') + 1);
        return siteApp;
    }

    var RoleOperate = function () { };
    RoleOperate.prototype = {
        dbName: 'QuickFrame',
        schema: 'QuickFrame',
        siteAppUrl: location.protocol + "//" + location.host + '/' + siteApp(),
        roleService: location.protocol + "//" + location.host + '/' + siteApp() + '/service/FrameService.svc/',
        QucikFrameRoleService: location.protocol + "//" + location.host + '/' + 'GoldenStandABS/service' + '/FrameService.svc/',
        //QucikFrameRoleService: location.protocol + "//" + location.host + '/' + 'QuickFrame' + '/FrameService.svc/',

        //创建Cookie Name    
        cookieNameCreate: function (userName) {
            $.cookie('gs_UserName', userName, { expires: 1, path: '/' });
            $.cookie('GS_LoginName', userName, { expires: 1, path: '/' });
        },

        //删除Cookie Name
        cookieNameRemove: function () {
            $.cookie('gs_UserName', null, { path: '/' });
        },

        //获取Cookie Name
        cookieName: function () {
            return $.cookie('gs_UserName');
        },
        //判断用户是否是超级管理员
        IsAdministrator: function (userName, callback) {
            var self = this;
            var json = "{'SPName':'usp_IsAdministrator','Params':{" + "'UserName':'" + userName + "'}}";
            var serviceUrl = self.roleService + "DataRead?dbName=" + self.dbName + "&schema=" + self.schema + "&json=" + json;
            $.ajax({
                url: serviceUrl,
                type: "GET",
                async: false,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (res) {
                    var json = jQuery.parseJSON(res);
                    callback(json);
                },
                error: function (error) {
                    console('zcerror');
                    alert("error:" + error);
                }
            });


           // var self = this;
           // var json = "{'DBName':'" + self.dbName + "','Schema':'" + self.schema + "','SPName':'usp_IsAdministrator','Params':{'UserName':'" + userName + "'}}";
           // json = "<SessionContext>{0}</SessionContext>".format(json);
           //var serviceUrl = self.roleService + "DataCUD";
           // $.ajax({
           //     url: serviceUrl,
           //     type: "POST",
           //     contentType: "application/json; charset=utf-8",
           //     dataType: "json",
           //     beforeSend: function () {

           //     },
           //     success: function (data) {
           //         debugger
           //         var json = jQuery.parseJSON(data);
           //         callback(json);
           //     },
           //     error: function (data) {
           //         alert('Error:' + data);
           //     }
           // });
        },

        //快速配置权限
        SavePermission: function (items, callback) {
            var self = this;
            var json = "{'DBName':'" + self.dbName
                + "','Schema':'" + self.schema
                + "','SPName':'usp_UpdateRolePermission','Params':{'items':'" + items
                + "'}}";
            json = "<SessionContext>{0}</SessionContext>".format(json);
            var serviceUrl = self.roleService + "DataCUD";
            $.ajax({
                type: "POST",
                url: serviceUrl,
                dataType: "json",
                contentType: "application/xml;charset=utf-8",
                data: json,
                beforeSend: function () {
                },
                success: function (r) {
                    callback(r);
                },
                error: function (response) {
                    alert("error is :" + response);
                }
            });
        },
        //检查路径的权限
        pathPremisson: function (applicationName, path, userName, callback) {
            var self = this;
            var json = "{'DBName':'" + self.dbName + "','Schema':'" + self.schema + "','SPName':'usp_PathPermission','Params':{'ApplicationName':'" + applicationName + "','Path':'" + path + "','UserName':'" + userName + "'}}";
            json = "<SessionContext>{0}</SessionContext>".format(json);
            var serviceUrl = self.roleService + "DataCUD";
            $.ajax({
                type: "POST",
                url: serviceUrl,
                dataType: "json",
                contentType: "application/xml;charset=utf-8",
                data: json,
                beforeSend: function () {
                },
                success: function (r) {
                    callback(r);
                },
                error: function (response) {
                    alert("error is :" + response);
                }
            });
        },

        //检查模块的权限
        modulePremisson: function (applicationName, path, module, userName, callback) {
            var self = this;
            path = encodeURIComponent(path);
            var json = "{'DBName':'" + self.dbName + "','Schema':'" + self.schema + "','SPName':'usp_ModulePermission','Params':{'ApplicationName':'" + applicationName + "','Path':'" + path + "','Module':'" + module + "','UserName':'" + userName + "'}}";
            json = "<SessionContext>{0}</SessionContext>".format(json);
            var serviceUrl = self.roleService + "DataCUD";
            $.ajax({
                type: "POST",
                url: serviceUrl,
                dataType: "json",
                contentType: "application/xml;charset=utf-8",
                data: json,
                beforeSend: function () {
                },
                success: function (r) {
                    callback(r);
                },
                error: function (response) {
                    alert("error is :" + response);
                }
            });
        },

        //获取所有用户，也可能会用于其他系统
        getAllUsers: function (callback) {
            var self = this;
            var sContent = "{'SPName':'usp_GetAllUsers','Params':{}}";
            var serviceUrl = self.roleService + "DataRead?dbName=" + self.dbName + "&schema=" + self.schema + "&json=" + sContent;
            $.ajax({
                url: serviceUrl,
                type: "GET",
                contentType: "application/json; charset=utf-8",
                dataType: "jsonp",
                beforeSend: function () {

                },
                success: function (data) {
                    var json = jQuery.parseJSON(data);
                    callback(json);
                },
                error: function (data) {
                    alert('Error:' + data);
                }
            });
        },
        saveApplicationData: function (xml, flag, applicationId, callback) {
            var self = this;
            var json = "{'DBName':'" + self.dbName + "','Schema':'" + self.schema + "','SPName':'usp_SaveApplication','Params':{'items':'" + xml + "','Flag':'" + flag + "','ApplicationId':'" + applicationId + "'}}";
            json = "<SessionContext>{0}</SessionContext>".format(json);
            var serviceUrl = self.roleService + "DataCUD";
            $.ajax({
                type: "POST",
                url: serviceUrl,
                dataType: "json",
                contentType: "application/xml;charset=utf-8",
                data: json,
                beforeSend: function () {
                },
                success: function (r) {
                    callback(r);
                },
                error: function (response) {
                    alert("error is :" + response);
                }
            });
        },
        //保存子应用
        saveChildrenAppData: function (xml, flag, PathId, callback) {
            var self = this;
            var json = "{'DBName':'" + self.dbName + "','Schema':'" + self.schema + "','SPName':'usp_SavechildrenApp','Params':{'items':'" + xml + "','Flag':'" + flag + "','PathId':'" + PathId + "'}}";
            json = "<SessionContext>{0}</SessionContext>".format(json);
            var serviceUrl = self.roleService + "DataCUD";
            $.ajax({
                type: "POST",
                url: serviceUrl,
                dataType: "json",
                contentType: "application/xml;charset=utf-8",
                data: json,
                beforeSend: function () {
                },
                success: function (r) {
                    callback(r);
                },
                error: function (response) {
                    alert("error is :" + response);
                }
            });
        },
        saveApplicationsRoles: function (xml, callback) {

            var self = this;
            var json = "{'DBName':'" + self.dbName + "','Schema':'" + self.schema + "','SPName':'usp_SaveApplicationsRoles','Params':{'Items':'" + xml + "'}}"
            json = "<SessionContext>{0}</SessionContext>".format(json);
            var serviceUrl = self.roleService + "DataCUD";
            $.ajax({
                type: "POST",
                url: serviceUrl,
                dataType: "json",
                contentType: "application/xml;charset=utf-8",
                data: json,
                beforeSend: function () {
                },
                success: function (r) {
                    callback(r);
                },
                error: function (response) {
                    alert("error is :" + response);
                }
            });
        },
        SaveChildrenPath: function (xml, applicationId, callback) {
            var self = this;
            var json = "{'DBName':'" + self.dbName + "','Schema':'" + self.schema + "','SPName':'usp_SaveChildrenPath','Params':{'items':'" + xml + "','ApplicationId':'" + applicationId + "'}}"
            json = "<SessionContext>{0}</SessionContext>".format(json);
            var serviceUrl = self.roleService + "DataCUD";
            $.ajax({
                type: "POST",
                url: serviceUrl,
                dataType: "json",
                contentType: "application/xml;charset=utf-8",
                data: json,
                beforeSend: function () {
                },
                success: function (r) {
                    callback(r);
                },
                error: function (response) {
                    alert("error is :" + response);
                }
            });

        },
        savePath: function (xml, applicationId, callback) {
            var self = this;
            var json = "{'DBName':'" + self.dbName + "','Schema':'" + self.schema + "','SPName':'usp_SavePath','Params':{'items':'" + xml + "','ApplicationId':'" + applicationId + "'}}"
            json = "<SessionContext>{0}</SessionContext>".format(json);
            var serviceUrl = self.roleService + "DataCUD";
            $.ajax({
                type: "POST",
                url: serviceUrl,
                dataType: "json",
                contentType: "application/xml;charset=utf-8",
                data: json,
                beforeSend: function () {
                },
                success: function (r) {
                    callback(r);
                },
                error: function (response) {
                    alert("error is :" + response);
                }
            });

        },
        //savePathRoles: function (xml, callback) {

        //    var self = this;
        //    var json = "{'DBName':'" + self.dbName + "','Schema':'" + self.schema + "','SPName':'usp_SaveApplicationsRoles','Params':{'Items':'" + xml + "'}}"
        //    json = "<SessionContext>{0}</SessionContext>".format(json);
        //    var serviceUrl = self.roleService + "DataCUD";
        //    $.ajax({
        //        type: "POST",
        //        url: serviceUrl,
        //        dataType: "json",
        //        contentType: "application/xml;charset=utf-8",
        //        data: json,
        //        beforeSend: function () {
        //        },
        //        success: function (r) {
        //            callback(r);
        //        },
        //        error: function (response) {
        //            alert("error is :" + response);
        //        }
        //    });
        //},
        getAppInfoById: function (applicationId, callback) {
            var self = this;
            var json = "{'SPName':'usp_GetApplicationById','Params':{" + "'ApplicationId':'" + applicationId + "'}}";
            var serviceUrl = self.roleService + "DataRead?dbName=" + self.dbName + "&schema=" + self.schema + "&json=" + json;
            $.ajax({
                url: serviceUrl,
                type: "GET",
                contentType: "application/json; charset=utf-8",
                dataType: "jsonp",
                crossDomain: true,
                success: function (data) {
                    var json = jQuery.parseJSON(data);
                    callback(json);
                },
                error: function (error) {
                    alert("error:" + error);
                }
            });
        },
        getChildrenAppInfoById: function (PathId, callback) {
            var self = this;
            var json = "{'SPName':'usp_GetChildrenById','Params':{" + "'PathId':'" + PathId + "'}}";
            var serviceUrl = self.roleService + "DataRead?dbName=" + self.dbName + "&schema=" + self.schema + "&json=" + json;
            $.ajax({
                url: serviceUrl,
                type: "GET",
                contentType: "application/json; charset=utf-8",
                dataType: "jsonp",
                crossDomain: true,
                success: function (data) {
                    var json = jQuery.parseJSON(data);
                    callback(json);
                },
                error: function (error) {
                    alert("error:" + error);
                }
            });
        },
        getApplicationsRoles: function (applicationId, callback) {
            var self = this;
            var json = "{'SPName':'usp_GetApplicationsRoles','Params':{" + "'ApplicationId':'" + applicationId + "'}}";
            var serviceUrl = self.roleService + "DataRead?dbName=" + self.dbName + "&schema=" + self.schema + "&json=" + json;
            $.ajax({
                cache: false,
                url: serviceUrl,
                type: "GET",
                contentType: "application/json; charset=utf-8",
                dataType: "jsonp",
                async: (false),
                data: {},
                beforeSend: function () {

                },
                success: function (data) {
                    var json = jQuery.parseJSON(data);
                    callback(json);
                },
                error: function (data) {
                    alert('Error:' + data);
                }
            });

        },
        getPathsRoles: function (PathsRolesId, callback) {
            var self = this;
            var json = "{'SPName':'usp_GetPathsRoles','Params':{" + "'ApplicationId':'" + PathsRolesId + "'}}";
            var serviceUrl = self.roleService + "DataRead?dbName=" + self.dbName + "&schema=" + self.schema + "&json=" + json;
            $.ajax({
                cache: false,
                url: serviceUrl,
                type: "GET",
                contentType: "application/json; charset=utf-8",
                dataType: "jsonp",
                async: (false),
                data: {},
                beforeSend: function () {

                },
                success: function (data) {
                    var json = jQuery.parseJSON(data);
                    callback(json);
                },
                error: function (data) {
                    alert('Error:' + data);
                }
            });

        },
        deleteAppById: function (applicationId, callback) {
            var self = this;
            var json = "{'DBName':'" + self.dbName + "','Schema':'" + self.schema + "','SPName':'usp_DeleteApplicationById','Params':{'ApplicationId':'" + applicationId + "'}}";
            json = "<SessionContext>{0}</SessionContext>".format(json);
            var serviceUrl = self.roleService + "DataCUD";
            $.ajax({
                type: "POST",
                url: serviceUrl,
                dataType: "json",
                contentType: "application/xml;charset=utf-8",
                data: json,
                beforeSend: function () {
                    //$('#loading').fadeIn();

                },
                success: function (response) {
                    //$('#loading').fadeOut();
                    if (callback) {
                        callback();
                    };
                },
                error: function (response) {
                    alert("error is :" + response);
                }
            });
        },
        deleteChildrenAppById: function (pathId, callback) {
            var self = this;
            var json = "{'DBName':'" + self.dbName + "','Schema':'" + self.schema + "','SPName':'usp_DeleteChildrenAppById','Params':{'pathId':'" + pathId + "'}}";
            json = "<SessionContext>{0}</SessionContext>".format(json);
            var serviceUrl = self.roleService + "DataCUD";
            $.ajax({
                type: "POST",
                url: serviceUrl,
                dataType: "json",
                contentType: "application/xml;charset=utf-8",
                data: json,
                beforeSend: function () {
                    //$('#loading').fadeIn();

                },
                success: function (response) {
                    //$('#loading').fadeOut();
                    if (callback) {
                        callback();
                    };
                },
                error: function (response) {
                    alert("error is :" + response);
                }
            });
        },

        deleteApplicationRoleById: function (applicationId, roleId, callback) {
            var self = this;
            var json = "{'DBName':'" + self.dbName + "','Schema':'" + self.schema + "','SPName':'usp_DeleteApplicationRoleById','Params':{'ApplicationId':'" + applicationId + "','RoleId':'" + roleId + "'}}";
            json = "<SessionContext>{0}</SessionContext>".format(json);
            var serviceUrl = self.roleService + "DataCUD";
            $.ajax({
                type: "POST",
                url: serviceUrl,
                dataType: "json",
                contentType: "application/xml;charset=utf-8",
                data: json,
                beforeSend: function () {
                    //$('#loading').fadeIn();

                },
                success: function (response) {
                    //$('#loading').fadeOut();
                    if (callback) {
                        callback(response);
                    };
                },
                error: function (response) {
                    alert("error is :" + response);
                }
            });

        },

        deletePathsRoleById: function (PathsRolesId, roleId, callback) {
            var self = this;
            var json = "{'DBName':'" + self.dbName + "','Schema':'" + self.schema + "','SPName':'usp_DeletePathsRoles','Params':{'PathsRolesId':'" + PathsRolesId + "','RoleId':'" + roleId + "'}}";
            json = "<SessionContext>{0}</SessionContext>".format(json);
            var serviceUrl = self.roleService + "DataCUD";
            $.ajax({
                type: "POST",
                url: serviceUrl,
                dataType: "json",
                contentType: "application/xml;charset=utf-8",
                data: json,
                beforeSend: function () {
                    //$('#loading').fadeIn();

                },
                success: function (response) {
                    //$('#loading').fadeOut();
                    if (callback) {
                        callback(response);
                    };
                },
                error: function (response) {
                    alert("error is :" + response);
                }
            });

        },
        deletePathById: function (pathId, callback) {
            var self = this;
            var json = "{'DBName':'" + self.dbName + "','Schema':'" + self.schema + "','SPName':'usp_DeletePathById','Params':{'PathId':'" + pathId + "'}}";
            json = "<SessionContext>{0}</SessionContext>".format(json);
            var serviceUrl = self.roleService + "DataCUD";
            $.ajax({
                type: "POST",
                url: serviceUrl,
                dataType: "json",
                contentType: "application/xml;charset=utf-8",
                data: json,
                beforeSend: function () { },
                success: function (response) {
                    callback(response);
                },
                error: function (response) {
                    alert("error is:" + response);
                }
            });
        },
        DeleteChildrenAppById: function (pathId, callback) {
            var self = this;
            var json = "{'DBName':'" + self.dbName + "','Schema':'" + self.schema + "','SPName':'usp_DeleteChildrenPathById','Params':{'PathId':'" + pathId + "'}}";
            json = "<SessionContext>{0}</SessionContext>".format(json);
            var serviceUrl = self.roleService + "DataCUD";
            $.ajax({
                type: "POST",
                url: serviceUrl,
                dataType: "json",
                contentType: "application/xml;charset=utf-8",
                data: json,
                beforeSend: function () { },
                success: function (response) {
                    callback(response);
                },
                error: function (response) {
                    alert("error is:" + response);
                }
            });
        },
        getRoleById: function (roleId, callback) {
            var self = this;
            var sContent = "{'SPName':'usp_GetRoleById','Params':{" +
                "'RoleId':'" + roleId + "'" +
                    "}}";
            var serviceUrl = self.roleService + "DataRead?dbName=" + self.dbName + "&schema=" + self.schema + "&json=" + sContent;
            $.ajax({
                cache: false,
                url: serviceUrl,
                type: "GET",
                contentType: "application/json; charset=utf-8",
                dataType: "jsonp",
                async: (false),
                data: {},
                beforeSend: function () {

                },
                success: function (data) {
                    var items = jQuery.parseJSON(data);
                    if (items.length > 0) {
                        var item = items[0];
                        callback(item);
                    }
                    else {
                        callback(null);
                    }
                },
                error: function (data) {
                    alert('Error:' + data);
                }
            });
        },

        saveRolesData: function (xml, flag, callback) {
            var self = this;
            var json = "{'DBName':'" + self.dbName + "','Schema':'" + self.schema + "','SPName':'usp_SaveRole','Params':{'Items':'" + xml + "','Flag':" + flag + "}}";
            json = "<SessionContext>{0}</SessionContext>".format(json);
            var serviceUrl = self.roleService + "DataCUD";
            $.ajax({
                type: "POST",
                url: serviceUrl,
                dataType: "json",
                contentType: "application/xml;charset=utf-8",
                data: json,
                beforeSend: function () {
                },
                success: function (result) {
                    callback(result);
                },
                error: function (response) {
                    alert("error is :" + response);
                }
            });
        },

        deleteRoleById: function (roleId, callback) {
            var self = this;
            var json = "{'DBName':'" + self.dbName + "','Schema':'" + self.schema + "','SPName':'usp_DeleteRoleById','Params':{" +
                "'RoleId':'" + roleId + "'" +
                "}}";
            json = "<SessionContext>{0}</SessionContext>".format(json);
            var serviceUrl = self.roleService + "DataCUD";
            $.ajax({
                type: "POST",
                url: serviceUrl,
                dataType: "json",
                contentType: "application/xml;charset=utf-8",
                data: json,
                beforeSend: function () {
                    //$('#loading').fadeIn();

                },
                success: function (response) {
                    //$('#loading').fadeOut();
                    if (callback) {
                        callback(roleId)
                    };
                },
                error: function (response) {
                    alert("error is :" + response);
                }
            });
        },

        getUserDetailById: function (userId, callback) {
            var self = this;
            var sContent = "{'SPName':'usp_GetUserDetailById','Params':{" +
                "'UserId':'" + userId + "'" +
                    "}}";
            var serviceUrl = self.roleService + "DataRead?dbName=" + self.dbName + "&schema=" + self.schema + "&json=" + sContent;
            $.ajax({
                cache: false,
                url: serviceUrl,
                type: "GET",
                contentType: "application/json; charset=utf-8",
                dataType: "jsonp",
                async: (false),
                data: {},
                beforeSend: function () {

                },
                success: function (data) {
                    var json = jQuery.parseJSON(data);
                    console.log(json);
                    callback(json);
                },
                error: function (data) {
                    alert('Error:' + data);
                }
            });
        },

        getProfileById: function (userId, callback) {
            var self = this;
            var sContent = "{'SPName':'usp_GetProfileById','Params':{" +
                "'UserId':'" + userId + "'" +
                    "}}";
            var serviceUrl = self.roleService + "DataRead?dbName=" + self.dbName + "&schema=" + self.schema + "&json=" + sContent;
            $.ajax({
                cache: false,
                url: serviceUrl,
                type: "GET",
                contentType: "application/json; charset=utf-8",
                dataType: "jsonp",
                async: (false),
                data: {},
                beforeSend: function () {

                },
                success: function (data) {
                    var json = jQuery.parseJSON(data);
                    callback(json);
                },
                error: function (data) {
                    alert('Error:' + data);
                }
            });
        },

        //获取用户拥有的角色
        getUserRolesByUserId: function (userId, callback) {
            var self = this;
            var sContent = "{'SPName':'usp_GetUserRolesByUserId','Params':{'UserId':'" + userId + "'}}";
            var serviceUrl = self.roleService + "DataRead?dbName=" + self.dbName + "&schema=" + self.schema + "&json=" + sContent;

            $.ajax({
                url: serviceUrl,
                type: "GET",
                contentType: "application/json; charset=utf-8",
                dataType: "jsonp",
                async: (false),
                beforeSend: function () {

                },
                success: function (data) {
                    var json = jQuery.parseJSON(data);
                    callback(json);
                },
                error: function (data) {
                    alert('Error:' + data);
                }
            });
        },

        deleteUserById: function (userId, callback) {
            var self = this;
            var json = "{'DBName':'" + self.dbName + "','Schema':'" + self.schema + "','SPName':'usp_DeleteUserById','Params':{" +
                "'UserId':'" + userId + "'" +
                "}}";
            json = "<SessionContext>{0}</SessionContext>".format(json);
            var serviceUrl = self.roleService + "DataCUD";
            $.ajax({
                type: "POST",
                url: serviceUrl,
                dataType: "json",
                contentType: "application/xml;charset=utf-8",
                data: json,
                beforeSend: function () {
                    //$('#loading').fadeIn();

                },
                success: function (r) {
                    //$('#loading').fadeOut();
                    callback(r);
                },
                error: function (response) {
                    alert("error is :" + response);
                }
            });
        },
        //首页设置资料检查userid
        checkUserIdForSetting: function (userName, callback) {
            var self = this;

            var sContent = "{'SPName':'usp_checkUserIdForSetting','Params':{'userName':'" + userName + "'}}";
            var serviceUrl = self.roleService + "DataRead?dbName=" + self.dbName + "&schema=" + self.schema + "&json=" + sContent;

            $.ajax({
                type: "GET",
                url: serviceUrl,
                dataType: "json",
                contentType: "application/xml;charset=utf-8",
                beforeSend: function () {
                },
                success: function (r) {
                    callback(r);
                },
                error: function (response) {
                    console.log('Error:' + response);
                }
            });
        },


        isExistUsername: function (userName, callback) {
            var self = this;
            var json = "{'DBName':'" + self.dbName + "','Schema':'" + self.schema + "','SPName':'usp_IsExistUserName','Params':{'userName':'" + userName + "'}}";
            json = "<SessionContext>{0}</SessionContext>".format(json);
            var serviceUrl = self.roleService + "DataCUD";
            $.ajax({
                type: "POST",
                url: serviceUrl,
                dataType: "json",
                contentType: "application/xml;charset=utf-8",
                data: json,
                beforeSend: function () {
                },
                success: function (r) {
                    callback(r);
                },
                error: function (response) {
                    console.log('Error:' + response);
                }
            });
        },

        isExistPassword: function (userName, password, callback) {
            var self = this;
            var json = "{'DBName':'" + self.dbName + "','Schema':'" + self.schema + "','SPName':'usp_IsExistPassword','Params':{'UserName':'" + userName + "','Password':'" + password + "'}}";
            json = "<SessionContext>{0}</SessionContext>".format(json);
            var serviceUrl = self.roleService + "DataCUD";
            $.ajax({
                type: "POST",
                url: serviceUrl,
                dataType: "json",
                contentType: "application/xml;charset=utf-8",
                data: json,
                beforeSend: function () {
                },
                success: function (r) {
                    callback(r);
                },
                error: function (response) {
                    console.log('Error:' + response);
                }
            });
        },

        changePassword: function (userName, password, callback) {
            var self = this;
            var json = "{'DBName':'" + self.dbName + "','Schema':'" + self.schema + "','SPName':'usp_UpdatePassword','Params':{'UserName':'" + userName + "','Password':'" + password + "'}}";
            json = "<SessionContext>{0}</SessionContext>".format(json);
            var serviceUrl = self.roleService + "DataCUD";
            $.ajax({
                type: "POST",
                url: serviceUrl,
                dataType: "json",
                contentType: "application/xml;charset=utf-8",
                data: json,
                beforeSend: function () {
                },
                success: function (r) {
                    callback(r);
                },
                error: function (response) {
                    console.log('Error:' + response);
                }
            });
        },
        getQuestion: function (callback) {
            var self = this;
            var sContent = "{'SPName':'usp_GetQuestion','Params':{}}";
            var serviceUrl = self.roleService + "DataRead?dbName=" + self.dbName + "&schema=" + self.schema + "&json=" + sContent;
            $.ajax({
                cache: false,
                url: serviceUrl,
                type: "GET",
                contentType: "application/json; charset=utf-8",
                dataType: "jsonp",
                async: (false),
                data: {},
                beforeSend: function () {

                },
                success: function (data) {
                    var json = jQuery.parseJSON(data);
                    callback(json);
                },
                error: function (data) {
                    console.log('Error:' + data);
                }
            });
        },

        updateProfile: function (xml, callback) {
            var self = this;
            var json = "{'DBName':'" + self.dbName + "','Schema':'" + self.schema + "','SPName':'usp_UpdateProfile','Params':{'item':'" + xml + "'}}";
            json = "<SessionContext>{0}</SessionContext>".format(json);
            var serviceUrl = self.roleService + "DataCUD";
            $.ajax({
                type: "POST",
                url: serviceUrl,
                dataType: "json",
                contentType: "application/xml;charset=utf-8",
                data: json,
                beforeSend: function () {
                },
                success: function (r) {
                    callback(r);
                },
                error: function (response) {
                    console.log('Error:' + response);
                }
            });
        },

        addUser: function (xml, callback) {
            var self = this;
            var json = "{'DBName':'" + self.dbName + "','Schema':'" + self.schema + "','SPName':'usp_AddUser','Params':{'item':'" + xml + "'}}";
            json = "<SessionContext>{0}</SessionContext>".format(json);
            var serviceUrl = self.roleService + "DataCUD";
            $.ajax({
                type: "POST",
                url: serviceUrl,
                dataType: "json",
                contentType: "application/xml;charset=utf-8",
                data: json,
                beforeSend: function () {
                },
                success: function (r) {
                    callback(r);
                },
                error: function (response) {
                    console.log('Error:' + response);
                }
            });
        },

        saveUser: function (xml, callback) {
            var self = this;
            var json = "{'DBName':'" + self.dbName + "','Schema':'" + self.schema + "','SPName':'usp_SaveUser','Params':{'item':'" + xml + "'}}";
            json = "<SessionContext>{0}</SessionContext>".format(json);
            var serviceUrl = self.roleService + "DataCUD";
            $.ajax({
                type: "POST",
                url: serviceUrl,
                dataType: "json",
                contentType: "application/xml;charset=utf-8",
                data: json,
                beforeSend: function () {
                },
                success: function (r) {
                    callback(r);
                },
                error: function (response) {
                    console.log('7error');
                    alert("error is :" + response);
                }
            });
        },
        GetChildrenPathsPath: function (applicationId, callback) {
            var self = this;
            var sContent = "{'SPName':'usp_GetChildrenPathsPath','Params':{'ApplicationId':'" + applicationId + "'}}";
            var serviceUrl = self.roleService + "DataRead?dbName=" + self.dbName + "&schema=" + self.schema + "&json=" + sContent;
            $.ajax({
                cache: false,
                url: serviceUrl,
                type: "GET",
                contentType: "application/json; charset=utf-8",
                dataType: "jsonp",
                async: (false),
                data: {},
                beforeSend: function () {

                },
                success: function (data) {
                    var json = jQuery.parseJSON(data);
                    callback(json);
                },
                error: function (data) {
                    alert('Error:' + data);
                }
            });
        },
        getPath: function (applicationId, callback) {
            var self = this;
            var sContent = "{'SPName':'usp_GetPath','Params':{'ApplicationId':'" + applicationId + "'}}";
            var serviceUrl = self.roleService + "DataRead?dbName=" + self.dbName + "&schema=" + self.schema + "&json=" + sContent;
            $.ajax({
                cache: false,
                url: serviceUrl,
                type: "GET",
                contentType: "application/json; charset=utf-8",
                dataType: "jsonp",
                async: (false),
                data: {},
                beforeSend: function () {

                },
                success: function (data) {
                    var json = jQuery.parseJSON(data);
                    callback(json);
                },
                error: function (data) {
                    alert('Error:' + data);
                }
            });
        },

        updateLastLoginDate: function (userName) {
            var self = this;
            var json = "{'DBName':'" + self.dbName + "','Schema':'" + self.schema + "','SPName':'usp_LastLoginDate','Params':{'UserName':'" + userName + "'}}";
            json = "<SessionContext>{0}</SessionContext>".format(json);
            var serviceUrl = self.roleService + "DataCUD";
            $.ajax({
                type: "POST",
                url: serviceUrl,
                dataType: "json",
                contentType: "application/xml;charset=utf-8",
                data: json,
                beforeSend: function () {
                },
                success: function (r) {
                },
                error: function (response) {
                    alert("error is :" + response);
                }
            });
        },

        getModulesByPathId: function (pathId, callback) {
            var self = this;
            var sContent = "{'SPName':'usp_GetModulesByPathId','Params':{'PathId':'" + pathId + "'}}";
            var serviceUrl = self.roleService + "DataRead?dbName=" + self.dbName + "&schema=" + self.schema + "&json=" + sContent;
            $.ajax({
                url: serviceUrl,
                type: "GET",
                contentType: "application/json; charset=utf-8",
                dataType: "jsonp",
                beforeSend: function () {

                },
                success: function (data) {
                    var json = jQuery.parseJSON(data);
                    callback(json);
                },
                error: function (data) {
                    alert('Error:' + data);
                }
            });
        },

        getModuleTypes: function (set) {
            var self = this;
            var items = [];
            var sContent = "{'SPName':'usp_GetModuleTypes','Params':{" +
                     "'SetName':'" + set + "'" +
                     "}}";
            var serviceUrl = self.roleService + "DataRead?dbName=" + self.dbName + "&schema=" + self.schema + "&json=" + sContent;
            $.ajax({
                url: serviceUrl,
                type: "GET",
                contentType: "application/json; charset=utf-8",
                dataType: "jsonp",
                async: (false),
                beforeSend: function () {

                },
                success: function (data) {
                    items = jQuery.parseJSON(data);
                },
                error: function (error) {
                    alert("error:" + error);
                }
            });
            return items;
        },

        saveModule: function (xml, callback) {
            var self = this;
            xml = encodeURIComponent(xml);
            var json = "{'DBName':'" + self.dbName + "','Schema':'" + self.schema + "','SPName':'usp_SaveModule','Params':{'Items':'" + xml + "'}}";
            json = "<SessionContext>{0}</SessionContext>".format(json);
            var serviceUrl = self.roleService + "DataCUD";
            $.ajax({
                type: "POST",
                url: serviceUrl,
                dataType: "json",
                contentType: "application/xml;charset=utf-8",
                data: json,
                beforeSend: function () {
                    //$('#loading').fadeIn();

                },
                success: function (response) {
                    //$('#loading').fadeOut();
                    if (callback) {
                        callback(response);
                    }
                },
                error: function (response) {
                    alert("error is :" + response);
                }
            });
        },

        deleteModuleById: function (moduleId, callback) {
            var self = this;
            var json = "{'DBName':'" + self.dbName + "','Schema':'" + self.schema + "','SPName':'usp_DeleteModuleById','Params':{" +
                "'ModuleId':'" + moduleId + "'" +
                "}}";
            json = "<SessionContext>{0}</SessionContext>".format(json);
            var serviceUrl = self.roleService + "DataCUD";
            $.ajax({
                type: "POST",
                url: serviceUrl,
                dataType: "json",
                contentType: "application/xml;charset=utf-8",
                data: json,
                beforeSend: function () {
                    //$('#loading').fadeIn();

                },
                success: function (response) {
                    //$('#loading').fadeOut();
                    if (callback) {
                        callback(moduleId)
                    };
                },
                error: function (response) {
                    alert("error is :" + response);
                }
            });
        },

        getRolesByModuleId: function (moduleId, callback) {
            var self = this;
            var sContent = "{'SPName':'usp_GetRolesByModuleId','Params':{'ModuleId':'" + moduleId + "'}}";
            var serviceUrl = self.roleService + "DataRead?dbName=" + self.dbName + "&schema=" + self.schema + "&json=" + sContent;
            $.ajax({
                url: serviceUrl,
                type: "GET",
                contentType: "application/json; charset=utf-8",
                dataType: "jsonp",
                beforeSend: function () {

                },
                success: function (data) {
                    var json = jQuery.parseJSON(data);
                    callback(json);
                },
                error: function (data) {
                    alert('Error:' + data);
                }
            });
        },

        getRolesByUserId: function (userId, callback) {
            var self = this;
            var sContent = "{'SPName':'usp_GetRolesByUserId','Params':{'UserId':'" + userId + "'}}";
            var serviceUrl = self.roleService + "DataRead?dbName=" + self.dbName + "&schema=" + self.schema + "&json=" + sContent;
            $.ajax({
                url: serviceUrl,
                type: "GET",
                contentType: "application/json; charset=utf-8",
                dataType: "jsonp",
                beforeSend: function () {

                },
                success: function (data) {
                    var json = jQuery.parseJSON(data);
                    callback(json);
                },
                error: function (data) {
                    alert('Error:' + data);
                }
            });
        },

        getRolesByUserName: function (userName, callback) {
            var self = this;
            var sContent = "{'SPName':'usp_GetRolesByUserName','Params':{'UserName':'" + userName + "'}}";
            var serviceUrl = self.QucikFrameRoleService + "DataRead?dbName=" + self.dbName + "&schema=" + self.schema + "&json=" + sContent;
            $.ajax({
                url: serviceUrl,
                type: "GET",
                contentType: "application/json; charset=utf-8",
                dataType: "jsonp",
                beforeSend: function () {

                },
                success: function (data) {
                    var json = jQuery.parseJSON(data);
                    callback(json);
                },
                error: function (data) {
                    alert('Error:' + data);
                }
            });
        },

        saveModuleRoles: function (xml, callback) {
            var self = this;
            xml = encodeURIComponent(xml);
            var json = "{'DBName':'" + self.dbName + "','Schema':'" + self.schema + "','SPName':'usp_SaveModuleRoles','Params':{'Items':'" + xml + "'}}";
            json = "<SessionContext>{0}</SessionContext>".format(json);
            var serviceUrl = self.roleService + "DataCUD";
            $.ajax({
                type: "POST",
                url: serviceUrl,
                dataType: "json",
                contentType: "application/xml;charset=utf-8",
                data: json,
                beforeSend: function () {
                    //$('#loading').fadeIn();

                },
                success: function (response) {
                    //$('#loading').fadeOut();
                    if (callback) {
                        callback(response);
                    }
                },
                error: function (response) {
                    alert("error is :" + response);
                }
            });
        },

        deleteModuleRole: function (moduleId, roleId, callback) {
            var self = this;
            var json = "{'DBName':'" + self.dbName + "','Schema':'" + self.schema + "','SPName':'usp_DeleteModuleRole','Params':{" +
                "'ModuleId':'" + moduleId + "'" +
                ",'RoleId':'" + roleId + "'" +
                "}}";
            json = "<SessionContext>{0}</SessionContext>".format(json);
            var serviceUrl = self.roleService + "DataCUD";
            $.ajax({
                type: "POST",
                url: serviceUrl,
                dataType: "json",
                contentType: "application/xml;charset=utf-8",
                data: json,
                beforeSend: function () {
                    //$('#loading').fadeIn();

                },
                success: function (response) {
                    //$('#loading').fadeOut();
                    if (callback) {
                        callback(moduleId)
                    };
                },
                error: function (response) {
                    console.log('Error:' + response);
                }
            });
        },
        getRolesByPathId: function (pathId, callback) {
            var self = this;
            var sContent = "{'SPName':'usp_GetRolesByPathId','Params':{'PathId':'" + pathId + "'}}";
            var serviceUrl = self.roleService + "DataRead?dbName=" + self.dbName + "&schema=" + self.schema + "&json=" + sContent;
            $.ajax({
                url: serviceUrl,
                type: "GET",
                contentType: "application/json; charset=utf-8",
                dataType: "jsonp",
                beforeSend: function () {

                },
                success: function (data) {
                    var json = jQuery.parseJSON(data);
                    callback(json);
                },
                error: function (data) {
                    console.log('Error:' + response);
                }
            });
        },

        getUsersByRoleId: function (roleId, callback) {
            var self = this;
            var sContent = "{'SPName':'usp_GetUsersByRoleId ','Params':{'RoleId':'" + roleId + "'}}";
            var serviceUrl = self.roleService + "DataRead?dbName=" + self.dbName + "&schema=" + self.schema + "&json=" + sContent;
            $.ajax({
                cache: false,
                url: serviceUrl,
                type: "GET",
                contentType: "application/json; charset=utf-8",
                dataType: "jsonp",
                async: (false),
                data: {},
                beforeSend: function () {

                },
                success: function (data) {
                    var json = jQuery.parseJSON(data);
                    callback(json);
                },
                error: function (data) {
                    console.log('Error:' + response);
                }
            });
        },

        SaveChildrenPathsRoles: function (xml, callback) {
            var self = this;
            xml = encodeURIComponent(xml);
            var json = "{'DBName':'" + self.dbName + "','Schema':'" + self.schema + "','SPName':'usp_SaveChildrenPathsRoles','Params':{'Items':'" + xml + "'}}";
            json = "<SessionContext>{0}</SessionContext>".format(json);
            var serviceUrl = self.roleService + "DataCUD";
            $.ajax({
                type: "POST",
                url: serviceUrl,
                dataType: "json",
                contentType: "application/xml;charset=utf-8",
                data: json,
                beforeSend: function () {
                    //$('#loading').fadeIn();

                },
                success: function (response) {
                    //$('#loading').fadeOut();
                    if (callback) {
                        callback(response);
                    }
                },
                error: function (response) {
                    console.log('Error:' + response);
                }
            });
        },

        savePathRoles: function (xml, callback) {
            var self = this;
            xml = encodeURIComponent(xml);
            var json = "{'DBName':'" + self.dbName + "','Schema':'" + self.schema + "','SPName':'usp_SavePathRoles','Params':{'Items':'" + xml + "'}}";
            json = "<SessionContext>{0}</SessionContext>".format(json);
            var serviceUrl = self.roleService + "DataCUD";
            $.ajax({
                type: "POST",
                url: serviceUrl,
                dataType: "json",
                contentType: "application/xml;charset=utf-8",
                data: json,
                beforeSend: function () {
                    //$('#loading').fadeIn();

                },
                success: function (response) {
                    //$('#loading').fadeOut();
                    if (callback) {
                        callback(response);
                    }
                },
                error: function (response) {
                    console.log('Error:' + response);
                }
            });
        },

        saveUsersRoles: function (xml, callback) {
            var self = this;
            var json = "{'DBName':'" + self.dbName + "','Schema':'" + self.schema + "','SPName':'usp_SaveUsersRoles','Params':{'item':'" + xml + "'}}";
            json = "<SessionContext>{0}</SessionContext>".format(json);
            var serviceUrl = self.roleService + "DataCUD";
            $.ajax({
                type: "POST",
                url: serviceUrl,
                dataType: "json",
                contentType: "application/xml;charset=utf-8",
                data: json,
                beforeSend: function () {
                },
                success: function (r) {
                    callback(r);
                },
                error: function (response) {
                    console.log('Error:' + response);
                }
            });
        },

        deleteUsersRoles: function (userId, roleId, callback) {
            var self = this;
            var json = "{'DBName':'" + self.dbName + "','Schema':'" + self.schema + "','SPName':'usp_DeleteUsersRoles','Params':{" +
               "'UserId':'" + userId + "'," +
               "'RoleId':'" + roleId + "'" +
               "}}";
            json = "<SessionContext>{0}</SessionContext>".format(json);
            var serviceUrl = self.roleService + "DataCUD";
            $.ajax({
                type: "POST",
                url: serviceUrl,
                dataType: "json",
                contentType: "application/xml;charset=utf-8",
                data: json,
                beforeSend: function () {
                    //$('#loading').fadeIn();

                },
                success: function (r) {
                    //$('#loading').fadeOut();
                    callback(r);
                },
                error: function (response) {
                    console.log('Error:' + response);
                }
            });
        },


        deletePathRoles: function (pathId, roleId, callback) {
            var self = this;
            var json = "{'DBName':'" + self.dbName + "','Schema':'" + self.schema + "','SPName':'usp_DeletePathRoles','Params':{'PathId':'" + pathId + "','RoleId':'" + roleId + "'}}";
            json = "<SessionContext>{0}</SessionContext>".format(json);
            var serviceUrl = self.roleService + "DataCUD";
            $.ajax({
                type: "POST",
                url: serviceUrl,
                dataType: "json",
                contentType: "application/xml;charset=utf-8",
                data: json,
                beforeSend: function () {
                },
                success: function (r) {
                    callback(r);
                },
                error: function (response) {
                    console.log('Error:' + response);
                }
            });
        },
        ChildrendeletePathRoles: function (pathId, roleId, callback) {
            var self = this;
            var json = "{'DBName':'" + self.dbName + "','Schema':'" + self.schema + "','SPName':'usp_DeleteChildrenPathRoles','Params':{'PathId':'" + pathId + "','RoleId':'" + roleId + "'}}";
            json = "<SessionContext>{0}</SessionContext>".format(json);
            var serviceUrl = self.roleService + "DataCUD";
            $.ajax({
                type: "POST",
                url: serviceUrl,
                dataType: "json",
                contentType: "application/xml;charset=utf-8",
                data: json,
                beforeSend: function () {
                },
                success: function (r) {
                    callback(r);
                },
                error: function (response) {
                    console.log('Error:' + response);
                }
            });
        },

        getApplicationsByUserName: function (userName, callback) {
            var self = this;
            var sContent = "{'SPName':'usp_GetApplicationsByUserName_new','Params':{'UserName':'" + userName + "'}}";
            var serviceUrl = self.roleService + "DataRead?dbName=" + self.dbName + "&schema=" + self.schema + "&json=" + sContent;
            $.ajax({
                url: serviceUrl,
                type: "GET",
                async: false,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                beforeSend: function () {

                },
                success: function (data) {
                    var json = jQuery.parseJSON(data);
                    callback(json);
                },
                error: function (data) {
                    console.log('Error:' + data);
                }
            });
        },

        //getPathsByUserNameAndAppName: function (userName, appName, callback) {
        //    var self = this;
        //    var sContent = "{'SPName':'usp_GetPathsByUserNameAndAppName','Params':{'UserName':'" + userName + "','AppName':'" + appName + "'}}";
        //    var serviceUrl = self.roleService + "DataRead?dbName=" + self.dbName + "&schema=" + self.schema + "&json=" + sContent;
        //    $.ajax({
        //        url: serviceUrl,
        //        type: "GET",
        //        contentType: "application/json; charset=utf-8",
        //        dataType: "jsonp",
        //        beforeSend: function () {

        //        },
        //        success: function (data) {
        //            var json = jQuery.parseJSON(data);
        //            callback(json);
        //        },
        //        error: function (data) {
        //            alert('Error:' + data);
        //        }
        //    });
        //},
        checkMenuPermission: function (userName, appName, callback) {
            var self = this;
            var sContent = "{'SPName':'usp_GetPathsByUserNameAndAppName','Params':{'UserName':'" + userName + "','AppName':'" + appName + "'}}";
            var serviceUrl = self.roleService + "DataRead?dbName=" + self.dbName + "&schema=" + self.schema + "&json=" + sContent;
            $.ajax({
                url: serviceUrl,
                type: "GET",
                contentType: "application/json; charset=utf-8",
                dataType: "jsonp",
                beforeSend: function () {

                },
                success: function (data) {
                    var json = jQuery.parseJSON(data);
                    callback(json);
                },
                error: function (data) {
                    console.log('Error:' + data);
                }
            });
        },

        //获取菜单数据
        GetChildrenPathsPermission: function (userName, childrenAppName, callback) {
            var self = this;
            var sContent = "{'SPName':'usp_GetChildrenPathsByUserNameAndAppName','Params':{'UserName':'" + userName + "','AppName':'" + childrenAppName + "'}}";
            var serviceUrl = self.roleService + "DataRead?dbName=" + self.dbName + "&schema=" + self.schema + "&json=" + sContent;
            $.ajax({
                url: serviceUrl,
                type: "GET",
                async:false,
                contentType: "application/json; charset=utf-8",
                dataType: "jsonp",
                beforeSend: function () {
                },
                success: function (data) {
                    var json = jQuery.parseJSON(data);
                    callback(json);
                },
                error: function (data) {
                    console.log('Error:' + data);
                }
            });
        },
        //获取子应用数据
        checkChildrenAppPermission: function (userName, appName, callback) {
            var self = this;
            var sContent = "{'SPName':'usp_GetPathsByUserNameAndAppName_New','Params':{'UserName':'" + userName + "','AppName':'" + appName + "'}}";
            var serviceUrl = self.roleService + "DataRead?dbName=" + self.dbName + "&schema=" + self.schema + "&json=" + sContent;
            $.ajax({
                url: serviceUrl,
                type: "GET",
                async: false,
                contentType: "application/json; charset=utf-8",
                dataType: "jsonp",
                beforeSend: function () {
                },
                success: function (data) {
                    var json = jQuery.parseJSON(data);
                    callback(json);
                },
                error: function (data) {
                    console.log('dataerror');
                    alert('Error:' + data);
                }
            });
        }
       
    }

    return new RoleOperate();
})


