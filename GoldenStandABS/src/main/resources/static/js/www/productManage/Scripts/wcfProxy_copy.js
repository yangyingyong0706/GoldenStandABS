﻿webProxy = function () {

    var GlobalVariable = {
        SslHost: location.protocol + "//" + location.host + '/',
        TaskProcessEngineServiceURL: location.protocol + "//" + location.host + '/TaskProcessEngine/SessionManagementService.svc/jsAccessEP/',
        //PoolCutServiceURL: this.location.protocol + "//" + location.host + '/PoolCut/PoolCutService.svc/jsAccessEP/',
        //DataProcessServiceUrl: this.location.protocol + "//" + location.host + "/TrustManagementService/DataProcessService.svc/jsAccessEP/",

        PoolCutServiceURL: location.protocol + "//" + location.host + '/GoldenStandABS/service/PoolCutService.svc/jsAccessEP/',
        DataProcessServiceUrl: location.protocol + "//" + location.host + "/GoldenStandABS/service/DataProcessService.svc/jsAccessEP/",
        QuickFrame: location.protocol + "//" + location.host + "/GoldenStandABS",
        QuickFrameServiceUrl: location.protocol + "//" + location.host + '/GoldenStandABS/service/FrameService.svc/',
        TrustManagementServiceUrl: location.protocol + "//" + location.host + '/GoldenStandABS/service/TrustManagementService.svc/jsAccessEP/',
        BondPaymentScheduleServiceUrl: location.protocol + "//" + location.host + '/GoldenStandABS/service/BondPaymentScheduleService.svc/jsAccessEP/',
        PaymentScheduleServiceUrl: location.protocol + "//" + location.host + '/GoldenStandABS/service/PaymentScheduleService.svc/jsAccessEP/',
        //CashFlowStudioServiceUrl: 'https://' + domain + '/GoldenStandABS/Service/CashFlowStudioService.svc/jsAccessEP/',
        SessionManagementServiceUrl: location.protocol + "//" + location.host + '/GoldenStandABS/service/SessionManagementService.svc/jsAccessEP/',
        QuickWizardServiceUrl: location.protocol + "//" + location.host + '/GoldenStandABS/service/WizardService.svc/',

        CashFlowEngineServiceHostURL: location.protocol + "//" + location.host + '/CashFlowEngine/',
        TaskProcessEngineServiceHostURL: location.protocol + "//" + location.host + '/TaskProcessEngine/',
        TrustManagementServiceHostURL: location.protocol + "//" + location.host + '/GoldenStandABS/www/',

        Language_EN: 'en-US',
        Language_CN: 'zh-CN',
        Language_Default: 'zh-CN',
        Language_Set: 'ck_LanguageSet',

        Business_Unique: 'unique',
        Business_Trust: 'trust',
        Business_User: 'user',
        Business_Org: 'org',

        UiTempl_Stand: 'qw_KO_StandView',
        UiTempl_Grid: 'qw_KO_GridView',
        UiTempl_Tab: 'qw_KO_TabView'
        
    }


    var sessionServiceBase = GlobalVariable.SessionManagementServiceUrl;
    var tmsSessionServiceBase = GlobalVariable.TrustManagementServiceUrl;

    var isNewActionCode = function (taskContext, callback) {
        var serviceUrl = sessionServiceBase + "isNewActionCode?applicationDomain=" + taskContext.appDomain + "&actionCode=" + taskContext.actionCode;

        $.ajax({
            type: "GET",
            url: serviceUrl,
            dataType: "jsonp",
            crossDomain: true,
            contentType: "application/json;charset=utf-8",
            success: function (response) {
                callback(response);
            },
            error: function (response) { alert("error is :" + response); }
        });
    };

    var createSessionByTaskCode = function (sContext, callback) {

        var sessionVariables_p = encodeURIComponent(sContext.sessionVariables);
        var serviceUrl = sessionServiceBase + "CreateSessionByTaskCode?applicationDomain=" + sContext.appDomain + "&sessionVariable=" + sessionVariables_p + "&taskCode=" + sContext.taskCode;

        $.ajax({
            type: "GET",
            url: serviceUrl,
            dataType: "jsonp",
            crossDomain: true,
            contentType: "application/json;charset=utf-8",
            success: function (response) {
                callback(response,true);
            },
            error: function (response) { callback(response, false); alert(response); }
        });
    };

    var getTaskXmlByTaskCode = function (appDomain, code, callback) {
        var serviceUrl = sessionServiceBase + "GetTaskXmlByTaskCode/" + appDomain + "/" + code + "?r=" + Math.random() * 150;

        $.ajax({
            type: "GET",
            url: serviceUrl,
            dataType: "xml",
            contentType: "application/json;charset=utf-8",
            success: function (response) {
                if ($.browser.msie) {
                    //alert(response.xml)
                    callback(response.xml);
                }
                else {
                    callback(response.documentElement.outerHTML);
                }
            },
            error: function (response) { alert(response.documentElement.outerHTML); }
        });
    };

    var getCriteriasByECSetCode = function (appDomain, code, callback) {
        var serviceUrl = sessionServiceBase + "GetCriteriasByECSetCode/" + appDomain + "/" + code + "?r=" + Math.random() * 150;

        $.ajax({
            type: "GET",
            url: serviceUrl,
            dataType: "xml",
            contentType: "application/json;charset=utf-8",
            success: function (response) {
                if ($.browser.msie) {
                    callback(response.xml);
                }
                else {
                    callback(response.documentElement.outerHTML);
                }
            },
            error: function (response) { alert(response); }
        });
    };

    var getCriteriaByECSetCodeAndECName = function (appDomain, codeName, callback) {
        var serviceUrl = sessionServiceBase + "GetCriteriasByECSetCodeAndECName/" + appDomain + "/" + codeName + "?r=" + Math.random() * 150;

        $.ajax({
            type: "GET",
            url: serviceUrl,
            dataType: "xml",
            contentType: "application/json;charset=utf-8",
            success: function (response) {
                if ($.browser.msie) {
                    callback(response.xml);
                }
                else {
                    callback(response.documentElement.outerHTML);
                }
            },
            error: function (response) { alert(response); }
        });
    };

    var updateTaskXmlByTaskCode = function (appDomain, code, taskXml) {
        var serviceUrl = sessionServiceBase + "UpdateTaskXmlByTaskCode/"+appDomain+"/" + code;
        
        $.ajax({
            type: "POST",
            url: serviceUrl,
            dataType: "json",
            contentType: "application/xml;charset=utf-8",
            data: taskXml,
            success: function (response) {
                alert("Change has been saved!");
            },
            error: function (response) { alert(response); }
        });
    };

    var updateECByECSetCodeAndECName = function (appDomain, code, ecXml) {
        var serviceUrl = sessionServiceBase + "UpdateCriteriaByECSetCodeAndECName/"+appDomain+"/" + code;

        $.ajax({
            type: "POST",
            url: serviceUrl,
            dataType: "json",
            contentType: "application/xml;charset=utf-8",
            data: ecXml,
            success: function (response) {
                alert("Saved successfully.");
            },
            error: function (response) { alert("error:" + response); }
        });
    };

    var tMSSaveItem = function (appDomain, context) {
        var serviceUrl = tmsSessionServiceBase + "SaveItem?applicationDomain=" + appDomain + "&contextInfo=" + JSON.stringify(context);
        alert(serviceUrl);
        $.ajax({
            type: "GET",
            url: serviceUrl,
            dataType: "jsonp",
            crossDomain: true,
            contentType: "application/json;charset=utf-8",
            success: function (response) {
                alert(response);
            },
            error: function (response) { alert("error:" + response); }
        });
    };

    var tMSGetItems = function (appDomain, context) {
        var serviceUrl = tmsSessionServiceBase + "GetItems?applicationDomain=" + appDomain + "&contextInfo=" + JSON.stringify(context);
        alert(serviceUrl);
        $.ajax({
            type: "GET",
            url: serviceUrl,
            dataType: "jsonp",
            crossDomain: true,
            contentType: "application/json;charset=utf-8",
            success: function (response) {
                alert(response[0].Name);
            },
            error: function (response) { alert("error:" + response); }
        });
    };


    return {
        updateECByECSetCodeAndECName:updateECByECSetCodeAndECName,
        getCriteriaByECSetCodeAndECName:getCriteriaByECSetCodeAndECName,
        updateTaskXmlByTaskCode: updateTaskXmlByTaskCode,
        getCriteriasByECSetCode: getCriteriasByECSetCode,
        getTaskXmlByTaskCode:getTaskXmlByTaskCode,
        isNewActionCode: isNewActionCode,
        createSessionByTaskCode: createSessionByTaskCode,
        tMSSaveItem: tMSSaveItem,
        tMSGetItems: tMSGetItems
    };
};



//sessionCreated = function () {   


//    // Session Creation

//    getSessionId = function (sessionXml) {

//        alert(sessionXml);
//        serviceUrl = location.protocol + "//" + location.host + "/TaskProcessServices/SessionManagementService.svc/jsAccessEP/CreateSession?applicationDomain="
//          + taskContext.appDomain + "&sessionVariable=" + sessionXml;

//        //serviceUrl = GlobalVariable.SslHost + "TaskProcessServices/SessionManagementService.svc/jsAccessEP/CreateSession?applicationDomain=Task" + "&sessionVariable=" + sessionXml;
//        // serviceUrl = "https://" + location.host + "/TaskProcessServices/SessionManagementService.svc/jsAccessEP/isNewActionCode?applicationDomain=" + taskContext.appDomain + "&actionCode=" + taskContext.actionCode;

//        alert(serviceUrl);
//        $.ajax(
//      {
//          type: "GET",
//          url: serviceUrl,
//          dataType: "jsonp",
//          crossDomain: true,
//          contentType: "application/json;charset=utf-8",
//          success: function (response) {
//              if (response != null) {
//                  alert("Session has been created");
//                  return response;
//              }
//              return null;
//          },
//          error: function (response) { if (response == null) alert("Error in creating session!"); }
//      }
//     )

//    }
//}



//actionCodeValidation = function () {

//    this.message = "hello from actionCodeValidation";

//    //actionCode Validation

//    this.isNewActionCode = function (taskContext,callback) {
//        serviceUrl = location.protocol + "//" + location.host + "/TaskProcessServices/SessionManagementService.svc/jsAccessEP/isNewActionCode?applicationDomain="
//          + taskContext.appDomain + "&actionCode=" + taskContext.actionCode;

//        //serviceUrl = GlobalVariable.SslHost + "TaskProcessServices/SessionManagementService.svc/jsAccessEP/isNewActionCode?applicationDomain=" + taskContext.appDomain + "&actionCode=" + taskContext.actionCode;
//        // serviceUrl = "https://" + location.host + "/TaskProcessServices/SessionManagementService.svc/jsAccessEP/isNewActionCode?applicationDomain=" + taskContext.appDomain + "&actionCode=" + taskContext.actionCode;

//        alert(serviceUrl);
//        $.ajax(
//          {
//              type: "GET",
//              url: serviceUrl,
//              dataType: "jsonp",
//              crossDomain: true,
//              contentType: "application/json;charset=utf-8",
//              success: function (response) {
////                  if (response == true) {
////                      alert("One or more action code is new, please enter this in CodeDictionary first"); 
////                  }
//                  callback(response);
//              },
//              error: function (response) { if (response == null) alert("Error in validating action code in CodeDictionary!"); }
//          }
//        )
//        
//    }

//  }




