//@ sourceURL=viewFeeSequence.js
//add above line to enable chrome debugging

define(function (require) {
    var $ = require('jquery');
    var ui = require('jquery-ui');
    require('jquery.color');
    //require('date_input');
    //var anydialog = require('anyDialog');
    //var kendoGridModel = require('app/components/assetPoolList/js/kendoGridModel');
    //var roleOperate = require('app/productManage/TrustManagement/Common/Scripts/roleOperate');
    //var ko = require('knockout');
    //var komapping = require('knockout.mapping');
    //ko.mapping = komapping;
    //var common = require('common');
    //var gsUtil = require('gsUtil');
    var GlobalVariable = require('globalVariable');

    viewBondSequence = function () {
        var name = "viewTrustContent";
        var trustID = "";
        var jsonContent = "";
        var getAllItemSPName = "usp_GetTrustBondPaymentSequence";

        var getAllScenarioName = "usp_GetPaymentSequenceScenario";
        var saveSPName = "usp_SaveTrustBondPaymentSequence";
        var removeTrustBondPaymentSequence = "usp_RemoveTrustBondPaymentSequence";
        var GetTrustBondNamesSPName = "usp_GetTrustBondNames";
        var sequenceNo = 0;

        var arrexistSequence = new Array();
        var spRoleNames = [];
        var spRoles = [];
        var appDomain = "TrustManagement";
        var tmsSessionServiceBase = GlobalVariable.TrustManagementServiceUrl;
        var tmsDataProcessBase = GlobalVariable.DataProcessServiceUrl;
        var sprolesFromPage = window.dialogArguments;
        //var sprolesFromPage = [];

        var viewTemplate = "<div class='divTab' style='width:99%;'>" +
                                "<div class='divTabHead' id='sScenarioList'></div>" +
                                "<div class='searchPanel' style='height:2px'></div>" +
                                "<div style='height:30px'>" +
                                    "<div style='width:60px;float:left;'><input type='button' value='保 存' id='bt_Save' style='font-size: 12px' /></div>" +
                                "</div>" +
                                "<div style='width:350px'>    " +
                                    "<div class='grayDivTableHead' style='width:148px'>交易结构</div>" +
                                    "<div class='grayDivTableHead' style='width:140px'>偿还顺序</div>" +
                                "</div>" +
                                "<div class='sVariables' style='width:350px;'></div>" +
                                "<div style='clear:both'></div>" +
                                "<div style='height:10px'><div style='clear:both'></div></div>" +
                                "<div style='height:40px;width:763px;border:#BDBDBD solid 1px;line-height:28px;offsetTop:5px' id='orderButtons'>" +
                                "</div>" +
                            "</div>";

        var contentTemplate = "<div class='grayDivTableHeadCell' data='{0}' style='width:148px'>{0}</div>" +
                                "<div class='grayDivTableCell' data='{0}' style='width:140px' id='{1}'>{2}</div>";

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

        //get sequence no by service provider role code
        var getSequenceNo = function (spRoleCode) {
            var hasSeqNo = $.grep(spRoles, function (item) {
                return item.SPRItemCode == spRoleCode;
            });
            if (hasSeqNo.length > 0) {
                return hasSeqNo[0].SequenceNo;
            }
            else return "";
        }

        //generate body html
        var writeContent = function () {
            $("#" + name + " .sVariables").empty();
            var content = "";
            arrexistSequence = new Array();
            sequenceNo = 0;

            $.each(sprolesFromPage, function () {
                var SequenceId = "orderDiv" + (sequenceNo + 1);;
                var principalSequence = "";
                var spRoleName = this.Title;
                var spRoleCode = this.SPRItemCode;
                var seNo = getSequenceNo(spRoleCode);
                if (seNo != "" && seNo != "0" && parseInt(seNo) < sprolesFromPage.length + 1) {

                    principalSequence = seNo;
                    arrexistSequence.push(principalSequence);
                    principalSequence = orderButtonTemplate.format(principalSequence);
                }

                content += contentTemplate.format(spRoleName, SequenceId, principalSequence);
                sequenceNo += 1;

            });


            var principalSequenceId = "orderDiv" + (sequenceNo + 1);

            $("#" + name + " .sVariables").append(content);

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
                }
            });
        }

        var getjsonContent = function () {
            var serviceUrl = tmsDataProcessBase + "GetFeePaymentSequenceByTrust/" + trustID + "/TrustManagement";

            $.ajax({
                type: "GET",
                url: serviceUrl,
                dataType: "json",
                contentType: "application/xml;charset=utf-8",
                cache: false,
                success: function (response) {
                    if (response != "") {
                        spRoles = eval('(' + response + ')').Jsons;
                    }
                    getSPRoleNames(sprolesFromPage);

                    //   sprolesFromPage = [
                    //{
                    //    Title: "原始权益人",
                    //    SPRItemCode: 'Originator',
                    //    SequenceNo: "2"
                    //},
                    //{
                    //    Title: "计划管理人",
                    //    SPRItemCode: 'Servicer',
                    //    SequenceNo: "1"
                    //}
                    //   ];

                },
                error: function (response) { alert("error is :" + response); }
            });

            //spRoles = [
            //     {
            //         Title: "原始权益人",
            //         SPRItemCode: 'Originator',
            //         SequenceNo: "2"
            //     },
            //     {
            //         Title: "计划管理人",
            //         SPRItemCode: 'Servicer',
            //         SequenceNo: "1"
            //     }
            //];

        }

        var getSPRoleNames = function (pageresponse) {

            $.each(pageresponse, function () {
                spRoleNames.push(this.Title);
            });
            jsonContent = pageresponse;

            writeContent();
            regisUiEvents();
        }

        var getUrlParam = function (name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
            var r = window.location.search.substr(1).match(reg);  //匹配目标参数
            if (r != null) return unescape(r[2]); return null; //返回参数值
        }

        var getProviderBaseInfo = function () {
            trustID = getUrlParam('tid');
        }

        var tMSSaveItem = function (context, feeCalculationSequence) {
            var serviceUrl = tmsDataProcessBase + "SaveFeePaymentSequenceByTrust?TrustlId=" + trustID + "&applicationDomain=TrustManagement&feePaymentSequence=" + context + "&feeCalculationSequence=" + feeCalculationSequence;
            //alert(serviceUrl);
            $.ajax({
                type: "GET",
                url: serviceUrl,
                dataType: "json",
                contentType: "application/xml;charset=utf-8",
                cache: false,
                success: function (response) {

                    if (response != "") {
                        if (response.SaveFeePaymentSequenceByTrustResult) {
                            //writeContent();
                            alert("保存成功。");
                        }
                    }
                },
                error: function (response) { alert("error is :" + response); }
            });
        };

        var regisUiEvents = function () {
            $(function () {
                $("#" + name + " #bt_Save").click(function () {
                    var arrLevel = new Array();
                    var arrSequence = new Array();

                    var sNo = 0;
                    $(".sVariables .grayDivTableHeadCell").each(function () {
                        if (sNo < sequenceNo) {
                            arrLevel[sNo] = this.innerText;
                        }
                        sNo += 1;
                    });
                    sNo = 0;
                    var cNo = 0;
                    $(".sVariables .grayDivTableCell").each(function () {
                        if ($(this).find("input").length == 0) {
                            if (sNo < sequenceNo) {
                                arrSequence[sNo] = this.innerText == "" ? "0" : this.innerText;
                            }
                            sNo += 1;
                        }
                    });

                    // make sure the data input is valid
                    if (arrLevel.length == 0) {
                        alert('没有费用信息。');
                        return false;
                    }

                    var arrCaculationSequence = new Array();

                    var rolesJson = "{'Jsons':[";
                    var calculationSequence = "";
                    for (var i = 0; i < sprolesFromPage.length; i++) {
                        //if ((i + 1) == sprolesFromPage.length) {
                        //    rolesJson += "{'Title':'" + encodeURI(sprolesFromPage[i].Title) + "','SPRItemCode':'" + sprolesFromPage[i].SPRItemCode + "','SequenceNo':'" + arrSequence[i] + "'}]}";
                        //} else {
                        //    rolesJson += "{'Title':'" + encodeURI(sprolesFromPage[i].Title) + "','SPRItemCode':'" + sprolesFromPage[i].SPRItemCode + "','SequenceNo':'" + arrSequence[i] + "'},";                      
                        //}

                        if (arrSequence[i] != "0") {

                            var sequenceObj = new Object();
                            sequenceObj.Index = parseInt(arrSequence[i]);
                            sequenceObj.Calculation = arrSequence[i] + "," + sprolesFromPage[i].SPRItemCode + "Fee;";
                            sequenceObj.Title = encodeURI(sprolesFromPage[i].Title);
                            sequenceObj.SPRItemCode = sprolesFromPage[i].SPRItemCode;
                            arrCaculationSequence.push(sequenceObj);
                        }
                    }
                    arrCaculationSequence = arrCaculationSequence.sort(function (a, b) { return a.Index - b.Index; });

                    for (var i = 0; i < arrCaculationSequence.length; i++) {
                        if ((i + 1) == arrCaculationSequence.length) {
                            rolesJson += "{'Title':'" + arrCaculationSequence[i].Title + "','SPRItemCode':'" + arrCaculationSequence[i].SPRItemCode + "','SequenceNo':'" + arrCaculationSequence[i].Index + "'}]}";
                        } else {
                            rolesJson += "{'Title':'" + arrCaculationSequence[i].Title + "','SPRItemCode':'" + arrCaculationSequence[i].SPRItemCode + "','SequenceNo':'" + arrCaculationSequence[i].Index + "'},";
                        }
                        calculationSequence += arrCaculationSequence[i].Calculation;
                    }
                    calculationSequence = calculationSequence.substr(0, calculationSequence.length - 1);

                    //alert(rolesJson + "###" + calculationSequence);
                    tMSSaveItem(rolesJson, calculationSequence);
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
        };

        var postRender = function () {
            getProviderBaseInfo();
            getjsonContent();
        };
    };


    $(function () {

        uiObject = new viewBondSequence();
        uiObject.render();
    });

});
