define(function (require) {
    var $ = require('jquery');
    var RoleOperate = require('gs/uiFrame/js/roleOperate');
    require('date_input');
    require('jquery-ui');
    var common = require('common');
    require('jquery.md5');
    var GSDialog = require("gsAdminPages")
    $(function () {
        var set = common.getQueryString("set");
        var userId = common.getQueryString("UserId");
        setDatePlugins();
        RoleOperate.getProfileById(userId, callback)
        function callback(d) {
            $.each(d, function (index, item) {
                var strs = new Array();
                strs = item.PropertyValues.split(";"); //字符分割 
                $('#firstName').val(strs[0]);
                $('#lastName').val(strs[1]);
                $('#age').val(strs[2]);
                var lastUpdatedDate;
                if (item.LastUpdatedDate == null) { lastUpdatedDate = '' }
                else { lastUpdatedDate = common.getStringDate(item.LastUpdatedDate).dateFormat("yyyy-MM-dd"); }
                $('#lastUpdatedDate').val(lastUpdatedDate);
            });
        }
        $('#btnSave').click(function () {
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


            var lastUpdatedDate = $("#lastUpdatedDate").val();
            var propertyNames = "FirstName;LastName;Age";
            var propertyValues = firstName + ';' + lastName + ';' + age;
            var xml = '<item>';
            xml += '<UserId>' + userId + '</UserId><PropertyNames>' + propertyNames + '</PropertyNames><PropertyValues>' + propertyValues + '</PropertyValues><LastUpdatedDate>' + lastUpdatedDate + '</LastUpdatedDate></item>';
            var exml = encodeURIComponent(xml);
            RoleOperate.updateProfile(exml, callback)
            function callback(r) {
                if (r == 1) {
                    GSDialog.HintWindow('更新成功！', function () {
                        window.parent.refreshGrid();
                    });
 
                    //setTimeout(function () { parent.closeWindow(); }, 1000);
                }
                else { common.alertMsg('Failed：' + r, 'icon-warning'); }
            }
        });
    });
    function setDatePlugins() {
        $("#ItemDiv").find('.date-plugins').date_input();
    }
});
