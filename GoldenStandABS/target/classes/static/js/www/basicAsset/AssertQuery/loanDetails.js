requirejs(['../../../asset/lib/config'], function (config) {
    require(['Vue2', 'globalVariable', 'callApi', 'common', 'loading', 'anyDialog', 'jquery', 'kendo.all.min'], function (Vue, globalVariable, CallApi, common, loading, dialog, $, kendo) {
    new Vue({
        el: '#loanDetails',
        data: {
            loanType: '',              //贷款类型
            loanDetails: {},           //贷款详细信息    
            loanPaymentRecords: [],    //还款记录信息

            ReportingDateId: '',    //保存的跳转信息
            AssetType: '',    //保存的跳转信息
            TrustCode: '',    //保存的跳转信息
            OrganisationCode: '',    //保存的跳转信息

        },
        methods: {
            goBack: function () {
                var self = this;
                window.location.href = location.protocol + "//" + location.host + '/GoldenStandABS/www/basicAsset/AssertQuery/loanView.html?TrustCode=' + self.TrustCode + '&ReportingDateId=' + self.ReportingDateId + '&AssetType=' + self.AssetType + '&OrganisationCode=' + self.OrganisationCode;
            },


            getLoanDetails: function (ReportingDateId, TrustId, AccountNo, AssetType) {
                var t = this;
                //var ReportingDateId = 20170822, TrustId = 58, AccountNo = '000015581519',LoanTypeCode='06';
                var callApi = new CallApi(AssetType, 'dbo.usp_GetLoanDetailsByAccountNo', true);
                callApi.AddParam({ Name: 'ReportingDateId', Value: ReportingDateId, DBType: 'int' });
                callApi.AddParam({ Name: 'TrustId', Value: TrustId, DBType: 'int' });
                callApi.AddParam({ Name: 'AccountNo', Value: AccountNo, DBType: 'string' });
                callApi.ExecuteDataSet(function (data) {
                    t.loanDetails = [{ name: '贷款人基本信息', info: data[0][0] }
                        , { name: '贷款信息', info: data[1][0] }
                        //, { name: '账户信息', info: data[2][0] }
                    ];
               

                    //获取还款记录信息
                    //t.loanPaymentRecords = data[3];
                    loading.close();
                    //$("#loanPaymentRecords").kendoGrid({
                    //    dataSource: t.loanPaymentRecords,
                    //    scrollable: true,
                    //    sortable: true,
                    //    columns: [
                    //        { field: "PeriodId", title: '当前期数', width: "80px"},
                    //        { field: "PrincipalDue", title: '应还本金(元)', width: "130px", format: "{0:n}" },
                    //        { field: "InterestDue", title: '应还利息(元)', width: "130px", format: "{0:n}" },
                    //        { field: "DueDate", title: '应还款日', width: "130px", format: "{0: yyyy-MM-dd}" },
                    //        { field: "TotalAmountDue", title: '应还总额(元)', width: "130px", format: "{0:n}" },
                    //        { field: "PayDate", title: '实际还款日', width: "130px", format: "{0: yyyy-MM-dd}" },
                    //        { field: "AmountPaid", title: '实际还款金额(元)', width: "130px", format: "{0:n}" },
                    //        { field: "LifeCycleStatusLevel2", title: '资产二级状态', width: "150px" },
                    //        { field: "ArrearsAmount", title: '逾期金额(元)', width: "130px", format: "{0:n}" },
                    //        { field: "DaysInArrears", title: '逾期天数', width: "90px" }
                    //    ],
                    //    fieldsSchema: {
                    //        PeriodId: { type: "number" },
                    //        DueDay:{type:'date'},
                    //        PrincipalDue: { type: "number" },
                    //        InterestDue: { type: "number" },
                    //        TotalAmountDue: { type: "number" },
                    //        PayDate: { type: "date" },
                    //        AmountPaid: { type: "number" },
                    //        LifeCycleStatusLevel2: { type: "string" },
                    //        ArrearsAmount: { type: "number" },
                    //        DaysInArrears: { type: "string" }
                    //    }
                    //});
                });
            },
            flexAnimation: function (event) {
                that = event.currentTarget;
                var icon = $(that).find('i');
                icon.toggleClass("tran");   
                $(that).next().slideToggle(500, function () {
                });
            },
            stairsNavgation: function () {
                that = event.currentTarget;
                var _index = 0;
                $(that).find("span").addClass("active").parent().siblings().find("span").removeClass("active");
                _index = $(that).index() + 1;
                //通过拼接字符串获取元素，再取得相对于文档的高度
                var _top = $("#louti" + _index).offset().top;
                //scrollTop滚动到对应高度
                $("body,html").animate({ scrollTop: _top }, 500);
            },
         
        },
        filters: {
            numFormt: function (p) {
                if (parseFloat(p) == p) {
                    var res = p.toString().replace(/\d+/, function (n) { // 先提取整数部分
                        return n.replace(/(\d)(?=(\d{3})+$)/g, function ($1) {
                            return $1 + ",";
                        });
                    })
                    return res;
                }
                else
                    return p;
            }
        },
        mounted: function () {
            var self = this;
            loading.show();
            var AccountNo = common.getQueryString("AccountNo");
            //var ApplicationNo = common.getQueryString("ApplicationNo");
            var ReportingDateId = common.getQueryString("ReportingDateId");
            var TrustId = common.getQueryString("TrustId");
            var AssetType = common.getQueryString("AssetType");

            self.TrustCode = common.getQueryString("TrustCode");
            self.OrganisationCode = common.getQueryString("OrganisationCode");
            self.AssetType = AssetType
            self.ReportingDateId = common.getQueryString("ReportingDateIdinfo");
            

            //var LoanTypeCode = common.getQueryString("LoanTypeCode");
            //var TrustCode = common.getQueryString("TrustCode");
            //$("#iframe").attr("src", "../basic/loanTreeView.html?pro_no=" + TrustCode + "&application_no=" + ApplicationNo);
            this.getLoanDetails(ReportingDateId, TrustId, AccountNo, AssetType);
            
            //this.imageSource(AccountNo, TrustCode);
        }
    })
});
})