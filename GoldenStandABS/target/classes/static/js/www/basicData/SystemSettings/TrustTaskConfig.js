define(function (require) {
    var $ = require('jquery');
    //require('jquery-ui');
    //var ko = require('knockout');
    //ko.mapping = require('knockout.mapping');
   // require('knockout.rendercontrol');
    //var common = require('common');
    //var GlobalVariable = require('globalVariable');
    require('app/basicData/SystemSettings/viewFllowUpPageData');

    $(function () {
        TrustFllowUp.init();
    });
});