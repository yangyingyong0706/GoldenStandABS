


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

    require('calendar');
    require('jquery.cookie');
    require('date_input');



    ////////


    var serbiceList = location.protocol + "//" + location.host + '/QuickWizardService/WizardService.svc/';
    $(document).ready(function () {
        $('.date-plugins').date_input()
    })

    var Risk = new Vue({
        el: '#Risk',
        data: {
            FirstContact: "",
            OfficialRepresentative: "",
            OfficeAddress: "",
            Phone: "",
            Fax: "",
            Email: "",
            HomeAddress: "",
            TrustName1: "",
            PlanManagerAdvertiser: "",
            RaiseFundAccountName: "",
            RaiseFundAccountNo: "",
            RaiseFundAccountOpenBank: "",
            RaiseFundLargePaymentNo: "",
            RaiseFundLocation: "",
            Layered: [],
            Investor: [],
            InvestmentPool: [],
            trustName: '',
            trustId: common.getQueryString("trustId"),
            newInvestor: {},
            investorinfoid: 0,
            EssentialInformation: [],
            riskAssessment: [],
            contract: [],
            EnclosureMechanism: [],
            EnclosureProduct: [],
            InvestorType: 'Ordinary',
            InvestorConfirmation: [],
            ConfirmationOfResults: [],
            AbilityQuestionnaire: [],
            TestQuestions: [],
            Application: [],
            ControllerTax: [],
            InstitutionalTaxation: [],
            SubscriptionProtocolDownload: [],
            InvestorTypeInfo: [],
            AgreementFileUploadResult: "",
            InvestorFileUploadResult: "",
            AlreadySelectedInvestorType: 1,
            UploadDocumentsPath: "",
            HighRiskSpecialWarning: "",
            ProductOrServiceRiskAssessment: "",
            RiskInfo: "",
            HistoricalRecordsList: ''
        },
        mounted: function () {
            this.getLayeredContent();
            this.getTrustNameByTrustId();
            this.GetInvestorTypeInfo();
            this.getPreservation();
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
            closeHistoricalRecordsDivDIsplay: function () {
                $(".PopupBackground").css('display', 'none');
                $(".HistoricalRecordsDivDIsplay").css('display', 'none');
            },
            HistoricalRecords: function () {
                $(".PopupBackground").css('display', 'block');
                $(".HistoricalRecordsDivDIsplay").css('display', 'block');
                var that = this;
                that.HistoricalRecordsList = [];
                var svcUrlWithConn = GlobalVariable.DataProcessServiceUrl + "CommonGetExecute?";
                var executeParam = { SPName: 'usp_GetSalesDocumentsVerifyHistory', SQLParams: [] };
                executeParam.SQLParams.push({ Name: 'TrustId', value: that.trustId, DBType: 'int' });
                executeParam.SQLParams.push({ Name: 'DoucumentType', value: 'SubscriptionAgreement', DBType: 'string' });
                var executeParams = encodeURIComponent(JSON.stringify(executeParam));
                var serviceUrl = svcUrlWithConn + "connConfig=TrustManagement&appDomain=TrustManagement&executeParams=" + executeParams;
                $.ajax({
                    url: serviceUrl,
                    type: "GET",
                    contentType: "application/json; charset=utf-8",
                    dataType: "jsonp",
                    success: function (data) {
                        var json = jQuery.parseJSON(data);
                        that.HistoricalRecordsList = json;
                    },
                    error: function (data) {
                        alert('getProductTypeCategory Error !');
                    }
                });

            },
            getPreservation: function () {
                var that = this;
                var svcUrlWithConn = GlobalVariable.DataProcessServiceUrl + "CommonGetExecute?";
                var executeParam = { SPName: 'usp_GetSalesDocumentsLastSubmitVerifyInfo', SQLParams: [] };
                executeParam.SQLParams.push({ Name: 'TrustId', value: that.trustId, DBType: 'int' });
                executeParam.SQLParams.push({ Name: 'DoucumentType', value: 'SubscriptionAgreement', DBType: 'string' });
                var executeParams = encodeURIComponent(JSON.stringify(executeParam));
                var serviceUrl = svcUrlWithConn + "connConfig=TrustManagement&appDomain=TrustManagement&executeParams=" + executeParams;
                $.ajax({
                    url: serviceUrl,
                    type: "GET",
                    contentType: "application/json; charset=utf-8",
                    dataType: "jsonp",
                    success: function (data) {
                        var json = jQuery.parseJSON(data);
                        if (json.length > 0) {
                            for (var i = 0; i < json.length; i++) {
                                if (json[i].OperationType == 'submit') {
                                    if (json[i].SubmitUser == RoleOperate.cookieName()) {
                                        $('#Preservation').attr('disabled', 'disabled');
                                        $('#Preservation').css('background-color', '#ccc');
                                        $('#Preservation').css('border-color', '#ccc');
                                    }
                                }
                                else if (json[i].OperationType.toLocaleLowerCase() == 'verify') {
                                    $('#VerifyText').html('已审核')
                                }
                            }
                        }
                    },
                    error: function (data) {
                        alert('getProductTypeCategory Error !');
                    }
                });
            },
            SubmitPreservation: function (type) {
                var that = this;
                var svcUrlWithConn = GlobalVariable.DataProcessServiceUrl + "CommonGetExecute?";
                var executeParam = { SPName: 'usp_SaveSalesDocumentsVerifyHistory', SQLParams: [] };
                executeParam.SQLParams.push({ Name: 'TrustId', value: that.trustId, DBType: 'int' });
                executeParam.SQLParams.push({ Name: 'DoucumentType', value: 'SubscriptionAgreement', DBType: 'string' });
                executeParam.SQLParams.push({ Name: 'OperationType', value: type, DBType: 'string' });
                executeParam.SQLParams.push({ Name: 'UserName', value: RoleOperate.cookieName(), DBType: 'string' });
                var executeParams = encodeURIComponent(JSON.stringify(executeParam));
                var serviceUrl = svcUrlWithConn + "connConfig=TrustManagement&appDomain=TrustManagement&executeParams=" + executeParams;
                $.ajax({
                    url: serviceUrl,
                    type: "GET",
                    contentType: "application/json; charset=utf-8",
                    dataType: "jsonp",
                    success: function (data) {
                        var json = jQuery.parseJSON(data);
                        if (json[0].Column1 == 1) {
                            return;
                        }
                        if (type == 'submit') {
                            alert('提交成功');
                            $('#Preservation').attr('disabled', 'disabled');
                            $('#Preservation').css('background-color', '#ccc');
                            $('#Preservation').css('border-color', '#ccc');
                        } else {
                            alert('审核成功');
                            $('#VerifyText').html('已审核')
                        }
                    },
                    error: function (data) {
                        alert('getProductTypeCategory Error !');
                    }
                });
            },
            getLayeredContent: function () {
                var self = this;
                self.SubscriptionProtocolDownload = [];
                var trustId = common.getQueryString("trustId")
                var svcUrlWithConn = GlobalVariable.DataProcessServiceUrl + "CommonGetExecute?";
                var executeParam = { SPName: 'usp_GetSalesSubscriptionAgreementDocumentInfo', SQLParams: [] };
                executeParam.SQLParams.push({ Name: 'TrustID', value: trustId, DBType: 'int' });
                var executeParams = encodeURIComponent(JSON.stringify(executeParam));
                var serviceUrl = svcUrlWithConn + "connConfig=TrustManagement&appDomain=TrustManagement&executeParams=" + executeParams + '&resultType=Common';
                $.ajax({
                    url: serviceUrl,
                    type: "GET",
                    contentType: "application/json; charset=utf-8",
                    dataType: "jsonp",
                    success: function (data) {
                        var data = JSON.parse(data);
                        if (data[0][1]) {
                            self.UploadDocumentsPath = data[0][1].value;
                        } else {
                            self.UploadDocumentsPath = "";
                        }
                        for (var i = 0; i < data[0].length; i++) {
                            if (data[0][i].name == "TrustName") {
                                self.TrustName1 = data[0][i].value;
                            }
                            if (data[0][i].name == "RiskInfo") {
                                self.RiskInfo = data[0][i].value;
                            }
                            if (data[0][i].name == "ProductOrServiceRiskAssessment") {
                                self.ProductOrServiceRiskAssessment = data[0][i].value;
                            }
                            if (data[0][i].name == "HighRiskSpecialWarning") {
                                self.HighRiskSpecialWarning = data[0][i].value;
                            }
                        }
                        self.Layered = data[3];
                        self.Investor = data[1];
                        self.InvestmentPool = data[2];
                        var SubscriptionProtocolDownloadName = [];
                        for (var i = 0; i < data[1].length; i++) {
                            if ($.inArray(data[1][i].InvestorName, SubscriptionProtocolDownloadName) == -1) {
                                self.SubscriptionProtocolDownload.push(data[1][i]);
                                SubscriptionProtocolDownloadName.push(data[1][i].InvestorName);
                            }
                        }
                    },
                    error: function (data) {
                        alert('getProductTypeCategory Error !');
                    }
                });
            },
            downloadFile: function (InvestorId, InvestorType, InvestorName) {
                var that = this;
                $TaskCode = "JoinWordDocumentAndGenerateDocByJson";
                $TaskType = "Task";
                $AppDomain = "ConsumerLoan";
                if (InvestorType == 1) $TemplateFileFirst = "E:\\TSSWCFServices\\TrustManagementService\\ConsumerLoan\\Document\\销售文档\\专项计划认购协议(金融机构专业投资者版本).docx";
                if (InvestorType == 2) $TemplateFileFirst = "E:\\TSSWCFServices\\TrustManagementService\\ConsumerLoan\\Document\\销售文档\\专项计划认购协议(非金融机构的专业投资者版本).docx";
                if (InvestorType == 3) $TemplateFileFirst = "E:\\TSSWCFServices\\TrustManagementService\\ConsumerLoan\\Document\\销售文档\\专项计划认购协议(普通投资者版本).docx";


                $DestinationFileNameFirst = InvestorName + '_认购协议Temp.docx'
                $TrustId = that.trustId

                //$AssemblyPathFinnally = "E:\\TSSWCFServices\\TrustManagementService\\ConsumerLoan\\DLL\\DocxCreationByJson.dll"
                $TemplateFileFinnally = "E:\\TSSWCFServices\\TrustManagementService\\ConsumerLoan\\Working\\" + $DestinationFileNameFirst
                $RootPath = "E:\\TSSWCFServices\\PoolCut\\Files\\PoolImportData\\"

                $MethodName = "GenerateDocxByJsonVariable"
                $DestinationFileNameFinnally = InvestorName + '_认购协议.docx'
                $DBName = "TrustManagement"
                $JsonVariableString = "[{'Name':'TrustId','Value':'" + that.trustId + "'},{'Name':'InvestorId','Value':'" + InvestorId + "'}]";


                var tpi = new TaskProcessIndicatorHelper(false, false);
                tpi.AddVariableItem('TemplateFileFirst', $TemplateFileFirst, 'NVarChar');
                tpi.AddVariableItem('DestinationFileNameFirst', $DestinationFileNameFirst, 'NVarChar');
                tpi.AddVariableItem('TrustId', that.trustId, 'NVarChar');
                //tpi.AddVariableItem('AssemblyPathFinnally', $AssemblyPathFinnally, 'NVarChar');
                tpi.AddVariableItem('TemplateFileFinnally', $TemplateFileFinnally, 'NVarChar');
                tpi.AddVariableItem('RootPath', $RootPath, 'NVarChar');
                tpi.AddVariableItem('MethodName', $MethodName, 'NVarChar');
                tpi.AddVariableItem('DBName', $DBName, 'NVarChar');
                tpi.AddVariableItem('DestinationFileNameFinnally', $DestinationFileNameFinnally, 'NVarChar');
                tpi.AddVariableItem('JsonVariableString', $JsonVariableString, 'NVarChar');
                tpi.ShowIndicator('ConsumerLoan', $TaskCode, function (result) {
                    if (confirm('确认下载文档？')) {
                        window.location.href = GlobalVariable.TrustManagementServiceHostURL + '/ConsumerLoan/Working/' + $DestinationFileNameFinnally;
                    }
                });
            },
            subscription: function (id) {
                var index = "";
                for (var i = 0; i < this.Investor.length; i++) {
                    if (this.Investor[i].InvestorBondId == id) {
                        index = i + 1;
                    }
                }
                this.Investor[index].InvestorBondId = $(".subscription tr").eq(index).find("select").val();
            },
            Total: function (index) {
                var that = this;
                var num = $(".subscription tr").eq(index + 1).find("input").val();
                if (num != "") {
                    $(".subscription tr").eq(index + 1).find("td").eq(6).html(num * $(".subscription tr").eq(index + 1).find("td").eq(4).html());
                    that.Investor[index].SubscriptionShare = num;
                }
            },
            RemovePeople: function (IIndex) {
                this.Investor.splice(IIndex, 1);
            },
            OpenPopup: function (InvestorId, InvestorName, InvestorType) {
                $(".PopupBackground").css("display", "block");
                $(".Popup").css("display", "block");
                var self = this;
                self.investorinfoid = InvestorId;
                self.newInvestor = {};
                self.AlreadySelectedInvestorType = InvestorType;
                $("#InvestorName").val(InvestorName);
            },
            institutionChecked: function (type) {
                self.newInvestor.InvestorType = type;
            },
            Preservation: function () {
                var haveError = false, self = this;
                $('.Popup').find('.form-control').each(function () {
                    var $this = $(this);
                    if (!validControlValue($this)) { haveError = true; }
                });
                if (haveError) return;
                var xml = '<xml>';
                xml += '<InvestorInfo>';
                xml += '<InvestorName>' + self.newInvestor.InvestorName + '</InvestorName>';
                xml += '<InvestorType>' + self.newInvestor.InvestorType + '</InvestorType>';
                xml += '<HomeAddress>' + self.newInvestor.HomeAddress + '</HomeAddress>';
                xml += '<LegalRepresentativeName>' + self.newInvestor.LegalRepresentativeName + '</LegalRepresentativeName>';
                xml += '<OfficeAddress>' + self.newInvestor.OfficeAddress + '</OfficeAddress>';
                xml += '<ZipCode>' + self.newInvestor.ZipCode + '</ZipCode>';
                xml += '<ContactPerson>' + self.newInvestor.ContactPerson + '</ContactPerson>';
                xml += '<Phone>' + self.newInvestor.Phone + '</Phone>';
                xml += '<Fax>' + self.newInvestor.Fax + '</Fax>';
                xml += '<Email>' + self.newInvestor.Email + '</Email>';
                xml += '<OnlineAccount_ManagedUnitCode>' + self.newInvestor.OnlineAccount_ManagedUnitCode + '</OnlineAccount_ManagedUnitCode>';
                xml += '<OnlineAccount_SecuritiesAccountNo>' + self.newInvestor.OnlineAccount_ManagedUnitCode + '</OnlineAccount_SecuritiesAccountNo>';
                xml += '<OnlineAccount_RegistrationOrApprovalNo>' + self.newInvestor.OnlineAccount_ManagedUnitCode + '</OnlineAccount_RegistrationOrApprovalNo>';
                xml += '<OfflineAccount_AccountName>' + self.newInvestor.OfflineAccount_AccountName + '</OfflineAccount_AccountName>';
                xml += '<OfflineAccount_AccountNo>' + self.newInvestor.OfflineAccount_AccountNo + '</OfflineAccount_AccountNo>';
                xml += '<OfflineAccount_OpenBank>' + self.newInvestor.OfflineAccount_OpenBank + '</OfflineAccount_OpenBank>';
                xml += '<OfflineAccount_LargePaymentNo>' + self.newInvestor.OfflineAccount_LargePaymentNo + '</OfflineAccount_LargePaymentNo>';
                xml += '</InvestorInfo>';
                xml += '</xml>';
                var executeParam = {
                    SPName: 'usp_SaveInvestorInfo', SQLParams: [
                        { Name: 'InvestorInfoId', value: self.investorinfoid, DBType: 'int' },
                        { Name: 'xml', value: xml, DBType: 'xml' },
                    ]
                };
                var result = ExecuteRemoteData(executeParam, function (data) {
                    if (data) {
                        alert('保存成功');
                        $(".PopupBackground").css("display", "none");
                        $(".Popup").css("display", "none");
                        self.getLayeredContent();
                        self.newInvestor = {};
                        self.investorinfoid = 0;
                    }
                });
            },
            closePopup: function () {
                $(".PopupBackground").css("display", "none");
                $(".Popup").css("display", "none");
            },
            RemovePool: function (InvestorId, ipIndex) {
                //this.InvestmentPool.splice(ipIndex, 1);
                var self = this;
                var svcUrlWithConn = GlobalVariable.DataProcessServiceUrl + "CommonGetExecute?";
                var executeParam = { SPName: 'usp_deleteInvestorInfoByInvestorId', SQLParams: [] };
                executeParam.SQLParams.push({ Name: 'InvestorId', value: InvestorId, DBType: 'int' });
                var executeParams = encodeURIComponent(JSON.stringify(executeParam));
                var serviceUrl = svcUrlWithConn + "connConfig=TrustManagement&appDomain=TrustManagement&executeParams=" + executeParams + '&resultType=Common';
                $.ajax({
                    url: serviceUrl,
                    type: "GET",
                    contentType: "application/json; charset=utf-8",
                    success: function (data) {
                        if (data) {
                            self.getLayeredContent();
                        }
                    },
                    error: function (data) {
                        alert('getProductTypeCategory Error !');
                    }
                });
            },
            AddPool: function (ipIndex) {
                var that = this;
                that.Investor.push({
                    InvestorId: that.InvestmentPool[ipIndex].InvestorId,
                    InvestorName: that.InvestmentPool[ipIndex].InvestorName,
                    InvestorBondId: 0,
                    EachSharePrice: 100,
                    SubscriptionShare: 0,
                });
            },
            closePreview: function () {
                $(".PopupBackground").css("display", "none");
                $(".preview").css("display", "none");
            },
            closeContract: function () {
                $(".PopupBackground").css("display", "none");
                $(".contract").css("display", "none");
            },
            OppenContract: function (InvestorType, InvestorName) {
                $(".PopupBackground").css("display", "block");
                $(".contract").css("display", "block");
                var self = this;
                for (var i = 0; i < self.InvestorTypeInfo.length; i++) {
                    if (InvestorType == self.InvestorTypeInfo[i].InvestorTypeId) {
                        self.InvestorType = self.InvestorTypeInfo[i].InvestorTypeCode;
                    }
                }
                var trustId = common.getQueryString("trustId")
                var svcUrlWithConn = GlobalVariable.DataProcessServiceUrl + "CommonGetExecute?";
                var executeParam = { SPName: 'usp_GetSalesSubscriptionAgreementInvestorProviderInfo', SQLParams: [] };
                executeParam.SQLParams.push({ Name: 'InvestorName', value: InvestorName, DBType: 'string' });
                executeParam.SQLParams.push({ Name: 'InvestorType', value: self.InvestorType, DBType: 'string' });
                var executeParams = encodeURIComponent(JSON.stringify(executeParam));
                var serviceUrl = svcUrlWithConn + "connConfig=TrustManagement&appDomain=TrustManagement&executeParams=" + executeParams + '&resultType=Common';
                $.ajax({
                    url: serviceUrl,
                    type: "GET",
                    contentType: "application/json; charset=utf-8",
                    dataType: "jsonp",
                    success: function (data) {
                        var data = JSON.parse(data);
                        for (var i = 0; i < data[0].length; i++) {
                            for (var key in data[0][i]) {
                                if (data[0][i][key] != undefined && data[0][i][key] != null) {
                                    self.contract.push([key, data[0][i][key]]);
                                }
                            }
                        }
                        for (var i = 0; i < data[1].length; i++) {
                            for (var key in data[1][i]) {
                                if (data[1][i][key] != undefined && data[1][i][key] != null) {
                                    self.EnclosureMechanism.push([key, data[1][i][key]]);
                                }
                            }
                        }
                        for (var i = 0; i < data[2].length; i++) {
                            for (var key in data[2][i]) {
                                if (data[2][i][key] != undefined && data[2][i][key] != null) {
                                    self.EnclosureProduct.push([key, data[2][i][key]]);
                                }
                            }
                        }
                        if (self.InvestorType == 'NonFinancialProfessional' || self.InvestorType == 'Ordinary') {
                            for (var i = 0; i < data[3].length; i++) {
                                for (var key in data[3][i]) {
                                    if (data[3][i][key] != undefined && data[3][i][key] != null) {
                                        self.InstitutionalTaxation.push([key, data[3][i][key]]);
                                    }
                                }
                            }
                            for (var i = 0; i < data[4].length; i++) {
                                for (var key in data[4][i]) {
                                    if (data[4][i][key] != undefined && data[4][i][key] != null) {
                                        self.ControllerTax.push([key, data[4][i][key]]);
                                    }
                                }
                            }
                            for (var i = 0; i < data[5].length; i++) {
                                for (var key in data[5][i]) {
                                    if (data[5][i][key] != undefined && data[5][i][key] != null) {
                                        self.Application.push([key, data[5][i][key]]);
                                    }
                                }
                            }
                        }
                        if (self.InvestorType == 'NonFinancialProfessional') {
                            for (var i = 0; i < data[6].length; i++) {
                                for (var key in data[6][i]) {
                                    if (data[6][i][key] != undefined && data[6][i][key] != null) {
                                        self.TestQuestions.push([key, data[6][i][key]]);
                                    }
                                }
                            }
                        }
                        if (self.InvestorType == 'Ordinary') {
                            for (var i = 0; i < data[6].length; i++) {
                                for (var key in data[6][i]) {
                                    if (data[6][i][key] != undefined && data[6][i][key] != null) {
                                        self.AbilityQuestionnaire.push([key, data[6][i][key]]);
                                    }
                                }
                            }
                            for (var i = 0; i < data[7].length; i++) {
                                for (var key in data[7][i]) {
                                    if (data[7][i][key] != undefined && data[7][i][key] != null) {
                                        self.ConfirmationOfResults.push([key, data[7][i][key]]);
                                    }
                                }
                            }
                            for (var i = 0; i < data[8].length; i++) {
                                for (var key in data[8][i]) {
                                    if (data[8][i][key] != undefined && data[8][i][key] != null) {
                                        self.InvestorConfirmation.push([key, data[8][i][key]]);
                                    }
                                }
                            }
                        }
                    },
                    error: function (data) {
                        alert('getProductTypeCategory Error !');
                    }
                });
            },
            OppenPreview: function () {
                $(".PopupBackground").css("display", "block");
                $(".preview").css("display", "block");

            },
            GetInvestorTypeInfo: function () {
                var self = this;
                var svcUrlWithConn = GlobalVariable.DataProcessServiceUrl + "CommonGetExecute?";
                var executeParam = { SPName: 'usp_GetInvestorTypeInfo', SQLParams: [] };
                var executeParams = encodeURIComponent(JSON.stringify(executeParam));
                var serviceUrl = svcUrlWithConn + "connConfig=TrustManagement&appDomain=TrustManagement&executeParams=" + executeParams + '&resultType=Common';
                $.ajax({
                    url: serviceUrl,
                    type: "GET",
                    contentType: "application/json; charset=utf-8",
                    dataType: "jsonp",
                    success: function (data) {
                        var data = JSON.parse(data);
                        self.InvestorTypeInfo = data;
                    },
                    error: function (data) {
                        alert('getProductTypeCategory Error !');
                    }
                });
            },
            agreementFileChange: function () {
                $("#fileBlock").val($("#file").val());
            },
            uploadAgreement: function () {
                var filePath = $('#fileBlock').val();
                if (filePath == "" || filePath == null) {
                    alert("请选择文件！");
                    return;
                }
                var that = this;
                fileName = filePath.substring(filePath.lastIndexOf('\\') + 1);

                UploadFile('file', fileName, 'PoolImportData', function (d) {
                    that.AgreementFileUploadResult = d.FileUploadResult;
                });
            },
            ImportAgreement: function () {
                var that = this;
                var filePath = $('#fileBlock').val();
                if (filePath == "" || filePath == null) {
                    alert("请选择文件！");
                    return;
                }
                fileName = filePath.substring(filePath.lastIndexOf('\\') + 1);
                UploadFile('file', fileName, 'PoolImportData', function (d) {
                    that.AgreementFileUploadResult = d.FileUploadResult;
                    $TaskCode = "LoadSubscriptionAgreementManagementExcelInfo"
                    $TaskType = "Task"
                    $AppDomain = "ConsumerLoan"
                    var tpi = new TaskProcessIndicatorHelper(false, false);
                    tpi.AddVariableItem('ExcelFullPath', that.AgreementFileUploadResult, 'NVarChar');
                    tpi.AddVariableItem('TrustId', that.trustId, 'NVarChar');
                    tpi.ShowIndicator('ConsumerLoan', 'LoadSubscriptionAgreementManagementExcelInfo', function (result) {
                        $(".Agreement").css("display", "block");
                        var trustId = common.getQueryString("trustId")
                        var svcUrlWithConn = GlobalVariable.DataProcessServiceUrl + "CommonGetExecute?";
                        var executeParam = { SPName: 'usp_GetSalesSubscriptionAgreementManagerProviderInfo', SQLParams: [] };
                        executeParam.SQLParams.push({ Name: 'TrustID', value: trustId, DBType: 'int' });
                        var executeParams = encodeURIComponent(JSON.stringify(executeParam));
                        var serviceUrl = svcUrlWithConn + "connConfig=TrustManagement&appDomain=TrustManagement&executeParams=" + executeParams + '&resultType=Common';
                        $.ajax({
                            url: serviceUrl,
                            type: "GET",
                            contentType: "application/json; charset=utf-8",
                            dataType: "jsonp",
                            success: function (data) {
                                var data = JSON.parse(data), EssentialInformationData = [], riskAssessmentData = [];
                                for (var i = 0; i < data[0].length; i++) {
                                    for (var key in data[0][i]) {
                                        if (data[0][i][key] != undefined && data[0][i][key] != null) {
                                            EssentialInformationData.push([key, data[0][i][key]]);
                                        }
                                    }
                                }
                                that.EssentialInformation = EssentialInformationData;
                                for (var i = 0; i < data[1].length; i++) {
                                    for (var key in data[1][i]) {
                                        if (data[1][i][key] != undefined && data[1][i][key] != null) {
                                            riskAssessmentData.push([key, data[1][i][key]]);
                                        }
                                    }
                                }
                                that.riskAssessment = riskAssessmentData;
                            },
                            error: function (data) {
                                alert('getProductTypeCategory Error !');
                            }
                        });
                    });
                });
            },
            fileInvestorChange: function () {
                $("#fileBlockInvestor").val($("#fileInvestor").val());
            },
            uploadInvestor: function () {
                var filePath = $('#fileBlockInvestor').val();
                if (filePath == "" || filePath == null) { alert("请选择文件！"); return; }
                var that = this;
                fileName = filePath.substring(filePath.lastIndexOf('\\') + 1);
                UploadFile('fileInvestor', fileName, 'PoolImportData', function (d) {
                    that.InvestorFileUploadResult = d.FileUploadResult;
                    var name = $("#InvestorName").val();
                    if (name == "" && name == null) { return }
                    $TaskCode = "LoadSubscriptionAgreementCustomerExcelInfo";
                    $TaskType = "Task";
                    $AppDomain = "ConsumerLoan";
                    var tpi = new TaskProcessIndicatorHelper(false, false);
                    tpi.AddVariableItem('ExcelFullPath', that.InvestorFileUploadResult, 'NVarChar');
                    tpi.AddVariableItem('InvestorName', name, 'NVarChar');
                    tpi.AddVariableItem('InvestorType', $("#InvestorType").find("option:selected").val(), 'NVarChar');
                    tpi.ShowIndicator('ConsumerLoan', 'LoadSubscriptionAgreementCustomerExcelInfo', null);
                });
            },
            ImportInvestor: function () {
                var that = this;
                that.uploadInvestor();
                //if (that.InvestorFileUploadResult == "") { return }
            },
            saveAllItems: function () {
                var haveError = false;
                $('#app').find('.form-control').each(function () {
                    var $this = $(this);
                    if (!validControlValue($this)) { haveError = true; }
                });
                if (haveError) return;
                var that = this;
                var xml = '<xml>';
                xml += '<TrustInvestorMaps>';
                for (var i = 0; i < that.Investor.length; i++) {
                    if (that.Investor[i].InvestorId > -1) {
                        xml += '<TrustInvestorMap>';
                        xml += '<TrustId>' + that.trustId + '</TrustId>';
                        xml += '<InvestorId>' + that.Investor[i].InvestorId + '</InvestorId>';
                        xml += '<InvestorBondId>' + that.Investor[i].InvestorBondId + '</InvestorBondId>';
                        for (var j = 0; j < that.Layered.length; j++) {
                            if (that.Layered[j].TrustBondId == that.Investor[i].InvestorBondId) {
                                xml += '<InvestorBondName>' + that.Layered[j].ShortName + '</InvestorBondName>';
                            }
                        }
                        if (that.Investor[i].SubscriptionShare == undefined) {
                            xml += '<SubscriptionShare></SubscriptionShare>';
                        } else {
                            xml += '<SubscriptionShare>' + that.Investor[i].SubscriptionShare + '</SubscriptionShare>';
                        }
                        xml += '<EachSharePrice>100</EachSharePrice>';
                        if (that.Investor[i].SubscriptionShare != "" && that.Investor[i].SubscriptionShare != null && that.Investor[i].SubscriptionShare != undefined) {
                            xml += '<SubscriptionAmount>' + 100 * that.Investor[i].SubscriptionShare + '</SubscriptionAmount>';
                        }
                        xml += '<CurrentDate>' + currentTime() + '</CurrentDate>';
                        xml += '</TrustInvestorMap>';
                    }
                }
                xml += '</TrustInvestorMaps>';
                xml += '</xml>';
                var executeParam = {
                    SPName: 'usp_SaveSalesSubscriptionAgreementDocumentInfo', SQLParams: [
                        { Name: 'TrustID', value: that.trustId, DBType: 'int' },
                        { Name: 'xml', value: xml, DBType: 'xml' },
                    ]
                };
                var result = ExecuteRemoteData(executeParam, function (data) {
                    if (data) {
                        alert('保存成功');
                        that.getLayeredContent();
                    }
                });


            },
            browse: function () {
                $("#file").click();
            },
            browseInvestor: function () {
                $("#fileInvestor").click();
            },
            UploadDocuments: function (TemplateType, index) {
                var filePath = $('.UploadDocumentsBlock').eq(index).val();
                if (filePath == "" || filePath == null) { alert("请选择文件！"); return; }
                var that = this;
                //fileName = filePath.substring(filePath.lastIndexOf('\\') + 1);
                if (index == 0) {
                    fileName = "1.基本信息.docx";
                } else if (index == 1) {
                    fileName = "2.风险揭示.docx";
                } else if (index == 2) {
                    fileName = "3.产品或服务风险等级评估表.docx";
                } else if (index == 3) {
                    fileName = "4.普通投资者投资高风险产品特别警示.docx";
                }

                PoolImportData = 'PoolImportData\\' + that.trustId + ".SaleReportTemplate";
                UploadFile('UploadDocuments' + index, fileName, PoolImportData, function (d) {
                    var svcUrlWithConn = GlobalVariable.DataProcessServiceUrl + "CommonGetExecute?";
                    var executeParam = { SPName: 'usp_SaveSalesSubscriptionAgreementTempDocumentPath', SQLParams: [] };
                    executeParam.SQLParams.push({ Name: 'TrustID', value: that.trustId, DBType: 'int' });
                    executeParam.SQLParams.push({ Name: 'TemplateDocPath', value: d.FileUploadResult, DBType: 'string' });
                    executeParam.SQLParams.push({ Name: 'TemplateType', value: TemplateType, DBType: 'string' });
                    var executeParams = encodeURIComponent(JSON.stringify(executeParam));
                    var serviceUrl = svcUrlWithConn + "connConfig=TrustManagement&appDomain=TrustManagement&executeParams=" + executeParams + '&resultType=Common';
                    $.ajax({
                        url: serviceUrl,
                        type: "GET",
                        contentType: "application/json; charset=utf-8",
                        success: function (data) {
                            if (data) {
                                alert("上传成功！");
                            }
                        },
                        error: function (data) {
                            alert('getProductTypeCategory Error !');
                        }
                    });
                });
            },
            UploadDocumentsChange: function (index) {
                $(".UploadDocumentsBlock").eq(index).val($(".UploadDocuments").eq(index).val());
            },
            browseUploadDocuments: function (index) {
                $(".UploadDocuments").eq(index).click();
            },
            OppenUploadDocuments: function () {
                // window.location.href = this.UploadDocumentsPath;
                window.location.href = location.protocol + '//' + location.host + "/PoolCut/Files/PoolImportData/65.SaleReportTemplate/1.template.docx"
            }
        },
    })


    function DownLoanTempDocuments(fileName) {
        // window.location.href = this.UploadDocumentsPath;
        window.location.href = location.protocol + '//' + location.host + "/TrustManagementService/ConsumerLoan/Document/销售文档/Template/" + fileName
    }


    function UploadFile(fileCtrlId, fileName, folder, fnCallback) {
        var fileData = document.getElementById(fileCtrlId).files[0];
        var svcUrlWithConn = GlobalVariable.PoolCutURL + "PoolCutService.svc/jsAccessEP/FileUpload?fileName={0}&fileFolder={1}";
        var svcUrl = svcUrlWithConn.format(
            encodeURIComponent(fileName), encodeURIComponent(folder));
        $.ajax({
            url: svcUrl,
            type: 'POST',
            data: fileData,
            cache: false,
            dataType: 'json',
            processData: false, // Don't process the files
            //contentType: "application/octet-stream", // Set content type to false as jQuery will tell the server its a query string request
            success: function (response) {
                var sourceData;
                if (typeof response == 'string')
                    sourceData = JSON.parse(response);
                else
                    sourceData = response;
                if (fnCallback) fnCallback(sourceData);
            },
            error: function (data) {
                alert('File upload failed!');
            }
        });
    }
    function isEmail(str) {
        var reg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((.[a-zA-Z0-9_-]{2,3}){1,2})$/;
        return reg.test(str);
    }
    function checkTel(tel) {
        var mobile = /^1[3|5|8]\d{9}$/, phone = /^0\d{2,3}-?\d{7,8}$/;
        return mobile.test(tel) || phone.test(tel);
    }
    var TrustMngmtRegxCollection = {
        int: /^([-]?[1-9]+\d*$|^0)?$/,
        decimal: /^([-]?[1-9]+\d*(\.{1}\d+){0,1}$|^[-]{1}0\.\d*[1-9]\d*$|^0(\.\d+)?)?$/,
        date: /^((\d{4})-(\d{2})-(\d{2}))?$/,
        datetime: /^((\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2}))?$/
    };
    function validControlValue(obj) {
        var $this = $(obj);
        var objValue = $this.val();
        var valids = $this.attr('data-valid');

        //无data-valid属性，不需要验证
        if (!valids || valids.length < 1) { return true; }

        //如果有必填要求，必填验证
        if (valids.indexOf('required') >= 0) {
            if (!objValue || objValue.length < 1) {
                $this.addClass('red-border');
                return false;
            } else {
                $this.removeClass('red-border');
            }
        }

        //暂时只考虑data-valid只包含两个值： 必填和类型
        var dataType = valids.replace('required', '').toLocaleLowerCase().trim();

        //通过必填验证，做数据类型验证
        var regx = TrustMngmtRegxCollection[dataType];
        if (!regx) { return true; }

        if (!regx.test(objValue)) {
            $this.addClass('red-border');
            return false;
        } else {
            $this.removeClass('red-border');
        }
        return true;
    }


    function ExecuteRemoteData(executeParam, callback) {
        //var executeParams = encodeURIComponent(JSON.stringify(executeParam));
        var executeParams = JSON.stringify(executeParam);

        var params = '';
        params += '<root appDomain="TrustManagement" postType="">';// appDomain="TrustManagement"
        params += executeParams;
        params += '</root>';

        var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonPostExecute";

        $.ajax({
            type: "POST",
            url: serviceUrl,
            dataType: "json",
            contentType: "application/xml;charset=utf-8",
            data: params,
            processData: false,
            success: function (response) {
                if (callback)
                    callback(response);
            },
            error: function (response) { alert("error is :" + response); }
        });

    }

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
    function currentTime() {
        var d = new Date(), str = '';
        str += d.getFullYear() + '-';
        str += d.getMonth() + 1 + '-';
        str += d.getDate();
        return str;
    }




    //////





})














