/// <reference path="jquery-1.7.2.min.js" />
/// <reference path="common.js" />
/// <reference path="App.Global.js" />

var TaskProcessIndicatorHelper = function () {
    this.Variables = [];
    this.VariableTemp = '<SessionVariable><Name>{0}</Name><Value>{1}</Value><DataType>{2}</DataType><IsConstant>{3}</IsConstant><IsKey>{4}</IsKey><KeyIndex>{5}</KeyIndex></SessionVariable>';

    this.AddVariableItem = function (name, value, dtatType, isConstant, isKey, keyIndex) {
        this.Variables.push({ Name: name, Value: value, DataType: dtatType, IsConstant: isConstant || 0, IsKey: isKey || 0, KeyIndex: keyIndex || 0 });
    };

    this.BuildVariables = function () {
        var pObj = this;

        var vars = '';
        $.each(this.Variables, function (i, item) {
            vars += pObj.VariableTemp.format(item.Name, item.Value, item.DataType, item.IsConstant, item.IsKey, item.KeyIndex);
        });
        
        var strReturn = "<SessionVariables>{0}</SessionVariables>".format(vars);
        return strReturn;
    };

    this.ShowIndicator = function (app, code, fnCallBack) {
        var sContext = {
            appDomain: app,
            sessionVariables: this.BuildVariables(),
            taskCode: code
        };

        this.CreateSessionByTaskCode(sContext, function (response) {
            sessionID = response;
            taskCode = code;
            IndicatorAppDomain = app;

            if (IsSilverlightInitialized) {
                PopupTaskProcessIndicator(fnCallBack);
                InitParams();
            } else {
                PopupTaskProcessIndicator(fnCallBack);
            }
        });
    };

    this.CreateSessionByTaskCode = function (sContext, callback) {
        console.log(sContext.sessionVariables);
        var sessionVariables_p = encodeURIComponent(sContext.sessionVariables);
        var serviceUrl = GlobalVariable.TaskProcessEngineServiceURL + "CreateSessionByTaskCode?applicationDomain=" + sContext.appDomain + "&sessionVariable=" + sessionVariables_p + "&taskCode=" + sContext.taskCode;

        $.ajax({
            type: "GET",
            url: serviceUrl,
            dataType: "jsonp",
            crossDomain: true,
            contentType: "application/json;charset=utf-8",
            success: function (sessionId) {
                callback(sessionId);
            },
            error: function (response) { alert(response); }
        });
    };
};

var sessionID, taskCode, IndicatorAppDomain;
var clientName = 'TaskProcess';

var IsSilverlightInitialized = false;
function InitParams() {
    if (!IsSilverlightInitialized) {
        IsSilverlightInitialized = true;
    }

    document.getElementById("TaskProcessCtl").Content.SL_Agent.InitParams(sessionID, IndicatorAppDomain, taskCode, clientName);
}

function PopupTaskProcessIndicator(fnCallBack) {
    $("#taskIndicatorArea").dialog({
        modal: true,
        dialogClass: "TaskProcessDialogClass",
        closeText: "",
        //closeOnEscape:false,
        height: 550,
        width: 480,
        close: function (event, ui) {
            if (typeof fnCallBack === 'function') { fnCallBack(1); }
            else { window.location.reload(); }
        }, // refresh report repository while close the task process screen.
        //open: function (event, ui) { $(this).closest('.ui-dialog').find('.ui-dialog-titlebar-close').hide(); },
        title: "任务处理"
    });
}