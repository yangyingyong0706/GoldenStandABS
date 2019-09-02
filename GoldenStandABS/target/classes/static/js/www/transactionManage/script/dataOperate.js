function siteApp() {
    var curWwwPath = window.document.location.href;
    var pathName = window.document.location.pathname;
    var pos = curWwwPath.indexOf(pathName);
    var siteApp = pathName.substring(1, pathName.substr(1).indexOf('/') + 1);
    return siteApp;
}


//强制转化日期
function ConvertDate(json) {
    for (i = 0; i < json.length; i++) {
        var date = new Date(parseInt(json[i].ClearanceBuyBackDate.slice(6)));
        var Month = date.getMonth();
        var D = date.getDate();
        console.log(parseInt(Month));
        if (parseInt(Month) < 10)
            Month = "0" + Month;
        if (parseInt(D) < 10)
            D = "0" + D;
        json[i].ClearanceBuyBackDate = date.getFullYear() + '-' + Month + '-' + D;
    }
    return json;
}



define(['jquery', 'gs/uiFrame/js/common', 'globalVariable', 'callApi'], function ($, common, GlobalVariable, CallApi) {
     function DataOperateFun() {
         this.DataOperate = {
             dbName: 'QuickWizard',
             schema: 'QuickWizard',
             NewdbName:'TrustManagement',
             Newschema:'TrustManagement',
             siteAppUrl: location.protocol + "//" + location.host + '/' + siteApp(),
             wizardService: location.protocol + "//" + location.host + '/' + siteApp() + '/' + 'service' + '/WizardService.svc/',
             //siteAppUrl: location.protocol + "//" + location.host + '/' + 'QuickWizard',
             //wizardService: location.protocol + "//" + location.host + '/' + 'QuickWizard' + '/WizardService.svc/',
         }
     };
     DataOperateFun.prototype = {
        /*获取当前Page的数据，调用公用的WCF方法*/
        getPageData: function (mid, pid, bid, set, callback) {
            var sContent = "{'SPName':'usp_GetPageItems','Params':{" +
                          "'ModelId':'" + mid + "'," +
                          "'PageId':'" + pid + "'," +
                          "'BusinessId':'" + bid + "'," +
                          "'ItemAliasSetName':'" + set + "'" +
                          "}}";
            var serviceUrl = this.DataOperate.wizardService + "DataRead?dbName=" + this.DataOperate.dbName + "&schema=" + this.DataOperate.schema + "&json=" + sContent;
            console.log(serviceUrl)
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


        /*保存当前Page页的Item数组,格式如下*/
        /*[{A:xx,B:xx,C:xx},{A:xx,B:xx,C:xx},{A:xxx,B:xxx,C:xxx}]*/
        savePageData: function (array, callback) {
            var xml = '<Items>';
            $.each(array, function (i, item) {
                xml += '<Item>';
                xml += '<BusinessId>' + item.BusinessId + '</BusinessId>';
                xml += '<ModelId>' + item.ModelId + '</ModelId>';
                xml += '<PageId>' + item.PageId + '</PageId>';
                xml += '<ItemId>' + item.ItemId + '</ItemId>';
                xml += '<ItemValue>' + item.ItemValue + '</ItemValue>';
                xml += '<GroupId01>' + item.GroupId01 + '</GroupId01>';
                xml += '<GroupId02>' + item.GroupId02 + '</GroupId02>';
                xml += '<GroupId03>' + item.GroupId03 + '</GroupId03>';
                xml += '<GroupId04>' + item.GroupId04 + '</GroupId04>';
                xml += '</Item>';
            })
            xml += '</Items>';
            xml = encodeURIComponent(xml);
            var json = "{'DBName':'" + this.DataOperate.dbName + "','Schema':'" + this.DataOperate.schema + "','SPName':'usp_SavePageItems','Params':{'Items':'" + xml + "'}}";
            json = "<SessionContext>{0}</SessionContext>".format(json);
            var serviceUrl = this.DataOperate.wizardService + "DataCUD";
            console.log(serviceUrl)
            $.ajax({
                type: "POST",
                url: serviceUrl,
                dataType: "json",
                contentType: "application/xml;charset=utf-8",
                data: json,
                beforeSend: function () {
                    //$('#loading').fadeIn();

                },
                success: function (response) {
                    if (!isNaN(response)) {
                        callback(response)
                    }
                    else
                        //$('#loading').fadeOut();
                        callback(-1);
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
            var serviceUrl = this.DataOperate.wizardService + "DataRead?dbName=" + this.DataOperate.dbName + "&schema=" + this.DataOperate.schema + "&json=" + sContent;
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
            var serviceUrl = this.DataOperate.wizardService + "DataRead?dbName=" + this.DataOperate.dbName + "&schema=" + this.DataOperate.schema + "&json=" + sContent;
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

        /*根据ModelId获取其拥有的Pages.主要用到PageCode,通过PageCode找到相应的页面或者预览页*/
        getPagesByModelId: function (modelId, callback) {
            var sContent = "{'SPName':'usp_GetPagesByModelId','Params':{" +
                     "'ModelId':'" + modelId + "'" +
                     "}}";
            var serviceUrl = this.DataOperate.wizardService + "DataRead?dbName=" + this.DataOperate.dbName + "&schema=" + this.DataOperate.schema + "&json=" + sContent;
            $.ajax({
                url: serviceUrl,
                type: "GET",
                contentType: "application/json; charset=utf-8",
                dataType: "jsonp",
                crossDomain: true,
                // async: (false),
                beforeSend: function () {

                },
                success: function (data) {
                    var pages = jQuery.parseJSON(data);
                    callback(pages);
                },
                error: function (error) {
                    alert("error:" + error);
                }
            });

        },

        /*获取DropDown的数据（同步）*/
        getChildItems: function (itemId, set) {
            var optionSource = null;
            var sContent = "{'SPName':'usp_GetChildItems','Params':{" +
                     "'ItemId':'" + itemId + "'," +
                     "'ItemAliasSetName':'" + set + "'" +
                     "}}";
            var serviceUrl = this.DataOperate.wizardService + "DataRead?dbName=" + this.DataOperate.dbName + "&schema=" + this.DataOperate.schema + "&json=" + sContent;
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
        getGuid: function (callback) {
            var serviceUrl = this.DataOperate.wizardService + "GetGuid";
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
                    console.log(error);
                }
            });
        },

         //交易管理（资产转让/信托对价分配）获取数据
        transationManagerData: function (callback) {
            var projectId = common.getQueryString("tid");
            var isProjectUrl = common.getQueryString('isproject');
            var TrustId = common.getQueryString("tid");
            
            var that = this;
            if (isProjectUrl && projectId != '')
            {
                //usp_getTrustIdFromProjectId
                var callApi = new CallApi('TrustManagement', 'TrustManagement.usp_getTrustIdFromProjectId', true);
                callApi.AddParam({ Name: 'ProjectId', Value: projectId, DBType: 'int' });
                callApi.ExecuteDataTable(function (data) {
                    if (data[0]) {
                        var sContent = "{'SPName':'usp_GetAssetTransferListData','Params':{" +
                        "'TrustId':'" + data[0].TrustId + "'" +
                        "}}";
                        var serviceUrl = that.DataOperate.wizardService + "DataRead?dbName=" + that.DataOperate.NewdbName + "&schema=" + that.DataOperate.Newschema + "&json=" + sContent;
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
                                callback(optionSource)
                            },
                            error: function (error) {
                                alert("error:" + error);
                            }
                        });
                    }
                });
            }
            else{
                var sContent = "{'SPName':'usp_GetAssetTransferListData','Params':{" +
                        "'TrustId':'" + TrustId + "'" +
                        "}}";
                var serviceUrl = that.DataOperate.wizardService + "DataRead?dbName=" + that.DataOperate.NewdbName + "&schema=" + that.DataOperate.Newschema + "&json=" + sContent;
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
                        callback(optionSource)
                    },
                    error: function (error) {
                        alert("error:" + error);
                    }
                });
            }
        },
        //交易管理（资产转让）查看详情
        viewtransationManagerData: function (BussinessNo, callback) {
            var sContent = "{'SPName':'usp_ViewTransferProperty','Params':{" + "'BussinessNo':'" + BussinessNo + "'" + "}}";
            var serviceUrl = this.DataOperate.wizardService + "DataRead?dbName=" + this.DataOperate.dbName + "&schema=" + this.DataOperate.schema + "&json=" + sContent;
            console.info(serviceUrl)
            $.ajax({
                url: serviceUrl,
                type: "GET",
                contentType: "application/json; charset=utf-8",
                dataType: "jsonp",
                //async: false,
                beforeSend: function () {
                },
                success: function (data) {
                    var json = jQuery.parseJSON(data);
                    callback(json)
                },
                error: function (error) {
                    alert("error:" + error);
                }
            });

        },
        //交易管理（资产转让）编辑数据
        viewUpdateTransferProperty: function (BussinessNo, TransferMethod, PoolDBName, AccountNo, TransferDate, DealSum, TheorySum, FactSum, Dealer, StartDate, DealerOpponent, Remark) {
            var argTemplate = 'dbName={0}&schema={1}&BussinessNo={2}&TransferMethod={3}&PoolDBName={4}&AccountNo={5}&TransferDate={6}&DealSum={7}&TheorySum={8}&FactSum={9}&Dealer={10}&StartDate={11}&DealerOpponent={12}&Remark={12}';
            var args = argTemplate.format(this.DataOperate.dbName, this.DataOperate.schema, BussinessNo, TransferMethod, PoolDBName, AccountNo, TransferDate, DealSum, TheorySum, FactSum, Dealer, StartDate, DealerOpponent, Remark);
            var serviceUrl = this.DataOperate.wizardService + "DocumentDelete?" + args;
            console.info(serviceUrl);
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
        //交易管理（资产转让）检索查询
        viewQueryTransferProperty: function (PoolDBName, AccountNo, callback) {
            var sContent = "{'SPName':'usp_QueryTransferProperty','Params':{" + "'PoolDBName':'" + PoolDBName + "'" + " , " + "'AccountNo':'" + AccountNo + "'" + "}}";
            var serviceUrl = this.DataOperate.wizardService + "DataRead?dbName=" + this.DataOperate.dbName + "&schema=" + this.DataOperate.schema + "&json=" + sContent;
            console.info(serviceUrl)
            $.ajax({
                url: serviceUrl,
                type: "GET",
                contentType: "application/json; charset=utf-8",
                dataType: "jsonp",
                //async: false,
                beforeSend: function () {
                },
                success: function (data) {
                    var json = jQuery.parseJSON(data);
                    callback(json)
                },
                error: function (error) {
                    alert("error:" + error);
                }
            });

        },
        //交易管理（资产转让）删除数据
        DeleteTransferProperty: function (BussinessNo, AccountNo, PoolDBName, TransferDate, callback) {
            var sContent = "{'SPName':'usp_DeleteTransferProperty','Params':{" +
                "'BussinessNo':'" + BussinessNo + "'," +
                "'AccountNo':'" + AccountNo + "'," +
                "'PoolDBName':'" + PoolDBName + "'," +
                "'TransferDate':'" + TransferDate + "'" +
                "}}";
            var serviceUrl = this.DataOperate.wizardService + "DataRead?dbName=" + this.DataOperate.dbName + "&schema=" + this.DataOperate.schema + "&json=" + sContent;
            console.info(serviceUrl)
            $.ajax({
                url: serviceUrl,
                type: "GET",
                contentType: "application/json; charset=utf-8",
                dataType: "jsonp",
                //async: false,
                beforeSend: function () {
                },
                success: function (data) {
                    var json = jQuery.parseJSON(data);
                    callback(json)
                },
                error: function (error) {
                    alert("error:" + error);
                }
            });

        },
        //交易管理（资产转让）编辑前的获取数据
        GetTransferPropertyDisplayForUpdate: function (BussinessNo, callback) {
            var sContent = "{'SPName':'usp_GetTransferPropertyDisplayForUpdate','Params':{" + "'BussinessNo':'" + BussinessNo + "'" + "}}";
            var serviceUrl = this.DataOperate.wizardService + "DataRead?dbName=" + this.DataOperate.dbName + "&schema=" + this.DataOperate.schema + "&json=" + sContent;
            console.info(serviceUrl)
            $.ajax({
                url: serviceUrl,
                type: "GET",
                contentType: "application/json; charset=utf-8",
                dataType: "jsonp",
                //async: false,
                beforeSend: function () {
                },
                success: function (data) {
                    var json = jQuery.parseJSON(data);
                    callback(json)
                },
                error: function (error) {
                    alert("error:" + error);
                }
            });

        },
        //交易管理（资产转让）编辑数据
        UpdateTransferProperty: function (BussinessNo, Remark, callback) {
            var sContent = "{'SPName':'usp_UpdateTransferProperty','Params':{" +
                "'BussinessNo':'" + BussinessNo + "'," +
                "'Remark':'" + Remark + "'" +
                "}}";
            var serviceUrl = encodeURI(this.DataOperate.wizardService + "DataRead?dbName=" + this.DataOperate.dbName + "&schema=" + this.DataOperate.schema + "&json=" + sContent);
            console.info(serviceUrl);
            $.ajax({
                url: serviceUrl,
                type: "GET",
                contentType: "application/json; charset=utf-8",
                dataType: "jsonp",
                //async: false,
                beforeSend: function () {
                },
                success: function (data) {
                    var json = jQuery.parseJSON(data);
                    callback(json)
                },
                error: function (error) {
                    alert("error:" + error);
                }
            });

        },

        //交易管理（回收管理）检索查询
        viewQueryTransferPropertyForRecycle: function (MaturityDate, AccountNo, callback) {
            var sContent = "{'SPName':'usp_QueryTransferPropertyForRecycle','Params':{" + "'MaturityDate':'" + MaturityDate + "'" + " , " + "'AccountNo':'" + AccountNo + "'" + "}}";
            var serviceUrl = this.DataOperate.wizardService + "DataRead?dbName=" + this.DataOperate.dbName + "&schema=" + this.DataOperate.schema + "&json=" + sContent;
            console.info(serviceUrl)
            $.ajax({
                url: serviceUrl,
                type: "GET",
                contentType: "application/json; charset=utf-8",
                dataType: "jsonp",
                //async: false,
                beforeSend: function () {
                },
                success: function (data) {
                    var json = jQuery.parseJSON(data);
                    callback(json)
                },
                error: function (error) {
                    alert("error:" + error);
                }
            });

        },
        //交易管理（回收管理）获取数据
        GettransationManagerData: function (callback) {
            var sContent = "{'SPName':'usp_GetTransferAssetsforRecycle','Params':{}}";
            var serviceUrl = this.DataOperate.wizardService + "DataRead?dbName=" + this.DataOperate.dbName + "&schema=" + this.DataOperate.schema + "&json=" + sContent;
            console.info(serviceUrl)
            $.ajax({
                url: serviceUrl,
                type: "GET",
                contentType: "application/json; charset=utf-8",
                dataType: "jsonp",
                //async: false,
                beforeSend: function () {
                },
                success: function (data) {
                    var json = jQuery.parseJSON(data);
                    for (i = 0; i < json.length; i++) {
                        var date = new Date(parseInt(json[i].StartDate.slice(6)));
                        var Month = date.getMonth();
                        var D = date.getDate();

                        if (parseInt(Month) + 1 < 10)
                            Month = "0" + String(parseInt(Month) + 1);
                        else
                            Month = String(parseInt(Month) + 1);
                        if (parseInt(D) < 10)
                            D = "0" + D;
                        json[i].StartDate = date.getFullYear() + '-' + Month + '-' + D;
                    }
                    for (i = 0; i < json.length; i++) {
                        var date = new Date(parseInt(json[i].MaturityDate.slice(6)));
                        var Month = date.getMonth();
                        var D = date.getDate();

                        if (parseInt(Month) + 1 < 10)
                            Month = "0" + String(parseInt(Month) + 1);
                        else
                            Month = String(parseInt(Month) + 1);
                        if (parseInt(D) < 10)
                            D = "0" + D;
                        json[i].MaturityDate = date.getFullYear() + '-' + Month + '-' + D;
                    }
                    callback(json)
                },
                error: function (error) {
                    alert("error:" + error);
                }
            });

        },
        //交易管理 (回收管理）回收确认
        SaveRecycleProperty: function (AccountNo, callback) {
            var sContent = "{'SPName':'usp_SaveRecycleProperty','Params':{" + "'AccountNo':'" + AccountNo + "'" + "}}";
            var serviceUrl = this.DataOperate.wizardService + "DataRead?dbName=" + this.DataOperate.dbName + "&schema=" + this.DataOperate.schema + "&json=" + sContent;
            console.info(serviceUrl)
            $.ajax({
                url: serviceUrl,
                type: "GET",
                contentType: "application/json; charset=utf-8",
                dataType: "jsonp",
                //async: false,
                beforeSend: function () {
                },
                success: function (data) {
                    var json = jQuery.parseJSON(data);
                    callback(json)
                },
                error: function (error) {
                    console.log(error)
                }
            });

        },
        //交易管理（回收管理）查看详情
        ViewRecycleProperty: function (AccountNo, callback) {
            var sContent = "{'SPName':'usp_ViewRecycleProperty','Params':{" +
                "'AccountNo':'" + AccountNo + "'" +
                "}}";
            var serviceUrl = this.DataOperate.wizardService + "DataRead?dbName=" + this.DataOperate.dbName + "&schema=" + this.DataOperate.schema + "&json=" + sContent;
            console.info(serviceUrl)
            $.ajax({
                url: serviceUrl,
                type: "GET",
                contentType: "application/json; charset=utf-8",
                dataType: "jsonp",
                async: false,
                beforeSend: function () {
                },
                success: function (data) {
                    var json = jQuery.parseJSON(data);
                    callback(json)
                },
                error: function (error) {
                    alert("error:" + error);
                }
            });

        },

        //交易管理（回收上划）获取数据
        GetTransferAssetsforRecycleCross: function (callback) {
            var sContent = "{'SPName':'usp_GetTransferAssetsforRecycleCross','Params':{}}";
            var serviceUrl = this.DataOperate.wizardService + "DataRead?dbName=" + this.DataOperate.dbName + "&schema=" + this.DataOperate.schema + "&json=" + sContent;
            console.info(serviceUrl)
            $.ajax({
                url: serviceUrl,
                type: "GET",
                contentType: "application/json; charset=utf-8",
                dataType: "jsonp",
                //async: false,
                beforeSend: function () {
                },
                success: function (data) {
                    var json = jQuery.parseJSON(data);
                    for (i = 0; i < json.length; i++) {
                        var date = new Date(parseInt(json[i].RecycleDate.slice(6)));
                        var Month = date.getMonth();
                        var D = date.getDate();

                        if (parseInt(Month) + 1 < 10)
                            Month = "0" + String(parseInt(Month) + 1);
                        else
                            Month = String(parseInt(Month) + 1);
                        if (parseInt(D) < 10)
                            D = "0" + D;
                        json[i].RecycleDate = date.getFullYear() + '-' + Month + '-' + D;
                    }
                    for (i = 0; i < json.length; i++) {
                        var date = new Date(parseInt(json[i].MaturityDate.slice(6)));
                        var Month = date.getMonth();
                        var D = date.getDate();

                        if (parseInt(Month) + 1 < 10)
                            Month = "0" + String(parseInt(Month) + 1);
                        else
                            Month = String(parseInt(Month) + 1);
                        if (parseInt(D) < 10)
                            D = "0" + D;
                        json[i].MaturityDate = date.getFullYear() + '-' + Month + '-' + D;
                    }
                    callback(json)
                },
                error: function (error) {
                    alert("error:" + error);
                }
            });

        },
        //交易管理（回收上划）检索查询
        viewQueryTransferPropertyFroRecycleCross: function (TrustName, AccountNo, callback) {
            var sContent = "{'SPName':'usp_QueryTransferPropertyFroRecycleCross','Params':{" + "'TrustName':'" + TrustName + "'" + " , " +
                "'AccountNo':'" + AccountNo + "'" +
                "}}";
            var serviceUrl = this.DataOperate.wizardService + "DataRead?dbName=" + this.DataOperate.dbName + "&schema=" + this.DataOperate.schema + "&json=" + sContent;
            console.info(serviceUrl)
            serviceUrl = encodeURI(serviceUrl);
            $.ajax({
                url: serviceUrl,
                type: "GET",
                contentType: "application/json; charset=utf-8",
                dataType: "jsonp",
                //async: false,
                beforeSend: function () {
                },
                success: function (data) {
                    var json = jQuery.parseJSON(data);
                    callback(json)
                },
                error: function (error) {
                    alert("error:" + error);
                }
            });

        },
        //交易管理 (回收上划）回收上划确认
        SaveRecycleCrossProperty: function (AccountNo, callback) {
            var sContent = "{'SPName':'usp_SaveRecycleCrossProperty','Params':{" + "'AccountNo':'" + AccountNo + "'" + "}}";
            var serviceUrl = this.DataOperate.wizardService + "DataRead?dbName=" + this.DataOperate.dbName + "&schema=" + this.DataOperate.schema + "&json=" + sContent;
            console.info(serviceUrl)
            $.ajax({
                url: serviceUrl,
                type: "GET",
                contentType: "application/json; charset=utf-8",
                dataType: "jsonp",
                //async: false,
                beforeSend: function () {
                },
                success: function (data) {
                    var json = jQuery.parseJSON(data);
                    callback(json)
                },
                error: function (error) {
                    alert("error:" + error);
                }
            });

        },
        //交易管理 (回收上划）查看详情
        ViewRecycleCrossProperty: function (AccountNo, callback) {
            var sContent = "{'SPName':'usp_ViewRecycleCrossProperty','Params':{" + "'AccountNo':'" + AccountNo + "'" + "}}";
            var serviceUrl = this.DataOperate.wizardService + "DataRead?dbName=" + this.DataOperate.dbName + "&schema=" + this.DataOperate.schema + "&json=" + sContent;
            console.info(serviceUrl)
            $.ajax({
                url: serviceUrl,
                type: "GET",
                contentType: "application/json; charset=utf-8",
                dataType: "jsonp",
                //async: false,
                beforeSend: function () {
                },
                success: function (data) {
                    var json = jQuery.parseJSON(data);
                    callback(json)
                },
                error: function (error) {
                    alert("error:" + error);
                }
            });

        },
        //交易管理（回收上划）删除数据
        DeleteRecycleCrossProperty: function (AccountNo, callback) {
            var sContent = "{'SPName':'usp_DeleteRecycleCrossProperty','Params':{" + "'AccountNo':'" + AccountNo + "'" + "}}";
            var serviceUrl = this.DataOperate.wizardService + "DataRead?dbName=" + this.DataOperate.dbName + "&schema=" + this.DataOperate.schema + "&json=" + sContent;
            console.info(serviceUrl)
            $.ajax({
                url: serviceUrl,
                type: "GET",
                contentType: "application/json; charset=utf-8",
                dataType: "jsonp",
                //async: false,
                beforeSend: function () {
                },
                success: function (data) {
                    var json = jQuery.parseJSON(data);
                    callback(json)
                },
                error: function (error) {
                    alert("error:" + error);
                }
            });

        },


        //交易管理（回收转付）获取数据
        GetTurnPay: function (callback) {
            var sContent = "{'SPName':'usp_GetTurnPay','Params':{}}";
            var serviceUrl = this.DataOperate.wizardService + "DataRead?dbName=" + this.DataOperate.dbName + "&schema=" + this.DataOperate.schema + "&json=" + sContent;
            console.info(serviceUrl)
            $.ajax({
                url: serviceUrl,
                type: "GET",
                contentType: "application/json; charset=utf-8",
                dataType: "jsonp",
                //async: false,
                beforeSend: function () {
                },
                success: function (data) {
                    var json = jQuery.parseJSON(data);
                    for (i = 0; i < json.length; i++) {
                        var date = new Date(parseInt(json[i].RecycleCrossDate.slice(6)));
                        var Month = date.getMonth();
                        var D = date.getDate();

                        if (parseInt(Month) + 1 < 10)
                            Month = "0" + String(parseInt(Month) + 1);
                        else
                            Month = String(parseInt(Month) + 1);
                        if (parseInt(D) < 10)
                            D = "0" + D;
                        json[i].RecycleCrossDate = date.getFullYear() + '-' + Month + '-' + D;
                    }
                    for (i = 0; i < json.length; i++) {
                        var date = new Date(parseInt(json[i].MaturityDate.slice(6)));
                        var Month = date.getMonth();
                        var D = date.getDate();

                        if (parseInt(Month) + 1 < 10)
                            Month = "0" + String(parseInt(Month) + 1);
                        else
                            Month = String(parseInt(Month) + 1);
                        if (parseInt(D) < 10)
                            D = "0" + D;
                        json[i].MaturityDate = date.getFullYear() + '-' + Month + '-' + D;
                    }

                    callback(json)
                },
                error: function (error) {
                    alert("error:" + error);
                }
            });

        },
        //交易管理 (回收转付）回收转付确认
        SaveTurnPayProperty: function (AccountNo, callback) {
            var sContent = "{'SPName':'usp_SaveTurnPayProperty','Params':{" + "'AccountNo':'" + AccountNo + "'" + "}}";
            var serviceUrl = this.DataOperate.wizardService + "DataRead?dbName=" + this.DataOperate.dbName + "&schema=" + this.DataOperate.schema + "&json=" + sContent;
            console.info(serviceUrl)
            $.ajax({
                url: serviceUrl,
                type: "GET",
                contentType: "application/json; charset=utf-8",
                dataType: "jsonp",
                //async: false,
                beforeSend: function () {
                },
                success: function (data) {
                    var json = jQuery.parseJSON(data);
                    callback(json)
                },
                error: function (error) {
                    alert("error:" + error);
                }
            });

        },
        //交易管理（回收转付）删除回收转付资产[usp_ViewTurnPayProperty]
        DeleteTurnPayProperty: function (AccountNo, callback) {
            var sContent = "{'SPName':'usp_DeleteTurnPayProperty','Params':{" + "'AccountNo':'" + AccountNo + "'" + "}}";
            var serviceUrl = this.DataOperate.wizardService + "DataRead?dbName=" + this.DataOperate.dbName + "&schema=" + this.DataOperate.schema + "&json=" + sContent;
            console.info(serviceUrl)
            $.ajax({
                url: serviceUrl,
                type: "GET",
                contentType: "application/json; charset=utf-8",
                dataType: "jsonp",
                //async: false,
                beforeSend: function () {
                },
                success: function (data) {
                    var json = jQuery.parseJSON(data);
                    callback(json)
                },
                error: function (error) {
                    alert("error:" + error);
                }
            });

        },
        //交易管理（回收转付）查看详情
        ViewTurnPayProperty: function (AccountNo, callback) {
            var sContent = "{'SPName':'usp_ViewTurnPayProperty','Params':{" + "'AccountNo':'" + AccountNo + "'" + "}}";
            var serviceUrl = this.DataOperate.wizardService + "DataRead?dbName=" + this.DataOperate.dbName + "&schema=" + this.DataOperate.schema + "&json=" + sContent;
            console.info(serviceUrl)
            $.ajax({
                url: serviceUrl,
                type: "GET",
                contentType: "application/json; charset=utf-8",
                dataType: "jsonp",
                //async: false,
                beforeSend: function () {
                },
                success: function (data) {
                    var json = jQuery.parseJSON(data);
                    callback(json)
                },
                error: function (error) {
                    alert("error:" + error);
                }
            });

        },
        //交易管理（回收转付）检索查询
        QueryTurnPayProperty: function (TrustName, AccountNo, callback) {
            var sContent = "{'SPName':'usp_QueryTurnPayProperty','Params':{" +
                "'TrustName':'" + TrustName + "'," +
                "'AccountNo':'" + AccountNo + "'," +
                "}}";
            var serviceUrl = this.DataOperate.wizardService + "DataRead?dbName=" + this.DataOperate.dbName + "&schema=" + this.DataOperate.schema + "&json=" + sContent;
            console.info(serviceUrl)
            $.ajax({
                url: serviceUrl,
                type: "GET",
                contentType: "application/json; charset=utf-8",
                dataType: "jsonp",
                //async: false,
                beforeSend: function () {
                },
                success: function (data) {
                    var json = jQuery.parseJSON(data);
                    callback(json)
                },
                error: function (error) {
                    alert("error:" + error);
                }
            });

        },

        //交易管理（清仓回购）获取数据
        GetClearanceBuyBackDisplay: function (callback) {
            var sContent = "{'SPName':'usp_GetClearanceBuyBackDisplay','Params':{}}";
            var serviceUrl = this.DataOperate.wizardService + "DataRead?dbName=" + this.DataOperate.dbName + "&schema=" + this.DataOperate.schema + "&json=" + sContent;
            console.info(serviceUrl)
            $.ajax({
                url: serviceUrl,
                type: "GET",
                contentType: "application/json; charset=utf-8",
                dataType: "jsonp",
                //async: false,
                beforeSend: function () {
                },
                success: function (data) {

                    var json = jQuery.parseJSON(data);
                    for (i = 0; i < json.length; i++) {
                        var date = new Date(parseInt(json[i].ClearanceBuyBackDate.slice(6)));
                        var Month = date.getMonth();
                        var D = date.getDate();

                        if (parseInt(Month) + 1 < 10)
                            Month = "0" + String(parseInt(Month) + 1);
                        else
                            Month = String(parseInt(Month) + 1);
                        if (parseInt(D) < 10)
                            D = "0" + D;
                        json[i].ClearanceBuyBackDate = date.getFullYear() + '-' + Month + '-' + D;
                    }
                    callback(json)
                },
                error: function (error) {
                    alert("error:" + error);
                }
            });

        },
        //交易管理（清仓回购）删除数据
        DeleteClearanceBuyBackProperty: function (PoolDBName, ClearanceBuyBackDate, DevisionName, callback) {
            var sContent = "{'SPName':'usp_DeleteClearanceBuyBackProperty','Params':{" +
                "'PoolDBName':'" + PoolDBName + "'," +
                "'ClearanceBuyBackDate':'" + ClearanceBuyBackDate + "'," +
                "'DevisionName':'" + DevisionName + "'" +
                "}}";
            var serviceUrl = this.DataOperate.wizardService + "DataRead?dbName=" + this.DataOperate.dbName + "&schema=" + this.DataOperate.schema + "&json=" + sContent;
            console.info(serviceUrl)
            $.ajax({
                url: serviceUrl,
                type: "GET",
                contentType: "application/json; charset=utf-8",
                dataType: "jsonp",
                //async: false,
                beforeSend: function () {
                },
                success: function (data) {
                    var json = jQuery.parseJSON(data);
                    callback(json)
                },
                error: function (error) {
                    alert("error:" + error);
                }
            });

        },
        //交易管理（清仓回购）检索查询
        QueryClearanceBuyBack: function (PoolDBName, callback) {
            var sContent = "{'SPName':'usp_QueryClearanceBuyBack','Params':{" +
                "'PoolDBName':'" + PoolDBName + "'" +
                "}}";
            var serviceUrl = this.DataOperate.wizardService + "DataRead?dbName=" + this.DataOperate.dbName + "&schema=" + this.DataOperate.schema + "&json=" + sContent;
            console.info(serviceUrl);
            $.ajax({
                url: serviceUrl,
                type: "GET",
                contentType: "application/json; charset=utf-8",
                dataType: "jsonp",
                //async: false,
                beforeSend: function () {
                },
                success: function (data) {
                    //$("#table-PoolDBName").val();
                    //$("#table-DevisionName").val();
                    //$("#table-ClearanceBuyBackDate").val();
                    //$("#table-PrincipalSum").val();
                    //$("#table-FactSum").val();
                    //$("#table-PropertyType").val();
                    var json = jQuery.parseJSON(data);
                    callback(json)
                },
                error: function (error) {
                    alert("error:" + error);
                }
            });

        },
        //交易管理（清仓回购）查看详情
        ViewClearanceBuyBackProperty: function (PoolDBName, ClearanceBuyBackDate, DevisionName, callback) {
            var sContent = "{'SPName':'usp_ViewClearanceBuyBackProperty','Params':{" +
                "'PoolDBName':'" + PoolDBName + "'," +
                "'ClearanceBuyBackDate':'" + ClearanceBuyBackDate + "'," +
                "'DevisionName':'" + DevisionName + "'" +
                "}}";
            var serviceUrl = this.DataOperate.wizardService + "DataRead?dbName=" + this.DataOperate.dbName + "&schema=" + this.DataOperate.schema + "&json=" + sContent;
            console.info(serviceUrl)
            $.ajax({
                url: serviceUrl,
                type: "GET",
                contentType: "application/json; charset=utf-8",
                dataType: "jsonp",
                //async: false,
                beforeSend: function () {
                },
                success: function (data) {

                    var json = jQuery.parseJSON(data);
                    //for (i = 0; i < json.length; i++) {
                    //    //var date = new Date(parseInt(json[i].OperationDate.slice(6)));
                    //    var Month = date.getMonth();
                    //    var D = date.getDate();
                    //    console.log(Month);
                    //    if (parseInt(Month) + 1 < 10) {
                    //        Month = "0" + String(parseInt(Month) + 1);
                    //        console.log(Month);
                    //    }
                    //    else
                    //        Month = String(parseInt(Month) + 1);
                    //    if (parseInt(D) < 10)
                    //        D = "0" + D;
                    //    json[i].OperationDate = date.getFullYear() + '-' + Month + '-' + D;
                    //}
                    console.log(json);
                    callback(json);
                },
                error: function (error) {
                    alert("error:" + error);
                }
            });

        },
        //交易管理（清仓回购）批量修改单位净价
        UpdateClearanceBuyBackNetAssetValue: function (PoolDBName, ClearanceBuyBackDate, DevisionName, NetAssetValue, callback) {
            var sContent = "{'SPName':'usp_UpdateClearanceBuyBackNetAssetValue','Params':{" +
                "'PoolDBName':'" + PoolDBName + "'," +
                "'ClearanceBuyBackDate':'" + ClearanceBuyBackDate + "'," +
                "'DevisionName':'" + DevisionName + "'," +
                "'NetAssetValue':'" + NetAssetValue + "'" +
                "}}";
            var serviceUrl = this.DataOperate.wizardService + "DataRead?dbName=" + this.DataOperate.dbName + "&schema=" + this.DataOperate.schema + "&json=" + sContent;
            console.info(serviceUrl)
            $.ajax({
                url: serviceUrl,
                type: "GET",
                contentType: "application/json; charset=utf-8",
                dataType: "jsonp",
                //async: false,
                beforeSend: function () {
                },
                success: function (data) {
                    console.log(data);
                    var json = jQuery.parseJSON(data);
                    callback(json);
                },
                error: function (error) {
                    alert("error:" + error);
                }
            });

        },

        //交易管理（回购上划）获取数据
        GetBuyBackDisplay: function (callback) {
            var sContent = "{'SPName':'usp_GetBuyBackDisplay','Params':{}}";
            var serviceUrl = this.DataOperate.wizardService + "DataRead?dbName=" + this.DataOperate.dbName + "&schema=" + this.DataOperate.schema + "&json=" + sContent;
            console.info(serviceUrl)
            $.ajax({
                url: serviceUrl,
                type: "GET",
                contentType: "application/json; charset=utf-8",
                dataType: "jsonp",
                //async: false,
                beforeSend: function () {
                },
                success: function (data) {
                    var json = jQuery.parseJSON(data);
                    for (i = 0; i < json.length; i++) {
                        var date = new Date(parseInt(json[i].OperationDate.slice(6)));
                        var Month = date.getMonth();
                        var D = date.getDate();
                        if (parseInt(Month) < 10)
                            Month = "0" + Month;
                        if (parseInt(D) < 10)
                            D = "0" + D;
                        json[i].OperationDate = date.getFullYear() + '-' + Month + '-' + D;
                    }



                    callback(json)
                },
                error: function (error) {
                    alert("error:" + error);
                }
            });

        },
        //交易管理（回购上划）查询数据
        QueryBuyBackOn: function (PoolDBName, DevisionName, callback) {
            var sContent = "{'SPName':'usp_QueryBuyBackOn','Params':{" +
                "'PoolDBName':'" + PoolDBName + "'," +
                "'DevisionName':'" + DevisionName + "'" +
                "}}";
            var serviceUrl = this.DataOperate.wizardService + "DataRead?dbName=" + this.DataOperate.dbName + "&schema=" + this.DataOperate.schema + "&json=" + sContent;
            serviceUrl = encodeURI(serviceUrl);
            console.info(serviceUrl)
            $.ajax({
                url: serviceUrl,
                type: "GET",
                contentType: "application/json; charset=utf-8",
                dataType: "jsonp",
                //async: false,
                beforeSend: function () {
                },
                success: function (data) {
                    var json = jQuery.parseJSON(data);
                    callback(json)
                },
                error: function (error) {
                    alert("error:" + error);
                }
            });

        },
        //交易管理（回购上划）查看详情
        ViewBuyBackOn: function (PoolDBName, BussinessType, OperationDate, callback) {
            var sContent = "{'SPName':'usp_ViewBuyBackOn','Params':{" +
                "'PoolDBName':'" + PoolDBName + "'," +
                "'BussinessType':'" + BussinessType + "'," +
                "'OperationDate':'" + OperationDate + "'" +
                "}}";
            var serviceUrl = this.DataOperate.wizardService + "DataRead?dbName=" + this.DataOperate.dbName + "&schema=" + this.DataOperate.schema + "&json=" + sContent;
            console.info(serviceUrl)
            $.ajax({
                url: serviceUrl,
                type: "GET",
                contentType: "application/json; charset=utf-8",
                dataType: "jsonp",
                //async: false,
                beforeSend: function () {
                },
                success: function (data) {
                    console.log(data);
                    var json = jQuery.parseJSON(data);
                    callback(json);
                },
                error: function (error) {
                    alert("error:" + error);
                }
            });

        },
        //交易管理（回购上划）批量修改单位净价
        UpdateBuyBackOnNetAssetValue: function (PoolDBName, BussinessType, OperationDate, NetAssetValue, callback) {
            var sContent = "{'SPName':'usp_UpdateBuyBackOnNetAssetValue','Params':{" +
                "'PoolDBName':'" + PoolDBName + "'," +
                "'BussinessType':'" + BussinessType + "'," +
                "'OperationDate':'" + OperationDate + "'" +
                "'NetAssetValue':'" + NetAssetValue + "'" +
                "}}";
            var serviceUrl = this.DataOperate.wizardService + "DataRead?dbName=" + this.DataOperate.dbName + "&schema=" + this.DataOperate.schema + "&json=" + sContent;
            console.info(serviceUrl)
            $.ajax({
                url: serviceUrl,
                type: "GET",
                contentType: "application/json; charset=utf-8",
                dataType: "jsonp",
                //async: false,
                beforeSend: function () {
                },
                success: function (data) {
                    console.log(data);
                    var json = jQuery.parseJSON(data);
                    callback(json);
                },
                error: function (error) {
                    alert("error:" + error);
                }
            });

        },


        //交易管理（资产赎回）获取数据
        GetRedemptionDisplay: function (callback) {
            var sContent = "{'SPName':'usp_GetRedemptionDisplay','Params':{}}";
            var serviceUrl = this.DataOperate.wizardService + "DataRead?dbName=" + this.DataOperate.dbName + "&schema=" + this.DataOperate.schema + "&json=" + sContent;
            console.info(serviceUrl)
            $.ajax({
                url: serviceUrl,
                type: "GET",
                contentType: "application/json; charset=utf-8",
                dataType: "jsonp",
                async: true,
                beforeSend: function () {
                },
                success: function (data) {
                    var json = jQuery.parseJSON(data);

                    callback(json)
                },
                error: function (error) {
                    alert("error:" + error);
                }
            });

        },
        //交易管理（资产赎回）修改数据前的获取
        GetRedemptionProperty: function (AccountNo, callback) {
            var sContent = "{'SPName':'usp_GetRedemptionProperty','Params':{" + "'AccountNo':'" + AccountNo + "'" + " , " + "}}";
            var serviceUrl = this.DataOperate.wizardService + "DataRead?dbName=" + this.DataOperate.dbName + "&schema=" + this.DataOperate.schema + "&json=" + sContent;
            console.info(serviceUrl)
            $.ajax({
                url: serviceUrl,
                type: "GET",
                contentType: "application/json; charset=utf-8",
                dataType: "jsonp",
                //async: false,
                beforeSend: function () {
                },
                success: function (data) {
                    var json = jQuery.parseJSON(data);
                    callback(json)
                },
                error: function (error) {
                    alert("error:" + error);
                }
            });

        },
        //交易管理（资产赎回）删除数据
        DeleteRedemptionProperty: function (PoolDBName, PropertyRedemptionDate, DevisionName, callback) {
            var sContent = "{'SPName':'usp_DeleteRedemptionProperty','Params':{" +
                "'PoolDBName':'" + PoolDBName + "'," +
                "'PropertyRedemptionDate':'" + PropertyRedemptionDate + "'," +
                "'DevisionName':'" + DevisionName + "'" +
                "}}";
            var serviceUrl = this.DataOperate.wizardService + "DataRead?dbName=" + this.DataOperate.dbName + "&schema=" + this.DataOperate.schema + "&json=" + sContent;
            console.info(serviceUrl)
            serviceUrl = encodeURI(serviceUrl);
            $.ajax({
                url: serviceUrl,
                type: "GET",
                contentType: "application/json; charset=utf-8",
                dataType: "jsonp",
                //async: false,
                beforeSend: function () {
                },
                success: function (data) {
                    var json = jQuery.parseJSON(data);
                    callback(json)
                },
                error: function (error) {
                    alert("error:" + error);
                }
            });

        },
        //交易管理（资产赎回）查询数据
        QueryRedemption: function (PoolDBName, callback) {
            var sContent = "{'SPName':'usp_QueryRedemption','Params':{" +
                "'PoolDBName':'" + PoolDBName + "'" +
                "}}";
            var serviceUrl = this.DataOperate.wizardService + "DataRead?dbName=" + this.DataOperate.dbName + "&schema=" + this.DataOperate.schema + "&json=" + sContent;
            console.info(serviceUrl)
            $.ajax({
                url: serviceUrl,
                type: "GET",
                contentType: "application/json; charset=utf-8",
                dataType: "jsonp",
                //async: false,
                beforeSend: function () {
                },
                success: function (data) {
                    var json = jQuery.parseJSON(data);
                    callback(json)
                },
                error: function (error) {
                    alert("error:" + error);
                }
            });

        },
        //交易管理（资产赎回）修改数据
        UpdateRedemptionProperty: function (CustomerId, AccountNo, DevisionName, NetAseetValue, FactSum, callback) {
            var sContent = "{'SPName':'usp_UpdateRedemptionProperty','Params':{" +
                "'CustomerId':'" + CustomerId + "'," +
                "'AccountNo':'" + AccountNo + "'," +
                "'DevisionName':'" + DevisionName + "'," +
                "'NetAseetValue':'" + NetAseetValue + "'" +
                "'FactSum':'" + FactSum + "'" +
                "}}";
            var serviceUrl = this.DataOperate.wizardService + "DataRead?dbName=" + this.DataOperate.dbName + "&schema=" + this.DataOperate.schema + "&json=" + sContent;
            console.info(serviceUrl)
            $.ajax({
                url: serviceUrl,
                type: "GET",
                contentType: "application/json; charset=utf-8",
                dataType: "jsonp",
                //async: false,
                beforeSend: function () {
                },
                success: function (data) {
                    var json = jQuery.parseJSON(data);
                    callback(json)
                },
                error: function (error) {
                    alert("error:" + error);
                }
            });

        },
        //交易管理（资产赎回）批量修改单价
        UpdateRedemptionNetAssetValue: function (PoolDBName, PropertyRedemptionDate, DevisionName, NetAseetValue, callback) {
            var sContent = "{'SPName':'usp_UpdateRedemptionNetAssetValue','Params':{" +
                "'PoolDBName':'" + PoolDBName + "'," +
                "'PropertyRedemptionDate':'" + PropertyRedemptionDate + "'," +
                "'DevisionName':'" + DevisionName + "'," +
                "'NetAseetValue':'" + NetAseetValue + "'" +
                "}}";
            var serviceUrl = this.DataOperate.wizardService + "DataRead?dbName=" + this.DataOperate.dbName + "&schema=" + this.DataOperate.schema + "&json=" + sContent;
            console.info(serviceUrl)
            $.ajax({
                url: serviceUrl,
                type: "GET",
                contentType: "application/json; charset=utf-8",
                dataType: "jsonp",
                //async: false,
                beforeSend: function () {
                },
                success: function (data) {
                    var json = jQuery.parseJSON(data);
                    callback(json)
                },
                error: function (error) {
                    alert("error:" + error);
                }
            });

        },
        //交易管理（资产赎回）检索
        ViewRedemptionProperty: function (PoolDBName, PropertyRedemptionDate, DevisionName, callback) {
            var sContent = "{'SPName':'usp_ViewRedemptionProperty','Params':{" +
                "'PoolDBName':'" + PoolDBName + "'," +
                "'PropertyRedemptionDate':'" + PropertyRedemptionDate + "'," +
                "'DevisionName':'" + DevisionName + "'" +
                "}}";
            var serviceUrl = this.DataOperate.wizardService + "DataRead?dbName=" + this.DataOperate.dbName + "&schema=" + this.DataOperate.schema + "&json=" + sContent;
            console.info(serviceUrl);
            serviceUrl = encodeURI(serviceUrl);
            $.ajax({
                url: serviceUrl,
                type: "GET",
                contentType: "application/json; charset=utf-8",
                dataType: "jsonp",
                //async: false,
                beforeSend: function () {
                },
                success: function (data) {
                    var json = jQuery.parseJSON(data);
                    callback(json)
                },
                error: function (error) {
                    alert("error:" + error);
                }
            });

        },

        //交易管理

        //会计账套管理（初始数据）
        viewAccountSet: function (str, callback) {
            var sContent = "{'SPName':'usp_QueryAccountSet','Params':{" + "'AccountSetNo':'" + str + "'" + " , " + "'AccountSetName':'" + str + "'" + "}}";
            var serviceUrl =this.DataOperate.wizardService + "DataRead?dbName=" + this.DataOperate.dbName + "&schema=" + this.DataOperate.schema + "&json=" + sContent;
            console.info(serviceUrl)
            $.ajax({
                url: serviceUrl,
                type: "GET",
                contentType: "application/json; charset=utf-8",
                dataType: "jsonp",
                async: true,
                beforeSend: function () {
                },
                success: function (data) {
                    var json = jQuery.parseJSON(data);
                    for (i = 0; i < json.length; i++) {
                        var date = new Date(parseInt(json[i].StartDate.slice(6)));
                        var Month = date.getMonth();
                        var D = date.getDate();

                        if (parseInt(Month) + 1 < 10)
                            Month = "0" + String(parseInt(Month) + 1);
                        else
                            Month = String(parseInt(Month) + 1);
                        if (parseInt(D) < 10)
                            D = "0" + D;
                        json[i].StartDate = date.getFullYear() + '-' + Month + '-' + D;

                        var date = new Date(parseInt(json[i].yearly.slice(6)));
                        var Month = date.getMonth();
                        var D = date.getDate();

                        if (parseInt(Month) + 1 < 10)
                            Month = "0" + String(parseInt(Month) + 1);
                        else
                            Month = String(parseInt(Month) + 1);
                        if (parseInt(D) < 10)
                            D = "0" + D;
                        json[i].yearly = date.getFullYear() + '-' + Month + '-' + D;
                    }
                    callback(json)
                },
                error: function (error) {
                    alert("error:" + error);
                }
            });

        },

        //会计核算（账套管理）获取数据
        GetAccountSet: function (callback) {
            var sContent = "{'SPName':'usp_GetAccountSet','Params':{}}";
            var serviceUrl = this.DataOperate.wizardService + "DataRead?dbName=" + this.DataOperate.dbName + "&schema=" + this.DataOperate.schema + "&json=" + sContent;
            console.info(serviceUrl)
            $.ajax({
                url: serviceUrl,
                type: "GET",
                contentType: "application/json; charset=utf-8",
                dataType: "jsonp",
                //async: false,
                beforeSend: function () {
                },
                success: function (data) {
                    var json = jQuery.parseJSON(data);
                    callback(json)
                },
                error: function (error) {
                    alert(error);
                }
            });

        },
        //会计核算（账套管理）修改之前的获取数据
        GetAccountSetForUpdate: function (AccountSetNo, callback) {
            var sContent = "{'SPName':'usp_GetAccountSetForUpdate','Params':{" +
                "'AccountSetNo':'" + AccountSetNo + "'," +
                "}}";
            var serviceUrl = this.DataOperate.wizardService + "DataRead?dbName=" + this.DataOperate.dbName + "&schema=" + this.DataOperate.schema + "&json=" + sContent;
            console.info(serviceUrl)
            $.ajax({
                url: serviceUrl,
                type: "GET",
                contentType: "application/json; charset=utf-8",
                dataType: "jsonp",
                //async: false,
                beforeSend: function () {
                },
                success: function (data) {

                    var json = jQuery.parseJSON(data);
                    callback(json)
                },
                error: function (error) {
                    alert("error:" + error);
                }
            });

        },
        //会计核算（账套管理）删除数据
        DeleteAccountSet: function (AccountSetNo, callback) {
            var sContent = "{'SPName':'usp_DeleteAccountSet','Params':{" +
                "'AccountSetNo':'" + AccountSetNo + "'," +
                "}}";
            var serviceUrl = this.DataOperate.wizardService + "DataRead?dbName=" + this.DataOperate.dbName + "&schema=" + this.DataOperate.schema + "&json=" + sContent;
            console.info(serviceUrl)
            $.ajax({
                url: serviceUrl,
                type: "GET",
                contentType: "application/json; charset=utf-8",
                dataType: "jsonp",
                //async: false,
                beforeSend: function () {
                },
                success: function (data) {
                    var json = jQuery.parseJSON(data);
                    callback(json)
                },
                error: function (error) {
                    alert("error:" + error);
                }
            });

        },
        //会计核算（账套管理）新建账套
        NewAccountSet: function (AccountSetNo, AccountSetName, Remark, callback) {
            var sContent = "{'SPName':'usp_NewAccountSet','Params':{" +
                "'AccountSetNo':'" + AccountSetNo + "'," +
                "'AccountSetName':'" + AccountSetName + "'," +
                "'Remark':'" + Remark + "'" +
                "}}";
            var serviceUrl = this.DataOperate.wizardService + "DataRead?dbName=" + this.DataOperate.dbName + "&schema=" + this.DataOperate.schema + "&json=" + sContent;
            console.info(serviceUrl)
            $.ajax({
                url: serviceUrl,
                type: "GET",
                contentType: "application/json; charset=utf-8",
                dataType: "jsonp",
                //async: false,
                beforeSend: function () {
                },
                success: function (data) {
                    console.log(data);
                    var json = jQuery.parseJSON(data);
                    callback(json);
                },
                error: function (error) {
                    alert("error:" + error);
                }
            });

        },
        //会计核算（账套管理）检索查询
        QueryAccountSet: function (AccountSetNo, callback) {
            var sContent = "{'SPName':'usp_QueryAccountSet','Params':{" +
                "'AccountSetNo':'" + AccountSetNo + "'" +
                "}}";
            var serviceUrl = this.DataOperate.wizardService + "DataRead?dbName=" + this.DataOperate.dbName + "&schema=" + this.DataOperate.schema + "&json=" + sContent;
            console.info(serviceUrl);
            $.ajax({
                url: serviceUrl,
                type: "GET",
                contentType: "application/json; charset=utf-8",
                dataType: "jsonp",
                //async: false,
                beforeSend: function () {
                },
                success: function (data) {
                    //$("#table-PoolDBName").val();
                    //$("#table-DevisionName").val();
                    //$("#table-ClearanceBuyBackDate").val();
                    //$("#table-PrincipalSum").val();
                    //$("#table-FactSum").val();
                    //$("#table-PropertyType").val();
                    var json = jQuery.parseJSON(data);
                    callback(json)
                },
                error: function (error) {
                    alert("error:" + error);
                }
            });

        },
        //会计核算（账套管理）编辑数据
        UpdateAccountSet: function (AccountSetNo, AccountSetName, Remark, callback) {
            var sContent = "{'SPName':'usp_UpdateAccountSet','Params':{" +
                "'AccountSetNo':'" + AccountSetNo + "'," +
                "'AccountSetName':'" + AccountSetName + "'," +
                "'Remark':'" + Remark + "'" +
                "}}";
            var serviceUrl = encodeURI(this.DataOperate.wizardService + "DataRead?dbName=" + this.DataOperate.dbName + "&schema=" + this.DataOperate.schema + "&json=" + sContent);
            $.ajax({
                url: serviceUrl,
                type: "GET",
                contentType: "application/json; charset=utf-8",
                dataType: "jsonp",
                //async: false,
                beforeSend: function () {
                },
                success: function (data) {
                    console.log(data);
                    var json = jQuery.parseJSON(data);
                    callback(json);
                },
                error: function (error) {
                    alert("error:" + error);
                }
            });

        },


        //会计科目管理（初始数据）
        viewSubject: function (subjectType, callback) {
            var sContent = "{'SPName':'usp_viewSubject','Params':{" + "'subjectType':'" + subjectType + "'" + "}}";
            var serviceUrl = this.DataOperate.wizardService + "DataRead?dbName=" + this.DataOperate.dbName + "&schema=" + this.DataOperate.schema + "&json=" + sContent;
            console.info(serviceUrl)
            serviceUrl = encodeURI(serviceUrl);
            $.ajax({
                url: serviceUrl,
                type: "GET",
                contentType: "application/json; charset=utf-8",
                dataType: "jsonp",
                //async: true,
                beforeSend: function () {
                },
                success: function (data) {
                    var SubjectNo = $("#SubjectNo").val();
                    var SubjectName = $("#SubjectName").val();
                    var SuperiorSubject = $("#SuperiorSubject").val();
                    var SubjectType = $("#SubjectType").val();
                    var BalanceDirection = $("#BalanceDirection").val();
                    var RecAndDisDirection = $("#RecAndDisDirection").val();
                    var json = jQuery.parseJSON(data);
                    callback(json);
                },
                error: function (error) {
                    alert("error:" + error);
                }
            });

        },

        //会计科目管理（新建）
        AddSubject: function (SubjectNo, SubjectName, SuperiorSubject, SubjectType, BalanceDirection, RecAndDisDirection) {
            var sContent = "{'SPName':'AddSubject','Params':{" +
                "'SubjectNo':'" + SubjectNo +
                "'" + " , " + "'SubjectName':'" + SubjectName +
                "'" + " , " + "'SuperiorSubject':'" + SuperiorSubject +
                "'" + " , " + "'SubjectType':'" + SubjectType +
                "'" + " , " + "'BalanceDirection':'" + BalanceDirection +
                "'" + " , " + "'RecAndDisDirection':'" + RecAndDisDirection +
                "'" + "}}";
            var serviceUrl = this.DataOperate.wizardService + "DataRead?dbName=" + this.DataOperate.dbName + "&schema=" + this.DataOperate.schema + "&json=" + sContent;
            console.info(serviceUrl);
            $.ajax({
                url: serviceUrl,
                type: "GET",
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
                }
            });

        },

        //会计科目管理（编辑）
        getSubjectByNo: function (SubjectNo, callback) {
            var sContent = "{'SPName':'getSubjectByNo','Params':{" + "'SubjectNo':'" + SubjectNo + "'" + "}}";
            var serviceUrl = this.DataOperate.wizardService + "DataRead?dbName=" + this.DataOperate.dbName + "&schema=" + this.DataOperate.schema + "&json=" + sContent;
            console.info(serviceUrl);
            $.ajax({
                url: serviceUrl,
                type: "GET",
                dataType: "json",
                cache: false,
                processData: false,

                //contentType: "application/xml;charset=utf-8",
                // data: json,
                beforeSend: function () {
                    //$('#loading').fadeIn();

                },
                success: function (data) {
                    var json = jQuery.parseJSON(data);
                    callback(json);
                },
                error: function (response) {
                    alert(response);
                }
            });

        },

        editSubjectByNo: function (SubjectNo, SubjectName, SuperiorSubject, SubjectType, BalanceDirection, RecAndDisDirection) {
            var sContent = "{'SPName':'editSubjectByNo','Params':{" +
                "'SubjectNo':'" + SubjectNo +
                "'" + " , " + "'SubjectName':'" + SubjectName +
                "'" + " , " + "'SuperiorSubject':'" + SuperiorSubject +
                "'" + " , " + "'SubjectType':'" + SubjectType +
                "'" + " , " + "'BalanceDirection':'" + BalanceDirection +
                "'" + " , " + "'RecAndDisDirection':'" + RecAndDisDirection +
                "'" + "}}";
            var serviceUrl = this.DataOperate.wizardService + "DataRead?dbName=" + this.DataOperate.dbName + "&schema=" + this.DataOperate.schema + "&json=" + sContent;
            console.info(serviceUrl);
            $.ajax({
                url: serviceUrl,
                type: "GET",
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

        //会计科目管理（删除）
        deleteSubjectByNo: function (SubjectNo, callback) {
            var sContent = "{'SPName':'deleteSubjectByNo','Params':{" + "'SubjectNo':'" + SubjectNo + "'" + "}}";
            var serviceUrl = this.DataOperate.wizardService + "DataRead?dbName=" + this.DataOperate.dbName + "&schema=" + this.DataOperate.schema + "&json=" + sContent;
            console.info(serviceUrl)
            $.ajax({
                url: serviceUrl,
                type: "GET",
                contentType: "application/json; charset=utf-8",
                dataType: "jsonp",
                async: true,
                beforeSend: function () {
                },
                success: function (data) {
                    var json = jQuery.parseJSON(data);
                    callback(json)
                },
                error: function (error) {
                    alert("error:" + error);
                }
            });

        },

        //会计场景（初始数据）
        viewScene: function (callback) {
            var sContent = "{'SPName':'usp_viewScene','Params':{}}";
            var serviceUrl = this.DataOperate.wizardService + "DataRead?dbName=" + this.DataOperate.dbName + "&schema=" + this.DataOperate.schema + "&json=" + sContent;
            console.info(serviceUrl)
            $.ajax({
                url: serviceUrl,
                type: "GET",
                contentType: "application/json; charset=utf-8",
                dataType: "jsonp",
                async: true,
                beforeSend: function () {
                },
                success: function (data) {
                    var json = jQuery.parseJSON(data);
                    callback(json)
                },
                error: function (error) {
                    alert("error:" + error);
                }
            });

        },

        //会计场景(查看)   
        ViewgetSceneByCode: function (SceneCode, callback) {
            var sContent = "{'SPName':'usp_getSceneByCode','Params':{" + "'SceneCode':'" + SceneCode + "'" + "}}";
            var serviceUrl = this.DataOperate.wizardService + "DataRead?dbName=" + this.DataOperate.dbName + "&schema=" + this.DataOperate.schema + "&json=" + sContent;
            console.info(serviceUrl)
            serviceUrl = encodeURI(serviceUrl);
            $.ajax({
                url: serviceUrl,
                type: "GET",
                contentType: "application/json; charset=utf-8",
                dataType: "jsonp",
                async: true,
                beforeSend: function () {
                },
                success: function (data) {
                    var json = jQuery.parseJSON(data);
                    callback(json);
                },
                error: function (error) {
                    alert("error:" + error);
                }
            });

        },

        //会计场景(新建)--调用processstudio   


        //会计场景(编辑)--调用processstudio   


        //会计场景(删除)   
        deleteSceneByCode: function (SceneCode, callback) {
            var sContent = "{'SPName':'usp_deleteSceneByCode','Params':{" + "'SceneCode':'" + SceneCode + "'" + "}}";
            var serviceUrl = this.DataOperate.wizardService + "DataRead?dbName=" + this.DataOperate.dbName + "&schema=" + this.DataOperate.schema + "&json=" + sContent;
            console.info(serviceUrl)
            serviceUrl = encodeURI(serviceUrl);
            $.ajax({
                url: serviceUrl,
                type: "GET",
                contentType: "application/json; charset=utf-8",
                dataType: "jsonp",
                async: true,
                beforeSend: function () {
                },
                success: function (data) {
                    var json = jQuery.parseJSON(data);
                    callback(json);
                },
                error: function (error) {
                    alert("error:" + error);
                }
            });

        },



        //会计场景(更新EC状态)
        UpdateEC: function (CriteriaId, IsEnabled) {

            var sContent = "{'SPName':'usp_UpdateECEntityIsEnabled','Params':{" + "'CriteriaId':'" + CriteriaId + "'" + " , " + "'IsEnabled':'" + IsEnabled + "'" + "}}";
            var serviceUrl = this.DataOperate.wizardService + "DataRead?dbName=" + this.DataOperate.dbName + "&schema=" + this.DataOperate.schema + "&json=" + sContent;
            console.info(serviceUrl)
            $.ajax({
                url: serviceUrl,
                type: "GET",
                contentType: "application/json; charset=utf-8",
                dataType: "jsonp",
                //async: false,
                beforeSend: function () {
                },
                success: function (data) {
                    console.log(data)

                },
                error: function (error) {
                    alert("error:" + error);
                }
            });

        },


        //会计凭证（初始数据）
        viewCertificationDetails: function (TradeType, callback) {
            var sContent = "{'SPName':'usp_QueryCertification','Params':{" + "'TradeType':'" + TradeType + "'" + "}}";
            var serviceUrl = this.DataOperate.wizardService + "DataRead?dbName=" + this.DataOperate.dbName + "&schema=" + this.DataOperate.schema + "&json=" + sContent;
            console.info(serviceUrl)
            serviceUrl = encodeURI(serviceUrl);
            $.ajax({
                url: serviceUrl,
                type: "GET",
                contentType: "application/json; charset=utf-8",
                dataType: "jsonp",
                async: true,
                beforeSend: function () {
                },
                success: function (data) {
                    var json = jQuery.parseJSON(data);
                    callback(json);
                },
                error: function (error) {
                    alert("error:" + error);
                }
            });


        },

        //会计凭证（查看明细）
        getSceneByCode: function (SerialNo, callback) {
            var sContent = "{'SPName':'usp_CheckCertification','Params':{" + "'SerialNo':'" + SerialNo + "'" + "}}";
            var serviceUrl = this.DataOperate.wizardService + "DataRead?dbName=" + this.DataOperate.dbName + "&schema=" + this.DataOperate.schema + "&json=" + sContent;
            console.info(serviceUrl)
            serviceUrl = encodeURI(serviceUrl);
            $.ajax({
                url: serviceUrl,
                type: "GET",
                contentType: "application/json; charset=utf-8",
                dataType: "jsonp",
                async: true,
                beforeSend: function () {
                },
                success: function (data) {
                    var json = jQuery.parseJSON(data);
                    callback(json);
                },
                error: function (error) {
                    alert("error:" + error);
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
            var serviceUrl = this.DataOperate.wizardService + "DataRead?dbName=" + this.DataOperate.dbName + "&schema=" + this.DataOperate.schema + "&json=" + sContent;
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
            var argTemplate = 'dbName={0}&schema={1}&businessId={2}&parentNodeId={3}&nodeName={4}';
            var args = argTemplate.format(this.DataOperate.dbName, this.DataOperate.schema, businessId, parentNodeId, encodeURIComponent(nodeName));
            var serviceUrl = this.DataOperate.wizardService + "CreateFolder?" + args;
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

            var argTemplate = 'dbName={0}&schema={1}&businessId={2}&parentNodeId={3}&nodeName={4}';
            var args = argTemplate.format(this.DataOperate.dbName, this.DataOperate.schema, businessId, parentNodeId, encodeURIComponent(nodeName));
            var serviceUrl = this.DataOperate.wizardService + "UploadFile?" + args;
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
            var argTemplate = 'dbName={0}&schema={1}&businessId={2}&nodeId={3}&isFolder={4}';
            var args = argTemplate.format(this.DataOperate.dbName, this.DataOperate.schema, businessId, nodeId, isFolder);
            var serviceUrl = this.DataOperate.wizardService + "DocumentDelete?" + args;
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
            obj.BusinessId = '';
            obj.ModelId = '';
            obj.PageId = '';
            obj.ItemId = '';
            obj.ItemValue = '';
            obj.GroupId01 = '';
            obj.GroupId02 = '';
            obj.GroupId03 = '';
            obj.GroupId04 = '';
            return obj;
        }
    }
    return new DataOperateFun();

})


