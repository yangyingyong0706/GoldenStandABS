define(function (require) {

    var self = this;
    var $ = require('jquery');
    var RoleOperate = require('gs/uiFrame/js/roleOperate');
    require('date_input');
    require('jquery-ui');
    var common = require('common');
    require('jquery.md5');
    var GSDialog = require("gsAdminPages")
    var HaveDoneAction = false;
    /*email的自动后缀*/
    var emailsorce = ["@sina.com", "@163.com", "@qq.com", "@126.com", "@vip.sina.com",
    "@sina.cn", "@hotmail.com", "@gmail.com", "@sohu.com", "@yahoo.cn", "@139.com",
    "@wo.com.cn", "@189.cn"];
    var eindex = -1;
    var email = {
        init: function () {
            var that = this;
            $("#email").focus(function () {
                if ($(this).val() == "") {
                    that.hint();
                }
            })
        },
        bindeven: function () {
            this.chose();
            this.keychange();
        },
        miss: function () {//失去焦点删除按钮隐藏 下拉选项消失 判断是否为邮箱格式
            $("#email").blur(function () {
                var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;//邮箱正则表达式
            })
        },
        keychange:function(){
            $("#email").keyup(function (e) {
                var key = e.keyCode;
                if (key == "40") {
                    if ($("#sele").is(":visible ")) {
                        eindex++;
                        var len = $("#sele").find("li").length;
                        if (eindex > len-1) eindex = 0;
                        $("#sele>li").eq(eindex).addClass("current_li").siblings().removeClass("current_li");
                    }
                }
                if (key == "13") {
                   
                    var value = $("#sele>li").eq(eindex).html();
                    $("#email").val(value)
                    $("#sele").css("display", "none");
                    eindex = -1;
                }
                if (key == "38") {
                    if ($("#sele").is(":visible ")) {
                        eindex--;
                        var len = $("#sele").find("li").length;
                        if (eindex < 0) eindex = len-1;
                        $("#sele>li").eq(eindex).addClass("current_li").siblings().removeClass("current_li");
                    }
                }
            })
        },
        hint: function () {//初始输入出现邮箱选项 消除按钮出现
            var that = this;
            $("#email").on("input", function () {
                if ($(this).val() != "") {
                    if ($(this).val().indexOf("@") == -1) {//是否输入到@
                        $("#sele").html("");//每次输入初始化
                        $("#sele").css({ "display": "block" });
                        for (var i = 0; i < emailsorce.length; i++) {//把集合的邮箱加入li中
                            var li = $("<li>" + $(this).val() + emailsorce[i] + "</li>");
                            $("#sele").append(li);
                        }
                        $("#closeuser").css({ "display": "block" });//消除按钮显示

                    } else {
                        var arr = $(this).val().split("@");
                        if (arr[1] != "") {//筛选@之后的内容
                            $("#sele").html("");//每次输入初始化
                            for (var i = 0; i < emailsorce.length; i++) {
                                var temp = emailsorce[i].split(".")[0];
                                if (temp.indexOf(arr[1]) != -1) {//筛选选项是否含有输入的内容 有显示 没有隐藏
                                    var li = $("<li>" + arr[0] + emailsorce[i] + "</li>");
                                    $("#sele").append(li);
                                }
                            }
                        }
                    }
                } else {
                    //单框内没内容消除按钮隐藏 下拉选项隐藏
                    $("#sele").css({ "display": "none" });
                }
            })
        },
        chose: function () {
            var that=this
            $("#sele").on("mouseover", "li", function () {
                eindex = $(this).index();
                $(this).addClass("current_li").siblings().removeClass("current_li");
            })
            $("#sele").on("click", "li", function () {
                var value = $(this).html();
                $("#email").val(value)
                $("#sele").css("display", "none");
                eindex = -1;
            })
        },
    }
    /*email的自动后缀结束*/
    $(function () {
        setDatePlugins();
        bindQuestionDropDown();
        email.init();
        email.bindeven();
        PasswordValidaTion();
        var myDate = new Date();
        var currentDate = myDate.dateFormat("yyyy-MM-dd");
        $("#createDate").val(currentDate);
        $("#lastActiveDate").val(currentDate);//最新活跃时间暂时先取当前时间
        $('#btnSave').click(function () {
            var pass = validation();
            if (!pass) {
                var ControlValue = $(".validControlValue");
                $.each(ControlValue, function (i, n) {
                    if ($(n).val() == "") {
                        $(n).addClass("red-border");
                    }else{
                        $(n).removeClass("red-border");
                    }
                });
                common.alertMsg("带*号的是必填的选项")
                return;
            }
            var userName = $("#userName").val();


            RoleOperate.isExistUsername(userName, function (r) {
                if (r != '0') {
                    common.alertMsg("该用户名已存在");
                    return;
                } else {

                    var propertyNames = "FirstName;LastName;Age";
                    var firstName = $("#firstName").val();
                    var lastName = $("#lastName").val();
                    var age = $("#age").val();

                    if (!$.isNumeric(age)) {
                        GSDialog.HintWindow('年龄请输入数字');
                        return;
                    }
                    if (parseInt(age) <= 0) {
                        GSDialog.HintWindow('年龄请输入大于零的数字');
                        return;
                    }


                    var propertyValues = firstName + ';' + lastName + ';' + age;
                    var loweredUserName = userName.toLocaleLowerCase();
                    var isAnonymous = getRadioValue("isAnonymous");
                    var lastActiveDate = $("#lastActiveDate").val();
                    var password = $.md5($("#password").val());
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
                    var lastLockoutDate = $("#lastLockoutDate").val();
                    var lastPasswordChangedDate = $("#lastPasswordChangedDate").val();
                    var comment = $("#comment").val();
                    var xml = '<item>';
                    xml += '<UserName>' + userName + '</UserName><PropertyNames>' + propertyNames + '</PropertyNames><PropertyValues>' + propertyValues + '</PropertyValues><LoweredUserName>' + loweredUserName + '</LoweredUserName>';
                    xml += '<IsAnonymous>' + isAnonymous + '</IsAnonymous><LastActiveDate>' + lastActiveDate + '</LastActiveDate><Password>' + password + '</Password><Email>' + email + '</Email>';
                    xml += '<LoweredEmail>' + loweredEmail + '</LoweredEmail><PasswordQuestion>' + passwordQuestion + '</PasswordQuestion><PasswordAnswer>' + passwordAnswer + '</PasswordAnswer><QuestionId>' + questionId + '</QuestionId>';
                    xml += '<IsApproved>' + isApproved + '</IsApproved><IsLockedOut>' + isLockedOut + '</IsLockedOut><CreateDate>' + createDate + '</CreateDate><LastLoginDate>' + lastLoginDate + '</LastLoginDate>';
                    xml += '<LastPasswordChangedDate>' + lastPasswordChangedDate + '</LastPasswordChangedDate><LastLockoutDate>' + lastLockoutDate + '</LastLockoutDate><Comment>' + comment + '</Comment></item>';
                    var exml = encodeURIComponent(xml);
                    RoleOperate.addUser(exml, callback)
                    function callback(r) {
                        if (r == 2) {
                            GSDialog.HintWindow('添加成功！', function () {
                                window.parent.refreshGrid();
                            });
                            //setTimeout(function () { parent.closeWindow(); }, 1000);
                        }
                        else { common.alertMsg('Failed：' + r, 'icon-warning'); }
                    }
                }
            })

        });
        $('.validControlValue').change(function () {
            var inputItem = $(this);
            common.validControlValue(inputItem);
        })
    });
    function bindQuestionDropDown(callback) {
        RoleOperate.getQuestion(function (d) {
            $("#passwordQuestion").find('option').remove();
            $.each(d, function (index, item) {
                var option = '<option value=' + item.QuestionId + ' >' + item.Question + '</option>';
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
    function validation() {
        var pass = true;
        var detail = $("#ItemDiv").find("input");
        pass = common.validControls(detail);
        return pass;
    }
    function PasswordValidaTion() {
        var passwordDom = $("#password");
        passwordDom.on("blur", function () {
            var password = $(this).val();
            var reg = /^(?![\d]+$)(?![a-zA-Z]+$)(?![^\da-zA-Z]+$).{6,16}$/;
            var passwordVal = reg.test(password);
            if (!passwordVal) { $(this).focus(); common.alertMsg("密码必须由6-16位的字母和数字组成",0) }
        })
        

    }

})
