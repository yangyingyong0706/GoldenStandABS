/// <reference path="App.Global.js" />
/// <reference path="knockout-3.4.0.js" />
/// <reference path="knockout.mapping-latest.js" />
/// <reference path="common.js" />
//document.write('<script src="../../Scripts/format.number.js"></script>');

define(['App.Global', 'common', 'knockout'], function (appGlobal, common, ko) {
    var GlobalVariable = appGlobal.GlobalVariable;
    var set = common.getLanguageSet();
    var self = this;
    self.validControlValue = function (obj) {
        common.validControlValue(obj);
    }

    ko.bindingHandlers.renderControl = {
        init: function (element, valueAccessor, allBindings, viewModel) {

            var dataType = viewModel.DataType().toLocaleLowerCase();
            var setName = set;
            var currentValue = viewModel.ItemValue();
            var isRequired = viewModel.IsCompulsory() ? ' Required' : '';
            var html = '';
            switch (dataType) {
                case 'double':
                case 'float':
                    html += '<input type="text" class="form-control" data-bind="value:ItemValue" onchange="self.validControlValue(this)"';
                    html += ' data-valid="' + dataType + isRequired + '" />';
                    $(html).appendTo($(element));
                    break;
                case 'decimal':
                    html += '<div class="input-group">';
                    html += '<label></label>';
                    html += '<input type="text" data-name="pc" class="form-control" ';
                    html += ' data-valid="' + dataType + isRequired + '" />';
                    html += '<span class="input-group-btn">';
                    html += '<select  class="form-control">';
                    html += getDrodownpOption(setName);
                    html += '</select>';
                    html += '</span>';
                    html += '</div>';
                    $(html).appendTo($(element));

                    $(element).find("select").eq(0).change(function () {
                        var inp = $(element).find("label").eq(0).attr("value");
                        var drop = $(element).find("select").eq(0).val();
                        var drop_Old = $(element).find("label").eq(0).attr("drop");
                        var power = getPower(drop, drop_Old);
                        if (power > 0) {
                            var moneyValue = moneyAlgorithm(inp, power, true);
                            $(element).find("label").eq(0).attr("value", moneyValue);
                            viewModel.ItemValue(moneyValue + "|" + drop);
                        }
                        else if (power < 0) {
                            power = parseInt(power.toString().substr(1, 1));
                            var moneyValue = moneyAlgorithm(inp, power, false);
                            $(element).find("label").eq(0).attr("value", moneyValue);
                            viewModel.ItemValue(moneyValue + "|" + drop);
                        }
                        $(element).find("label").eq(0).attr("drop", drop);

                    });

                    $(element).find("input").eq(0).keyup(function (event) {
                        var number = new FormatNumber()
                        number.checkNumberFunc(null, event.originalEvent, function (float) {
                            var drop = $(element).find("select").eq(0).val();
                            if (float != null && float != "") {
                                $(element).find("label").eq(0).attr("value", float);
                                viewModel.ItemValue(float + "|" + drop);
                            } else {
                                $(element).find("label").eq(0).attr("value", "");
                                viewModel.ItemValue("");
                            }
                        });
                        self.validControlValue(this);
                    });

                    if (currentValue != null && currentValue != "") {
                        var array = currentValue.split('|');
                        if (array.length < 2) {
                            $(element).find("input").eq(0).val(getMoneyFormat(array[0]));
                            var old = $(element).find("select").eq(0).val();
                            $(element).find("label").eq(0).attr("drop", old);
                            $(element).find("label").eq(0).attr("value", (array[0]));
                        }
                        else {
                            $(element).find("input").eq(0).val(getMoneyFormat(array[0]));
                            $(element).find("select").eq(0).val(array[1]);
                            $(element).find("label").eq(0).attr("drop", array[1]);
                            $(element).find("label").eq(0).attr("value", (array[0]));
                        }
                    }
                    else {
                        $(element).find("input").eq(0).val("");
                        var old = $(element).find("select").eq(0).val();
                        $(element).find("label").eq(0).attr("drop", old);
                        $(element).find("label").eq(0).attr("value", "");
                    }
                    break;
                case 'list':
                    var itemId = 'list_' + viewModel.ItemId();
                    var setName = set;
                    var options = DataOperate.getChildItems(itemId, setName);
                    html += '<input type="text" list="' + itemId + '" class="form-control" data-bind="value: ItemValue" onchange="self.validControlValue(this)"';
                    html += ' data-valid="' + isRequired + '" />';
                    $(html).appendTo($(element));
                    if (options == null) {
                        html = '<datalist id="' + itemId + '"></datalist>';
                    } else {
                        var op = "";
                        $.each(options, function (i, option) {
                            op = op + '<option value="' + option.ItemChildId + '">' + option.ItemAliasValue + '</option>';
                        });
                        html = '<datalist id="' + itemId + '">' + op + '</datalist>';
                    }
                    $(html).appendTo($(element));
                    break;
                case 'int':
                    html += '<input type="text" class="form-control" data-bind="value:ItemValue" onchange="self.validControlValue(this)"';
                    html += ' data-valid="' + dataType + isRequired + '" />';
                    $(html).appendTo($(element));
                    break;

                case 'date':
                    html += '<input type="text" class="form-control date-plugins" data-bind="value:ItemValue" onchange="self.validControlValue(this)"';
                    html += ' data-valid="' + dataType + isRequired + '" />';
                    $(html).appendTo($(element));
                    break;

                case 'datetime':
                    html += '<input type="text" class="form-control date-plugins" data-bind="value:ItemValue" onchange="self.validControlValue(this)"';
                    html += ' data-valid="' + dataType + isRequired + '" />';
                    $(html).appendTo($(element));
                    break;

                case 'bool':
                    var itemValue = viewModel.ItemValue();
                    var itemCode = viewModel.ItemCode();
                    if (itemValue == "True") {
                        html += '<input type="checkbox" id="' + itemCode + '" data-bind="checked:true" />';
                    } else {
                        html += '<input type="checkbox" id="' + itemCode + '" data-bind="checked:false" />';
                    }

                    $(html).appendTo($(element));
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
                    var itemId = viewModel.ItemId();
                    var itemCode = viewModel.ItemCode();
                    var options = getSelectControlOptions(itemCode, set);
                    if (options == null) {
                        html = '<select class="form-control" ></select>';
                    } else {
                        var op = "";
                        $.each(options, function (i, option) {
                            op = op + '<option value="' + option.ValueShort + '">' + option.Value + '</option>';
                        });
                        html = '<select id=dropDown_' + itemId + ' class="form-control" data-bind="value: ItemValue">' + op + '</select>';
                    }
                    $(html).appendTo($(element));
                    break;

                case 'text':
                    html += '<span data-bind="text: ItemValue"></span>';
                    $(html).appendTo($(element));
                    break;

                default:
                    html += '<input type="text" class="form-control" data-bind="value: ItemValue" onchange="self.validControlValue(this)"';
                    html += ' data-valid="' + isRequired + '" />';
                    $(html).appendTo($(element));
                    break;
            }
        },
        update: function (element, valueAccessor, allBindings, viewModel) {
            var dataType = viewModel.DataType().toLocaleLowerCase();
            var currentValue = viewModel.ItemValue();
            switch (dataType) {
                case 'decimal':
                    if (currentValue != null && currentValue != "") {
                        var array = currentValue.split('|');
                        if (array.length < 2) {
                            $(element).find("input").eq(0).val(getMoneyFormat(array[0]));
                            var old = $(element).find("select").eq(0).val();
                            $(element).find("label").eq(0).attr("drop", old);
                            $(element).find("label").eq(0).attr("value", array[0]);
                        }
                        else {
                            $(element).find("input").eq(0).val(getMoneyFormat(array[0]));
                            $(element).find("select").eq(0).val(array[1]);
                            $(element).find("label").eq(0).attr("drop", array[1]);
                            $(element).find("label").eq(0).attr("value", array[0]);
                        }
                    }
                    else {
                        $(element).find("input").eq(0).val("");
                        var old = $(element).find("select").eq(0).val();
                        $(element).find("label").eq(0).attr("drop", old);
                        $(element).find("label").eq(0).attr("value", "");
                    }
                    break;
                case "bool":
                    var itemValue = viewModel.ItemValue();
                    if (itemValue == "True") {
                        $(element).find("[type='checkbox']").attr("checked", 'true');
                    }
                    else {
                        $(element).find("[type='checkbox']").removeAttr("checked");
                    }
                    break;
            }
        }
    };

    ko.bindingHandlers.renderControl2 = {
        init: function (element, valueAccessor, allBindings, viewModel) {
            var dataType = viewModel.DataType().toLocaleLowerCase();
            var setName = set;
            var itemId = viewModel.ItemId();
            var itemCode = viewModel.ItemCode();
            var itemValue = viewModel.ItemValue();
            var isRequired = viewModel.IsCompulsory() ? ' Required' : '';
            var html = '';
            switch (dataType) {
                case 'double':
                case 'float':
                    html += '<input type="text" class="form-control" data-bind="value:ItemValue" onchange="self.validControlValue(this)"';
                    html += 'id="' + itemCode + '"';
                    html += ' data-valid="' + dataType + isRequired + '" />';
                    $(html).appendTo($(element));
                    break;
                case 'decimal':
                    html += '<div class="input-group">';
                    html += '<label></label>';
                    html += '<input type="text" data-name="pc" class="form-control" ';
                    html += ' data-valid="' + dataType + isRequired + '" />';
                    html += '<span class="input-group-btn">';
                    html += '<select  class="form-control">';
                    html += getDrodownpOption(setName);
                    html += '</select>';
                    html += '</span>';
                    html += '</div>';
                    $(html).appendTo($(element));

                    $(element).find("select").eq(0).change(function () {
                        var inp = $(element).find("label").eq(0).attr("value");
                        var drop = $(element).find("select").eq(0).val();
                        var drop_Old = $(element).find("label").eq(0).attr("drop");
                        var power = getPower(drop, drop_Old);
                        if (power > 0) {
                            var moneyValue = moneyAlgorithm(inp, power, true);
                            $(element).find("label").eq(0).attr("value", moneyValue);
                            viewModel.ItemValue(moneyValue + "|" + drop);
                        } else if (power < 0) {
                            power = parseInt(power.toString().substr(1, 1));
                            var moneyValue = moneyAlgorithm(inp, power, false);
                            $(element).find("label").eq(0).attr("value", moneyValue);
                            viewModel.ItemValue(moneyValue + "|" + drop);
                        }
                        $(element).find("label").eq(0).attr("drop", drop);

                    });

                    $(element).find("input").eq(0).keyup(function (event) {
                        var number = new FormatNumber()
                        number.checkNumberFunc(null, event.originalEvent, callback);
                        function callback(float) {
                            var drop = $(element).find("select").eq(0).val();
                            if (float != null && float != "") {
                                $(element).find("label").eq(0).attr("value", float);
                                viewModel.ItemValue(float + "|" + drop);
                            } else {
                                $(element).find("label").eq(0).attr("value", "");
                                viewModel.ItemValue("");
                            }
                        }
                        self.validControlValue(this);
                    });

                    if (itemValue != null && itemValue != "") {
                        var array = itemValue.split('|');
                        if (array.length < 2) {
                            $(element).find("input").eq(0).val(getMoneyFormat(array[0]));
                            var old = $(element).find("select").eq(0).val();
                            $(element).find("label").eq(0).attr("drop", old);
                            $(element).find("label").eq(0).attr("value", (array[0]));
                        }
                        else {
                            $(element).find("input").eq(0).val(getMoneyFormat(array[0]));
                            $(element).find("select").eq(0).val(array[1]);
                            $(element).find("label").eq(0).attr("drop", array[1]);
                            $(element).find("label").eq(0).attr("value", (array[0]));
                        }
                    }
                    else {
                        $(element).find("input").eq(0).val("");
                        var old = $(element).find("select").eq(0).val();
                        $(element).find("label").eq(0).attr("drop", old);
                        $(element).find("label").eq(0).attr("value", "");
                    }
                    break;

                case 'int':
                    html += '<input type="text" class="form-control" data-bind="value:ItemValue" onchange="self.validControlValue(this)"';
                    html += 'id="' + itemCode + '"';
                    html += ' data-valid="' + dataType + isRequired + '" />';
                    $(html).appendTo($(element));
                    break;

                case 'date':
                    html += '<input type="text" class="form-control date-plugins" data-bind="value:ItemValue" onchange="self.validControlValue(this)"';
                    html += 'id="' + itemCode + '"';
                    html += ' data-valid="' + dataType + isRequired + '" />';
                    $(html).appendTo($(element));
                    break;

                case 'datetime':
                    html += '<input type="text" class="form-control date-plugins" data-bind="value:ItemValue" onchange="self.validControlValue(this)"';
                    html += 'id="' + itemCode + '"';
                    html += ' data-valid="' + dataType + isRequired + '" />';
                    $(html).appendTo($(element));
                    break;

                case 'bool':
                    if (itemValue == "True") {
                        html += '<input type="checkbox" id="' + itemCode + '" data-bind="checked:true" />';
                    } else {
                        html += '<input type="checkbox" id="' + itemCode + '" data-bind="checked:false" />';
                    }
                    $(html).appendTo($(element));
                    $(element).find("[type='checkbox']").click(function () {
                        var a = $(element).find("[type='checkbox']").attr("checked");
                        if (a == "checked") {
                            viewModel.ItemValue("True");
                        } else {
                            viewModel.ItemValue("False");
                        }
                    });
                    break;

                case 'select':
                    var options = [];
                    var obj = ko.mapping.toJS(viewModel);
                    if (obj['source'] && obj['source'] === 'TrustManagement') {
                        options = getSelectControlOptions(itemCode, set);
                        if (options == null) {
                            html = '<select id="' + itemCode + '" class="form-control" ></select>';
                        } else {
                            var op = "";
                            $.each(options, function (i, option) {
                                op = op + '<option value="' + option.ValueShort + '">' + option.Value + '</option>';
                            });
                            html = '<select id="' + itemCode + '" class="form-control" data-bind="value: ItemValue">' + op + '</select>';
                        }
                    } else {
                        DataOperate.getChildItems(itemId, setName);

                        if (options == null) {
                            html = '<select id="' + itemCode + '" class="form-control" ></select>';
                        } else {
                            var op = "";
                            $.each(options, function (i, option) {
                                op = op + '<option value="' + option.ItemChildId + '">' + option.ItemAliasValue + '</option>';
                            });
                            html = '<select id="' + itemCode + '" class="form-control" data-bind="value: ItemValue">' + op + '</select>';
                        }
                    }
                    $(html).appendTo($(element));
                    break;

                case 'custselect':
                    html += '<select class="form-control" id="' + itemCode + '" data-bind="value: ItemValue">';
                    html += getCustomSelectOptions(itemCode, setName);
                    html += '</select>';

                    $(html).appendTo($(element));
                    break;
                case 'staticselect':
                    var options = viewModel.Options();

                    html += '<select class="form-control" id="' + itemCode + '" data-bind="value:ItemValue">';
                    $.each(options, function (i, option) {
                        html += '<option value="' + option.Value() + '">' + option.Text() + '</option>';
                    });
                    html += '</select>';

                    $(html).appendTo($(element));
                    break;
                case 'text':
                    html += '<span id="' + itemCode + '" data-bind="text:ItemValue"></span>';
                    $(html).appendTo($(element));
                    break;

                case 'file':
                    html += '<input type="file" class="form-control" data-bind="value:ItemValue" id="' + itemCode + '" />';
                    $(html).appendTo($(element));
                    break;

                default:
                    html += '<input type="text" class="form-control" data-bind="value: ItemValue" onchange="self.validControlValue(this)"';
                    html += 'id="' + itemCode + '"';
                    html += ' data-valid="' + isRequired + '" />';
                    $(html).appendTo($(element));
                    break;
            }
        },
        update: function (element, valueAccessor, allBindings, viewModel) {
            var dataType = viewModel.DataType().toLocaleLowerCase();
            var setName = set;
            var itemId = viewModel.ItemId();
            var itemCode = viewModel.ItemCode();
            var itemValue = viewModel.ItemValue();
            var isRequired = ' Required';
            switch (dataType) {
                case 'decimal':
                    if (itemValue) {
                        var array = itemValue.split('|');
                        if (array.length < 2) {
                            $(element).find("input").eq(0).val(getMoneyFormat(array[0]));
                            var old = $(element).find("select").eq(0).val();
                            $(element).find("label").eq(0).attr("drop", old);
                            $(element).find("label").eq(0).attr("value", array[0]);
                        } else {
                            $(element).find("input").eq(0).val(getMoneyFormat(array[0]));
                            $(element).find("select").eq(0).val(array[1]);
                            $(element).find("label").eq(0).attr("drop", array[1]);
                            $(element).find("label").eq(0).attr("value", array[0]);
                        }
                    } else {
                        $(element).find("input").eq(0).val("");
                        var old = $(element).find("select").eq(0).val();
                        $(element).find("label").eq(0).attr("drop", old);
                        $(element).find("label").eq(0).attr("value", "");
                    }
                    break;
                case "bool":
                    if (itemValue == "True") {
                        $(element).find("[type='checkbox']").attr("checked", 'true');
                    } else {
                        $(element).find("[type='checkbox']").removeAttr("checked");
                    }
                    break;
            }
        }
    };




    ///////////////////////Helper Methods///////////////////////////////
    var zh = { One: "元", TenThoursand: "万", Million: "百万", TenMillion: "千万", HundredMillion: "亿" };
    var en = { One: "Y", TenThoursand: "TT", Million: "M", TenMillion: "TM", HundredMillion: "HM" };
    var moneyEnum = { One: 0, TenThoursand: 4, Million: 6, TenMillion: 7, HundredMillion: 8 };

    function getPower(newM, oldM) {
        return parseInt(moneyEnum[oldM]) - parseInt(moneyEnum[newM]);
    }

    function getDrodownpOption(setName) {
        var html = "";
        switch (setName) {
            case "zh-CN":
                html += ' <option value="HundredMillion">' + zh["HundredMillion"] + '</option>';
                html += ' <option value="TenMillion">' + zh["TenMillion"] + '</option>';
                html += ' <option value="Million">' + zh["Million"] + '</option>';
                html += ' <option value="TenThoursand">' + zh["TenThoursand"] + '</option>';
                html += ' <option value="One">' + zh["One"] + '</option>';
                break;
            case "en-US":
                html += ' <option value="HundredMillion">' + en["HundredMillion"] + '</option>';
                html += ' <option value="TenMillion">' + en["TenMillion"] + '</option>';
                html += ' <option value="Million">' + en["Million"] + '</option>';
                html += ' <option value="TenThoursand">' + en["TenThoursand"] + '</option>';
                html += ' <option value="One">' + en["One"] + '</option>';
                break;
        }
        return html;
    }

    //数据库中的DataType=Decimal时数据，转换为页面显示的钱（对应于Edit里DropDown相应的Grid数据显示）
    function getMoneyText(itemValue, setName) {
        var text = "";
        if (itemValue != null && itemValue != "") {
            var money = itemValue.split('|')[0];
            moneyFormat = getMoneyFormat(money);
            var key = itemValue.split('|')[1];
            if (setName == "zh-CN") {
                if (typeof (key) == 'undefined') {
                    text = moneyFormat;
                } else {
                    text = moneyFormat + zh[key];
                }

            }
            else if (setName == "en-US") {
                text = moneyFormat + en[key];
            }
        }
        return text;
    }

    //将货币模式显示
    function getMoneyFormat(money) {
        if (money.indexOf("e") != -1 || money.indexOf("E") != -1) {
            var left = money.split("e-")[0];
            var right = parseInt(money.split("e-")[1]);

            if (left.indexOf(".") != -1) {
                var l = left.split(".")[0].length;
                return "0." + getZero(right - l) + left.replace(".", "");
            }
            else {
                var l = left.length;
                return "0." + getZero(right - l) + left;
            }
        }
        else {
            var number = new FormatNumber();
            if (parseFloat(money) == money) {
                var ret = number.convertNumberN(1, money);
                return ret;
            }
            else
                return money;
        }

        function getZero(number) {
            var r = "";
            for (i = 0; i < number; i++) {
                r += "0";
            }
            return r;
        }
    }

    function moneyAlgorithm(money, power, by) {
        money = parseFloat(money);
        var powerT = Math.pow(10, power);
        if (by) {
            money = accMul(money, powerT);
        }
        else {
            money = accDiv(money, powerT);
        }

        return parseFloat(money);
    }

    function getCustomSelectOptions(itemCode, setName) {
        var options = '';
        var ary = [];
        var executeParam = { SPName: null, SQLParams: [] };
        var svcUrl = GlobalVariable.QuickWizardServiceUrl;
        switch (itemCode) {
            case 'OrganisationCode':
                executeParam.SPName = 'dbo.usp_GetDimOrganisationID';
                svcUrl += 'CommonGetWithConnName?connName=TrustManagement&exeParams=' + encodeURIComponent(JSON.stringify(executeParam));
                ary = CallWCFSvc(svcUrl, false, 'GET');
                $.each(ary, function (i, v) {
                    options += '<option value="' + v.OrganisationCode + '">' + v.OrganisationDesc + '</options>';
                });
                break;
            case 'Trust':
                executeParam.SPName = 'TrustManagement.usp_GetTrusts';
                executeParam.SQLParams.push({ Name: 'language', Value: setName, DBType: 'string' });
                svcUrl += 'CommonGetWithConnName?connName=TrustManagement&exeParams=' + encodeURIComponent(JSON.stringify(executeParam));
                ary = CallWCFSvc(svcUrl, false, 'GET');
                $.each(ary, function (i, v) {
                    options += '<option value="' + v.TrustId + '">' + v.TrustName + '</options>';
                });
                break;
            case 'AssetType2':
            case 'AssetType':
                executeParam.SPName = 'TrustManagement.usp_GetAssetType';
                executeParam.SQLParams.push({ Name: 'language', Value: setName, DBType: 'string' });
                svcUrl += 'CommonGetWithConnName?connName=TrustManagement&exeParams=' + encodeURIComponent(JSON.stringify(executeParam));
                ary = CallWCFSvc(svcUrl, false, 'GET');
                $.each(ary, function (i, v) {
                    options += '<option value="' + v.AssetType + '">' + v.AssetTypeDesc + '</options>';
                });
                break;
            case 'HazardFunction':
                options += '<option value="1">h(t)=λ</options>';
                options += '<option value="2">h(t)=λα*pow(λt,α-1)</options>';
                break;
            case 'ArrearsSection':
                options += '<option value="[ArrearsRate1_30]">逾期1-30天</options>';
                options += '<option value="[ArrearsRate31_60]">逾期31-60天</options>';
                options += '<option value="[ArrearsRate61_90]">逾期61-90天</options>';
                options += '<option value="[ArrearsRate91_120]">逾期91-120天</options>';
                options += '<option value="[ArrearsRate121_150]">逾期121-150天</options>';
                options += '<option value="[ArrearsRate151_180]">逾期151-180天</options>';
                options += '<option value="[ArrearsRate1Exceed180]">逾期180天以上</options>';
                break;
            case 'SurvivalAnalysisGroupingField':
                options += '<option value="1">CreditRatingScore</options>';
                options += '<option value="2">UserLevel</options>';
                break;
            case 'CurveChoice':
                options += '<option value="1">CurveChoice1</options>';
                options += '<option value="2">CurveChoice2</options>';
                break;
            case 'MCSimulationMethod':
                options += '<option value="1">使用迁移矩阵和早偿分布</options>';
                options += '<option value="2">使用早偿/逾期分布</options>';
                break;
            case 'MCStartPoint':
                options += '<option value="1">从指定日期开始模拟</options>';
                options += '<option value="2">模拟所有资产全生命周期</options>';
                break;
            case 'MCAmortisationSource':
                options += '<option value="1">使用资产池现金流归集</options>';
                options += '<option value="2">指定资产池初始规模和回收分布</options>';
                break;
            case 'AmortisationSource':
                options += '<option value="1">使用资产池现金流归集</options>';
                options += '<option value="2">指定资产池初始规模和回收分布</options>';
                break;
            default:
                return;
        }

        return options;
    }

    var allTrustManagementSelectFieldOptions = [];
    function getSelectControlOptions(itemCode, setName) {
        if (allTrustManagementSelectFieldOptions.length < 1) {
            if (!setName) setName = 'zh-CN';
            var executeParam = { SPName: null, SQLParams: [] };
            executeParam.SPName = 'TrustManagement.usp_GetAllCodeDictionary';
            executeParam.SQLParams.push({ Name: 'AliasSetName', Value: setName, DBType: 'string' });
            var svcUrl = GlobalVariable.QuickWizardServiceUrl + 'CommonGetWithConnName?connName=TrustManagement&exeParams=' + encodeURIComponent(JSON.stringify(executeParam));
            allTrustManagementSelectFieldOptions = CallWCFSvc(svcUrl, false, 'GET', null);
        }
        var items = $.grep(allTrustManagementSelectFieldOptions, function (item) {
            return item.CategoryCode == itemCode;
        });
        return items;
    }
});