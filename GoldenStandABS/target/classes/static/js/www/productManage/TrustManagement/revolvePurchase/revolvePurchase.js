//Load common code that includes config, then load the app logic for this page.
requirejs(['../../../../asset/lib/config'], function (config) {
    requirejs(['gs/moduleExtensions']);
    var main = requirejs(['app/productManage/TrustManagement/revolvePurchase/main']);
});

