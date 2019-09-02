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
    require('jquery.localizationTool');
    webStorage = require('gs/webStorage');

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


            'id:crash': {
                'en_GB': 'Cash flow import'
            },
            'id:loadFile': {
                'en_GB': 'upload files'
            },
            'id:chooseFile': {
                'en_GB': 'Select File'
            },
            'id:noFile': {
                'en_GB': 'No file selected yet'
            },
            'id:date_ail1': {
                'en_GB': 'Date'
            },
            'id:upload_ail': {
                'en_GB': 'Upload'
            },
            'id:tab1': {
                'en_GB': 'Serial number'
            },
            'id:tab2': {
                'en_GB': 'Start date'
            },
            'id:tab3': {
                'en_GB': 'End date'
            },
            'id:tab4': {
                'en_GB': 'Interest'
            },
            'id:tab5': {
                'en_GB': 'Principal'
            },
            'id:tab6': {
                'en_GB': 'Operating'
            },
            'id:del': {
                'en_GB': 'Delete'
            },
            'id:edit': {
                'en_GB': 'Edit'
            },
            'id:info1': {
                'en_GB': 'Please upload cash flow or manually edit cash flow'
            },
            'id:confirm': {
                'en_GB': 'Save'
            },
            'id:title': {
                'en_GB': 'Bond design information'
            },
            'id:date_ail2': {
                'en_GB': 'Data date'
            },
            'id:date_ail3': {
                'en_GB': 'Package date'
            },
            'id:date_ail4': {
                'en_GB': 'Special plan end date'
            },
            'id:level': {
                'en_GB': 'Number of bonds'
            },
            'id:list1': {
                'en_GB': 'Serial number'
            },
            'id:list2': {
                'en_GB': 'Bond issuance rate'
            },
            'id:list3': {
                'en_GB': 'Long issue period'
            },
            'id:list4': {
                'en_GB': 'Issue amount'
            },
            'id:list5': {
                'en_GB': 'Bond level'
            },
            'id:list6': {
                'en_GB': 'Operating'
            },
            'id:lab1': {
                'en_GB': 'Please choose'
            },
            'id:lab2': {
                'en_GB': 'Priority'
            },
            'id:lab3': {
                'en_GB': 'Secondary priority'
            },
            'id:lab4': {
                'en_GB': 'Secondary'
            },
            'id:del1': {
                'en_GB': 'Delete'
            },
            'id:edit1': {
                'en_GB': 'Edit'
            },
            'id:add': {
                'en_GB': 'Please add bond information'
            },
            'id:bond': {
                'en_GB': 'Inferred bond'
            },
            'id:cash': {
                'en_GB': 'Estimating cash flow'
            },
            'id:result': {
                'en_GB': 'Estimated result'
            },
            'id:code': {
                'en_GB': 'Bond code'
            },
            'id:click': {
                'en_GB': 'Click on the result of the operation to display the estimated data'
            }
        }
    });

    var userLanguage = webStorage.getItem('userLanguage');
    if (userLanguage) {
        $('#selectLanguageDropdown_qcl').localizationTool('translate', userLanguage);
    }
    $('body').show();
    var langx = {};
    if (userLanguage && userLanguage.indexOf('en') > -1) {
        langx.info1 = "Need to fill in the report date";
        langx.info2 = "Upload file not selected";
        langx.info3 = "No data, please add cash flow data";
        langx.info4 = "Saved successfully";
        langx.info5 = "The date of the package and the end date of the special plan are required.";
        langx.info6 = "Need bond information";
        langx.info7 = "Inferred results need to import cash flow or manually edit cash flow";
        langx.info8 = "No file selected yet!";
        langx.ok = 'Complete';
        langx.edit = 'Edit';
    } else {
        langx.info1 = "需要填写报告日期";
        langx.info2 = "未选择上传文件";
        langx.info3 = "无数据,请添加现金流数据";
        langx.info4 = "保存成功";
        langx.info5 = "需要封包日期以及专项计划结束日期.";
        langx.info6 = "需要债券信息";
        langx.info7 = "推算结果需要需要导入现金流或手动编辑现金流";
        langx.info8 = "暂未选择文件!";
        langx.ok = '完成';
        langx.edit = '编辑';

    }

    //分页组件
    Vue.component('vuepage', {
        template: '#page-template',
        name: 'vuepage',
        props: {
            cur: Number,
            interval: Number,
            griddata: Number
        },
        computed: {
            all: function () {
                if (this.griddata) {
                    return Math.ceil(this.griddata / this.interval)
                } else {
                    return
                }

            },
            indexs: function () {
                var left = 1
                var right = this.all
                var ar = []
                if (this.all >= 11) {
                    if (this.cur > 5 && this.cur < this.all - 4) {
                        left = this.cur - 5
                        right = this.cur + 4
                    } else {
                        if (this.cur <= 5) {
                            left = 1
                            right = 10
                        } else {
                            right = this.all
                            left = this.all - 9
                        }
                    }
                }
                while (left <= right) {
                    ar.push(left)
                    left++
                }
                if (ar[0] > 1) {
                    ar[0] = 1;
                    ar[1] = -1;
                }
                if (ar[ar.length - 1] < this.all) {
                    ar[ar.length - 1] = this.all;
                    ar[ar.length - 2] = 0;
                }
                return ar
            },

        },
        data: function () {
            return {
                curPage: this.cur,
                dataSource: this.griddata

            }
        },
        methods: {
            // 页码点击事件
            btnClick: function (data) {
                if (data < 1) return;
                if (data != this.curPage) {
                    this.curPage = data
                    this.$emit('listenclick', data)
                }
            },
            // 下一页
            nextPage: function (data) {
                if (this.curPage >= this.all) return;
                this.btnClick(this.curPage + 1);
            },
            // 上一页
            prvePage: function (data) {
                if (this.curPage <= 1) return;
                this.btnClick(this.curPage - 1);
            },
            // 设置按钮禁用样式
            setButtonClass: function (isNextButton) {
                if (isNextButton) {
                    return this.curPage >= this.all ? "page-button-disabled" : ""
                }
                else {
                    return this.curPage <= 1 ? "page-button-disabled" : ""
                }
            }
        }
    })
    new Vue({
        el: '#app',
        data: {
            Ok: langx.ok,
            Edit:langx.edit,
            curPage: 1,
            intervalPage: 5,
            showItemList: [],
            cashFileName: '',
            reportDate: '',
            cashFlowTableData: [],
            bondDataDate: '',
            bondPackDate: '',
            trustEndDate: '',
            bondNum: 0,
            bondInfoTableData: [],
            calculationData: [],
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

            self.loading = false
            $('#bondDataDate,#bondPackDate,#trustEndDate,#reportDate').change(function () {
                self[$(this).attr('id')] = $(this).val();
            })
            $('.cashFlowInfo').height(682)
            $('.bondDesign').height(682)

        },
        methods: {
            tableItemShow: function () { },
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
            addDelItem: function (type, flag) {
                var self = this;

                var tmp = {
                    StartDate: "",
                    EndDate: '',
                    InterestAmount: '',
                    PrincipalAmount: '',
                    isEdit: false
                }
                var tmp2 = {
                    intrestRate: 0,
                    releasePeriod: 0,
                    releaseAmount: 0,
                    bondLevel: '',
                    isEdit: true
                }
                if (type == 'cash') {
                    flag == 1 ? this.cashFlowTableData.push(JSON.parse(JSON.stringify(tmp))) : this.cashFlowTableData.splice(this.cashFlowTableData.length - 1, 1)
                } else {
                    flag == 1 ? self.bondNum++ : self.bondNum == 0 ? 0 : self.bondNum--;
                }

            },
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
            SubmitFormU: function () {
                var self = this;
                if (!$('#reportDate').val()) {
                    GSDialog.HintWindow(langx.info1);
                    return;
                }
                var isFormFieldsAllValid = true;
                $(' .cashFlowInput .form-control').each(function () {
                    if (!common.CommonValidation.ValidControlValue($(this))) isFormFieldsAllValid = false;
                });
                if (!isFormFieldsAllValid) {
                    GSDialog.HintWindow(langx.info2);
                    return false
                };
                var filePath = $('#fileUploadFileU').val();
                var fileName = filePath.substring(filePath.lastIndexOf('\\') + 1);
                UploadFile('fileUploadFileU', fileName, 'PoolImportData', function (d) {
                    self.RunTaskU(d.FileUploadResult);
                });
            },
            RunTaskU: function (sourceFilePath) {
                var self = this;
                self.reportDate = $('#reportDate').val();
                var reportingDate = $('#reportDate').val();
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

                        var today = self.changeTimeStamp(new Date().getTime(), 'int')
                        var executeParam = {
                            SPName: 'usp_GetScheduleBond', SQLParams: [
                                { Name: 'trustId', value: TrustId, DBType: 'string' },
                                { Name: 'reportingDate', value: $('#reportDate').val(), DBType: 'string' },
                                { Name: 'scheduleDateId', value: today, DBType: 'int' }
                            ]
                        };

                        common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (res) {
                            self.cashFlowTableData = [];
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
                            self.showList(1)
                            self.$nextTick(function () {
                                $(self.$refs.date).date_input()
                            })

                            //self.cashFlowTableData = res
                        })

                    }
                });
                tIndicator.show();
            },
            caculationBond: function () {

            },
            saveCashFlowInfo: function () {
                var self = this;
                self.saveCashFlowPro()

            },
            saveCashFlowPro: function () {
                var self = this;
                if (self.cashFlowTableData.length < 1) {
                    GSDialog.HintWindow(langx.info3);
                    return;
                }
                var today = self.changeTimeStamp(new Date().getTime(), 'int')
                var CashflowXML = ''

                $.each(self.cashFlowTableData, function (i, v) {
                    CashflowXML += self.CashflowXMLTmp.format(TrustId,
                        v.StartDate,
                        v.EndDate,
                        v.PrincipalAmount,
                        v.InterestAmount,
                        0,
                        0,
                        0,
                        self.reportDate,
                        -1,
                        today)
                })
                CashflowXML = '<Cashflows>' + CashflowXML + '</Cashflows>'
                var executeParam = {
                    SPName: 'TrustManagement.usp_InsertPaymentScheduleImutation', SQLParams: [
                        { Name: 'trustId', value: TrustId, DBType: 'int' },
                        { Name: 'reportingDate', value: $('#reportDate').val(), DBType: 'string' },
                        { Name: 'CashflowXML', value: CashflowXML, DBType: 'xml' }
                    ]
                };
                self.ExecuteRemoteData(executeParam, function (res) {
                    var executeParam2 = {
                        SPName: 'usp_InsertPeriodByImutation', SQLParams: [
                            { Name: 'TrustId', value: TrustId, DBType: 'int' },
                            { Name: 'reportingDate', value: $('#reportDate').val(), DBType: 'string' },
                            { Name: 'ScheduleDateId', value: today, DBType: 'int' },
                            { Name: 'ReportingDateId', value: Number($('#reportDate').val().replace(/-/g, '')), DBType: 'int' }
                            //{ Name: 'ReportingDateId', value: Number(self.reportDate.replace(/-/g,'-')), DBType: 'int' }
                        ]
                    };

                    common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam2, function (res) {
                        GSDialog.HintWindow(lang.info4);

                    })
                })
            },
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
                var bondPackDate = $('#bondPackDate').val(),
                    trustEndDate = $('#trustEndDate').val(),
                    cashflowLenth = self.cashFlowTableData.length;
                if (!bondPackDate || !trustEndDate) {
                    GSDialog.HintWindow(langx.info5);
                    return;
                }
                if (self.bondNum < 1) {
                    GSDialog.HintWindow(langx.info6);
                    return;
                }
                if (cashflowLenth < 1) {
                    GSDialog.HintWindow(langx.info7);
                    return;
                }
                var CalculationSetupXML = '',
                    BondSetupXMl = '';
                CalculationSetupXML = self.CalculationSetupXMLTmp.format($('#bondDataDate').val()//(new Date()).dateFormat('yyyy-MM-dd')
                    /* 数据日期约定为当天日期$*/, bondPackDate, trustEndDate);
                $.each(self.bondInfoTableData, function (i, v) {
                    BondSetupXMl += self.BondSetupXMlTmp.format(
                        i + 1,
                        v.intrestRate,
                        v.releasePeriod,
                        v.releaseAmount,
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
                    var today = self.changeTimeStamp(new Date().getTime(), 'int')
                    sVariableBuilder.AddVariableItem('TrustID', TrustId, 'String', 1, 0, 0);
                    sVariableBuilder.AddVariableItem('ScheduleDateId', today, 'String', 0, 0, 0);
                    var sVariable = sVariableBuilder.BuildVariables();
                    var tIndicator = new taskIndicator({
                        width: 900,
                        height: 550,
                        clientName: 'TaskProcess',
                        appDomain: 'Task',
                        taskCode: 'DynamicDesignPlan',
                        sContext: sVariable,
                        callback: function () {
                            sVariableBuilder.ClearVariableItem();
                            self.calculationData = [];
                            var param = {
                                SPName: 'usp_GetCalculateBond', SQLParams: [
                                    { Name: 'trustId', value: TrustId, DBType: 'string' }
                                ]
                            };

                            common.ExecuteGetData(false, svcUrl, 'TrustManagement', param, function (data) {
                                var tmp = {
                                    BondCode: '',
                                    IRR: '',
                                    WAL: '',
                                    NPV: ''
                                }
                                $.each(data, function (i, v) {
                                    tmp.BondCode = v.BondCode;
                                    tmp.IRR = v.IRR;
                                    tmp.WAL = v.WAL;
                                    tmp.NPV = v.NPV;
                                    self.calculationData.push(JSON.parse(JSON.stringify(tmp)))
                                })

                                self.$nextTick(function () {
                                    $(self.$refs.date).date_input()
                                })
                            })
                        }
                    });
                    tIndicator.show();
                })
            },
            //推算现金流功能
            runInferCashFlow: function () {
                var self = this;
                var bondPackDate = $('#bondPackDate').val(),
                    trustEndDate = $('#trustEndDate').val();
                if (!bondPackDate || !trustEndDate) {
                    GSDialog.HintWindow(lang.info5);
                    return;
                }
                if (self.bondNum < 1) {
                    GSDialog.HintWindow(langx.info6);
                    return;
                }
                var CalculationSetupXML = '',
                    BondSetupXMl = '';
                CalculationSetupXML = self.CalculationSetupXMLTmp.format($('#bondDataDate').val(), $('#bondPackDate').val(), $('#trustEndDate').val());//(new Date()).dateFormat('yyyy-MM-dd'),
                $.each(self.bondInfoTableData, function (i, v) {
                    BondSetupXMl += self.BondSetupXMlTmp.format(
                        i + 1,
                        v.intrestRate,
                        v.releasePeriod,
                        v.releaseAmount,
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
                    sVariableBuilder.AddVariableItem('TrustID', TrustId, 'String', 1, 0, 0);
                    var sVariable = sVariableBuilder.BuildVariables();
                    var tIndicator = new taskIndicator({
                        width: 900,
                        height: 550,
                        clientName: 'TaskProcess',
                        appDomain: 'Task',
                        taskCode: 'DynamicCashflowCaculation',
                        sContext: sVariable,
                        callback: function () {
                            sVariableBuilder.ClearVariableItem();

                            //填充现金流表格
                            self.cashFlowTableData = [];
                            var today = self.changeTimeStamp(new Date().getTime(), 'int');
                            var reportingDate = new Date().getFullYear() + '-' + ("0" + (new Date().getMonth() + 1)).slice(-2) + '-' + ("0" + (new Date().getDate())).slice(-2);//new Date().getFullYear();

                            var executeParam = {
                                SPName: 'usp_GetScheduleBond', SQLParams: [
                                    { Name: 'trustId', value: TrustId, DBType: 'string' },
                                    { Name: 'reportingDate', value: reportingDate, DBType: 'string' },
                                    { Name: 'scheduleDateId', value: today, DBType: 'int' }
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

                                self.$nextTick(function () {
                                    $(self.$refs.date).date_input()
                                })

                                //self.cashFlowTableData = res
                            })


                        }
                    });
                    tIndicator.show();
                })

            },
            listenPage: function (data) {
                this.showList(data)
            },
            showList: function (curPage) {
                var self = this;
                for (i = 0; i < self.cashFlowTableData.length; i++) {
                    if (i >= (curPage - 1) * self.intervalPage && i < (curPage - 1) * self.intervalPage + self.intervalPage) {
                        Vue.set(self.showItemList, i, 1);
                    } else {
                        Vue.set(self.showItemList, i, 0);
                    }
                }
                console.log(self.showItemList)
            },
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
            },
            reportDate: function () {
                this.bondDataDate = this.reportDate;
            },
            bondDataDate: function () {
                this.reportDate = this.bondDataDate;
            }
        }
    })
    $('.date-plugins').date_input()
    $("#fileUploadFileU").change(function () {
        var val = $(this).val();
        if (val !== '') {
            val = val.substring(val.lastIndexOf('\\') + 1);
            $('.file_name').addClass('filed').text(val).css({ "borderColor": '#ccc' });

        } else {
            $('.file_name').removeClass('filed').text(langx.info8).css({ "borderColor": 'red' })
        }

    })

    $('.form-control').change(function () {
        common.CommonValidation.ValidControlValue($(this));
    });
})