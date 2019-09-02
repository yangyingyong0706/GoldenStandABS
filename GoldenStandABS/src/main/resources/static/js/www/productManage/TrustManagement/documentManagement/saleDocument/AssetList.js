



define(function (require) {


    var $ = require('jquery');
    var GlobalVariable = require('globalVariable');
    var common = require('gs/uiFrame/js/common');
    var Vue = require('Vue');
    var RoleOperate = require('roleOperate');
    require('jquery.datagrid');
    require('jquery-ui');

    var taskIndicator = require('gs/taskProcessIndicator');
    var sVariableBuilder = require('gs/sVariableBuilder');
    require('date_input');


    var myNew = new Vue({
        el: '#container',
        data: {
            trustId: common.getQueryString("trustId"),
            trustName: '',
        },
        mounted: function () {
            this.getTrustNameByTrustId();
        },
        methods: {
            getTrustNameByTrustId: function () {
                var that = this;
                var svcUrlWithConn = GlobalVariable.DataProcessServiceUrl + "CommonGetExecute?";
                var executeParam = { SPName: 'usp_GetTrustNameByTrustId', SQLParams: [] };
                executeParam.SQLParams.push({ Name: 'TrustID', value: that.trustId, DBType: 'int' });
                var executeParams = encodeURIComponent(JSON.stringify(executeParam));
                var serviceUrl = svcUrlWithConn + "connConfig=TrustManagement&appDomain=TrustManagement&executeParams=" + executeParams + '&resultType=Common';
                $.ajax({
                    url: serviceUrl,
                    type: "GET",
                    contentType: "application/json; charset=utf-8",
                    dataType: "jsonp",
                    success: function (data) {
                        var json = jQuery.parseJSON(data);
                        that.trustName = json[0].TrustName;
                    },
                    error: function (data) {
                        alert('getProductTypeCategory Error !');
                    }
                });
            },
            toAssetListDetail: function (option) {
                var that = this;
                if (option == 'promotion') {
                    window.location.href = GlobvalProtocolHost + '/TrustManagementService/TrustManagement/Documents/PromotionAnnouncement.html?trustId=' + that.trustId;
                } else if (option == 'Synopsis') {
                    window.location.href = GlobvalProtocolHost + '/TrustManagementService/TrustManagement/Documents/Synopsis.html?trustId=' + that.trustId;
                } else if (option == 'EstablishmentProclamation') {
                    window.location.href = GlobvalProtocolHost + '/TrustManagementService/TrustManagement/Documents/EstablishmentProclamation.html?trustId=' + that.trustId;
                } else if (option == 'list') {
                    window.location.href = GlobvalProtocolHost + '/TrustManagementService/TrustManagement/Documents/list.html?trustId=' + that.trustId;
                }
            },
            downloadFile: function (list) {
                var that = this;
                JsonVariableString = "[{'Name':'TrustId','Value':" + that.trustId + "}]";
                //AssemblyPath = "E:\\TSSWCFServices\\TrustManagementService\\ConsumerLoan\\DLL\\DocxCreationByJson.dll";
                DBName = "TrustManagement";
                if (list == 'promotion') {
                    TemplateFile = "E:\\TSSWCFServices\\TrustManagementService\\ConsumerLoan\\Document\\销售文档\\专项计划推广公告.docx";
                    DestinationFileName = that.trustName + '_推广文档.docx';
                    var tpi = new TaskProcessIndicatorHelper(false, false);
                    tpi.AddVariableItem('MethodName', 'GenerateDocxByJsonVariable', 'NVarChar');
                    tpi.AddVariableItem('TemplateFile', TemplateFile, 'NVarChar');
                    //tpi.AddVariableItem('AssemblyPath', AssemblyPath, 'NVarChar');
                    tpi.AddVariableItem('JsonVariableString', JsonVariableString, 'NVarChar');
                    tpi.AddVariableItem('DBName', DBName, 'NVarChar');
                    tpi.AddVariableItem('DestinationFileName', DestinationFileName, 'NVarChar')
                    tpi.ShowIndicator('ConsumerLoan', 'DocxCreationByJson', function (result) {
                        window.location.href = GlobalVariable.TrustManagementServiceHostURL + '/ConsumerLoan/Working/' + DestinationFileName;
                    });
                }
                if (list == 'Synopsis') {
                    TemplateFile = "E:\\TSSWCFServices\\TrustManagementService\\ConsumerLoan\\Document\\销售文档\\专项计划简介.docx";
                    DestinationFileName = that.trustName + '_专项计划简介.docx';
                    var tpi = new TaskProcessIndicatorHelper(false, false);
                    tpi.AddVariableItem('MethodName', 'GenerateDocxByJsonVariable', 'NVarChar');
                    tpi.AddVariableItem('TemplateFile', TemplateFile, 'NVarChar');
                    //tpi.AddVariableItem('AssemblyPath', AssemblyPath, 'NVarChar');
                    tpi.AddVariableItem('JsonVariableString', JsonVariableString, 'NVarChar');
                    tpi.AddVariableItem('DBName', DBName, 'NVarChar');
                    tpi.AddVariableItem('DestinationFileName', DestinationFileName, 'NVarChar')
                    tpi.ShowIndicator('ConsumerLoan', 'DocxCreationByJson', function (result) {
                        window.location.href = GlobalVariable.TrustManagementServiceHostURL + '/ConsumerLoan/Working/' + DestinationFileName;
                    });
                }
                if (list == 'EstablishmentProclamation') {
                    TemplateFile = "E:\\TSSWCFServices\\TrustManagementService\\ConsumerLoan\\Document\\销售文档\\专项计划成立公告.docx";
                    DestinationFileName = that.trustName + '_成立公告.docx';
                    var tpi = new TaskProcessIndicatorHelper(false, false);
                    tpi.AddVariableItem('MethodName', 'GenerateDocxByJsonVariable', 'NVarChar');
                    tpi.AddVariableItem('TemplateFile', TemplateFile, 'NVarChar');
                    //tpi.AddVariableItem('AssemblyPath', AssemblyPath, 'NVarChar');
                    tpi.AddVariableItem('JsonVariableString', JsonVariableString, 'NVarChar');
                    tpi.AddVariableItem('DBName', DBName, 'NVarChar');
                    tpi.AddVariableItem('DestinationFileName', DestinationFileName, 'NVarChar')
                    tpi.ShowIndicator('ConsumerLoan', 'DocxCreationByJson', function (result) {
                        window.location.href = GlobalVariable.TrustManagementServiceHostURL + '/ConsumerLoan/Working/' + DestinationFileName;
                    });
                }


            }
        }
    })

    var runTask_Dashboard = function (appDomain, sessionId, callback) {
        var serviceUrl = location.protocol + "//" + location.host + "/TaskProcessEngine_Dashboard/SessionManagementService.svc/jsAccessEP/RunTask?vSessionId=" + sessionId + "&applicationDomain=" + appDomain;
        $.ajax({
            type: "GET",
            url: serviceUrl,
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            success: function (response) {
                callback(response);
            },
            error: function (response) {
                callback(false);
            }
        });
    };
    ////
    var trustId = common.getQueryString('trustid');
    if (trustId != '0') {
        var UserName = RoleOperate.cookieName();
        RoleOperate.TrustOrPoolPremisson(trustId, UserName, function (data) {
            if (data == '0') {
                var loginURL = location.protocol + "//" + location.host + '/QuickFrame' + '/login-gs.html?appdomain=TrustManagement';

                alert("您没有权限访问，请联系管理员");
                window.top.location.href = loginURL;
            }
        }
			);
    }






/////////////////
})

