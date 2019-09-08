define(function (require) {
    var $ = require('jquery');
    var common = require('common');
    var GSDialog = require('gs/uiFrame/js/gs-admin-2.pages');
    var GlobalVariable = require('globalVariable');
    var webStorage = require('gs/webStorage');
    require('app/productManage/TrustManagement/Common/Scripts/viewTrustWizard');
    require("app/projectStage/js/project_interface");
    var showId = webStorage.getItem('showId');

    $(function () {
        TRUST.init();

        //$('.btnRefresh').click(TRUST.refreshCashflowModel);
        $('.CheckAllocationData').click(TRUST.DataVerification)
        $('.btnRefresh').click(function () {
            console.log('btnRefresh click showId:' + showId)
            if (showId === 'productManage') {
                TRUST.refreshCashflowModelManage()
            } else if (showId === 'productDesign') {
                TRUST.refreshCashflowModelDesign()
            } else if (showId === 'IssuePreparation') {
                TRUST.refreshCashflowModelDesign()
            }
        })
        $("#viewDataCheck").click(function () {
//            GSDialog.open('数据校验', '/../CashflowColletionVerify/DataCheck.html', 2, function (result) {
            GSDialog.open('数据校验', '/js/www/productManage/TrustManagement/CashflowColletionVerify/DataCheck.html', 2, function (result) {
                if (result) {
                    window.location.reload();
                }
            }, 900, 500, 1, false, true, true, false);
        })
        var Orgheight = $(document).height();
        var Orgwidth = $(document).width();
        function showMask(Orgheight, Orgwidth) {
            $("#mask").css("height", Orgheight);
            $("#mask").css("width", Orgwidth);
            $("#mask").show();
        }
        //隐藏遮罩层  
        function hideMask() {
            $("#mask").hide();
        }
        productPermissionState = common.getQueryString('productPermissionState');
        if (productPermissionState == 2) {
            showMask(Orgheight, Orgwidth);
            $(window).resize(function () {
                var height = $(document).height();
                var width = $(document).width();
                showMask(height, width);
                //hideMask();
            })

        } else {
            hideMask();
        }
    });
});