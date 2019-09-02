/// <reference path="jquery.min.js" />
/// <reference path="App.Global.js" />
/// <reference path="common.js" />

var DataOperate = {
    //wizardService: location.protocal+"//"+location.host+'/QuickWizardService/WizardService.svc/',
	wizardService: location.protocol + '//' + location.host + '/QuickWizardService/WizardService.svc/',


    getPageData: function (businessCode, businessIdentifier, pageId, set, callback) {
        var executeParam = { SPName: 'QuickWizard.usp_GetPageItems', SQLParams: [] };
        executeParam.SQLParams.push({ Name: 'BusinessCode', Value: businessCode, DBType: 'string' });
        executeParam.SQLParams.push({ Name: 'BusinessIdentifier', Value: businessIdentifier, DBType: 'string' });
        executeParam.SQLParams.push({ Name: 'PageId', Value: pageId, DBType: 'int' });
        executeParam.SQLParams.push({ Name: 'ItemAliasSetName', Value: set, DBType: 'string' });

        var serviceUrl = GlobalVariable.QuickWizardServiceUrl + 'CommonGet?exeParams=' + encodeURIComponent(JSON.stringify(executeParam));
        CallWCFSvc(serviceUrl, false, 'GET', function (data) {
            callback(data);
        });
    },
    savePageData: function (businessCode, businessIdentifier, pageId, array, callback) {
        var itemsTmpl = '<is>{0}</is>';
        var itemTmpl = '<i><id>{0}</id><v>{1}</v><g1>{2}</g1><g2>{3}</g2><si>{4}</si></i>';

        var items = '';
        $.each(array, function (i, v) {
            var grouId01 = (typeof v.GroupId01 == 'undefined') ? '' : v.GroupId01;//存在GroupId01==0 情况
            items += itemTmpl.format(v.ItemId, v.ItemValue || '', grouId01, v.GroupId02 || '', v.SectionIndex || 0);
        });
        items = itemsTmpl.format(items);

        var executeParam = { SPName: 'QuickWizard.usp_SavePageItems', SQLParams: [] };
        executeParam.SQLParams.push({ Name: 'BusinessCode', Value: businessCode, DBType: 'string' });
        executeParam.SQLParams.push({ Name: 'BusinessIdentifier', Value: businessIdentifier, DBType: 'string' });
        executeParam.SQLParams.push({ Name: 'PageId', Value: pageId, DBType: 'int' });
        executeParam.SQLParams.push({ Name: 'PageItemXML', Value: items, DBType: 'xml' });
        executeParam.SQLParams.push({ Name: 'OutSessionId', Value: '', DBType: 'string', IsOutput: true, Size: 100 });

        var serviceUrl = GlobalVariable.QuickWizardServiceUrl + 'CommonGet?exeParams=' + encodeURIComponent(JSON.stringify(executeParam));
        CallWCFSvc(serviceUrl, false, 'GET', function (data) {
            callback(data);
        });
    },

    /*保存当前Page页数据同TrustId的关联*/
    savePageDataTrustConfig: function (callback) {
        var serviceUrl = DataOperate.wizardService + "SavePageDataTrustConfig?tid=" + tid + '&pid=' + pid + '&mid=' + mid + '&bid=' + bid;
        $.ajax({
            type: "GET",
            url: serviceUrl,
            dataType: "json",
            contentType: "application/xml;charset=utf-8",
            data: null,
            beforeSend: function () {
                //$('#loading').fadeIn();

            },
            success: function (response) {
                //$('#loading').fadeOut();
                callback(response);
            },
            error: function (response) {
                alert("error is :" + response);
            }
        });
    },

    /*获取中国大陆法定工作日*/
    getWorkingDays: function (callback) {
        var myDate = new Date();
        var startdatestr = (myDate.getFullYear() - 1) + "-" + (myDate.getMonth() + 1) + "-" + myDate.getDate();//"2016-04-26";
        var areaname = "中国大陆法定工作日";
        var sContent = "{'SPName':'usp_GetDateByCalendarName','Params':{" +
                     "'StartDate':'" + startdatestr + "'," +
                     "'CalendarName':'" + areaname + "'" +
                     "}}";
        var serviceUrl = DataOperate.wizardService + "GetWizardData?appDomain=QuickWizard&json=" + sContent;
        $.ajax({
            url: serviceUrl,
            type: "GET",
            contentType: "application/json; charset=utf-8",
            dataType: "jsonp",
            crossDomain: true,
            //async: (false),
            beforeSend: function () {
                //$('#loading').fadeIn();
            },
            success: function (data) {
                // $('#loading').fadeOut();
                var json = jQuery.parseJSON(data);
                callback(json);
            },
            error: function (error) {
                alert("error:" + error);
            }
        });
    },

    /*根据ItemId获取Item信息*/
    getItemById: function (itemId, set) {
        var item = null;
        var sContent = "{'SPName':'usp_GetItemById','Params':{" +
                 "'ItemId':'" + itemId + "'," +
                 "'ItemAliasSetName':'" + set + "'" +
                 "}}";
        var serviceUrl = DataOperate.wizardService + "GetWizardData?appDomain=QuickWizard&json=" + sContent;
        $.ajax({
            url: serviceUrl,
            type: "GET",
            contentType: "application/json; charset=utf-8",
            dataType: "jsonp",
            async: (false),
            beforeSend: function () {

            },
            success: function (data) {
                var items = jQuery.parseJSON(data);
                if (items.length > 0) {
                    item = items[0];
                }
            },
            error: function (error) {
                alert("error:" + error);
            }
        });
        return item;
    },

    /*获取DropDown的数据（同步）*/
    getChildItems: function (itemId, set) {
        var optionSource = null;
        var sContent = "{'SPName':'usp_GetChildItems','Params':{" +
                 "'ItemId':'" + itemId + "'," +
                 "'ItemAliasSetName':'" + set + "'" +
                 "}}";
        var serviceUrl = DataOperate.wizardService + "GetWizardData?appDomain=QuickWizard&json=" + sContent;
        $.ajax({
            url: serviceUrl,
            type: "GET",
            contentType: "application/json; charset=utf-8",
            dataType: "jsonp",
            async: (false),
            beforeSend: function () {

            },
            success: function (data) {
                optionSource = jQuery.parseJSON(data);
            },
            error: function (error) {
                alert("error:" + error);
            }
        });
        return optionSource;
    },

    /*获取GUID*/
    getGuid: function (tid, pid, mid, callback) {
        var serviceUrl = DataOperate.wizardService + "GetGuid?tid=" + tid + '&pid=' + pid + '&mid=' + mid;
        $.ajax({
            url: serviceUrl,
            type: "GET",
            contentType: "application/json; charset=utf-8",
            dataType: "jsonp",
            //async: (false),
            beforeSend: function () {
            },
            success: function (data) {
                $('#loading').fadeOut();
                callback(data);
            },
            error: function (error) {
                alert("error:" + error);
            }
        });
    },



    /*单条数据的添加返回@@IDENTITY，数据格式如下*/
    /*{AppDomain:xxx,SPName:xxxx,Params:{A:xx,B:xx,C:xx}}*/
    AddReturnIdentity: function (json, callback) {
        json = "<SessionContext>{0}</SessionContext>".format(json);
        var serviceUrl = DataOperate.wizardService + "AddReturnIdentity";
        $.ajax({
            type: "POST",
            url: serviceUrl,
            dataType: "json",
            contentType: "application/xml;charset=utf-8",
            data: json,
            beforeSend: function () {
                //$('#loading').fadeIn();

            },
            success: function (r) {
                //$('#loading').fadeOut();
                callback(r);
            },
            error: function (response) {
                alert("error is :" + response);
            }
        });
    },

    /*获取文档结构*/
    getDocumentsByBid: function (bid, callback) {
        var myDate = new Date();
        var startdatestr = (myDate.getFullYear() - 1) + "-" + (myDate.getMonth() + 1) + "-" + myDate.getDate();//"2016-04-26";
        var sContent = "{'SPName':'usp_DocumentAllGetByBusinessId','Params':{" +
                     "'BusinessId':'" + bid + "'" +
                     "}}";
        var serviceUrl = DataOperate.wizardService + "GetWizardData?appDomain=QuickWizard&json=" + sContent;
        $.ajax({
            url: serviceUrl,
            type: "GET",
            contentType: "application/json; charset=utf-8",
            dataType: "jsonp",
            crossDomain: true,
            //async: (false),
            beforeSend: function () {
                //$('#loading').fadeIn();
            },
            success: function (data) {
                // $('#loading').fadeOut();
                var json = jQuery.parseJSON(data);
                callback(json);
            },
            error: function (error) {
                alert("error:" + error);
            }
        });
    },

    /*添加文件夹*/
    CreateFolder: function (businessId, parentNodeId, nodeName, callback) {
        var argTemplate = 'businessId={0}&parentNodeId={1}&nodeName={2}';
        var args = argTemplate.format(businessId, parentNodeId, encodeURIComponent(nodeName));
        var serviceUrl = DataOperate.wizardService + "CreateFolder?" + args;
        $.ajax({
            url: serviceUrl,
            type: "POST",
            dataType: "json",
            cache: false,
            processData: false,

            //contentType: "application/xml;charset=utf-8",
            // data: json,
            beforeSend: function () {
                //$('#loading').fadeIn();

            },
            success: function (r) {
                //$('#loading').fadeOut();
                callback(r.CreateFolderResult);
            },
            error: function (response) {
                alert("error is :" + response);
            }
        });
    },

    /*上传文档*/
    UploadFile: function (businessId, parentNodeId, nodeName, fileData, callback) {

        var argTemplate = 'businessId={0}&parentNodeId={1}&nodeName={2}';
        var args = argTemplate.format(businessId, parentNodeId, encodeURIComponent(nodeName));
        var serviceUrl = DataOperate.wizardService + "UploadFile?" + args;
        $.ajax({
            url: serviceUrl,
            type: "POST",
            dataType: "json",
            data: fileData,
            cache: false,
            processData: false,

            //contentType: "application/xml;charset=utf-8",
            // data: json,
            beforeSend: function () {
                //$('#loading').fadeIn();

            },
            success: function (r) {
                //$('#loading').fadeOut();
                callback(r.UploadFileResult);
            },
            error: function (response) {
                alert("error is :" + response);
            }
        });
    },


    /*上传文档(可覆盖)*/
    UploadFileOverride: function (businessId, parentNodeId, nodeName, fileData, callback) {

        var argTemplate = 'businessId={0}&parentNodeId={1}&nodeName={2}';
        var args = argTemplate.format(businessId, parentNodeId, encodeURIComponent(nodeName));
        var serviceUrl = DataOperate.wizardService + "UploadFileOverride?" + args;
        $.ajax({
            url: serviceUrl,
            type: "POST",
            dataType: "json",
            data: fileData,
            cache: false,
            processData: false,

            //contentType: "application/xml;charset=utf-8",
            // data: json,
            beforeSend: function () {
                //$('#loading').fadeIn();

            },
            success: function (r) {
                //$('#loading').fadeOut();
                callback(r.UploadFileResult);
            },
            error: function (response) {
                alert("error is :" + response);
            }
        });
    },

    DocumentDelete: function (businessId, nodeId, isFolder) {
        var argTemplate = 'businessId={0}&nodeId={1}&isFolder={2}';
        var args = argTemplate.format(businessId, nodeId, isFolder);
        var serviceUrl = DataOperate.wizardService + "DocumentDelete?" + args;
        $.ajax({
            url: serviceUrl,
            type: "POST",
            dataType: "json",
            cache: false,
            processData: false,

            //contentType: "application/xml;charset=utf-8",
            // data: json,
            beforeSend: function () {
                //$('#loading').fadeIn();

            },
            success: function (r) {

            },
            error: function (response) {
                alert("error is :" + response);
            }
        });
    },

    /*数据存储定义的格式*/
    DataItem: function () {
        var obj = new Object();
        obj.PageId = '';
        obj.ItemId = '';
        obj.ItemValue = '';
        obj.GroupId01 = '';
        obj.GroupId02 = '';
        obj.GroupId03 = '';
        obj.GroupId04 = '';
        return obj;
    },

    //获取固守产品定价第三页下拉列表绑定数据
    getZCYCurveData: function (TermBase, callback) {
        var sContent = "{'SPName':'QuickWizard.getZCYCurveData','Params':{" +
                      "'TermBase':" + "'" + TermBase + "'" +
                      "}}";
        var serviceUrl = DataOperate.wizardService + "GetWizardData?appDomain=QuickWizard&json=" + sContent;
        $.ajax({
            url: serviceUrl,
            type: "GET",
            contentType: "application/json; charset=utf-8",
            dataType: "jsonp",
            crossDomain: true,
            //async: (false),
            beforeSend: function () {
                //$('#loading').fadeIn();
            },
            success: function (data) {
                // $('#loading').fadeOut();
                var json = jQuery.parseJSON(data);
                callback(json);
            },
            error: function (error) {
                alert("error:" + error);
            }
        });
    },

    getCashflows: function (TermBase, callback) {
        var sContent = "{'SPName':'QuickWizard.getCashflows','Params':{" +
                      "'TermBase':" + "'" + TermBase + "'" +
                      "}}";
        var serviceUrl = DataOperate.wizardService + "GetWizardData?appDomain=QuickWizard&json=" + sContent;
        $.ajax({
            url: serviceUrl,
            type: "GET",
            contentType: "application/json; charset=utf-8",
            dataType: "jsonp",
            crossDomain: true,
            //async: (false),
            beforeSend: function () {
                //$('#loading').fadeIn();
            },
            success: function (data) {
                // $('#loading').fadeOut();
                var json = jQuery.parseJSON(data);
                callback(json);
            },
            error: function (error) {
                alert("error:" + error);
            }
        });
    },

    getTrusts: function (TermBase, callback) {
        var sContent = "{'SPName':'QuickWizard.getTrusts','Params':{" +
                      "'TermBase':" + "'" + TermBase + "'" +
                      "}}";
        var serviceUrl = DataOperate.wizardService + "GetWizardData?appDomain=QuickWizard&json=" + sContent;
        $.ajax({
            url: serviceUrl,
            type: "GET",
            contentType: "application/json; charset=utf-8",
            dataType: "jsonp",
            crossDomain: true,
            //async: (false),
            beforeSend: function () {
                //$('#loading').fadeIn();
            },
            success: function (data) {
                // $('#loading').fadeOut();
                var json = jQuery.parseJSON(data);
                callback(json);
            },
            error: function (error) {
                alert("error:" + error);
            }
        });
    },
    /* */
    getArrearsRange: function (TrustId, callback) {
        var sContent = "{'SPName':'QuickWizard.getArrearsRange','Params':{" +
                      "'TrustId':" + "'" + TrustId + "'" +
                      "}}";
	 
        var serviceUrl = DataOperate.wizardService + "GetWizardData?appDomain=QuickWizard&json=" + sContent;
        $.ajax({
            url: serviceUrl,
            type: "GET",
            contentType: "application/json; charset=utf-8",
            dataType: "jsonp",
            crossDomain: true,
            //async: (false),
            beforeSend: function () {
                //$('#loading').fadeIn();
            },
            success: function (data) {
                // $('#loading').fadeOut();
                var json = jQuery.parseJSON(data);
                callback(json);
            },
            error: function (error) {
                alert("error:" + error);
            }
        });
    },
	getOrganisationByTrustId: function (TrustId, callback) {
        var sContent = "{'SPName':'QuickWizard.getOrganisationByTrustId','Params':{" +
                      "'TrustId':" + "'" + TrustId + "'" +
                      "}}";
        var serviceUrl = DataOperate.wizardService + "GetWizardData?appDomain=QuickWizard&json=" + sContent;
        $.ajax({
            url: serviceUrl,
            type: "GET",
            contentType: "application/json; charset=utf-8",
            dataType: "jsonp",
            crossDomain: true,
            //async: (false),
            beforeSend: function () {
                //$('#loading').fadeIn();
            },
            success: function (data) {
                // $('#loading').fadeOut();
                var json = jQuery.parseJSON(data);
                callback(json);
            },
            error: function (error) {
                alert("error:" + error);
            }
        });
    },
	getAssetTypeByTrustId: function (TrustId, callback) {
        var sContent = "{'SPName':'QuickWizard.getAssetTypeByTrustId','Params':{" +
                      "'TrustId':" + "'" + TrustId + "'" +
                      "}}";
        var serviceUrl = DataOperate.wizardService + "GetWizardData?appDomain=QuickWizard&json=" + sContent;
        $.ajax({
            url: serviceUrl,
            type: "GET",
            contentType: "application/json; charset=utf-8",
            dataType: "jsonp",
            crossDomain: true,
            //async: (false),
            beforeSend: function () {
                //$('#loading').fadeIn();
            },
            success: function (data) {
                // $('#loading').fadeOut();
                var json = jQuery.parseJSON(data);
                callback(json);
            },
            error: function (error) {
                alert("error:" + error);
            }
        });
    },

    getTrustOfferAmount: function (TrustId, callback) {
        var sContent = "{'SPName':'QuickWizard.getTrustOfferAmount','Params':{" +
                      "'TrustId':" + "'" + TrustId + "'" +
                      "}}";
        var serviceUrl = DataOperate.wizardService + "GetWizardData?appDomain=QuickWizard&json=" + sContent;
        $.ajax({
            url: serviceUrl,
            type: "GET",
            contentType: "application/json; charset=utf-8",
            dataType: "jsonp",
            crossDomain: true,
            //async: (false),
            beforeSend: function () {
                //$('#loading').fadeIn();
            },
            success: function (data) {
                // $('#loading').fadeOut();
                var json = jQuery.parseJSON(data);
                callback(json);
            },
            error: function (error) {
                alert("error:" + error);
            }
        });
    },

    getOrganisationCode: function (TermBase, callback) {
        var sContent = "{'SPName':'QuickWizard.DefaultAnalysis_getOrganisationCode','Params':{" +
                      "'TermBase':" + "'" + TermBase + "'" +
                      "}}";
        var serviceUrl = DataOperate.wizardService + "GetWizardData?appDomain=QuickWizard&json=" + sContent;
        $.ajax({
            url: serviceUrl,
            type: "GET",
            contentType: "application/json; charset=utf-8",
            dataType: "jsonp",
            crossDomain: true,
            //async: (false),
            beforeSend: function () {
                //$('#loading').fadeIn();
            },
            success: function (data) {
                // $('#loading').fadeOut();
                var json = jQuery.parseJSON(data);
                callback(json);
            },
            error: function (error) {
                alert("error:" + error);
            }
        });
    },
    GetStaticPool: function (TermBase, callback) {
        var sContent = "{'SPName':'QuickWizard.DefaultAnalysis_getStaticPool','Params':{" +
                      "'TermBase':" + "'" + TermBase + "'" +
                      "}}";
        var serviceUrl = DataOperate.wizardService + "GetWizardData?appDomain=QuickWizard&json=" + sContent;
        $.ajax({
            url: serviceUrl,
            type: "GET",
            contentType: "application/json; charset=utf-8",
            dataType: "jsonp",
            async: false,
            success: function (data) {
                // $('#loading').fadeOut();
                var json = jQuery.parseJSON(data);
                callback(json);
            },
            error: function (error) {
                alert("error:" + error);
            }
        });
    },
    GetLossRate: function (TermBase, callback) {
        var sContent = "{'SPName':'QuickWizard.DefaultAnalysis_getLossRate','Params':{" +
                      "'TermBase':" + "'" + TermBase + "'" +
                      "}}";
        var serviceUrl = DataOperate.wizardService + "GetWizardData?appDomain=QuickWizard&json=" + sContent;
        $.ajax({
            url: serviceUrl,
            type: "GET",
            contentType: "application/json; charset=utf-8",
            dataType: "jsonp",
            async: false,
            beforeSend: function () {
                //$('#loading').fadeIn();
            },
            success: function (data) {
                // $('#loading').fadeOut();
                var json = jQuery.parseJSON(data);
                callback(json);
            },
            error: function (error) {
                alert("error:" + error);
            }
        });
    },
    GetPreditLossRate: function (TermBase, callback) {
        var sContent = "{'SPName':'QuickWizard.DefaultAnalysis_getPreditLossRate','Params':{" +
                      "'TermBase':" + "'" + TermBase + "'" +
                      "}}";
        var serviceUrl = DataOperate.wizardService + "GetWizardData?appDomain=QuickWizard&json=" + sContent;
        $.ajax({
            url: serviceUrl,
            type: "GET",
            contentType: "application/json; charset=utf-8",
            dataType: "jsonp",
            async: false,
            beforeSend: function () {
                //$('#loading').fadeIn();
            },
            success: function (data) {
                // $('#loading').fadeOut();
                var json = jQuery.parseJSON(data);
                callback(json);
            },
            error: function (error) {
                alert("error:" + error);
            }
        });
    },
    GetRiskTransferResult: function (BusinessId, callback) {
        var sContent = "{'SPName':'RiskTransfer.usp_GetRiskTransferResult','Params':{" +
                      "'BusinessIdentifier':" + "'" + BusinessId + "'" +
                      "}}";
        var serviceUrl = DataOperate.wizardService + "GetWizardData?appDomain=QuickWizard&json=" + encodeURIComponent(sContent);
        $.ajax({
            url: serviceUrl,
            type: "GET",
            contentType: "application/json; charset=utf-8",
            dataType: "jsonp",
            async: false,
            beforeSend: function () {
                //$('#loading').fadeIn();
            },
            success: function (data) {
                // $('#loading').fadeOut();
                var json = jQuery.parseJSON(data);
                callback(json);
            },
            error: function (error) {
                alert("error:" + error);
            }
        });
    },


}

