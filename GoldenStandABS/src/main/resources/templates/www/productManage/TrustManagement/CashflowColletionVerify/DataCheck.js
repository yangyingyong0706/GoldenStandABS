var $;
var PoolCutCommon;
var common;
var GlobalVariable;
var GSDialog;
var calendar;
var taskIndicator;
var sVariableBuilder;
var viewVerify;


define(function (require) {
    ////////////////////////
    if (!Array.prototype.find) {
        Object.defineProperty(Array.prototype, 'find', {
            value: function (predicate) {
                // 1. Let O be ? ToObject(this value).
                if (this == null) {
                    throw new TypeError('"this" is null or not defined');
                }

                var o = Object(this);

                // 2. Let len be ? ToLength(? Get(O, "length")).
                var len = o.length >>> 0;

                // 3. If IsCallable(predicate) is false, throw a TypeError exception.
                if (typeof predicate !== 'function') {
                    throw new TypeError('predicate must be a function');
                }

                // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
                var thisArg = arguments[1];

                // 5. Let k be 0.
                var k = 0;

                // 6. Repeat, while k < len
                while (k < len) {
                    // a. Let Pk be ! ToString(k).
                    // b. Let kValue be ? Get(O, Pk).
                    // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
                    // d. If testResult is true, return kValue.
                    var kValue = o[k];
                    if (predicate.call(thisArg, kValue, k, o)) {
                        return kValue;
                    }
                    // e. Increase k by 1.
                    k++;
                }

                // 7. Return undefined.
                return undefined;
            }
        });
    }
    ////////////////////////
    $ = require('jquery');
    PoolCutCommon = require('app/basicAsset/js/PoolCutCommon_interface');
    common = require('common');
    GlobalVariable = require('gs/globalVariable');
    GSDialog = require('gsAdminPages');
    calendar = require('calendar');
    var kendoGrid = require('kendo.all.min');
    var params = [];
    var taskIndicator = require('gs/taskProcessIndicator');
    var sVariableBuilder = require('gs/sVariableBuilder');
    require("kendomessagescn");
    var Vue = require('Vue');
        
    new Vue({
        el: '#app',
        data: {
            options: []
            , result: {
                total: 0
                , data: []
                }
            , current: 1
            , pageSize: 10
            , jump: 1
            , file: null
            , filename: ''
            , sourceFilePath: ''
            , sessionId: ''
            , percent: 0
            , xhr: null
            , runTaskHtml: ''
        },
        created: function () {
            this.states();
            this.sessionId = sessionStorage.getItem('sessionId');
        },
        methods: {
           
            jumpToPage: function () {
                var page = parseInt(this.jump),
                    totalPage = this.totalPage,
                    current = this.current;
                if (page < 1 || page > totalPage) {
                    this.current = (current === totalPage) ? totalPage : 1;
                    this.jump = this.current;
                } else {
                    this.current = page;
                }
            },
            sessionIdMethod: function (SessionId) {
                if (SessionId === '') return;
                var go;
                //验证task是否成功
                var executeParamEX = {
                    SPName: 'Verification.usp_GetVerificationStatus', SQLParams: [
                        { Name: 'SessionId', Value: SessionId, DBType: 'string' }
                    ]
                };
                var executeParamEXs = encodeURIComponent(JSON.stringify(executeParamEX));
                var serviceUrlEX = GlobalVariable.PoolCutServiceURL + 'CommonGet?connName=TaskProcess&exeParams=' + executeParamEXs;
                CallWCFSvc(serviceUrlEX, false, 'GET', function (res) {
                    if (res[0].Result == "Success") {//task运行成功
                        go = true
                    } else {
                        go = false
                    }
                }.bind(this));
                if (go) {
                    //GSDialog.HintWindow("校验成功")
                    return false
                }
                var executeParam = {
                    SPName: 'Verification.usp_GetVerificationDetailList', SQLParams: [
                        { Name: 'SessionId', Value: SessionId, DBType: 'string' }
                        , { Name: 'total', Value: 0, DBType: 'int', IsOutput: true }
                    ]
                };
                var executeParams = encodeURIComponent(JSON.stringify(executeParam));
                var serviceUrl = GlobalVariable.PoolCutServiceURL + 'CommonGet?connName=TaskProcess&exeParams=' + executeParams;
                CallWCFSvc(serviceUrl, true, 'GET', function (res) {
                    if (res.total > 0 || res.data.length > 0) {
                        var filename = this.filename
                        viewVerify(SessionId, filename);
                    }
                }.bind(this));
            },
            removeItem: function () {
                var str = "";
                $.each(params, function (i, v) {
                    if (i == 0) {
                        str += v
                    } else {
                        str += ";" + v
                    }
                })
                sVariableBuilder.AddVariableItem('TaskType', 'Cashflow', 'String');
                sVariableBuilder.AddVariableItem('SessionIds', str, 'String');
                var sVariable = sVariableBuilder.BuildVariables();
                var taskCode = 'DeleteVerificationResult';
                var tIndicator = new taskIndicator({
                    width: 800,
                    height: 550,
                    clientName: 'TaskProcess',
                    appDomain: 'Task',
                    taskCode: taskCode,
                    sContext: sVariable,
                    callback: function () {
                        location.reload(true);
                    }.bind(this)
                });
                tIndicator.show();
            },
            states: function () {
                var self = this;
                var start = (this.current - 1) * this.pageSize + 1,
                    end = this.current * this.pageSize;
                var executeParam = {
                    SPName: 'Verification.usp_GetVerificationList', SQLParams: [
                        { Name: 'resultType', Value: 'Cashflow', DBType: 'string' }
                        , { Name: 'total', Value: 0, DBType: 'int', IsOutput: true }
                    ]
                };
                var executeParams = encodeURIComponent(JSON.stringify(executeParam));
                var serviceUrl = GlobalVariable.PoolCutServiceURL + 'CommonGet?connName=TaskProcess&exeParams=' + executeParams;
                CallWCFSvc(serviceUrl, true, 'GET', function (data) {
                    this.result = data;
                    var grid = $("#grid").kendoGrid({
                        dataSource: data,
                        height: document.body.clientHeight - 60,
                        selectable: "multiple",
                        filterable: true,
                        sortable: true,
                        pageable: {
                            refresh: true,
                            pageSizes: true,
                            buttonCount: 5,
                            page: 1,
                            pageSize: 10,
                            pageSizes: [10, 20, 30, 50],
                        },
                        columns: [
                            {
                                title: "", width: '50px', headerTemplate: function () {
                                    var t = '<input type="checkbox" id="checkAll" onclick="self.selectAll(this)" style="position:relative;top:-2px;left:-1px"/>';//
                                    return t
                                }, template: function (data) {
                                    var info = data.SessionId
                                    var t = '<input type="checkbox" class="selectbox"  onclick="self.selectCurrent(this)" data-info=' + info + '>';//
                                    return t
                                }, locked: true
                            },
                            {
                                title: "校验结果",
                                width: "auto",
                                template: function (data) {
                                    var t = "<a id='viewResult_dcl1'  href=" + 'javascript:viewVerify(' + "'" + data.SessionId + "'" + "," + "'" + data.fileName + "'" + ')' + ">查看结果</a>"

                                    return t
                                }
                            },
                            {
                                title: "文件名",
                                field: "fileName",
                                width: "auto",
                            },
                            {
                                title: "校验时间",
                                field: "StartTime",
                                width: "auto",
                            },
                            {
                                title: "校验人",
                                field: "UserId",
                                width: "auto",
                            },
                            {
                                title: "导出",
                                width: "auto",
                                template: function (data) {
                                    var id = 'downLoad' + data.SessionId
                                    //var t = "<div id=" + id + ">"
                                    var filedName = data.fileName.substring(0, data.fileName.lastIndexOf("."))
                                    //common.downLoadExcelForSyn('/PoolCut/Files/DataCheck/' + filedName + '_' + data.SessionId + '.csv', '下载', filedName + '_' + data.SessionId + '.csv', 'downLoad' + data.SessionId);

                                    var t = '<a href="/PoolCut/Files/DataCheck/{0}_{1}.csv">下载</a>'.format(filedName, data.SessionId);
                                    return t
                                }
                            },
                        ],
                        dataBound: function () {
                            var arry = $(".selectbox");
                            var off = true;
                            $.each(arry, function (i, v) {
                                $.each(params, function (j, k) {
                                    if (k == $(v).attr("data-info")) {
                                        $(v).prop("checked", true);
                                        //count++;
                                    }
                                })
                            })
                            $.each(arry, function (i, v) {
                                if (v.checked != true) {
                                    off = false;
                                }
                            })
                            if (off && arry.length != 0) {
                                $("#checkAll").prop("checked", true)
                            } else {
                                $("#checkAll").prop("checked", false)
                            }

                        }
                    });
                    if (self.sessionId) {
                        self.sessionIdMethod(self.sessionId)
                    }
                 
                }.bind(this));
                $(window).resize(function () {
                    var a = $(window).height() - 70
                    $("#grid").height(a);
                    $("#grid").children(".k-grid-content").height(a - 70)
                    $("#grid").children(".k-grid-content-locked").height(a - 100)
                })
                $(window).resize()
                return 1;
            },
        },
    });
    this.selectAll = function (that) {
        if ($("#checkAll").is(':checked')) {
            var arry = $(".selectbox");
            $.each(arry, function (i, v) {
                $(v).prop("checked", true);
                var aco = $(v).attr("data-info");
                if (params.indexOf(aco) == -1) {
                    params.push(aco);
                }
            })
        } else {
            var arry = $(".selectbox");
            $.each(arry, function (i, v) {
                $(v).prop("checked", false);
                params.remove($(v).attr("data-info"));
            })
        }
        if (params.length != 0) {
            $("#removeItem").removeAttr("disabled");
        } else {
            $("#removeItem").attr("disabled","true");
        }
    }
    this.selectCurrent = function (that) {
        var that = that;
        var arry = $(".selectbox");
        var off = true;
        $.each(arry, function (i, v) {
            if (!v.checked) {
                off = false;
            }
        })
        //$.each(arry, function (i, v) {
        //    var aco = $(v).attr("data-info");
        //    if (v.checked && params.indexOf(aco) == -1) {
        //        params.push(aco);
        //    }
        //})
        if ($(that).is(':checked')) {
            params.push($(that).attr("data-info"));
        } else {
            params.remove($(that).attr("data-info"));
        }
        if (off) {
            $("#checkAll").prop("checked", true);
        } else {
            $("#checkAll").prop("checked", false);
        }
        if (params.length != 0) {
            $("#removeItem").removeAttr("disabled");
        } else {
            $("#removeItem").attr("disabled", "true");
        }
    }
    viewVerify = function (SessionId, fileName) {
        if (!SessionId) return;
        var width = $(top).width() / 1.4;
        var height = $(top).height() / 1.3;
        fileName = fileName ? fileName : '收益分配数据校验';
        var url = GlobalVariable.TrustManagementServiceHostURL + 'basicAsset/AssetDataCheck/VerificationList.html?SessionId=' + SessionId + '&filename=' + escape(fileName) + '&cache=' + Math.ceil(Math.random() * 100 * 380) + '&Cashflow=1'
        GSDialog.topOpen('校验结果', url, null, function (result) {
            if (result) {
                window.location.reload();
            }
        }, 1100, 550, "", true, true, "", false);
    };
})

