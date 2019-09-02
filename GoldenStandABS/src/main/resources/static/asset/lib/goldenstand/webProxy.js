define(function (require) {
    function webProxy() {
        this.baseUrl = location.protocol + '//' + location.host;
        this.sessionManagementServiceUrl = this.baseUrl + '/TaskProcessEngine/SessionManagementService.svc/jsAccessEP/';
        this.taskProcessServiceUrl = this.baseUrl + '/TaskProcessEngine/TaskProcessServiceRest.svc/jsAccessEP/';
        this.cashFlowStudioServiceUrl = this.baseUrl + '/TaskProcessEngine/CashFlowStudioService.svc/jsAccessEP/';

        this.dataProcessServiceUrl = this.baseUrl + '/GoldenstandABS/service/DataProcessService.svc/jsAccessEP/';
        this.trustManagementServiceUrl = this.baseUrl + '/GoldenstandABS/service/TrustManagementService.svc/jsAccessEP/';
        this.bondPaymentScheduleServiceUrl = this.baseUrl + '/GoldenstandABS/service/BondPaymentScheduleService.svc/jsAccessEP/';
        this.paymentScheduleServiceUrl = this.baseUrl + '/GoldenstandABS/service/PaymentScheduleService.svc/jsAccessEP/';
        this.poolCutServiceURL = this.baseUrl + '/GoldenStandABS/service/PoolCutService.svc/jsAccessEP/';

        this.productDocRootPath = 'E:\\TSSWCFServices\\PoolCut\\ConsumerLoan\\Document\\';
    }

    var $ = require('jquery');
    var common = require('gs/uiFrame/js/common');
    webProxy.prototype = {
        createTaskSession: function (appDomain, taskCode, sessionVariables, callback) {
            var sContext = {
                appDomain: appDomain,
                sessionVariables: sessionVariables,
                taskCode: taskCode
            };

            this.createSessionByTaskCode(sContext, function (response) {
                callback(response);
            });
        },
        createSessionByTaskCode: function (sContext, callback) {
            var sessionVariables_p = encodeURIComponent(sContext.sessionVariables);
            var serviceUrl = this.sessionManagementServiceUrl + "CreateSessionByTaskCode?applicationDomain=" + sContext.appDomain + "&sessionVariable=" + sessionVariables_p + "&taskCode=" + sContext.taskCode;
            $.ajax({
                type: "GET",
                url: serviceUrl,
                dataType: "jsonp",
                crossDomain: true,
                cache: false,
                contentType: "application/json;charset=utf-8",
                success: function (response) {
                    callback(response);
                },
                error: function (response) { alert("webProxy.createSessionByTaskCode:" + response); }
            });
        },
        updateSessionProcessActionCommand: function (sessionId, appDomain, actionCode, sequenceNo, actionCommandCode, callback) {
            var serviceUrl = this.taskProcessServiceUrl + "UpdateSessionProcessActionCommand?sessionId=" + sessionId
                + "&applicationDomain=" + appDomain + "&actionCode=" + actionCode + "&sequenceNo=" + sequenceNo + "&actionCommandCode=" + actionCommandCode;
            $.ajax({
                type: "GET",
                url: serviceUrl,
                dataType: "json",
                cache: false,
                contentType: "application/json;charset=utf-8",
                success: function (response) {
                    callback(response);
                },
                error: function (response) {
                    callback(response);
                }
            });
        },
        resetSessionProcessStatus: function (sessionId, appDomain, callback) {
            var serviceUrl = this.taskProcessServiceUrl + "ResetSessionProcessStatus?sessionId=" + sessionId + "&applicationDomain=" + appDomain;
            $.ajax({
                type: "GET",
                url: serviceUrl,
                dataType: "json",
                cache: false,
                contentType: "application/json;charset=utf-8",
                success: function (response) {
                    callback(response);
                },
                error: function (response) {
                    callback(response);
                }
            });
        },
        getSessionProcessStatusList: function (sessionId, appDomain, callback) {
            var serviceUrl = this.taskProcessServiceUrl + "GetSessionProcessStatusList?sessionId=" + sessionId + "&applicationDomain=" + appDomain;
            $.ajax({
                type: "GET",
                url: serviceUrl,
                dataType: "json",
                cache: false,
                contentType: "application/json;charset=utf-8",
                success: function (response) {
                    callback(response);
                },
                error: function (response) {
                    callback(response);
                }
            });
        },
        runTask: function (clientName, appDomain, sessionId, callback) {
            serviceUrl = this.taskProcessServiceUrl + "RunTask?sessionId=" + sessionId + "&applicationDomain=" + appDomain + "&clientName=" + clientName;
            $.ajax({
                type: "GET",
                url: serviceUrl,
                dataType: "json",
                cache: false,
                contentType: "application/json;charset=utf-8",
                success: function (response) {
                    callback(response);
                },
                error: function (response) {
                    callback(response);
                }
            });
        },
        getSessionById: function (appDomain, sessionId, callback) {
            var serviceUrl = this.sessionManagementServiceUrl + "GetSessionById?applicationDomain=" + appDomain + "&sessionId=" + sessionId;
            $.ajax({
                type: "GET",
                url: serviceUrl,
                dataType: "json",
                cache: false,
                contentType: "application/json;charset=utf-8",
                success: function (response) {
                    callback(response);
                },
                error: function (response) {
                    callback(response);
                }
            });
        },
        comGetData: function (params, url, SPName) {
            var deferred = $.Deferred();
            var urls;
            if (params) {
                if (params[0].length > 2) {
                    var executeParam = { SPName: SPName, SQLParams: [] };
                    for (var i = 0; i < params.length; i++) {
                        executeParam.SQLParams.push({ Name: params[i][0], Value: params[i][1], DBType: params[i][2] });
                    }
                    var executeParams = encodeURIComponent(JSON.stringify(executeParam));
                    urls = url + executeParams;
                } else {
                    var requestParams = '{"Method":' + SPName + ',"Params":{#PARAMS#}}';
                    var urlParams;
                    for (var i = 0; i < params.length; i++) {
                        if (i == params.length - 1) {
                            urlParams += "'" + params[i][0] + "':'" + params[i][1] + "'";
                        } else {
                            urlParams += "'" + params[i][0] + "':'" + params[i][1] + "',";
                        }
                    }
                    requestParams = requestParams.replace('#PARAMS#', urlParams);
                    urls = url + encodeURIComponent(requestParams);
                }
            } else {
                var executeParam = { SPName: SPName, SQLParams: [] };
                var executeParams = encodeURIComponent(JSON.stringify(executeParam));
                urls = url + executeParams;
            }
            $.ajax({
                cache: false,
                type: "GET",
                async: false,
                url: urls,
                dataType: "json",
                contentType: "application/xml;charset=utf-8",
                data: {},
                success: function (data) {
                    deferred.resolve(data);
                },
                error: function (data) {
                    deferred.reject(data);
                    alert('获取远程数据出错');
                }
            });
            return deferred.promise;
        },
        comGetDataNew: function (params, url, SPName) {
            var deferred = $.Deferred();
            var urls;
            if (params) {
                if (params[0].length > 2) {
                    var executeParam = { SPName: SPName, SQLParams: [] };
                    for (var i = 0; i < params.length; i++) {
                        executeParam.SQLParams.push({ Name: params[i][0], Value: params[i][1], DBType: params[i][2] });
                    }
                    var executeParams = encodeURIComponent(JSON.stringify(executeParam));
                    urls = url + executeParams;
                } else {
                    var requestParams = '{"Method":' + SPName + ',"Params":{#PARAMS#}}';
                    var urlParams;
                    for (var i = 0; i < params.length; i++) {
                        if (i == params.length - 1) {
                            urlParams += "'" + params[i][0] + "':'" + params[i][1] + "'";
                        } else {
                            urlParams += "'" + params[i][0] + "':'" + params[i][1] + "',";
                        }
                    }
                    requestParams = requestParams.replace('#PARAMS#', urlParams);
                    urls = url + encodeURIComponent(requestParams);
                }
            } else {
                var executeParam = { SPName: SPName, SQLParams: [] };
                var executeParams = encodeURIComponent(JSON.stringify(executeParam));
                urls = url + executeParams;
            }
            $.ajax({
                cache: false,
                type: "GET",
                async: true,
                url: urls,
                dataType: "json",
                contentType: "application/xml;charset=utf-8",
                data: {},
                success: function (data) {
                    deferred.resolve(data);
                },
                error: function (data) {
                    deferred.reject(data);
                    alert("error");
                }
            });
            return deferred.promise;
        },
        callWCFSvc: function (svcUrl, isAsync, rqstType, fnCallback) {
            var sourceData;
            $.ajax({
                cache: false,
                type: rqstType,
                async: isAsync,
                url: svcUrl,
                dataType: "json",
                contentType: "application/xml;charset=utf-8",
                data: {},
                success: function (response) {
                    if (typeof response == 'string' && response != "")
                        sourceData = JSON.parse(response);
                    else
                        sourceData = response;
                    if (fnCallback) fnCallback(sourceData);
                },
                error: function (response) { alert('Error occursed while requiring the remote source data!'); }
            });

            if (!isAsync) {
                return sourceData;
            }
        },

        //
        // 封装一个AJax请求方法
        getDatainfo: function (executeParam, callback) {
            var self = this
            var serviceUrl = self.dataProcessServiceUrl + "CommonExecuteGet?";
            common.ExecuteGetData(false, serviceUrl, 'TrustManagement', executeParam, callback);
        },

        //验证文档管理所需
        Verif: function (cata, tid) {
            var self = this;
            var versign = false;//验证标记
            switch (cata) {
                case 'Catalog':
                    var executeParamCata = {
                        'SPName': "usp_verifCata", 'SQLParams': [
                        ]
                    };

                    self.getDatainfo(executeParamCata, function (response) {
                        
                        if (response[0].result == 1) {
                            versign = true
                        }

                    });
                    break;

                case 'RootPath':
                    var executeParamCata = {
                        'SPName': "usp_verfiRootPath", 'SQLParams': [//todo:cata页面验证
                            { 'Name': 'TrustId', 'Value': tid, 'DBType': 'int' }
                        ]
                    };
                    self.getDatainfo(executeParamCata, function (response) {
                        if (response[0].RESULT == 1) {
                            versign = true
                        }

                    });
                    break;

                case 'NameShort':
                    var executeParamCata = {
                        'SPName': "usp_verfiNameShort", 'SQLParams': [//todo:cata页面验证
                            { 'Name': 'TrustId', 'Value': tid, 'DBType': 'int' }
                        ]
                    };
                    self.getDatainfo(executeParamCata, function (response) {
                        if (response[0].result == 1) {
                            versign = true
                        }

                    });
                    break;


            }
            return versign
        }
        //
    };

    return new webProxy();
});