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
    taskIndicator = require('gs/taskProcessIndicator');
    sVariableBuilder = require('gs/sVariableBuilder');
    var webProxy = require('gs/webProxy');
    var Vue = require('Vue2');
   //<script src="/TrustManagementService/TrustManagement/Common/Scripts/jquery.cookie.js"></script>
   //<script src="/TrustManagementService/TrustManagement/Common/Scripts/calendar.min.js"></script>
   //<script src="../../UIFrame/js/gs-admin-2.pages.js"></script>
   //<script src="../../Scripts/PoolCutCommon.js"></script>
   //<script src="../../Scripts/App.Global.js"></script>
   //<!--<script src="../../Config/globalVariable.js"></script>-->
   //<script src="../../Scripts/vue2.js"></script>

    function getString(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]);
        return null;
    }
    var trustId = getString('TrustId');
    if (trustId == null || trustId == 'NULL') {
        trustId = '';
    }

    var vm = new Vue({
        el: '#app',
        data: {
            TrustId: trustId,
            checkDataList: [],
            checkEndTime: ''
        },
        created: function () {
            this.checkData();
        },
        mounted: function () {
            //this.getTrusteeVerifyDataList();
        },
        methods: {
            checkData: function () {
                var This = this;
                This.PostRemoteDataWithReturn(This.TrustId, function (datas) {
                    //console.log(datas);
                    $(".check_loading").css('display', 'none');
                    if (datas == 0) {
                        $(".check_tips").css('display', 'none');
                        $(".list_demo").css('display', 'block');
                        $(".check_time").css('display', 'block');
                        This.getTrusteeVerifyDataList();
                    } else if (datas == -2) {
                        $("#checkInfo").text("马上校验");
                        var msg = '该信托计划还未进行校验';
                        $(".check_tips span").text(msg);
                    } else if (datas == -1) {
                        var msg = '已校验通过';
                        $(".check_tips span").text(msg);
                        $(".check_time").css('display', 'block');
                        This.getTrusteeVerifyDataList();
                    }
                });
            },
            getTrusteeVerifyDataList: function () {
                var This = this;
                var executeParam = {
                    SPName: 'Verification.usp_GetTrusteeVerifyDataList', SQLParams: [
                        { Name: 'TrustId', value: This.TrustId, DBType: 'int' }
                    ]
                };

                var data = This.ExecuteRemoteData(executeParam);
                //console.log(data);
                $.each(data, function (i, val) {
                    data[i].EndTime = data[i].EndTime ? common.getStringDate(data[i].EndTime).dateFormat('yyyy-MM-dd hh:mm') : '-';
                });

                if (data.length > 0) {
                    This.checkEndTime = data[0].EndTime;
                    if (data[0].CriteriaSetCode != null) {
                        var preCode, preName;
                        var targetArr = [];
                        var childArr = [];
                        childArr.push({
                            "VerifyColumn": data[0].VerifyColumn,
                            "VerifyResult": data[0].VerifyResult,
                            "VerifyRow": data[0].VerifyRow,
                            "VerifyType": data[0].VerifyType
                        });
                        preCode = data[0].CriteriaSetCode
                        preName = data[0].CriteriaSetName
                        var ItemObj = { "CriteriaSetCode": preCode, "CriteriaSetName": preName, "ChildArr": childArr };
                        targetArr.push(ItemObj);

                        for (var i = 0; i < data.length; i++) {
                            if (i == 0) {
                                continue
                            }
                            if (preCode == data[i].CriteriaSetCode) {
                                childArr.push({
                                    "VerifyColumn": data[i].VerifyColumn,
                                    "VerifyResult": data[i].VerifyResult,
                                    "VerifyRow": data[i].VerifyRow,
                                    "VerifyType": data[i].VerifyType
                                });
                            } else {
                                childArr = [];
                                childArr.push({
                                    "VerifyColumn": data[i].VerifyColumn,
                                    "VerifyResult": data[i].VerifyResult,
                                    "VerifyRow": data[i].VerifyRow,
                                    "VerifyType": data[i].VerifyType
                                });
                                preCode = data[i].CriteriaSetCode
                                preName = data[i].CriteriaSetName
                                ItemObj = { "CriteriaSetCode": preCode, "CriteriaSetName": preName, "ChildArr": childArr };
                                targetArr.push(ItemObj);
                            }
                        }
                    }
                    This.checkDataList = targetArr;
                }
                //console.log(targetArr);
            },
            ExecuteRemoteData: function (executeParam) {
                var executeParams = encodeURIComponent(JSON.stringify(executeParam));
                var serviceUrl = GlobalVariable.PoolCutServiceURL + 'CommonGet?connName=TaskProcess&exeParams=' + executeParams;
                var sourceData = [];
                $.ajax({
                    cache: false,
                    type: "GET",
                    async: false,
                    //url: GlobalVariable.DataProcessServiceUrl + 'appDomain=Verification&executeParams=' + executeParams + '&resultType=commom',
                    url: serviceUrl,
                    dataType: "json",
                    contentType: "application/xml;charset=utf-8",
                    data: {},
                    success: function (response) {
                        if (typeof response === 'string') { sourceData = JSON.parse(response); }
                        else { sourceData = response; }
                    },
                    error: function (XMLHttpRequest, textStatus, errorThrown) {
                        alert(textStatus);
                    }
                });
                return sourceData;
            },
            PostRemoteDataWithReturn: function (id, callback) {
                var svcUrl = webProxy.dataProcessServiceUrl + "CommonGetExecute?connConfig=TaskProcess&appDomain=Verification&executeParams=";
                var params = [
                    ['trustId', id, 'int']
                ];

                var promise = webProxy.comGetData(params, svcUrl, 'usp_VerifyTrusteeHasVerifyData');
                promise().then(function (response) {
                    if (typeof response === 'string') { poolHeader = JSON.parse(response); }
                    else { poolHeader = response; }
                    if (callback)
                        callback(JSON.parse(response)[0].Column1);
                });
            },
            popupTaskProcessIndicator:function() {
                var trustId = common.getQueryString("TrustId") ? common.getQueryString("TrustId") : "";
                var taskCode = "VerifyTrustInfo"//common.getQueryString("taskCode") ? common.getQueryString("taskCode") : "";

                sVariableBuilder.AddVariableItem('TrustId', trustId, 'String', 1,1,1);
                sVariableBuilder.AddVariableItem('TaskCode', taskCode, 'String',1,1,1);
                //sVariableBuilder.AddVariableItem('CriteriaSetName', criteriaSetname, 'String');
                //sVariableBuilder.AddVariableItem('VerifySourceTable', verifySourceTable, 'String');
                //sVariableBuilder.AddVariableItem('VerifyTargetTable', assetTemplateVerificationTable, 'String');
                //sVariableBuilder.AddVariableItem('excelFilePath', this.sourceFilePath, 'String');

                var sVariable = sVariableBuilder.BuildVariables();
                //console.log(sVariable)
                //var taskCode = 'AssetDataVerificationTask';

                var tIndicator = new taskIndicator({
                    width: 800,
                    height: 550,
                    clientName: 'TaskProcess',
                    appDomain: 'Task',
                    taskCode: taskCode,
                    sContext: sVariable,
                    callback: function () {
                        this.sessionId = sessionStorage.getItem('sessionId');
                        //this.uploadBtn = lang.checksum;
                        //this.uploadBtnDisable = false;
                        window.location.reload();
                    }.bind(this)
                });
                tIndicator.show();
            },
            changeState: function (i) {
                var falg = $(".demo_content .list_demo li").eq(i).find(".taps_bd").css('display');
                if (falg == 'none') {
                    $(".demo_content .list_demo li").eq(i).find(".taps_hd .title i").addClass('cur');
                    $(".demo_content .list_demo li").eq(i).find(".taps_bd").css('display', 'block');
                } else {
                    $(".demo_content .list_demo li").eq(i).find(".taps_hd .title i").removeClass('cur');
                    $(".demo_content .list_demo li").eq(i).find(".taps_bd").css('display', 'none');
                }
            }
        }
    });

    if ($(".list_demo").css('display') == 'block') {
        $(".demo_content .list_demo li .taps_hd .title").click(function (e) {
            e.stopPropagation();
            var falg = $(this).parents('li').find(".taps_bd").css('display');
            if (falg == 'none') {
                $(this).find('i').addClass('cur');
                $(this).parents('li').find(".taps_bd").css('display', 'block');

            } else {
                $(this).find('i').removeClass('cur');
                $(this).parents('li').find(".taps_bd").css('display', 'none');
            }
        });
    }
    $("#table_cont").scroll(function (e) {
        var scrollTop = this.scrollTop;
        $("#table_cont").find("thead").css("transform", "translateY(" + scrollTop + "px)")
    })
})

