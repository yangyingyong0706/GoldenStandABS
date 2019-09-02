viewProviderContent = function () {
    var name = "viewTrustContent";
    var trustID = "";
    var serviceProviderId = "";
    var serviceProviderRoleItemId = "";
    var jsonContent = "";
    var jsonItemCode = "";
    var searchDate = "";
    var showHistory = false;
    var getItemCodeSPName = "usp_GetTrustServiceProviderItemCodes";
    var getAllItemSPName = "usp_GetTrustServiceProviderItemContent";
    var saveSPName = "usp_SaveTrustServiceProviderItemContent";
    var tmsSessionServiceBase = GlobalVariable.TrustManagementServiceUrl;

    var viewTemplate = "<div style='width:780px'>" +
                           "<div class='searchPanel'>查询日期: <input type='text' id='searchDate' /> " +
                           "<input type='checkbox' id='ck_showhistory' />显示历史记录" +
                           "&nbsp;&nbsp;<input type='button' value='查 询' id='bt_SerachCurrent' style='font-size: 12px' /></div>" +
                           "<div>" +
                                   "<div>" +
                                       "<div class='addNewItem pointer'><img src='../img/add.png' alt='Add new Item'/>&nbsp;&nbsp;添加</div>" +
                                   "</div>" +
                                   "<div style='width:780px'>" +
                                        "<div class='grayDivTableHead'>项目</div>" +
                                        "<div class='grayDivTableHead'>项目值</div>" +
                                        "<div class='grayDivTableHead'>有效期始</div>" +
                                        "<div class='grayDivTableHeadRight'>有效期止</div>" +
                                   "</div>" +
                                   "<div style='width:780px' id='NewItemArea'>" +
                                        "<div class='grayDivTableCell'><select id='itemCode' style='font-size: 12px; position:relative;top:2px'></select></div>" +
                                        "<div class='grayDivTableCell'><input id='itemValue' type='text' /></div>" +
                                        "<div class='grayDivTableCell'><input id='startDate' type='text' /></div>" +
                                        "<div class='grayDivTableCellRight'><input type='button' value='保 存' id='bt_Save' style='font-size: 12px' />&nbsp;&nbsp;<input type='button' value='取 消' id='bt_Cancel' style='font-size: 12px' /></div>" +
                                   "</div>" +
                                   "<div class='sVariables' style='width:780px'></div>" +
                           "</div>" +
                       "</div>";

    var contentTemplate = "<div class='grayDivTableCell'>{0}</div>" +
							"<div class='grayDivTableCell'>{1}</div>" +
							"<div class='grayDivTableCell'>{2}</div>" +
                            "<div class='grayDivTableCellRight'>{3}</div>";

    var renderDatePicker = function () {
        $("#" + name + " #searchDate").datepicker({ dateFormat: 'yy-mm-dd', changeMonth: true, changeYear: true });
        $("#" + name + " #startDate").datepicker({ dateFormat: 'yy-mm-dd', changeMonth: true, changeYear: true });
        $("#ui-datepicker-div").css('font-size', '12px');
        $("#" + name + " #searchDate").val(getCurentDate());
    }

    String.prototype.format = function () {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] != 'undefined'
            ? args[number]
            : match
            ;
        });
    };

    var getCurentDate = function () {
        var myDate = new Date();
        var strYear = myDate.getFullYear();
        var strMonth = (myDate.getMonth() + 1) > 9 ? (myDate.getMonth() + 1).toString() : '0' + (myDate.getMonth() + 1).toString();
        var strDate = myDate.getDate() > 9 ? myDate.getDate().toString() : '0' + myDate.getDate();
        return strYear + "-" + strMonth + "-" + strDate;
    }

    var writeContent = function () {
        $("#" + name + " .sVariables").empty();
        var content = "";
        showHistory = $("#" + name + " #ck_showhistory").is(":checked");
        searchDate = $("#" + name + " #searchDate").val();
        if (searchDate == "") {
            searchDate = "2015-11-21";
        }
        for (var i = 0; i < jsonContent.length; i++) {
            var itemCode = jsonContent[i].ItemCode == null ? "Unknown" : jsonContent[i].ItemCode;
            var itemValue = jsonContent[i].ItemValue == null ? "" : jsonContent[i].ItemValue;
            var unitOfMeasure = jsonContent[i].UnitOfMeasure == null ? "" : jsonContent[i].UnitOfMeasure;
            itemValue = itemValue + unitOfMeasure;
            var startDate = jsonContent[i].StartDate == null ? "" : jsonContent[i].StartDate;
            var endDate = jsonContent[i].EndDate == null ? "" : jsonContent[i].EndDate;
            var sContent = "";
            if (!showHistory) {
                var vEndDate = endDate == "" ? "2100-01-01" : endDate;
                if ((startDate <= searchDate) && (searchDate <= vEndDate)) {
                    sContent = contentTemplate.format(itemCode, itemValue, startDate, endDate);
                }
            }
            else {
                sContent = contentTemplate.format(itemCode, itemValue, startDate, endDate);
            }
            content += sContent;
        }
        //if (content != "") {
        //    content = "<table class='ngrayTable'>" + content + "</table>"
        //}
        $("#" + name + " .sVariables").append(content);
    }

    var writeDropdownlist = function () {
        $("#" + name + " #itemCode").empty();
        for (var i = 0; i < jsonItemCode.length; i++) {
            var itemID = jsonItemCode[i].key;
            var itemCode = jsonItemCode[i].value;
            if (itemID != null && itemCode != null) {
                $("#" + name + " #itemCode").append("<option value='" + itemID + "'>" + itemCode + "</option>");
            }
        }
    }

    var getJsonItemCode = function () {
        var sContent = "{'SPName':'" + getItemCodeSPName + "','Params':{" +
                        "'AliasSetName':'zh-cn','ServiceProviderRoleItemId':'" + serviceProviderRoleItemId +
                        "'}}";
        tMSGetItemCodes("TrustManagement", sContent);
        //jsonItemCode = new Array({ 'ItemID': '1', 'ItemCode': 'Fee' }, { 'ItemID': '2', 'ItemCode': 'other' });
    }

    var getjsonContent = function () {
        var sContent = "{'SPName':'" + getAllItemSPName + "','Params':{" +
                        "'AliasSetName':'zh-cn','ServiceProviderId':'" + serviceProviderId +
                        "','TrustId':'" + trustID +
                        "','ServiceProviderRoleItemId':'" + serviceProviderRoleItemId +
                        "'}}";
        tMSGetItems("TrustManagement", sContent);
        //jsonContent = new Array({ 'ItemCode': 'Fee', 'ItemValue': '1', 'UnitOfMeasure': 'yy', 'StartDate': '2015-11-01', 'EndDate': '2015-11-10' }, { 'ItemCode': 'Fee', 'ItemValue': '2', 'UnitOfMeasure': 'yy', 'StartDate': '2015-11-11', 'EndDate': '2015-11-19' }, { 'ItemCode': 'Fee', 'ItemValue': '3', 'UnitOfMeasure': 'yy', 'StartDate': '2015-11-20', 'EndDate': '' }, { 'ItemCode': 'other', 'ItemValue': '400', 'UnitOfMeasure': 'yy', 'StartDate': '2015-11-01', 'EndDate': '2015-11-18' }, { 'ItemCode': 'other', 'ItemValue': '800', 'UnitOfMeasure': 'yy', 'StartDate': '2015-11-19', 'EndDate': '' });
    }

    var getUrlParam = function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
        var r = window.location.search.substr(1).match(reg);  //匹配目标参数
        if (r != null) return unescape(r[2]); return null; //返回参数值
    }

    var getProviderBaseInfo = function () {
        trustID = getUrlParam('tid');
        serviceProviderId = getUrlParam('sid');
        serviceProviderRoleItemId = getUrlParam('srid');
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
                getjsonContent();
            },
            error: function (response) { alert("error:" + response); }
        });
    };

    var tMSGetItems = function (appDomain, context) {
        var serviceUrl = tmsSessionServiceBase + "GetItems?applicationDomain=" + appDomain + "&contextInfo=" + context;
        $.ajax({
            type: "GET",
            url: serviceUrl,
            dataType: "jsonp",
            crossDomain: true,
            contentType: "application/json;charset=utf-8",
            success: function (response) {
                jsonContent = response;
                writeContent();
            },
            error: function (response) { alert("error:" + response); }
        });
    };

    var tMSGetItemCodes = function (appDomain, context) {
        var serviceUrl = tmsSessionServiceBase + "GetItemCodes?applicationDomain=" + appDomain + "&contextInfo=" + context;
        $.ajax({
            type: "GET",
            url: serviceUrl,
            dataType: "jsonp",
            crossDomain: true,
            contentType: "application/json;charset=utf-8",
            success: function (response) {
                jsonItemCode = response;
                writeDropdownlist();
            },
            error: function (response) { alert("error:" + response); }
        });
    };

    var regisUiEvents = function () {
        $(function () {
            getProviderBaseInfo();
            getJsonItemCode();
            getjsonContent();
            renderDatePicker();
            $("#" + name + " #NewItemArea").hide();

            $("#" + name + " .addNewItem").click(function () {
                $("#" + name + " #NewItemArea").show();
            });

            $("#" + name + " #bt_SerachCurrent").click(function () {
                writeContent();
            });

            $("#" + name + " #bt_Cancel").click(function () {
                $("#" + name + " #NewItemArea").hide();
            });

            $("#" + name + " #ck_showhistory").click(function () {
                showHistory = $("#" + name + " #ck_showhistory").is(":checked");
                if (showHistory) {
                    $("#" + name + " #bt_SerachCurrent").attr("disabled", "disabled");
                    $("#" + name + " #searchDate").attr("disabled", "disabled");
                }
                else {
                    $("#" + name + " #bt_SerachCurrent").removeAttr("disabled");
                    $("#" + name + " #searchDate").removeAttr("disabled");
                }
                writeContent();
            });

            $("#" + name + " #bt_Save").click(function () {
                if ($("#" + name + " #startDate").val() == "") {
                    alert("BusinessDate is empty!"); return;
                }
                if ($("#" + name + " #itemValue").val() == "") {
                    alert("itemValue is empty!"); return;
                }
                var itemID = $("#" + name + " #itemCode").val();
                var itemCode = $("#" + name + " #itemCode").find("option:selected").text();
                var startDate = $("#" + name + " #startDate").val();
                var itemValue = $("#" + name + " #itemValue").val();
                var sContent = "{'SPName':'" + saveSPName + "','Params':{" +
                                "'ServiceProviderId':'" + serviceProviderId +
                                "','TrustId':'" + trustID +
                                "','ServiceProviderRoleItemId':'" + serviceProviderRoleItemId +
                                "','BusinessDate':'" + startDate +
                                "','ItemId':'" + itemID +
                                "','ItemCode':'" + itemCode +
                                "','ItemValue':'" + itemValue + "'}}";
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
    };

    var postRender = function () {
        regisUiEvents();
    };
};
