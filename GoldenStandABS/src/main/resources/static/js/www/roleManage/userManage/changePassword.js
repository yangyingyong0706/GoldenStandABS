define(function (require) {

    var self = this;
    var $ = require('jquery');
    toast = require('toast');
    require('jquery-ui');
    var common = require('common');
    var RoleOperate = require('gs/uiFrame/js/roleOperate');
    var webStorage = require('gs/webStorage');
    require('jquery.md5');
    var GSDialog = require("gsAdminPages");
    var userName = common.getQueryString("UserName");
    var ActLogs = require('insertActlogs');
    var webProxy = require('gs/webProxy');
    var ip;

    $.ajax({
        cache: false,
        type: "GET",
        async: false,
        url: webProxy.dataProcessServiceUrl + 'getIP',
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

    function setCookie(cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        var expires = "expires=" + d.toUTCString();
        document.cookie = cname + "=" + cvalue + "; " + expires + "; path=/";//path=/是根路径
    }

    $(function () {


        $('.samePassword').blur(function () {
            var that = $('.samePassword');
            var newPassword = $("#newPassword").val();
            var confirmPassword = $("#confirmPassword").val();
            if (newPassword && confirmPassword && (newPassword != confirmPassword)) {
                $.toast({ type: 'warning', message: '新密码和确认密码不一致' });
                //common.alertMsg("新密码和确认密码不一致");
                that.addClass("red-border");
            } else {
                that.removeClass("red-border");
            }
        });

        $('#oldPassword').blur(function () {
            var that = $(this);
            var oldPassword = $("#oldPassword").val();
            if (oldPassword && userName) {
                RoleOperate.isExistPassword(userName, $.md5(oldPassword), function (r) {
                    if (r == '0') {
                        $.toast({ type: 'warning', message: '旧密码不正确' });
                        //common.alertMsg("旧密码不正确");
                        that.addClass("red-border");
                    } else {
                        that.removeClass("red-border");
                    }
                })
            }

        });

        $('#btnSave').click(function () {
            if (!userName) {
                common.alertMsg("当前用户登录信息丢失，请重新登录");
                return;
            }
            var pass = PasswordValidaTion();
            if (pass) {
                var oldPassword = $("#oldPassword").val();
                if (oldPassword && userName) {
                    RoleOperate.isExistPassword(userName, $.md5(oldPassword), function (r) {
                        if (r == '0') {
                            $.toast({ type: 'warning', message: '旧密码不正确' });
                            //common.alertMsg("旧密码不正确");
                            $("#oldPassword").addClass("red-border");
                            return;
                        } else {
                            $("#oldPassword").removeClass("red-border");
                        }
                    })
                }
                var newPassword = $("#newPassword").val();
                var confirmPassword = $("#confirmPassword").val();
                if (newPassword != confirmPassword) {
                    $("#newPassword").addClass("red-border");
                    $("#confirmPassword").addClass("red-border");
                    $.toast({ type: 'warning', message: '新密码和确认密码不一致' });
                    //common.alertMsg("新密码和确认密码不一致");
                    return;
                } else {
                    $("#newPassword").removeClass("red-border");
                    $("#confirmPassword").removeClass("red-border");
                }

                RoleOperate.isExistPassword(userName, $.md5(oldPassword), function (r) {
                    if (r == '1') {
                        RoleOperate.changePassword(userName, $.md5(confirmPassword), function (response) {
                            if (response == 1) {
                                alert("密码已修改，请重新登录");

                                //清除登陆信息
                                var userLanguage = webStorage.getItem('userLanguage');
                                webStorage.clear();
                                setCookie("gs_UserName", "", -1);
                                if (userLanguage) {
                                    webStorage.setItem('userLanguage', userLanguage);
                                }

                                //记录
                                var description = "用户" + userName + "在" + new Date().toLocaleString() + "修改密码"
                                var category = "修改密码";
                                ActLogs.insertActlogs(false, userName, '重置密码', category, description, ip, '', '');

                                //跳转登录页
                                parent.location.reload();

                            } else {
                                $.toast({ type: 'warning', message: '修改密码失败' });
                                //common.alertMsg("修改密码失败");
                            }
                        })
                    } else {
                        $.toast({ type: 'warning', message: '旧密码不正确' });
                        //common.alertMsg("旧密码不正确");
                        return;
                    }
                })
            }
        });

    });

    function PasswordValidaTion() {
        var reg = /^(?![\d]+$)(?![a-zA-Z]+$)(?![^\da-zA-Z]+$).{6,16}$/;
        var ControlValue = $(".validControlValue");
        var isVerified = true;
        $.each(ControlValue, function (i, n) {
            if (!$(n).val()) {
                $(n).addClass("red-border");
                $.toast({ type: 'warning', message: '带*号的是必填的选项！' });
                //common.alertMsg("带*号的是必填的选项");
                isVerified = false;
            } else {
                $(n).removeClass("red-border");
                if (!reg.test($(n).val())) {
                    //$(n).focus();
                    $.toast({ type: 'warning', message: '密码必须由6-16位的字母和数字组成' });
                    //common.alertMsg("密码必须由6-16位的字母和数字组成", 0);
                    isVerified = false;
                }
            }
        });
        return isVerified;
    }

})
