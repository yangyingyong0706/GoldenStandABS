define(function (require) {
    var $ = require('jquery');
    require('jquery.cookie');
    require('jquery.localizationTool');
    var webStorage = require('gs/webStorage');
    var GlobalVariable = require('globalVariable');
    var common = require('common');
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
                    'en_GB': 'Pivot Table'

                },
                'class:a1': {
                    'en_GB': 'Download'

                },
                'class:aa': {
                    'en_GB': 'Check'

                },

                'id:assetTemplate': {
                    'en_GB': 'Pivot Table Template'

                },
                'id:no': {
                    'en_GB': 'NO'

                },

                'id:templateName': {
                    'en_GB': 'Template Name'

                },

                'id:download': {
                    'en_GB': 'Download'

                },
                'id:creditCard': {
                    'en_GB': 'Credit Card'

                },
                'id:publicLoan': {
                    'en_GB': 'Collaterized Loan Obligation'

                },
                'id:consumerLoan': {
                    'en_GB': 'Consumer Loan'

                },
                'id:asset-backedCommercialPaper': {
                    'en_GB': 'Asset Backed Medium-term Notes'

                },
                'id:carLoan': {
                    'en_GB': 'Automoblie Loan'

                },
                'id:personalHousingLoan': {
                    'en_GB': 'Residential Mortgage-Backed Security'

                },

                'id:accountsReceivable': {
                    'en_GB': 'Receivable'

                },
                'id:accountsMarginTrading': {
                    'en_GB': 'Margin financing'

                },
                'id:viewReport': {
                    'en_GB': 'Check'

                }
            }
        });

        var userLanguage = webStorage.getItem('userLanguage');

        if (userLanguage) {
            $('#selectLanguageDropdown').localizationTool('translate', userLanguage);
        }
        $('body').show();

        common.downLoadExcelForSyn('/PoolCut/Files/Reports/DailyReport/资产池日统计报表_信用卡.xlsm', '下载', '资产池日统计报表_信用卡.xlsm', 'downLoadCC');
        common.downLoadExcelForSyn('/PoolCut/Files/Reports/DailyReport/资产池日统计报表_对公贷.xlsm', '下载', '资产池日统计报表_对公贷.xlsm', 'downLoadPL');
        common.downLoadExcelForSyn('/PoolCut/Files/Reports/DailyReport/资产池日统计报表_消费贷.xlsm', '下载', '资产池日统计报表_消费贷.xlsm', 'downLoadCL');
        common.downLoadExcelForSyn('/PoolCut/Files/Reports/DailyReport/资产池日统计报表_资产支持票据.xlsm', '下载', '资产池日统计报表_资产支持票据.xlsm', 'downLoadABCP');
        common.downLoadExcelForSyn('/PoolCut/Files/Reports/DailyReport/资产池日统计报表_车贷.xlsm', '下载', '资产池日统计报表_车贷.xlsm', 'downLoadCar');
        common.downLoadExcelForSyn('/PoolCut/Files/Reports/DailyReport/资产池日统计报表_房贷.xlsm', '下载', '资产池日统计报表_房贷.xlsm', 'downLoadPHL');
        common.downLoadExcelForSyn('/PoolCut/Files/Reports/DailyReport/资产池日统计报表_应收账款.xlsm', '下载', '资产池日统计报表_应收账款.xlsm', 'downLoadAR');
        common.downLoadExcelForSyn('/PoolCut/Files/Reports/DailyReport/资产池日统计报表_应收账款.xlsm', '下载', '资产池日统计报表_应收账款.xlsm', 'downLoadAMT');

    })
    
})