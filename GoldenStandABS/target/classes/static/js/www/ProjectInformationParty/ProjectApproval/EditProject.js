define(function (require) {
    var $ = require('jquery');
    var Vue = require('Vue2');

    var webProxy = require('gs/webProxy');
    var gsUtil = require('gs/gsUtil');
    var GlobalVariable = require('globalVariable');
    var GSDialog = require('gs/uiFrame/js/gs-admin-2.pages');
    var common = require("common");
    require('jquery.localizationTool');
    webStorage = require('gs/webStorage');
    var userLanguage = webStorage.getItem('userLanguage');
    var ProjectId = common.getQueryString('ProjectId');
    if (userLanguage) {
        $('#selectLanguageDropdown_qcl').localizationTool('translate', userLanguage);
    }
    $('body').show();

    var myVue = new Vue({
        el: "#container",
        data: {
            loading: false,
            ProjectMsg: {
                ProjectName: '',
                ProjectShortName: '',
                ProjectStatus: '',
                ChargeUserName: '',
                DurationChargeUserName: '',
                ProjectModel: '',
                ProjectAlert: ''
            },
            ProjectStatus: [],
            ProjectAlert: [
                    { AlertDesc: '正常' },
                    { AlertDesc: '一般' },
                    { AlertDesc: '高危' }
            ]
        },
        mounted: function () {
            this.GetProjectStatus()
            this.GetProjectMsg()
        },
        methods: {
            //获取项目状态数据
            GetProjectStatus: function () {
                var self = this;
                var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecuteForPool?',
					executeParam = {
					    SPName: "TrustManagement.usp_GetProjectStatus",
					};
                common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
                    if (data) {
                        self.ProjectStatus = data
                    }
                });
            },
            //获取项目信息
            GetProjectMsg: function () {
                var self = this;
                var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecuteForPool?',
					executeParam = {
					    SPName: "TrustManagement.usp_GetProjectById",
					    SQLParams: [
                            { 'Name': 'projectId', 'Value': ProjectId, 'DBType': 'string' }
					    ] 
					};
                common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
                    if (data) {
                        self.ProjectMsg = data[0]    
                    }
                });
            },
            SaveProject: function () {
                var self = this;
                var projectXml = '<Projects><Project>'
                projectXml += '<ProjectName>' + self.ProjectMsg.ProjectName + '</ProjectName>'
                projectXml += '<ProjcetShortName>' + self.ProjectMsg.ProjectShortName + '</ProjcetShortName>'
                projectXml += '<ProjectStatus>' + self.ProjectMsg.ProjectStatus + '</ProjectStatus>'
                projectXml += '<ProjectModel>' + self.ProjectMsg.ProjectModel + '</ProjectModel>'
                projectXml += '<ChargeUserName>' + self.ProjectMsg.ChargeUserName + '</ChargeUserName>'
                projectXml += '<DurationChargeUserName>' + self.ProjectMsg.DurationChargeUserName + '</DurationChargeUserName>'
                projectXml += '<ProjectAlert>' + self.ProjectMsg.ProjectAlert + '</ProjectAlert>'
                projectXml += '</Project></Projects>'
                var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecuteForPool?',
					executeParam = {
					    SPName: "TrustManagement.usp_UpdateProject",
					    SQLParams: [
                            { 'Name': 'projectXml', 'Value': projectXml, 'DBType': 'xml' }
					    ]
					};
                common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
                    if (data) {
                        GSDialog.HintWindow('更新成功！')
                    }
                });
            }
        }
    });
});



