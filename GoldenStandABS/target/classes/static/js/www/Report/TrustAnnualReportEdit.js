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
    var DimReportingDateId = common.getQueryString('DimReportingDateId');
    var ReportTypeId = common.getQueryString('ReportTypeId');
    var DataSourceId ;
    var PageName = common.getQueryString('PageName');
    var $ = require('jquery');
    var gv = require('globalVariable');
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
    var myCom = Vue.extend({
        template: '<div><span v-for="item in checkboxDataDic">'+
            '<input v-bind:name="item.ItemCode" v-if="item.IsCheckBox" type="checkbox" v-bind:value="item.value" v-model="item.checked" @change="send()"/>' +
            '<input v-bind:name="item.ItemCode" v-if="!item.IsCheckBox" type="radio" v-bind:value="item.value" v-bind:checked="item.checked" @change="send(item.value)"/>' +
            '{{item.value}}</span></div>',
        props: {
            checkboxData: {
                type: Object
            }
        },
        computed: {
            checkboxDataDic: function () {
                var self = this;
                var tempArry = this.checkboxData.ItemValue.split('&')
                var result = [];
                for (var i = 0 ;i<tempArry.length;i++) {
                    var itemArr = tempArry[i].split('=');

                    var item = { ItemCode: '', IsCheckBox: true, checked: false, value: '' };
                    item.value = itemArr[1].substr(1)
                    if(itemArr[1].indexOf('☑')>=0){
                        item.checked = true;
                    }
                    item.ItemCode = this.checkboxData.ItemCode
                    item.IsCheckBox = (this.checkboxData.ControlType=="CheckBox")
                    console.log(item);
                    result.push(item);
                }
                return result;
            }
        },
        methods: {
            send:function(value){
                var msg = '';
                for (var i = 0 ; i < this.checkboxDataDic.length; i++) {
                    if (this.checkboxDataDic[i].IsCheckBox) {
                        if (this.checkboxDataDic[i].checked) {
                            msg += "□" + this.checkboxDataDic[i].value + "=☑" + this.checkboxDataDic[i].value;
                        } else {
                            msg += "□" + this.checkboxDataDic[i].value + "=□" + this.checkboxDataDic[i].value;
                        }
                    } else {
                        if (this.checkboxDataDic[i].value == value) {
                            msg += "□" + this.checkboxDataDic[i].value + "=☑" + this.checkboxDataDic[i].value;
                        } else {
                            msg += "□" + this.checkboxDataDic[i].value + "=□" + this.checkboxDataDic[i].value;
                        }
                    }
                    
                    if(i<this.checkboxDataDic.length-1)
                        msg +="&";
                }
                this.checkboxData.ItemValue = msg;
                this.$emit('child-msg', this.checkboxData);
            }

        }
    })
    var myVue = new Vue({
        el: "#container",
        components: {
            'field-checkbox': myCom
        },
        data: {     
            loading: true,
            GroupNames:[],
            ItemXml: [
                {
                    ItemName: '',
                    ItemValue: '',
                    ControlType: ''
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
            getChildMsg: function (item) {
                for (var i = this.ItemXml.length - 1; i >= 0; i--) {
                    if (this.ItemXml[i].ItemCode == item.ItemCode) {
                        this.ItemXml[i].ItemValue = item.ItemValue
                    }
                }
            },
            //获取数据xml
            GetItemXml: function (fn) {
                var self = this;
                var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
                var executeParam = {
                    'SPName': "TrustManagement.usp_GetTrustReportFieldValue",
                    'SQLParams': [
                        { 'Name': 'TrustId', 'Value': TrustId, 'DBType': 'int' },
                        { 'Name': 'DimReportingDateId', 'Value': DimReportingDateId, 'DBType': 'int' },
                        { 'Name': 'ReportTypeId', 'Value': ReportTypeId, 'DBType': 'int' }
                    ]
                };
                common.ExecuteGetData(true, serviceUrl, 'TrustManagement', executeParam, function (data) {
                    self.GroupNames = []
                    for (var i = 1; i < data.length ; i++) {
                        if (!self.GroupNames.includes(data[i].GroupName)) {
                            self.GroupNames.push(data[i].GroupName)
                        }
                    }
                    self.PageName = decodeURI(PageName);
                    self.ItemXml = data;
                   
                    if (fn) {
                        fn()
                    }
                    self.loading = false
                });
            },
            QueryAsset: function (Value, Id, TableCode, ControlData, DataSourceId) {
               
                var item = Value;
                var self = this;
                var tableCode = TableCode;
                if (ControlData == null || TableCode==null) {
                    GSDialog.HintWindow("TableCode或ControlData为空,请联系管理员配置！");
                    return false
                }
                var page = gv.TrustManagementServiceHostURL + "report/TrustReportFieldValueEdit.html?PageName=" + PageName + "&TrustId=" + TrustId + '&DimReportingDateId=' + DimReportingDateId + '&ReportTypeId=' + ReportTypeId + '&DataSourceId=' + DataSourceId + '&TrustReportField=' + Id + '&TableCode=' + tableCode;
                    GSDialog.open(item, page, null, function (result) {
                        if (result) {
                            window.location.reload();
                        }
                    }, 1000, 580);
                
            },
            SaveProject: function () {
                var self = this;
                var saveXml = '<Items>'
                $.each(self.ItemXml, function (i, v) {
                    if (v.ItemValue != null)
                        saveXml += '<Item ReportTypeId="' + v.ReportTypeId +
                            '" DataSourceId="' + v.DataSourceId +
                            '" TableCode="' + (v.TableCode == null ? '' : v.TableCode) +
                            '" TableRowKey="' + (v.TableRowKey == null ? '' : v.TableRowKey) +
                            '" ControlType="' + (v.ControlType == null ? '' : v.ControlType) +
                            '" ItemSequenceNo="' + (v.ItemSequenceNo == null ? '' : v.ItemSequenceNo) +
                            '" ItemCode="' + v.ItemCode +
                            '" TrustId="' + v.TrustId +
                            '" DimReportingDateId="' + v.DimReportingDateId +
                            '">' + ((v.ControlType == "CheckBox" || v.ControlType == "Radio") ? v.ItemValue.replace(/&/g, ";") : v.ItemValue) + '</Item>'
                })
                saveXml += '</Items>'
                var svcUrl = GlobalVariable.DataProcessServiceUrl + 'PoastData?',
					executeParam = {
					    SPName: "TrustManagement.usp_SaveTrustReportFieldValue",
					    SQLParams: [
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



