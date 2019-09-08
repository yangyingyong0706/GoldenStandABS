String.prototype.startWith = function (str) {
    var reg = new RegExp("^" + str);
    return reg.test(this);
}

String.prototype.endWith = function (str) {
    var reg = new RegExp(str + "$");
    return reg.test(this);
}

//自然日  就叫 NaturalDay吧
//工作日和交易日   WorkingDay  TradingDay
//BeginingOfMonth	             月初
//EndOfMonth                     月末
//向前 -1  向后 1  不调整 0
//基准条件 选中值为 1 不选中值为0

var DateSetModel
, DataSetTools,
        viewselect;
var signdeler = 0;
define(function (require) {
    var $ = require('jquery');
    var toast = require('toast');
    require('jquery.cookie');
    require('jquery-ui');
    var ko = require('knockout');
    var mapping = require('knockout.mapping');
    ko.mapping = mapping;
    require('knockout.rendercontrol');
    require('date_input');
    var common = require('common');
    require('./dataOperate');
    require('./format.number');
    var mac = require('./magic/magic.core');
    require('./magic/magic.dialog');
    //require('./TaskIndicatorScript');
    var flage = true;
    var appGlobal = require('App.Global');
    var CallWCFSvc = appGlobal.CallWCFSvc;
    var GlobalVariable = require('globalVariable');
    require("app/projectStage/js/project_interface");
    require('app/components/viewDateSet/js/viewTrustWizard');
    var GSDialog = require("gsAdminPages");
    var trustId = common.getQueryString("tid");
    var isShowRemove = false;//默认删除按钮为隐藏
    var IsTopUpAvailableFlag = true;//是否支持循环购买标识
    //var col = 2; // 记录当前列数
    var iCodeIsTopUpAvailable = 'IsTopUpAvailable';//是否支持循环购买的itemcode
    var paymentDateObj = null;//保存兑付日数据选项
    var cPaymentDateObj = null;//保存循环期兑付日数据选项
    require('jquery.localizationTool');
    webStorage = require('gs/webStorage');
    webProxy = require('gs/webProxy');
    var ActLogs = require('insertActlogs');
    var RoleOperate = require('gs/uiFrame/js/roleOperate');
    var userName = RoleOperate.cookieName();
    var taskIndicator = require('gs/taskProcessIndicator');
    var sVariableBuilder = require('gs/sVariableBuilder');
    var ip;
    var tips = "";
    $.ajax({
        cache: false,
        type: "GET",
        async: false,
        url: GlobalVariable.DataProcessServiceUrl + 'getIP',
        dataType: "json",
        contentType: "application/xml;charset=utf-8",
        data: {},
        success: function (response) {
            if (typeof response === 'string') {
                ip = response;
            }
        },
        error: function () {
            alert: '网络连接异常'
        }
    });

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


            'id:period_set': {
                'en_GB': 'Modify'
            },
            'id:title': {
                'en_GB': 'Basic Information'
            },
            'id:btn': {
                'en_GB': 'Amortization period'
            },
            'id:btn1': {
                'en_GB': 'Cycle period'
            },
            'id:info1': {
                'en_GB': 'According to the definition of the release specification (including the header without tail)'
            },
            'id:info2': {
                'en_GB': 'The date of collection of the collection amount, the collection period includes the end of the collection period, and the first collection period is the package date (inclusive)~ the first collection period collection date (inclusive)'
            },
            'id:info3': {
                'en_GB': 'Date of payment of securities principal and interest'
            },
            'id:info4': {
                'en_GB': 'The interest period of some plans is the period of interest-bearing period (including the end without tail)'
            },
            'id:tab1': {
                'en_GB': 'First date'
            },
            'id:tab2': {
                'en_GB': 'Long interval (months)'
            },
            'id:tab3': {
                'en_GB': 'Workday adjustment'
            },
            'id:pre': {
                'en_GB': 'Forward'
            },
            'id:next': {
                'en_GB': 'Backward'
            },
            'id:none': {
                'en_GB': 'Not adjusted'
            },
            'id:tab4': {
                'en_GB': 'Working calendar'
            },
            'id:tab5': {
                'en_GB': 'Benchmark condition'
            },
            'id:tab6': {
                'en_GB': 'First'
            },
            'id:tab7': {
                'en_GB': 'One'
            },
            'id:title1': {
                'en_GB': 'Date calculation'
            },
            'id:tab8': {
                'en_GB': 'Distance'
            },
            'id:tab9': {
                'en_GB': 'one'
            },
            'id:tab10': {
                'en_GB': 'Distance'
            },
            'id:tab11': {
                'en_GB': 'one'
            },
            'id:info5': {
                'en_GB': 'The date of collection of the collection amount, the collection period includes the end of the collection period, and the first collection period is the package date (inclusive)~ the first collection period collection date (inclusive)'
            },
            'id:info6': {
                'en_GB': 'Date of payment of securities principal and interest'
            },
            'id:info7': {
                'en_GB': 'The interest period of some plans is the period of interest-bearing period (including the end without tail)'
            },
            'id:lab1': {
                'en_GB': 'First date'
            },
            'id:lab2': {
                'en_GB': 'Long interval (months)'
            },
            'id:lab3': {
                'en_GB': 'Workday adjustment'
            },
            'id:pre1': {
                'en_GB': 'Forward'
            },
            'id:next1': {
                'en_GB': 'Backward'
            },
            'id:none1': {
                'en_GB': 'Not adjusted'
            },
            'id:lab4': {
                'en_GB': 'Working calendar'
            },
            'id:lab5': {
                'en_GB': 'Benchmark condition'
            },
            'id:lab6': {
                'en_GB': 'First'
            },
            'id:lab7': {
                'en_GB': 'One'
            },
            'id:title2': {
                'en_GB': 'Date calculation'
            },
            'id:lab8': {
                'en_GB': 'Distance'
            },
            'id:lab9': {
                'en_GB': 'one'
            },
            'id:lab10': {
                'en_GB': 'Distance'
            },
            'id:lab11': {
                'en_GB': 'one'
            },
            'id:list1': {
                'en_GB': 'Interest period'
            },
            'id:list2': {
                'en_GB': 'Collection time'
            },
            'id:list3': {
                'en_GB': 'Starting time'
            },
            'id:list4': {
                'en_GB': 'End Time'
            },
            'id:list5': {
                'en_GB': 'Manually modify'
            },
            'id:list6': {
                'en_GB': 'Starting time'
            },
            'id:list7': {
                'en_GB': 'End Time'
            },
            'id:list8': {
                'en_GB': 'Manually modify'
            },
            'id:SavePeriod': {
                'en_GB': 'Confirm'
            },
            'id:day': {
                'en_GB': 'Report day'
            },
            'id:FactBondPayment_GetList': {
                'en_GB': 'Search'
            },
            'id:row1': {
                'en_GB': 'Securities short name'
            },
            'id:row2': {
                'en_GB': 'Report day'
            },
            'id:row3': {
                'en_GB': 'Face interest'
            },
            'id:row4': {
                'en_GB': 'Ticket principal'
            },
            'id:row5': {
                'en_GB': 'Remaining face'
            },
            'id:row6': {
                'en_GB': 'Total issue'
            },
            'id:row7': {
                'en_GB': 'Total remaining'
            },
        }
    });

    var userLanguage = webStorage.getItem('userLanguage');
    if (userLanguage) {
        $('#selectLanguageDropdown_qcl').localizationTool('translate', userLanguage);
    }
    $('body').show();
    lang = {};
    if (userLanguage && userLanguage.indexOf('en') > -1) {
        lang.tab1 = 'Working day'
        lang.tab2 = 'Trading day'
        lang.tab3 = 'Nature day'
        lang.tab4 = 'Early month'
        lang.tab5 = 'End of month'
        lang.tab6 = 'Interest-bearing day'
        lang.tab7 = 'Trust distribution date'
        lang.tab8 = 'Redemption date！'
        lang.tab9 = 'Not added'
        lang.tab10 = '! please add in!'
        lang.tab11 = 'Not added during the cycle'
        lang.tab12 = '! please add in!'
        lang.tab13 = 'Not added during the amortization period'
        lang.tab14 = '! please add in!'
        lang.tab15 = 'Legal non-working day in mainland China'
        lang.tab16 = 'Non-working day'
        lang.tab17 = 'Circulating date calculation already exists'
        lang.tab18 = 'Amortization date calculation already exists'
        lang.tab19 = 'Please enter the correct distance days'
        lang.tab20 = 'click to hide'
        lang.tab21 = 'Click to show'
        lang.tab22 = 'Please enter an integer'
        lang.tab23 = 'Ascending order'
        lang.tab24 = 'Descending order'
        lang.tab25 = 'Saved successfully！'
        lang.tab26 = 'An error occurred while saving the data submission！'
        lang.tab27 = 'Adjustment'
        lang.tab28 = 'Are you sure to delete this record？'
        lang.tab29 = 'Actual payment information'
        lang.tab30 = 'Hide delete button'
        lang.tab31 = 'Show delete button'

    } else {
        lang.tab1 = '工作日'
        lang.tab2 = '交易日'
        lang.tab3 = '自然日'
        lang.tab4 = '月初'
        lang.tab5 = '月末'
        lang.tab6 = '计息日'
        lang.tab7 = '信托分配日'
        lang.tab8 = '兑付日！'
        lang.tab9 = '没有添加'
        lang.tab10 = '！请添加！'
        lang.tab11 = '循环期内没有添加'
        lang.tab12 = '！请添加！'
        lang.tab13 = '摊还期内没有添加'
        lang.tab14 = '！请添加！'
        lang.tab15 = '中国大陆法定非工作日'
        lang.tab16 = '非工作日'
        lang.tab17 = '循环期日期计算已存在'
        lang.tab18 = '摊还期日期计算已存在'
        lang.tab19 = '请输入正确的距离天数'
        lang.tab20 = '点击隐藏'
        lang.tab21 = '点击显示'
        lang.tab22 = '请输入整数'
        lang.tab23 = '升序排序'
        lang.tab24 = '降序排序'
        lang.tab25 = '保存成功！'
        lang.tab26 = '数据提交保存时出现错误！'
        lang.tab27 = '调整'
        lang.tab28 = '确认删除该条记录吗？'
        lang.tab29 = '实际支付信息'
        lang.tab30 = '隐藏删除按钮'
        lang.tab31 = '显示删除按钮'
    }



    DateSetModel = (function () {
        var viewModel;
        var PageCode = "TrustExtensionItem";
        var RListRule = { Math: /^R_/ }, RVListRule = { Math: /^R_V_/ }, BListRule = { Math: /^[B]_/ }, BVListRule = { Math: /^[B]_V_/ };
        var calcDateType = { date: 'date', foreach: 'foreach' };
        var vShowOrHideValue = { date: true, foreach: true };
        var PublicHolidays = { DateItems: [], NoWorkDayItems: [] };
        var PublicTradingdays = { DateItems: [], NoWorkDayItems: [] };
        //===初始化相关===

        function viewModelObject() {
            this.BaseInfo = {
                HaveDataList: [
                    //singleColumn("PoolCloseDate", "资产池封包日", "2016-4-25", "date", false),
                ],
                NoHaveDataList: []
            };
            this.ForEachPeriod = {
                HaveDataList: [
                    //baseDateColumn("AssetProviderReportDate", "资产服务机构报告日", "2016-4-25", "PoolCloseDate", "2",true),
                ],
                NoHaveDataList: []
            };
            this.ForEachPeriodCalculateDate = {
                HaveDataList: [
                    //singleColumn("PoolCloseDate", "循环购买计算频率", "2016-4-25", "date", false),
                ],
                NoHaveDataList: [],
                MergeDataList: []
            }
            this.AmortizationPeriod = {
                HaveDataList: [
                    //循环购买，计算日
                    //tableColumn("AssetProviderReportDate", "资产服务机构报告日", "2016-4-25", "PoolCloseDate", "2",true),
                ],
                NoHaveDataList: []
            }
            this.AmortizationPeriodCalculateDate = {
                HaveDataList: [
                    //singleColumn("PoolCloseDate", "循环购买计算频率", "2016-4-25", "date", false),
                ],
                NoHaveDataList: [],
                MergeDataList: []
            }
            this.CompareTargetArry = [];
            this.ForEachCompareTargetArry = [];
            this.CalendarType = [
                { Value: 'WorkingDay', Text: lang.tab1 }
                , { Value: 'TradingDay', Text: lang.tab2 }
                , { Value: 'NaturalDay', Text: lang.tab3 }
            ];
            this.ConditionCalendarType = [
                { Value: 'WorkingDay', Text: lang.tab1 }
                , { Value: 'TradingDay', Text: lang.tab2 }
                , { Value: 'NaturalDay', Text: lang.tab3 }
            ];
            this.ConditionTargetType = [
                { Value: 'BeginingOfMonth', Text: lang.tab4 }
                , { Value: 'EndOfMonth', Text: lang.tab5 }
            ];
            this.GetCompareTargetName = GetCompareTargetName;
        }

        //---start  注册事件等
        function subscribeR() {
            viewModel.ForEachPeriod.HaveDataList.subscribe(function (newArray) {
                CompareTargetUpdate(newArray, viewModel.ForEachCompareTargetArry);
            });
            viewModel.AmortizationPeriod.HaveDataList.subscribe(function (newArray) {
                CompareTargetUpdate(newArray, viewModel.CompareTargetArry);
            });
        }

        function CompareTargetUpdate(newArray, obj) {
            obj.removeAll();
            $.each(newArray, function (i, n) {
                obj.push(n);
            });

        }

        function GetCompareTargetName(ItemCode, type) {
            var list = [];
            if (type == calcDateType.foreach) list = viewModel.ForEachPeriod.HaveDataList();
            else list = viewModel.AmortizationPeriod.HaveDataList();
            var tmpArray = $.grep(list, function (n, i) {
                return n.ItemCode() == ItemCode;
            });
            if (tmpArray.length > 0) {
                return tmpArray[0].ItemAliasValue();
            }
            return ItemCode;
        }

        function getDateSetListByCode(type, keycode, valuecode) {//FundTransferDate
            if (type == 1)
                var sourcearray = viewModel.BaseInfo.HaveDataList();
            else if (type == 2) {
                var sourcearray = viewModel.AmortizationPeriodCalculateDate.HaveDataList();
            }
            else
                return "";

            var tmparray = $.grep(sourcearray, function (n) {
                return n.ItemCode() == keycode;
            });

            valuecode = (valuecode == null || typeof valuecode == "undefined" ? "ItemValue" : valuecode);
            if (tmparray != null && typeof tmparray != "undefined" && tmparray.length > 0)
                return tmparray[0][valuecode]();
            else
                return "";
        }
        //---end 

        function init(api) {
            viewModel = new viewModelObject();
            var data = api.getCategoryData('TrustExtensionItem');

            
            var itemIsTopUpAvailable = getIsTopUpAvailable(api);//获取是否支持循环购买
            if (itemIsTopUpAvailable) { data.unshift(itemIsTopUpAvailable) } //添加到数据源绑定到页面

            //debugger
            initViewModel(data);
            viewModel = ko.mapping.fromJS(viewModel);
            var node = document.getElementById('TrustExtensionDiv');
            ko.applyBindings(viewModel, node);
            subscribeR();

            CompareTargetUpdate(viewModel.AmortizationPeriod.HaveDataList(), viewModel.CompareTargetArry);
            CompareTargetUpdate(viewModel.ForEachPeriod.HaveDataList(), viewModel.ForEachCompareTargetArry);
            InitPublicTradingdays();
            dateSetType();

            stepActive.render();//根据是否支持循环购买决定是否显示循环期
            $("[data-id='IsTopUpAvailable']").parent().next().children().children().attr('disabled', 'disabled');//是否循环购买不可编辑
          
           
        }

        //从产品信息里显示获取是否循环购买
        function getIsTopUpAvailable(api) {
            var trustItemData = api.getCategoryData('TrustItem');
            var itemIsTopUpAvailable;
            trustItemData.map(function (item, index, arr) {
                if (item.ItemCode == iCodeIsTopUpAvailable) {
                    itemIsTopUpAvailable = item;
                }
            });
            return itemIsTopUpAvailable
        }

        function initViewModel(data) {
            viewModel.ForEachPeriod.HaveDataList = [];
            viewModel.ForEachPeriod.NoHaveDataList = [];
            var bvlist = {}, blist = {}, rvlist = {}, rlist = {};
            $.each(data, function (i, n) {
                if (RVListRule.Math.test(n.ItemCode) && n.IsCalculated == "True") {//循环期-相对部分
                    SetVDateObjArr(rvlist, n);

                } else if (RListRule.Math.test(n.ItemCode) && !RVListRule.Math.test(n.ItemCode)) {//循环期-基准日部分
                    SetBaseDateObjArr(rlist, n);

                } else if (BVListRule.Math.test(n.ItemCode)) {//摊还期-相对部分
                    SetVDateObjArr(bvlist, n);

                } else if (BListRule.Math.test(n.ItemCode) && !BVListRule.Math.test(n.ItemCode)) {//摊还期-基准日部分
                    SetBaseDateObjArr(blist, n);

                }
                else {//基本信息
                    SetHaveAndNoData(n, viewModel.BaseInfo.HaveDataList,
                        viewModel.BaseInfo.NoHaveDataList);
                }
            });
            
            SetBaseDateHaveAndNoData(rlist, viewModel.ForEachPeriod.HaveDataList, viewModel.ForEachPeriod.NoHaveDataList);
            //SetVDateHaveAndNoData(rvlist, viewModel.ForEachPeriodCalculateDate.HaveDataList, viewModel.ForEachPeriodCalculateDate.NoHaveDataList);
            SetVDateHaveAndNoData(rvlist, viewModel.ForEachPeriodCalculateDate.HaveDataList, viewModel.ForEachPeriodCalculateDate.NoHaveDataList, viewModel.ForEachPeriod.HaveDataList, viewModel.ForEachPeriodCalculateDate.MergeDataList);
            SetBaseDateHaveAndNoData(blist, viewModel.AmortizationPeriod.HaveDataList, viewModel.AmortizationPeriod.NoHaveDataList);
            //SetVDateHaveAndNoData(bvlist, viewModel.AmortizationPeriodCalculateDate.HaveDataList, viewModel.AmortizationPeriodCalculateDate.NoHaveDataList);
            SetVDateHaveAndNoData(bvlist, viewModel.AmortizationPeriodCalculateDate.HaveDataList, viewModel.AmortizationPeriodCalculateDate.NoHaveDataList, viewModel.AmortizationPeriod.HaveDataList, viewModel.AmortizationPeriodCalculateDate.MergeDataList);

            //$.each(viewModel.AmortizationPeriodCalculateDate.HaveDataList(), function (i, v) {
            //    if (v.ItemCode().replace('B_V_', '') == 'PaymentDate') {
            //        $.each(viewModel.AmortizationPeriod.NoHaveDataList(), function (i2, v2) {
            //            if (v2.ItemCode().replace('B_', '') == 'PaymentDate') {
            //                viewModel.AmortizationPeriod.NoHaveDataList().remove(v2);
            //                paymentDateObj = v2;
            //            }
            //        })
            //        $.each(viewModel.AmortizationPeriod.HaveDataList(), function (i3, v3) {
            //            if (v3.ItemCode().replace('B_', '') == 'PaymentDate') {
            //                viewModel.AmortizationPeriod.NoHaveDataList().remove(v3);
            //                paymentDateObj =v3;
            //            }
            //        })

            //    }
            //})
            function SetVDateObjArr(list, n) {
                var itemcode, itemtype;
                if (n.IsPrimary == "True") {
                    itemcode = n.ItemCode;
                    itemtype = "main";
                } else {
                    itemcode = n.ItemCode.substring(0, n.ItemCode.lastIndexOf("_"));
                    itemtype = n.ItemCode.substr(n.ItemCode.lastIndexOf("_") + 1);
                }
                var tmp = list[itemcode];
                if (tmp == null || typeof tmp == "undefined") {
                    tmp = tableColumn(itemcode, "", "", "", "", "", true);
                }
                if (itemtype == "main") {
                    tmp.DisplayName = n.ItemAliasValue;
                    tmp.ItemValue = n.ItemValue;
                } else if (itemtype == "CT") {
                    tmp.CompareTarget = n.ItemValue;
                } else if (itemtype == "DC") {
                    tmp.DateCount = n.ItemValue;
                } else if (itemtype == "CD") {
                    tmp.CalendarType = n.ItemValue;
                }
                list[itemcode] = tmp;
            }
            function SetBaseDateObjArr(list, n) {
                var code, type, value, attrFromDB;
                if (n.ItemCode.endWith('_FirstDate') || n.ItemCode.endWith('_Frequency') || n.ItemCode.endWith('_WorkingDateAdjustment') || n.ItemCode.endWith('_Calendar')
                    || n.ItemCode.endWith('_Condition') || n.ItemCode.endWith('_ConditionTarget') || n.ItemCode.endWith('_ConditionDay') || n.ItemCode.endWith('_ConditionCalendar')) {
                    code = n.ItemCode.substring(0, n.ItemCode.lastIndexOf("_"));
                    type = n.ItemCode.substr(n.ItemCode.lastIndexOf("_") + 1);
                    value = (n.ItemCode.endWith('_Condition') ? (n.ItemValue == 'True') : n.ItemValue);
                }
                else {
                    code = n.ItemCode;
                    type = 'ItemAliasValue';
                    value = n.ItemAliasValue;
                    attrFromDB = n;
                }
                if (!list[code]) {
                    list[code] = baseDateColumn(code, '', '', '', '', '', '', '', '', '', '');
                }
                if (attrFromDB && !list[code]['attrFromDB']) list[code]['attrFromDB'] = attrFromDB;

                list[code][type] = value;
            }

            function SetBaseDateHaveAndNoData(list, arr1, arr2) {
                $.each(list, function (i, n) {
                    if (n.FirstDate)
                        arr1.push(n);
                    else
                        arr2.push(n);
                })
            }
            //function SetVDateHaveAndNoData(list, arr1, arr2) {
            //    $.each(list, function (i, n) {
            //        if (n.DateCount)
            //            arr1.push(n);
            //        else
            //            arr2.push(n);
            //    })
            //}
            function SetVDateHaveAndNoData(list, arr1, arr2, arr3, arr4) {
                var removeFromNoDataListArr = [];
                if (arr3.length > 0) {
                    
                    $.each(arr3, function (i, n) {
                        if (n.ItemCode) {
                            var temp = n.ItemCode.split('_');
                            if (temp.length > 0) {
                                removeFromNoDataListArr.push(temp[temp.length - 1].toLocaleLowerCase())
                            }
                        }
                    });
                }
                $.each(list, function (i, n) {
                    if (n.DateCount) {
                        arr1.push(n);
                    } else if (removeFromNoDataListArr.length > 0) {
                        var temp = n.ItemCode.split('_');
                        if (temp.length > 0) {
                            if ($.inArray(temp[temp.length - 1].toLocaleLowerCase(), removeFromNoDataListArr) < 0) {
                                arr2.push(n);
                            } else {
                                arr4.push(n);
                            }
                        }
                    } else {
                        arr2.push(n);
                    }
                        
                })
            }
          
            function SetHaveAndNoData(n, arr1, arr2) {
              
//TODO YANGYINIGONG               
            	//var CanDel = (n.IsCompulsory == false);
            	var CanDel = (n.IsCompulsory.toLocaleLowerCase() == "false");
                var singledata = singleColumn(n.ItemCode, n.ItemAliasValue, n.ItemValue, n.DataType, CanDel, n.IsCompulsory, n.UnitOfMeasure, n.Precise);
                  n.ItemValue=n.ItemValue==null?"":n.ItemValue;//加判断
                var isShow = (n.IsCompulsory == "True" || n.ItemValue.toString().length > 0);
                
//                var isShow = (n.IsCompulsory == true || n.ItemValue.length > 0);
                if (n.ItemCode == 'IsTopUpAvailable' && (n.ItemValue == '' || n.ItemValue == '0')) {
                    IsTopUpAvailableFlag = false;
                }
                
                //如果不支持循环结构，那么‘循环期长选项’置为备选
                if (!IsTopUpAvailableFlag && n.ItemCode == 'RevolvingPeriod') {
                    arr2.push(singledata);
                    return
                } else if (IsTopUpAvailableFlag && n.ItemCode == 'RevolvingPeriod') {
                    arr1.push(singledata);
                    return
                }
                if (isShow)
                    arr1.push(singledata);
                else
                    arr2.push(singledata);

            }
        }

        function update() {
            var TEResult = [];

            /**
             *
             * errorCode 1 计息期间为计息日期间 (加入计息日验证)
             * errorCode 2 计息期间为分配日期间 （加入信托分配日验证）
             *
            **/
            var Validation = {
                errorCode: null,
                errorMsg: "",
                isInForeachPeriod: false, // 是否存在循环期
                isForeachPeriodError: true, // 是否抛出循环期错误提示
                isAmortizationPeriodError: true // 是否抛出摊还期错误提示
            };
            if (viewModel.BaseInfo.HaveDataList().length > 0) {//基础信息部分
                $.each(viewModel.BaseInfo.HaveDataList(), function (i, n) {
                    if (n.ItemCode() === "PaymentPeriod") {
                        if (n.ItemValue() === "InterestCollectionDate") {//计息日期间
                            Validation.errorCode = 1;
                            Validation.errorMsg = lang.tab6;
                        } else if (n.ItemValue() === "AllocationDate") {//分配日期间
                            Validation.errorCode = 2;
                            Validation.errorMsg = lang.tab7;
                        } else if (n.ItemValue() === "PaymentDate") {//兑付日期期间
                            Validation.errorCode = 3;
                            Validation.errorMsg = lang.tab8;
                        }
                    }

                    if (n.ItemCode() === "IsTopUpAvailable" && n.ItemValue()) {
                        Validation.isInForeachPeriod = true;
                    }
                    TEResult.push(GetTEResultTemplate(n.ItemCode(), n.ItemValue(), n.DataType(), n.UnitOfMeasure(), n.Precise()));
                });
            }
            if (viewModel.ForEachPeriod.HaveDataList().length > 0) {//循环期上半部分
                $.each(viewModel.ForEachPeriod.HaveDataList(), function (i, n) {
                    if (Validation.errorCode === 1) {
                        // 如果存在计息日就不抛出
                        if (n.ItemCode() === "R_InterestCollectionDate") {
                            Validation.isForeachPeriodError = false;
                        }
                    } else if (Validation.errorCode === 2) {
                        if (n.ItemCode() === "R_AllocationDate") {
                            Validation.isForeachPeriodError = false;
                        }
                    } else if (Validation.errorCode === 3) {
                        if (n.ItemCode() === "R_PaymentDate") {
                            Validation.isForeachPeriodError = false;
                        }
                    }
                    getBaseDate(i, n, TEResult);
                });
            }
            if (viewModel.ForEachPeriodCalculateDate.HaveDataList().length > 0) {//循环期日期计算部分
                $.each(viewModel.ForEachPeriodCalculateDate.HaveDataList(), function (i, n) {
                    if (Validation.errorCode === 1) {
                        // 如果存在计息日就不抛出
                        if (n.ItemCode() === "R_V_InterestCollectionDate") {
                            Validation.isForeachPeriodError = false;
                        }
                    } else if (Validation.errorCode === 2) {
                        if (n.ItemCode() === "R_V_AllocationDate") {
                            Validation.isForeachPeriodError = false;
                        }
                    } else if (Validation.errorCode === 3) {
                        if (n.ItemCode() === "R_V_PaymentDate") {
                            Validation.isForeachPeriodError = false;
                        }
                    }
                });
            }
            if (viewModel.ForEachPeriodCalculateDate.HaveDataList().length > 0) {//循环期日期计算部分
                $.each(viewModel.ForEachPeriodCalculateDate.HaveDataList(), function (i, n) {
                    getJsr(i, n, TEResult);
                });
            }
            if (viewModel.AmortizationPeriod.HaveDataList().length > 0) {//摊还期上半
                $.each(viewModel.AmortizationPeriod.HaveDataList(), function (i, n) {
                    if (Validation.errorCode === 1) {
                        // 如果存在计息日就不抛出
                        if (n.ItemCode() === "B_InterestCollectionDate") {
                            Validation.isAmortizationPeriodError = false;
                        }
                    } else if (Validation.errorCode === 2) {
                        if (n.ItemCode() === "B_AllocationDate") {
                            Validation.isAmortizationPeriodError = false;
                        }
                    } else if (Validation.errorCode === 3) {
                        if (n.ItemCode() === "B_PaymentDate") {
                            Validation.isAmortizationPeriodError = false;
                        }
                    }
                    getBaseDate(i, n, TEResult);
                });
            }
            if (viewModel.AmortizationPeriodCalculateDate.HaveDataList().length > 0) {//摊还期日期计算部分
                $.each(viewModel.AmortizationPeriodCalculateDate.HaveDataList(), function (i, n) {
                    if (Validation.errorCode === 1) {
                        // 如果存在计息日就不抛出
                        if (n.ItemCode() === "B_V_InterestCollectionDate") {
                            Validation.isAmortizationPeriodError = false;
                        }
                    } else if (Validation.errorCode === 2) {
                        if (n.ItemCode() === "B_V_AllocationDate") {
                            Validation.isAmortizationPeriodError = false;
                        }
                    } else if (Validation.errorCode === 3) {
                        if (n.ItemCode() === "B_V_PaymentDate") {
                            Validation.isAmortizationPeriodError = false;
                        }
                    }
                });
            }
            if (viewModel.AmortizationPeriodCalculateDate.HaveDataList().length > 0) {//摊还期日期计算部分
                $.each(viewModel.AmortizationPeriodCalculateDate.HaveDataList(), function (i, n) {
                    getJsr(i, n, TEResult);
                });
            }
            if (Validation.errorCode !== null) {
                if (Validation.isForeachPeriodError && Validation.isInForeachPeriod) {
                    isSuccessed = false;
                    if (Validation.isAmortizationPeriodError) {
                        GSDialog.HintWindow(lang.tab9 + Validation.errorMsg + lang.tab10);
                    } else {
                        GSDialog.HintWindow(lang.tab11 + Validation.errorMsg + lang.tab12);
                    }
                }
                else if (Validation.isAmortizationPeriodError) {
                    isSuccessed = false;
                    GSDialog.HintWindow(lang.tab13 + Validation.errorMsg + lang.tab14);
                } else {
                    isSuccessed = true;
                }
            } else {
                isSuccessed = true;
            }
            function getBaseDate(i, n, TEResult) {
                TEResult.push(GetTEResultTemplate(n.ItemCode(), "", "", ""));
                $.each(n, function (code, item) {
                    if (code != 'ItemAliasValue' && code != 'ItemCode' && code != 'ItemValue' && code != 'attrFromDB') {
                        TEResult.push(GetTEResultTemplate(n.ItemCode() + "_" + code, n[code](), "", ""));
                    }
                })
            }
            function getJsr(i, n, TEResult) {
                var ivalue = n.ItemValue();
                //if (ivalue && $.trim(ivalue).length > 0) {
                TEResult.push(GetTEResultTemplate(n.ItemCode(), ivalue, "", ""));
                TEResult.push(GetTEResultTemplate(n.ItemCode() + "_CT", n.CompareTarget(), "", ""));
                TEResult.push(GetTEResultTemplate(n.ItemCode() + "_DC", n.DateCount(), "", ""));
                TEResult.push(GetTEResultTemplate(n.ItemCode() + "_CD", n.CalendarType(), "", ""));
                //}
            }

            return TEResult;
        }

        function GetTEResultTemplate(ItemCode, ItemValue, DataType, UnitOfMeasure, Precise) {
            return TRUST.api.getTemplate(PageCode, "", "", "", "", "", ItemCode, ItemValue, DataType, UnitOfMeasure, Precise);
        }

        function preview() {

            var TETemplate = '<div class="ItemBox"><h3 class="h3">{0}</h3><div class="ItemInner">{1}</div></div>';
            var TERTemplate = "<div class='Item'><label>{0}</label><span>{1}</span></div>";
            var TERTmp = "";
            if (viewModel.BaseInfo.HaveDataList().length > 0) {
                $.each(viewModel.BaseInfo.HaveDataList(), function (i, n) {
                    TERTmp += TERTemplate.format(n.ItemAliasValue(), n.ItemValue());
                });
            }
            return '';
        }

        //---获取Calendar---
        function GetCalendarDate(params, callback) {
            var GetHolidaysUrl = GlobalVariable.DataProcessServiceUrl + "GetPublicHolidays/TrustManagement/" + params.startdatestr + "/" + params.areaname;
            $.ajax({
                type: "GET",
                url: GetHolidaysUrl,
                dataType: "jsonp",
                crossDomain: true,
                contentType: "application/json;charset=utf-8",
                success: function (response) {
                	
                    if (callback)
                        callback(response);
                },
                error: function (response) {
                    GSDialog.HintWindow("GetCalendarDate error:" + response);
                    if (callback)
                        callback(response);
                }
            });
        }
        //初始化PublicHolidays
        function InitPublicHolidays() {
            var myDate = new Date();
            var startdatestr = (myDate.getFullYear() - 1) + "-" + (myDate.getMonth() + 1) + "-" + myDate.getDate();//"2016-04-26";
            var areaname = lang.tab15;
            GetCalendarDate({ startdatestr: startdatestr, areaname: areaname }, function (response) {
                console.log(lang.tab16);
                console.log(response);
                if (response && response.length > 0) {

                }
                else {
                    NoCalendarTypeSet('WorkingDay');
                }

                InitPublicTradingdays(function () {

                });
            });
        }
        function InitPublicTradingdays(callback) {
            var self = TrustExtensionNameSpace;

            var myDate = new Date();
            var startdatestr = (myDate.getFullYear() - 1) + "-" + (myDate.getMonth() + 1) + "-" + myDate.getDate();//"2016-04-26";
            var areaname = lang.tab15;
            GetCalendarDate({ startdatestr: startdatestr, areaname: areaname }, function (response) {

                if (response && response.length > 0) {

                } else {
                    NoCalendarTypeSet('TradingDay');
                }

                if (callback)
                    callback();
            });
        }
        function NoCalendarTypeSet(TypeName) {
            RemoveCalendarType(TypeName);
            ChangeToFirstCalendarType(TypeName);


        }
        function RemoveCalendarType(typename) {
            $.each(viewModel.CalendarType(), function (i, n) {
                if (n.Value() == typename) {
                    viewModel.CalendarType.remove(n);
                    return false;
                }
            });
            $.each(viewModel.ConditionCalendarType(), function (i, n) {
                if (n.Value() == typename) {
                    viewModel.ConditionCalendarType.remove(n);
                    return false;
                }
            });
        }
        function ChangeToFirstCalendarType(typename) {
            //相对日期CalendarType
            var defalutTypeName = viewModel.CalendarType()[0].Value();
            Tmp(viewModel.AmortizationPeriodCalculateDate.HaveDataList, 'CalendarType', typename, defalutTypeName);
            Tmp(viewModel.ForEachPeriodCalculateDate.HaveDataList, 'CalendarType', typename, defalutTypeName);

            //基准日Calendar
            var defalutTypeName = viewModel.ConditionCalendarType()[0].Value();
            Tmp(viewModel.AmortizationPeriod.HaveDataList, 'Calendar', typename, defalutTypeName);
            Tmp(viewModel.ForEachPeriod.HaveDataList, 'Calendar', typename, defalutTypeName);

            //基准日ConditionCalendar
            //var defalutTypeName = viewModel.ConditionCalendarType()[0].Value();
            Tmp(viewModel.AmortizationPeriod.HaveDataList, 'ConditionCalendar', typename, defalutTypeName);
            Tmp(viewModel.ForEachPeriod.HaveDataList, 'ConditionCalendar', typename, defalutTypeName);

            function Tmp(koTmp, columnName, typename, defaulttypename) {
                $.each(koTmp(), function (i, n) {
                    if (n[columnName]() == typename) {
                        n[columnName](defaulttypename);
                    }
                })
            }
        }


        //字段列实体
        function baseDateColumn(ItemCode, ItemValue, ItemAliasValue, FirstDate, Frequency, WorkingDateAdjustment, Calendar, Condition, ConditionTarget, ConditionDay, ConditionCalendar) {
            return { ItemCode: ItemCode, ItemValue: ItemValue, ItemAliasValue: ItemAliasValue, FirstDate: FirstDate, Frequency: Frequency, WorkingDateAdjustment: WorkingDateAdjustment, Calendar: Calendar, Condition: Condition, ConditionTarget: ConditionTarget, ConditionDay: ConditionDay, ConditionCalendar: ConditionCalendar };
        }

        function singleColumn(ItemCode, ItemAliasValue, ItemValue, DataType, CanDel, IsCompulsory, UnitOfMeasure, Precise) {
            return { "ItemCode": ItemCode, "ItemAliasValue": ItemAliasValue, "ItemValue": ItemValue, "DataType": DataType, "CanDel": CanDel, "IsCompulsory": IsCompulsory, "UnitOfMeasure": UnitOfMeasure, "Precise": Precise };
        }

        function tableColumn(ItemCode, DisplayName, ItemValue, CompareTarget, DateCount, CalendarType, IsShow) {
            return {
                ItemCode: ItemCode,
                DisplayName: DisplayName,
                ItemValue: ItemValue,
                CompareTarget: CompareTarget,
                DateCount: DateCount,
                CalendarType: CalendarType,
                IsShow: IsShow
            };
        }

        //===页面事件操作相关===

        function addBase(obj) {
            var _obj = $(obj).parent().parent();
            var dvcode = _obj.find(".form-control:eq(0) option:selected");
            var index0 = dvcode.attr('dataIndex');

            if (viewModel.BaseInfo.NoHaveDataList().length > parseInt(index0)) {
                var oNew = viewModel.BaseInfo.NoHaveDataList()[index0];
                console.log(oNew)
                viewModel.BaseInfo.NoHaveDataList.remove(oNew);
                viewModel.BaseInfo.HaveDataList.push(oNew);
                dateSetType();

            } else {
                return false;
            }
        }

        function deleteBase(obj) {
            var rowindex = $(obj).attr('dataIndex');
            var item = viewModel.BaseInfo.HaveDataList()[rowindex];
            viewModel.BaseInfo.HaveDataList.remove(item);
            viewModel.BaseInfo.NoHaveDataList.push(item);
        }
        //查看日期周期
        function SeePerid() {
            var page = location.protocol + '//' + location.host + '/GoldenStandABS/www/components/viewDateSet/SeePerid.html?tid=' + trustId;
            GSDialog.open('日期周期', page, "", 1, 800, 400, '', '', true, true, false);
        }
        //选择计息期间的
        function selectPrieodIntr(info, a, b) {
            //进入页面，默认选择：兑付日期间；基准日模块一直显示：计算日、兑付日；且可手动删除；
            //选择兑付日期间，显示计算日、兑付日；
            //选择计息期间，显示计算日、兑付日、计息日；选择分配日期间，显示计算日、兑付日、分配日；


            var cloneData = a()
            var cloneData2 = b()
            var delArr = [], addArr = []
            $.each(cloneData, function (i, v) {
                var selectsign = v.ItemCode().substring(2, v.ItemCode().length);
                var flag = null;
                switch (info) {
                    case 'PaymentDate':
                        if (selectsign == 'AllocationDate' || selectsign == 'InterestCollectionDate') delArr.push(v)

                        break;
                    case 'AllocationDate':
                        if (selectsign == 'InterestCollectionDate') delArr.push(v)
                        break;
                    case 'InterestCollectionDate':
                        if (selectsign == 'AllocationDate') delArr.push(v)
                        break;
                    default:
                        break;
                }
            })
            $.each(cloneData2, function (i, v) {
                var selectsign = v.ItemCode().substring(2, v.ItemCode().length);
                var flag = null
                switch (info) {
                    case 'PaymentDate':
                        flag = (selectsign == 'PaymentDate' || selectsign == 'CollectionDate')
                        break;
                    case 'AllocationDate':
                        flag = (selectsign == 'PaymentDate' || selectsign == 'CollectionDate' || selectsign == 'AllocationDate')
                        break;
                    case 'InterestCollectionDate':
                        flag = (selectsign == 'PaymentDate' || selectsign == 'CollectionDate' || selectsign == 'InterestCollectionDate')
                        break;
                    default:
                        break;
                }
                if (flag) {
                    addArr.push(v)
                }
            })
            $.each(addArr, function (i, v) {
                b.remove(v);
                a.push(v);
            })
            $.each(delArr, function (i, v) {
                a.remove(v);
                b.push(v);
            })
        }

        var iflag = true;

        viewselect = function viewselect(obj) {
            var value = $(obj).val();
            if (value == 'PaymentDate') {
                tips = '必填日期：兑付日、计算日';
            } else if (value == 'AllocationDate') {
                tips ='必填日期：信托分配日、计算日、兑付日'
            } else {
                tips ='必填日期：计息日、计算日、兑付日'
            }
            $("#tips").text(tips);
            $(obj).removeClass("red-border")
            dateSetType()

        }

        function addR(obj, _type) {
            var _obj = $(obj).parent().parent();
            var dvcode = _obj.find(".form-control:eq(0) option:selected");
            var index = parseInt(dvcode.attr('dataIndex'));
            var id = $(obj).parents(".form-panel.drop").next()[0].id;
            if ($.isNumeric(obj)) {
                index = obj
            }
            if (_type == calcDateType.foreach && viewModel.ForEachPeriod.NoHaveDataList().length > index) {
                var oNew = viewModel.ForEachPeriod.NoHaveDataList()[index];
                var oNewCode = oNew.ItemCode().replace('R_', '');
                var periodCalcHave = viewModel.ForEachPeriodCalculateDate.HaveDataList();
                var isAllowAdd = true;
                if (periodCalcHave.length > 0) {
                    periodCalcHave.forEach(function (v, i) {
                        if (v.ItemCode().replace('R_V_', '') === oNewCode) {
                            isAllowAdd = false;
                        }
                    });
                }
                if (!isAllowAdd) {
                    GSDialog.HintWindow(lang.tab17 + oNew.ItemAliasValue());
                    return;
                }
                var foreachCalcNo = viewModel.ForEachPeriodCalculateDate.NoHaveDataList();
                //var count = periodCalc.length;

                oNew.Frequency("1"); // 间隔期长为0时会保存失败，所以我给它默认为1
                viewModel.ForEachPeriod.NoHaveDataList.remove(oNew);
                viewModel.ForEachPeriod.HaveDataList.push(oNew);
                $("#" + id).find("tbody tr:last").hide();
                $("#" + id).find("tbody tr:last").find(".option .edit").trigger("click")
                //互斥判断
                for (var i = 0; i < foreachCalcNo.length; i++) {
                    if (foreachCalcNo[i].ItemCode().replace('R_V_', '') === oNewCode) {
                        viewModel.ForEachPeriodCalculateDate.MergeDataList.push(foreachCalcNo[i]);
                        viewModel.ForEachPeriodCalculateDate.NoHaveDataList.remove(foreachCalcNo[i]);
                        dateSetType();
                        return;
                    }
                }
                dateSetType();

            } else if (_type == calcDateType.date && viewModel.AmortizationPeriod.NoHaveDataList().length > index) {
                var oNew = viewModel.AmortizationPeriod.NoHaveDataList()[index];
                var oNewCode = oNew.ItemCode().replace('B_', '');
                var amortizationCalcHave = viewModel.AmortizationPeriodCalculateDate.HaveDataList();
                var isAllowAdd = true;
                if (amortizationCalcHave.length > 0) {
                    amortizationCalcHave.forEach(function (v, i) {
                        if (v.ItemCode().replace('B_V_', '') === oNewCode) {
                            isAllowAdd = false;
                        }
                    });
                }
                if (!isAllowAdd) {
                    GSDialog.HintWindow(lang.tab18 + oNew.ItemAliasValue());
                    return;
                }
                var amortizationCalcNo = viewModel.AmortizationPeriodCalculateDate.NoHaveDataList();
                //var count = periodCalc.length;

                oNew.Frequency("1"); // 间隔期长为0时会保存失败，所以我给它默认为1
                viewModel.AmortizationPeriod.NoHaveDataList.remove(oNew);
                viewModel.AmortizationPeriod.HaveDataList.push(oNew);
                $("#" + id).find("tbody tr:last").hide();
                $("#" + id).find("tbody tr:last").find(".option .edit").trigger("click")
                //互斥判断
                for (var i = 0; i < amortizationCalcNo.length; i++) {
                    if (amortizationCalcNo[i].ItemCode().replace('B_V_', '') === oNewCode) {
                        viewModel.AmortizationPeriodCalculateDate.MergeDataList.push(amortizationCalcNo[i]);
                        viewModel.AmortizationPeriodCalculateDate.NoHaveDataList.remove(amortizationCalcNo[i]);
                        dateSetType();
                        return;
                    }
                }
                dateSetType();
            }
            else {
                return false;
            }
        }
        function deleteR(obj, _type) {
            var rowindex = parseInt($(obj).attr('dataIndex'));
            if ($.isNumeric(obj)) {
                rowindex = obj
            }
            
            if (_type == calcDateType.foreach) {
                var item = viewModel.ForEachPeriod.HaveDataList()[rowindex];
                var itemCode = item.ItemCode().replace('R_', '');
                var periodCalc = viewModel.ForEachPeriodCalculateDate.MergeDataList();
                var count = periodCalc.length;
                //if (itemCode === 'PaymentDate') GSDialog.HintWindow('请将摊还期的兑付日也一起删除');
                viewModel.ForEachPeriod.HaveDataList.remove(item);
                viewModel.ForEachPeriod.NoHaveDataList.unshift(item);

                for (var i = 0; i < count; i++) {
                    if (periodCalc[i].ItemCode().replace('R_V_', '') === itemCode) {
                        viewModel.ForEachPeriodCalculateDate.NoHaveDataList.unshift(periodCalc[i]);
                        viewModel.ForEachPeriodCalculateDate.MergeDataList.remove(periodCalc[i]);
                        return;
                    }
                }

            } else if (_type == calcDateType.date) {
                var item = viewModel.AmortizationPeriod.HaveDataList()[rowindex];
                var itemCode = item.ItemCode().replace('B_', '');
                var periodCalc = viewModel.AmortizationPeriodCalculateDate.MergeDataList();
                var count = periodCalc.length;

                viewModel.AmortizationPeriod.HaveDataList.remove(item);
                viewModel.AmortizationPeriod.NoHaveDataList.unshift(item);

                for (var i = 0; i < count; i++) {
                    if (periodCalc[i].ItemCode().replace('B_V_', '') === itemCode) {
                        viewModel.AmortizationPeriodCalculateDate.NoHaveDataList.unshift(periodCalc[i]);
                        viewModel.AmortizationPeriodCalculateDate.MergeDataList.remove(periodCalc[i]);
                        return;
                    }
                }
            }
        }

        // 根据单位和精度，转化数据
       function ConvertDataByUtil(GetOrSet, DataType, Value, UnitOfMeasure, Precise) {
            if (parseFloat(Value) != Value || (DataType != "Decimal" && DataType != "Int"))
                return Value;
            var mathtype = (GetOrSet == "get" ? "*" : (GetOrSet == "set" ? "/" : ""));
            if (mathtype == "")
                return Value;

            var result, xs;
            var UnitOfMeasureArray = ["One", "Ten", "Hundred", "Thousands", "TenThousands", "HundredThousands", "Million", "TenMillion", "HundredMillion", "Billion", "TenBillion"];
            var index = $.inArray(UnitOfMeasure, UnitOfMeasureArray);

            if (index > 0) {
                xs = Math.pow(10, index);
                var result = GetMathResult(mathtype, parseFloat(Value), Number(xs));
            } else {
                result = Value;
            }

            if (GetOrSet == "get" && DataType == "Decimal" && parseInt(Precise) == Precise && parseInt(Precise) >= 0)
                return Number(result).toFixed(Precise);
            else
                return result;
       }
       function GetMathResult(type, arg1, arg2) {
            var result;
            switch (type) {
                case "*":
                    result = arg1.mul(arg2);
                    break;
                case "/":
                    result = arg1.div(arg2);
                    break;
                default:
                    break;
            }
            return result;
       }
       function getShotTemplate(arr) {
            return { "Category": arr.Category, "SPId": arr.SPId, "SPCode": arr.SPCode, "SPRItemCode": arr.SPRItemCode, "TBId": arr.TBId, "ItemId": arr.ItemId, "ItemCode": arr.ItemCode, "ItemValue": arr.ItemValue };
       }
       //保存信息到working.SessionContext中
      function saveWorkingSessionContext(sessionContext, callback) {
          var serviceUrl = GlobalVariable.DataProcessServiceUrl + "SaveWorkingSessionContextPlus";

            $.ajax({
                type: "POST",
                url: serviceUrl,
                dataType: "json",
                contentType: "application/xml;charset=utf-8",
                data: sessionContext,
                success: function (response) {
                    callback(response);
                },
                error: function (response) { GSDialog.HintWindow("error is :" + response); }
            });
      }
      function alertMsg(text) {
            var alert_tip = $('#alert-tip');
            if (!alert_tip[0]) {
                var $alert = $('<div id="alert-tip" class="alert_tip am-scale-up"/>');
                var $temp = $('<div class="alert_content">' +
                                '<i class="icon icon-roundcheck am-flip"></i>' +
                                '<p>' + text + '</p>' +
                            '</div>');
                $temp.appendTo($alert);
                $alert.appendTo(document.body);
                setTimeout(function () {
                    $('#alert-tip').fadeOut(function () {
                        $(this).remove();
                    });
                }, 1500);
            }
        }
        //分布计算---上半区域计算
        function CountEachUp(_this, type) {
            var datalist = {};
            var arry = [];
            var ReaCount = [];
            var xml = "<items>";
            var sessionId = "";
            if (type == calcDateType.foreach) {//循环期上半
                datalist = viewModel.ForEachPeriod;
                var arys = $("#c_table").find(".checkeach");
                $.each(arys, function (i, v) {
                    if (v.checked) {
                        arry.push($(v).attr("dataIndex"));
                    }
                })
                if (arry.length == 0) {
                    GSDialog.HintWindow('请勾选需要计算的日期类型');
                    return false
                }
                for (var i = 0; i < arry.length; i++) {
                    ReaCount.push(viewModel.ForEachPeriod.HaveDataList()[arry[i]]);
                }
                $.each(ReaCount, function (i, v) {
                    xml += "<item>" + v.ItemCode() + "</item>";
                })
                xml+="</items>"
                sessionStorage.setItem("xmls",xml);
            } else {
                datalist = viewModel.AmortizationPeriod;//摊还期上半
                var arys = $("#A_table").find(".checkeach");
                $.each(arys, function (i, v) {
                    if (v.checked) {
                        arry.push($(v).attr("dataIndex"));
                    }
                })
                if (arry.length == 0) {
                    $.toast({ type: 'warning', message: '请勾选需要计算的日期类型' })
                    return false
                }
                for (var i = 0; i < arry.length; i++) {
                    ReaCount.push(viewModel.AmortizationPeriod.HaveDataList()[arry[i]]);
                }
                $.each(ReaCount, function (i, v) {
                    xml += "<item>" + v.ItemCode() + "</item>";
                })
                xml += "</items>"
                sessionStorage.setItem("xmls", xml);
            }
            //获取sesstionID
            var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
            var sessionContext = '', sessionContextArray = [];
            var executeParam = {
                SPName: 'usp_SpecialPlanStateDateAllow', SQLParams: [
                { Name: 'TrustId', value:trustId, DBType: 'int' },
                ]
            }
            var flag = true;
            common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (response) {
                if (response[0].result == "0") {
                    flag = false
                }
            })
            if (!flag) {
                $.toast({ type: 'warning', message: '产品已发行状态不允许修改日期' });
                return false
            }
            var updateArray = update();
            $.each(updateArray, function (i, n) {
                if (!(n == "" || n == 'undifined' || n == null)) {
                    n.ItemValue = ConvertDataByUtil("get", n.DataType, n.ItemValue, n.UnitOfMeasure, n.Precise);
                    sessionContextArray.push(getShotTemplate(n));
                }
            });
            sessionContext = JSON.stringify(sessionContextArray);
            sessionContext = "<SessionContext>{0}</SessionContext>".format(sessionContext);
            saveWorkingSessionContext(sessionContext, function (sessionId) {
                var xml = sessionStorage.getItem("xmls");
                sessionStorage.setItem("sessionIds", sessionId);
                sessionStorage.removeItem("xmls");
                var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
                var executeParam = {
                    SPName: 'usp_SaveCaculateDateCode', SQLParams: [
                    { Name: 'items', value: xml, DBType: 'xml' },
                    { Name: 'SessionId', value: sessionId, DBType: 'string' },
                    ]
                }
                common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (response) {
                    var sessionId = sessionStorage.getItem("sessionIds");
                    var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
                    var executeParam = {
                        SPName: 'usp_GetTrustByTrustId', SQLParams: [
                        { Name: 'TrustId', value: trustId, DBType: 'int' },
                        ]
                    }
                    var trustCode = common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) { return data[0].TrustCode });
                    trustCode = trustCode[0].TrustCode;
                    sVariableBuilder.AddVariableItem('WorkSessionId', sessionId, 'String', 0, 0, 0);
                    sVariableBuilder.AddVariableItem('TrustId', trustId, 'Int', 0, 0, 0);
                    sVariableBuilder.AddVariableItem('TrustCode', trustCode, 'String', 0, 0, 0);
                    var sVariable = sVariableBuilder.BuildVariables();
                    var tIndicator = new taskIndicator({
                        width: 500,
                        height: 550,
                        clientName: 'TaskProcess',
                        appDomain: 'Task',
                        taskCode: 'CaculateBaseDate',
                        sContext: sVariable,
                        callback: function () {

                        }
                    });
                    tIndicator.show();
                })

            });
            //self.api.alertMsg('保存成功!');
        }
        //分布计算---下半区域计算
        function CountEachDown(_this, type) {
            var datalist = {};
            var arry = [];
            var ReaCount = [];
            var xml = "<items>";
            var sessionId = "";
            if (type == calcDateType.foreach) {//循环期上半
                datalist = viewModel.ForEachPeriodCalculateDate;
                var arys = $("#CperiodDate").find(".checkeach");
                $.each(arys, function (i, v) {
                    if (v.checked) {
                        arry.push($(v).attr("dataIndex"));
                    }
                })
                if (arry.length == 0) {
                    $.toast({ type: 'warning', message: '请勾选需要计算的日期类型' });
                    return false
                }
                for (var i = 0; i < arry.length; i++) {
                    ReaCount.push(viewModel.ForEachPeriodCalculateDate.HaveDataList()[arry[i]]);
                }
                $.each(ReaCount, function (i, v) {
                    xml += "<item>" + v.ItemCode() + "</item>";
                })
                xml += "</items>"
                sessionStorage.setItem("xmls", xml);
            } else {
                datalist = viewModel.AmortizationPeriodCalculateDate;//摊还期上半
                var arys = $("#AperiodTable").find(".checkeach");
                $.each(arys, function (i, v) {
                    if (v.checked) {
                        arry.push($(v).attr("dataIndex"));
                    }
                })
                if (arry.length == 0) {
                    $.toast({ type: 'warning', message: '请勾选需要计算的日期类型' });
                    return false
                }
                for (var i = 0; i < arry.length; i++) {
                    ReaCount.push(viewModel.AmortizationPeriodCalculateDate.HaveDataList()[arry[i]]);
                }
                $.each(ReaCount, function (i, v) {
                    xml += "<item>" + v.ItemCode() + "</item>";
                })
                xml += "</items>"
                sessionStorage.setItem("xmls", xml);
            }
            //获取sesstionID
            var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
            var sessionContext = '', sessionContextArray = [];
            var executeParam = {
                SPName: 'usp_SpecialPlanStateDateAllow', SQLParams: [
                { Name: 'TrustId', value: trustId, DBType: 'int' },
                ]
            }
            var flag = true;
            common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (response) {
                if (response[0].result == "0") {
                    flag = false
                }
            })
            if (!flag) {
                $.toast({ type: 'warning', message: '产品已发行状态不允许修改日期' });
                return false
            }
            var updateArray = update();
            $.each(updateArray, function (i, n) {
                if (!(n == "" || n == 'undifined' || n == null)) {
                    n.ItemValue = ConvertDataByUtil("get", n.DataType, n.ItemValue, n.UnitOfMeasure, n.Precise);
                    sessionContextArray.push(getShotTemplate(n));
                }
            });
            sessionContext = JSON.stringify(sessionContextArray);
            sessionContext = "<SessionContext>{0}</SessionContext>".format(sessionContext);
            saveWorkingSessionContext(sessionContext, function (sessionId) {
                var xml = sessionStorage.getItem("xmls");
                sessionStorage.setItem("sessionIds", sessionId);
                sessionStorage.removeItem("xmls");
                var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
                var executeParam = {
                    SPName: 'usp_SaveCaculateDateCode', SQLParams: [
                    { Name: 'items', value: xml, DBType: 'xml' },
                    { Name: 'SessionId', value: sessionId, DBType: 'string' },
                    ]
                }
                common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (response) {
                    var sessionId = sessionStorage.getItem("sessionIds");
                    var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
                    var executeParam = {
                        SPName: 'usp_GetTrustByTrustId', SQLParams: [
                        { Name: 'TrustId', value: trustId, DBType: 'int' },
                        ]
                    }
                    var trustCode = common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) { return data[0].TrustCode });
                    trustCode = trustCode[0].TrustCode;
                    sVariableBuilder.AddVariableItem('WorkSessionId', sessionId, 'String', 0, 0, 0);
                    sVariableBuilder.AddVariableItem('TrustId', trustId, 'Int', 0, 0, 0);
                    sVariableBuilder.AddVariableItem('TrustCode', trustCode, 'String', 0, 0, 0);
                    var sVariable = sVariableBuilder.BuildVariables();
                    var tIndicator = new taskIndicator({
                        width: 500,
                        height: 550,
                        clientName: 'TaskProcess',
                        appDomain: 'Task',
                        taskCode: 'CaulateRelativeDate',
                        sContext: sVariable,
                        callback: function () {

                        }
                    });
                    tIndicator.show();
                })

            });
        }
        //显示循环期日期设置添加列表
        function ShowaddForEachWorkDayDiv() {
            //$("#addForEachWorkDayDiv").show()
            $.anyDialog({
                title: '添加循环期计算日期',
                width: 800,
                height: 200,
                changeallow:false,
                html: $("#addForEachWorkDayDiv").clone(true).show()
            })
        }
        //显示摊还期日期设置添加列表
        function ShowaddWorkDayDiv() {
            $.anyDialog({
                title: '添加摊还期计算日期',
                width: 800,
                height: 200,
                changeallow: false,
                html: $("#addWorkDayDiv").clone(true).show()
            })
        }
        //完成
        function complete(obj) {
            $(obj).parents(".col_style").find("input").removeClass("red-border");
            $(obj).parents(".col_style").find("select").removeClass("red-border");
            var arry = $(obj).parents(".col_style").find("input");
            var checked = $(obj).parents(".col_style").find("input").eq(2)[0].checked
            var go = true;
            var number = arry.eq(1).val();
            //数值验证
            var tex = new RegExp("[^0-9]");
            if (tex.test(number)) {
                arry.eq(1).addClass("red-border")
                go = false;
            }
            //验证
            $.each(arry, function (i, v) {
                if (checked) {
                    if ($(v).val() == "") {
                        go = false;
                        $(v).addClass("red-border")
                    }
                    if (!$(obj).parents(".col_style").find("select").eq(2).val()) {
                        go = false;
                        $(obj).parents(".col_style").find("select").eq(2).addClass("red-border");
                    }
                    if (!$(obj).parents(".col_style").find("select").eq(3).val()) {
                        go = false;
                        $(obj).parents(".col_style").find("select").eq(3).addClass("red-border");
                    }
                } else {
                    if ($(v).val() == ""&&i!=3) {
                        go = false;
                        $(v).addClass("red-border")
                    }
                }
            })
            if (go) {
                $(".ant-drawer-content-wrapper").css("width", "0px");
                $(".ant-drawer-mask").removeClass("open");
                $("#c_table").find("tbody tr:last").show();
                $("#A_table").find("tbody tr:last").show();
            }
        }
        //编辑item
        function edit(obj) {
            var rowindex = parseInt($(obj).attr('dataIndex'));
            var id = $(obj).parents(".tab_list")[0].id;
            var title = $(obj).parents("tr").find(".halayer>span:first").text();
            $("#moveboxtitle span").text(title)
            if (id == "Cycle_period") {
                $("#Amortization_period_hidebox").hide();
                $("#Cycle_period_hidebox").find(".col_style").eq(rowindex).removeClass("hiden").siblings().addClass("hiden");
                $("#Cycle_period_hidebox").show();
                $(".ant-drawer-mask").addClass("open");
                $(".ant-drawer-content-wrapper").css("width", "500px");
            } else {
                $("#Cycle_period_hidebox").hide();
                $("#Amortization_period_hidebox").find(".col_style").eq(rowindex).removeClass("hiden").siblings().addClass("hiden");
                $("#Amortization_period_hidebox").show();
                $(".ant-drawer-mask").addClass("open");
                $(".ant-drawer-content-wrapper").css("width", "500px");
            }
        }
        //打开日历
        function showCalenderUp(obj,type) {
            var rowindex = parseInt($(obj).attr('dataIndex'));
            var name = $(obj).parents('tr').find(".halayer>span").text();
            var datalist = {};
            var startdate=$("#firstbox").find(".date-plugins").eq(0).val();
            var enddate=$("#firstbox").find(".date-plugins").eq(2).val();
            if (type == calcDateType.foreach) {//循环期上半
                datalist = viewModel.ForEachPeriod;
                var cod = viewModel.ForEachPeriod.HaveDataList()[rowindex].ItemCode();
            } else {
                datalist = viewModel.AmortizationPeriod;//摊还期上半
                var cod = viewModel.AmortizationPeriod.HaveDataList()[rowindex].ItemCode();
            }
            var page = location.protocol + '//' + location.host + '/GoldenStandABS/www/components/viewDateSet/DateCalendar.html?tid=' + trustId + "&cod=" + cod + "&startdate=" + startdate + "&enddate=" + enddate;
            GSDialog.open(name, page, "", 1, 800, 400, '', '', true, true, false)
           
        }
        function ShowCalenderDown(obj, type) {
            var rowindex = parseInt($(obj).attr('dataIndex'));
            var datalist = {};
            var startdate = $("#firstbox").find(".date-plugins").eq(0).val();
            var enddate = $("#firstbox").find(".date-plugins").eq(2).val();
            var name = $(obj).parents('tr').find("td").eq(1).find("label").eq(0).text();
            if (type == calcDateType.foreach) {//循环期上半
                datalist = viewModel.ForEachPeriodCalculateDate;
                var cod = viewModel.ForEachPeriodCalculateDate.HaveDataList()[rowindex].ItemCode();

            } else {
                datalist = viewModel.AmortizationPeriodCalculateDate;//摊还期上半
                var cod = viewModel.AmortizationPeriodCalculateDate.HaveDataList()[rowindex].ItemCode();
            }
            var page = location.protocol + '//' + location.host + '/GoldenStandABS/www/components/viewDateSet/DateCalendar.html?tid=' + trustId + "&cod=" + cod + "&startdate=" + startdate + "&enddate=" + enddate;
            GSDialog.open(name, page, "", 1, 800, 400, '', '', true, true, false)

        }
        function dateSetType() {
            $("#TrustExtensionDiv").find('.date-plugins').date_input();
        }


        function addJsr(_this, _type) {
            var jsrList = [];
            if (_type == calcDateType.foreach) {
                jsrList = viewModel.ForEachPeriodCalculateDate;
            }
            else {
                jsrList = viewModel.AmortizationPeriodCalculateDate;
            }

            if (jsrList.NoHaveDataList().length <= 0)
                return;
            var value = [];
            var _obj = $(_this).parent().prev();//(改)
            _obj.find('.form-control').each(function () {
                value.push($(this).val());
            });
            if (typeof value[3] == "undefined" || parseInt(value[3]) != value[3]) {
                GSDialog.HintWindow(lang.tab19);
                return;
            }

            var dvcode = _obj.find(".form-control:eq(0) option:selected");
            var index0 = dvcode.attr('dataIndex'); //.index();

            if (_type == calcDateType.foreach) {
                var oNew = viewModel.ForEachPeriodCalculateDate.NoHaveDataList()[index0];
            }
            else {
                var oNew = viewModel.AmortizationPeriodCalculateDate.NoHaveDataList()[index0];
            }

            var newData = oNew;
            newData.DisplayName(value[0]);
            newData.ItemValue(value[1]);
            newData.CompareTarget(value[2]);
            newData.DateCount(value[3]);
            newData.CalendarType(value[4]);

            if (_type == calcDateType.foreach) {
                viewModel.ForEachPeriodCalculateDate.NoHaveDataList.remove(oNew);
                viewModel.ForEachPeriodCalculateDate.HaveDataList.push(newData);
                $.each(viewModel.ForEachPeriod.NoHaveDataList(), function (i, v) {
                    if (v.ItemCode().replace('R_', '') == oNew.ItemCode().replace('R_V_', '')) {
                        viewModel.ForEachPeriod.NoHaveDataList.remove(v)
                        cPaymentDateObj = v;
                        return false
                    }
                })
            }
            else {
                viewModel.AmortizationPeriodCalculateDate.NoHaveDataList.remove(oNew);
                viewModel.AmortizationPeriodCalculateDate.HaveDataList.push(newData);
                $.each(viewModel.AmortizationPeriod.NoHaveDataList(), function (i, v) {
                    
                    if (v.ItemCode().replace('B_', '') == oNew.ItemCode().replace('B_V_', '')) {
                        viewModel.AmortizationPeriod.NoHaveDataList.remove(v)
                        paymentDateObj = v;
                        return false
                    }
                })
            }

            ShowOrHideJsrRightButton(_type);
            ShowOrHideJsrRightAllSet(_type);
            $.toast({ type: 'success', message: '添加成功' })
            $('#modal-close').click()
            //GSDialog.HintWindow('添加成功');
        }

        function deleteJsr(_this, _type) {
            var index = $(_this).attr("dataIndex");

            var datalist = {};
            if (_type == calcDateType.foreach) datalist = viewModel.ForEachPeriodCalculateDate;
            else datalist = viewModel.AmortizationPeriodCalculateDate;

            var oNew = datalist.HaveDataList()[index];
            datalist.HaveDataList.remove(oNew);
            //fix
            if (_type == calcDateType.foreach) {
                $.each(viewModel.ForEachPeriod.NoHaveDataList(), function (i, v) {
                    if (v.ItemCode().replace('R_', '') == oNew.ItemCode().replace('R_V_', '')) {
                        cPaymentDateObj = v;
                        return false
                    }
                })
            }
            else {
                $.each(viewModel.AmortizationPeriod.NoHaveDataList(), function (i, v) {
                    if (v.ItemCode().replace('B_', '') == oNew.ItemCode().replace('B_V_', '')) {
                        paymentDateObj = v;
                        return false
                    }
                })
            }
            //
            if (oNew.ItemCode().replace('B_V_', '') == 'PaymentDate' || oNew.ItemCode().replace('B_V_', '') == 'InterestCollectionDate' || oNew.ItemCode().replace('B_V_', '') == 'CollectionDate') {
                viewModel.AmortizationPeriod.NoHaveDataList.push(paymentDateObj)
            }
            if (oNew.ItemCode().replace('R_V_', '') == 'PaymentDate' || oNew.ItemCode().replace('R_V_', '') == 'InterestCollectionDate' || oNew.ItemCode().replace('R_V_', '') == 'CollectionDate') {
                viewModel.ForEachPeriod.NoHaveDataList.push(cPaymentDateObj)
            }
            oNew.ItemValue("");
            oNew.CompareTarget("");
            oNew.DateCount("");
            oNew.CalendarType('');
            datalist.NoHaveDataList.push(oNew);

            ShowOrHideJsrRightButton(_type);
            ShowOrHideJsrRightAllSet(_type);
        }
        //循环期日期计算编辑功能
        function EditJsr(_this, _type) {
            var index = $(_this).attr("dataIndex");
            var datalist = {};
            if (_type == calcDateType.foreach) datalist = viewModel.ForEachPeriodCalculateDate;
            else datalist = viewModel.AmortizationPeriodCalculateDate;
            if ($(_this).parents("td").prev().find(".form-control").eq(1).attr("disabled")) {
                $(_this).parents("td").prev().find(".form-control").removeAttr("disabled");
            } else {
                $(_this).parents("td").prev().find(".form-control").attr("disabled",true);
            }
            
        }
        //全选和单选
            //全选
        $("body").on("click", ".checkall", function () {
            var flage = $(this)[0].checked;
            if (flage) {
                $(this).parents(".table").find(".checkeach").prop("checked", true);
            } else {
                $(this).parents(".table").find(".checkeach").prop("checked", false);
            }
        })
            //单选
        $("body").on("click", ".checkeach", function () {
            var arry = $(this).parents(".table").find(".checkeach");
            var all = $(this).parents(".table").find(".checkall");
            var flage = false;
            if ($(this)[0].checked) {
                //勾选的话,判断所有是否都勾选
                $.each(arry, function (i, v) {
                    if (v.checked != true) {//有没选中的选项
                        flage = true;
                    }
                })
                if (flage) {
                    all.prop("checked", false)
                } else {
                    all.prop("checked", true)
                }
            } else {
                all.prop("checked", false);
            }
        })
        function ShowOrHideJsrRightButton(_type) {
            if (_type == calcDateType.foreach) {
                if ($("#TrustExtensionDiv").find("#TrustExtensionJSRListHaveDataList").children().length > 0)
                    $("#setautohide").show();
                else
                    $("#setautohide").hide();
            } else {
                var self = TrustExtensionNameSpace;
                if ($("#TrustExtensionDiv").find("#TrustExtensionForEachJSRListHaveDataList").children().length > 0)
                    $("#setautohideforeach").show();
                else
                    $("#setautohideforeach").hide();
            }
        }

        function conditionChanged(_this) {
            var ul = $(_this).parent().parent().parent();
            if (!_this.checked) {
                $.each(ul.find('.form-control[conditiongroup="Condition"]'), function (i, n) {
                    $(n).val('');
                    $(n).removeClass('red-border');
                });
            }
        }

        function vShowOrHide(_this, _type) {
            var b;
            if (_type == calcDateType.foreach) {
                b = vShowOrHideValue.foreach = !vShowOrHideValue.foreach;

            }
            else {
                b = vShowOrHideValue.date = !vShowOrHideValue.date;
            }
            ShowOrHideJsrRightAllSet(_type);

            if (b == true) {
                $(_this).find("i").removeClass("icon-bottom").addClass("icon-top");
                $(_this).find("span").text(lang.tab20);
            }
            else if (b == false) {
                $(_this).find("i").removeClass("icon-top").addClass("icon-bottom");
                $(_this).find("span").text(lang.tab21);
            }
        }

        function HiddenInput(_this) {
            if ($(_this).parent().parent().next().next().is(":visible")) {
                $(_this).find("i").removeClass("icon-top").addClass("icon-bottom");
                $(_this).find("span").text(lang.tab21);
                $(_this).prev().toggle();
                $(_this).parent().parent().next().next().toggle();
            } else {
                $(_this).find("i").removeClass("icon-bottom").addClass("icon-top");
                $(_this).find("span").text(lang.tab20);
                $(_this).prev().toggle();
                $(_this).parent().parent().next().next().toggle();
            }
        }
        //数字校验(仅数字)
        function NumberR(that) {
            var $this = $(that);
            var reg = new RegExp("[^-|(0-9)]");
            if (reg.test($this.val())) {
                $this.val(lang.tab22);
            }
        }
        function ShowOrHideJsrRightAllSet(_type) {
            if (_type == calcDateType.foreach) {
                var autohides = $("#TrustExtensionForEachJSRListHaveDataList div[name='autohide']");
                autohides.css("display", vShowOrHideValue.foreach == true ? "block" : "none");
            } else {
                var autohides = $("#TrustExtensionJSRListHaveDataList div[name='autohide']");
                autohides.css("display", vShowOrHideValue.date == true ? "block" : "none");
            }
        }

        //===排序===
        function SortDateFunction() {
            var self = TrustExtensionNameSpace;
            //指定排序顺序，点一下降序
            var sortOrder = true;
            $("#sortDate").click(function () {
                self.sortDate(self, sortOrder, self.calcDateType.date);
                sortOrder = !sortOrder;
                //这里要加这个函数右边显示区域保留当前状态
                self.ShowOrHideJsrRightAllSet();
                if (sortOrder == false) {
                    $("#sortDate i").removeClass("icon-bottom").addClass("icon-top");
                    $("#sortDate span").text(lang.tab23);
                }
                else if (sortOrder == true) {
                    $("#sortDate i").removeClass("icon-top").addClass("icon-bottom");
                    $("#sortDate span").text(lang.tab24);
                }
            });
            var sortOrderForEach = true;
            $("#sortDateforeach").click(function () {
                self.sortDate(self, sortOrderForEach, self.calcDateType.foreach);
                sortOrderForEach = !sortOrderForEach;
                //这里要加这个函数右边显示区域保留当前状态
                self.ShowOrHideJsrRightAllSet_Foreach();
                if (sortOrderForEach == false) {
                    $("#sortDateforeach i").removeClass("icon-bottom").addClass("icon-top");
                    $("#sortDateforeach span").text(lang.tab23);
                }
                else if (sortOrderForEach == true) {
                    $("#sortDateforeach i").removeClass("icon-top").addClass("icon-bottom");
                    $("#sortDateforeach span").text(lang.tab24);
                }
            });
        }
        //默认升序排序
        function initSortDate(type) {
            var self = TrustExtensionNameSpace;
            self.sortDate(self, false, type);
        }
        function sortDate(self, order, type) {
            var temp = new Array();
            var datalist = {};
            if (type == self.calcDateType.foreach) datalist = self.TrustExtensionData.ForEachSetJSRList;
            else datalist = self.TrustExtensionData.JSRList;

            var temptwo = self.SortDateByOrder(temp.concat(datalist.HaveDataList()), order);
            //先全部删除再重新添加的方式重新渲染
            datalist.HaveDataList.removeAll();
            $.each(temptwo, function (i, n) {
                datalist.HaveDataList.push(n);
            })
        }
        function SortDateByOrder(tempArr, sortOrder) {
            var self = TrustExtensionNameSpace;
            var length = tempArr.length;
            //暴力排序,sortOrder=false 降序排序                          
            for (var i = 0; i < length - 1; i++) {
                for (var j = 0; j < length - 1; j++) {
                    if (self.ComPareDate(tempArr[j].ItemValue(), tempArr[j + 1].ItemValue(), sortOrder)) {
                        var test = tempArr[j + 1];
                        tempArr[j + 1] = tempArr[j];
                        tempArr[j] = test;
                    }
                }
            }
            return tempArr;
        }
        //比较两个日期的大小，如果大于返回true
        function ComPareDate(date1, date2, option) {
            var temp1 = this.TansferDateToInt(date1);
            var temp2 = this.TansferDateToInt(date2);
            if (option) {
                return temp1 < temp2;
            }
            else {
                return temp1 > temp2;
            }
        }
        //转换日期，进行比较
        function TansferDateToInt(date) {
            var tempArr = [];
            var temp = "";
            tempArr = date.split("-");
            //console.log(tempArr)
            for (var i = 0; i < tempArr.length; i++) {
                temp += tempArr[i];
            }
            return parseInt(temp);
        }


        var stepActive = {
            init: function () {
                init(this);
            },
            update: function () {
                return update();
            },
            preview: function () {
                var result = preview();
                console.log(PageCode + ".preview:" + result);
                return result;
            },
            validation: function () {
                //验证
                return this.validControls("#TrustExtensionDiv input[data-valid]:enabled:visible");
            },
            render: function () {
                //当前step加载时,调用
                //获取产品页 支持循环结构是否选中 ,ItemCode:IsTopUpAvailable
                var b = TRUST.getItemValueByCode("TrustItem", "IsTopUpAvailable");
                var dom = $("#TrustExtensionDiv").find("div.foreachset");
                //显示全部还是显示摊还期或者循环期
                if (b == true) {
                    dom.show();
                } else {
                    dom.hide();
                    $("#tab_change").find("span:first").hide();
                    $("#tab_change").find("span:last").addClass("title_current");
                    $("#Cycle_period").hide();
                    $("#tab2").parents("li").hide();
                    $("#tab3").prev().text("2");
                    $("#Cycle_period").hide();
                    $("#Amortization_period").hide();
                    $("#baseinfo").show();
                }
                $("#scrollArea").css("height", $("body").height() - 75 + "px");
                $("[data-toggle='tooltip']").tooltip({});
                $("#loading").hide()
            }
        }
        return {
              StepActive: stepActive
            , CalcDateType: calcDateType
            , AddR: addR
            , Complete: complete
            , DeleteR: deleteR
            , ShowaddForEachWorkDayDiv: ShowaddForEachWorkDayDiv
            , ShowaddWorkDayDiv: ShowaddWorkDayDiv
            , Edit: edit
            , ShowCalenderUp: showCalenderUp
            , ShowCalenderDown: ShowCalenderDown
            , AddBase: addBase
            , DeleteBase: deleteBase
            , AddJsr: addJsr
            , CountEachUp: CountEachUp
            , CountEachDown: CountEachDown
            , DeleteJsr: deleteJsr
            , SeePerid: SeePerid
            , EditJsr:EditJsr
            , ConditionChanged: conditionChanged
            , VShowOrHide: vShowOrHide
            , GetDateSetListByCode: getDateSetListByCode
            , HiddenInput: HiddenInput
            , NumberR: NumberR
        }
    })();
    var TrustExtensionNameSpace = {
        GetDateSetListByCode: DateSetModel.GetDateSetListByCode
    };
    TRUST.registerMethods(DateSetModel.StepActive);

    DataSetTools = {
        RQcheck: function (RQ) {
            var date = RQ;
            var result = date.match(/^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2})$/);

            if (result == null)
                return false;
            var d = new Date(result[1], result[3] - 1, result[4]);
            return (d.getFullYear() == result[1] && (d.getMonth() + 1) == result[3] && d.getDate() == result[4]);
        }
    }

     TrustPeriod = (function () {
        var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";

        var dataModel = {
            DataList: []
        };
        var viewModel = {};
        function init() {
            initDatePlugins();
            periodClilck();
            SavePeriodClick();
        }
        function initDatePlugins() {
            $("#TrustPeriodDiv").find('.date-plugins').date_input();
        }
        function SavePeriodClick() {
            $("#SavePeriod").click(function () {
                var trustPeriodType = $("#TrustPeriodDiv select[name='TrustPeriodType']").val();
                dataModel = ko.mapping.toJS(viewModel);
                //校验日期是否重叠
                var isrepeatflag = true;
                var isfirstrepeatflag = true;
                var isrepeatdate;

                $.each(dataModel.DataList, function (i, c) {
                    if (i != 0) {
                        if (Date.parse(dataModel.DataList[i].StartDate) < Date.parse(dataModel.DataList[i - 1].EndDate)) {
                            isrepeatflag = false;
                            isrepeatdate = dataModel.DataList[i].StartDate;
                        }
                        if (Date.parse(dataModel.DataList[i].StartDate) > Date.parse(dataModel.DataList[i].EndDate)) {
                            isrepeatflag = false;
                            isrepeatdate = dataModel.DataList[i].StartDate;
                        } 
                        
                    } else if (i == 0) {
                        if (Date.parse(dataModel.DataList[i].EndDate) < Date.parse(dataModel.DataList[i].StartDate)) {
                            isfirstrepeatflag = false;
                            isrepeatdate = dataModel.DataList[i].EndDate;
                        }
                        
                    }
                })
                if (!isrepeatflag) {
                    GSDialog.HintWindow("日期 " + isrepeatdate + " 区间重叠，请重新设置！", function () {
                        location.reload();
                    });
                    return false;
                }

                if (!isfirstrepeatflag) {
                    GSDialog.HintWindow("开始时间不能晚于结束时间!", function () {
                        location.reload();
                    });
                    return false;
                }

                //
                var items = '<items>';
                $.each(dataModel.DataList, function (i, v) {
                    items += '<item>';
                    items += '<TrustId>' + trustId + '</TrustId>';
                    items += '<TrustPeriodDesc>' + trustId + '(' + common.stringToDate(v.StartDate).dateFormat("dd/MM/yyyy") + ' - ' + common.stringToDate(v.EndDate).dateFormat("dd/MM/yyyy") + ')' + '</TrustPeriodDesc>';
                    items += '<TrustPeriodType>' + trustPeriodType + '</TrustPeriodType>';
                    items += '<StartDate>' + v.StartDate + '</StartDate>';
                    items += '<EndDate>' + v.EndDate + '</EndDate>';
                    items += '<IsCurrent>' + v.IsCurrent + '</IsCurrent>';
                    items += '<IsContainsEnd>' + v.IsContainsEnd + '</IsContainsEnd>';
                    items += '<IsManualModified>' + v.IsManualModified + '</IsManualModified>';
                    items += '</item>';
                });
                items += '</items>';

                var executeParam = {
                    SPName: 'usp_UpdateTrustPeriod', SQLParams: [
                        { Name: 'trustId', value: trustId, DBType: 'int' },
                        { Name: 'trustPeriodType', value: trustPeriodType, DBType: 'string' },
                        { Name: 'items', value: items, DBType: 'xml' }
                    ]
                };
                PostRemoteData(executeParam, function (result) {
                    if (result == true || result == false) {//result = cmd.ExecuteNonQuery() > 0;所以，这里不报错就OK
                        var executeParam = {
                            SPName: 'usp_UpdateDateRelatedChanges', SQLParams: [
                                { Name: 'TrustId', value: trustId, DBType: 'int' }
                            ]
                        };
                        var temp = common.ExecuteGetData(true, svcUrl, 'TrustManagement', executeParam, function (data) {
                            var type;
                            if (trustPeriodType == 'PaymentDate_CF')
                                type = "计息期间";
                            else
                                type = "收款期间";
                            var description = "产品：" + trustId + "，在产品维护向导功能下，对日期设置" + type + "进行了更新操作";
                            var category = "产品管理";
                            ActLogs.insertActlogs(false, userName, '更新', category, description, ip, '', '');
                            GSDialog.HintWindow(lang.tab25, function () {
                                location.reload()
                            });
                        });
                    } else {
                        GSDialog.HintWindow(lang.tab26, function () {
                            location.reload();
                        });
                    }
                });
            });
        }

        function ExecuteRemoteDataPost(executeParam) {
            var executeParams = JSON.stringify(executeParam);
            var sourceData = [];
            $.ajax({
                cache: false,
                type: "POST",
                async: false,
                url: GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet",
                dataType: "json",
                contentType: "application/json;charset=utf-8",
                data: executeParams,
                success: function (response) {
                    if (typeof response === 'string') { sourceData = JSON.parse(response); }
                    else { sourceData = response; }
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    GSDialog.HintWindow(XMLHttpRequest.status);
                    GSDialog.HintWindow(XMLHttpRequest.readyState);
                    GSDialog.HintWindow(textStatus);
                }
            });
            return sourceData;
        }


        //增加onchange事件，在select的值改变时更细下面的div
        function periodClilck() {
            if (trustId == 0)
                $("#period_set").hide();

            $("#TrustPeriodType").change(function () {
                var listData = GetSourceData();
                dataModel.DataList = listData;
                dataModel.StartDate = ko.observable('');
                dataModel.EndDate = ko.observable('');
                dataModel.IsManualModified = ko.observable(true);
                //console.log(dataModel.DataList[1].StartDate);
                var listNode = document.getElementById('PeriodTarget');
                for (var i = 0; i < dataModel.DataList.length; i++) {
                    dataModel.DataList[i].StartDate = dataModel.DataList[i].StartDate.length > 0 ? common.getStringDate(dataModel.DataList[i].StartDate).dateFormat('yyyy-MM-dd') : '';
                    dataModel.DataList[i].EndDate = dataModel.DataList[i].EndDate.length > 0 ? common.getStringDate(dataModel.DataList[i].EndDate).dateFormat('yyyy-MM-dd') : '';
                }
                if (dataModel.DataList.length > 6) {
                    $("#PeriodTarget>div:first").css("width", "100%");
                } else {
                    $("#PeriodTarget>div:first").css("width", "100%");
                }
                $("#PeriodTargetPP").html($("#PeriodTemplate").html());
                viewModel = ko.mapping.fromJS(dataModel);
                ko.cleanNode(listNode);
                viewModel.AddPeriods = function () {
                    var StartDate = viewModel.StartDate(), EndDate = viewModel.EndDate();

                    if (StartDate != '' && EndDate != '') {
                        var newArr = {
                            EndDate: viewModel.EndDate(),
                            IsContainsEnd: 0,
                            IsCurrent: false,
                            IsManualModified: viewModel.IsManualModified(),
                            StartDate: viewModel.StartDate(),
                            TrustPeriodDesc: "",
                            TrustPeriodType: $("#TrustPeriodType").val(),
                        };
                        viewModel.DataList.unshift(newArr);
                        $("#PeriodTargetPP").find('.date-plugins').date_input();
                        if (ko.mapping.toJS(viewModel.DataList).length > 6) {
                            $("#PeriodTarget>div:first").css("width", "100%");
                        }
                        viewModel.DataList.sort(function (a, b) {
                            var a = (typeof a.StartDate === 'string') ? a.StartDate.replace(/-/g, "") : a.StartDate().replace(/-/g, "");
                            var b = (typeof b.StartDate === 'string') ? b.StartDate.replace(/-/g, "") : b.StartDate().replace(/-/g, "");
                            return parseInt(a) - parseInt(b);
                        })
                        viewModel.EndDate('');
                        viewModel.StartDate('');
                    }
                }
                ko.applyBindings(viewModel, listNode);
                initDatePlugins();
            });
            $("#period_set").click(function () {
                if (!viewModel.DataList) {
                    //console.log("第一次初始化！");
                    var listData = GetSourceData();
                    dataModel.DataList = listData;
                    //初始化对齐布局
                    if (listData.length > 6) {
                        $("#PeriodTarget>div:first").css("width", "100%");
                    }
                    dataModel.StartDate = ko.observable('');
                    dataModel.EndDate = ko.observable('');
                    dataModel.IsManualModified = ko.observable(true);

                    var listNode = document.getElementById('PeriodTarget');
                    for (var i = 0; i < dataModel.DataList.length; i++) {
                        dataModel.DataList[i].StartDate = dataModel.DataList[i].StartDate.length > 0 ? common.getStringDate(dataModel.DataList[i].StartDate).dateFormat('yyyy-MM-dd') : '';
                        dataModel.DataList[i].EndDate = dataModel.DataList[i].EndDate.length > 0 ? common.getStringDate(dataModel.DataList[i].EndDate).dateFormat('yyyy-MM-dd') : '';
                    }


                    $("#PeriodTargetPP").html($("#PeriodTemplate").html());


                    viewModel = ko.mapping.fromJS(dataModel);
                    viewModel.AddPeriods = function () {
                        var StartDate = viewModel.StartDate(), EndDate = viewModel.EndDate();

                        if (StartDate != '' && EndDate != '') {
                            var newArr = {
                                EndDate: viewModel.EndDate(),
                                IsContainsEnd: 0,
                                IsCurrent: false,
                                IsManualModified: viewModel.IsManualModified(),
                                StartDate: viewModel.StartDate(),
                                TrustPeriodDesc: "",
                                TrustPeriodType: $("#TrustPeriodType").val()
                            };
                            viewModel.DataList.unshift(newArr);
                            $("#PeriodTargetPP").find('.date-plugins').date_input();
                            if (ko.mapping.toJS(viewModel.DataList).length > 6) {
                                $("#PeriodTarget>div:first").css("width", "100%");
                            }
                            viewModel.DataList.sort(function (a, b) {
                                var a = (typeof a.StartDate === 'string') ? a.StartDate.replace(/-/g, "") : a.StartDate().replace(/-/g, "");
                                var b = (typeof b.StartDate === 'string') ? b.StartDate.replace(/-/g, "") : b.StartDate().replace(/-/g, "");
                                return parseInt(a) - parseInt(b);
                            })
                            viewModel.EndDate('');
                            viewModel.StartDate('');
                        }
                    }
                    ko.applyBindings(viewModel, listNode);
                }
                $("#PeriodTargetPP").find('.date-plugins').date_input();
                $.anyDialog({
                    //dragable:true,
                    modal: true,
                    dialogClass: "TaskProcessDialogClass",
                    closeText: "",
                    //html: $(".interest-adjustments"),
                    html: $("#trustPeriod").show(),
                    height: 520,
                    width: 800,
                    scolling: false,
                    draggable: false,
                    close: function (event, ui) {
                    },
                    title: lang.tab27
                });
            });
        }
        ko.unapplyBindings = function ($node, remove) {
            // unbind events
            $node.find("*").each(function () {
                $(this).unbind();
            });

            if (remove) {
                ko.removeNode($node[0]);
            } else {
                ko.cleanNode($node[0]);
            }
        };
        function GetSourceData() {

            var executeParam = {
                SPName: 'usp_GetTrustPeriod',
                SQLParams: [
                    { Name: 'TrustId', value: trustId, DBType: 'int' },
                    { Name: 'TrustPeriodType', value: $("#TrustPeriodDiv select[name='TrustPeriodType']").val(), DBType: 'string' },
                ]
            };
            return ExecuteRemoteData(executeParam);
        }
        function ExecuteRemoteData(executeParam) {

            var executeParams = encodeURIComponent(JSON.stringify(executeParam));
            var sourceData = [];
            $.ajax({
                cache: false,
                type: "GET",
                async: false,
                url: svcUrl + 'appDomain=TrustManagement&executeParams=' + executeParams + '&resultType=commom',
                dataType: "json",
                contentType: "application/xml;charset=utf-8",
                data: {},
                success: function (response) {
                    if (typeof response === 'string') { sourceData = JSON.parse(response); }
                    else { sourceData = response; }
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    alert(XMLHttpRequest.status);
                    alert(XMLHttpRequest.readyState);
                    alert(textStatus);
                }
            });
            return sourceData;
        }
        function PostRemoteData(executeParam, callback) {
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

        function removeItem(_this) {
            GSDialog.HintWindowTF(lang.tab28,function(){
                var dataIndex = $(_this).attr('dataIndex');
                var item = viewModel.DataList()[dataIndex];
                viewModel.DataList.remove(item);
                if (ko.mapping.toJS(viewModel.DataList).length < 7) {
                    $("#PeriodTarget>div:first").css("width", "100%");
                }
            },{},false)
        }
        return {
            Init: init
            ,RemoveItem: removeItem
        }
    })();
    var TrustFactBondPayment = (function () {
        var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";

        var dataModel = {
            DataList: [],
        };
        var viewModel = {};
        function init() {
            initDatePlugins();
            initWhere();
            periodClilck();
            FactBondPayment_GetListClick();
        }
        function initDatePlugins() {
            $("#TrustFactBondPaymentDiv").find('.date-plugins').date_input();
        }
        function initWhere() {
            var list = GetReportingDateId();
            if (list) {
                var html = '';//'<option value="all">所有</option>';
 
                $.each(list, function (i, item) {
                    html += '<option value="' + item.OptionValue + '">' + item.OptionText + '</option>';
                });
                $('#selReportingDateFilter').html(html);
            }
        }

        function GetReportingDateId() {
            var executeParam = {
                SPName: 'usp_GetFactBondPaymentFilterMetaData', SQLParams: [
                    { Name: 'TrustId', value: trustId, DBType: 'string' }
                ]
            };
            return ExecuteRemoteData(executeParam);
        }
        function periodClilck() {
            if (trustId == 0)
                $("#FactBondPayment_show").hide();

            $("#FactBondPayment_show").click(function () {
                if (!viewModel.DataList) {
                    GetListAndBind();
                }

                $.anyDialog({
                    modal: true,
                    dialogClass: "TaskProcessDialogClass",
                    closeText: "",
                    html: $("#TrustFactBondPayment").show(),
                    height: 460,
                    width: 900,
                    close: function (event, ui) {
                    },
                    title: lang.tab29
                });
            });
        }
        function FactBondPayment_GetListClick() {
            if (trustId == 0)
                $("#FactBondPayment_GetList").hide();

            $("#FactBondPayment_GetList").click(function () {
                GetListAndBind();
            });
        }
        function GetListAndBind() {
            var listData = GetSourceData();
            dataModel.DataList = listData;

            var listNode = document.getElementById('FactBondPayment_Target');


            ko.unapplyBindings($(listNode), false);
            $("#FactBondPayment_Target").html($("#FactBondPayment_Template").html());


            viewModel = ko.mapping.fromJS(dataModel);
            ko.applyBindings(viewModel, listNode);
            initDatePlugins();
        }
        ko.unapplyBindings = function ($node, remove) {
            $node.find("*").each(function () {
                $(this).unbind();
            });
            if (remove) {
                ko.removeNode($node[0]);
            } else {
                ko.cleanNode($node[0]);
            }
        };
        function GetSourceData() {
            var executeParam = {
                SPName: 'usp_GetFactBondPayment', SQLParams: [
                    { Name: 'TrustId', value: trustId, DBType: 'string' },
                    { Name: 'ReportingDateId', value: $('#selReportingDateFilter').val(), DBType: 'string' }
                ]
            };
            return ExecuteRemoteData(executeParam);
        }
        function ExecuteRemoteData(executeParam) {
            var executeParams = encodeURIComponent(JSON.stringify(executeParam));
            var sourceData = [];

            $.ajax({
                cache: false,
                type: "GET",
                async: false,
                url: svcUrl + 'appDomain=TrustManagement&executeParams=' + executeParams + '&resultType=commom',
                dataType: "json",
                contentType: "application/xml;charset=utf-8",
                data: {},
                success: function (response) {
                    if (typeof response === 'string') { sourceData = JSON.parse(response); }
                    else { sourceData = response; }
                },
                error: function (response) { alert('Error occursed while requiring the remote source data!'); }
            });
            return sourceData;
        }
        return {
            Init: init,
        }
    })();
    //显示隐藏删除按钮
    $("#RemoveColButtomSH", window.parent.document).click(function () {
        var $this = $(this);
        isShowRemove = !isShowRemove;
        if (isShowRemove == true)
            $this.text(lang.tab30);
        else
            $this.text(lang.tab31);
        RemoveColButtomSH(isShowRemove);
    });
    function RemoveColButtomSH(show) {
        var sytles = document.CSSStyleSheet ? document.CSSStyleSheet : document.styleSheets;
        $.each(sytles, function (i, sheet) {
            if (sheet.href.indexOf("trustWizard.css") > -1) {
                var rs = sheet.cssRules ? sheet.cssRules : sheet.rules;
                $.each(rs, function (j, cssRule) {
                    if (cssRule.selectorText && cssRule.selectorText.indexOf(".btn") > -1 && cssRule.selectorText.indexOf(".btn-remove") > -1) {
                        if (show == true) {
                            cssRule.style.display = "inline-block";
                        } else {
                            cssRule.style.display = "none";
                        }
                        return false;
                    }
                });
                return false;
            }
        });
    }





    /*基本信息 循环期 摊还期 切换*/
    $("body").on("click", ".aside_list_box li", function () {
        $("#scrollArea").css("height", $("body").height() - 75 + "px");       
        var index = $(this).index()+1;
        var step = $(this).find("span").eq(1)[0].id;
        var go = true;
        $.each($("#firstbox").find("input"), function (i, v) {
            if ($(v).val() == "输入日期格式不合法" || $(v).val() == "") {
                $(v).addClass("red-border")
                go = false;
            }
        })
        var selectval = $("select.form-control").eq(1).val();
        if (selectval == "") {
              $("select.form-control").eq(1).addClass("red-border")
              go = false;
        }
        if (step == "tab1") {
            $(this).addClass("aside_list_active").siblings().removeClass("aside_list_active");
            $(".innerfont").text("基本信息");
            $("#Cycle_period").hide();
            $("#Amortization_period").hide();
            $("#tips").hide();
            $("#baseinfo").show();

        } else if (step == "tab2" && go == true) {
            $(this).addClass("aside_list_active").siblings().removeClass("aside_list_active");
            $(".innerfont").text("循环期");
            $("#baseinfo").hide();
            $("#Amortization_period").hide();
            $("#tips").show();
            $("#Cycle_period").show();
        } else if (step == "tab3" && go == true) {
            $(this).addClass("aside_list_active").siblings().removeClass("aside_list_active");
            $(".innerfont").text("摊还期");
            $("#baseinfo").hide();
            $("#Cycle_period").hide();
            $("#tips").show();
            $("#Amortization_period").show();
        }
        if (index == 3 && go==true) {
            $("#SaveAndRun").css("display","inline-block")
        } else {
            $("#SaveAndRun").hide()
        }
    })
    /*基本信息下一步跳转*/
    $("body").on("click", "#stepone button", function () {
        var go = true;
        $.each($("#firstbox").find("input"),function(i,v){
            if ($(v).val() == "输入日期格式不合法" || $(v).val()=="") {
                $(v).addClass("red-border")
                go = false;
            }
        })
        var selectval = $("select.form-control").eq(1).val();
        if (selectval == "") {
            $("select.form-control").eq(1).addClass("red-border")
            go = false;
        }
        //验证通过
        if (go) {
            $(".aside_list_box li:visible").eq(1).trigger("click")
        }
    })
    /*循环期下一步跳转*/
    $("body").on("click", "#stepTwo button", function () {
        $(".aside_list_box li").eq(2).trigger("click")
    })
    

    //隐藏盒子
    $("body").on("click", "#closebox", function () {
        $(".ant-drawer-content-wrapper").css("width", "0px");
        $(".ant-drawer-mask").removeClass("open");
        if ($("#c_table").find("tbody tr:last").css("display") == "none") {
            $("#c_table").find("tbody tr:last").find(".option .deletItem").trigger("click")
        }
        if ($("#A_table").find("tbody tr:last").css("display") == "none") {
            $("#A_table").find("tbody tr:last").find(".option .deletItem").trigger("click")
        }
    })

    window.onresize = function () {
        $("#scrollArea").css("height", $("body").height() - 75 + "px");
    };
    $(function () {

        $("#PeriodTargetPP").height(300);
        $('body').on('click', '#modal-win', function () {
            if ($(this).hasClass("icon icon-window-restore")) {
                $("#PeriodTargetPP").height($(window).height() - 220)
            } else {
                $("#PeriodTargetPP").height(300)
            }
        })
        
        //$('#PeriodTargetPP').height($(window).height() - 120);
        inputNull = common.inputNull
        formatData = common.formatData
        TRUST.init();
        TrustPeriod.Init();
        TrustFactBondPayment.Init();
        //function showMask() {
        //    $("#mask").css("height", $(document).height());
        //    $("#mask").css("width", $(document).width());
        //    $("#mask").show();
        //}
        ////隐藏遮罩层  
        //function hideMask() {
        //    $("#mask").hide();
        //}
        //productPermissionState = common.getQueryString('productPermissionState');
        //if (productPermissionState == 2) {
        //    //showMask();
        //    setTimeout(function () {
        //        var c = document.body.scrollHeight; console.log('clientheight12');
        //        console.log(c);
        //        $("#mask").css("height", c+15);
        //        $("#mask").css("width", $(document).width());
        //        $("#mask").show();

        //        console.log("sign1");
        //    }, 700)

        //} else {
        //    hideMask();
        //}

        var Orgheight = $(document).height();
        var Orgwidth = $(document).width();
        function showMask(Orgheight, Orgwidth) {
            $("#mask").css("height", Orgheight);
            $("#mask").css("width", Orgwidth);
            $("#mask").show();
        }
        //隐藏遮罩层  
        function hideMask() {
            $("#mask").hide();
        }
        productPermissionState = common.getQueryString('productPermissionState');
        if (productPermissionState == 2) {
            //showMask(Orgheight, Orgwidth);
            setTimeout(function () {
                var c = document.body.scrollHeight; console.log('clientheight12');
                console.log(c);
                $("#mask").css("height", c + 15);
                $("#mask").css("width", $(document).width());
                $("#mask").show();
                console.log("sign1");
            }, 700)

            $(window).resize(function () {
                var height = $(document).height();
                var width = $(document).width();
                showMask(height, width);
                //hideMask();
            })
        } else {
            var c = document.body.clientHeight;
        }
        setTimeout(function () {
            $('.baseInfo_wrap').find('select').trigger('change')
        }, 1000)
    });
});