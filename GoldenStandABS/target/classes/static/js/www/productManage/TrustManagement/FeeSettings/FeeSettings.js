var viewModel;
var feeTypeListModel = {};
var feeTypeDisplayListModel = {};
var trustId = getQueryString("tid") ? getQueryString("tid") : "";
var debug = getQueryString("debug");
function isDebug() {
    if (debug)
        return true;
    else
        return false;
}
//"{"Json": [{"ActionCode": "ValueAddedTax_Fee_#Id#", "DisplayName": "增值税", "MethodDisplayName": "税率*计税基准*（1+附加率）\/（1+税率）", "Parameters": [{"DataSourceName": "", "DisplayName": "税率", "ItemValue": "", "Name": "ValueAddedTax_Fee_Ratio_#Id#" },{"DataSourceName": "", "DisplayName": "附加率", "ItemValue": "", "Name": "ValueAddedTax_Fee_Ratio_Add_#Id#" },{"DataSourceName": "FeeBase", "DisplayName": "计税基准", "ItemValue": "", "Name": "ValueAddedTax_Fee_Base_#Id#" },{"DataSourceName": "", "DisplayName": "支付频率", "ItemValue": "", "Name": "ValueAddedTax_Fee_PayFrequence_#Id#" }] },{"ActionCode": "AssetService_Fee_#Id#", "DisplayName": "资产服务机构报酬", "MethodDisplayName": "费率*计费基准*计费期间*支付比例\/全年天数", "Parameters": [{"DataSourceName": "", "DisplayName": "费率", "ItemValue": "", "Name": "AssetService_Fee_Ratio_#Id#" },{"DataSourceName": "FeeBase", "DisplayName": "计费基准", "ItemValue": "", "Name": "AssetService_Fee_Base_#Id#" },{"DataSourceName": "PeriodBase", "DisplayName": "计费期间", "ItemValue": "", "Name": "AssetService_Fee_CalculatedDays_#Id#" },{"DataSourceName": "", "DisplayName": "全年天数", "ItemValue": "", "Name": "AssetService_Fee_AnnualDays_#Id#" },{"DataSourceName": "", "DisplayName": "支付比例", "ItemValue": "", "Name": "AssetService_Fee_Percent_#Id#" },{"DataSourceName": "", "DisplayName": "支付频率", "ItemValue": "", "Name": "AssetService_Fee_PayFrequence_#Id#" }] },{"ActionCode": "Custodian_Fee_#Id#", "DisplayName": "保管机构报酬", "MethodDisplayName": "计费基准*费率*计费期间\/全年天数", "Parameters": [{"DataSourceName": "", "DisplayName": "费率", "ItemValue": "", "Name": "Custodian_Fee_Ratio_#Id#" },{"DataSourceName": "FeeBase", "DisplayName": "计费基准", "ItemValue": "", "Name": "Custodian_Fee_Base_#Id#" },{"DataSourceName": "PeriodBase", "DisplayName": "计费期间", "ItemValue": "", "Name": "Custodian_Fee_CalculatedDays_#Id#" },{"DataSourceName": "", "DisplayName": "全年天数", "ItemValue": "", "Name": "Custodian_Fee_AnnualDays_#Id#" },{"DataSourceName": "", "DisplayName": "支付频率", "ItemValue": "", "Name": "Custodian_Fee_PayFrequence_#Id#" }] },{"ActionCode": "TrusteeAccount_Fee_#Id#", "DisplayName": "托管机构报酬", "MethodDisplayName": "计费基准*费率*计费期间\/全年天数", "Parameters": [{"DataSourceName": "", "DisplayName": "费率", "ItemValue": "", "Name": "TrusteeAccount_Fee_Ratio_#Id#" },{"DataSourceName": "FeeBase", "DisplayName": "计费基准", "ItemValue": "", "Name": "TrusteeAccount_Fee_Base_#Id#" },{"DataSourceName": "PeriodBase", "DisplayName": "计费期间", "ItemValue": "", "Name": "TrusteeAccount_Fee_CalculatedDays_#Id#" },{"DataSourceName": "", "DisplayName": "全年天数", "ItemValue": "", "Name": "TrusteeAccount_Fee_AnnualDays_#Id#" },{"DataSourceName": "", "DisplayName": "支付频率", "ItemValue": "", "Name": "TrusteeAccount_Fee_PayFrequence_#Id#" }] },{"ActionCode": "ScrutinyAccount_Fee_#Id#", "DisplayName": "监管机构报酬", "MethodDisplayName": "计费基准*费率*计费期间\/全年天数", "Parameters": [{"DataSourceName": "", "DisplayName": "费率", "ItemValue": "", "Name": "ScrutinyAccount_Fee_Ratio_#Id#" },{"DataSourceName": "FeeBase", "DisplayName": "计费基准", "ItemValue": "", "Name": "ScrutinyAccount_Fee_Base_#Id#" },{"DataSourceName": "PeriodBase", "DisplayName": "计费期间", "ItemValue": "", "Name": "ScrutinyAccount_Fee_CalculatedDays_#Id#" },{"DataSourceName": "", "DisplayName": "全年天数", "ItemValue": "", "Name": "ScrutinyAccount_Fee_AnnualDays_#Id#" },{"DataSourceName": "", "DisplayName": "支付频率", "ItemValue": "", "Name": "ScrutinyAccount_Fee_PayFrequence_#Id#" }] },{"ActionCode": "TrusteeRemuneration_Fee_#Id#", "DisplayName": "信托机构报酬", "MethodDisplayName": "计费基准*费率*计费期间\/全年天数", "Parameters": [{"DataSourceName": "", "DisplayName": "费率", "ItemValue": "", "Name": "TrusteeRemuneration_Fee_Ratio_#Id#" },{"DataSourceName": "FeeBase", "DisplayName": "计费基准", "ItemValue": "", "Name": "TrusteeRemuneration_Fee_Base_#Id#" },{"DataSourceName": "PeriodBase", "DisplayName": "计费期间", "ItemValue": "", "Name": "TrusteeRemuneration_Fee_CalculatedDays_#Id#" },{"DataSourceName": "", "DisplayName": "全年天数", "ItemValue": "", "Name": "TrusteeRemuneration_Fee_AnnualDays_#Id#" },{"DataSourceName": "", "DisplayName": "支付频率", "ItemValue": "", "Name": "TrusteeRemuneration_Fee_PayFrequence_#Id#" }] },{"ActionCode": "TaxAccount_Fee_#Id#", "DisplayName": "其他税务", "MethodDisplayName": "按固定值", "Parameters": [{"DataSourceName": "", "DisplayName": "当期发生额", "ItemValue": "", "Name": "TaxAccount_Fee_Value_#Id#" },{"DataSourceName": "", "DisplayName": "支付频率", "ItemValue": "", "Name": "TaxAccount_Fee_PayFrequence_#Id#" }] },{"ActionCode": "InitialRating_Fee_#Id#", "DisplayName": "初始评级费", "MethodDisplayName": "按固定值", "Parameters": [{"DataSourceName": "", "DisplayName": "当期发生额", "ItemValue": "", "Name": "InitialRating_Fee_Value_#Id#" },{"DataSourceName": "", "DisplayName": "支付频率", "ItemValue": "", "Name": "InitialRating_Fee_PayFrequence_#Id#" }] },{"ActionCode": "UnderWriting_Fee_#Id#", "DisplayName": "承销费", "MethodDisplayName": "按固定值", "Parameters": [{"DataSourceName": "", "DisplayName": "当期发生额", "ItemValue": "", "Name": "UnderWriting_Fee_Value_#Id#" },{"DataSourceName": "", "DisplayName": "支付频率", "ItemValue": "", "Name": "UnderWriting_Fee_PayFrequence_#Id#" }] },{"ActionCode": "Lawyer_Fee_#Id#", "DisplayName": "律师费", "MethodDisplayName": "按固定值", "Parameters": [{"DataSourceName": "", "DisplayName": "当期发生额", "ItemValue": "", "Name": "Lawyer_Fee_Value_#Id#" },{"DataSourceName": "", "DisplayName": "支付频率", "ItemValue": "", "Name": "Lawyer_Fee_PayFrequence_#Id#" }] },{"ActionCode": "InitialRegistration_Fee_#Id#", "DisplayName": "初始发行登记费", "MethodDisplayName": "按固定值", "Parameters": [{"DataSourceName": "", "DisplayName": "当期发生额", "ItemValue": "", "Name": "InitialRegistration_Fee_Value_#Id#" },{"DataSourceName": "", "DisplayName": "支付频率", "ItemValue": "", "Name": "InitialRegistration_Fee_PayFrequence_#Id#" }] },{"ActionCode": "LegalService_Fee_#Id#", "DisplayName": "法律服务费", "MethodDisplayName": "按固定值", "Parameters": [{"DataSourceName": "", "DisplayName": "当期发生额", "ItemValue": "", "Name": "LegalService_Fee_Value_#Id#" },{"DataSourceName": "", "DisplayName": "支付频率", "ItemValue": "", "Name": "LegalService_Fee_PayFrequence_#Id#" }] },{"ActionCode": "Accounting_Fee_#Id#", "DisplayName": "会计费", "MethodDisplayName": "按固定值", "Parameters": [{"DataSourceName": "", "DisplayName": "当期发生额", "ItemValue": "", "Name": "Accounting_Fee_Value_#Id#" },{"DataSourceName": "", "DisplayName": "支付频率", "ItemValue": "", "Name": "Accounting_Fee_PayFrequence_#Id#" }] },{"ActionCode": "TaxConsultant_Fee_#Id#", "DisplayName": "税务顾问费", "MethodDisplayName": "按固定值", "Parameters": [{"DataSourceName": "", "DisplayName": "当期发生额", "ItemValue": "", "Name": "TaxConsultant_Fee_Value_#Id#" },{"DataSourceName": "", "DisplayName": "支付频率", "ItemValue": "", "Name": "TaxConsultant_Fee_PayFrequence_#Id#" }] },{"ActionCode": "BusinessTaxeAndAdditional_Fee_#Id#", "DisplayName": "营业税金及附加", "MethodDisplayName": "按固定值", "Parameters": [{"DataSourceName": "", "DisplayName": "当期发生额", "ItemValue": "", "Name": "BusinessTaxeAndAdditional_Fee_Value_#Id#" },{"DataSourceName": "", "DisplayName": "支付频率", "ItemValue": "", "Name": "BusinessTaxeAndAdditional_Fee_PayFrequence_#Id#" }] },{"ActionCode": "TransferFund_Fee_#Id#", "DisplayName": "划款手续费", "MethodDisplayName": "按固定值", "Parameters": [{"DataSourceName": "", "DisplayName": "当期发生额", "ItemValue": "", "Name": "TransferFund_Fee_Value_#Id#" },{"DataSourceName": "", "DisplayName": "支付频率", "ItemValue": "", "Name": "TransferFund_Fee_PayFrequence_#Id#" }] },{"ActionCode": "Audit_Fee_#Id#", "DisplayName": "审计费", "MethodDisplayName": "按固定值", "Parameters": [{"DataSourceName": "", "DisplayName": "当期发生额", "ItemValue": "", "Name": "Audit_Fee_Value_#Id#" },{"DataSourceName": "", "DisplayName": "支付频率", "ItemValue": "", "Name": "Audit_Fee_PayFrequence_#Id#" }] },{"ActionCode": "TrackingRating_Fee_#Id#", "DisplayName": "跟踪评级费", "MethodDisplayName": "按固定值", "Parameters": [{"DataSourceName": "", "DisplayName": "当期发生额", "ItemValue": "", "Name": "TrackingRating_Fee_Value_#Id#" },{"DataSourceName": "", "DisplayName": "支付频率", "ItemValue": "", "Name": "TrackingRating_Fee_PayFrequence_#Id#" }] },{"ActionCode": "Other_Fee_#Id#", "DisplayName": "其他费用", "MethodDisplayName": "按固定值", "Parameters": [{"DataSourceName": "", "DisplayName": "当期发生额", "ItemValue": "", "Name": "Other_Fee_Value_#Id#" },{"DataSourceName": "", "DisplayName": "支付频率", "ItemValue": "", "Name": "Other_Fee_PayFrequence_#Id#" }] }],"DataSources":{"FeeBase": [{"Title": "期初总剩余本金", "Value": "TotalBalance" },{"Title": "期初优先级总剩余本金", "Value": "PriorityTotalBalance" },{"Title": "专项计划总募集资金", "Value": "Collection" },{"Title": "当期利息收入", "Value": "CurrentInterest" }],"PeriodBase": [{"Title": "收款期间", "Value": "CollectionPeriod" },{"Title": "兑付期间", "Value": "PaymentPeriod" }]}}"
//var cashflowjson = { "Json": [{ "ActionCode": "ValueAddedTax_Fee", "DisplayName": "增值税", "Parameters": [{ "DisplayName": "税率", "Name": "ValueAddedTax_Fee_Ratio", "ItemValue": "" }] }, { "ActionCode": "AssetService1_Fee", "DisplayName": "资产服务费优先支付", "Parameters": [{ "DisplayName": "费率", "Name": "AssetService1_Fee_Ratio", "ItemValue": "basic2", "DataSourceName": "Basic" }, { "DisplayName": "全年天数", "Name": "AssetService1_Fee_AnnualDays", "ItemValue": "" }, { "DisplayName": "支付比例", "Name": "AssetService1_Fee_Percent", "ItemValue": "term2", "DataSourceName": "Term" }] }, { "ActionCode": "AssetService2_Fee", "DisplayName": "资产服务费次后支付", "Parameters": [{ "DisplayName": "费率", "Name": "AssetService2_Fee_Ratio", "ItemValue": "" }, { "DisplayName": "全年天数", "Name": "AssetService2_Fee_AnnualDays", "ItemValue": "" }, { "DisplayName": "支付比例", "Name": "AssetService2_Fee_Percent", "ItemValue": "" }] }, { "ActionCode": "Custodian_Fee", "DisplayName": "资金保管机构报酬", "Parameters": [{ "DisplayName": "费率", "Name": "Custodian_Fee_Ratio", "ItemValue": "" }, { "DisplayName": "全年天数", "Name": "Custodian_Fee_AnnualDays", "ItemValue": "" }] }, { "ActionCode": "TrusteeAccount_Fee", "DisplayName": "托管机构报酬", "Parameters": [{ "DisplayName": "费率", "Name": "TrusteeAccount_Fee_Ratio", "ItemValue": "" }, { "DisplayName": "全年天数", "Name": "TrusteeAccount_Fee_AnnualDays", "ItemValue": "" }] }, { "ActionCode": "ScrutinyAccount_Fee", "DisplayName": "监管机构报酬", "Parameters": [{ "DisplayName": "费率", "Name": "ScrutinyAccount_Fee_Ratio", "ItemValue": "" }, { "DisplayName": "全年天数", "Name": "ScrutinyAccount_Fee_AnnualDays", "ItemValue": "" }] }, { "ActionCode": "TrusteeRemuneration_Fee", "DisplayName": "受托机构报酬", "Parameters": [{ "DisplayName": "费率", "Name": "TrusteeRemuneration_Fee_Ratio", "ItemValue": "" }, { "DisplayName": "全年天数", "Name": "TrusteeRemuneration_Fee_AnnualDays", "ItemValue": "" }] }, { "ActionCode": "TaxAccount_Fee", "DisplayName": "其他税务", "Parameters": [{ "DisplayName": "当期税务", "Name": "TaxAccount_Fee_Value", "ItemValue": "" }] }, { "ActionCode": "InitialRating1_Fee", "DisplayName": "初始评级费1", "Parameters": [{ "DisplayName": "当期费用", "Name": "InitialRating1_Fee_Value", "ItemValue": "" }] }, { "ActionCode": "InitialRating2_Fee", "DisplayName": "初始评级费2", "Parameters": [{ "DisplayName": "当期费用", "Name": "InitialRating2_Fee_Value", "ItemValue": "" }] }, { "ActionCode": "InitialRating3_Fee", "DisplayName": "初始评级费3", "Parameters": [{ "DisplayName": "当期费用", "Name": "InitialRating3_Fee_Value", "ItemValue": "" }] }, { "ActionCode": "UnderWriting_Fee", "DisplayName": "承销费", "Parameters": [{ "DisplayName": "当期费用", "Name": "UnderWriting_Fee_Value", "ItemValue": "" }] }, { "ActionCode": "Lawyer_Fee", "DisplayName": "律师费", "Parameters": [{ "DisplayName": "当期费用", "Name": "Lawyer_Fee_Value", "ItemValue": "" }] }, { "ActionCode": "InitialRegistration_Fee", "DisplayName": "初始发行登记费", "Parameters": [{ "DisplayName": "当期费用", "Name": "InitialRegistration_Fee_Value", "ItemValue": "" }] }, { "ActionCode": "LegalService_Fee", "DisplayName": "法律服务费", "Parameters": [{ "DisplayName": "当期费用", "Name": "LegalService_Fee_Value", "ItemValue": "" }] }, { "ActionCode": "Accounting_Fee", "DisplayName": "会计费", "Parameters": [{ "DisplayName": "当期费用", "Name": "Accounting_Fee_Value", "ItemValue": "" }] }, { "ActionCode": "TaxConsultant_Fee", "DisplayName": "税务顾问费", "Parameters": [{ "DisplayName": "当期费用", "Name": "TaxConsultant_Fee_Value", "ItemValue": "" }] }, { "ActionCode": "BusinessTaxeAndAdditional_Fee", "DisplayName": "营业税金及附加", "Parameters": [{ "DisplayName": "当期费用", "Name": "BusinessTaxeAndAdditional_Fee_Value", "ItemValue": "" }] }, { "ActionCode": "Agency_Fee", "DisplayName": "代理机构报酬", "Parameters": [{ "DisplayName": "当期费用", "Name": "Agency_Fee_Value", "ItemValue": "" }] }, { "ActionCode": "TransferFund_Fee", "DisplayName": "划款手续费", "Parameters": [{ "DisplayName": "当期费用", "Name": "TransferFund_Fee_Value", "ItemValue": "" }] }, { "ActionCode": "Audit_Fee", "DisplayName": "审计费", "Parameters": [{ "DisplayName": "当期费用", "Name": "Audit_Fee_Value", "ItemValue": "" }] }, { "ActionCode": "TrackingRating1_Fee", "DisplayName": "跟踪评级费1", "Parameters": [{ "DisplayName": "当期费用", "Name": "TrackingRating1_Fee_Value", "ItemValue": "" }] }, { "ActionCode": "TrackingRating2_Fee", "DisplayName": "跟踪评级费2", "Parameters": [{ "DisplayName": "当期费用", "Name": "TrackingRating2_Fee_Value", "ItemValue": "" }] }, { "ActionCode": "TrackingRating3_Fee", "DisplayName": "跟踪评级费3", "Parameters": [{ "DisplayName": "当期费用", "Name": "TrackingRating3_Fee_Value", "ItemValue": "" }] }, { "ActionCode": "Reimbursement_Withinlimit_Fee", "DisplayName": "优先支付上限费用", "Parameters": [{ "DisplayName": "当期费用", "Name": "Reimbursement_Withinlimit_Fee_Value", "ItemValue": "" }] }, { "ActionCode": "Reimbursement_Beyondlimit_Fee", "DisplayName": "优先支付上限费用", "Parameters": [{ "DisplayName": "当期费用", "Name": "Reimbursement_Beyondlimit_Fee_Value", "ItemValue": "" }] }, { "ActionCode": "Other_Fee", "DisplayName": "其他费用", "Parameters": [{ "DisplayName": "当期费用", "Name": "Other_Fee_Value", "ItemValue": "" }] }], DataSources: { Basic: [{ Value: "basic1", Title: 'bbb' }, { Value: "basic2", Title: "ccc" }], Term: [{ Value: "term1", Title: 'a' }, { Value: "term2", Title: "b" }] } };
var PageSettings = { DataSources: {} };
function getOptionsSource(code) {
    return PageSettings.DataSources[code];
}

function getFeeSource(code) {
    var actiontypecode = code.substr(0, code.lastIndexOf('_'));
    return feeTypeListModel[actiontypecode]['FeeList'];
}

function feeAddToModel(obj, p1, p2, p3) {
    if (!obj['FeeList']) obj['FeeList'] = {};
    if (!obj['FeeList'][p1]) obj['FeeList'][p1] = {};
    obj['FeeList'][p1]['ActionCode'] = p1;
    obj['FeeList'][p1]['DisplayName'] = p2;
    obj['FeeList'][p1]['actionindex'] = p3;
}

function feeDisplayAddToModel(obj, p1, p2, p3, p4) {
    if (!obj[p1]) obj[p1] = {};
    obj[p1]['DisplayName'] = p1;
    obj[p1]['ActionCode'] = p2;
    obj[p1]['actionindex'] = p3;
    obj[p1]['ActionTypeCode'] = p4;
}

function feeActionDisplayNameSelect(event, ui, obj) {
    var dataIndex = $(obj).attr('dataIndex');
    setDisplayName(dataIndex, $(obj).val());
}
function setDisplayName(dataIndex, displayName) {
    var item = viewModel.Json()[dataIndex];
    item.DisplayName(displayName);
}

function feeActionDisplayNameChange(event, ui, obj) {
    //console.log(obj);
    //console.log(feeTypeListModel);
    //1  对改制前元素的处理
    var oldvalue = $(obj).attr('oldvalue');
    var dataIndex = $(obj).attr('dataIndex');
    setDisplayName(dataIndex, $(obj).val());
    var actiontypecode = feeTypeDisplayListModel[oldvalue]['ActionTypeCode'];

    var isCurPageNew = false;

    if (feeTypeDisplayListModel[oldvalue] && feeTypeDisplayListModel[oldvalue]['ActionTypeCode'] &&
feeTypeListModel[feeTypeDisplayListModel[oldvalue]['ActionTypeCode']]['initactionindex'] &&
parseInt(feeTypeDisplayListModel[oldvalue]['actionindex']) >
 parseInt(feeTypeListModel[feeTypeDisplayListModel[oldvalue]['ActionTypeCode']]['initactionindex'])) {
        isCurPageNew = true;
        var actioncode = feeTypeDisplayListModel[oldvalue]['ActionCode'];
        feeTypeListModel[actiontypecode]['FeeList'] = destroy(feeTypeListModel[actiontypecode]['FeeList'], actioncode);

        //todo:逻辑似乎否正确：待查证，验证
        feeTypeDisplayListModel = destroy(feeTypeDisplayListModel, oldvalue);
    }
    //console.log(feeTypeDisplayListModel);
    //2  对新元素的处理
    //如果是已有元素，则判断页面上，是否已经存在，如果以存在，则提示
    //把已有元素的id拿过来，把新元素的feeid和pid修改了
    //else 把元素，按照新增加元素处理。把所有id都用新的，可复制点击加号时的操作
    var displayName = $(obj).val();
    if (feeTypeDisplayListModel[displayName]) {
        var actioncode = feeTypeDisplayListModel[displayName]['ActionCode'];
        var feeTypeItem = feeTypeListModel[actiontypecode]['FeeList'][actioncode];
        var feeTypeItemIndex = feeTypeItem['actionindex'];
        var item = viewModel.Json()[dataIndex];
        item.ActionCode(actiontypecode + '_' + feeTypeItemIndex);
        $.each(item.Parameters(), function (i, n) {
            var typename = n.Name().substr(0, n.Name().lastIndexOf('_'));
            n.Name(typename + '_' + feeTypeItemIndex);
        });
    } else {
        if (true || isCurPageNew == true) {
            //直接修改当前的选项为新增值
            var itemTmp = viewModel.Json()[dataIndex];
            //var item = ko.toJS(itemTmp);

            var item = ko.toJS(feeTypeListModel[actiontypecode]['item']);
            var actionindex = parseInt(feeTypeListModel[actiontypecode]['actionindex']) + 1;
            item.ActionCode = ReplaceIndex(item.ActionCode, '#Id#', actionindex);
            item.DisplayName = displayName;
            $.each(item.Parameters, function (i, n) {
                n.Name = ReplaceIndex(n.Name, '#Id#', actionindex);
            })
            addItem(item, actionindex, actiontypecode);


            removeItem(itemTmp, oldvalue);
            viewModel.Json.remove(itemTmp);
            item = ko.mapping.fromJS(item);
            viewModel.Json.push(item);
        }
    }
    reBindingAutoCompleteBox(actiontypecode);
}

function addItem(item, actionindex, actiontypecode) {
    feeTypeListModel[actiontypecode]['actionindex'] = actionindex;
    feeAddToModel(feeTypeListModel[actiontypecode], item.ActionCode, item.DisplayName, actionindex);
    feeDisplayAddToModel(feeTypeDisplayListModel, item.DisplayName, item.ActionCode, actionindex, actiontypecode);
}

function removeItem(item, delDisplayName) {
    if (delDisplayName == null || typeof (delDisplayName) == 'undefined') delDisplayName = item.DisplayName();
    var actiontypecode = item.ActionCode().substr(0, item.ActionCode().lastIndexOf('_'));
    var actiontypeindex = item.ActionCode().substr(item.ActionCode().lastIndexOf('_') + 1);
    var initactionindexmax = parseInt(feeTypeListModel[actiontypecode]['initactionindex']);
    if (parseInt(actiontypeindex) > parseInt(initactionindexmax)) {
        var actionindexmax = parseInt(feeTypeListModel[actiontypecode]['actionindex']);
        if (actiontypeindex == actionindexmax)
            feeTypeListModel[actiontypecode]['actionindex'] = parseInt(actiontypeindex) - 1;
        feeTypeListModel[actiontypecode]['FeeList'] = destroy(feeTypeListModel[actiontypecode]['FeeList'], item.ActionCode());
        feeTypeDisplayListModel = destroy(feeTypeDisplayListModel, delDisplayName);
    }
}

$(function () {
    getPeriodsDates();
    getCashFlowFeeModelFromFile();

    $('#addShowColumn').click(function () {
        var dataindex = $('#feeSelect option:selected').attr('dataIndex');
        
        if (viewModel.Hide().length > parseInt(dataindex)) {
            var itemTmp = viewModel.Hide()[dataindex];
            var item = ko.toJS(itemTmp);

            var actiontypecode = item.ActionCode.substr(0, item.ActionCode.lastIndexOf('_'));
            var actionindex = parseInt(feeTypeListModel[actiontypecode]['actionindex']) + 1;
            item.ActionCode = ReplaceIndex(item.ActionCode, '#Id#', actionindex);
            item.DisplayName = item.DisplayName + '-' + actionindex;
            $.each(item.Parameters, function (i, n) {
                n.Name = ReplaceIndex(n.Name, '#Id#', actionindex);
            })

            feeTypeListModel[actiontypecode]['actionindex'] = actionindex;
            feeAddToModel(feeTypeListModel[actiontypecode], item.ActionCode, item.DisplayName, actionindex);
            feeDisplayAddToModel(feeTypeDisplayListModel, item.DisplayName, item.ActionCode, actionindex, actiontypecode);

            item = ko.mapping.fromJS(item);
            viewModel.Json.push(item);

            reBindingAutoCompleteBox(actiontypecode);
        }
    });
    $("#removeShowColumn").live('click', function () {
        var dataindex = $(this).attr("dataIndex");
        if (viewModel.Json().length > parseInt(dataindex)) {
            var item = viewModel.Json()[dataindex];

            var actiontypecode = item.ActionCode().substr(0, item.ActionCode().lastIndexOf('_'));
            var actiontypeindex = item.ActionCode().substr(item.ActionCode().lastIndexOf('_') + 1);
            var initactionindexmax = parseInt(feeTypeListModel[actiontypecode]['initactionindex']);
            if (parseInt(actiontypeindex) > parseInt(initactionindexmax)) {
                var actionindexmax = parseInt(feeTypeListModel[actiontypecode]['actionindex']);
                if (actiontypeindex == actionindexmax)
                    feeTypeListModel[actiontypecode]['actionindex'] = parseInt(actiontypeindex) - 1;
                feeTypeListModel[actiontypecode]['FeeList'] = destroy(feeTypeListModel[actiontypecode]['FeeList'], item.ActionCode());
                feeTypeDisplayListModel = destroy(feeTypeDisplayListModel, item.DisplayName());
            }
            viewModel.Json.remove(item);
            reBindingAutoCompleteBox(actiontypecode);
        }
    });

    RemoveColButtomSHEvent();
    RemoveColButtomSH(isShowRemove);
})

function getPeriodsDates() {
    var executeParam = {
        'SPName': "usp_GetTrustTransactionInputFilterMetaData", 'SQLParams': [
            { 'Name': 'TrustId', 'Value': trustId, 'DBType': 'int' }
        ]
    };

    var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";//appDomain=TrustManagement&executeParams=" + context;

    var response = ExecuteGetData(false, serviceUrl, 'TrustManagement', executeParam);

    if (typeof response == "string")
        response = jQuery.parseJSON(response);

    $.each(response, function (n, res) {
        //var end = res.OptionValue ? getStringDate(res.OptionValue).dateFormat('yyyy-MM-dd') : '';
        //var endText = res.OptionText ? getStringDate(res.OptionText).dateFormat('yyyy-MM-dd') : '';
        //var end = timeStamp2String(new Date(eval(res.EndDate.replace("/Date(", "").replace(")/", ""))));
        //peridArray[n] = end;
        $("#dateSelect").append(("<option value='{0}'>{1}</option>").StringFormat(res.OptionValue, res.OptionText));
    });
}

function getCashFlowFeeModelFromFile() {
    var filePath = "E:\\TSSWCFServices\\TrustManagementService\\UITaskStudio\\Models\\ZhaoShang\\CashFlowFeeModel.Xml";
    var serviceUrl = GlobalVariable.DataProcessServiceUrl + "/GetFeesFromXMLFile?FilePath=" + filePath;
    $.ajax({
        url: serviceUrl,
        type: "GET",
        contentType: "application/json; charset=utf-8",
        dataType: "jsonp",
        crossDomain: true,
        success: function (response) {
            var jsonSource = jQuery.parseJSON(response);
            PageSettings.DataSources = jsonSource.DataSources;
            //var jsonSource = {};
            jsonSource.Hide = jsonSource.Json;
            // start 把模型的基础数据，加载到内存中。后面当作默认数据，如果以后有默认数据依然可用
            $.each(jsonSource.Hide, function (index, item) {
                //item.SeqNo = index;
                item.DataType = 'autocomplete';
                $.each(item.Parameters, function (i, n) {
                    if (n.DataSourceName) n.DataType = 'select';
                    else n.DataType = '';
                })
                if (!item.MethodDisplayName) item.MethodDisplayName = '';
                item.FeeTypeDisplayName = item.DisplayName;

                if (!feeTypeListModel[item.ActionCode]) {
                    var actiontypecode = item.ActionCode.substr(0, item.ActionCode.lastIndexOf('_'));
                    feeTypeListModel[actiontypecode] = {};
                    feeTypeListModel[actiontypecode]['actionindex'] = 0;
                    feeTypeListModel[actiontypecode]['initactionindex'] = 0;
                    feeTypeListModel[actiontypecode]['item'] = item;
                }
            })
            jsonSource.Json = [];
            // end
            var node = document.getElementById("rootNode");
            viewModel = ko.mapping.fromJS(jsonSource);
            UpdateViewModel(function () {
                ko.applyBindings(viewModel, node);
                reBindingAutoCompleteBox();
            })
        },
        error: function (response) {
            alert("error:" + response);
        }
    });
}

function UpdateViewModel(callback) {
    getTrustFeeList(function (_dataList) {
        if (viewModel.Json) viewModel.Json.removeAll();

        $.each(feeTypeListModel, function (i, n) {
            n.actionindex = 0;
            n.initactionindex = 0;
            n.FeeList = {};
        })
        feeTypeDisplayListModel = {};
        //$.each(feeTypeDisplayListModel, function (i, n) {
        //    n = {};
        //})

        $.each(_dataList, function (i, n) {
            var code = n.TrustFeeName;

            var actiontypecode = code.substr(0, code.lastIndexOf('_'));
            var actiontypeindex = code.substr(code.lastIndexOf('_') + 1);

            if (feeTypeListModel[actiontypecode]) {
                if (!feeTypeListModel[actiontypecode]['FeeList']) feeTypeListModel[actiontypecode]['FeeList'] = {};
                feeAddToModel(feeTypeListModel[actiontypecode], n.TrustFeeName, n.TrustFeeDisplayName, actiontypeindex);

                if (feeTypeListModel[actiontypecode]['actionindex'] == null ||
                typeof feeTypeListModel[actiontypecode]['actionindex'] == 'undefined' ||
                parseInt(feeTypeListModel[actiontypecode]['actionindex']) < actiontypeindex) {
                    feeTypeListModel[actiontypecode]['actionindex'] = actiontypeindex;
                    feeTypeListModel[actiontypecode]['initactionindex'] = actiontypeindex;
                }
            }

            //if (feeTypeListModel[actiontypecode] && feeTypeListModel[actiontypecode]['actionindex'] != null &&
            //                typeof feeTypeListModel[actiontypecode]['actionindex'] != 'undefined' &&
            //                parseInt(feeTypeListModel[actiontypecode]['actionindex']) < actiontypeindex) {
            //    feeTypeListModel[actiontypecode]['actionindex'] = actiontypeindex;
            //    feeTypeListModel[actiontypecode]['initactionindex'] = actiontypeindex;

            //    if (!feeTypeListModel[actiontypecode]['FeeList']) feeTypeListModel[actiontypecode]['FeeList'] = {};
            //    feeAddToModel(feeTypeListModel[actiontypecode], n.TrustFeeName, n.TrustFeeDisplayName, actiontypeindex);
            //}

            if (!feeTypeDisplayListModel[n.TrustFeeDisplayName]) feeTypeDisplayListModel[n.TrustFeeDisplayName] = {};
            feeDisplayAddToModel(feeTypeDisplayListModel, n.TrustFeeDisplayName, n.TrustFeeName, actiontypeindex, actiontypecode);
        })

        //console.log(feeTypeListModel);

        getTrustFee(function (_data) {
            var dataJson = {};
            $.each(_data, function (index, item) {
                if (!dataJson[item.TrustFeeName]) {
                    dataJson[item.TrustFeeName] = {};
                    dataJson[item.TrustFeeName]["ActionCode"] = item.TrustFeeName;
                    dataJson[item.TrustFeeName]["DisplayName"] = item.TrustFeeDisplayName;
                    dataJson[item.TrustFeeName]["Parameters"] = {};
                }
                dataJson[item.TrustFeeName]["Parameters"][item.ItemCode] = item.ItemValue;
            })

            $.each(dataJson, function (index, item) {
                var actioncode = item.ActionCode;
                var actiontypecode = actioncode.substr(0, actioncode.lastIndexOf('_'));
                var actiontypeindex = actioncode.substr(actioncode.lastIndexOf('_') + 1);
                var fee = feeTypeListModel[actiontypecode];
                if (!fee || !fee.item) { // if fee is undefined or null, it will skip it.
                    return true;
                }
                var tmp = ko.mapping.fromJS(fee.item);
                tmp.ActionCode(ReplaceIndex(tmp.ActionCode(), '#Id#', actiontypeindex));
                tmp.DisplayName(item.DisplayName ? item.DisplayName : tmp.DisplayName());
                $.each(tmp.Parameters(), function (i, n) {
                    n.Name(ReplaceIndex(n.Name(), '#Id#', actiontypeindex));
                    n.ItemValue(item.Parameters[n.Name()] ? item.Parameters[n.Name()] : '');
                });
                viewModel.Json.push(tmp);
                //feeTypeListModel[actiontypecode]['actionindex'] = parseInt(actiontypeindex);
            });
            /* 
             * 针对ie下表单双change事件(Knockout默认表单值更新监控采用了onchange)引起表单无光标问题的替代方案
             * 这个方案不是最好的，推荐使用subscribe来订阅改变
             * 在viewModel中添加validControlValue方法，替代 onchange="validControlValue(this)"
             */
            viewModel.validControlValue = function (o,e) {
                var TrustMngmtRegxCollection = {
                    int: /^([-]?[1-9]+\d*$|^0)?$/,
                    decimal: /^([-]?[1-9]+\d*(\.{1}\d+){0,1}$|^[-]{1}0\.\d*[1-9]\d*$|^0(\.\d+)?)?$/,
                    date: /^((\d{4})-(\d{2})-(\d{2}))?$/,
                    datetime: /^((\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2}))?$/
                };
                var $this = $(e.srcElement),
                    objValue = o.ItemValue(),
                    valids = $this.attr('data-valid');

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


            if (callback)
                callback();
        })
    });
}

function getTrustFee(callback) {
    var selectDate = $("#dateSelect").val();
    var executeParam = {
        'SPName': "usp_GetTrustFee", 'SQLParams': [
                  { 'Name': 'TrustId', 'Value': trustId, 'DBType': 'int' }
                , { 'Name': 'TransactionDate', 'Value': selectDate, 'DBType': 'string' }
        ]
    };
    var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";//appDomain=TrustManagement&executeParams=" + context;

    ExecuteGetData(true, serviceUrl, 'TrustManagement', executeParam, function (data) {
        if (callback)
            callback(data);
    });
}

function getTrustFeeList(callback) {
    var selectDate = $("#dateSelect").val();
    var executeParam = {
        'SPName': "usp_GetTrustFeeById", 'SQLParams': [
                  { 'Name': 'TrustId', 'Value': trustId, 'DBType': 'int' }
        ]
    };
    var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";//appDomain=TrustManagement&executeParams=" + context;

    ExecuteGetData(true, serviceUrl, 'TrustManagement', executeParam, function (data) {
        if (callback)
            callback(data);
    });
}

var timeStamp2String = function (time) {
    var datetime = new Date();
    datetime.setTime(time);
    var year = datetime.getFullYear();
    var month = datetime.getMonth() + 1 < 10 ? "0" + (datetime.getMonth() + 1) : datetime.getMonth() + 1;
    var date = datetime.getDate() < 10 ? "0" + datetime.getDate() : datetime.getDate();
    return year + "-" + month + "-" + date;
}
function dateSelectChange() {
    UpdateViewModel(function () {
        reBindingAutoCompleteBox();
    });
}

function ValidationFeeList() {
    //addClass('red-border');
    var result = true;
    var selector = 'input[validatetype="autocomplete"]';
    var selectora = 'input[validatetype="autocomplete"] ~ a';
    $(selector).removeClass('red-border-left');
    $(selectora).removeClass('red-border-right');

    var dislayNameList = [];
    var errorList = [];
    $.each(viewModel.Json(), function (i, n) {
        if ($.inArray(n.DisplayName(), dislayNameList) < 0) dislayNameList.push(n.DisplayName());
        else errorList.push(n.DisplayName());
    })
    $.each(errorList, function (i, n) {
        $(selector + '[text="' + n + '"]').addClass('red-border-left');
        $(selector + '[text="' + n + '"] ~ a').addClass('red-border-right');
    });
    $.each($(selector), function (i, n) {
        if ($.inArray($(n).val(), errorList) >= 0) {
            result = false;
            $(n).addClass('red-border-left');
            $(n).find('~ a').addClass('red-border-right');
        }
        if ($.trim($(n).val()) == '') {
            result = false;
            $(n).addClass('red-border-left');
            $(n).find('~ a').addClass('red-border-right');
        }
    })

    return result;
}


function warnUser(Obj)
{
    if (Obj.checked)
    {
        alert("确认向后覆盖将会使本期之后的费用设置与当期一致，请慎重选择！");
    }
}

function SaveFee() {

    if (!ValidationFeeList()) { alert('费用名称相同或为空，请检查'); return; }

    var selectDate = $("#dateSelect").val();
    var isApplyAfter = $('#IsApplyAfter')[0].checked;
    var dataModel = ko.mapping.toJS(viewModel);
    var items = '<items>';
    
    if (isApplyAfter)
    {
        var returnBoolValue = confirm("确认向后覆盖将会使本期之后的费用设置与当期一致，请慎重选择！");
    }

    if ((!isApplyAfter) || (returnBoolValue))
    {
        $.each(dataModel.Json, function (n, fee) {
            var feeName = fee.ActionCode;
            $.each(fee.Parameters, function (x, para) {
                items += '<item>';
                items += '<TrustFeeName>' + feeName + '</TrustFeeName>';
                items += '<TrustFeeDisplayName>' + fee.DisplayName + '</TrustFeeDisplayName>';
                items += '<ItemCode>' + para.Name + '</ItemCode>';
                items += '<ItemValue>' + para.ItemValue + '</ItemValue>';
                items += '</item>';
            })
        })
        items += '</items>';
        var executeParam = {
            SPName: 'usp_SaveTrustFee', SQLParams: [
                { Name: 'TrustId', value: trustId, DBType: 'int' },
                { Name: 'TrustTransactionDate', value: selectDate, DBType: 'date' },
                { Name: 'Items', value: items, DBType: 'xml' },
                { Name: 'IsApplyAfter', value: isApplyAfter, DBType: 'bool' }
            ]
        };
        var result = ExecuteRemoteData(executeParam, function (data) {
            if (data == true || data == false) {//result = cmd.ExecuteNonQuery() > 0;所以，这里不报错就OK
                alert('保存成功！');
                UpdateViewModel(function () {
                    reBindingAutoCompleteBox();
                });
            } else {
                alert('数据提交保存时出现错误！');
            }
        });
        //if (result[0].Result) {
        //    alert('保存成功！');
        //} else {
        //    alert('数据提交保存时出现错误！');
        //}
    }   
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


    //$.ajax({
    //    cache: false,
    //    type: "POST",
    //    async: false,
    //    url: GlobalVariable.DataProcessServiceUrl + 'CommonPostExecute',//?appDomain=TrustManagement&postType=&streamIdentity=',
    //    dataType: "json",
    //    contentType: "application/xml;charset=utf-8",
    //    data: params,//'appDomain': 'TrustManagement', 'executeParams': executeParams, 'postType': 'commom', 'streamIdentity': '' },
    //    success: function (response) {
    //        if (typeof response === 'string') { sourceData = JSON.parse(response); }
    //        else { sourceData = response; }
    //    },
    //    error: function (response) { alert('Error occursed while requiring the remote source data!'); }
    //});
    //return sourceData;
}

function SortViewModel() {

    viewModel.Hide.sort(function (left, right) {
        return left.SeqNo() == right.SeqNo() ? 0 : (left.SeqNo() < right.SeqNo() ? -1 : 1);
    })
}

var isShowRemove = false;
function RemoveColButtomSHEvent() {
    $("#RemoveColButtomSH").click(function () {
        var $this = $(this);
        isShowRemove = !isShowRemove;
        if (isShowRemove == true)
            $this.text("隐藏删除按钮");
        else
            $this.text("显示删除按钮");
        RemoveColButtomSH(isShowRemove);
    });
}
function RemoveColButtomSH(show) {
    var sytles = document.CSSStyleSheet ? document.CSSStyleSheet : document.styleSheets;
    $.each(sytles, function (i, sheet) {
        if (sheet.href.indexOf("FeeSettings.css") > -1) {
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

function ReplaceIndex(str, oldchart, newchart) {
    return str.replace(oldchart, newchart);
}

function reBindingAutoCompleteBox(actionTYpeCode) {
    var type = 'select[type="autocomplete"]';
    if (actionTYpeCode) type += '[id^="' + actionTYpeCode + '"]';

    $.each($(type), function (i, n) {
        var actioncode = $(type).attr('id');
        var optionsSource = getFeeSource(actioncode);
        optionsSource = reBindFilter(optionsSource);

        var op = '';
        $.each(optionsSource, function (i, option) {
            if (option)
                op += '<option value="' + option.ActionCode + '">' + option.DisplayName + '</option>';
        });
        $(n).html(op);
    });
}

function reBindFilter(feelist) {
    var had = [];
    $.each(viewModel.Json(), function (i, n) {
        if ($.inArray(n.ActionCode(), had) < 0) had.push(n.ActionCode());
    })

    var result = {};
    for (var fee in feelist) {
        if ($.inArray(fee, had) < 0) result[fee] = feelist[fee];
    }
    return result;
}

function destroy(obj, name) {
    var result = {};
    for (var o in obj) {
        if (o != name) result[o] = obj[o];
    }
    return result;
}