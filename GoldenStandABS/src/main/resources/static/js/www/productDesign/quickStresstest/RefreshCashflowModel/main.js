define(function (require) {
    var $ = require('jquery');
    require('app/productDesign/js/viewTrustWizard');
    var GlobalVariable = require('globalVariable');

    $(function () {
        TRUST.init();
        $('.btnRefresh').click(TRUST.refreshCashflowModel);
    });
});