//Load common code that includes config, then load the app logic for this page.
requirejs(['../../../asset/lib/config'], function (config) {
    
    requirejs(['app/assetFilter/poolTargeting/main']);
});

