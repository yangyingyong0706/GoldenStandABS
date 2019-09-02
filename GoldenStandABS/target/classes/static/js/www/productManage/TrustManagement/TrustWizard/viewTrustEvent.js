/// <reference path="../Scripts/jquery-1.7.2.min.js" />
/// <reference path="../Scripts/knockout-3.4.0.js" />
/// <reference path="../Scripts/knockout.mapping-latest.js" />
/// <reference path="viewTrustWizard.js" />
/// <reference path="../Scripts/jquery.color-2.1.2.min.js" />

var TrustEventBizModule = (function () {
    var domNodeId;
    var dataEventItem;
    var dataEventItemCondition;
    var dataModel = {
        
        TrustEventItem: [],
        TrustEventItemCondition: []
    }
    var viewModel;

    var initArgs = function (nodeId, dataEvent, dataCondition) {
        domNodeId = nodeId;
        sortSourceDate(dataEvent);
        sortSourceDate(dataCondition);
    };

    var dataBinding = function () {        
        var trustEventNode = document.getElementById(domNodeId);
        viewModel = ko.mapping.fromJS(dataModel);
        ko.applyBindings(viewModel, trustEventNode);
    };
    var sortSourceDate = function (sourceDate) {
        $.each(sourceDate, function (i, o) {
            var arySourceDate = o.ItemValue.split('|');
            var operator = arySourceDate[0];
            var threshold = arySourceDate[1];
            var triggerings = arySourceDate[2];
            var triggeredBys = arySourceDate[3];
            var triggeredRecords = arySourceDate[4];

            var isChecking = operator != 'NA' && threshold != 'NA';
            var isTriggering = triggerings != 'NA';
            var isTriggeredBy = triggeredBys != 'NA';
            var isHavetriggeredRecords = triggeredRecords != 'NA';
            o['triggeredRecords'] = [];
            if (isHavetriggeredRecords) {
                var records = triggeredRecords.split('$$');
                $.each(records, function (s, v) {
                    var record = { ItemValue: v };
                    o['triggeredRecords'].push(record);
                });
            }

            o['isChecking'] = isChecking;
            o['triggering'] = isTriggering ? triggerings.split(',') : [];
            o['triggeredBy'] = isTriggeredBy ? triggeredBys.split(',') : [];
            o['isDisplay'] = o.IsCompulsory === 'True' || isChecking || isTriggering || isTriggeredBy || isHavetriggeredRecords;
            o['operator'] = operator;
            o['threshold'] = isChecking ? threshold : '';
            o['currentValue'] = '';

            var eventType = o.Category;
            dataModel[eventType].push(o);
        });
    };

    var addTrustEventItem = function (obj, eventType, selectId) {
        var $select = $('#' + selectId);
        if ($select.children('option').length < 1) {
            return;
        }
        var index = $select.val();
        var oItem = getEventItemByEventTypeAndIndex(eventType, index);
        oItem.isDisplay(true);
    };
    var getEventItemByEventTypeAndIndex = function (eventType, index) {
        var oItem;
        if (eventType == 'SpecificPlan') {
            oItem = viewModel.TrustEventItem()[index];
        } else {
            oItem = viewModel.TrustEventItemCondition()[index];
        }
        return oItem;
    };
    var removeTrustEventItem = function (obj, eventType) {
        var $obj = $(obj);
        if ($obj.attr('itemRequired') === 'True') { return }

        var index = $obj.attr('itemIndex');
        var oItem = getEventItemByEventTypeAndIndex(eventType, index);

        //当前的标识为 x
        //triggeredBy:【c，d】移除c，d条目的triggering属性值之中x ----移除过于复杂，阻止删除事件
        if (oItem.triggeredBy().length > 0) {
            alert('存在当前事件被其他事件触发，无法移除！');
            return;
        }

        if (eventType == 'SpecificPlan') {
            oItem.isDisplay(false);
            oItem.triggeredRecords.removeAll();
            return;
        }

        if (oItem.triggering().length > 0) {
            alert('存在其他事件被当前事件触发，无法移除！');
            return;
        }
        //triggering: 【a，b】移除a，b条目的triggeredBy属性值之中x ----逻辑一致性，暂时阻止删除事件
        //$obj.parents('tr').find('input:checkbox:checked').each(function (i, o) {
        //    var $iptObj = $(o);
        //    $iptObj.attr('checked', false);
        //    trustEventsTriggeredBySettings($iptObj);
        //});

        //triggering isChecking operator threshold 值恢复初始化
        oItem.triggering.removeAll();
        oItem.isChecking(false);
        oItem.operator('NA');
        oItem.threshold('');
        oItem.currentValue('');

        oItem.isDisplay(false);
    };

    var trustEventsTriggeredBySettings = function (obj) {
        var $this = $(obj);

        var targetIndex = $this.attr('targetIndex');
        var triggerId = $this.attr('triggerId');

        var targetEvent = viewModel.TrustEventItem()[targetIndex];
        if ($this.is(':checked')) {
            targetEvent.triggeredBy.push(triggerId);
        } else {
            targetEvent.triggeredBy.remove(triggerId);
        }
    };
    //感觉这里有BUG,不按照下面checkedbox选定的显示
    var validCheckingCondition = function (obj) {
        var $obj = $(obj);
        var index = $obj.attr('itemIndex');
        var trustEvent = viewModel.TrustEventItemCondition()[index];
        trustEvent = ko.mapping.toJS(trustEvent);
        var curValue = trustEvent.currentValue;
        var operator = trustEvent.operator;
        var threshold = trustEvent.threshold;

        if (!curValue || isNaN(curValue) || !threshold || isNaN(threshold) || operator == 'NA') {
            alert('检测条件格式错误！');
            return;
        }
        //这里改了!因为有两个table嵌套，单独用tr方式遍历会遍历到内部的table，给要遍历的tr增加class="trChange"
        var expression = curValue + getOperatorByName(operator) + threshold;
        var validResult = eval(expression);
        console.log(validResult);
        if (!validResult) { return; }
        $obj.parents('tr').find('input:checkbox:checked').each(function (i, o) {
            var $ckb = $(o);
            var targetIndex = $ckb.attr('targetIndex');
            //console.log(targetIndex);
            if (targetIndex > -1) {
                var selector = '#' + domNodeId + ' table:eq(0) tbody .trChange';
                var $tr = $(selector).eq(targetIndex);
                var savedColor = $tr.css("backgroundColor");
                $tr.animate({ "background-color": "#FFFF77" }, 3000).
                 animate({ "background-color": savedColor }, 3000);
            }
        });
    };
    var getOperatorByName = function (strName) {
        var operator = 'NA';
        switch (strName) {
            case 'gt':
                operator = '>';
                break;
            case 'ge':
                operator = '>=';
                break;
            case 'ne':
                operator = '!=';
                break;
            case 'eq':
                operator = '==';
                break;
            case 'lt':
                operator = '<';
                break;
            case 'le':
                operator = '<=';
                break;
            default:
                break;
        }
        return operator;
    };

    var showJS = function () {
        $('#divTrustEventShow').html(ko.mapping.toJSON(viewModel));
    };
    var submitJson = function () {
        var viewModelJS = ko.mapping.toJS(viewModel);
        var items = [];
        for (var vmJS in viewModelJS) {
            $.each(viewModelJS[vmJS], function (i, v) {
                var item = {
                    Category: vmJS, ItemId: 0, ItemCode: '', ItemValue: [], DataType: '',
                    TBId: '', SPId: 0, SPCode: '', SPRItemCode: '', UnitOfMeasure: '', Precise: ''
                };
                item.ItemId = v.ItemId;
                item.ItemCode = v.ItemCode;
                item.TBId = v.TBId;
                item.SPId = v.SPId;
                item.SPCode = v.SPCode;
                item.SPRItemCode = v.SPRItemCode;

                item.ItemValue.push(v.isChecking ? v.operator : 'NA');
                item.ItemValue.push(v.isChecking && !isNaN(v.threshold) ? v.threshold : 'NA');

                var triggerings = v.triggering.join(',');
                var triggeredBys = v.triggeredBy.join(',');
                item.ItemValue.push(triggerings.length < 1 ? 'NA' : triggerings);
                item.ItemValue.push(triggeredBys.length < 1 ? 'NA' : triggeredBys);

                var aryTriggeredRecords = [];
                $.each(v.triggeredRecords, function (s, o) {
                    if (o && o.ItemValue.length > 0) {
                        aryTriggeredRecords.push(o.ItemValue);
                    }
                });
                var triggeredRecords = aryTriggeredRecords.join('$$');
                item.ItemValue.push(triggeredRecords.length < 1 ? 'NA' : triggeredRecords);

                item.ItemValue = item.ItemValue.join('|');
                items.push(item);
            });
        }
        //var json = ko.mapping.toJSON(items);
        //json = json.substring(1, json.length - 1) + ',';
        //$('#divTrustEventShow').html(json);
        return items;
    };

    var previewString = function () {

        var tmpl = '<div class="ItemBox"><h3 class="h3">专项事件及增信</h3><div class="ItemInner">{0}</div></div>';
        var tmpl_content = '<div class="ItemContent"><div class="ItemTitle">{0}</div>{1}</div>';
        var tmpl_item = '<div class="Item"><label>{0}</label></div>';

        var contents = '';
        var selector = '#' + domNodeId + ' table:eq(0) tr.isPreview';
        $(selector).each(function (i, obj) {
            var $tr = $(obj);
            var itemTitle = $tr.children('td:eq(0)').html();
            var items = '';
            $tr.children('td:eq(1)').find('.addedTriggeredRecord').each(function (s, ckb) {
                var record = $(this).val();
                if (record) {
                    items += tmpl_item.format(record);
                }
            });
            contents += tmpl_content.format(itemTitle, items);
        });

        var strRtn = tmpl.format(contents);
        //return strRtn;
        return '';
    };

    var addRecordItem = function (obj) {
        var $obj = $(obj);
        var index = $obj.attr('itemIndex');
        var $textArea = $('#trustEvent_txtarea_' + index);
        var addItemValue = $textArea.val();
        $textArea.val('');
        var obsAddItem = ko.mapping.fromJS({ ItemValue: addItemValue });
        viewModel.TrustEventItem()[index].triggeredRecords.push(obsAddItem);
    };
    var removeRecordItem = function (obj) {
        var $obj = $(obj);
        var index = $obj.attr('itemIndex');
        var parentIndex = $obj.attr('parentIndex');
        var obsItem = viewModel.TrustEventItem()[parentIndex].triggeredRecords()[index];
        viewModel.TrustEventItem()[parentIndex].triggeredRecords.remove(obsItem);
    };
    
    var toogleBreachCondition = function (obj) {
        var $obj = $(obj);
        var goingShow = $obj.children('.icon').hasClass('icon-bottom');
        if (goingShow) {
            $obj.parent('div').children('.form-panel').show();
            $obj.children('.icon').removeClass('icon-bottom').addClass('icon-top');
        } else {
            $obj.parent('div').children('.form-panel').hide();
            $obj.children('.icon').removeClass('icon-top').addClass('icon-bottom');
        }
    };

    return {
        InitArgs: initArgs,
        DataBinding: dataBinding,
        AddItem: addTrustEventItem,
        RemoveItem: removeTrustEventItem,
        TriggeredBySet: trustEventsTriggeredBySettings,
        VerifyCondition: validCheckingCondition,
        showJS: showJS,
        SubmitJson: submitJson,
        PreviewString: previewString,
        AddRecordItem: addRecordItem,
        RemoveRecordItem: removeRecordItem,
        ToogleBreachConditionTable: toogleBreachCondition
    };
})();

var TrustEventRegistor = {
    init: function () {
        var dataTrustEventItem = this.getCategoryData('TrustEventItem');
        var dataTrustEventItemCondition = this.getCategoryData('TrustEventItemCondition');
        
        TrustEventBizModule.InitArgs('TrustEventDiv', dataTrustEventItem, dataTrustEventItemCondition);
        
        TrustEventBizModule.DataBinding();

        //this.registControlsValueChange('#txtTest');
    },
    update: function () {
        return TrustEventBizModule.SubmitJson();
    },
    preview: function () {
        return TrustEventBizModule.PreviewString();
    }//,
    //validation: function () {
    //   return this.validControls('#txtTest');
    //}
};
viewTrustWizard.registerMethods(TrustEventRegistor);
