//Load common code that includes config, then load the app logic for this page.
requirejs(['../../../../../asset/lib/config'], function (config) {
    require(['gs/moduleExtensions']);
    var main = require(['app/productManage/TrustManagement/TrustFollowUp/OriginalOwnerList/main']);
});