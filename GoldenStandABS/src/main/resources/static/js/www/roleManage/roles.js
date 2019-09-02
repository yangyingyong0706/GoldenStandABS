define(['jquery', 'permission','Vue', 'gs/uiFrame/js/roleOperate', 'common', 'jquery.cookie', ], function ($, permission,vue,RoleOperate, common) {
    $(function () {
        //var setpApp = common.getQueryString("roleManage");
        //var userName = webStore.getItem('gs_UserName');
        //var IsAdministrator = webStore.getItem("IsAdministrator");//判断用户是否为管理员

        $('.home-tab').click(function () {

            $("body", window.parent.document).find(".header.clearfix").removeClass("header_bg");
            $("body", window.parent.document).find(".header.clearfix").addClass("header_bg");
            $('.header-nav', top.document).css('display', 'none');
            $('#bussinessSystem', top.document).css('display', 'none');
            $('#others', top.document).css('display', '');
            $('#work', top.document)[0].contentWindow.location.replace('../navigator/main.html');

        });
        var LiGroups = [
             { name: "用户管理", desc: "UsersManagement",NotControl:1, iStyle: "fa fa-user-plus fa-fw", active: "active", url: "userManage/userList.html" }
            , { name: "角色管理", desc: "RolesManagement", NotControl: 1, iStyle: "fa fa-users fa-fw", active: "", url: "roleManage/roleList.html" }
            , { name: "应用管理", desc: "ApplicationsManagement", NotControl: 1, iStyle: "fa fa-th-large fa-fw", active: "", url: "appModule/appList.html" }
            , { name: "子应用管理", desc: "childrenAppManagement", NotControl: 1, iStyle: "fa fa-th-large fa-fw", active: "", url: "appModule/childrenAppList.html" }
            , { name: "子菜单管理", desc: "ChildMenuManagement", NotControl: 1, iStyle: "fa fa-list fa-fw", active: "", url: "pathManage/pathList.html" }
            , { name: "审批权限管理", desc: "ApproveManagement", iStyle: "fa fa-vcard-o fa-fw", active: "", url: "approvePermission/approvePermission.html" }
            , { name: "业务权限管理", desc: "BusinessManagement", iStyle: "fa fa-user-plus fa-fw", active: "", url: "businessPermission/businessPermission.html" }
            , { name: "用户审批列表", desc: "ApproveListManagement", iStyle: "fa fa-user-plus fa-fw", active: "", url: "ApproveListManagement/ApproveListManagement.html" }
        ]
        var checkUserPermissiondata = permission.checkUserPermission(LiGroups)
        var vm = new vue({
            el: '#wrapper',
            data: {
                liSource: checkUserPermissiondata,
                sel: LiGroups[0].url
            },
            methods: {
                switchPage: function (item) {
                    var _this = this;
                    _this.sel = item.url;
                    $.each(_this.liSource, function (i, v) {
                        v.active = '';
                    })
                    item.active = 'active';
                }
            }
        });
  
    })
   
});