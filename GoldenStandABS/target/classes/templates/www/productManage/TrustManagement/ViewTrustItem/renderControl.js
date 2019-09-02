

var viewTrustWizard = null;

require(['app/productManage/TrustManagement/ViewTrustItem/viewTrustWizard'], function (trustWizard) {

    viewTrustWizard = trustWizard;
});


define(function (require) {

    var $ = require('jquery');
    var ko = require('knockout');
    require('knockout.validation.min');
    var kendoGrid = require('kendo.all.min');
    var common = require('common');
    var GlobalVariable = require('globalVariable');
    PoolCutCommon = require('app/basicAsset/js/PoolCutCommon_interface');
    require("ischeck");
    require("kendomessagescn");
    require("kendoculturezhCN");

    ko.bindingHandlers.renderControl = {

        init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            var dataType = viewModel.DataType().toLocaleLowerCase();
            var currentValue = viewModel.ItemValue();
            var isRequired = (viewModel.IsCompulsory() == 'True') ? ' Required' : '';

            var html = '';

            switch (dataType) {
                case 'double':
                case 'float':
                case 'decimal':
                    html += '<input type="text" class="form-control" data-bind="value:ItemValue" onchange="validControlValue(this)" onkeyup="common.MoveNumFormt(this)"';
                    html += ' data-valid="' + dataType + isRequired + '" />';
                    $(html).appendTo($(element));
                    break;

                case 'int':
                    html += '<input type="text" class="form-control" data-bind="value:ItemValue" onchange="validControlValue(this)"';
                    html += ' data-valid="' + dataType + isRequired + '" />';
                    $(html).appendTo($(element));
                    break;

                case 'date':
                    html += '<input type="text" class="form-control date-plugins" data-bind="value:ItemValue" onfocus="inputNull(this)" onchange=' + 'validControlValue(this,"' + dataType + '")';
                    html += ' data-valid="' + dataType + isRequired + '" />';
                    $(html).appendTo($(element));
                    break;

                case 'datetime':
                    html += '<input type="text" class="form-control date-plugins" data-bind="value:ItemValue" onfocus="inputNull(this)" onchange="validControlValue(this)"';
                    html += ' data-valid="' + dataType + isRequired + '" />';
                    $(html).appendTo($(element));
                    break;

                case 'bool':
                    if (typeof currentValue == "string") {
                        var c = (currentValue == "1" || currentValue.toLocaleLowerCase() == "true");
                        viewModel.ItemValue(c);
                    }
                    var $html = $('<input type="checkbox" data-bind="checked:ItemValue" id = "loop"/>');
                    currentValue ? $html.prop("checked", true) : $html.prop("checked", false);
                    $($html).appendTo($(element));
                    $($html).iCheck({
                        checkboxClass: 'icheckbox_square-blue checkbox-position'
                    });
                    $(element).find("[type='checkbox']").click(function () {
                        var a = $(element).find("[type='checkbox']").attr("checked");
                        if (a == "checked") {
                            viewModel.ItemValue("True");
                        }
                        else {
                            viewModel.ItemValue("False");
                        }
                    });
                    break;
                case 'select':
                    var itemCode = viewModel.ItemCode();
                    if (itemCode == 'OrganisationName') {
                        if (viewTrustWizard != null) {
                            var optionsSource = viewTrustWizard.getOrganisationSource();
                            if (optionsSource == null) {
                                html = '<select class="form-control" ></select>';
                            } else {
                                var op = "";
                                $.each(optionsSource, function (i, option) {
                                    op = op + '<option value="' + option.OrganisationCode + '">' + option.OrganisationDesc  + '</option>';
                                });
                                var id = allBindings.get('id');
                                if (id == null) {
                                    html = '<select class="form-control" data-bind="value: ItemValue">' + op + '</select>';
                                } else {
                                    html = '<select id=' + id + itemCode + ' class="form-control" data-bind="value: ItemValue">' + op + '</select>';
                                }
                            }
                            $(html).appendTo($(element));
                        }
                    }
                    else {
                        if (viewTrustWizard != null) {
                            var optionsSource = viewTrustWizard.getOptionsSource(itemCode);
                            if (optionsSource == null) {
                                html = '<select class="form-control" ></select>';
                            } else {
                                var op = "";
                                $.each(optionsSource, function (i, option) {
                                    op = op + '<option value="' + option.ValueShort + '">' + option.Value + '</option>';
                                });
                                var id = allBindings.get('id');
                                if (id == null) {
                                    html = '<select class="form-control" data-bind="value: ItemValue">' + op + '</select>';
                                } else {
                                    html = '<select id=' + id + itemCode + ' class="form-control" data-bind="value: ItemValue">' + op + '</select>';
                                }
                            }
                            $(html).appendTo($(element));
                        }
                    }
                    break;

                case 'list':
                    var itemCode = viewModel.ItemCode();
                    var listid = itemCode + "_IdList";
                    html += '<input type="text" list="' + listid + '" class="form-control" data-bind="value: ItemValue" onchange="validControlValue(this)"';
                    html += ' data-valid="' + isRequired + '" />';
                    $(html).appendTo($(element));
                    var idList = getIdList(itemCode);
                    if (idList == null) {
                        html = '<datalist id="' + listid + '"></datalist>';
                    } else {
                        var op = "";
                        $.each(idList, function (i, option) {
                            op = op + '<option value="' + option.Value + '"></option>';
                        });
                        html = '<datalist id="' + listid + '">' + op + '</datalist>';
                    }
                    $(html).appendTo($(element));
                    break;
                case 'text':
                    html += '<span data-bind="text: ItemValue"></span>';
                    $(html).appendTo($(element));
                    break;

                default:
                    html += '<input type="text" class="form-control" data-bind="value: ItemValue" onchange="validControlValue(this)" ';
                    html += ' data-valid="' + isRequired + '" />';
                    $(html).appendTo($(element));
                    break;
            }
        }
    };
    return ko.bindingHandlers.renderControl;
});
