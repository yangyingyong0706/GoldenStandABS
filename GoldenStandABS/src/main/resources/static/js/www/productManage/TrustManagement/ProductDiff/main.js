define(function (require) { 
    var $ = require('jquery');
    require('lodash');
    var Vue = require('Vue2');
    var CallApi=require('callApi')
    var CurDiff_TABLE_HEAD = ["产品名称", "发行总额", "证券余额", "当前状态", "发行日", "最新偿付日", "更新日期", "发行机构", "发行方", " 主承销商", " 偿付频率", " 交易场所", " 操作"]
    //var ProDiff_TABLE_HEAD = ["基础资产特征","平均借款人数","平均借款笔数","单人借款金额(万)","平均贷款年利率","平均太宽剩余期限（年）","当前平均贷款年利率","当前平均贷款剩余期限(年)","年化违约率","年化提前偿还率","抵押率","首付比例","抵押物初始评估值"];
    var vm = new Vue({
        el: "#app",
        data: {
            curDiff_thead: CurDiff_TABLE_HEAD,
            diffProTrustIds: [], //对比产品的id
            diffProducts: [], //对比的产品列表
            diffProsDetail:[], //对比产品的表格详细数据数据
            assetType: [],//资产类型列表
            chosenAsseType:"", //当前选择的资产类型
            trustCode: [], //当前资产类型所对应的专项计划列表
            chosenTrustCode: '', //当前的专项计划
            loading:true,
        },
        methods: {
            //获取对比产品
            getData: function (chosenTC) {
                var self = this;
                var trustIdsString = "";
                if (!chosenTC) {
                    alert(self.chosenAsseType + '类别暂无产品，请选择其他资产类别')
                    return;
                }
                var obj = _.find(self.trustCode,function (v) {
                    return v.TrustId == chosenTC
                })
                self.trustCode.remove(obj)
                self.chosenTrustCode = self.trustCode[0]? self.trustCode[0].TrustId : ''
                self.diffProTrustIds.push(chosenTC)
                trustIdsString = self.diffProTrustIds.join()
                self.loading = true;
                var callApi = new CallApi('TrustManagement', 'TrustManagement.usp_GetProductComparisonInfo', true);
                callApi.AddParam({ Name: 'TrustIDs', Value: trustIdsString, DBType: 'string' });
                callApi.ExecuteDataSet(function (response) {
                    self.loading = false;
                    self.diffProducts = response[0];
                    //self.diffProducts = self.diffProducts.reverse()
                    self.diffProsDetail = response[1];
                    console.log(self.diffProsDetail)
                })
            },
            //获取资产类型
            getAssetType: function () {
                var self = this;
                var callApi = new CallApi('TrustManagement', '[TrustManagement].[usp_GetAssetType]', true);
                callApi.AddParam({ Name: 'Language', Value: "zh-CN", DBType: 'string' });
                callApi.ExecuteDataSet(function (response) {
                   
                    console.log(response)
                    self.assetType = response;
                    self.chosenAsseType = self.assetType[0].AssetTypeDesc
                })
            },
           //根据资产类型获取专项计划
            getTrustCode: function (type) {
                if(!type) return
                var self = this;
                var obj = null;
                var callApi = new CallApi('TrustManagement', '[TrustManagement].[usp_GetProductAssetType]', true);
                callApi.AddParam({ Name: 'AssetType', Value:type, DBType: 'string' });
                callApi.ExecuteDataSet(function (response) {
                    if (response.length > 0) {
                        self.diffProTrustIds.forEach(function (v) {
                            obj = _.find(response,function (v1) {
                                return v1.TrustId == v
                            })
                            if (obj) {
                                response.remove(obj)
                            }
                        })
                        self.trustCode = response;
                        self.chosenTrustCode = self.trustCode[0] ? self.trustCode[0].TrustId : ''
                    } else {
                        self.chosenTrustCode = "";
                        self.trustCode = [];
                    }
                })
            },
            //清空对比产品
            emptyProList: function () {
                var self = this;
                if (confirm("确定清空所有对比产品吗？")) {
                    self.diffProTrustIds = [];
                    self.diffProducts = [];
                    self.getTrustCode(self.chosenAsseType);
                }
            },
            //删除对比产品
            deletePro: function (trustId) {
                var self = this;
                var product = _.find(self.diffProducts,function (v) {
                    return v.TrustID == trustId
                })
                self.diffProTrustIds.remove(trustId);
                self.diffProducts.remove(product);
                self.diffProsDetail.forEach(function (v) {
                    delete v[trustId]
                })
                self.getTrustCode(self.chosenAsseType);
            },
            id2Name: function (id) {
                var self = this;
                var trust = _.find(self.diffProducts,function (v) {
                    return v.TrustID == id
                })
                return trust.TrustName
            }
        },
        computed: {
            proDiff_thead: function () {
                return this.diffProducts.reverse()
            }
        },
        watch:{
            chosenAsseType: function () {
                this.getTrustCode(this.chosenAsseType)
            }
        },
        filters: {
            formatEmpty: function (value) {
                if (!value) return "--"
                return value
            }
        },
        mounted: function () {
            var self = this;
            self.loading = false;
            self.getAssetType();
           
        }
    })
});