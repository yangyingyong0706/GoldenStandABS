//Load common code that includes config, then load the app logic for this page.
requirejs(['../../../../asset/lib/config.js'], function (config) {
    requirejs(['app/productManage/TrustManagement/RefreshCashflowModel/main']);
});