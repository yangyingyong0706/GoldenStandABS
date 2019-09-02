define(function (require) {
    var $ = require('jquery');
    var Vue = require('Vue2');
    require('date_input');
    var webProxy = require('gs/webProxy');
    var gsUtil = require('gs/gsUtil');
    var GlobalVariable = require('globalVariable');
    var GSDialog = require('gs/uiFrame/js/gs-admin-2.pages');
    var common = require("common");
    require('jquery.localizationTool');
    webStorage = require('gs/webStorage');
    var userLanguage = webStorage.getItem('userLanguage');
    var Date = common.getQueryString('Date');
    var TrustId = common.getQueryString('TrustId');
    var PageName = common.getQueryString('PageName');
    if (userLanguage) {
        $('#selectLanguageDropdown_qcl').localizationTool('translate', userLanguage);
    }
    $('body').show();
    Vue.directive('date-plugin', {
        inserted: function (el) {
            var self = this;
            $(el).date_input();
        },
    })

    var myVue = new Vue({
        el: "#container",
        data: {     
            loading: true,
            ItemXml: [
                {
                    ItemName: '',
                    ItemValue: '',
                    ControlType:''
                }
            ],
            PageName: '',
            TitleName: ''
        },
        mounted: function () {
            var self = this;
            this.GetItemXml();
        },
        methods: {
            //获取数据xml
            GetItemXml: function (fn) {
                var self = this;
                var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
                var executeParam = {
                    'SPName': "RiskManagement.usp_GetPage",
                    'SQLParams': [
                        { 'Name': 'PageName', 'Value': decodeURI(PageName), 'DBType': 'string' },
                        { 'Name': 'DataKey', 'Value': TrustId + ',' + Date, 'DBType': 'string' }
                    ]
                };
                common.ExecuteGetData(true, serviceUrl, 'TrustManagement', executeParam, function (data) {
                    var xmlStr = data[0].Column1;
                    var $xmlDoc = $($.parseXML(xmlStr));
                    var $Item = $xmlDoc.find("Item");
                    var $PageName = $xmlDoc.find("Page").attr('PageName');
                    var $TitleName = $xmlDoc.find("Title").attr('TitleName');
                    self.PageName = $PageName;
                    self.TitleName = $TitleName;
                    self.ItemXml.length = 0;
                    $.each($Item, function (i, v) {
                        self.ItemXml.push({
                            ItemName: $(v).attr("ItemName"),
                            ItemValue: $(v).attr("ItemValue"),
                            ControlType: $(v).attr("ControlType"),
                            Visiable: $(v).attr("Visiable"),
                            Enable: $(v).attr("Enable")
                        })
                    })
                    if (fn) {
                        fn()
                    }
                    self.loading = false
                });
            },
            SaveProject: function () {
                var self = this;
                var saveXml = '<Page PageName="' + self.PageName + '">'
                saveXml += '<Title TitleName="' + self.TitleName + '">'
                $.each(self.ItemXml, function (i,v) {
                    saveXml += '<Item ItemName="' + v.ItemName + '" ItemValue="' + v.ItemValue + '" ControlType="' + v.ControlType + '" />'
                })
                saveXml += '</Title>'
                saveXml += '</Page>'
                var svcUrl = GlobalVariable.DataProcessServiceUrl + 'PoastData?',
					executeParam = {
					    SPName: "RiskManagement.usp_SavePage",
					    SQLParams: [
                            { 'Name': 'PageName', 'Value': self.PageName, 'DBType': 'string' },
                            { 'Name': 'DataKey', 'Value': TrustId + ',' + Date, 'DBType': 'string' },
                            { 'Name': 'Xml', 'Value': saveXml, 'DBType': 'xml' }
					    ]
					};
                var executeParams = encodeURIComponent(JSON.stringify(executeParam));
                $.ajax({
                    cache: false,
                    type: "POST",
                    async: false,
                    url: svcUrl + 'appDomain=TrustManagement&executeParams=2&resultType=commom',
                    dataType: "json",
                    processData: false,
                    data: "[{executeParams:\"" + executeParams + "\"}," +
                            "{appDomain:\"TrustManagement\"}," +
                            "{resultType:\"commom\"}]",
                    success: function (response) {
                        GSDialog.HintWindow('保存成功！', function () {
                            window.location.reload()
                        });
                    },
                    error: function (response) { GSDialog.HintWindow('Error occursed while requiring the remote source data!'); }
                });
            }
        }
    });
});



