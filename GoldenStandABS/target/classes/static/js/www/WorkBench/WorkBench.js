var CKmed; checkpackage = {}; 
var addCheckReport
define(function (require) {
    var $ = require('jquery');
    require('jquery.cookie');
    require('moment');
    require('fullCalendar');
    require('fullCalendar-zh-cn');
    require('jquery.datagrid');
    require('jquery.datagrid.options');
    require('date_input');
    var GlobalVariable = require('globalVariable');
    var common = require('common');
    var ko = require('knockout');
    var mapping = require('knockout.mapping');
    var webProxy = require('gs/webProxy');
    var trustId_ = common.getQueryString('tid');
    var GSDialog = require("gsAdminPages");
    var taskIndicator = require('gs/taskProcessIndicator');
    var sVariableBuilder = require('gs/sVariableBuilder');
    var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
    $(function () {
        $('#gsCalendar').fullCalendar(BuildCalendarSettings());
        $('#goHome').click(function () {
            $('.header-nav', top.document).css('display', 'none');
            $('#bussinessSystem', top.document).css('display', 'none');
            $('#others', top.document).css('display', '');
            $('#work', top.document)[0].contentWindow.location.replace('../navigator/main.html');
        })
        GetTrustNum(function (res) {
            var selectSeachTrustId = $("#selectSeachTrustId"); //专项计划过滤select
            var SeachTrustId = $("#SeachTrustId");//专项计划过滤input
            var ClickDiv = $("#ClickDiv");//装过滤select-option的值
            var MaskSelect = $(".MaskSelect");//遮罩

            var AddTrustEvent = $("#AddTrustEvent");
            var str = '<option value="0" class="option"><option>';
            for (var i = 0; i < res.length; i++) {
                str += "<option  class='option' value='" + res[i].TrustCode + "'>" + res[i].TrustCode + "<option>";
            }
            function selectOptionVal() {
                var selectOption = $("option");
                $.each(selectOption, function (i, v) {
                    var val = $(v).val();
                    if (val) {
                        $(v).show();
                    } else {
                        $(v).hide();
                    }
                })
            }
            selectOptionVal();
            selectSeachTrustId.append(str);
            AddTrustEvent.append(str);
            selectSeachTrustId.change(function () {
                SeachTrustId.val($(this).val());
                ClickDiv.hide();
            })
            SeachTrustId.on("click", seachEvents);
            MaskSelect.on("click", seachEvents);
            ClickDiv.on("mouseover", function () {
                ClickDiv.show();
            });
            ClickDiv.on("mouseout", function () {
                ClickDiv.hide();
            });

            function seachEvents() {
                var ClickDiv = $("#ClickDiv");
                ClickDiv.html('');//清空上一次数据
                ClickDiv.show();
                var Opstr = $("#selectSeachTrustId .option");
                var Opstrs = '';
                for (var i = 0; i < Opstr.length; i++) {
                    if ($(Opstr[i]).val() != 0) {
                        Opstrs += "<p class='OpData'>" + $(Opstr[i]).val() + "</p>";
                    }
                }
                ClickDiv.append(Opstrs);
                var opTionP = $(ClickDiv).children();
                opTionP.click(function () {
                    SeachTrustId.val($(this).html());
                    ClickDiv.hide();
                });
                var sw = SeachTrustId.innerWidth();
                ClickDiv.width("auto");
                //ClickDiv.css({ left: -sw })
            }
        });
        keyDown();
        TabSelect();
        seachBtn();
        AddEventChange();
        $('.date-plugins').date_input();//激活时间控件
        // 切换tabs
        $('#tabs a').click(function (e) {
            e.preventDefault();
            var titleId = $(this).attr('title')
            $('#tabs li').removeClass("current").removeClass("hoverItem");
            $(this).parent().addClass("current");
            $("#contnet div").removeClass("show");
            $('#' + $(this).attr('title')).addClass('show');
    });
    });
    //Calendar日期控件设置
    function BuildCalendarSettings() {
        var calendarSettings = {
            header: {
                left: 'prev prevYear, today nextYear next,',
                center: 'title',
                right: 'month,basicWeek,basicDay'
            },
            buttonIcons: {
                prev: 'left-single-arrow',
                next: 'right-single-arrow',
                prevYear: 'left-double-arrow',
                nextYear: 'right-double-arrow'
            },
            editable: false,
            timezone: 'local',
            //theme:true,是否用JQuery Ui样式
            firstDay: 1,
            //editable: true,是否可拖动
            selectable: true,
            eventOrder: 'start',
            displayEventTime: false,
            eventLimit: true,
            allDay: false,
            defaultView: 'month',
            fixedWeekCount: true,//控制周
            weekMode: 'liquid',
            showNonCurrentDates: false,//控制月的开始和末尾
            weekNumbers: false,
            events: function (start, end, timezone, callback) {
                //今日待办
                TodoDatagrid(start, end, timezone, function (response) {
                    var total = $("#total");
                    var TodayDataGrid = $("#TodayDataGrid");
                    var ErrorData = $("#ErrorData");
                    var TrustEventAlertTables = $("#TrustEventAlertTable");
                    var TrustEventAlertListError = $("#TrustEventAlertListError")
                    //我的日程列表
                    $('#divDataGrid').remove();
                    $('#divDataList').html("<div id='divDataGrid'></div>");
                    var options = DataListDataBind(response[0]);
                    $('#divDataGrid').datagrid(options);

                    //存续期事件提醒
                    $('#TrustEventAlertTable').remove();
                    $('#TrustEventAlertList').html("<div id='TrustEventAlertTable'></div>");
                    var TrustEventAlertTable = TrustEventAlert(response[4]);
                    $('#TrustEventAlertTable').datagrid(TrustEventAlertTable);
                    //今日待办
                    $('#TodayDataGrid').remove();
                    var TodayDataListBindOp = TodayDataListBind(response[0]);
                    $('#TodayDataList').html("<div id='TodayDataGrid'></div>");
                    $('#TodayDataGrid').datagrid(TodayDataListBindOp);
                    total.html(response[0].length)
                    if (response[0].length == 0) {
                        TodayDataGrid.hide();
                        ErrorData.show();
                    } else {
                        TodayDataGrid.show();
                        ErrorData.hide();
                    }
                    //待审核
                    var noCheckTotal = $("#noCheckTotal");
                    var noCheckDataGrid = $("#noCheckDataGrid");
                    var noCheckErrorData = $("#noCheckErrorData");
                    var noCheckDataListBindOp = noCheckDataListBind(response[2]);
                    $('#noCheckDataList').html("<div id='noCheckDataGrid'></div>");
                    $('#noCheckDataGrid').datagrid(noCheckDataListBindOp);
                    noCheckTotal.html(response[2].length)
                    if (response[2].length == 0) {
                        noCheckDataGrid.hide();
                        noCheckErrorData.show();
                    } else {
                        noCheckDataGrid.show();
                        noCheckErrorData.hide();
                    }
                    //已审核
                    var hasCheckTotal = $("#hasCheckTotal");
                    var hasCheckDataGrid = $("#hasCheckDataGrid");
                    var hasCheckErrorData = $("#hasCheckErrorData");
                    var hasCheckDataListBindOp = hasCheckDataListBind(response[3]);
                    $('#hasCheckDataList').html("<div id='hasCheckDataGrid'></div>");
                    $('#hasCheckDataGrid').datagrid(hasCheckDataListBindOp);
                    hasCheckTotal.html(response[3].length)
                    if (response[3].length == 0) {
                        hasCheckDataGrid.hide();
                        hasCheckErrorData.show();
                    } else {
                        hasCheckDataGrid.show();
                        hasCheckErrorData.hide();
                    }

                    if (response[4].length == 0) {
                        TrustEventAlertTables.hide();
                        TrustEventAlertListError.show();
                    } else {
                        TrustEventAlertListError.hide();
                        TrustEventAlertTables.show();
                    }
                    callback(response[1])//绑定到日历上
                })
                //添加事件
                addEvent(function () {
                    var self = this;
                    var AddOrganisation = '增加待办项';
                    $.anyDialog({
                        width: 450,
                        height: 305,
                        title: AddOrganisation,
                        html: $('#addOrganisation').show(),
                        onClose: function () {
                            window.location.reload(true);
                        },
                        draggable: function () {
                        }
                    });
                    $("#saveOrganisation").click(function () {
                        var AddDateTime = $("#AddDateTime").val();
                        var AddDesc = $("#AddDesc").val();
                        var AddType = $("#AddType").val();
                        var AddTitle = $("#AddTitle").val();
                        var TrustId = $("#AddTrustEvents").val();
                        if (AddTitle!="" && TrustId!="") {
                            var parameterDatas = [
                                    ['TrustName', TrustId, 'string'],
                                    ['AddDate', AddDateTime, 'string'],
                                    ['AddTitle', AddTitle, 'string'],
                                    ['AddType', AddType, 'string'],
                                    ['Desc', AddDesc, 'string'],
                            ]
                            var svcUrls = webProxy.dataProcessServiceUrl + "CommonGetExecute?connConfig=TrustManagement&appDomain=dbo&executeParams=";
                            var promise = webProxy.comGetData(parameterDatas, svcUrls, 'usp_AddWorkBenchEvent');
                            promise().then(function (response) {
                                var res = JSON.parse(response);
                                console.log(res)
                                if (res[0].u == 1) {
                                    GSDialog.HintWindow("添加成功", function () { $("#modal-close").trigger("click")}, "", false);
                                    //添加事件
                                    $("#gsCalendar").fullCalendar('addEventSource', function () {//添加待办项到视图上
                                        callback(
                                            events = [{
                                                title: AddTitle,
                                                start: AddDateTime,
                                                end: AddDateTime,
                                                eventDesc: AddDesc,
                                                eventType: AddType,
                                                TrustCode: TrustId
                                            }]
                                            )
                                        var TodayDataListBindOp = TodayDataListBind(events);
                                        $('#TodayDataGrid').datagrid(TodayDataListBindOp);
                                    });
                                } else if (res[0].u == 0) {
                                    GSDialog.HintWindow("产品名称不能为空", function () { }, "", false);
                                } else {
                                    GSDialog.HintWindow("产品名称不存在", function () { }, "", false);
                                }
                            });
                        } else {
                            GSDialog.HintWindow("产品名称和标题都不能为空", function () { },"",false);
                        }
                    })
                    addTrustCodeSelect()
                });

            },
            eventClick: function (calEvent, jsEvent, view) {
                RenderEventInfo(calEvent);
                var position = this.getBoundingClientRect();
                $('#gsCalendarEvent').css({ left: position.left, top: position.bottom, "z-index": 99 });
            },
            dayClick: function (date, jsEvent, view) {
                $('#gsCalendar').fullCalendar('changeView', 'basicDay');
                $('#gsCalendar').fullCalendar('gotoDate', date);
            },
            eventMouseover: function (calEvent, jsEvent, view) {
                RenderEventInfo(calEvent)
                var that = this;
                var boxh = $("#box").height();
                var conth = $('body').find("#gsCalendarEvent").height();
                var position = that.getBoundingClientRect();
                var scrollTop = $("html").scrollTop();
                if (conth + position.bottom + scrollTop > boxh) {
                    var h = position.top + scrollTop - conth - 30;
                    $('#gsCalendarEvent').css({ left: position.left, top: h, "z-index": 99 });
                } else {
                    $('#gsCalendarEvent').css({ left: position.left, top: position.bottom + scrollTop+5, "z-index": 99 });
                }
            },
            eventMouseout: function (calEvent, jsEvent, view) {
                $('#gsCalendarEvent').hide();
            },
            //eventAfterRender
            eventRender: function (event, element, view) {
                //   if (view.name == 'month') {
                //       $('.fc-rigid').height("128");
                //   }
                //   else if (view.name == 'basicWeek') {
                //       $('.fc-week.fc-rigid').height(498);
                //   } else {
                //       $('.fc-week.fc-rigid').height(498);
                //}
                var fcToday = $(".fc-today");
                var NowDate = getNowFormatDate(1);
                var NextDate = getNowFormatDate(2);
                var afterTomorrow = getNowFormatDate(3);
                var NextafterTomorrow = getNowFormatDate(4);
                var GetCruuterDate = new Date(getStringDate(event.start._i)).dateFormat('yyyy-MM-dd');
                var FcTodayNextAll = fcToday.next(".fc-day-number");
                var fcTodayprevAll = fcToday.prev(".fc-day-number");
                //FcTodayNextAll.css({ background: "red" });
                //fcTodayprevAll.css({ background: "blue" });//当前日期前后的背景颜色


                $(fcToday[0]).css({ background: "#ffe1d4" })//控制日的背景色

                //设置某个日期下事件的样式
                if (NowDate == GetCruuterDate) {
                    element.css({ background: "#ff8953", border: "none" })
                } else if (NextDate == GetCruuterDate) {
                    element.css({ background: "#569ef4", border: "none" })
                } else if (afterTomorrow == GetCruuterDate) {
                    element.css({ background: "#569ef4", border: "none" })
                } else if (NextafterTomorrow == GetCruuterDate) {
                    element.css({ background: "#569ef4", border: "none" })
                } else if (NextafterTomorrow < GetCruuterDate) {
                    element.css({ background: "#14c2e1", border: "none" })
                }
            },
            eventTextColor: '#fff',
            eventBorderColor: '#9e9e9e',
            eventBackgroundColor: '#9e9e9e',
            eventColor: '',
            allDayText: '全天事件',
            contentHeight: '700px',
            aspectRatio: '1.9',//控制日期内条数
            weekends: 'vairiable',
            stick: true,

        };
        return calendarSettings;
    }
    //数据
    function TodoDatagrid(start, end, timezone, cb) {
        //日期控件的end时间会多一天所以为了日历模式和列表模式统一，要在end时间上减去一天
        end == null ? null : end._d.setDate(end._d.getDate() - 1);
        var end = end == null ? null : end.format('YYYY-MM-DD');
        var start = start == null ? null : start.format('YYYY-MM-DD');
        var SeachTrustId = $("#SeachTrustId").val();
        var trustId = SeachTrustId != '' ? SeachTrustId : trustId_;
        var username = sessionStorage.getItem('gs_UserName');
        var executeParam = {
            SPName: 'usp_CalendarGetTrustEvents', SQLParams: [
                { Name: 'trustCode', value: trustId, DBType: 'string' },
                { Name: 'start', value: start, DBType: 'datetime' },
                { Name: 'end', value: end, DBType: 'datetime' },
                { Name: 'userName', value: username, DBType: 'string' }
            ]
        };
        console.log(executeParam);
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
                cb(response);
            },
            error: function (response) { alert("error:" + response.text); }
        });
    }
    //显示事件信息
    function RenderEventInfo(calEvent) {
        if (!calEvent) { return; }
        calEvent.startDspl = new Date(calEvent.start).dateFormat('yyyy年MM月dd日');
        $('.event-detail-content .event-content').each(function (i,v) {
            var $this = $(this);
            var name = $this.attr('data-name');
            var value = calEvent[name];
            $this.html(value);

        });
        $('#gsCalendarEvent').show()
        $('.event-detail-alert').hide();
        $('.event-detail-content').show();
    }
    //根据待办项ID找到相应的事件
    function EventInfoById(id, data) {
        var calEvent = data.filter(function (v, i) {
            return v.id == id;
        })
        //Json日期转成UTC
        if (calEvent[0]) {
            if (typeof (calEvent[0].start) != "object") {
                calEvent[0].start = getStringDate(calEvent[0].start);
            }
        }
        RenderEventInfo(calEvent[0]);
    }
    function PositionEventInfoById(id, data, position) {
        var calEvent = data.filter(function (v, i) {
            return v.id == id;
        })
        //Json日期转成UTC
        if (calEvent[0]) {
            if (typeof (calEvent[0].start) != "object") {
                calEvent[0].start = getStringDate(calEvent[0].start);
            }
        }
        if (!calEvent[0]) { return; }
        //var position;
        calEvent[0].startDspl = new Date(calEvent[0].start).dateFormat('yyyy年MM月dd日');
        $('.event-detail-content .event-content').each(function () {
            var $this = $(this);
            var name = $this.attr('data-name');
            var value = calEvent[0][name];
            $this.html(value);
            $('#gsCalendarEvent').show();
            //position = $this[0].getBoundingClientRect();

        });
        $('#gsCalendarEvent').css({
            top: position.bottom, left: position.left
        });
        $('.event-detail-alert').hide();
        $('.event-detail-content').show();
    }
    function TrustInfomationAlt(id, data, position) {
        var calEvent = data.filter(function (v, i) {
            return v.id == id;
        })
        $('#gsTrustInfoEvent').show();
        //Json日期转成UTC
        if (calEvent[0]) {
            if ((calEvent[0].StartDate).indexOf("Date") > -1) {
                calEvent[0].StartDate = getStringDate(calEvent[0].StartDate);
                calEvent[0].StartDate = new Date(calEvent[0].StartDate).dateFormat('yyyy年MM月dd日');
            } else {
                calEvent[0].StartDate = calEvent[0].StartDate;
            }
        } else {
            return;
        }
        $('.event-detail-content .event-content').each(function () {
            var $this = $(this);
            var name = $this.attr('data-name');
            var str = '';
            if (name == 'DisplayDescribe' && calEvent[0][name]) {
                var calEventAry = calEvent[0][name].split("$$");
                for (var a = 0; a < calEventAry.length; a++) {
                    var num = a + 1;
                    str += "<li class='numberLi'>" + "第" + num + "条:" + calEventAry[a] + "<li>"
                }
                $this.html('');//先清空原来的数据
                $this.append(str);
            } else {
                var value = calEvent[0][name];
                $this.html('');//先清空原来的数据
                $this.html(value);
            }
        });
        $('#gsTrustInfoEvent').css({
            top: position.bottom, left: position.left
        });
        $('.event-detail-alert').hide();
        $('.event-detail-content').show();

    }
    function getStringDate(strDate) {
        //var str = '/Date(1408464000000)/';
        if (!strDate) {
            return '';
        }
        var str = strDate.replace(new RegExp('\/', 'gm'), '');
        return eval('new ' + str);
    }
    //日历事件列表
    function DataListDataBind(response) {
        var options = {
            idField: 'id',
            autoload: true,
            data: response,
            col: [
                { field: "id", title: "编号", attrHeader: settable.tableTh, attr: settable.tableTd },
                { field: "TrustCode", title: "产品标识", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd },
                { field: "TrustName", title: "产品名称", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd },
                {
                    field: "title", title: "描述", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd
                    , render: function (data) {
                        return data.value ? data.value.replace(/\(.*?\)/g, '') : '';
                    }
                },
                {
                    field: "start", title: "开始时间", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd
                    , render: function (data) {
                        return data.value ? getStringDate(data.value).dateFormat('yyyy-MM-dd') : '';
                    }
                }
            ],
            attr: 'mytable',
            paramsDefault: { paging: 10, orderby: 'start', direction: 'asc' },
            noData: "<p class='noData'>当前视图没有可显示记录。</p>",
            pagerPosition: "bottom",
            pager: "mypager",
            sorter: "mysorter",
            onComplete: function () {
                //隐藏第一列
                $(".mytable th:first").attr("style", "display:none");
                $(".mytable tr").find('td:first').attr("style", "display:none");
                //根据当前时间显示对应时间的事件信息
                var date = new Date();
                $(".mytable tr:not(:first)").each(function (i, v) {
                    if ($(v).find('td')[0].innerText == date.dateFormat('yyyy-MM-dd')) {
                        $(v).addClass("active");
                        var id = $(v).find('td')[0].innerText;
                        EventInfoById(id, response);
                    }
                });

                //点击行显示对应事件信息
                $(".mytable").on("click", "tr", function () {
                    $(".mytable tr").removeClass("active");
                    $(this).addClass("active");
                    var TdActive = $(".mytable tr.active").find('td');
                    if (TdActive.length > 0) {
                        var id = TdActive[0].innerText;
                        var position = this.getBoundingClientRect();
                        PositionEventInfoById(id, response, position)
                    }

                    $(this).mouseout(function () {
                        $('#gsCalendarEvent').hide();
                        $(".mytable tr").removeClass("active");
                    })
                });

            },
        }
        return options;
    }
    //今日待办DataGrid
    function TodayDataListBind(response) {
        var options = {
            idField: 'id',
            autoload: true,
            data: response,
            col: [
                { field: "id", title: "编号", attrHeader: settable.tableTh, attr: settable.tableTd },
                { field: "TrustCode", title: "产品名称", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd },
                {
                    field: "title", title: "标题", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd
                    , render: function (data) {
                        return data.value ? data.value.replace(/\(.*?\)/g, '') : '';
                    }
                },
                { field: "eventDesc", title: "描述", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd },
                //{
                //    field: "start", title: "开始时间", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd
                //    , render: function (data) {
                //        return data.value ? getStringDate(data.value).dateFormat('yyyy-MM-dd') : '';
                //    }
                //}
            ],
            attr: 'TodayDataGrid',
            paramsDefault: { paging: 10, orderby: 'start', direction: 'asc' },
            noData: "<p class='noData'>当前视图没有可显示记录。</p>",
            pagerPosition: "bottom",
            pager: "mypager",
            sorter: "mysorter",
            onComplete: function () {
                //隐藏第一列
                $(".TodayDataGrid th:first").attr("style", "display:none");
                $(".TodayDataGrid tr").find('td:first').attr("style", "display:none");

                //根据当前时间显示对应时间的事件信息
                var date = new Date();
                $(".TodayDataGrid tr:not(:first)").each(function (i, v) {
                    if ($(v).find('td')[0].innerText == date.dateFormat('yyyy-MM-dd')) {
                        $(v).addClass("active");
                        var id = $(v).find('td')[0].innerText;
                        //EventInfoById(id, response);
                    }
                });

                //点击行显示对应事件信息
                $(".TodayDataGrid").on("click", "tr", function () {

                    $(".TodayDataGrid tr").removeClass("active");
                    $(this).addClass("active");
                    var id;
                    if ($(".TodayDataGrid tr.active").find('td')[0]) {
                        id = $(".TodayDataGrid tr.active").find('td')[0].innerText;
                    }
                    var position = this.getBoundingClientRect();
                    //EventInfoById(id, response);
                    PositionEventInfoById(id, response, position)
                    $(this).mouseout(function () {
                        $('#gsCalendarEvent').hide();
                        $(".TodayDataGrid tr").removeClass("active");
                    })
                });
            },
        }

        return options;
    }
    //
    function changeReportStatus(trustId, currentStatus, routetypeId, operate, prieodDataId, selectReportId, reason, callback) {
        if (currentStatus == 1 && operate != 'generate') {
            GSdialog.HintWindow('文档还未生成');
            return;
        }
        var executeParaminfo = {
            SPName: "usp_Workflow_ChangeReportStatus", SQLParams: [
                { Name: 'TrustId', value: trustId, DBType: 'int' },
                { Name: 'Operate', value: operate, DBType: 'string' },
                { Name: 'CurrentNode', value: currentStatus, DBType: 'int' },
                { Name: 'RouteTypeId', value: routetypeId, DBType: 'int' },
                { Name: 'Reason', value: reason, DBType: 'string' },
                { Name: 'DimReportingDateId', value: prieodDataId, DBType: 'int' },
                { Name: 'ReportTypeId', value: selectReportId, DBType: 'int' }
            ]
        };

        common.ExecuteGetData(true, svcUrl, 'TrustManagement', executeParaminfo, function (data) {
            callback && callback(data)
        })

    }

    //同意审核
    addCheckReport = function(operate) {
        if (checkpackage.cursta == 5 || checkpackage.cursta == 6) {
            GSDialog.HintWindow('文档须重新生成后才能改变审核状态！');
            return false;
        }

        var reason = $("#reason_input").val();
        changeReportStatus(checkpackage.tid, checkpackage.cursta, 1, operate, checkpackage.dimreport, checkpackage.reporttyp, reason, function (data) {
            if (data[0].result) {
                $('#modal-close').trigger('click');
                GSDialog.HintWindow('审核完成！', function () {
                    location.reload();
                });
                //self.$forceUpdate()
                //self.reportDataTemp.reportStatus = data[0].result;
                //self.reportDataTemp.reportCurrentStatusName = permissionProxy.getNodeName(data[0].result);
            }
        })
    }


    //
    CKmed = function (tid, cursta, dimreport, reporttyp) {
        if (cursta != "3") {
            return false;
        }
        checkpackage = {}
        checkpackage.tid = tid
        checkpackage.cursta = cursta
        checkpackage.dimreport = dimreport
        checkpackage.reporttyp = reporttyp

        anyDialog({
            title: "审核报告",
            width: 450,
            height: 144,
            changeallow: true,
            html: $("#status-dialog")
        })


    }

    //待审核DataGrid
    function noCheckDataListBind(response) {
        var options = {
            idField: 'id',
            autoload: true,
            data: response,
            col: [
                { field: "TrustName", title: "产品名称", width:20, sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd },
                { field: "ReportTypeName", title: "报告类型", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd, width: 20},
                {
                    field: "DimReportingDateId", title: "报告日期", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd,width:20,
                    render: function (data) {
                        var dataStr = data.value + '';
                        return dataStr.substring(0, 4) + '/' + dataStr.substring(4, 6) + '/' + dataStr.substring(6, 8);
                    }
                },
                {
                    title: "操作", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd, width: 20,
                    render: function (data) {
                        CKbutton = '<a javascript:void(0);" onclick="CKmed(' + data.row.TrustId + ',' + data.row.CurrentStatus + ',' + data.row.DimReportingDateId + ',' + data.row.ReportTypeId + ')">审核</a>';
                        DLbutton = '<a href="' + data.row.LinkAddress + '">下载</a>';
                        data = CKbutton + " " + DLbutton
                        return data;
                    }

                }
            ],
            attr: 'noCheckDataGrid',
            paramsDefault: { paging: 10, orderby: 'start', direction: 'asc' },
            noData: "<p class='noData'>当前视图没有可显示记录。</p>",
            pagerPosition: "bottom",
            pager: "mypager",
            sorter: "mysorter",
            onComplete: function () {
                //根据当前时间显示对应时间的事件信息
                var date = new Date();
                $(".noCheckDataGrid tr:not(:first)").each(function (i, v) {
                    if ($(v).find('td')[0].innerText == date.dateFormat('yyyy-MM-dd')) {
                        $(v).addClass("active");
                        var id = $(v).find('td')[0].innerText;
                    }
                });

                //点击行显示对应事件信息
                /*
                 $(".noCheckDataGrid").on("click", "tr", function () {

                    $(".noCheckDataGrid tr").removeClass("active");
                    $(this).addClass("active");
                    var id;
                    if ($(".noCheckDataGrid tr.active").find('td')[0]) {
                        id = $(".noCheckDataGrid tr.active").find('td')[0].innerText;
                    }
                    var position = this.getBoundingClientRect();
                    //EventInfoById(id, response);
                    PositionEventInfoById(id, response, position)
                    $(this).mouseout(function () {
                        $('#gsCalendarEvent').hide();
                        $(".noCheckDataGrid tr").removeClass("active");
                    })
                });
                */
            },
        }

        return options;
    }
    //已审核DataGrid
    function hasCheckDataListBind(response) {
        var options = {
            idField: 'id',
            autoload: true,
            data: response,
            col: [
                { field: "TrustName", title: "产品名称", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd },
                { field: "ReportTypeName", title: "报告类型", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd },
                {
                    field: "DimReportingDateId", title: "报告日期", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd,
                    render: function (data) {
                        var dataStr = data.value + '';
                        return dataStr.substring(0, 4) + '/' + dataStr.substring(4, 6) + '/' + dataStr.substring(6, 8);
                    }
                },
                { field: "NodeName", title: "状态", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd,width:20 }
            ],
            attr: 'hasCheckDataGrid',
            paramsDefault: { paging: 10, orderby: 'start', direction: 'asc' },
            noData: "<p class='noData'>当前视图没有可显示记录。</p>",
            pagerPosition: "bottom",
            pager: "mypager",
            sorter: "mysorter",
            onComplete: function () {
                //根据当前时间显示对应时间的事件信息
                var date = new Date();
                $(".hasCheckDataGrid tr:not(:first)").each(function (i, v) {
                    if ($(v).find('td')[0].innerText == date.dateFormat('yyyy-MM-dd')) {
                        $(v).addClass("active");
                        var id = $(v).find('td')[0].innerText;
                        //EventInfoById(id, response);
                    }
                });

                //点击行显示对应事件信息
                //$(".hasCheckDataGrid").on("click", "tr", function () {

                //    $(".hasCheckDataGrid tr").removeClass("active");
                //    $(this).addClass("active");
                //    var id;
                //    if ($(".hasCheckDataGrid tr.active").find('td')[0]) {
                //        id = $(".hasCheckDataGrid tr.active").find('td')[0].innerText;
                //    }
                //    var position = this.getBoundingClientRect();
                //    //EventInfoById(id, response);
                //    PositionEventInfoById(id, response, position)
                //    $(this).mouseout(function () {
                //        $('#gsCalendarEvent').hide();
                //        $(".hasCheckDataGrid tr").removeClass("active");
                //    })
                //});
            },
        }

        return options;
    }
    //时间处理
    function getNowFormatDate(today) {

        var date = new Date();
        var seperator1 = "-";
        var seperator2 = ":";
        var month = date.getMonth() + 1;
        var strDate = date.getDate();
        if (month >= 1 && month <= 9) {
            month = "0" + month;
        }
        if (strDate >= 0 && strDate <= 9) {
            strDate = "0" + strDate;
        }
        switch (today) {
            case 1://当天
                var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
                break;
            case 2://下一天
                var NextDate = strDate + 1;
                var currentdate = date.getFullYear() + seperator1 + month + seperator1 + NextDate
                break;
            case 3://后天
                var AfterTmorron = strDate + 2;
                var currentdate = date.getFullYear() + seperator1 + month + seperator1 + AfterTmorron
                break;
            case 4://大后天
                var DateFoth = strDate + 3;
                var currentdate = date.getFullYear() + seperator1 + month + seperator1 + DateFoth
                break;
        }
        //+ " " + date.getHours() + seperator2 + date.getMinutes()
        //+ seperator2 + date.getSeconds();
        return currentdate;
    }
    //处理时间磋
    function timestampToTime(timestamp) {
        var date = new Date();
        Y = date.getFullYear() + '-';
        M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
        D = date.getDate() + ' ';
        h = date.getHours() + ':';
        m = date.getMinutes() + ':';
        s = date.getSeconds();
        return Y + M + D;
    }
    //tab切换
    function TabSelect() {
        var head_list = document.getElementById("head_list");
        var menu_content = document.getElementById("menu_content");
        var oli = head_list.getElementsByTagName("input");//获取tab列表
        var odiv = menu_content.getElementsByTagName("div");//获取tab内容列表
        var tab = $(".tab");
        for (var i = 0 ; i < oli.length ; i++) {
            oli[i].index = i;//定义index变量，以便让tab按钮和tab内容相互对应
            oli[i].onclick = function () {//移除全部tab样式和tab内容
                var _this = $(this);
                _this.addClass("active").siblings().removeClass("active");
                var tab = $(".tab");
                if (_this.attr("id") == "divDataListBtn") {
                    renderEvents();
                    $(tab[1]).show();
                    $(tab[0]).hide();
                } else {
                    renderEvents();

                    $(tab[0]).show();
                    $(tab[1]).hide();
                }
            }
        }

    }
    //处理事件条目
    function TriggeredRecords(data) {
        var TriggeredRecordsData = data.value;
        return TriggeredRecordsData
    }
    //存续期事件提醒
    function TrustEventAlert(response) {
        var Option = {
            idField: 'id',
            autoload: true,
            data: response,
            col: [
                { field: "id", title: "编号", attrHeader: settable.tableTh, attr: settable.tableTd },
                { field: "ItemAliasValue", title: "事件类型", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd },
                //{
                //    field: "DisplayDescribe", title: "事件条目", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd
                //    , render: function (data) {
                //        return TriggeredRecords(data);
                //    }
                //},
                {
                    field: "TrustCode", title: "产品名称", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd
                },
                {
                    field: "StartDate", title: "触发时间", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd
                    , render: function (data) {
                        return data.value ? getStringDate(data.value).dateFormat('yyyy-MM-dd') : '';
                    }
                }
            ],
            attr: 'TrustEventAlert',
            paramsDefault: { paging: 5, orderby: 'start', direction: 'asc' },
            noData: "<p class='noData'>当前视图没有可显示记录。</p>",
            pagerPosition: "bottom",
            pager: "mypager",
            sorter: "mysorter",
            onComplete: function () {
                //隐藏第一列
                $(".TrustEventAlert th:first").attr("style", "display:none");
                $(".TrustEventAlert tr").find('td:first').attr("style", "display:none");
                //根据当前时间显示对应时间的事件信息
                var date = new Date();
                $(".TrustEventAlert tr:not(:first)").each(function (i, v) {
                    if ($(v).find('td')[0].innerText == date.dateFormat('yyyy-MM-dd')) {
                        $(v).addClass("active");
                        var id = $(v).find('td')[0].innerText;
                        EventInfoById(id, response);
                    }
                });

                //点击行显示对应事件信息
                $(".TrustEventAlert tr").on("click", function () {
                    $(".TrustEventAlert tr").removeClass("active");
                    $(this).addClass("active");
                    var TdActive = $(".TrustEventAlert tr.active").find('td');
                    if (TdActive.length > 0) {
                        var id = TdActive[0].innerText;
                        var position = this.getBoundingClientRect();
                        TrustInfomationAlt(id, response, position);
                    }
                    $(this).mouseout(function () {
                        $('#gsTrustInfoEvent').hide();
                        $(".TrustEventAlert tr").removeClass("active");
                    })
                });
            },
        }

        return Option
    }
    //专项计划过滤
    function seachEventData(start, end, timezone, requestType, cb) {
        var start = getNowFormatDate(1);
        TodoDatagrid(start, start, timezone, function (res) {
            cb(res)
        })
    }
    //专项计划搜索
    function seachBtn() {
        var seachBtn = $("#Seach");
        seachBtn.click(function () {
            renderEvents();
        })
    }
    //键盘事件
    function keyDown() {
        $(window).keydown(function (event) {
            switch (event.keyCode) {
                case 13:
                    //Enter键刷新数据
                    renderEvents();
                    break;
            }
        })
    }
    //重新渲染日历
    function renderEvents() {
        $('#gsCalendar').fullCalendar('refetchEvents');//重新渲染日历
    };
    //添加事件
    function addEvent(callback) {
        var addEvent = $("#addEvent");
        $("#AddDateTime").val(getNowFormatDate(1));
        addEvent.on("click", callback)
    }
    //下载
    $("#download").click(function () {
        $.anyDialog({
            width: 450,
            height: 160,
            title: '下载文件',
            html: $('#dowloadarea').clone(true).show(),
            mask: true,
            draggable: false,
        });
        $(".date-plugins").date_input();
    })
    //checkdata
    $("body").on("change", ".date-plugins", function () {
        var that = $(this)[0];
        common.formatData(that)
    })
    //下载文件
    $("body").on("click", "#btnclick", function () {
        var that = $(this);
        var startdate = $(this).parents("#dowloadarea").find("input").eq(0).val();
        var enddate = $(this).parents("#dowloadarea").find("input").eq(1).val();
        if (startdate == "") {
            $(this).parents("#dowloadarea").find("input").eq(0).addClass("red-border");
            return false;
        } else {
            $(this).parents("#dowloadarea").find("input").eq(0).removeClass("red-border");
        }
        if (enddate == "") {
            $(this).parents("#dowloadarea").find("input").eq(1).addClass("red-border");
            return false
        } else {
            $(this).parents("#dowloadarea").find("input").eq(1).removeClass("red-border");
        }
        if (startdate.replace(/-/g, "") > enddate.replace(/-/g, "")) {
            $(this).parents("#dowloadarea").find("input").eq(0).addClass("red-border");
            $(this).parents("#dowloadarea").find("input").eq(1).addClass("red-border");
            return false;
        } else {
            $(this).parents("#dowloadarea").find("input").eq(0).removeClass("red-border");
            $(this).parents("#dowloadarea").find("input").eq(1).removeClass("red-border");
        }
        //验证结束 下载文件
        var SeachTrustId = $("#SeachTrustId").val();
        var trustId = SeachTrustId != '' ? SeachTrustId : trustId_;
        var username = sessionStorage.getItem('gs_UserName');
        var serviceUrl = GlobalVariable.CommonServicesUrl + 'ExportDataPoolToExcel';
        var objParam = {
            SPName: 'dbo.usp_CalendarDownLoadTrustEvents', SQLParams: [
                    { Name: 'trustCode', value: trustId, DBType: 'string' },
                    { Name: 'start', value: startdate, DBType: 'datetime' },
                    { Name: 'end', value: enddate, DBType: 'datetime' },
                    { Name: 'userName', value: username, DBType: 'string' }]
        };
        var strParam = encodeURIComponent(JSON.stringify(objParam));
        var obj = { connectionName: 'TrustManagement', param: strParam, excelName: '我的日程', sheetName: 'PoolCut' };

        var tempform = document.createElement("form");
        tempform.action = serviceUrl;
        tempform.method = "post";
        tempform.style.display = "none";
        for (var x in obj) {
            var opt = document.createElement("input");
            opt.name = x;
            opt.value = obj[x];
            tempform.appendChild(opt);
        }

        var opt = document.createElement("input");
        opt.type = "submit";
        tempform.appendChild(opt);
        document.body.appendChild(tempform);
        tempform.submit();
        document.body.removeChild(tempform);

    })
    
    //获得专项计划条数
    function GetTrustNum(cb) {
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
                cb(response)
            },
            error: function (response) { alert("error:" + response.text); }
        });
    }
    function AddEventChange() {
        var AddTrustEvent = $("#AddTrustEvent");
        var AddTrustEvents = $("#AddTrustEvents");
        AddTrustEvent.change(function () {
            AddTrustEvents.val($(this).val());
        })
    }
    function addTrustCodeSelect() {
        var AddTrustEvents = $("#AddTrustEvents");
        AddTrustEvents.click(function () {
            GetTrustNum(function (res) {
                addEventsSelectTrustId();
                var AddTrustEvent = $("#AddTrustEvent");//添加待办项专项计划input
                var AddClickDiv = $("#AddClickDiv"); //装待办项专项计划select - option的值
                var MaskAddEventSelect = $("#MaskAddEventSelect"); //待办项专项计划遮罩
                var Addstr = '<option value="0" class="OpData"><option>';
                var AddTrustEvents = $("#AddTrustEvents");
                for (var i = 0; i < res.length; i++) {
                    Addstr += "<option  class='OpData' value='" + res[i].TrustCode + "'>" + res[i].TrustCode + "<option>"
                }
                AddTrustEvent.append(Addstr);
                MaskAddEventSelect.on("click", addEventsSelectTrustId);
                AddTrustEvent.click(function () {
                    addEventsSelectTrustId();
                })
                AddClickDiv.on("mouseover", function () {
                    AddClickDiv.show();
                });
                AddClickDiv.on("mouseout", function () {
                    AddClickDiv.hide();
                });
                function addEventsSelectTrustId() {
                    var AddClickDiv = $("#AddClickDiv");
                    AddClickDiv.html('');//清空上一次数据
                    AddClickDiv.show();
                    var Opstr = $("#AddTrustEvent .option");
                    var Opstrs = '';
                    for (var i = 0; i < Opstr.length; i++) {
                        if ($(Opstr[i]).val() != 0) {
                            Opstrs += "<p class='OpData'>" + $(Opstr[i]).val() + "</p>";
                        }
                    }
                    AddClickDiv.append(Opstrs);
                    var opTionP = $(AddClickDiv).children();
                    opTionP.click(function () {
                        AddTrustEvents.val($(this).html());
                        AddClickDiv.hide();
                    })
                }
            })
        })
    }


})
