
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
var returnName;
var isDebug;
var dateSelectChange;
var warnUser;
var SaveFee;
var ReturnCaName;
var samename;
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
    var gsUtil = require('gsUtil');
    var stepCode = 'fee';
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
                        html += '<div id="field1" class="field-details" style="display:inline-block;"><i class="icon icon-asset" style="display: block;color:#4174cb;"></i><div id="fieldtip" class="field-detail-box" style="width:100px;font-size:12px;"></div></div>'
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
                        html += '<div id="field1" class="field-details" style="display:inline-block;"><i class="icon icon-asset" style="display: block;color:#4174cb;"></i><div id="fieldtip" class="field-detail-box" style="width:100px;font-size:12px;"></div></div>'
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
                        html += '<div id="field1" class="field-details" style="display:inline-block;"><i class="icon icon-asset" style="margin-top: 2px;display: block;color:#4174cb;"></i><div id="fieldtip" class="field-detail-box" style="width:100px;font-size:12px;"></div></div>'
                    }
                    $(html).appendTo($(element));
                    $('.date-plugins').date_input();
                    break;

                case 'datetime':
                    if (sign) {
                        html += '<input style="width: 100%; font-size:14px;overflow: hidden;" type="text" class="form-control date-plugins" onchange="validControlValue(this)"';
                        html += ' data-valid="' + dataType + isRequired + '" />';
                        html += '<div id="field1" class="field-details" style="display:inline-block;"><i class="icon icon-asset" style="margin-top: 2px;display: block;color:#4174cb;"></i><div id="fieldtip" class="field-detail-box" style="width:100px;font-size:12px;"></div></div>'
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
                        html += '<div id="field1" class="field-details" style="display:inline-block;cursor:pointer;" data-toggle="tooltip" data-placement="bottom" title="产品兑付日的区间需要包含保管银行利息的结算区间"><i class="icon icon-help" style="margin-top: 4px;display: block;color:#4174cb;margin-left:8px;"></i></div>'
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
                        html += '<div id="field1" class="field-details" style="display:inline-block;"><i class="icon icon-asset" style="margin-top: 2px;display: block;color:#4174cb;"></i><div id="fieldtip" class="field-detail-box" style="width:100px;font-size:12px;"></div></div>'
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
                        html += '<div id="field1" class="field-details" style="display:inline-block;cursor:pointer;" data-toggle="tooltip" data-placement="bottom"  data-bind="event:{mouseover:$root.showmoney(event)}"><i class="icon icon-asset" style="display: block;color:#4174cb;"></i></div>'
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
                    html+='<span class="col-font">' + viewModel.ItemValue() + '</span>';
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
        console.log(name)
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
                item = ko.mapping.fromJS(item);
                //var isInGroup = false;
                //if (viewModel.Group().length == 0) {
                //    var _tempGroup = {}
                //    _tempGroup.Json = [];
                //    _tempGroup.GroupCode = actiontypecode;
                //    _tempGroup.GroupName = tempDisplayName;
                //    _tempGroup.Json.push(item)
                //    _tempGroup = ko.mapping.fromJS(_tempGroup);
                //    viewModel.Group.push(_tempGroup);
                //}
                //else if (viewModel.Group().length > 0) {
                //    $.each(viewModel.Group(), function (index, groupItem) {
                //        if (groupItem.GroupCode() == actiontypecode) {
                //            groupItem.Json.push(item);
                //            isInGroup = true;
                //            //先隐藏
                //            $(".fee-name").eq(index).next().find(".cipianlayer:last").hide();
                //            //再展开
                //            $(".fee-name").eq(index).parents(".block_each_wrap ").removeClass("slide")
                //            $(".fee-name").eq(index).find('.arrow-up').removeClass("arrow-up").addClass("arrow-down");
                //            $(".fee-name").eq(index).next().find(".bg_c_01").show();
                //            $(".fee-name").eq(index).next().find(".bg_c").show();
                //            $(".fee-name").eq(index).next().find('button').show();
                //            $(".fee-name").eq(index).next().find(".eachborder_style").css({ "height": 'auto', 'line-height': '19.5px', 'overflow': 'auto' })
                //            $(".fee-name").eq(index).next().find(".cipianlayer").hide();
                //            $('#addShowColumn').removeAttr("title")
                //            var timer = null
                //            var index = index;
                //            clearTimeout(timer);
                //            timer = setTimeout(function () {
                //                var top = $(".fee-name").eq(index)[0].offsetTop;
                //                var t = top - 100 > 0 ? top - 100 : 0
                //                $('html').animate({ scrollTop: t }, 500, 'easeOutQuart')
                //            }, 300)
                //            return false
                //        }

                //    })
                //    if (!isInGroup) {
                //        var _tempGroup = {}
                //        _tempGroup.Json = [];
                //        _tempGroup.GroupCode = actiontypecode;
                //        _tempGroup.GroupName = tempDisplayName;
                //        _tempGroup.Json.push(item)
                //        _tempGroup = ko.mapping.fromJS(_tempGroup);
                //        viewModel.Group.push(_tempGroup);
                //        $(".fee-name:last").parents(".block_each_wrap ").removeClass("slide")
                //        $(".fee-name:last").next().find(".cipianlayer").hide();
                //        var timer = null
                //        var index = index;
                //        clearTimeout(timer);
                //        timer = setTimeout(function () {
                //            var top = $(".fee-name:last")[0].offsetTop;
                //            var t = top - 100 > 0 ? top - 100 : 0
                //            $('html').animate({ scrollTop: t }, 500, 'easeOutQuart')
                //        }, 300)
                //        $('#addShowColumn').removeAttr("title")
                //    }

                //} 原逻辑
                viewModel.Json.push(item);
                $('#addShowColumn').removeAttr("title");
                $(".block_each_wrap:last").find(".icon.icon-edit").trigger("click");
                $(".eidtbox:last").find("button").text("保存");
                reBindingAutoCompleteBox(actiontypecode);

            }
        });


        $(document).on('click', '#removeShowColumn', function () {

            //var dataindex = $(this).attr("dataIndex");

            //if ($(this).parents(".fee-name").length > 0) {
            //    var _item = viewModel.Group()[dataindex];
            //    viewModel.Group.remove(_item);

            //} else {
            //    var parentIndex = $(this).parents(".block_each").attr('feeGroupIndex');
            //    if (viewModel.Group()[parentIndex].Json().length > parseInt(dataindex)) {
            //        var item = viewModel.Group()[parentIndex].Json()[dataindex];

            //        var actiontypecode = item.ActionCode().substr(0, item.ActionCode().lastIndexOf('_'));
            //        var actiontypeindex = item.ActionCode().substr(item.ActionCode().lastIndexOf('_') + 1);
            //        var initactionindexmax = parseInt(feeTypeListModel[actiontypecode]['initactionindex']);
            //        if (parseInt(actiontypeindex) > parseInt(initactionindexmax)) {
            //            var actionindexmax = parseInt(feeTypeListModel[actiontypecode]['actionindex']);
            //            if (actiontypeindex == actionindexmax)
            //                feeTypeListModel[actiontypecode]['actionindex'] = parseInt(actiontypeindex) - 1;
            //            feeTypeListModel[actiontypecode]['FeeList'] = destroy(feeTypeListModel[actiontypecode]['FeeList'], item.ActionCode());
            //            feeTypeDisplayListModel = destroy(feeTypeDisplayListModel, item.DisplayName());
            //        }
            //        viewModel.Group()[parentIndex].Json.remove(item);
            //        if (viewModel.Group()[parentIndex].Json().length == 0) {
            //            viewModel.Group.remove(viewModel.Group()[parentIndex]);
            //        }
            //        //reBindingAutoCompleteBox(actiontypecode);
            //    }
            //}  原逻辑
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
        $(document).on('click', '.icon.icon-edit', function () {
            var dataindex = $(this).attr("dataIndex");
            //box show
            var title = $(this).val();
            $(".titlestyle>span").text(title)
            $(".eidtbox:last").find("button").text("更新");
            $(".ant-drawer-mask").addClass("open");
            $(".ant-drawer-content-wrapper").css("height", "410px");
            $(".eidtbox").eq(dataindex).show().siblings().hide();
            return false;
        })
        //日历
        $(document).on('click', '.icon.icon-calendar', function () {
            var dataindex = $(this).attr("dataIndex");
            var name = $(this).parent().prev().text();
            var cod = viewModel.Json()[dataindex].ActionCode();
            var tid = common.getQueryString('tid');
            var page = location.protocol + '//' + location.host + '/GoldenStandABS/www/components/viewDateSet/DateCalendar.html?tid=' + trustId + "&name=" + cod + "&enter=FeeSetting" + "&title=" + name;
            var tabName = name + "-日历预览模式" + "_" + trustId;
            var pass=true
            parent.parent.viewModel.tabs().forEach(function (v, i) {
                if (v.id == trustId) {
                    pass = false;
                    parent.parent.viewModel.changeShowId(v);
                    return false;
                }
            })
            if (pass) {
                //parent.viewModel.showId(trustId);
                var newTab = {
                    id: trustId,
                    url: page,
                    name: tabName,
                    disabledClose: false
                };
                parent.parent.viewModel.tabs.push(newTab);
                parent.parent.viewModel.changeShowId(newTab);
            };
            return false;
        })
        //关闭隐藏盒子
        $(document).on('click', '#closebox', function () {
            //box hide
            if ($(this).parent().next().find(".eidtbox:last-child").find("#UpDate").text()=="保存"){
                $(".block_each_wrap:last").find(".icon.icon-remove").trigger("click");
            }
            $(".ant-drawer-mask").removeClass("open");
            $(".ant-drawer-content-wrapper").css("height", "0px");
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
            var opp=[]
            $.each(viewModel.Json(), function (i, v) {
                opp.push(v.DisplayName())
            })
            var flag = isRepeat(opp);
            if (flag) {GSDialog.HintWindow('该费用名称已存在'); return}
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
                console.log(arry.length);
                var bob=[]
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
                
                $(".ant-drawer-mask").removeClass("open");
                $(".ant-drawer-content-wrapper").css("height", "0px");
                var top = $(".block_each_wrap:last")[0].offsetTop;
                var t = top - 100 > 0 ? top - 100 : 0
                $('html').animate({ scrollTop: t }, 300, 'easeOutQuart');

                //
                if ($("#flexbtn").text() == "全部收缩") {
                    $(".fee-name").parents(".block_each_wrap ").addClass("slides")
                    $(".fee-name").next().show(30)
                } else if ($("#flexbtn").text() == "全部展开") {
                    $(".fee-name").parents(".block_each_wrap ").removeClass("slides")
                    $(".fee-name").next().hide(30)
                }
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
    function flexBox() {
        $("body").on("click", ".fee-name", function () {
            var that=this
            if (!$(this).parents(".block_each_wrap ").hasClass("slide")) {
                $(this).parents(".block_each_wrap ").addClass("slide")
                $(this).find('.arrow-down').removeClass("arrow-down").addClass("arrow-up")
                $(this).next().find(".bg_c_01").hide();
                $(this).next().find(".bg_c").hide();
                $(this).next().find('button').hide();
                $(this).next().find(".eachborder_style").css({"height":'200px','line-height':'30px','overflow':'hidden'})
                $(this).next().find(".cipianlayer").show();
                
            } else {
                $(this).parents(".block_each_wrap ").removeClass("slide")
                $(this).find('.arrow-up').removeClass("arrow-up").addClass("arrow-down")
                $(this).next().find(".bg_c_01").show();
                $(this).next().find(".bg_c").show();
                $(this).next().find('button').show();
                $(this).next().find(".eachborder_style").css({ "height": 'auto', 'line-height': '19.5px', 'overflow': 'auto' })
                $(this).next().find(".cipianlayer").hide();
                var timer = null
                clearTimeout(timer);
                timer = setTimeout(function () {
                    var top = $(that)[0].offsetTop;
                    var t = top - 100 > 0 ? top - 100 : 0
                    $('html').animate({ scrollTop: t }, 500, 'easeOutQuart')
                },300)
            }
            //$(this).next().find(".bg_c_01")(function () {
            //});
            //$(this).find('.arrow-down,.arrow-up').toggleClass("arrow-up arrow-down")

        })
    }
    //全部收缩和全部展开功能
    function flexbtn() {
        $("#flexbtn").click(function () {
            if ($(this).text() == "全部收缩") {
                $(this).text("全部展开")
                $(".fee-name").parents(".block_each_wrap ").addClass("slides")
                $(".fee-name").next().hide(30)
            } else if ($(this).text() == "全部展开") {
                $(this).text("全部收缩");
                $(".fee-name").parents(".block_each_wrap ").removeClass("slides")
                $(".fee-name").next().show(30)
            }
        })
    }
    flexbtn();
    $("body").on("click", "strong", function () {
        if ($(this).parents(".block_each_wrap ").hasClass("slides")) {
            $(this).parents(".block_each_wrap ").removeClass("slides");
            $(this).parent().next().show(30)
        } else {
            $(this).parents(".block_each_wrap ").addClass("slides")
            $(this).parent().next().hide(30)
        }
    })
    function getPeriodsDates() {
        var executeParam = {
            'SPName': "usp_GetTrustTransactionInputFilterMetaData", 'SQLParams': [
                { 'Name': 'TrustId', 'Value': trustId, 'DBType': 'int' }
            ]
        };

        var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";//appDomain=TrustManagement&executeParams=" + context;

        var response = common.ExecuteGetData(false, serviceUrl, 'TrustManagement', executeParam);

        if (typeof response == "string")
            response = jQuery.parseJSON(response);

        $.each(response, function (n, res) {
            $("#dateSelect").append(("<option value='{0}'>{1}</option>").StringFormat(res.OptionValue, res.OptionText));
        });

        $.each(response, function (n, res) {
            $("#dateEndSelect").append(("<option value='{0}'>{1}</option>").StringFormat(res.OptionValue, res.OptionText));
            if (n == response.length - 1) {
                $("#dateEndSelect").val(res.OptionValue)
            }
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
        //TODO YANGYINGYONG
//        var filePath = "E:\\TSSWCFServices\\TrustManagementService\\UITaskStudio\\Models\\" + response + "\\CashFlowFeeModel.Xml";
        var filePath="yangyingyong";
        var serviceUrl = GlobalVariable.DataProcessServiceUrl + "/GetFeesFromXMLFile?FilePath=" + filePath;
        $.ajax({
            url: serviceUrl,
            type: "GET",
            contentType: "application/json; charset=utf-8",
            dataType: "jsonp",
            crossDomain: true,
            success: function (response) {
                var jsonSource = jQuery.parseJSON(response);
                PageSettings.DataSources = jsonSource.DataSources;
                jsonSource.Hide = jsonSource.Json;
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
                //jsonSource.Group = [];
                // end
                var node = document.getElementById("rootNode");
                viewModel = ko.mapping.fromJS(jsonSource);
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
            console.log(_dataList);
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
                    var tmp = ko.mapping.fromJS(fee.item);

                    tmp.ActionCode(ReplaceIndex(tmp.ActionCode(), '#Id#', actiontypeindex));
                    tmp.DisplayName(item.DisplayName ? item.DisplayName : tmp.DisplayName());
                    $.each(tmp.Parameters(), function (i, n) {
                        n.Name(ReplaceIndex(n.Name(), '#Id#', actiontypeindex));
                        n.ItemValue(item.Parameters[n.Name()] ? item.Parameters[n.Name()] : '');
                    });

                    //if (!dataGroup.GroupCode) {

                    //    dataGroup.GroupCode = actiontypecode;
                    //    dataGroup.GroupName = feeTypeListModel[dataGroup.GroupCode].item.DisplayName;
                    //    dataGroup.Json.push(ko.toJS(tmp))
                    //    tmpGroup = ko.mapping.fromJS(dataGroup);
                    //    viewModel.Group.push(tmpGroup);

                    //}
                    //else if (dataGroup.GroupCode && dataGroup.GroupCode == actiontypecode) {
                    //    $.each(viewModel.Group(), function (index, groupItem) {
                    //        if (groupItem.GroupCode() == actiontypecode) {
                    //            groupItem.Json.push(tmp)
                    //            return false;
                    //        }
                    //    })

                    //}
                    //else if (dataGroup.GroupCode && dataGroup.GroupCode != actiontypecode) {

                    //    Group = {};
                    //    dataGroup.Json = [];
                    //    dataGroup.GroupCode = actiontypecode;
                    //    dataGroup.GroupName = feeTypeListModel[dataGroup.GroupCode].item.DisplayName;
                    //    dataGroup.Json.push(ko.toJS(tmp))
                    //    tmpGroup = ko.mapping.fromJS(dataGroup);
                    //    viewModel.Group.push(tmpGroup);
                    //}

                    //viewModel.Json.group = [];
                    //console.log(item.ActionCode)     
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
                    console.log($(e.target));
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
        var selectDate = $("#dateSelect").val();
        var executeParam = {
            'SPName': "usp_GetTrustFee", 'SQLParams': [
                      { 'Name': 'TrustId', 'Value': trustId, 'DBType': 'int' }
                    , { 'Name': 'TransactionDate', 'Value': selectDate, 'DBType': 'string' }
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
            var selectDate = $("#dateSelect").val();
            var endDate = $("#dateEndSelect").val();
            var isApplyAfter = $('#IsApplyAfter')[0].checked;
            var dataModel = ko.mapping.toJS(viewModel);
            var items = '<items>';
            if (isApplyAfter) {
                var returnBoolValue;
                if (endDate.replace(/-/g, "") < selectDate.replace(/-/g, "")) {
                    GSDialog.HintWindow("覆盖日不能小于兑付日");
                    return false;
                }
                GSDialog.HintWindowTF("确认向后覆盖将会使本期之后的费用设置与当期一致，请慎重选择！");
                $("#modal-mask").find("a:first").click(function () {
                    //$.each(dataModel.Group, function (n, group) {
                    //    $.each(group.Json, function (n, fee) {
                    //        $.each(fee.Parameters, function (x, para) {
                    //            var t;
                    //            if (para.Name.indexOf("CustodyBank_Interest_Fee_InterestEndDay") == -1) {
                    //                t = para.ItemValue.toString().replace(/,/g, '')
                    //            } else {
                    //                if (isNaN(para.ItemValue)) {
                    //                    t = para.ItemValue.toString().replace(/,/g, '')
                    //                } else {
                    //                    t = -para.ItemValue.toString().replace(/,/g, '')
                    //                }

                    //            }
                    //            items += '<item>';
                    //            items += '<TrustFeeName>' + fee.ActionCode + '</TrustFeeName>';
                    //            items += '<TrustFeeDisplayName>' + fee.DisplayName + '</TrustFeeDisplayName>';
                    //            items += '<ItemCode>' + para.Name + '</ItemCode>';
                    //            items += '<ItemValue>' + t + '</ItemValue>';
                    //            items += '</item>';
                    //        })
                    //    });

                    //})
                    //
                    $.each(dataModel.Json, function (n, fee) {
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
                    //
                    items += '</items>';
                    var executeParam = {
                        SPName: 'usp_SaveTrustFee', SQLParams: [
                            { Name: 'TrustId', value: trustId, DBType: 'int' },
                            { Name: 'TrustTransactionDate', value: selectDate, DBType: 'date' },
                            { Name: 'Items', value: items, DBType: 'xml' },
                            { Name: 'TrustTransactionEndDate', value: endDate, DBType: 'date' },
                            { Name: 'IsApplyAfter', value: isApplyAfter, DBType: 'bool' }
                        ]
                    };
                    var result = ExecuteRemoteData(executeParam, function (data) {
                        if (data == true || data == false) {//result = cmd.ExecuteNonQuery() > 0;所以，这里不报错就OK
                            var description = "专项计划：" + trustId + "，在产品维护向导功能下，对费用信息进行了更新操作"
                            var category = "产品管理";
                            ActLogs.insertActlogs(false, userName, '更新', category, description, ip, '', '');

                            GSDialog.HintWindow('保存成功！');
                            //UpdateViewModel(function () {
                            //    reBindingAutoCompleteBox();
                            //});
                            if (parent.location.href.indexOf('ModelRefreshIndex') > 0) {
                                if (parent.qwFrame) {
                                    setTimeout(function () {
                                        parent.qwFrame.GotoStep(stepCode);
                                    }, 500);
                                }
                            }
                        } else {
                            GSDialog.HintWindow('数据提交保存时出现错误！');
                        }
                    });
                });
                $("#modal-mask").find("a:last").click(function () {
                    return false;
                })
            }
            if ((!isApplyAfter)) {
                //$.each(dataModel.Json, function (n, fee) {
                //    var feeName = fee.ActionCode;
                //    $.each(fee.Parameters, function (x, para) {
                //        items += '<item>';
                //        items += '<TrustFeeName>' + feeName + '</TrustFeeName>';
                //        items += '<TrustFeeDisplayName>' + fee.DisplayName + '</TrustFeeDisplayName>';
                //        items += '<ItemCode>' + para.Name + '</ItemCode>';
                //        items += '<ItemValue>' + para.ItemValue.replace(',', '') + '</ItemValue>';
                //        items += '</item>';
                //    })
                //})

                //$.each(dataModel.Group, function (n, group) {
                //    $.each(group.Json, function (n, fee) {
                //        $.each(fee.Parameters, function (x, para) {
                //            var t;
                //            if (para.Name.indexOf("CustodyBank_Interest_Fee_InterestEndDay") == -1) {
                //                t = para.ItemValue.toString().replace(/,/g, '')
                //            } else {
                //                if (isNaN(para.ItemValue)) {
                //                    t = para.ItemValue.toString().replace(/,/g, '')
                //                } else {
                //                    t = -para.ItemValue.toString().replace(/,/g, '')
                //                }

                //            }
                //            items += '<item>';
                //            items += '<TrustFeeName>' + fee.ActionCode + '</TrustFeeName>';
                //            items += '<TrustFeeDisplayName>' + fee.DisplayName + '</TrustFeeDisplayName>';
                //            items += '<ItemCode>' + para.Name + '</ItemCode>';
                //            items += '<ItemValue>' + t + '</ItemValue>';
                //            items += '</item>';
                //        })
                //    });

                //})
                $.each(dataModel.Json, function (n, fee) {
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
                    SPName: 'usp_SaveTrustFee', SQLParams: [
                        { Name: 'TrustId', value: trustId, DBType: 'int' },
                        { Name: 'TrustTransactionDate', value: selectDate, DBType: 'date' },
                        { Name: 'Items', value: items, DBType: 'xml' },
                        { Name: 'TrustTransactionEndDate', value: endDate, DBType: 'date' },
                        { Name: 'IsApplyAfter', value: isApplyAfter, DBType: 'bool' }
                    ]
                };
                var result = ExecuteRemoteData(executeParam, function (data) {
                    if (data == true || data == false) {//result = cmd.ExecuteNonQuery() > 0;所以，这里不报错就OK
                        GSDialog.HintWindow('保存成功！');
                        //UpdateViewModel(function () {
                        //    reBindingAutoCompleteBox();
                        //});
                        if (parent.location.href.indexOf('ModelRefreshIndex') > 0) {
                            if (parent.qwFrame) {
                                setTimeout(function () {
                                    parent.qwFrame.GotoStep(stepCode);
                                }, 500);
                            }
                        }
                    } else {
                        GSDialog.HintWindow('数据提交保存时出现错误！');
                    }
                });
            }
        }
    };
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


});