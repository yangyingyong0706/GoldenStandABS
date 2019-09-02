define(function (require) {
    var $ = require('jquery');
    var GlobalVariable = require('globalVariable');
    var wcfProxy = function () {
        var sessionServiceBase = GlobalVariable.TaskProcessEngineServiceURL;
        var tmsSessionServiceBase = GlobalVariable.TrustManagementServiceUrl;
        var tmDataProcessServiceUrl = GlobalVariable.DataProcessServiceUrl;

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
                    callback(response, true);
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
                    //if ($.browser.msie) {
                    if (!$.support.leadingWhitespace) {
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
            var serviceUrl = sessionServiceBase + "UpdateTaskXmlByTaskCode/" + appDomain + "/" + code;

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
            var serviceUrl = sessionServiceBase + "UpdateCriteriaByECSetCodeAndECName/" + appDomain + "/" + code;

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

        function getWcfCommon(param) {
            var serviceUrl = tmDataProcessServiceUrl + "CommonExecuteGet?appDomain=TrustManagement&resultType=commom&executeParams=" + window.JSON.stringify(param);
            return $.ajax({
                type: "GET",
                url: serviceUrl,
                dataType: "jsonp",
                crossDomain: true,
                contentType: "application/json;charset=utf-8",
                beforeSend: function () {
                    //$('#loading').fadeOut();
                }
            });
        }

        function getWcfTrustPeriod(trustId) {
            var trustPeridParam = {
                "SPName": "usp_GetTrustPeriod",
                "SQLParams": [
                    {
                        "Name": "trustId",
                        "value": trustId,
                        "DBType": "string"
                    },
                    {
                        "Name": "TrustPeriodType",
                        "value": "PaymentDate_CF",
                        "DBType": "string"
                    }
                ]
            };

            return getWcfCommon(trustPeridParam);
        }

        function getWcfFactBondPaymentBalance(trustId, reportedDateId) {
            var bondBalanceParam = {
                "SPName": "usp_GetFactBondPaymentBalance",
                "SQLParams": [
                    {
                        "Name": "trustId",
                        "value": trustId,
                        "DBType": "int"
                    },
                    {
                        "Name": "ReportingDateId",
                        "value": reportedDateId,
                        "DBType": "string"
                    }
                ]
            };
            return getWcfCommon(bondBalanceParam);
        }
        function getWcfFormulaDateOfIncomeDistribution(trustId, reportedDateId) {
            var FormulaDateParam = {
                "SPName": "usp_GetFormulaDateOfIncomeDistribution",
                "SQLParams": [
                    {
                        "Name": "trustId",
                        "value": trustId,
                        "DBType": "int"
                    },
                    {
                        "Name": "ReportingDateId",
                        "value": reportedDateId,
                        "DBType": "string"
                    }
                ]
            };
            return getWcfCommon(FormulaDateParam);
        }

        function getWcfFactTrustTransactionFee(trustId, reportedDateId) {
            var transFeeParam = {
                "SPName": "usp_GetFactTrustTransactionFee",
                "SQLParams": [
                    {
                        "Name": "trustId",
                        "value": trustId,
                        "DBType": "int"
                    },
                    {
                        "Name": "ReportingDateId",
                        "value": reportedDateId,
                        "DBType": "string"
                    }
                ]
            };
            return getWcfCommon(transFeeParam);
        }

        function getWcfFactTrustTransactionCashInflow(trustId, reportedDateId) {
            var transCashInflowParam = {
                "SPName": "usp_GetFactTrustTransactionCashInflow",
                "SQLParams": [
                    {
                        "Name": "trustId",
                        "value": trustId,
                        "DBType": "int"
                    },
                    {
                        "Name": "ReportingDateId",
                        "value": reportedDateId,
                        "DBType": "string"
                    }
                ]
            };
            return getWcfCommon(transCashInflowParam);
        }

        function getWcfFactTrustTransactionAccountInfo(trustId, reportedDateId) {
            var transAccountInfoParam = {
                "SPName": "usp_GetFactTrustTransactionAccountInfo",
                "SQLParams": [
                    {
                        "Name": "trustId",
                        "value": trustId,
                        "DBType": "int"
                    },
                    {
                        "Name": "ReportingDateId",
                        "value": reportedDateId,
                        "DBType": "int"
                    }
                ]
            };
            return getWcfCommon(transAccountInfoParam);
        }
        //返回改专项计划的所有债券信息
        function getAllTrustBondCode(trustId) {   
            var TrustBondCode = {
                "SPName": "usp_getAllTrustBondCode",
                "SQLParams": [
                    {
                        "Name": "TrustId",
                        "value": trustId,  
                        "DBType": "int"
                    }
                ]
            };
            return getWcfCommon(TrustBondCode);
        }

        //投资人兑付明细
        function getInfoForBondCode(trustId,ReportingDateId) {
            var getInfoForBondCode = {
                "SPName": "usp_getInfoForBondCode",
                "SQLParams": [
                    {
                        "Name": "TrustId",
                        "value": trustId,   
                        "DBType": "int"
                    },
                    {
                        "Name": "ReportingDateId",
                        "value": ReportingDateId,      
                        "DBType": "string"
                },
                ]
            };
            return getWcfCommon(getInfoForBondCode);
        }

        // Get trusts list
        function getTrustCodeList() {
            var trustCodeParam = {
                "SPName": "usp_GetTrustListPerTrustFeePayment",
                "SQLParams": []
            };

            return getWcfCommon(trustCodeParam);
        }

        // Get trust fee date list
        function getTrustFeeDateList(trustCode) {
            var trustFeeDateParam = {
                "SPName": "usp_GetTrustFeePaymentDateList",
                "SQLParams": [
                    {
                        "Name": "TrustCode",
                        "value": trustCode,
                        "DBType": "string"
                    }
                ]
            };

            return getWcfCommon(trustFeeDateParam);
        }

        // Get trust fee payment data
        function getTrustFeePaymentInterface(trustCode, transactionDate) {
            var trustFeeParam = {
                "SPName": "usp_GetTrustFeePaymentInterface",
                "SQLParams": [
                    {
                        "Name": "TrustCode",
                        "value": trustCode,
                        "DBType": "string"
                    },
                    {
                        "Name": "TransactionDate",
                        "value": transactionDate,
                        "DBType": "date"
                    },
                    {
                        "Name": "OrganizationCode",
                        "value": 'CRC',
                        "DBType": "string"
                    }
                ]
            };
            return getWcfCommon(trustFeeParam);
        }

        // Update fee status
        function updateUpdateTrustFeeTransactionStatus(feeDataXml) {
            var feeDataParam = {
                "SPName": "usp_UpdateTrustFeePaymentTransactionStatus",
                "SQLParams": [
                    {
                        "Name": "FeeData",
                        "value": feeDataXml,
                        "DBType": "xml"
                    }
                ]
            };
            return getWcfCommon(feeDataParam);
        }

        //收益分配结果校验
        function getIncomeDistributionValidationDetail(trustId, reportedDateId) {
            var transCashInflowParam = {
                "SPName": "usp_GetIncomeDistributionValidationDetail",
                "SQLParams": [
                    {
                        "Name": "trustId",
                        "value": trustId,
                        "DBType": "int"
                    },
                    {
                        "Name": "ReportingDateId",
                        "value": reportedDateId,
                        "DBType": "string"
                    }
                ]
            };
            return getWcfCommon(transCashInflowParam);
        }
        function getWcfTrustFee(trustId, reportedDate) {
            var transCashInflowParam = {
                "SPName": "usp_GetTrustFee",
                "SQLParams": [
                    {
                        "Name": "trustId",
                        "value": trustId,
                        "DBType": "int"
                    },
                    {
                        "Name": "TransactionDate",
                        "value": reportedDate,
                        "DBType": "string"
                    }
                ]
            };
            return getWcfCommon(transCashInflowParam);
        }

        function getWcfFeeModelSource() {
            var serviceUrl = tmDataProcessServiceUrl + "/GetFeesFromXMLFile?FilePath=E:\\TSSWCFServices\\TrustManagementService\\UITaskStudio\\Models\\ZhaoShang\\CashFlowFeeModel.Xml";
            return $.ajax({
                type: "GET",
                url: serviceUrl,
                dataType: "jsonp",
                crossDomain: true,
                contentType: "application/json;charset=utf-8"
            });
        }
        return {
            updateECByECSetCodeAndECName: updateECByECSetCodeAndECName,
            getCriteriaByECSetCodeAndECName: getCriteriaByECSetCodeAndECName,
            updateTaskXmlByTaskCode: updateTaskXmlByTaskCode,
            getCriteriasByECSetCode: getCriteriasByECSetCode,
            getTaskXmlByTaskCode: getTaskXmlByTaskCode,
            isNewActionCode: isNewActionCode,
            createSessionByTaskCode: createSessionByTaskCode,
            tMSSaveItem: tMSSaveItem,
            tMSGetItems: tMSGetItems,
            getWcfCommon : getWcfCommon,
            getWcfTrustPeriod: getWcfTrustPeriod,
            getWcfFactBondPaymentBalance: getWcfFactBondPaymentBalance,
            getWcfFormulaDateOfIncomeDistribution: getWcfFormulaDateOfIncomeDistribution,
            getWcfFeeModelSource: getWcfFeeModelSource,
            getWcfFactTrustTransactionFee: getWcfFactTrustTransactionFee,
            getWcfFactTrustTransactionCashInflow: getWcfFactTrustTransactionCashInflow,
            getWcfTrustFee: getWcfTrustFee,
            getWcfFeeModelSource:getWcfFeeModelSource,
            getTrustCodeList: getTrustCodeList,
            getTrustFeeDateList: getTrustFeeDateList,
            getTrustFeePaymentInterface: getTrustFeePaymentInterface,
            updateUpdateTrustFeeTransactionStatus: updateUpdateTrustFeeTransactionStatus,
            getIncomeDistributionValidationDetail: getIncomeDistributionValidationDetail,
            getAllTrustBondCode: getAllTrustBondCode,
            getInfoForBondCode: getInfoForBondCode,
            getWcfFactTrustTransactionAccountInfo: getWcfFactTrustTransactionAccountInfo

        };
    };
    return wcfProxy;
});



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




