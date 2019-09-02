//Load common code that includes config, then load the app logic for this page.
requirejs(['../../../../asset/lib/config'], function (config) {
    requirejs(['gs/moduleExtensions']);
    requirejs(['app/transactionManage/TM_Common/trustList/js/main']);
});


