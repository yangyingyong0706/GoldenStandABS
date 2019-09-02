
var GSDialog;

define(function (require) {
    var $ = require('jquery');
    require('bootstrap');
    var Vue = require("Vue2");
    GSDialog = require('gsAdminPages');

    var webStorage;

    require('jquery.localizationTool');
    webStorage = require('gs/webStorage');
   

    $(function () {
        console.log()
        //$("#vquicktrust").load("../QuickTrust/QuickTrustCreation.html");
        //$("#vdatacheck").load("../AssetDataCheck/DataCheck.html");
        //$("#vassertimport").load("../AssetDataImport/UploadImportData.html");
        //$("#wizard").bwizard();
        var Vm = new Vue({
            el: "#app",
            data: {
                url: "../QuickTrust/QuickTrustCreation.html"
            },
            methods: {
                changeUrl: function ($event) {
                    var self = this;
                    var id = $event.currentTarget.id;
                    $($event.currentTarget).removeClass("active").addClass("active").siblings().removeClass("active");
                    if (id == "quickCreateTrust_anl") {
                        self.url = "../QuickTrust/QuickTrustCreation.html"
                    } else if (id == "dataChecksum_anl") {
                        self.url = "../AssetDataCheck/DataCheck.html"
                    } else if (id == "importAsset_anl") {
                        self.url = "../AssetDataImport/UploadImportData.html"
                    }
                }
            }
        })


        $('#selectLanguageDropdown_anl').localizationTool({
            'defaultLanguage': 'zh_CN', // this is the language that the server is sending anyway
            'ignoreUnmatchedSelectors': true,
            'showFlag': true,
            'showCountry': false,
            'showLanguage': true,
            'onLanguageSelected': function (languageCode) {
                /*
                 * When the user translates we set the cookie
                 */
                webStorage.setItem('userLanguage', languageCode);
                return true;
            },

            /* 
             * Translate the strings that appear in all the pages below
             */
            'strings': {


               
                'element:li.next>a': {
                    'en_GB': 'Next &rarr;'
                },
                'element:li.previous>a': {
                    'en_GB': '&larr; Back'
                },
                'id:quickCreateTrust_anl>a': {
                    'en_GB': 'Quickly Create Product'
                },
                'id:dataChecksum_anl>a': {
                    'en_GB': 'Asset-Data Check'
                },
                'id:importAsset_anl>a': {
                    'en_GB': 'Asset-Data Import'
                }


            }
        });

        var userLanguage = webStorage.getItem('userLanguage');
        if (userLanguage) {
            $('#selectLanguageDropdown_anl').localizationTool('translate', userLanguage);
        }  
        $('body').show();

    })

})

function Cancel() {
    GSDialog.close(0);
}

