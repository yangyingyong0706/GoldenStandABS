itemEventModel = [];
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
    //var EventName = common.getUrlParam('EventName');
    var EventName = decodeURIComponent(common.getUrlParam('EventName'))

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
    //var trustId = 0;
    var activeId = 0;

    var trustEventModel = [];

    var eventType = { SpecificPlan: 'SpecificPlan', BreachCondition: 'BreachCondition', QualitativeCondition: 'QualitativeCondition' };
    var categoryCode = { TrustPaymentScenario: 'TrustPaymentScenario', TrustEventItem: 'TrustEventItem', TrustRationItem: 'TrustRationItem', TrustQualitativeItem: 'TrustQualitativeItem' };

    var eventListTemplate = '<li class="clearfix" activeid="{0}" itemid="{1}" itemcode="{2}" categorycode="{3}" onClick="self.changEvent(this)"><span class="tick flt"><input type="checkbox" name="eventGruop" id="event_{1}" value="{1}"  {5}></span><span class="flt textTick">{4}</span></li>';//&#xe65a;
    //var qualitativeItemListTemplate = '<li  ItemListId="{0}" CategoryId="{1}" ondblclick="self.EditItem(this)" onClick="self.ClickItem(this)"><div style="display: inline-block; margin-right:2%;"></div><span class="check"><span class="list"><i>{3}</i><span class="detaileItem">{2}</span></li>';

    var qualitativeItemListTemplate = '<tr ItemListId="{0}" CategoryId="{1}"style="text-align: center;cursor:pointer">'
        + '<td><input ItemListId={0} onClick="self.ClickItem(this)" type="checkbox"  class="checkBox"></td>' +
        '<td ItemListId={0} ><span class="list">{2}</span></td>' +
        '<td onclick="self.EditItem(this)"><span class="normal_small_button" style="font-size: 12px;padding: 1px 8px;">编辑</span></td>' +
        '</tr>';
    var rationTemplate = ' <tr style="cursor: pointer" id="ration_{0}" >'
                                    + '<td style="vertical-align: middle;">'
                                        + '<div>' // class="middle"
                                            + '<input onClick="CheckInput(this)" type="checkbox" id="chkRation" class="checkBoxTwo" value="{0}" {6}>'
                                        + '</div>'
                                    + '</td>'
                                    + '<td style="vertical-align: middle;">'
                                        + '<span id="txtDescribe" value="">{1}</span>'
                                    + '</td>'
                                    + '<td style="vertical-align: middle;">'
                                        + '<span id="txtCalculationDesc" value="">{7}</span>'
                                        //+ '<input type="text" id="txtCalculationDesc" class="form-control" value="{7}"  readonly="readonly">'
                                    + '</td>'
                                    + '<td style="vertical-align: middle;">'
                                        + '<span id="txtCurrentValue" value="">{2}</span>'
                                        //+ '<input type="text" id="txtCurrentValue" class="form-control" value="{2}" readonly="readonly">'
                                    + '</td>'
                                    + '<td style="vertical-align: middle;">'
                                        //+ '<span id="txtCurrentValue" value="">{3}</span>'
                                        + '<select id="drpCondition_{0}" drpConditionId={0} class="drpCondition" style="-webkit-appearance: none; padding: 0 10px;background:#f1f1f1;height:33px;border-radius:5px" disabled="disabled" value="{3}" readonly="readonly">'
                                        + '{4}'
                                        + '</select>'
                                    + '</td>'
                                    + '<td style="vertical-align: middle;">'
                                        + '<span id="txtThreshod" value="">{5}</span>'
                                        //+ '<input type="text" id="txtThreshod" class="form-control" value="{5}" readonly="readonly">'
                                    + '</td>'
                                    + '<td style="vertical-align: middle;">'
                                        + '<button class="normal_small_button" onclick="EditRationDescribe(this.parentNode.parentNode)">编辑</button>'
                                    + '</td>'
                                + '</tr>';

    var options = '<option value="gt">&gt;</option>'
                + '<option value="ge">&ge;</option>'
                + '<option value="ne">&ne;</option>'
                + '<option value="eq">=</option>'
                + '<option value="lt">&lt;</option>'
                + '<option value="le">&le;</option>';

    $(function () {
        trustId = common.getUrlParam('tid');
        if (trustId) {
            getTrustEventConfig();
        }
        getItemEvent();
        getCalculateCodeList();
        registerEvent();

        //全选和取消全选
        function checkAll(check, checkAll) {
            $(checkAll).click(function () {
                $(check).prop("checked", $(this).prop("checked"));
            });
            $('body').on('click', check, function () {
                if ($(check + ':checked').length == $(check).length) {
                    $(checkAll).prop("checked", true);
                }
                else $(checkAll).prop("checked", false);
            });
        }
        checkAll('input.checkBox', '.checkAll')
        checkAll('input.checkBoxTwo', '.checkAllTwo')
    })

    String.prototype.format = function () {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] != 'undefined'
            ? args[number]
            : match
            ;
        });
    };

    Array.prototype.remove = function (dx) {
        if (isNaN(dx) || dx > this.length) { return false; }
        for (var i = 0, n = 0; i < this.length; i++) {
            if (this[i] != this[dx]) {
                this[n++] = this[i]
            }
        }
        this.length -= 1
    }

    //========公用 =======

    //    验证  (类，值，正则,提示内容)
    function verifyT(cla, value, reg, t) {
        if (value == "") {
            $(cla).css('border', '1px solid red').next().show();
            $(cla).next().text('值不为能为空');
        } else if (!reg.test(value)) {
            $(cla).css('border', '1px solid red').next().show();
            $(cla).next().text(t);
        } else {
            return true;
        }
    }


    //    小叉叉
    function closeX() {
        $('.ui-dialog .ui-dialog-titlebar-close').removeClass('ui-button-icon-only');
        //$('.ui-dialog .ui-dialog-titlebar-close').css('border', '1px solid #ddd');
        //$('.ui-dialog .ui-dialog-titlebar-close').html("<i class='iconfont' style='color:#717070;'>&#xe636;<i>");
    }

    var getUrlParam = function (name) {
        var s = location.search;
        if (s != null && s.length > 1) {
            var sarr = s.substr(1).split("&");
            var tarr;
            for (i = 0; i < sarr.length; i++) {
                tarr = sarr[i].split("=");
                if (tarr.length == 2 && tarr[0].toLowerCase() == name.toLowerCase()) {
                    return tarr[1];
                }
            }
            return null;
        }
    }

    //渲染事件
    var renderEvent = function () {

        if (itemEventModel == null) {
            GSDialog.HintWindow("have no scenario");
            //document.getElementById("eventList").innerHTML = "";
        }
        else {
            var content = "";
            $.each(itemEventModel, function (i, v) {

                content += eventListTemplate.format(i, v.ItemId, v.ItemCode, v.CategoryCode, v.ItemAliasValue, (v.IsCheck ? "checked='checked'" : ""));
            })
            //document.getElementById("eventList").innerHTML = content;
            self.changEvent();
        }
    }

    //获取事件
    function getItemEvent() {
        var executeParam = {
            SPName: 'usp_GetItemsByCategoryCode', SQLParams: [
                { Name: 'CategoryCode', value: categoryCode.TrustEventItem, DBType: 'string' }
            ]
        };
        common.ExecuteGetData(true, svcUrl, 'TrustManagement', executeParam, function (eventData) {
            if (eventData && eventData.length > 0) {
                $(eventData).each(function (i, v) {
                    $.extend(v, { IsCheck: false })
                });
                $.each(eventData, function (index, val) {
                    if ($.trim(val.ItemCode) == EventCode) {
                        itemEventModel.push(val);
                    }
                })
                var CurrentObj = '您正在为 > {0} > 添加触发条件'.format(decodeURI(EventName))
                $("#CurrentEventName").html(CurrentObj);
                getItemListByItemGroup();//获取所有事件下的触发条目
                checkTruestEvent();//选中专项计划的事件
                renderEvent();//重新渲染界面
            }
        });
    }







    //获取所有事件下的触发条目
    function getItemListByItemGroup() {
        var itemGroupTemplate = "<Item><id>{0}</id></Item>";
        var contentXml = "", itemGroup = "";
        $.each(itemEventModel, function (i, v) {
            contentXml += itemGroupTemplate.format(v.ItemId);
        })
        itemGroup = "<Items>{0}</Items>".format(contentXml);
        var executeParam = {
            SPName: 'usp_GetItemListByItemGroup', SQLParams: [
                { Name: 'TrustId', value: trustId, DBType: 'int' },
                { Name: 'ItemGroup', value: itemGroup, DBType: 'string' }
            ]
        };
        var sourceData = common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam);
        if (sourceData && sourceData.length > 0) {
            dataProcess.setItemListToItemEventModel(sourceData);
        }
    }

    //获取当前专项计划的事件与条目
    function getTrustEventConfig() {
        var executeParam = {
            SPName: 'usp_GetTrustEventsConfig', SQLParams: [
                { Name: 'trustId', value: trustId, DBType: 'string' }
            ]
        };
        var sourceData = common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam);
        if (sourceData && sourceData.length > 0) {
            trustEventModel = sourceData;
        }
    }

    //加载CalculationCodeList
    function getCalculateCodeList() {
        var executeParam = {
            SPName: 'usp_GetCalculationCodeList', SQLParams: [
            ]
        };
        common.ExecuteGetData(true, svcUrl, 'TrustManagement', executeParam, function (sourceData) {
            if (sourceData && sourceData.length > 0) {
                var html = '';//'<option value="">所有</option>';
                $.each(sourceData, function (i, item) {
                    html += '<option value="' + item.CalculationCode + '">' + item.CalculationDesc + '</option>';
                });
                $('#CalculationCode').html(html);
            }
        });
    }

    //重新组织事件(itemEventModel)定性条目的显示顺序
    var sortQualitative = function () {
        if (itemEventModel[activeId].ItemList) {
            var selectQualitativeItem = $.grep(itemEventModel[activeId].ItemList, function (n, i) {
                return n.CategoryCode == categoryCode.TrustQualitativeItem || n.IsCheck == true;
            });
            var checkQualitative = [];
            var noCheckQualitative = $.grep(itemEventModel[activeId].ItemList, function (n, i) {
                return n.CategoryCode != categoryCode.TrustQualitativeItem || n.IsCheck == false;
            });

            var newQualitativeItem = $.grep(trustEventModel, function (n, i) {
                return n.EventType == eventType.QualitativeCondition;
            });

            $(newQualitativeItem).each(function (i, nq) {
                $(selectQualitativeItem).each(function (i, sq) {
                    if (nq.ItemCode == sq.ItemListCode) {
                        checkQualitative.push(sq);
                    }
                })
            });
            itemEventModel[activeId].ItemList = noCheckQualitative;
            itemEventModel_new = noCheckQualitative;

        }
    }
    //渲染当前事件下选中定性条目
    var renderSelectedQualitative = function () {
        var content = "";
        var j = -1;
        if (itemEventModel[activeId].ItemList && itemEventModel[activeId].ItemList.length > 0) {
            $(itemEventModel[activeId].ItemList).each(function (i, ItemList) {
                if (ItemList.CategoryCode == categoryCode.TrustQualitativeItem && ItemList.IsCheck == true) {
                    j++;
                    content += qualitativeItemListTemplate.format(ItemList.ItemListId, ItemList.CategoryId, ItemList.DisplayDescribe, j + "、");
                }
            })

        }
        //document.getElementById("selectedQualitativeList").innerHTML = content;
    }
    //渲染当前事件下的没选中定性条目
    var renderQualitative = function () {
        var content = "";
        var j = -1;
        if (itemEventModel[activeId].ItemList && itemEventModel[activeId].ItemList.length > 0) {
            $(itemEventModel[activeId].ItemList).each(function (i, ItemList) {
                if (ItemList.CategoryCode == categoryCode.TrustQualitativeItem) {
                    j++;
                    content += qualitativeItemListTemplate.format(ItemList.ItemListId, ItemList.CategoryId, ItemList.DisplayDescribe, j + "、");
                }
            })

        }
        document.getElementById("QualitativeList").innerHTML = content;
    }

    //渲染当前事件下的定量条目
    var renderRation = function () {
        var content = "";
        if (itemEventModel[activeId].ItemList && itemEventModel[activeId].ItemList.length > 0) {
            $(itemEventModel[activeId].ItemList).each(function (i, ItemList) {
                if (ItemList.CategoryCode == categoryCode.TrustRationItem) {

                    var cIndex = options.indexOf(ItemList.Condition);
                    cIndex = (cIndex == 18) ? 15 : cIndex;
                    var optionStr = options.substring(0, cIndex + 3);
                    optionStr += ' selected="selected"';
                    optionStr += options.substring(cIndex + 3, options.length - 1);
                    content += rationTemplate.format(ItemList.ItemListId, ItemList.DisplayDescribe, ItemList.CurrentValue, ItemList.Condition, optionStr, ItemList.Threshold, false, ItemList.CalculationDesc ? ItemList.CalculationDesc : '');


                }
            })
        }
        document.getElementById("rationList").innerHTML = content;
    }

    //显示当前专项计划的事件与条目
    var checkTruestEvent = function () {
        if (trustEventModel && trustEventModel.length > 0) {
            var eventArray = $.grep(trustEventModel, function (n, i) {
                return n.EventType == eventType.SpecificPlan;
            });
            $.each(itemEventModel, function (i, e) {
                $.each(eventArray, function (i, a) {
                    if (a.EventType == eventType.SpecificPlan && e.ItemCode == a.ItemCode) {
                        e.IsCheck = true;
                    }
                })
                if (itemEventModel[i].ItemList) {
                    $.each(itemEventModel[i].ItemList, function (i, it) {
                        $.each(trustEventModel, function (i, te) {
                            if (te.EventType == eventType.BreachCondition && te.ItemId == it.ItemId) {
                                var parameter = $(te.Checking).find("Parameters").find("Parameter");
                                it.CurrentValue = parameter.eq(1).attr("value");//currentValue 读取节点属性
                                it.Condition = parameter.eq(2).attr("Operator");//Operator读取节点属性
                                it.Threshold = parameter.eq(4).attr("value");//targetValue读取节点属性
                                it.IsCheck = true;
                            }

                            //if (te.EventType == eventType.QualitativeCondition && te.ItemCode == it.ItemListCode) {
                            //    it.IsCheck = true;
                            //}
                        })
                    })
                }
            });
            sortQualitative();
        }
    }

    //判断添加的ItemCode是否已存在
    var isExistsCategory = function (itemCode, categoryCode) {
        var executeParam = {
            SPName: 'usp_GetItemByItemCode', SQLParams: [
                { Name: 'ItemCode', value: itemCode, DBType: 'string' },
                { Name: 'CategoryCode', value: categoryCode, DBType: 'string' },
            ]
        };
        var data = common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam);

        if (data && data.length > 0) {
            GSDialog.HintWindow("the itemCode exists in the database!");
            return false;
        } else { return true; }
    }

    //保存条目与事件的关系
    var saveItemListExtensionEvent = function (itemId, itemListId, calculationCode, fn) {
        var executeParam = {
            SPName: 'usp_SaveItemListExtensionEvent', SQLParams: [
                { Name: 'TrustId', value: trustId, DBType: 'int' },
                { Name: 'ItemId', value: itemId, DBType: 'int' },
                { Name: 'ItemListId', value: itemListId, DBType: 'int' },
                { Name: 'CalculationCode', value: calculationCode ? calculationCode : '', DBType: 'string' }
            ]
        };
        common.ExecuteGetData(true, svcUrl, 'TrustManagement', executeParam, function (data) {
            var timer;
            if (data && data.length > 0) {
                //GSDialog.HintWindow("保存成功!", function () { }, "", false);
                $('#modal-close').trigger('click')
                getItemEvent();
            } else { GSDialog.HintWindow("save error."); }
        });
        if (fn) {
            fn()
        }
    }

    //保存定量信息到基础表(Item)
    var saveRationInfo = function (itemListId, calculationCode, currentValue, condition, threshold, type) {
        var itemId = itemEventModel[activeId].ItemId;
        if (!$.isNumeric(currentValue)) {
            //  GSDialog.HintWindow("当前值请输入数字");
            //return false;
            currentValue = 0;

        }
        if (!$.isNumeric(threshold)) {
            GSDialog.HintWindow("阈值请输入数字", function () {
            }, "", false);
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
               '</main>'

        checking = checking.format(currentValue, condition, threshold);
        var executeParam = {
            SPName: 'usp_SaveRationInfo', SQLParams: [
                { Name: 'ItemListId', value: itemListId, DBType: 'int' },
                { Name: 'CurrentValue', value: currentValue, DBType: 'decimal' },
                { Name: 'Condition', value: condition, DBType: 'string' },
                { Name: 'Threshold', value: threshold, DBType: 'decimal' },
                { Name: 'checkIng', value: checking, DBType: 'xml' }
            ]
        };
        common.ExecuteGetData(true, svcUrl, 'TrustManagement', executeParam, function (data) {
            if (data && data.length > 0) {
                if (type == 'add') {
                    saveItemListExtensionEvent(itemId, itemListId, calculationCode, function () {
                        console.log(111);
                    });

                } else {
                    location.reload();
                }
                //$("#circumstances2").dialog("close");
            } else { GSDialog.HintWindow("save error", function () { $("#mask").remove() }); }
        });
    }

    //应用条目到内存中
    var applyTrustEvent = function () {
        var rationDom = $("#rationList").find("tr");
        var qualitativeDom = $("#QualitativeList").find("tr");

        var newQualitative = [];
        $(rationDom).each(function (i, d) {
            $(itemEventModel[activeId].ItemList).each(function (i, list) {
                var itemListId = $(d).find("input[id='chkRation']").val();
                var chkRation = $(d).find("input[id='chkRation']").prop("checked");
                if (list.ItemListId == itemListId) {
                    //if (chkRation) {
                    var txtDescribe = $(d).find("input[id='txtDescribe']").val();
                    var txtCurrentValue = $(d).find("input[id='txtCurrentValue']").val();
                    //var drpCondition = $(d).find("select[id='drpCondition']").find("option:selected").val();
                    var drpCondition = $(d).find(".drpCondition").val()
                    var txtThreshod = $(d).find("input[id='txtThreshod']").val();

                    list.IsCheck = true;
                    list.DisplayDescribe = txtDescribe;
                    list.CurrentValue = txtCurrentValue;
                    list.Condition = drpCondition;
                    list.Threshold = txtThreshod;
                }
                //}saveEvent
            })
        })

        $(qualitativeDom).each(function (i, d) {
            $(itemEventModel[activeId].ItemList).each(function (i, list) {
                if (list.ItemListId == $(d).attr("itemlistid")) {
                    //list.IsCheck = chkQualitative ? true : false;
                    newQualitative.push(list);
                }
            })
        })

        var removeQualitative = _.remove(itemEventModel[activeId].ItemList, function (n) {
            return n.CategoryCode == categoryCode.TrustQualitativeItem;
        });
        if (itemEventModel[activeId].ItemList instanceof Array) {
            itemEventModel[activeId].ItemList = itemEventModel[activeId].ItemList.concat(newQualitative);
        } else {
            itemEventModel[activeId].ItemList = removeQualitative;
        }
    }

    //关联专项计划事件与条目
    var saveTrustEvent = function () {
        var TrustEventXML = trustEventConvertXML();
        var executeParam = {
            SPName: 'usp_SaveTrustEventByCondition', SQLParams: [
                { Name: 'TrustId', value: trustId, DBType: 'int' },
                { Name: 'TrustEventXML', value: TrustEventXML, DBType: 'xml' },
                 { Name: 'EventId', value: EventId, DBType: 'string' },
            ]
        };
        executeRemoteData(executeParam, function (data) {
            if (data) {
                GSDialog.HintWindow("关联成功", function () {
                    location.reload(true)
                });
            }
        });
    }

    var executeRemoteData = function (executeParam, callback) {
        var executeParams = JSON.stringify(executeParam);

        var params = '';
        params += '<root appDomain="TrustManagement" postType="">';
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
            error: function (response) { GSDialog.HintWindow("error is :" + response); }
        });
    }

    var deleteItemEvent = function () {

        var itemId = itemEventModel[activeId].ItemId;
        if (itemId && itemId < 0) {
            GSDialog.HintWindow("请选择操作项")
            return false
        };
        GSDialog.HintWindowTF('是否删除选中项?', function () {
            var executeParam = {
                SPName: 'usp_DeleteItemEvent', SQLParams: [
                    { Name: 'ItemId', value: itemId, DBType: 'int' }
                ]
            };
            var temp = common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
                if (data && data.length > 0) {
                    GSDialog.HintWindow("删除成功！", function () {
                        activeId = 0;
                        getItemEvent();
                    });

                    return false;
                } else { GSDialog.HintWindow("删除失败！", function () { $("#mask").remove() }); }
            });
        })
    }
    //当前值和阀值检测

    var saveEvent = function (operator) {
        var itemId = itemEventModel[activeId].ItemId;
        var itemCode = $("#ItemCode").val();
        var itemAliasValue = $("#ItemAliasValue").val();

        if (itemCode == "" || itemAliasValue == "") {
            GSDialog.HintWindow("不能为空值", function () {
                $("#mask").remove()
            });
            return false;
        }

        if (operator == 'new') {
            var result = isExistsCategory(itemCode, categoryCode.TrustEventItem);
            if (result) {
                var executeParam = {
                    SPName: 'usp_SaveItem', SQLParams: [
                        { Name: 'ItemId', value: 0, DBType: 'int' },
                        { Name: 'ItemCode', value: itemCode, DBType: 'string' },
                        { Name: 'ItemAliasValue', value: itemAliasValue, DBType: 'string' },
                        { Name: 'CategoryCode', value: categoryCode.TrustEventItem, DBType: 'string' },
                        { Name: 'Operator', value: operator, DBType: 'string' }
                    ]
                };
                common.ExecuteGetData(true, svcUrl, 'TrustManagement', executeParam, function (data) {
                    if (data && data.length > 0) {
                        GSDialog.HintWindow("保存成功!", function () { $("#mask").remove() });
                        activeId = itemEventModel.length;
                        getItemEvent();
                        $("#circumstances3").dialog("close");

                    } else {
                        GSDialog.HintWindow("保存失败", function () { $("#mask").remove() });
                    }
                });
            }
        } else if (itemid && itemId > 0) {
            var executeParam = {
                SPName: 'usp_SaveItem', SQLParams: [
                    { Name: 'ItemId', value: itemId, DBType: 'string' },
                    { Name: 'ItemCode', value: itemCode, DBType: 'string' },
                    { Name: 'ItemAliasValue', value: itemAliasValue, DBType: 'string' },
                    { Name: 'CategoryCode', value: categoryCode.TrustEventItem, DBType: 'string' },
                    { Name: 'Operator', value: operator, DBType: 'string' }
                ]
            };
            common.ExecuteGetData(true, svcUrl, 'TrustManagement', executeParam, function (data) {
                if (data && data.length > 0) {
                    GSDialog.HintWindow("保存成功!", function () { $("#mask").remove() });
                } else {
                    GSDialog.HintWindow("保存失败", function () { $("#mask").remove() });
                }
            });
        }

    }

    var saveQualitative = function (Operator, ItemListId) {
        var itemId = itemEventModel[activeId].ItemId;
        var displayDescribe = $("#DisplayDescribe").val();

        if (displayDescribe == "") {
            GSDialog.HintWindow("不能为空值", function () { }, "", false);
            return false;
        }

        var executeParam = {
            SPName: 'usp_SaveItemList', SQLParams: [
                { Name: 'ItemListId', value: ItemListId, DBType: 'int' },
                { Name: 'DisplayDescribe', value: displayDescribe, DBType: 'string' },
                { Name: 'CategoryCode', value: categoryCode.TrustQualitativeItem, DBType: 'string' },
                { Name: 'Operator', value: Operator, DBType: 'string' },
            ]
        };
        common.ExecuteGetData(true, svcUrl, 'TrustManagement', executeParam, function (data) {
            if (data && data.length > 0) {
                saveItemListExtensionEvent(itemId, data[0].ItemListId);


                //$("#circumstances").dialog("close");
            } else {

                GSDialog.HintWindow("保存失败");
            }
        });
    }


    var delQualitative = function () {
        var itemId = itemEventModel[activeId].ItemId;
    }






    var saveRation = function (Operator, ItemListId, TYPE) {
        var itemId = itemEventModel[activeId].ItemId;
        var displayDescribe = $("#RationDescribe").val();
        var calculationCode = $('#CalculationCode').val();
        var currentValue = $("#CurrentValue").val();
        var condition = $("#Condition").val();
        var threshold = $("#Threshold").val();
        if (displayDescribe == "" || threshold == '' || condition == '') {
            GSDialog.HintWindow("不能为空值", function () {
            }, "", false);
            return false;
        } else {
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
            var executeParam = {
                SPName: 'usp_SaveItemList', SQLParams: [
                    { Name: 'ItemListId', value: ItemListId, DBType: 'int' },
                    { Name: 'DisplayDescribe', value: displayDescribe, DBType: 'string' },
                    { Name: 'CategoryCode', value: categoryCode.TrustRationItem, DBType: 'string' },
                    { Name: 'Operator', value: Operator, DBType: 'string' },
                ]
            };
            common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
                if (data && data.length > 0) {
                    if (TYPE == 'add') {
                        saveRationInfo(data[0].ItemListId, calculationCode, currentValue, val, threshold, TYPE);
                    } else {
                        saveRationInfo(ItemListId, calculationCode, currentValue, val, threshold, '');
                    }
                } else {
                    GSDialog.HintWindow("保存失败", function () { $("#mask").remove() });
                }
            });
        }
        return false

    }

    var trustEventConvertXML = function () {
        var checking = '<![CDATA[' +
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
                '</main>' +
              ']]>'
        var trustEventXMLTemplate = '<Trust>'
                + '<ItemId>{0}</ItemId>'
                + '<ItemCode>{1}</ItemCode>'
                + '<EventStatus>{2}</EventStatus>'
                + '<Checking>{3}</Checking>'
                + '<Triggering>{4}</Triggering>'
                + '<TriggeredBy>{5}</TriggeredBy>'
                + '<TriggeredQualitative>{6}</TriggeredQualitative>'
                + '<TriggeredRecords>{7}</TriggeredRecords>'
                + '<EventType>{8}</EventType>'
                + '</Trust>';
        if (itemEventModel && itemEventModel.length > 0) {
            var eventArray = { ItemId: '', ItemCode: '', EventStatus: 'N'/*, StartDate: null, EndDate: null*/, Checking: '', Triggering: 'NA', TriggeredBy: 'NA', TriggeredQualitative: 'NA', TriggeredRecords: 'NA', RationSelected: '', QualitativeSelected: '', EventType: '' };
            var eventXML = '';
            var itemXML = '';
            $(itemEventModel).each(function (i, event) {
                if (event.IsCheck) {
                    var triggeredRecords = [];
                    var strTtriggeredRecords = '';
                    var triggeredBy = [];
                    var strTriggeredBy = '';
                    var triggeredQualitative = [];
                    var strTriggeredQualitative = '';
                    $(itemEventModel[i].ItemList).each(function (i, list) {
                        //if (list.IsCheck) {
                        var tchecking
                        //判断条目是否已有，有：ItemCode以逗号隔开，并找到对应的事件记录关系
                        eventArray.ItemId = list.ItemListId;
                        eventArray.ItemCode = list.ItemListCode;
                        eventArray.Triggering = event.ItemCode;
                        if (list.CategoryCode == categoryCode.TrustQualitativeItem) {
                            eventArray.TriggeredRecords = list.DisplayDescribe;
                            eventArray.EventType = eventType.QualitativeCondition;
                            triggeredRecords.push(eventArray.TriggeredRecords);
                            triggeredQualitative.push(list.ItemListCode)
                            tchecking = checking.format('0.02', 'NA', 'NA');
                        }
                        if (list.CategoryCode == categoryCode.TrustRationItem && list.ItemListCode != '') {
                            eventArray.EventType = eventType.BreachCondition;
                            triggeredBy.push(list.ItemListCode);
                            var condition = list.Condition;
                            tchecking = checking.format(list.CurrentValue, condition, list.Threshold);
                        }
                        itemXML += trustEventXMLTemplate.format(eventArray.ItemId, eventArray.ItemCode, eventArray.EventStatus,
                            tchecking, eventArray.Triggering, eventArray.TriggeredBy, eventArray.TriggeredQualitative, strTtriggeredRecords, eventArray.EventType);
                        //}
                    });
                    eventArray.Triggering = 'NA';
                    strTtriggeredRecords = triggeredRecords.join("$$");
                    triggeredRecords = [];
                    strTriggeredBy = triggeredBy.join(",");
                    triggeredBy = [];
                    strTriggeredQualitative = triggeredQualitative.join(",");
                    triggeredQualitative = [];
                    eventXML += trustEventXMLTemplate.format(event.ItemId, event.ItemCode, eventArray.EventStatus,
                    checking.format('0.02', 'NA', 'NA'), eventArray.Triggering, strTriggeredBy, strTriggeredQualitative, strTtriggeredRecords, eventType.SpecificPlan);
                }
            });
            console.log()
        }
        return trustEventXML = "<Trusts>{0}</Trusts>".format(eventXML + itemXML);
    }


    function delItemList(executeParam) {
        //var v = $(event.target).parent().parent().attr('itemlistid');
        //if (confirm("是否删除选中项?")) {
        var temp = common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
            if (data && data.length > 0) {
                GSDialog.HintWindow("删除成功！", function () {
                    location.reload(true);
                });

                //$(event.target).parent().parent().remove();
                //$(event.target).parent().parent().parent().remove();
            } else { GSDialog.HintWindow("删除失败！", function () { }); }
        });
        //}

    }



    this.delRation = function (e) {

        var v = $(event.target).parent().parent().find('#chkRation').attr('value');

        if (!v) return false;

        if (confirm("是否删除选中项?")) {

            var executeParam = {
                SPName: 'usp_DeleteItemRation', SQLParams: [
                    { Name: 'ItemId', value: v, DBType: 'int' }
                ]
            };

            var temp = common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
                if (data && data.length > 0) {
                    GSDialog.HintWindow("删除成功！");
                    //var v = $(event.target).parent().parent().remove();
                } else { GSDialog.HintWindow("删除失败！"); }
            });
        }
    }
    //选中条件
    this.ClickItem = function (e) {
        var CurrentObj = $(e);
        itemlistid = CurrentObj.attr('itemlistid');
        CurrentObj.addClass("ConditionItem").siblings().removeClass("ConditionItem");
    }
    //数字特殊符号筛选
    $("#CurrentValue").keyup(function () {
        var obj = $(this)[0];
        common.NumberTest(obj);
    })
    $("#Threshold").keyup(function () {
        var obj = $(this)[0];
        common.NumberTest(obj);
    })
    //双击编辑条件
    this.EditItem = function (v) {
        var Val = $(v).parent().find(".list").html();
        //var Val = $(v).find(".list").html();
        var ItemListId = $(v).attr("ItemListId");
        $("#DisplayDescribe").val(Val)
        $.anyDialog({
            title: "定性条件",
            width: "400",
            height: "246",
            html: $('#circumstances'),
            mask: false,
            changeallow: false
        })
        $("#QualitativeBtn").off();
        $("#QualitativeBtn").click(function () {
            saveQualitative(' ', ItemListId);
        })
        //$('#circumstances').dialog({
        //    resizable: false,
        //    width: 400,
        //    height: 300,
        //    modal: true,
        //    close: null,
        //    buttons: {
        //        "OK": function () {
        //            saveQualitative(' ', ItemListId);
        //        }
        //    },
        //    open: function () {
        //        $("#DisplayDescribe").val(Val)
        //    },
        //    close: function () {

        //    }
        //});

        //closeX();
    }

    this.AddBackGround = function (v) {
        $(v).addClass("HoverTd").siblings().removeClass('HoverTd')
    }
    this.removeBackGround = function (v) {
        $(v).removeClass("HoverTd")
    }
    this.CheckInput = function (e) {
        var CurrentObj = $(e);
        chkRation = $(e).val();
    }
    this.EditRationDescribe = function (v) {
        $("#QuantitativeBtn").hide();
        $("#ReQuantitativeBtn").show();
        var CurrentObj = $(v);
        var Ration = CurrentObj.attr('id').split("_");
        var RationId = Ration[1];
        var txtDescribe = CurrentObj.find('#txtDescribe').html();
        var txtCalculationDesc = CurrentObj.find('#txtCalculationDesc').html();
        var txtCurrentValue = CurrentObj.find('#txtCurrentValue').html();
        var val = '';
        var drpCondition = CurrentObj.find('.drpCondition').attr("value");
        switch (drpCondition) {
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
            case '>':
                val = 'gt';
                break;
            case "":
                val = 'ge';
                break;
            case 'lt':
                val = '<';
                break;
            case 'ge':
                val = '≥';
                break;
            case 'ne':
                val = '≠';
                break;
            case 'eq':
                val = '=';
                break;
            case 'le':
                val = '≤';
                break;
            case 'gt':
                val = '>';
                break;
        }

        var txtThreshod = CurrentObj.find('#txtThreshod').val();
        $("#RationDescribe").val(txtDescribe);
        $('#CalculationCode option:selected').val(txtCalculationDesc);
        $("#CurrentValue").val(txtCurrentValue);
        $("#Condition").val(val);
        $("#Threshold").val(txtThreshod);
        $.anyDialog({
            title: "定量条件",
            width: "750",
            height: "250",
            html: $('#circumstances2'),
            mask: true,
            changeallow: false
        })
        $("#ReQuantitativeBtn").click(function () {
            saveRation('', RationId, '');
            $("#ReQuantitativeBtn").hide();
        })
        //$('#circumstances2').dialog({
        //    resizable: false,
        //    width: 750,
        //    height: 250,
        //    modal: true,
        //    close: null,
        //    buttons: {
        //        "OK": function () {
        //            saveRation('', RationId, '');
        //        }
        //    },
        //    open: function () {
        //        $("#RationDescribe").val(txtDescribe);
        //        $('#CalculationCode option:selected').val(txtCalculationDesc);
        //        $("#CurrentValue").val(txtCurrentValue);
        //        $("#Condition").val(val);
        //        $("#Threshold").val(txtThreshod);
        //    },
        //    close: function () {

        //    }
        //});

        //closeX();

    }

    this.changEvent = function (obj) {
        if (obj) {
            $("#eventList").find("li").each(function (i, value) {
                $(value).removeAttr("style");
            });
            activeId = $(obj).attr("activeid");
            $(obj).attr("style", "background-color: rgba(59,62,93,0.8);color: #fff;");
            if ($(obj).find("input[name='eventGruop']").prop("checked")) {
                itemEventModel[activeId].IsCheck = true;
            } else {
                itemEventModel[activeId].IsCheck = false;
                $(itemEventModel[activeId].ItemList).each(function (i, list) {
                    list.IsCheck = false;
                })
            }

        } else {
            $("#eventList").find("li").each(function (i, value) {
                if (i == activeId) {
                    $(value).attr("style", "background-color:rgba(59,62,93,0.8);color:#fff");
                } else {
                    $(value).removeAttr("style");
                }

            });
        }
        $("#eventName").text(itemEventModel[activeId].ItemAliasValue);
        renderSelectedQualitative();
        renderQualitative();
        renderRation();
    }

    var openEvent = function (operator) {
        $('#circumstances3').dialog({
            resizable: false,
            width: 400,
            height: 300,
            modal: true,
            close: null,
            buttons: {
                "OK": function () {
                    saveEvent(operator);
                    //$(this).dialog("close");
                }
            },
            open: function () {
                $("#ItemCode").val("");
                $("#ItemAliasValue").val("");
            },
            close: function () {

            }
        });
    };

    var openQualitative = function () {

        $("#DisplayDescribe").val("")
        $.anyDialog({
            title: "定性条件",
            width: "400",
            height: "246",
            html: $('#circumstances'),
            mask: true,
            changeallow: false

        })
        $("#QualitativeBtn").off();
        $("#QualitativeBtn").click(function () {
            saveQualitative('new', 0);
        })

        //$('#circumstances').dialog({
        //    resizable: false,
        //    width: 400,
        //    height: 300,
        //    modal: true,
        //    close: null,
        //    buttons: {
        //        "OK": function () {
        //            saveQualitative('new',0);
        //        }
        //    },
        //    open: function () {
        //        $("#DisplayDescribe").val("")
        //    },
        //    close: function () {

        //    }
        //});

        //closeX();
    };
    $("#QuantitativeBtn").click(function () {
        saveRation('new', 0, 'add');
    })
    var openRation = function () {
        //$("#ReQuantitativeBtn").hide();
        $("#ReQuantitativeBtn").css("display", "none");
        $("#QuantitativeBtn").show();
        $("#QuantitativeBtn").css("display", "inline");
        $("#RationDescribe").val("");
        $('#CalculationCode option:first').prop("selected", 'selected');
        $("#CurrentValue").val("");
        $("#Condition").val("");
        $("#Threshold").val("");
        $.anyDialog({
            title: "定量条件",
            width: "750",
            height: "250",
            html: $('#circumstances2'),
            mask: true,
            changeallow: false
        })
        //$('#circumstances2').dialog({
        //    resizable: false,
        //    width: 750,
        //    height: 250,
        //    modal: true,
        //    close: null,
        //    buttons: {
        //        "OK": function () {
        //            saveRation('new',0,'add');
        //            //$(this).dialog("close");
        //        }
        //    },
        //    open: function () {
        //        $("#RationDescribe").val("");
        //        $('#CalculationCode option:first').prop("selected", 'selected');
        //        $("#CurrentValue").val("");
        //        $("#Condition option:selected").val("");
        //        $("#Threshold").val("");
        //    },
        //    close: function () {

        //    }
        //});

        //closeX();
    };

    var dataProcess = {
        setItemListToItemEventModel: function (sourceData) {

            if (itemEventModel && itemEventModel.length > 0) {
                $(itemEventModel).each(function (i, v) {
                    var arr = $.grep(sourceData, function (n, j) {
                        $.extend(n, { IsCheck: false });
                        return v.ItemId == n.ItemId;
                    });

                    $.extend(true, v, { ItemList: arr });
                });
            }
        }
    }


    function registerEvent() {
        $('#deleteEvent').click(function () {
            deleteItemEvent();
        })
        $('#newEvent').click(function () {
            openEvent('new');
        })
        $('#apply').click(function () {
        })
        $('#saveEvent').click(function () {
            var tmp = [];
            $("input:checked").each(function () {
                tmp.push($(this).attr('itemlistid'))
            })
            if (tmp.length == 0) {
                GSDialog.HintWindow('请先选择条目')
                return;
            }
            applyTrustEvent();
            saveTrustEvent();

        })
        $('#addRation').click(function () {
            $(".navbar-nav li").eq(1).trigger("click");
            openRation();
        })
        $('#addQualitative').click(function () {
            openQualitative();
        })
        $("#deleteCondition").click(function () {
            var rationIdList = [];
            var itemIdList = [];
            var tmp;

            $("#QualitativeList input:checked").each(function () {
                itemIdList.push($(this).attr('itemlistid'))
            })
            $("#rationList input:checked").each(function () {
                rationIdList.push($(this).attr('value'))
            })

            if ($('.active').children().html() == "定性列表") {
                tmp = itemIdList.join(',')
            } else {
                tmp = rationIdList.join(',')
            }
            if (tmp.length == 0) {
                GSDialog.HintWindow('请先选择条目')
                return;
            }
            try {
                var executeParam = {
                    SPName: 'usp_DeleteItemList', SQLParams: [
                        { Name: 'ItemListId', value: tmp, DBType: 'string' }
                    ]
                };
                delItemList(executeParam);
            }
            catch (err) {
                GSDialog.HintWindow('请先选择条目')
            }

        })

        //初始化定性定量tab状态
        function tab(nowList) {
            $('#tabLi>li').eq(nowList).addClass('active');
            $('#tabMain>div').hide()
            $('#tabMain>div').eq(nowList).show();
        }
        tab(nowTab);

        $('.rightTi .nav li').click(function (event) {
            //  GSDialog.HintWindow($(this).attr('tab'));
            var index = $(this).index()
            WebStorage.setItem('nowTab', index)
            nowTab = WebStorage.getItem('nowTab')
            event.preventDefault();
            $(this).closest('li').siblings().removeClass('active');
            $(this).addClass('active');
            var tab = $(this).find('a').attr('tab');
            $('#' + tab).siblings().hide();
            $('#' + tab).show();
            if (tab == 'rationL') {
                $("#ribbon_Ration").show();
                $("#ribbon_Qualitative").hide();
                if ($("#chkRation")[0]) {
                    if ($("#chkRation")[0].checked == true) {
                        chkRation = $("input[type='checkbox']").val();
                    }
                }
                var val = '';
                var drpCondition = $(".drpCondition");
                for (var ii = 0; ii < drpCondition.length; ii++) {
                    switch ($(drpCondition[ii]).attr("value")) {
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
                        case '>':
                            val = 'gt';
                            break;
                    }
                    if (val) {
                        $(drpCondition[ii]).find("option[value=" + val + "]").attr("selected", true);
                    }
                }
            } else {
                $("#ribbon_Ration").hide();
                $("#ribbon_Qualitative").show();
            }
        })
    }


    $("#droppable").droppable({
        onDrop: function (event, ui) {
            $(this)
              .addClass("ui-state-highlight")
              .find("p")
                .html("Dropped!");
        }
    });

    //$("#selectedQualitativeList, #QualitativeList").unbind();
    //$("#selectedQualitativeList, #QualitativeList").sortable({
    //    connectWith: ".connectedSortable",
    //    stop: function (event, ui) {
    //        var self = this;
    //        var curruentItem = ui.item;
    //        var targetId = $(curruentItem).parent().attr('id');
    //        if (targetId == "QualitativeList") {
    //            $(itemEventModel[activeId].ItemList).each(function (i, item) {
    //                if (item.ItemListId == $(curruentItem).attr('ItemListId')) {
    //                    item.IsCheck = false;
    //                }
    //            });
    //        }
    //        else if (targetId == "selectedQualitativeList") {
    //            $(itemEventModel[activeId].ItemList).each(function (i, item) {
    //                if (item.ItemListId == $(curruentItem).attr('ItemListId')) {
    //                    item.IsCheck = true;
    //                }
    //            });

    //        }

    //        var qualitativeDom = $(".connectedSortable").find("li");
    //        var newQualitative = [];

    //        $(qualitativeDom).each(function (i, d) {
    //            $(itemEventModel[activeId].ItemList).each(function (i, list) {

    //                if (list.ItemListId == $(d).attr("itemlistid")) {
    //                    //list.IsCheck = chkQualitative ? true : false;
    //                    newQualitative.push(list);
    //                }
    //            })
    //        })
    //        var removeQualitative = _.remove(itemEventModel[activeId].ItemList, function (n) {
    //            return n.CategoryCode == categoryCode.TrustQualitativeItem;
    //        });
    //        itemEventModel[activeId].ItemList = itemEventModel[activeId].ItemList.concat(newQualitative);
    //        //document.getElementById(targetId).innerHTML = "";

    //        renderSelectedQualitative();
    //        renderQualitative();
    //        //  GSDialog.HintWindow("hello");
    //    }
    //}).disableSelection();

})

