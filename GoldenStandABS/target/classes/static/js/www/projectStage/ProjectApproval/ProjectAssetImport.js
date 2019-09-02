define(function (require) {
    var $ = require("jquery");
    var Vue = require("Vue");
    var common = require('common');
    var appGlobal = require('App.Global');
    //var GlobalVariable = appGlobal.GlobalVariable;
    //var webStorage = require('gs/webStorage');
    //var GSDialog = require('gs/uiFrame/js/gs-admin-2.pages');
    //var ProjectId = common.getQueryString('ProjectId');
    //var kendoGridModel = require('gs/Kendo/kendoGridModel');
    var GlobalVariable = require('gs/globalVariable');
    require("app/projectStage/js/project_interface");

    var ProjectAssetImport = new Vue({
        el: "#ProjectAssetImport",
        data: {
            dataCheckPath: GlobalVariable.TrustManagementServiceHostURL + "basicAsset/AssetDataCheck/DataCheck.html",
            uploadAssetImportPath: GlobalVariable.TrustManagementServiceHostURL + "basicAsset/AssetDataImport/UploadImportData.html",
            isDataCheckActive: true
        },
        methods: {
            changeFrameShow: function (id) {
                switch (id) {
                    case 'DataCheck':
                        this.isDataCheckActive = true;
                        break;
                    case 'UploadAssetImport':
                        this.isDataCheckActive = false;
                        break;
                }
            }
        }
    });
})

