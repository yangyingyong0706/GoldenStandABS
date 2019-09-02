define(function (require) {

    var self = this;
    var $ = require('jquery');
    var RoleOperate = require('gs/uiFrame/js/roleOperate');
    require('date_input');
    require('jquery-ui');
    var common = require('common');
    var webProxy = require('gs/webProxy');
    var webStorage = require('gs/webStorage');
    require('jquery.md5');
    var HaveDoneAction = false;
    $(function () {
        var set = common.getQueryString("set");
        var userId = common.getQueryString("UserId");
        setDatePlugins();
        var questionId = 1;
        var password;
        RoleOperate.getUserDetailById(userId, function (response) {
            renderPage(response);
        })
        

        $('#btnSave').click(function () {
            var pass = validation2();
            if (!pass) {
                return;
            }
            var newPassword = $("#password").val();
            if (newPassword == "") {
                newPassword = password;
            }
            else {
                newPassword = $.md5($("#password").val());/*密码加密*/
            }
            var userName = $("#userName").val();
            var loweredUserName = userName.toLocaleLowerCase();
            var lastActiveDate = $("#lastActiveDate").val();
            var isAnonymous = getRadioValue("isAnonymous");
            var email = $("#email").val();
            var loweredEmail = email.toLocaleLowerCase();
            var options = $("#passwordQuestion option:selected");
            var passwordQuestion = options.text();
            var questionId = options.val();
            var passwordAnswer = $("#passwordAnswer").val();
            var isApproved = getRadioValue("isApproved");
            var isLockedOut = getRadioValue("isLockedOut");
            var createDate = $("#createDate").val();
            var lastLoginDate = $("#lastLoginDate").val();
            var lastPasswordChangedDate = $("#lastPasswordChangedDate").val();
            var lastLockoutDate = $("#lastLockoutDate").val();
            var comment = $("#comment").val();
            var xml = '<item>';
            xml += '<UserName>' + userName + '</UserName><UserId>' + userId + '</UserId><LoweredUserName>' + loweredUserName + '</LoweredUserName><IsAnonymous>' + isAnonymous + '</IsAnonymous>';
            xml += '<LastActiveDate>' + lastActiveDate + '</LastActiveDate><Password>' + newPassword + '</Password><Email>' + email + '</Email>';
            xml += '<LoweredEmail>' + loweredEmail + '</LoweredEmail><PasswordQuestion>' + passwordQuestion + '</PasswordQuestion><PasswordAnswer>' + passwordAnswer + '</PasswordAnswer><QuestionId>' + questionId + '</QuestionId>';
            xml += '<IsApproved>' + isApproved + '</IsApproved><IsLockedOut>' + isLockedOut + '</IsLockedOut><CreateDate>' + createDate + '</CreateDate><LastLoginDate>' + lastLoginDate + '</LastLoginDate>';
            xml += '<LastPasswordChangedDate>' + lastPasswordChangedDate + '</LastPasswordChangedDate><LastLockoutDate>' + lastLockoutDate + '</LastLockoutDate><Comment>' + comment + '</Comment></item>';
            var exml = encodeURIComponent(xml);
            RoleOperate.addUser(exml, callback);
            function callback(r) {
                if (r == 1) {
                    common.alertMsg('Update Successful!');
                    if ($("#logout", parent.document).length > 0) {
                        var userLanguage = webStorage.getItem('userLanguage');
                        webStorage.clear();
                        if (userLanguage) {
                            webStorage.setItem('userLanguage', userLanguage);
                        }
                        setTimeout(function () {
                            parent.window.location.href = webProxy.baseUrl + '/GoldenStandABS/www/login/login.html';
                        }, 1000)
                        
                    } else {
                        window.parent.refreshGrid();
                    }
                    //setTimeout(function () { parent.closeWindow(); }, 1000);
                }
                else if (r == 0) {
                    common.alertMsg('Failed：用户名已存在', 'icon-warning');
                }
                else {
                    common.alertMsg('Failed：' + r, 'icon-warning');
                }
            }
        });
        $('.validControlValue').change(function () {
            var inputItem = $(this);
            common.validControlValue(inputItem);
        })

    });

    function renderPage(d) {
        $.each(d, function (index, item) {
            // $('#password').val(item.Password);
            password = item.Password;
            $('#userName').val(item.UserName);
            var lastActiveDate = common.getStringDate(item.LastActiveDate).dateFormat("yyyy-MM-dd");
            $('#lastActiveDate').val(lastActiveDate);
            var isAnonymous = item.IsAnonymous;
            if (isAnonymous == true) {
                $("#isAnonymousYes").attr("checked", "checked");
            }
            else { $("#isAnonymousNo").attr("checked", "checked") }
            $('#email').val(item.Email);
            // $('#passwordQuestion').val(item.PasswordQuestion);
            questionId = item.QuestionId;
            bindQuestionDropDown(questionId);
            $('#passwordAnswer').val(item.PasswordAnswer);
            var isApproved = item.IsApproved;
            if (isApproved == true) {
                $("#isApprovedYes").attr("checked", "checked");
            }
            else { $("#isApprovedNo").attr("checked", "checked") }
            var isLockedOut = item.IsLockedOut;
            if (isLockedOut == true) {
                $("#isLockedOutYes").attr("checked", "checked");
            }
            else { $("#isLockedOutNo").attr("checked", "checked") }

            var createDate;
            var lastLoginDate;
            var lastPasswordChangedDate;
            var lastLockoutDate;
            if (item.CreateDate == null) { createDate = '' }
            else { createDate = common.getStringDate(item.CreateDate).dateFormat("yyyy-MM-dd"); }
            if (item.LastLoginDate == null) { lastLoginDate = '' }
            else { lastLoginDate = common.getStringDate(item.LastLoginDate).dateFormat("yyyy-MM-dd"); }
            if (item.LastPasswordChangedDate == null) { lastPasswordChangedDate = '' }
            else { lastPasswordChangedDate = common.getStringDate(item.LastPasswordChangedDate).dateFormat("yyyy-MM-dd"); }
            if (item.LastLockoutDate == null) { lastLockoutDate = '' }
            else { lastLockoutDate = common.getStringDate(item.LastLockoutDate).dateFormat("yyyy-MM-dd"); }
            $('#createDate').val(createDate);
            $('#lastLoginDate').val(lastLoginDate);
            $('#lastPasswordChangedDate').val(lastPasswordChangedDate);
            $('#lastLockoutDate').val(lastLockoutDate);
            $('#comment').val(item.Comment);
        });
    }
    function bindQuestionDropDown(questionId, callback) {
        RoleOperate.getQuestion(function (d) {
            $("#passwordQuestion").find('option').remove();
            $.each(d, function (index, item) {
                var option = '<option value=' + item.QuestionId + ' >' + item.Question + '</option>';
                if (item.QuestionId == questionId) {
                    option = '<option value=' + item.QuestionId + ' " selected = "selected">' + item.Question + '</option>';
                }
                $("#passwordQuestion").append(option);
            });
            if (callback) {
                callback();
            }
        });
    }
    function setDatePlugins() {
        $("#ItemDiv").find('.date-plugins').date_input();
    }
    function getRadioValue(elementName) {
        var isWorkingDay;
        var obj;
        obj = document.getElementsByName(elementName);
        if (obj != null) {
            var i;
            for (i = 0; i < obj.length; i++) {
                if (obj[i].checked) {
                    isWorkingDay = i;
                    return isWorkingDay;
                }
            }
        }
    }
    function validation2() {
        var pass = true;
        var detail = $("#ItemDiv").find("input");
        pass = common.validControls(detail);
        return pass;
    }
});
