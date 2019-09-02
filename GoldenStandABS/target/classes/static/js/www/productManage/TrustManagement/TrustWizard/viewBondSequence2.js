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
    var GetTrustBondNamesSPName = "usp_GetTrustBondNames";
    var GetTrustPeriodsSPName = "usp_GetTrustPeriod";
    var sequenceNo = 0;
    var tempTargetChildObj = "";
    var tempTargetObj = "";
    var isAdd = false;
    var scenarioId = 0;
    var arrexistSequence = new Array();
    var allScenarios = "";
    var trustBondNames = [];
    var appDomain = "TrustManagement";
    var tmsSessionServiceBase = GlobalVariable.TrustManagementServiceUrl;

    var periodsTemplate = "选择期数<input id='checkPeriod' type='checkbox'/>&nbsp;<div style='display:inline' id='periodfields'><span>起始：</span><select style='width:120px' id='PeriodStart'></select><span> - 终止：</span><select style='width:120px' id='PeriodEnd'></select></div>";
    var viewTemplate = "<div class='divTab' style='width:99%;'>" +
                            "<div class='divTabHead' id='sScenarioList'></div>" +
                            "<div class='searchPanel' style='height:2px'></div>" +
                            "<div style='height:30px'>" +
                                "<div style='width:60px;float:left;'><input type='button' value='保 存' id='bt_Save' style='font-size: 12px' /></div>" +
                                "<div style='clear:both'></div>" +
                            "</div>" +
                            "<div style='height:20px;font-size: 12px' id='PeriodConfig'></div>" +
                            "<div style='height:10px'><div style='clear:both'></div></div>" +
                            "<div style='height:20px;font-size: 12px'>收入账结余是否转入本金账<input id='checkInterest' type='checkbox' checked='checked' /></div>" +
                            "<div style='height:15px'><div style='clear:both'></div></div>" +
                            "<div style='height:20px;font-size: 12px;font-weight: bold'>费用顺序调整</div>" +
                            "<div style='width:397px'>    " +
                            "<div class='grayDivTableHeadFee' style='width:35px'>序号</div>" +
                                "<div class='grayDivTableHeadFee' style='width:148px'>费用名称</div>" +
                                "<div class='grayDivTableHeadRightFee' style='width:180px'>次级分配前检查</div>" +
                            "</div>" +
                            "<div class='sVariablesFee' id='feesContent' style='width:397px'><ul id='ul1' style='width:46px;float:left;margin:0px; padding:0px;list-style-type:none;'></ul><ul id='ul2' style='width:351px;float:right;margin:0px; padding:0px;list-style-type:none;'></ul></div>" +
                            "<div style='clear:both'></div>" +
                            "<div style='height:15px'><div style='clear:both'></div></div>" +
                             "<div style='height:20px;font-size: 12px;font-weight: bold'>债券顺序调整</div>" +
                            "<div style='width:920px'>    " +
                                "<div class='grayDivTableHead' style='width:148px'>分层</div>" +
                                "<div class='grayDivTableHead' style='width:140px'>本金<span style='margin-left:30px'>精度</span><input type='number' style='width:50px' id='PrincipalPrecision' /></div>" +
                                "<div class='grayDivTableHead' style='width:140px'>利息<span style='margin-left:30px'>精度</span><input type='number' style='width:50px' id='InterestPrecision' /></div>" +
                                "<div class='grayDivTableHead' style='width:140px'>剩余资金分配方式</div>" +
                                "<div class='grayDivTableHead' style='width:150px'>同级分配&nbsp;<select id='basedOnType'><option value='ABasedOnCPB'>按剩余本金</option><option value='ABasedOnAVG'>平均分配</option><option value='ABasedOnManul'>手动分配</option><option value='ABasedOnDue'>按应付金额</option></select></div>" +
                                "<div class='grayDivTableHeadRight' style='width:135px'>是否本金补足</div>" +
                                "<div style='clear:both'></div>" +
                            "</div>" +
                            //"<div style='width:191px;float:left' id='bondLevelCell'></div>" +
                            "<div class='sVariables' style='width:920px;'></div>" +
                            "<div style='clear:both'></div>" +
                            "<div style='height:10px'><div style='clear:both'></div></div>" +
                            "<div style='height:55px;width:918px;border:#BDBDBD solid 1px;line-height:28px;offsetTop:5px' id='orderButtons'>" +
                            "</div>" +
                        "</div>";
    var scenarioTemplate = "<div class='{2}'><input type='hidden' value='{0}' />{1}</div><div style='width:5px;float:left'></div>";
    var contentTemplate = "<div class='grayDivTableHeadCell' data='{0}' bondId='{9}' style='width:148px'>{0}</div>" +
                            "<div class='grayDivTableCell' data='{0}' style='width:140px' id='{1}'>{2}</div>" +
                            "<div class='grayDivTableCell' data='{0}' style='width:140px' id='{3}'>{4}</div>" +
                            "<div class='grayDivTableCell' data='{0}' style='width:140px'><input type='checkbox' {5} /><input style='width:100px' type='text' value='{6}' />&nbsp;%" +
                            "&nbsp;</div>" +
                            "<div class='grayDivTableCell'  data='{0}' style='width:150px'><input style='width:100px' type='text' value='{7}' />&nbsp;%" +
                            "&nbsp;</div>" +
                            "<div class='grayDivTableCellRight' data='{0}' style='width:135px'><input type='checkbox' {8} /></div>";

    var orderButtonTemplate = "<div class='graySingleDiv' style='width:60px;float:left'>{0}</div>";

    var contentTemplateFee = "<li style='list-style-type:none;margin:0px;border:#BDBDBD solid 1px;border-top:none;height:28px'><div class='grayDivTableHeadCellFee' data='{0}' datavalue='{1}' style='width:148px'>{0}</div>" +
                             "<div class='grayDivTableCellRightFee' data='{0}'><input type='checkbox' {2} /></div></li>";
                            

    String.prototype.format = function () {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] != 'undefined'
            ? args[number]
            : match
            ;
        });
    };

    var periodcheckchange = function () {
        if ($("#checkPeriod").attr("checked") == "checked") {
            $("#periodfields").show();
        }
        else {
            $("#periodfields").hide();
        }

    };


    var addNewScenarioToList = function () {

        var addText = "<span id='AddNewScenario' style='display:block;width:100%;'> + </span>";
        $("#" + name + " #sScenarioList").append(scenarioTemplate.format(vScenarioId, addText, "divTabLi"));
        vScenarioId = vScenarioId + 1;

        $("#AddNewScenario").click(function () {
            //alert('get you!'+ $(this).parent().attr("class"));
            $("#AddNewScenario").html("<input id='toSelect' style='width:90px;margin-top:4px;'></input>");
            //var sContent = "{'SPName':'" + getAllScenarioName + "','Params':{" +
            //            "'AliasSetName':'zh-CN'}}";
            //tMSGetItemCodes("TrustManagement", sContent, 'toSelect');
            $("#AddNewScenario").unbind("click");

            //$("#toType").focus();
            //$("#AddNewScenario").attr("id", "OldScenario");           
            $("#toSelect").change(selectChange);
        });
    };

    var removeScenario = function () {
        var selectScenarioId = $(this).parent().parent().find("input[type='hidden']").val();
        var selectScenarioName = $(this).parent().parent().find("span").eq(0).text();
        selectScenarioName= selectScenarioName.replace(" X ", "");

        //alert(selectScenarioId+","+selectScenarioName);
        var spName = removeTrustBondPaymentSequence;
        var sContent = "{'SPName':'" + spName + "','Params':{" +
                                "'TrustId':'" + trustID + "'" +
                                ",'ScenarioName':'" + selectScenarioName + "'}}";
        tMSSaveItem("TrustManagement", sContent);

        $(this).parent().parent().remove();
        $("#" + name + " #sScenarioList").children().first().click();

    };

    //scenario name change function
    var selectChange = function () {

        var itemCode = $("#AddNewScenario").parent().find("input[type='hidden']").val();
        var itemText = $(this).val();
        if (itemCode != "") {
            //alert('ok');
            $("#AddNewScenario").html("<span class='nameClass'>" + itemText + "</span>" + "<span class='removeScenario' style='float:right;'> X </span>");

            $(".removeScenario").click(removeScenario);
            $("#AddNewScenario").parent().find("input[type='hidden']").val(itemCode);
            $("#AddNewScenario").attr("id", "NewAddedScenario" + itemCode);
            regisTabEvent();
            $("#NewAddedScenario" + itemCode).parent().click();
            sequenceNo = 0;
            content = "";
            $.each(trustBondNames, function () {
                content += writeNewBondLevel(this, sequenceNo);
                sequenceNo = sequenceNo + 2;
            });
            $("#" + name + " .sVariables").append(content);

            WriteNewContentFee();
            contentSortDefine();
            writeOrderButton();

            addNewScenarioToList();
        }
        else {
            $("#AddNewScenario").html(addText);
        }
        //alert(itemCode);
    };
    var vScenarioId = 0;
    var writeScenarioList = function () {
        //scenarioId = jsonContent[0].ScenarioId;
        $("#" + name + " #sScenarioList").empty();
        var content = "";
        for (var i = 0; i < jsonContent.length; i++) {
            //vScenarioId = jsonContent[i].ScenarioId; 
            if (jsonContent[i].PrincipalPrecision != "") {
                $("#PrincipalPrecision").val(jsonContent[i].PrincipalPrecision);
            }
            if (jsonContent[i].InterestPrecision != "") {
                $("#InterestPrecision").val(jsonContent[i].InterestPrecision);
            }
            var vScenarioName = jsonContent[i].ScenarioName;
            var addText = "<span id='Scenario' style='display:block;width:100%;'>" + vScenarioName + "<span class='removeScenario' style='float:right;'> X </span></span>";
            if (i == 0) {
                content += scenarioTemplate.format(vScenarioId, addText, "divTabLiSelect");
            } else {
                content += scenarioTemplate.format(vScenarioId, addText, "divTabLi");
            }
            jsonContent[i].ScenarioId = vScenarioId;
            vScenarioId++;
        }
        $("#" + name + " #sScenarioList").append(content);      
        $(".removeScenario").click(removeScenario);
       
        addNewScenarioToList();
    }



    var writeContent = function () {
        $("#" + name + " .sVariables").empty();
        //$("#" + name + " .sVariablesFee").empty();
        $("#ul1").empty();
        $("#ul2").empty();
        var content = "";
        var contentFee = "";
        var noStr = "";
        arrexistSequence = new Array();
        sequenceNo = 0;
        for (var i = 0; i < jsonContent.length; i++) {
            if (jsonContent[i].ScenarioId == scenarioId) {
                if (jsonContent[i] != undefined) {
                    var isChecked = false;
                    if (jsonContent[i].Periods != undefined && jsonContent[i].Periods != "") {
                        var periodstr = jsonContent[i].Periods.split(";");
                        
                        if (periodstr.length > 1) {
                            $("#periodfields").show();
                            $("#PeriodStart").val(periodstr[0]);
                            $("#PeriodEnd").val(periodstr[1]);
                            $("#checkPeriod").attr("checked", "checked");
                            isChecked = true;
                        }
                    }
                    if (!isChecked) {
                        $("#checkPeriod").removeAttr("checked");
                        $("#periodfields").hide();
                    }

                    if (jsonContent[i].AllocationMethodCode != undefined) {
                        $("#basedOnType").val(jsonContent[i].AllocationMethodCode);
                    }
                    if (jsonContent[i].AllowInterestToPrincipal) {
                        $("#checkInterest").attr("checked", "checked");
                    }
                    else {
                        $("#checkInterest").removeAttr("checked");
                    }
                    if (jsonContent[i].PresentationJson != "") {
                        try {
                            var currentJson = eval("(" + jsonContent[i].PresentationJson + ")");//$.parseJSON(jsonContent[i].PresentationJson);
                            $.each(trustBondNames, function () {
                                var trustBond = this;
                                var trustBondName = trustBond.value;
                                var trustBondId = trustBond.key;
                                var found = false;
                              
                                for (j = 0; j < currentJson.Jsons.length; j++) {
                                    var bondLevel = currentJson.Jsons[j].BondLevel == null ? "Unknown" : currentJson.Jsons[j].BondLevel;
                                    var inFound = false;
                                    if (currentJson.Jsons[j].hasOwnProperty("BondId"))
                                    {
                                        var levelId = currentJson.Jsons[j].BondId == null ? "Unknown" : currentJson.Jsons[j].BondId;
                                        if (trustBondId == levelId)
                                        {
                                            inFound = true;
                                        }
                                    }
                                    else
                                    {
                                        if (trustBondName == bondLevel) {
                                            inFound = true;
                                        }
                                    }
                                   
                                    if (inFound) {
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
                                        var vSeqPercent = currentJson.Jsons[j].SSeqMPercent == null ? "" : currentJson.Jsons[j].SSeqMPercent;
                                        //是否本金补足
                                        var vIsPrincipalFill = "";
                                        if (currentJson.Jsons[j].hasOwnProperty("IsPrincipalFill"))
                                        {
                                           var vPrincipalFill = currentJson.Jsons[j].IsPrincipalFill == null ? false : currentJson.Jsons[j].IsPrincipalFill;
                                           if (vPrincipalFill) {
                                               vIsPrincipalFill = "checked";                                      
                                            }
                                            else {
                                                vIsPrincipalFill = "";
                                           }
                                        }

                                        content += contentTemplate.format(bondLevel, principalSequenceId, principalSequence, interestSequenceId, interestSequence, vIsCheck, vPercent, vSeqPercent, vIsPrincipalFill,trustBondId);
                                        sequenceNo += 2;
                                        found = true;
                                        break;
                                    }
                                }
                                if (!found) {
                                    content += writeNewBondLevel(trustBond, sequenceNo);
                                    sequenceNo += 2;
                                }
                            });


                        } catch (ex) {
                            alert("this scenario's PresentationJson is error.");
                        }
                    }
                    $("#ul2").dragsort("destroy");
                    if (jsonContent[i].FeePaymentSequence != undefined && jsonContent[i].FeePaymentSequence!="") {
                        try {
                            var currentJsonFee = eval("(" + jsonContent[i].FeePaymentSequence + ")");
                            var executeParam = {
                                'SPName': "usp_GetTrustFeeById", 'SQLParams': [
                                                    {
                                                        'Name': 'TrustId', 'Value': trustID, 'DBType': 'int'
                                                    }
                                ]
                            };
                            var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";//appDomain=TrustManagement&executeParams=" + context;

                            ExecuteGetData(true, serviceUrl, 'TrustManagement', executeParam, function (data) {
                                if (data != null && data.length > 0) {
  
                                    var dataSource=data;
                                    var noIndex = 1;
                                    for (m = 0; m < currentJsonFee.Jsons.length; m++) {
                                       
                                        var feeName = currentJsonFee.Jsons[m].Name;
                                        var isExist=false;
                                        $.each(data,function(n,dataS){
                                            if(dataS.TrustFeeName==feeName)
                                            {
                                                dataSource=$.grep(dataSource, function(dataObj, dataIndex){
                                                    return dataObj.TrustFeeName!=feeName;
                                                });
                                                var feeCheck = currentJsonFee.Jsons[m].FeeCheck == null ? false : currentJsonFee.Jsons[m].FeeCheck;
                                                if (feeCheck) {
                                                    feeCheck = "checked"
                                                } else {
                                                    feeCheck = "";
                                                }
                                                contentFee += contentTemplateFee.format(dataS.TrustFeeDisplayName, feeName, feeCheck);
                                                noStr += "<li style='list-style-type:none;margin:0px;border:#BDBDBD solid 1px;border-top:none;border-right:none;height:28px;line-height:28px;text-align:center'>" + noIndex + "</li>";
                                                noIndex += 1;
                                                return false;
                                            }
                                        });                                                                              
                                    }

                                    if (dataSource.length > 0)
                                    {
                                        $.each(dataSource, function (x, feeS) {
                                            noStr += "<li style='list-style-type:none;margin:0px;border:#BDBDBD solid 1px;border-top:none;border-right:none;height:28px;line-height:28px;text-align:center'>" + noIndex + "</li>";
                                            contentFee += contentTemplateFee.format(feeS.TrustFeeDisplayName, feeS.TrustFeeName, "");
                                            noIndex += 1;
                                        });
                                    }
                                    //清空序号列级费用列
                                    $("#ul1").empty();
                                    $("#ul2").empty();

                                    $("#ul1").append(noStr);
                                    $("#ul2").append(contentFee);
                                    $("#ul2").dragsort();
                                }
                            });
                            //$("#" + name + " .sVariablesFee").append(contentFee);
                            //$("#feesContent").dragsort();
                            
                        }
                        catch (e) {
                            alert("this scenario's Fee PresentationJson is error.");
                        }
                    }
                    else {
                        //首次加载费用
                        WriteNewContentFee();                        
                    }
                }

            }
        }

        var principalSequenceId = "orderDiv" + (sequenceNo + 1);
        var interestSequenceId = "orderDiv" + (sequenceNo + 2);
        //content += addRowTemplate.format(principalSequenceId, interestSequenceId);
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

    var writeNewBondLevel = function (trustBond, sequence) {
        var bondLevel = trustBond.value;
        var bondId = trustBond.key;
        var principalSequenceId = "orderDiv" + (sequenceNo + 1);
        var principalSequence = "";
        var interestSequenceId = "orderDiv" + (sequenceNo + 2);
        var interestSequence = ""
        var vIsCheck = ""
        var vPercent = "";
        var vSeqPercent = "";
        var vIsPrincipalFill = "";
        return contentTemplate.format(bondLevel, principalSequenceId, principalSequence, interestSequenceId, interestSequence, vIsCheck, vPercent, vSeqPercent, vIsPrincipalFill, bondId);
    }

    var writeOrderButton = function () {
        $("#" + name + " #orderButtons").empty();
        var content = "";
        for (var i = 0; i < sequenceNo; i++) {
            //var isExist = $.inArray(String(i + 1), arrexistSequence);
            //if (isExist < 0) {
            content += orderButtonTemplate.format(i + 1);
            //}
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

        $(objStr).droppable({
            cursor: "pointer",
            drop: function (event, ui) {
                var targetObj = $(event.target);

                if (targetObj.attr("id") != "orderButtons") {
                    if (targetObj.children().length > 0) {
                        $("#orderButtons").append(targetObj.children());
                    }
                }
                targetObj.append($(ui.draggable));
                writeOrderButton();
            }
        });
    }

    var getPeriodsDates = function () {
        var context = "{'SPName':'" + GetTrustPeriodsSPName + "','SQLParams':[" +
                       "{'Name':'TrustPeriodType','Value':'PaymentDate_CF','DBType':'string'}," +
                       "{'Name':'TrustId','Value':'" + trustID + "','DBType':'int'}]}&resultType=";
        var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?appDomain=TrustManagement&executeParams=" + context;
        $.ajax({
            type: "GET",
            url: serviceUrl,
            dataType: "jsonp",
            crossDomain: true,
            contentType: "application/xml;charset=utf-8",
            async:false,
            success: function (response) {
                if (typeof response == "string")
                    response = JSON.parse(response);

                $.each(response, function (n, res) {
                    var start = timeStamp2String(new Date(eval(res.StartDate.replace("/Date(", "").replace(")/", ""))));
                    var end = timeStamp2String(new Date(eval(res.EndDate.replace("/Date(", "").replace(")/", ""))));
                    $("#PeriodStart").append(("<option value='{0}'>{0}</option>").format(start));
                    $("#PeriodEnd").append(("<option value='{0}'>{0}</option>").format(end));                   
                });

                writeScenarioList();
                regisUiEvents();
                $("#" + name + " #sScenarioList").children().first().click();
            },
            error: function (response) { alert("error:" + response); }
        });
    }

    var WriteNewContentFee = function ()
    {
        

        var executeParam = {
            'SPName': "usp_GetTrustFeeById", 'SQLParams': [
                      { 'Name': 'TrustId', 'Value': trustID, 'DBType': 'int' }
            ]
        };
        var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";//appDomain=TrustManagement&executeParams=" + context;

        ExecuteGetData(true, serviceUrl, 'TrustManagement', executeParam, function (data) {
            if (data != null && data.length > 0) {
                var contentFee = "";
                var nostr = "";
                $.each(data, function (m, fee) {
                    nostr += "<li style='list-style-type:none;margin:0px;border:#BDBDBD solid 1px;border-top:none;border-right:none;height:28px;line-height:28px;text-align:center'>" + (m + 1) + "</li>";
                    contentFee += contentTemplateFee.format(fee.TrustFeeDisplayName, fee.TrustFeeName, "");                             
                });

                $("#ul2").dragsort("destroy");

                //清空序号列级费用列
                $("#ul1").empty();
                $("#ul2").empty();

                $("#ul1").append(nostr);
                $("#ul2").append(contentFee);
                $("#ul2").dragsort();                                        
            }
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

    var getjsonContent = function () {

        var context = "{'SPName':'" + GetTrustBondNamesSPName + "','Params':{" +
                       "'TrustId':" + trustID +
                       ",'NameCode':'ShortName'" +
                       "}}";
        getItemCodesWithCallback(appDomain, context, getTrustBondNames);
        //jsonContent = new Array({ "ScenarioId": "1", "ScenarioName": "Scenario1", "PresentationJson": "{'Jsons':[{ 'BondLevel': 'AAA', 'PrincipalSequence': '2', 'InterestSequence': '1', 'IsCheck': true }, { 'BondLevel': 'BB', 'PrincipalSequence': '4', 'InterestSequence': '3', 'IsCheck': false }, { 'BondLevel': 'C', 'PrincipalSequence': '6', 'InterestSequence': '5', 'IsCheck': false }]}" }, { "ScenarioId": "2", "ScenarioName": "Scenario2", "PresentationJson": "{'Jsons':[{ 'BondLevel': 'AAA', 'PrincipalSequence': '4', 'InterestSequence': '1', 'IsCheck': false }, { 'BondLevel': 'BB', 'PrincipalSequence': '5', 'InterestSequence': '2', 'IsCheck': true }, { 'BondLevel': 'C', 'PrincipalSequence': '6', 'InterestSequence': '3', 'IsCheck': false }]}" });
    }

    var getTrustBondNames = function (response) {
        //alert(JSON.stringify(response));
        $.each(response, function () {
           
            trustBondNames.push(this)
        });

        if (trustID != null) {
            var sContent = "{'SPName':'" + getAllItemSPName + "','Params':{" +
                        "'AliasSetName':'zh-cn','TrustId':'" + trustID +
                        "'}}";
            tMSGetItems("TrustManagement", sContent);
        } else {
            alert("no TrustId in URL params.");
        }
    }

    var getUrlParam = function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
        var r = window.location.search.substr(1).match(reg);  //匹配目标参数
        if (r != null) return unescape(r[2]); return null; //返回参数值
    }

    var getProviderBaseInfo = function () {
        trustID = getUrlParam('tid');

    }



    var getItemCodesWithCallback = function (appDomain, context, callback) {
        var serviceUrl = tmsSessionServiceBase + "GetItemCodes?applicationDomain=" + appDomain + "&contextInfo=" + context;
        $.ajax({
            type: "GET",
            url: serviceUrl,
            dataType: "jsonp",
            crossDomain: true,
            contentType: "application/json;charset=utf-8",
            success: function (response) {
                callback(response);
            },
            error: function (response) { alert("error:" + response); }
        });
    };



    var tMSGetItemCodes = function (appDomain, context, selectControlId) {
        var serviceUrl = tmsSessionServiceBase + "GetItemCodes?applicationDomain=" + appDomain + "&contextInfo=" + context;
        $.ajax({
            type: "GET",
            url: serviceUrl,
            dataType: "jsonp",
            crossDomain: true,
            contentType: "application/json;charset=utf-8",
            success: function (response) {
                allScenarios = response;

            },
            error: function (response) { alert("error:" + response); }
        });
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
                writeContent();
                isAdd = false;
                $("#" + name + " #NewItemArea").hide();
                alert("支付顺序保存成功！");
            },
            error: function (response) { alert("error is :" + response); }
        });
    }

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

                jsonContent = response;
                $("#PeriodConfig").html(periodsTemplate);
                getPeriodsDates();
                //$("#checkPeriod").removeAttr("checked");
                //$("#periodfields").hide();
                //writeScenarioList();

                //writeContent();
                //regisUiEvents();
                //$("#" + name + " #sScenarioList").children().first().click();
               
            },
            error: function (response) { alert("error:" + response); }
        });
    };

    var getClassName = function (vOrder) {
        var arrClass = new Array("Principal_Paid_A", "Interest_Paid_A", "Principal_Paid_B", "Interest_Paid_B", "Principal_Paid_C", "Interest_Paid_C", "Principal_Paid_D", "Interest_Paid_D", "Principal_Paid_E", "Interest_Paid_E", "Principal_Paid_F", "Interest_Paid_F", "Principal_Paid_G", "Interest_Paid_G",
		"Principal_Paid_H", "Interest_Paid_H", "Principal_Paid_I", "Interest_Paid_I", "Principal_Paid_J", "Interest_Paid_J",
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
                    $("#PeriodStart").get(0).selectedIndex = 0;
                    $("#PeriodEnd").get(0).selectedIndex = 0;
                    $("#basedOnType").get(0).selectedIndex = 0;
                    writeContent();                 
                    $("#" + name + " #NewItemArea").hide();
                });
                if ($(this).attr('id') == 'AddNewScenario') {
                    $(this).unbind('click');
                }
            }

        });
    };

    var regisUiEvents = function () {
        $(function () {
            $("#" + name + " #NewItemArea").hide();

            regisTabEvent();

            $("#" + name + " #checkPeriod").click(periodcheckchange);

            $("#" + name + " #bt_Cancel").click(function () {
                writeContent();
                $("#" + name + " #NewItemArea").hide();
                isAdd = false;
            });

            $("#" + name + " #bt_Save").click(function () {
                var arrLevel = new Array();
                var arrBondId = new Array();
                var arrSequence = new Array();
                var arrCheck = new Array();
                var arrOldPercent = new Array();
                var arrPercent = new Array();
                var arrIsRest = new Array();
               
               //Fee顺序
                var arrFeeName = new Array();
                var arrFeeDisplayName = new Array();
                var arrFeeCheck = new Array();
                var sFeeNo=0
                $(".sVariablesFee .grayDivTableHeadCellFee").each(function () {
                    arrFeeDisplayName[sFeeNo] = this.innerText;
                    arrFeeName[sFeeNo] = $(this).attr("datavalue");
                    sFeeNo += 1;
                });
                sFeeNo = 0;
                $(".sVariablesFee .grayDivTableCellRightFee").each(function () {
                    arrFeeCheck[sFeeNo] = $(this.firstChild).is(":checked");
                    sFeeNo += 1;
                });

                var calculationSequenceFee = "";
                var currentJsonFee = '{"Jsons":[';
                if (arrFeeName.length < 1) {
                    currentJsonFee += ']}';
                }
                else {
                    for (var i = 0; i < arrFeeName.length; i++) {
                        if ((i + 1) == arrFeeName.length) {
                            currentJsonFee += '{"Name":"' + arrFeeName[i] + '","DisplayName":"' + arrFeeDisplayName[i] + '","FeeCheck":' + arrFeeCheck[i] + '}]}';
                        } else {
                            currentJsonFee += '{"Name":"' + arrFeeName[i] + '","DisplayName":"' + arrFeeDisplayName[i] + '","FeeCheck":' + arrFeeCheck[i] + '},';
                        }
                        calculationSequenceFee += (i + 1) + "," + arrFeeName[i] + "," + arrFeeCheck[i] + ";";
                    }
                    if (calculationSequenceFee.length > 1) {
                        calculationSequenceFee = calculationSequenceFee.substr(0, calculationSequenceFee.length - 1);
                    }
                }

                //alert(currentJsonFee);
                //alert(calculationSequenceFee);
                //bond数组
                var sNo = 0;
                $(".sVariables .grayDivTableHeadCell").each(function () {
                    if (sNo < (sequenceNo / 2)) {
                        arrLevel[sNo] = this.innerText;
                        arrBondId[sNo] = $(this).attr("bondId");
                    } else {
                        if (isAdd) {
                            arrLevel[sNo] = $(this.firstChild).val();
                        }
                    }
                    sNo += 1;
                });
                sNo = 0;
                var cNo = 0;
                var tNo = 0;
                $(".sVariables .grayDivTableCell").each(function () {

                    //前两列序号
                    if ($(this).find("input").length == 0) {
                        if (sNo < sequenceNo) {
                            arrSequence[sNo] = this.innerText == "" ? "0" : this.innerText;
                        } else {
                            if (isAdd) {
                                arrSequence[sNo] = this.innerText == "" ? "0" : this.innerText;
                            }
                        }
                        sNo += 1;
                    }                      
                    else if ($(this).find("input").length == 2)
                    {
                        //剩余资金分配方式列
                        if (cNo < (sequenceNo / 2)) {
                            arrCheck[cNo] = $(this.firstChild).is(":checked");
                        } else {
                            if (isAdd) {
                                arrCheck[cNo] = $(this.firstChild).is(":checked");
                            }
                        }
                        if (arrCheck[cNo]) {
                            arrOldPercent[cNo] = $(this).find("input").eq(1).val();
                        }
                        else {
                            arrOldPercent[cNo] = $(this).find("input").eq(1).val();
                        }
                        cNo += 1;
                    }
                    else if ($(this).find("input").length == 1)
                    {
                        //同级分配列
                        if (tNo < (sequenceNo / 2)) {
                            arrPercent[tNo] = $(this.firstChild).val();
                        } else {
                            if (isAdd) {
                                arrPercent[tNo] = $(this.firstChild).val();
                            }
                        }
                        tNo += 1;
                    }
                });
                sNo = 0;
                $(".sVariables .grayDivTableCellRight").each(function () {
                    //是否剩余本金补足列
                    if (sNo < (sequenceNo / 2)) {
                        arrIsRest[sNo] = $(this.firstChild).is(":checked");
                    } else {
                        if (isAdd) {
                            arrIsRest[sNo] = $(this.firstChild).is(":checked");
                        }
                    }
                    sNo += 1;
                });

                // make sure the data input is valid
                if (arrLevel.length == 0) {
                    alert('请先添加债券分层。');
                    return false;
                }

                var currentJson = '{"Jsons":[';
                for (var i = 0; i < arrCheck.length; i++) {
                    if ((i + 1) == arrCheck.length) {
                        currentJson += '{"BondLevel":"' + arrLevel[i] + '","BondId":"' + arrBondId[i] + '","PrincipalSequence":"' + arrSequence[i * 2] + '","InterestSequence":"' + arrSequence[i * 2 + 1] + '","IsCheck":' + arrCheck[i] + ',"Percent":"' + arrOldPercent[i] + '","SSeqMPercent":"' + arrPercent[i] + '","IsPrincipalFill":' + arrIsRest[i] + '}]}';
                    } else {
                        currentJson += '{"BondLevel":"' + arrLevel[i] + '","BondId":"' + arrBondId[i] + '","PrincipalSequence":"' + arrSequence[i * 2] + '","InterestSequence":"' + arrSequence[i * 2 + 1] + '","IsCheck":' + arrCheck[i] + ',"Percent":"' + arrOldPercent[i] + '","SSeqMPercent":"' + arrPercent[i] + '","IsPrincipalFill":' + arrIsRest[i] + '},';
                    }
                }
                
                var arrCaculationSequence = new Array();
                for (var i = 0; i < arrSequence.length; i++) {
                    var vIscheck = "";
                    //if ((i % 2) == 1) {
                        vIscheck = "," + arrCheck[parseInt(i / 2)] + "," + arrOldPercent[parseInt(i / 2)] + ",";                       
                    //} else {
                    //    vIscheck = ",,,"
                    //}

                    if ($("#basedOnType").val() == "ABasedOnManul") {
                        vIscheck += arrPercent[parseInt(i / 2)] + ",";
                    }
                    else {
                        vIscheck += ",";
                    }

                    vIscheck += arrIsRest[parseInt(i / 2)] + ";";

                    if (arrSequence[i] != "0" && arrSequence != undefined) {
                        var sequenceObj = new Object();
                        sequenceObj.Index = parseInt(arrSequence[i]);
                        if (i >= arrSequence.length - 2) {

                            sequenceObj.Calculation = arrSequence[i] + "," + getClassName(i - arrSequence.length) + vIscheck;
                        }
                        else {
                            sequenceObj.Calculation = arrSequence[i] + "," + getClassName(i) + vIscheck;
                        }
                        arrCaculationSequence.push(sequenceObj);
                    }
                }

                arrCaculationSequence = arrCaculationSequence.sort(function (a, b) { return a.Index - b.Index; });

                var scenarioName = "";
                var presentationJson = "";
                var calculationSequence = "";
                var periods = "";
                if ($("#checkPeriod").attr("checked") == "checked") {
                    periods = $("#PeriodStart").val() + ";" + $("#PeriodEnd").val();
                }

                var allocationMethodCode = "";
                allocationMethodCode = $("#basedOnType").val();

                var allowInterestToPrincipal = false;
                if ($("#checkInterest").attr("checked") == "checked")
                {
                    allowInterestToPrincipal=true
                }

                var isupdated = false;
                for (var i = 0; i < jsonContent.length; i++) {
                    if (jsonContent[i].ScenarioId == scenarioId) {
                        scenarioName = jsonContent[i].ScenarioName;
                        jsonContent[i].PresentationJson = currentJson;
                        jsonContent[i].Periods = periods;
                        jsonContent[i].AllocationMethodCode = allocationMethodCode;
                        jsonContent[i].FeePaymentSequence = currentJsonFee;
                        jsonContent[i].AllowInterestToPrincipal =allowInterestToPrincipal;
                        isupdated = true;
                    }
                }
                if (!isupdated) {
                    scenarioName = $("#NewAddedScenario" + scenarioId).find('span').eq(0).text();
                    var newScenario = { "ScenarioId": scenarioId, "ScenarioName": scenarioName, "AllocationMethodCode": allocationMethodCode, "Periods": periods, "PresentationJson": currentJson, "FeePaymentSequence": currentJsonFee };
                    jsonContent.push(newScenario);
                }

                for (var i = 0; i < arrCaculationSequence.length; i++) {
                    calculationSequence += arrCaculationSequence[i].Calculation;
                }
                calculationSequence = calculationSequence.substr(0, calculationSequence.length - 1);

                var principalPrecision = $("#PrincipalPrecision").val();
                var interestPrecision = $("#InterestPrecision").val();

                //var sContent = "{'SPName':'" + saveSPName + "','Params':{" +
                //                "'AliasSetName':'zh-CN'" +
                //                ",'TrustId':'" + trustID +
                //                "','Periods':'" + periods +
                //                "','PrincipalPrecision':'" + principalPrecision +
                //                "','InterestPrecision':'" + interestPrecision +
                //                "','SameSeqAllocationMethod':'" + allocationMethodCode +
                //                "','ScenarioName':'" + scenarioName +
                //                "','PresentationJson':'" + currentJson +
                //                "','CalculationSequence':'" + calculationSequence +
                //                "','FeePaymentSequence':'" + currentJsonFee +
                //                "','FeeCalculationSequence':'" + calculationSequenceFee + "'}}";
                //alert(sContent);
                //tMSSaveItem("TrustManagement", sContent);
                var executeParam = {
                    SPName: saveSPName, SQLParams: [
                        { Name: 'TrustId', value: trustID, DBType: 'string' },
                        { Name: 'AliasSetName', value: 'zh-CN', DBType: 'string' },
                        { Name: 'Periods', value: periods, DBType: 'string' },
                        { Name: 'PrincipalPrecision', value: principalPrecision, DBType: 'string' },
                        { Name: 'InterestPrecision', value: interestPrecision, DBType: 'string' },
                        { Name: 'SameSeqAllocationMethod', value: allocationMethodCode, DBType: 'string' },
                        { Name: 'ScenarioName', value: scenarioName, DBType: 'string' },
                        { Name: 'PresentationJson', value: currentJson, DBType: 'string' },
                        { Name: 'CalculationSequence', value: calculationSequence, DBType: 'string' },
                        { Name: 'FeePaymentSequence', value: currentJsonFee, DBType: 'string' },
                        { Name: 'FeeCalculationSequence', value: calculationSequenceFee, DBType: 'string' },
                        { Name: 'AllowInterestToPrincipal', value: allowInterestToPrincipal, DBType: 'bool' }
                    ]
                };
                ExecuteRemoteData(executeParam, function () {});
                
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
