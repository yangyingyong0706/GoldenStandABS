/// <reference path="../../Scripts/knockout-3.4.0.js" />
/// <reference path="../../Scripts/knockout.mapping-latest.js" />
/// <reference path="../../Scripts/jquery-1.7.2.min.js" />
/// <reference path="../../Scripts/jquery.color-2.1.2.min.js" />
/// <reference path="../../Scripts/common.js" />
/// <reference path="../TrustWizard/Scripts/calendar.min.js" />
var GSTrustEvent;
define(function (require) {

    var $ = require("jquery");
    require("jquery-ui");
    var ko = require("knockout");
    var mapping = require("knockout.mapping");
    require("date_input");
    var common = require('common');
    var GlobalVariable = require('globalVariable');
    var trustId = common.getUrlParam("tid");

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

    var gsTrustEventDefinedMessage = {
        cn: {
            loadingError: '加载信托事件出错!',
            current: '当前',
            valueIs: '为',
            match: '符合预定值',
            unMatch: '不符合预定值',
            updateSuccess: '更新成功!',
            updateError: '更新信托事件时出现错误。'
        },
        en: {
            loadingError: 'Error occursed when loading Trust events!',
            current: 'Current ',
            valueIs: ' is ',
            match: ' match the predetermined value ',
            unMatch: ' unmatch the predetermined value ',
            updateSuccess: 'Events Updated Successfull!',
            updateError: 'Error occursed when updating Trust events.'
        }
    };

    var gsTrustEvent = (function () {
        var svcGetUrl, svcUpdateUrl;
        var trustId, domId;
        var dataTrustEventItem = [], dataTrustEventItemCondition = [], dataTrustEventItemQualitative = [];
        var dataModel = {
            TrustEventItem: [],
            ScenarioName: '',
            ScenarioClass: ''
        };
        var viewModel;
        var defMsg = gsTrustEventDefinedMessage.cn;

        var initPageDataBinding = function (nodeId, tId, svcGet, svcUpdate, afterBindCallBack) {
            svcGetUrl = svcGet;
            svcUpdateUrl = svcUpdate;
            trustId = tId;
            domId = nodeId;
            getSourceDataAndSetDataModel(afterBindCallBack)
            // getTriggeredScenario(trustId);

        };
        var getSourceDataAndSetDataModel = function (callBack) {
            $.ajax({
                type: "GET",
                url: svcGetUrl + trustId,
                dataType: "json",
                contentType: "application/xml;charset=utf-8",
                cache: false,
                data: {},
                success: function (response) {
                    if (response) {
                        setDataModel(eval(response));
                    }
                    dataBinding(callBack);
                },
                error: function (response) { alert(defMsg.loadingError); }
            });
        };
        var formatDate = function (data) {
            var start = data.StartDate;
            if (start) {
                start = start.replace(/\//g, '');
                data.StartDate = (eval('new ' + start)).dateFormat('yyyy-MM-dd');
            }
        }
        var setDataModel = function (sourceData) {
            //设定 专项事件  和  违约条件  源数据集合
            $.each(sourceData, function (i, data) {
                var eventType = data.EventType;
                if (eventType === 'SpecificPlan') {
                    dataTrustEventItem.push(data);
                } else if (eventType == 'BreachCondition') {
                    dataTrustEventItemCondition.push(data);
                }
                else {
                    dataTrustEventItemQualitative.push(data);
                }
            });
            //为  专项事件  源数据集合排序
            dataTrustEventItem.sort(function (a, b) {
                return a.ItemId - b.ItemId;
            });
            //检查每条  违约条件  数据的检查结果 checkingResult
            $.each(dataTrustEventItemCondition, function (i, data) {
                data['checkingResult'] = checkingSetting(data);
                formatDate(data);
            });
            $.each(dataTrustEventItemQualitative, function (i, data) {
                data['checkingResult'] = true;
                formatDate(data);
            });
            //为  专项事件  设定触发条件和检查结果

            $.each(dataTrustEventItem, function (i, data) {
                triggersAndCheckingResultSetting(data);

                formatDate(data);
                dataModel.TrustEventItem.push(data);
            });
        }
        var checkingSetting = function (data) {
            var currentValue = data.CurrentValue;
            var operator = common.getOperatorByName(data.Operator);
            data.Operator = operator;
            var threshold = data.Threshold;

            var expression = currentValue + ' ' + data.Operator + ' ' + threshold;
            if (expression.indexOf('NA') >= 0) { return true; }

            return !eval(expression);
        };
        var triggersAndCheckingResultSetting = function (data) {
            data['checkingResult'] = true;
            data['triggers'] = [];
            data['triggersQualitative'] = [];

            var triggeredBy = data.TriggeredBy;
            var triggeredQualitative = data.TriggeredQualitative;
            //var QualitativeSelected = data.QualitativeSelected;
            //var RationSelected = data.RationSelected;

            //if (!triggeredBy) { return; }

            //定量数组
            var triggeredByArray = [];
            if (!!triggeredBy)
                triggeredByArray = triggeredBy.split(",");
            $.each(triggeredByArray, function (index, dom) {
                var array = [];
                $.each(dataTrustEventItemCondition, function (index, dom1) {
                    if (dom.indexOf(dom1.ItemCode) > -1) {
                        var a = {};
                        $.each(dom1, function (index, dom2) {
                            a[index] = dom2;
                        })
                        data['triggers'].push(a)
                    }
                })
            })

            //定性数组
            var triggeredQualitativeArray = [];
            if (!!triggeredQualitative)
                triggeredQualitativeArray = triggeredQualitative.split(",");
            $.each(triggeredQualitativeArray, function (index, dom) {
                var array = [];
                $.each(dataTrustEventItemQualitative, function (index, dom1) {
                    if (dom.indexOf(dom1.ItemCode) > -1) {
                        var a = {};
                        $.each(dom1, function (index, dom2) {
                            a[index] = dom2;
                        })
                        data['triggersQualitative'].push(a)
                    }
                })
            })
            //定量数组是否选中
            //var RationSelectedArray=[];
            //if(!!RationSelected)
            //RationSelectedArray=RationSelected.split(",");
            //$.each(data['triggers'],function(index,dom){
            //	dom.EventStatus='N';
            //	$.each(RationSelectedArray,function(index1,dom1){
            //		if(dom.ItemCode==dom1){
            //			dom.EventStatus='Y';
            //		}
            //	})
            //})

            //定性数组是否选中
            //var QualitativeSelectedArray=[];
            //if(!!QualitativeSelected)
            //QualitativeSelectedArray=QualitativeSelected.split(",");
            //$.each(data['triggersQualitative'],function(index,dom){
            //	dom.EventStatus='N';
            //	$.each(QualitativeSelectedArray,function(index1,dom1){
            //		if(dom.ItemCode==dom1)
            //		dom.EventStatus='Y';
            //	})
            //})

            $.each(data['triggers'], function (i, value) {
                var conditionResult = value.checkingResult;
                if (!conditionResult) {
                    data['checkingResult'] = false;
                    return false;
                }
            });

        };
        var dataBinding = function (afterBindingCallBack) {
            var domNode = document.getElementById(domId);
            getTriggeredScenario(trustId);
            viewModel = mapping.fromJS(dataModel);
            ko.applyBindings(viewModel, domNode);
            if (afterBindingCallBack) {
                afterBindingCallBack(dataTrustEventItem.length);
            }

        };

        var statusChanged = function (obj) {
            var $ckb = $(obj);
            var $tr = $ckb.parents('tr');
            $tr.removeClass('blink');
            var itemIndex = $ckb.attr('parentIndex');
            var crtEvent = viewModel.TrustEventItem()[itemIndex];
            var selectRatio = $.grep(crtEvent.triggers(), function (v, i) { return v.EventStatus() == 'Y' });
            var selectQualitative = $.grep(crtEvent.triggersQualitative(), function (v, i) { return v.EventStatus() == 'Y' });
            var selectArray = selectRatio.concat(selectQualitative);
            if (selectArray && selectArray.length > 0) {
                crtEvent.EventStatus('Y');
                crtEvent.StartDate((new Date()).dateFormat('yyyy-MM-dd'));
                //crtEvent.StartDate()
            } else {
                crtEvent.StartDate('');
                crtEvent.EventStatus('N');
            }
        };

        var statusChangedTriggered = function (obj) {

            var $ckb = $(obj);
            var itemIndex = $ckb.attr('itemIndex');
            var parentIndex = $ckb.attr('parentIndex');
            var itemCode = $ckb.attr('itemCode');
            var crtEvent = viewModel.TrustEventItem()[parentIndex];
            if ($ckb.is(':checked')) {
                crtEvent.triggers()[itemIndex].EventStatus('Y');
                crtEvent.triggers()[itemIndex].StartDate((new Date()).dateFormat('yyyy-MM-dd'));
            } else {
                crtEvent.triggers()[itemIndex].EventStatus('N');
                crtEvent.triggers()[itemIndex].StartDate('');
            }
            statusChanged(obj);
        };
        var statusChangedTriggeredQualitative = function (obj) {
            var $ckb = $(obj);
            statusChanged(obj);
            var itemIndex = $ckb.attr('itemIndex');
            var parentIndex = $ckb.attr('parentIndex');
            var itemCode = $ckb.attr('itemCode');
            var crtEvent = viewModel.TrustEventItem()[parentIndex];
            if ($ckb.is(':checked')) {
                crtEvent.triggersQualitative()[itemIndex].EventStatus('Y');
                crtEvent.triggersQualitative()[itemIndex].StartDate((new Date()).dateFormat('yyyy-MM-dd'));
            } else {
                crtEvent.triggersQualitative()[itemIndex].EventStatus('N');
                crtEvent.triggersQualitative()[itemIndex].StartDate('');
            }
            statusChanged(obj);
        };

        var checkEvents = function () {
            var executeParam = {
                'SPName': "usp_CheckTrustEvents", 'SQLParams': [
                    { 'Name': 'TrustId', 'Value': trustId, 'DBType': 'int' }
                ]
            };
            var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
            common.ExecuteGetData(false, serviceUrl, 'TrustManagement', executeParam, function (data) {

            });
        }
        var getTriggeredScenario = function (trustId) {
            // var currentDate = (new Date()).dateFormat('yyyy-MM-dd');
            var currentDate = dataModel.TrustEventItem[0].StartDate;
            var executeParam = {
                'SPName': "usp_GetTriggeredScenario", 'SQLParams': [
                    { 'Name': 'TrustId', 'Value': trustId, 'DBType': 'int' },
                    { 'Name': 'CurrentDate', 'Value': currentDate, 'DBType': 'string' }
                ]
            };
            var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
            common.ExecuteGetData(false, serviceUrl, 'TrustManagement', executeParam, function (data) {
                if (data) {
                    var scenarioArray = [];
                    if (data.length > 0) {
                        $.each(data, function (i, v) {
                            scenarioArray.push(v.ScenarioName)
                        })
                        dataModel.ScenarioName = scenarioArray.join('、');
                        dataModel.ScenarioClass = "scenarioName isCurrentScenario"
                    }
                    else {
                        dataModel.ScenarioName = '正常偿付';
                        dataModel.ScenarioClass = 'scenarioName';
                    }
                }

            });

        }
        var postUpdates = function () {
            var items = '<root>' + encodeURIComponent(getPostItems()) + '</root>'; //alert(items); return;
            $.ajax({
                url: svcUpdateUrl,
                dataType: "json",
                contentType: "application/xml;charset=utf-8",
                type: 'POST',
                cache: false,
                data: items,
                success: function (data) {
                    alert(defMsg.updateSuccess);
                    checkEvents();
                    getTriggeredScenario(trustId);
                },
                error: function (error) {
                    alert(defMsg.updateError);
                }
            });
        };

        var getItemString = function (item, startDate) {
            var start = startDate == null ? '' : startDate;
            var itemString = '<item>' +
                              '<TrustEventId>' + item.TrustEventId() + '</TrustEventId>' +
                              '<EventStatus>' + item.EventStatus() + '</EventStatus>' +
                              '<StartDate>' + start + '</StartDate>' +
                              '</item>';
            return itemString;
        }
        var getPostItems = function () {
            var items = '<items>';
            $.each(viewModel.TrustEventItem(), function (i, event) {
                items += getItemString(event, event.StartDate());
                $.each(event.triggers(), function (i, ratioItem) {
                    var ratioStartDate = ratioItem.EventStatus() == 'Y' ? event.StartDate() : '';
                    items += getItemString(ratioItem, ratioStartDate);
                })
                $.each(event.triggersQualitative(), function (i, qualitativeItem) {
                    var qualitativeStartDate = qualitativeItem.EventStatus() == 'Y' ? event.StartDate() : '';
                    items += getItemString(qualitativeItem, qualitativeStartDate);
                })
            })
            items += '</items>';
            return items;
        };
        return {
            InitPageDataBinding: initPageDataBinding,
            StatusChanged: statusChanged,
            PostUpdates: postUpdates,
            StatusChangedTriggered: statusChangedTriggered,
            StatusChangedTriggeredQualitative: statusChangedTriggeredQualitative
        };
    })();


    var DataProcessServiceUrl = GlobalVariable.DataProcessServiceUrl;
    if (!trustId || isNaN(trustId) || trustId <= 0) {
        alert('no trustid');
    } else {
        gsTrustEvent.InitPageDataBinding('formbody'//'TrustEventList'
            , trustId
            , DataProcessServiceUrl + 'GetTrustEvents/TrustManagement/'
            , DataProcessServiceUrl + 'UpdateTrustEvents'
            , function (dataCount) {
                if (dataCount > 0) {
                    $('.list-view-tr-emptymsg').hide();
                    $('#btnTrustEventUpdate').attr('disabled', false);
                    $('.date-plugins').date_input();
                }
            });
    }
    $(function () {

        $('#btnTrustEventUpdate').click(function () {
            gsTrustEvent.PostUpdates()
        });
        $('#btncancelclick').click(function () {
            btncancelclick();
        });
        //$('.triggers .statusCheckBox').bind('change', function () {
        //    gsTrustEvent.StatusChangedTriggered(this)
        //})
        //$('.triggersQualitative .statusCheckBox').bind('change', function () {
        //    debugger
        //    gsTrustEvent.StatusChangedTriggeredQualitative(this)
        //})
    })
    GSTrustEvent = gsTrustEvent;
})
function StatusChangedTriggered(obj) {
    GSTrustEvent.StatusChangedTriggered(obj)
}
function StatusChangedTriggeredQualitative(obj) {
    GSTrustEvent.StatusChangedTriggeredQualitative(obj)
}