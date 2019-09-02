/// <reference path="common/js/DevExtreme/dx.web.js" />
/// <reference path="common/js/DevExtreme/globalize/message.min.js" />
define(function (require) {
    var $ = require('jquery');
    var jQuery = $;
    require('devExtreme.dx.all');
    require('devExtreme.jszip.min');
    var vue = require('Vue2');
    //require('supplemental');
    //require('globalize');
    //require('number');
    //require('date');
    //require('cldrs');
    //require('event');
    var GlobalVariable = require('globalVariable');
    var common = require('common');
    require('jquery.cookie');
    var webProxy = require('gs/webProxy');
    var AppGlobal = require('App.Global');
    var GSDialog = require("gsAdminPages")
    require('jquery.localizationTool');
    webStorage = require('gs/webStorage');
    require("app/projectStage/js/project_interface");
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


            'id:DateBtn': {
                'en_GB': 'Submit'
            },
            'id:time1': {
                'en_GB': 'Start time:'
            },
            'id:date1': {
                'en_GB': 'Import date:'
            },
            'id:DateReport': {
                'en_GB': 'Submit'
            },
            'id:ListTrustCode': {
                'en_GB': 'Submit'
            },
            'id:name1': {
                'en_GB': 'Management Name:'
            },
            'id:reportService': {
                'en_GB': 'Submit'
            },
            'id:name2': {
                'en_GB': 'Management Name:'
            },
            'id:time2': {
                'en_GB': 'Start time:'
            },
            'id:report1': {
                'en_GB': 'Asset Service Report'
            },
            'id:Bclub': {
                'en_GB': 'Financing account B end'
            },
            'id:Cclub': {
                'en_GB': 'Financing account C end'
            },
            'id:listB': {
                'en_GB': 'The B side of the table financing table'
            },
            'id:listC': {
                'en_GB': 'The C side of the table financing table'
            },
            'id:tab1': {
                'en_GB': 'Profit and loss amortization'
            },
            'id:tab2': {
                'en_GB': 'Monthly knot'
            },
            'id:tab3': {
                'en_GB': 'Capital cost'
            },
            'id:tab4': {
                'en_GB': 'Off balance sheet fluidity'
            },
            'id:tab5': {
                'en_GB': 'Capital MI_ assets'
            },
            'id:plan1': {
                'en_GB': 'Capital department MI_ management plan'
            },
            'id:plan2': {
                'en_GB': 'Capital MI_ assets'
            },
            'id:plan3': {
                'en_GB': 'Capital department MI_ management plan'
            },
            'id:tab6': {
                'en_GB': 'Transfer payment'
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
        langx.tab1 = "Asset Service Report";
        langx.tab2 = "Table financing";
        langx.tab3 = "Profit and loss amortization";
        langx.tab4 = "Monthly knot";
        langx.tab5 = "Capital cost";
        langx.tab6 = "Off balance sheet fluidity";
        langx.tab7 = "Finance Department MI";
        langx.tab8 = "Transfer payment";

        langx.tab9 = "Surplus loan balance at the beginning of the period";
        langx.tab10 = "Final remaining loan balance";
        langx.tab11 = "Payment of the principal";
        langx.tab12 = "Period compensation";
        langx.tab13 = "Real income penalty, etc.";

        langx.tab14 = "Compensatory class";
        langx.tab15 = "Doubtful class";   
        langx.tab16 = "Overdue class";
        langx.tab17 = "Concern class";
        langx.tab18 = "Loss class";
        langx.tab19 = "Normal class";
        langx.tab20 = "Secondary class";

        langx.tab21 = "Asset Service Report_";
        langx.tab22 = "Name of management plan";
        langx.tab23 = "Start time";
        langx.tab24 = "End time";
        langx.tab25 = "Table name";
        langx.tab26 = "Attribute";
        langx.tab27 = "Amount of money";
        langx.tab28 = "Number of pens";
        langx.tab29 = "Occupation ratio";

        langx.tab30 = "Asset service report _five level classification and overdue compensation_";
        langx.tab31 = "Name of management plan";
        langx.tab32 = "Normal amount";
        langx.tab33 = "The amount of concern";
        langx.tab34 = "Subprime amount";
        langx.tab35 = "Dubious amount";
        langx.tab36 = "Loss sum";
        langx.tab37 = "Normal pen class number";
        langx.tab38 = "Concern class pen number";
        langx.tab39 = "Secondary pen class number";
        langx.tab40 = "Dubious pen number";
        langx.tab41 = "Loss class pen number";
        langx.tab42 = "Overdue principal balance";
        langx.tab43 = "Number of overdue pens";
        langx.tab44 = "Compensatory principal balance";
        langx.tab45 = "Compensatory pen number";
        langx.tab46 = "Percentage of normal class";
        langx.tab47 = "Percentage of concerns";
        langx.tab48 = "Secondary class percentage";
        langx.tab49 = "Percentage of suspicious classes";
        langx.tab50 = "Percentage of loss class";
        langx.tab51 = "Overdue proportion";
        langx.tab52 = "Compensatory ratio";

        langx.tab53 = "The B end of the table financing table_";
        langx.tab54 = "Name of management plan";
        langx.tab55 = "Way";
        langx.tab56 = "Attribution of legal person";
        langx.tab57 = "Source of funds";
        langx.tab58 = "Channel dealer";
        langx.tab59 = "Public and private";
        langx.tab60 = "Out of table scale";
        langx.tab61 = "Packet day";
        langx.tab62 = "Balance of real assets";
        langx.tab63 = "Interest on the day of closure";
        langx.tab64 = "Profit and loss out of the table";
        langx.tab65 = "Date of appearance";
        langx.tab66 = "Due date";
        langx.tab67 = "Interest rate base";
        langx.tab68 = "Packing price (%)";
        langx.tab69 = "Underlying assets";
        langx.tab70 = "The system in which it is located";
        langx.tab71 = "Collection mode";
        langx.tab72 = "Cash / return day";
        langx.tab73 = "Whether or not the collection is collected and collected";
        langx.tab74 = "Whether or not to generate a collection of records";
        langx.tab75 = "Initial aggregate amount under line";
        langx.tab76 = "Among the principal";
        langx.tab77 = "Including interest";
        langx.tab78 = "One of The penalty";

        langx.tab79 = "The C end of the table financing table_";
        langx.tab80 = "Name of management plan";
        langx.tab81 = "Attribution of legal person";
        langx.tab82 = "Source of funds";
        langx.tab83 = "Channel dealer";
        langx.tab84 = "New/continued connection";
        langx.tab85 = "Continued management plan";
        langx.tab86 = "Underlying assets";
        langx.tab87 = "The system in which it is located";
        langx.tab88 = "Primordial period of underlying assets";
        langx.tab89 = "The remainder of the schedule";
        langx.tab90 = "This time limit";
        langx.tab91 = "Remainder of the table";
        langx.tab92 = "Management plan for continued ta";
        langx.tab93 = "Excess income";
        langx.tab94 = "Out of table scale";
        langx.tab95 = "Date of establishment of management plan";
        langx.tab96 = "Management plan expiration date";
        langx.tab97 = "Surviving period";
        langx.tab98 = "Capital price (%)";
        langx.tab99 = "Loan interest";
        langx.tab100 = "Channel rate";
        langx.tab101 = "Channel fee";
        langx.tab102 = "Trusteeship rate";
        langx.tab103 = "Trusteeship fee";
        langx.tab104 = "Financial care fee";
        langx.tab105 = "Total amount of cash due";
        langx.tab106 = "Expiry date";
        langx.tab107 = "Small loan amount due ";

        langx.tab108 = "Profit and loss amortization_";
        langx.tab109 = "Name of management plan";
        langx.tab110 = "Year";
        langx.tab111 = "Month";
        langx.tab112 = "Day";
        langx.tab113 = "Out of table scale";
        langx.tab114 = "Balance of real assets";
        langx.tab115 = "Interest on the day of closure";
        langx.tab116 = "Fair value adjustment";
        langx.tab117 = "Current principal balance after adjustment";
        langx.tab118 = "Profit and loss out of the table";
        langx.tab119 = "Excess income";
        langx.tab120 = "Total profit and loss";
        langx.tab121 = "Amortized amount";

        langx.tab122 = "Monthly knot_";
        langx.tab123 = "Out of the table assets";
        langx.tab124 = "End time";
        langx.tab125 = "Legal person subject";
        langx.tab126 = "Out table state";
        langx.tab127 = "Amount of money out of the table";
        langx.tab128 = "Balance of asset loan";
        langx.tab129 = "Interest income";

        langx.tab130 = "C end of capital cost_";
        langx.tab131 = "Asset planning identification";
        langx.tab132 = "B/C";
        langx.tab133 = "Legal person name";
        langx.tab134 = "Day of establishment";
        langx.tab135 = "Honour day";
        langx.tab136 = "Term";
        langx.tab137 = "Interest rate (%)";
        langx.tab138 = "Interest payable";
        langx.tab139 = "Payable to the principal";
        langx.tab140 = "Channel fee";
        langx.tab141 = "Trusteeship fee";
        langx.tab142 = "Financial care fee";
        langx.tab143 = "Cashing and payment";
        langx.tab144 = "Daily capital cost";
        langx.tab145 = "Annual capital cost rate";
        langx.tab146 = "Capital cost";
        langx.tab147 = "Amortization of days";
        langx.tab148 = "Capital conversion";

        langx.tab149 = "B end of capital cost_";
        langx.tab150 = "Asset planning identification";
        langx.tab151 = "B/C";
        langx.tab152 = "Legal person name";
        langx.tab153 = "Date of appearance";
        langx.tab154 = "Due date";
        langx.tab155 = "Date of payment";
        langx.tab156 = "Term";
        langx.tab157 = "Interest";
        langx.tab158 = "Variable cost";
        langx.tab159 = "Fixed cost";
        langx.tab160 = "Total cost of the current period";
        langx.tab161 = "Date of amortization";
        langx.tab162 = "Amount of amortization";

        langx.tab163 = "Out of watch liquidity_";
        langx.tab164 = "product type";
        langx.tab165 = "Name";
        langx.tab166 = "Anticipation or reality";
        langx.tab167 = "Collection date";
        langx.tab168 = "Principal";

        langx.tab169 = "Capital department MI_ assets_";
        langx.tab170 = "Legal person";
        langx.tab171 = "Asset type";
        langx.tab172 = "product type";
        langx.tab173 = "Capital model";
        langx.tab174 = "Deadline";
        langx.tab175 = "B/C";
        langx.tab176 = "New/continued connection";
        langx.tab177 = "New number of pens";
        langx.tab178 = "New table amount";
        langx.tab179 = "Amount of recovery during the period";
        langx.tab180 = "Capital balance of assets outside the final balance sheet";

        langx.tab181 = "Finance Department MI_ management plan_";
        langx.tab182 = "Legal person";
        langx.tab183 = "Asset type";
        langx.tab184 = "Product type";
        langx.tab185 = "Term";
        langx.tab186 = "B/C";
        langx.tab187 = "New/continued connection";
        langx.tab188 = "New management plan";
        langx.tab189 = "Additional capital management plan";
        langx.tab190 = "Final stock management plan";
        langx.tab191 = "Final stock management plan balance";

        langx.tab192 = "Transfer payment_";
        langx.tab193 = "Name of management plan";
        langx.tab194 = "Date of payment";
        langx.tab195 = "Number of remaining days";
        langx.tab196 = "Channel fee";
        langx.tab197 = "Trusteeship fee";
        langx.tab198 = "Financial care fee";
        langx.tab199 = "Variable cost";
        langx.tab200 = "Fixed cost";
        langx.tab201 = "Interest";
        langx.tab202 = "Principal";
        langx.tab203 = "Priority residual principal";
        langx.tab204 = "Sandwich class residual principal";
        langx.tab205 = "Residual principal of inferior rank";
        langx.tab206 = "Collection date";
        langx.tab207 = "Expected recovery";
        langx.tab208 = "Actual collection of funds";
        langx.tab209 = "Actual principal";
        langx.tab210 = "Real income";
        langx.tab211 = "Real penalty";
        langx.tab212 = 'Actual advance payment formalities'
    } else {
        langx.tab1 = "资产服务报告";
        langx.tab2 = "出表融资台账";
        langx.tab3 = "损益摊销";
        langx.tab4 = "月结";
        langx.tab5 = "资金成本";
        langx.tab6 = "表外流动性";
        langx.tab7 = "资金部MI";
        langx.tab8 = "转付明细";

        langx.tab9 = "期初剩余贷款余额";
        langx.tab10 = "期末剩余贷款余额";
        langx.tab11 = "期间实收本金";
        langx.tab12 = "期间代偿";
        langx.tab13 = "期间实收利罚等";

        langx.tab14 = "代偿类";
        langx.tab15 = "可疑类";
        langx.tab16 = "逾期类";
        langx.tab17 = "关注类";
        langx.tab18 = "损失类";
        langx.tab19 = "正常类";
        langx.tab20 = "次级类";

        langx.tab21 = "资产服务报告_";
        langx.tab22 = "资管计划名称";
        langx.tab23 = "开始时间";
        langx.tab24 = "结束时间";
        langx.tab25 = "表名";
        langx.tab26 = "属性";
        langx.tab27 = "金额";
        langx.tab28 = "笔数";
        langx.tab29 = "占比";

        langx.tab30 = "资产服务报告_五级分类表和逾期代偿_";
        langx.tab31 = "资管计划名称";
        langx.tab32 = "正常类金额";
        langx.tab33 = "关注类金额";
        langx.tab34 = "次级类金额";
        langx.tab35 = "可疑类金额";
        langx.tab36 = "损失类金额";
        langx.tab37 = "正常类笔数";
        langx.tab38 = "关注类笔数";
        langx.tab39 = "次级类笔数";
        langx.tab40 = "可疑类笔数";
        langx.tab41 = "损失类笔数";
        langx.tab42 = "逾期本金余额";
        langx.tab43 = "逾期笔数";
        langx.tab44 = "代偿本金余额";
        langx.tab45 = "代偿笔数";
        langx.tab46 = "正常类百分比";
        langx.tab47 = "关注类百分比";
        langx.tab48 = "次级类百分比";
        langx.tab49 = "可疑类百分比";
        langx.tab50 = "损失类百分比";
        langx.tab51 = "逾期占比";
        langx.tab52 = "代偿占比";

        langx.tab53 = "出表融资台账B端_";
        langx.tab54 = "资管计划名称";
        langx.tab55 = "Way";
        langx.tab56 = "归属法人";
        langx.tab57 = "资金源";
        langx.tab58 = "通道商";
        langx.tab59 = "公私";
        langx.tab60 = "出表规模";
        langx.tab61 = "封包日";
        langx.tab62 = "封包日实际资产余额";
        langx.tab63 = "封包日应收利息";
        langx.tab64 = "出表损益";
        langx.tab65 = "出表日期";
        langx.tab66 = "到期日";
        langx.tab67 = "计息基数";
        langx.tab68 = "打包价(%)";
        langx.tab69 = "底层资产";
        langx.tab70 = "所在系统";
        langx.tab71 = "归集方式";
        langx.tab72 = "兑付/归集日";
        langx.tab73 = "是否实收归集";
        langx.tab74 = "是否生成归集记录";
        langx.tab75 = "首次线下归集金额";
        langx.tab76 = "其中本金";
        langx.tab77 = "其中利息";
        langx.tab78 = "其中罚息";

        langx.tab79 = "出表融资台账C端_";
        langx.tab80 = "资管计划名称";
        langx.tab81 = "归属法人";
        langx.tab82 = "资金源";
        langx.tab83 = "通道商";
        langx.tab84 = "新做/续接";
        langx.tab85 = "被续接资管计划";
        langx.tab86 = "底层资产";
        langx.tab87 = "所在系统";
        langx.tab88 = "底层资产原始期限";
        langx.tab89 = "本次出表前剩余期限";
        langx.tab90 = "本次出表期限";
        langx.tab91 = "出表后剩余期限";
        langx.tab92 = "续接ta的资管计划";
        langx.tab93 = "超额收益";
        langx.tab94 = "出表规模";
        langx.tab95 = "资管计划建立日";
        langx.tab96 = "资管计划到期日";
        langx.tab97 = "续存期";
        langx.tab98 = "资金价格(%)";
        langx.tab99 = "借款利息";
        langx.tab100 = "通道费率";
        langx.tab101 = "通道费";
        langx.tab102 = "托管费率";
        langx.tab103 = "托管费";
        langx.tab104 = "财顾费";
        langx.tab105 = "到期资金端兑付总额";
        langx.tab106 = "到期续接金额";
        langx.tab107 = "到期小贷支付金额";

        langx.tab108 = "损益摊销_";
        langx.tab109 = "资管计划名称";
        langx.tab110 = "年";
        langx.tab111 = "月";
        langx.tab112 = "日";
        langx.tab113 = "出表规模";
        langx.tab114 = "封包日实际资产余额";
        langx.tab115 = "封包日应收利息";
        langx.tab116 = "公允价值调整";
        langx.tab117 = "调整后的当前本金余额";
        langx.tab118 = "出表损益";
        langx.tab119 = "超额收益";
        langx.tab120 = "合计损益";
        langx.tab121 = "摊销金额";

        langx.tab122 = "月结_";
        langx.tab123 = "出表资产";
        langx.tab124 = "结束时间";
        langx.tab125 = "法人主体";
        langx.tab126 = "出表状态";
        langx.tab127 = "出表金额";
        langx.tab128 = "出表资产贷款余额";
        langx.tab129 = "利息收入";

        langx.tab130 = "资金成本C端_";
        langx.tab131 = "资产计划标识";
        langx.tab132 = "B/C";
        langx.tab133 = "法人名称";
        langx.tab134 = "成立日";
        langx.tab135 = "兑付日";
        langx.tab136 = "期限";
        langx.tab137 = "利率(%)";
        langx.tab138 = "应付利息";
        langx.tab139 = "应付本金";
        langx.tab140 = "通道费";
        langx.tab141 = "托管费";
        langx.tab142 = "财顾费";
        langx.tab143 = "兑付总计";
        langx.tab144 = "日资金成本";
        langx.tab145 = "年化资金成本率";
        langx.tab146 = "资金成本";
        langx.tab147 = "摊还天数";
        langx.tab148 = "资本折算";

        langx.tab149 = "资金成本B端_";
        langx.tab150 = "资产计划标识";
        langx.tab151 = "B/C";
        langx.tab152 = "法人名称";
        langx.tab153 = "出表日期";
        langx.tab154 = "到期日";
        langx.tab155 = "兑付日期";
        langx.tab156 = "期限";
        langx.tab157 = "利息";
        langx.tab158 = "变动费用";
        langx.tab159 = "固定费用";
        langx.tab160 = "当期总成本";
        langx.tab161 = "摊还日期";
        langx.tab162 = "摊还金额";

        langx.tab163 = "表外流动性_";
        langx.tab164 = "产品类型";
        langx.tab165 = "名称";
        langx.tab166 = "预期或实际";
        langx.tab167 = "归集日期";
        langx.tab168 = "本金";

        langx.tab169 = "资金部MI_资产_";
        langx.tab170 = "法人";
        langx.tab171 = "资产类型";
        langx.tab172 = "产品类型";
        langx.tab173 = "资金模式";
        langx.tab174 = "出表期限";
        langx.tab175 = "B/C";
        langx.tab176 = "新做/续接";
        langx.tab177 = "新出表笔数";
        langx.tab178 = "新出表金额";
        langx.tab179 = "期间回收金额";
        langx.tab180 = "期末表外资产本金余额";

        langx.tab181 = "资金部MI_资管计划_";
        langx.tab182 = "法人";
        langx.tab183 = "资产类型";
        langx.tab184 = "产品类型";
        langx.tab185 = "期限";
        langx.tab186 = "B/C";
        langx.tab187 = "新做/续接";
        langx.tab188 = "新增资管计划数";
        langx.tab189 = "新增资管计划金额";
        langx.tab190 = "期末存量资管计划数";
        langx.tab191 = "期末存量资管计划余额";

        langx.tab192 = "转付明细_";
        langx.tab193 = "资管计划名称";
        langx.tab194 = "兑付日期";
        langx.tab195 = "续存天数";
        langx.tab196 = "通道费";
        langx.tab197 = "托管费";
        langx.tab198 = "财顾费";
        langx.tab199 = "变动费用";
        langx.tab200 = "固定费用";
        langx.tab201 = "利息";
        langx.tab202 = "本金";
        langx.tab203 = "优先级剩余本金";
        langx.tab204 = "夹层级剩余本金";
        langx.tab205 = "劣后级剩余本金";
        langx.tab206 = "归集日期";
        langx.tab207 = "预期回收";
        langx.tab208 = "实际归集资金";
        langx.tab209 = "实际本金";
        langx.tab210 = "实际收益";
        langx.tab211 = "实际罚息";
        langx.tab212 = '实际提前还款手续费'

    }
    //<script type="text/javascript" src="common/js/jquery-1.12.1.min.js"></script>
    //<script type="text/javascript" src="common/js/DevExtreme/jszip.min.js"></script>
    //<script type="text/javascript" src="common/js/DevExtreme/dx.web.js"></script>
    //<script type="text/javascript" src="common/js/DevExtreme/globalize.min.js"></script>
    //<script type="text/javascript" src="common/js/DevExtreme/globalize/message.min.js"></script>
    //<script type="text/javascript" src="common/js/DevExtreme/globalize/number.min.js"></script>
    //<script type="text/javascript" src="common/js/DevExtreme/globalize/currency.min.js"></script>
    //<script type="text/javascript" src="common/js/DevExtreme/globalize/date.min.js"></script>
    //<script type="text/javascript" src="common/js/DevExtreme/cldr.min.js"></script>
    //<script type="text/javascript" src="common/js/DevExtreme/cldr/event.min.js"></script>
    //<script type="text/javascript" src="common/js/DevExtreme/cldr/supplemental.min.js"></script>
    //<script src="/TrustManagementService/Config/GlobalVariable.js" type="text/javascript"></script>
    //<script src="common/js/common.js" type="text/javascript"></script>
    //<script src="common/js/jquery.cookie.js"></script>
    function CallWCFSvc(svcUrl, isAsync, rqstType, fnCallback) {
        var sourceData;
        $.ajax({
            cache: false,
            type: rqstType,
            async: isAsync,
            url: svcUrl,
            dataType: "json",
            contentType: "application/xml;charset=utf-8",
            data: {},
            success: function (response) {
                if (typeof response == 'string')
                    sourceData = JSON.parse(response);
                else
                    sourceData = response;
                if (fnCallback) fnCallback(sourceData);
            },
            error: function (response) { alert('Error occursed while requiring the remote source data!'); }
        });

        if (!isAsync) { return sourceData; }
    }

    $(function () {
        var VueConfig = new vue({
            el: "#container",
            data: {
                frist: { "icon": "icon icon-file-word", "content": langx.tab1 },
                //menu: ['出表融资台账', '损益摊销', '月结', '资金成本', '表外流动性', '资金部MI', '转付明细'],
                menu: [{
                    "icon": "icon icon-cog-alt",
                    "content": langx.tab2
                }, {
                    "icon": "fa fa-dollar fa-fw",
                    "content": langx.tab3
                }, {
                    "icon": "icon icon-wenjian",
                    "content": langx.tab4
                }, {
                    "icon": "fa fa-gg fa-fw",
                    "content": langx.tab5
                }, {
                    "icon": "icon icon-data-science",
                    "content": langx.tab6
                }, {
                    "icon": "icon icon-chart-pie",
                    "content": langx.tab7
                }, {
                    "icon": "icon icon-chart-bar",
                    "content": langx.tab8
                }]

            }
        });
        var reportingObj = {

            getReport1: function () {
                $(".list_time_chose2").hide();
                $(".list_time_chose3").hide();
                $(".list_time_chose").hide();
                $(".list_time_chose4").show();
                $('.change_box_service .change_box_each').removeClass('change_box_each_active')
                $('.change_box_service .change_box_each:eq(0)').addClass('change_box_each_active')
            },
            getReport2: function () {
                $(".list_time_chose").hide();
                $(".list_time_chose3").hide();
                $(".list_time_chose2").hide();
                $(".list_time_chose4").hide();
                $('.change_box_taizhang .change_box_each2').removeClass('change_box_each_active')
                $('.change_box_taizhang .change_box_each2:eq(0)').addClass('change_box_each_active')
                this.getTrustInfoData();
            },
            getReport3: function () {
                $(".list_time_chose").hide();
                $(".list_time_chose2").hide();
                $(".list_time_chose3").show();
                $(".list_time_chose4").hide();
            },
            getReport4: function () {
                $(".list_time_chose2").hide();
                $(".list_time_chose3").hide();
                $(".list_time_chose").show();
                $(".list_time_chose4").hide();
                this.getAssetMonthlyData($("#selected-date2 input[type='hidden']").val(), $("#selected-date input[type='hidden']").val());
            },
            getReport5: function () {
                $(".list_time_chose").hide();
                $(".list_time_chose2").hide();
                $(".list_time_chose3").show();
                $(".list_time_chose4").hide();
            },
            getReport6: function () {
                $(".list_time_chose").hide();
                $(".list_time_chose3").hide();
                $(".list_time_chose2").show();
                $(".list_time_chose4").hide();
                this.getCashFlowByDayData($("#reportingDate input[type='hidden']").val());
            },
            getReport7: function () {
                $(".list_time_chose2").hide();
                $(".list_time_chose3").hide();
                $(".list_time_chose").show();
                $(".list_time_chose4").hide();
                $('.change_boxMI .change_box_each3').removeClass('change_box_each_active')
                $('.change_boxMI .change_box_each3:eq(0)').addClass('change_box_each_active')
                this.getCapitalMIAssetData($("#selected-date2 input[type='hidden']").val(), $("#selected-date input[type='hidden']").val());
            },
            getReport8: function () {
                $(".list_time_chose").hide();
                $(".list_time_chose3").hide();
                $(".list_time_chose2").show();
                $(".list_time_chose4").hide();
                this.getABSRepaymentDetailsData($("#reportingDate input[type='hidden']").val());
            },
            getAssetServiceReportData: function (startDate, endDate, TrustCode) {
                var Asset = [];
                var executeParam = { SPName: 'ReportView.usp_GetAssetService_AssetData', SQLParams: [] };
                executeParam.SQLParams.push({ Name: 'StartDate', Value: startDate, DBType: 'string' });
                executeParam.SQLParams.push({ Name: 'EndDate', Value: endDate, DBType: 'string' });
                executeParam.SQLParams.push({ Name: 'TrustCode', Value: TrustCode, DBType: 'string' });

                var executeParams = encodeURIComponent(JSON.stringify(executeParam));
                var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonGetExecute?connConfig=FinancialReporting&executeParams=" + executeParams;
                CallWCFSvc(serviceUrl, true, 'GET', function (data) {
                    if (data.length > 0) {
                        Asset.push(
                           {
                               "TrustName": data[0].TrustName, "tableType": '基础信息', "StartTime": data[0].StartTime, "EndTime": data[0].EndTime,
                               "Attribute": langx.tab9, "Count": data[0].OpenCounts, "Money": data[0].OpeningPrincipalBalance, "Percentage": '/'
                           },
                           {
                               "TrustName": data[0].TrustName, "tableType": '基础信息', "StartTime": data[0].StartTime, "EndTime": data[0].EndTime,
                               "Attribute": langx.tab10, "Count": data[0].CloseCounts, "Money": data[0].ClosePrincipalBalance, "Percentage": '/'
                           },
                           {
                               "TrustName": data[0].TrustName, "tableType": '基础信息', "StartTime": data[0].StartTime, "EndTime": data[0].EndTime,
                               "Attribute": langx.tab11, "Count": '-', "Money": data[0].ScheduledPrincipal, "Percentage": '/'
                           },
                           {
                               "TrustName": data[0].TrustName, "tableType": '基础信息', "StartTime": data[0].StartTime, "EndTime": data[0].EndTime,
                               "Attribute": langx.tab12, "Count": '-', "Money": data[0].ActualPrincipal, "Percentage": '/'
                           },
                           {
                               "TrustName": data[0].TrustName, "tableType": '基础信息', "StartTime": data[0].StartTime, "EndTime": data[0].EndTime,
                               "Attribute": langx.tab13, "Count": '-', "Money": data[0].ActualTotablFee, "Percentage": '/'
                           }
                       )

                    }
                    var executeParamAsset = { SPName: 'ReportView.usp_ClassificationCompensationData', SQLParams: [] };
                    executeParamAsset.SQLParams.push({ Name: 'StartDate', Value: startDate, DBType: 'string' });
                    executeParamAsset.SQLParams.push({ Name: 'EndDate', Value: endDate, DBType: 'string' });
                    executeParamAsset.SQLParams.push({ Name: 'TrustCode', Value: TrustCode, DBType: 'string' });

                    var executeParamAsset = encodeURIComponent(JSON.stringify(executeParamAsset));
                    var serviceUrlAsset = GlobalVariable.DataProcessServiceUrl + "CommonGetExecute?connConfig=FinancialReporting&executeParams=" + executeParamAsset;
                    CallWCFSvc(serviceUrlAsset, true, 'GET', function (dataAsset) {
                        if (dataAsset.length > 0) {
                            Asset.push(
                                {
                                    "TrustName": dataAsset[0].TrustName, "tableType": '五级分类', "StartTime": dataAsset[0].StartTime, "EndTime": dataAsset[0].EndTime,
                                    "Attribute": langx.tab14, "Count": dataAsset[0].CompensationLoanCount, "Money": dataAsset[0].CompensationPrincipal, "Percentage": dataAsset[0].CompensationPercentage
                                },
                                {
                                    "TrustName": dataAsset[0].TrustName, "tableType": '五级分类', "StartTime": dataAsset[0].StartTime, "EndTime": dataAsset[0].EndTime,
                                    "Attribute": langx.tab15, "Count": dataAsset[0].DoubtLoanCount, "Money": dataAsset[0].DoubtAmount, "Percentage": dataAsset[0].DoubtPercentage
                                },
                                {
                                    "TrustName": dataAsset[0].TrustName, "tableType": '五级分类', "StartTime": dataAsset[0].StartTime, "EndTime": dataAsset[0].EndTime,
                                    "Attribute": langx.tab16, "Count": dataAsset[0].InArrearsLoanCount, "Money": dataAsset[0].PrincipalInArrears, "Percentage": dataAsset[0].InArrearsPercentage
                                },
                                {
                                    "TrustName": dataAsset[0].TrustName, "tableType": '五级分类', "StartTime": dataAsset[0].StartTime, "EndTime": dataAsset[0].EndTime,
                                    "Attribute": langx.tab17, "Count": dataAsset[0].InterestLoanCount, "Money": dataAsset[0].InterestAmount, "Percentage": dataAsset[0].InterestPercentage
                                },
                                {
                                    "TrustName": dataAsset[0].TrustName, "tableType": '五级分类', "StartTime": dataAsset[0].StartTime, "EndTime": dataAsset[0].EndTime,
                                    "Attribute": langx.tab18, "Count": dataAsset[0].LossLoanCount, "Money": dataAsset[0].LossAmount, "Percentage": dataAsset[0].LossPercentage
                                },
                                {
                                    "TrustName": dataAsset[0].TrustName, "tableType": '五级分类', "StartTime": dataAsset[0].StartTime, "EndTime": dataAsset[0].EndTime,
                                    "Attribute": langx.tab19, "Count": dataAsset[0].NormalLoanCount, "Money": dataAsset[0].NormalAmount, "Percentage": dataAsset[0].NormalPercentage
                                },
                                {
                                    "TrustName": dataAsset[0].TrustName, "tableType": '五级分类', "StartTime": dataAsset[0].StartTime, "EndTime": dataAsset[0].EndTime,
                                    "Attribute": langx.tab20, "Count": dataAsset[0].SecondaryLoanCount, "Money": dataAsset[0].SecondaryAmount, "Percentage": dataAsset[0].SecondaryPercentage
                                }
                            )
                        }
                        $("#Asset").dxPivotGrid({
                            allowSortingBySummary: true,
                            allowSorting: true,
                            allowFiltering: true,
                            allowExpandAll: true,
                            MinHeight: 440,
                            showBorders: true,
                            showRowGrandTotals: false,
                            showColumnGrandTotals: false,
                            fieldChooser: {
                                enabled: true
                            },
                            scrolling: {
                                mode: "virtual"
                            },
                            "export": {
                                enabled: true,
                                fileName: Langx.tab21 + new Date().dateFormat("yyyy-MM-dd_hh:mm:ss")
                            },
                            dataSource: {
                                fields: [
                                    {
                                        caption: Langx.tab22,
                                        dataField: "TrustName",
                                        area: "row",
                                        showTotals: false,
                                        expanded: true,
                                    },
                                    {
                                        caption: Langx.tab23,
                                        dataField: "StartTime",
                                        area: "column",
                                        showTotals: false,
                                        expanded: true,
                                    },
                                    {
                                        caption: Langx.tab24,
                                        dataField: "EndTime",
                                        area: "column",
                                        showTotals: false,
                                        expanded: true,
                                    },
                                    {
                                        caption: Langx.tab25,
                                        dataField: "tableType",
                                        area: "row",
                                        showTotals: false,
                                        expanded: true,
                                    },
                                    {
                                        caption: Langx.tab26,
                                        width: 200,
                                        dataField: "Attribute",
                                        dataType: "string",
                                        summaryType: 'custom',
                                        calculateCustomSummary: function (options) {
                                            if (options.summaryProcess == 'start') {
                                                // 初始化
                                            }
                                            if (options.summaryProcess == 'calculate') {
                                                //修改 "totalValue" here
                                                options.totalValue = options.value;
                                            }
                                            if (options.summaryProcess == 'finalize') {
                                                // 最终结果 value to "totalValue" here
                                            }
                                        },
                                        area: "row"
                                    },
                                     {
                                         caption: Langx.tab27,
                                         dataField: "Money",
                                         dataType: "number",
                                         summaryType: "sum",
                                         format: { type: 'fixedPoint', precision: 2 },
                                         area: "data"
                                     },
                                    {
                                        caption: Langx.tab28,
                                        dataField: "Count",
                                        dataType: "string",
                                        summaryType: 'custom',
                                        calculateCustomSummary: function (options) {
                                            if (options.summaryProcess == 'start') {
                                                // 初始化
                                            }
                                            if (options.summaryProcess == 'calculate') {
                                                //修改 "totalValue" here
                                                options.totalValue = options.value;
                                            }
                                            if (options.summaryProcess == 'finalize') {
                                                // 最终结果 value to "totalValue" here
                                            }
                                        },
                                        area: "data"
                                    },

                                     {
                                         caption: Langx.tab29,
                                         dataField: "Percentage",
                                         dataType: "string",
                                         summaryType: 'custom',
                                         calculateCustomSummary: function (options) {
                                             if (options.summaryProcess == 'start') {
                                                 // 初始化
                                             }
                                             if (options.summaryProcess == 'calculate') {
                                                 //修改 "totalValue" here
                                                 options.totalValue = options.value;
                                             }
                                             if (options.summaryProcess == 'finalize') {
                                                 // 最终结果 value to "totalValue" here
                                             }
                                         },
                                         area: "data"
                                     }
                                ],
                                store: Asset
                            }
                        })
                    })
                    console.log(Asset)
                })

            },
            getClassificationCompensationData: function (startDate, endDate, TrustCode) {
                var ClassificationCompensation = [];
                var executeParamAsset = { SPName: 'ReportView.usp_ClassificationCompensationData', SQLParams: [] };
                executeParamAsset.SQLParams.push({ Name: 'StartDate', Value: startDate, DBType: 'string' });
                executeParamAsset.SQLParams.push({ Name: 'EndDate', Value: endDate, DBType: 'string' });
                executeParamAsset.SQLParams.push({ Name: 'TrustCode', Value: TrustCode, DBType: 'string' });

                var executeParamAsset = encodeURIComponent(JSON.stringify(executeParamAsset));
                var serviceUrlAsset = GlobalVariable.DataProcessServiceUrl + "CommonGetExecute?connConfig=FinancialReporting&executeParams=" + executeParamAsset;
                CallWCFSvc(serviceUrlAsset, true, 'GET', function (data) {
                    if (data.length > 0) {
                        ClassificationCompensation = data;
                    } else {
                        ClassificationCompensation = [];
                    }
                    $("#ClassificationCompensation").dxPivotGrid({
                        allowSortingBySummary: true,
                        allowSorting: true,
                        allowFiltering: true,
                        allowExpandAll: true,
                        MinHeight: 440,
                        showBorders: true,
                        showRowGrandTotals: false,
                        showColumnGrandTotals: false,
                        scrolling: {
                            mode: "virtual"
                        },
                        fieldChooser: {
                            enabled: true
                        },
                        "export": {
                            enabled: true,
                            fileName: langx.tab30 + new Date().dateFormat("yyyy-MM-dd_hh:mm:ss")
                        },
                        dataSource: {
                            fields: [
                                {
                                    caption: langx.tab31,
                                    width: 120,
                                    dataField: "TrustName",
                                    area: "row"
                                },
                                {
                                    caption: langx.tab32,
                                    dataField: "NormalAmount",
                                    dataType: "number",
                                    summaryType: "sum",
                                    format: { type: 'fixedPoint', precision: 2 },
                                    area: "data"
                                },
                                {
                                    caption: langx.tab33,
                                    dataField: "InterestAmount",
                                    dataType: "number",
                                    summaryType: "sum",
                                    format: { type: 'fixedPoint', precision: 2 },
                                    area: "data"
                                },
                                {
                                    caption: langx.tab34,
                                    dataField: "SecondaryAmount",
                                    dataType: "number",
                                    summaryType: "sum",
                                    format: { type: 'fixedPoint', precision: 2 },
                                    area: "data"
                                },
                                {
                                    caption: langx.tab35,
                                    dataField: "DoubtAmount",
                                    dataType: "number",
                                    summaryType: "sum",
                                    format: { type: 'fixedPoint', precision: 2 },
                                    area: "data"
                                },
                                {
                                    caption: langx.tab36,
                                    dataField: "LossAmount",
                                    dataType: "number",
                                    summaryType: "sum",
                                    format: { type: 'fixedPoint', precision: 2 },
                                    area: "data"
                                },
                                 {
                                     caption: langx.tab37,
                                     dataField: "NormalLoanCount",
                                     dataType: "number",
                                     summaryType: "sum",
                                     format: { type: 'fixedPoint', precision: 2 },
                                     area: "data"
                                 },
                                 {
                                     caption: langx.tab38,
                                     dataField: "InterestLoanCount",
                                     dataType: "number",
                                     summaryType: "sum",
                                     format: { type: 'fixedPoint', precision: 2 },
                                     area: "data"
                                 },
                                 {
                                     caption: langx.tab39,
                                     dataField: "SecondaryLoanCount",
                                     dataType: "number",
                                     summaryType: "sum",
                                     format: { type: 'fixedPoint', precision: 2 },
                                     area: "data"
                                 },
                                 {
                                     caption: langx.tab40,
                                     dataField: "DoubtLoanCount",
                                     dataType: "number",
                                     summaryType: "sum",
                                     format: { type: 'fixedPoint', precision: 2 },
                                     area: "data"
                                 },
                                 {
                                     caption: langx.tab41,
                                     dataField: "LossLoanCount",
                                     dataType: "number",
                                     summaryType: "sum",
                                     format: { type: 'fixedPoint', precision: 2 },
                                     area: "data"
                                 },
                                 {
                                     caption: langx.tab42,
                                     dataField: "PrincipalInArrears",
                                     dataType: "number",
                                     summaryType: "sum",
                                     format: { type: 'fixedPoint', precision: 2 },
                                     area: "data"
                                 },
                                 {
                                     caption: langx.tab43,
                                     dataField: "InArrearsLoanCount",
                                     dataType: "number",
                                     summaryType: "sum",
                                     format: { type: 'fixedPoint', precision: 2 },
                                     area: "data"
                                 },
                                 {
                                     caption: langx.tab44,
                                     dataField: "CompensationPrincipal",
                                     dataType: "number",
                                     summaryType: "sum",
                                     format: { type: 'fixedPoint', precision: 2 },
                                     area: "data"
                                 },
                                 {
                                     caption: langx.tab45,
                                     dataField: "InArrearsLoanCount",
                                     dataType: "number",
                                     summaryType: "sum",
                                     format: { type: 'fixedPoint', precision: 2 },
                                     area: "data"
                                 },

                                 {
                                     caption: langx.tab46,
                                     dataField: "NormalPercentage",
                                     dataType: "number",
                                     summaryType: "sum",
                                     format: { type: 'fixedPoint', precision: 2 },
                                     area: "data"
                                 },
                                 {
                                     caption: langx.tab47,
                                     dataField: "InterestPercentage",
                                     dataType: "number",
                                     summaryType: "sum",
                                     format: { type: 'fixedPoint', precision: 2 },
                                     area: "data"
                                 },
                                 {
                                     caption: langx.tab48,
                                     dataField: "SecondaryPercentage",
                                     dataType: "number",
                                     summaryType: "sum",
                                     format: { type: 'fixedPoint', precision: 2 },
                                     area: "data"
                                 },
                                 {
                                     caption: langx.tab49,
                                     dataField: "DoubtPercentage",
                                     dataType: "number",
                                     summaryType: "sum",
                                     format: { type: 'fixedPoint', precision: 2 },
                                     area: "data"
                                 },
                                 {
                                     caption: langx.tab50,
                                     dataField: "LossPercentage",
                                     dataType: "number",
                                     summaryType: "sum",
                                     format: { type: 'fixedPoint', precision: 2 },
                                     area: "data"
                                 },
                                 {
                                     caption: langx.tab51,
                                     dataField: "InArrearsPercentage",
                                     dataType: "number",
                                     summaryType: "sum",
                                     format: { type: 'fixedPoint', precision: 2 },
                                     area: "data"
                                 },
                                  {
                                      caption: langx.tab52,
                                      dataField: "CompensationPercentage",
                                      dataType: "number",
                                      summaryType: "sum",
                                      format: { type: 'fixedPoint', precision: 2 },
                                      area: "data"
                                  },
                            ],
                            store: ClassificationCompensation
                        }
                    })
                })
            },
            getTrustInfoData: function () {
                var TrustInfoB = [];
                var executeParam = { SPName: 'usp_GetTrustInfoBData', SQLParams: [] };
                var executeParams = encodeURIComponent(JSON.stringify(executeParam));
                var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonGetExecute?connConfig=FinancialReporting&appDomain=ReportView&resultType=commom&executeParams=" + executeParams;
                CallWCFSvc(serviceUrl, true, 'GET', function (data) {
                    if (data.length > 0) {
                        TrustInfoB = data;
                    } else {
                        TrustInfoB = [];
                    }
                    assetControl = $("#TrustInfoB").dxDataGrid({
                        allowSortingBySummary: true,
                        allowSorting: true,
                        allowFiltering: true,
                        allowExpandAll: true,
                        allowColumnReordering: true,
                        allowColumnResizing: true,
                        headerFilter: dataGridHeaderFilterConfig,
                        scrolling: {
                            mode: "virtual"
                        },
                        paging: { pageSize: 5 },
                        pager: {
                            showPageSizeSelector: true,
                            allowedPageSizes: [5, 15, 25]
                        },
                        MinHeight: 440,
                        searchPanel: {
                            visible: true,
                            width: 240,
                            placeholder: "Search..."
                        },
                        showBorders: true,
                        fieldChooser: {
                            enabled: true
                        },
                        "export": {
                            enabled: true,
                            fileName: langx.tab53 + new Date().dateFormat("yyyy-MM-dd_hh:mm:ss")
                        },
                        dataSource: TrustInfoB,
                        columns: [//{ caption: '资产计划标识', width: '130', dataField: "TrustCode" },
                            { caption: langx.tab54, width: '130', dataField: "TrustName" },
                            //{ caption: '系统中名称', width: '200', dataField: "ProductName" },
                            { caption: langx.tab55, width: '130', dataField: "SaleMethod" },
                            { caption: langx.tab56, width: '130', dataField: "OrganizationName" },
                            { caption: langx.tab57, width: '130', dataField: "FundSource" },
                            { caption: langx.tab58, width: '130', dataField: "FundChannel" },
                            { caption: langx.tab59, width: '130', dataField: "PublicOrPrivate" },
                            { caption: langx.tab60, width: '130', dataField: "OfferAmount", format: { type: 'fixedPoint', precision: 2 } },
                            { caption: langx.tab61, width: '130', dataField: "CloseDate" },
                            { caption: langx.tab62, width: '130', format: { type: 'fixedPoint', precision: 2 }, dataField: "SaleDateRemainingPrincipal" },
                            { caption: langx.tab63, width: '130', format: { type: 'fixedPoint', precision: 2 }, dataField: "CurrentInterestBalance" },
                            { caption: langx.tab64, width: '130', format: { type: 'fixedPoint', precision: 2 }, dataField: "SaleProfit" },
                            { caption: langx.tab65, width: '130', dataField: "SaleDate" },
                            { caption: langx.tab66, width: '130', dataField: "LoanMaturityDate" },
                            { caption: langx.tab67, width: '130', dataField: "DayCount" },
                            { caption: langx.tab68, width: '130', dataField: "PackageInterestRate" },
                            { caption: langx.tab69, width: '130', dataField: "ProductType" },

                            { caption: langx.tab70, width: '130', dataField: "DataSource" },

                            { caption: langx.tab71, width: '130', dataField: "CollectionMethod" },
                            { caption: langx.tab72, width: '130', dataField: "PaymentDate" },
                            { caption: langx.tab73, width: '130', dataField: "IsActualCollected" },
                            { caption: langx.tab74, width: '130', dataField: "IsGenerateLog" },
                            { caption: langx.tab75, width: '130', dataField: "FirstUnderlineTotalCollectAmount" },
                            { caption: langx.tab76, width: '130', format: { type: 'fixedPoint', precision: 2 }, dataField: "Principal" },
                            { caption: langx.tab77, width: '130', format: { type: 'fixedPoint', precision: 2 }, dataField: "Interest" },
                            { caption: langx.tab78, width: '130', format: { type: 'fixedPoint', precision: 2 }, dataField: "DefautFee" }
                        ]
                    })
                })
            },
            getTrustInfoCData: function () {
                var TrustInfoC = [];
                var executeParamC = { SPName: '[ReportView].[usp_GetTrustInfoCData]', SQLParams: [] };
                var executeParamsC = encodeURIComponent(JSON.stringify(executeParamC));
                var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonGetExecute?connConfig=FinancialReporting&executeParams=" + executeParamsC;
                CallWCFSvc(serviceUrl, true, 'GET', function (data) {
                    if (data.length > 0) {
                        TrustInfoC = data;
                    } else {
                        TrustInfoC = [];
                    }
                    classAssetControl = $("#TrustInfoC").dxDataGrid({
                        allowSortingBySummary: true,
                        allowSorting: true,
                        allowFiltering: true,
                        allowExpandAll: true,
                        allowColumnReordering: true,
                        allowColumnResizing: true,
                        scrolling: {
                            mode: "virtual"
                        },
                        MinHeight: 440,
                        searchPanel: {
                            visible: true,
                            width: 240,
                            placeholder: "Search..."
                        },
                        paging: { pageSize: 5 },
                        pager: {
                            showPageSizeSelector: true,
                            allowedPageSizes: [5, 15, 25]
                        },
                        showBorders: true,
                        fieldChooser: {
                            enabled: true
                        },
                        "export": {
                            enabled: true,
                            fileName: langx.tab79 + new Date().dateFormat("yyyy-MM-dd_hh:mm:ss")
                        },
                        dataSource: TrustInfoC,
                        columns: [  //{caption: '资产计划标识', width:'130',dataField: "TrustCode"}, 
                                    //{caption: '产品名称',width:'200', dataField: "ProductName"},
                                    { caption: langx.tab80, width: '130', dataField: "TrustName" },
                                    { caption: langx.tab81, width: '130', dataField: "OrganizationName" },
                                    { caption: langx.tab82, width: '130', dataField: "FundSource" },
                                    { caption: langx.tab83, width: '130', dataField: "FundChannel" },
                                    { caption: langx.tab84, width: '130', dataField: "NewOrExtended" },
                                    { caption: langx.tab85, width: '130', dataField: "ExtendedTrust" },
                                    { caption: langx.tab86, width: '130', dataField: "ProductType" },
                                    { caption: langx.tab87, width: '130', dataField: "DataSource" },
                                    { caption: langx.tab88, width: '130', dataField: "LoanTerm" },
                                    { caption: langx.tab89, width: '130', dataField: "BeforeSaleRemainingTerm" },
                                    { caption: langx.tab90, width: '130', dataField: "SaleTerm" },
                                    { caption: langx.tab91, width: '130', dataField: "AfterSaleRemainingTerm" },
                                    { caption: langx.tab92, width: '130', dataField: "ExtendingTrust" },
                                    { caption: langx.tab93, width: '130', dataField: "ExcessIncome" },
                                    { caption: langx.tab94, width: '130', format: { type: 'fixedPoint', precision: 2 }, dataField: "OfferAmount" },
                                    { caption: langx.tab95, width: '130', dataField: "CloseDate" },
                                    { caption: langx.tab96, width: '130', dataField: "LoanMaturityDate" },
                                    { caption: langx.tab97, width: '130', dataField: "RenewalPeriod" },
                                    { caption: langx.tab98, width: '130', dataField: "PackageInterestRate" },
                                    { caption: langx.tab99, width: '130', format: { type: 'fixedPoint', precision: 2 }, dataField: "interest" },
                                    { caption: langx.tab100, width: '130', dataField: "ChannelFeeRate" },
                                    { caption: langx.tab101, width: '130', format: { type: 'fixedPoint', precision: 2 }, dataField: "ChannelFee" },
                                    { caption: langx.tab102, width: '130', dataField: "TrusteeRate" },
                                    { caption: langx.tab103, width: '130', format: { type: 'fixedPoint', precision: 2 }, dataField: "TrusteeFee" },
                                    { caption: langx.tab104, width: '130', format: { type: 'fixedPoint', precision: 2 }, dataField: "FinicialAnalysisFee" },
                                    { caption: langx.tab105, width: '130', format: { type: 'fixedPoint', precision: 2 }, dataField: "TotalPayment" },
                                    { caption: langx.tab106, width: '130', format: { type: 'fixedPoint', precision: 2 }, dataField: "MaturityExtendedAmount" },
                                    { caption: langx.tab107, width: '130', format: { type: 'fixedPoint', precision: 2 }, dataField: "MaturityMicroLoanPaymentAmount" }
                        ]
                    })
                })
            },
            getProfitAmortizationData: function (code) {
                var ProfitAmortization = [];
                var executeParam = { SPName: '[ReportView].[usp_getProfitAmortization]', SQLParams: [] };
                executeParam.SQLParams.push({ Name: 'TrustCode', Value: code, DBType: 'string' });
                var executeParams = encodeURIComponent(JSON.stringify(executeParam));
                var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonGetExecute?connConfig=FinancialReporting&executeParams=" + executeParams;
                CallWCFSvc(serviceUrl, true, 'GET', function (data) {
                    if (data.length > 0) {
                        var newList = [];
                        for (var i = 0; i < data.length; i++) {
                            var AmortizationYear, AmortizationMonth, AmortizationDay;
                            if (data[i].AmortizationDate) {
                                var dueDate = data[i].AmortizationDate;
                                AmortizationYear = dueDate.substring(0, 4);
                                AmortizationMonth = dueDate.substring(5, 7);
                                AmortizationDay = dueDate.substring(8);
                            }
                            newList.push({
                                "TrustName": data[i].TrustName, "OfferAmount": data[i].OfferAmount, "SaleDate": data[i].SaleDate, "LoanMaturityDate": data[i].LoanMaturityDate
                                        , "SaleDateRemainingPrincipal": data[i].SaleDateRemainingPrincipal, "CurrentInterestBalance": data[i].CurrentInterestBalance, "FairValueAdjustment": data[i].FairValueAdjustment
                                        , "CurrentPrincipalBalance_Adjusted": data[i].CurrentPrincipalBalance_Adjusted, "SaleProfit": data[i].SaleProfit, "ExcessIncome": data[i].ExcessIncome, "TotalProfit": data[i].TotalProfit
                                        , "AmortizationAmount": data[i].AmortizationAmount, "AmortizationYear": AmortizationYear, "AmortizationMonth": AmortizationMonth, "AmortizationDay": AmortizationDay
                            })
                        }
                        ProfitAmortization = newList;
                    } else {
                        ProfitAmortization = [];
                    }
                    $("#ProfitAmortization").dxPivotGrid({
                        allowSortingBySummary: true,
                        allowSorting: true,
                        allowFiltering: true,
                        allowExpandAll: true,
                        allowColumnReordering: true,
                        allowColumnResizing: true,
                        showColumnGrandTotals: false,
                        showRowGrandTotals: false,
                        scrolling: {
                            mode: "virtual"
                        },
                        MinHeight: 440,
                        showBorders: true,
                        fieldChooser: {
                            enabled: true
                        },
                        "export": {
                            enabled: true,
                            fileName: langx.tab108 + new Date().dateFormat("yyyy-MM-dd_hh:mm:ss")
                        },
                        dataSource: {
                            fields: [
                                { caption: langx.tab109, dataField: "TrustName", area: "row" },
                                { caption: langx.tab110, dataField: "AmortizationYear", dataType: "AmortizationYear", area: "column" },
                                { caption: langx.tab111, dataField: "AmortizationMonth", dataType: "AmortizationMonth", area: "column" },
                                { caption: langx.tab112, dataField: "AmortizationDay", dataType: "AmortizationDay", area: "column" },
                                { caption: langx.tab113, dataField: "OfferAmount", dataType: "OfferAmount", summaryType: "sum", format: { type: 'fixedPoint', precision: 2 }, area: "data" },
                                { caption: langx.tab114, dataField: "SaleDateRemainingPrincipal", dataType: "SaleDateRemainingPrincipal", summaryType: "sum", format: { type: 'fixedPoint', precision: 2 }, area: "data" },
                                { caption: langx.tab115, dataField: "CurrentInterestBalance", dataType: "CurrentInterestBalance", summaryType: "sum", format: { type: 'fixedPoint', precision: 2 }, area: "data" },
                                { caption: langx.tab116, dataField: "FairValueAdjustment", dataType: "FairValueAdjustment", summaryType: "sum", format: { type: 'fixedPoint', precision: 2 }, area: "data" },
                                { caption: langx.tab117, dataField: "CurrentPrincipalBalance_Adjusted", dataType: "CurrentPrincipalBalance_Adjusted", summaryType: "sum", format: { type: 'fixedPoint', precision: 2 }, area: "data" },
                                { caption: langx.tab118, dataField: "SaleProfit", dataType: "SaleProfit", summaryType: "sum", format: { type: 'fixedPoint', precision: 2 }, area: "data" },
                                { caption: langx.tab119, dataField: "ExcessIncome", dataType: "ExcessIncome", summaryType: "sum", format: { type: 'fixedPoint', precision: 2 }, area: "data" },
                                { caption: langx.tab120, dataField: "TotalProfit", dataType: "TotalProfit", summaryType: "sum", format: { type: 'fixedPoint', precision: 2 }, area: "data" },
                                { caption: langx.tab121, dataField: "AmortizationAmount", dataType: "AmortizationAmount", summaryType: "sum", format: { type: 'fixedPoint', precision: 2 }, area: "data" },
                            ],
                            store: ProfitAmortization
                        }
                    })
                })
            },
            getAssetMonthlyData: function (startDate, endDate) {
                var AssetMonthly = [];
                var executeParam = { SPName: '[ReportView].[usp_GetAssetMonthly]', SQLParams: [] };
                executeParam.SQLParams.push({ Name: 'StartDate', Value: startDate, DBType: 'string' });
                executeParam.SQLParams.push({ Name: 'EndDate', Value: endDate, DBType: 'string' });
                var executeParams = encodeURIComponent(JSON.stringify(executeParam));
                var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonGetExecute?connConfig=FinancialReporting&executeParams=" + executeParams;
                CallWCFSvc(serviceUrl, true, 'GET', function (data) {
                    if (data.length > 0) {
                        AssetMonthly = data;
                    } else {
                        AssetMonthly = [];
                    }
                    $("#AssetMonthly").dxPivotGrid({
                        allowSortingBySummary: true,
                        allowSorting: true,
                        allowFiltering: true,
                        allowExpandAll: true,
                        MinHeight: 440,
                        showBorders: true,
                        showRowGrandTotals: false,
                        showColumnGrandTotals: false,
                        fieldChooser: {
                            enabled: true
                        },
                        "export": {
                            enabled: true,
                            fileName: langx.tab122 + new Date().dateFormat("yyyy-MM-dd_hh:mm:ss")
                        },
                        dataSource: {
                            fields: [
                                {
                                    caption: langx.tab123,
                                    dataField: "ProductType",
                                    area: "row"
                                },
                                {
                                    caption: langx.tab124,
                                    dataField: "EndDate",
                                    dataType: "EndDate",
                                    area: "column"
                                },
                                {
                                    caption: langx.tab125,
                                    dataField: "OrganizationCode",
                                    dataType: "OrganizationCode",
                                    area: "row"
                                },
                                {
                                    caption: langx.tab126,
                                    dataField: "AssetStatus",
                                    dataType: "AssetStatus",
                                    area: "row"
                                },
                              /*  {
                                    caption: "抵押类型",
                                    dataField: "MortageType",
                                    dataType: "MortageType",
                                    area: "row"
                                },
                                 {
                                     caption: "资金模式",
                                     dataField: "FundMode",
                                     dataType: "FundMode",
                                     area: "row"
                                 },
                                 {
                                     caption: "期数",
                                     dataField: "Term",
                                     dataType: "Term",
                                     area: "row"
                                 },
                                  {
                                      caption: "担保机构",
                                      dataField: "GuaranteeCorporation",
                                      dataType: "GuaranteeCorporation",
                                      area: "row"
                                  },*/

                                {
                                    caption: langx.tab127,
                                    dataField: "NewSaleAmount",
                                    dataType: "number",
                                    summaryType: "sum",
                                    format: { type: 'fixedPoint', precision: 2 },
                                    area: "data"
                                },
                                {
                                    caption: langx.tab128,
                                    dataField: "SaleDateRemainingPrincipal",
                                    dataType: "number",
                                    summaryType: "sum",
                                    format: { type: 'fixedPoint', precision: 2 },
                                    area: "data"
                                },
                                 {
                                     caption: langx.tab129,
                                     dataField: "InterestIncome",
                                     dataType: "number",
                                     summaryType: "sum",
                                     format: { type: 'fixedPoint', precision: 2 },
                                     area: "data"
                                 }],
                            store: AssetMonthly
                        }
                    })
                })
            },
            getFinancingCostData: function (TrustName, BorC) {
                var FinancingCost = [];
                var executeParam = { SPName: '[ReportView].[usp_GetFinancingCostData]', SQLParams: [] };
                executeParam.SQLParams.push({ Name: 'trustcode', Value: TrustName, DBType: 'string' });
                var executeParams = encodeURIComponent(JSON.stringify(executeParam));
                var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonGetExecute?connConfig=FinancialReporting&executeParams=" + executeParams;
                CallWCFSvc(serviceUrl, true, 'GET', function (data) {
                    if (data.length > 0) {
                        FinancingCost = data;
                    } else {
                        FinancingCost = [];
                    }
                    if (BorC) {
                        $("#FinancingCost").dxDataGrid({
                            allowSortingBySummary: true,
                            allowSorting: true,
                            allowFiltering: true,
                            allowExpandAll: true,
                            MinHeight: 440,
                            allowColumnReordering: true,
                            allowColumnResizing: true,
                            headerFilter: dataGridHeaderFilterConfig,
                            scrolling: {
                                mode: "virtual"
                            },
                            paging: { pageSize: 5 },
                            pager: {
                                showPageSizeSelector: true,
                                allowedPageSizes: [5, 15, 25]
                            },
                            searchPanel: {
                                visible: true,
                                width: 240,
                                placeholder: "Search..."
                            },
                            showBorders: true,
                            fieldChooser: {
                                enabled: true
                            },
                            "export": {
                                enabled: true,
                                fileName: langx.tab130 + new Date().dateFormat("yyyy-MM-dd_hh:mm:ss")
                            },
                            dataSource: FinancingCost,
                            columns: [{ caption: langx.tab131, width: 120, dataField: "TrustName" },
                                { caption: langx.tab132, width: 100, dataField: "BorC" },
                                { caption: langx.tab133, width: 200, dataField: "OrganizationName" },
                                { caption: langx.tab134, width: 120, dataField: "StartDate" },
                                { caption: langx.tab135, width: 120, dataField: "EndDate" },
                                { caption: langx.tab136, width: 120, dataField: "Term" },

                                { caption: langx.tab137, width: 120, dataField: "PackageInterestRate" },
                                { caption: langx.tab138, width: 120, dataField: "Interest" },
                                { caption: langx.tab139, width: 120, dataField: "Principal" },

                                { caption: langx.tab140, width: 120, dataField: "ChannelFee" },
                                { caption: langx.tab141, width: 120, dataField: "TrusteeFee" },
                                { caption: langx.tab142, width: 120, dataField: "FinacialAnalysisFee" },
                                { caption: langx.tab143, width: 120, dataField: "TotalPayment" },

                                { caption: langx.tab144, width: 120, dataField: "DayCost" },
                                { caption: langx.tab145, width: 120, dataField: "AnnualizedCostRate" },

                                { caption: langx.tab146, width: 120, dataField: "Cost" },
                                { caption: langx.tab147, width: 120, dataField: "Days" },
                                { caption: langx.tab148, width: 120, dataField: "CapitalConversion" },
                            ],
                        })
                    } else {
                        $("#FinancingCost").dxDataGrid({
                            allowSortingBySummary: true,
                            allowSorting: true,
                            allowFiltering: true,
                            allowExpandAll: true,
                            allowColumnReordering: true,
                            allowColumnResizing: true,
                            headerFilter: dataGridHeaderFilterConfig,
                            scrolling: {
                                mode: "virtual"
                            },
                            MinHeight: 440,
                            searchPanel: {
                                visible: true,
                                width: 240,
                                placeholder: "Search..."
                            },
                            paging: { pageSize: 5 },
                            pager: {
                                showPageSizeSelector: true,
                                allowedPageSizes: [5, 15, 25]
                            },
                            showBorders: true,
                            fieldChooser: {
                                enabled: true
                            },
                            "export": {
                                enabled: true,
                                fileName: langx.tab149 + new Date().dateFormat("yyyy-MM-dd_hh:mm:ss")
                            },
                            dataSource: FinancingCost,
                            columns: [{ caption: langx.tab150, width: 120, dataField: "TrustName" },
                                { caption: langx.tab151, width: 100, dataField: "BorC" },
                                { caption: langx.tab152, width: 200, dataField: "OrganizationName" },
                                { caption: langx.tab153, width: 120, dataField: "SaleDate" },
                                { caption: langx.tab154, width: 120, dataField: "LoanMaturityDate" },
                                { caption: langx.tab155, width: 120, dataField: "PaymentDate" },

                                { caption: langx.tab156, width: 120, dataField: "Term" },
                                { caption: langx.tab157, width: 120, dataField: "Interest" },
                                { caption: langx.tab158, width: 120, dataField: "VariableFee" },

                                { caption: langx.tab159, width: 120, dataField: "FixedFee" },
                                { caption: langx.tab160, width: 120, dataField: "CurrentTotalCost" },
                                { caption: langx.tab161, width: 120, dataField: "AmortizationDate" },
                                { caption: langx.tab162, width: 120, dataField: "AmortizationAmount" }
                            ],
                        })
                    }
                })
            },
            getCashFlowByDayData: function (day) {
                var CashFlow = [];
                var executeParam = { SPName: '[ReportView].[usp_GetCashFlowByDayData]', SQLParams: [] };
                executeParam.SQLParams.push({ Name: 'days', Value: day, DBType: 'string' });
                var executeParams = encodeURIComponent(JSON.stringify(executeParam));
                var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonGetExecute?connConfig=FinancialReporting&executeParams=" + executeParams;
                CallWCFSvc(serviceUrl, true, 'GET', function (data) {
                    if (data.length > 0) {
                        var newData = [];
                        for (var i = 0; i < data.length; i++) {
                            if (data[i].ActualorSchedule == 'Actual') {
                                newData.push({ "ProductType": data[i].ProductType, "AttributeRow": '本金', "Money": data[i].Principal, "Date": data[i].Date, "AttributeColumn": '实际' });
                                newData.push({ "ProductType": data[i].ProductType, "AttributeRow": '利息', "Money": data[i].Interest, "Date": data[i].Date, "AttributeColumn": '实际' });
                                newData.push({ "ProductType": data[i].ProductType, "AttributeRow": '罚息', "Money": data[i].DefautFee, "Date": data[i].Date, "AttributeColumn": '实际' });
                                newData.push({ "ProductType": data[i].ProductType, "AttributeRow": '现金流出', "Money": data[i].FinancingPayment, "Date": data[i].Date, "AttributeColumn": '实际' });
                                newData.push({ "ProductType": data[i].ProductType, "AttributeRow": '现金流入', "Money": data[i].MatureAssets, "Date": data[i].Date, "AttributeColumn": '实际' });
                                newData.push({ "ProductType": data[i].ProductType, "AttributeRow": '收支净额', "Money": data[i].AssetsTrustGap, "Date": data[i].Date, "AttributeColumn": '实际' });
                            } else if (data[i].ActualorSchedule == 'Schedule') {
                                newData.push({ "ProductType": data[i].ProductType, "AttributeRow": '本金', "Money": data[i].Principal, "Date": data[i].Date, "AttributeColumn": '预期' });
                                newData.push({ "ProductType": data[i].ProductType, "AttributeRow": '利息', "Money": data[i].Interest, "Date": data[i].Date, "AttributeColumn": '预期' });
                                newData.push({ "ProductType": data[i].ProductType, "AttributeRow": '罚息', "Money": data[i].DefautFee, "Date": data[i].Date, "AttributeColumn": '预期' });
                                newData.push({ "ProductType": data[i].ProductType, "AttributeRow": '现金流出', "Money": data[i].FinancingPayment, "Date": data[i].Date, "AttributeColumn": '预期' });
                                newData.push({ "ProductType": data[i].ProductType, "AttributeRow": '现金流入', "Money": data[i].MatureAssets, "Date": data[i].Date, "AttributeColumn": '预期' });
                                newData.push({ "ProductType": data[i].ProductType, "AttributeRow": '收支净额', "Money": data[i].AssetsTrustGap, "Date": data[i].Date, "AttributeColumn": '预期' });
                            }
                        }
                        CashFlow = newData;
                    } else {
                        CashFlow = [];
                    }
                    $("#CashFlowByDay").dxPivotGrid({
                        allowSortingBySummary: true,
                        allowSorting: true,
                        allowFiltering: true,
                        allowExpandAll: true,
                        MinHeight: 440,
                        showBorders: true,
                        showRowGrandTotals: false,
                        showColumnGrandTotals: false,
                        scrolling: {
                            mode: "virtual"
                        },
                        fieldChooser: {
                            enabled: true
                        },
                        "export": {
                            enabled: true,
                            fileName: langx.tab163 + new Date().dateFormat("yyyy-MM-dd_hh:mm:ss")
                        },
                        dataSource: {
                            fields: [
                                {
                                    caption: langx.tab164,
                                    dataField: "ProductType",
                                    width: 200,
                                    area: "row",
                                    expanded: true,
                                },
                                {
                                    caption: langx.tab165,
                                    width: 200,
                                    dataField: "AttributeRow",
                                    area: "row"
                                },
                                {
                                    caption: langx.tab166,
                                    dataField: "AttributeColumn",
                                    area: "column",
                                    showTotals: false,
                                    expanded: true,
                                },
                                {
                                    caption: langx.tab167,
                                    dataField: "Date",
                                    area: "column"
                                },
                                {
                                    caption: langx.tab168,
                                    dataField: "Money",
                                    dataType: "number",
                                    summaryType: "sum",
                                    format: { type: 'fixedPoint', precision: 2 },
                                    area: "data"
                                }
                            ],
                            store: CashFlow
                        }
                    })
                })
            },
            getCapitalMIAssetData: function (startDate, endDate) {
                var CapitalMI_Asset = [];
                var executeParam = { SPName: '[ReportView].[usp_GetCapitalMI_Asset]', SQLParams: [] };
                executeParam.SQLParams.push({ Name: 'StartDate', Value: startDate, DBType: 'string' });
                executeParam.SQLParams.push({ Name: 'EndDate', Value: endDate, DBType: 'string' });
                var executeParams = encodeURIComponent(JSON.stringify(executeParam));
                var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonGetExecute?connConfig=FinancialReporting&executeParams=" + executeParams;
                CallWCFSvc(serviceUrl, true, 'GET', function (data) {
                    if (data.length > 0) {
                        CapitalMI_Asset = data;
                    } else {
                        CapitalMI_Asset = [];
                    }
                    $("#CapitalMI_Asset").dxPivotGrid({
                        allowSortingBySummary: true,
                        allowSorting: true,
                        allowFiltering: true,
                        allowExpandAll: true,
                        MinHeight: 440,
                        showBorders: true,
                        showRowGrandTotals: false,
                        showColumnGrandTotals: false,
                        fieldChooser: {
                            enabled: true
                        },
                        scrolling: {
                            mode: "virtual"
                        },
                        "export": {
                            enabled: true,
                            fileName: langx.tab169 + new Date().dateFormat("yyyy-MM-dd_hh:mm:ss")
                        },
                        dataSource: {
                            fields: [
                                {
                                    caption: langx.tab170,
                                    dataField: "OrganizationName",
                                    area: "row"
                                },
                                {
                                    caption: langx.tab171,
                                    dataField: "AssetType",
                                    area: "row"
                                },
                                {
                                    caption: langx.tab172,
                                    dataField: "ProductType",
                                    area: "row"
                                },
                                {
                                    caption: langx.tab173,
                                    dataField: "FundMode",
                                    area: "row"
                                },
                                {
                                    caption: langx.tab174,
                                    dataField: "SaleTerm",
                                    area: "row"
                                },
                                {
                                    caption: langx.tab175,
                                    dataField: "BorC",
                                    area: "row"
                                },
                                {
                                    caption: langx.tab176,
                                    dataField: "NewOrExtended",
                                    area: "row"
                                },
                                {
                                    caption: langx.tab177,
                                    dataField: "NewSaleCount",
                                    dataType: "number",
                                    summaryType: "sum",
                                    format: { type: 'fixedPoint', precision: 0 },
                                    area: "data"
                                },
                                 {
                                     caption: langx.tab178,
                                     dataField: "NewSaleAmount",
                                     dataType: "number",
                                     summaryType: "sum",
                                     format: { type: 'fixedPoint', precision: 2 },
                                     area: "data"
                                 },
                                 {
                                     caption: langx.tab179,
                                     dataField: "Collection",
                                     dataType: "number",
                                     summaryType: "sum",
                                     format: { type: 'fixedPoint', precision: 2 },
                                     area: "data"
                                 },
                                 {
                                     caption: langx.tab180,
                                     dataField: "OffBalanceSheetENR",
                                     dataType: "number",
                                     summaryType: "sum",
                                     format: { type: 'fixedPoint', precision: 2 },
                                     area: "data"
                                 }


                            ],
                            store: CapitalMI_Asset
                        }
                    })
                })
            },
            getCapitalMITrustData: function (startDate, endDate) {
                var CapitalMI_Trust = [];
                var executeParam = { SPName: '[ReportView].[usp_GetCapitalMI_Trust]', SQLParams: [] };
                executeParam.SQLParams.push({ Name: 'StartDate', Value: startDate, DBType: 'string' });
                executeParam.SQLParams.push({ Name: 'EndDate', Value: endDate, DBType: 'string' });
                var executeParams = encodeURIComponent(JSON.stringify(executeParam));
                var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonGetExecute?connConfig=FinancialReporting&executeParams=" + executeParams;
                CallWCFSvc(serviceUrl, true, 'GET', function (data) {
                    if (data.length > 0) {
                        CapitalMI_Trust = data;
                    } else {
                        CapitalMI_Trust = [];
                    }
                    $("#CapitalMI_Trust").dxPivotGrid({
                        allowSortingBySummary: true,
                        allowSorting: true,
                        allowFiltering: true,
                        allowExpandAll: true,
                        MinHeight: 440,
                        showBorders: true,
                        showRowGrandTotals: false,
                        showColumnGrandTotals: false,
                        fieldChooser: {
                            enabled: true
                        },
                        scrolling: {
                            mode: "virtual"
                        },
                        "export": {
                            enabled: true,
                            fileName: langx.tab181 + new Date().dateFormat("yyyy-MM-dd_hh:mm:ss")
                        },
                        dataSource: {
                            fields: [
                                {
                                    caption: langx.tab182,
                                    dataField: "OrganizationName",
                                    area: "row"
                                },
                                {
                                    caption: langx.tab183,
                                    dataField: "AssetType",
                                    area: "row"
                                },
                                {
                                    caption: langx.tab184,
                                    dataField: "ProductType",
                                    area: "row"
                                },
                                {
                                    caption: langx.tab185,
                                    dataField: "Term",
                                    area: "row"
                                },
                                {
                                    caption: langx.tab186,
                                    dataField: "BorC",
                                    area: "row"
                                },
                                {
                                    caption: langx.tab187,
                                    dataField: "NewOrExtended",
                                    area: "row"
                                },
                                {
                                    caption: langx.tab188,
                                    dataField: "NewTrustCount",
                                    dataType: "number",
                                    summaryType: "sum",
                                    format: { type: 'fixedPoint', precision: 0 },
                                    area: "data"
                                },
                                 {
                                     caption: langx.tab189,
                                     dataField: "NewTrustAmount",
                                     dataType: "number",
                                     summaryType: "sum",
                                     format: { type: 'fixedPoint', precision: 2 },
                                     area: "data"
                                 },
                                 {
                                     caption: langx.tab190,
                                     dataField: "ExistingTrustCount",
                                     dataType: "number",
                                     summaryType: "sum",
                                     format: { type: 'fixedPoint', precision: 0 },
                                     area: "data"
                                 },
                                 {
                                     caption: langx.tab191,
                                     dataField: "ExistingTrustAmoung",
                                     dataType: "number",
                                     summaryType: "sum",
                                     format: { type: 'fixedPoint', precision: 2 },
                                     area: "data"
                                 }


                            ],
                            store: CapitalMI_Trust
                        }
                    })
                })
            },
            getABSRepaymentDetailsData: function (reportingData) {
                var ABSRepaymentDetails = [];
                var executeParam = { SPName: '[ReportView].[usp_getABSRepaymentDetailsData]', SQLParams: [] };
                executeParam.SQLParams.push({ Name: 'ReportingDate', Value: reportingData, DBType: 'string' });
                var executeParams = encodeURIComponent(JSON.stringify(executeParam));
                var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonGetExecute?connConfig=FinancialReporting&executeParams=" + executeParams;
                CallWCFSvc(serviceUrl, true, 'GET', function (data) {
                    if (data.length > 0) {
                        ABSRepaymentDetails = data;
                    } else {
                        ABSRepaymentDetails = [];
                    }
                    $("#ABSRepaymentDetails").dxDataGrid({
                        allowSortingBySummary: true,
                        allowSorting: true,
                        allowFiltering: true,
                        allowExpandAll: true,
                        MinHeight: 440,
                        headerFilter: {
                            visible: true
                        },
                        filterRow: {
                            visible: true,
                            applyFilter: "auto"
                        },
                        allowColumnReordering: true,
                        allowColumnResizing: true,
                        headerFilter: dataGridHeaderFilterConfig,
                        scrolling: {
                            mode: "virtual"
                        },
                        paging: { pageSize: 5 },
                        pager: {
                            showPageSizeSelector: true,
                            allowedPageSizes: [5, 15, 25]
                        },
                        searchPanel: {
                            visible: true,
                            width: 240,
                            placeholder: "Search..."
                        },
                        showBorders: true,
                        fieldChooser: {
                            enabled: true
                        },
                        "export": {
                            enabled: true,
                            fileName: langx.tab192 + new Date().dateFormat("yyyy-MM-dd_hh:mm:ss")
                        },
                        dataSource: ABSRepaymentDetails,
                        columns: [{ caption: langx.tab193, width: '130', dataField: "ProductName" },
                                    { caption: langx.tab194, width: '130', dataField: "PaymentDate" },
                                    { caption: langx.tab195, width: '130', dataField: "InterestDays" },
                                    { caption: langx.tab196, width: '130', dataField: "TrusteeFee" },
                                    { caption: langx.tab197, width: '130', dataField: "ChannelFee" },
                                    { caption: langx.tab198, width: '130', dataField: "FinaancialAnalysisfee" },
                                    { caption: langx.tab199, width: '130', dataField: "VariableFee" },
                                    { caption: langx.tab200, width: '130', dataField: "FixedFee" },
                                    { caption: langx.tab201, width: '130', dataField: "InteresPaid" },
                                    { caption: langx.tab202, width: '130', dataField: "LeftOverPrincipal" },
                                    { caption: langx.tab203, width: '130', dataField: "FirstTierRemainingPrincipal" },
                                    { caption: langx.tab204, width: '130', dataField: "MidTierRemainingPrincipal" },
                                    { caption: langx.tab205, width: '130', dataField: "LastTierRemainingPrincipal" },
                                    { caption: langx.tab206, width: '130', dataField: "CollectionDate" },
                                    { caption: langx.tab207, width: '130', dataField: "EstimatedCollectionAmount" },
                                    { caption: langx.tab208, width: '130', dataField: "ActualCollecitonAmount" },
                                    { caption: langx.tab209, width: '130', dataField: "ActualPrincipal" },
                                    { caption: langx.tab210, width: '130', dataField: "ActualInterest" },
                                    { caption: langx.tab211, width: '130', dataField: "ActualDefaultFee" },
                                    { caption: langx.tab212, width: '130', dataField: "ActualPrepaymentFee" },
                        ]
                    });
                })
            },
            reportHandlers: { 0: "getReport1", 1: "getReport2", 2: "getReport3", 3: "getReport4", 4: "getReport5", 5: "getReport6", 6: "getReport7", 7: "getReport8" },
            getIndexNumerNow: function (index) {
                this[this.reportHandlers[index]]();

            }
        };
        var main = '资产服务报告', childMain;
        var listMain = ["出表融资台账", "资金部MI"];
        var hasCookie = $.cookie("Reporting");
        if (hasCookie != null) {
            $(".tab_container li").removeClass("active_li");
            $(".change_main_box .change_main_each").hide();
            var hasChild = $.cookie('ReportingMain');
            if (hasChild == null) {
                $(".tab_container li").each(function (i, v) {
                    if ($(this).text() == hasCookie) {
                        $(".tab_container li:eq(" + i + ")").addClass("active_li");
                        $(".change_main_box .change_main_each:eq(" + i + ")").show();
                        reportingObj.getIndexNumerNow(i)
                    }
                })
            } else {
                $(".tab_container li").each(function (i, v) {
                    if ($(this).text() == hasCookie) {
                        var index = i;
                        $(".tab_container li:eq(" + i + ")").addClass("active_li");
                        $(".change_main_box .change_main_each:eq(" + i + ")").show();
                        reportingObj.getIndexNumerNow(i);
                        for (var j = 0; j < listMain.length; j++) {
                            if (listMain[j] == hasCookie) {
                                if (j == 0) {
                                    $('.change_tit_active2 span').removeClass("span_active");
                                    $(".change_box_each2").removeClass("change_box_each_active");
                                    if (hasChild == '融资台账B端') {
                                        $(".change_tit_active2 span:eq(0)").addClass("span_active");
                                        $('.change_box_taizhang .change_box_each2:eq(0)').addClass('change_box_each_active');
                                    } else {
                                        $(".change_tit_active2 span:eq(1)").addClass("span_active");
                                        $('.change_box_taizhang .change_box_each2:eq(1)').addClass('change_box_each_active');
                                        var TrustInfoC = [];
                                        reportingObj.getTrustInfoCData();
                                    }
                                } else {
                                    $('.change_tit_active3 span').removeClass("span_active");
                                    $(".change_box_each3").removeClass("change_box_each_active");
                                    if (hasChild == '资金部MI_资产') {
                                        $(".change_tit_active3 span:eq(0)").addClass("span_active");
                                        $('.change_boxMI .change_box_each3:eq(0)').addClass('change_box_each_active');
                                        reportingObj.getCapitalMIAssetData($("#selected-date2 input[type='hidden']").val(), $("#selected-date input[type='hidden']").val());
                                    } else {
                                        $(".change_tit_active3 span:eq(1)").addClass("span_active");
                                        $('.change_boxMI .change_box_each3:eq(1)').addClass('change_box_each_active');
                                        //请求数据Trust
                                        reportingObj.getCapitalMITrustData($("#selected-date2 input[type='hidden']").val(), $("#selected-date input[type='hidden']").val());
                                    }
                                }
                            }
                        }
                    }
                })
            }
        } else {
            $(".change_main_box .change_main_each:first-child").show();
        }

        $(".tab_container li").click(function () {
            var index = $(this).index();
            main = $(this).text();
            $.cookie('ReportingMain', null);
            $.cookie('Reporting', main, { expires: 1 });
            $(".tab_container li").removeClass("active_li");
            $(this).addClass("active_li");
            $(".change_main_box .change_main_each").hide();
            $(".change_main_box .change_main_each:eq(" + index + ")").show();
            reportingObj.getIndexNumerNow(index)
        })

        $(".change_tit_active2 span").click(function () {
            var index = $(this).index();
            childMain = $(this).text();
            $.cookie('ReportingMain', null);
            $.cookie('ReportingMain', childMain, { expires: 1 });
            $(this).addClass("span_active").siblings("span").removeClass("span_active");
            $(".change_box_each2").removeClass("change_box_each_active");
            $(".change_box_each2:eq(" + index + ")").addClass("change_box_each_active")
            var TrustInfoC = [];
            if (index == 1) {
                reportingObj.getTrustInfoCData();
            }
        })
        $(".change_tit_active3 span").click(function () {
            var index = $(this).index();
            childMain = $(this).text();
            $.cookie('ReportingMain', null);
            $.cookie('ReportingMain', "'" + childMain + "'", { expires: 1 });
            $(this).addClass("span_active").siblings("span").removeClass("span_active");
            $(".change_box_each3").removeClass("change_box_each_active");
            $(".change_box_each3:eq(" + index + ")").addClass("change_box_each_active");
            if (index == 1) {
                reportingObj.getCapitalMITrustData($("#selected-date2 input[type='hidden']").val(), $("#selected-date input[type='hidden']").val());
            }
        })
        $("#DateBtn").click(function () {
            var index;
            $(".tab_container li").each(function (i, v) {
                if ($(this).hasClass("active_li")) {
                    index = i;
                }
            })
            //li返回的是页面上各个表的下标
            if (index == 3) {
                reportingObj.getAssetMonthlyData($("#selected-date2 input[type='hidden']").val(), $("#selected-date input[type='hidden']").val())
            } else if (index == 6) {
                $(".change_tit_active3 span").each(function (i, v) {
                    if ($(this).hasClass("span_active")) {
                        var indexNew = $(this).index();
                        if (indexNew == 1) {
                            reportingObj.getCapitalMITrustData($("#selected-date2 input[type='hidden']").val(), $("#selected-date input[type='hidden']").val());
                        } else {
                            reportingObj.getCapitalMIAssetData($("#selected-date2 input[type='hidden']").val(), $("#selected-date input[type='hidden']").val());
                        }
                    }
                })

            }
        })
        $("#DateReport").click(function () {
            var index;
            $(".tab_container li").each(function (i, v) {
                if ($(this).hasClass("active_li")) {
                    index = i;
                }
            })
            if (index == 1) {
                reportingObj.getTrustInfoData()
            } else if (index == 2) {
                reportingObj.getProfitAmortizationData($("#reportingDate input[type='hidden']").val())
            } else if (index == 5) {
                reportingObj.getCashFlowByDayData($("#reportingDate input[type='hidden']").val())
            } else if (index == 7) {
                reportingObj.getABSRepaymentDetailsData($("#reportingDate input[type='hidden']").val())
            }
        })
        $("#ListTrustCode").click(function () {
            $(".tab_container li").each(function (i, v) {
                if ($(this).hasClass("active_li")) {
                    index = i;
                }
            })
            var TrustCode = $("#list input[type='hidden']").val();
            if (TrustCode == '') {
                GSDialog.HintWindow("请选择专项计划名称!");
                return false;
            }
            var isTrustC;
            for (var i = 0; i < products.length; i++) {
                if (products[i].TrustCode == TrustCode) {
                    isTrustC = products[i].IsCTrust;
                }
            }

            if (index == 2) {
                reportingObj.getProfitAmortizationData(TrustCode);
            } else if (index == 4) {
                reportingObj.getFinancingCostData(TrustCode, isTrustC);
            }

        })
        $("#reportService").click(function () {
            var TrustCode = $("#list2 input[type='hidden']").val();
            if (TrustCode == '') {
                GSDialog.HintWindow("请选择专项计划名称!");
                return false;
            }
            reportingObj.getAssetServiceReportData($("#selected-date4 input[type='hidden']").val(), $("#selected-date3 input[type='hidden']").val(), TrustCode)
        })
        
    })
    
    var selectedDate = $("#selected-date").dxDateBox({
        value: new Date(),
        width: "100%"
    }).dxDateBox("instance");
    var selectedDate = $("#selected-date2").dxDateBox({
        value: new Date(new Date() - 48 * 60 * 60 * 1000),
        width: "100%"
    }).dxDateBox("instance");
    var selectedDate = $("#selected-date3").dxDateBox({
        value: new Date(),
        width: "100%"
    }).dxDateBox("instance");
    var selectedDate = $("#selected-date4").dxDateBox({
        value: new Date(new Date() - 48 * 60 * 60 * 1000),
        width: "100%"
    }).dxDateBox("instance");

    var selectedDate = $("#reportingDate").dxDateBox({
        value: new Date(new Date() - 24 * 60 * 60 * 1000),
        width: "100%"
    }).dxDateBox("instance");
    var dataGridHeaderFilterConfig = {
        allowSearch: true,
        height: 325,
        visible: true,
        width: 252
    };

    var products = [];
    var svcUrl = webProxy.dataProcessServiceUrl + "CommonGetExecute?connConfig=FinancialReporting&appDomain=ReportView&executeParams=";
    var params = '';

    var promise = webProxy.comGetData(params, svcUrl, 'usp_GetAllTrustName');
    promise().then(function (response) {
        
        if (typeof response === 'string') { data = JSON.parse(response); }
        else { data = response; }
        if (data.length > 0) {
                    products = data;
                } else {
                    products = [];
                }
                $("#list").dxSelectBox({
                    items: products,
                    displayExpr: "TrustName",
                    valueExpr: "TrustCode",
                    searchEnabled: true
                });
                $("#list2").dxSelectBox({
                    items: products,
                    displayExpr: "TrustName",
                    valueExpr: "TrustCode",
                    searchEnabled: true
                });
    });
    //var executeParam = { SPName: 'ReportView.usp_GetAllTrustName', SQLParams: [] };
    //var executeParams = encodeURIComponent(JSON.stringify(executeParam));
    //var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonGetExecute?connConfig=FinancialReporting&appDomain=ReportView&executeParams=" + executeParams;
    //CallWCFSvc(serviceUrl, true, 'GET', function (data) {
    //    if (data.length > 0) {
    //        products = data;
    //    } else {
    //        products = [];
    //    }
    //    $("#list").dxSelectBox({
    //        items: products,
    //        displayExpr: "TrustName",
    //        valueExpr: "TrustCode",
    //        searchEnabled: true
    //    });
    //    $("#list2").dxSelectBox({
    //        items: products,
    //        displayExpr: "TrustName",
    //        valueExpr: "TrustCode",
    //        searchEnabled: true
    //    });

    //})

    
})