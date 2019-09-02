define(function (require) {
    var $ = require('jquery');
    require('date_input');
    var toast = require('toast');
    var webStorage = require('gs/webStorage');
    var GlobalVariable = require('globalVariable');
    var GSDialog = require("gsAdminPages")
    var win = this;
    var username = webStorage.getItem('gs_UserName');
    $(function () {
        $('.date-plugins').date_input();

        $("#btnSave").click(function () { Save(); });
    });

    function Save() {


        if ($('#CatalogDatetime').val() == '' || $('#CatalogDatetime').val() == undefined) {
            $('#CatalogDatetime').addClass('red-border');
            $.toast({ type: 'warning', message: '请选择目录日期' })
            return false;
        }
        if ($('#CatalogContent').val() == '' || $('#CatalogContent').val() == undefined) {
            $('#CatalogContent').addClass('red-border');
            $.toast({ type: 'warning', message: '请输入目录内容' })
            return false;
        }

        $('#CatalogDatetime').removeClass('red-border');
        $('#CatalogContent').removeClass('red-border');
        var catalgoDatetime = $('#CatalogDatetime').val();
        var createdBy = username;
        var content = $('#CatalogContent').val();
        var params = { 'CatalogDateTime': catalgoDatetime, 'CreatedBy': createdBy, 'Content': content };
        var executeParams = JSON.stringify(params);
        serviceUrl = GlobalVariable.DocumentServiceUrl + "Save";

        $.ajax({
            type: "POST",
            url: serviceUrl,
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            data: executeParams,
            success: function (response) {
                if (response != "" && response != undefined && parseInt(response) > 0) {
                    $.toast({ type: 'success', message: '保存成功' })
                    //GSDialog.Close('');
                }
            },
            error: function (response) {
                $.toast({ type: 'error', message: '保存失败' })
            }
        });

    }

});