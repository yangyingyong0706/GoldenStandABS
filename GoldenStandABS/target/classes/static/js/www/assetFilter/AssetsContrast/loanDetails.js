requirejs(['../../../asset/lib/config'], function (config) {
    require(['Vue2', 'globalVariable', 'callApi', 'common', 'loading', 'anyDialog', 'jquery', 'kendo.all.min'], function (Vue, globalVariable, CallApi, common, loading, dialog, $, kendo) {
        new Vue({
            el: '#loanDetails',
            data: {
                loanDetails: {},           //贷款详细信息 
            },
            methods: {
                goBack: function () {
                    var self = this;
                    window.history.go(-1);
                },
                getLoanDetails: function (PoolDBName, PoolId, AccountNo, AssetType) {
                    var t = this;
                    var executeParam = {
                        'SPName': "dbo.usp_GetAssetDetailsByAccountNo", 'SQLParams': [
                            { 'Name': 'DimPoolId', 'Value': PoolId, 'DBType': 'int' }
                            , { 'Name': 'AccountNo', 'Value': AccountNo, 'DBType': 'string' }
                        ]
                    };
                    var serviceUrl = globalVariable.DataProcessServiceUrl + "CommonExecuteGet?";

                    common.ExecuteGetData(true, serviceUrl, PoolDBName, executeParam, function (data) {
                        t.loanDetails = [{ name: '贷款人基本信息', info: data[0][0] }
                             , { name: '贷款信息', info: data[1][0] }
                        ];
                        loading.close();
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
                var AccountNo = common.getQueryStringSpecial("AccountNo");
                var PoolDBName = common.getQueryStringSpecial("PoolDBName");
                var AssetType = common.getQueryStringSpecial("AssetType");
                var PoolId = common.getQueryStringSpecial("PoolId");

                self.AssetType = AssetType;

                this.getLoanDetails(PoolDBName, PoolId, AccountNo, AssetType);
            }
        })
    });
})