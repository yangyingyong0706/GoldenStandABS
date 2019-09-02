
require(['jquery'], function ($) {
    var $table = $('.fee-table'),
         $feeSetting = $('.fee-setting'),
         offsetTop = $table.offset().top;
    $(window).scroll(function () {
        var top = $(this).scrollTop();
        if (top > offsetTop) {
            if (!$feeSetting.hasClass('fee-fixed')) $feeSetting.addClass('fee-fixed');
        } else {
            if ($feeSetting.hasClass('fee-fixed')) $feeSetting.removeClass('fee-fixed');
        }
    });
});

var viewModel;
var feeTypeListModel = {};
var feeTypeDisplayListModel = {};
var ko;
var renderControl;
var renderDom;
var renderStr;
var returnName;
var isDebug;
var dateSelectChange;
var warnUser;
var SaveFee;
var ReturnCaName;
var samename;
var TheSizeArry = [];
define(function (require) {
    var $ = require('jquery');
    //loading
    if (document.readyState == "complete") //当页面加载状态 
    {
        $("#loading").fadeOut();
    }
    var ui = require('jquery-ui');
    ko = require('knockout');
    var komapping = require('knockout.mapping');
    ko.mapping = komapping;
    var GSDialog = require("gsAdminPages");
    var common = require('common');
    var GlobalVariable = require('globalVariable');
    var WcfProxy = require('app/productManage/Scripts/wcfProxy');
    //require('date_input');
    require('calendar');
    var FormatNumber = require('app/productManage/TrustManagement/Common/Scripts/format.number');
    var TRUST = require('app/components/Layered/js/TrustWizard');
    require('autoComplete')
    require("ischeck");
    require("app/projectStage/js/project_interface");
    require('date_input');
    require('easing');
    var vue = require('Vue2');
    var gsUtil = require('gsUtil');
    var stepCode = 'fee';
    var ActLogs = require('insertActlogs');
    var RoleOperate = require('gs/uiFrame/js/roleOperate');
    var userName = RoleOperate.cookieName();
    var toast = require('toast');
    var taskIndicator = require('gs/taskProcessIndicator');
    var sVariableBuilder = require('gs/sVariableBuilder');
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
    var trustId = common.getQueryString("tid");
    var isShowRemove = true;
    //隐藏遮罩层  
    $(function () {
        function hideMask() {
            $("#mask").hide();
        }
        productPermissionState = common.getQueryString('productPermissionState');
        if (productPermissionState == 2) {

            setTimeout(function () {
                var c = document.body.scrollHeight;
                $("#mask").css("height", c);
                $("#mask").css("width", $(document).width());
                $("#mask").show();

            }, 700)
            //showMask();
        } else {
            hideMask();
        }
    })
    function preventDef(e) {
        e.preventDefault && e.preventDefault();
        e.stopPropagation && e.stopPropagation();
        e.cancelBubble = true;
        e.returnValue = false;
    }
    renderControl = ko.bindingHandlers.renderControl = {
        init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            var dataType = viewModel.DataType ? viewModel.DataType().toLocaleLowerCase() : '';
            var currentValue = viewModel.ItemValue ? viewModel.ItemValue() : viewModel.DisplayName();
            var isRequired = (viewModel.IsCompulsory && viewModel.IsCompulsory() == 'True') ? ' Required' : '';
            var sign = viewModel.sign ? 'done' : ''
            if (viewModel.Name && viewModel.Name().indexOf('CustodyBank_Interest_Fee_InterestEndDay') == 0) {
                if (viewModel.ItemValue() < 0) {
                    viewModel.ItemValue(-viewModel.ItemValue())
                }
            }
            var html = '';
            switch (dataType) {
                case 'double':
                case 'float':
                case 'decimal':
                    if (sign) {
                        html += '<input style="width: 100%; font-size:14px;overflow: hidden;" type="text" class="form-control"';
                        html += ' data-valid="' + dataType + isRequired + '" />';
                        html += '<div id="field1" class="field-details" style="display:inline-block;"><i class="icon icon-asset" style="display: block;color:#45569c;"></i><div id="fieldtip" class="field-detail-box" style="width:100px;font-size:12px;"></div></div>'
                    }
                    else {
                        html += '<input style="font-size:14px;overflow: hidden;" type="text" class="form-control" data-bind="value:ItemValue"';
                        html += ' data-valid="' + dataType + isRequired + '" />';
                    }
                    //html += '<div class="col-1"><div id="field1" class="field-details" style="display:inline-block;"><i class="icon icon-asset" style="margin-top: 4px;display: block;color:#4174cb;"></i><div id="fieldtip" class="field-detail-box" style="width:100px;font-size:12px;"></div></div></div>'
                    $(html).appendTo($(element));
                    break;
                case 'int':
                    if (sign) {
                        html += '<input style="width: 100%; font-size:14px;overflow: hidden;" type="text" class="form-control" onchange="validControlValue(this)"';
                        html += ' data-valid="' + dataType + isRequired + '" />';
                        html += '<div id="field1" class="field-details" style="display:inline-block;"><i class="icon icon-asset" style="display: block;color:#45569c;"></i><div id="fieldtip" class="field-detail-box" style="width:100px;font-size:12px;"></div></div>'
                    } else {
                        html += '<input style="font-size:14px;overflow: hidden;" type="text" class="form-control" data-bind="value:ItemValue" onchange="validControlValue(this)"';
                        html += ' data-valid="' + dataType + isRequired + '" />';
                    }
                    $(html).appendTo($(element));
                    break;
                case 'date':
                    html += '<input style="width: 100%; font-size:14px;overflow: hidden;" type="text" class="form-control date-plugins" data-bind="value:ItemValue"';
                    html += ' data-valid="' + dataType + isRequired + '" />';
                    if (sign) {
                        html += '<div id="field1" class="field-details" style="display:inline-block;"><i class="icon icon-asset" style="margin-top: 2px;display: block;color:#45569c;"></i><div id="fieldtip" class="field-detail-box" style="width:100px;font-size:12px;"></div></div>'
                    }
                    $(html).appendTo($(element));
                    $('.date-plugins').date_input();
                    break;
                case 'datetime':
                    if (sign) {
                        html += '<input style="width: 100%; font-size:14px;overflow: hidden;" type="text" class="form-control date-plugins" onchange="validControlValue(this)"';
                        html += ' data-valid="' + dataType + isRequired + '" />';
                        html += '<div id="field1" class="field-details" style="display:inline-block;"><i class="icon icon-asset" style="margin-top: 2px;display: block;color:#45569c;"></i><div id="fieldtip" class="field-detail-box" style="width:100px;font-size:12px;"></div></div>'
                    } else {
                        html += '<input style="font-size:14px;overflow: hidden;" type="text" class="form-control date-plugins" data-bind="value:ItemValue" onchange="validControlValue(this)"';
                        html += ' data-valid="' + dataType + isRequired + '" />';
                    }
                    $(html).appendTo($(element));
                    break;
                case 'bool':
                    html += '<input style="font-size:14px;overflow: hidden;" type="checkbox" data-bind="checked: ItemValue" />';
                    $(html).appendTo($(element));
                    break;
                case 'select':
                    var DataSourceName = viewModel.DataSourceName();
                    var optionsSource = getOptionsSource(DataSourceName);
                    if (optionsSource == null) {
                        html = '<select style="font-size:14px;overflow: hidden;" class="form-control" ></select>';
                    } else {
                        var op = "";
                        $.each(optionsSource, function (i, option) {
                            op = op + '<option style="font-size:13px;overflow: hidden;" value="' + option.Value + '">' + option.Title + '</option>';
                        });
                        var id = allBindings.get('id');
                        if (id == null) {

                            html = '<select style="font-size:14px;overflow: hidden;" class="form-control" data-bind="value: ItemValue">' + op + '</select>';
                        } else {
                            html = '<select style="font-size:14px;overflow: hidden;" id=' + id + DataSourceName + ' class="form-control" data-bind="value: ItemValue">' + op + '</select>';
                        }
                    }
                    if (viewModel.Name && viewModel.Name().indexOf('CustodyBank_Interest_ToBePaidFrequencyStyle') == 0) {
                        html += '<div id="field1" class="field-details" style="display:inline-block;cursor:pointer;" data-toggle="tooltip" data-placement="bottom" title="产品兑付日的区间需要包含保管银行利息的结算区间"><i class="icon icon-help" style="margin-top: 4px;display: block;color:#45569c;margin-left:8px;"></i></div>'
                    }
                    $(html).appendTo($(element));
                    viewModel.ItemValue() ? viewModel.ItemValue() : viewModel.ItemValue(currentValue)
                    $(".field-details").tooltip();
                    break;
                case 'hidebox':
                    var DataSourceName = viewModel.DataSourceName();
                    var optionsSource = getOptionsSource(DataSourceName);
                    if (optionsSource == null) {
                        html = '<select style="font-size:14px;overflow: hidden;" class="form-control" ></select>';
                    } else {
                        var op = "";
                        $.each(optionsSource, function (i, option) {
                            op = op + '<option style="font-size:13px;overflow: hidden;" value="' + option.Value + '">' + option.Title + '</option>';
                        });
                        var id = allBindings.get('id');
                        if (id == null) {

                            html = '<select style="font-size:14px;overflow: hidden;" class="form-control" data-bind="value: ItemValue">' + op + '</select>';
                        } else {
                            html = '<select style="font-size:14px;overflow: hidden;" id=' + id + DataSourceName + ' class="form-control" data-bind="value: ItemValue">' + op + '</select>';
                        }
                    }
                    $(html).appendTo($(element));
                    $(element).parents(".fee-input-group").hide()
                    break;
                case 'list':
                    var itemCode = viewModel.ItemCode();
                    var listid = itemCode + "_IdList";
                    html += '<input style="font-size:14px;overflow: hidden;" type="text" list="' + listid + '" class="form-control" data-bind="value: ItemValue" onchange="validControlValue(this)"';
                    html += ' data-valid="' + isRequired + '" />';
                    $(html).appendTo($(element));
                    var idList = getIdList(itemCode);
                    if (idList == null) {
                        html = '<datalist id="' + listid + '"></datalist>';
                    } else {
                        var op = "";
                        $.each(idList, function (i, option) {
                            op = op + '<option style="font-size:14px;overflow: hidden;" value="' + option.Value + '"></option>';
                        });
                        html = '<datalist id="' + listid + '">' + op + '</datalist>';
                    }
                    $(html).appendTo($(element));
                    break;
                case 'autocomplete':
                    var actioncode = viewModel.ActionCode();
                    var optionsSource = getFeeSource(actioncode);
                    if (optionsSource == null) {
                        html = '<select style="font-size:14px;overflow: hidden;" class="form-control" ></select>';
                    } else {
                        var op = "";
                        $.each(optionsSource, function (i, option) {
                            op = op + '<option style="font-size:14px;overflow: hidden;" value="' + option.ActionCode + '">' + option.DisplayName + '</option>';
                        });
                        //var id = allBindings.get('id');
                        //if (id == null) {
                        //    html = '<select class="form-control" data-bind="value: DisplayName">' + op + '</select>';
                        //} else {
                        html = '<select style="font-size:14px;overflow: hidden;" id="' + actioncode + '" type="autocomplete" class="form-control" defaultValue="' + viewModel.DisplayName() + '">' + op + '</select>';
                        //}
                    }
                    $(html).appendTo($(element));
                    $('#' + actioncode).combobox({
                    });
                    $(html).removeAttr('defaultValue');
                    break;
                case 'text':
                    if (sign) {
                        html += '<span style="font-size:14px;overflow: hidden;" data-bind="text: $root.handlFormtNum(ItemValue)"></span>';
                        html += '<div id="field1" class="field-details" style="display:inline-block;"><i class="icon icon-asset" style="margin-top: 2px;display: block;color:#45569c;"></i><div id="fieldtip" class="field-detail-box" style="width:100px;font-size:12px;"></div></div>'
                    } else {
                        html += '<span style="font-size:14px;overflow: hidden;" data-bind="text: fItemValue"></span>';
                    }
                    $(html).appendTo($(element));
                    break;
                default:
                    /* 
                     * 针对ie下onchange事件引起表单无光标bug的替代方案，这个方案不是最好的，推荐使用subscribe来订阅改变
                     * 在viewModel中添加validControlValue方法，替代 onchange="validControlValue(this)"
                     */
                    if (sign) {
                        html += '<input style="width:100%; font-size:14px;overflow: hidden;" type="text" id="ccttgg" class="form-control" data-bind="value: $root.numFormt(ItemValue),event:{keyup:$root.validControlValue}"';
                        html += ' data-valid="' + isRequired.trim() + '" />';
                        html += '<div id="field1" class="field-details" style="display:inline-block;cursor:pointer;" data-toggle="tooltip" data-placement="bottom"  data-bind="event:{mouseover:$root.showmoney(event)}"><i class="icon icon-asset" style="display: block;color:#45569c;"></i></div>'
                    } else {
                        html += '<input style=" font-size:14px;overflow: hidden;" type="text" class="form-control" data-bind="value:$root.numFormt(ItemValue),event:{keyup:$root.validControlValue}"';
                        html += ' data-valid="' + isRequired.trim() + '" />';
                    }
                    $(html).appendTo($(element));
                    break;
            }
        }
    };
    //return name
    returnName = ko.bindingHandlers.returnName = {

        init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            var dataType = viewModel.DataType ? viewModel.DataType().toLocaleLowerCase() : '';
            var currentValue = viewModel.ItemValue ? viewModel.ItemValue() : viewModel.DisplayName();
            var isRequired = (viewModel.IsCompulsory && viewModel.IsCompulsory() == 'True') ? ' Required' : '';
            var sign = viewModel.sign ? 'done' : ''
            if (viewModel.Name && viewModel.Name().indexOf('CustodyBank_Interest_Fee_InterestEndDay') == 0) {
                if (viewModel.ItemValue() < 0) {
                    viewModel.ItemValue(-viewModel.ItemValue())
                }
            }
            var html = '';
            switch (dataType) {
                case 'select':
                    var DataSourceName = viewModel.DataSourceName();
                    var optionsSource = getOptionsSource(DataSourceName);
                    if (optionsSource == null) {
                        html = '';
                    } else {
                        var op = "";
                        $.each(optionsSource, function (i, option) {
                            if (option.Value == DataSourceName || option.Value == viewModel.ItemValue()) {
                                if (option.Title.length > 7) {
                                    html += '<span style="cursor: pointer;" class="col-font" title="' + option.Title + '">' + option.Title.substring(0, 7) + ".." + '</span>';

                                } else {
                                    html += '<span class="col-font" title="' + option.Title + '">' + option.Title + '</span>';
                                }
                            } else {
                            }
                        });
                    }
                    $(html).appendTo($(element));
                    break;
                case 'hidebox':
                    $(element).parent().hide();
                    break;
                default:
                    html += '<span class="col-font">' + viewModel.ItemValue() + '</span>';
                    $(html).appendTo($(element));
            }
        }
    };
    //renderDom
    renderDom = ko.bindingHandlers.renderDom = {
        init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            var dataType = viewModel.DataType ? viewModel.DataType().toLocaleLowerCase() : '';
            var currentValue = viewModel.ItemValue ? viewModel.ItemValue() : viewModel.DisplayName();
            var html = '';
            var arry = viewModel.ItemValue().split("#");
            var FeeBase = window.viewModel.DataSources.FeeBase();
            var PeriodBase = window.viewModel.DataSources.PeriodBase();
            switch (dataType) {
                case 'assembly':
                    //分组找出元素,运算符和数值
                    $.each(arry, function (i, v) {
                        //数值
                        if (parseFloat(v.replace(/,/g, "")) == v.replace(/,/g, "")) {
                            html += "<div class='infonv Numbers'>" + "<span>" + v + "</span>" + "</div>";
                        } else {
                            if (v.length == 1) {//运算符
                                html += '<div class="operators" style="min-width:30px;flex:unset">' + ' <span>' + v + '</span>' + '</div>'
                            } else if (v == 'Round' || v == 'RoundUp' || v == 'RoundDown') {
                                html += '<div class="operators" style="width:100px;flex:unset">' + ' <span>' + v + '</span>' + '</div>'
                            } else {
                                //元素
                                $.each(FeeBase, function (j, k) {
                                    if (k.Value() == v) {
                                        html += '<div class="elements" title="' + k.Title() + '" values="' + k.Value() + '" style="width:calc(23.6% - 15px)">' + '<span>' + k.Title() + '</span>' + '</div>';
                                    }
                                })
                                $.each(PeriodBase, function (j, k) {
                                    if (k.Value() == v) {
                                        html += '<div class="elements" title="' + k.Title() + '" values="' + k.Value() + '" style="width:calc(23.6% - 15px)">' + '<span>' + k.Title() + '</span>' + '</div>';
                                    }
                                })
                            }
                        }
                    })
                    $(html).appendTo($(element));
                    break;
                default:
                    $(html).appendTo($(element));
            }
        }
    };
    //renderStr
    renderStr = ko.bindingHandlers.renderStr = {
        init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            var dataType = viewModel.DataType ? viewModel.DataType().toLocaleLowerCase() : '';
            var currentValue = viewModel.ItemValue ? viewModel.ItemValue() : viewModel.DisplayName();
            var html = '';
            var arry = viewModel.ItemValue().split("#");
            var FeeBase = window.viewModel.DataSources.FeeBase();
            var PeriodBase = window.viewModel.DataSources.PeriodBase();
            switch (dataType) {
                case 'assembly':
                    //分组找出元素,运算符和数值
                    $.each(arry, function (i, v) {
                        //数值
                        if (parseFloat(v.replace(/,/g, "")) == v.replace(/,/g, "")) {
                            html += "<span class='xro'>" + v + "</span>";
                        } else {
                            if (v.length == 1) {//运算符
                                html += "<span class='xro'>" + v + "</span>";
                            } else if (v == 'Round' || v == 'RoundUp' || v == 'RoundDown') {
                                html += "<span class='xro'>" + v + "</span>";
                            } else {
                                //元素
                                $.each(FeeBase, function (j, k) {
                                    if (k.Value() == v) {
                                        html += "<span class='xro'>" + k.Title() + "</span>";
                                    }
                                })

                                $.each(PeriodBase, function (j, k) {
                                    if (k.Value() == v) {
                                        html += "<span class='xro'>" + k.Title() + "</span>";
                                    }
                                })
                            }
                        }
                    })
                    $(html).appendTo($(element));
                    break;
                default:
                    $(html).appendTo($(element));
            }
        }
    };
    //return ca name
    ReturnCaName = ko.bindingHandlers.ReturnCaName = {
        init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            var dataType = viewModel.DataType ? viewModel.DataType().toLocaleLowerCase() : '';
            var currentValue = viewModel.ItemValue ? viewModel.ItemValue() : viewModel.DisplayName();
            var isRequired = (viewModel.IsCompulsory && viewModel.IsCompulsory() == 'True') ? ' Required' : '';
            var sign = viewModel.sign ? 'done' : ''
            if (viewModel.Name && viewModel.Name().indexOf('CustodyBank_Interest_Fee_InterestEndDay') == 0) {
                viewModel.ItemValue(-viewModel.ItemValue())
            }
            var html = '';
            html += '<span class="title_font">' + viewModel.DisplayName().replace(/\*/g, "") + ":" + '</span>';;
            $(html).appendTo($(element));
        }
    };
    var trustId = common.getQueryString("tid") ? common.getQueryString("tid") : "";
    var debug = common.getQueryString("debug");
    isDebug = function isDebug() {
        if (debug)
            return true;
        else
            return false;
    };
    samename = function samename() {
        return true;
    }
    var PageSettings = { DataSources: {} };
    function getOptionsSource(code) {
        return PageSettings.DataSources[code];
    }
    function getFeeSource(code) {
        var actiontypecode = code.substr(0, code.lastIndexOf('_'));
        return feeTypeListModel[actiontypecode]['FeeList'];
    }
    function feeAddToModel(obj, p1, p2, p3) {
        if (!obj['FeeList']) obj['FeeList'] = {};
        if (!obj['FeeList'][p1]) obj['FeeList'][p1] = {};
        obj['FeeList'][p1]['ActionCode'] = p1;
        obj['FeeList'][p1]['DisplayName'] = p2;
        obj['FeeList'][p1]['actionindex'] = p3;
    }
    function feeDisplayAddToModel(obj, p1, p2, p3, p4) {
        if (!obj[p1]) obj[p1] = {};
        obj[p1]['DisplayName'] = p1;
        obj[p1]['ActionCode'] = p2;
        obj[p1]['actionindex'] = p3;
        obj[p1]['ActionTypeCode'] = p4;
    }
    function feeActionDisplayNameSelect(event, ui, obj) {
        var dataIndex = $(obj).attr('dataIndex');
        setDisplayName(dataIndex, $(obj).val());
    }
    function setDisplayName(dataIndex, displayName) {
        var item = viewModel.Json()[dataIndex];
        item.DisplayName(displayName);
    }
    function ReturnCaName(name) {
        
    }
    function feeActionDisplayNameChange(event, ui, obj) {
        //1  对改制前元素的处理
        var oldvalue = $(obj).attr('oldvalue');
        var dataIndex = $(obj).attr('dataIndex');
        setDisplayName(dataIndex, $(obj).val());
        var actiontypecode = feeTypeDisplayListModel[oldvalue]['ActionTypeCode'];
        var isCurPageNew = false;
        if (feeTypeDisplayListModel[oldvalue] && feeTypeDisplayListModel[oldvalue]['ActionTypeCode'] &&
        feeTypeListModel[feeTypeDisplayListModel[oldvalue]['ActionTypeCode']]['initactionindex'] &&
        parseInt(feeTypeDisplayListModel[oldvalue]['actionindex']) >
        parseInt(feeTypeListModel[feeTypeDisplayListModel[oldvalue]['ActionTypeCode']]['initactionindex'])) {
            isCurPageNew = true;
            var actioncode = feeTypeDisplayListModel[oldvalue]['ActionCode'];
            feeTypeListModel[actiontypecode]['FeeList'] = destroy(feeTypeListModel[actiontypecode]['FeeList'], actioncode);
            //todo:逻辑似乎否正确：待查证，验证
            feeTypeDisplayListModel = destroy(feeTypeDisplayListModel, oldvalue);
        }
        //2  对新元素的处理素的feeid和pid修改了
        //else 把元素，按照新增加元素处理。把所有id都用新的
        //如果是已有元素，则判断页面上，是否已经存在，如果以存在，则提示
        //把已有元素的id拿过来，把新元，可复制点击加号时的操作
        var displayName = $(obj).val();
        if (feeTypeDisplayListModel[displayName]) {
            var actioncode = feeTypeDisplayListModel[displayName]['ActionCode'];
            var feeTypeItem = feeTypeListModel[actiontypecode]['FeeList'][actioncode];
            var feeTypeItemIndex = feeTypeItem['actionindex'];
            var item = viewModel.Json()[dataIndex];
            item.ActionCode(actiontypecode + '_' + feeTypeItemIndex);
            $.each(item.Parameters(), function (i, n) {
                var typename = n.Name().substr(0, n.Name().lastIndexOf('_'));
                n.Name(typename + '_' + feeTypeItemIndex);
            });
        } else {
            if (true || isCurPageNew == true) {
                //直接修改当前的选项为新增值
                var itemTmp = viewModel.Json()[dataIndex];
                //var item = ko.toJS(itemTmp);
                var item = ko.toJS(feeTypeListModel[actiontypecode]['item']);
                var actionindex = parseInt(feeTypeListModel[actiontypecode]['actionindex']) + 1;
                item.ActionCode = ReplaceIndex(item.ActionCode, '#Id#', actionindex);
                item.DisplayName = displayName;
                $.each(item.Parameters, function (i, n) {
                    n.Name = ReplaceIndex(n.Name, '#Id#', actionindex);
                })
                addItem(item, actionindex, actiontypecode);
                removeItem(itemTmp, oldvalue);
                viewModel.Json.remove(itemTmp);
                item = ko.mapping.fromJS(item);
                viewModel.Json.push(item);
            }
        }
        reBindingAutoCompleteBox(actiontypecode);
    }
    function addItem(item, actionindex, actiontypecode) {
        feeTypeListModel[actiontypecode]['actionindex'] = actionindex;
        feeAddToModel(feeTypeListModel[actiontypecode], item.ActionCode, item.DisplayName, actionindex);
        feeDisplayAddToModel(feeTypeDisplayListModel, item.DisplayName, item.ActionCode, actionindex, actiontypecode);
    }
    function removeItem(item, delDisplayName) {
        if (delDisplayName == null || typeof (delDisplayName) == 'undefined') delDisplayName = item.DisplayName();
        var actiontypecode = item.ActionCode().substr(0, item.ActionCode().lastIndexOf('_'));
        var actiontypeindex = item.ActionCode().substr(item.ActionCode().lastIndexOf('_') + 1);
        var initactionindexmax = parseInt(feeTypeListModel[actiontypecode]['initactionindex']);
        if (parseInt(actiontypeindex) > parseInt(initactionindexmax)) {
            var actionindexmax = parseInt(feeTypeListModel[actiontypecode]['actionindex']);
            if (actiontypeindex == actionindexmax)
                feeTypeListModel[actiontypecode]['actionindex'] = parseInt(actiontypeindex) - 1;
            feeTypeListModel[actiontypecode]['FeeList'] = destroy(feeTypeListModel[actiontypecode]['FeeList'], item.ActionCode());
            feeTypeDisplayListModel = destroy(feeTypeDisplayListModel, delDisplayName);
        }
    }
    $(function () {
        getPeriodsDates();
        getCashFlowFeeModelFromFile();
        $(document).on("scroll", function (e) {
            preventDef(e)
        })
        $('#addShowColumn').click(function () {
            var dataindex = $('#feeSelect option:selected').attr('dataIndex');
            if (viewModel.Hide().length > parseInt(dataindex)) {
                var itemTmp = viewModel.Hide()[dataindex];
                var item = ko.toJS(itemTmp);
                var actiontypecode = item.ActionCode.substr(0, item.ActionCode.lastIndexOf('_'));
                var actionindex = parseInt(feeTypeListModel[actiontypecode]['actionindex']) + 1;
                item.ActionCode = ReplaceIndex(item.ActionCode, '#Id#', actionindex);
                //var tempDisplayName = feeTypeListModel[actiontypecode].item.DisplayName;
                item.DisplayName = item.DisplayName + '-' + actionindex;
                $.each(item.Parameters, function (i, n) {
                    n.Name = ReplaceIndex(n.Name, '#Id#', actionindex);
                })

                feeTypeListModel[actiontypecode]['actionindex'] = actionindex;
                feeAddToModel(feeTypeListModel[actiontypecode], item.ActionCode, item.DisplayName, actionindex);
                feeDisplayAddToModel(feeTypeDisplayListModel, item.DisplayName, item.ActionCode, actionindex, actiontypecode);
                item.status = 0;
                item.FeeBase = viewModel.DataSources.FeeBase();
                item.PeriodBase = viewModel.DataSources.PeriodBase();
                item = ko.mapping.fromJS(item);
                viewModel.Json.push(item);
                $('#addShowColumn').removeAttr("title");
                $(".block_each_wrap:last").find(".icon.icon-edit").trigger("click");
                $(".eidtbox:last").find("button").text("确定");
                reBindingAutoCompleteBox(actiontypecode);

            }
        });
        $(document).on('click', '#removeShowColumn', function () {
            var dataindex = $(this).attr("dataIndex");
            if (viewModel.Json().length > parseInt(dataindex)) {
                var item = viewModel.Json()[dataindex];
                var actiontypecode = item.ActionCode().substr(0, item.ActionCode().lastIndexOf('_'));
                var actiontypeindex = item.ActionCode().substr(item.ActionCode().lastIndexOf('_') + 1);
                var initactionindexmax = parseInt(feeTypeListModel[actiontypecode]['initactionindex']);
                if (parseInt(actiontypeindex) > parseInt(initactionindexmax)) {
                    var actionindexmax = parseInt(feeTypeListModel[actiontypecode]['actionindex']);
                    if (actiontypeindex == actionindexmax)
                        feeTypeListModel[actiontypecode]['actionindex'] = parseInt(actiontypeindex) - 1;
                    feeTypeListModel[actiontypecode]['FeeList'] = destroy(feeTypeListModel[actiontypecode]['FeeList'], item.ActionCode());
                    feeTypeDisplayListModel = destroy(feeTypeDisplayListModel, item.DisplayName());
                }
                viewModel.Json.remove(item);
                reBindingAutoCompleteBox(actiontypecode);
            }
            return false;
        });
        RemoveColButtomSHEvent();
        RemoveColButtomSH(isShowRemove);
        //编辑
        $(document).on('click', '.icon.edit-a', function () {
            var dataindex = $(this).attr("dataIndex");
            //box show
            var type = viewModel.Json()[dataindex].FeeType()
            var title = $(this).val();
            $("#aaa .titlestyle>span").text(title)
            $(".eidtbox:last").find("button").text("更新");
            $("#aaa .ant-drawer-mask").addClass("open");
            $("#aaa .ant-drawer-content-wrapper").css("height", "410px");
            if (type == "Formular") {
                var h = $("body").height();
                h < 650 ? $("#aaa .ant-drawer-content-wrapper").css({ "height": h + "px", "overflow": 'auto' }) : $("#aaa .ant-drawer-content-wrapper").css("height", "650px");
            }
            $(".eidtbox").eq(dataindex).show().siblings().hide();
            return false;
        })
        //公式计算添加元素到显示区域
        $(document).on('click', '.changeTab .elements', function () {
            var dataindex = $(this).attr("dataIndex");
            var value = $(this).attr("values");
            var index = $(".eidtbox:visible").index();
            $.each(viewModel.Json()[index].Parameters(), function (i, v) {
                if (v.DataType() == 'assembly') {
                    var str = "";
                    if (v.ItemValue() == '') {
                        str += value;
                        v.ItemValue(str)
                    } else {
                        str += v.ItemValue() + "#" + value;
                        v.ItemValue(str)
                    }
                }
            })
            //添加方框
            var tt = $(this).clone(true);
            tt.css("width", "calc(23.6% - 15px)");
            tt.appendTo($(this).parents(".changeTab").next().find(".DisplayArea .dis"));

            //添加结果
            var apst = $(this).parents(".changeTab").next().find(".resultArea .res").html();
            apst += "<span class='xro'>" + tt.text() + "</span>";
            $(this).parents(".changeTab").next().find(".resultArea .res").html(apst);
        })
        //公式计算添加运算符到显示区域
        $(document).on('click', '.showtitle .operators', function () {
            var value = $(this).find("span").text();
            var index = $(".eidtbox:visible").index();
            var Numbers = $(this).hasClass("Numbers");//数字
            var Special = $(this).hasClass("Special");//运算符
            var strings = $(this).hasClass("strings");//操作符号 Round
            $.each(viewModel.Json()[index].Parameters(), function (i, v) {
                if (v.DataType() == 'assembly') {
                    var str = "";
                    if (v.ItemValue() == '') {
                        str += value;
                        v.ItemValue(str)
                    } else {
                        //判断是什么类型
                        if (Numbers && !isNaN(v.ItemValue().substring(v.ItemValue().length - 1, v.ItemValue().length)) || value == '.' || v.ItemValue().substring(v.ItemValue().length - 1, v.ItemValue().length) == ".") {
                            str += v.ItemValue() + value;
                        } else {
                            str += v.ItemValue() + "#" + value;
                        }
                    }
                    v.ItemValue(str)
                }
            })
            //判断是否是数值类型
            if (Numbers && $(".dis:visible").find("div:last").hasClass('Numbers')) {
                var vas = $(".dis:visible").find("div:last").find("span").text();
                $(".dis:visible").find("div:last").find("span").text(vas + value);

                var vass = $(".res:visible").find(".xro:last").text();
                $(".res:visible").find(".xro:last").text(vass + value)
            } else {
                //添加方框
                var tt = $(this).clone(true);
                tt.css({ "min-width": "30px", "flex": "unset" });
                tt.appendTo($(this).parents(".showArea").find(".DisplayArea .dis"));
                //添加结果
                var apst = $(this).parents(".showArea").find(".resultArea .res").html();
                apst += "<span class='xro'>" + tt.find('span').text() + "</span>";
                $(this).parents(".showArea").find(".resultArea .res").html(apst);
            }

        })
        //公式计算数值添加
        $(document).on('click', '.addNumberv', function () {
            var value = $(this).prev().val();
            var tvalue = $(this).prev().val().replace(/,/g, "");
            var tex = new RegExp("[^.0-9]");
            if (tex.test(tvalue)) {
                GSDialog.HintWindow("请输入数值");
                return false
            }
            var index = $(".eidtbox:visible").index();
            $.each(viewModel.Json()[index].Parameters(), function (i, v) {
                if (v.DataType() == 'assembly') {
                    var str = "";
                    if (v.ItemValue() == '') {
                        str += value;
                        v.ItemValue(str)
                    } else {
                        str += v.ItemValue() + "#" + value;
                        v.ItemValue(str)
                    }
                }
            })
            //添加方框
            var tt = $("<div class='infonv Numbers'>" + "<span>" + value + "</span>" + "</div>");
            tt.appendTo($(this).parents(".showArea").find(".DisplayArea .dis"));

            //添加结果
            var apst = $(this).parents(".showArea").find(".resultArea .res").html();
            apst += "<span class='xro'>" + value + "</span>";
            $(this).parents(".showArea").find(".resultArea .res").html(apst);
            $(this).prev().val('');
        })
        $(document).on('keyup', '.numberv', function () {
            var p = $(this).val();
            p = p.replace(/,/g, "")
            var res = p.replace(/\d+/, function (n) { // 先提取整数部分
                return n.replace(/(\d)(?=(\d{3})+$)/g, function ($1) {
                    return $1 + ",";
                });
            })
            $(this).val(res);
        })
        //回退操作
        $(document).on('click', '.goback', function () {
            var index = $(".eidtbox:visible").index();
            var str = '';
            $.each(viewModel.Json()[index].Parameters(), function (i, v) {
                if (v.DataType() == 'assembly') {
                    var value = v.ItemValue().split("#").slice(0, -1).join("#")
                    v.ItemValue(value);
                    str = v.ItemValue();
                }
            })
            //回退方框
            var arry = str.split("#");
            var FeeBase = viewModel.DataSources.FeeBase();
            var PeriodBase = viewModel.DataSources.PeriodBase();
            var html = "";
            var strdom = ''
            //分组找出元素,运算符和数值
            $.each(arry, function (i, v) {
                //数值
                if (parseFloat(v) == v) {
                    html += "<div class='infonv Numbers'>" + "<span>" + v + "</span>" + "</div>";
                    strdom += "<span class='xro'>" + v + "</span>";
                } else {
                    if (v.length == 1) {//运算符
                        html += '<div class="operators" style="min-width:30px;flex:unset">' + ' <span>' + v + '</span>' + '</div>'
                        strdom += "<span class='xro'>" + v + "</span>";
                    } else if (v == 'Round' || v == 'RoundUp' || v == 'RoundDown') {//舍入规则
                        html += '<div class="operators" style="width:100px;flex:unset">' + ' <span>' + v + '</span>' + '</div>'
                        strdom += "<span class='xro'>" + v + "</span>";
                    } else {
                        //元素
                        $.each(FeeBase, function (j, k) {
                            if (k.Value() == v) {
                                html += '<div class="elements" title="' + k.Title() + '" values="' + k.Value() + '" style="width:calc(23.6% - 15px)">' + '<span>' + k.Title() + '</span>' + '</div>';
                                strdom += "<span class='xro'>" + k.Title() + "</span>";
                            }
                        })

                        $.each(PeriodBase, function (j, k) {
                            if (k.Value() == v) {
                                html += '<div class="elements" title="' + k.Title() + '" values="' + k.Value() + '" style="width:calc(23.6% - 15px)">' + '<span>' + k.Title() + '</span>' + '</div>';
                                strdom += "<span class='xro'>" + k.Title() + "</span>";
                            }
                        })
                    }
                }
            })
            $(this).parents(".DisplayArea").find('.dis').html('');
            $(html).appendTo($(this).parents(".DisplayArea").find('.dis'));
            //回退结果
            $(this).parents(".DisplayArea").next().find(".res").html('');
            $(strdom).appendTo($(this).parents(".DisplayArea").next().find(".res"));
        })
        //清除公式
        $(document).on('click', '.clearArea', function () {
            var index = $(".eidtbox:visible").index();
            $.each(viewModel.Json()[index].Parameters(), function (i, v) {
                if (v.DataType() == 'assembly') {
                    v.ItemValue("");
                }
            })
            //删除方框
            $(this).parents(".DisplayArea").find('.dis').html('');
            //删除结果
            $(this).parents(".DisplayArea").next().find(".res").html('');
        })
        //审计时间轴编辑
        $(document).on('click', '.icon.edit-b', function () {
            if ($(this).hasClass("nodrap")) {
                return false
            }
            var feeName = sessionStorage.getItem("cod");
            var transactionDate = $(this).parent().parent().find("td").eq(1).text();
            var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";//appDomain=TrustManagement&executeParams=" + context;
            sessionStorage.setItem("transactionDatessww", transactionDate);
            var executeParam = {
                SPName: 'usp_GetFeeDetailsByDateAndName', SQLParams: [
                    { Name: 'TrustId', value: trustId, DBType: 'int' },
                    { Name: 'feeName ', value: feeName, DBType: 'string' },
                    { Name: 'transactionDate', value: transactionDate, DBType: 'string' },
                ]
            };
            common.ExecuteGetData(false, serviceUrl, 'TrustManagement', executeParam, function (data) {
                var code = sessionStorage.getItem("cod").substr(0, sessionStorage.getItem("cod").lastIndexOf('_'));
                //$.each(arrycont, function (i, v) {
                //    if (v.Name.indexOf("Fee_PayFrequence") > 0 || v.Name.indexOf("Fee_CashingFrequency") > 0) {
                //        arrycont.remove(v);
                //    }
                //})
                var newtemp = {};
                newtemp.DataSourceName = "EffectiveMethod";
                newtemp.DisplayName = "当期是否发生";
                newtemp.DataType = "select";
                newtemp.Name = code + "_ToBePaid_#Id#";
                newtemp.ItemValue = "";
                var arrycont = JSON.parse(JSON.stringify(feeTypeListModel[code].item.Parameters));
                arrycont.push(newtemp)
                var newArry = data;
                viewModel.Group.removeAll()
                $.each(arrycont, function (i, v) {
                    $.each(newArry, function (j, k) {
                        if (v.Name.substring(0, v.Name.lastIndexOf('_')) == k.ItemCode.substring(0, k.ItemCode.lastIndexOf('_'))) {//匹配2个数组
                            k.DataSourceName = v.DataSourceName;
                            k.DataType = v.DataType;
                            k.DisplayName = v.DisplayName;
                            if (v.sign) { k.sign = v.sign }
                            var temp = ko.mapping.fromJS(k);
                            viewModel.Group.push(temp);
                        }
                    })
                })
                $("#loadfont").hide();
                $("#bbb .ant-drawer-mask").addClass("open");
                $("#thesky").show(30);
                reBindingAutoCompleteBox()
            });
        })
        //更新审计费时间轴里的单项编辑
        $("body").on("click", "#UpDateInner", function () {
            var transactionDate = sessionStorage.getItem("transactionDatessww");
            var items = '<items>';
            var TrustFeeName = sessionStorage.getItem("cod");
            var Formula = sessionStorage.getItem("Formula");
            var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";//appDomain=TrustManagement&executeParams=" + context;
            $.each(viewModel.Group(), function (n, fee) {
                var t;
                if (fee.ItemCode().indexOf("CustodyBank_Interest_Fee_InterestEndDay") == -1) {
                    t = fee.ItemValue().toString().replace(/,/g, '')
                } else {
                    if (isNaN(fee.ItemValue())) {
                        t = fee.ItemValue().toString().replace(/,/g, '')
                    } else {
                        t = -fee.ItemValue().toString().replace(/,/g, '')
                    }
                }
                items += '<item>';
                items += '<TrustFeeName>' + TrustFeeName + '</TrustFeeName>';
                items += '<ItemCode>' + fee.ItemCode() + '</ItemCode>';
                items += '<ItemValue>' + fee.ItemValue() + '</ItemValue>';
                items += '</item>';
            })
            items += '</items>';
            var executeParam = {
                SPName: 'usp_UpdateTrustFeeBySpecifiedDate', SQLParams: [
                    { Name: 'trustId', value: trustId, DBType: 'int' },
                     { Name: 'transactionDate ', value: transactionDate, DBType: 'string' },
                    { Name: 'Items', value: items, DBType: 'xml' }
                ]
            };
            common.ExecuteGetData(false, serviceUrl, 'TrustManagement', executeParam, function (data) {
                if (data[0].result == "1") {
                    var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";//appDomain=TrustManagement&executeParams=" + context;
                    var TrustFeeName = sessionStorage.getItem("cod");
                    var executeParam = {
                        SPName: 'usp_GetFeeScheduleByTrustIdAndFeeName', SQLParams: [
                            { Name: 'trustId', value: trustId, DBType: 'int' },
                            { Name: 'Formula ', value: Formula, DBType: 'string' },
                            { Name: 'TrustFeeName ', value: TrustFeeName, DBType: 'string' },
                        ]
                    };
                    common.ExecuteGetData(false, serviceUrl, 'TrustManagement', executeParam, function (data) {
                        app.AuditTable = data
                        GSDialog.HintWindow("更新成功", function () {
                            $("#thesky").hide(30);
                            $("#bbb .ant-drawer-mask").removeClass("open");
                        });
                    });

                } else {
                    GSDialog.HintWindow("更新失败", function () {
                        $("#thesky").hide(30);
                        $("#bbb .ant-drawer-mask").removeClass("open");
                    });
                }
            });
        })
        //单独关闭单独编辑费用界面
        $(document).on('click', '#closeboxon', function () {
            $("#thesky").hide(30);
            $("#bbb .ant-drawer-mask").removeClass("open");
        })
        //审计费时间轴
        $(document).on('click', '.icon.icon-calendar', function () {
            var dataindex = $(this).attr("dataIndex");
            if ($(this).hasClass("noColor")) {
                GSDialog.HintWindow("该费用尚未关联至产品时间轴,请覆盖至相应期数");
                return false
            }
            var name = $(this).parent().prev().text();
            var cod = viewModel.Json()[dataindex].ActionCode();
            var tid = common.getQueryString('tid');
            var Formula = viewModel.Json()[dataindex].Formula();
            sessionStorage.setItem("Formula", Formula);
            $("#bbbname").text(name + "-" + "时间轴展示与编辑");
            var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";//appDomain=TrustManagement&executeParams=" + context;
            var executeParam = {
                SPName: 'usp_GetFeeScheduleByTrustIdAndFeeName', SQLParams: [
                    { Name: 'trustId', value: trustId, DBType: 'int' },
                    { Name: 'TrustFeeName ', value: cod, DBType: 'string' },
                    { Name: 'Formula ', value: Formula, DBType: 'string' },
                ]
            };
            common.ExecuteGetData(true, serviceUrl, 'TrustManagement', executeParam, function (data) {
                app.AuditTable = data;
                $("#bbb .ant-drawer-mask").removeClass("open")
            });
            sessionStorage.setItem("cod", cod);
            $("#thesky").hide();
            $("#bbb .ant-drawer-content-wrapper").css("height", "100%");
            $("#bbb .ant-drawer-mask").addClass("open");
            $("#loadfont").show();
        })
        //Vue绑定盒子
        var app
        app = new vue({
            el: '#AuditTimeline',
            data: {
                AuditTable: [],
            },
            methods: {
                //searchPer: function ($event) {
                //    var self = this;
                //    var target = $event.currentTarget;
                //    var filter = $(target).val();
                //    var arry = $(".eachsearch");
                //    if (filter == "") {
                //        arry.show();
                //        return false
                //    }
                //    if (filter <= 0 || filter != parseFloat(filter) || filter > arry.length) {
                //        arry.hide();
                //        return false
                //    }
                //    if (filter != 0 && arry.eq(filter - 1).length > 0) {
                //        arry.eq(filter - 1).show().siblings().hide();
                //        return false
                //    }
                //}
            }
        })
        var vm;
        vm = new vue({
            el: '#matrixRate',
            data: {
                isMatrixRateDrawerOpen: false,
                matrixRate: [],
                activeMatrixIndex: -1,
                tableData: [],
                rateData: [],
                selected: [],
                checkboxAttr: [],
                checkAll: false,
                isEditing: [],
                editingName: []
            },
            methods: {
                initData: function() { // vueModel初始化，模拟重新加载抽屉
                    this.matrixRate = [];
                    this.activeMatrixIndex = -1;
                    this.tableData = [];
                    this.rateData = [];
                    this.selected = [];
                    this.checkboxAttr = [];
                    this.checkAll = false;
                    this.editingName = [];
                    var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
                    var executeParam = {
                        'SPName': "usp_GetAllMatrixRate"
                    };
                    this.matrixRate = common.ExecuteGetData(false, serviceUrl, 'TrustManagement', executeParam).slice(1);
                    this.setData(this.matrixRate);
                },
                editMatrixName: function(index) {
                    this.isEditing[index] = true;
                    this.initData();
                },
                saveEdit: function(matrixId, index) {
                    var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
                    var executeParam = {
                        SPName: 'usp_UpdateMatrixRateNameByMatrixId', SQLParams: [
                            { Name: 'matrixId', value: matrixId, DBType: 'int' },
                            { Name: 'name', value: vm.editingName[index], DBType: 'string' }
                        ]
                    };
                    common.ExecuteGetData(false, serviceUrl, 'TrustManagement', executeParam);
                    this.isEditing[index] = false;
                    this.initData();
                },
                cancelEdit: function(index) {
                    this.isEditing[index] = false;
                    this.initData();
                },
                deleteSelected: function() {
                    GSDialog.HintWindowWithCancel("删除矩阵型费率会影响相关费用信息，是否确认删除？", function() {
                        var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
                        var xml = '<data>';
                        vm.selected.forEach(element => {
                            xml += '<item><id>' + element + '</id></item>';
                        });
                        xml += '</data>';
                        var executeParam = {
                            SPName: 'usp_DeleteMatrixRateByMatrixId', SQLParams: [
                                { Name: 'idList', value: xml, DBType: 'xml' },
                            ]
                        };
                        common.ExecuteGetData(false, serviceUrl, 'TrustManagement', executeParam);
                        vm.initData();
                    });
                },
                deleteRow: function(matrixId) {
                    GSDialog.HintWindowWithCancel("删除矩阵型费率会影响相关费用信息，是否确认删除？", function() {
                        var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
                        var xml = '<data>';
                        xml += '<item><id>' + matrixId + '</id></item>';
                        xml += '</data>';
                        var executeParam = {
                            SPName: 'usp_DeleteMatrixRateByMatrixId', SQLParams: [
                                { Name: 'idList', value: xml, DBType: 'xml' },
                            ]
                        };
                        common.ExecuteGetData(false, serviceUrl, 'TrustManagement', executeParam);
                        vm.initData();
                    })
                },
                selectAll: function() {
                    if(this.selected.length !== this.matrixRate.length) {
                        this.checkAll = true;
                        this.selected = [];
                        this.checkboxAttr = [];
                        this.matrixRate.forEach(element => {
                            this.selected.push(element[0].MatrixId);
                            this.checkboxAttr.push(true);
                        });
                    } else {
                        this.checkAll = false;
                        this.selected = [];
                        this.checkboxAttr = [];
                    }
                },
                selectRow: function(matrixId, i) {
                    this.checkboxAttr[i] = !this.checkboxAttr[i];
                    var hasMatrixId = false;
                    this.selected.forEach((element, index) => {
                        if(element === matrixId) {
                            hasMatrixId = true;
                            this.selected.splice(index, 1);
                        }
                    });
                    if(hasMatrixId === false)
                    this.selected.push(matrixId);
                },
                downloadMatrixTemplate: function() {
                    var t = $("<a download='矩阵型费率.xlsx'><span id='ac'></span></a>");
                    var url = "/TrustManagementService/TrustMatrixFeeRatioModel/Temple/矩阵型费率.xlsx";;
                    t.attr("href", url);
                    t.appendTo($("body"));
                    $('#ac').click()
                    t.remove()
                },
                uploadRate: function() {
                    var self = this
                    var filePath = $('#input-uploadRate').val();
                    var fileName = filePath.substring(filePath.lastIndexOf('\\') + 1);
                    var fileType = fileName.substring(fileName.lastIndexOf('.') + 1);
                    if (fileType !== 'xlsx' && fileType !== 'xls' && fileName !== '') {
                        GSDialog.HintWindow('请选择正确的文件格式');
                        return false;
                    } else if(fileName !== '') {
                        var args = 'trustId=' +
                        'matrixRate' +
                        '&fileFolder=Temp&fileName=' + encodeURIComponent(fileName);
                        var fileData = document.getElementById('input-uploadRate').files[0]
                        $.ajax({
                            url: GlobalVariable.DataProcessServiceUrl + 'CommonFileUpload?' + args,
                            type: 'POST',
                            data: fileData,
                            cache: false,
                            dataType: 'json',
                            processData: false,
                            success: function (res) {
                                self.uploadRateTask(res.CommonTrustFileUploadResult, fileName);
                            },
                            error: function (res) {
                                GSDialog.HintWindow('上传文件错误');
                            }
                        })
                    }
                    $('#input-uploadRate').val('');
                },
                uploadRateTask: function(filePath, fileName) {
                    var self = this;
                    sVariableBuilder.AddVariableItem('filePath', filePath, 'String', 0, 0, 0);
                    var params = sVariableBuilder.BuildVariables();
                    var tIndicator = new taskIndicator({
                        width: 500,
                        height: 550,
                        clientName: 'TaskProcess',
                        appDomain: 'Task',
                        taskCode: 'ImportMatrixRate',
                        sContext: params,
                        callback: function (res) {
                            //vueModel初始化
                            vm.initData();
                        }
                    });
                    tIndicator.show();
                },
                showMatrixRateDrawer: function () {
                    this.isMatrixRateDrawerOpen = true;
                },
                setActiveMatrixIndex: function (index) {
                    if(index === this.activeMatrixIndex) {
                        this.activeMatrixIndex = -1;
                    } else {
                        this.activeMatrixIndex = index;
                    }
                },
                setData: function (sourceData) {
                    sourceData.forEach((elementOfSourceData, indexOfSourceData) => {
                        this.checkboxAttr.push(false);
                        this.isEditing.push(false);
                        this.editingName.push(elementOfSourceData[0].Displayname);
                        var isFirstRow = true;
                        this.tableData.push({ 
                            MatrixId: elementOfSourceData[0].MatrixId, 
                            leftName: elementOfSourceData[0].VerticalDisplayName, 
                            topName: elementOfSourceData[0].HorizontalDisplayName, 
                            leftArea: [{ 
                                left: (elementOfSourceData[0].LeftVerticalValue * 100).toFixed(2), 
                                right: (elementOfSourceData[0].RightVerticalValue * 100).toFixed(2),
                                leftStatus: elementOfSourceData[0].VerticalLeftStatus ? '(含)' : '(不含)',
                                rightStatus: elementOfSourceData[0].VerticalRightStatus ? '(含)' : '(不含)'
                            }], 
                            topArea: [{ 
                                left: (elementOfSourceData[0].LeftHorizontalValue * 100).toFixed(2), 
                                right: (elementOfSourceData[0].RightHorizontalValue * 100).toFixed(2),
                                leftStatus: elementOfSourceData[0].HorizontalLeftStatus ? '(含)' : '(不含)',
                                rightStatus: elementOfSourceData[0].HorizontalRightStatus ? '(含)' : '(不含)'
                            }]
                        });
                        elementOfSourceData.forEach((element, index) => {
                            if(elementOfSourceData[index+1] !== undefined) {
                                if(element.LeftHorizontalValue === elementOfSourceData[0].LeftHorizontalValue && index !== 0) {
                                    this.tableData[indexOfSourceData].leftArea.push({ 
                                        left: (elementOfSourceData[index+1].LeftVerticalValue * 100).toFixed(2), 
                                        right: (elementOfSourceData[index+1].RightVerticalValue * 100).toFixed(2),
                                        leftStatus: elementOfSourceData[index+1].VerticalLeftStatus ? '(含)' : '(不含)',
                                        rightStatus: elementOfSourceData[index+1].VerticalRightStatus ? '(含)' : '(不含)'
                                    });
                                    isFirstRow = false;
                                }
                                if(element.LeftHorizontalValue !== elementOfSourceData[index+1].LeftHorizontalValue && isFirstRow) {
                                    this.tableData[indexOfSourceData].topArea.push({ 
                                        left: (elementOfSourceData[index+1].LeftHorizontalValue * 100).toFixed(2), 
                                        right: (elementOfSourceData[index+1].RightHorizontalValue * 100).toFixed(2),
                                        leftStatus: elementOfSourceData[index+1].HorizontalLeftStatus ? '(含)' : '(不含)',
                                        rightStatus: elementOfSourceData[index+1].HorizontalRightStatus ? '(含)' : '(不含)'
                                    });
                                }
                            }
                        });
                        this.tableData[indexOfSourceData].topArea.pop();
                        var nowIndex = 0;
                        var rates = [];
                        this.tableData[indexOfSourceData].leftArea.forEach(element => {
                            var rows = [];
                            for (let i = 0; i < this.tableData[indexOfSourceData].topArea.length; i++, nowIndex++) {
                                rows.push((elementOfSourceData[nowIndex].FeeRate * 100).toFixed(2));
                            }
                            rates.push({ 
                                left: element.left, 
                                right: element.right,
                                leftStatus: element.leftStatus,
                                rightStatus: element.rightStatus,
                                rates: rows
                            })
                        });
                        this.rateData.push(rates);
                        console.log(this.tableData);
                    });
                }
            },
        });
        $("#MatrixRateButton").click(function () {
            vm.isMatrixRateDrawerOpen = true;
            var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
            var executeParam = {
                'SPName': "usp_GetAllMatrixRate"
            };
            vm.matrixRate = common.ExecuteGetData(false, serviceUrl, 'TrustManagement', executeParam).slice(1);
            vm.setData(vm.matrixRate);
        });
        //var formulaVue = new vue({
        //    el: '#formulaVue',
        //    data: {
        //        formula: String
        //    },
        //    methods: {

        //    },
        //})
        //
        //关闭隐藏盒子
        $(document).on('click', '#closebox', function () {
            //box hide
            if ($(this).parent().next().find(".eidtbox:last-child").find("#UpDate").text() == "确定") {
                $(".block_each_wrap:last").find(".icon.icon-remove").trigger("click");
            }
            $("#aaa .ant-drawer-mask").removeClass("open");
            $("#aaa .ant-drawer-content-wrapper").css("height", "0px");
            vm.isMatrixRateDrawerOpen = false;
        })

        $(document).on('click', '#closeboxEX', function () {
            $("#bbb .ant-drawer-mask").removeClass("open");
            $("#bbb .ant-drawer-content-wrapper").css("height", "0px");
        })
        //
        $('#prev-day').click(function () {
            var curVal = $('#dateSelect').val();
            var curIndex = null;
            var newvalue = null;
            $('#dateSelect').find('option').each(function (i, v) {

                if ($(this).attr("value") == curVal) {
                    if (i == 0) {
                        GSDialog.HintWindow("已经是第一个兑付日")
                        newvalue = curVal
                        return
                    }
                    curIndex = i
                    newvalue = $('#dateSelect').find('option').eq(i - 1).attr('value')
                }
            })
            $('#dateSelect').val(newvalue);
            dateSelectChange()
        })
        function isRepeat(arr) {
            var hash = {};
            for (var i in arr) {
                if (hash[arr[i]])
                    return true;
                hash[arr[i]] = true;
            }
            return false;
        }
        //更新
        $(document).on('click', '#UpDate', function () {
            //if (!ValidationFeeList()) { GSDialog.HintWindow('费用名称相同或为空，请检查'); return; }
            var opp = []
            $.each(viewModel.Json(), function (i, v) {
                opp.push(v.DisplayName())
            })
            //检验公式是否合法
            var index = $(".eidtbox:visible").index();
            var string = '';
            $.each(viewModel.Json()[index].Parameters(), function (i, v) {
                if (v.DataType() == 'assembly') {
                    string = v.ItemValue();
                }
            })
            if (!testFormula(string)) {
                GSDialog.HintWindow("公式不合法,请检查");
                return false
            }
            if (viewModel.Json()[index].FeeType() == 'Formular') {
                viewModel.Json()[index].MethodDisplayName($(".eidtbox:visible").find(".res").text())
            }
            var flag = isRepeat(opp);
            if (flag) { GSDialog.HintWindow('该费用名称已存在'); return }
            var inputControl = $(this).parent().parent().find(".form-control:visible").not(":first");
            var inputControljudge = true;
            var dataindex = $(this).parents(".eidtbox").index()
            $.each(inputControl, function (i, n) {
                var validataItem = $(n).val();
                var NPrentS = $(n).parent().siblings();
                var validataItemCode = (NPrentS.children())[0].innerHTML;
                if (validataItem == "" && validataItemCode.indexOf("*") > 0) {
                    $(this).addClass('red-border');
                    /*添加必填字段未填写时,弹窗提示以及隐藏框显示定位*/
                    GSDialog.HintWindow("有必填项未填写请检查");
                    if ($(this).parents("section").is(":hidden")) {
                        $(this).parents("section").show();
                        $(this).focus();
                    } else {
                        $(this).focus();
                    }
                    inputControljudge = false;
                } else {
                    $(this).removeClass('red-border');
                }
            });
            if (inputControljudge) {
                var arry = $(".block_each_wrap").eq(dataindex).find(".cipianlayer>div:visible").find(".text-fun");
                var bob = []
                $.each(inputControl, function (i, v) {
                    if ($(v).find("option").length > 0) {
                        //select
                        $.each($(v).find("option"), function (j, k) {
                            if ($(v).val() == $(k).val()) {
                                bob.push($(k).text())
                            }
                        })
                    } else {
                        //input
                        bob.push($(v).val())
                    }
                })
                $.each(arry, function (i, v) {
                    if (bob[i].length > 7) {
                        $(v).css({ "cursor": "pointer" });
                        $(v).attr("title", bob[i]);
                        $(v).text(bob[i].substring(0, 7) + "..")
                    } else {
                        $(v).text(bob[i]);
                    }
                })
                $.toast({ type: 'success', message: '更新成功' });
                //alertMsg("更新成功");
                $("#aaa .ant-drawer-mask").removeClass("open");
                $("#aaa .ant-drawer-content-wrapper").css("height", "0px");
                var top = $(".block_each_wrap:last")[0].offsetTop;
                var t = top - 100 > 0 ? top - 100 : 0
                $('html').animate({ scrollTop: t }, 300, 'easeOutQuart')
            }
        })
        $('#next-day').click(function () {
            var curVal = $('#dateSelect').val();
            var curIndex = null;
            var newvalue = null;
            $('#dateSelect').find('option').each(function (i, v) {
                if ($(this).attr("value") == curVal) {
                    if (i == $('#dateSelect').find('option').length - 1) {
                        GSDialog.HintWindow("已经是最后一个兑付日");
                        newvalue = curVal
                        return
                    }
                    curIndex = i
                    newvalue = $('#dateSelect').find('option').eq(i + 1).attr('value')
                }
            })
            $('#dateSelect').val(newvalue);
            dateSelectChange()
        })
    })
    //检验数学公式是否合法
    function testFormula(string) {
        // 剔除空白符
        var arry = string.split("#");
        string = string.replace(/#/g, "");
        // 判断空公式
        if ("" === string) {
            return true;
        }
        // 判断运算符连续（包含逗号）
        if (/[\+\-\*\/\,]{2,}/.test(string)) {
            return false;
        }
        // 判断空括号
        if (/\(\)/.test(string)) {
            return false;
        }
        // 判断括号匹配
        var stack = [];
        for (var i = 0, item; i < string.length; i++) {
            item = string.charAt(i);
            if ('(' === item) {
                stack.push('(');
            } else if (')' === item) {
                if (stack.length > 0) {
                    stack.pop();
                } else {
                    return false;
                }
            }
        }
        if (0 !== stack.length) {
            return false;
        }
        // 错误情况，(后面是运算符或逗号
        if (/\([\+\-\*\/\,]/.test(string)) {
            return false;
        }
        // 错误情况，)前面是运算符、Round或逗号
        if (/[\+\-\*\/Round\,]\)/.test(string)) {
            return false;
        }
        // // 错误情况，(前面不是运算符
        // if (/[^\+\-\*\/]\(/.test(string)) {
        //     return false;
        // }
        // // 错误情况，)后面不是运算符
        // if (/\)[^\+\-\*\/\)]/.test(string)) {
        //     return false;
        // }
        //错误情况,运算符开头
        if (/^[+\-\*\/]/.test(string)) {
            return false;
        }
        //错误情况,运算符或Round结尾
        if (/[+\-\*\/Round]$/.test(string)) {
            return false;
        }
        // //校验关系   
        // //数组 去除括号的部分
        // $.each(arry, function (i, v) {
        //     if (v == "(" || v == ")") {
        //         arry1.remove(v);
        //     }
        // })
        // //-> 剩下元素和运算符以及数值 
        // arry=arry1
        // var opx = []//存运算符
        // $.each(arry, function (i, v) {
        //     if (v == "+" || v == "-" || v == "*" || v == "/") {
        //         opx.push(v);
        //         arry1.remove(v);
        //     }
        // })
        // //-> 剩下元素和数值 元素和数值的len-1 = 运算符的个数
        // arry = arry1;
        // if (arry.length - 1 != opx.length) {
        //     return false;
        // }
        return true;
    }
    //全部收缩和全部展开功能
    function flexbtn() {
        $("#flexbtn").click(function () {
            $(".fee-name").next().toggle(30)
        })
    }
    flexbtn();
    function getPeriodsDates() {
        var executeParam = {
            'SPName': "usp_GetPaymentDateStrAndPeriod", 'SQLParams': [
                { 'Name': 'TrustId', 'Value': trustId, 'DBType': 'int' }
            ]
        };
        var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";//appDomain=TrustManagement&executeParams=" + context;
        var response = common.ExecuteGetData(false, serviceUrl, 'TrustManagement', executeParam);
        if (typeof response == "string")
            //指定期数的填充
            response = jQuery.parseJSON(response);
        var html = "<tbody class='ulstyle'>";
        $.each(response, function (i, v) {
            html += "<tr class='eachlis'><td>" + "<input type='checkbox'  />" + "</td><td><span>" + v.Period + "</span></td><td><span class='periodSaDate'>" + v.PaymentDate + "</span></td><td><select class='choiceH'><option value='3'>发生且兑付</option><option value='2'>发生且不兑付</option><option value='1'>不发生且兑付</option></select></td></tr>"
        })
        html += "</tbody>"
        $(".periodSa .table").append(html);
        //连续期数的填充
        $.each(response, function (n, res) {
            $(".startPer").append(("<option value='{0}'>{1}</option>").StringFormat(res.PaymentDate, "第" + res.Period + "期" + ":" + res.PaymentDate));
            $(".EndPer").append(("<option value='{0}'>{1}</option>").StringFormat(res.PaymentDate, "第" + res.Period + "期" + ":" + res.PaymentDate));
        });
        //连续期数的填充EX
        $.each(response, function (n, res) {
            $(".startPerEX").append(("<option value='{0}'>{1}</option>").StringFormat(res.PaymentDate, "第" + res.Period + "期" + ":" + res.PaymentDate));
            $(".EndPerEX").append(("<option value='{0}'>{1}</option>").StringFormat(res.PaymentDate, "第" + res.Period + "期" + ":" + res.PaymentDate));
        });
    }
    function getCashFlowFeeModelFromFile() {
        var executeParams = {
            'SPName': "usp_GetModelPathByTrustId", 'SQLParams': [
                { 'Name': 'TrustId', 'Value': trustId, 'DBType': 'int' }
            ]
        };
        var serviceUrls = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
        var response = common.ExecuteGetData(false, serviceUrls, 'TrustManagement', executeParams);
        response = response[0].Column1
        var filePath = "E:\\TSSWCFServices\\TrustManagementService\\UITaskStudio\\Models\\" + response + "\\CashFlowFeeModel.Xml";
        var serviceUrl = GlobalVariable.DataProcessServiceUrl + "/GetFeesFromXMLFile?FilePath=" + filePath;
        $.ajax({
            url: serviceUrl,
            type: "GET",
            contentType: "application/json; charset=utf-8",
            dataType: "jsonp",
            crossDomain: true,
            success: function (response) {
                var jsonSource = jQuery.parseJSON(response);
                // 获取由存储过程渲染的选项
                var tempUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
                var executeParam = {
                    'SPName': "usp_GetMatrixRateNameAndIdByTrustId", SQLParams: [
                        { 'Name': 'TrustId', 'Value': trustId, 'DBType': 'int' }
                    ]
                };
                var tempArray = common.ExecuteGetData(false, tempUrl, 'TrustManagement', executeParam)
                var executeParam = {
                    'SPName': "usp_GetBondCodeByTrustId", SQLParams: [
                        { 'Name': 'TrustId', 'Value': trustId, 'DBType': 'int' }
                    ]
                };
                var tempArray2 = common.ExecuteGetData(false, tempUrl, 'TrustManagement', executeParam)
                var SP_usp_GetMatrixRateNameAndIdByTrustId = [];
                var SP_usp_GetBondCodeByTrustId =[];
                tempArray2.forEach(element => {
                    SP_usp_GetBondCodeByTrustId.push({ Title: element.ShortName, Value: element.TrustBondname })
                });
                tempArray.forEach(element => {
                    SP_usp_GetMatrixRateNameAndIdByTrustId.push({ Title: element.DisPlayName, Value: element.MatrixId })
                });
                jsonSource.DataSources.SP_usp_GetMatrixRateNameAndIdByTrustId = SP_usp_GetMatrixRateNameAndIdByTrustId;
                jsonSource.DataSources.SP_usp_GetBondCodeByTrustId = SP_usp_GetBondCodeByTrustId;
                PageSettings.DataSources = JSON.parse(JSON.stringify(jsonSource.DataSources));
                jsonSource.Hide = jsonSource.Json;
                //获取增加模板;
                var serviceUrls = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
                var executeParam = {
                    SPName: 'TrustManagement.usp_GetFeeBaseItemAddition'
                };
                var con = [];
                var repeat = [];
                common.ExecuteGetData(false, serviceUrls, 'TrustManagement', executeParam, function (data) {
                    con = data;
                });
                for (var i = 0; i < con.length; i++) {
                    for (var j = 0; j < jsonSource.DataSources.FeeBase.length; j++) {
                        if (con[i].Value == jsonSource.DataSources.FeeBase[j].Value) {
                            repeat.push(con[i]);
                        }
                    }
                }
                if (repeat.length > 0) {
                    $.each(repeat, function (i, v) {
                        con.remove(v);
                    })
                }
                jsonSource.DataSources.FeeBase = jsonSource.DataSources.FeeBase.concat(con);
                //

                // start 把模型的基础数据，加载到内存中。后面当作默认数据，如果以后有默认数据依然可用
                $.each(jsonSource.Hide, function (index, item) {
                    item.DataType = 'autocomplete';
                    $.each(item.Parameters, function (i, n) {
                        if (n.ParameterInputType) {
                            n.DataType = n.ParameterInputType;
                        } else {
                            n.DataType = '';
                        }
                    })
                    if (!item.MethodDisplayName) item.MethodDisplayName = '';
                    item.FeeTypeDisplayName = item.DisplayName;

                    if (!feeTypeListModel[item.ActionCode]) {
                        var actiontypecode = item.ActionCode.substr(0, item.ActionCode.lastIndexOf('_'));
                        feeTypeListModel[actiontypecode] = {};
                        feeTypeListModel[actiontypecode]['actionindex'] = 0;
                        feeTypeListModel[actiontypecode]['initactionindex'] = 0;
                        feeTypeListModel[actiontypecode]['item'] = item;
                        $.each(item.Parameters, function (i, n) {
                            if (n['DisplayName'].indexOf('元') > 0) {
                                n['sign'] = 'done'
                            }
                        })
                    }

                })
                jsonSource.Json = [];
                jsonSource.Group = [];
                // end
                var node = document.getElementById("rootNode");
                viewModel = ko.mapping.fromJS(jsonSource);
                var feeItem = "<DataSources>";
                $.each(jsonSource.DataSources.FeeBase, function (i, v) {
                    feeItem += "<FeeBase><Title>" + v.Title + "</Title>"
                    feeItem += "<Value>" + v.Value + "</Value></FeeBase>"
                })
                $.each(jsonSource.DataSources.PeriodBase, function (i, v) {
                    feeItem += "<PeriodBase><Title>" + v.Title + "</Title>"
                    feeItem += "<Value>" + v.Value + "</Value></PeriodBase>"
                })
                $.each(jsonSource.DataSources.DatumDays, function (i, v) {
                    feeItem += "<DatumDays><Title>" + v.Title + "</Title>"
                    feeItem += "<Value>" + v.Value + "</Value></DatumDays>"
                })
                $.each(jsonSource.DataSources.InterestRate, function (i, v) {
                    feeItem += "<InterestRate><Title>" + v.Title + "</Title>"
                    feeItem += "<Value>" + v.Value + "</Value></InterestRate>"
                })
                $.each(jsonSource.DataSources.UnpaidDisposeMethod, function (i, v) {
                    feeItem += "<UnpaidDisposeMethod><Title>" + v.Title + "</Title>"
                    feeItem += "<Value>" + v.Value + "</Value></UnpaidDisposeMethod>"
                })
                $.each(jsonSource.DataSources.EffectiveMethod, function (i, v) {
                    feeItem += "<EffectiveMethod><Title>" + v.Title + "</Title>"
                    feeItem += "<Value>" + v.Value + "</Value></EffectiveMethod>"
                })
                $.each(jsonSource.DataSources.InterestPeriod, function (i, v) {
                    feeItem += "<InterestPeriod><Title>" + v.Title + "</Title>"
                    feeItem += "<Value>" + v.Value + "</Value></InterestPeriod>"
                })
                $.each(jsonSource.DataSources.DateType, function (i, v) {
                    feeItem += "<DateType><Title>" + v.Title + "</Title>"
                    feeItem += "<Value>" + v.Value + "</Value></DateType>"
                })
                $.each(jsonSource.DataSources.DateTypes, function (i, v) {
                    feeItem += "<DateTypes><Title>" + v.Title + "</Title>"
                    feeItem += "<Value>" + v.Value + "</Value></DateTypes>"
                })
                $.each(jsonSource.DataSources.PeriodBaeType, function (i, v) {
                    feeItem += "<PeriodBaeType><Title>" + v.Title + "</Title>"
                    feeItem += "<Value>" + v.Value + "</Value></PeriodBaeType>"
                })
                feeItem += "</DataSources>"
                var executeParams = {
                    'SPName': "TrustManagement.usp_SaveTrustFeeDateSource", 'SQLParams': [
                        { 'Name': 'trustId', 'Value': trustId, 'DBType': 'int' },
                        { 'Name': 'feeItem', 'Value': feeItem, 'DBType': 'xml' }
                    ]
                };
                var serviceUrls = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
                var response = common.ExecuteGetData(false, serviceUrls, 'TrustManagement', executeParams);
                //
                UpdateViewModel(function () {
                    ko.applyBindings(viewModel, node);
                    reBindingAutoCompleteBox();
                })
            },
            error: function (response) {
                alert("error:" + response);
            }
        });
    }
    function UpdateViewModel(callback) {
        getTrustFeeList(function (_dataList) {
            if (viewModel.Json) viewModel.Json.removeAll();

            $.each(feeTypeListModel, function (i, n) {
                n.actionindex = 0;
                n.initactionindex = 0;
                n.FeeList = {};
            })
            feeTypeDisplayListModel = {};
            //$.each(feeTypeDisplayListModel, function (i, n) {
            //    n = {};
            //})
            $.each(_dataList, function (i, n) {
                var code = n.TrustFeeName;

                var actiontypecode = code.substr(0, code.lastIndexOf('_'));
                var actiontypeindex = code.substr(code.lastIndexOf('_') + 1);

                if (feeTypeListModel[actiontypecode]) {
                    if (!feeTypeListModel[actiontypecode]['FeeList']) feeTypeListModel[actiontypecode]['FeeList'] = {};
                    feeAddToModel(feeTypeListModel[actiontypecode], n.TrustFeeName, n.TrustFeeDisplayName, actiontypeindex);

                    if (feeTypeListModel[actiontypecode]['actionindex'] == null ||
                    typeof feeTypeListModel[actiontypecode]['actionindex'] == 'undefined' ||
                    parseInt(feeTypeListModel[actiontypecode]['actionindex']) < actiontypeindex) {
                        feeTypeListModel[actiontypecode]['actionindex'] = actiontypeindex;
                        feeTypeListModel[actiontypecode]['initactionindex'] = actiontypeindex;
                    }
                }
                if (!feeTypeDisplayListModel[n.TrustFeeDisplayName]) feeTypeDisplayListModel[n.TrustFeeDisplayName] = {};
                feeDisplayAddToModel(feeTypeDisplayListModel, n.TrustFeeDisplayName, n.TrustFeeName, actiontypeindex, actiontypecode);
            })
            getTrustFee(function (_data) {
                var dataJson = {};
                //viewModel.Group.removeAll();
                $.each(_data, function (index, item) {
                    if (!dataJson[item.TrustFeeName]) {
                        dataJson[item.TrustFeeName] = {};
                        dataJson[item.TrustFeeName]["ActionCode"] = item.TrustFeeName;
                        dataJson[item.TrustFeeName]["DisplayName"] = item.TrustFeeDisplayName;
                        dataJson[item.TrustFeeName]["Parameters"] = {};
                        dataJson[item.TrustFeeName]["status"] = item.status;
                        dataJson[item.TrustFeeName]["FeeBase"] = viewModel.DataSources.FeeBase();
                        dataJson[item.TrustFeeName]["PeriodBase"] = viewModel.DataSources.PeriodBase();
                    }
                    dataJson[item.TrustFeeName]["Parameters"][item.ItemCode] = item.ItemValue;
                })
                //var dataGroup = {};
                //dataGroup.Json = [];
                $.each(dataJson, function (index, item) {
                    var actioncode = item.ActionCode;
                    var actiontypecode = actioncode.substr(0, actioncode.lastIndexOf('_'));
                    var actiontypeindex = actioncode.substr(actioncode.lastIndexOf('_') + 1);
                    var fee = feeTypeListModel[actiontypecode];
                    if (!fee || !fee.item) { // if fee is undefined or null, it will skip it.
                        return true;
                    }
                    fee.item.status = item.status;
                    var tmp = ko.mapping.fromJS(fee.item);
                    tmp.ActionCode(ReplaceIndex(tmp.ActionCode(), '#Id#', actiontypeindex));
                    tmp.DisplayName(item.DisplayName ? item.DisplayName : tmp.DisplayName());
                    tmp.FeeBase = viewModel.DataSources.FeeBase();
                    tmp.PeriodBase = viewModel.DataSources.PeriodBase();
                    $.each(tmp.Parameters(), function (i, n) {
                        n.Name(ReplaceIndex(n.Name(), '#Id#', actiontypeindex));
                        n.ItemValue(item.Parameters[n.Name()] ? item.Parameters[n.Name()] : '');
                    });
                    //特殊处理公式型费用
                    if (tmp.FeeType() == 'Formular') {
                        $.each(tmp.Parameters(), function (i, v) {
                            if (v.DataType() == "assembly") {
                                var arry = v.ItemValue().split("#");
                                var html = ""
                                var FeeBase = tmp.FeeBase;
                                var PeriodBase = tmp.PeriodBase;
                                $.each(arry, function (i, v) {
                                    //数值
                                    if (parseFloat(v.replace(/,/g, "")) == v.replace(/,/g, "")) {
                                        html += v;
                                    } else {
                                        if (v.length == 1) {//运算符
                                            html += v;
                                        } else if (v == 'Round' || v == 'RoundUp' || v == 'RoundDown') {
                                            html += v;
                                        } else {
                                            //元素
                                            $.each(FeeBase, function (j, k) {
                                                if (k.Value() == v) {
                                                    html += k.Title();
                                                }
                                            })
                                            $.each(PeriodBase, function (j, k) {
                                                if (k.Value() == v) {
                                                    html += k.Title();
                                                }
                                            })
                                        }
                                    }
                                })
                                tmp.MethodDisplayName(html)
                            }
                        })
                    }
                    viewModel.Json.push(tmp);
                });
                /* 
                 * 针对ie下表单双change事件(Knockout默认表单值更新监控采用了onchange)引起表单无光标问题的替代方案
                 * 这个方案不是最好的，推荐使用subscribe来订阅改变
                 * 在viewModel中添加validControlValue方法，替代 onchange="validControlValue(this)"
                 */
                viewModel.validControlValue = function (o, e) {
                    var TrustMngmtRegxCollection = {
                        int: /^([-]?[1-9]+\d*$|^0)?$/,
                        decimal: /^([-]?[1-9]+\d*(\.{1}\d+){0,1}$|^[-]{1}0\.\d*[1-9]\d*$|^0(\.\d+)?)?$/,
                        date: /^((\d{4})-(\d{2})-(\d{2}))?$/,
                        datetime: /^((\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2}))?$/
                    };
                    var $this = $(e.srcElement),
                        objValue = o.ItemValue(),
                        valids = $this.attr('data-valid');
                    //
                    var cleanvar = e.target.value.replace(new RegExp(',', 'gm'), '')
                    //var temp = FormatNumber.convertNumberN(35, cleanvar, '([1-9]\\d*(\\.\\d{1,5})?|0(\\.\\d{1,5})?)');
                    //o.ItemValue(temp);
                    var temp = FormatNumber.convertNumberN(35, cleanvar, '([1-9]\\d*(\\.\\d{1,5})?|0(\\.\\d{1,5})?)');
                    o.ItemValue(temp);
                    var tararg = $(e.target)
                    var tarargsec = $(e.target).next();
                    var tarargtip = $(e.target).next().children('#fieldtip')
                    //金额大写提示
                    common.tipCHNums(tararg, tarargsec);
                    //common.tipCHNum(tararg, tarargtip, tarargsec);
                    //tararg.blur();
                    //tararg.focus();
                    //
                    //无data-valid属性，不需要验证
                    if (!valids || valids.length < 1) { return true; }
                    //如果有必填要求，必填验证
                    if (valids.indexOf('required') >= 0) {
                        if (!objValue || objValue.length < 1) {
                            $this.addClass('red-border');
                            return false;
                        } else {
                            $this.removeClass('red-border');
                        }
                    }
                    //暂时只考虑data-valid只包含两个值： 必填和类型
                    var dataType = valids.replace('required', '').toLocaleLowerCase().trim();
                    //通过必填验证，做数据类型验证
                    var regx = TrustMngmtRegxCollection[dataType];
                    if (!regx) { return true; }
                    if (!regx.test(objValue)) {
                        $this.addClass('red-border');
                        return false;
                    } else {
                        $this.removeClass('red-border');
                    }
                    return true;
                }
                viewModel.numFormt = function (p) {
                    var number = FormatNumber;
                    if (parseFloat(p()) == p()) {
                        //var a1=p().length;
                        //var a2 = p().lastIndexOf(".");
                        //var len                         
                        //if (a2 != -1 && a1 - a2 > 5) {
                        //     len = p().length - 1;
                        //    return p().substr(0, len);
                        //    return false;
                        //} else {
                        //    return p();
                        //}
                        var res = p().toString().replace(/\d+/, function (n) { // 先提取整数部分
                            return n.replace(/(\d)(?=(\d{3})+$)/g, function ($1) {
                                return $1 + ",";
                            });
                        })
                        p(res);
                        return p();
                    }
                    else
                        return p;
                }
                viewModel.showmoney = function (that) {
                    var target = $(that.currentTarget);
                    var res = gsUtil.getChineseNum($(target).prev().val());
                    $(target).attr("title", res);
                    $(target).tooltip();
                }
                if (callback)
                    callback();
                $(".fee-name").find('.arrow-down').removeClass("arrow-down").addClass("arrow-up")
                $(".fee-name").parents(".block_each_wrap ").addClass("slide")
                $(".fee-name").find('.arrow-down').removeClass("arrow-down").addClass("arrow-up")
                $(".fee-name").next().find(".bg_c_01").hide();
                $(".fee-name").next().find(".bg_c").hide();
                $(".fee-name").next().find('button').hide();
                $(".fee-name").next().find(".eachborder_style").css({ "height": '200px', 'line-height': '30px', 'overflow': 'hidden' })
                $(".fee-name").next().find(".cipianlayer").show();
            })
        });
    }
    function getTrustFee(callback) {
        var executeParam = {
            'SPName': "usp_GetTrustFeeEntity", 'SQLParams': [
                      { 'Name': 'trustId', 'Value': trustId, 'DBType': 'int' }
            ]
        };
        var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";//appDomain=TrustManagement&executeParams=" + context;

        common.ExecuteGetData(true, serviceUrl, 'TrustManagement', executeParam, function (data) {
            if (callback)
                callback(data);
        });
    }
    function getTrustFeeList(callback) {
        var selectDate = $("#dateSelect").val();
        var executeParam = {
            'SPName': "usp_GetTrustFeeById", 'SQLParams': [
                      { 'Name': 'TrustId', 'Value': trustId, 'DBType': 'int' }
            ]
        };
        var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";//appDomain=TrustManagement&executeParams=" + context;

        common.ExecuteGetData(true, serviceUrl, 'TrustManagement', executeParam, function (data) {
            if (callback)
                callback(data);
        });
    }
    var timeStamp2String = function (time) {
        var datetime = new Date();
        datetime.setTime(time);
        var year = datetime.getFullYear();
        var month = datetime.getMonth() + 1 < 10 ? "0" + (datetime.getMonth() + 1) : datetime.getMonth() + 1;
        var date = datetime.getDate() < 10 ? "0" + datetime.getDate() : datetime.getDate();
        return year + "-" + month + "-" + date;
    }
    dateSelectChange = function dateSelectChange() {
        UpdateViewModel(function () {
            reBindingAutoCompleteBox();
        });
    };
    function ValidationFeeList() {
        //addClass('red-border');
        var result = true;
        var selector = 'input[validatetype="autocomplete"]';
        var selectora = 'input[validatetype="autocomplete"] ~ a';
        $(selector).removeClass('red-border-left');
        $(selectora).removeClass('red-border-right');

        var dislayNameList = [];
        var errorList = [];
        $.each(viewModel.Json(), function (i, n) {
            if ($.inArray(n.DisplayName(), dislayNameList) < 0) dislayNameList.push(n.DisplayName());
            else errorList.push(n.DisplayName());
        })

        $.each(errorList, function (i, n) {
            $(selector + '[text="' + n + '"]').addClass('red-border-left');
            $(selector + '[text="' + n + '"] ~ a').addClass('red-border-right');
        });
        $.each($(selector), function (i, n) {
            if ($.inArray($(n).val(), errorList) >= 0) {
                result = false;
                $(n).addClass('red-border-left');
                $(n).find('~ a').addClass('red-border-right');
            }
            if ($.trim($(n).val()) == '') {
                result = false;
                $(n).addClass('red-border-left');
                $(n).find('~ a').addClass('red-border-right');
            }
        })

        return result;
    }
    warnUser = function warnUser(Obj) {
        if (Obj.checked) {
            $(Obj).next().show();
            $(Obj).next().next().show();
        } else {
            $(Obj).next().hide();
            $(Obj).next().next().hide();
        }
    };
    SaveFee = function SaveFee() {
        if (!ValidationFeeList()) { GSDialog.HintWindow('费用名称相同或为空，请检查'); return; }
        var inputControl = $("input.form-control");
        //var inputControlErr = [];
        var flage = true;
        var checked = [];
        var pass = true;
        var errorname = '';
        if (inputControl) {
            flage = false;
        }
        var inputControljudge = true;
        $.each(inputControl, function (i, n) {
            //inputControlErr.push($(n).val());
            var validataItem = $(n).val();
            var NPrentS = $(n).parent().siblings();
            var validataItemCode = (NPrentS.children())[0].innerHTML;
            //&& $(NPrentS.siblings()[0]).children().val() == ""

            if (validataItem == "" && validataItemCode.indexOf("*") > 0) {
                $(this).addClass('red-border');
                /*添加必填字段未填写时,弹窗提示以及隐藏框显示定位*/
                GSDialog.HintWindow("有必填项未填写请检查");
                if ($(this).parents("section").is(":hidden")) {
                    $(this).parents("section").show();
                    $(this).focus();
                } else {
                    $(this).focus();
                }
                inputControljudge = false;
            } else {
                $(this).removeClass('red-border');
            }
        });
        if (flage || inputControljudge) {
            //var selectDate = $("#dateSelect").val();
            //var endDate = $("#dateEndSelect").val();
            var dataModel = ko.mapping.toJS(viewModel);
            var items = '<items>';
            $.each(dataModel.Json, function (n, fee) {
                var feeName = fee.ActionCode;
                $.each(fee.Parameters, function (x, para) {
                    var t;
                    var string = ""
                    if (para.Name.indexOf("CustodyBank_Interest_Fee_InterestEndDay") == -1) {
                        t = para.ItemValue.toString().replace(/,/g, '')
                    } else {
                        if (isNaN(para.ItemValue)) {
                            t = para.ItemValue.toString().replace(/,/g, '')
                        } else {
                            t = -para.ItemValue.toString().replace(/,/g, '')
                        }
                    }
                    //检验公式是否合法
                    //if (para.DataType == "assembly") {
                    //    string = para.ItemValue;
                    //    var objs = {};
                    //    objs.test = testFormula(string);
                    //    objs.name=fee.DisplayName;
                    //    checked.push(objs);
                    //}
                    items += '<item>';
                    items += '<TrustFeeName>' + feeName + '</TrustFeeName>';
                    items += '<TrustFeeDisplayName>' + fee.DisplayName + '</TrustFeeDisplayName>';
                    items += '<ItemCode>' + para.Name + '</ItemCode>';
                    items += '<ItemValue>' + para.ItemValue + '</ItemValue>';
                    items += '</item>';
                })
            })
            items += '</items>';
            //$.each(checked, function (i, v) {
            //    if (v.test == false) {
            //        pass = false;
            //        errorname = v.name;
            //        return false;
            //    }
            //})
            //if (!pass) { GSDialog.HintWindow(errorname + ':  公式输入不合法,请检查'); return false }
            var executeParam = {
                SPName: 'usp_SaveTrustFeeEntity', SQLParams: [
                    { Name: 'TrustId', value: trustId, DBType: 'int' },
                    { Name: 'Items', value: items, DBType: 'xml' },
                ]
            };
            var result = ExecuteRemoteData(executeParam, function (data) {
                if (data == true || data == false) {
                    $.toast({ type: 'success', message: '保存成功' });
                    //GSDialog.HintWindow('保存成功！');
                    /*if (parent.location.href.indexOf('ModelRefreshIndex') > 0) {
                        if (parent.qwFrame) {
                            setTimeout(function () {
                                parent.qwFrame.GotoStep(stepCode);
                            }, 500);
                        }
                    }*/
                } else {
                    GSDialog.HintWindow('数据提交保存时出现错误！');
                }
            });
        };
    }
    function alertMsg(text) {
        var alert_tip = $('#alert-tip');
        if (!alert_tip[0]) {
            var $alert = $('<div id="alert-tip" class="alert_tip am-scale-up"/>');
            var $temp = $('<div class="alert_content">' +
                            '<i class="icon icon-roundcheck am-flip"></i>' +
                            '<p>' + text + '</p>' +
                        '</div>');
            $temp.appendTo($alert);
            $alert.appendTo(document.body);
            setTimeout(function () {
                $('#alert-tip').fadeOut(function () {
                    $(this).remove();
                });
            }, 1500);
        }
    };
    function ExecuteRemoteData(executeParam, callback) {
        //var executeParams = encodeURIComponent(JSON.stringify(executeParam));
        var executeParams = JSON.stringify(executeParam);
        var params = '';
        params += '<root appDomain="TrustManagement" postType="">';// appDomain="TrustManagement"
        params += executeParams;
        params += '</root>';
        var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonPostExecute";

        $.ajax({
            type: "POST",
            url: serviceUrl,
            dataType: "json",
            contentType: "application/xml;charset=utf-8",
            data: params,
            processData: false,
            success: function (response) {
                if (callback)
                    callback(response);
            },
            error: function (response) { alert("error is :" + response); }
        });
    }
    function SortViewModel() {
        viewModel.Hide.sort(function (left, right) {
            return left.SeqNo() == right.SeqNo() ? 0 : (left.SeqNo() < right.SeqNo() ? -1 : 1);
        })
    }
    function RemoveColButtomSHEvent() {
        $("#RemoveColButtomSH", window.parent.document).click(function () {
            var $this = $(this);
            isShowRemove = !isShowRemove;
            //if (isShowRemove == true)
            //    $this.text("隐藏删除按钮");
            //else
            //    $this.text("显示删除按钮");
            RemoveColButtomSH(isShowRemove);
        });
    }
    function RemoveColButtomSH(show) {
        if (show == true)
            $('#RemoveColButtomSH', parent.window.document).text("隐藏删除按钮");
        else
            $('#RemoveColButtomSH', parent.window.document).text("显示删除按钮");
        var sytles = document.CSSStyleSheet ? document.CSSStyleSheet : document.styleSheets;
        $.each(sytles, function (i, sheet) {
            if (sheet.href.indexOf("FeeSettings.css") > -1) {
                var rs = sheet.cssRules ? sheet.cssRules : sheet.rules;
                $.each(rs, function (j, cssRule) {
                    if (cssRule.selectorText && cssRule.selectorText.indexOf(".btn") > -1 && cssRule.selectorText.indexOf(".btn-remove") > -1) {
                        if (show == true) {
                            cssRule.style.display = "inline-block";
                        } else {
                            cssRule.style.display = "none";
                        }
                        return false;
                    }
                });
                return false;
            }
        });
    }
    function ReplaceIndex(str, oldchart, newchart) {
        return str.replace(oldchart, newchart);
    }
    function reBindingAutoCompleteBox(actionTYpeCode) {
        var type = 'select[type="autocomplete"]';
        if (actionTYpeCode) type += '[id^="' + actionTYpeCode + '"]';

        $.each($(type), function (i, n) {
            var actioncode = $(type).attr('id');
            var optionsSource = getFeeSource(actioncode);
            optionsSource = reBindFilter(optionsSource);
            var op = '';
            $.each(optionsSource, function (i, option) {
                if (option)
                    op += '<option value="' + option.ActionCode + '">' + option.DisplayName + '</option>';
            });
            $(n).html(op);
        });
    }
    function reBindFilter(feelist) {
        var had = [];
        $.each(viewModel.Json(), function (i, n) {
            if ($.inArray(n.ActionCode(), had) < 0) had.push(n.ActionCode());
        })

        var result = {};
        for (var fee in feelist) {
            if ($.inArray(fee, had) < 0) result[fee] = feelist[fee];
        }
        return result;
    }
    function destroy(obj, name) {
        var result = {};
        for (var o in obj) {
            if (o != name) result[o] = obj[o];
        }
        return result;
    }
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
    //全选和单选的逻辑
    //全选checkbox;
    $("body").on("click", "#checkall", function () {
        if ($(this)[0].checked) {
            $(".checkeach").prop("checked", true);
            $.each($(".checkeach"), function (i, v) {
            })
        } else {
            $(".checkeach").prop("checked", false);
        }
    })
    $("body").on("click", ".checkeach", function () {
        var arry = $(".checkeach");
        var flage = true;
        $.each(arry, function (i, v) {
            if (v.checked == false) {
                flage = false
            }
        })
        if (flage) {
            $("#checkall").prop("checked", true);
        } else {
            $("#checkall").prop("checked", false);
        }
    })
    //关联至相应期数
    $("#CoveragePeriod").click(function () {
        TheSizeArry = [];
        var arry = $(".checkeach");
        $.each(arry, function (i, v) {
            if (v.checked == true) {
                TheSizeArry.push($(v).attr("dataIndex"));
            }
        })
        if (TheSizeArry.length > 0) {
            $.anyDialog({
                width: 600,
                height: 420,
                title: '全部期数',
                html: $("#dialog_content").clone(true).show(),
                scrolling: false
            })
            $(".EndPer").val($(".EndPer option:last").val())
        } else {
            GSDialog.HintWindow("请勾选要关联的费用")
        }
    })
    //更新费用时间轴
    $("#UpdentaPeriod").click(function () {
        TheSizeArry = [];
        var arry = $(".checkeach");
        $.each(arry, function (i, v) {
            if (v.checked == true) {
                TheSizeArry.push($(v).attr("dataIndex"));
            }
        })
        if (TheSizeArry.length > 0) {
            $.anyDialog({
                width: 600,
                height: 420,
                title: '全部期数',
                html: $("#dialog_contentEX").clone(true).show(),
                scrolling: false
            })
            $(".EndPerEX").val($(".EndPerEX option:last").val())
        } else {
            GSDialog.HintWindow("请勾选要更新的费用")
        }
    })
    //查找期数
    $("body").on("change", ".searchon", function () {
        var filter = $(this).val();
        var arry = $(this).parent().next().find(".eachlis");
        if (filter == "") {
            arry.show();
            return false
        }
        if (filter <= 0 || filter != parseFloat(filter) || filter > arry.length) {
            arry.hide();
            return false
        }
        if (filter != 0 && arry.eq(filter - 1).length > 0) {
            arry.eq(filter - 1).show().siblings().hide();
            return false
        }
    })
    //确认覆盖:关联至指定期数
    $("body").on("click", ".RunTheApplicable", function () {
        var Gart = $(this).parent().next().find(".eachlis input")//勾选的日期组
        var flage = true;
        var Gartxml = "<items>";
        //var relationship = $(this).parent().prev().prev().find(".choiceH").val();
        var serviceUrl = GlobalVariable.DataProcessServiceUrl + "PoastData?";//appDomain=TrustManagement&executeParams=" + context;
        $.each(Gart, function (i, v) {
            if (v.checked == true) {
                Gartxml += "<item>"
                Gartxml += "<TransactionDate>" + $(v).parent().parent().find(".periodSaDate").text().replace(/-/g, "") + "</TransactionDate>"
                Gartxml += "<RelationShip>" + $(v).parent().parent().find(".choiceH").val() + "</RelationShip>"
                Gartxml += "</item>"
                flage = false
            }
        })
        Gartxml += "</items>";
        if (flage) {
            GSDialog.HintWindow("请勾选要关联的期数", "", false)
            return false
        }
        //前面勾选的费用
        var dataModel = ko.mapping.toJS(viewModel);
        var items = '<items>';
        var newArry = [];
        for (var i = 0; i < TheSizeArry.length; i++) {
            newArry.push(dataModel.Json[TheSizeArry[i]])
        }
        $.each(newArry, function (n, fee) {
            var feeName = fee.ActionCode;
            $.each(fee.Parameters, function (x, para) {
                var t;
                if (para.Name.indexOf("CustodyBank_Interest_Fee_InterestEndDay") == -1) {
                    t = para.ItemValue.toString().replace(/,/g, '')
                } else {
                    if (isNaN(para.ItemValue)) {
                        t = para.ItemValue.toString().replace(/,/g, '')
                    } else {
                        t = -para.ItemValue.toString().replace(/,/g, '')
                    }
                }
                items += '<item>';
                items += '<TrustFeeName>' + feeName + '</TrustFeeName>';
                items += '<TrustFeeDisplayName>' + fee.DisplayName + '</TrustFeeDisplayName>';
                items += '<ItemCode>' + para.Name + '</ItemCode>';
                items += '<ItemValue>' + para.ItemValue + '</ItemValue>';
                items += '</item>';
            })
        })
        items += '</items>';
        var executeParam = {
            SPName: 'usp_RelatedTrustFeeBySpecifiedDate', SQLParams: [
                { Name: 'TrustId', value: trustId, DBType: 'int' },
                 { Name: 'TrustTransactionDate ', value: Gartxml, DBType: 'xml' },
                { Name: 'Items', value: items, DBType: 'xml' },
            ]
        };
        common.ExecutePostDataNew(false, serviceUrl, 'TrustManagement', executeParam, function (data) {
            if (JSON.parse(data.PoastDataResult)[0].Result == "1") {
                $.toast({ type: 'success', message: '关联成功' });
                setTimeout(function () {
                    location.reload(true);
                },1000)
                //GSDialog.HintWindow("关联成功", function () {
                //    location.reload(true);
                //})
            } else {
                GSDialog.HintWindow("关联发生错误", "", false)
            }
        });
    })
    //确认覆盖:关联至指定期数EX
    $("body").on("click", ".RunTheApplicableEX", function () {
        var Gart = $(this).parent().next().find(".eachlis input")//勾选的日期组
        var flage = true;
        var Gartxml = "<items>";
        //var relationship = $(this).parent().prev().prev().find(".choiceH").val();
        var serviceUrl = GlobalVariable.DataProcessServiceUrl + "PoastData?";//appDomain=TrustManagement&executeParams=" + context;
        $.each(Gart, function (i, v) {
            if (v.checked == true) {
                Gartxml += "<item>"
                Gartxml += "<TransactionDate>" + $(v).parent().parent().find(".periodSaDate").text().replace(/-/g, "") + "</TransactionDate>"
                Gartxml += "<RelationShip>" + $(v).parent().parent().find(".choiceH").val() + "</RelationShip>"
                Gartxml += "</item>"
                flage = false
            }
        })
        Gartxml += "</items>";
        if (flage) {
            GSDialog.HintWindow("请勾选要更新的期数", "", false)
            return false
        }
        //前面勾选的费用
        var dataModel = ko.mapping.toJS(viewModel);
        var items = '<items>';
        var newArry = [];
        for (var i = 0; i < TheSizeArry.length; i++) {
            newArry.push(dataModel.Json[TheSizeArry[i]])
        }
        $.each(newArry, function (n, fee) {
            var feeName = fee.ActionCode;
            $.each(fee.Parameters, function (x, para) {
                var t;
                if (para.Name.indexOf("CustodyBank_Interest_Fee_InterestEndDay") == -1) {
                    t = para.ItemValue.toString().replace(/,/g, '')
                } else {
                    if (isNaN(para.ItemValue)) {
                        t = para.ItemValue.toString().replace(/,/g, '')
                    } else {
                        t = -para.ItemValue.toString().replace(/,/g, '')
                    }
                }
                items += '<item>';
                items += '<TrustFeeName>' + feeName + '</TrustFeeName>';
                items += '<TrustFeeDisplayName>' + fee.DisplayName + '</TrustFeeDisplayName>';
                items += '<ItemCode>' + para.Name + '</ItemCode>';
                items += '<ItemValue>' + para.ItemValue + '</ItemValue>';
                items += '</item>';
            })
        })
        items += '</items>';
        var executeParam = {
            SPName: 'usp_UpdateTrustFeeTimeLineBySpecifiedDate', SQLParams: [
                { Name: 'TrustId', value: trustId, DBType: 'int' },
                 { Name: 'TrustTransactionDate ', value: Gartxml, DBType: 'xml' },
                { Name: 'Items', value: items, DBType: 'xml' },
            ]
        };
        common.ExecutePostDataNew(false, serviceUrl, 'TrustManagement', executeParam, function (data) {
            if (JSON.parse(data.PoastDataResult)[0].Result == "1") {
                GSDialog.HintWindow("更新成功", function () {
                    location.reload(true);
                })
            } else {
                GSDialog.HintWindow("更新发生错误", "", false)
            }
        });
    })
    //确认覆盖:关联至连续期数
    $("body").on("click", ".RunTheConsecutivePeriods", function () {
        var TrustTransactionDate = $(this).parent().prev().find(".startPer").val()//开始日期
        var TrustTransactionEndDate = $(this).parent().prev().find(".EndPer").val()//截止日期
        var serviceUrl = GlobalVariable.DataProcessServiceUrl + "PoastData?";//appDomain=TrustManagement&executeParams=" + context;
        var dataModel = ko.mapping.toJS(viewModel);
        if (TrustTransactionDate.replace(/-/g, "") > TrustTransactionEndDate.replace(/-/g, "")) {
            GSDialog.HintWindow("开始期数不能大于结束期数", "", false)
            return false;
        }
        var items = '<items>';
        var newArry = [];
        for (var i = 0; i < TheSizeArry.length; i++) {
            newArry.push(dataModel.Json[TheSizeArry[i]])
        }
        $.each(newArry, function (n, fee) {
            var feeName = fee.ActionCode;
            $.each(fee.Parameters, function (x, para) {
                var t;
                if (para.Name.indexOf("CustodyBank_Interest_Fee_InterestEndDay") == -1) {
                    t = para.ItemValue.toString().replace(/,/g, '')
                } else {
                    if (isNaN(para.ItemValue)) {
                        t = para.ItemValue.toString().replace(/,/g, '')
                    } else {
                        t = -para.ItemValue.toString().replace(/,/g, '')
                    }
                }
                items += '<item>';
                items += '<TrustFeeName>' + feeName + '</TrustFeeName>';
                items += '<TrustFeeDisplayName>' + fee.DisplayName + '</TrustFeeDisplayName>';
                items += '<ItemCode>' + para.Name + '</ItemCode>';
                items += '<ItemValue>' + para.ItemValue + '</ItemValue>';
                items += '</item>';
            })
        })
        items += '</items>';
        var executeParam = {
            SPName: 'usp_RelatedTrustFeeByConsecutiveDate', SQLParams: [
                { Name: 'TrustId', value: trustId, DBType: 'int' },
                { Name: 'TrustTransactionDate ', value: TrustTransactionDate, DBType: 'date' },
                { Name: 'TrustTransactionEndDate', value: TrustTransactionEndDate, DBType: 'date' },
                { Name: 'Items', value: items, DBType: 'xml' }
            ]
        };
        common.ExecutePostDataNew(false, serviceUrl, 'TrustManagement', executeParam, function (data) {
            if (JSON.parse(data.PoastDataResult)[0].Result == "1") {
                $.toast({ type: 'success', message: '关联成功' });
                setTimeout(function () {
                    location.reload(true);
                }, 1000)
                //GSDialog.HintWindow("关联成功", function () {
                //    location.reload(true);
                //})
            } else {
                GSDialog.HintWindow("关联发生错误", "", false)
            }
        });
    })
    //确认覆盖:关联至连续期数EX
    $("body").on("click", ".RunTheConsecutivePeriodsEX", function () {
        var TrustTransactionDate = $(this).parent().prev().find(".startPerEX").val()//开始日期
        var TrustTransactionEndDate = $(this).parent().prev().find(".EndPerEX").val()//截止日期
        var serviceUrl = GlobalVariable.DataProcessServiceUrl + "PoastData?";//appDomain=TrustManagement&executeParams=" + context;
        var dataModel = ko.mapping.toJS(viewModel);
        if (TrustTransactionDate.replace(/-/g, "") > TrustTransactionEndDate.replace(/-/g, "")) {
            GSDialog.HintWindow("开始期数不能大于结束期数", "", false)
            return false;
        }
        var items = '<items>';
        var newArry = [];
        for (var i = 0; i < TheSizeArry.length; i++) {
            newArry.push(dataModel.Json[TheSizeArry[i]])
        }
        $.each(newArry, function (n, fee) {
            var feeName = fee.ActionCode;
            $.each(fee.Parameters, function (x, para) {
                var t;
                if (para.Name.indexOf("CustodyBank_Interest_Fee_InterestEndDay") == -1) {
                    t = para.ItemValue.toString().replace(/,/g, '')
                } else {
                    if (isNaN(para.ItemValue)) {
                        t = para.ItemValue.toString().replace(/,/g, '')
                    } else {
                        t = -para.ItemValue.toString().replace(/,/g, '')
                    }
                }
                items += '<item>';
                items += '<TrustFeeName>' + feeName + '</TrustFeeName>';
                items += '<TrustFeeDisplayName>' + fee.DisplayName + '</TrustFeeDisplayName>';
                items += '<ItemCode>' + para.Name + '</ItemCode>';
                items += '<ItemValue>' + para.ItemValue + '</ItemValue>';
                items += '</item>';
            })
        })
        items += '</items>';
        var executeParam = {
            SPName: 'usp_UpdateTrustFeeTimeLineByConsecutiveDate', SQLParams: [
                { Name: 'TrustId', value: trustId, DBType: 'int' },
                { Name: 'TrustTransactionDate ', value: TrustTransactionDate, DBType: 'date' },
                { Name: 'TrustTransactionEndDate', value: TrustTransactionEndDate, DBType: 'date' },
                { Name: 'Items', value: items, DBType: 'xml' }
            ]
        };
        common.ExecutePostDataNew(false, serviceUrl, 'TrustManagement', executeParam, function (data) {
            if (JSON.parse(data.PoastDataResult)[0].Result == "1") {
                GSDialog.HintWindow("更新成功", function () {
                    location.reload(true);
                })
            } else {
                GSDialog.HintWindow("更新发生错误", "", false)
            }
        });
    })
    //tab切换,公式类型转换
    $("body").on("click", ".changetabs li", function () {
        $(this).removeClass("active").addClass("active").siblings().removeClass("active");
        if ($(this).val() == "1") {
            $(this).parents(".changeTab").find(".FeeBase").show();
            $(this).parents(".changeTab").find(".PeriodBase").hide();
        } else {
            $(this).parents(".changeTab").find(".FeeBase").hide();
            $(this).parents(".changeTab").find(".PeriodBase").show();
        }
    })
    //tab切换,转换关联期数方式
    $(".tabchange").on("click", ".liC", function () {
        $(this).removeClass("activeli").addClass("activeli").siblings().removeClass("activeli");
        if ($(this).val() == "1") {
            $(this).parents(".tabchange").next().hide();
            $(this).parents(".tabchange").next().next().show();
        } else {
            $(this).parents(".tabchange").next().show();
            $(this).parents(".tabchange").next().next().hide();
        }
    })
    //tab切换,转换关联期数方式EX
    $(".tabchangeEX").on("click", ".liC", function () {
        $(this).removeClass("activeli").addClass("activeli").siblings().removeClass("activeli");
        if ($(this).val() == "1") {
            $(this).parents(".tabchangeEX").next().hide();
            $(this).parents(".tabchangeEX").next().next().show();
        } else {
            $(this).parents(".tabchangeEX").next().show();
            $(this).parents(".tabchangeEX").next().next().hide();
        }
    })
    //固定表头
    $("#AuditTimeline").scroll(function (e) {
        var scrollTop = this.scrollTop;
        $("#AuditTimeline>.table").find("thead").attr("style", "transform: translateY(" + scrollTop + "px);background: #dedede;")
    })
    $(".periodSa").scroll(function (e) {
        var scrollTop = this.scrollTop;
        $(".periodSa>.table").find("thead").attr("style", "transform: translateY(" + scrollTop + "px);background: #dedede;")
    })
    function alertMsg(text) {
        var alert_tip = $('#alert-tip');
        if (!alert_tip[0]) {
            var $alert = $('<div id="alert-tip" class="alert_tip am-scale-up"/>');
            var $temp = $('<div class="alert_content">' +
                            '<i class="icon icon-roundcheck am-flip"></i>' +
                            '<p>' + text + '</p>' +
                        '</div>');
            $temp.appendTo($alert);
            $alert.appendTo(document.body);
            setTimeout(function () {
                $('#alert-tip').fadeOut(function () {
                    $(this).remove();
                });
            }, 1500);
        }
    }
    //窗口大小,高度值函数处理
    $("body").on("click", "#modal-win", function () {
        if ($(this).hasClass("icon-window-restore")) {//放大
            $(".Sapplicable").css("height", "calc(100% - 90px)");
            $(".ConsecutivePeriods").css("height", "calc(100% - 90px)");
            $(".SapplicableEX").css("height", "calc(100% - 90px)");
            $(".ConsecutivePeriodsEX").css("height", "calc(100% - 90px)");
        } else {//缩小
            $(".Sapplicable").css("height", "calc(100% - 50px)");
            $(".ConsecutivePeriods").css("height", "calc(100% - 50px)");
            $(".SapplicableEX").css("height", "calc(100% - 50px)");
            $(".ConsecutivePeriodsEX").css("height", "calc(100% - 50px)");
        }
    })
});
