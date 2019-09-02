var SubmitFormU;
define(function(require) {
	var $ = require('jquery');
	var Vue = require('Vue2');
	var GlobalVariable = require('globalVariable');
	var common = require('common');
	var taskIndicator = require('gs/taskProcessIndicator');
	var sVariableBuilder = require('gs/sVariableBuilder');
	var webProxy = require('gs/webProxy');
	require('date_input');
	var PoolCutCommon = require('app/basicAsset/js/PoolCutCommon_interface');
	var GSDialog = require('gsAdminPages');
	var webStore = require('gs/webStorage');
	var TrustId = common.getQueryString('tid');
	require('jquery.localizationTool');
	webStorage = require('gs/webStorage');

	$('#selectLanguageDropdown_qcl').localizationTool({
		'defaultLanguage': 'zh_CN', // this is the language that the server is sending anyway
		'ignoreUnmatchedSelectors': true,
		'showFlag': true,
		'showCountry': false,
		'showLanguage': true,
		'onLanguageSelected': function(languageCode) {
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

			'id:cashLoad': {
				'en_GB': 'Cash flow import'
			},
			'id:loadFile': {
				'en_GB': 'Upload files'
			},
			'id:chooseFile': {
				'en_GB': 'Select File'
			},
			'id:noFile': {
				'en_GB': 'No file selected yet'
			},
			'id:date_ail': {
				'en_GB': 'Date'
			},
			'id:info': {
				'en_GB': 'Tip: Use the new special plan to use this feature, otherwise the feature will override the date setting for the special plan.'
			},
			'id:upload_ail': {
				'en_GB': 'Upload'
			}

		}
	});

	var userLanguage = webStorage.getItem('userLanguage');
	if(userLanguage) {
		$('#selectLanguageDropdown_qcl').localizationTool('translate', userLanguage);
	}
	$('body').show();
	new Vue({
		el: "#main",
		data: {
			activeIndex: 1,
			iframeUrl: '../../../components/viewDateSet/viewDateSet.html?tid=' + common.getQueryString('tid')
		},
		methods: {
			//到设置日期页面
			SetData: function() {
				this.activeIndex = 1
				this.iframeUrl = '../../../components/viewDateSet/viewDateSet.html?tid=' + common.getQueryString('tid')
			},
			//到现金流导入页面
			CashFlowImport: function() {
				this.activeIndex = 2
				this.iframeUrl = 'CashflowImport.html?tid=' + common.getQueryString('tid')
			}
		}
	})
})