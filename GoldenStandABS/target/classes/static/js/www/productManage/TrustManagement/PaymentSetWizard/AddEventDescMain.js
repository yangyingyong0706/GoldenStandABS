define(function (require) {
    //<script src="../Common/Scripts/lodash.min.js"></script>
    //<script src="../Common/Scripts/Sortable.js"></script>

    var $ = require('jquery');
    require('jquery-ui');
    var GlobalVariable = require('globalVariable');
    var common = require('common');
    var WebStorage = require('gs/webStorage');
    var Sortable = require('Sortable');
    var GSDialog = require("gsAdminPages");
    var EventId = common.getUrlParam('EventId');
    var Vue = require("Vue")
    //var EventName = common.getUrlParam('EventName');
    var EventName = decodeURIComponent(common.getUrlParam('EventName'))
    var trustId = decodeURIComponent(common.getUrlParam('tid'))
    var ActLogs = require('insertActlogs');
    var RoleOperate = require('gs/uiFrame/js/roleOperate');
    var userName = RoleOperate.cookieName();
    var toast = require('toast');
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

    //var EventCode = common.getUrlParam('EventCode');
    var EventCode = decodeURIComponent(common.getUrlParam('EventCode'))
    var nowTab = WebStorage.getItem('nowTab');
    require('lodash');
    //var svcUrl = "https://poolcutwcf/TrustManagementService/DataProcessService.svc/jsAccessEP/" + "CommonExecuteGet?";
    var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
    var self = this;
    function getHeight() {
        var h = $("body").height();
        $(".rightTi").css("height", h - 150 - 31 + "px");
    }
    getHeight();
    var Orgheight = $(document).height();
    var Orgwidth = $(document).width();
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
    var CurrentObj = '您正在为 > {0} > 添加触发条件'.format(EventName)
    $("#CurrentEventName").html(CurrentObj);
    Vue.filter('changeZN', function (value) {
        if (value == "CumulativeBrenchRate") {
            return "当前累计违约率"
        }
    })
    var Vue = new Vue({
        el: "#app",
        data: {
            QualitativeList: [],//定性条件,
            RationList: [],//定量条件
            EventName: EventName,
            qls: true,//定性列表显示控制
            rls: false,///定量列表显示控制
            ConditionId: "",//对应条目的标识
            QualitativeRemove:true,//定性删除标识
            RationRemove: false//定量删除标识
        },
        created: function () {
            this.RenderList();
            $("#loading").hide()
        },
        methods: {
            RenderList: function () {
                var self = this;
                var executeParams = {
                    SPName: 'usp_getConditionByEventId', SQLParams: [
                        { Name: 'EventId', value: EventId, DBType: 'int' }
                    ]
                };
                common.ExecuteGetData(true, svcUrl, 'TrustManagement', executeParams, function (eventData) {
                    self.QualitativeList = [];
                    self.RationList = []
                    $.each(eventData, function (i, v) {
                        if (v.Type == "Qualitative") {
                            self.QualitativeList.push(v)
                        } else {
                            self.RationList.push(v)
                        }
                    })
                    $("#loading").fadeOut()
                });
            },
            openRation: function () { //打开定量条件定义窗口
                $("#ReQuantitativeBtn").css("display", "none");
                $("#QuantitativeBtn").show();
                $("#QuantitativeBtn").css("display", "inline");
                $("#RationDescribe").val("");
                $("#CurrentValue").val("");
                $("#Condition").val("");
                $("#Threshold").val("");
                $("#rl").parent().trigger("click")
                var executeParam = {
                    SPName: 'usp_GetCalculationCodeList', SQLParams: [
                    ]
                };
                common.ExecuteGetData(true, svcUrl, 'TrustManagement', executeParam, function (sourceData) {
                    if (sourceData && sourceData.length > 0) {
                        var html = '';
                        $.each(sourceData, function (i, item) {
                            html += '<option value="' + item.CalculationCode + '">' + item.CalculationDesc + '</option>';
                        });
                        $('#CalculationCode').html(html);
                    }
                });
                $.anyDialog({
                    title: "定量条件",
                    width: "750",
                    height: "250",
                    html: $('#circumstances2'),
                    mask: true,
                    changeallow: false,
                    onCallback: function () {
                        $('#qla').prop('checked', false);
                    }
                })
            },
            openQualitative: function () { //打开定性条件定义窗口
                $("#DisplayDescribe").val("")
                $("#QualitativeBtn").show();
                $("#QualitativeBtnEX").hide();
                $("#ql").parent().trigger("click")
                $.anyDialog({
                    title: "定性条件",
                    width: "400",
                    height: "246",
                    html: $('#circumstances'),
                    mask: true,
                    changeallow: false,
                    onCallback: function () {
                        $('#rla').prop('checked', false);
                    }
                })
            },
            showQualitative:function($event){//定性列表显示
                var self = this;
                $("#ql").removeClass("active")
                $("#rl").removeClass("active")
                $("#ql").addClass("active")
                self.qls = true;
                self.rls = false;
                self.QualitativeRemove = true;
                self.RationRemove = false;
            },
            showration: function ($event) {//定量列表显示
                var target = $event.target;
                var self = this;
                $("#rl").removeClass("active")
                $("#ql").removeClass("active")
                $("#rl").addClass("active")
                self.qls = false;
                self.rls = true;
                self.QualitativeRemove = false;
                self.RationRemove = true;
            },
            addQualitativeList: function () {//添加定性条件
                var self = this;
                var displayDescribe = $("#DisplayDescribe").val();
                if (displayDescribe == "") {
                    $.toast({ type: 'warning', message: '不能为空值' });
                    //GSDialog.HintWindow("不能为空值", function () { }, "", false);
                    return false;
                }
                var checking =
                        '<main>' +
                          '<Parameters>' +
                            '<Parameter Name="sourceName" Type="" Value="DefaultRate" />' +
                            '<Parameter Name="currentValue" Type="" Value="{0}" />' +
                            '<Parameter Name="Operator@" Type="ReplaceOperator" Operator="{1}" />' +
                            '<Parameter Name="targetName" Type="" Value=" " />' +
                            '<Parameter Name="targetValue" Type="" Value="{2}" />' +
                          '</Parameters>' +
                          '<Query name="SpeedupRepayment" type="EC" dispResult="">' +
                                '@currentValue Operator@ @targetValue' +
                              '</Query>' +
                        '</main>';
                var CheckXml = checking.format('0.02', 'NA', 'NA');
                var executeParam = {
                    SPName: 'usp_addCondition', SQLParams: [
                        { Name: 'EventId', value: EventId, DBType: 'int' },
                        { Name: 'Type', value: 'Qualitative', DBType: 'string' },
                        { Name: 'ConditionDetails', value: displayDescribe, DBType: 'string' },
                        { Name: 'ConditionName', value: '', DBType: 'string' },
                        { Name: 'CaculateCode', value: '', DBType: 'string' },
                        { Name: 'CurrentValue', value: '', DBType: 'string' },
                        { Name: 'Operation', value: '', DBType: 'string' },
                        { Name: 'ThresholdValue', value: '', DBType: 'string' },
                        { Name: 'CheckXml', value: CheckXml, DBType: 'xml' },
                    ]
                };
                common.ExecuteGetData(true, svcUrl, 'TrustManagement', executeParam, function (data) {
                    if (data && data.length > 0) {
                        var description = "专项计划：" + trustId + "，在产品维护向导功能下，事件处理中添加定性条件操作"
                        var category = "产品管理";
                        ActLogs.insertActlogs(false, userName, '更新', category, description, ip, '', '');
                        if ($("#qla").prop("checked")) {
                            $("#qla").prop("checked", false)
                        }
                        self.RenderList()
                        $("#modal-close").trigger("click")
                        $.toast({ type: 'success', message: '保存成功' });
                        //GSDialog.HintWindow("保存成功");
                    } else {
                        $.toast({ type: 'error', message: '保存失败' });
                        //GSDialog.HintWindow("保存失败");
                    }
                });
            },
            EditQualitative: function (value, id) {//打开编辑定性条件窗口
                var self = this;
                $("#DisplayDescribe").val(value);
                $("#QualitativeBtn").hide();
                $("#QualitativeBtnEX").show();
                self.ConditionId = id;
                $.anyDialog({
                    title: "定性条件",
                    width: "400",
                    height: "246",
                    html: $('#circumstances'),
                    mask: true,
                    changeallow: false

                })

            },
            EditRation: function (value1, value2, value3, value4, value5, id) {//打开编辑定量条件窗口
                var self = this;
                $("#ReQuantitativeBtn").show();
                $("#QuantitativeBtn").hide();
                $("#QuantitativeBtn").css("display", "inline");
                $("#RationDescribe").val(value1);
                $("#CurrentValue").val(value3);
                $("#Condition").val(value4);
                $("#Threshold").val(value5);
                self.ConditionId = id;
                var executeParam = {
                    SPName: 'usp_GetCalculationCodeList', SQLParams: [
                    ]
                };
                common.ExecuteGetData(true, svcUrl, 'TrustManagement', executeParam, function (sourceData) {
                    if (sourceData && sourceData.length > 0) {
                        var html = '';
                        $.each(sourceData, function (i, item) {
                            html += '<option value="' + item.CalculationCode + '">' + item.CalculationDesc + '</option>';
                        });
                        $('#CalculationCode').html(html);
                    }
                });
                $.anyDialog({
                    title: "定量条件",
                    width: "750",
                    height: "250",
                    html: $('#circumstances2'),
                    mask: true,
                    changeallow: false
                })
            },
            editQualitativeList: function () {//保存编辑定性条件的值
                var self = this;
                var ConditionId = parseInt(self.ConditionId);
                var displayDescribe = $("#DisplayDescribe").val();
                if (displayDescribe == "") {
                    $.toast({ type: 'warning', message: '不能为空值' });
                    //GSDialog.HintWindow("不能为空值", function () { }, "", false);
                    return false;
                }
                var executeParam = {
                    SPName: 'usp_updateCondition', SQLParams: [
                        { Name: 'ConditionId', value: ConditionId, DBType: 'int' },
                        { Name: 'Type', value: 'Qualitative', DBType: 'string' },
                        { Name: 'ConditionDetails', value: displayDescribe, DBType: 'string' },
                        { Name: 'ConditionName', value: '', DBType: 'string' },
                        { Name: 'CaculateCode', value: '', DBType: 'string' },
                        { Name: 'CurrentValue', value: '', DBType: 'string' },
                        { Name: 'Operation', value: '', DBType: 'string' },
                        { Name: 'ThresholdValue', value: '', DBType: 'string' },
                        { Name: 'CheckXml', value: "", DBType: 'xml' }
                    ]
                };
                common.ExecuteGetData(true, svcUrl, 'TrustManagement', executeParam, function (data) {
                    if (data && data.length > 0) {
                        var description = "专项计划：" + trustId + "，在产品维护向导功能下，事件处理中编辑已有定性事件操作"
                        var category = "产品管理";
                        ActLogs.insertActlogs(false, userName, '更新', category, description, ip, '', '');
                        if ($("#qla").prop("checked")) {
                            $("#qla").prop("checked",false)
                        }
                        self.RenderList()
                        $("#modal-close").trigger("click")
                        $.toast({ type: 'success', message: '保存成功' });
                        //GSDialog.HintWindow("保存成功");
                    } else {
                        $.toast({ type: 'error', message: '保存失败' });
                        //GSDialog.HintWindow("保存失败");
                    }
                });
            },
            editAddRation: function () {//保存编辑定量条件的值
                var self = this;
                var ConditionId = parseInt(self.ConditionId);
                var displayDescribe = $("#RationDescribe").val();
                var calculationCode = $('#CalculationCode').val();
                var currentValue = $("#CurrentValue").val();
                var condition = $("#Condition").val();
                var threshold = $("#Threshold").val();
                if (displayDescribe == "" || threshold == '' || condition == '') {
                    GSDialog.HintWindow("不能为空值", function () {
                    }, "", false);
                    return false;
                }
                var val;
                switch (condition) {
                    case '≥':
                        val = 'ge';
                        break;
                    case '=':
                        val = 'eq';
                        break;
                    case '≠':
                        val = 'ne';
                        break;
                    case '≤':
                        val = 'le';
                        break;
                    case '<':
                        val = 'lt';
                        break;
                    case 'ge':
                        val = 'ge';
                        break;
                    case 'ne':
                        val = 'ne';
                        break;
                    case 'eq':
                        val = 'eq';
                        break;
                    case 'le':
                        val = 'le';
                        break;
                    case 'gt':
                        val = 'gt';
                        break;
                    case '>':
                        val = 'gt';
                        break;
                }
                var checking =
                        '<main>' +
                          '<Parameters>' +
                            '<Parameter Name="sourceName" Type="" Value="DefaultRate" />' +
                            '<Parameter Name="currentValue" Type="" Value="{0}" />' +
                            '<Parameter Name="Operator@" Type="ReplaceOperator" Operator="{1}" />' +
                            '<Parameter Name="targetName" Type="" Value=" " />' +
                            '<Parameter Name="targetValue" Type="" Value="{2}" />' +
                          '</Parameters>' +
                          '<Query name="SpeedupRepayment" type="EC" dispResult="">' +
                                '@currentValue Operator@ @targetValue' +
                              '</Query>' +
                        '</main>';
                var CheckXml = checking.format(currentValue, val, threshold);
                var executeParam = {
                    SPName: 'usp_updateCondition', SQLParams: [
                        { Name: 'ConditionId', value: ConditionId, DBType: 'int' },
                        { Name: 'Type', value: 'Ration', DBType: 'string' },
                        { Name: 'ConditionDetails', value: "", DBType: 'string' },
                        { Name: 'ConditionName', value: displayDescribe, DBType: 'string' },
                        { Name: 'CaculateCode', value: calculationCode, DBType: 'string' },
                        { Name: 'CurrentValue', value: currentValue, DBType: 'string' },
                        { Name: 'Operation', value: condition, DBType: 'string' },
                        { Name: 'ThresholdValue', value: threshold, DBType: 'string' },
                        { Name: 'CheckXml', value: CheckXml, DBType: 'xml' },
                    ]
                };
                common.ExecuteGetData(true, svcUrl, 'TrustManagement', executeParam, function (data) {
                    if (data && data.length > 0) {
                        var description = "专项计划：" + trustId + "，在产品维护向导功能下，事件处理中编译已有定量条件操作"
                        var category = "产品管理";
                        ActLogs.insertActlogs(false, userName, '更新', category, description, ip, '', '');
                        if ($("#rla").prop("checked")) {
                            $("#rla").prop("checked", false)
                        }
                        self.RenderList()
                        $("#modal-close").trigger("click")
                        GSDialog.HintWindow("保存成功");
                    } else {

                        GSDialog.HintWindow("保存失败");
                    }
                });
            },
            addRation: function () {//添加定量条件
                var self = this;
                $("#ReQuantitativeBtn").hide();
                $("#QuantitativeBtn").show();
                var displayDescribe = $("#RationDescribe").val();//
                var calculationCode = $('#CalculationCode').val();
                var currentValue = $("#CurrentValue").val();
                var condition = $("#Condition").val();
                var threshold = $("#Threshold").val();
                if (displayDescribe == "" || threshold == '' || condition == '') {
                    GSDialog.HintWindow("不能为空值", function () {
                    }, "", false);
                    return false;
                }
                var val;
                switch (condition) {
                    case '≥':
                        val = 'ge';
                        break;
                    case '=':
                        val = 'eq';
                        break;
                    case '≠':
                        val = 'ne';
                        break;
                    case '≤':
                        val = 'le';
                        break;
                    case '<':
                        val = 'lt';
                        break;
                    case 'ge':
                        val = 'ge';
                        break;
                    case 'ne':
                        val = 'ne';
                        break;
                    case 'eq':
                        val = 'eq';
                        break;
                    case 'le':
                        val = 'le';
                        break;
                    case 'gt':
                        val = 'gt';
                        break;
                    case '>':
                        val = 'gt';
                        break;
                }
                var checking =
                        '<main>' +
                          '<Parameters>' +
                            '<Parameter Name="sourceName" Type="" Value="DefaultRate" />' +
                            '<Parameter Name="currentValue" Type="" Value="{0}" />' +
                            '<Parameter Name="Operator@" Type="ReplaceOperator" Operator="{1}" />' +
                            '<Parameter Name="targetName" Type="" Value=" " />' +
                            '<Parameter Name="targetValue" Type="" Value="{2}" />' +
                          '</Parameters>' +
                          '<Query name="SpeedupRepayment" type="EC" dispResult="">' +
                                '@currentValue Operator@ @targetValue' +
                              '</Query>' +
                        '</main>';
                var CheckXml = checking.format(currentValue, val, threshold);
                var executeParam = {
                    SPName: 'usp_addCondition', SQLParams: [
                        { Name: 'EventId', value: EventId, DBType: 'int' },
                        { Name: 'Type', value: 'Ration', DBType: 'string' },
                        { Name: 'ConditionDetails', value: "", DBType: 'string' },
                        { Name: 'ConditionName', value: displayDescribe, DBType: 'string' },
                        { Name: 'CaculateCode', value: calculationCode, DBType: 'string' },
                        { Name: 'CurrentValue', value: currentValue, DBType: 'string' },
                        { Name: 'Operation', value: condition, DBType: 'string' },
                        { Name: 'ThresholdValue', value: threshold, DBType: 'string' },
                        { Name: 'CheckXml', value: CheckXml, DBType: 'xml' },
                    ]
                };
                common.ExecuteGetData(true, svcUrl, 'TrustManagement', executeParam, function (data) {
                    if (data && data.length > 0) {
                        var description = "专项计划：" + trustId + "，在产品维护向导功能下，事件处理中添加定量事件操作"
                        var category = "产品管理";
                        ActLogs.insertActlogs(false, userName, '更新', category, description, ip, '', '');
                        if ($("#rla").prop("checked")) {
                            $("#rla").prop("checked", false)
                        }
                        self.RenderList()
                        $("#modal-close").trigger("click")
                        GSDialog.HintWindow("保存成功");
                    } else {

                        GSDialog.HintWindow("保存失败");
                    }
                });
            },
            QualitativeListSelectAll: function ($event) {//定性全选和全取消
                var self = this;
                var target = $event.target;
                if (target.checked) {
                    $("#QualitativeList").find("input[type=checkbox]").prop("checked", true)
                } else {
                    $("#QualitativeList").find("input[type=checkbox]").prop("checked", false)
                }

            },
            RationSelectAll: function ($event) {//定量全选和全取消
                var self = this;
                var target = $event.target
                if (target.checked) {
                    $("#rationList").find("input[type=checkbox]").prop("checked", true)
                } else {
                    $("#rationList").find("input[type=checkbox]").prop("checked", false)
                }
            },
            removeItemList: function () {//删除条目(定性和定量)
                var self=this;
                //定性删除
                if (self.QualitativeRemove) {
                    if ($("#QualitativeList").find('input:checkbox:checked').length == 0) {
                        GSDialog.HintWindow("请勾选删除项");
                        return false;
                    } else {
                        var str = "";
                        $.each($("#QualitativeList").find('input:checkbox:checked'), function (i, v) {
                            if (i == 0) {
                                str+=v.id
                            } else {
                                str += "," + v.id
                            }

                        })
                        var executeParam = {
                            SPName: 'usp_deleteCondition', SQLParams: [
                                { Name: 'ConditionId', value: str, DBType: 'string' },
                            ]
                        };
                        common.ExecuteGetData(true, svcUrl, 'TrustManagement', executeParam, function (data) {
                            if (data) {
                                var description = "专项计划：" + trustId + "，在产品维护向导功能下，事件处理中删除已有定性条件操作"
                                var category = "产品管理";
                                ActLogs.insertActlogs(false, userName, '更新', category, description, ip, '', '');
                                self.RenderList()
                                $("#qla").prop("checked", false)
                                $("#rla").prop("checked", false)
                                $("#modal-close").trigger("click")
                                $.toast({ type: 'success', message: '删除成功' });
                                //GSDialog.HintWindow("删除成功");
                            } else {
                                $.toast({ type: 'error', message: '删除失败' });
                                //GSDialog.HintWindow("删除失败");
                            }
                        });
                    }
                } else {
                    if ($("#rationList").find('input:checkbox:checked').length == 0) {
                        GSDialog.HintWindow("请勾选删除项");
                        return false;
                    } else {
                        var str = "";
                        $.each($("#rationList").find('input:checkbox:checked'), function (i, v) {
                            if (i == 0) {
                                str += v.id
                            } else {
                                str += "," + v.id
                            }

                        })
                        var executeParam = {
                            SPName: 'usp_deleteCondition', SQLParams: [
                                { Name: 'ConditionId', value: str, DBType: 'string' },
                            ]
                        };
                        common.ExecuteGetData(true, svcUrl, 'TrustManagement', executeParam, function (data) {
                            if (data) {
                                var description = "专项计划：" + trustId + "，在产品维护向导功能下，事件处理中删除已有定量条件操作"
                                var category = "产品管理";
                                ActLogs.insertActlogs(false, userName, '更新', category, description, ip, '', '');
                                self.RenderList()
                                $("#rla").prop("checked", false)
                                $("#qla").prop("checked", false)
                                $("#modal-close").trigger("click")
                                $.toast({ type: 'success', message: '删除成功' });
                                //GSDialog.HintWindow("删除成功");
                            } else {
                                $.toast({ type: 'error', message: '删除失败' });
                                //GSDialog.HintWindow("删除失败");
                            }
                        });
                    }
                }
            },
            QualitativeCheckjudge: function ($event) {//定性条件勾选判断
                var target = $event.target;
                var flage;
                if (!target.checked) {
                    $("#qla").prop("checked", false)
                } else {
                    var arry = $("#QualitativeList").find("input[type=checkbox]");
                    $.each(arry, function (i, v) {
                        if (v.checked == false) {
                            flage = true;
                            return false;
                        }
                    })
                    if (flage) {
                        $("#qla").prop("checked", false)
                    } else {
                        $("#qla").prop("checked", true)
                    }
                }
            },
            RationCheckjudge: function ($event) {//定量条件勾选判断
                var target = $event.target;
                var flage;
                if (!target.checked) {
                    $("#rla").prop("checked", false)
                } else {
                    var arry = $("#rationList").find("input[type=checkbox]");
                    $.each(arry, function (i, v) {
                        if (v.checked == false) {
                            flage = true;
                            return false;
                        }
                    })
                    if (flage) {
                        $("#rla").prop("checked", false)
                    } else {
                        $("#rla").prop("checked", true)
                    }
                }
            },
        },
    })
})

