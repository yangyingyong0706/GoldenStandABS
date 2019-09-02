
$(function () {
    registerEvent();
    RoleOperate.getQuestion(getQuestionName);
    function getQuestionName(data)
    {
        var html = '';
        $.each(data, function (i, d) {
            html += ' <option value="' + d.QuestionId + '">' + d.Question + '</option>';
        });
        $('option').after(html);
    }
})
function registerEvent() {
    var userfag=false;
    var psfag =false;
    var emfag=true;

    //用户名验证
    var uvhtml = '<i id="uv" style="color:bule">&radic;</i>';
    var uxhtml = '<i id="ux" style="color:red">用户名已存在</i>';
    var uhtml = '<i id="un" style="color:red">用户名不能为空</i>';
    var ushtml = '<i id="us" style="color:red">请输入5到20位以字母开头</i>';
    $("#nameUser").blur(function () {
        var UserName = $("#nameUser").val();
        if (UserName != '') {
            $('#un').remove();
            RoleOperate.isExistUsername(UserName, function (r) {
                if (r == '0') {
                    $('#ux').remove();
                    $('#uv').remove();
                    if (isRegisterUserName(UserName)) {
                        $('#ux').remove();
                        $('#uv').remove();
                        $('#us').remove();
                        $('#nameUser').after(uvhtml);
                        userfag = true;
                    } else {
                        $('#ux').remove();
                        $('#uv').remove();
                        $('#us').remove();
                        $('#nameUser').after(ushtml);
                       
                    }
                   
                } else {
                    $('#ux').remove();
                    $('#uv').remove();
                    $('#nameUser').after(uxhtml);
                    userfag = false;
                }
            });
        } else {
            $('#ux').remove();
            $('#uv').remove();
            $('#un').remove();
            $('#nameUser').after(uhtml);
            userfag = false;
        }
    });
   
    //密码验证
    var pvhtml = '<i id="pv" style="color:bule">&radic;</i>';
    var phtml = '<i id="pu" style="color:red">密码不能为空</i>';
    var pshtml = '<i id="ps" style="color:red">请输入6-20个字母、数字、下划线</i>';
    $('#passwordUser').blur(function () {
        var Password = $("#passwordUser").val();
        if (Password == '') {
            $('#pv').remove();
            $('#pu').remove();
            $('#passwordUser').after(phtml);
        } else {
            $('#pv').remove();
            $('#pu').remove();
            if (isPasswd(Password)) {
                $('#pv').remove();
                $('#pu').remove();
                $('#ps').remove();
                $('#passwordUser').after(pvhtml);
            } else {
                $('#pv').remove();
                $('#pu').remove();
                $('#ps').remove();
                $('#passwordUser').after(pshtml);
            }
           
        }
    });
    //密码确认验证
    var psvhtml = '<i id="psv" style="color:bule">&radic;</i>';
    var shtml = '<i id="s" style="color:red">密码不能为空</i>';
    var sshtml = '<i id="ss" style="color:red">密码不相同</i>';
    $('#passwordSure').blur(function () {
        var passwordSure = $("#passwordSure").val();
        var Password = $("#passwordUser").val();
        if (passwordSure != '') {
            if (passwordSure == Password) {
                $('#psv').remove();
                $('#s').remove();
                $('#ss').remove();
                $('#passwordSure').after(psvhtml);
                psfag = true;
            } else {
                $('#psv').remove();
                $('#s').remove();
                $('#ss').remove();
                $('#passwordSure').after(sshtml);
                psfag = false;
            }
        } else {
            $('#psv').remove();
            $('#s').remove();
            $('#ss').remove();
            $('#passwordSure').after(shtml);
            psfag = false;
        }
    });

    //验证邮箱
    var evhtml = '<i id="ev" style="color:bule">&radic;</i>';
    var exhtml = '<i id="ex" style="color:red">邮箱格式不正确</i>';
    $('#emailUser').blur(function () {
        var Email = $("#emailUser").val();
        if (Email != '') {
            if (isEmail(Email)) {
                emfag = true;
                $('#ev').remove();
                $('#ex').remove();
                $('#emailUser').after(evhtml);
            } else {
                $('#ev').remove();
                $('#ex').remove();
                $('#emailUser').after(exhtml);
                emfag = false;
            }
        } else {
            $('#ev').remove();
            $('#ex').remove();
            emfag = true;
        }
    });
    //问题验证
    var qvhtml = '<i id="qv" style="color:bule">&radic;</i>';
    var qxhtml = '<i id="qx" style="color:red">请填写答案</i>';
    $("#askUser").blur(function () {
        var questonid = $("#askUser").val();
        var answerUser = $("#answerUser").val();
        if (questonid != '') {
            if (answerUser == '') {
                $('#qv').remove();
                $('#qx').remove();
                $("#answerUser").after(qxhtml);
            } else {
                $('#qv').remove();
                $('#qx').remove();
                $("#answerUser").after(qvhtml);
            }
        } else {
            $('#qv').remove();
            $('#qx').remove();
            $("#answerUser").after(qvhtml);
        }
    });
    $("#answerUser").blur(function () {
        var questonid = $("#askUser").val();
        var answerUser = $("#answerUser").val();
        if (questonid != '') {
            if (answerUser == '') {
                $('#qv').remove();
                $('#qx').remove();
                $("#answerUser").after(qxhtml);
            } else {
                $('#qv').remove();
                $('#qx').remove();
                $("#answerUser").after(qvhtml);
            }
        } else {
            $('#qv').remove();
            $('#qx').remove();
            $("#answerUser").after(qvhtml);
        }
    });
    $("#register").click(function () {
        var UserName = $("#nameUser").val();
        var passwordSure = $.md5($("#passwordSure").val());
        var Email = $("#emailUser").val();
        var questonid = $("#askUser").val();
        var answerUser = $("#answerUser").val();
        var xml = '<item>';
        xml += '<UserName>'+UserName+'</UserName>'
        xml += '<Password>'+passwordSure+'</Password>';
        xml += '<Email>' + Email + '</Email>';
        xml += '<QuestionId>' + questonid + '</QuestionId>';
        xml += '<PasswordAnswer>' + answerUser + '</PasswordAnswer></item>';
        var exml = encodeURIComponent(xml);
        if (userfag && psfag && emfag) {
            RoleOperate.saveUser(exml, function (r) {
                if (r == '1') {
                    alertMsg('注册成功!');
                    setTimeout('parent.closeWindow()', 2000);
                    //$('input').val('');
                    //$('#qv').remove();
                    //$('#pv').remove();
                    //$('#ev').remove();
                    //$('#psv').remove();
                    //$('#uv').remove();
                }
                else {
                    alertMsg('Failed：' + r, 'icon-warning');
                }
            });
        } else {
            alertMsg('请认真填写您的注册信息','icon-warning');
        }
    });
}  
//邮箱验证正则
function isEmail(str) {
    var reg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/;
    return reg.test(str);
}

//验证用户名5到20位
function isRegisterUserName(str)
{
    var patrn = /^[a-zA-Z]{1}([a-zA-Z0-9]|[._]){4,19}$/;
    return patrn.test(str);
}
//验证密码
function isPasswd(str) {
    var patrn = /^(\w){6,20}$/;
    return patrn.test(str);
}