/// <reference path="jquery-1.12.1.min.js" />
/// <reference path="GoldenStand.Common.js" />
var gTrustId = 0;
//var useName =  $.cookie('gs_UserName');
var useName = 'goldenstand';
$(function () {
    //var rTrustId = getQueryString('trustId');
    //if (rTrustId) { gTrustId = rTrustId; }
    getTrust();
   
});

function getTrust() {
    var executeParam = {
        SPName: 'usp_CalendarGetTrusts', SQLParams: [
            { Name: 'UserName', value: useName, DBType: 'string' }
        ]
    };
    var sContent = JSON.stringify(executeParam);
    var tmsDataProcessBase = GlobalVariable.DataProcessServiceUrl;
    var serviceUrl = tmsDataProcessBase + 'CommonExecuteGet?appDomain=TrustManagement&executeParams=' +
        sContent + "&resultType=com";

    $.ajax({
        type: "GET",
        cache:false,
        url: serviceUrl,
        dataType: "jsonp",
        crossDomain: true,
        contentType: "application/xml;charset=utf-8",
        data: {},
        success: function (response) {
            if (typeof response == "string")
                response = JSON.parse(response);
            initTrustChoice(response);
            calenderSettings();
        },
        error: function (response) { alert("error:" + response); }
    });
}

function getTrustCalendarEvents() {
    var executeParam = {
        SPName: 'usp_CalendarGetTrustEvents_Calendar', SQLParams: [
            { Name: 'trustid', value: ItemId, DBType: 'int' },
            { Name: 'start', value: start._d.dateFormat('yyyy-MM-dd'), DBType: 'datetime' },
            { Name: 'end', value: end._d.dateFormat('yyyy-MM-dd'), DBType: 'datetime' }
        ]
    };
    var sContent = JSON.stringify(executeParam);
    var tmsDataProcessBase = GlobalVariable.DataProcessServiceUrl;
    var serviceUrl = tmsDataProcessBase + 'CommonExecuteGet?appDomain=TrustManagement&executeParams=' +
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
            if (typeof response == "string")
                response = JSON.parse(response);
            initTrustChoice(response);
        },
        error: function (response) { alert("error:" + response); }
    });
}
//切换时间和月份
function selectTrustCalendarEvents(trustId, start, end, timezone, callback) {

    var executeParam = {
        SPName: 'usp_CalendarGetTrustEvents_Calendar', SQLParams: [
            { Name: 'trustid', value: trustId, DBType: 'int' },
            { Name: 'start', value: start, DBType: 'datetime' },
            { Name: 'end', value: end, DBType: 'datetime' }
        ]
    };
    var sContent = JSON.stringify(executeParam);
    var tmsDataProcessBase = GlobalVariable.DataProcessServiceUrl;
    var serviceUrl = tmsDataProcessBase + 'CommonExecuteGet?appDomain=TrustManagement&executeParams=' +
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
            if (typeof response == "string")
                response = JSON.parse(response);
            callback(response);
            autoCalendarHeight();

        },
        error: function (response) { alert("error:" + response); }
    });
}
//获取打印表格的事件日期
function printTrustCalendarEvents(trustId, year, callback) {

    var executeParam = {
        SPName: 'usp_CalendarGetTrustEventsAnnully', SQLParams: [
            { Name: 'trustid', value: trustId, DBType: 'int' },
            { Name: 'year', value: year, DBType: 'int' }
        ]
    };
    var sContent = JSON.stringify(executeParam);
    var tmsDataProcessBase = GlobalVariable.DataProcessServiceUrl;
    var serviceUrl = tmsDataProcessBase + 'CommonExecuteGet?appDomain=TrustManagement&executeParams=' +
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
            if (typeof response == "string")
                response = JSON.parse(response);
            callback(response);
            autoCalendarHeight();
        },
        error: function (response) { alert("error:" + response); }
    });
}
function autoCalendarHeight() {
    //var workspaceHeigh = $('#s4-workspace').height();
    //var titleHeight = $('#s4-titlerow').outerHeight(true);
    //var contentTopPadding = parseInt($('#contentRow').css('padding-top'));
    var calendarMinHeight = parseInt($('#gsCalendar').css('min-height'));

    var displayHeight = window.innerHeight-25;

    if (displayHeight >= calendarMinHeight) {
        $('#gsCalendar').fullCalendar('option', 'height', displayHeight);
    } else {
        $('#gsCalendar').fullCalendar('option', 'height', calendarMinHeight);
    }
}
function initTrustChoice(data) {
    var options = '';
    if (gTrustId) {
        $('#selTrustChoice').val(gTrustId);
        options += '<option value="0">所有事件</option>';
    } else {
        options += '<option value="0" selected="selected">所有事件</option>';
    }

    $.each(data, function (i, value) {
        options += '<option value="' + value.id + '"';
        if (gTrustId && gTrustId == value.id) {
            options += ' selected="selected"';
        }
        options += '>';
        options += value.name;
        options += '</option>'
    });
    options += '<option value="-1">自定义事件</option>';
    $('#selTrustChoice').html(options);

    $('#selTrustChoice').change(function () {
        $('#gsCalendar').fullCalendar('refetchEvents');
        gTrustId = $(this).val();
        $('button.fc-navToTaskList-button').attr('disabled', gTrustId == 0);
    });
    for (var i = 1; i <= 31; i++) {
        $(".table-container tbody").append(
        "<tr><td>" + i + "</td>" +
        "<td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>"
        )
    }
    //绑定打印按钮
    $(".print-btn").click(function () {
        window.print();
    })
    $(".cancel-btn").click(function () {
        $(".print-calendar").hide();
    })
    //打印专项计划modal
    $(".modal-event-select").html(options);
    $(".modal-mask,.modal-title-cancel").click(function (event) {
        $(".modal-mask").hide();
    })
    $(".modal-print").click(function (event) {
        event.stopPropagation();
    })

    $('.modal-event-select').change(function () {
        var trustId = $(this).val();
        var executeParam = {
            SPName: 'usp_GetTrustYears', SQLParams: [
                { Name: 'trustid', value: trustId, DBType: 'int' }
            ]
        };
        var sContent = JSON.stringify(executeParam);
        //var tmsDataProcessBase = "https://poolcutwcf/TaskProcessServices/DataProcessService.svc/jsAccessEP/";
        var serviceUrl = GlobalVariable.DataProcessServiceUrl + 'CommonExecuteGet?appDomain=TrustManagement&executeParams=' +
            sContent + "&resultType=com";

        $.ajax({
            type: "GET",
            cache: false,
            url: serviceUrl,
            dataType: "jsonp",
            crossDomain: true,
            contentType: "application/json;charset=utf-8",
            data: {},
            success: function (response) {

                var options = '';
                if (typeof response == "string")
                    response = JSON.parse(response);
                $.each(response, function (i, value) {
                    options += '<option value="' + value.year + '">';
                    options += value.year;
                    options += '</option>'
                });
                $('.modal-year-select').html(options);
            },
            error: function (response) { alert("error:" + response); }
        });
    });

    $(".modal-sure-btn").click(function () {
        var trustId = $(".modal-event-select").val();
        var trustName = $(".modal-event-select option:selected").text();
        var year = $(".modal-year-select").val();

        $(".table-title-name").text(trustName + '专项计划');
        $(".table-title-year").text(year + "年事件日历")
        $(".table-container tbody td div").remove();

        printTrustCalendarEvents(trustId, year, function (response) {
            response.forEach(function (value, index) {
                value.date = new Date(parseInt(value.date.slice(6, -2))).dateFormat("yyyy-MM-dd")
                var dayIndex = parseInt(value.date.slice(-2)) - 1;
                var monthIndex = parseInt(value.date.slice(5, 7));
                var cellContent = '<div title="' + value.date + '">' + value.event + '</div>';
                $(".table-container tbody tr").eq(dayIndex).find("td").eq(monthIndex).append(cellContent);
            })

        });
        $(".print-calendar").show();
        $(".modal-mask").hide();
    })
}
var risizeEventAttacthed = false;

function calenderSettings() {
    var calendarOptions = {
        header: {
            left: 'prev,next today',
            center: 'title',
            right: 'navToTaskList addCustEvent printCalendar month,basicWeek,basicDay'
        },
        customButtons: {
            //addCustEvent: {
            //    text: '自定义事件',
            //    click: function () { addCustClaendarItem(); }
            //},
            //navToTaskList: {
            //    text: '循环购买任务单',
            //    click: function () {
            //        window.open(GlobalVariable.SslHost + 'TrustManagementService/TrustManagement/TaskList/RecyclingPurchase.html?taskCode=TaskListTaskCode&trustId=' + gTrustId, '_blank');
            //    }
            //}
            printCalendar: {
                text: '打印日历',
                click: function () { $(".modal-mask").show(); }
            }
        },
        editable: false,
        timezone: 'local',
        selectable: true,
        eventOrder: 'orderSequence',
        displayEventTime: false,
        eventLimit: true,
        events: function (start, end, timezone, callback) {
            var trustId = $('#selTrustChoice').val();

            var executeParam = {
                SPName: 'usp_CalendarGetTrustEvents_Calendar', SQLParams: [
                    { Name: 'trustid', value: trustId, DBType: 'int' },
                    { Name: 'start', value: start._d.dateFormat('yyyy-MM-dd'), DBType: 'datetime' },
                    { Name: 'end', value: end._d.dateFormat('yyyy-MM-dd'), DBType: 'datetime' },
                    { Name: 'userName', value: $.cookie('gs_UserName'), DBType: 'string' }
                ]
            };
            var sContent = JSON.stringify(executeParam);
            var tmsDataProcessBase = GlobalVariable.DataProcessServiceUrl;
            var serviceUrl = tmsDataProcessBase + 'CommonExecuteGet?appDomain=TrustManagement&executeParams=' +
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
                    if (typeof response == "string")
                        response = JSON.parse(response);
                    callback(response);
                    autoCalendarHeight();
                    //if (!risizeEventAttacthed) {
                    //    $('#s4-workspace').resize(function () {
                    //        autoCalendarHeight();
                    //    });
                    //    risizeEventAttacthed = true;
                    //}
                },
                error: function (response) { alert("error:" + response); }
            });           
        },
        //dayRender: function (date, cell) {
        //    var html = '<a class="addevent" title="添加" onclick="addCustClaendarItem()"><span class="ms-addcolumn-span"><img class="ms-addcolumn-icon" src="/_layouts/15/images/spcommon.png?rev=23" border="0"></span>添加</a>';
        //    var $cell= $(cell);
        //    $cell.html(html);
        //    $cell.mouseover(function () {
        //        $cell.find('.addevent').show();
        //    }).mouseout(function () {
        //        $cell.find('.addevent').hide();
        //    });
        //},
        eventClick: function (calEvent, jsEvent, view) {
            if (!calEvent.eventType) { return; }
            calEvent.startDspl = new Date(calEvent.start).dateFormat('yyyy年MM月dd日');
            $('.event-detail-content .event-content').each(function () {
                var $this = $(this);
                var name = $this.attr('data-name');
                var value = calEvent[name];
                $this.html(value);
            });
            $('.event-detail-alert').hide();
            $('.event-detail-content').show();
        },
        dayClick: function (date, jsEvent, view) {
            $('#gsCalendar').fullCalendar('changeView', 'basicDay');
            $('#gsCalendar').fullCalendar('gotoDate', date);
        }
    };
    var deftDay = getQueryString('defaultDate');
    if (deftDay) {
        calendarOptions.defaultDate = deftDay;
    }

    if (gTrustId == 0) {
        $('button.fc-navToTaskList-button').attr('disabled', true);
    }

    $('#gsCalendar').fullCalendar(calendarOptions);
}
function addCustClaendarItem() {
    var options = {
        url: _spPageContextInfo.webAbsoluteUrl + '/Lists/CustomCalendarEvents/NewForm.aspx',
        dialogReturnValueCallback: function (dlgResult, rtnValue) {
            if (dlgResult == SP.UI.DialogResult.OK) {
                $('#gsCalendar').fullCalendar('refetchEvents');
            }
        }
    };
    openSPDialog(options);
}
