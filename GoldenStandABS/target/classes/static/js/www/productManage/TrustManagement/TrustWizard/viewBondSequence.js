//@ sourceURL=viewBondSequence.js
//add above line to enable chrome debugging

viewBondSequence = function () {
    var name = "viewTrustContent";
    var trustID = "";
    var jsonContent = "";
    var jsonItemCode = "";
    //var getItemCodeSPName = "usp_GetTrustServiceProviderItemCodes";
    var getAllItemSPName = "usp_GetTrustBondPaymentSequence";
    var getAllScenarioName = "usp_GetPaymentSequenceScenario";
    var saveSPName = "usp_SaveTrustBondPaymentSequence";
    var removeTrustBondPaymentSequence = "usp_RemoveTrustBondPaymentSequence";
    var sequenceNo = 0;
    var tempTargetChildObj = "";
    var tempTargetObj = "";
    var isAdd = false;
    var scenarioId = "";
    var arrexistSequence = new Array();
    var allScenarios = "";
    var tmsSessionServiceBase = GlobalVariable.TrustManagementServiceUrl;

    var viewTemplate = "<div class='divTab' style='width:99%;'>" +
                            "<div class='divTabHead' id='sScenarioList'></div>" +
                            "<div class='searchPanel' style='height:2px'></div>" +
                            "<div style='height:30px'>" +
                                "<div style='width:60px;float:left;'><input type='button' value='添 加' id='bt_Add' style='font-size: 12px' /></div>" +
                                "<div style='width:60px;float:left;'><input type='button' value='保 存' id='bt_Save' style='font-size: 12px' /></div>" +
                                "<div style='width:60px;float:left;'><input type='button' value='取 消' id='bt_Cancel' style='font-size: 12px' /></div>" +
                                "<div style='clear:both'></div>" +
                            "</div>" +
                            "<div style='width:775px'>    " +
                                "<div class='grayDivTableHead' style='width:148px'>分层</div>" +
                                "<div class='grayDivTableHead' style='width:140px'>本金</div>" +
                                "<div class='grayDivTableHead' style='width:140px'>利息</div>" +
                                "<div class='grayDivTableHead' style='width:140px'>是否由本金补足</div>" +
                                "<div class='grayDivTableHeadRight' style='width:140px'>百分比</div>" +
                                "<div style='clear:both'></div>" +
                            "</div>" +
                            //"<div style='width:191px;float:left' id='bondLevelCell'></div>" +
                            "<div class='sVariables' style='width:775px;'></div>" +
                            "<div style='clear:both'></div>" +
                            "<div style='height:10px'><div style='clear:both'></div></div>" +
                            "<div style='height:40px;width:763px;border:#BDBDBD solid 1px;line-height:28px;offsetTop:5px' id='orderButtons'>" +
                            "</div>" +
                        "</div>";
    var scenarioTemplate = "<div class='{2}'><input type='hidden' value='{0}' />{1}</div><div style='width:5px;float:left'></div>";
    var contentTemplate = "<div class='grayDivTableHeadCell' data='{0}' style='width:148px'>{0}</div>" +
                            "<div class='grayDivTableCell' data='{0}' style='width:140px' id='{1}'>{2}</div>" +
                            "<div class='grayDivTableCell' data='{0}' style='width:140px' id='{3}'>{4}</div>" +
                            "<div class='grayDivTableCell' data='{0}' style='width:140px'><input type='checkbox' {5} /></div>" +
                            "<div class='grayDivTableCellRight'  data='{0}' style='width:140px'><input style='width:100px' type='text' value='{6}' />&nbsp;%" +
                                "&nbsp;<span class='removeLevel' data='{0}' style='float:right;cursor:pointer'> X </span></div>";;
    var addRowTemplate = "<div style='width:780px' id='NewItemArea'>" +
                            "<div class='grayDivTableHeadCell' style='width:148px'><input style='width:140px' id='bondLevel' type='text' /></div>" +
                            "<div class='grayDivTableCell' style='width:140px' id='{0}'></div>" +
                            "<div class='grayDivTableCell' style='width:140px' id='{1}'></div>" +
                            "<div class='grayDivTableCell' style='width:140px'><input type='checkbox' /></div>" +
                            "<div class='grayDivTableCellRight' style='width:140px'><input style='width:100px' type='text' value='' />&nbsp;%</div>" +
                        "</div>";

    var orderButtonTemplate = "<div class='graySingleDiv' style='width:60px;float:left'>{0}</div>";

    String.prototype.format = function () {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] != 'undefined'
            ? args[number]
            : match
            ;
        });
    };

    // add support for dynamic scenario editing
    $.fn.enterKey = function (fnc) {
        return this.each(function () {
            $(this).keypress(function (ev) {
                var keycode = (ev.keyCode ? ev.keyCode : ev.which);
                if (keycode == '13') {
                    fnc.call(this, ev);
                }
            })
        })
    }
    $.fn.escapeKey = function (fnc) {
        return this.each(function () {
            $(this).keyup(function (ev) {
                var keycode = (ev.keyCode ? ev.keyCode : ev.which);
                if (keycode == '27') {
                    //alert($(this).val());
                    $(this).val("");
                    fnc.call(this, ev);
                }
            })
        })
    }

    /*
    var textEnter = function () {
        if ($(this).val().length > 0) {
            //alert('ok');
            $("#AddNewScenario").html($(this).val() + "<span class='removeScenario' style='float:right;'> X </span>");
            $(".removeScenario").click(function () {
                $(this).parent().parent().remove();
            });
            //save to db here
            var sContent = "{'SPName':'updateScenarioName','Params':{" +
                            "'AliasSetName':'zh-CN'" +
                            ",'TrustId':'" + trustID +
                            "','ScenarioName':'" + scenarioName +
                            "','PresentationJson':'" + currentJson +
                            "','CalculationSequence':'" + calculationSequence + "'}}";
            tMSSaveItem("TrustManagement", sContent);

            $("#AddNewScenario").unbind("click");
            $("#AddNewScenario").attr("id", "NewAddedScenario");

            var currentMaxId = 499;
            $("#" + name + " #sScenarioList").find("input[type='hidden']").each(function () {
                currentMaxId = Math.max(currentMaxId, $(this).val());
            });
            addNewScenarioToListTextVersion(currentMaxId + 1);
        }
        else {
            //alert('not ok');
            $("#AddNewScenario").html(addText);
        }
    };

    var addNewScenarioToListTextVersion = function (newScenarioId) {

        if (newScenarioId > 510) {
            return;
        }

        var addText = "<span id='AddNewScenario'> + </span>";
        $("#" + name + " #sScenarioList").append(scenarioTemplate.format(newScenarioId, addText, "divTabLi"));

        $("#AddNewScenario").click(function () {
            //alert('get you!'+ $(this).parent().attr("class"));
            $("#AddNewScenario").html("<input type='text' id='toType' style='width:90px;margin-top:4px;'></input>");
            $("#toType").focus();
            //$("#AddNewScenario").attr("id", "OldScenario");
            $("#toType").blur(textEnter);
            $("#toType").enterKey(textEnter);
            $("#toType").escapeKey(textEnter);
        });
    };*/

    var addNewScenarioToList = function () {
        var currentScenarioCount = $("#" + name + " #sScenarioList").find("input[type='hidden']").length;
        if (allScenarios.length>0 &&　currentScenarioCount >= allScenarios.length ) {
            return;
        }

        var addText = "<span id='AddNewScenario' style='display:block;width:100%;'> + </span>";
        $("#" + name + " #sScenarioList").append(scenarioTemplate.format(0, addText, "divTabLi"));

        $("#AddNewScenario").click(function () {
            //alert('get you!'+ $(this).parent().attr("class"));
            $("#AddNewScenario").html("<select id='toSelect' style='width:90px;margin-top:4px;'></select>");
            var sContent = "{'SPName':'" + getAllScenarioName + "','Params':{" +
                        "'AliasSetName':'zh-CN'}}";
            tMSGetItemCodes("TrustManagement", sContent, 'toSelect');
            $("#AddNewScenario").unbind("click");

            //$("#toType").focus();
            //$("#AddNewScenario").attr("id", "OldScenario");
            $("#toSelect").change(selectChange);
        });
    };

    var removeScenario = function () {
        var scenarioId = $(this).parent().parent().find("input[type='hidden']").val();
        //alert(scenarioId);
        var spName = removeTrustBondPaymentSequence;
        var sContent = "{'SPName':'" + spName + "','Params':{" +
                                "'TrustId':'" + trustID + "'" +
                                ",'ScenarioId':'" + scenarioId + "'}}";
        tMSSaveItem("TrustManagement", sContent);

        $(this).parent().parent().remove();
        $("#" + name + " #sScenarioList").children().first().click();

    };

    var selectChange = function () {
        
        var itemCode = $(this).val();
        var itemText = $(this).find("option:selected").text();
        if (itemCode > 0) {
            //alert('ok');
            $("#AddNewScenario").html(itemText + "<span class='removeScenario' style='float:right;'> X </span>");
            $(".removeScenario").click(removeScenario);
            $("#AddNewScenario").parent().find("input[type='hidden']").val(itemCode);
            $("#AddNewScenario").attr("id", "NewAddedScenario" + itemCode);
            regisTabEvent();
            $("#NewAddedScenario" + itemCode).parent().click();

            addNewScenarioToList();
        }
        else {
            $("#AddNewScenario").html(addText);
        }
        //alert(itemCode);
    };

    var writeScenarioList = function () {
        //scenarioId = jsonContent[0].ScenarioId;
        $("#" + name + " #sScenarioList").empty();
        var content = "";
        for (var i = 0; i < jsonContent.length; i++) {
            vScenarioId = jsonContent[i].ScenarioId;
            var vScenarioName = jsonContent[i].ScenarioName;
            var addText = "<span id='Scenario' style='display:block;width:100%;'>" + vScenarioName + "<span class='removeScenario' style='float:right;'> X </span></span>";
            if (i == 0) {
                content += scenarioTemplate.format(vScenarioId, addText, "divTabLiSelect");
            } else {
                content += scenarioTemplate.format(vScenarioId, addText, "divTabLi");
            }
        }
        $("#" + name + " #sScenarioList").append(content);
        $(".removeScenario").click(removeScenario);
        addNewScenarioToList();
    }

    var writeContent = function () {
        $("#" + name + " .sVariables").empty();
        var content = "";
        arrexistSequence = new Array();
        sequenceNo = 0;
        for (var i = 0; i < jsonContent.length; i++) {
            if (jsonContent[i].ScenarioId == scenarioId) {
                if (jsonContent[i].PresentationJson != "") {
                    try{
                        var currentJson = eval("(" + jsonContent[i].PresentationJson + ")");//$.parseJSON(jsonContent[i].PresentationJson);

                        for (j = 0; j < currentJson.Jsons.length; j++) {
                            var bondLevel = currentJson.Jsons[j].BondLevel == null ? "Unknown" : currentJson.Jsons[j].BondLevel;
                            var principalSequenceId = "orderDiv" + (sequenceNo + 1);
                            var principalSequence = currentJson.Jsons[j].PrincipalSequence == null ? "" : currentJson.Jsons[j].PrincipalSequence;
                            if (principalSequence != "" && principalSequence != "0") {
                                arrexistSequence.push(principalSequence);
                                principalSequence = orderButtonTemplate.format(principalSequence);
                            } else {
                                principalSequence = "";
                            }
                            var interestSequenceId = "orderDiv" + (sequenceNo + 2);
                            var interestSequence = currentJson.Jsons[j].InterestSequence == null ? "" : currentJson.Jsons[j].InterestSequence;
                            if (interestSequence != "" && interestSequence != "0") {
                                arrexistSequence.push(interestSequence);
                                interestSequence = orderButtonTemplate.format(interestSequence);
                            } else {
                                interestSequence = "";
                            }
                            var vIsCheck = currentJson.Jsons[j].IsCheck == null ? false : currentJson.Jsons[j].IsCheck;
                            if (vIsCheck) {
                                vIsCheck = "checked"
                            } else {
                                vIsCheck = "";
                            }
                            var vPercent = currentJson.Jsons[j].Percent == null ? "" : currentJson.Jsons[j].Percent;
                            content += contentTemplate.format(bondLevel, principalSequenceId, principalSequence, interestSequenceId, interestSequence, vIsCheck, vPercent);
                            sequenceNo += 2;
                        }
                    } catch (ex) {
                        alert("this scenario's PresentationJson is error.");
                    }
                }
            }
        }

        var principalSequenceId = "orderDiv" + (sequenceNo + 1);
        var interestSequenceId = "orderDiv" + (sequenceNo + 2);
        content += addRowTemplate.format(principalSequenceId, interestSequenceId);
        $("#" + name + " .sVariables").append(content);

        // add remove level handler
        $("#" + name + " .removeLevel").click(function () {
            var dataTag = $(this).attr("data");            

            // remove sequence block
            var sequenceDivs = $("#" + name + " .graySingleDiv");

            sequenceNo = sequenceDivs.length;
            sequenceDivs.each(function () {
                var thisSequenceNumber = parseInt($(this).text(), 10);
                if (thisSequenceNumber == sequenceNo || thisSequenceNumber == sequenceNo - 1) {
                    $(this).remove();
                    //sequenceNo = sequenceNo - 1;
                }
                else {
                    if ($(this).parent().attr("data") == dataTag) {
                        $("#" + name + " #orderButtons").append($(this));
                    }
                }
            });
            sequenceDivs = $("#" + name + " .graySingleDiv");
            sequenceNo = sequenceDivs.length;

            // remove row
            var divsToDelete = $("#" + name + " .sVariables").find("[data=" + dataTag + "]");
            divsToDelete.each(function () {
                $(this).remove();
            });
            

        });

        contentSortDefine();
        writeOrderButton();
    }

    var writeOrderButton = function () {
        $("#" + name + " #orderButtons").empty();
        var content = "";
        for (var i = 0; i < sequenceNo; i++) {
            var isExist = $.inArray(String(i + 1), arrexistSequence);
            if (isExist < 0) {
                content += orderButtonTemplate.format(i + 1);
            }
        }
        $("#" + name + " #orderButtons").append(content);
        $(".graySingleDiv").draggable({ helper: "clone", revert: "invalid" });

    }

    var contentSortDefine = function () {
        var objStr = "";
        for (var i = 1; i < sequenceNo + 3; i++) {
            objStr += "#orderDiv" + i + ",";
        }

        objStr += "#orderButtons";
  
        /*
        $(objStr).sortable({
            cursor: "pointer",
            stop: function (event, ui) {
                $(ui.item[0]).remove();
                $(tempTargetObj).append(ui.item[0]);
                if (tempTargetObj.id != "orderButtons") {
                    if (tempTargetChildObj != undefined) {
                        $(event.target).append(tempTargetChildObj);
                    }                        
                }
                if (!$(event.target).hasClass("ui-droppable")) {
                    $("#orderButtons").append(ui.item[0]);
                }
                //console.log($(tempTargetObj).html());
                //console.log($(tempTargetObj).hasClass("ui-droppable"));
                //tempTargetObj.innerText = ui.item[0].innerText;
                //ui.item[0].innerText = tempTargetText;
                console.log('sortable stop ' + $(event.target).html() +" " + $(event.target).hasClass("ui-droppable"));
            }
        });
        $(objStr).droppable({
            cursor: "pointer",
            drop: function (event, ui) {
                tempTargetChildObj = event.target.firstChild;
                tempTargetObj = event.target;
                console.log('dropable stop');
            }
        });
        */

        $(objStr).droppable({
            cursor: "pointer",
            drop: function (event, ui) {
                var targetObj = $(event.target);

                if (targetObj.attr("id") != "orderButtons")
                {
                    if (targetObj.children().length > 0) {
                        $("#orderButtons").append(targetObj.children());
                    }                    
                }
                targetObj.append($(ui.draggable));
            }
        });
    }

    var getjsonContent = function () {
        if (trustID != null) {
            var sContent = "{'SPName':'" + getAllItemSPName + "','Params':{" +
                        "'AliasSetName':'zh-cn','TrustId':'" + trustID +
                        "'}}";
            tMSGetItems("TrustManagement", sContent);
        } else {
            alert("no TrustId in URL params.");
        }
        
        //jsonContent = new Array({ "ScenarioId": "1", "ScenarioName": "Scenario1", "PresentationJson": "{'Jsons':[{ 'BondLevel': 'AAA', 'PrincipalSequence': '2', 'InterestSequence': '1', 'IsCheck': true }, { 'BondLevel': 'BB', 'PrincipalSequence': '4', 'InterestSequence': '3', 'IsCheck': false }, { 'BondLevel': 'C', 'PrincipalSequence': '6', 'InterestSequence': '5', 'IsCheck': false }]}" }, { "ScenarioId": "2", "ScenarioName": "Scenario2", "PresentationJson": "{'Jsons':[{ 'BondLevel': 'AAA', 'PrincipalSequence': '4', 'InterestSequence': '1', 'IsCheck': false }, { 'BondLevel': 'BB', 'PrincipalSequence': '5', 'InterestSequence': '2', 'IsCheck': true }, { 'BondLevel': 'C', 'PrincipalSequence': '6', 'InterestSequence': '3', 'IsCheck': false }]}" });
    }

    var getUrlParam = function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
        var r = window.location.search.substr(1).match(reg);  //匹配目标参数
        if (r != null) return unescape(r[2]); return null; //返回参数值
    }

    var getProviderBaseInfo = function () {
        trustID = getUrlParam('tid');
    }

    var tMSGetItemCodes = function (appDomain, context,selectControlId) {
        var serviceUrl = tmsSessionServiceBase + "GetItemCodes?applicationDomain=" + appDomain + "&contextInfo=" + context;
        $.ajax({
            type: "GET",
            url: serviceUrl,
            dataType: "jsonp",
            crossDomain: true,
            contentType: "application/json;charset=utf-8",
            success: function (response) {
                allScenarios = response;
                var excludeIds = [];
                $("#" + name + " #sScenarioList").find("input[type='hidden']").each(function () {
                    excludeIds.push(parseInt( $(this).val(),10));
                });
                //alert(excludeIds.length);

                var options = $("#" + selectControlId);
                options.append($("<option />"));

                $.each(allScenarios, function () {
                    if (excludeIds.indexOf(this.key) < 0) {
                        options.append($("<option />").val(this.key).text(this.value));
                    }
                });
            },
            error: function (response) { alert("error:" + response); }
        });
    };

    var tMSSaveItem = function (appDomain, context) {
        var serviceUrl = tmsSessionServiceBase + "SaveItem?applicationDomain=" + appDomain + "&contextInfo=" + context;
        $.ajax({
            type: "GET",
            url: serviceUrl,
            dataType: "jsonp",
            crossDomain: true,
            contentType: "application/json;charset=utf-8",
            success: function (response) {
                writeContent();
                isAdd = false;
                $("#" + name + " #bt_Add").removeAttr("disabled");
                $("#" + name + " #NewItemArea").hide();
                //alert("支付顺序保存成功！");
            },
            error: function (response) { alert("error:" + response); }
        });
    };

    var tMSGetItems = function (appDomain, context) {
        var serviceUrl = tmsSessionServiceBase + "GetTrustBondPaymentSequenceItems?applicationDomain=" + appDomain + "&contextInfo=" + context;
        $.ajax({
            type: "GET",
            url: serviceUrl,
            dataType: "jsonp",
            crossDomain: true,
            contentType: "application/json;charset=utf-8",
            success: function (response) {
                /* if (response == "") {
                    alert("This trust does not have Scenario.");
                }
                else { */
                    jsonContent = response;
                    writeScenarioList();
                    writeContent();
                    regisUiEvents();
                    $("#" + name + " #sScenarioList").children().first().click();
                //}
            },
            error: function (response) { alert("error:" + response); }
        });
    };

    var getClassName = function (vOrder) {
        var arrClass = new Array("Principal_Paid_A", "Interest_Paid_A", "Principal_Paid_B", "Interest_Paid_B", "Principal_Paid_C", "Interest_Paid_C", "Principal_Paid_D", "Interest_Paid_D", "Principal_Paid_E,", "Interest_Paid_E", "Principal_Paid_F", "Interest_Paid_F", "Principal_Paid_G", "Interest_Paid_G",
            "Principal_Paid_EquityClass", "Interest_Paid_EquityClass");
        if (vOrder < 0) return arrClass[arrClass.length + vOrder];
        else return arrClass[vOrder];
    }

    var regisTabEvent = function () {
        $("#" + name + " #sScenarioList").find("div").each(function () {
            if ($(this).find("input").length == 1) {
                $(this).click(function () {
                    $("#" + name + " #sScenarioList").find("div").each(function () {
                        if ($(this).find("input").length == 1) {
                            $(this).attr("class", "divTabLi");
                        }
                    })
                    $(this).attr("class", "divTabLiSelect");
                    scenarioId = $(this).find("input").eq(0).val();
                    writeContent();
                    $("#" + name + " #NewItemArea").hide();
                    $("#" + name + " #bt_Add").removeAttr("disabled");
                });
            }
        });
    };

    var regisUiEvents = function () {
        $(function () {
            $("#" + name + " #NewItemArea").hide();

            regisTabEvent();

            $("#" + name + " #bt_Add").click(function () {
                $("#" + name + " #bt_Add").attr("disabled", "disabled");
                $("#" + name + " #NewItemArea").show();
                var content = orderButtonTemplate.format(sequenceNo + 1);
                content += orderButtonTemplate.format(sequenceNo + 2);
                $("#" + name + " #orderButtons").append(content);
                isAdd = true;
            });

            $("#" + name + " #bt_Cancel").click(function () {
                writeContent();
                $("#" + name + " #NewItemArea").hide();
                $("#" + name + " #bt_Add").removeAttr("disabled");
                isAdd = false;
            });

            $("#" + name + " #bt_Save").click(function () {
                var arrLevel = new Array();
                var arrSequence = new Array();
                var arrCheck = new Array();
                var arrPercent = new Array();
                var sNo = 0;
                $(".sVariables .grayDivTableHeadCell").each(function () {
                    if (sNo < (sequenceNo / 2)) {
                        arrLevel[sNo] = this.innerText;
                    } else {
                        if (isAdd) {
                            arrLevel[sNo] = $(this.firstChild).val();
                        }
                    }
                    sNo += 1;
                });
                sNo = 0;
                var cNo = 0;
                $(".sVariables .grayDivTableCell").each(function () {
                    if ($(this).find("input").length == 0) {
                        if (sNo < sequenceNo) {
                            arrSequence[sNo] = this.innerText == "" ? "0" : this.innerText;
                        } else {
                            if (isAdd) {
                                arrSequence[sNo] = this.innerText == "" ? "0" : this.innerText;
                            }
                        }
                        sNo += 1;
                    } else {
                        if (cNo < (sequenceNo / 2)) {
                            arrCheck[cNo] = $(this.firstChild).is(":checked");
                        } else {
                            if (isAdd) {
                                arrCheck[cNo] = $(this.firstChild).is(":checked");
                            }
                        }
                        cNo += 1;
                    }
                });
                sNo = 0;
                $(".sVariables .grayDivTableCellRight").each(function () {
                    if (sNo < (sequenceNo / 2)) {
                        arrPercent[sNo] = $(this.firstChild).val();
                    } else {
                        if (isAdd) {
                            arrPercent[sNo] = $(this.firstChild).val();
                        }
                    }
                    sNo += 1;
                });

                // make sure the data input is valid
                if (arrLevel.length==0) {
                    alert('请添加一个以上的债券分层。');
                    return false;
                }
                var distinctLevels = arrLevel.slice();
                $.unique(distinctLevels);
                if (distinctLevels.length!=arrLevel.length) {
                    alert('债券分层不能重名。');
                    return false;
                }
                if ($(".sVariables input#bondLevel").is(":visible") && $.trim($(".sVariables input#bondLevel").val()) == "")
                {
                    alert('债券分层不能为空。');
                    return false;
                }


                var currentJson = '{"Jsons":[';
                for (var i = 0; i < arrCheck.length; i++) {
                    if ((i + 1) == arrCheck.length) {
                        currentJson += '{"BondLevel":"' + arrLevel[i] + '","PrincipalSequence":"' + arrSequence[i * 2] + '","InterestSequence":"' + arrSequence[i * 2 + 1] + '","IsCheck":' + arrCheck[i] + ',"Percent":"' + arrPercent[i] + '"}]}';
                    } else {
                        currentJson += '{"BondLevel":"' + arrLevel[i] + '","PrincipalSequence":"' + arrSequence[i * 2] + '","InterestSequence":"' + arrSequence[i * 2 + 1] + '","IsCheck":' + arrCheck[i] + ',"Percent":"' + arrPercent[i] + '"},';
                    }
                }
                var arrCaculationSequence = new Array();
                for (var i = 0; i < arrSequence.length; i++) {
                    var vIscheck = "";
                    if ((i % 2) == 1) {
                        vIscheck = "," + arrCheck[parseInt(i / 2)] + ",;";
                    } else {
                        vIscheck = ",,;"
                    }
                    if (i >= arrSequence.length - 2)
                        arrCaculationSequence[arrSequence[i] - 1] = arrSequence[i] + "," + getClassName(i - arrSequence.length) + vIscheck;
                    else
                        arrCaculationSequence[arrSequence[i] - 1] = arrSequence[i] + "," + getClassName(i) + vIscheck;
                }

                var scenarioName = "";
                var presentationJson = "";
                var calculationSequence = "";
                for (var i = 0; i < jsonContent.length; i++) {
                    if (jsonContent[i].ScenarioId == scenarioId) {
                        scenarioName = jsonContent[i].ScenarioName;
                        jsonContent[i].PresentationJson = currentJson;
                    }
                }
                if (allScenarios!="" && scenarioName=="") {
                    $.each(allScenarios, function () {
                        if (this.key == parseInt(scenarioId,10)) {
                            scenarioName = this.value;
                            var newScenario = {"ScenarioId":this.key , "ScenarioName":scenarioName,"PresentationJson": currentJson };
                            jsonContent.push(newScenario);
                        }
                    })
                }

                for (var i = 0; i < arrCaculationSequence.length; i++) {
                    calculationSequence += arrCaculationSequence[i];
                }
                calculationSequence = calculationSequence.substr(0, calculationSequence.length - 1);
                var sContent = "{'SPName':'" + saveSPName + "','Params':{" +
                                "'AliasSetName':'zh-CN'" +
                                ",'TrustId':'" + trustID +
                                "','ScenarioName':'" + scenarioName +
                                "','PresentationJson':'" + currentJson +
                                "','CalculationSequence':'" + calculationSequence + "'}}";
                tMSSaveItem("TrustManagement", sContent);
            });
        });
    };

    this.refresh = function (vContext) {
    };

    this.render = function () {
        var content = viewTemplate;
        $("#viewTrustContent").empty();
        $("#viewTrustContent").append(content);

        postRender();
        //alert(this);
    };

    var postRender = function () {
        getProviderBaseInfo();
        getjsonContent();
    };
};
