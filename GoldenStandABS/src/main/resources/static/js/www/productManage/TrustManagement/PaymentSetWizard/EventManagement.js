define(function (require) {
    var common = require('common');
    var appGlobal = require('App.Global');
    var GlobalVariable = require('globalVariable');
    var webProxy = require("webProxy");
    var Vue = require("Vue2");
    var trustId = common.getUrlParam('tid');
    var adminDiaLog = require('gs/uiFrame/js/gs-admin-2.pages');
    var GSDialog = require("gsAdminPages");
    require("date_input");
    var ActLogs = require('insertActlogs');
    var RoleOperate = require('gs/uiFrame/js/roleOperate');
    var userName = RoleOperate.cookieName();
    var toast = require('toast');
    require("app/projectStage/js/project_interface");
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
    
     $(function () {
        var EventListTitleArray = ["事件名称", "触发条件", "触发状态", "触发时间", "操作", "关联偿付情景"];   
        var vm = new Vue({
            el: "#App",
            data: {
                EventListTitle: EventListTitleArray,
                Common: common,
                AppGlobal: appGlobal,
                GlobalVariable: GlobalVariable,
                AdminDiaLog: adminDiaLog,
                WebProxy: webProxy,
                svcUrl: GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?",
                TrustId: trustId,
                AddTriggerEvent: '添加事件',
                removeTriggerEvent: "删除事件",
                TriggerEventDetails:"查看触发事件详情",
                reoffon: false,
                EventByConditonData: [],//偿付情景关联事件、条件数据
                ScenarioListByTrustId: [],//事件关联的偿付情景
                ShowEventByScenario: -1,//是否显示偿付情景
                IsShowConditionDetaile:-1,//判断条件显示
                SelectConditionStarteDate: '',//选择的触发时间
                ConditionItemsDetaile: '',//触发条件详情
                CurrentDate: '',//当前时间
                ConditionTypes: ''//条件类型
                , DbClickChangeDate: '',
                AllConditons:[],//所有条目的信息
                IsDisabled: true,
                ScenarioPaymentItem: -1,
                btnshow: -1,
                iconshow: -1,
                selectValue: '',
                selectId: []
            },
            beforeMount: function () {
                this.Render();
            },
            mounted: function () {
                this.SelectDate();
            },
            methods: {

                //渲染
                Render: function () {
                    this.GetTrust_EventsByCondition();
                    this.getScenarioListByTrustId();
                    $("#mask").fadeOut();
                },
                //获取当前时间
                GetCurrentDateval: function (){
                    var Currendate=''
                    var myDate = new Date();
                    var year = myDate.getFullYear();
                    var mouth = myDate.getMonth() + 1;
                    var day = myDate.getDate();
                    CurrentDate = year+"-"+mouth+"-"+day;
                    return CurrentDate
                },
                //判断元素是否存在数组中
                InArray: function (val, array) {
                    var self = this;
                    var InArrayVal;
                    if (array.length == 0) {
                        InArrayVal = -1;
                    } else {
                        if ($.inArray(val, array) == -1) {
                            InArrayVal = -1;
                        } else {
                            InArrayVal = 0;
                        }
                    }
                    return InArrayVal;
                },
                //显示所有删除按钮
                removeEvent: function () {
                    var self = this;
                    self.reoffon = !self.reoffon
                },
                // 封装一个AJax请求方法
                getSourceData: function (executeParam, callback) {
                    var serviceUrl = this.GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
                    this.Common.ExecuteGetData(false, serviceUrl, 'TrustManagement', executeParam, callback);
                },
                //获取事件对应条目信息
                GetTrust_EventsByCondition: function () {//改动
                    var self = this;
                    var executeParam = {
                        'SPName': "usp_getALLEventAndConditionByTrustId", 'SQLParams': [
                            { 'Name': 'TrustId', 'Value': self.TrustId, 'DBType': 'int' }
                        ]
                    };
                    var serviceUrl = self.GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
                    self.Common.ExecuteGetData(false, serviceUrl, 'TrustManagement', executeParam, function (data) {
                        self.AllConditons = data;
                        var Events = {
                            EventName: [],
                            ConditionCode: []
                        }
                        var val
                        $.each(data, function (index, val) {
                            val = val;
                            //console.log(val);
                            var InEventName = self.InArray(val.EventCode, Events.EventName);//判断EventName是否存在
                            var InConditionId = self.InArray(val.ConditionCode, Events.ConditionCode);//判断EventName是否存在
                            var EventByConditonTemplate = {
                                id: "",
                                EventName: '',
                                EventId: '',
                                Condition: [],
                                ScenarioName: "",
                                EventCode: '',
                                ScenarioId: ''
                            }

                            if (InEventName == -1) {
                                EventByConditonTemplate.id = index;
                                EventByConditonTemplate.EventName = val.EventName;
                                EventByConditonTemplate.EventId = val.TrustEventId;
                                EventByConditonTemplate.ScenarioName = val.ScenarioName;
                                EventByConditonTemplate.EventCode = val.EventCode;

                                self.selectValue = val.ScenarioName;
                                 

                               
                                EventByConditonTemplate.ScenarioId = val.ScenarioId ? val.ScenarioId : -1;

                                

                                Events.EventName.push(val.EventCode)//把值传进去下次比较
                                $.each(data, function (i, v) {
                                    //if (InConditionId == -1) {
                                        var Conditions = {
                                            EventId: '',//事件Id
                                            ConditionCode: "",//条目Id
                                            ConditionDESC: "",//条件描述
                                            ConditionType: '',//条件类型
                                            ConditionStatus: '',//状态
                                            ConditionStartDate: '',//触发时间
                                            ThresholdValue: '',//阀值
                                            CurrentValue: '',//当前值
                                        }
                                        Conditions.EventId = v.TrustEventId;
                                        Conditions.ConditionCode = v.ConditionCode;
                                        Conditions.ConditionDESC = v.ConditionDetails || v.ConditionName;
                                        Conditions.ConditionType = v.ConditionType;
                                        Conditions.ConditionStatus = v.ConditionStatus;
                                        Conditions.ConditionStartDate = v.StartDate;
                                        Conditions.ThresholdValue = v.ThresholdValue;
                                        Conditions.CurrentValue = v.CurrentValue//当前值
                                        Conditions.RStatus = v.RStatus;
                                        Conditions.ConditionId = v.ConditionId
                                        Conditions.Operation = v.Operation
                                        EventByConditonTemplate.Condition.push(Conditions);
                                        Events.ConditionCode.push(v.InConditionId)//把值传进去下次比较
                                    //}
                                })
                                self.EventByConditonData.push(EventByConditonTemplate);
                            }
                        })
                    })
                },

                //专项对应的偿付情景
                getScenarioListByTrustId: function () {//改动
                    var self = this;
                    var executeParam = {
                        'SPName': "usp_GetTrustPaymentScenario", 'SQLParams': [
                            { 'Name': 'TrustId', 'Value': self.TrustId, 'DBType': 'int' }
                        ]
                    };
                    var serviceUrl = self.GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
                    self.Common.ExecuteGetData(false, serviceUrl, 'TrustManagement', executeParam, function (data) {
                        self.ScenarioListByTrustId = data;
                    });
                },

                EventFromPaymentSequence: function (scenarioId, EventId, callback) {
                    var self = this;
                        var executeParam = {
                            'SPName': "usp_associatePaymentScenario", 'SQLParams': [
                                { 'Name': 'ScenarioId', 'Value': scenarioId, 'DBType': 'int' },
                                { 'Name': 'EventId', 'Value': EventId, 'DBType': 'int' },
                            ]
                        };
                        var serviceUrl = this.GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
                        self.Common.ExecuteGetData(false, serviceUrl, 'TrustManagement', executeParam, callback);
                   

                },

                //获取Parse
                SelectScenario: function (event, EventCode, index) {
                    var self = this;
                   
                    var scenarioId = event.target.value;//获取当前触发对象
                    var scenarioValue
                    $.each($(event.target).find("option"), function (i, v) {
                        if (v.value == scenarioId) {
                            scenarioValue = v.innerText
                        }
                    })
                    var description = "专项计划：" + self.TrustId + "，在产品维护向导功能下，事件处理中修改关联偿付情景操作"
                    var category = "产品管理";
                    ActLogs.insertActlogs(false, userName, '更新', category, description, ip, '', '');
                    var EventId = EventCode.EventId
                    var eventList = event.target.textContent;
                    if (scenarioValue == self.selectValue) {
                        return;
                    }
                    if (scenarioId == "-1") {
                        self.IsDeleteEventByScenario(EventCode, index);
                        EventCode.ScenarioId="-1"
                        GSDialog.HintWindow("当前无关联偿付情景",function() {
                            location.reload();
                        });
                        return;

                    } else {
                        self.IsDeleteEventByScenario(EventCode, index);
                    }
                    EventCode.ScenarioId = scenarioId;
                    self.EventFromPaymentSequence(scenarioId, EventId, function (data) {
                        
                        if (data[0].Column1) {
                            //self.selectValue = data[0].Column1;
                            $.toast({ type: 'success', message: '已关联偿付情景' + scenarioValue, width: 150 });
                            setTimeout(function () {
                                location.reload();
                            },1000)
                            //GSDialog.HintWindow("已关联偿付情景" + scenarioValue + "", function () {
                            //    location.reload();
                            //});
                          
                        }
                    })
                },

                //增加事件条目
                AddEventDesc: function (EventObj) {
                    var EventId = EventObj.EventId;
                    var self = this;
                    self.AdminDiaLog.open(
                       '事件条目管理',
                        self.GlobalVariable.TrustManagementServiceHostURL + 'productManage/TrustManagement/PaymentSetWizard/AddEventDesc.html?tid={0}&&EventId={1}&&EventName={2}&&EventCode={3}'.format(self.TrustId, EventId, EventObj.EventName, EventObj.EventCode),
                        ' ',
                         false,
                         '860',
                         '500',"",true,false,true,true
                     )
                },

                //查看触发事件详情编辑
                EditEventDesc: function (EventObj) {
                    var self = this;
                    self.AdminDiaLog.open(
                       '触发事件',
                        self.GlobalVariable.TrustManagementServiceHostURL + 'productManage/TrustManagement/PaymentSetWizard/EventDifinitionManegement.html?tid='+trustId,
                        ' ',
                         false,
                         '900',
                         '500'
                     )
                },

                //增加触发事件
                addTriggerEvent: function () {
                    var self = this;
                    self.AdminDiaLog.open(
                        self.AddTriggerEvent,
                        self.GlobalVariable.TrustManagementServiceHostURL + 'productManage/TrustManagement/PaymentSetWizard/AddEvent.html?tid={0}'.format(self.TrustId),
                        ' ',
                         false,
                         '750',
                         '513'
                     )
                },

                //显示关联偿付情景select
                IsShowEventByScenario: function (event) {
                    if (this.ShowEventByScenario != event) {
                        this.ShowEventByScenario = event;
                    } else {
                        this.ShowEventByScenario = null;
                    }
                  
                },

                //删除事件关联的偿付情景
                IsDeleteEventByScenario: function (EventCode, index) {
                    var self = this;
                    if (!EventCode.ScenarioId) {
                        return false;
                    }
                    var executeParam = {
                        'SPName': "usp_cancelAssociatePaymentScenario", 'SQLParams': [
                            { 'Name': 'ScenarioId', 'Value': EventCode.ScenarioId, 'DBType': 'int' },
                            { 'Name': 'EventId', 'Value': EventCode.EventId, 'DBType': 'int' },
                        ]
                    };
                    var serviceUrl = this.GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
                    self.Common.ExecuteGetData(false, serviceUrl, 'TrustManagement', executeParam, function(data){
                        if (data) {
                            self.EventByConditonData[index].ScenarioName = null;
                            }
                    });
                },
                //鼠标点击显示删除的i图标
                MsIn: function ($event, $index) {
                    var self = this;
                    var target=$($event.target);                              
                    if (target.find("i").is(":hidden")) {
                        target.find("i").show();
                    } else {
                        target.find("i").hide();
                    }
                },
                //点击显示修改按钮
                showbtn: function ($event,$index) {
                    var self = this;
                    var event = $event.target;
                    self.btnshow = $index;
                }
                //触发事件条目
                , ConditionActive: function (ConditionItem, $ConditionItemIndex) {
                    var self = this;
                    var SelectConditionStarteDate = $('#' + $ConditionItemIndex).val();
                    var C = this.GetCurrentDateval();
                    var CurrentDate = SelectConditionStarteDate == false ? C : SelectConditionStarteDate;
                    var ConditionId = ConditionItem.ConditionId;
                    var executeParam = {
                        'SPName': "usp_triggerCondition", 'SQLParams': [
                        { 'Name': 'ConditionId', 'Value': ConditionId, 'DBType': 'int' },
                        { 'Name': 'StartDate', 'Value': CurrentDate, 'DBType': 'date' }
                        ]
                    }
                        self.getSourceData(executeParam, function (data) {
                            if (data && data.length > 0) {
                                var description = "专项计划：" + self.TrustId + "，在产品维护向导功能下，事件处理中对定性条件进行触发操作"
                                var category = "产品管理";
                                ActLogs.insertActlogs(false, userName, '更新', category, description, ip, '', '');
                                GSDialog.HintWindow("触发成功", function () {
                                    location.reload();
                                });
                            }
                        });
                        
                },
                //时间初始化
                SelectDate: function (Event) {
                    console.log($(".date-plugins").length)
                    $(".date-plugins").date_input();
                },
                ChangeConditionDate: function (EventId, ConditionId, StartDate) {//时间条件改动
                    var executeParam = {
                        'SPName': "usp_updateTriggerDate", 'SQLParams': [
                        { 'Name': 'EventId', 'Value': EventId, 'DBType': 'int' },
                        { 'Name': 'ConditionId', 'Value': ConditionId, 'DBType': 'int' },
                        { 'Name': 'StartDate', 'Value': StartDate, 'DBType': 'date' }
                        ]
                    };
                    this.getSourceData(executeParam, function (data) {
                        if (data) {
                            GSDialog.HintWindow("刷新成功!", function() {
                                location.reload();
                            });
                        }
                    });
                },
                //鼠标上去显示条目所有信息
                MoserOverConditionItem: function (data, $ConditionItemIndex) {
                    var self = this;
                    self.ConditionItemsDetaile = '';
                    if (data.ConditionType == "定性条件") {
                        self.ConditionItemsDetaile = "详情：" + data.ConditionDESC;
                        self.ConditionTypes = '';//类型初始化
                        self.ConditionTypes = data.ConditionType;//重新赋值
                    } else {
                        var Vals = data.Operation;
                        self.ConditionTypes = '';//类型初始化
                        self.ConditionItemsDetaile = '当前累计违约率: 当前值为' + ' ' + data.CurrentValue + ' ' + Vals + ' ' + '阀值' + ' ' + data.ThresholdValue;
                        self.ConditionTypes = data.ConditionType;//重新赋值
                    }
                    self.IsShowConditionDetaile = $ConditionItemIndex;
                }
                , ConditionDetaileHide: function () {
                    this.IsShowConditionDetaile = -1;
                }
                , changeCount: function (ConditionItem, $event, value) {
                    var self=this;
                    var changeData = $($($event.target).siblings()[0]).val();
                    var ConditionId = ConditionItem.ConditionId;
                    var EventId = ConditionItem.EventId
                    self.ChangeConditionDate(EventId,ConditionId, changeData)
                }
                , RemoveEvent: function (Item, Index) {
                    var self = this;
                    GSDialog.HintWindowTF("该事件偿付情景将被重置为默认状态，确认删除?", function () {//删除专项事件
                        var executeParam = {
                            'SPName': "usp_deleteEventByEventId", 'SQLParams': [
                            { 'Name': 'EventId', 'Value': Item.EventId, 'DBType': 'int' },
                            ]
                        };
                        self.getSourceData(executeParam, function (data) {
                            if (data) {
                                var description = "专项计划：" + self.TrustId + "，在产品维护向导功能下，事件处理中删除事件操作"
                                var category = "产品管理";
                                ActLogs.insertActlogs(false, userName, '更新', category, description, ip, '', '');
                                location.reload();
                            }
                        });

                    })
                }
            },
            filters: {
                EventStatusFilter: function (v) {
                    var Status = '';
                    if (v == "Y") {
                        Status = '已触发'
                    } else {
                        Status = '未触发'
                    }
                    return Status
                },
                //vue时间格式化
                time: function (value) {
                    var self = this;
                    function add0(m) {
                        return m < 10 ? '0' + m : m
                    }
                    if (value) {
                        //var time = new Date(parseInt(value.replace(/[^0-9]/ig, "")));
                        var time = new Date(parseInt(value.replace(/[^0-9]/ig, "")));
                        var y = time.getFullYear();
                        var m = time.getMonth() + 1;
                        var d = time.getDate();
                        return y + '-' + add0(m) + '-' + add0(d);
                    } else {
                        return 'null'
                    }
                },
                ConditionTypeBytime: function (data) {
                    var ConditionStatusDate = '';
                    if (data.CurrentValue > data.ThresholdValue || data.CurrentValue == data.ThresholdValue) {
                        var myDate = new Date();
                        ConditionStatusDate = myDate.toLocaleDateString();
                        var Ary = ConditionStatusDate.split('/');
                        var f = Ary[1] < 10 ? "0" + Ary[1] : Ary[1];
                        var s = Ary[2] < 10 ? "0" + Ary[2] : Ary[2];
                        ConditionStatusDate = Ary[0] + '-' + f + "-" + s;
                    } else {
                        ConditionStatusDate = 'null'
                    }
                    return ConditionStatusDate
                },
                //过滤触发状态
                FilterConditionStatus: function (val) {
                    var ConditionStatus = '';
                    var self = this;
                    if (val.ConditionType == '定性条件') {
                        switch (val.ConditionStatus) {
                            case '未触发':
                                ConditionStatus = '未触发';
                                break;
                            case '已触发':
                                ConditionStatus = '已触发';
                                break;
                            default:
                                ConditionStatus = '未触发';
                        }
                    } else {
                        if (val.RStatus =="未触发") {
                            ConditionStatus = '未触发';
                        } else {
                            ConditionStatus = '已触发';
                        }
                    }
                    return ConditionStatus
                },
                //过滤事件条件
                fiterThreshold: function (val) {
                    var ThresholdVal = '';
                    if (val.ConditionType == "定性条件") {
                        if (typeof (val.ConditionDESC) == 'string') {
							var vals = val.ConditionDESC.substr(0, 30);
							 if (val.ConditionDESC.length > 30) {
                            ThresholdVal = vals + '...'
							} else { 
								ThresholdVal = vals 
							}
						}
                    } else {
                        var Vals = val.Operation
                        ThresholdVal = '当前累计违约率: 当前值为 ' + ' ' + val.CurrentValue + ' ' + Vals + ' ' + '阀值' + ' ' + val.ThresholdValue;
                    }
                    return ThresholdVal;
                }

            },

        })

    })

});

