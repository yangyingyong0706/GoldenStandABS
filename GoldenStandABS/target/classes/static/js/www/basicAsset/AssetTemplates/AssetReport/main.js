define(function (require) {
    var $ = require('jquery');
    require('jquery.cookie');
    require('jquery.localizationTool');
    var webStorage = require('gs/webStorage');

    $(function () {


        $('#selectLanguageDropdown').localizationTool({
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
                'element:title': {
                    'en_GB': 'assetReport'

                },
                'class:a1': {
                    'en_GB': 'download'

                },
                'id:assetTemplate': {
                    'en_GB': 'assetTemplate'

                },
                'id:no': {
                    'en_GB': 'no'

                },

                'id:templateName': {
                    'en_GB': 'templateName'

                },

                'id:download': {
                    'en_GB': 'download'

                },
                'id:creditCard': {
                    'en_GB': 'creditCard'

                },
                'id:publicLoan': {
                    'en_GB': 'publicLoan'

                },
                'id:consumerLoan': {
                    'en_GB': 'consumerLoan'

                },
                'id:asset-backedCommercialPaper': {
                    'en_GB': 'asset-backedCommercialPaper'

                },
                'id:carLoan': {
                    'en_GB': 'carLoan'

                },
                'id:personalHousingLoan': {
                    'en_GB': 'personalHousingLoan'

                },

                'id:accountsReceivable': {
                    'en_GB': 'accountsReceivable'

                }

            }
        });

        var userLanguage = webStorage.getItem('userLanguage');

        if (userLanguage) {
            $('#selectLanguageDropdown').localizationTool('translate', userLanguage);
        }
        $('body').show();


    })
})