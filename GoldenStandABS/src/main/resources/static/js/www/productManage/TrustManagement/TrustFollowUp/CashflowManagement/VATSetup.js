define(function (require) {
    var common = require('common');
    var appGlobal = require('App.Global');
    var GlobalVariable = require('globalVariable');
    var webProxy = require("webProxy");
    var Vue = require("Vue2");
    var trustId = common.getUrlParam('tid');
    var echarts = require('echarts');
    var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
    var taskIndicator = require('gs/taskProcessIndicator');
    var sVariableBuilder = require('gs/sVariableBuilder');
    var GSDialog = require("gsAdminPages");
    require("date_input");
    var vm = new Vue({
        el: '#app',
        data:{
            VATList:[]//内部列表
        },
        created: function () {
            var self = this;
            self.RenderList()
        },
        mounted: function () {
            var self = this;
            $(".date-plugins").date_input()
            $.each(self.VATList, function (i, v) {
                $(".date-plugins").eq(i).val(v.DimReportingDate)
            })
            $("#loading").hide()
        },
        methods: {
            //获取增值税率
            RenderList: function () {
                var self = this;
                var executeParams = {
                    SPName: 'TrustManagement.usp_GetValueAddedTaxRate', SQLParams: [
                        { Name: 'TrustId', value: trustId, DBType: 'int' },
                    ]
                };
                common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParams, function (eventData) {
                    console.log(eventData)
                    self.VATList = eventData
                })
            },
            //添加项目
            addItem: function () {
                var self = this;
                self.VATList.push({ "DimReportingDate": "", "Percentage": "" })
                Vue.nextTick(function () {
                    $(".date-plugins").date_input()
                })
            },
            //删除项目
            removeItem:function(lists){
                var self = this;
                self.VATList.remove(lists)
            },
            //保存
            SaveXml:function(){
                var self = this;
                var xml = "<table>"
                $.each(self.VATList, function (i, v) {
                    xml += "<row>" + "<DimReportingDate>" + $(".date-plugins").eq(i).val() + "</DimReportingDate>" + "<Percentage>" + v.Percentage + "</Percentage>" + "</row>"
                })
                xml += "</table>"
                console.log(xml)
                var executeParams = {
                    SPName: 'TrustManagement.usp_SaveValueAddedTaxRate', SQLParams: [
                        { Name: 'TrustId', value: trustId, DBType: 'int' },
                        { Name: 'Xml', value: xml, DBType: 'xml' },
                    ]
                };
                common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParams, function (eventData) {
                    console.log(eventData)
                    GSDialog.HintWindow("保存成功", function () {
                        location.reload()
                    })
                })
            },
            //固定列表头
            tableHeader: function ($event) {
                var target = $event.srcElement
                var scrollTop = target.scrollTop;
                $("#table_cont>thead").css("transform", "translateY(" + scrollTop + "px)");
            },
         
        }
   })
})