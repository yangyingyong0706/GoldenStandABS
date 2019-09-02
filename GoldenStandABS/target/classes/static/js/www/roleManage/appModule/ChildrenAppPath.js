﻿define(function (require) {
    var $ = require('jquery');
    require('jquery-ui');
    var kendo = require('kendo.all.min');
    var RoleOperate = require('gs/uiFrame/js/roleOperate');
    require('anyDialog');
    var common = require('common');
    var self = this;
    var winHeight = 500;
    var winWidth = 500;
    var set = "zh-CN";
    var PathId = null;
    var GSDialog = require("gsAdminPages")
    $(function () {
        PathId = common.getQueryString("appId");//'F8D681BC-A289-43A8-AC06-0E538EB0A92E';//
        winHeight = $(window.parent.document).height();
        winWidth = $(window.parent.document).width();
        registerEvent();
        runderGrid();
    });
    function registerEvent() {
        $("#btnPathAdd").click(function () {
            saveItems();
            runderGrid();
        });
    }

    function saveItems() {
        var pathName = $("#pathName").val();
        var Description = $("#Description").val();
        var path = $("#path").val();
        if (pathName == '') {
            GSDialog.HintWindow('菜单名称不能为空!');
            $("#pathName").focus();
            return false
        }
        if (path.indexOf('#') != 0) {
            path = path.split('#')[0];
        }
        var xml = '<item><pathName>' + pathName + '</pathName><Description>' + Description + '</Description><path>' + path + '</path></item>'
        xml = encodeURIComponent(xml);
        RoleOperate.SaveChildrenPath(xml, PathId, callback);
        function callback(r) {
            if (r == '1') {
                GSDialog.HintWindow("已添加过此菜单！");
            }
            else if (r == '2') {
                runderGrid();
                $("#pathName,#path,#Description").val('');
                GSDialog.HintWindow("添加成功！");
            }
        }
    }
    function runderGrid() {
        var html = '';
        RoleOperate.GetChildrenPathsPath(PathId, function (data) {
            console.log(data)
            $.each(data, function (i, d) {
                html += '<tr><td>' + d.PathName + '</td><td>' + d.Description + '</td><td><a href="' + d.Path + '">' + d.Path + '</a></td><td><button class="btn btn-link" id="' + d.PathId + '" onclick="self.deletePath(this)"  type="button"><i class="fa fa-trash-o" title="删除"></i></button></td></tr>';
            });
            $('#list').html(html);
        });
    }

    function toPage(obj) {
        var Path = $(obj).attr('id');
        window.open(Path);
    }

    this.deletePath = function (obj) {
        var PathId = $(obj).attr('id');
        GSDialog.HintWindowTF("确定删除这个菜单？", function () {
            RoleOperate.DeleteChildrenAppById(PathId, function (r) {
                if (r == '0') {
                    GSDialog.HintWindow('删除成功');
                    runderGrid();
                } else {
                    GSDialog.HintWindow('Error:' + r);
                }
            });
        })
    }
});







