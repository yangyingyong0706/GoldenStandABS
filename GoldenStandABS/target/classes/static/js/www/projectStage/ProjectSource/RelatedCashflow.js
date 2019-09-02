
define(function (require) {

    var $ = require('jquery');
    var Vue = require('Vue2');
    var common = require('common');
    var moment = require('moment');
    var webStorage = require('gs/webStorage');
    var GlobalVariable = require('globalVariable');
    require('app/productManage/interface/numberFormat_interface');
    var numberFormatUtils = new NumberFormatUtils();
    var CATALOG_TITLE_ID_PREFIX = 'catalogTitle_';
    var CATALOG_CONTENT_ID_PREFIX = 'catalogContent_';
    var ProjectId = common.getQueryString('ProjectId');
    var wcfProxy = require('app/productManage/Scripts/wcfProxy');
    var wcfDataServices = new wcfProxy();
    var trustId;

    var config = {
        titleTemplate: '<span>{0}</span>期',
        feeModelSource: null  // fee model 模板
    };
    var trustFees = {}; //  存在信托计划每期费用信息，用于展示费用信息，e.g. trustFees['2016-01-26'] 
    //金额过滤器
    Vue.filter('FormatMoney', function (p) {
        if (parseFloat(p) === 0) {
            return '--';
        };
        return numberFormatUtils.formatMoney(p, "auto");
    });
    //期初名称过滤器
    Vue.filter('NameStart', function (data) {
        var name = data.substring(0, data.lastIndexOf("-"));
        if (name == "") {
            name = data
        }
        name = name + "期初余额"
        return name
    })
    //期末名称过滤器
    Vue.filter('NameEnd', function (data) {
        var name = data.substring(0, data.lastIndexOf("-"));
        if (name == "") {
            name = data
        }
        name = name + "期末余额"
        return name
    })
    var vm = new Vue({
        el: '#PageMainContainer',
        data: {
            Periods: [                   //期数
                {
                    EndDate: "",
                    IsContainsEnd: 0,
                    IsCurrent: null,
                    IsManualModified: null,
                    StartDate: "",
                    TrustId: 0,
                    TrustPeriodDesc: "",
                    TrustPeriodType: "",
                }
            ],
            DaysArr: [],                //间隔天数，计息时间
            nowIndex: 0,                //当前期数index
            PeriodCashInflows: [],      //现金流交易明细
            TrustTransactionFee: [],    //收益分配明细
            TrustTransactionFeeTrue: [], //收益分配明细有help
            BondBalanceParam: [],        //本金兑付
            ValidationDetail: [],        //校验明细
            ValidationValue: 0,          //校验结果
            ValidationFail: '<i class="icon icon-warning"></i>校验不通过',
            ValidationSuccess: '<i class="icon icon-roundcheck"></i>校验通过',
            ShowValidation: false,       //是否显示校验
            FormulaDate: [],             //FormulaDate数据，用于help
            FeeModelData: [],            //用于help
            TrustFeeData: [],            //用于help
            loading: true,              //loading
            TrustBondCode: [],
            PaymentDetails: [],
            nowPaymentDetails: [],
            AccountInfo: [],//账户互转详细
            allTrustId: [],
            TrustId: '',
            nowTrustIdIndex: 0
        },
        mounted: function () {
            var self = this;
            this.GetAllTrustId();
        },
        watch: {
            allTrustId: function (val, oldVal) {
                var self = this;
                trustId = val[0].TrustId;
                self.TrustId = val[0].TrustId;
                Vue.nextTick(function () {
                    $(".trustIdTab li").eq(0).trigger("click");
                })
            },
            TrustId: function (val,oldVal) {
                var self = this;
                trustId = val;
                Vue.nextTick(function () {
                    self.LoadAllPeriods()
                })
            },
            Periods: function (val, oldVal) {
                Vue.nextTick(function () {
                    var nowPeriod = webStorage.getItem('nowPeriod') | this.nowIndex;
                    $("#DC_TimeLine li").eq(nowPeriod).trigger("click");
                })
            },
            TrustBondCode: function () {
                Vue.nextTick(function () {
                    $(".TrustBondCode li").eq(0).trigger("click");
                })
            },
            nowIndex: function (val, oldVal) {
                var self = this;
                this.ShowValidation = false;
                $('.catalog-content').animate({ scrollTop: 0 }, 0)
                var width = $(window).width()
                var num = Math.floor(width / 190) - 2;
                var left = $("#DC_TimeLine li").eq(val).offset().left;
                var right = width - left;
                if (val > oldVal) {
                    if (right < 200) {
                        $("#DC_TimeLine").scrollLeft((val - num) * 190);
                    }
                } else if (val < oldVal) {
                    if (left < 300) {
                        $("#DC_TimeLine").scrollLeft((val - 1) * 190);
                    }
                }
            }
        },
        methods: {
            GetAllTrustId: function () {
                var self = this;
                var executeParam = {
                    'SPName': "usp_getTrustIdFromProjectId", 'SQLParams': [
                              { 'Name': 'ProjectId', 'value': parseInt(ProjectId), 'DBType': 'int' }
                    ]
                };
                var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";

                common.ExecuteGetData(true, serviceUrl, 'TrustManagement', executeParam, function (response) {
                    if (response.length === 0) {
                        self.loading = false;
                        $('.inline-block-container').hide()
                    } else {
                        self.allTrustId = response;
                    }
                })
            },
            //将日期格式化为yyyy-xx-mm
            GetDateString: function (date) {
                var Date = common.getStringDate(date);
                var ar_date = [Date.getFullYear(), Date.getMonth() + 1, Date.getDate()];
                function dFormat(i) {
                    return i < 10 ? "0" + i.toString() : i;
                }
                for (var i = 0; i < ar_date.length; i++) {
                    ar_date[i] = dFormat(ar_date[i])
                };
                Date = ar_date.join('-');
                return Date;
            },
            //加载日期时间段
            LoadAllPeriods: function (fnCallback) {
                var self = this;
                var executeParam = {
                    'SPName': "usp_GetTrustPeriod", 'SQLParams': [
                              { 'Name': 'TrustId', 'value': self.TrustId, 'DBType': 'string' },
                              { "Name": "TrustPeriodType", "value": "PaymentDate_CF", "DBType": "string" }
                    ]
                };
                var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";

                common.ExecuteGetData(true, serviceUrl, 'TrustManagement', executeParam, function (response) {
                    if (response.length === 0) {
                        self.loading = false;
                    }
                    self.Periods = response;
                    $.each(self.Periods, function (index, trustPeriod) {

                        trustPeriod.StartDate = self.GetDateString(trustPeriod.StartDate);
                        trustPeriod.EndDate = self.GetDateString(trustPeriod.EndDate);
                        trustPeriod.periodCashInflows = [];
                        trustPeriod.periodFees = [];
                        trustPeriod.periodBalances = [];
                        trustPeriod.validations = [];
                        trustPeriod.showValidation = false;
                        trustPeriod.validationValue = 0;
                    });

                    $.each(self.Periods, function (i, v) {
                        v.selectReportType = '';
                        v.reportData = [];
                    })
                    for (i = 0, length = self.Periods.length; i < length; i++) {
                        self.DaysArr[i] = self.computeDays(self.Periods[i].EndDate, self.Periods[i].StartDate)
                    }
                    if (fnCallback && typeof fnCallback === 'function') {
                        fnCallback();
                    }
                });
            },
            //计算相差的天数
            computeDays: function (start, end) {
                var offsetTime = Math.abs((new Date(end) - new Date(start)) + 1);
                return Math.floor(offsetTime / (3600 * 24 * 1e3));
            },
            //格式化金额
            FormatMoney: function (p) {
                if (parseFloat(p) === 0) {
                    return '--';
                };
                return numberFormatUtils.formatMoney(p, "auto");
            },
            //是否显示校验明细
            IsShowValidation: function () {
                this.ShowValidation = !this.ShowValidation;

                var divScroll = $('.catalog-content').scrollTop();
                $('.catalog-content').animate({ scrollTop: divScroll + 650 }, divScroll)
                console.log(divScroll)
            },
            //时间轴点击获取index值和更改样式
            ShowPeriodDetail: function (event, index, period) {
                var self = this;
                var $li = $(event.currentTarget);
                $li.addClass('selected').siblings().removeClass('selected');
                self.nowIndex = index;
                webStorage.setItem('nowPeriod', index);
            },
            //现金交易流明细重组数组包括helps
            TrustCashInflow: function (cashData, formulaData) {
                var self = this;
                self.PeriodCashInflows = [];
                var helps = {
                    TrustPlanAccount_OpeningBalance: '信托收款账户上期转存的资金',
                    TrustPlanAccount_ClosingBalance: '信托收款账户转存下期的资金',
                    TrustPlanAccount_Reserve_OpeningBalance: '信托储备账户上期转存的资金',
                    TrustPlanAccount_Reserve_ClosingBalance: '信托储备账户转存下期的资金',
                    TrustPlanAccount_Interest_OpeningBalance: '收入分账户上期转存的资金',
                    TrustPlanAccount_Interest_ClosingBalance: '收入分账户转存下期的资金',
                    Fee_AccumulateAccrued_OpeningBalance: '上期费用预提取但未支付的金额',
                    Fee_AccumulateAccrued_ClosingBalance: '当期费用预提取但未支付的金额',
                    Fee_TotalPaid: '当期总支付的税金和费用(包括中登费)',
                    TrustPlan_Total_AllocationAmt: '当期总支付的证券利息和证券本金',
                    TrustPlanAccount_Interest_Collected: '在收款期间内,总体回流的利息金额(包含资产回收款、资产赎回款、清仓回购款、其他收入等)',
                    TrustPlanAccount_Investment_Collected: '在收款期间内，通过合格投资产生的收益，该项计入收入分账户',
                    OtherIncome_ToInterest_Input: '在收款期间内，托管账户中的资金产生的银行存款利息，该项计入收入分账户',
                    TrustPlanAccount_Principal_Collected: '在收款期间内,总体回流的本金金额(包含资产回收款、资产赎回款、清仓回购款、其他收入等)',
                    RedeemUnqualifiedAssets_ToPrincipal_Input: '在收款期间内，由于原始权益人赎回不合格资产而回收的资金',
                    TrustPlanAccount_Reserve_Rotation: '储备金账户期初的资金余额',
                    TrustPlanAccount_Principal_OpeningBalance: '本金分账户上期转存的资金',
                    TrustPlanAccount_AssetPoolClosingBalance: '即为“期末资产池未还本金总额”',
                    TrustPlanAccount_AssetPoolBalance: '即为“期初资产池未偿本金总额”',
                    TrustPlanAccount_Principal_ClosingBalance: '本金分账户转存下期的资金',
                    Cumulate_Carryover_Paid: (function (f) {
                        var a = b = c = d = 0;
                        var html = '<p>相当于以下(a)+(b)+(c)-(d)：</p>' +
                         '<ul>' +
                             '<li>(a)在最近一个收款期间成为违约贷款的抵押贷款在成为违约贷款时的未偿本金余额</li>' +
                             '<li>(b)在除最近一个收款期间外的以往的收款期间成为违约贷款的抵押贷款在成为违约贷款时的未偿本金余额</li>' +
                             '<li>(c)在以往的所有的信托分配日按照相应款项已从本金分账户转至收入分账户的金额</li>' +
                             '<li>(d)在以往的所有信托分配日按照相应款项由收入分账户转入本金分账户的金额<li>' +
                         '</ul>';
                        $.each(f, function (k, v) {
                            if (v.ItemCode === 'CurrentAssetDefault_Input') {
                                a = parseInt(v.Value) ? formatMoney(v.Value) : 0
                            }
                            if (v.ItemCode === 'PreviousAssetDefault_Input') {
                                b = parseInt(v.Value) ? formatMoney(v.Value) : 0
                            }
                            if (v.ItemCode === 'Previous_Supplement_Input') {
                                c = parseInt(v.Value) ? formatMoney(v.Value) : 0
                            }
                            if (v.ItemCode === 'Previous_Carryover_Input') {
                                d = parseInt(v.Value) ? formatMoney(v.Value) : 0
                            }
                        });
                        html += '<p>该项金额为：(a)+(b)+(c)-(d) = ' + a + ' + ' + b + ' + ' + c + ' - ' + d + '</p>';
                        return html;
                    })(formulaData),
                    Cumulate_Supplement_Paid: '按照相应款项，从本金分账户中划转，用于补足收入分账户的资金',
                    InterestLeftOverToPrincipal: '收入分账户分配完毕后，将剩余资金转入本金分账户',
                    TopCPB: '当期支出的用于循环购买的资金'
                };
                var temp = [];
                if (cashData && cashData.length > 0) {
                    if (cashData.length % 2 == 1) {
                        cashData.push({ DisplayName: '-', Amount: 0 });
                    }
                    $.each(cashData, function (i, data) {
                        if (i % 2 == 0) {
                            temp.push({
                                DisplayName: data.DisplayName,
                                Amount: formatMoney(data.Amount),
                                Help: helps[data.ItemCode]
                            });
                        } else {
                            temp.push({
                                DisplayName: data.DisplayName,
                                Amount: formatMoney(data.Amount),
                                Help: helps[data.ItemCode]
                            });
                            self.PeriodCashInflows.push({ source: temp });
                            temp = [];
                        }
                    });
                }
            },
            //收益分配明细重组数组包括helps
            TrustTransaction: function (feeData, formulaData, reportDate) {
                var self = this;
                var helps = function (reportDate, currentFee, formulaData) {
                    if (currentFee.FeeType === '费用' || currentFee.FeeType === '税收') {
                        var feeNme = currentFee.FeeDueItemCode;
                        var feeUtility = new FeeUtility(formulaData, feeData);
                        return feeUtility.getFeeModelCalcMethod(reportDate, feeNme);
                    } else if (currentFee.FeeType === '证券利息') {
                        var a = b = c = d = 0;
                        var html = '<p>每个兑付日应支付的利息=A*B*C/D 其中：</p>' +
                                    '<ul>' +
                                        '<li>A代表：该兑付期间，期初的证券未尝本金总额</li>' +
                                        '<li>B代表：该兑付区间，证券的执行利率</li>' +
                                        '<li>C代表：该兑付区间，证券的计息天数</li>' +
                                        '<li>D代表：证券全年的计息天数</li>' +
                                     '</ul>';
                        $.each(formulaData, function (k, v) {
                            if (v.ItemCode === currentFee.ItemCode + '_OpeningBalance') {
                                a = parseFloat(v.Value) === 0 ? 0 : formatMoney(v.Value);
                            }
                            if (v.ItemCode === currentFee.ItemCode + '_CurrentRate') {
                                b = parseFloat(v.Value) === 0 ? 0 : formatMoney((v.Value / 100).toFixed(6));
                            }
                            if (v.ItemCode === 'InterestDays') {
                                c = parseInt(v.Value) ? v.Value : 0;
                            }
                            if (v.ItemCode === currentFee.ItemCode + '_InterestDays') {
                                d = parseInt(v.Value) ? Math.floor(v.Value) : 0;
                            }
                        });
                        html += '<p>债券利息 = A*B*C/D = ' + a + '*' + b + '*' + c + '/' + d + '</p>';
                        return html;
                    }
                };
                self.TrustTransactionFeeTrue = [];
                $.each(feeData, function (i, data) {
                    self.TrustTransactionFeeTrue.push({
                        FeeType: data.FeeType,
                        AccountType: data.AccountType,
                        DisplayName: data.DisplayName,
                        FeeDue: formatMoney(data.FeeDue),
                        FeePaid: formatMoney(data.FeePaid),
                        Help: helps(reportDate, data, formulaData)
                    });
                });
            },
            //本金兑付重组数组
            BondPayment: function (balanceData) {
                var self = this;
                self.BondBalanceParam = [];
                $.each(balanceData, function (i, data) {
                    self.BondBalanceParam.push({
                        Type: data.Type,
                        AccountType: data.AccountType,
                        DisplayName: data.DisplayName,
                        CurrentRate: numberFormatUtils.formatMoney(data.CurrentRate, 4),
                        OpeningBalance: formatMoney(data.OpeningBalance),
                        ClosingBalance: formatMoney(data.ClosingBalance)
                    });
                });
            },
            //校验明细重组数组并校验是否通过
            Validation: function (validationData) {//收益分配校验结果Data
                var self = this;
                var arr = {};
                $.each(validationData, function (i, data) {
                    if (!arr[data.AssetClass]) {
                        arr[data.AssetClass] = {};
                    }
                    if (!arr[data.AssetClass][data.AccountType]) {
                        arr[data.AssetClass][data.AccountType] = [];
                    }
                    arr[data.AssetClass][data.AccountType].push({
                        DisplayName: data.DisplayName,
                        ItemCode: data.ItemCode,
                        Value: data.Value,
                        Money: formatMoney(data.Value)
                    });
                });
                self.ValidationDetail = [];
                $.each(arr, function (i, data) {
                    self.ValidationDetail.push(data);
                });
                var c1 = (typeof arr.ClosingBalance != 'undefined') ? arr.ClosingBalance.Summary[0].Value : 0, // 期末账户余额
                    c2 = (typeof arr.OpeningBalance != 'undefined') ? arr.OpeningBalance.Summary[0].Value : 0, // 期初账户余额
                    c3 = (typeof arr.OpeningBalance != 'undefined') ? arr.TotalAllocated.Summary[0].Value : 0, // 当期支出汇总
                    c4 = (typeof arr.TotalCollected != 'undefined') ? arr.TotalCollected.Summary[0].Value : 0; // 当期收入汇总
                var value = Math.abs(c2 + c4 - (c1 + c3));
                self.ValidationValue = value.toFixed(2);
            },
            GetInfoForBondCode: function (nowTrustBondCode, $event) {
                var self = this;
                var $li = $($event.currentTarget);
                $li.addClass('active').siblings().removeClass('active');
                var arr = [];
                $.each(self.PaymentDetails, function (i, v) {
                    if (v.TrustBondCode == nowTrustBondCode) {
                        arr.push(v);
                    }
                })
                self.nowPaymentDetails = arr;

            },
            ChangeTrustId: function (trustId,index, $event) {
                var self = this;
                var $li = $($event.currentTarget);
                $li.addClass('active').siblings().removeClass('active');
                self.TrustId = trustId;
                self.nowTrustIdIndex = index;
            },
            //投资人格式化金额
            PaymentDetailsFormatMoney: function (PaymentDetails) {
                var self = this;
                $.each(PaymentDetails, function (i, data) {
                    data.Principal_Paid = formatMoney(data.Principal_Paid);
                    data.RemainPrinciple = formatMoney(data.RemainPrinciple);
                    data.Interest_Paid = formatMoney(data.Interest_Paid);
                });
            },
            //获取所有数据
            GetAllData: function (reportDate, fn) {
                var self = this;
                self.loading = true;

                var defer = $.Deferred();
                var filter = function (defer) {
                    if (true) {
                        var reportDateId = reportDate.replace(/-/g, '');
                        var promises = [
                                wcfDataServices.getWcfFactTrustTransactionCashInflow(trustId, reportDateId),
                                wcfDataServices.getWcfFactTrustTransactionFee(trustId, reportDateId),
                                wcfDataServices.getWcfFactBondPaymentBalance(trustId, reportDateId),
                                wcfDataServices.getIncomeDistributionValidationDetail(trustId, reportDateId),//收益分配结果校验
                                wcfDataServices.getWcfFormulaDateOfIncomeDistribution(trustId, reportDateId),
                                wcfDataServices.getInfoForBondCode(trustId, reportDateId),  //投资人兑付明细
                                wcfDataServices.getAllTrustBondCode(trustId),//返回改专项计划的所有债券信息
                                wcfDataServices.getWcfFactTrustTransactionAccountInfo(trustId, reportDateId)//账户互转详情
                        ];
                        if (!trustFees[reportDate]) {
                            promises.push(wcfDataServices.getWcfTrustFee(trustId, reportDate));
                        }

                        if (!config.feeModelData) {
                            promises.push(wcfDataServices.getWcfFeeModelSource());
                        }
                        return $.when.apply($, promises);
                    }
                    defer.resolve();
                    return defer.promise();
                };

                $.when(filter(defer)).then(function (cashInflowData, transFeeData, balanceData, validationData, formulaData, PaymentDetails, TrustBondCode, AccountInfo, trustFeeData, feeModelData) {
                    if (cashInflowData && transFeeData && balanceData) {
                        if (trustFeeData) {
                            self.TrustFeeData = JSON.parse(trustFeeData[0]);
                            trustFees[reportDate] = {};
                            for (var i = 0, len = self.TrustFeeData.length; i < len; i++) {
                                var trustFeeName = self.TrustFeeData[i].TrustFeeName;
                                if (!trustFees[reportDate][trustFeeName]) {
                                    trustFees[reportDate][trustFeeName] = [];
                                }
                                trustFees[reportDate][trustFeeName].push(self.TrustFeeData[i]);
                            }
                        }
                        if (feeModelData) {
                            config.feeModelSource = JSON.parse(feeModelData[0]);
                        }

                        //获取数组
                        var PeriodCashInflows = JSON.parse(cashInflowData[0]);
                        self.TrustTransactionFee = JSON.parse(transFeeData[0]);
                        var BondBalanceParam = JSON.parse(balanceData[0]);
                        var Validation = JSON.parse(validationData[0]);
                        self.FormulaDate = JSON.parse(formulaData[0]);
                        self.PaymentDetails = JSON.parse(PaymentDetails[0]);
                        self.TrustBondCode = JSON.parse(TrustBondCode[0]);
                        self.AccountInfo = JSON.parse(AccountInfo[0]);
                        //将数组重组为最终数据
                        self.TrustCashInflow(PeriodCashInflows, self.FormulaDate);
                        self.TrustTransaction(self.TrustTransactionFee, self.FormulaDate, reportDate);
                        self.BondPayment(BondBalanceParam);
                        self.Validation(Validation);
                        self.PaymentDetailsFormatMoney(self.PaymentDetails)
                        self.loading = false;
                    } else {
                        self.loading = false;
                    }
                }, function (response) {
                    alert('error is: ' + response);
                });
            }
        }
    })

    /**
     * 费用信息和计算方式展示帮助对象
     * 收益分配明细Help
     * @returns {} 
    */
    function FeeUtility(formulaData, feeData) {
        var FEE_DISPLAY_TEMPLATE = '<div>' +
            '<p>{FeeName}：</p>' +
                '<div>' +
                    '<ul>{Params}</ul>' +
                '</div>' +
            '<p>计算方式：</p>' +
            '<div style="margin-left:10px;">{MethodDesc}</div>' +
            '</div>';
        var FEE_PARAM_TEMPLATE = '<li><span>{ParamName}：</span><span>{ParamValue}</span></li>';
        var suffixRegex = /_\d{1,}$/; // 替换成"_#Id#"

        var CHINA_BOND_FEE_MODEL_KEY = 'ChinaBond_Fee_#Id#';

        function isChinaBondFee(trustFeeName) {
            return trustFeeName === 'ChinaBondFee';
        }

        function getBondTotalAllocatedAmount() {
            var totalBondAllocatedAmount = 0;
            for (var i = 0, len = feeData.length; i < len; i++) {
                if (feeData[i].FeePaidItemCode === 'Interest_Paid' || feeData[i].FeePaidItemCode === 'Principal_Paid') {
                    totalBondAllocatedAmount += parseFloat(feeData[i].FeePaid);
                }
            }
            return totalBondAllocatedAmount;
        }

        // Hardcode 中登费
        function getChinaBondDefaultMessage() {
            var paramResult = FEE_PARAM_TEMPLATE.replace('{ParamName}', '默认费率').replace('{ParamValue}', '0.005%');
            paramResult += FEE_PARAM_TEMPLATE.replace('{ParamName}', '证券本息分配').replace('{ParamValue}', formatMoney(getBondTotalAllocatedAmount().toFixed(2)));

            return FEE_DISPLAY_TEMPLATE.replace('{FeeName}', '代理机构（中登费）')
                        .replace('{Params}', paramResult)
                        .replace('{MethodDesc}', '费率*证券本息分配');
        }

        /**
         * 获取当前信托计划的fee配置数据
         * @param {} reportDate 
         * @param {} trustFeeName 
         * @returns [] 返回该fee所有配置信息
         */
        function getTrustFeeDataByNme(reportDate, trustFeeName) {
            if (trustFees[reportDate]) {
                if (isChinaBondFee(trustFeeName)) {
                    for (var key in trustFees[reportDate]) {
                        if (key.indexOf('ChinaBond_') === 0) {
                            return trustFees[reportDate][key];
                        }
                    }
                }
                return trustFees[reportDate][trustFeeName];
            }
            return null;
        }

        /**
         * 获取fee 模板信息
         * @param {} trustFeeName 
         * @returns 费用类型对应的FeeModel模板
         */
        function getFeeModelByNme(trustFeeName) {
            var tpTrustFeeName = trustFeeName.replace(suffixRegex, '_#Id#');
            if (isChinaBondFee(trustFeeName)) {
                tpTrustFeeName = CHINA_BOND_FEE_MODEL_KEY;
            }
            var feeModels = config.feeModelSource.Json;
            for (var i = 0, len = feeModels.length; i < len; i++) {
                if (feeModels[i].ActionCode === tpTrustFeeName) {
                    return feeModels[i];
                }
            }
            return null;
        }

        // 获取fee 的参数模板
        function getFeeParameterModel(feeModel, paramName) {
            var tpParamName = paramName.replace(suffixRegex, '_#Id#');
            var feeParameters = feeModel.Parameters;
            for (var i = 0, len = feeParameters.length; i < len; i++) {
                if (feeParameters[i].Name === tpParamName) {
                    return feeParameters[i];
                }
            }
            return null;
        }

        // 获取ddl value
        function getDataSourceTitle(dataSourceName, itemValue) {
            var dataSource = config.feeModelSource.DataSources[dataSourceName];
            if (dataSource) {
                var dataSourceTitle = '';
                for (var i = 0, len = dataSource.length; i < len; i++) {
                    if (dataSource[i].Value === itemValue) {
                        dataSourceTitle = dataSource[i].Title;
                        break;
                    }
                }
                if (dataSourceName === 'FeeBase' || dataSourceName === 'PeriodBase') {
                    for (var i = 0, len = formulaData.length; i < len; i++) {
                        if (formulaData[i].ItemCode === itemValue) {
                            dataSourceTitle += ' (' + formatMoney(formulaData[i].Value) + ')';
                            break;
                        }
                    }
                }
                return dataSourceTitle;
            }
            return null;
        }

        // 获取fee 参数的value值
        function getFeeParameterValue(parameterModel, itemValue) {
            if (parameterModel.DataSourceName) {
                return getDataSourceTitle(parameterModel.DataSourceName, itemValue);
            }
            return itemValue;
        }

        // 获取计算公式
        function getFeeMethodDisplayName(feeModel, feePatternValue) {
            var patterns = feeModel.MethodDisplayName.split(';');
            for (var i = 0, len = patterns.length; i < len; i++) {
                if (patterns[i].indexOf(feePatternValue) > -1) {
                    return patterns[i];
                }
            }
            return feeModel.MethodDisplayName;
        }

        /**
         * 展示费用信息和计算方式，例如
         * 费用名称：
         * 计算模式：费率计算模式
         * 费率(%)*：0.2
         * 基准天数(360/365)*
         * 支付频率(期)*： 1
         * 计算方式：
         * 费率计算模式:计费基准*费率*计费期间*支付比例/基准天数
         * 
         * @param string reportDate 报告日期
         * @param string trustFeeName 
         * @returns 返回费用详细信息；
         */
        function getFeeModelCalcMethod(reportDate, trustFeeName) {
            var feeModel = getFeeModelByNme(trustFeeName);
            var feeData = getTrustFeeDataByNme(reportDate, trustFeeName);
            var feePattern = ''; // 计算模式

            if (!(feeModel && feeData)) {
                if (isChinaBondFee(trustFeeName)) {
                    return getChinaBondDefaultMessage();
                }
                return '获取费用信息失败...';
            }
            if (feeData) {
                $.each(feeData, function (i, v) {
                    if (v.ItemCode.search("Other_Fee_IsApplyAfter")) {
                        feeData = feeData.splice(i, 1);
                        return false;
                    }
                })
            }
            console.log(feeData)
            var feeResult = FEE_DISPLAY_TEMPLATE.replace('{FeeName}', feeData[0].TrustFeeDisplayName);
            // 费用参数
            var paramResult = '';
            for (var i = 0, len = feeData.length; i < len; i++) {
                var paramData = feeData[i];
                var paramItemCode = paramData.ItemCode;
                var paramItemValue = paramData.ItemValue;
                var feeParameterModel = getFeeParameterModel(feeModel, paramItemCode);
                if (feeParameterModel) {
                    paramResult += FEE_PARAM_TEMPLATE.replace('{ParamName}', feeParameterModel.DisplayName)
                    .replace('{ParamValue}', getFeeParameterValue(feeParameterModel, paramItemValue));
                    if (feeParameterModel.DataSourceName === 'FeePatternSequence') {
                        feePattern = getFeeParameterValue(feeParameterModel, paramItemValue);
                    }
                }



            }

            if (isChinaBondFee(trustFeeName)) {
                paramResult += FEE_PARAM_TEMPLATE.replace('{ParamName}', '证券本息分配').replace('{ParamValue}', formatMoney(getBondTotalAllocatedAmount().toFixed(2)));
            }

            if (feePattern == '') {
                feePattern = getFeeParameterValue(feeModel.Parameters[0], feeModel.Parameters[0].ItemValue);
            }

            feeResult = feeResult.replace('{Params}', paramResult)
                .replace('{MethodDesc}', getFeeMethodDisplayName(feeModel, feePattern));

            return feeResult;
        }

        return {
            getFeeModelCalcMethod: getFeeModelCalcMethod
        };
    }
    //格式化金额
    function formatMoney(p) {
        if (parseFloat(p) === 0) {
            return '-';
        };
        return numberFormatUtils.formatMoney(p, "auto");
    }

});
