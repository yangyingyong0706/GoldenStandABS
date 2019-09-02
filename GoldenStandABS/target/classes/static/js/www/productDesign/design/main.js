define(function (require) {
    var $ = require('jquery');
    var Vue = require('Vue2');

    var webProxy = require('gs/webProxy');
    var gsUtil = require('gs/gsUtil');
    //var calendar = require('calendar');
    require('date_input');
    var highcharts = require('highcharts');
    var highchartsexporting = require('highchartsexporting');
    var GlobalVariable = require('globalVariable');
    var GSDialog = require('gs/uiFrame/js/gs-admin-2.pages');
    var common = require("common");
    require("jquery.searchSelect");
    require('jquery.localizationTool');
    require("app/projectStage/js/project_interface");
    webStorage = require('gs/webStorage');
    langx = {};
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


            'id:title1': {
                'en_GB': 'Design layered products'
            },
            'id:tab1': {
                'en_GB': 'Asset pool profile'
            },
            'id:tab2': {
                'en_GB': 'Loss rate assess'
            },
            'id:tab3': {
                'en_GB': 'Release expect'
            },
            'id:tab4': {
                'en_GB': 'Term setting'
            },
            'id:tab5': {
                'en_GB': 'Initial stratify'
            },
            'id:title2': {
                'en_GB': 'Asset pool profile'
            },
            'id:choose1': {
                'en_GB': 'Access to assets:'
            },
            'id:radio1': {
                'en_GB': 'Select the pool of assets'
            },
            'id:radio2': {
                'en_GB': 'Input asset parameters'
            },
            'id:pool': {
                'en_GB': 'Select the pool of assets'
            },
            'id:src': {
                'en_GB': 'Source of assets'
            },
            'id:poolId': {
                'en_GB': 'Asset PoolId'
            },
            'id:double': {
                'en_GB': '(* double click the cell to modify the data)'
            },
            'id:list1': {
                'en_GB': 'Asset pool scale'
            },
            'id:list2': {
                'en_GB': 'Weighted average interest rate'
            },
            'id:list3': {
                'en_GB': 'Maximum remaining period'
            },
            'id:list4': {
                'en_GB': 'Weighted average remaining period'
            },
            'id:list5': {
                'en_GB': 'Packet day'
            },
            'id:data1': {
                'en_GB': 'Please enter the following asset parameters'
            },
            'id:src1': {
                'en_GB': 'Source of assets'
            },
            'id:list6': {
                'en_GB': 'Asset pool scale'
            },
            'id:list7': {
                'en_GB': 'Weighted average interest rate'
            },
            'id:list8': {
                'en_GB': 'Maximum remaining period'
            },
            'id:list9': {
                'en_GB': 'Weighted average remaining period'
            },
            'id:list10': {
                'en_GB': 'Packet day'
            },
            'id:btnNext': {
                'en_GB': 'Next'
            },
            'id:title3': {
                'en_GB': 'Default risk'
            },
            'id:choose2': {
                'en_GB': 'Obtaining static pool mode'
            },
            'id:radio3': {
                'en_GB': 'Select the static pool'
            },
            'id:radio4': {
                'en_GB': 'Input static pool parameters'
            },
            'id:static': {
                'en_GB': 'Select the static pool'
            },
            'id:type1': {
                'en_GB': 'Asset type'
            },
            'id:date1': {
                'en_GB': 'Overdue interval'
            },
            'id:show': {
                'en_GB': 'Display chart'
            },
            'id:data2': {
                'en_GB': 'Input static pool parameters'
            },
            'id:average': {
                'en_GB': 'Mean loss rate of static value'
            },
            'id:standard': {
                'en_GB': 'Standard deviation of static value loss rate'
            },
            'id:curve': {
                'en_GB': 'Fitting curve'
            },
            'id:pre': {
                'en_GB': 'Preview'
            },
            'id:next': {
                'en_GB': 'Next'
            },


            'id:title4': {
                'en_GB': 'Release setting'
            },
            'id:lab1': {
                'en_GB': 'Issue size (yuan)'
            },
            'id:lab2': {
                'en_GB': 'Excess coverage ratio (%)'
            },
            'id:lab3': {
                'en_GB': 'Top priority rate (%)'
            },
            'id:lab4': {
                'en_GB': 'Top priority rating'
            },
            'id:lab5': {
                'en_GB': 'Lower limit of the highest priority ratio (%)'
            },
            'id:lab6': {
                'en_GB': 'Mezzanine coupon rate (%)'
            },
            'id:lab7': {
                'en_GB': 'Mezzanine target rating'
            },
            'id:lab8': {
                'en_GB': 'Secondary ratio (%)'
            },
            'id:lab9': {
                'en_GB': 'Number of layers'
            },
            'id:pre1': {
                'en_GB': 'Previous'
            },
            'id:next1': {
                'en_GB': 'Next'
            },
            'id:title5': {
                'en_GB': 'Term setting'
            },
            'id:circle': {
                'en_GB': 'Whether to set the cycle period'
            },
            'id:yes': {
                'en_GB': 'Yes'
            },
            'id:no': {
                'en_GB': 'No'
            },
            'id:length': {
                'en_GB': 'Cycle length'
            },
            'id:frequency': {
                'en_GB': 'Set the redemption frequency'
            },
            'id:month1': {
                'en_GB': 'Month'
            },
            'id:quarter1': {
                'en_GB': 'Season'
            },
            'id:half': {
                'en_GB': 'Half a year'
            },
            'id:year3': {
                'en_GB': 'Year'
            },
            'id:day1': {
                'en_GB': 'Set a special plan establishment day'
            },
            'id:day2': {
                'en_GB': 'Set the special plan period (months)'
            },
            'id:name1': {
                'en_GB': 'Program name'
            },
            'id:layer': {
                'en_GB': 'Trial layering'
            },
            'id:pre2': {
                'en_GB': 'Previous'
            },
            'id:trialHierarchy': {
                'en_GB': 'Next'
            },
            'id:title6': {
                'en_GB': 'Preliminary stratification'
            },
            'id:product': {
                'en_GB': 'Generate product'
            },
            'id:Id': {
                'en_GB': 'Bond number'
            },
            'id:layer1': {
                'en_GB': 'Hierarchical ratio'
            },
            'id:money2': {
                'en_GB': 'Amount'
            },
            'id:rate1': {
                'en_GB': 'Coupon rate'
            },
            'id:col1': {
                'en_GB': 'Issue date'
            },
            'id:col2': {
                'en_GB': 'Expiry date'
            },
            'id:col3': {
                'en_GB': 'Rating'
            },
            'id:pre3': {
                'en_GB': 'Previous'
            }
            
        }
    });
    if (userLanguage && userLanguage.indexOf('en') > -1) {
        langx.assetImportGuide = 'Asset Import Wizard';
        langx.assetTemplate = "Data Templates";
        langx.quickCreateTrust = "Quickly Create Product";
        langx.dataChecksum = "Asset-Data Check";
        langx.importAsset = "Asset-Data Import";
        langx.assetReport = "Pivot Table";
        langx.queryAsset = "Query Asset";
        langx.fuc = "file upload has been cancelled!";
        langx.fut = "file upload timeout!";
        langx.fuf = "file upload failure!";
    } else {
        langx.assetImportGuide = "资产导入向导";
        langx.assetTemplate = "数据模板文件下载";
        langx.quickCreateTrust = "快速新建产品";
        langx.dataChecksum = "数据校验";
        langx.importAsset = "导入资产";
        langx.assetReport = "透视报表";
        langx.queryAsset = "资产查询";
        langx.fuc = "文件上传已取消!";
        langx.fut = "文件上传超时!";
        langx.fuf = "文件上传失败!";

    }
    var userLanguage = webStorage.getItem('userLanguage');
    if (userLanguage) {
        $('#selectLanguageDropdown_qcl').localizationTool('translate', userLanguage);
    }
    $('body').show();
    inputNull = common.inputNull
    var myVue = new Vue({
        el: "#container",
        data: {
            PoolId: gsUtil.getQueryString('PoolId'),
            chosedRadioStep1: "0",//资产池单选
            choseTypeStep1: true,//资产池主题切换
            choseTable: false,//资产池-0-table
            choseTableInput: false,//资产池-1-table
            poolIdOptionBind: '',
            poolIdOption: [],//资产池来源下poolid
            poolComeBind: '',
            poolComeOption: [],//资产池来源
            poolIdInfo: [],//poolid下具体信息
            infocal:[],
            poolIdInfoInput: [],//用户输入pool信息
            chosedRadioStep2: '0',//违约风险
            choseTypeStep2: true,//违约风险切换
            poolTypeBind: '',
            poolTypeOption: [],//资产类型
            poolOverdueBind: '[ArrearsRate1_30]',
            poolOverdueOption: [
                { "value": "[ArrearsRate1_30]", "text": "逾期1-30天" },
                { "value": "[ArrearsRate31_60]", "text": "逾期31-60天" },
                { "value": "[ArrearsRate61_90]", "text": "逾期61-90天" },
                { "value": "[ArrearsRate91_120]", "text": "逾期91-120天" },
                { "value": "[ArrearsRate121_150]", "text": "逾期121-150天" },
                { "value": "[ArrearsRate151_180]", "text": "逾期151-180天" },
                { "value": "[ArrearsRateExceed180]", "text": "逾期180天以上" }
            ],//逾期区间
            productPool: [],//均值
            productPoolInput: [],//输入均值
            //发行设定数据
            issue: [
                { "TotalIssueAmount": '' },
                { "FirstLayerInterestRate": '' },
                { "FirstLayerPercentage": '' },
                { "SecondLayerInterestRate": '' },
                { "SecondLayerRating": '' },
                { "FirstLayerRating": '' },
                { "Layers": '' },
                { "SubordinaryLayerPercentage": '' }

            ],
            //超额覆盖比例
            cover: '',
            circulationPeriod: '是',
            circulation: false,//循环期输入框显示控制
            circulationInput: '',//循环期数值
            rateBind: '月',//兑付频率,
            SolutionName: "",//方案名称
            StartDate: "",
            ProjectLength: "",
            solutionSelect: '',//初步分层下拉绑定
            solution: [],//初步分层下拉
            solutionInfo: [],//初步分层table
            applySelect: '',
            applySolutionInfo: [],
            c_SolPercentageReadOnly: true, //当前solution债券分层比例
            c_SolInterestRateReadOnly: true, //当前solution债券分层比例
            c_SolOriginalPercentage: [],
            c_SolOriginalInterestRate: [],
            c_SolTotalOfferAmount: 0,
            loading: false,
        },
        mounted: function () {
            var _this = this;
            $(".aside_info_main .aside_info_each:eq(0)").show();
            _this.date_input_func();
            if (_this.PoolId) {
                console.log(_this.PoolId +" yif test");
                $(".choseType").hide();
                _this.getOrganisationIdByPoolId();
            } else {
                $(".choseType").show();
                _this.getOrganisationId();
            }
            // _this.getAssetType();
            _this.getSolutionSelect();
            _this.getApplySolutionInfo();
            _this.showPoolIdTable('chose')
            Vue.nextTick(function () {
                $("#TryLists").next().remove();
                $("#applyTrust").next().remove();
                $("#TryLists").searchableSelect();
                $("#applyTrust").searchableSelect();
                $("#TryLists").change(function () {
                    _this.getSolutionInfo()
                })
                $("#applyTrust").change(function () {
                    _this.choseApplySelect()
                })
            })
        },
        methods: {
            //实例化日期插件
            date_input_func: function () {
                $('.date-plugins').date_input();
            },
            //资产池千分位添加动态
            Tbadd: function (p, $event) {
                var target = $event.target;
                p = p.replace(/,/g, "");
                var self = this;
                if (parseFloat(p) == p) {
                    var res = p.toString().replace(/\d+/, function (n) { // 先提取整数部分
                        return n.replace(/(\d)(?=(\d{3})+$)/g, function ($1) {
                            return $1 + ",";
                        });
                    })
                    console.log(res);
                    $(target).val(res);
                    console.log($(target).val());
                }
                else
                    return p;
            },
            //静态渲染
            Startadd:function(p){
                p = p.replace(/,/g, "");
                var self = this;
                if (parseFloat(p) == p) {
                    var res = p.toString().replace(/\d+/, function (n) { // 先提取整数部分
                        return n.replace(/(\d)(?=(\d{3})+$)/g, function ($1) {
                            return $1 + ",";
                        });
                    })
                    self.poolIdInfo.TotalBalance = self.poolIdInfo.TotalBalance.replace(/,/g, "");
                    console.log(self.poolIdInfo.TotalBalance)
                    return res;
                }
                else
                    return p;
            },
            //超额覆盖比例等百分数校验
            theNumberCall: function ($event) {
                var target = $event.currentTarget;
                var str=$(target).val()
                var pt = new RegExp("[^0-9\.]");
                if (pt.test(str)) {
                    $(target).val('只能输入阿拉伯数字');
                }
            },
            //日期校验
            formatData: function ($event) {
            	console.log(00000000)
                var target = $event.target
                common.formatData(target)
            },
            //左侧切换
            changeNav: function (index, e, tips) {
                var index = index, _this = this, poolid;
                console.log("this是" + _this)
                if (tips) {
                    if (!_this.poolIdInfo.TotalBalance) {
                        GSDialog.HintWindow("当前资产没有资产信息！")
                    } else {
                        fn()
                    }
                } else {
                    fn()
                }
                function fn() {
                    if (_this.poolIdInfo.TotalBalance) {
                        _this.poolIdInfo.TotalBalance = _this.poolIdInfo.TotalBalance.replace(/,/g, "");
                    }
                    if (index == 0) {
                        if (_this.PoolId) {
                            $(".choseType").hide();
                        } else {
                            $(".choseType").show();
                        }
                    } else {
                        $(".choseType").show();
                    }

                    var hasClass = $(e.currentTarget).hasClass("aside_list_active");
                    if (!hasClass) {
                        $(".aside_list_box li").removeClass("aside_list_active");
                        $(".aside_list_box li:eq(" + index + ")").addClass("aside_list_active");
                        $(".aside_info_main>.aside_info_each").hide();
                        $(".aside_info_main>.aside_info_each:eq(" + index + ")").show();
                    }
                }
            },
            //获取资产数据方式Radio
            getUserChoseType: function (index) {
                var _this = this;
                if (index == 'step1') {
                    if (_this.chosedRadioStep1 == "0") {
                        _this.choseTypeStep1 = true;
                        _this.getOrganisationPoolId(_this.poolComeBind);
                    } else {
                        _this.choseTypeStep1 = false;
                        _this.poolIdInfoInput = [];
                    }
                    _this.choseTable = false;
                    _this.choseTableInput = false;
                } else {
                    if (_this.chosedRadioStep2 == true) {
                        _this.choseTypeStep2 = false;
                    } else {
                        _this.choseTypeStep2 = true;
                    }
                }
            },
            changeChoseTypeStep2: function(bool) {
                var _this = this;
                _this.choseTypeStep2 = bool;
            },
            //确认是否存在好的poolid版本showPoolIdTable
            ClickshowPoolIdTable: function (index) {
                var _this = this;
                if (index == "chose") {

                    if (!_this.PoolId) {
                        GSDialog.HintWindow("请选择资产PoolId")
                        return;
                    }

                    var svcUrl = webProxy.dataProcessServiceUrl + "CommonGetExecute?connConfig=TrustManagement&appDomain=ProductDesign&executeParams=";
                    var params = [
                        ["OrganisationCode", _this.poolComeBind, "string"],
                        ["RCPoolId", _this.PoolId, "string"]

                    ];
                    var promise = webProxy.comGetData(params, svcUrl, 'GetPoolInfo');
                    promise().then(function (response) {
                        var sourceData;
                        if (typeof response === 'string') { sourceData = JSON.parse(response); }
                        else { sourceData = response; }
                        for (var i = 0; i < sourceData.length; i++) {
                            if (_this.poolIdOptionBind == sourceData[i].PoolId) {
                                _this.poolIdInfo = sourceData[i];
                                _this.poolIdInfo.TotalBalance = common.numFormt(_this.poolIdInfo.TotalBalance);
                            }
                        }
                    })
                    _this.choseTable = true;
                } else {
                    _this.choseTableInput = true;
                }
            },

            //资产概述--获取表格
            showPoolIdTable: function (index) {
                var _this = this;
                if (index == "chose") {

                    var svcUrl = webProxy.dataProcessServiceUrl + "CommonGetExecute?connConfig=TrustManagement&appDomain=ProductDesign&executeParams=";
                    var params = [
                        ["OrganisationCode", _this.poolComeBind, "string"],
                        ["RCPoolId", _this.PoolId, "string"]

                    ];
                    var promise = webProxy.comGetData(params, svcUrl, 'GetPoolInfo');
                    promise().then(function (response) {
                        var sourceData;
                        if (typeof response === 'string') { sourceData = JSON.parse(response); }
                        else { sourceData = response; }
                        for (var i = 0; i < sourceData.length; i++) {
                            if (_this.poolIdOptionBind == sourceData[i].PoolId) {
                                _this.poolIdInfo = sourceData[i];
                                _this.poolIdInfo.TotalBalance = common.numFormt(_this.poolIdInfo.TotalBalance);
                            }
                        }
                    })
                    _this.choseTable = true;
                } else {
                    _this.choseTableInput = true;
                }
            },
            //资产概述--双击单元格
            showInputInput: function (e) {
                var child = $(e.currentTarget).children("input");
                var has = child.attr("readonly");
                if (has) {
                    child.removeAttr("readonly").addClass("inputAble");
                    child.removeAttr("onfocus").focus();
                }
            },
            //资产概述--单元格失去焦点
            addInputReady: function (e) {
                $(e.currentTarget).removeClass("inputAble").attr("readonly", "readonly").attr("onfocus", "this.blur()");
            },
            //是否设置循环区域
            choseCirculation: function () {
                var _this = this;
                if (_this.circulationPeriod == '1') {
                    _this.circulation = true;
                } else {
                    _this.circulation = false;
                    _this.circulationInput = '';
                }
            },
            //按poolid获取对应资产来源
            getOrganisationIdByPoolId: function () {
                var _this = this;
                var svcUrl = webProxy.dataProcessServiceUrl + "CommonGetExecute?connConfig=TrustManagement&appDomain=ProductDesign&executeParams=";
                var params = [
                    ["PoolId", _this.PoolId, "int"]
                ];
                var promise = webProxy.comGetData(params, svcUrl, 'GetOrganisationByPoolId'); //poolId = 319 时，得到DimOrganisationID, OrganisationCode, TrustID(2，CMB,375) 
                promise().then(function (response) {
                    var sourceData;
                    if (typeof response === 'string') { sourceData = JSON.parse(response); }
                    else { sourceData = response; }
                    _this.bindGetOrganisationIdByPoolIdResult(sourceData);
                })
            },
            bindGetOrganisationIdByPoolIdResult: function (data) {
                var _this = this;
                var svcUrl = webProxy.dataProcessServiceUrl + "CommonGetExecute?connConfig=TrustManagement&appDomain=dbo&executeParams=";
                var params = [
                    ["Key", '', "string"]
                ];
                var promise = webProxy.comGetData(params, svcUrl, 'usp_GetDimOrganisationID'); //获取所有的资产来源
                promise().then(function (response) {
                    var sourceData;
                    if (typeof response === 'string') { sourceData = JSON.parse(response); }
                    else { sourceData = response; }
                    _this.poolComeOption = sourceData;
                    _this.poolComeBind = data[0].OrganisationCode;
                    _this.getAssetType(_this.poolComeBind);
                    var svcUrl = webProxy.dataProcessServiceUrl + "CommonGetExecute?connConfig=TrustManagement&appDomain=ProductDesign&executeParams=";
                    var params = [
                        ["OrganisationCode", _this.poolComeBind, "string"]
                    ];
                    var promise = webProxy.comGetData(params, svcUrl, 'QuicklyGetPoolInfo');
                    promise().then(function (response) {
                        var sourceData;
                        if (typeof response === 'string') { sourceData = JSON.parse(response); }
                        else { sourceData = response; }
                        _this.poolIdOption = sourceData;
                        _this.poolIdOptionBind = _this.PoolId;
                        for (var i = 0; i < sourceData.length; i++) {
                            if (_this.PoolId == sourceData[i].PoolId) {
                                _this.poolIdInfo = sourceData[i];
                            }
                        }
                    })
                })
            },
            //获取资产来源，无poolid
            getOrganisationId: function () {
                var _this = this;
                var svcUrl = webProxy.dataProcessServiceUrl + "CommonGetExecute?connConfig=TrustManagement&appDomain=dbo&executeParams=";
                var params = [
                    ["Key", '', "string"]
                ];
                var promise = webProxy.comGetData(params, svcUrl, 'usp_GetDimOrganisationID');
                promise().then(function (response) {
                    var sourceData;
                    if (typeof response === 'string') { sourceData = JSON.parse(response); }
                    else { sourceData = response; }
                    _this.getOrganisationIdBindResult(sourceData);
                })
            },
            getOrganisationIdBindResult: function (data) {
                var _this = this, selected;
                _this.poolComeOption = data;
                selected = _this.poolComeOption[0].OrganisationCode;
                _this.poolComeBind = selected;
                _this.getAssetType(selected);
                _this.getOrganisationPoolId(selected);
            },
            //获取相应资产来源下的poolid
            getOrganisationPoolId: function (value) {
                var _this = this;
                var svcUrl = webProxy.dataProcessServiceUrl + "CommonGetExecute?connConfig=TrustManagement&appDomain=ProductDesign&executeParams=";
                var params = [
                    ["OrganisationCode", value, "string"]
                ];
                var promise = webProxy.comGetData(params, svcUrl, 'QuicklyGetPoolInfo');
                promise().then(function (response) {
                    var sourceData;
                    if (typeof response === 'string') { sourceData = JSON.parse(response); }
                    else { sourceData = response; }
                    if (sourceData != '') {
                        _this.poolIdOption = sourceData;
                        _this.poolIdOptionBind = sourceData[0].PoolId;
                        _this.PoolId = sourceData[0].PoolId;
                        _this.poolIdInfo = sourceData[0];
                    } else {
                        _this.poolIdOption = [];
                        _this.poolIdOptionBind = '';
                        _this.poolIdInfo = [];
                    }
                })
            },
            getChoseOrganisationPoolId: function () {
                var _this = this;
                _this.poolComeBind = $("#Organisation option:selected").val();
                _this.getAssetType(_this.poolComeBind);
                _this.getOrganisationPoolId(_this.poolComeBind);
                _this.choseTable = false;
            },
            choseOrganisationCode: function () {
                var _this = this;
                _this.poolIdInfo = [];
                _this.poolComeBind = $("#OrganisationInput option:selected").val();
            },
            getChosePoolIdToInfo: function () {
                var _this = this;
                _this.choseTable = false;
                _this.poolIdOptionBind = $("#PoolId option:selected").val();
                _this.PoolId = $("#PoolId option:selected").val();
                for (var i = 0; i < _this.poolIdOption.length; i++) {
                    if (_this.poolIdOptionBind == _this.poolIdOption[i].PoolId) {
                        _this.poolIdInfo = _this.poolIdOption[i];
                    }
                }
                _this.issue[0].TotalIssueAmount = '';
                _this.issue[0].FirstLayerInterestRate = '';
                _this.issue[0].FirstLayerPercentage = '';
                _this.issue[0].FirstLayerRating = '';
                _this.issue[0].SecondLayerInterestRate = '';
                _this.issue[0].SecondLayerRating = '';
                _this.issue[0].Layers = '';
                _this.cover = '';
            },
            //获取资产类型
            getAssetType: function (OrganisationCode) {
                var _this = this;
                var svcUrl = webProxy.dataProcessServiceUrl + "CommonGetExecute?connConfig=TrustManagement&appDomain=ProductDesign&executeParams=";
                var params = [
                    ["OrganisationCode", OrganisationCode, "string"]
                ];
                var promise = webProxy.comGetData(params, svcUrl, 'GetAssetTypeFromStaticPool');
                promise().then(function (response) {
                    var sourceData;
                    if (typeof response === 'string') { sourceData = JSON.parse(response); }
                    else { sourceData = response; }
                    if (sourceData.length > 0) {
                        _this.poolTypeOption = sourceData;
                        _this.poolTypeBind = sourceData[0].AssetType;
                    } else {
                        _this.poolTypeOption = '';
                        _this.poolTypeBind = [];
                    }
                })
            },
            getChosePoolType: function () {
                var _this = this;
                _this.poolTypeBind = $("#poolType  option:selected").val();
                $("#showCharAndInput").hide();
            },
            getChoseOverdue: function () {
                var _this = this;
                _this.poolOverdueBind = $("#poolOverdue option:selected").val();
                $("#showCharAndInput").hide();
            },
            //获取逾期期间图表
            toOrganisationChart: function () {
                var _this = this;
                var svcUrl = webProxy.dataProcessServiceUrl + "CommonGetExecute?connConfig=TrustManagement&appDomain=CreditRating&executeParams=";
                var params = [
                    ["OrganisationCode", _this.poolComeBind, "string"],//资产来源
                    ["AssetType", _this.poolTypeBind, "string"],//资产类型
                    ["Section", _this.poolOverdueBind, "string"]//逾期区间
                ];
                var promise = webProxy.comGetData(params, svcUrl, 'GetLossDistribution');
                promise().then(function (response) {
                    var sourceData;
                    if (typeof response === 'string') { sourceData = JSON.parse(response); }
                    else { sourceData = response; }
                    _this.showOverdueChart(sourceData);
                    // _this.showOverdueChartMore(sourceData);
                })
            },
            showOverdueChartMore: function (data) {
                var maxCount = 0, xDatas = [], dataSeries = [], self = this;

                $.each(data, function (i, v) {
                    var serie = {};
                    serie.name = v.StartDate;
                    var aryData = v.Value.split(',');
                    serie.data = $.map(aryData, function (item, index) { return parseFloat(item); });
                    dataSeries.push(serie);
                    if (v.Counts > maxCount) maxCount = v.Counts;
                });
                for (var i = 0; i < maxCount; i++) {
                    xDatas.push(i + 1);
                }
                var options = {
                    title: '静态池样本累计违约率时间曲线',
                    xDatas: xDatas,
                    legend: true,
                    yDatas: dataSeries
                };
                self._drawChart('#showHigh', options);
                $("#showCharAndInput").show();
            },
            //资产池数据图表
            showOverdueChart: function (data) {
                var _this = this, losses = [], probabilities = [], CDFs = [];
                $.each(data, function (i, v) {
                    if (v.Probability < 0.0001) {
                        return true;//equals to continue
                    }
                    losses.push(v.Loss);
                    probabilities.push(v.Probability);
                    CDFs.push(v.CDF);
                });
                var options = {
                    title: '累积违约率概率分布',
                    xDatas: losses,
                    yAxis: { title: { text: '概率密度(%)' } },
                    label: false,
                    cross: false,
                    yDatas: [{ name: '损失率', type: 'line', data: probabilities }],
                    style: { color: '#555', fontSize: '14px', fontFamily: 'Microsoft Yahei' }
                };
                _this._drawChart("#showHighChart", options);
                $("#showCharAndInput").show();
            },
            _drawChart: function (obj, options) {
                var hchartOptions = {
                    title: { text: options.title || '', style: options.style },
                    subtitle: { text: options.subTitle || '' },
                    xAxis: { categories: options.xDatas || [] },
                    yAxis: options.yAxis || { title: { text: '' } },
                    tooltip: {
                        enabled: true,
                        valueSuffix: options.tooltip || ''
                    },
                    plotOptions: {
                        line: {
                            dataLabels: { enabled: options.label || false },
                            enableMouseTracking: true
                        }
                    },
                    series: options.yDatas || []
                };
                if (options.legend) {
                    hchartOptions.legend = {
                        verticalAlign: 'bottom',
                        borderWidth: 0
                    }
                }
                if (options.cross) {
                    hchartOptions.tooltip.crosshairs = [{
                        width: 1,
                        color: "#006cee",
                        dashStyle: 'longdashdot'
                    }, {
                        width: 1,
                        color: "#006cee",
                        dashStyle: 'longdashdot',
                        zIndex: 100
                    }]
                }
                $(obj).highcharts(hchartOptions);
            },
            //超额覆盖比例
            scaleBlur: function () {
                var _this = this, scale;
                if (_this.issue[0].TotalIssueAmount!="") {
                    _this.issue[0].TotalIssueAmount =common.numFormt(_this.issue[0].TotalIssueAmount.replace(/,/g,""))
                }
                var number = _this.issue[0].TotalIssueAmount;
                if (_this.chosedRadioStep1 == "0") {//用户选择资产池信息
                    if (_this.issue[0].TotalIssueAmount != undefined && _this.issue[0].TotalIssueAmount) {
                        scale = (_this.poolIdInfo.TotalBalance / number.replace(/,/g, "")) - 1;
                        console.log(number.replace(/,/g, ""))
                        _this.cover = (scale * 100).toFixed(0);
                    }
                } else {//用户输入资产池信息
                    if (_this.issue[0].TotalIssueAmount != undefined && _this.issue[0].TotalIssueAmount) {
                        scale = (_this.poolIdInfoInput.TotalBalance / number.replace(/,/g, "")) - 1;
                        console.log(number.replace(/,/g, ""))
                        _this.cover = (scale * 100).toFixed(0);
                    }
                }
            },
            coverBlur: function ($event) {
                var target = $event.currentTarget;
                var str = $(target).val()
                var pt = new RegExp("[^0-9\.]");
                if (pt.test(str)) {
                    $(target).val('只能输入阿拉伯数字');
                    return 
                }
                var _this = this;
                _this.issue[0].scale == '';
                if (_this.chosedRadioStep1 == "0") {
                    if (_this.cover != undefined && _this.cover) {
                        _this.issue[0].TotalIssueAmount = (_this.poolIdInfo.TotalBalance / (Number(_this.cover / 100) + 1) / 100).toFixed(0) * 100;
                        _this.issue[0].TotalIssueAmount = common.numFormt(_this.issue[0].TotalIssueAmount);
                    }
                } else {
                    if (_this.cover != undefined && _this.cover) {
                        _this.issue[0].TotalIssueAmount = (_this.poolIdInfoInput.TotalBalance / (Number(_this.cover / 100) + 1) / 100).toFixed(0) * 100;
                        _this.issue[0].TotalIssueAmount = common.numFormt(_this.issue[0].TotalIssueAmount);
                    }
                }
            },
            //试算分层
            trialHierarchy: function () {
                var _this = this;
                var TotalissueAmount = _this.issue[0].TotalIssueAmount,
                    SolutionName = _this.SolutionName,
                    PoolBalance = "",
                    PoolReturn = "",
                    OrganisationCode = _this.poolComeBind,
                    AssetType = _this.poolTypeBind,
                    ArrearsSection = _this.poolOverdueBind,
                    FirstLayerInterestRate = _this.issue[0].FirstLayerInterestRate,
                    FirstLayerRating = _this.issue[0].FirstLayerRating,
                    FirstLayerPercentage = _this.issue[0].FirstLayerPercentage,
                    SecondLayerInterestRate = _this.issue[0].SecondLayerInterestRate,
                    SecondLayerRating = _this.issue[0].SecondLayerRating,
                    SubordinaryLayerPercentage = _this.issue[0].SubordinaryLayerPercentage,
                    Layers = _this.issue[0].Layers,
                    StartDate = $("#StartDate").val(),
                    TopUp = this.circulationPeriod,
                    TopUpPeriod = this.circulationInput == "" ? 0 : this.circulationInput,
                    StartDate = $("#StartDate").val(),
                    ProjectLength = _this.ProjectLength;
                if (_this.chosedRadioStep1 == "0") {
                    PoolBalance = _this.poolIdInfo.TotalBalance;
                    PoolReturn = _this.poolIdInfo.WACurrentRate;
                }
                if (_this.chosedRadioStep1 == "1") {
                    PoolBalance = _this.poolIdInfoInput.TotalBalance;
                    PoolReturn = _this.poolIdInfoInput.WACurrentRate;
                }
                if (SolutionName == '') { GSDialog.HintWindow("请输入方案名称"); return; }
                if (TotalissueAmount == '') { GSDialog.HintWindow("请输入发行规模"); return; }
                if (PoolBalance == "") { GSDialog.HintWindow("请输入资产池规模"); return; }
                if (PoolReturn == "") { GSDialog.HintWindow("请输入资产池加权平均利率"); return; }
                if (OrganisationCode == "") { GSDialog.HintWindow("请输入资产来源"); return; }
                if (!AssetType || AssetType == "") { GSDialog.HintWindow("请输入资产类型"); return; }
                if (ArrearsSection == "") { GSDialog.HintWindow("请输入逾期区间"); return; }
                if (FirstLayerInterestRate == "") { GSDialog.HintWindow("请输入最优先级票面利率"); return; }
                if (FirstLayerRating == "") { GSDialog.HintWindow("请输入最优先级目标评级"); return; }
                if (FirstLayerPercentage == "") { GSDialog.HintWindow("请输入最优先级比例下限"); return; }
                if (SecondLayerInterestRate == "") { GSDialog.HintWindow("请输入夹层票面利率"); return; }
                if (SecondLayerRating == "") { GSDialog.HintWindow("请输入夹层目标评级"); return; }
                if (SubordinaryLayerPercentage == "") { GSDialog.HintWindow("请输入次级比例"); return; }
                if (Layers == "") {
                    GSDialog.HintWindow("请输入层数"); return;
                }
                if (StartDate == "") { GSDialog.HintWindow("请输入产品设立日"); return; }
                //日期区间校验
                if (_this.poolIdInfo.PoolCloseDate) {
                    var one = parseInt(StartDate.substring(0, 4));//专项计划设立日
                    var one1 = parseInt(_this.poolIdInfo.PoolCloseDate.substring(0, 4));//封包日
                    var two = parseInt(StartDate.substring(5, 7));
                    var two1 = parseInt(_this.poolIdInfo.PoolCloseDate.substring(5, 7));
                    var three = parseInt(StartDate.substring(8, 10));
                    var three1 = parseInt(_this.poolIdInfo.PoolCloseDate.substring(8, 10));
                    if (one < one1) {
                        GSDialog.HintWindow("产品设立日不能早于资产池封包日");
                        return;
                    } else if (one == one1 && two < two1) {
                        GSDialog.HintWindow("产品设立日不能早于资产池封包日");
                        return;
                    } else if (one == one1 && two == two1 && three < three1) {
                        GSDialog.HintWindow("产品设立日不能早于资产池封包日");
                        return;
                    }
                }
                if (ProjectLength == "") { GSDialog.HintWindow("请输入产品期限"); return; }
                var svcUrl = webProxy.dataProcessServiceUrl + "CommonGetExecute?connConfig=TrustManagement&appDomain=ProductDesign&executeParams=";
                var params = [
                    ["SolutionName", SolutionName, "string"],//方案名称
                    ["TotalissueAmount", TotalissueAmount, "decimal"],//发行规模
                    ["PoolBalance", PoolBalance, "decimal"],//资产池规模
                    ["PoolReturn", PoolReturn, "decimal"],//资产池加权平均利率
                    ["OrganisationCode", OrganisationCode, "string"],//资产来源
                    ["AssetType", AssetType, "string"],//资产类型
                    ["ArrearsSection", ArrearsSection, "string"],//逾期区间
                    ["FirstLayerInterestRate", FirstLayerInterestRate, "decimal"],//最优先级票面利率
                    ["FirstLayerRating", FirstLayerRating, "string"],//最优先级目标评级
                    ["FirstLayerPercentage", FirstLayerPercentage, "decimal"],//最优先级比例下限
                    ["SecondLayerInterestRate", SecondLayerInterestRate, "decimal"],//夹层票面利率
                    ["SecondLayerRating", SecondLayerRating, "string"],//夹层目标评级
                    ["SubordinaryLayerPercentage", SubordinaryLayerPercentage, "decimal"],//次级比例
                    ["Layers", Layers, "int"],//层数
                    ["StartDate", StartDate, "string"],//专项计划设立日
                    ["ProjectLength", ProjectLength, "int"],//专项计划期限
                    ["TopUp", TopUp, "int"],//专项计划期限
                    ["TopUpPeriod", TopUpPeriod, "int"]//专项计划期限
                ];
                var promise = webProxy.comGetData(params, svcUrl, 'CalculateTranching');
                promise().then(function (response) {
                    if (typeof response === 'string') {
                        console.log(_this.SolutionName)
                        _this.getSolutionSelect(_this.SolutionName);
                        $("#next1").click();

                    }
                })


            },
            //生成产品
            productGeneration: function () {
                var _this = this;
                if (!_this.poolIdInfo.PoolCloseDate) {
                    GSDialog.HintWindow("数据不存在");
                    return false;
                }
                GSDialog.HintWindowTF("是否覆盖当前产品？", function () {
                    _this.loading = true;
                    _this.$nextTick(function () {
                        var poolCloseDate;
                        var svcUrl = webProxy.dataProcessServiceUrl + "CommonGetExecute?connConfig=TrustManagement&appDomain=ProductDesign&executeParams=";
                        if (_this.chosedRadioStep1 == "0") {
                            poolCloseDate = _this.poolIdInfo.PoolCloseDate;
                        } else {
                            poolCloseDate = _this.poolIdInfoInput.PoolCloseDate;
                        }
                        var params = [
                                ["SolutionName", _this.solutionSelect, "string"],
                                ["TrustID", _this.applySelect, "int"],
                                ["PoolCloseDate", poolCloseDate, "date"]
                        ];

                        var promise = webProxy.comGetData(params, svcUrl, 'ApplyDesignResult');
                        promise().then(function (response) {
                            var sourceData;
                            if (typeof response === 'string') { sourceData = JSON.parse(response); }
                            else { sourceData = response; }
                            // window.location.href = "https://poolcutwcf/TrustManagementService/TrustManagement/viewTrust.html?tid=" + _this.applySelect + "#tab=trustwizard&&step=0";
                            window.location.href = GlobalVariable.TrustManagementServiceHostURL + "productDesign/stresstest/StressTest.html?TrustId=" + _this.applySelect + "#;step=layer";
                        });
                        _this.loading = false;
                    });
                })
            },
            //productGeneration: function () {
            //    var _this = this;
            //    $.anyDialog({
            //        title: '是否覆盖当前产品？',
            //        height: 100,
            //        width: 350,
            //        changeallow: false,
            //        buttonGroup: [{
            //            text: '覆盖',
            //            event: function () {
            //                _this.loading = true;
            //                var poolCloseDate;
            //                var svcUrl = webProxy.dataProcessServiceUrl + "CommonGetExecute?connConfig=TrustManagement&appDomain=ProductDesign&executeParams=";
            //                if (_this.chosedRadioStep1 == "0") {
            //                    poolCloseDate = _this.poolIdInfo.PoolCloseDate;
            //                } else {
            //                    poolCloseDate = _this.poolIdInfoInput.PoolCloseDate;
            //                }
            //                var params = [
            //                        ["SolutionName", _this.solutionSelect, "string"],
            //                        ["TrustID", _this.applySelect, "int"],
            //                        ["PoolCloseDate", poolCloseDate, "date"]
            //                ];

            //                var promise = webProxy.comGetData(params, svcUrl, 'ApplyDesignResult');
            //                promise().then(function (response) {
            //                    var sourceData;
            //                    if (typeof response === 'string') { sourceData = JSON.parse(response); }
            //                    else { sourceData = response; }
            //                    // window.location.href = "https://poolcutwcf/TrustManagementService/TrustManagement/viewTrust.html?tid=" + _this.applySelect + "#tab=trustwizard&&step=0";
            //                    //window.location.href = GlobalVariable.TrustManagementServiceHostURL + "productDesign/stresstest/StressTest.html?TrustId=" + _this.applySelect + "#;step=layer";
            //                });
            //                _this.loading = false;
            //            }
            //        }, {
            //            text: '取消',
            //            event: function () {
            //                this.closePopup();
            //            }
            //        }],
            //        type: 'confirm',
            //        scrollable: true,
            //        isMaskClickToClose: false,
            //        dragable: true
            //    });

            //},
            //solution
            getSolutionSelect: function (SolutionName) {
                var _this = this;
                var svcUrl = webProxy.dataProcessServiceUrl + "CommonGetExecute?connConfig=TrustManagement&appDomain=ProductDesign&executeParams=";
                if (SolutionName) {
                    var params = [
                        ["SolutionName", SolutionName, "string"]
                    ];
                } else {
                    var params = [
                        ["SolutionName", _this.solutionSelect, "string"]
                    ];
                }
                var promise = webProxy.comGetData(params, svcUrl, 'GetAvailableDesigns');
                promise().then(function (response) {
                    var sourceData;
                    if (typeof response === 'string') { sourceData = JSON.parse(response); }
                    else { sourceData = response; }
                    if (SolutionName) {
                        _this.solutionSelect = SolutionName;
                    } else {
                        _this.solutionSelect = (sourceData && sourceData.length > 0) ? sourceData[0].SolutionName : "";
                    }
                    _this.solution = sourceData;
                    var svcUrl = webProxy.dataProcessServiceUrl + "CommonGetExecute?connConfig=TrustManagement&appDomain=ProductDesign&executeParams=";
                    var params = [
                        ["SolutionName", _this.solutionSelect, "string"]
                    ];
                    var promise = webProxy.comGetData(params, svcUrl, 'GetTranchingResult');
                    promise().then(function (response) {
                        var sourceData;
                        if (typeof response === 'string') { sourceData = JSON.parse(response); }
                        else { sourceData = response; }
                        _this.solutionInfo = sourceData;
                    })
                    Vue.nextTick(function () {
                        $("#TryLists").next().remove();
                        $("#applyTrust").next().remove();
                        $("#TryLists").searchableSelect();
                        $("#applyTrust").searchableSelect();
                    })
                })
            },
            //solution切换时表格内容
            getSolutionInfo: function () {
                var _this = this;
                _this.solutionSelect = $("#TryLists").parent().find('.searchable-select-holder').text()
                var svcUrl = webProxy.dataProcessServiceUrl + "CommonGetExecute?connConfig=TrustManagement&appDomain=ProductDesign&executeParams=";
                var params = [
                    ["SolutionName", _this.solutionSelect, "string"]
                ];
                var promise = webProxy.comGetData(params, svcUrl, 'GetTranchingResult');
                promise().then(function (response) {
                    var sourceData;
                    if (typeof response === 'string') { sourceData = JSON.parse(response); }
                    else { sourceData = response; }
                    _this.solutionInfo = sourceData;
                })
            },
            //applySolutionInfo
            getApplySolutionInfo: function () {
                var _this = this;
                var svcUrl = webProxy.dataProcessServiceUrl + "CommonGetExecute?connConfig=TrustManagement&appDomain=ProductDesign&executeParams=";
                var params = [
                    ["Param", '', "string"]
                ];
                var promise = webProxy.comGetData(params, svcUrl, 'GetTrustList');
                promise().then(function (response) {
                    var sourceData;
                    if (typeof response === 'string') { sourceData = JSON.parse(response); }
                    else { sourceData = response; }
                    _this.applySolutionInfo = sourceData.reverse();
                    _this.applySelect = _this.applySolutionInfo[0].TrustId;
                })
            },
            //choseApplySelect
            choseApplySelect: function () {
                var _this = this;
                _this.applySelect = $("#applyTrust option:selected").val();
            },
            editPercentage: function () {
                var self = this;
                var originalSolution = JSON.parse(JSON.stringify(self.solutionInfo));
                if (originalSolution.length > 0) {
                    self.c_SolOriginalPercentage = [];
                    $.each(originalSolution, function (i, v) {
                        self.c_SolOriginalPercentage.push(v.Percentage);
                    });
                    self.c_SolPercentageReadOnly = false;
                }
            },
            cancelPercentage: function () {
                var self = this;
                if (self.solutionInfo && self.solutionInfo.length > 0) {
                    $.each(self.solutionInfo, function (i, v) {
                        v.Percentage = self.c_SolOriginalPercentage[i] ? self.c_SolOriginalPercentage[i] : 0;
                    });
                    self.c_SolPercentageReadOnly = true;
                }
            },
            savePercentage: function () {
                var self = this;
                var perTotal = 0;
                var isPass = true;
                if (self.solutionInfo && self.solutionInfo.length > 0) {
                    $.each(self.solutionInfo, function (i, v) {
                        if (!isNaN(v.Percentage) && v.Percentage >= 0 && v.Percentage <= 1) {
                            perTotal = self.FloatAdd(perTotal, v.Percentage);
                        } else {
                            isPass = false;
                            return false;
                        }
                    });
                }
                if ((perTotal == 1) && isPass) {
                    var savePerXml = '<Tranching>';
                    $.each(self.solutionInfo, function (i, v) {
                        var tempXml = '<TrustBond><TrustBondId>{0}</TrustBondId><Percentage>{1}</Percentage><OfferAmount>{2}</OfferAmount></TrustBond>';
                        v.OfferAmount = Math.round(v.Percentage * self.c_SolTotalOfferAmount);
                        savePerXml = [savePerXml, tempXml.format(v.TrustBondId, v.Percentage, v.OfferAmount)].join('');
                    });
                    savePerXml = [savePerXml, '</Tranching>'].join('');
                    var svcUrl = webProxy.dataProcessServiceUrl + "CommonGetExecute?connConfig=TrustManagement&appDomain=ProductDesign&executeParams=";
                    var params = [
                        ["SolutionName", self.solutionSelect, "string"],
                        ["ModifyCol", 'Percentage', "string"],
                        ["ModifyXml", savePerXml, "xml"]
                    ];
                    var promise = webProxy.comGetData(params, svcUrl, 'ModifyTranching');
                    promise().then(function (response) {
                        self.c_SolPercentageReadOnly = true;
                    });
                } else {
                    GSDialog.HintWindow('输入分层比例不合法！');
                    return;
                }
            },
            editInterestRate: function () {
                var self = this;
                var originalSolution = JSON.parse(JSON.stringify(self.solutionInfo));
                if (originalSolution.length > 0) {
                    self.c_SolOriginalInterestRate = [];
                    $.each(originalSolution, function (i, v) {
                        self.c_SolOriginalInterestRate.push(v.InterestRate);
                    });
                    self.c_SolInterestRateReadOnly = false;
                }
            },
            cancelInterestRate: function () {
                var self = this;
                if (self.solutionInfo && self.solutionInfo.length > 0) {
                    $.each(self.solutionInfo, function (i, v) {
                        v.InterestRate = self.c_SolOriginalInterestRate[i] ? self.c_SolOriginalInterestRate[i] : 0;
                    });
                    self.c_SolInterestRateReadOnly = true;
                }
            },
            saveInterestRate: function () {
                var self = this;
                var isPass = true;
                if (self.solutionInfo && self.solutionInfo.length > 0) {
                    $.each(self.solutionInfo, function (i, v) {
                        if (isNaN(v.InterestRate)) {
                            isPass = false;
                            return false;
                        }
                    });
                }
                if (isPass) {
                    var savePerXml = '<Tranching>';
                    $.each(self.solutionInfo, function (i, v) {
                        var tempXml = '<TrustBond><TrustBondId>{0}</TrustBondId><InterestRate>{1}</InterestRate></TrustBond>';
                        savePerXml = [savePerXml, tempXml.format(v.TrustBondId, v.InterestRate)].join('');
                    });
                    savePerXml = [savePerXml, '</Tranching>'].join('');
                    var svcUrl = webProxy.dataProcessServiceUrl + "CommonGetExecute?connConfig=TrustManagement&appDomain=ProductDesign&executeParams=";
                    var params = [
                        ["SolutionName", self.solutionSelect, "string"],
                        ["ModifyCol", 'InterestRate', "string"],
                        ["ModifyXml", savePerXml, "xml"]
                    ];
                    var promise = webProxy.comGetData(params, svcUrl, 'ModifyTranching');
                    promise().then(function (response) {
                        self.c_SolInterestRateReadOnly = true;
                    });
                } else {
                    GSDialog.HintWindow('输入票面利率不合法！');
                    return;
                }
            },
            //浮点数加法运算
            FloatAdd: function (arg1, arg2) {
                var r1, r2, m;
                try { r1 = arg1.toString().split(".")[1].length } catch (e) { r1 = 0 }
                try { r2 = arg2.toString().split(".")[1].length } catch (e) { r2 = 0 }
                m = Math.pow(10, Math.max(r1, r2));
                n = (r1 >= r2) ? r1 : r2;
                return parseFloat(((arg1 * m + arg2 * m) / m).toFixed(n));
            },
        },
        computed: {
            TotalBalanceRender:function(){
            }
        },
        filters: {
            numFormt: function (p) {
                console.log(p)
                if (parseFloat(p) == p) {
                    var res = p.toString().replace(/\d+/, function (n) { // 先提取整数部分
                        return n.replace(/(\d)(?=(\d{3})+$)/g, function ($1) {
                            return $1 + ",";
                        });
                    })
                    console.log(res);
                    this.infocal = res;
                    console.log(this.infocal)
                    return res;
                }
                else
                    return p;
            }
        },
        watch: {
            solutionInfo: function () {
                var self = this;
                var sum = 0;
                if (self.solutionInfo && self.solutionInfo.length > 0) {
                    $.each(self.solutionInfo, function (i, v) {
                        if (v.OfferAmount && !isNaN(v.OfferAmount)) {
                            sum += v.OfferAmount;
                        }
                    });
                }
                self.c_SolTotalOfferAmount = sum;
            },

        }
    });

});



