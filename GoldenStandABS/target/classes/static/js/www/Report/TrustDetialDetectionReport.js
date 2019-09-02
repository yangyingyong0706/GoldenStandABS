define(function (require) {
    var $ = require('jquery');
    var gv = require('globalVariable');
    var common = require('common');
    require('kendo.all.min');
    require('kendomessagescn');
    var webStorage = require("gs/webStorage");
    var userName = webStorage.getItem('gs_UserName');   
    var height = $(window).height() - 105;
    var g_DataSource;

    function renderGrid(data) {
        g_DataSource = data;
        $("#reportGetTrustGrid").html("");
        var grid = $("#reportGetTrustGrid").kendoGrid({
            dataSource: g_DataSource,
            height: height,
            filterable: true,
            sortable: true,
            columnMenu: false,//可现实隐藏列
            reorderable: true,//可拖动改变列位置
            //groupable: true,//可拖动分组
            resizable: true,//可拖动改变列大小
            selectable: 'row',
            excel: {
                allPages: true,//是否导出所有页中的数据
                fileName: "产品月度检测表.xlsx"
            },
            pageable: {
                refresh: false,
                pageSizes: true,
                buttonCount: 5,
                page: 1,
                pageSize: 20,
                pageSizes: [20, 50, 100, 500]
            },
            columns: [
                {
                    field: "TrustCode", title: "产品代码",
                    locked: true,//固定列
                    lockable: false,
                    width: "250px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" }
                },
                {
                    field: "TrustName", title: "专项计划名称（全称）",
                    locked: true,//固定列
                    lockable: false,
                    width: "250px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" }
                },
                { field: "StartDate", title: "计划设立日期", width: "150px", type: "date", format: "{0:yyyy-MM-dd}", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                { field: "DueDate", title: "计划到期日期", width: "150px", type: "date", format: "{0:yyyy-MM-dd}", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                { field: "Duration", title: "存续期(月)", type: "number", width: "120px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                { field: "EndDate", title: "计划结束日期", width: "150px", type: "date", format: "{0:yyyy-MM-dd}", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                { field: "ActuallyDuration", title: "实际存续期（月）", width: "150px", type: "number", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                { field: "IsTerminationThisTimes", title: "是否当期结束", width: "150px", template: "#=IsTerminationThisTimes==null?' ':(IsTerminationThisTimes?'是':'否')#", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                { field: "IsEarlyTermination", title: "是否提前终止", width: "150px", template: "#=IsTerminationThisTimes==null?' ':(IsEarlyTermination?'是':'否')#", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                { field: "Manager", title: "管理人", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                { field: "SalesOrganization", title: "销售机构", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                { field: "OriginatorName", title: "原始权益人名称", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                { field: "IsSpecificOriginator", title: "是否特定原始权益人", width: "150px", template: "#=IsTerminationThisTimes==null?' ':(IsSpecificOriginator?'是':'否')#", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                { field: "OriginatorExternalRating", title: "原始权益人外部评级", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                { field: "OriginatorNature", title: "原始权益人企业所有制性质", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                { field: "OriginatorArea", title: "原始权益人所属地区", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                { field: "Originatorindustry", title: "原始权益人所属行业", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                { field: "ImportantDebtorNumber", title: "重要债务人个数", type: "number", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                { field: "ImportantDebtorName", title: "重要债务人名称", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                { field: "OriginatorinAssetliabilityRatio", title: "原始权益人最近一年资产负债率%", width: "150px", type: "number", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                { field: "OriginatorinROE", title: "原始权益人最近一年净资产收益率%", type: "number", width: "150px", type: "number", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                { field: "OriginatorinLiquidityRatio", title: "原始权益人最近一年流动比率%", type: "number", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                { field: "OriginatorinFinancingAmount", title: "原始权益人最近一年融资发生额（万元）", type: "number", template: "#=!!OriginatorinFinancingAmount!=0?(kendo.toString(OriginatorinFinancingAmount,'N2')):''#", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                { field: "OriginatorinDirectFinancing", title: "其中：直接融资金额（万元）", width: "150px", type: "number", template: "#=!!OriginatorinDirectFinancing!=0?(kendo.toString(OriginatorinDirectFinancing,'N2')):''#", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                { field: "OriginatorinIndirectFinancing", title: "其中：间接融资金额（万元）", width: "150px", type: "number", template: "#=!!OriginatorinIndirectFinancing!=0?(kendo.toString(OriginatorinIndirectFinancing,'N2')):''#", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                { field: "OriginatorinRefundAmount", title: "原始权益人最近一年偿还融资金额（万元）", width: "150px", type: "number", template: "#=!!OriginatorinRefundAmount!=0?(kendo.toString(OriginatorinRefundAmount,'N2')):''#", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                { field: "OriginatorinFinancingBalance", title: "原始权益人最近一年融资余额（万元）", width: "150px", type: "number", template: "#=!!OriginatorinFinancingBalance!=0?(kendo.toString(OriginatorinFinancingBalance,'N2')):''#", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                { field: "OriginatorinGuaranteedAmount", title: "原始权益人对外担保金额（万元）", width: "150px", type: "number", template: "#=!!OriginatorinGuaranteedAmount!=0?(kendo.toString(OriginatorinGuaranteedAmount,'N2')):''#", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                { field: "OriginatorinGuaranteedAmountProportion", title: "原始权益人对外担保金额占净资产比例%", width: "150px", type: "number", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                { field: "AssetServicingOrganization", title: "资产服务机构", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                { field: "OriginatorAuditfirm", title: "特定原始权益人审计事务所", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                { field: "TrustAuditfirm", title: "专项计划审计事务所", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                { field: "LawOffice", title: "律师事务所", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                { field: "RatingAgency", title: "评级机构全称", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                { field: "AppraisalAgency", title: "评估机构全称", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                { field: "CashFlowPredictionAgency", title: "现金流预测机构", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                { field: "SecuritiesRegistrationAgency", title: "证券登记托管机构", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                { field: "UnderlyingAssetsTypeFirst", title: "基础资产类型（一级）", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                { field: "UnderlyingAssetsTypeSecond", title: "基础资产类型（二级）", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                { field: "UnderlyingAssetsTypeThird", title: "基础资产类型（三级）", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                { field: "TrustMode", title: "模式", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                { field: "IsOutRisk", title: "是否出表", width: "150px", template: "#=IsTerminationThisTimes==null?' ':(IsOutRisk?'是':'否')#", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                { field: "IsCycleBuy", title: "是否循环购买", width: "150px", template: "#=IsTerminationThisTimes==null?' ':(IsCycleBuy?'是':'否')#", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                { field: "CycleBuyFrequency", title: "循环购买频率", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                { field: "NowCycleBuyTimes", title: "计划设立至报告期末循环购买次数", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                { field: "IsListed", title: "是否挂牌", width: "150px", template: "#=IsTerminationThisTimes==null?' ':(IsListed?'是':'否')#", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                { field: "ListedPlace", title: "拟挂牌场所", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                { field: "GetConfirmingOrder", title: "取得无异议函日期", width: "150px", type: "date", format: "{0:yyyy-MM-dd}", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                { field: "ListedDate", title: "挂牌日期", width: "150px", type: "date", format: "{0:yyyy-MM-dd}", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                { field: "DssueScale", title: "发行规模（万元）", width: "150px", type: "number", template: "#=!!DssueScale!=0?(kendo.toString(DssueScale,'N2')):''#", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                { field: "Yield", title: "加权平均发行利率（%）", width: "150px", type: "number", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                { field: "PaymentFrequency", title: "付息频率", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                { field: "DebtWay", title: "本金偿还方式", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                { field: "BeginUnderlyingAssetsContractQuantity", title: "基础资产合同笔数（设立）", type: "number", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                { field: "NowUnderlyingAssetsContractQuantity", title: "基础资产合同笔数（存续）", type: "number", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                { field: "CashFlowCoveringMultiple", title: "预计计划现金流覆盖倍数", width: "150px", type: "number", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                { field: "CashFlowFirstCoveringMultiple", title: "预计优先级现金流覆盖倍数", width: "150px", type: "number", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                { field: "ActuallyCashFlowCoveringMultiple", title: "实际计划现金流覆盖倍数", width: "150px", type: "number", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                { field: "ActuallyCashFlowFirstCoveringMultiple", title: "实际优先级现金流覆盖倍数", width: "150px", type: "number", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                { field: "CumulativeOverdueRate", title: "累计逾期率%", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                { field: "PrincipalDistributionScale", title: "已偿本金规模（万元）", width: "150px", type: "number", template: "#=!!PrincipalDistributionScale!=0?(kendo.toString(PrincipalDistributionScale,'N2')):''#", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                { field: "SurplusDistributionScale", title: "未偿本金规模（万元）", width: "150px", type: "number", template: "#=!!SurplusDistributionScale!=0?(kendo.toString(SurplusDistributionScale,'N2')):''#", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                { field: "DistributionProportion", title: "本金兑付比例%", width: "150px", type: "number", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                { field: "LiquidationAssetsScale", title: "清算资产规模（万元）", width: "150px", type: "number", template: "#=!!LiquidationAssetsScale!=0?(kendo.toString(LiquidationAssetsScale,'N2')):''#", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                { field: "SaleFreeIncome", title: "承销费收入（万元）", width: "150px", type: "number", template: "#=!!SaleFreeIncome!=0?(kendo.toString(SaleFreeIncome,'N2')):''#", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                { field: "ManagementFreeIncome", title: "管理费收入（万元）", width: "150px", type: "number", template: "#=!!ManagementFreeIncome!=0?(kendo.toString(ManagementFreeIncome,'N2')):''#", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                { field: "ManagementFreeRate", title: "年化管理费率%", width: "150px", type: "number", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                { field: "IntermediaryOrganFree", title: "中介机构费用（万元）", width: "150px", type: "number", template: "#=!!IntermediaryOrganFree!=0?(kendo.toString(IntermediaryOrganFree,'N2')):''#", type: "number", template: "#=!!OriginatorinGuaranteedAmount!=0?(kendo.toString(OriginatorinGuaranteedAmount,'N2')):''#", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                { field: "OtherFree", title: "其他费用合计（万元）", width: "150px", type: "number", template: "#=!!OtherFree!=0?(kendo.toString(OtherFree,'N2')):''#", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                { field: "IsStructured", title: "是否分层", width: "150px", template: "#=IsTerminationThisTimes==null?' ':(IsStructured?'是':'否')#", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                { field: "Beginleverage", title: "初始杠杆倍数", width: "150px", type: "number", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                { field: "Nowleverage", title: "当期杠杆倍数", width: "150px", type: "number", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                { field: "IsHaveGuarantee", title: "是否附带担保措施", width: "150px", template: "#=IsTerminationThisTimes==null?' ':(IsHaveGuarantee?'是':'否')#", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                { field: "Guarantee", title: "担保方全称", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                { field: "GuaranteeExternalRating", title: "担保方外部评级", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                { field: "IsGuaranteeRelatedOriginator", title: "担保方是否为原始权益人关联方", width: "150px", template: "#=IsTerminationThisTimes==null?' ':(IsGuaranteeRelatedOriginator?'是':'否')#", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                { field: "GuaranteeWay", title: "担保方式", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                { field: "GuaranteeThings", title: "担保物", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                { field: "ExternalCreditEnhancement", title: "外部增信措施", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                { field: "InteriorCreditEnhancement", title: "内部增信措施", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                { field: "IsTriggerCreditEnhancement", title: "是否触发相关增信措施", template: "#=IsTerminationThisTimes==null?' ':(IsTriggerCreditEnhancement?'是':'否')#", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                { field: "TriggerCreditEnhancement", title: "已触发增信措施", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                { field: "RiskLevel", title: "风险等级", width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                {
                    field: "IsSpecialProject",
                    title: "是否特殊项目", width: "180px", template: "#=IsTerminationThisTimes==null?' ':(IsSpecialProject?'是':'否')#", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" }
                },
            ],
            dataBound: function () {
            }
        });
        $("#loading").css("display", "none");
    }

    function eventBind() {
        $("#exportData").bind("click", function () {
            var grid = $("#reportGetTrustGrid").data("kendoGrid");
            grid.saveAsExcel();
        })
        $("#dateSelect").bind("change", function () {
            var value = $(this).find("option:selected").val() ? $(this).find("option:selected").val() : '1900-01-01';
            getTrustDetialDetection(value);
        })
    }
    
    function getDateList() {
        var serviceUrl = gv.DataProcessServiceUrl + "CommonExecuteGet?";
        var executeParam = {
            'SPName': "usp_GetTrustReportDate",
            'SQLParams': [
                { 'Name': 'UserName', 'Value': userName, 'DBType': 'string' }
            ]
        };
        common.ExecuteGetData(true, serviceUrl, 'RiskManagement', executeParam, function (data) {
            $("#dateSelect").empty();
            $.each(data, function (index, dom) {
                $("#dateSelect").append("<option value='" + common.getStringDate(dom.importDate).dateFormat("yyyy-MM-dd") + "'>" + common.getStringDate(dom.importDate).dateFormat("yyyy-MM-dd") + "</option>");
            })
            getTrustDetialDetection($("#dateSelect option:selected").val() ? $("#dateSelect option:selected").val() : '1900-01-01');
        });
    }

    function getTrustDetialDetection(value) {
        var serviceUrl = gv.DataProcessServiceUrl + "CommonExecuteGet?";
        var executeParam = {
            'SPName': "usp_GetTrustDetailDetectionReport",
            'SQLParams': [
                { 'Name': 'date', 'Value': value, 'DBType': 'string' },
                { 'Name': 'UserName', 'Value': userName, 'DBType': 'string' }
            ]
        };
        common.ExecuteGetData(true, serviceUrl, 'RiskManagement', executeParam, function (data) {
            renderGrid(data);
        });
    }
    function trustAction(callback) {
        var grid = $("#reportGetTrustGrid").data("kendoGrid");
        if (grid.select().length != 2) {
            GSDialog.HintWindow('请选择数据！');
        } else {
            var dataRows = grid.items();
            // 获取行号
            var rowIndex = dataRows.index(grid.select());
            // 获取行对象
            var data = grid.dataItem(grid.select());
            callback(data);
        }
    }
    function openNewIframe(page, trustId, tabName) {
        var pass = true;
        if (pass) {
            var newTab = {
                id: trustId,
                url: page,
                name: tabName,
                disabledClose: false
            };
            parent.viewModel.tabs.push(newTab);
            parent.viewModel.changeShowId(newTab);
        };
        
        if (tabName.indexOf("编辑检测表") > -1) {
            var btn = $('.chrome-tabs-shell', parent.document).find(".chrome-tab-current").find(".chrome-tab-close");
            btn.click(function () {
                $('iframe[src*=TrustDetialDetectionReport]', parent.document)[0].contentWindow.location.reload(true);
            })
        }
    }
    $(function () {
        getDateList();
        eventBind();
        kendo.culture("zh-CN");
        $('#EditItem').click(function () {
            trustAction(function (data) {
                var TrustId = data.TrustId;
                var TrustCode = data.TrustCode;
                var Date = $("#dateSelect").find("option:selected").val();
                var PageName = encodeURI(encodeURI('产品监测数据编辑'))
                var page = gv.TrustManagementServiceHostURL + "report/EditReportItem.html?PageName=" + PageName + "&TrustId=" + TrustId + '&Date=' + Date;
                var pollId = 'EditReportItem' + TrustId;
                var tabName = '编辑检测表' + '_' + TrustCode;
                openNewIframe(page, pollId, tabName);
            });
        })
    })
});
