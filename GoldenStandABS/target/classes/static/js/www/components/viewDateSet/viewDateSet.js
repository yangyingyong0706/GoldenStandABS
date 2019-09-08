//Load common code that includes config, then load the app logic for this page.
requirejs(['/asset/lib/config.js'], function (config) {
    requirejs(['gs/moduleExtensions']);
    requirejs(['app/components/viewDateSet/js/main']);
});