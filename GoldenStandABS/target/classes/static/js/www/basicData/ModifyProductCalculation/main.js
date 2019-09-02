define(function (require) {
    var $ = require('jquery');
    var Vue = require('Vue2');
    common = require('common');
    var GlobalVariable = require('globalVariable');
    var CallApi = require('callApi');
    var GSdialog = require('gsAdminPages');
    
    var vm = new Vue({
        el: '#rootBox',
        data: {
            ProductArr: [       //获取产品列表
                {
                    TrustCode: '',
                    TrustId: 0
                }
            ],
            Periods: [          //获取当前产品的所有兑付日期
                {
                    StartDate: '',
                    EndDate: ''
                }
            ],
            TrustId: 458,       //当前所选产品的TrustId
            ReportingDate: '',  //当前所选产品的兑付日期
            NowProduct: [],     //当前所选产品
            ProductMessage: [], //当前所选产品查询的信息
            Show: false,        //控制当前所选产品信息表的显示
            DataOr: false        //是否有数据，有不让表格里面的暂无数据图显示
        },
        watch: {
            //监听TrustId的变化，如果变化了，重新加载兑付日期
            TrustId: function (data, oldData) {
                var self = this;
                self.LoadAllPeriods()
            }
        },
        mounted: function () {
            //初始化产品列表和兑付日期
            this.GetProducts()
            this.LoadAllPeriods()
        },
        methods: {
            //获取产品列表
            GetProducts: function () {
                var self = this;
                var executeParam = {
                    SPName: 'usp_GetTrustNum', SQLParams: []
                };
                var sContent = encodeURIComponent(JSON.stringify(executeParam));
                var serviceUrl = GlobalVariable.DataProcessServiceUrl + 'CommonExecuteGet?appDomain=dbo&executeParams=' +
                    sContent + "&resultType=com";
                $.ajax({
                    type: "GET",
                    cache: false,
                    url: serviceUrl,
                    dataType: "jsonp",
                    crossDomain: true,
                    contentType: "application/xml;charset=utf-8",
                    data: {},
                    success: function (response) {
                        if (typeof response == "string") {
                            response = JSON.parse(response);
                        }
                        self.ProductArr = response;
                    },
                    error: function (response) { alert("error:" + response.text); }
                });
            },
            //选择产品以后根据trustid获取所选产品
            SelectChange: function (id) {
                var self = this;
                for (var i = 0; i < self.ProductArr.length; i++) {
                    if (self.ProductArr[i].TrustId === id) {
                        self.NowProduct = self.ProductArr[i];
                    }
                }
            },
            //加载日期时间段
            LoadAllPeriods: function (fnCallback) {
                var self = this;
                var callApi = new CallApi('TrustManagement', 'usp_StructureDesign_GetPeriods', true);
                callApi.AddParam({ Name: 'TrustID', Value: self.TrustId, DBType: 'int' });
                callApi.ExecuteDataTable(function (response) {
                    self.Periods = response;
                    if (fnCallback && typeof fnCallback === 'function') {
                        fnCallback();
                    }
                });
            },
            //获取产品兑付日信息
                //TrustManagement.usp_GetIncomeDistributionDataForUpdate
                //传连个参数
                //@TrustID INT ,
                //@ReportingDate date
            loadProductMessage: function () {
                var self = this;
                if (self.Periods.length === 0) {
                    self.Show = false;
                    GSdialog.HintWindow('当前所选产品没有兑付日')
                    return;
                } else {
                    var executeParam = {
                        SPName: 'usp_GetIncomeDistributionDataForUpdate',
                        SQLParams: [
                            { Name: 'TrustID', Value: self.TrustId, DBType: 'int' },
                            { Name: 'ReportingDate', Value: self.ReportingDate, DBType: 'date' }
                        ]
                    };
                    var sContent = encodeURIComponent(JSON.stringify(executeParam));
                    var serviceUrl = GlobalVariable.DataProcessServiceUrl + 'CommonExecuteGet?appDomain=TrustManagement&executeParams=' +
                        sContent + "&resultType=com";
                    $.ajax({
                        type: "GET",
                        cache: false,
                        url: serviceUrl,
                        dataType: "jsonp",
                        crossDomain: true,
                        contentType: "application/xml;charset=utf-8",
                        data: {},
                        success: function (response) {
                            if (typeof response == "string") {
                                response = JSON.parse(response);
                            }
                            self.ProductMessage = response;
                            if (self.ProductMessage.length !== 0) {
                                self.DataOr = false;
                            } else {
                                self.DataOr = true;
                            }
                        },
                        error: function (response) { alert("error:" + response.text); }
                    });
                    
                    self.Show = true;
                }
            },
            //修改
            EditValue: function (e,index) {
                var self = this;
                var Dom = e.target;
                $(Dom).parent().prev().find('span').toggle()
                $(Dom).parent().prev().find('p').toggle()
            },
            BlurEvent: function (e) {
                var self = this;
                var Dom = e.target;
                $(Dom).parent().hide()
                $(Dom).parent().prev().show()
            },
            //验证输入的数字并格式化为千分位
            CheckNum: function (e) {
                var obj = e.target;
                common.MoveNumFormt(obj)
            },
            //保存修改
                //在点保存的时候，调用接口（存储过程）
                //TrustManagement.usp_UpdateFactTrustTransaction
                //传三个参数：
                // @trustId int,
                // @ReportingDate date,
                // @items xml
            SaveEdit: function () {
                var self = this;
                var items = '<items>';
                $.each(self.ProductMessage, function (i, v) {
                    v.Value = $(".EditInput").eq(i).val();
                    items += '<item>';
                    items += '<Code>' + v.ItemCode + '</Code>';
                    items += '<Name>' + v.Name + '</Name>';
                    items += '<Value>' + v.Value.replace(/,/g, '') + '</Value>';
                    items += '</item>';
                });
                items += '</items>';
                console.log("items" + items);
                var executeParam = {
                    SPName: 'usp_UpdateFactTrustTransaction',
                    SQLParams: [
                        { Name: 'trustId', Value: self.TrustId, DBType: 'int' },
                        { Name: 'ReportingDate', Value: self.ReportingDate, DBType: 'date' },
                        { Name: 'items', Value: items, DBType: 'xml' }
                    ]
                };
                var sContent = encodeURIComponent(JSON.stringify(executeParam));
                var serviceUrl = GlobalVariable.DataProcessServiceUrl + 'CommonExecuteGet?';
                common.ExecuteGetData(false, serviceUrl, 'TrustManagement', executeParam, function (data) {
                    GSdialog.HintWindow('修改成功')
                });
                $('.EditInput').parent().hide()
                $('.EditInput').parent().prev().show()
            }
        }
    })
})