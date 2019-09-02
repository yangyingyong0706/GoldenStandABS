define(function (require) {
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
    var TrustId = common.getQueryString('TrustId');
    var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
    new Vue({
        el: '#app',
        data: {
            cashFileName: '',
            cashDate: '',
            cashFlowTableData: [

                //EndDate: null,
                //InterestAmount: null,
                //PrincipalAmount: null,
                //isEdit:true
            ],
            bondDataDate: '',
            bondPackDate: '',
            trustEndDate: '',
            bondNum: 0,
            bondInfoTableData: [
                //intrestRate: 0,
                //releasePeriod: 0,
                //releaseAmount: 0,
                //bondLevel: 0,
                //isEdit:true
            ],
            loading: true,
            CashflowXMLTmp: ['<Cashflow>',
                               '<TrustId>{0}</TrustId>',
                               '<StartDate>{1}</StartDate>',
                               '<EndDate>{2}</EndDate>',
                               '<PrincipalAmount>{3}</PrincipalAmount>',
                               '<InterestAmount>{4}</InterestAmount>',
                               '<PrincipalFromTopUp>{5}</PrincipalFromTopUp>',
                               '<InterestFromTopUp>{6}</InterestFromTopUp>',
                               '<Purpose>{7}</Purpose>',
                               '<ReportingDate>{8}</ReportingDate>',
                               '<PoolId>{9}</PoolId>',
                               '<ScheduleDateId>{10}</ScheduleDateId>',
                           '</Cashflow>'].join(''),
            CalculationSetupXMLTmp: ['<Calculation>',
                            '<DimReportingDate>{0}</DimReportingDate>',
                            '<PoolCloseDate>{1}</PoolCloseDate>',
                            '<TrustClosureDate>{2}</TrustClosureDate>',
                            '</Calculation>'].join(''),
            BondSetupXMlTmp: [
            '<Bond>',
            '<BondCode>{0}</BondCode>',
            '<IRR>{1}</IRR>',
            '<WAL>{2}</WAL>',
            '<OfferAmount>{3}</OfferAmount>',
            '<BondClass>{4}</BondClass>',
            '</Bond>',
            ].join(''),

        },
        mounted: function () {
            var self = this;
            var executeParam = {
                SPName: 'usp_GetScheduleBond', SQLParams: [
                    { Name: 'trustId', value: TrustId, DBType: 'string' },
                    { Name: 'reportingDate', value: $('#txtRDate').val(), DBType: 'string' },
                    { Name: 'scheduleDateId', value: 20180626, DBType: 'string' }
                ]
            };

            common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (res) {

                var tmp = {
                    StartDate: "",
                    EndDate: '',
                    InterestAmount: '',
                    PrincipalAmount: '',
                    isEdit: false
                }
                $.each(res, function (i, v) {
                    v.StartDate = self.changeTimeStamp(v.StartDate.replace("/Date(", "").replace(")/", ""), 'string');
                    v.EndDate = self.changeTimeStamp(v.EndDate.replace("/Date(", "").replace(")/", ""), 'string');
                    tmp.StartDate = v.StartDate;
                    tmp.EndDate = v.EndDate;
                    tmp.InterestAmount = v.InterestAmount;
                    tmp.PrincipalAmount = v.PrincipalAmount;
                    self.cashFlowTableData.push(JSON.parse(JSON.stringify(tmp)))
                })
                console.log(self.$refs)
                console.log($('.date-plugins'))

                self.$nextTick(function () {
                    $(self.$refs.date).date_input()
                })
                self.loading = false
                //self.cashFlowTableData = res
            })
        },
        methods: {
            delTableItem: function (type, index) {
                var self = this;

                if (type == 'cash') {
                    $.each(this.cashFlowTableData, function (i, v) {
                        if (i == index) {
                            self.cashFlowTableData.remove(v)
                        }
                    })
                } else {
                    $.each(this.bondInfoTableData, function (i, v) {
                        if (i == index) {
                            self.bondInfoTableData.remove(v)
                        }
                    })
                }

            },
            //addDelItem: function (type, flag) {
            //    var self = this;

            //    var tmp = {
            //        StartDate: "",
            //        EndDate: '',
            //        InterestAmount: '',
            //        PrincipalAmount: '',
            //        isEdit: false
            //    }
            //    var tmp2 = {
            //        intrestRate: 0,
            //        releasePeriod: 0,
            //        releaseAmount: 0,
            //        bondLevel: '',
            //        isEdit: true
            //    }
            //    if (type == 'cash') {
            //        flag == 1 ? this.cashFlowTableData.push(JSON.parse(JSON.stringify(tmp))) : this.cashFlowTableData.splice(this.cashFlowTableData.length - 1, 1)
            //    } else {
            //        flag == 1 ? self.bondNum++ : self.bondNum--
            //    }

            //},
            toggleEdit: function (type, index) {
                var self = this;
                if (type == 'cash') {
                    $.each(this.cashFlowTableData, function (i, v) {
                        if (i == index) {
                            v.isEdit = !v.isEdit
                            $('.date-plugins').off('change').change(function () {
                                $(this).data('id') == 'start' ? v.StartDate = $(this).val() : v.EndDate = $(this).val()
                            })
                        }
                    })
                } else {
                    $.each(this.bondInfoTableData, function (i, v) {
                        if (i == index) {
                            v.isEdit = !v.isEdit
                        }
                    })
                }
                console.log(this.cashFlowTableData)
            },
            //时间戳转换成指定类型（int:20151103,string:2015-11-03）
            changeTimeStamp: function (time, model) {
                var datetime = new Date();
                datetime.setTime(time);
                var year = datetime.getFullYear();
                var month = datetime.getMonth() + 1 < 10 ? "0" + (datetime.getMonth() + 1) : datetime.getMonth() + 1;
                var day = datetime.getDate();
                var result;
                if (model.toLowerCase() == 'int') {
                    result = year * 10000 + month * 100 + day
                } else if (model.toLowerCase() == 'string') {
                    result = year + "-" + month + "-" + (day < 10 ? '0' + day : day);
                }
                return result;
            },
            //SubmitFormU: function () {
            //    var self = this;
            //    var isFormFieldsAllValid = true;
            //    $(' .cashFlowInput .form-control').each(function () {
            //        if (!common.CommonValidation.ValidControlValue($(this))) isFormFieldsAllValid = false;
            //    });
            //    if (!isFormFieldsAllValid) return false;
            //    //var filePath = $('#fileUploadFileU').val();
            //    var fileName = filePath.substring(filePath.lastIndexOf('\\') + 1);
            //    //UploadFile('fileUploadFileU', fileName, 'PoolImportData', function (d) {
            //    //    self.RunTaskU(d.FileUploadResult);
            //    //});
            //},
            RunTaskU: function (sourceFilePath) {
                var self = this;
                self.cashDate = $('#txtRDate').val();
                var reportingDate = $('#txtRDate').val();
                sVariableBuilder.AddVariableItem('ReportingDate', reportingDate, 'String', 1, 0, 0);
                sVariableBuilder.AddVariableItem('FilePath', sourceFilePath, 'String', 0, 0, 0);
                sVariableBuilder.AddVariableItem('TrustId', TrustId, 'String', 0, 0, 0);
                sVariableBuilder.AddVariableItem('DBName', 'TrustManagement', 'String', 0, 0, 0);
                sVariableBuilder.AddVariableItem('DBServer', 'mssql', 'String', 0, 0, 0);
                var myDate = new Date();
                var SchelDate = myDate.getFullYear().toString() + ('0' + (myDate.getMonth() + 1).toString()).slice(-2) + ('0' + (myDate.getDate().toString())).slice(-2);
                //////////
                var schedulePurposeKey = TrustId + '_SchedulePurpose';
                var scheduleDateIdKey = TrustId + '_ScheduleDateId';
                webStore.setItem(schedulePurposeKey, 0);
                webStore.setItem(scheduleDateIdKey, SchelDate);

                /////////

                sVariableBuilder.AddVariableItem('ScheduleDateId', SchelDate, 'String', 0, 0, 0);
                sVariableBuilder.AddVariableItem('ReportingDateId', reportingDate.replace(new RegExp("-", "gm"), ""), 'String', 0, 0, 0);

                var sVariable = sVariableBuilder.BuildVariables();

                var tIndicator = new taskIndicator({
                    width: 900,
                    height: 550,
                    clientName: 'TaskProcess',
                    appDomain: 'ConsumerLoan',
                    taskCode: 'QuicklyImportAssert',
                    sContext: sVariable,
                    callback: function () {
                        sVariableBuilder.ClearVariableItem();


                        //$ = require('jquery')
                        //$('#OrganisationCodeU').attr('disabled', false);
                        //$('#AssetTypeU').attr('disabled', false);
                        //$('#dcAssetType').attr('disabled', false);
                        //$('#AssetType').attr('disabled', false);
                        //$('#OrganisationCode').attr('disabled', false);

                    }
                });
                tIndicator.show();
            },
            //saveCashFlowInfo: function () {
            //    var self = this;
            //    self.saveCashFlowPro()

            //},
            //saveCashFlowPro: function () {
            //    var self = this;
            //    var today = self.changeTimeStamp(new Date().getTime(), 'int')
            //    var CashflowXML = ''

            //    $.each(self.cashFlowTableData, function (i, v) {
            //        CashflowXML += self.CashflowXMLTmp.format(TrustId,
            //            v.StartDate,
            //            v.EndDate,
            //            v.PrincipalAmount,
            //            v.InterestAmount,
            //            0,
            //            0,
            //            0,
            //            self.cashDate,
            //            -1,
            //            today)
            //    })
            //    CashflowXML = '<Cashflows>' + CashflowXML + '</Cashflows>'
            //    console.log(CashflowXML)
            //    var executeParam = {
            //        SPName: 'TrustManagement.usp_InsertPaymentScheduleImutation', SQLParams: [
            //            { Name: 'trustId', value: TrustId, DBType: 'int' },
            //            { Name: 'reportingDate', value: '2018-06-05', DBType: 'string' },
            //            { Name: 'CashflowXML', value: CashflowXML, DBType: 'xml' }
            //        ]
            //    };
            //    self.ExecuteRemoteData(executeParam, function (res) {
            //        console.log(1)
            //        var executeParam2 = {
            //            SPName: 'usp_InsertPeriodByImutation', SQLParams: [
            //                { Name: 'TrustId', value: TrustId, DBType: 'int' },
            //                { Name: 'reportingDate', value: '2018-06-05', DBType: 'string' },
            //                { Name: 'ScheduleDateId', value: today, DBType: 'int' },
            //                { Name: 'ReportingDateId', value: 20180605, DBType: 'int' }
            //                //{ Name: 'ReportingDateId', value: Number(self.cashDate.replace(/-/g,'-')), DBType: 'int' }
            //            ]
            //        };

            //        common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam2, function (res) {


            //        })
            //    })
            //},
            //封装一个请求方法
            ExecuteRemoteData: function (executeParam, callback) {
                var svcUrl = GlobalVariable.DataProcessServiceUrl + "ExecuteDataTable";
                var postData = { connectionName: 'TrustManagement', param: encodeURIComponent(JSON.stringify(executeParam)) }
                $.ajax({
                    url: svcUrl,
                    async: false,
                    type: "POST",
                    dataType: "json",
                    contentType: "application/json;charset=utf-8",
                    data: JSON.stringify(postData),
                    success: function (res) {
                        if (callback && typeof callback === 'function') {
                            callback(JSON.parse(res));
                        }
                    },
                    error: function (msg) {
                        console.error(msg);
                    }
                });
            },
            runDesign: function () {
                var self = this;

                var CalculationSetupXML = '',
                    BondSetupXMl = '';
                CalculationSetupXML = self.CalculationSetupXMLTmp.format(self.bondDataDate, self.bondPackDate, self.trustEndDate);
                $.each(self.bondInfoTableData, function (i, v) {
                    BondSetupXMl += self.CashflowXMLTmp.format(
                        i + 1,
                        v.intrestRate,
                        v.releasePeriod,
                        v.releasePeriod,
                        v.bondLevel)
                })
                BondSetupXMl = '<Bonds>' + BondSetupXMl + '</Bonds>'
                var executeParam = {
                    SPName: 'TrustManagement.usp_InsertBondDesign', SQLParams: [
                        { Name: 'trustId', value: TrustId, DBType: 'int' },
                        { Name: 'CalculationSetupXML', value: CalculationSetupXML, DBType: 'xml' },
                        { Name: 'BondSetupXMl', value: BondSetupXMl, DBType: 'xml' }
                    ]
                };
                self.ExecuteRemoteData(executeParam, function (res) {
                })
            }
        },
        watch: {
            bondNum: function () {
                var bonNum = Number(this.bondNum);
                var diffNum = Number(this.bondNum) - this.bondInfoTableData.length
                var tmp = {
                    intrestRate: 0,
                    releasePeriod: 0,
                    releaseAmount: 0,
                    bondLevel: '',
                    isEdit: true
                }
                if (diffNum > 0) {
                    for (i = 0; i < diffNum; i++) {
                        this.bondInfoTableData.push(JSON.parse(JSON.stringify(tmp)))
                    }
                } else {
                    this.bondInfoTableData.splice(bonNum, this.bondInfoTableData.length)
                }
            }
        }
    })
    $('.date-plugins').date_input()
    //$("#fileUploadFileU").change(function () {
    //    var val = $(this).val();
    //    if (val !== '') {
    //        val = val.substring(val.lastIndexOf('\\') + 1);
    //        $('.file_name').addClass('filed').text(val).css({ "borderColor": '#ccc' });

    //    } else {
    //        $('.file_name').removeClass('filed').text('暂未选择文件').css({ "borderColor": 'red' })
    //    }

    //})

    $('.form-control').change(function () {
        common.CommonValidation.ValidControlValue($(this));
    });
    /////////////
    //var SubmitFormU = function () {
    //    var isFormFieldsAllValid = true;
    //    $(' .form-control').each(function () {
    //        if (!common.CommonValidation.ValidControlValue($(this))) isFormFieldsAllValid = false;
    //    });
    //    if (!isFormFieldsAllValid) return false;
    //    var filePath = $('#fileUploadFileU').val();
    //    var fileName = filePath.substring(filePath.lastIndexOf('\\') + 1);
    //    UploadFile('fileUploadFileU', fileName, 'PoolImportData', function (d) {
    //        RunTaskU(d.FileUploadResult);
    //    });
    //}

    ////////////

    // function RunTaskU(sourceFilePath) {


    //     var reportingDate = $('#txtRDate').val();

    //     sVariableBuilder.AddVariableItem('ReportingDate', reportingDate, 'String', 1, 0, 0);
    //     sVariableBuilder.AddVariableItem('FilePath', sourceFilePath, 'String', 0, 0, 0);
    //     sVariableBuilder.AddVariableItem('TrustId', TrustId, 'String', 0, 0, 0);
    //     sVariableBuilder.AddVariableItem('DBName', 'TrustManagement', 'String', 0, 0, 0);
    //     sVariableBuilder.AddVariableItem('DBServer', 'mssql', 'String', 0, 0, 0);

    //     var myDate = new Date();
    //     var SchelDate = myDate.getFullYear().toString() + ('0' + (myDate.getMonth() + 1).toString()).slice(-2) + ('0' + (myDate.getDate().toString())).slice(-2);
    //     //////////
    //     var schedulePurposeKey = TrustId + '_SchedulePurpose';
    //     var scheduleDateIdKey = TrustId + '_ScheduleDateId';
    //     webStore.setItem(schedulePurposeKey, 0);
    //     webStore.setItem(scheduleDateIdKey, SchelDate);

    //     /////////

    //     sVariableBuilder.AddVariableItem('ScheduleDateId', SchelDate, 'String', 0, 0, 0);
    //     sVariableBuilder.AddVariableItem('ReportingDateId', reportingDate.replace(new RegExp("-", "gm"), ""), 'String', 0, 0, 0);

    //     var sVariable = sVariableBuilder.BuildVariables();

    //     var tIndicator = new taskIndicator({
    //         width: 900,
    //         height: 550,
    //         clientName: 'TaskProcess',
    //         appDomain: 'ConsumerLoan',
    //         taskCode: 'QuicklyImportAssert',
    //         sContext: sVariable,
    //         callback: function () {
    //             sVariableBuilder.ClearVariableItem();
    //             //$ = require('jquery')
    //             //$('#OrganisationCodeU').attr('disabled', false);
    //             //$('#AssetTypeU').attr('disabled', false);
    //             //$('#dcAssetType').attr('disabled', false);
    //             //$('#AssetType').attr('disabled', false);
    //             //$('#OrganisationCode').attr('disabled', false);

    //         }
    //     });
    //     tIndicator.show();

    // }

})