define(function (require) {
    var $ = require('jquery');
    var GlobalVariable = require('globalVariable');
    var kendoGridModel = require('./kendoGridModel');
    var common = require('common');
    var Vue = require('Vue2');
    var GSDialog = require('gs/uiFrame/js/gs-admin-2.pages');
    var taskIndicator = require('gs/taskProcessIndicator');
    var sVariableBuilder = require('gs/sVariableBuilder');
    var trustId = common.getQueryString('tid');
    var InvestorId = common.getQueryString('InvestorId');
    var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
    var step = common.getQueryString('step');
    var endDate = common.getQueryString('endDate');
    require("date_input");
    window.vm = new Vue({
        el: '#PageMainContainer',
        data: {
            Investor: [],
            TrustBondId: "",
            Rate:"",
            endDate:endDate,
        },
        created: function() {
            var self = this;
            self.LoadAllInvestor()
        },
        mounted: function () {
            var self = this
            $(".date-plugins").date_input();
  //          $("#startTime").datepicker({
  //              dateFormat: 'yy-mm-dd',
  //              dayNamesMin: ['一', '二', '三', '四', '五', '六', '日'],
  //              monthNames: ['一月', '二月', '三月', '四月', '五月', '六月',
  //'七月', '八月', '九月', '十月', '十一月', '十二月'],

  //          });
  //          $("#endTime").datepicker({
  //              dateFormat: 'yy-mm-dd',
  //              dayNamesMin: ['一', '二', '三', '四', '五', '六', '日'],
  //              monthNames: ['一月', '二月', '三月', '四月', '五月', '六月',
  //'七月', '八月', '九月', '十月', '十一月', '十二月'],
  //          });
            $("#startTime").change(function() {
                common.checkDateNew(this)
            })
            $("#endTime").change(function () {
                common.checkDateNew(this)
            })
            $("#Amount").keyup(function() {
                common.MoveNumFormt(this)
            })
        },
        methods: {
            //加载所有的债券信息
            LoadAllInvestor: function () {
                var self = this;
                var executeParam = {
                    SPName: 'usp_GetTrustBondAndCouponBasisByTrustId', SQLParams: [
                        { Name: 'trustId', value: trustId, DBType: 'string' }
                    ]
                };
                common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
                    self.Investor = data;
                    self.Rate = self.Investor[0].CouponBasis;
                    self.TrustBondId = self.Investor[0].TrustBondId;
                });
            },
            //绑定利率
            changeNumber: function (TrustBondId) {
                var self = this;
                $.each(self.Investor, function (i, v) {
                    if (v.TrustBondId == TrustBondId) {
                        self.Rate = v.CouponBasis
                    }
                })
            },
            //确定组装XML调用存储过程
            SavefirstInfo: function () {
                var self = this;
                var xml = "<data>"
                var Amount = $("#Amount").val().replace(/,/g,"");
                var startTime = $("#startTime").val();
                var endTime = $("#endTime").val()
                if (Amount == "" || self.Rate == "") {
                    GSDialog.HintWindow("金额和利率为必填项请检查")
                    return false
                }
                if (startTime.lastIndexOf('输入') != -1) {
                    GSDialog.HintWindow("开始时间输入不合法")
                    return false
                }
                if (endTime.lastIndexOf('输入') != -1) {
                    GSDialog.HintWindow("结束时间输入不合法")
                    return false
                }
                //日期大小验证
                if (startTime != "" && endTime != "") {
                    var start = startTime.replace(/-/g, "");
                    var end = endTime.replace(/-/g, "");
                    if (start > end) {
                        GSDialog.HintWindow("开始日期不能大于结束日期")
                        return false
                    }
                }
                xml += "<InvestorId>" + InvestorId + "</InvestorId>"
                xml += "<TrustId>" + trustId + "</TrustId>"
                xml += "<BondId>" + self.TrustBondId + "</BondId>"
                xml += "<PrincipalBalance>" + Amount + "</PrincipalBalance>"
                xml += "<StartDate>" + startTime + "</StartDate>"
                xml += "<EndDate>" + endTime + "</EndDate>"
                xml += "<CouponBasis>" + self.Rate + "</CouponBasis>"
                xml += "<DimReportingDateId>" + self.endDate.replace(/-/g,"")+ "</DimReportingDateId>"
                xml += "</data>";
                console.log(xml);
                var executeParam = {
                    SPName: 'usp_AddBondDetailsOfInvestor', SQLParams: [
                        { Name: 'bondlist', value: xml, DBType: 'xml' }
                    ]
                };
                common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
                    if(data)
                        GSDialog.HintWindow("债券添加成功", function () {
                        $("#modal-close", window.top.document).trigger("click")
                    })
                });
            }
        },
        watch: {
            Rate: function (data) {
                var self = this;
                var tex = new RegExp("[^.0-9]");
                if (tex.test(data)) {
                    self.Rate = "";
                }
                if (parseFloat(data) != data) {
                    self.Rate = "";
                }
            }
        }
    });
    
});
