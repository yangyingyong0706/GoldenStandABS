define(function (require) {

   // <script src="../Config/globalVariable.js"></script>
   //<script src="../Scripts/jquery-1.7.2.min.js"></script>
   //<script src="../Scripts/jquery-ui.min.js"></script>
   //<script src="../Scripts/common.js"></script>
   //<script src="../Scripts/anyDialog.js"></script>
   //<!--<script src="../Scripts/Kendo/js/kendo.all.min.js"></script>
   //<script src="../Scripts/Kendo/js/kendo.culture.zh-CN.js"></script>
   //<script src="../Scripts/Kendo/js/kendo.messages.zh-CN.js"></script>-->
   //<!--<script src="../Scripts/loading.js"></script>-->
   //<script src="approvePermission.js"></script>
    //<script src="../Scripts/roleOperate.js"></script>

    var $ = require('jquery');
    var RoleOperate = require('roleOperate');
    var common = require('common');
    var set = "zh-CN"
    var pageId = 6;
    var global_ggid = 0;
    var winHeight = 0;
    var winWidth = 0;
    var IsDataChanged = false;
    var GSDialog = require("gsAdminPages")
    $(function () {
        winHeight = $(window.parent.document).height();
        winWidth = $(window.parent.document).width();

        //Tab事件的注册，一定要放在页面元素注册事件之前
        //tabEventRegister();

        //注册按钮事件
        regsterEvent();
        //绑定list列表
        bindList(global_ggid, false);
        //汉化kendo日历
        //kendo.culture("zh-CN");
    });

    //Tab事件的注册，一定要放在页面元素注册事件之前
    function regsterEvent() {
        //$('#btnAdd').click(function () {
        //    if (global_ggid == 0) {
        //        alertMsg("请选择政府", 0);
        //        return;
        //    }

        //    var gUrl = './governmentDetail.html?ggid=' + global_ggid + '&gid=' + 0 + '&set=zh-CN';
        //    tabDetailShow("添加信息", gUrl);
        //});


        //$('#btnRemove_govermentGroup').click(function () {
        //    if (!$(".list-item.active").length) {
        //        alertMsg("请选择要删除的政府名称", 0);
        //        return;
        //    }
        //    DataOperate.deleteTrustGroupExtensionGovernment(global_ggid, function (result) {
        //        DataOperate.deleteCreditGovernment(global_ggid, function (result) {
        //            DataOperate.deleteCreditGovernmentGroup(global_ggid, function (result) {
        //                $(".list-item.active").remove();
        //                alertMsg("删除成功", 1);
        //            })
        //        })
        //    })
        //});

        $('#save').click(function () {
            savePermissionByRoleId();
        });
    }


    function bindList(_ggid, refresh) {
        var typeId = '001'
        RoleOperate.getPermissionByTypeId(typeId, function (r) {
            var projectHtml = '<div class="trustgrouptype">兑付兑息表审核流程权限名称</div><table class="table">';
            var rowTemp = '';
            var columnTemplate = ' <td width="33.3%"><label >' +
                         '<input type="checkbox" id="onpermission" typeid="{0}" value="{1}"><span>{2}</span>' +
                         '</label></td>';
            var column = '';
            $.each(r, function (i, option) {
                column += columnTemplate.format(option.TypeId, option.StateCode, option.StateName);
                if ((i + 1) % 3 == 0 && i > 0) {
                    rowTemp += '<tr>{0}</tr>'.format(column);
                    column = '';
                }
            });
            projectHtml = projectHtml + rowTemp + '<tr>{0}</tr></table>'.format(column);
            $('#project').html(projectHtml);
        })

        typeId = '002'
        RoleOperate.getPermissionByTypeId(typeId, function (r) {
            var projectHtml = '<div class="trustgrouptype">信托报告审核流程权限名称</div><table class="table">';
            var rowTemp = '';
            var columnTemplate = ' <td width="33.3%"><label >' +
                         '<input type="checkbox" id="onpermission" typeid="{0}" value="{1}"><span>{2}</span>' +
                         '</label></td>';
            var column = '';
            $.each(r, function (i, option) {
                column += columnTemplate.format(option.TypeId, option.StateCode, option.StateName);
                if ((i + 1) % 3 == 0 && i > 0) {
                    rowTemp += '<tr>{0}</tr>'.format(column);
                    column = '';
                }
            });
            projectHtml = projectHtml + rowTemp + '<tr>{0}</tr></table>'.format(column);
            $('#product').html(projectHtml);
        })

        typeId = '003'
        RoleOperate.getPermissionByTypeId(typeId, function (r) {
            var projectHtml = '<div class="trustgrouptype">分配指令审核流程权限名称</div><table class="table">';
            var rowTemp = '';
            var columnTemplate = ' <td width="33.3%"><label >' +
                         '<input type="checkbox" id="onpermission" typeid="{0}" value="{1}"><span>{2}</span>' +
                         '</label></td>';
            var column = '';
            $.each(r, function (i, option) {
                column += columnTemplate.format(option.TypeId, option.StateCode, option.StateName);
                if ((i + 1) % 3 == 0 && i > 0) {
                    rowTemp += '<tr>{0}</tr>'.format(column);
                    column = '';
                }
            });
            projectHtml = projectHtml + rowTemp + '<tr>{0}</tr></table>'.format(column);
            $('#AssignmentCommand').html(projectHtml);
        })


        RoleOperate.getAllRoles(function (r) {
            var html = '';
            $.each(r, function (i, option) {
                if (i == 0) { 
                    html += '<li class="list-item active" roleid="' + option.RoleId + '">' + '<i class="icon icon-user-circle-o"></i>' + option.RoleName + '</li>';
                    RoleOperate.getApprovalPermissionByRoleId(option.RoleId, function (r) {
                        //console.log(r);
                        $.each(r, function (i, option) {
                            $("input[value='{0}']".format(option.StateCode)).attr("checked", true);
                        });
                    })
                } else {
                    html += '<li class="list-item" roleid="' + option.RoleId + '">' + '<i class="icon icon-user-circle-o"></i>' + option.RoleName + '</li>';
                }
            });
            $('#govermentGroupList').html(html);
            $(".list-item").click(function () {
                $(this).addClass("active").siblings().removeClass("active");
                $("input").attr("checked", false);
                var roleId = $(this).attr("roleid");
                RoleOperate.getApprovalPermissionByRoleId(roleId, function (r) {
                    //console.log(r);
                    $.each(r, function (i, option) {
                        $("input[value='{0}']".format(option.StateCode)).prop("checked", true);
                    });
                })
            })
        })

    }


    function savePermissionByRoleId() {
        var roleId = $('li.active').attr('roleid');
        var xml = '<Items>';
        $('input[type="checkbox"]:checked').each(function () {
            //if ($(this).closest(".group").attr("id") == "project") {
            var type = $(this).attr("typeid")
            //var typeCode = 'trustGroup';
            //var typeValue = $(this).closest(".table").prev().text();
            var stateCode = $(this).val();
            var stateName = $(this).next('span').text();
            xml += '<Item>';
            xml += '<Type>' + type + '</Type>';
            xml += '<RoleId>' + roleId + '</RoleId>';
            xml += '<WorkFlowState>' + stateCode + '</WorkFlowState>';
            xml += '<StateName>' + stateName + '</StateName>';
            xml += '</Item>';
            //}
        });
        xml += '</Items>';
        console.log(xml);
        RoleOperate.savePermissionById(xml, roleId, function (r) {
            console.log(r);
            GSDialog.HintWindow("保存成功");
        });
    }

})

