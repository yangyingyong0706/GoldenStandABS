var PoolCutPurpose = 'pool cut';
//var TargetSqlConnection;
var PoolId;
var PoolHeader;
var TaskCodes = { 4: 'ConsumerLoanPoolBaseReRun', 5: 'PoolTargetParentTarget', 6: 'PoolTargetChildTarget' };//task codes for pool rerun
let titleText;
define(function (require) {

    var $ = require('jquery');
    //require('jquery-ui');
    var GlobalVariable = require('gs/globalVariable');
    var common = require('gs/uiFrame/js/common');
    require('app/components/assetPoolList/js/PoolCut_Interface');
    var Vue = require('Vue');
    //var Vue = require('Vue2');
    var ECPreviewControl = require('app/assetFilter/js/ecPreviewControl');
    //var forNumber = require('gs/format.number'); 
    //var gsAdmin = require('gs/uiFrame/js/gs-admin-2.pages');
    var webStorage = require('gs/webStorage');
    var louti = require('app/assetFilter/js/stairsNavgation')
     louti.bindStairsNavgation()
 
     webProxy = require('gs/webProxy');
     require('jquery.localizationTool');
     require("app/projectStage/js/project_interface");
     $('#selectLanguageDropdown_qcl').localizationTool({
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

             'id:name': {
                 'en_GB': 'Asset Pool Name: '
             },
             'id:mark': {
                 'en_GB': 'Asset Pool Identification: '
             },
             'id:logic': {
                 'en_GB': 'Business Logic: '
             },
             'id:save': {
                 'en_GB': 'Save'
             },
             'id:run': {
                 'en_GB': 'Run asset pool'
             },
             'id:list': {
                 'en_GB': 'Form view'
             },
             'id:sql': {
                 'en_GB': 'Query statement'
             },
             'id:saveas': {
                 'en_GB': 'Checkout statement'
             },
             'id:check': {
                 'en_GB': 'Save'
             }

         }
     });

     var userLanguage = webStorage.getItem('userLanguage');
     if (userLanguage) {
         $('#selectLanguageDropdown_qcl').localizationTool('translate', userLanguage);
     }
     $('body').show();

    $(function () {
        PoolId = common.getQueryString('PoolId');
        if (!PoolId || isNaN(PoolId)) {
            alert('PoolId is required!');
            return;
        }
        BindingPoolInfo(PoolId);
        new Vue(ECPreviewControl);

        $("#TransPoolName").click(function () {
            window.location.href = '../../../www/assetFilter/basePoolContentKendo/basePoolContent.html?PoolId={0}&PoolName={1}'.format(sessionStorage.PoolId, sessionStorage.PoolName);
            var pollId = '{0}'.format(PoolId + '_process');
            var currentTab ='';
            $.each(window.parent.viewModel.tabs(), function (i, obj) {
                if (obj.id == pollId) {
                    return currentTab = obj;
                }
                
            });
            window.parent.viewModel.closeShowId(currentTab);
        });
        function BindingPoolInfo(poolId) {
            var executeParam = { SPName: 'config.usp_GetPoolHeaderById', SQLParams: [] };
            executeParam.SQLParams.push({ Name: 'PoolId', Value: poolId, DBType: 'int' });
            var executeParams = encodeURIComponent(JSON.stringify(executeParam));
            var serviceUrl = GlobalVariable.PoolCutServiceURL + 'CommonGet?connName=DAL_SEC_PoolConfig&exeParams=' + executeParams;

            CallWCFSvc(serviceUrl, false, 'GET', function (data) {
            	var poolHeader = data[0];
                $('.poolDetail').each(function (i, v) {
                    var $this = $(this);
                    var proName = $this.attr('data-name');
                    if (proName && poolHeader[proName])
                        $this.text(poolHeader[proName]);
                });

                TargetSqlConnection = poolHeader.TargetSqlConnection;

                PoolHeader = poolHeader;

                var PoolTypeId = poolHeader.PoolTypeId;
                var webStorage = require('gs/webStorage');
                var userLanguage = webStorage.getItem('userLanguage');
                var html;
                if (userLanguage && userLanguage.indexOf('en') > -1) {
                    html = { '4': 'Asset screening', '5': 'Objectify', '6': 'Quota adjustment' };
                } else {
                    html = { '4': '资产筛选', '5': '目标化', '6': '额度调整' };
                }
                $('#spanPageTitle').html(html[PoolTypeId]);
                titleText = html[PoolTypeId];
            });
        }

        //增加toggle箭头

        $(document).on('click', " .desc-wraper", function (e) {
            e.stopPropagation();
            console.log(e.target);
            if ($(e.target).is(".desc-wraper>.virtual-label>.virtual-checkbox") || $(e.target).is(".desc-wraper>.virtual-label>.virtual-checkbox>.virtual-icon") || $(e.target).is(".desc-wraper>.virtual-label>.org-checkbox")) {
                return;
            };  
            $(this).find("i.fa").toggleClass("fa-angle-down fa-angle-up");
            $(this).parent(".btns-wraper").next().slideToggle(300);
            $(this).next().slideToggle(300);
            
        })
    });
})
