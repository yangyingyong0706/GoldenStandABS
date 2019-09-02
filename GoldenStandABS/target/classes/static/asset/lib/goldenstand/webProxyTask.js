define(function (require) {
    var webProxy = {
        sessionServiceBase: location.protocol + "//" + location.host + "/TaskProcessEngine/SessionManagementService.svc/jsAccessEP/",
        workFlowServieBase: location.protocol + "//" + location.host + "/WorkflowEngine/WorkflowEngineService.svc/jsAccessEP/",

        getQueryStoredProcedureProxy: function (appDomain, context, callback) {
            var serviceUrl = this.workFlowServieBase + "GetQueryStoredProcedure/" + appDomain + "?r=" + Math.random() * 150;
            $.ajax({
                cache: false,
                url: serviceUrl,
                type: 'POST',
                dataType: 'jsonp',
                contentType: "application/json;charset=utf-8",
                data: JSON.stringify(context),
                success: function (response) {
                    if (response == "") {
                        response = undefined;
                    } else {
                        response = JSON.parse(response);
                    }
                    callback(response);
                },
                error: function (response, b, c) {
                    alert("webProxy.getQueryStoredProcedureProxy:" + response.responseText);
                }
            });
        },
        getNonQueryStoredProcedureProxy: function (appDomain, context, callback) {
            var serviceUrl = this.workFlowServieBase + "GetNonQueryStoredProcedure/" + appDomain + "?r=" + Math.random() * 150;
            $.ajax({
                url: serviceUrl,
                type: 'POST',
                dataType: 'json',
                contentType: "application/json;charset=utf-8",
                data: JSON.stringify(context),
                success: function (response) {
                    callback(response);
                },
                error: function (response) { alert("webProxy.getNonQueryStoredProcedureProxy:" + response.responseText); }
            });
        },
        createSessionByTaskCode: function (sContext, callback) {
            var sessionVariables_p = encodeURIComponent(sContext.sessionVariables);
            var serviceUrl = this.sessionServiceBase + "CreateSessionByTaskCode?applicationDomain=" + sContext.appDomain + "&sessionVariable=" + sessionVariables_p + "&taskCode=" + sContext.taskCode;
            $.ajax({
                type: "GET",
                async: false,
                url: serviceUrl,
                dataType: "jsonp",
                crossDomain: true,
                contentType: "application/json;charset=utf-8",
                success: function (response) {
                    callback(response);
                },
                error: function (response) { alert("webProxy.createSessionByTaskCode:" + response); }
            });
        },
        runTask: function (appDomain, sessionId, callback) {
            var serviceUrl = this.sessionServiceBase + "RunTask?vSessionId=" + sessionId + "&applicationDomain=" + appDomain;
            $.ajax({
                type: "GET",
                url: serviceUrl,
                dataType: "json",
                contentType: "application/json;charset=utf-8",
                success: function (response) {
                    callback(response);
                },
                error: function (response) {
                    callback(response);
                }
                
            });
        },
        runTaskReportGuide: function (appDomain, sessionId, callback1, callback2) {
            var serviceUrl = this.sessionServiceBase + "RunTask?vSessionId=" + sessionId + "&applicationDomain=" + appDomain;
            $.ajax({
                type: "GET",
                url: serviceUrl,
                dataType: "json",
                contentType: "application/json;charset=utf-8",
                success: function (response) {
                    callback1();
                },
                error: function (response) {
                    callback2();
                }

            });
        },
        getWorkflowCortrolActions: function (appDomain, objId, objType, callback) {
            var sContent = "{'SPName':'usp_GetWorkflowCortrolActions'," +
                            "'objId':'" + objId + "'," +
                            "'objType':'" + objType + "'" +
                        "}";
            this.getQueryStoredProcedureProxy(appDomain, sContent, callback);
        },
        GetCurrentWorkflowActions: function (appDomain, objId, objType, callback) {
            var sContent = "{'SPName':'usp_GetCurrentWorkflowActions'," +
                        "'objId':'" + objId + "'," +
                        "'objType':'" + objType + "'" +
                        "}";
            this.getQueryStoredProcedureProxy(appDomain, sContent, callback);
        },
        getCurrentWorkflowStates: function (objId, objType, WorkFlowCode, VariableName, WorkFlowState, callback) {
            var sContent = "{'SPName':'usp_GetCurrentWorkflowStates'," +
                        "'objId':'" + objId + "'," +
                        "'objType':'" + objType + "'," +
                        "'set':'zh-CN'," +
                        "'WorkFlowCode':'" + WorkFlowCode + "'," +
                        "'VariableName':'" + VariableName + "'" +
                    "}";
            this.getQueryStoredProcedureProxy("Monitor", sContent, callback);
        },
        getWorkFlowTransitonByWorkFlowCode: function (workFlowCode, callback) {
            var sContent = "{'SPName':'usp_GetWorkFlowTransitonByWorkFlowCode'," +
                                "'WorkFlowCode':'" + workFlowCode + "'" +
                            "}";
            this.getQueryStoredProcedureProxy("Monitor", sContent, callback);
        },
        GetCurrrentWorkflowMonitorSessionId: function (objId, objType, callback) {
            var sContent = "{'SPName':'usp_GetCurrrentWorkflowMonitorSessionId'," +
                                 "'objId':'" + objId + "'," +
                                 "'objType':'" + objType + "'" +
                            "}";
            this.getQueryStoredProcedureProxy("Monitor", sContent, callback);
        },
        getCurrentApprovalState: function (appDomain, objId, objType, callback) {
            var sContent = "{'SPName':'usp_GetCurrentApprovalState'," +
                        "'objId':'" + objId + "'," +
                        "'objType':'" + objType + "'" +
                        "}";
            this.getQueryStoredProcedureProxy(appDomain, sContent, callback);
        },
        getCurrentApprovalOpinion: function (objId, objType, callback) {
            var sContent = "{'SPName':'usp_GetCurrentApprovalOpinion'," +
                                 "'objId':'" + objId + "'," +
                                 "'objType':'" + objType + "'" +
                            "}";
            this.getQueryStoredProcedureProxy("Monitor", sContent, callback);
        },
        saveApprovalOpinionLog: function (appDomain, objId, objType, currentState, reason, approvalOpinion, createdUser, callback) {
            var sContent = "{'SPName':'[usp_SaveApprovalOpinionLog]'," +
                          "'objId':'" + objId + "'," +
                            "'objType':'" + objType + "'," +
                            "'CurrentState':'" + currentState + "'," +
                            "'Reason':'" + reason + "'," +
                            "'ApprovalOpinion':'" + encodeURIComponent(approvalOpinion) + "'," +
                            "'CreatedUser':'" + createdUser + "'" +
                          "}";
            this.getNonQueryStoredProcedureProxy(appDomain, sContent, callback);
        }
    }

    return webProxy
})