define(function (require) {
    var $ = require('jquery');
    require('lodash');
    var d3 = require('d3');
    var dagreD3 = require('dagreD3');
    var tipsy = require('tipsy');
    require('anyDialog')
    var GSDialog = require('gs/uiFrame/js/gs-admin-2.pages');
    var common = require('common');
    //var gsUtil = require('gsUtil');
    var GlobalVariable = require('globalVariable');
    require('date_input');
    //require('calendar');
    require('jquery-ui');
    var FormatNumber = require('gs/format.number');
    require("app/projectStage/js/project_interface");
    var Vue = require('Vue2');
    var draggable = require("vuedraggable");
    var GSDialog = require('gs/uiFrame/js/gs-admin-2.pages');
    var ActLogs = require('insertActlogs');
    var RoleOperate = require('gs/uiFrame/js/roleOperate');
    var userName = RoleOperate.cookieName();
    var ip;
    var toast = require('toast');
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
    var RULE_TREE = [{
        accountName: 'TrustPlanAccount',
        title: '信托收款账户',
        local_rules: [],
        global_rules: []
    }, {
        accountName: 'TrustPlanAccount_Interest',
        title: '收入分账户',
        local_rules: [],
        global_rules: []
    }, {
        accountName: 'TrustPlanAccount_Principal',
        title: '本金分账户',
        local_rules: [],
        global_rules: []
    }, {
        accountName: 'TrustPlanAccount_Reserve',
        title: '信托储备账户',
        local_rules: [],
        global_rules: []
    }, {
        accountName: 'Other',
        title: '其他',
        local_rules: [],
        global_rules: []
    }]
    var demoData = [];
    //实例化Vue对象vm
    //注册draggable组件
    Vue.component('draggable', draggable);
    var ACCOUNT_TYPE_CLASS_MAP = {
        "TrustPlanAccount_Principal_AvailableAmt": 'accountTpye1',
        "TrustPlanAccount_Interest_AvailableAmt": 'accountTpye2',
        "TrustPlanAccount_Total_AvailableAmt": 'accountTpye3',
        "TrustPlanAccount_Reserve_AvailableAmt": 'accountTpye4'
    };
    var vm = new Vue({ //c_:current表示当前
        el: '#app',
        data: {
            isPaymentScenarioViewOpen: false,
            ruleSearchQuery: "",
            demoData: demoData,
            accountView: 0,
            showThe:'1',//显示全局或者局部规则
            flexLayoutData: { left: true, right: false },
            loading: true, //加载状态
            isSaving: false,
            outin: true,//标识在收入页还是在支出页
            trustId: common.getQueryString('tid'),//专项计划ID
            isStructure: common.getQueryString('isStructure') ? common.getQueryString('isStructure') : 0,//判断是否来自结构化工具的访问
            structureScenarioId: common.getQueryString('ScenarioId') ? common.getQueryString('ScenarioId') : 0,//来自结构化工具的偿付情景ID
            structureStartDate: common.getQueryString('StartDate') ? common.getQueryString('StartDate') : 0,//来自结构化工具的期数起始时间
            structureEndDate: common.getQueryString('EndDate') ? common.getQueryString('EndDate').replace(/\-/g, '') : 0,//来自结构化工具的期数结束时间
            structureEndDateNF: common.getQueryString('EndDate') ? common.getQueryString('EndDate') : 0,//来自结构化工具的期数结束时间
            isCover: 0,//结构化工具保存是否允许覆盖（1允许，0不允许）
            isIncomeAllocationP: 0,//高收益档规则是否启动收益率模式
            flage:0,//禁断标识
            //tabView: 0,//选项卡(基础配置,配置账户,配置规则)
            slideIn: false, //全局规则收缩
            dataAccounts: [],//账户数据源
            dataGlobalRules: [],//全局规则数据源
            dataLocalRules: [],//局部规则数据源,
            rule_tree: RULE_TREE,//规则树形分类节点
            dataOfBondFees: [], //费用债券元素数据源
            paymentScenarioList: [], //偿付情景列表及数据
            c_Scenario: { tabView: 0 }, //当前偿付情景
            c_Obj: {}, //当前点击编辑的元素
            objBeforeEdit: { //记录编辑对象的初始数据             
                Amount: 0,
                Percentage: 0,
                AllocationRuleOfSameLevel: '',
                Source: '',
                Target: '',
                SubClassAllocationSequence: '',
                Supplement: '',
                RoudRule: '',
                //新增两个元素 Genre TransferAmount TriggerCondition
                Genre: '',
                TransferAmount: '',
                TriggerCondition: ''
            },
            IncomeEle: [],//次级收益分配规则数据源
            IsAddingScenarioName: false, //是否正在新增偿付情景
            addingScenarioName: "", //正在新增的偿付情景名称
            scenarioNameBeforeEdit: "", //正在修改的偿付顺序的初始名称
            AllocationRuleOfSameLevel: [//同级分配下拉数据源
                { 'Value': '', 'Text': '--请选择--' },
                { 'Value': 'ABasedOnDue', 'Text': '按应付金额' },
                { 'Value': 'ABasedOnCPB', 'Text': '按剩余本金' },
                { 'Value': 'ABasedOnAVG', 'Text': '平均分配' }
                ],
            RoudRuleOptions:[
                { 'Value': '', 'Text': '--请选择--' },
                { 'Value': '0', 'Text': 'Round' },
                { 'Value': '1', 'Text': 'RoundUp' },
                { 'Value': '2', 'Text': 'RoundDown' }
            ],
            //新增两个元素 Genre TransferAmount TriggerCondition
            GenreOptions: [
                { 'Value': '', 'Text': '--请选择--' },
                { 'Value': '0', 'Text': '单期' },
                { 'Value': '1', 'Text': '多期' }
            ],
            TransferAmountOptions: [
                { 'Value': '', 'Text': '--请选择--' },
                { 'Value': '0', 'Text': 'Round' },
                { 'Value': '1', 'Text': 'RoundUp' },
                { 'Value': '2', 'Text': 'RoundDown' }
            ],
            TriggerConditionOptions: [
                { 'Value': '', 'Text': '--请选择--' },
                { 'Value': '0', 'Text': 'Round' },
                { 'Value': '1', 'Text': 'RoundUp' },
                { 'Value': '2', 'Text': 'RoundDown' }
            ],
            c_ObjRoudRuleOptions:[],//舍入规则
            c_ObjGenreOptions: [],//舍入规则
            c_ObjNecessaryAmountOptions: [],//舍入规则
            c_ObjAllocationRuleOptions: [],//当前点击对象同级分配规则
            c_ObjHasEles: [], //当前点击对象的已有元素
            c_ObjTriggerConditionOptionsEX:[],//当前点击对象触发条件触发元素
            c_ScenarioEles: [],  //当前偿付情景中所有对象点击编辑的元素数据源
            changedAccountName: '', //拖动费用元素时账户来源变更
            periodStartOptions: [],//起始日期下拉数据源
            periodEndOptions: [], //终止日期下拉数据源
            deletedScenarios: [], //已删除的偿付情景，
            bondFeesOptions: [], //来源和目标下拉数据源,
            dragEndFlag: true,
            /* ---------------------  保存模板  ----------------------- */
            scenarioTmpXml: ['<Scenario>',
		                        '<StartDateId>{0}</StartDateId>',
		                        '<EndDateId>{1}</EndDateId>',
                                '<ScenarioName>{2}</ScenarioName>',
                                '<InterestPrecision>{3}</InterestPrecision>',
		                        '<PrincipalPrecision>{4}</PrincipalPrecision>',
		                        '<ExcludedDatesId>{5}</ExcludedDatesId>',
		                        '<PaymentSequence>{6}</PaymentSequence>',
                                '<EventList>{7}</EventList>',
                                '<ScenarioType>{8}</ScenarioType>',
                                '<PaymentPhaseName>{9}</PaymentPhaseName>',
                                '<RuleSequence>{10}</RuleSequence>',
	                        '</Scenario>'].join(''),
            levelTmpXml: ['<Level>',
				              '<LevelId>{0}</LevelId>',
				              '<Elements>{1}</Elements>',
                          '</Level>'].join(''),

            elementTmpXml: ['<Element>',
						        '<Name>{0}</Name>',
                                '<Code>{1}</Code>',
                                '<DisplayName>{2}</DisplayName>',
                                '<ProcessorName>{3}</ProcessorName>',
                                '<Category>{4}</Category>',
						        '<Type>{5}</Type>',
                                '<RuleType>{6}</RuleType>',
						        '<ClassType>{7}</ClassType>',
						        '<Amount>{8}</Amount>',
						        '<Percentage>{9}</Percentage>',
						        '<AllocationRuleOfSameLevel>{10}</AllocationRuleOfSameLevel>',
						        '<Source>{11}</Source>',
						        '<Target>{12}</Target>',
						        '<ElementNames>{13}</ElementNames>',
                                '<ElementRange>{14}</ElementRange>',
                                '<SubClassAllocationSequence>{15}</SubClassAllocationSequence>',
                                '<Supplement>{16}</Supplement>',
                                '<CashFlowDirection>{17}</CashFlowDirection>',
                                '<RoudRule>{18}</RoudRule>',
                                '<Genre>{19}</Genre>',
                                '<TransferAmount>{20}</TransferAmount>',
                                '<TriggerCondition>{21}</TriggerCondition>',
					        '</Element>'].join(''),
            //新增两个元素 Genre TransferAmount
            ruleTmpXml: ['<Rule>',
				            '<Name>{0}</Name>',
				            '<Code>{1}</Code>',
                            '<DisplayName>{2}</DisplayName>',
                            '<ProcessorName>{3}</ProcessorName>',
				            '<Category>{4}</Category>',
                            '<Type>{5}</Type>',
				            '<RuleType>{6}</RuleType>',
                            '<ClassType>{7}</ClassType>',
				            '<Amount>{8}</Amount>',
						    '<Percentage>{9}</Percentage>',
						    '<AllocationRuleOfSameLevel>{10}</AllocationRuleOfSameLevel>',
						    '<Source>{11}</Source>',
						    '<Target>{12}</Target>',
                            '<RoudRule>{13}</RoudRule>',
                            '<Genre>{14}</Genre>',
                            '<TransferAmount>{15}</TransferAmount>',
                            '<TriggerCondition>{16}</TriggerCondition>',
						    '<ElementNames>{17}</ElementNames>',
                            '<ElementRange>{18}</ElementRange>',
			            '</Rule>'].join(''),
            /* ----------------------------------------------------------------- */
        },
        mounted: function () {
            var self = this;
            Vue.nextTick(function () {
                $(self.$refs.rule_tree_node).click(function () {
                    $(this).find('i').toggleClass(' fa-folder-open fa-folder')
                    $(this).next().find('i').toggleClass(' fa-folder-open fa-folder')
                    $(this).next().next().find('i').toggleClass(' fa-folder-open fa-folder')
                    $(this).next().slideToggle();
                    $(this).next().next().slideToggle();

                })
                $(document).on("click", ".singer", function () {
                    $(this).find('i').toggleClass(' fa-folder-open fa-folder')
                    $(this).parent(".globle-rule-tree").find(".tree_node_wrap").slideToggle();
                })
                $(document).on("click", ".Multi", function () {
                    $(this).find('i').toggleClass(' fa-folder-open fa-folder')
                    $(this).parent(".globle-rule-tree").find(".tree_node_wrap").slideToggle();
                })
                //滚动时固定表格头部
                self.$refs.table.addEventListener('scroll', self.scrollHandle);
                $(".field-details").tooltip();
            })
            //若标识得到isStructure为1那么进入结构化工具状态
            if (self.isStructure == 0) {
                self.getRulesAndAccountsFromXmlFile(function () {
                    self.getDataOfBondFees(function () {
                        self.getTrustPaymentSequence(0);
                    });
                });
                self.getTrustPeriod(function (response) { self.initStartAndEndPeriod(response); });
            } else {
                self.getRulesAndAccountsFromXmlFile(function () {
                    self.getDataOfBondFees(function () {
                        self.getStructureScenario();
                    });
                });
                self.getTrustPeriod(function (response) { self.initStartAndEndPeriod(response); });
                self.getIsCover(function (response) {
                    if (!response[0].result) {
                        self.isCover = true;
                    }
                });
            }
        },
        methods: {
            //加载来自结构化页面的偿付顺序(有且只有一个)
            getStructureScenario: function () {
                var self = this;
                var executeParam = {
                    'SPName': "usp_getStructureScenario", 'SQLParams': [
                        { 'Name': 'TrustId', 'Value': self.trustId, 'DBType': 'int' },
                        { 'Name': 'ScenarioId', 'Value': self.structureScenarioId, 'DBType': 'int' },
                        { 'Name': 'StartDate', 'Value': self.structureStartDate, 'DBType': 'int' },
                        { 'Name': 'EndDate', 'Value': self.structureEndDateNF, 'DBType': 'string' }
                    ]
                };
                self.getSourceData(executeParam, function (response) {
                    //self.isNodata = response.length == 0 ? true : false;
                    if (response) {
                        self.loading = false;
                        $.each(response, function (i, v) {
                            var scenarioData = JSON.parse(v.PaymentSequence);
                            var scenarioId = scenarioData.ScenarioId ? scenarioData.ScenarioId : '';
                            var scenarioName = scenarioData.ScenarioName ? scenarioData.ScenarioName : '';
                            var startDateId = scenarioData.StartDateId ? scenarioData.StartDateId : '';
                            var endDateId = scenarioData.EndDateId ? scenarioData.EndDateId : '';
                            var principalPrecision = scenarioData.PrincipalPrecision ? scenarioData.PrincipalPrecision : '';
                            var interestPrecision = scenarioData.InterestPrecision ? scenarioData.InterestPrecision : '';
                            var isChecked = self.initIsChecked(scenarioData);
                            var excludedDatesId = scenarioData.ExcludedDatesId;
                            var hasLocalRules = self.initScenarioHasLocalRules(scenarioData);
                            var hasGlobalRules = JSON.parse(v.RuleSequence).Rules;
                            //拼装结构化工具全局规则
                            $.each(hasGlobalRules, function (i, v) {
                                $.each(self.dataGlobalRules, function (o, p) {
                                    if (v.Type == 'Rule' && v.Code == p.Code) {
                                        v.IsAllocationRuleOfSameLevel = p.IsAllocationRuleOfSameLevel;
                                        v.IsAmount = p.IsAmount;
                                        v.IsElementNames = p.IsElementNames;
                                        v.IsPercentage = p.IsPercentage;
                                        v.IsRepeat = p.IsRepeat;
                                        v.IsSource = p.IsSource;
                                        v.IsTarget = p.IsTarget;
                                        v.isSupplement = p.isSupplement;
                                        v.isRoudRule = p.isRoudRule;
                                        //新增两个元素 Genre TransferAmount TriggerCondition
                                        v.isGenre = p.isGenre;
                                        v.isTransferAmount = p.isTransferAmount;
                                        v.isTriggerCondition = p.isTriggerCondition;
                                        //修复结构化工具显示错的bug
                                        v.AmountDisplayname = p.AmountDisplayname;
                                        v.AllocationRuleOfSameLevelDisplayname = p.AllocationRuleOfSameLevelDisplayname;
                                        v.TriggerConditionDisplayname = p.TriggerConditionDisplayname;
                                        v.TransferAmountDisplayname = p.TransferAmountDisplayname;
                                        v.SupplementDisplayname = p.SupplementDisplayname;
                                        v.PercentageDisplayname = p.PercentageDisplayname;
                                        v.RoudRuleDisplayname = p.RoudRuleDisplayname;
                                        v.GenreDisplayname = p.GenreDisplayname;
                                        v.TargetDisplayname = p.TargetDisplayname;
                                        v.SourceDisplayname = p.SourceDisplayname;
                                    }
                                })
                            })
                            //
                            var levels = self.initScenarioLevels(scenarioData);
                            //拼装结构化工具level属性
                            $.each(levels, function (i, v) {
                                if (v.Elements && v.Elements.length > 0) {
                                    $.each(v.Elements, function (t, c) {
                                        //局部规则
                                        $.each(self.dataLocalRules, function (o, p) {
                                            if (c.Type == 'Rule' && c.Code == p.Code) {
                                                c.IsAllocationRuleOfSameLevel = p.IsAllocationRuleOfSameLevel;
                                                c.IsAmount = p.IsAmount;
                                                c.IsElementNames = p.IsElementNames;
                                                c.IsPercentage = p.IsPercentage;
                                                c.IsRepeat = p.IsRepeat;
                                                c.IsSource = p.IsSource;
                                                c.IsTarget = p.IsTarget;
                                                c.isSupplement = p.isSupplement;
                                                c.isRoudRule = p.isRoudRule;
                                                //新增两个元素 Genre TransferAmount TriggerCondition
                                                c.isGenre = p.isGenre;
                                                c.isTransferAmount = p.isTransferAmount;
                                                c.isTriggerCondition = p.isTriggerCondition;
                                                //修复结构化工具显示错的bug
                                                c.AmountDisplayname = p.AmountDisplayname;
                                                c.TriggerConditionDisplayname = p.TriggerConditionDisplayname;
                                                c.TransferAmountDisplayname = p.TransferAmountDisplayname;
                                                c.SupplementDisplayname = p.SupplementDisplayname;
                                                c.PercentageDisplayname = p.PercentageDisplayname;
                                                c.RoudRuleDisplayname = p.RoudRuleDisplayname;
                                                c.GenreDisplayname = p.GenreDisplayname;
                                                c.TargetDisplayname = p.TargetDisplayname;
                                                c.SourceDisplayname = p.SourceDisplayname;
                                                c.AllocationRuleOfSameLevelDisplayname = p.AllocationRuleOfSameLevelDisplayname;
                                            }
                                        })
                                    })
                                }
                            })
                            //
                            var scenarioSelectable = self.initScenarioSelectable(levels);
                            var hasAccounts = self.initScenarioHasAccounts(scenarioData);
                            self.paymentScenarioList.push(
                                {
                                    'PaymentSequence': scenarioData,
                                    'ScenarioId': scenarioId,
                                    'ScenarioName': scenarioName,
                                    'StartDateId': self.structureStartDate,
                                    'EndDateId': self.structureEndDate,
                                    'PrincipalPrecision': principalPrecision,
                                    'InterestPrecision': interestPrecision,
                                    'ExcludedDatesId': excludedDatesId,
                                    'IsChecked': isChecked, //是否选择期数
                                    'IsEditingScenarioName': false, //是否正在编辑偿付顺序名称
                                    'HasAccounts': hasAccounts, //已选账户
                                    'HasLocalRules': hasLocalRules, //已选局部规则
                                    'HasGlobalRules': hasGlobalRules, //已选全局规则
                                    'Levels': levels, //偿付情景grid数据
                                    'SelectableBondFees': scenarioSelectable, //可选元素 
                                    /* -- 验证填写值是否正确的属性 (b_:boolen)-- */
                                    'b_StartDateId': true,
                                    'b_EndDateId': true,
                                    'b_PrincipalPrecision': true,
                                    'b_InterestPrecision': true,
                                    /* -------------------------------------- */
                                    'tabView': 0,//选项卡(基础配置,配置账户,配置规则)
                                });
                        });
                        //加载第一个偿付情景结构化工具页面模式有且只有一个
                        var initialScenario = self.paymentScenarioList[0];
                        self.switchScenario(initialScenario);
                        self.isNodata()

                    }
                });
            },
            //显示全局或者局部规则
            changeRule:function($event){
                var self = this;
                var target = $event.currentTarget;
                var value = $(target).attr("value");
                $(target).addClass("active").siblings().removeClass("active");
                self.showThe = value;
            },
            //打开配置公式页面
            openNewIframe: function () {
                var self = this;
                var trustId = self.trustId;
                var pass = true;
                var page = location.protocol + "//" + location.host + '/GoldenStandABS/www/components/PaymentSequence/PayoffOrderFormula.html?tid=' + trustId;
                var tabName='偿付顺序组合公式';
                parent.parent.viewModel.tabs().forEach(function (v, i) {
                    if (v.id == trustId) {
                        pass = false;
                        parent.parent.viewModel.changeShowId(v);
                        return false;
                    }
                })
                if (pass) {
                    //parent.viewModel.showId(trustId);
                    var newTab = {
                        id: trustId,
                        url: page,
                        name: tabName,
                        disabledClose: false
                    };
                    parent.parent.viewModel.tabs.push(newTab);
                    parent.parent.viewModel.changeShowId(newTab);
               
                };
            },
            //标识当前在收入页还是在支出页面
            changeClick: function ($event) {
                var self = this;
                var target = $event.currentTarget;
                $(target).find("span").removeClass("changebox_area_span_current").addClass("changebox_area_span_current");
                $(target).siblings().find("span").removeClass("changebox_area_span_current");
                if (target.id == "outpoint") {
                    self.outin = true;
                } else {
                    self.outin = false;
                }
            },
            //获取偿付情景数据,然后加载第一个偿付情景
            getTrustPaymentSequence: function (model) {
                var self = this;
                self.paymentScenarioList = [];
                var executeParam = {
                    'SPName': "usp_GetTrustPaymentScenario", 'SQLParams': [
                        { 'Name': 'TrustId', 'Value': self.trustId, 'DBType': 'int' }
                    ]
                };
                self.getSourceData(executeParam, function (response) {
                    //self.isNodata = response.length == 0 ? true : false;
                    console.log(response);
                    if (response) {
                        self.loading = false;
                        $.each(response, function (i, v) {
                            var scenarioData = JSON.parse(v.PaymentSequence);
                            $.each(scenarioData.Levels, function (j, k) {
                                $.each(k.Elements, function (l, m) {
                                    m.CashFlowDirection = m.CashFlowDirection ? m.CashFlowDirection : "0"
                                })
                            })
                            var scenarioId = scenarioData.ScenarioId ? scenarioData.ScenarioId : '';
                            var scenarioName = scenarioData.ScenarioName ? scenarioData.ScenarioName : '';
                            var startDateId = scenarioData.StartDateId ? scenarioData.StartDateId : '';
                            var endDateId = scenarioData.EndDateId ? scenarioData.EndDateId : '';
                            var principalPrecision = scenarioData.PrincipalPrecision ? scenarioData.PrincipalPrecision : '';
                            var interestPrecision = scenarioData.InterestPrecision ? scenarioData.InterestPrecision : '';
                            var isChecked = self.initIsChecked(scenarioData);
                            var excludedDatesId = scenarioData.ExcludedDatesId;
                            var hasLocalRules = self.initScenarioHasLocalRules(scenarioData);
                            var hasGlobalRules;
                            v.RuleSequence ? hasGlobalRules = JSON.parse(v.RuleSequence).Rules : hasGlobalRules = []
                            var levels = self.initScenarioLevels(scenarioData);
                            var scenarioSelectable = self.initScenarioSelectable(levels);
                            var hasAccounts = self.initScenarioHasAccounts(scenarioData);
                            // 使用结构化工具中的方法，拼接模版规则
                            $.each(hasGlobalRules, function (i, v) {
                                $.each(self.dataGlobalRules, function (o, p) {
                                    if (v.Type == 'Rule' && v.Code == p.Code) {
                                        v.IsAllocationRuleOfSameLevel = p.IsAllocationRuleOfSameLevel;
                                        v.IsAmount = p.IsAmount;
                                        v.IsElementNames = p.IsElementNames;
                                        v.IsPercentage = p.IsPercentage;
                                        v.IsRepeat = p.IsRepeat;
                                        v.IsSource = p.IsSource;
                                        v.IsTarget = p.IsTarget;
                                        v.isSupplement = p.isSupplement;
                                        v.isRoudRule = p.isRoudRule;
                                        // 新增两个元素 Genre TransferAmount TriggerCondition
                                        v.isGenre = p.isGenre;
                                        v.isTransferAmount = p.isTransferAmount;
                                        v.isTriggerCondition = p.isTriggerCondition;
                                        // 修复结构化工具显示错的bug
                                        v.AmountDisplayname = p.AmountDisplayname;
                                        v.AllocationRuleOfSameLevelDisplayname = p.AllocationRuleOfSameLevelDisplayname;
                                        v.TriggerConditionDisplayname = p.TriggerConditionDisplayname;
                                        v.TransferAmountDisplayname = p.TransferAmountDisplayname;
                                        v.SupplementDisplayname = p.SupplementDisplayname;
                                        v.PercentageDisplayname = p.PercentageDisplayname;
                                        v.RoudRuleDisplayname = p.RoudRuleDisplayname;
                                        v.GenreDisplayname = p.GenreDisplayname;
                                        v.TargetDisplayname = p.TargetDisplayname;
                                        v.SourceDisplayname = p.SourceDisplayname;
                                    }
                                })
                            })
                            //
                            //拼装结构化工具level属性
                            $.each(levels, function (i, v) {
                                if (v.Elements && v.Elements.length > 0) {
                                    $.each(v.Elements, function (t, c) {
                                        //局部规则
                                        $.each(self.dataLocalRules, function (o, p) {
                                            if (c.Type == 'Rule' && c.Code == p.Code) {
                                                c.IsAllocationRuleOfSameLevel = p.IsAllocationRuleOfSameLevel;
                                                c.IsAmount = p.IsAmount;
                                                c.IsElementNames = p.IsElementNames;
                                                c.IsPercentage = p.IsPercentage;
                                                c.IsRepeat = p.IsRepeat;
                                                c.IsSource = p.IsSource;
                                                c.IsTarget = p.IsTarget;
                                                c.isSupplement = p.isSupplement;
                                                c.isRoudRule = p.isRoudRule;
                                                //新增两个元素 Genre TransferAmount TriggerCondition
                                                c.isGenre = p.isGenre;
                                                c.isTransferAmount = p.isTransferAmount;
                                                c.isTriggerCondition = p.isTriggerCondition;
                                                //修复结构化工具显示错的bug
                                                c.AmountDisplayname = p.AmountDisplayname;
                                                c.TriggerConditionDisplayname = p.TriggerConditionDisplayname;
                                                c.TransferAmountDisplayname = p.TransferAmountDisplayname;
                                                c.SupplementDisplayname = p.SupplementDisplayname;
                                                c.PercentageDisplayname = p.PercentageDisplayname;
                                                c.RoudRuleDisplayname = p.RoudRuleDisplayname;
                                                c.GenreDisplayname = p.GenreDisplayname;
                                                c.TargetDisplayname = p.TargetDisplayname;
                                                c.SourceDisplayname = p.SourceDisplayname;
                                                c.AllocationRuleOfSameLevelDisplayname = p.AllocationRuleOfSameLevelDisplayname;

                                            }
                                        })
                                    })
                                }
                            })
                            //
                            self.paymentScenarioList.push({
                                'PaymentSequence': scenarioData,
                                'ScenarioId': scenarioId,
                                'ScenarioName': scenarioName,
                                'StartDateId': startDateId,
                                'EndDateId': endDateId,
                                'PrincipalPrecision': principalPrecision,
                                'InterestPrecision': interestPrecision,
                                'ExcludedDatesId': excludedDatesId,
                                'IsChecked': isChecked, //是否选择期数
                                'IsEditingScenarioName': false, //是否正在编辑偿付顺序名称
                                'HasAccounts': hasAccounts, //已选账户
                                'HasLocalRules': hasLocalRules, //已选局部规则
                                'HasGlobalRules': hasGlobalRules, //已选全局规则
                                'Levels': levels, //偿付情景grid数据
                                'SelectableBondFees': scenarioSelectable, //可选元素 
                                /* -- 验证填写值是否正确的属性 (b_:boolen)-- */
                                'b_StartDateId': true,
                                'b_EndDateId': true,
                                'b_PrincipalPrecision': true,
                                'b_InterestPrecision': true,
                                /* -------------------------------------- */
                                'tabView': 0,//选项卡(基础配置,配置账户,配置规则)
                            });
                        });
                        //加载第一个偿付情景
                        if(model === 0) {
                            var initialScenario = self.paymentScenarioList[0];
                            self.switchScenario(initialScenario);
                        } else {
                            let index;
                            self.paymentScenarioList.forEach((element, i) => {
                                if(element.ScenarioId === self.c_Scenario.ScenarioId) {
                                    index = i;
                                }
                            });
                            self.c_Scenario = self.paymentScenarioList[index];
                            self.switchScenario(self.c_Scenario);
                        }
                    }
                });
            },
            //从xml获取账户和规则数据
            getRulesAndAccountsFromXmlFile: function (callback) {
                var self = this;
                 self.trustId="3627";//TODO YANGYINGYONG
                var executeParams = {
                    'SPName': "usp_GetModelPathByTrustId", 'SQLParams': [
                        { 'Name': 'TrustId', 'Value': self.trustId, 'DBType': 'int' }
                    ]
                };
                var serviceUrls = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
                var response = common.ExecuteGetData(false, serviceUrls, 'TrustManagement', executeParams);
                response = response[0].Column1
                //TODO YANGYINGYONG
//                var filePath = "E:\\TSSWCFServices\\TrustManagementService\\UITaskStudio\\Models\\" + response + "\\AccountRule.Xml";
                var filePath ="";
                var serviceUrl = GlobalVariable.DataProcessServiceUrl + "GetRulesAndAccountsFromXMLFile?FilePath=" + filePath;
                $.ajax({
                    url: serviceUrl,
                    type: "GET",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    crossDomain: true,
                    success: function (response) {
                    	if (typeof response == 'object') { response = JSON.stringify(response) }//当是object就转String字符串//TODO YANGYINGYONG
                        response = JSON.parse(response)
                        console.log(response);
                        var rules = response.Json.Rules;
                        var localRules = [], globalRules = []; //局部规则和全局规则
                        $.each(rules, function (i, v) {
                            if (v.Category == 'Local')
                                localRules.push(v);
                            else if (v.Category == 'Global')
                                globalRules.push(v);
                        });
                        self.dataLocalRules = localRules;
                        self.dataGlobalRules = globalRules;

                        var accounts = response.Json.Accounts[0].VirtualAccounts;
                        //accounts.subFees = [];

                        $.each(accounts, function (i, v) {
                            v["subFees"] = [];
                            //vm.$set(v, 'subFees', [])
                        });
                        self.dataAccounts = accounts;
                        if (callback && (typeof callback == 'function')) {
                            callback();
                        }
                    },
                    error: function (response) {
                        GSDialog.HintWindow("error:" + response);
                    }
                });
            },
            //获取产品期数(起始日期和终止日期)
            getTrustPeriod: function (callback) {
                var self = this;
                self.trustId="3627";//TODO YANGYINGYONG
                var executeParam = {
                    'SPName': "usp_GetTrustPeriod", 'SQLParams': [
                        { 'Name': 'TrustPeriodType', 'Value': 'PaymentDate_CF', 'DBType': 'string' },
                        { 'Name': 'TrustId', 'Value': self.trustId, 'DBType': 'int' }
                    ]
                };
                self.getSourceData(executeParam, callback);
            },
            //获取是否可覆盖状态
            getIsCover: function (callback) {
                var self = this;
                var executeParam = {
                    'SPName': "usp_GetIsCover", 'SQLParams': [
                        { 'Name': 'ScenarioId', 'Value': self.structureScenarioId, 'DBType': 'int' },
                        { 'Name': 'TrustId', 'Value': self.trustId, 'DBType': 'int' },
                        { 'Name': 'EnddateId', 'Value': self.structureEndDate, 'DBType': 'int' }
                    ]
                };
                self.getSourceData(executeParam, callback);
            },
            //初始化起始日期和终止日期下拉选项
            initStartAndEndPeriod: function (response) {
                var self = this;
                $.each(response, function (i, v) {
                    self.periodStartOptions.push({
                        'value': self.changeTimeStamp(new Date(eval(v.StartDate.replace("/Date(", "").replace(")/", ""))), 'int'),
                        'text': self.changeTimeStamp(new Date(eval(v.StartDate.replace("/Date(", "").replace(")/", ""))), 'string')
                    });
                    self.periodEndOptions.push({
                        'value': self.changeTimeStamp(new Date(eval(v.EndDate.replace("/Date(", "").replace(")/", ""))), 'int'),
                        'text': self.changeTimeStamp(new Date(eval(v.EndDate.replace("/Date(", "").replace(")/", ""))), 'string')
                    });
                });
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
            //获取费用债券元素数据源
            getDataOfBondFees: function (callback) {
                var self = this;
                if (!self.trustId || isNaN(self.trustId)) {
                    return;
                }
                var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
                var executeParam = {
                    'SPName': "usp_GetBondFeesByTrustId", 'SQLParams': [
                        { 'Name': 'TrustId', 'Value': self.trustId, 'DBType': 'int' }
                    ]
                };
                common.ExecuteGetData(false, serviceUrl, 'TrustManagement', executeParam, function (response) {
                    if (response) {
                        self.dataOfBondFees = response;
                        if (self.dataOfBondFees.length > 0) {
                            var dataTemp = JSON.parse(JSON.stringify(self.dataOfBondFees));
                            var fee = [], bondPrincipal = [], bondInterest = [];
                            $.each(dataTemp, function (i, v) {
                                if (v.Type == 'Fee') {
                                    fee.push({ 'Value': v.Name, 'Text': v.DisplayName });
                                } else if (v.Type == 'BondPrincipal') {
                                    bondPrincipal.push({ 'Value': v.Name, 'Text': v.DisplayName });
                                } else if (v.Type == 'BondInterest') {
                                    bondInterest.push({ 'Value': v.Name, 'Text': v.DisplayName });
                                }
                            });
                            self.bondFeesOptions = self.bondFeesOptions.concat(fee, bondPrincipal, bondInterest);
                        }
                    }
                });
                //拼接下一个选项的存储过程
                var executeParams = {
                    'SPName': "usp_GetTrustAccountByTrustId", 'SQLParams': [
                        { 'Name': 'TrustId', 'Value': self.trustId, 'DBType': 'int' }
                    ]
                };
                common.ExecuteGetData(false, serviceUrl, 'TrustManagement', executeParams, function (response) {
                    if (response.length > 0) {
                        var Account = [];
                        $.each(response, function (i, v) {
                            Account.push({ 'Value': v.TrustAccountName, 'Text': v.TrustAccountDisplayName })
                        })
                        self.bondFeesOptions = self.bondFeesOptions.concat(Account);
                    }
                });
                if (callback && (typeof callback == 'function')) {
                    callback();
                }
            },
            //切换偿付情景Tab,并刷新页面
            switchScenario: function (scenario) {
                var self = this;
                self.outin = true;
                $("#outpoint").trigger("click")
                if (self.paymentScenarioList.length > 0) {
                    //切换Tab后,获取当前偿付情景配置数据
                    self.c_Scenario = scenario;
                }
                self.loading = true;
                setTimeout(function () {
                    self.loading = false;
                    var arry = $(".tree_node_wrap").find(".list");
                    $.each(arry, function (i, v) {
                        if ($(v).children().length == 0) {
                            $(".tree_node_wrap").eq(i).addClass("noRuleData");
                            if ($(".tree_node_wrap").eq(i).find(".tree_foder").html()
                                .indexOf('<span>( 暂无规则 )</span>') == -1) {
                                $("<span >( 暂无规则 )</span>").appendTo($(".tree_node_wrap").eq(i).find(".tree_foder"))
                            }
                        } else {
                            $(".tree_node_wrap").eq(i).removeClass("noRuleData");
                        }
                    })
                }, 500)
                $.each(self.c_Scenario.HasAccounts, function (i, v) {
                    self.accountClassify(v);
                });
            },
            // 封装一个AJax请求方法
            getSourceData: function (executeParam, callback) {
                var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
                common.ExecuteGetData(false, serviceUrl, 'TrustManagement', executeParam, callback);
            },
            //（新增/取消/保存)偿付情景
            addScenarioName: function () {
                var self = this;
                self.IsAddingScenarioName = true;
                //新增时，编辑的偿付情景输入框隐藏
                $.each(self.paymentScenarioList, function (i, v) {
                    v.IsEditingScenarioName = false;
                });
                // anyDialog({
                //     title: "新增偿付情景",
                //     width: 900,
                //     height: 500,
                //     changeallow: true,
                //     html: $("#newPaymentScenario"),
                //     scrolling: false,
                //     onClose: function() {
                //         self.IsAddingScenarioName = false;
                //     }
                // })
                self.$nextTick(function () {
                    self.$refs['newTabInput'].focus();
                });
            },
            cancelAddScenarioName: function () {
                var self = this;
                self.addingScenarioName = "";
                self.IsAddingScenarioName = false;
            },
            saveAddScenarioName: function () {
                var self = this;

                if (self.addingScenarioName.trim() == '') {
                    GSDialog.HintWindow('新建偿付情景不能为空值！', function () {
                        self.$refs['newTabInput'].focus();
                    })
                    return;
                }
                var temp = self.paymentScenarioList.filter(function (v) {
                    return v.ScenarioName == self.addingScenarioName;
                });
                if (temp.length > 0) {
                    GSDialog.HintWindow("该偿付情景已经存在！", function () {
                        self.$refs['newTabInput'].focus();
                    });
                    return;
                }
                var newScenario = {
                    'PaymentSequence': {},
                    'ScenarioId': 0,
                    'ScenarioName': self.addingScenarioName,
                    'StartDateId': '',
                    'EndDateId': '',
                    'PrincipalPrecision': '',
                    'InterestPrecision': '',
                    'ExcludedDatesId': '',
                    'IsChecked': true, //是否选择期数
                    'IsEditingScenarioName': false, //是否正在编辑偿付顺序名称
                    'HasAccounts': [], //已选账户
                    'HasLocalRules': [], //已选局部规则
                    'HasGlobalRules': [], //已选全局规则
                    'Levels': self.initScenarioLevels({}), //偿付情景grid数据
                    'SelectableBondFees': self.initScenarioSelectable([]), //可选元素 
                    /* -- 验证填写值是否正确的属性 (b_:boolen)-- */
                    'b_StartDateId': true,
                    'b_EndDateId': true,
                    'b_PrincipalPrecision': true,
                    'b_InterestPrecision': true,
                    /* -------------------------------------- */
                    'tabView': 0,//选项卡(基础配置,配置账户,配置规则)
                };
                self.paymentScenarioList.push(newScenario);
                self.IsAddingScenarioName = false;
                self.addingScenarioName = "";
                self.switchScenario(newScenario);
            },
            //(编辑/取消/保存/删除)当前偿付情景
            editScenarioName: function (scenario) {
                var self = this;
                self.scenarioNameBeforeEdit = scenario.ScenarioName;//记录修改前的偿付情景名称
                //编辑时，其他偿付情景以及新增偿付情景的输入框隐藏
                self.IsAddingScenarioName = false;
                $.each(self.paymentScenarioList, function (i, v) {
                    v.IsEditingScenarioName = false;
                });
                scenario.IsEditingScenarioName = true;

                self.$nextTick(function () {
                    self.$refs[scenario.ScenarioName][0].focus();
                });
            },
            cancelEditScenarioName: function (scenario) {
                var self = this;
                scenario.ScenarioName = self.scenarioNameBeforeEdit;//还原的修改前偿付情景名称
                scenario.IsEditingScenarioName = false;
            },
            saveEditScenarioName: function (scenario) {
                scenario.IsEditingScenarioName = false; //双向绑定，保存只需要隐藏输入框
            },
            deleteScenario: function (scenario) {
                var self = this;
                GSDialog.HintWindowTF("确定删除偿付情景吗？", function () {
                    var index = $.inArray(scenario, self.paymentScenarioList);
                    var delScenario = _.find(self.paymentScenarioList, function (obj) {
                        if (obj.ScenarioName == scenario.ScenarioName) return obj;
                    });
                    self.paymentScenarioList.remove(delScenario)
                    if (delScenario) {
                        if (scenario.ScenarioId != 0) {
                            var executeParam = {
                                SPName: 'TrustManagement.usp_DeleteScenario', SQLParams: [
                                { Name: 'ScenarioId', value: scenario.ScenarioId, DBType: 'int' },
                                ]
                            };
                            self.ExecuteRemoteData(executeParam, function (postbackdata) {
                                self.deletedScenarios.push(delScenario[0]); //删除的偿付情景记录到内存中，便于以后可能要有恢复功能
                                GSDialog.HintWindow("删除偿付情景成功！");
                                if (self.paymentScenarioList.length > 0 && index > 0) {
                                    self.switchScenario(self.paymentScenarioList[index - 1]);
                                } else if (self.paymentScenarioList.length > 0 && index == 0) {
                                    self.switchScenario(self.paymentScenarioList[0]);
                                } else {
                                    self.c_Scenario = {}
                                    self.switchScenario(self.c_Scenario);
                                }
                            });
                        } else {
                            self.deletedScenarios.push(delScenario[0]); //删除的偿付情景记录到内存中，便于以后可能要有恢复功能
                            GSDialog.HintWindow("删除偿付情景成功！");
                            if (self.paymentScenarioList.length > 0 && index > 0) {
                                self.switchScenario(self.paymentScenarioList[index - 1]);
                            } else if (self.paymentScenarioList.length > 0 && index == 0) {
                                self.switchScenario(self.paymentScenarioList[0]);
                            } else {
                                self.c_Scenario = {};
                                self.switchScenario(self.c_Scenario);
                            }
                        }
                    }
                })
            },
            //isNodata:function(item){
            //    return item.length== 0 ? true : false
            //},
            //选择账户
            choseAccount: function (account) {
                if (this.isChosenAccount(account)) return;
                var self = this;
                if (account.Code == 'TrustPlanAccount_Reserve_AvailableAmt') {//储备金账户
                    self.c_Scenario.HasAccounts.unshift(account);
                } else if (account.Code == 'TrustPlanAccount_Interest_AvailableAmt' || account.Code == "TrustPlanAccount_Principal_AvailableAmt") {//本金和收入账户
                    //如果存在信托收款账户
                    if (_.find(self.c_Scenario.HasAccounts, { "Code": "TrustPlanAccount_Total_AvailableAmt" })) {
                        if (self.accountHasEle('TrustPlanAccount_Total_AvailableAmt')) {
                            GSDialog.HintWindow('表格中还有信托收款账户的元素，请先撤销账户，再进行选择！');
                            return;
                        }
                        //删除它并释放元素回到元素区域
                        var removeAccount = _.remove(self.c_Scenario.HasAccounts, function (obj) {
                            if (obj.Code == "TrustPlanAccount_Total_AvailableAmt") return obj;
                        });
                        self.c_Scenario.SelectableBondFees = _.concat(self.c_Scenario.SelectableBondFees, _.remove(removeAccount[0].subFees))
                    }
                    var Account = [];
                    Account = self.c_ScenarioNoAccounts.filter(function (obj) {
                        return (obj.Code == "TrustPlanAccount_Interest_AvailableAmt" || obj.Code == "TrustPlanAccount_Principal_AvailableAmt");
                    });
                    if (Account.length > 0) {
                        $.each(Account, function (i, v) {
                            self.c_Scenario.HasAccounts.unshift(v);
                            self.accountClassify(v);
                        });
                    }
                } else if (account.Code == "TrustPlanAccount_Total_AvailableAmt") {//信托收款账户
                    if (_.find(self.c_Scenario.HasAccounts, function (obj) { return obj.Code == "TrustPlanAccount_Interest_AvailableAmt" || obj.Code == "TrustPlanAccount_Principal_AvailableAmt" })) {
                        if (self.accountHasEle('TrustPlanAccount_Principal_AvailableAmt') || self.accountHasEle('TrustPlanAccount_Interest_AvailableAmt')) {
                            GSDialog.HintWindow('表格中还有本金分账户和收入分账户的元素，请先撤销账户，再进行选择！');
                            return;
                        }
                        var removeAccount = _.remove(self.c_Scenario.HasAccounts, function (obj) {
                            if (obj.Code == "TrustPlanAccount_Interest_AvailableAmt" || obj.Code == "TrustPlanAccount_Principal_AvailableAmt") return obj;
                        });
                        if (removeAccount && removeAccount.length > 0) {
                            $.each(removeAccount, function (i, v) {
                                self.c_Scenario.SelectableBondFees = _.concat(self.c_Scenario.SelectableBondFees, _.remove(v.subFees));
                            });
                        }
                    }
                    self.c_Scenario.HasAccounts.unshift(account);
                    self.accountClassify(account);
                }
            },
            //归类元素
            accountClassify: function (account) {
                var self = this;
                var arr = [];
                switch (account.Code) {
                    case "TrustPlanAccount_Interest_AvailableAmt":
                        arr = _.remove(self.c_Scenario.SelectableBondFees, function (obj) {
                            if (obj.Type == "Fee" || obj.Type == "BondInterest") return obj;
                        })
                        //防止vue 监测不到变化
                        if (self.c_Scenario.SelectableBondFees && self.c_Scenario.SelectableBondFees.length == 0) self.c_Scenario.SelectableBondFees = [];
                        break;
                    case "TrustPlanAccount_Principal_AvailableAmt":
                        arr = _.remove(self.c_Scenario.SelectableBondFees, function (obj) {
                            if (obj.Type == "BondPrincipal") return obj;
                        });
                        //防止vue 监测不到变化
                        if (self.c_Scenario.SelectableBondFees && self.c_Scenario.SelectableBondFees.length == 0) self.c_Scenario.SelectableBondFees = [];
                        break;
                    case "TrustPlanAccount_Reserve_AvailableAmt":
                        arr = [];
                        break;
                    case "TrustPlanAccount_Total_AvailableAmt":
                        arr = _.remove(self.c_Scenario.SelectableBondFees);
                        //防止vue 监测不到变化
                        self.c_Scenario.SelectableBondFees = [];
                        break;
                }
                _(arr).forEach(function (k) {
                    k.Source = account.Code;
                });
                account.subFees = _.concat(account.subFees, arr);
            },
            //撤销账户
            cancelAccount: function (account) {
                var self = this;
                var tipTemp = "表格中还有{0}的元素,确认撤回元素并撤销账户吗？"; //账户有使用元素时的提示
                var strTip = '确定撤销账户吗？'; //默认提示
                var arrRevert = []; //需要撤回元素的待撤销账户
                var arrAccounts = []; //待撤销的账户
                arrAccounts.push(account);
                var b_Account = self.accountHasEle(account.Code); //该账户是否有使用中的元素
                if (account.Code == "TrustPlanAccount_Principal_AvailableAmt") {
                    //本金分账户(也要检查收入分账户)
                    var interestAccount = self.c_Scenario.HasAccounts.filter(function (obj) {
                        return obj.Code == "TrustPlanAccount_Interest_AvailableAmt"
                    });
                    var b_Interest = false;
                    if (interestAccount.length > 0) {
                        arrAccounts.push(interestAccount[0]);
                        b_Interest = self.accountHasEle(interestAccount[0].Code);
                    }
                    if (b_Account && b_Interest) {
                        strTip = tipTemp.format(account.DisplayName + '和' + interestAccount[0].DisplayName);
                        arrRevert.push(account);
                        arrRevert.push(interestAccount[0]);
                    } else if (b_Account) {
                        strTip = tipTemp.format(account.DisplayName);
                        arrRevert.push(account);
                    } else if (b_Interest) {
                        strTip = tipTemp.format(interestAccount[0].DisplayName);
                        arrRevert.push(interestAccount[0]);
                    }
                } else if (account.Code == "TrustPlanAccount_Interest_AvailableAmt") {
                    //收入分账户(也要检查本金分账户)
                    var principalAccount = self.c_Scenario.HasAccounts.filter(function (obj) {
                        return obj.Code == "TrustPlanAccount_Principal_AvailableAmt"
                    });
                    var b_Principal = false;
                    if (principalAccount.length > 0) {
                        arrAccounts.push(principalAccount[0]);
                        b_Principal = self.accountHasEle(principalAccount[0].Code);
                    }
                    if (b_Account && b_Principal) {
                        strTip = tipTemp.format(account.DisplayName + '和' + principalAccount[0].DisplayName);
                        arrRevert.push(account);
                        arrRevert.push(principalAccount[0]);
                    } else if (b_Account) {
                        strTip = tipTemp.format(account.DisplayName);
                        arrRevert.push(account);
                    } else if (b_Principal) {
                        strTip = tipTemp.format(principalAccount[0].DisplayName);
                        arrRevert.push(principalAccount[0]);
                    }
                } else {
                    //其他账户
                    if (b_Account) {
                        strTip = tipTemp.format(account.DisplayName);
                        arrRevert.push(account);
                    }
                }
                GSDialog.HintWindowTF(strTip, function () {
                    if (arrRevert.length > 0) {
                        $.each(arrRevert, function (i, v) {
                            self.revertTableEle(v); //先撤回元素到账户subFees里
                            self.revertGlobalRule(v);//撤销全局规则
                        });
                    }
                    if (arrAccounts.length > 0) {
                        $.each(arrAccounts, function (i, v) {
                            self.c_Scenario.HasAccounts.remove(v);
                            self.revertGlobalRule(v);//撤销全局规则
                            self.c_Scenario.SelectableBondFees = _.concat(self.c_Scenario.SelectableBondFees, _.remove(v.subFees));
                        });
                    }
                    self.accountView = 0;
                })
                //if (confirm(strTip)) {

                //}

                ////判断该账户在表格中是否有选定的元素
                //if (self.accountHasEle(account)) {
                //    if (!confirm("表格中还有属于该账户的元素,确认撤回元素并撤销账户吗")) return;
                //} else {
                //    if (!confirm("确定撤销账户吗？")) return;
                //}
                ////本金分账户和收入分账户同时撤销
                //if (account.Code == "TrustPlanAccount_Interest_AvailableAmt" || account.Code == "TrustPlanAccount_Principal_AvailableAmt") {
                //    var interestAccount = self.c_Scenario.HasAccounts.filter(function (obj) {
                //        return obj.Code == "TrustPlanAccount_Interest_AvailableAmt"
                //    });
                //    var principalAccount = self.c_Scenario.HasAccounts.filter(function (obj) {
                //        return obj.Code == "TrustPlanAccount_Principal_AvailableAmt"
                //    });
                //    //判断该账户在表格中是否有选定的元素
                //    if (self.accountHasEle(interestAccount[0]) || self.accountHasEle(principalAccount[0])) {
                //        self.revertTableEle(interestAccount[0]);
                //        self.revertTableEle(principalAccount[0]);

                //    }
                //    if (interestAccount.length > 0) {
                //        self.c_Scenario.HasAccounts.remove(interestAccount[0]);
                //        self.c_Scenario.SelectableBondFees = _.concat(self.c_Scenario.SelectableBondFees, _.remove(interestAccount[0].subFees))
                //    }
                //    if (principalAccount.length > 0) {
                //        self.c_Scenario.HasAccounts.remove(principalAccount[0]);
                //        self.c_Scenario.SelectableBondFees = _.concat(self.c_Scenario.SelectableBondFees, _.remove(principalAccount[0].subFees))
                //    }
                //    self.accountView = 0;
                //    return;
                //}
                ////用lodash 的remove ,computed 监测不到
                //self.c_Scenario.HasAccounts.remove(account)
                //self.c_Scenario.SelectableBondFees = _.concat(self.c_Scenario.SelectableBondFees, _.remove(account.subFees))
                //self.accountView = 0;
            },
            /* 从PaymentSequence(scenarioData)的Json中解析初始的偿付情景数据 */
            initIsChecked: function (scenarioData) {//选择期数
                var self = this;
                return (scenarioData.StartDateId != '' && scenarioData.StartDateId != '') ? true : false;
            },
            initScenarioLevels: function (scenarioData) {//偿付情景grid数据源
                var self = this;
                var dataOfGrid = [];
                var bondFeesCount = self.dataOfBondFees.length;
                var localRulesCount = self.dataLocalRules.length;
                var count = bondFeesCount + localRulesCount;
                var i = 0;
                if (count > 0) {
                    while (i < count) {
                        dataOfGrid.push({
                            'Id': i + 1,
                            'Elements': []
                        });
                        i++;
                    }
                }
                if (scenarioData.Levels) {
                    if (scenarioData.Levels.length > 0) {
                        $.each(scenarioData.Levels, function (i, v) {
                            $.each(dataOfGrid, function (i2, v2) {
                                if (v.Id == v2.Id) {
                                    v2.Elements = v.Elements;
                                }
                            })
                        });
                    }
                }
                return dataOfGrid;
            },
            initScenarioSelectable: function (scenarioGrid) {//偿付情景可选费用债券元素
                var self = this;
                var arrGridNames = []; //grid已使用的费用债券元素
                var selectableBondFees = [];
                if (scenarioGrid.length > 0) {
                    $.each(scenarioGrid, function (i, v) {
                        if (v.Elements && v.Elements.length > 0) {
                            $.each(v.Elements, function (i2, v2) {
                                arrGridNames.push(v2.Name);
                            });
                        }
                    });
                }
                var bondFees = JSON.parse(JSON.stringify(self.dataOfBondFees));
                if (arrGridNames.length > 0) {
                    $.each(bondFees, function (i, v) {
                        if ($.inArray(v.Name, arrGridNames) < 0) {
                            selectableBondFees.push(v);
                        }
                    });
                } else {
                    selectableBondFees = bondFees;
                }
                return selectableBondFees;
            },
            initScenarioHasAccounts: function (scenarioData) { //当前偿付情景已选账户
                var self = this;
                var hasAccounts = [];
                var accountsCode = [];
                if (scenarioData.Accounts) {
                    if (scenarioData.Accounts.length > 0) {
                        $.each(scenarioData.Accounts, function (i, v) {
                            accountsCode.push(v.Code);
                        });
                    }
                }
                //if (scenarioData.Levels) {
                //    if (scenarioData.Levels.length > 0) {
                //        $.each(scenarioData.Levels, function (i, v) {
                //            if (v.Elements && v.Elements.length > 0) {
                //                $.each(v.Elements, function (i2, v2) {
                //                    if (v2.RuleType.indexOf('Rule') < 0) {
                //                        if ($.inArray(v2.Source, accountsCode) < 0) {
                //                            accountsCode.push(v2.Source);
                //                        }
                //                    }
                //                });
                //            }
                //        });
                //    }
                //}
                //本金和收入分账户同时存在
                if ($.inArray('TrustPlanAccount_Interest_AvailableAmt', accountsCode) > -1
                    && $.inArray('TrustPlanAccount_Principal_AvailableAmt', accountsCode) < 0) {
                    //存在收入分账户，不存在本金分账户时，加入本金分账户
                    accountsCode.push('TrustPlanAccount_Principal_AvailableAmt');
                }
                if ($.inArray('TrustPlanAccount_Principal_AvailableAmt', accountsCode) > -1
                    && $.inArray('TrustPlanAccount_Interest_AvailableAmt', accountsCode) < 0) {
                    //存在本金分账户，不存在收入分账户时，加入收入分账户
                    accountsCode.push('TrustPlanAccount_Interest_AvailableAmt');
                }
                if (accountsCode.length > 0) {
                    var accounts = JSON.parse(JSON.stringify(self.dataAccounts));
                    $.each(accounts, function (i, v) {
                        if ($.inArray(v.Code, accountsCode) > -1) {
                            hasAccounts.push(v);
                        }
                    });
                }
                return hasAccounts;
            },
            initScenarioHasLocalRules: function (scenarioData) {
                var self = this;
                var hasLocalRules = [];
                var rulesCode = [];
                if (scenarioData.Levels) {
                    if (scenarioData.Levels.length > 0) {
                        $.each(scenarioData.Levels, function (i, v) {
                            if (v.Elements && v.Elements.length > 0) {
                                $.each(v.Elements, function (i2, v2) {
                                    if (v2.RuleType.indexOf('Rule') < 0) {
                                        if ($.inArray(v2.Code, rulesCode) < 0) {
                                            rulesCode.push(v2.Code);
                                        }
                                    }
                                });
                            }
                        });
                    }
                }
                if (rulesCode.length > 0) {
                    var lRules = JSON.parse(JSON.stringify(self.dataLocalRules));
                    $.each(lRules, function (i, v) {
                        if ($.inArray(v.Code, rulesCode) > -1) {
                            hasLocalRules.push(v);
                        }
                    });
                }
                return hasLocalRules;
            },
            //
            saveStructureSquence: function () {
                var self = this;
                //验证账户
                if (self.c_Scenario.HasAccounts.length == 0) {
                    GSDialog.HintWindow('您还未选择账户');
                    return;
                }
                if (self.c_Scenario.HasAccounts.length == 1 && self.c_Scenario.HasAccounts[0].Code == 'TrustPlanAccount_Reserve_AvailableAmt') {
                    GSDialog.HintWindow('不能单独使用信托储备账户，请再选择账户');
                    return;
                }
                var islevels = 0;
                self.isSaving = true;
                self.$nextTick(function () {
                    var validateResult = [];
                    var result = [];
                    var boolValidate = true; //是否验证通过
                    var isCover = self.isCover ? 1 : 0//标识是否覆盖
                    result.push(JSON.parse(JSON.stringify(self.c_Scenario))); //保存的数据（深度拷贝，不会影响原数据）
                    validateResult.push(self.c_Scenario);//用于验证必填项的数据
                    if (validateResult.length > 0) {
                        $.each(validateResult, function (i, v) {
                            boolValidate = (boolValidate && self.validateSaveScenario(v));
                        });
                    }
                    if (boolValidate) {
                        if (result.length > 0) {
                            //
                            self.loading = true;
                            $.each(result, function (i, v) {
                                var arrLevels = [];
                                var levelsXML = '';
                                if (v.Levels && v.Levels.length > 0) {
                                    var columnNum = 1; //层级行号，剔除掉空层级
                                    $.each(v.Levels, function (i2, v2) {
                                        if (v2.Elements.length > 0) {
                                            //标记拥有level
                                            islevels = 1
                                            v2.Id = columnNum;
                                            arrLevels.push(v2);
                                            var strElement = '';
                                            $.each(v2.Elements, function (i3, v3) {
                                                result[i].Levels[i2].Elements[i3].CashFlowDirection = result[i].Levels[i2].Elements[i3].CashFlowDirection ? result[i].Levels[i2].Elements[i3].CashFlowDirection : "0"
                                                strElement = [strElement, self.elementTmpXml.format(
                                                                        v3.Name, v3.Code, v3.DisplayName, v3.ProcessorName,
                                                                        v3.Category ? v3.Category : "", v3.Type, v3.RuleType, v3.ClassType,
                                                                        v3.Amount, v3.Percentage, v3.AllocationRuleOfSameLevel,
                                                                        v3.Source, v3.Target, v3.ElementNames, v3.ElementRange, v3.SubClassAllocationSequence ? v3.SubClassAllocationSequence : '', v3.Supplement ? v3.Supplement.replace(/,/g, "") : '',
                                                                        v3.CashFlowDirection ? v3.CashFlowDirection : '0',
                                                                        v3.RoudRule ? v3.RoudRule : '0',
                                                                        //新增两个元素 Genre TransferAmount TriggerCondition
                                                                        v3.Genre ? v3.Genre : '',
                                                                        v3.TransferAmount ? v3.TransferAmount : '',
                                                                        v3.TriggerCondition ? v3.TriggerCondition : ''

                                                            )].join('');
                                            });
                                            levelsXML = [levelsXML, self.levelTmpXml.format(columnNum, strElement)].join('');
                                            columnNum++;
                                        }
                                    });
                                    levelsXML = '<Levels>{0}</Levels>'.format(levelsXML);
                                }
                                if (islevels == 0) {
                                    GSDialog.HintWindow('请设置债券费用元素！');
                                    self.loading = false;
                                    self.isSaving = false;
                                    return;
                                }
                                var rulesXML = '';
                                //新增两个元素 Genre NecessaryAmount
                                if (v.HasGlobalRules && v.HasGlobalRules.length > 0) {
                                    $.each(v.HasGlobalRules, function (i2, v2) {
                                        rulesXML = [rulesXML, self.ruleTmpXml.format(
                                                            v2.Name, v2.Code, v2.DisplayName, v2.ProcessorName,
                                                            v2.Category, v2.Type, v2.RuleType, v2.ClassType,
                                                            v2.Amount, v2.Percentage, v2.AllocationRuleOfSameLevel,
                                                            v2.Source, v2.Target,
                                            v2.RoudRule ? v2.RoudRule : '0',
                                            v2.Genre ? v2.Genre : '',
                                            v2.TransferAmount ? v2.TransferAmount : '',
                                            v2.TriggerCondition ? v2.TriggerCondition : '',
                                            v2.ElementNames, v2.ElementRange
                                                  )].join('');
                                    });
                                    rulesXML = '<Rules>{0}</Rules>'.format(rulesXML);
                                }
                                var strRuleSequence = '{\"Rules\":{0}}'.format(JSON.stringify(v.HasGlobalRules));
                                v.Levels = arrLevels; //去除没有元素的level
                                var arrAccounts = [];
                                var HasReserve = 0;//标识信托储备账户
                                var HasInterest = 0;//标识收入分账户
                                var HasPrincipal = 0;//标识本金分账户
                                var HasTotal = 0;//标识信托收款
                                if (v.HasAccounts && v.HasAccounts.length > 0) {
                                    $.each(v.HasAccounts, function (i2, v2) {
                                        if (v2.Code == 'TrustPlanAccount_Reserve_AvailableAmt') {
                                            HasReserve = 1;
                                        }
                                        if (v2.Code == 'TrustPlanAccount_Principal_AvailableAmt') {
                                            HasPrincipal = 1;
                                        }
                                        if (v2.Code == 'TrustPlanAccount_Interest_AvailableAmt') {
                                            HasInterest = 1;
                                        }
                                        if (v2.Code == 'TrustPlanAccount_Total_AvailableAmt') {
                                            HasTotal = 1;
                                        }
                                        arrAccounts.push({ 'Code': v2.Code });
                                    });
                                }
                                v.Accounts = arrAccounts; //新增Accounts属性
                                delete v.HasAccounts;
                                delete v.IsChecked;
                                delete v.IsEditingScenarioName;
                                delete v.SelectableBondFees;
                                delete v.PaymentSequence;
                                delete v.HasLocalRules;
                                delete v.HasGlobalRules;
                                delete v.b_StartDateId;
                                delete v.b_EndDateId;
                                delete v.b_PrincipalPrecision;
                                delete v.b_InterestPrecision;
                                delete v.tabView;
                                var scenarioXml = '';
                                scenarioXml = [scenarioXml, self.scenarioTmpXml.format(
                                                        v.StartDateId, v.EndDateId, v.ScenarioName,
                                                    v.InterestPrecision, v.PrincipalPrecision, v.ExcludedDatesId ? v.ExcludedDatesId : '',
                                                        JSON.stringify(v), '', '', '', strRuleSequence
                                        )].join('');
                                var reg = new RegExp("{[0-9]+}");
                                if (reg.test(scenarioXml) || reg.test(levelsXML) || reg.test(rulesXML)) {
                                    GSDialog.HintWindow('保存的数据有误，请检查！');
                                    self.loading = false;
                                    self.isSaving = false;
                                    return;
                                }
                                var addScenarioId = 0;
                                var executeParam = {
                                    SPName: 'TrustManagement.usp_SaveScenarioStructure', SQLParams: [////usp_StructureSaveScenario
                                    {
                                        Name: 'TrustId', value: self.trustId, DBType: 'int'
                                    },
                                    {
                                        Name: 'ScenarioId', value: v.ScenarioId, DBType: 'int'
                                    },
                                    {
                                        Name: 'ScenarioXML', value: scenarioXml.replace(/\+/gm,"P_L_U_S").replace(/\#<#/gm,"#L_E_S_S#"), DBType: 'xml'
                                    },
                                    {
                                        Name: 'LevelsXML', value: levelsXML.replace(/\+/gm,"P_L_U_S").replace(/\#<#/gm,"#L_E_S_S#"), DBType: 'xml'
                                    },
                                    {
                                        Name: 'Startdate', Value: self.structureStartDate, DBType: 'int'
                                    },
                                    {
                                        Name: 'Enddate', Value: self.structureEndDate, DBType: 'int'
                                    },
                                    {
                                        Name: 'RulesXML', value: rulesXML.replace(/\+/gm,"P_L_U_S").replace(/\#<#/gm,"#L_E_S_S#"), DBType: 'xml'
                                    },
                                    {
                                        Name: 'HasReserve', value: HasReserve, DBType: 'int'
                                    },
                                    {
                                        Name: 'HasPrincipal', value: HasPrincipal, DBType: 'int'
                                    },
                                    {
                                        Name: 'HasInterest', value: HasInterest, DBType: 'int'
                                    },
                                    {
                                        Name: 'HasTotal', value: HasTotal, DBType: 'int'
                                    },
                                    {
                                        Name: 'isCover', value: isCover, DBType: 'int'
                                    }
                                    ]
                                };
                                self.$nextTick(function () {
                                    self.ExecuteRemoteData(executeParam, function (response) {
                                        if (response) {
                                            var description = "专项计划：" + self.trustId + "，在产品维护向导功能下，在结构化工具中对偿付顺序进行了更新操作"
                                            var category = "产品管理";
                                            ActLogs.insertActlogs(false, userName, '更新', category, description, ip, '', '');

                                            setTimeout(function () {
                                                self.loading = false;
                                                self.isSaving = false;
                                                common.alertMsg('保存成功', 1);
                                            }, 100);

                                        } else {
                                            self.loading = false;
                                            self.isSaving = false;
                                            common.alertMsg('保存失败', 0);
                                        }
                                    });
                                });
                            })
                            //
                        } else {
                            GSDialog.HintWindow('未找到偿付顺序！');
                            self.isSaving = false;
                            return;
                        }
                        //
                    } else {
                        self.c_Scenario.tabView = 0;
                        GSDialog.HintWindow('基本配置信息未填完整或有误，请检查！');
                        self.isSaving = false;
                        return;
                    }
                })
            },
            /* ---------------------------------------------------------- */

            /* -----------------    保存偿付顺序    ---------------------- */
            //按xml模板保存
            savePaymentSquence: function (model) {
                var self = this;
                //验证账户
                if (self.c_Scenario.HasAccounts.length == 0) {
                    GSDialog.HintWindow('您还未选择账户');
                    return;
                }
                if (self.c_Scenario.HasAccounts.length == 1 && self.c_Scenario.HasAccounts[0].Code == 'TrustPlanAccount_Reserve_AvailableAmt') {
                    GSDialog.HintWindow('不能单独使用信托储备账户，请再选择账户');
                    return;
                }
                self.loading = true;
                self.isSaving = true;
                self.$nextTick(function () {
                    var validateResult = [];
                    var result = [];
                    var boolValidate = true; //是否验证通过
                    var islevels = 0;
                    if (model == 1) {
                        result.push(JSON.parse(JSON.stringify(self.c_Scenario))); //保存的数据（深度拷贝，不会影响原数据）
                        validateResult.push(self.c_Scenario);//用于验证必填项的数据
                    } else if (model == 2) { //预留全部偿付情景一起保存的功能
                        result = JSON.parse(JSON.stringify(self.paymentScenarioList)); //保存的数据（深度拷贝，不会影响原数据）
                        validateResult = self.paymentScenarioList;//用于验证必填项的数据
                    }
                    if (validateResult.length > 0) {
                        $.each(validateResult, function (i, v) {
                            boolValidate = (boolValidate && self.validateSaveScenario(v));
                        });
                    }
                    if (boolValidate) {
                        if (result.length > 0) {
                            $.each(result, function (i, v) {
                                var arrLevels = [];
                                var levelsXML = '';
                                if (v.Levels && v.Levels.length > 0) {
                                    var columnNum = 1; //层级行号，剔除掉空层级
                                    $.each(v.Levels, function (i2, v2) {
                                        if (v2.Elements.length > 0) {
                                            //标记拥有level
                                            islevels = 1
                                            v2.Id = columnNum;
                                            arrLevels.push(v2);
                                            var strElement = '';
                                            //新增两个元素 Genre NecessaryAmount
                                            $.each(v2.Elements, function (i3, v3) {
                                                result[i].Levels[i2].Elements[i3].CashFlowDirection = result[i].Levels[i2].Elements[i3].CashFlowDirection ? result[i].Levels[i2].Elements[i3].CashFlowDirection : "0"
                                                strElement = [strElement, self.elementTmpXml.format(
                                                                        v3.Name, v3.Code, v3.DisplayName, v3.ProcessorName,
                                                                        v3.Category, v3.Type, v3.RuleType, v3.ClassType,
                                                                        v3.Amount, v3.Percentage, v3.AllocationRuleOfSameLevel,
                                                                        v3.Source, v3.Target, v3.ElementNames, v3.ElementRange, v3.SubClassAllocationSequence ? v3.SubClassAllocationSequence : '', v3.Supplement ? v3.Supplement.replace(/,/g, "") : '',
                                                                        v3.CashFlowDirection ? v3.CashFlowDirection : '0',
                                                                        v3.RoudRule ? v3.RoudRule : '0',
                                                                        v3.Genre ? v3.Genre : '',
                                                                        v3.TransferAmount ? v3.TransferAmount : '',
                                                                        v3.TriggerCondition ? v3.TriggerCondition : ''

                                                            )].join('');
                                            });
                                            levelsXML = [levelsXML, self.levelTmpXml.format(columnNum, strElement)].join('');
                                            columnNum++;
                                        }
                                    });
                                    levelsXML = '<Levels>{0}</Levels>'.format(levelsXML);
                                }
                                if (islevels == 0) {
                                    GSDialog.HintWindow('请设置债券费用元素！');
                                    self.loading = false;
                                    self.isSaving = false;
                                    return;
                                }
                                var rulesXML = '';
                                //新增两个元素 Genre NecessaryAmount
                                if (v.HasGlobalRules && v.HasGlobalRules.length > 0) {
                                    $.each(v.HasGlobalRules, function (i2, v2) {
                                        rulesXML = [rulesXML, self.ruleTmpXml.format(
                                                            v2.Name, v2.Code, v2.DisplayName, v2.ProcessorName,
                                                            v2.Category, v2.Type, v2.RuleType, v2.ClassType,
                                                            v2.Amount, v2.Percentage, v2.AllocationRuleOfSameLevel,
                                                            v2.Source, v2.Target,
                                            v2.RoudRule ? v2.RoudRule : '0',
                                            v2.Genre ? v2.Genre : '',
                                            v2.TransferAmount ? v2.TransferAmount : '',
                                            v2.TriggerCondition ? v2.TriggerCondition : '',
                                            v2.ElementNames, v2.ElementRange
                                                  )].join('');
                                    });
                                    rulesXML = '<Rules>{0}</Rules>'.format(rulesXML);
                                }
                                var strRuleSequence = '{\"Rules\":{0}}'.format(JSON.stringify(v.HasGlobalRules));
                                v.Levels = arrLevels; //去除没有元素的level
                                var arrAccounts = [];
                                var HasReserve = 0;//标识信托储备账户
                                var HasInterest = 0;//标识收入分账户
                                var HasPrincipal = 0;//标识本金分账户
                                var HasTotal = 0;//标识信托收款
                                if (v.HasAccounts && v.HasAccounts.length > 0) {
                                    $.each(v.HasAccounts, function (i2, v2) {
                                        if (v2.Code == 'TrustPlanAccount_Reserve_AvailableAmt') {
                                            HasReserve = 1;
                                        }
                                        if (v2.Code == 'TrustPlanAccount_Principal_AvailableAmt') {
                                            HasPrincipal = 1;
                                        }
                                        if (v2.Code == 'TrustPlanAccount_Interest_AvailableAmt') {
                                            HasInterest = 1;
                                        }
                                        if (v2.Code == 'TrustPlanAccount_Total_AvailableAmt') {
                                            HasTotal = 1;
                                        }
                                        arrAccounts.push({ 'Code': v2.Code });
                                    });
                                }
                                v.Accounts = arrAccounts; //新增Accounts属性
                                delete v.HasAccounts;
                                delete v.IsChecked;
                                delete v.IsEditingScenarioName;
                                delete v.SelectableBondFees;
                                delete v.PaymentSequence;
                                delete v.HasLocalRules;
                                delete v.HasGlobalRules;
                                delete v.b_StartDateId;
                                delete v.b_EndDateId;
                                delete v.b_PrincipalPrecision;
                                delete v.b_InterestPrecision;
                                delete v.tabView;
                                var scenarioXml = '';
                                scenarioXml = [scenarioXml, self.scenarioTmpXml.format(
                                                        v.StartDateId, v.EndDateId, v.ScenarioName,
                                                        v.InterestPrecision, v.PrincipalPrecision, v.ExcludedDatesId,
                                                        JSON.stringify(v), '', '', '', strRuleSequence
                                        )].join('');
                                var reg = new RegExp("{[0-9]+}");
                                if (reg.test(scenarioXml) || reg.test(levelsXML) || reg.test(rulesXML)) {
                                    GSDialog.HintWindow('保存的数据有误，请检查！');
                                    self.loading = false;
                                    self.isSaving = false;
                                    return;
                                }
                                var addScenarioId = 0;
                                var executeParam = {
                                    SPName: 'TrustManagement.usp_SaveScenario', SQLParams: [
                                    {
                                        Name: 'TrustId', value: self.trustId, DBType: 'int'
                                    },
                                    {
                                        Name: 'ScenarioId', value: v.ScenarioId, DBType: 'int'
                                    },
                                    {
                                        Name: 'ScenarioXML', value: scenarioXml.replace(/\+/gm,"P_L_U_S").replace(/\#<#/gm,"#L_E_S_S#"), DBType: 'xml'
                                    },
                                    {
                                        Name: 'LevelsXML', value: levelsXML.replace(/\+/gm,"P_L_U_S").replace(/\#<#/gm,"#L_E_S_S#"), DBType: 'xml'
                                    },
                                    {
                                        Name: 'RulesXML', value: rulesXML.replace(/\+/gm,"P_L_U_S").replace(/\#<#/gm,"#L_E_S_S#"), DBType: 'xml'
                                    },
                                    {
                                        Name: 'HasReserve', value: HasReserve, DBType: 'int'
                                    },
                                    {
                                        Name: 'HasPrincipal', value: HasPrincipal, DBType: 'int'
                                    },
                                    {
                                        Name: 'HasInterest', value: HasInterest, DBType: 'int'
                                    },
                                    {
                                        Name: 'HasTotal', value: HasTotal, DBType: 'int'
                                    },
                                    {
                                        Name: 'AddScenarioId', Value: addScenarioId, DBType: 'int', IsOutput: true
                                    }
                                    ]
                                };
                                self.$nextTick(function () {
                                    self.ExecuteRemoteData(executeParam, function (response) {
                                        if (response) {
                                            if (self.c_Scenario.ScenarioId == 0) {
                                                //新增的偿付情景保存时
                                                if (response.AddScenarioId && !isNaN(response.AddScenarioId)) {
                                                    //返回后台自增的ScenarioId,更新当前偿付情景的ScenarioId
                                                    self.c_Scenario.ScenarioId = parseInt(response.AddScenarioId);
                                                }
                                            }
                                            var description = "专项计划：" + self.trustId + "，在产品维护向导功能下，对偿付顺序进行了更新操作"
                                            var category = "产品管理";
                                            ActLogs.insertActlogs(false, userName, '更新', category, description, ip, '', '');
                                            setTimeout(function () {
                                                self.loading = false;
                                                self.isSaving = false;
                                                setTimeout(function () {
                                                    common.alertMsg('保存成功', 1);
                                                }, 300)
                                                self.getTrustPaymentSequence(1);
                                            }, 500);
                                        } else {
                                            self.loading = false;
                                            self.isSaving = false;
                                            common.alertMsg('保存失败', 0);
                                        }
                                    });
                                });
                            });
                        } else {
                            GSDialog.HintWindow('请先添加偿付顺序！');
                            self.isSaving = false;
                            return;
                        }
                    } else {
                        self.c_Scenario.tabView = 0;
                        GSDialog.HintWindow('基本配置信息未填完整或有误，请检查！');
                        self.loading = false;
                        self.isSaving = false;
                        return;
                    }
                });
            },
            /* ---------------------------------------------------------- */
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
            //ExecuteRemoteData: function (executeParam, callback) {
            //    var executeParams = JSON.stringify(executeParam);

            //    var params = '';
            //    params += '<root appDomain="TrustManagement" postType="">';// appDomain="TrustManagement"
            //    params += executeParams;
            //    params += '</root>';

            //    var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonPostExecute";

            //    $.ajax({
            //        type: "POST",
            //        url: serviceUrl,
            //        dataType: "json",
            //        contentType: "application/xml;charset=utf-8",
            //        data: params,
            //        processData: false,
            //        success: function (response) {
            //            if (callback)
            //                callback(response);
            //        },
            //        error: function (response) {  GSDialog.HintWindow("error is :" + response); }
            //    });

            //},
            //动态渲染千分位
            Tbadd: function (p, $event) {
                var self = this;
                p = p.replace(/,/g, "");
                if (parseFloat(p) == p) {
                    var res = p.toString().replace(/\d+/, function (n) { // 先提取整数部分
                        return n.replace(/(\d)(?=(\d{3})+$)/g, function ($1) {
                            return $1 + ",";
                        });
                    })
                    self.objBeforeEdit.Amount = res
                }
                else
                    self.objBeforeEdit.Amount = ""
            },
            Tbadds: function (p, $event) {
                var self = this;
                p = p.replace(/,/g, "");
                if (parseFloat(p) == p) {
                    var res = p.toString().replace(/\d+/, function (n) { // 先提取整数部分
                        return n.replace(/(\d)(?=(\d{3})+$)/g, function ($1) {
                            return $1 + ",";
                        });
                    })
                    self.objBeforeEdit.Supplement = res
                }
                else
                    self.objBeforeEdit.Supplement = ""
            },
            TestNumber: function () {
                var self = this;
                if (parseFloat(self.objBeforeEdit.Percentage) < 0) {
                    self.objBeforeEdit.Percentage = ""
                }
                if (parseFloat(self.objBeforeEdit.Percentage) > 1) {
                    self.objBeforeEdit.Percentage = ""
                }
                if (isNaN(self.objBeforeEdit.Percentage)) {
                    self.objBeforeEdit.Percentage = ""
                }
            },
            //分配值(优先)动态渲染千分位
            TheAdd: function (p, index) {
                var index = index;
                var self = this;
                p = p.replace(/,/g, "");
                if (parseFloat(p) == p) {
                    var res = p.toString().replace(/\d+/, function (n) { // 先提取整数部分
                        return n.replace(/(\d)(?=(\d{3})+$)/g, function ($1) {
                            return $1 + ",";
                        });
                    })
                    self.objBeforeEdit.SubClassAllocationSequence[index].AvailableVal = res;
                }
                else
                    self.objBeforeEdit.SubClassAllocationSequence[index].AvailableVal = "";
            },
            Theddb: function (p, index) {
                var index = index;
                var self = this;
                p = p.replace(/,/g, "");
                if (parseFloat(p) == p) {
                    var res = p.toString().replace(/\d+/, function (n) { // 先提取整数部分
                        return n.replace(/(\d)(?=(\d{3})+$)/g, function ($1) {
                            return $1 + ",";
                        });
                    })
                    self.objBeforeEdit.SubClassAllocationSequence[index].LevelThreshHold = res;
                }
                else
                    self.objBeforeEdit.SubClassAllocationSequence[index].LevelThreshHold = "";
            },
            //判断对象取值,初始化
            numbertest: function (val, $event) {
                var self = this;
                var target = $event.target;
                var tex = new RegExp("[^.(0-9)]")
                if (tex.test($(target).val())) {
                    //$(target).val("")
                    self.objBeforeEdit.SubClassAllocationSequence[0].AvailablePercent = "";
                }
                if (parseFloat($(target).val()) > 1 || parseFloat($(target).val()) < 0) {
                    //$(target).val("")
                    self.objBeforeEdit.SubClassAllocationSequence[0].AvailablePercent = "";
                }
            },
            numbertests: function ($event, index) {
                var self = this;
                var target = $event.target;
                var tex = new RegExp("[^.(0-9)]")
                if (tex.test($(target).val())) {
                    self.objBeforeEdit.SubClassAllocationSequence[0].Distributions[index].val = "";
                }
                if (parseFloat($(target).val()) > 1 || parseFloat($(target).val()) < 0) {
                    self.objBeforeEdit.SubClassAllocationSequence[0].Distributions[index].val = "";
                }

            },
            //编辑对象
            editObj: function (obj, levelId, e) {
                var self = this;
                var error;
                self.c_Obj = obj;
                self.c_ObjAllocationRuleOptions = self.getAllocationRuleOptions(obj, (levelId ? levelId : 0));
                self.c_ObjRoudRuleOptions = JSON.parse(JSON.stringify(self.RoudRuleOptions));
                //新增两个元素 Genre TransferAmount TriggerCondition
                self.c_ObjGenreOptions = JSON.parse(JSON.stringify(self.GenreOptions));
                var executeParam = {
                    'SPName': "TrustManagement.GetTrustFormularByTrustId", 'SQLParams': [
                        { 'Name': 'trustId', 'Value': self.trustId, 'DBType': 'int' }
                    ]
                };
                var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
                common.ExecuteGetData(false, serviceUrl, 'TrustManagement', executeParam, function (data) {
                    self.c_ObjTriggerConditionOptions = JSON.parse(JSON.stringify(data));
                    data.unshift({ 'FormulaValue': '', 'FormulaName': '--请选择--' })
                    self.TransferAmountOptions = JSON.parse(JSON.stringify(data));
                });
                self.c_ObjTransferAmountOptions = JSON.parse(JSON.stringify(self.TransferAmountOptions));
                self.get_c_ScenarioEles(obj);
                self.c_ObjHasEles = self.getEleNamesArr(self.c_Obj);
                //分割触发条件
                self.c_ObjTriggerConditionOptionsEX = self.getTriggerCondition(self.c_Obj);
                if (self.c_Obj.Amount != "") {
                    self.c_Obj.Amount = common.numFormt(self.c_Obj.Amount);
                }
                if ($("#nex").hasClass("theInputBorderRed")) {
                    $("#nex").removeClass("theInputBorderRed");
                }
                if (self.c_Obj.SubClassAllocationSequence && self.c_Obj.SubClassAllocationSequence != "''") {
                    self.objBeforeEdit.SubClassAllocationSequence = JSON.parse(self.c_Obj.SubClassAllocationSequence);
                }
                self.objBeforeEdit.Amount = self.c_Obj.Amount;
                self.objBeforeEdit.Percentage = self.c_Obj.Percentage;
                self.objBeforeEdit.AllocationRuleOfSameLevel = self.c_Obj.AllocationRuleOfSameLevel == '' ? 'ABasedOnDue' : self.c_Obj.AllocationRuleOfSameLevel;
                self.objBeforeEdit.Source = self.c_Obj.Source;
                self.objBeforeEdit.Target = self.c_Obj.Target;
                self.objBeforeEdit.Supplement = self.c_Obj.Supplement;
                self.objBeforeEdit.RoudRule = self.c_Obj.RoudRule;
                //新增两个元素 Genre TransferAmount TriggerCondition
                self.objBeforeEdit.Genre = self.c_Obj.Genre;
                self.objBeforeEdit.TransferAmount = self.c_Obj.TransferAmount;
                self.objBeforeEdit.TriggerCondition = self.c_Obj.TriggerCondition;

                self.IncomeEle = self.c_ScenarioEles;
                //若收益率模式已设置，则显示状态
                if (self.c_Obj.Name == "Rule_SubClass_IncomeAllocation" && self.c_Obj.ProcessorName == "Rule_SubClass_IncomeAllocation_Percentage_RuleProcessor") {
                    self.isIncomeAllocationP = 1;
                }
                //
                if (self.c_Obj.SubClassAllocationSequence && self.c_Obj.SubClassAllocationSequence != "''") {
                    var tempvar = self.c_Obj.SubClassAllocationSequence
                    if (tempvar.indexOf(';') > -1) {
                        tempvar = tempvar.replace(new RegExp(";", "gm"), ",")
                        tempvar = tempvar.replace(new RegExp("'", "gm"), "\"")
                    }
                    $.each(self.objBeforeEdit.SubClassAllocationSequence, function (i, v) {
                        v.AvailableVal = common.numFormt(v.AvailableVal);
                        v.LevelThreshHold = common.numFormt(v.LevelThreshHold)
                    })
                    //self.objBeforeEdit.SubClassAllocationSequence = JSON.parse(tempvar);
                } else {
                    self.objBeforeEdit.SubClassAllocationSequence = '';
                }
                anyDialog({
                    title: "编辑元素",
                    width: 900,
                    height: 'auto',
                    changeallow: true,
                    html: $("#dialogEditRule"),
                    scrolling: false
                })
                $("#dialogEditRule").off();
                $("#dialogEditRule").on('click', "#saveObjEditBtn", function () {
                    if (parseFloat(self.objBeforeEdit.Percentage) > 1 || parseFloat(self.objBeforeEdit.Percentage) < 0) {
                        $("#nex").addClass("theInputBorderRed");
                        return false;
                    } else {
                        $("#nex").removeClass("theInputBorderRed");
                    }
                    if (self.objBeforeEdit.Amount != "") {
                        self.objBeforeEdit.Amount = self.objBeforeEdit.Amount.replace(/,/g, "");
                    }
                    self.c_Obj.Amount = self.objBeforeEdit.Amount;
                    self.c_Obj.Percentage = self.objBeforeEdit.Percentage;
                    self.c_Obj.AllocationRuleOfSameLevel = self.objBeforeEdit.AllocationRuleOfSameLevel;
                    self.c_Obj.Source = self.objBeforeEdit.Source;
                    self.c_Obj.Target = self.objBeforeEdit.Target;
                    self.c_Obj.Supplement = self.objBeforeEdit.Supplement;
                    self.c_Obj.RoudRule = self.objBeforeEdit.RoudRule;
                    //新增两个元素 Genre TransferAmount
                    self.c_Obj.Genre = self.objBeforeEdit.Genre;
                    self.c_Obj.TransferAmount = self.objBeforeEdit.TransferAmount;
                    self.c_Obj.TriggerCondition = self.objBeforeEdit.TriggerCondition;
                    //顺序处理
                    var type
                    $.each(self.objBeforeEdit.SubClassAllocationSequence, function (i, n) {
                        var perc = n.AvailablePercent;
                        var avail = n.AvailableVal ? n.AvailableVal.replace(/,/g, "") : 0;
                        var LevelT = n.LevelThreshHold ? n.LevelThreshHold.replace(/,/g, "") : 0;
                        if (!perc) { perc = 0 };
                        if (perc > 1 || perc < 0) {
                            type = "1"
                            return false;
                        };
                        if (LevelT > 1 && self.isIncomeAllocationP == 1 && self.c_Obj.Name == "Rule_SubClass_IncomeAllocation") {
                            type = "2";
                            return false;
                        };
                        //
                        n.sequenceno = i + 1
                        //
                        var tempamt = 0
                        var ary = []
                        var off;
                        $.each(n.Distributions, function (c, d) {
                            if (d.tar != "") {
                                ary.push(d.tar);
                            }
                            if (!d.val) { d.val = 0 };
                            if (d.val > 1 || d.val < 0) {
                                type = "3";
                                return false;
                            };

                            tempamt += parseFloat(d.val);
                            d.sequenceno = c + 1
                        })
                        if (tempamt > 1) {
                            type = "4";
                            return false;
                        }
                        function isRepeat(arr) {
                            var hash = {};
                            for (var i in arr) {
                                if (hash[arr[i]])
                                    return true;
                                hash[arr[i]] = true;
                            }
                            return false;
                        }
                        if (isRepeat(ary)) {
                            type = "5";
                            return false;
                        }
                    })
                    switch (type) {
                        case "1":
                            GSDialog.HintWindow('分配比例输入有误输入有误！', "", false);
                            return false
                            break;
                        case "2":
                            GSDialog.HintWindow('收益率模式下阈值代表百分比且不能大于1！', "", false);
                            return false
                            break;
                        case "3":
                            GSDialog.HintWindow('分配明细费用输入有误！', "", false);
                            return false
                            break;
                        case "4":
                            GSDialog.HintWindow("分配明细费用比例之和不能大于1！", "", false);
                            return false
                            break;
                        case "5":
                            GSDialog.HintWindow("分配对象不能重复", "", false);
                            return false
                            break;
                    }
                    //处理高收益规则收益率相关数据变动
                    $.each(self.objBeforeEdit.SubClassAllocationSequence, function (i, n) {
                        n.AvailableVal = n.AvailableVal ? n.AvailableVal.replace(/,/g, "") : 0;
                        n.LevelThreshHold = n.LevelThreshHold ? n.LevelThreshHold.replace(/,/g, "") : 0;
                    })
                    if (self.isIncomeAllocationP == 0 && self.c_Obj.Name == "Rule_SubClass_IncomeAllocation") {
                        self.c_Obj.ProcessorName = "Rule_SubClass_IncomeAllocation_RuleProcessor";
                    }
                    if (self.isIncomeAllocationP == 1 && self.c_Obj.Name == "Rule_SubClass_IncomeAllocation") {
                        self.c_Obj.ProcessorName = "Rule_SubClass_IncomeAllocation_Percentage_RuleProcessor";
                    }
                    self.c_Obj.SubClassAllocationSequence = JSON.stringify(self.objBeforeEdit.SubClassAllocationSequence);
                    var arrElementNames = [];
                    var Tridition=[]
                    $.each(self.c_ObjHasEles, function (i, v) {
                        arrElementNames.push(v.Name);
                    });
                    self.c_Obj.ElementNames = arrElementNames.join(',');

                    $.each(self.c_ObjTriggerConditionOptionsEX, function (i, v) {
                        Tridition.push(v.FormulaValue);
                    });

                    self.c_Obj.TriggerCondition = Tridition.join(';');
                    $('#modal-close').click()
                })
            },
            getEditLabelName: function (obj, labelType) {
                var self = this;
                if (obj && self.dataLocalRules) {
                    var objFormRules = _.find(self.dataLocalRules, function (v) {
                        return v.Code == obj.Code
                    })
                    var name = "";
                    switch (labelType) {
                        case 'amount':
                            name = !obj.AmountDisplayname ? "可支付上限" : obj.AmountDisplayname
                            break;
                        case 'percentage':
                            name = !obj.PercentageDisplayname ? "可用资金占比" : obj.PercentageDisplayname
                            break;
                        case 'SameLevel':
                            name = !obj.AllROSDisplayname ? "同级分配" : obj.AllROSDisplayname
                            break;
                        case 'source':
                            name = !obj.SourceDisplayname ? "来源" : obj.SourceDisplayname
                            break;
                        case 'target':
                            name = !obj.TargetDisplayname ? "目标" : obj.TargetDisplayname
                            break;
                        case 'supplement':
                            name = !obj.SupplementDisplayname ? "其他" : obj.SupplementDisplayname
                            break;
                        case 'RoudRule':
                            name = !obj.RoudRuleDisplayname ? "舍入规则" : obj.RoudRuleDisplayname
                            break;
                            //新增两个元素 Genre TransferAmount TriggerCondition
                        case 'Genre':
                            name = !obj.GenreDisplayname ? "分类" : obj.GenreDisplayname
                            break;
                        case 'TransferAmount':
                            name = !obj.TransferAmountDisplayname ? "补足金额" : obj.TransferAmountDisplayname
                            break;
                        case 'TriggerCondition':
                            name = !obj.TriggerConditionDisplayname ? "触发条件" : obj.TriggerConditionDisplayname
                            break;
                    }
                    return name
                }
            },
            //次级规则组装json
            editIncome: function (type, level, detail) {
                var self = this;
                //{ 'LevelThreshHold': 200, 'Distributions': [{ 'tar': 1, 'val': 2 }, {}] }
                var temp1 = { 'LevelThreshHold': '', 'Distributions': [], 'AvailablePercent': '', 'AvailableVal': '', 'sequenceno': 1 };
                var temp2 = { 'tar': '', 'val': 0, 'sequenceno': 1 }
                switch (type) {
                    case 1:
                        //设置初始数据结构
                        if (self.objBeforeEdit.SubClassAllocationSequence) {
                            self.objBeforeEdit.SubClassAllocationSequence.push(temp1);
                        } else {
                            self.objBeforeEdit.SubClassAllocationSequence = [];
                            self.objBeforeEdit.SubClassAllocationSequence.push(temp1);
                        }

                        break;
                    case 2:
                        self.objBeforeEdit.SubClassAllocationSequence.remove(level);
                        break;
                    case 3:
                        if (level.Distributions.length < self.IncomeEle.length) {

                            level.Distributions.push(temp2);
                        }
                        break;
                    case 4:
                        level.Distributions.remove(detail)
                }
            },
            toggleSlide: function (index) {
                $(this.$refs.level_arrow[index]).find('i').toggleClass(' icon-top icon-bottom');
                $(this.$refs.level_detail[index]).slideToggle();
            },
            getAllocationRuleOptions: function (obj, levelId) {
                var self = this;
                var options = [], dataOfOptions = [], levels = [];
                dataOfOptions = JSON.parse(JSON.stringify(self.AllocationRuleOfSameLevel));
                if (self.c_Scenario.Levels) {
                    levels = JSON.parse(JSON.stringify(self.c_Scenario.Levels));
                }
                if (obj.Code == 'Rule_PrincipalAccount_PayLimit' || obj.Code == 'Rule_InterestAccount_PayLimit') {
                    if (levels && levels.length > 0) {
                        var arr = $.grep(levels, function (v, i) {
                            return v.Id == levelId;
                        });
                        if (arr.length > 0) {
                            var level = arr[0];
                            if (level.Elements && level.Elements.length > 0) {
                                var arr2 = $.grep(level.Elements, function (v, i) {
                                    return (v.Type == 'Fee' && v.Source == obj.Source);
                                });
                                if (arr2.length > 0) {
                                    _.remove(dataOfOptions, function (opt) {
                                        return opt.Value == 'ABasedOnCPB';
                                    });
                                }
                            }
                        }
                    }
                }
                options = dataOfOptions;
                return options;
            },
            //拖动费用元素时监测相应数据
            checkMove: function (evt) {
                var self = this;
                var dragObjCategory = evt.draggedContext.element.Category;
                var dragObjType = evt.draggedContext.element.Type;
                var dragObjSource = evt.draggedContext.element.Source;
                var localRuleHtml = self.$refs.localRules;
                var chosenAccountHtml = self.$refs.chosenAccount;
                var oldAccount = evt.draggedContext.element.Source;
                var newAccount = oldAccount;
                var targetEvtData = evt.relatedContext.component.componentData;
                //查看vuedraggable API
                if (targetEvtData) {
                    //更改账户来源
                    if (targetEvtData.Code) {//费用元素拖动到账户区域
                        newAccount = targetEvtData.Code
                    } else if (targetEvtData.accountName) {//费用元素拖动到账户标题
                        newAccount = targetEvtData.accountName
                    }
                    self.changedAccountName = newAccount;
                    //表格中的局部规则不能拖到待选元素中
                    if (dragObjCategory == "Local" && targetEvtData.area) {
                        if (targetEvtData.area == 'choosingArea') {
                            if (self.dragEndFlag) {
                                GSDialog.HintWindow('局部规则不能拖到待选元素区域!'); self.dragEndFlag = false;
                            }

                            return false
                        };
                    }
                    //待选元素必须先拖到账户中才能，拖到表格中去
                    if (dragObjType != "Rule" && dragObjSource == "" && targetEvtData.area) {
                        if (targetEvtData.area == 'levelsArea') {
                            if (self.dragEndFlag) {
                                GSDialog.HintWindow('请先拖待选元素到账户中!'); self.dragEndFlag = false;
                            }

                            return false
                        };
                    }
                    //如果是元素并且目标是局部规则区域，则撤销
                    if (dragObjCategory == '' && targetEvtData.area) {
                        if (targetEvtData.area == 'localRule' || targetEvtData.area == 'globalRule') {
                            if (self.dragEndFlag) {
                                GSDialog.HintWindow('元素不能拖到规则区域!'); self.dragEndFlag = false;
                            }

                            return false
                        };
                    }
                    ////只能拖动一次的规则
                    //if (dragObjType == "Rule") {
                    //    if( evt.draggedContext.element.used){
                    //        if (self.dragEndFlag) {
                    //             GSDialog.HintWindow('此元素只能使用一次!'); self.dragEndFlag = false;
                    //        }
                    //    }
                    //}
                    //全局规则
                    if (dragObjCategory == 'Global' && targetEvtData.area) {
                        if (targetEvtData.area == 'levelsArea' || targetEvtData.area == 'localRule') {
                            if (self.dragEndFlag) {
                                GSDialog.HintWindow('全局规则不能拖到此区域!');
                                self.dragEndFlag = false;
                                if (evt.draggedContext.element.used) evt.draggedContext.element.used = false;
                            }

                            return false
                        };
                    }
                    //局部规则
                    if (dragObjCategory == 'Local' && targetEvtData.area) {
                        if (targetEvtData.area == 'globalRule') {
                            if (self.dragEndFlag) {
                                GSDialog.HintWindow('局部规则不能拖到此区域!');
                                self.dragEndFlag = false;
                                if (evt.draggedContext.element.used) evt.draggedContext.element.used = false;
                            }
                            return false
                        };
                    }
                    //如果是规则元素并且目标是已选账户区域，则撤销
                    if (dragObjCategory == 'Local' && targetEvtData.Code) {
                        if (targetEvtData.Code.indexOf('Account') >= 0) {
                            if (self.dragEndFlag) {
                                GSDialog.HintWindow('规则不能拖到账户区域!'); self.dragEndFlag = false;
                            }
                            return false
                        }
                    }
                    //当元素拖动到账户标题时，切换账户选项卡
                    var activeIndex = targetEvtData.activeIndex;

                    if (targetEvtData.activeIndex >= 0) {
                        self.accountView = targetEvtData.activeIndex;
                    };
                    //当前账户元素拖动到当前账户标题时，撤销
                    if (targetEvtData.accountName) {
                        if (targetEvtData.accountName == evt.draggedContext.element.Source) {
                            return false
                        }
                    };
                }
            },
            //从表格中将局部规则拖回局部规则区域时，需要撤销
            LRchange: function (evt) {
                var self = this;
                //if (evt.added) {
                //    self.dataLocalRules.remove(evt.added.element)
                //    //self.c_Scenario.HasLocalRules.remove(evt.added.element);
                //}
                if (evt.removed && evt.removed.element.IsRepeat == '1') {
                    GSDialog.HintWindow(1)
                }
            },
            GRchange: function (evt) {
            },
            //当全局规则是‘中登费’时，默认排到最后
            GRaddchange: function (evt) {
                var self = this;
                if (evt.added && evt.added.element.Code == 'Rule_ChinaBondFee') {
                    this.c_Scenario.HasGlobalRules.remove(evt.added.element)
                    this.c_Scenario.HasGlobalRules.push(evt.added.element)
                } else if (evt.added && evt.added.element.IsRepeat == '0') {//当全局规则为只能使用一次时，增加used属性作为标记
                    evt.added.element.used = true;
                }
            },
            eleClone: function (original) {
                //规则拖动时只能使用一次的情况
                if (original.used == true) {
                    GSDialog.HintWindow('此规则已使用，且只能使用一次')
                    return;
                }
                //规则拖动时要用此hook进行深拷贝
                return JSON.parse(JSON.stringify(original))
            },
            getEleNamesArr: function (item) {
                var self = this;
                var hasEleNames = [];
                var hasElements = [];
                if (item.ElementNames) {
                    if (item.ElementNames.indexOf(';') > 0) {
                        hasEleNames = item.ElementNames.split(";");
                    } else {
                        hasEleNames = item.ElementNames.split(",");
                    }
                }
                if (hasEleNames.length > 0) {
                    if (self.c_ScenarioEles.length > 0) {
                        $.each(self.c_ScenarioEles, function (i, v) {
                            if ($.inArray(v.Name, hasEleNames) > -1) {
                                hasElements.push(v);
                            }
                        });
                    }
                }
                return hasElements;
            },
            //获取触发条件
            getTriggerCondition: function (item) {
                var self = this;
                var TriggerConditions = [];
                var arry = item.TriggerCondition?item.TriggerCondition.split(";"):[];
                $.each(self.c_ObjTriggerConditionOptions, function (i, v) {
                    if ($.inArray(v.FormulaValue, arry) > -1) {
                        TriggerConditions.push(v);
                    }
                })
                return TriggerConditions
            },
            //当表格里面的费用元素被移回到账户时，全局规则所作用的相应元素也应删除
            tableObjsChange: function (evt) {
                var self = this;
                if (evt.added) {
                    if (self.outin) {
                        self.$set(evt.added.element, "CashFlowDirection", "0")
                    } else {
                        self.$set(evt.added.element, "CashFlowDirection", "1")
                    }
                }
                if (evt.removed) {
                    var grEleNames = "";
                    var removedEleName = evt.removed.element.Name
                    $.each(self.c_Scenario.HasGlobalRules, function (i, v) {
                        var n = v.ElementNames.indexOf(removedEleName)
                        if (n > -1) {
                            v.ElementNames.substr(n - 1, removedEleName.length);
                        }
                    })
                }
            },
            refresh: function (evt) {
            },
            drap: function (evt) {
                var self = this;
            },
            //费用元素从一个账户移动到另一个账户时要改变账户来源
            changeAccountSource: function (evt) {
                var self = this;
                if (evt.added) {
                    evt.added.element.Source = self.changedAccountName;
                }
            },
            get_c_ScenarioEles: function (ele) {
                var self = this;
                var arrFee = [];
                var arrBond = [];
                var arr = [];
                $.each(self.c_Scenario.Levels, function (i, v) {
                    if (v.Elements && v.Elements.length > 0) {
                        $.each(v.Elements, function (i2, v2) {
                            if (v2.RuleType.indexOf('Rule') < 0) {
                                arr.push(v2);
                            }
                        });
                    }
                });
                $.each(self.dataOfBondFees, function (i, v) {
                    if (v.Type == 'Fee') {
                        arrFee.push(v);
                    } else if (v.Type == 'Bond') {
                        arrBond.push(v);
                    }
                })
                if (ele.ElementRange == "Fee") {
                    self.c_ScenarioEles = arrFee;
                } else if (ele.ElementRange == "Fee") {
                    self.c_ScenarioEles = arrBond;
                } else if (ele.ElementRange == "SelectedBondFee") {
                    self.c_ScenarioEles = arr;
                } else {
                    self.c_ScenarioEles = arr;
                }
            },
            //表格滚动条
            scrollHandle: function (e) {
                var self = this;
                var scrollTop = self.$refs.table.scrollTop;
                self.$refs.tableThead.style.transform = 'translateY(' + scrollTop + 'px)';
            },
            //验证必填项目
            validateSaveScenario: function (scenario) {
                var bool = true;
                if (scenario.IsChecked && !scenario.StartDateId) {
                    scenario.b_StartDateId = false;
                }
                if (scenario.IsChecked && !scenario.EndDateId) {
                    scenario.b_EndDateId = false;
                }
                if (scenario.IsChecked && scenario.StartDateId && scenario.EndDateId) {
                    if (scenario.EndDateId <= scenario.StartDateId) {
                        scenario.b_EndDateId = false;
                    }
                }
                if (!scenario.PrincipalPrecision) {
                    scenario.b_PrincipalPrecision = false;
                }
                if (!scenario.InterestPrecision) {
                    scenario.b_InterestPrecision = false;
                }
                bool = (scenario.b_StartDateId && scenario.b_EndDateId && scenario.b_PrincipalPrecision && scenario.b_InterestPrecision);
                return bool;

            },
            //点击时，取消验证提示
            cancelValidateTip: function (attr) {
                var self = this;
                switch (attr) {
                    case 'StartDateId':
                        self.c_Scenario.b_StartDateId = true;
                        break;
                    case 'EndDateId':
                        self.c_Scenario.b_EndDateId = true;
                        break;
                    case 'PrincipalPrecision':
                        self.c_Scenario.b_PrincipalPrecision = true;
                        break;
                    case 'InterestPrecision':
                        self.c_Scenario.b_InterestPrecision = true;
                        break;
                }
            },
            //撤销表格中的元素，回到账户
            revertEle: function (ele, item) {
                var self = this;
                var accountSource = ele.Source;
                item.Elements.remove(ele);
                if (ele.RuleType.indexOf('Rule') > -1) return;

                var account = _.find(this.c_Scenario.HasAccounts, function (v) {
                    return v.Code == accountSource;
                })
                if (account) {
                    account.subFees.push(ele);
                } else {
                    self.c_Scenario.SelectableBondFees.push(ele);
                }
            },
            //检查表格中是否有属于已选账户的元素
            accountHasEle: function (accountCode) {
                var self = this;
                var flag = false;
                if (self.c_Scenario.Levels.length > 0) {
                    $.each(self.c_Scenario.Levels, function (i, v) {
                        if (v.Elements && v.Elements.length) {
                            $.each(v.Elements, function (i2, v2) {
                                if (v2.Source == accountCode || v2.Target == accountCode) {
                                    flag = true;
                                    return false;
                                }
                            });
                        }
                        if (flag) return false;
                    });
                }
                return flag;
            },
            //撤销账户时撤销表格内的属于该账户的元素
            revertTableEle: function (account) {
                var self = this;
                $.each(self.c_Scenario.Levels, function (i, v) {
                    if (v.Elements.length > 0) {
                        var temp = [];
                        temp = v.Elements.filter(function (v2) {
                            if (v2.Source == account.Code || v2.Target == account.Code) {
                                return v2;
                            }
                        });
                        if (temp.length > 0) {
                            $.each(temp, function (i3, v3) {
                                self.revertEle(v3, v);
                            });
                        }
                    }
                });
            },
            //撤销账户时撤销相应的全局规则
            revertGlobalRule: function (account) {
                var self = this;
                var temp = []
                $.each(self.c_Scenario.HasGlobalRules, function (i, v) {
                    if (v.Source == account.Code) {
                        temp.push(v)
                    }
                })
                if (temp.length > 0) {
                    $.each(temp, function (i, v) {
                        self.c_Scenario.HasGlobalRules.remove(v)
                    })
                }
                //todo
            },
            checkAccountClass: function (item) {
                if (item.Code && item.subFees) {
                    return [ACCOUNT_TYPE_CLASS_MAP[item.Code], 'objElementTalbe']
                } else if (item.Source != '' && item.Type != 'Rule') {
                    return [ACCOUNT_TYPE_CLASS_MAP[item.Source], 'objElementTalbe']
                } else if (item.Type == 'Rule') {
                    return "tableLREle"
                }
            },
            //是否是已选账户
            isChosenAccount: function (item) {
                return !_.some(this.c_ScenarioNoAccounts, item)
            },
            //切换选择和撤销张合
            toggleAccount: function (item) {
                if (_.some(this.c_ScenarioNoAccounts, item)) {
                    this.choseAccount(item);
                } else {
                    //撤销的账户对象必须是c_Scenario.HasAccounts 里面的账户对象
                    var a = _.find(this.c_Scenario.HasAccounts, function (v) {
                        return v.Code == item.Code
                    })
                    this.cancelAccount(a)
                }
            },
            //筛选规则数据
            fliterRuleData: function (originRuleData, accounts, searchQuery) {
                var self = this;
                // 原数据时数组，在遍历的时候删除本身会出错，拷贝一份
                var cloneData = JSON.parse(JSON.stringify(originRuleData));
                //根据账户筛选规则、
                if (accounts) {
                    cloneData.forEach(function (v) {
                        //elatedAccounts有可能有多个
                        if (v.RelatedAccounts.indexOf(',') > -1) {
                            var arr = v.RelatedAccounts.split(',');
                            arr.forEach(function (v1) {
                                var arrflag = accounts.some(function (v2) {
                                    return v2.Name == v1
                                })
                                if (!arrflag) {
                                    var ruleObj = originRuleData.filter(function (v3) {
                                        return v3.Code == v.Code
                                    })
                                    originRuleData.remove(ruleObj[0])
                                }
                            })
                        } else if (v.RelatedAccounts != '') {
                            var arrflag = accounts.some(function (v2) {
                                return v2.Name == v.RelatedAccounts
                            })
                            if (!arrflag) {
                                var ruleObj = originRuleData.filter(function (v3) {
                                    return v3.Code == v.Code
                                })
                                originRuleData.remove(ruleObj[0])
                            }
                        }
                    })
                }
                //根据搜索条件
                if (searchQuery && searchQuery != '') {
                    originRuleData = originRuleData.filter(function (row) {
                        return row.DisplayName.indexOf(searchQuery) > -1
                    })
                    if (originRuleData.length > 0) {
                        $(self.$refs.rule_tree_node).find('i').addClass(' fa-folder-open').removeClass('fa-folder')
                        $(self.$refs.rule_tree_node).siblings().find(".list").slideDown();
                    }
                }
                return originRuleData
            },
            // canvas中绘制换行文本
            fillCanvasLineFeedText: function(context, text, x, y, lineHeight) {
                var rows = text.split('\n');
                rows.forEach(element => {
                    context.fillText(element, x, y);
                    y += lineHeight;
                });
            },
            // 获取每列节点最大宽度
            getNodeMaxWidth: function(context, elementOfList) {
                var maxWidth = 0;
                elementOfList.Elements.forEach(element => {
                    if(Math.round(context.measureText(element.DisplayName).width) > maxWidth)
                    maxWidth = Math.round(context.measureText(element.DisplayName).width);
                });
                return maxWidth;
            },
            // 获取互转目标Id
            getTargetId: function(target, node) {
                var id = { id: 'none', x:'none', y:'none' };
                node.forEach(childNode => {
                    if(childNode.source !== 'root') {
                        if(childNode.elements === 'account' && childNode.source === target) {
                            id = { id: target, x: childNode.x, y: childNode.y };
                        } else if(childNode.elements !== 'account') {
                            childNode.elements.forEach(element => {
                                if(element.Name === target) {
                                    id = { id: childNode.id, x: childNode.x, y: childNode.y };
                                }
                            });
                        }
                    }
                });
                return id;
            },
            // 获取当前节点之前的节点在canvas中占据的宽度（为了计算当前节点的坐标）
            getHistoryWidth: function(maxWidthArray, index) {
                if(index === 1) {
                    return 0;
                }
                var historyWidth = 0;
                maxWidthArray.forEach((element, i) => {
                    if(i < index)
                    historyWidth += element + 16;
                });
                historyWidth -= 32;
                return historyWidth;
            },
            // 绘制节点间连线
            // 其中type接受例如'lr','tb'等表示线段方向为left => right等
            fillLineWithArrow: function(context, x, y, length, type, hasArrow, isSolidLine) { 
                context.beginPath();
                switch (type) {
                    case 'lr':
                        if(hasArrow) {
                            if(isSolidLine) {
                                context.moveTo(x + 4, y);
                                context.lineTo(length + x - 8, y);
                                context.stroke();
                                context.moveTo(length + x - 8, y);
                                context.lineTo(length + x - 8, y - 4);
                                context.lineTo(length + x - 2, y);
                                context.lineTo(length + x - 8, y + 4);
                                context.lineTo(length + x - 8, y);
                                context.fill();
                            } else {
                                for(let nowLength = x + 4; nowLength < length + x - 8; nowLength += 6) {
                                    context.moveTo(nowLength, y);
                                    context.lineTo(nowLength + 4, y);
                                    context.stroke();
                                }
                                context.moveTo(length + x - 8, y);
                                context.lineTo(length + x - 8, y - 4);
                                context.lineTo(length + x - 2, y);
                                context.lineTo(length + x - 8, y + 4);
                                context.lineTo(length + x - 8, y);
                                context.fill();
                            }
                        } else {
                            if(isSolidLine) {
                                context.moveTo(x, y);
                                context.lineTo(length + x, y);
                                context.stroke();
                            } else {
                                for(let nowLength = x; nowLength < length + x; nowLength += 6) {
                                    context.moveTo(nowLength, y);
                                    context.lineTo(nowLength + 4, y);
                                    context.stroke();
                                }
                            }
                        }
                        break;
                    case 'tb':
                        if (hasArrow) {
                            if(isSolidLine) {
                                context.moveTo(x, y);
                                context.lineTo(x, length + y - 8);
                                context.stroke();
                                context.moveTo(x, length + y - 8);
                                context.lineTo(x - 4, length + y - 8);
                                context.lineTo(x, length + y - 2);
                                context.lineTo(x + 4, length + y - 8);
                                context.lineTo(x, length + y - 8);
                                context.fill();
                            } else {
                                for(let nowLength = y; nowLength < length + y - 8; nowLength += 6) {
                                    context.moveTo(x, nowLength);
                                    context.lineTo(x, nowLength + 4);
                                    context.stroke();
                                }
                                context.moveTo(x, length + y - 8);
                                context.lineTo(x - 4, length + y - 8);
                                context.lineTo(x, length + y - 2);
                                context.lineTo(x + 4, length + y - 8);
                                context.lineTo(x, length + y - 8);
                                context.fill();
                            }
                        } else {
                            if(isSolidLine) {
                                context.moveTo(x, y);
                                context.lineTo(x, length + y);
                                context.stroke();
                            } else {
                                for(let nowLength = y; nowLength < length + y; nowLength += 6) {
                                    context.moveTo(x, nowLength);
                                    context.lineTo(x, nowLength + 4);
                                    context.stroke();
                                }
                            }
                        }
                        break;
                    case 'rl':
                        if(hasArrow) {
                            if(isSolidLine) {
                                context.moveTo(x + 8, y);
                                context.lineTo(length + x - 4, y);
                                context.stroke();
                                context.moveTo(x + 8, y);
                                context.lineTo(x + 8, y - 4);
                                context.lineTo(x + 2, y);
                                context.lineTo(x + 8, y + 4);
                                context.lineTo(x + 8, y);
                                context.fill();
                            } else {
                                for(let nowLength = x + 8; nowLength < length + x - 4; nowLength += 6) {
                                    context.moveTo(nowLength, y);
                                    context.lineTo(nowLength + 4, y);
                                    context.stroke();
                                }
                                context.moveTo(x + 8, y);
                                context.lineTo(x + 8, y - 4);
                                context.lineTo(x + 2, y);
                                context.lineTo(x + 8, y + 4);
                                context.lineTo(x + 8, y);
                                context.fill();
                            }
                        } else {
                            if(isSolidLine) {
                                context.moveTo(x, y);
                                context.lineTo(x - length, y);
                                context.stroke();
                            } else {
                                for(let nowLength = x; nowLength > x - length; nowLength -= 6) {
                                    context.moveTo(nowLength, y);
                                    context.lineTo(nowLength - 4, y);
                                    context.stroke();
                                }
                            }   
                        }
                        break;
                    case 'bt':
                        if (hasArrow) {
                            if(isSolidLine) {
                                context.moveTo(x, y);
                                context.lineTo(x, y - length + 8);
                                context.stroke();
                                context.moveTo(x, y - length + 8);
                                context.lineTo(x - 4, y - length + 8);
                                context.lineTo(x, y - length + 2);
                                context.lineTo(x + 4, y - length + 8);
                                context.lineTo(x, y - length + 8);
                                context.fill();
                            } else {
                                for(let nowLength = y; nowLength > y - length + 8; nowLength -= 6) {
                                    context.moveTo(x, nowLength);
                                    context.lineTo(x, nowLength - 4);
                                    context.stroke();
                                }
                                context.moveTo(x, y - length + 8);
                                context.lineTo(x - 4, y - length + 8);
                                context.lineTo(x, y - length + 2);
                                context.lineTo(x + 4, y - length + 8);
                                context.lineTo(x, y - length + 8);
                                context.fill();
                            }
                        } else {
                            if(isSolidLine) {
                                context.moveTo(x, y);
                                context.lineTo(x, y - length);
                                context.stroke();
                            } else {
                                for(let nowLength = y; nowLength > y - length; nowLength -= 6) {
                                    context.moveTo(x, nowLength);
                                    context.lineTo(x, nowLength - 4);
                                    context.stroke();
                                }
                            }
                        }
                        break;
                    default:
                        break;
                }
            },
            // 绘制圆角矩形
            roundedRect: function(context, x, y, width, height, radius) {
                context.beginPath();
                context.moveTo(x, y + radius);
                context.lineTo(x, y + height - radius);
                context.quadraticCurveTo(x, y + height, x + radius, y + height);
                context.lineTo(x + width - radius, y + height);
                context.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
                context.lineTo(x + width, y + radius);
                context.quadraticCurveTo(x + width, y, x + width - radius, y);
                context.lineTo(x + radius, y);
                context.quadraticCurveTo(x, y, x, y + radius);
                context.fill();
            },
            // 使canvas支持缩放和拖动
            zoomed: function() {
                var canvas = d3.select("canvas")
                context = canvas.node().getContext("2d");
                context.save();
                context.clearRect(0, 0, 1920, 1080);
                context.translate(d3.event.transform.x, d3.event.transform.y);
                context.scale(d3.event.transform.k, d3.event.transform.k);
                this.drawView(context);
                context.restore();
            },
            // 绘制偿付情景视图
            drawView: function (context) {
                context.clearRect(0, 0, 1920, 1080);
                self = this;
                var accounts = [];
                self.c_Scenario.PaymentSequence.Accounts.forEach(element => {
                    accounts.push({ name: element.Code, dataList: [] })
                });
                // 根据来源账户对数据分组
                self.c_Scenario.PaymentSequence.Levels.forEach(element => {
                    if(element.Elements[0].Source === 'TrustPlanAccount_Reserve_AvailableAmt' || element.Elements[0].Source === 'TrustPlanAccount_Principal_AvailableAmt' || element.Elements[0].Source === 'TrustPlanAccount_Interest_AvailableAmt' || element.Elements[0].Source === 'TrustPlanAccount_Total_AvailableAmt') {
                        accounts.forEach(elementOfAccounts => {
                            if(elementOfAccounts.name === element.Elements[0].Source)
                                elementOfAccounts.dataList.push(element);
                        });
                    } else {
                        // 预留给自定义账户
                        // accounts.push({
                        //     name: element.Elements[0].DisplayName
                        // })
                    }
                });
                // 定义节点属性
                var node = [];
                node.push({
                    source: 'root',
                    x: 0,
                    y: 0,
                })
                var isBack = false;
                var x = 1, y = 0;
                accounts.forEach(element => {
                    var tempColor = '';
                    switch (element.name) {
                        case 'TrustPlanAccount_Reserve_AvailableAmt':
                            tempColor = 'rgba(234,159,104,1)';
                            break;
                        case 'TrustPlanAccount_Principal_AvailableAmt':
                            tempColor = 'rgba(105,138,195,1)';
                            break;
                        case 'TrustPlanAccount_Interest_AvailableAmt':
                            tempColor = 'rgba(100,176,100,1)';
                            break;
                        case 'TrustPlanAccount_Total_AvailableAmt':
                            tempColor = 'rgba(222,175,44,1)';
                            break;
                        default:
                            tempColor = 'rgba(222,175,44,1)';
                            break;
                    }
                    node.push({
                        source: element.name,
                        x: x,
                        y: y,
                        elements: 'account',
                        color: tempColor,
                        topLeft: false,
                        topMid: false,
                        topRight: false,
                        bottomLeft: false,
                        bottomMid: false,
                        bottomRight: false
                    });
                    x++;
                    if(element.dataList !== undefined) {
                        element.dataList.forEach((elementOfList, index) => {
                            node.push({
                                source: element.name,
                                x: x,
                                y: y,
                                id: elementOfList.Id,
                                elements: elementOfList.Elements,
                                color: tempColor,
                                maxWidth: self.getNodeMaxWidth(context, elementOfList),
                                topLeft: false,
                                topMid: false,
                                topRight: false,
                                bottomLeft: false,
                                bottomMid: false,
                                bottomRight: false
                            })
                            if (x !== 6 && isBack === false) {
                                x++;
                            } else if(x === 6 && isBack === false) {
                                y++;
                                isBack = true;
                            } else if(isBack === true && x !== 2) {
                                x--;
                            } else if(x === 2 && isBack === true && element.dataList[index+1] !== undefined) {
                                y++;
                                isBack = false;
                            } else {
                                isBack = false;
                            }
                        });
                    }
                    y++;
                    x = 1;
                    isBack = false;
                });
                // 获取所有互转线段
                var lines = [];
                node.forEach(childNode => {
                    if(childNode.elements !== undefined)
                    if(childNode.elements !== 'account')
                    childNode.elements.forEach(element => {
                        if(element.Target !== '') {
                            lines.push({source:{ id: childNode.id, x: childNode.x, y: childNode.y, sourceAccount: childNode.source }, target: self.getTargetId(element.Target, node) });
                        }
                    });
                });
                // 获取每列最大宽度
                var maxWidthOfCol = [0, 0, 0, 0, 0, 0, 0];
                node.forEach(element => {
                    if(element.maxWidth !== undefined) {
                        if(element.maxWidth > maxWidthOfCol[element.x]) {
                            maxWidthOfCol[element.x] = element.maxWidth;
                        }
                    }
                });
                // 绘制节点
                node.forEach(element => {
                    switch (element.elements) {
                        case undefined: // 根节点
                            context.strokeStyle = 'rgba(69,86,156,1)';
                            context.lineWidth = 2;
                            context.strokeRect(73, 40, 30, 110);
                            context.fillStyle = 'rgba(69,86,156,1)';
                            context.textBaseline = 'top';
                            self.fillCanvasLineFeedText(context, '总\n账\n户', 80, 75, 14);
                            break;
                        case 'account': // 账户节点
                            context.beginPath(); 
                            context.fillStyle = element.color;
                            self.roundedRect(context, 193, 40 + 60 * element.y + element.y * 110, 30, 110, 15)
                            context.beginPath(); 
                            context.fillStyle = 'rgb(255, 255, 255)';
                            switch (element.source) {
                                case 'TrustPlanAccount_Reserve_AvailableAmt':
                                    self.fillCanvasLineFeedText(context, '信\n托\n储\n备\n账\n户', 201, 40 + 60 * element.y  + element.y * 110 + 15, 14);
                                    break;
                                case 'TrustPlanAccount_Principal_AvailableAmt':
                                    self.fillCanvasLineFeedText(context, '本\n金\n分\n账\n户', 201, 47 + 60 * element.y  + element.y * 110 + 15, 14);
                                    break;
                                case 'TrustPlanAccount_Interest_AvailableAmt':
                                    self.fillCanvasLineFeedText(context, '收\n入\n分\n账\n户', 201, 47 + 60 * element.y  + element.y * 110 + 15, 14);
                                    break;
                                case 'TrustPlanAccount_Total_AvailableAmt':
                                    self.fillCanvasLineFeedText(context, '信\n托\n收\n款\n账\n户', 201, 40 + 60 * element.y  + element.y * 110 + 15, 14);
                                    break;
                                default:
                                    break;
                            }
                            break;
                        default: // 规则节点
                            context.beginPath(); 
                            context.fillStyle = element.color.replace('1)','0.1)');
                            self.roundedRect(context, 223 + (element.x - 1) * 60 + this.getHistoryWidth(maxWidthOfCol, element.x), 40 + 60 * element.y  + element.y * 110, maxWidthOfCol[element.x] + 16, 110, 2)
                            context.beginPath();
                            context.fillStyle = "rgb(0, 0, 0)";
                            var fillstr = '';
                            element.elements.forEach(item => {
                                fillstr += item.DisplayName + '\n';
                            });
                            self.fillCanvasLineFeedText(context, fillstr, 223 + 8 + (element.x - 1) * 60 + this.getHistoryWidth(maxWidthOfCol, element.x), 40 + 7 + 60 * element.y  + element.y * 110, 14)
                            break;
                    }
                });
                // 绘制基础路径
                node.forEach((element, index) => {
                    context.lineWidth = 2;
                    context.fillStyle = 'rgba(69,86,156,1)';
                    context.strokeStyle = 'rgba(69,86,156,1)';
                    self.fillLineWithArrow(context, 104, 95, 90, 'lr', false, true);
                    switch (element.elements) {
                        case 'account':
                            if(element.y !== 0) {
                                self.fillLineWithArrow(context, 89, 150, 
                                    element.y * (60 + 55) + (element.y - 1) * 55, 'tb', false, true);
                                self.fillLineWithArrow(context, 89, 150 + element.y * (60 + 55) + (element.y - 1) * 55, 
                                    105, 'lr', false, true);
                            }
                            break;
                        default:
                            if(element.source !== 'root') {
                                if(Math.abs(element.x - node[index - 1].x) === 1 && element.y === node[index - 1].y) {
                                    if (element.x - node[index - 1].x === 1) {
                                        self.fillLineWithArrow(context, 163 + (element.x - 1) * 60 + this.getHistoryWidth(maxWidthOfCol, element.x), 95 + 60 * element.y  + element.y * 110, 
                                            60, 'lr', true, true);
                                    } else {  
                                        self.fillLineWithArrow(context, 223 + (element.x - 1) * 60 + this.getHistoryWidth(maxWidthOfCol, element.x) + maxWidthOfCol[element.x] + 16, 95 + 60 * element.y  + element.y * 110, 
                                            60, 'rl', true, true);
                                    }
                                } else if(element.y - node[index - 1].y === 1 && element.x === node[index - 1].x) {
                                    self.fillLineWithArrow(context, 223 + (element.x - 1) * 60 + this.getHistoryWidth(maxWidthOfCol, element.x) + (maxWidthOfCol[element.x] + 8) / 2, 40 + 60 * element.y  + element.y * 110 - 60, 
                                        60, 'tb', true, true);
                                }
                            }
                            break;
                    }
                });
                // 绘制互转路径
                var rows = [];
                var cols = [''];
                for (let index = 0; index < node.slice(-1)[0].y; index++) {
                    rows.push([false, false, false, false, false]);
                }
                for (let index = 0; index < 5; index++) {
                    cols.push([false, false, false]);
                }
                // 避免基础路径和互转路径重合
                node.forEach((element, index) => {
                    if(node[index + 1] !== undefined && element.x !== 1) {
                        if(element.x === node[index + 1].x && element.y === node[index + 1].y - 1) {
                            element.bottomMid = true;
                            node[index + 1].topMid = true;
                        } 
                    }
                });
                lines.forEach(line => {
                    if(line.target.x !== line.source.x || line.target.y !== line.source.y) {
                        switch (line.source.sourceAccount) {
                            case 'TrustPlanAccount_Reserve_AvailableAmt':
                                context.strokeStyle = 'rgba(234,159,104,1)';
                                context.fillStyle = 'rgba(234,159,104,1)';
                                break;
                            case 'TrustPlanAccount_Principal_AvailableAmt':
                                context.strokeStyle = 'rgba(105,138,195,1)';
                                context.fillStyle = 'rgba(105,138,195,1)';
                                break;
                            case 'TrustPlanAccount_Interest_AvailableAmt':
                                context.strokeStyle = 'rgba(100,176,100,1)';
                                context.fillStyle = 'rgba(100,176,100,1)';
                                break;
                            case 'TrustPlanAccount_Total_AvailableAmt':
                                context.strokeStyle = 'rgba(222,175,44,1)';
                                context.fillStyle = 'rgba(222,175,44,1)';
                                break;
                            default:
                                context.strokeStyle = 'rgba(222,175,44,1)';
                                context.fillStyle = 'rgba(222,175,44,1)';
                                break;
                        }
                        let start, end, startRowLine, colLine, endRowLine;
                        // 区分互转情形并获取出入方向
                        if(line.target.y - line.source.y === 0) {
                            let hasStartBottomMid = hasStartBottomLeft = hasStartBottomRight = false;
                            let hasEndBottomMid = hasEndBottomLeft = hasEndBottomRight = false;
                            node.forEach(element => {
                                if(element.x === line.source.x && element.y === line.source.y + 1) {
                                    if(element.topMid === true)
                                        hasStartBottomMid = true;
                                    if(element.topLeft === true)
                                        hasStartBottomLeft = true;
                                    if(element.topRight === true)
                                        hasStartBottomRight = true;
                                }
                                if(element.x === line.target.x && element.y === line.target.y + 1) {
                                    if(element.topMid === true)
                                        hasEndBottomMid = true;
                                    if(element.topLeft === true)
                                        hasEndBottomLeft = true;
                                    if(element.topRight === true)
                                        hasEndBottomRight = true;
                                }
                            });
                            node.forEach(element => {
                                if(element.x === line.source.x && element.y === line.source.y) {
                                    if(element.bottomMid || hasStartBottomMid) {
                                        if(element.bottomLeft || hasStartBottomLeft) {
                                            if(element.bottomRight || hasStartBottomRight) {
                                                console.error('路径拥堵');
                                            } else {
                                                start = 'bottomRight';
                                                element.bottomRight = true;
                                            }
                                        } else {
                                            start = 'bottomLeft';
                                            element.bottomLeft = true;
                                        }
                                    } else {
                                        start = 'bottomMid';
                                        element.bottomMid = true;
                                    }
                                }
                                if(element.x === line.target.x && element.y === line.target.y) {
                                    if(element.bottomMid || hasEndBottomMid) {
                                        if(element.bottomLeft || hasEndBottomLeft) {
                                            if(element.bottomRight || hasEndBottomRight) {
                                                console.error('路径拥堵');
                                            } else {
                                                end = 'bottomRight';
                                                element.bottomRight = true;
                                            }
                                        } else {
                                            end = 'bottomLeft';
                                            element.bottomLeft = true;
                                        }
                                    } else {
                                        end = 'bottomMid';
                                        element.bottomMid = true;
                                    }
                                }
                            });
                        }
                        if(line.target.y - line.source.y > 0) {
                            let hasStartBottomMid = hasStartBottomLeft = hasStartBottomRight = false;
                            let hasEndTopMid = hasEndTopLeft = hasEndTopRight = false;
                            node.forEach(element => {
                                if(element.x === line.source.x && element.y === line.source.y + 1) {
                                    if(element.topMid === true)
                                        hasStartBottomMid = true;
                                    if(element.topLeft === true)
                                        hasStartBottomLeft = true;
                                    if(element.topRight === true)
                                        hasStartBottomRight = true;
                                }
                                if(element.x === line.target.x && element.y === line.target.y - 1) {
                                    if(element.bottomMid === true)
                                        hasEndTopMid = true;
                                    if(element.bottomLeft === true)
                                        hasEndTopLeft = true;
                                    if(element.bottomRight === true)
                                        hasEndTopRight = true;
                                }
                            });
                            node.forEach(element => {
                                if(element.x === line.source.x && element.y === line.source.y) {
                                    if(element.bottomMid || hasStartBottomMid) {
                                        if(element.bottomLeft || hasStartBottomLeft) {
                                            if(element.bottomRight || hasStartBottomRight) {
                                                console.error('路径拥堵');
                                            } else {
                                                start = 'bottomRight';
                                                element.bottomRight = true;
                                            }
                                        } else {
                                            start = 'bottomLeft';
                                            element.bottomLeft = true;
                                        }
                                    } else {
                                        start = 'bottomMid';
                                        element.bottomMid = true;
                                    }
                                }
                                if(element.x === line.target.x && element.y === line.target.y) {
                                    if(element.topMid || hasEndTopMid) {
                                        if(element.topLeft || hasEndTopLeft) {
                                            if(element.topRight || hasEndTopRight) {
                                                console.error('路径拥堵');
                                            } else {
                                                end = 'topRight';
                                                element.topRight = true;
                                            }
                                        } else {
                                            end = 'topLeft';
                                            element.topLeft = true;
                                        }
                                    } else {
                                        end = 'topMid';
                                        element.topMid = true;
                                    }
                                }
                            });
                        }
                        if(line.target.y - line.source.y < 0) {
                            let hasStartTopMid = hasStartTopLeft = hasStartTopRight = false;
                            let hasEndBottomMid = hasEndBottomLeft = hasEndBottomRight = false;
                            node.forEach(element => {
                                if(element.x === line.source.x && element.y === line.source.y - 1) {
                                    if(element.bottomMid === true)
                                        hasStartTopMid = true;
                                    if(element.bottomLeft === true)
                                        hasStartTopLeft = true;
                                    if(element.bottomRight === true)
                                        hasStartTopRight = true;
                                }
                                if(element.x === line.target.x && element.y === line.target.y + 1) {
                                    if(element.topMid === true)
                                        hasEndBottomMid = true;
                                    if(element.topLeft === true)
                                        hasEndBottomLeft = true;
                                    if(element.topRight === true)
                                        hasEndBottomRight = true;
                                }
                            });
                            node.forEach(element => {
                                if(element.x === line.source.x && element.y === line.source.y) {
                                    if(element.topMid || hasStartTopMid) {
                                        if(element.topLeft || hasStartTopLeft) {
                                            if(element.topRight || hasStartTopRight) {
                                                console.error('路径拥堵');
                                            } else {
                                                start = 'topRight';
                                                element.topRight = true;
                                            }
                                        } else {
                                            start = 'topLeft';
                                            element.topLeft = true;
                                        }
                                    } else {
                                        start = 'topMid';
                                        element.topMid = true;
                                    }
                                }
                                if(element.x === line.target.x && element.y === line.target.y) {
                                    if(element.bottomMid || hasEndBottomMid) {
                                        if(element.bottomLeft || hasEndBottomLeft) {
                                            if(element.bottomRight || hasEndBottomRight) {
                                                console.error('路径拥堵');
                                            } else {
                                                end = 'bottomRight';
                                                element.bottomRight = true;
                                            }
                                        } else {
                                            end = 'bottomLeft';
                                            element.bottomLeft = true;
                                        }
                                    } else {
                                        end = 'bottomMid';
                                        element.bottomMid = true;
                                    }
                                }
                            });
                        }
                        // 根据出入方向选择路径
                        if(start !== undefined && end !== undefined) {
                            if(start.substr(0,3) === 'top') {
                                if(line.source.y - 1 === line.target.y) {
                                    if(rows[line.source.y - 1][2]) {
                                        if(rows[line.source.y - 1][1]) {
                                            if(rows[line.source.y - 1][3]) {
                                                if(rows[line.source.y - 1][0]) {
                                                    if(rows[line.source.y - 1][4]) {
                                                        console.error("路径拥堵");
                                                    } else {
                                                        startRowLine = 4;
                                                        endRowLine = 4;
                                                    }
                                                } else {
                                                    startRowLine = 0;
                                                    endRowLine = 0;
                                                }
                                            } else {
                                                startRowLine = 3;
                                                endRowLine = 3;
                                            }
                                        } else {
                                            startRowLine = 1;
                                            endRowLine = 1;
                                        }
                                    } else {
                                        startRowLine = 2;
                                        endRowLine = 2;
                                    }
                                    rows[line.source.y - 1][startRowLine] = true;
                                } else {
                                    if(rows[line.source.y - 1][2]) {
                                        if(rows[line.source.y - 1][1]) {
                                            if(rows[line.source.y - 1][3]) {
                                                if(rows[line.source.y - 1][0]) {
                                                    if(rows[line.source.y - 1][4]) {
                                                        console.error("路径拥堵");
                                                    } else {
                                                        startRowLine = 4;
                                                    }
                                                } else {
                                                    startRowLine = 0;
                                                }
                                            } else {
                                                startRowLine = 3;
                                            }
                                        } else {
                                            startRowLine = 1;
                                        }
                                    } else {
                                        startRowLine = 2;
                                    }
                                    if(line.source.x - line.target.x > 0) {
                                        if(cols[line.target.x][1]) {
                                            if(cols[line.target.x][0]) {
                                                if(cols[line.target.x][2]) {
                                                    console.error("路径拥堵");
                                                } else {
                                                    colLine = 2;
                                                }
                                            } else {
                                                colLine = 0;
                                            }
                                        } else {
                                            colLine = 1;
                                        }
                                        cols[line.target.x][colLine] = true;
                                    } else {
                                        if(cols[line.target.x - 1][1]) {
                                            if(cols[line.target.x - 1][0]) {
                                                if(cols[line.target.x - 1][2]) {
                                                    console.error("路径拥堵");
                                                } else {
                                                    colLine = 2;
                                                }
                                            } else {
                                                colLine = 0;
                                            }
                                        } else {
                                            colLine = 1;
                                        }
                                        cols[line.target.x - 1][colLine] = true;
                                    }
                                    if(rows[line.target.y][2]) {
                                        if(rows[line.target.y][1]) {
                                            if(rows[line.target.y][3]) {
                                                if(rows[line.target.y][0]) {
                                                    if(rows[line.target.y][4]) {
                                                        console.error("路径拥堵");
                                                    } else {
                                                        endRowLine = 4;
                                                    }
                                                } else {
                                                    endRowLine = 0;
                                                }
                                            } else {
                                                endRowLine = 3;
                                            }
                                        } else {
                                            endRowLine = 1;
                                        }
                                    } else {
                                        endRowLine = 2;
                                    }
                                    rows[line.source.y - 1][startRowLine] = true;
                                    rows[line.target.y][endRowLine] = true;
                                }
                            }
                            if(start.substr(0,6) === 'bottom') {
                                // 不跨行的情况下不需要列路径，起始结束行相同
                                if(line.source.y === line.target.y - 1 || line.source.y === line.target.y) {
                                    if(rows[line.source.y][2]) {
                                        if(rows[line.source.y][1]) {
                                            if(rows[line.source.y][3]) {
                                                if(rows[line.source.y][0]) {
                                                    if(rows[line.source.y][4]) {
                                                        console.error("路径拥堵");
                                                    } else {
                                                        startRowLine = 4;
                                                        endRowLine = 4;
                                                    }
                                                } else {
                                                    startRowLine = 0;
                                                    endRowLine = 0;
                                                }
                                            } else {
                                                startRowLine = 3;
                                                endRowLine = 3;
                                            }
                                        } else {
                                            startRowLine = 1;
                                            endRowLine = 1;
                                        }
                                    } else {
                                        startRowLine = 2;
                                        endRowLine = 2;
                                    }
                                    rows[line.source.y][startRowLine] = true;
                                } else {
                                    if(rows[line.source.y][2]) {
                                        if(rows[line.source.y][1]) {
                                            if(rows[line.source.y][3]) {
                                                if(rows[line.source.y][0]) {
                                                    if(rows[line.source.y][4]) {
                                                        console.error("路径拥堵");
                                                    } else {
                                                        startRowLine = 4;
                                                    }
                                                } else {
                                                    startRowLine = 0;
                                                }
                                            } else {
                                                startRowLine = 3;
                                            }
                                        } else {
                                            startRowLine = 1;
                                        }
                                    } else {
                                        startRowLine = 2;
                                    }
                                    if(line.source.x - line.target.x > 0) {
                                        if(cols[line.target.x][1]) {
                                            if(cols[line.target.x][0]) {
                                                if(cols[line.target.x][2]) {
                                                    console.error("路径拥堵");
                                                } else {
                                                    colLine = 2;
                                                }
                                            } else {
                                                colLine = 0;
                                            }
                                        } else {
                                            colLine = 1;
                                        }
                                        cols[line.target.x][colLine] = true;
                                    } else {
                                        if(cols[line.target.x - 1][1]) {
                                            if(cols[line.target.x - 1][0]) {
                                                if(cols[line.target.x - 1][2]) {
                                                    console.error("路径拥堵");
                                                } else {
                                                    colLine = 2;
                                                }
                                            } else {
                                                colLine = 0;
                                            }
                                        } else {
                                            colLine = 1;
                                        }
                                        cols[line.target.x - 1][colLine] = true;
                                    }
                                    if(rows[line.target.y - 1][2]) {
                                        if(rows[line.target.y - 1][1]) {
                                            if(rows[line.target.y - 1][3]) {
                                                if(rows[line.target.y - 1][0]) {
                                                    if(rows[line.target.y - 1][4]) {
                                                        console.error("路径拥堵");
                                                    } else {
                                                        endRowLine = 4;
                                                    }
                                                } else {
                                                    endRowLine = 0;
                                                }
                                            } else {
                                                endRowLine = 3;
                                            }
                                        } else {
                                            endRowLine = 1;
                                        }
                                    } else {
                                        endRowLine = 2;
                                    }
                                    rows[line.source.y][startRowLine] = true;
                                    rows[line.target.y - 1][endRowLine] = true;
                                } 
                            }
                        }
                        if(start !== undefined && end !== undefined && startRowLine !== undefined && endRowLine !== undefined) {
                            let startLength, endLength, startOffset, endOffset;
                            switch (start.substr(-4)) {
                                case 'Left':
                                    startOffset = -15;
                                    break;
                                case 'ight':
                                    startOffset = 15;
                                    break;
                                default:
                                    startOffset = 0;
                                    break;
                            }
                            switch (end.substr(-4)) {
                                case 'Left':
                                    endOffset = -15;
                                    break;
                                case 'ight':
                                    endOffset = 15;
                                    break;
                                default:
                                    endOffset = 0;
                                    break;
                            }
                            // 从下向上
                            if(start.substr(0,3) === 'top') {
                                startLength = (startRowLine + 1) * 10; 
                                // 同行
                                if(line.source.y - 1 === line.target.y) {
                                    let startX, startY, endX, endY;
                                    startX = 223 + (line.source.x - 1) * 60 + this.getHistoryWidth(maxWidthOfCol, line.source.x) + maxWidthOfCol[line.source.x] / 2 + startOffset + 8;
                                    startY = 40 + 60 * line.source.y  + line.source.y * 110;
                                    self.fillLineWithArrow(context, startX, startY, startLength, 'bt', false, false);
                                    if(line.target.x === 1) {
                                        endX = 193 + (line.target.x - 1) * 60 + 15 + endOffset;
                                    } else {
                                        endX = 223 + (line.target.x - 1) * 60 + this.getHistoryWidth(maxWidthOfCol, line.target.x) + maxWidthOfCol[line.target.x] / 2 + endOffset + 8;
                                    }
                                    endY = 40 + 60 * line.target.y  + line.target.y * 110 + 110 + (5 - endRowLine) * 10;
                                    self.fillLineWithArrow(
                                        context,
                                        startX,
                                        startY - startLength,
                                        Math.abs(startX - endX),
                                        startX - endX >= 0 ? 'rl' : 'lr',
                                        false,
                                        false
                                    );
                                    self.fillLineWithArrow(
                                        context,
                                        endX,
                                        endY,
                                        endY - (40 + 60 * line.target.y  + line.target.y * 110 + 110),
                                        'bt',
                                        true,
                                        false 
                                    );
                                } else {
                                    let startX, startY, endX, endY;
                                    startX = 223 + (line.source.x - 1) * 60 + this.getHistoryWidth(maxWidthOfCol, line.source.x) + maxWidthOfCol[line.source.x] / 2 + startOffset + 8;
                                    startY = 40 + 60 * line.source.y  + line.source.y * 110;
                                    self.fillLineWithArrow(context, startX, startY, startLength, 'bt', false, false);
                                    if(line.target.x === 1) {
                                        endX = 193 + (line.target.x - 1) * 60 + 15 + endOffset;
                                    } else {
                                        endX = 223 + (line.target.x - 1) * 60 + this.getHistoryWidth(maxWidthOfCol, line.target.x) + maxWidthOfCol[line.target.x] / 2 + endOffset + 8;
                                    }
                                    endY = 40 + 60 * line.target.y  + line.target.y * 110 + 110 + (5 - endRowLine) * 10;
                                    let halfLength;
                                    if(line.source.x > line.target.x) {
                                        if(line.target.x === 1) {
                                            halfLength = startX - endX + endOffset - 15 - (colLine + 1) * 15;
                                        } else {
                                            halfLength = startX - endX - maxWidthOfCol[line.target.x] / 2 + endOffset - 8 - (colLine + 1) * 15;
                                        }
                                    } else if(line.source.x === line.target.x) {
                                        halfLength = maxWidthOfCol[line.source.x] / 2 + 8 + 60 - (colLine + 1) * 15;
                                    } else {
                                        halfLength = endX - startX - maxWidthOfCol[line.target.x] / 2 - endOffset - 8 - 60 + (colLine + 1) * 15;
                                    }
                                    self.fillLineWithArrow(
                                        context,
                                        startX,
                                        startY - startLength,
                                        halfLength,
                                        startX - endX >= 0 ? 'rl' : 'lr',
                                        false,
                                        false
                                    );
                                    self.fillLineWithArrow(
                                        context,
                                        startX - endX >= 0 ? startX - halfLength : startX + halfLength,
                                        startY - startLength,
                                        startY - startLength - endY,
                                        'bt',
                                        false,
                                        false
                                    );
                                    self.fillLineWithArrow(
                                        context,
                                        startX - endX >= 0 ? startX - halfLength : startX + halfLength,
                                        endY,
                                        line.source.x === line.target.x ? endX - startX + halfLength : Math.abs(startX - endX) - halfLength,
                                        startX - endX > 0 ? 'rl' : 'lr',
                                        false,
                                        false
                                    );
                                    self.fillLineWithArrow(
                                        context,
                                        endX,
                                        endY,
                                        endY - (40 + 60 * line.target.y  + line.target.y * 110 + 110),
                                        'bt',
                                        true,
                                        false 
                                    )
                                }
                            }
                            // 从上向下
                            if(start.substr(0,6) === 'bottom') {
                                startLength = 60 - (startRowLine + 1) * 10;
                                // 同行
                                if(line.source.y === line.target.y - 1) {
                                    let startX, startY, endX, endY;
                                    startX = 223 + (line.source.x - 1) * 60 + this.getHistoryWidth(maxWidthOfCol, line.source.x) + maxWidthOfCol[line.source.x] / 2 + startOffset + 8;
                                    startY = 40 + 60 * line.source.y  + line.source.y * 110 + 110;
                                    self.fillLineWithArrow(context, startX, startY, startLength, 'tb', false, false);
                                    if(line.target.x === 1) {
                                        endX = 193 + (line.target.x - 1) * 60 + 15 + endOffset;
                                    } else {
                                        endX = 223 + (line.target.x - 1) * 60 + this.getHistoryWidth(maxWidthOfCol, line.target.x) + maxWidthOfCol[line.target.x] / 2 + endOffset + 8;
                                    }
                                    endY = startY + startLength;
                                    self.fillLineWithArrow(
                                        context,
                                        startX,
                                        startY + startLength,
                                        Math.abs(startX - endX),
                                        startX - endX >= 0 ? 'rl' : 'lr',
                                        false,
                                        false
                                    );
                                    self.fillLineWithArrow(
                                        context,
                                        endX,
                                        endY,
                                        (40 + 60 * line.target.y  + line.target.y * 110) - endY,
                                        'tb',
                                        true,
                                        false 
                                    );
                                } else {
                                    let startX, startY, endX, endY;
                                    startX = 223 + (line.source.x - 1) * 60 + this.getHistoryWidth(maxWidthOfCol, line.source.x) + maxWidthOfCol[line.source.x] / 2 + startOffset + 8;
                                    startY = 40 + 60 * line.source.y  + line.source.y * 110 + 110;
                                    self.fillLineWithArrow(context, startX, startY, startLength, 'tb', false, false);
                                    if(line.target.x === 1) {
                                        endX = 193 + (line.target.x - 1) * 60 + 15 + endOffset;
                                    } else {
                                        endX = 223 + (line.target.x - 1) * 60 + this.getHistoryWidth(maxWidthOfCol, line.target.x) + maxWidthOfCol[line.target.x] / 2 + endOffset + 8;
                                    }
                                    endY = 40 + 60 * line.target.y  + line.target.y * 110 - (endRowLine + 1) * 10;
                                    let halfLength;
                                    if(line.source.x > line.target.x) {
                                        if(line.target.x === 1) {
                                            halfLength = startX - endX + endOffset - 15 - (colLine + 1) * 15;
                                        } else {
                                            halfLength = startX - endX - maxWidthOfCol[line.target.x] / 2 + endOffset - 8 - (colLine + 1) * 15;
                                        }
                                    } else if(line.source.x === line.target.x) {
                                        halfLength = maxWidthOfCol[line.source.x] / 2 + 8 + startOffset + 60 - (colLine + 1) * 15;
                                    } else {
                                        halfLength = endX - startX - maxWidthOfCol[line.target.x] / 2 - endOffset - 8 - 60 + (colLine + 1) * 15;
                                    }
                                    self.fillLineWithArrow(
                                        context,
                                        startX,
                                        startY + startLength,
                                        halfLength,
                                        startX - endX >= 0 ? 'rl' : 'lr',
                                        false,
                                        false
                                    );
                                    self.fillLineWithArrow(
                                        context,
                                        startX - endX >= 0 ? startX - halfLength : startX + halfLength,
                                        startY + startLength,
                                        endY - startY - startLength,
                                        'tb',
                                        false,
                                        false
                                    );
                                    self.fillLineWithArrow(
                                        context,
                                        startX - endX >= 0 ? startX - halfLength : startX + halfLength,
                                        endY,
                                        line.source.x === line.target.x ? endX - startX + halfLength : Math.abs(startX - endX) - halfLength,
                                        startX - endX > 0 ? 'rl' : 'lr',
                                        false,
                                        false
                                    );
                                    self.fillLineWithArrow(
                                        context,
                                        endX,
                                        endY,
                                        (40 + 60 * line.target.y  + line.target.y * 110) - endY,
                                        'tb',
                                        true,
                                        false 
                                    );
                                }
                            }
                        }
                    }
                });
            },
            showView: function () {
                var self = this;
                self.isPaymentScenarioViewOpen = true;
                self.getViewData;
                var canvas = d3.select("canvas")
                context = canvas.node().getContext("2d");
                context.font = '14px Microsoft Yahei';
                canvas.call(d3.zoom()
                    .scaleExtent([1 / 2, 4])
                    .on("zoom", self.zoomed));
                self.drawView(context);
            },
            closeDrawer: function() {
                this.isPaymentScenarioViewOpen = false;
            }
        },
        computed: {
            //当前偿付情景待选账户
            c_ScenarioNoAccounts: function () {
                var self = this;
                var noAccounts = [];
                var accountsCode = [];
                if (self.dataAccounts.length > 0) {
                    var accounts = JSON.parse(JSON.stringify(self.dataAccounts));
                    if (self.c_Scenario.HasAccounts && self.c_Scenario.HasAccounts.length > 0) {
                        $.each(self.c_Scenario.HasAccounts, function (i, v) {
                            accountsCode.push(v.Code);
                        });
                        $.each(accounts, function (i, v) {
                            if ($.inArray(v.Code, accountsCode) < 0) {
                                noAccounts.push(v);
                            }
                        });
                    } else {
                        noAccounts = accounts;
                    }
                }
                return noAccounts;
            },
            //当前偿付情景待选局部规则
            c_ScenarioNoLocalRules: function () {
                var noLocalRules = [];
                var self = this;
                var rulesCode = [];
                if (self.dataLocalRules.length > 0) {
                    var lRules = JSON.parse(JSON.stringify(self.dataLocalRules));
                    if (self.c_Scenario.HasLocalRules && self.c_Scenario.HasLocalRules.length > 0) {
                        $.each(self.c_Scenario.HasLocalRules, function (i, v) {
                            rulesCode.push(v.Code);
                        });
                        $.each(lRules, function (i, v) {
                            if ($.inArray(v.Code, rulesCode) < 0) {
                                noLocalRules.push(v);
                            }
                        });
                    } else {
                        noLocalRules = lRules;
                    }
                }
                if (self.ruleSearchQuery != '') {
                    noLocalRules = noLocalRules.filter(function (row) {
                        return row.DisplayName.indexOf(self.ruleSearchQuery) > -1
                    })
                    //if (noGlobalRules.length > 0) {
                    //    $(self.$refs.rule_tree_node).find('i').toggleClass(' fa-folder-open fa-folder')
                    //    $(self.$refs.rule_tree_node).find(".choosingBlobalRules").slideDown();
                    //}
                }
                return noLocalRules;
            },
            //filter_dataLocalRules:function(){
            //    var self = this;
            //    self.rule_tree.forEach(function (i) {
            //        self.c_ScenarioNoLocalRules.forEach(function (i2) {
            //            if (i.accountName == i2.Branch) {
            //                i.local_rules.push(i2)
            //            }
            //        });
            //    })
            //    return self.rule_tree
            //},
            //当前偿付情景待选全局规则
            c_ScenarioNoGlobalRules: function () {
                var self = this;
                var noGlobalRules = [];
                var rulesCode = [];
                if (self.dataGlobalRules.length > 0) {
                    var gRules = JSON.parse(JSON.stringify(self.dataGlobalRules));
                    if (self.c_Scenario.HasGlobalRules && self.c_Scenario.HasGlobalRules.length > 0) {
                        $.each(self.c_Scenario.HasGlobalRules, function (i, v) {
                            rulesCode.push(v.Code);
                        });
                        $.each(gRules, function (i, v) {
                            if ($.inArray(v.Code, rulesCode) < 0) {
                                noGlobalRules.push(v);
                            }
                        });
                    } else {
                        noGlobalRules = gRules;
                    }
                }
                return noGlobalRules;
            },
            data_rules_tree: function () {
                var self = this;
                var rulesRelateAccount = [];

                var filter_dataLocalRules = JSON.parse(JSON.stringify(self.dataLocalRules));
                var filter_dataGlobalRules = JSON.parse(JSON.stringify(self.dataGlobalRules));
                filter_dataLocalRules = self.fliterRuleData(filter_dataLocalRules, self.c_Scenario.HasAccounts, self.ruleSearchQuery)
                filter_dataGlobalRules = self.fliterRuleData(filter_dataGlobalRules, self.c_Scenario.HasAccounts, self.ruleSearchQuery)

                //刷新后要根据已选的规则中遍历出哪些是一次性规则，反过来更改filter_dataGlobalRules，filter_dataLocalRules的一次性规则used属性，
                //因为filter_dataGlobalRules，filter_dataLocalRules是不作保存的
                if (self.c_Scenario.HasGlobalRules) {
                    self.c_Scenario.HasGlobalRules.forEach(function (i) {
                        if (i.IsRepeat == '0') {
                            filter_dataGlobalRules.forEach(function (i2) {
                                if (i2.Code == i.Code) i2.used = true;
                            })
                        }
                    })
                }
                if (self.c_Scenario.Levels) {
                    self.c_Scenario.Levels.forEach(function (i) {
                        if (i.Elements.length > 0) {
                            i.Elements.forEach(function (i2) {
                                if (i2.IsRepeat == '0') {
                                    filter_dataLocalRules.forEach(function (i3) {
                                        if (i3.Code == i2.Code) {
                                            i3.used = true
                                        };
                                    })
                                }
                            })
                        }
                    })
                }
                //将筛选出来的规则填充到rule_tree
                self.rule_tree.forEach(function (i) {
                    i.local_rules = [];
                    i.global_rules = [];
                    filter_dataLocalRules.forEach(function (i2) {
                        if (i.accountName == i2.Branch) {
                            i.local_rules.push(i2)
                        }
                    });
                    filter_dataGlobalRules.forEach(function (i3) {
                        if (i.accountName == i3.Branch) {
                            i.global_rules.push(i3)
                        }
                    });
                })
                return self.rule_tree
            },
            //当前点击编辑对象的待选元素
            c_ObjNoEles: function () {
                var self = this;
                var hasEleNames = [];
                var noElements = [];
                if (self.c_ObjHasEles.length > 0) {
                    $.each(self.c_ObjHasEles, function (i, v) {
                        if ($.inArray(v.Name, hasEleNames) < 0) {
                            hasEleNames.push(v.Name);
                        }
                    });
                }
                if (self.c_ScenarioEles.length > 0) {
                    if (self.c_ObjHasEles.length > 0) {
                        $.each(self.c_ScenarioEles, function (i, v) {
                            if ($.inArray(v.Name, hasEleNames) < 0) {
                                noElements.push(v);
                            }
                        });
                    } else {
                        noElements = self.c_ScenarioEles;
                    }
                }
                return noElements;
            },
            //待选触发条件
            SelectTriggerCondition:function(){
                var self = this;
                var Select = [];
                var noSelect = [];
                if (self.c_ObjTriggerConditionOptionsEX.length > 0) {
                    $.each(self.c_ObjTriggerConditionOptionsEX, function (i, v) {
                        if ($.inArray(v.FormulaValue, Select) < 0) {
                            Select.push(v.FormulaValue);
                        }
                    });
                }
                if (self.c_ObjTriggerConditionOptions.length > 0) {
                    $.each(self.c_ObjTriggerConditionOptions, function (i, v) {
                        if ($.inArray(v.FormulaValue, Select) < 0) {
                            noSelect.push(v);
                        }
                    });
                } else {
                    noElemennoSelectts = self.c_ObjTriggerConditionOptions;
                }
                return noSelect;
            },
            //全局规则空列表标识
            emptyHasGR: function () {
                var self = this;
                var flag = false;
                if (self.dataGlobalRules.length > 0) {
                    if (self.c_Scenario.HasGlobalRules && self.c_Scenario.HasGlobalRules.length == 0) flag = true;
                }

                return flag;
            },
            //账户空列表标识
            emptyAccountsList: function () {
                var self = this;
                var flag = false;
                if (self.c_Scenario.HasAccounts) {
                    if (self.c_Scenario.HasAccounts.length == 0) flag = true;
                }

                return flag;
            },
            //可选元素空列表标识
            emptySelectableBondFees: function () {
                var self = this;
                var flag = false;
                if (self.c_Scenario.SelectableBondFees) {
                    if (self.c_Scenario.SelectableBondFees.length == 0) flag = true;
                }


                return flag;
            },
            isNodata: function () {
                var flag = true
                if (this.paymentScenarioList.length == 0) {
                    flag = true;
                } else {
                    flag = false;
                }

                return flag
            },
            c_SourceAndTargetOptions: function () {
                var self = this, arr = [{ 'Value': '', 'Text': '-- 请选择 --' }];
                $.each(self.c_Scenario.HasAccounts, function (i, v) {
                    arr.push({ 'Value': v.Code, 'Text': v.DisplayName });
                })
                return arr.concat(self.bondFeesOptions);
            },

            //中间区域布局
            centerLayout: function () {
                if (this.flexLayoutData.left && this.flexLayoutData.right) {
                    return 'cl-6'
                } else if (!this.flexLayoutData.left && !this.flexLayoutData.right) {
                    return 'col-12'
                } else if (this.flexLayoutData.left == true && this.flexLayoutData.right == false) {
                    return 'cl-84'
                } else {
                    return 'col-9'

                }
            },
            //获取视图初始数据
            getViewData: function () {
                var self = this;
                var viewData = [{
                    Code: 'TrustPlanAccount_Reserve_AvailableAmt',
                    DisplayName: '信托储备账户',
                    dataList: []
                }, {
                    Code: 'TrustPlanAccount_Interest_AvailableAmt',
                    DisplayName: '收入分账户',
                    dataList: [],
                    dataInList: []
                },
                    {
                        Code: 'TrustPlanAccount_Principal_AvailableAmt',
                        DisplayName: '本金分账户',
                        dataList: []
                    },
                    {
                        Code: 'TrustPlanAccount_Total_AvailableAmt',
                        DisplayName: '信托收款账户',
                        dataList: []
                    }]//视图数据源
                //填充全局规则
                $.each(viewData, function (i, v) {
                    $.each(self.c_Scenario.HasGlobalRules, function (index, item) {
                        if (v.Code == item.Source) {
                            var obj = {
                                Name: '',
                                DisplayName: '',
                                Discraption: ''
                            }
                            obj.Name = item.Name;
                            obj.DisplayName = item.DisplayName;
                            v.dataList.push(obj)
                        }
                    })
                    var globleRuleStr = ''
                    //多条全局规则需要拼在一个node里面
                    if (v.dataList.length > 1) {
                        $.each(v.dataList, function (i, v2) {
                            globleRuleStr = globleRuleStr + '\n' + (i + 1) + '.' + v2.DisplayName
                        })
                        v.dataList[0].DisplayName = globleRuleStr;
                        v.dataList.splice(1, v.dataList.length - 1)
                    }
                });
                //填充费用元素
                $.each(viewData, function (index, item) {
                    $.each(self.c_Scenario.Levels, function (index2, item2) {
                        if (item2.Elements.length > 0) {
                            var obj = {
                                Name: index + item2.Elements[0].Name + index2,
                                DisplayName: '',
                                InCallName: "",
                                Discraption: '',
                                CashFlowDirection: ''
                            }
                            $.each(item2.Elements, function (index3, item3) {

                                obj.CashFlowDirection = item3.CashFlowDirection;
                                if (item.Code == item3.Source) {
                                    if (item3.Name == 'Rule_PrincipalAccount_PayLimit' || item3.Name == 'Rule_InterestAccount_PayLimit' || item3.Name == 'Rule_TrustPlanAccount_PayLimit') {

                                        var textObj = $.grep(self.c_SourceAndTargetOptions, function (option) {
                                            return option.Value == item3.Source
                                        })
                                        var textObj2 = $.grep(self.getAllocationRuleOptions(item3, index2), function (option2) {
                                            return option2.Value == item3.AllocationRuleOfSameLevel
                                        })
                                        if (textObj2[0] && textObj2[0].Value == '') {
                                            textObj2[0].Text = '按应付金额'
                                        }
                                        var tmpStr = "<p class='tips-title'>" + item3.DisplayName + "</p><p>可支付数额 : " + item3.Amount + "; </p><p>可用资金占比 : " + item3.Percentage + ";</p><p>同级分配 : " + textObj2[0].Text + ";</p><p> 来源 : " + textObj[0].Text + ";</p>"

                                        //tmpStr.format(item3.Amount, item3.Percentage, item3.AllocationRuleOfSameLevel, item3.Source, item3.DisplayName)
                                        obj.Discraption = tmpStr
                                    } else if (item3.Name != 'Rule_PrincipalAccount_PayLimit' && item3.CashFlowDirection == "0") {
                                        obj.DisplayName = obj.DisplayName + "\n" + item3.DisplayName
                                    } else if (item3.Name != 'Rule_PrincipalAccount_PayLimit' && item3.CashFlowDirection == "1") {
                                        obj.InCallName = obj.InCallName + "\n" + item3.DisplayName
                                    }
                                }
                            })
                            if (obj.Discraption != '' || obj.DisplayName != '') {
                                if (obj.InCallName != '') {
                                    obj.DisplayName = "";
                                    obj.CashFlowDirection = "1"
                                    item.dataInList.push(obj)
                                } else {
                                    item.dataList.push(obj)
                                }
                            }
                        }
                    })
                });
                return viewData

            },

        },
        watch: {
            'c_Scenario.SelectableBondFees': function () {
                var self = this;
                if (self.c_Scenario.SelectableBondFees) {
                    self.c_Scenario.SelectableBondFees.forEach(function (k) {
                        k.Source = "";
                    });
                }
            },
            'ruleSearchQuery': function () {
                var self = this;

            },
        }
    });
});