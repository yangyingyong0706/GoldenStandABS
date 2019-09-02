define(['jquery', 'loading', 'common'], function ($, loading, common) {

    var TaskProcessIndicatorHelper = function (isCashflow) {
        var Loading = (function () {

            function show(text) {
                close();
                if (typeof (text) == undefined || text == null) {
                    text = '正在执行，请稍后...';
                }
                var html = '<div id="div_task_loading" class="task-loadpage">' +
                     '<div class="loading-wraper">' +
                     ' <i class="iconfont icon-shezhi bigicon am-rotate pa"></i>' +
                     ' <i class="iconfont icon-shezhi smicon am-rotate pa"></i>' +
                     ' <p class="text pa">' + text + '</p>' +
                     '</div>' +
                     '</div>'

                var div = document.createElement("div");
                div.innerHTML = html;
                document.body.appendChild(div);
            }


            function close() {
                var _element = document.getElementById('div_task_loading');
                if (_element) {
                    var _parentElement = _element.parentNode;
                    if (_parentElement) {
                        _parentElement.removeChild(_element);
                    }
                }
            }

            return {
                Show: show,
                Close: close,
            }
        })();

        var TaskProcessEngineServiceURL = location.protocol + "//" + location.host + '/TaskProcessEngine/SessionManagementService.svc/jsAccessEP/';
        var CashFlowStudioServie = location.protocol + "//" + location.host + '/CashFlowEngine/CashFlowStudioService.svc/jsAccessEP/';

        this.IsCashflow = isCashflow;

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
        this.layerAlert = function () {

        }

        this.ShowIndicator = function (app, code, fnCallBack) {
            var self = this;

            var sContext = {
                appDomain: app,
                sessionVariables: self.BuildVariables(),
                taskCode: code
            };

            Loading.Show('正在创建任务...');
            setTimeout(function () {
                self.CreateSessionByTaskCode(sContext, function (response, result) {
                    if (!result) {
                        Loading.Close();
                        layer.alert('任务创建失败！');
                        return;
                    }
                    Loading.Show('正在执行任务...');
                    setTimeout(function () {
                        if (self.IsCashflow) {
                            serviceUrl = CashFlowStudioServie + "RunTask/" + app + "/" + response + "?r=" + Math.random() * 150;
                        } else {
                            serviceUrl = TaskProcessEngineServiceURL + "RunTask?vSessionId=" + response + "&applicationDomain=" + app;
                        }
                        $.ajax({
                            type: "GET",
                            url: serviceUrl,
                            dataType: "json",
                            contentType: "application/json;charset=utf-8",
                            success: function (d) {
                                Loading.Close();
                                fnCallBack(true, response);
                            },
                            error: function (d) {
                                layer.alert('任务发生执行错误！');
                                Loading.Close();
                            }
                        });
                    }, 700)

                });
            }, 700)

        };

        this.ShowIndicatorWithNoPopUp = function (app, code, fnCallBack) {
            var self = this;
            var sContext = {
                appDomain: app,
                sessionVariables: self.BuildVariables(),
                taskCode: code
            };
            this.CreateSessionByTaskCode(sContext, function (response, result) {
                if (!result) {
                    fnCallBack(false, response);
                }
                if (self.IsCashflow) {
                    serviceUrl = CashFlowStudioServie + "RunTask/" + app + "/" + response + "?r=" + Math.random() * 150;
                } else {
                    serviceUrl = TaskProcessEngineServiceURL + "RunTask?vSessionId=" + response + "&applicationDomain=" + app;
                }
                $.ajax({
                    type: "GET",
                    url: serviceUrl,
                    dataType: "json",
                    contentType: "application/json;charset=utf-8",
                    success: function (d) {
                        fnCallBack(true, response);
                    },
                    error: function (d) {
                        fnCallBack(false, response);
                    }
                });
            });
        };

        this.ShowIndicatorForDataVerification = function (app, code, fnCallBack) {
            var self = this;

            var sContext = {
                appDomain: app,
                sessionVariables: self.BuildVariables(),
                taskCode: code
            };

            Loading.Show('正在创建任务...');
            setTimeout(function () {
                self.CreateSessionByTaskCode(sContext, function (response, result) {
                    if (!result) {
                        Loading.Close();
                        layer.alert('任务创建失败！');
                        return;
                    }
                    Loading.Show('正在执行任务...');
                    setTimeout(function () {
                        Loading.Show('正在进行数据有效性校验...');
                        if (self.IsCashflow) {
                            serviceUrl = CashFlowStudioServie + "RunTask/" + app + "/" + response + "?r=" + Math.random() * 150;
                        } else {
                            serviceUrl = TaskProcessEngineServiceURL + "RunTask?vSessionId=" + response + "&applicationDomain=" + app;
                        }
                        $.ajax({
                            type: "GET",
                            url: serviceUrl,
                            dataType: "json",
                            contentType: "application/json;charset=utf-8",
                            success: function (d) {
                                Loading.Close();
                                fnCallBack(true, response);
                            },
                            error: function (d) {
                                layer.alert('任务发生执行错误！');
                                Loading.Close();
                            }
                        });
                    }, 700);
                });
            }, 700)

        };
        this.CreateSessionByTaskCode = function (sContext, callback) {
            var sessionVariables_p = encodeURIComponent(sContext.sessionVariables);
            var serviceUrl = TaskProcessEngineServiceURL + "CreateSessionByTaskCode?applicationDomain=" + sContext.appDomain + "&sessionVariable=" + sessionVariables_p + "&taskCode=" + sContext.taskCode;

            $.ajax({
                type: "GET",
                url: serviceUrl,
                dataType: "jsonp",
                crossDomain: true,
                contentType: "application/json;charset=utf-8",
                success: function (sessionId) {
                    callback(sessionId, true);
                },
                error: function (response) {
                    callback(response, false);
                }
            });
        };

    }

    return TaskProcessIndicatorHelper;
})

