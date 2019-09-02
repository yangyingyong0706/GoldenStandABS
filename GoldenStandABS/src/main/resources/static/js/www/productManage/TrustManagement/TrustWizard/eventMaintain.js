String.prototype.format = function () {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function (match, number) {
        return typeof args[number] != 'undefined'
        ? args[number]
        : match
        ;
    });
};

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

Array.prototype.remove = function (dx) {
    if (isNaN(dx) || dx > this.length) { return false; }
    for (var i = 0, n = 0; i < this.length; i++) {
        if (this[i] != this[dx]) {
            this[n++] = this[i]
        }
    }
    this.length -= 1
}

var itemEventModel = [];
var trustEventModel = [];
var activeId = 0;
var eventType = { SpecificPlan: 'SpecificPlan', BreachCondition: 'BreachCondition', QualitativeCondition: 'QualitativeCondition' };
var categoryCode = { TrustPaymentScenario: 'TrustPaymentScenario', TrustEventItem: 'TrustEventItem', TrustRationItem: 'TrustRationItem', TrustQualitativeItem: 'TrustQualitativeItem' };
var TrustEventMaintainModule = (function () {

    //var svcUrl = "https://poolcutwcf/TrustManagementService/DataProcessService.svc/jsAccessEP/" + "CommonExecuteGet?";
    var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
    //var trustId = 0;

    

    var eventListTemplate = '<li class="clearfix" activeid="{0}" itemid="{1}" itemcode="{2}" categorycode="{3}" onClick="TrustEventMaintainModule.changEvent(this)"><span class="tick flt"><input type="checkbox" name="eventGruop" id="event_{1}" value="{1}"  {5}></span><span class="flt textTick">{4}</span></li>';//&#xe65a;
    var qualitativeItemListTemplate = '<li  ItemListId="{0}" CategoryId="{1}" ><span class="check"> <input type="checkbox" name="qualitativeGruop" id="qualitative_{0}" value="{0}" {3}></span><span class="list"><i>{4}</i>{2}</span></li>';
    var rationTemplate = ' <tr id="ration_{0}">'
                                    +'<td>'
                                        + '<div>' // class="middle"
                                            + '<input  type="checkbox" id="chkRation" value="{0}" {6}>'
                                        +'</div>'
                                    +'</td>'
                                    +'<td>'
                                        + '<input type="text" id="txtDescribe" class="form-control" value="{1}"  readonly="readonly">'
                                    +'</td>'
                                    +'<td>'
                                        + '<input type="text" id="txtCurrentValue" class="form-control" value="{2}">'
                                    +'</td>'
                                    +'<td>'
                                        +'<select id="drpCondition" value="{3}">'
                                        +'{4}'
                                        +'</select>'
                                    +'</td>'
                                    +'<td>'
                                        + '<input type="text" id="txtThreshod" class="form-control" value="{5}">'
                                    + '</td>'
                                +'</tr>';

    var options = '<option value="gt">&gt;</option>'
                + '<option value="ge">&ge;</option>'
                + '<option value="ne">&ne;</option>'
                + '<option value="eq">=</option>'
                + '<option value="lt">&lt;</option>'
                + '<option value="le">&le;</option>';


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

    function closeX() {
        $('.ui-dialog .ui-dialog-titlebar-close').removeClass('ui-button-icon-only');
        //$('.ui-dialog .ui-dialog-titlebar-close').css('border', '1px solid #ddd');
        //$('.ui-dialog .ui-dialog-titlebar-close').html("<i class='iconfont' style='color:#717070;'>&#xe636;<i>");
    }

    //渲染事件
    var renderEvent = function () {

        if (itemEventModel == null) {
            alert("have no scenario");
            document.getElementById("eventList").innerHTML = "";
        }
        else {
            var content = "";
            $.each(itemEventModel, function (i, v) {

                content += eventListTemplate.format(i, v.ItemId, v.ItemCode, v.CategoryCode, v.ItemAliasValue, (v.IsCheck ? "checked='checked'" : ""));
            })
            document.getElementById("eventList").innerHTML = content;
            changEvent();
        }
    }

    //获取事件
    var getItemEvent = function () {
        var executeParam = {
            SPName: 'usp_GetItemsByCategoryCode', SQLParams: [
                { Name: 'CategoryCode', value: categoryCode.TrustEventItem, DBType: 'string' }
            ]
        };
        ExecuteGetData(true, svcUrl, 'TrustManagement', executeParam, function (eventData) {
            if (eventData && eventData.length > 0) {
                $(eventData).each(function (i, v) {
                    $.extend(v, { IsCheck: false })
                });
                //activeId = 0;
                itemEventModel = eventData;
                getItemListByItemGroup();//获取所有事件下的触发条目
                checkTruestEvent();//选中专项计划的事件
                renderEvent();//重新渲染界面
            }
        });
    }

    //获取所有事件下的触发条目
    var getItemListByItemGroup = function () {
        var itemGroupTemplate = "<Item><id>{0}</id></Item>";
        var contentXml = "", itemGroup = "";
        $.each(itemEventModel, function (i, v) {
            contentXml += itemGroupTemplate.format(v.ItemId);
        })
        itemGroup = "<Items>{0}</Items>".format(contentXml);

        var executeParam = {
            SPName: 'usp_GetItemListByItemGroup', SQLParams: [
                { Name: 'ItemGroup', value: itemGroup, DBType: 'string' }
            ]
        };
        var sourceData = ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam);
        if (sourceData && sourceData.length > 0) {
            dataProcess.setItemListToItemEventModel(sourceData);
        }
    }

    //获取当前专项计划的事件与条目
    var getTrustEventConfig = function () {
        var executeParam = {
            SPName: 'usp_GetTrustEventsConfig', SQLParams: [
                { Name: 'trustId', value: trustId, DBType: 'string' }
            ]
        };
        var sourceData = ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam);
        if (sourceData && sourceData.length > 0) {
            trustEventModel = sourceData;
        }
    }

    //重新组织事件(itemEventModel)定性条目的显示顺序
    var sortQualitative = function () {
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

        itemEventModel[activeId].ItemList = checkQualitative.concat(noCheckQualitative);
    }

    //渲染当前事件下的定性条目
    var renderQualitative = function () {
        var content = "";
        var j = -1;
        if (itemEventModel[activeId].ItemList && itemEventModel[activeId].ItemList.length > 0) {
            $(itemEventModel[activeId].ItemList).each(function (i, ItemList) {
                if (ItemList.CategoryCode == categoryCode.TrustQualitativeItem) {
                    j++;
                    content += qualitativeItemListTemplate.format(ItemList.ItemListId, ItemList.CategoryId, ItemList.DisplayDescribe, (ItemList.IsCheck ? "checked='checked'" : ""), j + "、");
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
                    content += rationTemplate.format(ItemList.ItemListId, ItemList.DisplayDescribe, ItemList.CurrentValue, ItemList.Condition, optionStr, ItemList.Threshold, (ItemList.IsCheck ? "checked" : ""));
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

                $.each(itemEventModel[i].ItemList, function (i, it) {
                    $.each(trustEventModel, function (i, te) {
                        if (te.EventType == eventType.BreachCondition && te.ItemCode == it.ItemListCode) {
                            var parameter = $(te.Checking).find("Parameters").find("Parameter");
                            //xml格式
                            //  <main>
                            //  <Parameters>
                            //	<Parameter Name="sourceName" Type="" Value="DefaultRate" />
                            //	<Parameter Name="currentValue" Type="" Value="0.02 " />
                            //	<Parameter Name="Operator@" Type="ReplaceOperator" Operator="NA" />
                            //	<Parameter Name="targetName" Type="" Value="1" />
                            //	<Parameter Name="targetValue" Type="" Value="NA" />
                            //  </Parameters>
                            //  <Query name="SpeedupRepayment" type="EC" dispResult="">
                            //		@currentValue Operator@ @targetValue
                            //	  </Query>
                            //</main>

                            it.CurrentValue = parameter.eq(1).attr("value");//currentValue 读取节点属性
                            it.Condition = parameter.eq(2).attr("Operator");//Operator读取节点属性
                            it.Threshold = parameter.eq(4).attr("value");//targetValue读取节点属性
                            it.IsCheck = true;
                        }

                        if (te.EventType == eventType.QualitativeCondition && te.ItemCode == it.ItemListCode) {
                            it.IsCheck = true;
                        }
                    })
                })
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
        var data = ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam);

        if (data && data.length > 0) {
            alert("the itemCode exists in the database!");
            return false;
        } else { return true; }
    }

    //保存条目与事件的关系
    var saveItemListExtensionEvent = function (itemId, itemListId) {
        var executeParam = {
            SPName: 'usp_SaveItemListExtensionEvent', SQLParams: [
                { Name: 'ItemId', value: itemId, DBType: 'int' },
                { Name: 'ItemListId', value: itemListId, DBType: 'int' },
            ]
        };
        ExecuteGetData(true, svcUrl, 'TrustManagement', executeParam, function (data) {
            if (data && data.length > 0) {
                alert("saved successfuly!");
                getItemEvent();
            } else { alert("save error."); }
        });
    }

    //保存定量信息到基础表(Item)
    var saveRationInfo = function (itemListId, currentValue, condition, threshold) {
        var itemId = itemEventModel[activeId].ItemId;
        var executeParam = {
            SPName: 'usp_SaveRationInfo', SQLParams: [
                { Name: 'ItemListId', value: itemListId, DBType: 'int' },
                { Name: 'CurrentValue', value: currentValue, DBType: 'decimal' },
                { Name: 'Condition', value: condition, DBType: 'string' },
                { Name: 'Threshold', value: threshold, DBType: 'decimal' },
            ]
        };
        ExecuteGetData(true, svcUrl, 'TrustManagement', executeParam, function (data) {
            if (data && data.length > 0) {
                saveItemListExtensionEvent(itemId, itemListId);
                $("#circumstances2").dialog("close");
            } else { alert("save error."); }
        });
    }

    //应用条目到内存中
    var applyTrustEvent = function () {
        var rationDom = $("#rationList").find("tr");
        var qualitativeDom = $("#QualitativeList").find("li");
        var newQualitative = [];

        $(rationDom).each(function (i, d) {
            $(itemEventModel[activeId].ItemList).each(function (i, list) {
                var itemListId = $(d).find("input[id='chkRation']").val();
                var chkRation = $(d).find("input[id='chkRation']").attr("checked");
                if (list.ItemListId == itemListId) {
                    if (chkRation == "checked") {
                        var txtDescribe = $(d).find("input[id='txtDescribe']").val();
                        var txtCurrentValue = $(d).find("input[id='txtCurrentValue']").val();
                        var drpCondition = $(d).find("select[id='drpCondition']").find("option:selected").val();
                        var txtThreshod = $(d).find("input[id='txtThreshod']").val();

                        list.IsCheck = true;
                        list.DisplayDescribe = txtDescribe;
                        list.CurrentValue = txtCurrentValue;
                        list.Condition = drpCondition;
                        list.Threshold = txtThreshod;
                    } else {
                        list.IsCheck = false;
                    }
                }
            })

        })

        $(qualitativeDom).each(function (i, d) {
            $(itemEventModel[activeId].ItemList).each(function (i, list) {
                var itemListId = $(d).find("input[id='qualitative_" + list.ItemListId + "']").val();
                var chkQualitative = $(d).find("input[id='qualitative_" + list.ItemListId + "']").attr("checked");

                if (list.ItemListId == itemListId) {
                    list.IsCheck = chkQualitative ? true : false;
                    newQualitative.push(list);
                }
            })
        })

        var removeQualitative = _.remove(itemEventModel[activeId].ItemList, function (n) {
            return n.CategoryCode == categoryCode.TrustQualitativeItem;
        });

        itemEventModel[activeId].ItemList = itemEventModel[activeId].ItemList.concat(newQualitative);
        alert("apply successfuly!");
    }

    //保存专项计划事件与条目
    var saveTrustEvent = function () {
        var TrustEventXML = trustEventConvertXML();

        var executeParam = {
            SPName: 'usp_SaveTrustEvent', SQLParams: [
                { Name: 'TrustId', value: trustId, DBType: 'int' },
                { Name: 'TrustEventXML', value: TrustEventXML, DBType: 'xml' },
            ]

        };

        executeRemoteData(executeParam, function (data) {
            if (data) {
                alert("saved successfuly!");
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
            error: function (response) { alert("error is :" + response); }
        });
    }

    var deleteItemEvent = function () {

        var itemId = itemEventModel[activeId].ItemId;
        if (itemId && itemId < 0) return false;

        if (confirm("是否删除选中项?")) {

            var executeParam = {
                SPName: 'usp_DeleteItemEvent', SQLParams: [
                    { Name: 'ItemId', value: itemId, DBType: 'int' }
                ]
            };
            var temp = ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
                if (data && data.length > 0) {
                    alert("delete successfuly!");
                    activeId = 0;
                    getItemEvent();
                    return false;
                } else { alert("delete failure."); }
            });
        }

    }

    var saveEvent = function (operator) {
        var itemId = itemEventModel[activeId].ItemId;
        var itemCode = $("#ItemCode").val();
        var itemAliasValue = $("#ItemAliasValue").val();

        if (itemCode == "" || itemAliasValue == "") {
            alert("Cannot Empty!");
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
                ExecuteGetData(true, svcUrl, 'TrustManagement', executeParam, function (data) {
                    if (data && data.length > 0) {
                        alert("saved successfuly!");
                        activeId = itemEventModel.length;
                        getItemEvent();
                        $("#circumstances3").dialog("close");

                    } else {
                        alert("save error.");
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
            ExecuteGetData(true, svcUrl, 'TrustManagement', executeParam, function (data) {
                if (data && data.length > 0) {
                    alert("saved successfuly!");
                } else {
                    alert("save error.");
                }
            });
        }

    }

    var saveQualitative = function () {
        var itemId = itemEventModel[activeId].ItemId;
        var displayDescribe = $("#DisplayDescribe").val();

        if (displayDescribe == "") {
            alert("Cannot Empty!");
            return false;
        }

        var executeParam = {
            SPName: 'usp_SaveItemList', SQLParams: [
                { Name: 'ItemListId', value: 0, DBType: 'int' },
                { Name: 'DisplayDescribe', value: displayDescribe, DBType: 'string' },
                { Name: 'CategoryCode', value: categoryCode.TrustQualitativeItem, DBType: 'string' },
                { Name: 'Operator', value: 'new', DBType: 'string' },
            ]
        };
        ExecuteGetData(true, svcUrl, 'TrustManagement', executeParam, function (data) {
            if (data && data.length > 0) {
                saveItemListExtensionEvent(itemId, data[0].ItemListId);
                $("#circumstances").dialog("close");
            } else {
                alert("save error.");
            }
        });
    }

    var saveRation = function () {
        var itemId = itemEventModel[activeId].ItemId;
        var displayDescribe = $("#RationDescribe").val();
        var currentValue = $("#CurrentValue").val();
        var condition = $("#Condition option:selected").val();
        var threshold = $("#Threshold").val();

        if (displayDescribe == "") {
            alert("Cannot Empty!");
            return false;
        }

        var executeParam = {
            SPName: 'usp_SaveItemList', SQLParams: [
                { Name: 'ItemListId', value: 0, DBType: 'int' },
                { Name: 'DisplayDescribe', value: displayDescribe, DBType: 'string' },
                { Name: 'CategoryCode', value: categoryCode.TrustRationItem, DBType: 'string' },
                { Name: 'Operator', value: 'new', DBType: 'string' },
            ]
        };
        ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
            if (data && data.length > 0) {
                saveRationInfo(data[0].ItemListId, currentValue, condition, threshold);
            } else {
                alert("save error.");
            }
        });
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
            //+ '<StartDate>{3}</StartDate>'
            //+ '<EndDate>{4}</EndDate>'
            + '<Checking>{5}</Checking>'
            + '<Triggering>{6}</Triggering>'
            + '<TriggeredBy>{7}</TriggeredBy>'
            + '<TriggeredQualitative>{8}</TriggeredQualitative>'
            + '<TriggeredRecords>{9}</TriggeredRecords>'
            + '<RationSelected>{10}</RationSelected>'
            + '<QualitativeSelected>{11}</QualitativeSelected>'
            + '<EventType>{12}</EventType>'
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
                        if (list.IsCheck) {
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
                            if (list.CategoryCode == categoryCode.TrustRationItem) {
                                eventArray.EventType = eventType.BreachCondition;
                                triggeredBy.push(list.ItemListCode);
                                var condition = list.Condition;
                                tchecking = checking.format(list.CurrentValue, condition, list.Threshold);
                            }
                            itemXML += trustEventXMLTemplate.format(eventArray.ItemId, eventArray.ItemCode, eventArray.EventStatus, eventArray.StartDate, eventArray.EndDate,
                            tchecking, eventArray.Triggering, eventArray.TriggeredBy, eventArray.TriggeredQualitative, strTtriggeredRecords, eventArray.RationSelected, eventArray.QualitativeSelected, eventArray.EventType);

                        }
                    });
                    eventArray.Triggering = 'NA';
                    strTtriggeredRecords = triggeredRecords.join("$$");
                    triggeredRecords = [];
                    strTriggeredBy = triggeredBy.join(",");
                    triggeredBy = [];
                    strTriggeredQualitative = triggeredQualitative.join(",");
                    triggeredQualitative = [];
                    eventXML += trustEventXMLTemplate.format(event.ItemId, event.ItemCode, eventArray.EventStatus, eventArray.StartDate, eventArray.EndDate,
                    checking.format('0.02', 'NA', 'NA'), eventArray.Triggering, strTriggeredBy, strTriggeredQualitative, strTtriggeredRecords, eventArray.RationSelected, eventArray.QualitativeSelected, eventType.SpecificPlan);
                }
            });
            console.log()
        }
        return trustEventXML = "<Trusts>{0}</Trusts>".format(eventXML + itemXML);
    }

    var changEvent = function (obj) {

        if (obj) {
            $("#eventList").find("li").each(function (i, value) {
                $(value).removeAttr("style");
            });
            activeId = $(obj).attr("activeid");
            $(obj).attr("style", "background-color:#94A6C1;color:#fff");
            if ($(obj).find("input[name='eventGruop']").attr("checked")) {
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
                    $(value).attr("style", "background-color:#94A6C1;color:#fff");
                } else {
                    $(value).removeAttr("style");
                }

            });
        }
        $("#eventName").text(itemEventModel[activeId].ItemAliasValue);
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

        closeX();
    };

    var openQualitative = function () {
        $('#circumstances').dialog({
            resizable: false,
            width: 400,
            height: 300,
            modal: true,
            close: null,
            buttons: {
                "OK": function () {
                    saveQualitative();
                    //$(this).dialog("close");
                }
            },
            open: function () {
                $("#DisplayDescribe").val("")
                //if ($('#circumstances').val() == '') {
                //    $('#circumstances').append(dom2);
                //}
            },
            close: function () {

            }
        });

        closeX();
    };

    var openRation = function () {
        $('#circumstances2').dialog({
            resizable: false,
            width: 700,
            height: 250,
            modal: false,
            close: null,
            buttons: {
                "OK": function () {
                    saveRation();
                    //$(this).dialog("close");
                }
            },
            open: function () {
                $("#RationDescribe").val("");
                $("#CurrentValue").val("");
                $("#Condition option:selected").val("");
                $("#Threshold").val("");
            },
            close: function () {

            }
        });

        closeX();
    };

    var previewString = function () {

        var tmpl = '<div class="ItemBox"><h3 class="h3">专项事件及增信</h3><div class="ItemInner">{0}</div></div>';
        var tmpl_content = '<div class="ItemContent"><div class="ItemTitle">{0}</div>{1}</div>';
        var tmpl_item = '<div class="Item"><label>{0}</label></div>';

        var contents = '';
        //var selector = '#' + domNodeId + ' table:eq(0) tr.isPreview';
        //$(selector).each(function (i, obj) {
        //    var $tr = $(obj);
        //    var itemTitle = $tr.children('td:eq(0)').html();
        //    var items = '';
        //    $tr.children('td:eq(1)').find('.addedTriggeredRecord').each(function (s, ckb) {
        //        var record = $(this).val();
        //        if (record) {
        //            items += tmpl_item.format(record);
        //        }
        //    });
        //    contents += tmpl_content.format(itemTitle, items);
        //});

        var selectEvent = $.grep(itemEventModel, function (n, i) {
            return n.IsCheck == true;
        });
        $(selectEvent).each(function (i, event) {
            var itemTitle = event.ItemAliasValue;
            var items = '';
            var selectItem = $.grep(itemEventModel[i].ItemList, function (n, i) {
                return  n.CategoryCode == categoryCode.TrustQualitativeItem && n.IsCheck == true;
            });
            console.log(selectItem);
            $(selectItem).each(function (i, item) {
                items += tmpl_item.format(item.DisplayDescribe);
            });
            contents += tmpl_content.format(itemTitle, items);
        });
        var strRtn = tmpl.format(contents); //alert(strRtn);
        return strRtn;
    };

    var stop=function (event, ui) {
        //applyTrustEvent();
        var qualitativeDom = $("#QualitativeList").find("li");
        var newQualitative = [];
        $(qualitativeDom).each(function (i, d) {
            $(itemEventModel[activeId].ItemList).each(function (i, list) {
                var itemListId = $(d).find("input[id='qualitative_" + list.ItemListId + "']").val();
                var chkQualitative = $(d).find("input[id='qualitative_" + list.ItemListId + "']").attr("checked");

                if (list.ItemListId == itemListId) {
                    list.IsCheck = chkQualitative ? true : false;
                    newQualitative.push(list);
                }
            })
        })
        var removeQualitative = _.remove(itemEventModel[activeId].ItemList, function (n) {
            return n.CategoryCode == categoryCode.TrustQualitativeItem;
        });
        itemEventModel[activeId].ItemList = itemEventModel[activeId].ItemList.concat(newQualitative);
        document.getElementById("QualitativeList").innerHTML = "";
        TrustEventMaintainModule.renderQualitative();
        
    };

    return {
        getTrustEventConfig: getTrustEventConfig,
        getItemEvent: getItemEvent,
        applyTrustEvent: applyTrustEvent,
        saveTrustEvent: saveTrustEvent,
        openRation: openRation,
        openQualitative: openQualitative,
        changEvent: changEvent,
        openEvent: openEvent,
        deleteItemEvent: deleteItemEvent,
        PreviewString: previewString,
        renderQualitative: renderQualitative
    }

})();

var ScenarioWithEventModule = (function () {
    var viewModel;
    //var trustId = '1';
    var currentScenarioId
    var allItems = [];
    var currentScenarioName = "";
    var scenarioNames = [];
    var myModel = {
        ScenarioList: [],
        EventListInTrust: [],
        EventListInScenario: []
    }
   
    function regiserEvent() {


        $(".dropdown-btn").click(function () {
            $(".flow-list").toggle();
        })

        $(".role-item").click(function () {
            $(this).addClass("active").siblings().removeClass("active");
        })
        $(".search-btn").click(function () {
            $(".role-item").removeClass("active");
            viewModel.PermissionsInRole.removeAll();
            $(".role-item").each(function () {
                if ($(this).text().trim().indexOf($("#dropDownItemName").val().trim()) == -1) {
                    $(this).hide();
                } else {
                    $(this).show();
                }
            })
        })
        $("#dropDownItemName").keyup(function (event) {
            if (event.keyCode == 13) {
                $(".search-btn").click();
            };
            if (!$(this).val().trim()) {
                $(".role-item").show();
            }
        })
        $(".dropdown").click(function (event) {
            event.stopPropagation();
        })
        $(document).click(function () {
            $(".flow-list").hide();
        })
        //初始化
        $(".role-item").eq(0).click();

        $("#AddNewScenario").click(function () {
            var newScenario = '<li class="role-item" id="newScenario">' +
                            '<span"><input id="toSelect" style="width:90px;margin-top:4px;"></input></span>' +
                            '<i class="icon-right-open-1 pull-right"></i>' +
                            '</li>'
            $(".role-list").append(newScenario);
            $("#toSelect").change(function () {
                var itemText = $(this).val();
                currentScenarioName = itemText;
                if (itemText != "") {
                    if ($.inArray(itemText, scenarioNames) > -1) {
                        alertMsg("该偿付情景已经存在！");
                        $("#toSelect").val("");
                        return;
                    }
                    $("#newScenario").remove();
                    saveScenarioSequence();
                }
            });
        });
    }

    function selectScenario(indexF, data, event) {
        currentScenarioId = data.ScenarioId();
        ScenarioWithEventModule.viewModel.EventListInScenario.removeAll();
        getEventsByScenarioId(trustId, currentScenarioId, function (data) {
            $.each(data, function (i, d) {
                var event = { "CategoryId": d.CategoryId, "EventCode": d.EventCode, "EventId": d.EventId, "EventName": d.EventName, "ScenarioId": currentScenarioId }
                ScenarioWithEventModule.viewModel.EventListInScenario.push(event);
            })
        })
    }

    function addEvent(data) {
        var isExited = false;
        var events = ScenarioWithEventModule.viewModel.EventListInScenario();
        $.each(events, function (i, v) {
            if (v.EventCode.trim() == data.EventCode()) {
                isExited = true;
                alertMsg(data.EventName() + "已经存在", 0);
                return false;
            }
        });

        if (!isExited) {
            var event = { "CategoryId": data.CategoryId(), "EventCode": data.EventCode(), "EventId": data.EventId(), "EventName": data.EventName(), "ScenarioId": currentScenarioId }
            //var permission = { "StateCode": data.StateCode(), "StateName": data.StateName() };
            ScenarioWithEventModule.viewModel.EventListInScenario.push(event);
            var eventlist = [];
            var strEventList = '';
            $.each(ScenarioWithEventModule.viewModel.EventListInScenario(), function (i, v) {
                eventlist.push(v.EventCode);
            });
            strEventList = eventlist.join(",");
            saveEventToPaymentSequence(trustId, currentScenarioId, strEventList, function (result) {
                if (result && result.length > 0) {
                    alertMsg("添加事件成功！", 1);
                }
            });
        }
    }

    function deleteEventInScenario(data) {
        if (confirm('确定删除吗？')){
            ScenarioWithEventModule.viewModel.EventListInScenario.remove(data);
            var eventlist = [];
            var strEventList = '';
            $.each(ScenarioWithEventModule.viewModel.EventListInScenario(), function (i, v) {
                eventlist.push(v.EventCode);
            });
            strEventList = eventlist.join(",");
            deleteEventFromPaymentSequence(trustId, currentScenarioId, strEventList, function (result) {
                if (result && result.length > 0) {
                    alertMsg("删除成功！", 1);
                }

            });
        }
    }

    function deleteEventFromPaymentSequence(trustId, scenarioId, eventList, callback) {
        var executeParam = {
            'SPName': "usp_SaveEventsToPaymentSequence", 'SQLParams': [
                { 'Name': 'TrustId', 'Value': trustId, 'DBType': 'int' },
                { 'Name': 'ScenarioId', 'Value': scenarioId, 'DBType': 'int' },
                { 'Name': 'EventList', 'Value': eventList, 'DBType': 'string' }
            ]
        };
        var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
        ExecuteGetData(false, serviceUrl, 'TrustManagement', executeParam, callback);
    }
    function getScenarioListByTrustId(trustId) {
        var executeParam = {
            'SPName': "usp_GetTrustPaymentSequence", 'SQLParams': [
                { 'Name': 'TrustId', 'Value': trustId, 'DBType': 'int' }
            ]
        };
        var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
        ExecuteGetData(false, serviceUrl, 'TrustManagement', executeParam, function (data) {
            myModel.ScenarioList = data;
        });
        $.each(myModel.ScenarioList, function (i, v) {
            scenarioNames.push(v.ScenarioName);
        });
    }

    function getEventsByScenarioId(trustId, scenarioId, callbak) {
        var executeParam = {
            'SPName': "usp_GetEventsByScenarioId", 'SQLParams': [
                { 'Name': 'TrustId', 'Value': trustId, 'DBType': 'int' },
                { 'Name': 'ScenarioId', 'Value': scenarioId, 'DBType': 'int' }
            ]
        };
        var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
        ExecuteGetData(false, serviceUrl, 'TrustManagement', executeParam, callbak);
    }

    function getEventsByTrustId(trustId) {
        var executeParam = {
            'SPName': "usp_GetEventsByScenarioId", 'SQLParams': [
                { 'Name': 'TrustId', 'Value': trustId, 'DBType': 'int' }
            ]
        };
        var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
        ExecuteGetData(false, serviceUrl, 'TrustManagement', executeParam, function (data) {
            viewModel.EventList = data;

            //alert("支付顺序保存成功！");
        });
    }

    function getEventlistInTrust(trustId/*,callBack*/) {
        $.ajax({
            type: "GET",
            url: GlobalVariable.DataProcessServiceUrl + 'GetTrustEvents/TrustManagement/' + trustId,
            dataType: "json",
            contentType: "application/xml;charset=utf-8",
            cache: false,
            async: false,
            data: {},
            success: function (response) {
                if (response) {
                    setDataModel(eval(response));
                }
            },
            error: function (response) { alert(defMsg.loadingError); }
        });
    };
    function setDataModel(sourceData) {
        $.each(sourceData, function (i, data) {
            var eventType = data.EventType;
            if (eventType === 'SpecificPlan') {
                var eventListInTrust = { "CategoryId": 9, "EventCode": data.ItemCode, "EventName": data.EventDescription, "EventId": data.ItemId, "ScenarioId": currentScenarioId }
                myModel.EventListInTrust.push(eventListInTrust);

            }
        });
        //myModel.EventListInTrust = temp;
        console.log(myModel.EventListInTrust);
    }

    function saveEventToPaymentSequence(trustId, scenarioId, eventList, callback) {
        var executeParam = {
            'SPName': "usp_SaveEventsToPaymentSequence", 'SQLParams': [
                { 'Name': 'TrustId', 'Value': trustId, 'DBType': 'int' },
                { 'Name': 'ScenarioId', 'Value': scenarioId, 'DBType': 'int' },
                { 'Name': 'EventList', 'Value': eventList, 'DBType': 'string' }
            ]
        };
        var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
        ExecuteGetData(false, serviceUrl, 'TrustManagement', executeParam, callback);
    }

    var saveScenarioSequence = function () {
        if (currentScenarioName == "") {
            alertMsg("请添加新的偿付情景", 1);
            return false;
        }
        //viewModel.ScenarioList.removeAll();
        var scenarioObj = new Object();
        scenarioObj.TrustId = trustId;
        scenarioObj.ScenarioName = currentScenarioName;
        scenarioObj.StartDate = "";
        scenarioObj.EndDate = "";
        scenarioObj.PrincipalPrecision = "";
        scenarioObj.InterestPrecision = "";
        scenarioObj.AllowInterestToPrincipal = false;
        var levels = [];
        scenarioObj.Levels = levels;
        var scenariotoJsonStr = JSON.stringify(scenarioObj);
        var executeParam = {
            SPName: 'usp_SaveTrustPaymentSequenceNew', SQLParams: [
                { Name: 'TrustId', value: trustId, DBType: 'string' },
                { Name: 'ScenarioName', value: currentScenarioName, DBType: 'string' },
                { Name: 'StartDate', value: scenarioObj.StartDate, DBType: 'string' },
                { Name: 'EndDate', value: scenarioObj.EndDate, DBType: 'string' },
                { Name: 'PrincipalPrecision', value: scenarioObj.PrincipalPrecision, DBType: 'string' },
                { Name: 'InterestPrecision', value: scenarioObj.InterestPrecision, DBType: 'string' },
                { Name: 'PaymentSequence', value: scenariotoJsonStr, DBType: 'string' },
            ]
        };

        ExecuteRemoteData(executeParam, function (postbackdata) {
            var executeParam = {
                'SPName': "usp_GetTrustPaymentSequence", 'SQLParams': [
                    { 'Name': 'TrustId', 'Value': trustId, 'DBType': 'int' }
                ]
            };
            var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
            ExecuteGetData(false, serviceUrl, 'TrustManagement', executeParam, function (data) {
                var scenarioData = eval(data);
                var index = data.length;
                var event = scenarioData[scenarioData.length - 1];
                ScenarioWithEventModule.viewModel.ScenarioList.push(ko.mapping.fromJS(event));
                scenarioNames.push(scenarioData.ScenarioName);

                //$.each(scenarioData, function (i,v) {
                //    var event = { "EventList": v.EventList, "PaymentSequence": v.PaymentSequence, "ScenarioId": v.ScenarioId, "ScenarioName": v.ScenarioName };

                //})

                var selectScenario = $(".role-item").eq(index - 1)
                selectScenario.click();
                $(".role-item").click(function () {
                    $(this).addClass("active").siblings().removeClass("active");
                })
                alertMsg("添加偿付情景成功！");
            });
        });

    };

    var removeScenario = function (data) {
        if (confirm('确定删除偿付情景吗？')) {
            var selectScenarioName = data.ScenarioName();
            if ($.inArray(selectScenarioName, scenarioNames) > -1) {
                var executeParam = {
                    SPName: 'usp_RemoveTrustPaymentSequence', SQLParams: [
                        { Name: 'TrustId', value: trustId, DBType: 'string' },
                        { Name: 'ScenarioName', value: selectScenarioName, DBType: 'string' },
                    ]
                };
                ExecuteRemoteData(executeParam, function (postbackdata) {
                    scenarioNames.remove(selectScenarioName);
                    //alert("删除偿付情景成功！");          
                });
            }
            ScenarioWithEventModule.viewModel.ScenarioList.remove(data);

            //若删除的为新建偿付情景，添加+Tab
            //if ($("#AddNewScenario").length == 0) {
            //    addNewScenarioToList();
            //}
            currentScenarioName = "";
            $(".role-item").eq(4).click();
        }
    };
    var ExecuteRemoteData = function (executeParam, callback) {
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
            async: false,
            success: function (response) {
                callback(response);
            },
            error: function (response) { alert("error is :" + response); }
        });
    }

    return {
        getScenarioListByTrustId: getScenarioListByTrustId,
        getEventlistInTrust: getEventlistInTrust,
        regiserEvent: regiserEvent,
        removeScenario: removeScenario,
        selectScenario: selectScenario,
        deleteEventInScenario: deleteEventInScenario,
        addEvent: addEvent,
        myModel: myModel,
        viewModel: viewModel
    }
})();

var dataProcess = (function () {
    var setItemListToItemEventModel = function (sourceData) {

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


    return {
        setItemListToItemEventModel: setItemListToItemEventModel
    };
})();

var TrustEventMaintainRegistor = {
    init: function () {
        trustId = getUrlParam('tid');
        if (trustId) {
            TrustEventMaintainModule.getTrustEventConfig();
        }
        TrustEventMaintainModule.getItemEvent();
        $("#QualitativeList").sortable({
            stop: function (event, ui) {
                //applyTrustEvent();
                var qualitativeDom = $("#QualitativeList").find("li");
                var newQualitative = [];
                $(qualitativeDom).each(function (i, d) {
                    $(itemEventModel[activeId].ItemList).each(function (i, list) {
                        var itemListId = $(d).find("input[id='qualitative_" + list.ItemListId + "']").val();
                        var chkQualitative = $(d).find("input[id='qualitative_" + list.ItemListId + "']").attr("checked");

                        if (list.ItemListId == itemListId) {
                            list.IsCheck = chkQualitative ? true : false;
                            newQualitative.push(list);
                        }
                    })
                })
                var removeQualitative = _.remove(itemEventModel[activeId].ItemList, function (n) {
                    return n.CategoryCode == categoryCode.TrustQualitativeItem;
                });
                itemEventModel[activeId].ItemList = itemEventModel[activeId].ItemList.concat(newQualitative);
                document.getElementById("QualitativeList").innerHTML = "";
                TrustEventMaintainModule.renderQualitative();

            }
        });
        //this.registControlsValueChange('#txtTest');
    },
    preview: function () {
        return TrustEventMaintainModule.PreviewString();
    }
}

viewTrustWizard.registerMethods(TrustEventMaintainRegistor);
