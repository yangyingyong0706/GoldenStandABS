//Load common code that includes config, then load the app logic for this page.
requirejs(['../../../../asset/lib/config'], function (config) {
    requirejs(['gs/moduleExtensions']);
    //requirejs(['jquery']);
    var main = requirejs(['app/productDesign/stresstest/StressScenarios/main']);
});