function siteApp() {
    var curWwwPath = window.document.location.href;
    var pathName = window.document.location.pathname;
    var pos = curWwwPath.indexOf(pathName);
    var siteApp = pathName.substring(1, pathName.substr(1).indexOf('/') + 1);
    return siteApp;
}


var RoleOperate = {
    dbName: 'QuickFrame',
    schema: 'QuickFrame',
    siteAppUrl: location.protocol + "//" + location.host + '/' + siteApp(),
    roleService: location.protocol + "//" + location.host + '/' + siteApp() + '/FrameService.svc/',
    QucikFrameRoleService: location.protocol + "//" + location.host + '/' + 'QuickFrame' + '/FrameService.svc/',
    //taskProcess 
    //创建Cookie Name
    cookieNameCreate: function (userName) {
        $.cookie('gs_UserName', userName, { expires: 1, path: '/' });
    },

    //删除Cookie Name
    cookieNameRemove: function () {
        $.cookie('gs_UserName', null, { path: '/' });
    },

    //获取Cookie Name
    cookieName: function () {
        return $.cookie('gs_UserName');
    },

    //检查路径的权限
    pathPremisson: function (applicationName, path, userName, callback) {
        var json = "{'DBName':'" + RoleOperate.dbName + "','Schema':'" + RoleOperate.schema + "','SPName':'usp_PathPermission','Params':{'ApplicationName':'" + applicationName + "','Path':'" + path + "','UserName':'" + userName + "'}}";
        json = "<SessionContext>{0}</SessionContext>".format(json);
        var serviceUrl = RoleOperate.roleService + "DataCUD";
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
        path = encodeURIComponent(path);
        var json = "{'DBName':'" + RoleOperate.dbName + "','Schema':'" + RoleOperate.schema + "','SPName':'usp_ModulePermission','Params':{'ApplicationName':'" + applicationName + "','Path':'" + path + "','Module':'" + module + "','UserName':'" + userName + "'}}";
        json = "<SessionContext>{0}</SessionContext>".format(json);
        var serviceUrl = RoleOperate.roleService + "DataCUD";
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
        var sContent = "{'SPName':'usp_GetAllUsers','Params':{}}";
        var serviceUrl = RoleOperate.roleService + "DataRead?dbName=" + RoleOperate.dbName + "&schema=" + RoleOperate.schema + "&json=" + sContent;
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
        var json = "{'DBName':'" + RoleOperate.dbName + "','Schema':'" + RoleOperate.schema + "','SPName':'usp_SaveApplication','Params':{'items':'" + xml + "','Flag':'" + flag + "','ApplicationId':'" + applicationId + "'}}";
        json = "<SessionContext>{0}</SessionContext>".format(json);
        var serviceUrl = RoleOperate.roleService + "DataCUD";
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
        var json = "{'DBName':'" + RoleOperate.dbName + "','Schema':'" + RoleOperate.schema + "','SPName':'usp_SaveApplicationsRoles','Params':{'Items':'" + xml + "'}}"
        json = "<SessionContext>{0}</SessionContext>".format(json);
        var serviceUrl = RoleOperate.roleService + "DataCUD";
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
        var json = "{'DBName':'" + RoleOperate.dbName + "','Schema':'" + RoleOperate.schema + "','SPName':'usp_SavePath','Params':{'items':'" + xml + "','ApplicationId':'" + applicationId + "'}}"
        json = "<SessionContext>{0}</SessionContext>".format(json);
        var serviceUrl = RoleOperate.roleService + "DataCUD";
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

    getAppInfoById: function (applicationId, callback) {
        var json = "{'SPName':'usp_GetApplicationById','Params':{" + "'ApplicationId':'" + applicationId + "'}}";
        var serviceUrl = RoleOperate.roleService + "DataRead?dbName=" + RoleOperate.dbName + "&schema=" + RoleOperate.schema + "&json=" + json;
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
        var json = "{'SPName':'usp_GetApplicationsRoles','Params':{" + "'ApplicationId':'" + applicationId + "'}}";
        var serviceUrl = RoleOperate.roleService + "DataRead?dbName=" + RoleOperate.dbName + "&schema=" + RoleOperate.schema + "&json=" + json;
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
        var json = "{'DBName':'" + RoleOperate.dbName + "','Schema':'" + RoleOperate.schema + "','SPName':'usp_DeleteApplicationById','Params':{'ApplicationId':'" + applicationId + "'}}";
        json = "<SessionContext>{0}</SessionContext>".format(json);
        var serviceUrl = RoleOperate.roleService + "DataCUD";
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
        var json = "{'DBName':'" + RoleOperate.dbName + "','Schema':'" + RoleOperate.schema + "','SPName':'usp_DeleteApplicationRoleById','Params':{'ApplicationId':'" + applicationId + "','RoleId':'" + roleId + "'}}";
        json = "<SessionContext>{0}</SessionContext>".format(json);
        var serviceUrl = RoleOperate.roleService + "DataCUD";
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
        var json = "{'DBName':'" + RoleOperate.dbName + "','Schema':'" + RoleOperate.schema + "','SPName':'usp_DeletePathById','Params':{'PathId':'" + pathId + "'}}";
        json = "<SessionContext>{0}</SessionContext>".format(json);
        var serviceUrl = RoleOperate.roleService + "DataCUD";
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

        var sContent = "{'SPName':'usp_GetRoleById','Params':{" +
            "'RoleId':'" + roleId + "'" +
                "}}";
        var serviceUrl = RoleOperate.roleService + "DataRead?dbName=" + RoleOperate.dbName + "&schema=" + RoleOperate.schema + "&json=" + sContent;
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
        var json = "{'DBName':'" + RoleOperate.dbName + "','Schema':'" + RoleOperate.schema + "','SPName':'usp_SaveRole','Params':{'Items':'" + xml + "','Flag':" + flag + "}}";
        json = "<SessionContext>{0}</SessionContext>".format(json);
        var serviceUrl = RoleOperate.roleService + "DataCUD";
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
        var json = "{'DBName':'" + RoleOperate.dbName + "','Schema':'" + RoleOperate.schema + "','SPName':'usp_DeleteRoleById','Params':{" +
            "'RoleId':'" + roleId + "'" +
            "}}";
        json = "<SessionContext>{0}</SessionContext>".format(json);
        var serviceUrl = RoleOperate.roleService + "DataCUD";
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
        var sContent = "{'SPName':'usp_GetUserDetailById','Params':{" +
            "'UserId':'" + userId + "'" +
                "}}";
        var serviceUrl = RoleOperate.roleService + "DataRead?dbName=" + RoleOperate.dbName + "&schema=" + RoleOperate.schema + "&json=" + sContent;
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

    getProfileById: function (userId, callback) {
        var sContent = "{'SPName':'usp_GetProfileById','Params':{" +
            "'UserId':'" + userId + "'" +
                "}}";
        var serviceUrl = RoleOperate.roleService + "DataRead?dbName=" + RoleOperate.dbName + "&schema=" + RoleOperate.schema + "&json=" + sContent;
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



    deleteUserById: function (userId, callback) {
        var json = "{'DBName':'" + RoleOperate.dbName + "','Schema':'" + RoleOperate.schema + "','SPName':'usp_DeleteUserById','Params':{" +
            "'UserId':'" + userId + "'" +
            "}}";
        json = "<SessionContext>{0}</SessionContext>".format(json);
        var serviceUrl = RoleOperate.roleService + "DataCUD";
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

    isExistUsername: function (userName, callback) {
        var json = "{'DBName':'" + RoleOperate.dbName + "','Schema':'" + RoleOperate.schema + "','SPName':'usp_IsExistUserName','Params':{'userName':'" + userName + "'}}";
        json = "<SessionContext>{0}</SessionContext>".format(json);
        var serviceUrl = RoleOperate.roleService + "DataCUD";
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

    isExistPassword: function (userName, password, callback) {
        var json = "{'DBName':'" + RoleOperate.dbName + "','Schema':'" + RoleOperate.schema + "','SPName':'usp_IsExistPassword','Params':{'UserName':'" + userName + "','Password':'" + password + "'}}";
        json = "<SessionContext>{0}</SessionContext>".format(json);
        var serviceUrl = RoleOperate.roleService + "DataCUD";
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

    getQuestion: function (callback) {
        var sContent = "{'SPName':'usp_GetQuestion','Params':{}}";
        var serviceUrl = RoleOperate.roleService + "DataRead?dbName=" + RoleOperate.dbName + "&schema=" + RoleOperate.schema + "&json=" + sContent;
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

    updateProfile: function (xml, callback) {
        var json = "{'DBName':'" + RoleOperate.dbName + "','Schema':'" + RoleOperate.schema + "','SPName':'usp_UpdateProfile','Params':{'item':'" + xml + "'}}";
        json = "<SessionContext>{0}</SessionContext>".format(json);
        var serviceUrl = RoleOperate.roleService + "DataCUD";
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

    addUser: function (xml, callback) {
        var json = "{'DBName':'" + RoleOperate.dbName + "','Schema':'" + RoleOperate.schema + "','SPName':'usp_AddUser','Params':{'item':'" + xml + "'}}";
        json = "<SessionContext>{0}</SessionContext>".format(json);
        var serviceUrl = RoleOperate.roleService + "DataCUD";
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

    saveUser: function (xml, callback) {
        var json = "{'DBName':'" + RoleOperate.dbName + "','Schema':'" + RoleOperate.schema + "','SPName':'usp_SaveUser','Params':{'item':'" + xml + "'}}";
        json = "<SessionContext>{0}</SessionContext>".format(json);
        var serviceUrl = RoleOperate.roleService + "DataCUD";
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

    getPath: function (applicationId, callback) {
        var sContent = "{'SPName':'usp_GetPath','Params':{'ApplicationId':'" + applicationId + "'}}";
        var serviceUrl = RoleOperate.roleService + "DataRead?dbName=" + RoleOperate.dbName + "&schema=" + RoleOperate.schema + "&json=" + sContent;
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
        var json = "{'DBName':'" + RoleOperate.dbName + "','Schema':'" + RoleOperate.schema + "','SPName':'usp_LastLoginDate','Params':{'UserName':'" + userName + "'}}";
        json = "<SessionContext>{0}</SessionContext>".format(json);
        var serviceUrl = RoleOperate.roleService + "DataCUD";
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
        var sContent = "{'SPName':'usp_GetModulesByPathId','Params':{'PathId':'" + pathId + "'}}";
        var serviceUrl = RoleOperate.roleService + "DataRead?dbName=" + RoleOperate.dbName + "&schema=" + RoleOperate.schema + "&json=" + sContent;
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
        var items = [];
        var sContent = "{'SPName':'usp_GetModuleTypes','Params':{" +
                 "'SetName':'" + set + "'" +
                 "}}";
        var serviceUrl = RoleOperate.roleService + "DataRead?dbName=" + RoleOperate.dbName + "&schema=" + RoleOperate.schema + "&json=" + sContent;
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
        xml = encodeURIComponent(xml);
        var json = "{'DBName':'" + RoleOperate.dbName + "','Schema':'" + RoleOperate.schema + "','SPName':'usp_SaveModule','Params':{'Items':'" + xml + "'}}";
        json = "<SessionContext>{0}</SessionContext>".format(json);
        var serviceUrl = RoleOperate.roleService + "DataCUD";
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
        var json = "{'DBName':'" + RoleOperate.dbName + "','Schema':'" + RoleOperate.schema + "','SPName':'usp_DeleteModuleById','Params':{" +
            "'ModuleId':'" + moduleId + "'" +
            "}}";
        json = "<SessionContext>{0}</SessionContext>".format(json);
        var serviceUrl = RoleOperate.roleService + "DataCUD";
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
        var sContent = "{'SPName':'usp_GetRolesByModuleId','Params':{'ModuleId':'" + moduleId + "'}}";
        var serviceUrl = RoleOperate.roleService + "DataRead?dbName=" + RoleOperate.dbName + "&schema=" + RoleOperate.schema + "&json=" + sContent;
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
        var sContent = "{'SPName':'usp_GetRolesByUserId','Params':{'UserId':'" + userId + "'}}";
        var serviceUrl = RoleOperate.roleService + "DataRead?dbName=" + RoleOperate.dbName + "&schema=" + RoleOperate.schema + "&json=" + sContent;
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
        var sContent = "{'SPName':'usp_GetRolesByUserName','Params':{'UserName':'" + userName + "'}}";
        var serviceUrl = RoleOperate.QucikFrameRoleService + "DataRead?dbName=" + RoleOperate.dbName + "&schema=" + RoleOperate.schema + "&json=" + sContent;
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
        xml = encodeURIComponent(xml);
        var json = "{'DBName':'" + RoleOperate.dbName + "','Schema':'" + RoleOperate.schema + "','SPName':'usp_SaveModuleRoles','Params':{'Items':'" + xml + "'}}";
        json = "<SessionContext>{0}</SessionContext>".format(json);
        var serviceUrl = RoleOperate.roleService + "DataCUD";
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
        var json = "{'DBName':'" + RoleOperate.dbName + "','Schema':'" + RoleOperate.schema + "','SPName':'usp_DeleteModuleRole','Params':{" +
            "'ModuleId':'" + moduleId + "'" +
            ",'RoleId':'" + roleId + "'" +
            "}}";
        json = "<SessionContext>{0}</SessionContext>".format(json);
        var serviceUrl = RoleOperate.roleService + "DataCUD";
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

    getRolesByPathId: function (pathId, callback) {
        var sContent = "{'SPName':'usp_GetRolesByPathId','Params':{'PathId':'" + pathId + "'}}";
        var serviceUrl = RoleOperate.roleService + "DataRead?dbName=" + RoleOperate.dbName + "&schema=" + RoleOperate.schema + "&json=" + sContent;
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

    getUsersByRoleId: function (roleId, callback) {
        var sContent = "{'SPName':'usp_GetUsersByRoleId ','Params':{'RoleId':'" + roleId + "'}}";
        var serviceUrl = RoleOperate.roleService + "DataRead?dbName=" + RoleOperate.dbName + "&schema=" + RoleOperate.schema + "&json=" + sContent;
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

    savePathRoles: function (xml, callback) {
        xml = encodeURIComponent(xml);
        var json = "{'DBName':'" + RoleOperate.dbName + "','Schema':'" + RoleOperate.schema + "','SPName':'usp_SavePathRoles','Params':{'Items':'" + xml + "'}}";
        json = "<SessionContext>{0}</SessionContext>".format(json);
        var serviceUrl = RoleOperate.roleService + "DataCUD";
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

    saveUsersRoles: function (xml, callback) {
        var json = "{'DBName':'" + RoleOperate.dbName + "','Schema':'" + RoleOperate.schema + "','SPName':'usp_SaveUsersRoles','Params':{'item':'" + xml + "'}}";
        json = "<SessionContext>{0}</SessionContext>".format(json);
        var serviceUrl = RoleOperate.roleService + "DataCUD";
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

    deleteUsersRoles: function (userId, roleId, callback) {
        var json = "{'DBName':'" + RoleOperate.dbName + "','Schema':'" + RoleOperate.schema + "','SPName':'usp_DeleteUsersRoles','Params':{" +
           "'UserId':'" + userId + "'," +
           "'RoleId':'" + roleId + "'" +
           "}}";
        json = "<SessionContext>{0}</SessionContext>".format(json);
        var serviceUrl = RoleOperate.roleService + "DataCUD";
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

    deletePathRoles: function (pathId, roleId, callback) {
        var json = "{'DBName':'" + RoleOperate.dbName + "','Schema':'" + RoleOperate.schema + "','SPName':'usp_DeletePathRoles','Params':{'PathId':'" + pathId + "','RoleId':'" + roleId + "'}}";
        json = "<SessionContext>{0}</SessionContext>".format(json);
        var serviceUrl = RoleOperate.roleService + "DataCUD";
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
    getAllRoles: function (callback) {
        var sContent = "{'SPName':'usp_GetAllRoles','Params':{}}";
        var serviceUrl = RoleOperate.roleService + "DataRead?dbName=" + RoleOperate.dbName + "&schema=" + RoleOperate.schema + "&json=" + sContent;
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

    getApprovalPermissionByRoleId: function (roleId, callback) {
        var sContent = "{'SPName':'usp_GetApprovalPermissionByRoleId','Params':{'RoleId':'" + roleId + "'}}";
        var serviceUrl = RoleOperate.roleService + "DataRead?dbName=" + RoleOperate.dbName + "&schema=" + RoleOperate.schema + "&json=" + sContent;
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

    //[QuickFrame].[usp_GetAllPermission]
    getAllPermission: function (callback) {
        var sContent = "{'SPName':'usp_GetAllPermission','Params':{}}";
        var serviceUrl = RoleOperate.roleService + "DataRead?dbName=" + RoleOperate.dbName + "&schema=" + RoleOperate.schema + "&json=" + sContent;
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
    getPermissionByTypeId: function (typeId, callback) {
        var sContent = "{'SPName':'usp_GetPermissionByTypeId','Params':{'TypeId':'" + typeId + "'}}";
        var serviceUrl = RoleOperate.roleService + "DataRead?dbName=" + RoleOperate.dbName + "&schema=" + RoleOperate.schema + "&json=" + sContent;
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

    //usp_GetAllApplications
    getAllApplications: function (callback) {
        var sContent = "{'SPName':'usp_GetAllApplications','Params':{}}";
        var serviceUrl = RoleOperate.roleService + "DataRead?dbName=" + RoleOperate.dbName + "&schema=" + RoleOperate.schema + "&json=" + sContent;
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

    //[QuickFrame].[usp_SavePermissionById]
    savePermissionById: function (xml, roleId, callback) {
        xml = encodeURIComponent(xml);
        var json = "{'DBName':'" + RoleOperate.dbName + "','Schema':'" + RoleOperate.schema + "','SPName':'usp_SavePermissionById','Params':{'Items':'" + xml + "','RoleId':'" + roleId + "'}}";
        console.log(json);
        json = "<SessionContext>{0}</SessionContext>".format(json);
        var serviceUrl = RoleOperate.roleService + "DataCUD";
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

    getApplicationsByUserName: function (userName, callback) {
        var sContent = "{'SPName':'usp_GetApplicationsByUserName','Params':{'UserName':'" + userName + "'}}";
        var serviceUrl = RoleOperate.roleService + "DataRead?dbName=" + RoleOperate.dbName + "&schema=" + RoleOperate.schema + "&json=" + sContent;
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
    }

}

