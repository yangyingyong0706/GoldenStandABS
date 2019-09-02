define(function (require) {
    var $ = require('jquery');
    require('date_input');
    var webStorage = require('gs/webStorage');
    var GlobalVariable = require('globalVariable');
    var GSDialog = require('gs/uiFrame/js/gs-admin-2.pages');
    var common = require('common');
    var qwFrame = require('app/productManage/TrustManagement/Common/Scripts/QuickWizard.FrameEnhanceCus');
    var username = webStorage.getItem('gs_UserName');
    var ruleType = common.getQueryString('ruleType');
    var trustId = common.getQueryString('TrustId');
    $(function () {

        $('.date-plugins').date_input();

        loadingData();
    });

    $("#btnSave").click(function () { save(); });

    function loadingData() {
        var serviceUrl = GlobalVariable.DocumentServiceUrl + "GetMappVersion?trustId=" + trustId + "&ruleType=" + ruleType + "";
        $.ajax({
            type: "GET",
            url: serviceUrl,
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            data: "",
            success: function (data) {
                if (data != "" && data != undefined) {
                    if (data.Status == 0) {
                        $("#CatalogContent").val(data.Data);
                    }
                }
            },
            error: function (response) {
                alert("获取数据失败", 1);
            }
        });
    }

    function save() {

        if ($('#CatalogDatetime').val() == '' || $('#CatalogDatetime').val() == undefined) {
            $('#CatalogDatetime').addClass('red-border');
            return;
        }
        if ($('#CatalogContent').val() == '' || $('#CatalogContent').val() == undefined) {
            $('#CatalogContent').addClass('red-border');
            return;
        }

        $('#CatalogDatetime').removeClass('red-border');
        $('#CatalogContent').removeClass('red-border');
        var catalgoDatetime = $('#CatalogDatetime').val();
        var createdBy = username;
        var content = $('#CatalogContent').val();
        var remark = $('#Remark').val();
        var params = { 'CatalogDateTime': catalgoDatetime, 'TrustId': trustId, RuleType: ruleType, 'CreatedBy': createdBy, 'Content': content, 'Remark': remark };
        var executeParams = JSON.stringify(params);


        serviceUrl = GlobalVariable.DocumentServiceUrl + "SaveMappRule";
        $.ajax({
            type: "POST",
            url: serviceUrl,
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            data: executeParams,
            success: function (data) {
                if (data != "" && data != undefined) {
                    if (data.Status == 1) {
                        alert("保存成功");
                        //parent.location.reload();
                        //避免使用reload()导致页面刷新丢失掉当前浏览位置
                        parent.$('.active', parent.document).trigger('click');
                        GSDialog.close();
                    }
                }
            },
            error: function (response) {
                console.log(response)
                console.log('res')
                alert("保存失败");
            }
        });

    }
});