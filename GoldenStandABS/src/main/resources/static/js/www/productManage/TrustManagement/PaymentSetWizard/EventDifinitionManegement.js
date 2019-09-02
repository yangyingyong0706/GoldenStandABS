define(function (require) {

    var $ = require("jquery");
    require("jquery-ui");
    var ko = require("knockout");
    var mapping = require("knockout.mapping");
    require("date_input");
    var common = require('common');
    var GlobalVariable = require('globalVariable');
    var trustId = common.getUrlParam("tid");
    var ActLogs = require('insertActlogs');
    var RoleOperate = require('gs/uiFrame/js/roleOperate');
    var userName = RoleOperate.cookieName();
    var ip;
    $.ajax({
        cache: false,
        type: "GET",
        async: false,
        url: GlobalVariable.DataProcessServiceUrl + 'getIP',
        dataType: "json",
        contentType: "application/xml;charset=utf-8",
        data: {},
        success: function (response) {
            if (typeof response === 'string') {
                ip = response;
            }
        },
        error: function () {
            alert: '网络连接异常'
        }
    });
    var Vue = require("Vue2")
    var Orgheight = $(document).height();
    var Orgwidth = $(document).width();
    var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
    var GSDialog = require("gsAdminPages");
    function showMask(Orgheight, Orgwidth) {
        $("#mask").css("height", Orgheight);
        $("#mask").css("width", Orgwidth);
        $("#mask").show();
    }
    //隐藏遮罩层  
    function hideMask() {
        $("#mask").hide();
    }
    productPermissionState = common.getQueryString('productPermissionState');
    if (productPermissionState == 2) {
        showMask(Orgheight, Orgwidth);
        $(window).resize(function () {
            var height = $(document).height();
            var width = $(document).width();
            showMask(height, width);
            //hideMask();
        })
    } else {
        hideMask();
    }
    $(function () {
        var vm = new Vue({
            el: "#app",
            data: {
                eventConditions: [],//触发条件
                eventList: []//触发的事件
            },
            beforeMount: function () {
                this.render();
            },
            mounted: function () {
                for (var i = 0; i < $(".conditionDetils").length; i++) {
                    $(".conditionDetils").eq(i).find(".layer_span:last").css("borderBottom", "none")
                    $(".conditionDate").eq(i).find(".layer_span:last").css("borderBottom", "none")
                    $(".conditionBtn").eq(i).find(".layer_span:last").css("borderBottom", "none")
                    $(".conditionTime").eq(i).find(".layer_span:last").css("borderBottom", "none")
                }
                $("#loading").hide()
                $(".date-plugins").date_input();
            },
            methods: {
                render: function () {
                    var self = this;
                    var arr = [];
                    var executeParams = {
                        SPName: 'usp_getTriggeredEventAndConditionByTrustId', SQLParams: [
                            { Name: 'TrustId', value: trustId, DBType: 'int' }
                        ]
                    };
                    common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParams, function (eventData) {
                        self.eventConditions = eventData;
                        $.each(eventData, function (i, v) {
                            arr.push(v.EventName);
                        })
                        var result = []
                        for (var i = 0; i < arr.length; i++) {
                            if (result.indexOf(arr[i]) == -1) {
                                result.push(arr[i])
                            }
                        }
                        self.eventList = result;
                    });
                },
                cancelEvent: function (pastdate, ConditionId) {
                    var pastdate = pastdate;
                    var pastyear = parseInt(pastdate.substring(0, 4));
                    var pastMouth = parseInt(pastdate.substring(5, 7));
                    var pastDay = parseInt(pastdate.substring(8, 10));
                    var data = $("#" + ConditionId).val();
                    var Currendate = ''
                    var myDate = new Date();
                    var year = myDate.getFullYear();
                    var mouth = myDate.getMonth() + 1;
                    var day = myDate.getDate();
                    if (mouth.toString().length == 1) {
                        mouth = "0" + mouth;
                    }
                    if (day.toString().length == 1) {
                        day = "0" + day;
                    }
                    CurrentDate = year + "-" + mouth + "-" + day;
                    data = data == "" ? CurrentDate : data;
                    var nowyear = parseInt(data.substring(0, 4));
                    var nowMouth = parseInt(data.substring(5, 7));
                    var nowDay = parseInt(data.substring(8, 10));
                    if (nowyear < pastyear) {
                        GSDialog.HintWindow("解除触发日不能在触发日之前")
                        return false
                    } else if (nowyear == pastyear) {
                        if (nowMouth < pastMouth) {
                            GSDialog.HintWindow("解除触发日不能在触发日之前")
                            return false
                        } else if (nowMouth == pastMouth) {
                            if (nowDay < pastDay) {
                                GSDialog.HintWindow("解除触发日不能在触发日之前")
                                return false
                            }
                        }
                    }
                    var executeParams = {
                        SPName: 'usp_cancelTrigger', SQLParams: [
                            { Name: 'ConditionId', value: ConditionId, DBType: 'int' },
                            { Name: 'EndDate', value: data, DBType: 'date' }
                        ]
                    };
                    common.ExecuteGetData(true, svcUrl, 'TrustManagement', executeParams, function (eventData) {
                        if (eventData) {
                            var description = "专项计划：" + trustId + "，在产品维护向导功能下，事件处理中解除触发事件操作"
                            var category = "产品管理";
                            ActLogs.insertActlogs(false, userName, '更新', category, description, ip, '', '');
                            $("#" + ConditionId).val(data)
                            GSDialog.HintWindow("解除触发成功", function () {
                                location.reload(true);
                            })
                        }
                    });
                }
            }
        })
    })

})