define(function (require) {
    //<script src="../Scripts/jquery-1.7.2.min.js"></script>
    //<script src="../Scripts/knockout-3.4.0.js"></script>
    //<script src="../Scripts/knockout.mapping-latest.js"></script>
    //<script src="../Scripts/calendar.min.js"></script>
    //<script src="../Scripts/jquery-ui.min.js"></script>
    //<script src='../Scripts/common.js'></script>
    //<script src='../Scripts/roleOperate.js'></script>
    //<script src="../Scripts/format.number.js"></script>
    //<script src='../Scripts/renderControl.js'></script>
    //<script src="roleDetail.js"></script>
    //<script type="text/javascript">
    //</script>

    var $ = require('jquery');
    require('jquery-ui');
    var kendo = require('kendo.all.min');
    var RoleOperate = require('gs/uiFrame/js/roleOperate');
    require('anyDialog');
    var GSDialog = require("gsAdminPages")
    var common = require('common');

    var roleId;
    var flag;

    //用于父页面是否需要刷新,子页面如果有Save操作会给它赋值
    var HaveDoneAction = false;

    $(function () {
        roleId = common.getQueryString("roleId");
        flag = common.getQueryString("flag");
        if (flag == "1" && roleId != null) {
            RoleOperate.getRoleById(roleId, function (d) {
                if (d != null) {
                    $('#RoleName').val(d.RoleName);
                    $('#Description').val(d.Description);
                }
            })

        }
        $('.validControlValue').change(function () {
            var inputItem = $(this)
            common.validControlValue(inputItem);
            //= "validControlValue(this)"
        }) 
    });




    this.saveData = function () {
        var pass = validation();
        if (!pass) {
            return;
        }

        var roleName = $("#RoleName").val();
        var description = $("#Description").val();
        var xml = '<Item><RoleId>' + roleId + '</RoleId><RoleName>' + roleName + '</RoleName><Description>' + description + '</Description></Item>'
        xml = encodeURIComponent(xml);
        RoleOperate.saveRolesData(xml, flag, function (result) {
            if (!isNaN(result)) {
                if (result == "1") {
                    GSDialog.HintWindow("添加成功！", function () {
                        window.parent.refreshGrid();
                    });

                }
                else if (result == "2") {
                    GSDialog.HintWindow("编辑成功", function () {
                        window.parent.refreshGrid();
                    });
                }
                else if (result == "-1") {
                    GSDialog.HintWindow("角色已经存在");
                }
            }
            else {
                common.alertMsg("Error:" + result, 'icon-warning');
            }
        });

    }


    function validation() {
        var inputs = $("#roleDiv").find("input");
        var textareas = $("#roleDiv").find("textarea");
        var pass1 = common.validControls(inputs);
        var pass2 = common.validControls(textareas);
        if (pass1 && pass2) {
            return true;
        }
        else {
            return false;
        }

    }

})
