


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






    //////////
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
            EnclosureProduct: []
        },
        mounted: function () {
            this.getLayeredContent();
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
            getLayeredContent: function () {
                var self = this;
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
                        for (var i = 0; i < data[0].length; i++) {
                            if (data[0][i].name == "PlanManagerAdvertiser") {
                                self.PlanManagerAdvertiser = data[0][i].value;
                            }
                            if (data[0][i].name == "RaiseFundAccountName") {
                                self.RaiseFundAccountName = data[0][i].value;
                            }
                            if (data[0][i].name == "RaiseFundAccountNo") {
                                self.RaiseFundAccountNo = data[0][i].value;
                            }
                            if (data[0][i].name == "RaiseFundAccountOpenBank") {
                                self.RaiseFundAccountOpenBank = data[0][i].value;
                            }
                            if (data[0][i].name == "RaiseFundDate") {
                                $("#RaiseFundDate").val(data[0][i].value);
                            }
                            if (data[0][i].name == "RaiseFundLargePaymentNo") {
                                self.RaiseFundLargePaymentNo = data[0][i].value;
                            }
                            if (data[0][i].name == "RaiseFundLocation") {
                                self.RaiseFundLocation = data[0][i].value;
                            }
                            if (data[0][i].name == "TrustName") {
                                self.TrustName1 = data[0][i].value;
                            }
                        }
                        for (var i = 0; i < data[1].length; i++) {
                            if (data[1][i].PlanManagerAdvertiserInfo == "FirstContact") {
                                self.FirstContact = data[1][i].PlanManagerAdvertiserValue;
                            }
                            if (data[1][i].PlanManagerAdvertiserInfo == "OfficialRepresentative") {
                                self.OfficialRepresentative = data[1][i].PlanManagerAdvertiserValue;
                            }
                            if (data[1][i].PlanManagerAdvertiserInfo == "OfficeAddress") {
                                self.OfficeAddress = data[1][i].PlanManagerAdvertiserValue;
                            }
                            if (data[1][i].PlanManagerAdvertiserInfo == "Phone") {
                                self.Phone = data[1][i].PlanManagerAdvertiserValue;
                            }
                            if (data[1][i].PlanManagerAdvertiserInfo == "Fax") {
                                self.Fax = data[1][i].PlanManagerAdvertiserValue;
                            }
                            if (data[1][i].PlanManagerAdvertiserInfo == "Email") {
                                self.Email = data[1][i].PlanManagerAdvertiserValue;
                            }
                            if (data[1][i].PlanManagerAdvertiserInfo == "HomeAddress") {
                                self.HomeAddress = data[1][i].PlanManagerAdvertiserValue;
                            }
                        }
                        self.Layered = data[4];
                        self.Investor = data[2];
                        self.InvestmentPool = data[3];
                    },
                    error: function (data) {
                        alert('getProductTypeCategory Error !');
                    }
                });
            },
            OppenPreview: function () {
                $(".PopupBackground").css("display", "block");
                $(".preview").css("display", "block");
                var self = this;
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
                        var data = JSON.parse(data);
                        if (data[0][0].AssetRelatedRisks != undefined && data[0][0].AssetRelatedRisks != null) {
                            self.EssentialInformation.push(data[0][0].AssetRelatedRisks);
                        }
                        if (data[0][0].ContactPerson != undefined && data[0][0].ContactPerson != null) {
                            self.EssentialInformation.push(data[0][0].ContactPerson);
                        }
                        if (data[0][0].CreditRating != undefined && data[0][0].CreditRating != null) {
                            self.EssentialInformation.push(data[0][0].CreditRating);
                        }
                        if (data[0][0].Email != undefined && data[0][0].Email != null) {
                            self.EssentialInformation.push(data[0][0].Email);
                        }
                        if (data[0][0].ExchageInstitution != undefined && data[0][0].ExchageInstitution != null) {
                            self.EssentialInformation.push(data[0][0].ExchageInstitution);
                        }
                        if (data[0][0].ExpectReturnRate != undefined && data[0][0].ExpectReturnRate != null) {
                            self.EssentialInformation.push(data[0][0].ExpectReturnRate);
                        }
                        if (data[0][0].Fax != undefined && data[0][0].Fax != null) {
                            self.EssentialInformation.push(data[0][0].Fax);
                        }
                        if (data[0][0].IncomeAndPrincipalPayments != undefined && data[0][0].IncomeAndPrincipalPayments != null) {
                            self.EssentialInformation.push(data[0][0].IncomeAndPrincipalPayments);
                        }
                        if (data[0][0].LoanTerm != undefined && data[0][0].LoanTerm != null) {
                            self.EssentialInformation.push(data[0][0].LoanTerm);
                        }
                        if (data[0][0].OtherRisks != undefined && data[0][0].OtherRisks != null) {
                            self.EssentialInformation.push(data[0][0].OtherRisks);
                        }
                        if (data[0][0].PaymentInstitution != undefined && data[0][0].PaymentInstitution != null) {
                            self.EssentialInformation.push(data[0][0].PaymentInstitution);
                        }
                        if (data[0][0].Phone != undefined && data[0][0].Phone != null) {
                            self.EssentialInformation.push(data[0][0].Phone);
                        }
                        if (data[0][0].PopularizeDate != undefined && data[0][0].PopularizeDate != null) {
                            self.EssentialInformation.push(data[0][0].PopularizeDate);
                        }
                        if (data[0][0].PopularizeLocation != undefined && data[0][0].PopularizeLocation != null) {
                            self.EssentialInformation.push(data[0][0].PopularizeLocation);
                        }
                        if (data[0][0].RegisterInstitution != undefined && data[0][0].RegisterInstitution != null) {
                            self.EssentialInformation.push(data[0][0].RegisterInstitution);
                        }
                        if (data[0][0].SecuritiesRelatedRisks != undefined && data[0][0].SecuritiesRelatedRisks != null) {
                            self.EssentialInformation.push(data[0][0].SecuritiesRelatedRisks);
                        }
                        if (data[0][0].TaxTips != undefined && data[0][0].TaxTips != null) {
                            self.EssentialInformation.push(data[0][0].TaxTips);
                        }
                        if (data[0][0].TrustCode != undefined && data[0][0].TrustCode != null) {
                            self.EssentialInformation.push(data[0][0].TrustCode);
                        }
                        if (data[0][0].TrustId != undefined && data[0][0].TrustId != null) {
                            self.EssentialInformation.push(data[0][0].TrustId);
                        }
                        if (data[0][0].TrustName != undefined && data[0][0].TrustName != null) {
                            self.EssentialInformation.push(data[0][0].TrustName);
                        }
                        if (data[0][0].TrustSaleAmount != undefined && data[0][0].TrustSaleAmount != null) {
                            self.EssentialInformation.push(data[0][0].TrustSaleAmount);
                        }
                        if (data[0][0].TrustSecuritiesName != undefined && data[0][0].TrustSecuritiesName != null) {
                            self.EssentialInformation.push(data[0][0].TrustSecuritiesName);
                        }
                        if (data[1][0].ApplicationDepartment != undefined && data[1][0].ApplicationDepartment != null) {
                            self.riskAssessment.push(data[1][0].ApplicationDepartment);
                        }
                        if (data[1][0].AssessmentDepartments != undefined && data[1][0].AssessmentDepartments != null) {
                            self.riskAssessment.push(data[1][0].AssessmentDepartments);
                        }
                        if (data[1][0].BasicAssetInfo != undefined && data[1][0].BasicAssetInfo != null) {
                            self.riskAssessment.push(data[1][0].BasicAssetInfo);
                        }
                        if (data[1][0].CreditRiskAndComplexity != undefined && data[1][0].CreditRiskAndComplexity != null) {
                            self.riskAssessment.push(data[1][0].CreditRiskAndComplexity);
                        }
                        if (data[1][0].DistributionByOwnCompany != undefined && data[1][0].DistributionByOwnCompany != null) {
                            self.riskAssessment.push(data[1][0].DistributionByOwnCompany);
                        }
                        if (data[1][0].InvestmentArrangements != undefined && data[1][0].InvestmentArrangements != null) {
                            self.riskAssessment.push(data[1][0].InvestmentArrangements);
                        }
                        if (data[1][0].InvestorMaxLoss != undefined && data[1][0].InvestorMaxLoss != null) {
                            self.riskAssessment.push(data[1][0].InvestorMaxLoss);
                        }
                        if (data[1][0].InvestorPossiblyLoss != undefined && data[1][0].InvestorPossiblyLoss != null) {
                            self.riskAssessment.push(data[1][0].InvestorPossiblyLoss);
                        }
                        if (data[1][0].InvestorRequiredFollowUpInvestmentOrDebt != undefined && data[1][0].InvestorRequiredFollowUpInvestmentOrDebt != null) {
                            self.riskAssessment.push(data[1][0].InvestorRequiredFollowUpInvestmentOrDebt);
                        }
                        if (data[1][0].InvestorRiskToleranceLevel != undefined && data[1][0].InvestorRiskToleranceLevel != null) {
                            self.riskAssessment.push(data[1][0].InvestorRiskToleranceLevel);
                        }
                        if (data[1][0].InvestorsIntendPeriodAndVarieties != undefined && data[1][0].InvestorsIntendPeriodAndVarieties != null) {
                            self.riskAssessment.push(data[1][0].InvestorsIntendPeriodAndVarieties);
                        }
                        if (data[1][0].LeverInfo != undefined && data[1][0].LeverInfo != null) {
                            self.riskAssessment.push(data[1][0].LeverInfo);
                        }
                        if (data[1][0].MortgageInfo != undefined && data[1][0].MortgageInfo != null) {
                            self.riskAssessment.push(data[1][0].MortgageInfo);
                        }
                        if (data[1][0].OtherRiskFactors != undefined && data[1][0].OtherRiskFactors != null) {
                            self.riskAssessment.push(data[1][0].OtherRiskFactors);
                        }
                        if (data[1][0].OtherRiskInfo != undefined && data[1][0].OtherRiskInfo != null) {
                            self.riskAssessment.push(data[1][0].OtherRiskInfo);
                        }
                        if (data[1][0].ProductOrServiceName != undefined && data[1][0].ProductOrServiceName != null) {
                            self.riskAssessment.push(data[1][0].ProductOrServiceName);
                        }
                        if (data[1][0].ProductRiskLevel != undefined && data[1][0].ProductRiskLevel != null) {
                            self.riskAssessment.push(data[1][0].ProductRiskLevel);
                        }
                        if (data[1][0].ProductStructureAndLeverageInfo != undefined && data[1][0].ProductStructureAndLeverageInfo != null) {
                            self.riskAssessment.push(data[1][0].ProductStructureAndLeverageInfo);
                        }
                        if (data[1][0].ProductSuitable != undefined && data[1][0].ProductSuitable != null) {
                            self.riskAssessment.push(data[1][0].ProductSuitable);
                        }
                        if (data[1][0].PublishIslegal != undefined && data[1][0].PublishIslegal != null) {
                            self.riskAssessment.push(data[1][0].PublishIslegal);
                        }
                        if (data[1][0].PublisherBasicInfo != undefined && data[1][0].PublisherBasicInfo != null) {
                            self.riskAssessment.push(data[1][0].PublisherBasicInfo);
                        }
                        if (data[1][0].PublisherExperienceAndReputation != undefined && data[1][0].PublisherExperienceAndReputation != null) {
                            self.riskAssessment.push(data[1][0].PublisherExperienceAndReputation);
                        }
                        if (data[1][0].RiskReturnCharacteristics != undefined && data[1][0].RiskReturnCharacteristics != null) {
                            self.riskAssessment.push(data[1][0].RiskReturnCharacteristics);
                        }
                        if (data[1][0].TrustCode != undefined && data[1][0].TrustCode != null) {
                            self.riskAssessment.push(data[1][0].TrustCode);
                        }
                        if (data[1][0].TrustId != undefined && data[1][0].TrustId != null) {
                            self.riskAssessment.push(data[1][0].TrustId);
                        }
                        if (data[1][0].TrustName != undefined && data[1][0].TrustName != null) {
                            self.riskAssessment.push(data[1][0].TrustName);
                        }
                        if (data[1][0].TrustTermOrTermination != undefined && data[1][0].TrustTermOrTermination != null) {
                            self.riskAssessment.push(data[1][0].TrustTermOrTermination);
                        }
                    },
                    error: function (data) {
                        alert('getProductTypeCategory Error !');
                    }
                });
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
                xml += '<RaiseFundInfo>';
                xml += '<RaiseFundDate>' + $("#RaiseFundDate").val() + '</RaiseFundDate>';
                xml += '<RaiseFundLocation>' + that.RaiseFundLocation + '</RaiseFundLocation>';
                xml += '<RaiseFundAccountName>' + that.RaiseFundAccountName + '</RaiseFundAccountName>';
                xml += '<RaiseFundAccountNo>' + that.RaiseFundAccountNo + '</RaiseFundAccountNo>';
                xml += '<RaiseFundAccountOpenBank>' + that.RaiseFundAccountOpenBank + '</RaiseFundAccountOpenBank>';
                xml += '<RaiseFundLargePaymentNo>' + that.RaiseFundAccountOpenBank + '</RaiseFundLargePaymentNo>';
                xml += '</RaiseFundInfo>';
                xml += '<PlanManagerAdvertiserInfo>';
                xml += '<PlanManagerAdvertiser>' + that.PlanManagerAdvertiser + '</PlanManagerAdvertiser>';
                xml += '<OfficialRepresentative>' + that.OfficialRepresentative + '</OfficialRepresentative>';
                xml += '<HomeAddress>' + that.HomeAddress + '</HomeAddress>';
                xml += '<OfficeAddress>' + that.OfficeAddress + '</OfficeAddress>';
                xml += '<FirstContact>' + that.FirstContact + '</FirstContact>';
                xml += '<Phone>' + that.Phone + '</Phone>';
                xml += '<Email>' + that.Email + '</Email>';
                xml += '<Fax>' + that.Fax + '</Fax>';
                xml += '</PlanManagerAdvertiserInfo>';
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
            downloadFile: function () {
                var that = this;
                that.saveAllItems();
                for (var i = 0; i < that.InvestmentPool.length; i++) {
                    JsonVariableString = "[{'Name':'TrustId','Value':" + that.trustId + "},{'Name':'InvestorId','Value':" + that.InvestmentPool[i].InvestorId + "}]";
                    console.log(JsonVariableString);
                    //AssemblyPath = "E:\\TSSWCFServices\\TrustManagementService\\ConsumerLoan\\DLL\\DocxCreationByJson.dll";
                    DBName = "TrustManagement";
                    TemplateFile = "E:\\TSSWCFServices\\TrustManagementService\\ConsumerLoan\\Document\\销售文档\\认购协议.docx";
                    DestinationFileName = that.trustName + '_认购协议.docx';
                    var tpi = new TaskProcessIndicatorHelper(false, false);
                    tpi.AddVariableItem('MethodName', 'GenerateDocxByJsonVariable', 'NVarChar');
                    tpi.AddVariableItem('TemplateFile', TemplateFile, 'NVarChar');
                    //tpi.AddVariableItem('AssemblyPath', AssemblyPath, 'NVarChar');
                    tpi.AddVariableItem('JsonVariableString', JsonVariableString, 'NVarChar');
                    tpi.AddVariableItem('DBName', DBName, 'NVarChar');
                    tpi.AddVariableItem('DestinationFileName', DestinationFileName, 'NVarChar');
                    tpi.ShowIndicator('ConsumerLoan', 'DocxCreationByJson', function (result) {
                        window.location.href = GlobalVariable.TrustManagementServiceHostURL + '/ConsumerLoan/Working/' + DestinationFileName;
                    });
                }

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
            OpenPopup: function (InvestorId) {
                $(".PopupBackground").css("display", "block");
                $(".Popup").css("display", "block");
                var self = this;
                self.investorinfoid = InvestorId;
                self.newInvestor = {};
                if (InvestorId != 0) {
                    var trustId = common.getQueryString("trustId")
                    var svcUrlWithConn = GlobalVariable.DataProcessServiceUrl + "CommonGetExecute?";
                    var executeParam = { SPName: 'usp_GetInvestorInfoByInvestorId', SQLParams: [] };
                    executeParam.SQLParams.push({ Name: 'InvestorId', value: InvestorId, DBType: 'int' });
                    var executeParams = encodeURIComponent(JSON.stringify(executeParam));
                    var serviceUrl = svcUrlWithConn + "connConfig=TrustManagement&appDomain=TrustManagement&executeParams=" + executeParams + '&resultType=Common';
                    $.ajax({
                        url: serviceUrl,
                        type: "GET",
                        contentType: "application/json; charset=utf-8",
                        dataType: "jsonp",
                        success: function (data) {
                            var data = JSON.parse(data);
                            self.newInvestor = data[0];
                        },
                        error: function (data) {
                            alert('getProductTypeCategory Error !');
                        }
                    })
                } else {
                    self.newInvestor.InvestorType = 2;
                }
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
            RemovePool: function (ipIndex) {
                this.InvestmentPool.splice(ipIndex, 1);
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
            OppenContract: function () {
                $(".PopupBackground").css("display", "block");
                $(".contract").css("display", "block");
                var self = this;
                var trustId = common.getQueryString("trustId")
                var svcUrlWithConn = GlobalVariable.DataProcessServiceUrl + "CommonGetExecute?";
                var executeParam = { SPName: 'usp_GetSalesSubscriptionAgreementInvestorProviderInfo', SQLParams: [] };
                executeParam.SQLParams.push({ Name: 'InvestorName', value: '京东金融', DBType: 'string' });
                var executeParams = encodeURIComponent(JSON.stringify(executeParam));
                var serviceUrl = svcUrlWithConn + "connConfig=TrustManagement&appDomain=TrustManagement&executeParams=" + executeParams + '&resultType=Common';
                $.ajax({
                    url: serviceUrl,
                    type: "GET",
                    contentType: "application/json; charset=utf-8",
                    dataType: "jsonp",
                    success: function (data) {
                        var data = JSON.parse(data);
                        if (data[0][0].AccountDescription != undefined && data[0][0].AccountDescription != null) {
                            self.contract.push(data[0][0].AccountDescription);
                        }
                        if (data[0][0].AccountName != undefined && data[0][0].AccountName != null) {
                            self.contract.push(data[0][0].AccountName);
                        }
                        if (data[0][0].AccountNo != undefined && data[0][0].AccountNo != null) {
                            self.contract.push(data[0][0].AccountNo);
                        }
                        if (data[0][0].AccountOpenBank != undefined && data[0][0].AccountOpenBank != null) {
                            self.contract.push(data[0][0].AccountOpenBank);
                        }
                        if (data[0][0].AccountPayNo != undefined && data[0][0].AccountPayNo != null) {
                            self.contract.push(data[0][0].AccountPayNo);
                        }
                        if (data[0][0].AssetSource != undefined && data[0][0].AssetSource != null) {
                            self.contract.push(data[0][0].AssetSource);
                        }
                        if (data[0][0].AssetsStatisticsDeadlineDate != undefined && data[0][0].AssetsStatisticsDeadlineDate != null) {
                            self.contract.push(data[0][0].AssetsStatisticsDeadlineDate);
                        }
                        if (data[0][0].ContactPerson != undefined && data[0][0].ContactPerson != null) {
                            self.contract.push(data[0][0].ContactPerson);
                        }
                        if (data[0][0].Email != undefined && data[0][0].Email != null) {
                            self.contract.push(data[0][0].Email);
                        }
                        if (data[0][0].EntrustedAssets != undefined && data[0][0].EntrustedAssets != null) {
                            self.contract.push(data[0][0].EntrustedAssets);
                        }
                        if (data[0][0].Fax != undefined && data[0][0].Fax != null) {
                            self.contract.push(data[0][0].Fax);
                        }
                        if (data[0][0].HomeAddress != undefined && data[0][0].HomeAddress != null) {
                            self.contract.push(data[0][0].HomeAddress);
                        }
                        if (data[0][0].InvestorId != undefined && data[0][0].InvestorId != null) {
                            self.contract.push(data[0][0].InvestorId);
                        }
                        if (data[0][0].InvestorName != undefined && data[0][0].InvestorName != null) {
                            self.contract.push(data[0][0].InvestorName);
                        }
                        if (data[0][0].InvestorType != undefined && data[0][0].InvestorType != null) {
                            self.contract.push(data[0][0].InvestorType);
                        }
                        if (data[0][0].LegalRepresentativeName != undefined && data[0][0].LegalRepresentativeName != null) {
                            self.contract.push(data[0][0].LegalRepresentativeName);
                        }
                        if (data[0][0].NetAssets != undefined && data[0][0].NetAssets != null) {
                            self.contract.push(data[0][0].NetAssets);
                        }
                        if (data[0][0].OfficeAddress != undefined && data[0][0].OfficeAddress != null) {
                            self.contract.push(data[0][0].OfficeAddress);
                        }
                        if (data[0][0].OfflineAccount_AccountName != undefined && data[0][0].OfflineAccount_AccountName != null) {
                            self.contract.push(data[0][0].OfflineAccount_AccountName);
                        }
                        if (data[0][0].OfflineAccount_AccountNo != undefined && data[0][0].OfflineAccount_AccountNo != null) {
                            self.contract.push(data[0][0].OfflineAccount_AccountNo);
                        }
                        if (data[0][0].OfflineAccount_LargePaymentNo != undefined && data[0][0].OfflineAccount_LargePaymentNo != null) {
                            self.contract.push(data[0][0].OfflineAccount_LargePaymentNo);
                        }
                        if (data[0][0].OfflineAccount_OpenBank != undefined && data[0][0].OfflineAccount_OpenBank != null) {
                            self.contract.push(data[0][0].OfflineAccount_OpenBank);
                        }
                        if (data[0][0].OnlineAccount_ManagedUnitCode != undefined && data[0][0].OnlineAccount_ManagedUnitCode != null) {
                            self.contract.push(data[0][0].OnlineAccount_ManagedUnitCode);
                        }
                        if (data[0][0].OnlineAccount_RegistrationOrApprovalNo != undefined && data[0][0].OnlineAccount_RegistrationOrApprovalNo != null) {
                            self.contract.push(data[0][0].OnlineAccount_RegistrationOrApprovalNo);
                        }
                        if (data[0][0].OnlineAccount_SecuritiesAccountNo != undefined && data[0][0].OnlineAccount_SecuritiesAccountNo != null) {
                            self.contract.push(data[0][0].OnlineAccount_SecuritiesAccountNo);
                        }
                        if (data[0][0].Phone != undefined && data[0][0].Phone != null) {
                            self.contract.push(data[0][0].Phone);
                        }
                        if (data[0][0].ZipCode != undefined && data[0][0].ZipCode != null) {
                            self.contract.push(data[0][0].ZipCode);
                        }

                        if (data[1][0].AccountNo != undefined && data[1][0].AccountNo != null) {
                            self.EnclosureMechanism.push(data[1][0].AccountNo);
                        }
                        if (data[1][0].ActuallyControlNaturalPerson != undefined && data[1][0].ActuallyControlNaturalPerson != null) {
                            self.EnclosureMechanism.push(data[1][0].ActuallyControlNaturalPerson);
                        }
                        if (data[1][0].Address != undefined && data[1][0].Address != null) {
                            self.EnclosureMechanism.push(data[1][0].Address);
                        }
                        if (data[1][0].AuthorizedRepresentativeAddress != undefined && data[1][0].AuthorizedRepresentativeAddress != null) {
                            self.EnclosureMechanism.push(data[1][0].AuthorizedRepresentativeAddress);
                        }
                        if (data[1][0].AuthorizedRepresentativeID != undefined && data[1][0].AuthorizedRepresentativeID != null) {
                            self.EnclosureMechanism.push(data[1][0].AuthorizedRepresentativeID);
                        }
                        if (data[1][0].AuthorizedRepresentativeIDExpiry != undefined && data[1][0].AuthorizedRepresentativeIDExpiry != null) {
                            self.EnclosureMechanism.push(data[1][0].AuthorizedRepresentativeIDExpiry);
                        }
                        if (data[1][0].AuthorizedRepresentativeIDType != undefined && data[1][0].AuthorizedRepresentativeIDType != null) {
                            self.EnclosureMechanism.push(data[1][0].AuthorizedRepresentativeIDType);
                        }
                        if (data[1][0].AuthorizedRepresentativeMobile != undefined && data[1][0].AuthorizedRepresentativeMobile != null) {
                            self.EnclosureMechanism.push(data[1][0].AuthorizedRepresentativeMobile);
                        }
                        if (data[1][0].AuthorizedRepresentativeName != undefined && data[1][0].AuthorizedRepresentativeName != null) {
                            self.EnclosureMechanism.push(data[1][0].AuthorizedRepresentativeName);
                        }
                        if (data[1][0].AuthorizedRepresentativePhone != undefined && data[1][0].AuthorizedRepresentativePhone != null) {
                            self.EnclosureMechanism.push(data[1][0].AuthorizedRepresentativePhone);
                        }
                        if (data[1][0].AuthorizedRepresentativeZipCode != undefined && data[1][0].AuthorizedRepresentativeZipCode != null) {
                            self.EnclosureMechanism.push(data[1][0].AuthorizedRepresentativeZipCode);
                        }
                        if (data[1][0].BusinessScope != undefined && data[1][0].BusinessScope != null) {
                            self.EnclosureMechanism.push(data[1][0].BusinessScope);
                        }
                        if (data[1][0].ContactPhone != undefined && data[1][0].ContactPhone != null) {
                            self.EnclosureMechanism.push(data[1][0].ContactPhone);
                        }
                        if (data[1][0].Controller != undefined && data[1][0].Controller != null) {
                            self.EnclosureMechanism.push(data[1][0].Controller);
                        }
                        if (data[1][0].Email != undefined && data[1][0].Email != null) {
                            self.EnclosureMechanism.push(data[1][0].Email);
                        }
                        if (data[1][0].FillDate != undefined && data[1][0].FillDate != null) {
                            self.EnclosureMechanism.push(data[1][0].FillDate);
                        }
                        if (data[1][0].GuaranteedDate != undefined && data[1][0].GuaranteedDate != null) {
                            self.EnclosureMechanism.push(data[1][0].GuaranteedDate);
                        }
                        if (data[1][0].HomeAddress != undefined && data[1][0].HomeAddress != null) {
                            self.EnclosureMechanism.push(data[1][0].HomeAddress);
                        }
                        if (data[1][0].InstitutionName != undefined && data[1][0].InstitutionName != null) {
                            self.EnclosureMechanism.push(data[1][0].InstitutionName);
                        }
                        if (data[1][0].InstitutionZipCode != undefined && data[1][0].InstitutionZipCode != null) {
                            self.EnclosureMechanism.push(data[1][0].InstitutionZipCode);
                        }
                        if (data[1][0].IntegrityRecord != undefined && data[1][0].IntegrityRecord != null) {
                            self.EnclosureMechanism.push(data[1][0].IntegrityRecord);
                        }
                        if (data[1][0].InvestorName != undefined && data[1][0].InvestorName != null) {
                            self.EnclosureMechanism.push(data[1][0].InvestorName);
                        }
                        if (data[1][0].LegalRepresentativeID != undefined && data[1][0].LegalRepresentativeID != null) {
                            self.EnclosureMechanism.push(data[1][0].LegalRepresentativeID);
                        }
                        if (data[1][0].LegalRepresentativeIdExpiry != undefined && data[1][0].LegalRepresentativeIdExpiry != null) {
                            self.EnclosureMechanism.push(data[1][0].LegalRepresentativeIdExpiry);
                        }
                        if (data[1][0].LegalRepresentativeIdType != undefined && data[1][0].LegalRepresentativeIdType != null) {
                            self.EnclosureMechanism.push(data[1][0].LegalRepresentativeIdType);
                        }
                        if (data[1][0].LegalRepresentativeName != undefined && data[1][0].LegalRepresentativeName != null) {
                            self.EnclosureMechanism.push(data[1][0].LegalRepresentativeName);
                        }
                        if (data[1][0].LicenseExpiryInfo != undefined && data[1][0].LicenseExpiryInfo != null) {
                            self.EnclosureMechanism.push(data[1][0].LicenseExpiryInfo);
                        }
                        if (data[1][0].LicenseNo != undefined && data[1][0].LicenseNo != null) {
                            self.EnclosureMechanism.push(data[1][0].LicenseNo);
                        }
                        if (data[1][0].LicenseType != undefined && data[1][0].LicenseType != null) {
                            self.EnclosureMechanism.push(data[1][0].LicenseType);
                        }
                        if (data[1][0].OrganizationCode != undefined && data[1][0].OrganizationCode != null) {
                            self.EnclosureMechanism.push(data[1][0].OrganizationCode);
                        }
                        if (data[1][0].ReviewDate != undefined && data[1][0].ReviewDate != null) {
                            self.EnclosureMechanism.push(data[1][0].ReviewDate);
                        }
                        if (data[1][0].TaxRegistrationCertificate != undefined && data[1][0].TaxRegistrationCertificate != null) {
                            self.EnclosureMechanism.push(data[1][0].TaxRegistrationCertificate);
                        }
                        if (data[1][0].TransactionBeneficiaries != undefined && data[1][0].TransactionBeneficiaries != null) {
                            self.EnclosureMechanism.push(data[1][0].TransactionBeneficiaries);
                        }

                        if (data[2][0].AccountNo != undefined && data[2][0].AccountNo != null) {
                            self.EnclosureProduct.push(data[2][0].AccountNo);
                        }
                        if (data[2][0].ActualControlRelationship != undefined && data[2][0].ActualControlRelationship != null) {
                            self.EnclosureProduct.push(data[2][0].ActualControlRelationship);
                        }
                        if (data[2][0].ActualControlRelationshipDescription != undefined && data[2][0].ActualControlRelationshipDescription != null) {
                            self.EnclosureProduct.push(data[2][0].ActualControlRelationshipDescription);
                        }
                        if (data[2][0].AuthorizedManagerAge != undefined && data[2][0].AuthorizedManagerAge != null) {
                            self.EnclosureProduct.push(data[2][0].AuthorizedManagerAge);
                        }
                        if (data[2][0].AuthorizedManagerEmail != undefined && data[2][0].AuthorizedManagerEmail != null) {
                            self.EnclosureProduct.push(data[2][0].AuthorizedManagerEmail);
                        }
                        if (data[2][0].AuthorizedManagerID != undefined && data[2][0].AuthorizedManagerID != null) {
                            self.EnclosureProduct.push(data[2][0].AuthorizedManagerID);
                        }
                        if (data[2][0].AuthorizedManagerIDExpiryInfo != undefined && data[2][0].AuthorizedManagerIDExpiryInfo != null) {
                            self.EnclosureProduct.push(data[2][0].AuthorizedManagerIDExpiryInfo);
                        }
                        if (data[2][0].AuthorizedManagerIDType != undefined && data[2][0].AuthorizedManagerIDType != null) {
                            self.EnclosureProduct.push(data[2][0].AuthorizedManagerIDType);
                        }
                        if (data[2][0].AuthorizedManagerMoblePhone != undefined && data[2][0].AuthorizedManagerMoblePhone != null) {
                            self.EnclosureProduct.push(data[2][0].AuthorizedManagerMoblePhone);
                        }
                        if (data[2][0].AuthorizedManagerName != undefined && data[2][0].AuthorizedManagerName != null) {
                            self.EnclosureProduct.push(data[2][0].AuthorizedManagerName);
                        }
                        if (data[2][0].AuthorizedManagerOfficeAddress != undefined && data[2][0].AuthorizedManagerOfficeAddress != null) {
                            self.EnclosureProduct.push(data[2][0].AuthorizedManagerOfficeAddress);
                        }
                        if (data[2][0].AuthorizedManagerPosition != undefined && data[2][0].AuthorizedManagerPosition != null) {
                            self.EnclosureProduct.push(data[2][0].AuthorizedManagerPosition);
                        }
                        if (data[2][0].AuthorizedManagerSex != undefined && data[2][0].AuthorizedManagerSex != null) {
                            self.EnclosureProduct.push(data[2][0].AuthorizedManagerSex);
                        }
                        if (data[2][0].AuthorizedManagerTel != undefined && data[2][0].AuthorizedManagerTel != null) {
                            self.EnclosureProduct.push(data[2][0].AuthorizedManagerTel);
                        }
                        if (data[2][0].AuthorizedManagerZipcode != undefined && data[2][0].AuthorizedManagerZipcode != null) {
                            self.EnclosureProduct.push(data[2][0].AuthorizedManagerZipcode);
                        }
                        if (data[2][0].BadIntegrityRecords != undefined && data[2][0].BadIntegrityRecords != null) {
                            self.EnclosureProduct.push(data[2][0].BadIntegrityRecords);
                        }
                        if (data[2][0].BadIntegrityRecordsDescription != undefined && data[2][0].BadIntegrityRecordsDescription != null) {
                            self.EnclosureProduct.push(data[2][0].BadIntegrityRecordsDescription);
                        }
                        if (data[2][0].BusinessScope != undefined && data[2][0].BusinessScope != null) {
                            self.EnclosureProduct.push(data[2][0].BusinessScope);
                        }
                        if (data[2][0].ControllingShareholder != undefined && data[2][0].ControllingShareholder != null) {
                            self.EnclosureProduct.push(data[2][0].ControllingShareholder);
                        }
                        if (data[2][0].EstablishedDate != undefined && data[2][0].EstablishedDate != null) {
                            self.EnclosureProduct.push(data[2][0].EstablishedDate);
                        }
                        if (data[2][0].FillDate != undefined && data[2][0].FillDate != null) {
                            self.EnclosureProduct.push(data[2][0].FillDate);
                        }
                        if (data[2][0].InstitutionID != undefined && data[2][0].InstitutionID != null) {
                            self.EnclosureProduct.push(data[2][0].InstitutionID);
                        }
                        if (data[2][0].InstitutionIDExpiryInfo != undefined && data[2][0].InstitutionIDExpiryInfo != null) {
                            self.EnclosureProduct.push(data[2][0].InstitutionIDExpiryInfo);
                        }
                        if (data[2][0].InstitutionIDType != undefined && data[2][0].InstitutionIDType != null) {
                            self.EnclosureProduct.push(data[2][0].InstitutionIDType);
                        }
                        if (data[2][0].InstitutionQualificationCertificate != undefined && data[2][0].InstitutionQualificationCertificate != null) {
                            self.EnclosureProduct.push(data[2][0].InstitutionQualificationCertificate);
                        }
                        if (data[2][0].InstitutionQualificationCertificateID != undefined && data[2][0].InstitutionQualificationCertificateID != null) {
                            self.EnclosureProduct.push(data[2][0].InstitutionQualificationCertificateID);
                        }
                        if (data[2][0].InstitutionType != undefined && data[2][0].InstitutionType != null) {
                            self.EnclosureProduct.push(data[2][0].InstitutionType);
                        }
                        if (data[2][0].InvestorName != undefined && data[2][0].InvestorName != null) {
                            self.EnclosureProduct.push(data[2][0].InvestorName);
                        }
                        if (data[2][0].ManagerName != undefined && data[2][0].ManagerName != null) {
                            self.EnclosureProduct.push(data[2][0].ManagerName);
                        }
                        if (data[2][0].OfficeAddress != undefined && data[2][0].OfficeAddress != null) {
                            self.EnclosureProduct.push(data[2][0].OfficeAddress);
                        }
                        if (data[2][0].ProductCategory != undefined && data[2][0].ProductCategory != null) {
                            self.EnclosureProduct.push(data[2][0].ProductCategory);
                        }
                        if (data[2][0].ProductCustodian != undefined && data[2][0].ProductCustodian != null) {
                            self.EnclosureProduct.push(data[2][0].ProductCustodian);
                        }
                        if (data[2][0].ProductDuration != undefined && data[2][0].ProductDuration != null) {
                            self.EnclosureProduct.push(data[2][0].ProductDuration);
                        }
                        if (data[2][0].ProductManager != undefined && data[2][0].ProductManager != null) {
                            self.EnclosureProduct.push(data[2][0].ProductManager);
                        }
                        if (data[2][0].ProductName != undefined && data[2][0].ProductName != null) {
                            self.EnclosureProduct.push(data[2][0].ProductName);
                        }
                        if (data[2][0].ProductScale != undefined && data[2][0].ProductScale != null) {
                            self.EnclosureProduct.push(data[2][0].ProductScale);
                        }
                        if (data[2][0].ProductType != undefined && data[2][0].ProductType != null) {
                            self.EnclosureProduct.push(data[2][0].ProductType);
                        }
                        if (data[2][0].RegisteredAddress != undefined && data[2][0].RegisteredAddress != null) {
                            self.EnclosureProduct.push(data[2][0].RegisteredAddress);
                        }
                        if (data[2][0].RegisteredCapital != undefined && data[2][0].RegisteredCapital != null) {
                            self.EnclosureProduct.push(data[2][0].RegisteredCapital);
                        }
                        if (data[2][0].RegistrationAgency != undefined && data[2][0].RegistrationAgency != null) {
                            self.EnclosureProduct.push(data[2][0].RegistrationAgency);
                        }
                        if (data[2][0].RegistrationDate != undefined && data[2][0].RegistrationDate != null) {
                            self.EnclosureProduct.push(data[2][0].RegistrationDate);
                        }
                        if (data[2][0].RegistrationID != undefined && data[2][0].RegistrationID != null) {
                            self.EnclosureProduct.push(data[2][0].RegistrationID);
                        }
                        if (data[2][0].TransactionBeneficiaries != undefined && data[2][0].TransactionBeneficiaries != null) {
                            self.EnclosureProduct.push(data[2][0].TransactionBeneficiaries);
                        }
                        if (data[2][0].TransactionBeneficiariesDescription != undefined && data[2][0].TransactionBeneficiariesDescription != null) {
                            self.EnclosureProduct.push(data[2][0].TransactionBeneficiariesDescription);
                        }
                        if (data[2][0].relationship != undefined && data[2][0].relationship != null) {
                            self.EnclosureProduct.push(data[2][0].relationship);
                        }
                    },
                    error: function (data) {
                        alert('getProductTypeCategory Error !');
                    }
                });
            },
        }
    })
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







})











