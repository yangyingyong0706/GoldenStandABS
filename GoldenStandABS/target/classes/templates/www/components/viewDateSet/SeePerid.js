define(function (require) {
    var $ = require('jquery');
    var common = require('common');
    var GlobalVariable = require('globalVariable');
    var Vue = require("Vue2");
    var trustId = common.getQueryStringSpecial("tid");
    var GSDialog = require("gsAdminPages");
    var app = new Vue({
        el: "#app",
        data: {
            trustId: trustId,
            tableData: [],
            changeTab: [],
            code: '',
        },
        created:function(){
            var self=this;
            self.GetTableData();
            Vue.nextTick(function () {
                self.changeli(self.code)
                $("#loading").hide();

            })
        },
        methods: {
            GetTableData: function () {
                var self = this;
                
                var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
                var executeParam = {
                    SPName: 'usp_getTrustPeriodDate ', SQLParams: [
                    { Name: 'trustId', value: self.trustId, DBType: 'int' },
                    ]
                }
                common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (response) {
                    self.changeTab=response[0]
                    self.tableData = response[1];
                    self.code = response[0][0].Code;
                })
                
            },
            changeli: function (code) {
                var self = this;
                self.code = code;
            }

        }
    })

    $("#tb").scroll(function (e) {
        var scrollTop = this.scrollTop;
        $("#tb>.table").find("thead").attr("style", "transform: translateY(" + scrollTop + "px)")
    })
})