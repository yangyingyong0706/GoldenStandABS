var StaticObject = {
    //计息规则
    CalculateInterestRuleArray: [
        { CalculateInterestRuleCode: 'FirstTerm', CalculateInterestRuleName: '首期' },
        { CalculateInterestRuleCode: 'MidTerm', CalculateInterestRuleName: '中期' },
         { CalculateInterestRuleCode: 'LastTerm', CalculateInterestRuleName: '末期' }
    ],

    //付息规则
    PayInterestPRuleArray: [
        { PayInterestRuleCode: '01', PayInterestRuleName: '前置' },
        { PayInterestRuleCode: '02', PayInterestRuleName: '后置' }
    ],

    //还款日规则
    RepaymentDateRuleRuleArray: [
        { RepaymentDateRuleRuleCode: 'LoanMaturityDate', RepaymentDateRuleRuleName: '以贷款到期日为准' },
        { RepaymentDateRuleRuleCode: 'SpecificPayDay', CalculateInterestRuleName: '以指定还款日为准' }
    ],

    //计日规则
    CalculateDayRuleArray: [
        { CalculateDayRuleCode: '30/360', CalculateDayRuleName: '30/360' },
        { CalculateDayRuleCode: '30/365', CalculateDayRuleName: '30/365' },
        { CalculateDayRuleCode: 'ACT/30', CalculateDayRuleName: 'ACT/30' },
        { CalculateDayRuleCode: 'ACT/365', CalculateDayRuleName: 'ACT/365' },
        { CalculateDayRuleCode: 'ACT/ACT', CalculateDayRuleName: 'ACT/ACT' },
    ],

    //每期还款取舍方式
    PaymentCutOffTypeArray: [
        { PaymentCutOffTypeCode: 'Round', PaymentCutOffTypeName: '四舍五入' },
        { PaymentCutOffTypeCode: 'Truncation', PaymentCutOffTypeName: '截断' },
        { PaymentCutOffTypeCode: 'Ceiling', PaymentCutOffTypeName: '向上取整' },
    ],

    //尾差调整方式
    EndDiffereneChangeTypeArray: [
        { EndDiffereneTypeCode: 'FristTerm', EndDiffereneTypeName: '第一期调整' },
        { EndDiffereneTypeCode: 'LastTerm', EndDiffereneTypeName: '最后一期调整' },
    ],
}