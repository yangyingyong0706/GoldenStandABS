
define(['jquery', 'kendo.all.min', 'gs/uiFrame/js/common', 'jquery.localizationTool', 'gs/webStorage', 'gs/webProxy', 'app/transactionManage/script/dataOperate', 'jquery-ui', 'Vue', 'kendomessagescn', 'kendoculturezhCN', "gsAdminPages"], function ($, kendo, common, localizationTool, webStorage, webProxy, dataOperate, JqUi, vue, kendomessagescn, kendoculturezhCN, GSDialog) {
    $('#selectLanguageDropdown_qcl').localizationTool({
        'defaultLanguage': 'zh_CN', // this is the language that the server is sending anyway
        'ignoreUnmatchedSelectors': true,
        'showFlag': true,
        'showCountry': false,
        'showLanguage': true,
        'onLanguageSelected': function (languageCode) {
            /*
             * When the user translates we set the cookie
             */
            webStorage.setItem('userLanguage', languageCode);
            return true;
        },

        /* 
         * Translate the strings that appear in all the pages below
         */
        'strings': {


            'id:title1': {
                'en_GB': 'Accounting accounting'
            },
            'id:title2': {
                'en_GB': 'Accounting scene configuration'
            },
            'id:btnAdd': {
                'en_GB': 'Add'
            },
            'id:btnCheck': {
                'en_GB': 'View'
            },
            'id:btnDel': {
                'en_GB': 'Delete'
            },
            'id:title3': {
                'en_GB': 'Scene code'
            },
            'id:check': {
                'en_GB': 'Check'
            }
        }
    });
    var userLanguage = webStorage.getItem('userLanguage');
    if (userLanguage) {
        $('#selectLanguageDropdown_qcl').localizationTool('translate', userLanguage);
    }
    $('body').show();

    lang = {};
    if (userLanguage && userLanguage.indexOf('en') > -1) {
        lang.tab1 = 'Scene code'
        lang.tab2 = 'Scene name'
        lang.tab3 = 'Scene type code'
        lang.tab4 = 'Trading variety'
        lang.tab5 = 'Edit'
        lang.info1 = 'Please select the items to be deleted'
        lang.info2 = 'Please select the data to be edited'
        lang.info3 = 'Delete success!'
        lang.info4 = 'Please select the items you want to see!'

    } else {
        lang.tab1 = '场景代码'
        lang.tab2 = '场景名称'
        lang.tab3 = '场景类型代码'
        lang.tab4 = '交易品种'
        lang.tab5 = '编辑'
        lang.info1 = '请选择删除的条目'
        lang.info2 = '请选择所要编辑的数据'
        lang.info3 = '删除成功！'
        lang.info4 = '请选择想要查看的条目'
    }




    //上面这个方法执行下面的方法，并且将其暴露出去
    ViewAccountingSceneConfig = (function () {
        //资产转让：39 资产赎回：44   清仓回购：40 回购上划42：   信托对价：43   回收上划：41
        //EC方法
        function RunTask(SceneCodeval, SceneNameval, SceneTypeCodeval, TradeTypeval) {
            var tpi = new TaskProcessIndicatorHelper();
            tpi.AddVariableItem("SceneCodeval", SceneCodeval, 'NVarChar');
            tpi.AddVariableItem("SceneNameval", SceneNameval, 'NVarChar');
            tpi.AddVariableItem("SceneTypeCodeval", SceneTypeCodeval, 'NVarChar');
            tpi.AddVariableItem("TradeTypeval", TradeTypeval, 'NVarChar');
            tpi.ShowIndicator("Task", 'Exe_EC');
        }

        //重载PopupTaskProcessIndicator函数，调用父窗口的div
        function PopupTaskProcessIndicator(fnCallBack) {
            $("#taskIndicatorArea").dialog({
                modal: true,
                dialogClass: "TaskProcessDialogClass",
                closeText: "",
                //closeOnEscape:false,
                height: 550,
                width: 450,
                close: function (event, ui) {
                    if (typeof fnCallBack === 'function') { fnCallBack(1); }
                    else { parent.window.location.reload(); }
                    close();
                    //$mask.trigger('click');
                    //self.onClose();
                }, // refresh report repository while close the task process screen.
                //open: function (event, ui) { $(this).closest('.ui-dialog').find('.ui-dialog-titlebar-close').hide(); },
                title: "任务处理"
            });
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
                sContext = {
                    appDomain: app,
                    sessionVariables: this.BuildVariables(),
                    taskCode: code,
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
                var sessionVariables_p = encodeURIComponent(sContext.sessionVariables);
                var uriHostInfo = webProxy.baseUrl;
                var TaskProcessEngineServiceURL = uriHostInfo + '/TaskProcessEngine/SessionManagementService.svc/jsAccessEP/';
                var serviceUrl = TaskProcessEngineServiceURL + "CreateSessionByTaskCode?applicationDomain=" + sContext.appDomain + "&sessionVariable=" + sessionVariables_p + "&taskCode=" + sContext.taskCode;
                //var serviceUrl = TaskProcessEngineServiceURL + "CreateSessionPostByTaskCode";
                var obj = {};
                obj.appDomain = sContext.appDomain;
                obj.sessionVariables = sContext.sessionVariables;
                obj.taskCode = sContext.taskCode;
                $.ajax({
                    type: "GET",                    //modify to POST method
                    url: serviceUrl,
                    dataType: "jsonp",
                    crossDomain: true,
                    contentType: "application/json;charset=utf-8",
                    success: function (sessionId) {
                        callback(sessionId);
                    },
                    error: function (response) { GSDialog.HintWindow(response); }
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
            $(document.getElementById("TaskProcessCtl").Content.SL_Agent.InitParams(sessionID, IndicatorAppDomain, taskCode, clientName))

        }


        //调用Runtask
        function disw(a, b, c, d) {
            var w = $("#grid").width();
            disw = w - a - b - c -d;
            return disw;
        }
        function saveItem() {
            if (document.getElementById("check1").checked)
                dataOperate.UpdateEC(39, 1);
            else
                dataOperate.UpdateEC(39, 0);
            if (document.getElementById("check2").checked)
                dataOperate.UpdateEC(44, 1);
            else
                dataOperate.UpdateEC(44, 0);
            if (document.getElementById("check3").checked)
                dataOperate.UpdateEC(40, 1);
            else
                dataOperate.UpdateEC(40, 0);
            if (document.getElementById("check4").checked)
                dataOperate.UpdateEC(42, 1);
            else
                dataOperate.UpdateEC(42, 0);
            if (document.getElementById("check5").checked)
                dataOperate.UpdateEC(43, 1);
            else
                dataOperate.UpdateEC(43, 0);
            if (document.getElementById("check6").checked)
                dataOperate.UpdateEC(41, 1);
            else
                dataOperate.UpdateEC(41, 0);
            var SceneCodeval = $("#addSceneCode").val();
            var SceneNameval = $("#addSceneName").val();
            var SceneTypeCodeval = $("#addSceneTypeCode").val();
            var TradeTypeval = $("#addTradeType").val();
            RunTask(SceneCodeval, SceneNameval, SceneTypeCodeval, TradeTypeval);

        }


        kendo.culture("zh-CN");
        var h = $("body").height() - 70;
        dataOperate.viewScene(viewSceneCB);

        function viewSceneCB(json) {
            console.log(json);
            $("#grid").kendoGrid({
                dataSource: {
                    data: json,
                    pageSize: 10,
                    serverPaging: true,
                    serverFiltering: true,
                },
                selectable: "row",
                height: h,
                sortable: true,
                reorderable: true,
                resizable: true,
                pageable: true,
                columns: [
                    {
                        field: "SceneCode",
                        title: lang.tab1,
                        attributes: {
                            "class": "table-SceneCode",
                            "id": "Tabel-SceneCode"
                        },
                        width: 80
                    },
                    {
                        field: "SceneName",
                        title: lang.tab2,
                        attributes: {
                            "class": "table-SceneName",
                            "id": "Tabel-SceneName"
                        },
                        width: 80
                    },
                    {
                        field: "SceneTypeCode",
                        title: lang.tab3,
                        attributes: {
                            "class": "table-SceneTypeCode",
                            "id": "Tabel-SceneTypeCode"
                        },
                        width: 80
                    },
                    {
                        field: "TradeType",
                        title: lang.tab4,
                        attributes: {
                            "class": "table-TradeType",
                            "id": "Tabel-TradeType"
                        },
                        width: 80
                    },

                ]
            });

            //查看数据
            var grid = $("#grid").data("kendoGrid");
            var dataRows = grid.items();
            var data;
            var delectData;
            var BussinessNoData;
            for (i = 0; i < dataRows.length; i++) {
                dataRows[i].onclick = function () {
                    data = $(this).find(".table-SceneCode")[0].innerHTML;
                    //delectData = $(this).find(".table-TransferDate")[0].innerHTML + "," + $(this).find(".table-PoolDBName")[0].innerHTML + "," + $(this).find(".table-BussinessNo")[0].innerHTML + "," + $(this).find(".table-AccountNo")[0].innerHTML;
                }
            }


            $("#abc").click(function () {
                if ((typeof data) == "string") {
                    $("#lookDetails").dialog();
                    $("#lookDetailscontent").fadeIn();
                    dataOperate.ViewgetSceneByCode(data, ViewgetSceneByCodeCB);
                } else {
                    GSDialog.HintWindow(lang.info4);
                };
            });

            function ViewgetSceneByCodeCB(json) {
                console.log(json);
            }
            //删除
            //删除数据

            $("#Delete").click(function () {
                if ((typeof data) === "string") {
                    GSDialog.HintWindowTF(lang.info1, function () {
                        dataOperate.deleteSceneByCode(data, deleteSceneByCodeCB);
                    })
                }

            });

            function deleteSceneByCodeCB(json) {
                $(".k-state-selected").fadeOut();
            }
        };
    })();
});
