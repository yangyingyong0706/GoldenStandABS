define(function (require) {
    var $ = require('jquery');
    var toast = require('toast');
    var common = require('common');
    var GlobalVariable = require('globalVariable');
    var Vue = require("Vue2");
    var code = common.getQueryStringSpecial("cod");
    var trustId = common.getQueryStringSpecial("tid");
    var startdate = common.getQueryStringSpecial("startdate");
    var enddate = common.getQueryStringSpecial("enddate");
    var GSDialog = require("gsAdminPages");
    require('date_input');
    var app = new Vue({
        el: "#app",
        data: {
            code: code,
            trustId: trustId,
            tableData: [],
            enddate: enddate,
            startdate: startdate
        },
        created:function(){
            var self=this;
            self.GetTableData();
            $("#loading").hide();
            Vue.nextTick(function () {
                $(".date-plugins").date_input("tb");
            })
        },
        methods: {
            GetTableData: function () {
                var self = this;
                
                var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
                var executeParam = {
                    SPName: 'usp_GetDateCalendarByDateCode', SQLParams: [
                    { Name: 'trustId', value: self.trustId, DBType: 'int' },
                    { Name: 'dateCode', value: self.code, DBType: 'string' }
                    ]
                }
                common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (response) {
                    self.tableData = response
                })
            },
            edit: function ($event) {
                var self = this;
                var target = $event.currentTarget;
                if ($(target).parents('tr').find(".date-plugins").attr("disabled")) {
                    $(target).parents('tr').find(".date-plugins").removeAttr("disabled");
                    $(target).parents('tr').find(".date-plugins").date_input("tb");
                } else {
                    $(target).parents('tr').find(".date-plugins").prop("disabled", "disabled");
                }
            },
            removeItem: function (item) {
                var self = this;
                self.tableData.remove(item);
            },
            addItem: function () {
                var self = this;
                var obj = {};
                common.checkDateNew($(".theDate"));
                if ($(".theDate").val() != "输入日期格式不合法" && $(".theDate").val() != "") {
                    obj.startDate = $(".theDate").val();
                    if (self.tableData.length == 0) {
                        obj.id = 1;
                    } else {
                        obj.id = parseFloat(self.tableData[self.tableData.length - 1].id) + 1;
                    }
                    self.tableData.push(obj);
                }
                //滚动到最底部
                Vue.nextTick(function () {
                    $("#tb").scrollTop($("#tb")[0].scrollHeight)
                })
            },
            //change
            changeFormat: function ($event) {
                var self = this;
                var target = $event.currentTarget;
                common.checkDateNew($(target));
            },
            saveall: function () {
                var self = this;
                $("#tb").find(".date-plugins").removeClass("redborder");
                var xml = "<items>";
                var start = self.startdate.replace(/-/g, "");
                var end = self.enddate.replace(/-/g, "");
                var flage=true
                $.each(self.tableData, function (i, v) {
                    xml += "<date>" + v.startDate + "</date>"
                    if (start >= v.startDate.replace(/-/g, "") || end < v.startDate.replace(/-/g, "")) {
                        flage = false;
                        $("#tb").find(".date-plugins").eq(i).addClass("redborder");
                    }
                })
                xml += "</items>";
                if (!flage) {
                    $.toast({ type: 'warning', mesaage: '日期不在选择区间内,请检查' });
                    return false;
                }
                var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
                var executeParam = {
                    SPName: 'usp_UpdateDateCalendar', SQLParams: [
                    { Name: 'trustId', value: self.trustId, DBType: 'int' },
                    { Name: 'dateCode', value: self.code, DBType: 'string' },
                    { Name: 'items', value: xml, DBType: 'xml' },
                    ]
                }
                common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (response) {
                    if (response[0].result >= 0) {
                        $.toast({ type: 'success', mesaage: '保存成功' });
                    } else {
                        $.toast({ type: 'error', mesaage: '保存失败' });
                    }
                })
            }
        }
    })
    $("#tb").scroll(function (e) {
        var scrollTop = this.scrollTop;
        $("#tb>.table").find(".tbs").attr("style", "transform: translateY(" + scrollTop + "px)")
    })
})