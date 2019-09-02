define(function (require) {
    var common = require('common');
    var appGlobal = require('App.Global');
    var GlobalVariable = require('globalVariable');
    var webProxy = require("webProxy");
    var Vue = require("Vue2");
    require("bootstrap");
    var enter = common.getUrlParam('enter');
    var PoolDBName = common.getUrlParam('PoolDBName');
    var app = new Vue({
        el: '#app',
        data: {
            uploadDataSrc: '',
            templateDownloadSrc: '',
            dataCheckSrc: '',
            isLoadTemplateDownload: false,
            isLoadDataCheck: false
        },
        mounted: function () {
            var trustId = common.getQueryString('trustId');
            var uploadType = common.getQueryString('uploadType');
            if (!trustId || isNaN(trustId)) {
                return;
            }
            if (uploadType == 'RepaymentPlan') {
                if (enter) {
                    this.uploadDataSrc = 'ImportRepaymentPlan.html?trustId=' + trustId + '&enter=assets' + '&PoolDBName=' + PoolDBName;
                } else {
                    this.uploadDataSrc = 'ImportRepaymentPlan.html?trustId=' + trustId;
                }
                this.templateDownloadSrc= '../../../../basicAsset/AssetTemplates/AssetTemplates.html?uploadType=RepaymentPlan';
            } else if (uploadType == 'PaymentData') {
                if (enter) {
                    this.uploadDataSrc = 'ImportPaymentData.html?trustId=' + trustId + '&enter=assets' + '&PoolDBName=' + PoolDBName;
                } else {
                    this.uploadDataSrc = 'ImportPaymentData.html?trustId=' + trustId;
                }
                this.templateDownloadSrc = '../../../../basicAsset/AssetTemplates/AssetTemplates.html?uploadType=PaymentData';
            } else if (uploadType == 'CashFlowOAAssetPool') {
                this.uploadDataSrc = 'ImportCashFlowOAAssetPool.html?trustId=' + trustId;
                this.templateDownloadSrc = '../../../../basicAsset/AssetTemplates/AssetTemplates.html?uploadType=CashFlowOAAssetPool';
            } 
        }
    })

})

//requirejs(['../../asset/lib/config'], function (config) {
//    require(['Vue', 'globalVariable', 'jquery', 'kendo.all.min', 'kendomessagescn',
//        'common', 'kendoHelper', 'callApi', 'runTask', 'layer',
//        'loading', 'app/fixedIncomeSuite/js/core', 'bootstrap']
//           , function (Vue, gv, $, kendo, kendozhCN, common, kendoH, CallApi, TaskProcessIndicatorHelper, layer, loading) {
//               new Vue({
//                   el: '#app',
//                   data: {
//                       uploadDataSrc: '',
//                       templateDownloadSrc: '',
//                       dataCheckSrc: '',
//                       isLoadTemplateDownload: false,
//                       isLoadDataCheck: false
//                   },
//                   ready: function () {
//                       var trustId = common.getQueryString('trustId');
//                       var uploadType = common.getQueryString('uploadType');
//                       if (!trustId || isNaN(trustId)) {
//                           return;
//                       }
//                       if (uploadType == 'asset') {
//                           this.uploadDataSrc = '../components/uploadAssetFile.html?trustId=' + trustId;
//                           this.templateDownloadSrc = '../components/AssetImportTemplate.html';
//                           this.dataCheckSrc = '../dataCheck/DataCheck.html?uploadType=Asset';
//                       } else if (uploadType == 'cashflow') {
//                           this.uploadDataSrc = '../components/UploadCashflow.html?trustId=' + trustId;
//                           this.templateDownloadSrc = '../components/CashflowImportTemplate.html';
//                           this.dataCheckSrc = '../dataCheck/DataCheck.html?uploadType=Cashflow';
//                       } else if (uploadType == 'paymentSchedule') {
//                           this.uploadDataSrc = '../components/UploadPaymentSchedule.html?trustId=' + trustId;
//                           this.templateDownloadSrc = '../components/PaymentScheduleTemplate.html';
//                           this.dataCheckSrc = '../dataCheck/DataCheck.html?uploadType=PaymentSchedule';
//                       } else if (uploadType == 'paymentRecords') {
//                           this.uploadDataSrc = '../components/UploadPaymentRecords.html?trustId=' + trustId;
//                           this.templateDownloadSrc = '../components/PaymentScheduleTemplate.html';
//                           this.dataCheckSrc = '../dataCheck/DataCheck.html?uploadType=PaymentRecords';
//                       }
//                   }
//               })

//           })
//});


