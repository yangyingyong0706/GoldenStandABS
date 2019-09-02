define(function (require) {
    var $ = require('jquery');
    require('jquery-ui');
    var GlobalVariable = require('globalVariable');
    require('jquery.datagrid');
    require('jquery.datagrid.options');

    require('jquery.ztree.core');
    require('jquery.ztree.excheck');
    require('jquery.ztree.exedit');
    var FilePathConfig = require('gs/FilePathConfig');
    require('app/productManage/TrustManagement/Common/Scripts/MathCalculate');
    require('date_input');
    var ko = require('knockout');
    var mapping = require('knockout.mapping');
    require('knockout.rendercontrol');
    var number = require('gs/format.number');
    var common = require('common');
    var webProxy = require('gs/webProxy');
    require('anyDialog');
    require('app/components/trustList/js/showModalDialog');

    var svcBaseUrl = GlobalVariable.DataProcessServiceUrl;
    var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
    var svcUrlTaskProcess = GlobalVariable.DataProcessServiceUrl + "CommonGetExecute?connConfig=TaskProcess&";
    var trustId, reportingDate;
    var datagridData = null;
    var zTreePayDate = null;
    var zTreeTrustCode = null;
    var reportType = '';
    //reportType = "Loan";
    //reportType = "MRNR";
    //reportType = "Waterfall";
    var ServiceHostURL = GlobalVariable.TaskProcessEngineServiceHostURL;

    /*********************************
    
    *********************************/
    $(function () {
        init();
        //注册事件
        $('#btnReset').click(function () {
            $('.list-filters .filter').val('');
            zTreePayDate.CheckedAllNodes();
            zTreeTrustCode.CheckedAllNodes(false);

            bindAssetPaymentStatistics(datagridData);
            clearStore();
        });
        $('#btnSearch').click(function () {
            setStore();
            searchList();

        });

        var preTrustCode = '';
        $("#PayDate").click(function () {
            if (preTrustCode != $("#TrustCode").val()) {
                preTrustCode = $("#TrustCode").val();
                bindPayData();
            }
        });
    })
  
    function searchList() {
        var data = getList();
        bindAssetPaymentStatistics(data);
    }
    function getList() {
        var DimReportingDateID = sessionStorage.DateStore.replace(/-/g,'')
        var TrustCodes = sessionStorage.CodeStore
        var executeParam = {
            SPName: 'usp_View_R4Monitor_Concise_New ', SQLParams: [
                { Name: 'MonitorTaskCode', value: 'R4Monitor', DBType: 'string' },
                { Name: 'TrustCodes', value: TrustCodes, DBType: 'string' },
                { Name: 'DimReportingDateID', value: DimReportingDateID, DBType: 'string' }
            ]
        };
        var list = common.ExecuteGetData(false, svcUrlTaskProcess, 'Monitor', executeParam);
        $.each(list, function (i, n) {
            list[i].ReportingEndDate = list[i].ReportingEndDate ? common.getStringDate(list[i].ReportingEndDate).dateFormat('yyyy-MM-dd') : ''
        });
        return list;
    }
   
    var TaskProcessWProxy = (function () {
        function createSessionShowTask(appDomain, sessionVariables, taskCode) {
            var wProxy = new webProxy();
            var sContext = {
                appDomain: appDomain,
                sessionVariables: sessionVariables,
                taskCode: taskCode
            };
            var isOver = 0;
            wProxy.createSessionByTaskCode(sContext, function (response) {
                window.parent.parent.isSessionCreated = true;
                window.parent.parent.sessionID = response;
                window.parent.parent.taskCode = taskCode;
                window.parent.parent.IndicatorAppDomain = appDomain;
                console.log('taskCode:' + taskCode);
                if (window.parent.parent.IsSilverlightInitialized) {
                    window.parent.parent.PopupTaskProcessIndicatorTM();
                    window.parent.parent.InitParams();
                }
                else {
                    window.parent.parent.PopupTaskProcessIndicatorTM();
                }
                isOver = 1;
            });


            var tmpInterval = setInterval(function () {
                if (isOver == 1) {
                    $(window.parent.document).find("#modal-mask").remove();
                    $(window.parent.document).find("#modal-layout").remove();
                    window.clearInterval(tmpInterval);
                }
            }, 10);
        }

        return { CreateSessionShowTask: createSessionShowTask }
    })();
    /*********************************
 
 *********************************/
    function zTreeObj () {
        var treeDomId, $mySelfDom, $menuContent;
        function getMySelfDom() {
            return $mySelfDom;
        }
        var setting = {
            check: {
                enable: true,
                chkboxType: { "Y": "", "N": "" }
            },
            view: {
                dblClickExpand: false
            },
            data: {
                simpleData: {
                    enable: true
                }
            },
            callback: {
                beforeClick: beforeClick,
                onCheck: onCheck
            }
        };

        var zNodes = [];

        function beforeClick(treeId, treeNode) {
            var zTree = $.fn.zTree.getZTreeObj(treeDomId);
            zTree.checkNode(treeNode, !treeNode.checked, null, true);
            return false;
        }

        function onCheck(e, treeId, treeNode) {
            var zTree = $.fn.zTree.getZTreeObj(treeDomId),
            nodes = zTree.getCheckedNodes(true),
            v = "";
            for (var i = 0, l = nodes.length; i < l; i++) {
                v += nodes[i].name + ",";
            }
            if (v.length > 0) v = v.substring(0, v.length - 1);
            var cityObj = $mySelfDom;
            cityObj.prop("value", v);
        }

        function showMenu() {
            $mySelfDom = $(event.target);
            var cityObj = $mySelfDom;
            var cityOffset = $mySelfDom.offset();
            $menuContent.css({ left: cityOffset.left + "px", top: cityOffset.top + cityObj.outerHeight() + "px" }).slideDown("fast");

            $("body").bind("mousedown", onBodyDown);
        }
        function hideMenu() {
            $menuContent.fadeOut("fast");
            $("body").unbind("mousedown", onBodyDown);
        }
        function onBodyDown(event) {
            if (!(event.target.id == "menuBtn" || event.target.id == $mySelfDom.attr('id') || event.target.id == $menuContent.attr('id') || $(event.target).parents("#" + $menuContent.attr('id')).length > 0)) {
                hideMenu();
            }
        }
        function checkedAllNodes(checked) {
            var treeObj = $.fn.zTree.getZTreeObj(treeDomId);
            treeObj.checkAllNodes(checked);
        }
        function init(treeDemoId, zNodes, menuContent) {
            treeDomId = treeDemoId;
            $menuContent = menuContent;
            $.fn.zTree.init($("#" + treeDomId), setting, zNodes);
        }

        return {
            Init: init
            , ShowMenu: showMenu
            , CheckedAllNodes: checkedAllNodes
        }
    }

  

    var approveRibbonButton = '<a class="ms-cui-ctl-large ms-cui-disabled approveRibbonButton" href="javascript:;"><span class="ms-cui-ctl-largeIconContainer"><span class="ms-cui-img-32by32 ms-cui-img-cont-float ms-cui-imageDisabled"><img alt="Approve Report" style="top: -34px;left: -102px;" src="/TrustManagementService/TrustManagement/Dashboard/css/img/formatmap32x32.png" /></span></span><span class="ms-cui-ctl-largelabel">审核通过<br /></span></a>';
    var rejectRibbonButton = '<a class="ms-cui-ctl-large ms-cui-disabled rejectRibbonButton" onclick="return false;" href="javascript:;"><span class="ms-cui-ctl-largeIconContainer"><span class="ms-cui-img-32by32 ms-cui-img-cont-float ms-cui-imageDisabled"><img alt="Reject Report" style="top: -34px;left: -0px;" src="/TrustManagementService/TrustManagement/Dashboard/css/img/formatmap32x32.png" /></span></span><span class="ms-cui-ctl-largelabel">拒绝审核<br /></span></a>';
    var distributeRibbonButton = '<a class="ms-cui-ctl-large ms-cui-disabled distributeRibbonButton" onclick="return false;" href="javascript:;"><span class="ms-cui-ctl-largeIconContainer"><span class="ms-cui-img-32by32 ms-cui-img-cont-float ms-cui-imageDisabled"><img alt="Distribute Report" style="top: -68px;left: -442px;" src="/TrustManagementService/TrustManagement/Dashboard/css/img/formatmap32x32.png" /></span></span><span class="ms-cui-ctl-largelabel">上交报表  <br /></span></a>';
    var generateReportRibbonButton = '<a class="ms-cui-ctl-large ms-cui-disabled generateReportRibbonButton" onclick="return false;" href="javascript:;"><span class="ms-cui-ctl-largeIconContainer"><span class=" ms-cui-img-32by32 ms-cui-img-cont-float ms-cui-imageDisabled"><img alt="Loan Report" style="top: -34px;left: -68px;" src="/TrustManagementService/TrustManagement/Dashboard/css/img/formatmap32x32.png" /></span></span><span class="ms-cui-ctl-largelabel">生成报表 <br /></span></a>';

    var LoanReportRibbonButton = '<a class="ms-cui-ctl-large ms-cui-disabled loanReportRibbonButton" onclick="return false;" href="javascript:;"><span class="ms-cui-ctl-largeIconContainer"><span class=" ms-cui-img-32by32 ms-cui-img-cont-float ms-cui-imageDisabled"><img alt="Latest RBA Loan Report" style="top: -102px;left: -408px;" src="/TrustManagementService/TrustManagement/Dashboard/css/img/formatmap32x32.png" /></span></span><span class="ms-cui-ctl-largelabel">下载兑付兑息报表<br/></span></a>';
    var SecurityReportRibbonButton = '<a class="ms-cui-ctl-large ms-cui-disabled securityReportRibbonButton" onclick="return false;" href="javascript:;"><span class="ms-cui-ctl-largeIconContainer"><span class=" ms-cui-img-32by32 ms-cui-img-cont-float ms-cui-imageDisabled"><img alt="Latest RBA Security Reports" style="top: -102px;left: -408px;" src="/TrustManagementService/TrustManagement/Dashboard/css/img/formatmap32x32.png" /></span></span><span class="ms-cui-ctl-largelabel">下载收益分配报表<br/></span></a>';
    var TransactionReportRibbonButton = '<a class="ms-cui-ctl-large ms-cui-disabled transactionReportRibbonButton" onclick="return false;" href="javascript:;"><span class="ms-cui-ctl-largeIconContainer"><span class=" ms-cui-img-32by32 ms-cui-img-cont-float ms-cui-imageDisabled"><img alt="Latest RBA Transaction Reports" style="top: -102px;left: -408px;" src="/TrustManagementService/TrustManagement/Dashboard/css/img/formatmap32x32.png" /></span></span><span class="ms-cui-ctl-largelabel">下载管理者报表<br /></span></a>';
    var WaterfallReportRibbonButton = '<a class="ms-cui-ctl-large ms-cui-disabled waterfallReportRibbonButton" onclick="return false;" href="javascript:;"><span class="ms-cui-ctl-largeIconContainer"><span class=" ms-cui-img-32by32 ms-cui-img-cont-float ms-cui-imageDisabled"><img alt="Latest RBA Waterfall Reports" style="top: -65px;left: -408px;" src="/TrustManagementService/TrustManagement/Dashboard/css/img/formatmap32x32.png" /></span></span><span class="ms-cui-ctl-largelabel">下载划款指令报表<br /></span></a>';

    var LoanReportSummaryRibbonButton = '<a class="ms-cui-ctl-large ms-cui-disabled loanReportSummaryRibbonButton" onclick="return false;" href="javascript:;"><span class="ms-cui-ctl-largeIconContainer"><span class=" ms-cui-img-32by32 ms-cui-img-cont-float ms-cui-imageDisabled"><img alt="Latest RBA Loan Report Summary" style="top: -102px;left: -408px;" src="/TrustManagementService/TrustManagement/Dashboard/css/img/formatmap32x32.png" /></span></span><span class="ms-cui-ctl-largelabel">Download<br />Loan Report Summary<br /></span></a>';
    var CrossReportSummaryRibbonButton = '<a class="ms-cui-ctl-large ms-cui-disabled crossReportSummaryRibbonButton" onclick="return false;" href="javascript:;"><span class="ms-cui-ctl-largeIconContainer"><span class=" ms-cui-img-32by32 ms-cui-img-cont-float ms-cui-imageDisabled"><img alt="Latest RBA Cross Report Summary" style="top: -102px;left: -408px;" src="/TrustManagementService/TrustManagement/Dashboard/css/img/formatmap32x32.png" /></span></span><span class="ms-cui-ctl-largelabel">Download<br />Cross Report Summary<br /></span></a>';


    var NewHorizontalRule = '<hr>';
    var WhiteSpace = '&nbsp;';
    var IsUserGroupChecked = false;


    //三种颜色
    //var stateColors = { waitAudit: '#FCD5B4', waitHandUp: '#FCD5B4', isOk: '#D8E4BC' }
    //var stateColors = { waitAudit: { 'class': 'table-td waitAudit' }, waitHandUp: { 'class': 'table-td waitHandUp' }, isOk: { 'class': 'table-td isOk' } }
    var stateColors = { waitAudit: 'waitAudit', waitHandUp: 'waitHandUp', isOk: 'isOk' }

    var stateArray = [
    { stateName: '等待生成', sColors: null }
    , { stateName: '等待审核', sColors: stateColors.waitAudit }
    , { stateName: '等待上交', sColors: stateColors.waitHandUp }
    , { stateName: '已上交', sColors: stateColors.isOk }
    , { stateName: '生成出错', sColors: 'stateError' }
    , { stateName: '上交出错', sColors: 'stateError' }
    , { stateName: '审核出错', sColors: 'stateError' }];

    var taskCodeList = [];
    function getStateColorResult(sName) {
        var result;
        $.each(stateArray, function (i, n) {
            if (n.stateName == sName) {
                if (n.sColors)
                    result = n.sColors;
                return false;
            }
        })
        return result;
    }
    function setGridTdColor(tdobj, sName) {
        var adcls = getStateColorResult(sName);
        if (adcls)
            $(tdobj).addClass(adcls);
    }

    function init() {
        initStore();
        
        zTreePayDate = new zTreeObj();
        zTreeTrustCode = new zTreeObj();
        
        bindTrustCode(taskCodeList);
        //绑定兑付日期
        bindPayData();
        if (sessionStorage.DateStore || sessionStorage.CodeStore) {
            searchList();
        }
    }
    function initStore() {
        var taskCode = common.getQueryString('TaskCode');


        var taskCodeArray = [];
        //获取专项计划并绑定
        getTrustCodes(function (list) {
            

            taskCodeList = list;
        });

        if (!taskCode) {
            taskCode = taskCodeList[0].TrustName;
        }
        
        sessionStorage.CodeStore = taskCode;
        $('#TrustCode').val(taskCode);
        
        //taskCodeArray.push(taskCode);
        //getDimReportingEndDateList(taskCodeArray, function (data) {
        //    sessionStorage.DateStore = data[0];
        //    $('#PayDate').val(data[0]);
        //});
    }
    function setStore() {
        sessionStorage.DateStore = $('#PayDate').val();
        sessionStorage.CodeStore = $('#TrustCode').val();
    }
    function clearStore() {
        sessionStorage.clear();
    }

    function getTrustCodes(callback) {
        var executeParam = {
            SPName: 'usp_GetTrustCodes', SQLParams: [
                { Name: 'MonitorTaskCode', value: 'R4Monitor', DBType: 'string' }
            ]
        };
        var data = common.ExecuteGetData(false, svcUrlTaskProcess, 'Monitor', executeParam);
        callback(data);
    }

    function getDimReportingEndDateByTrustCode(trustCode) {
        var executeParam = {
            SPName: 'usp_GetDimReportingEndDateByTrustCode', SQLParams: [
                { Name: 'MonitorTaskCode', value: 'R4Monitor', DBType: 'string' },
                { Name: 'TrustCode', value: trustCode, DBType: 'string' }
            ]
        };
        return common.ExecuteGetData(false, svcUrlTaskProcess, 'Monitor', executeParam);
    }
    function getDimReportingEndDateList(trustArray, callback) {
       
        var data = new Array();
        if (trustArray && trustArray.length > 0) {
            $.each(trustArray, function (i, v) {
                var temp = getDimReportingEndDateByTrustCode(v)
                data=data.concat(temp);
            })
        }
        else {
            var trustCode = null;
            data=getDimReportingEndDateByTrustCode(trustCode);
        }
        $.each(data, function (i, n) {
            n.ReportingEndDate =n.ReportingEndDate ? common.getStringDate(n.ReportingEndDate).dateFormat('yyyy-MM-dd') : ''
        });
        callback(data);
    }
    function sortData(datalist, column, ascOrDesc) {
        ascOrDesc = ascOrDesc ? ascOrDesc : 'asc';
        ascOrDesc = ascOrDesc == 'asc' ? [1, -1] : [-1, 1];
        datalist = datalist.sort(function (b, a) {
            return a[column] > b[column] ? ascOrDesc[0] : ascOrDesc[1];
        });
    }
    //绑定兑付日期
    //function bindPayData(list) {
    function bindPayData() {
        var zNodes = [], tmpCode = [];
        var tcs = $.trim($("#TrustCode").val());
        var tcarray = [];
        if (tcs.length > 0) tcarray = tcs.split(',');
        getDimReportingEndDateList(tcarray, function (list) {
            $.each(list, function (i, n) {
                    zNodes.push({ id: i + 1, pId: 0, name: n.ReportingEndDate });
                    tmpCode.push(n.ReportingEndDate);
            })
            sortData(zNodes, 'name', 'desc');
            zTreePayDate.Init("treePayDate", zNodes, $("#menuContentPayDate"));

            $("#PayDate").bind("click", zTreePayDate.ShowMenu).attr('readonly', 'readonly');
            var dimReprotingDate = list.length>0?list[0].ReportingEndDate:'';
            sessionStorage.DateStore = dimReprotingDate;
            $('#PayDate').val(dimReprotingDate);
        });
       
    }
    //绑定专项计划代码
    function bindTrustCode(list) {
        var zNodes = [], tmpCode = [];
        $.each(list, function (i, n) {
            if ($.inArray(n.TrustName, tmpCode) < 0) {
                zNodes.push({ id: i + 1, pId: 0, name: n.TrustName });
                tmpCode.push(n.TrustName);
            }
        })
        sortData(zNodes, 'name', 'desc');
        zTreeTrustCode.Init("treeTrustCode", zNodes, $("#menuContentTrustCode"));

        $("#TrustCode").bind("click", zTreeTrustCode.ShowMenu).attr('readonly', 'readonly');
    }
    function bindAssetPaymentStatistics(list) {
        //var executeParam = {
        //    SPName: 'usp_GetTaskTemplateItemDetails', SQLParams: [
        //        { Name: 'TrustId', Value: trustId, DBType: 'string' }
        //        , { Name: 'TemplateCode', Value: 'RevolvingPurchase1', DBType: 'string' }
        //        , { Name: 'ReportingDateId', Value: $("#ReportingDateId").val(), DBType: 'int' }
        //    ]
        //};

        //var executeParams = encodeURIComponent(JSON.stringify(executeParam));
        //var sourceData = [];
        //$.ajax({
        //    cache: false,
        //    type: "GET",
        //    async: false,
        //    url: svcUrl + 'appDomain=TrustManagement&executeParams=' + executeParams + '&resultType=commom',
        //    dataType: "json",
        //    contentType: "application/xml;charset=utf-8",
        //    data: {},
        //    success: function (response) {
        //        if (typeof response === 'string') { sourceData = JSON.parse(response); }
        //        else { sourceData = response; }
        //        $.each(sourceData, function (i, n) {
        //            sourceData[i].PayDate = sourceData[i].PayDate ? getStringDate(sourceData[i].PayDate).dateFormat('yyyy-MM-dd') : ''
        //        });
        //        bindAssetPaymentStatisticsList(sourceData);
        //    },
        //    error: function (response) { alert('Error occursed while requiring the remote source data!'); }
        //});
        //return sourceData;
        bindAssetPaymentStatisticsList(list);
    }

    function bindAssetPaymentStatisticsList(data) {
        console.log(data);
        if ($('#divDataList').datagrid("datagrid"))
            $('#divDataList').datagrid("destroy");
        $('#divDataList').datagrid({
            data: data,
            col: [
                {
                    field: "TrustID", title: "专项计划ID", sortable: true, attrHeader: settable.tableTh, attr: settable.tableTd
                    //, render: function (data) { return data.rowindex; }
                },
            {
                field: "TrustName", title: "专项计划代码", sortable: true, attrHeader: settable.tableTh, attr: settable.tableTd
            },
            {
                field: "ReportingEndDate", title: "兑付日期", sortable: true, attrHeader: settable.tableTh, attr: settable.tableTd
                //}, {
                //    field: "WorkFLowState", title: "兑付兑息申请表", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd
                //    , render: function (data) {
                //        if (data) {
                //            setGridTdColor(this, data.value);

                //            var html = '<a style="cursor:pointer" onclick="ShowDialogForTask(\'WorkFLowState\',\'Loan\',\'' + data.value + '\',\'' + data.row.TrustID + '\',\'' + data.row.ReportingEndDate + '\');">' + data.value + '</a>';
                //            return html;
                //        }
                //    }
            }, {
                field: "", title: "兑付兑息", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd
                , render: function (data) {
                    if (data) {
                        var url = GlobalVariable.SslHost + 'WorkFlowEngine/Pages/workflowRun.html?objId={0}_{1}&objType=005'.StringFormat(data.row.TrustID, data.row.ReportingEndDate.replace(/-/g, ''));
                        var html = '<iframe id="workflowFrame" src="{0}" style="display:block;border:none;height:30px;width:230px;padding:0px 3px 0px 3px;"></iframe>'.StringFormat(url);
                        //var html = null;
                        return html;
                    }
                }
            }, {
                field: "", title: "报告", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd
                , render: function (data) {
                    if (data) {
                        var $html = $('<a href="javascript:void(0)" class="ms-cui-disabled">下载</a>');

                        var reportName = getReportFileNameByReportingDate("Loan", "docx", data.row.TrustID, data.row.ReportingEndDate);
                        var filepath = fileIsExistByTid(reportName, data.row.TrustID);
                        if (filepath == true) {
                            var currentReportUrl = FilePathConfig.GetFilePath(data.row.TrustID, 'TaskReportFiles', '', reportName);
                            $html.removeClass('ms-cui-disabled');
                            $html.attr("href", currentReportUrl);
                        }

                        return $html;
                    }
                }
                //}, {
                //    field: "MRNRWorkFlowState", title: "收益分配报告", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd,
                //    render: function (data) {
                //        if (data) {
                //            setGridTdColor(this, data.value);

                //            var html = '<a style="cursor:pointer" onclick="ShowDialogForTask(\'MRNRWorkFlowState\',\'MRNR\',\'' + data.value + '\',\'' + data.row.TrustID + '\',\'' + data.row.ReportingEndDate + '\');">' + data.value + '</a>';
                //            return html;
                //        }
                //    }
                //}, {
                //    field: "WaterfallWorkFlowState", title: "信托报告", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd,
                //    render: function (data) {
                //        if (data) {
                //            setGridTdColor(this, data.value);

                //            var html = '<a style="cursor:pointer" onclick="ShowDialogForTask(\'WaterfallWorkFlowState\',\'Waterfall\',\'' + data.value + '\',\'' + data.row.TrustID + '\',\'' + data.row.ReportingEndDate + '\');">' + data.value + '</a>';
                //            return html;
                //        }
                //    }
            }, {
                field: "", title: "信托报告", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd
                , render: function (data) {
                    if (data) {
                        var url = GlobalVariable.SslHost + 'WorkFlowEngine/Pages/workflowRun.html?objId={0}_{1}&objType=006'.StringFormat(data.row.TrustID, data.row.ReportingEndDate.replace(/-/g, ''));
                        var html = '<iframe id="workflowFrame" src="{0}" style="display:block;float:left;border:none;height:30px;width:230px;padding:0px 3px 0px 3px;"></iframe>'.StringFormat(url);
                        //var html = null;
                        return html;
                    }
                }
            }, {
                field: "", title: "报告", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd
                , render: function (data) {
                    if (data) {
                        var $html = $('<a href="javascript:void(0)" class="ms-cui-disabled">下载</a>');

                        var reportName = getReportFileNameByReportingDate("Waterfall", "docx", data.row.TrustID, data.row.ReportingEndDate);
                        var filepath = fileIsExistByTid(reportName, data.row.TrustID);
                        if (filepath == true) {
                            var currentReportUrl = FilePathConfig.GetFilePath(data.row.TrustID, 'TaskReportFiles', '', reportName);
                            $html.removeClass('ms-cui-disabled');
                            $html.attr("href", currentReportUrl);
                        }

                        return $html;
                    }
                }
            }, {
                field: "", title: "分配指令", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd
                , render: function (data) {
                    if (data) {
                        var url = GlobalVariable.SslHost + 'WorkFlowEngine/Pages/workflowRun.html?objId={0}_{1}&objType=007'.StringFormat(data.row.TrustID, data.row.ReportingEndDate.replace(/-/g, ''));
                        var html = '<iframe id="workflowFrame" src="{0}" style="display:block;float:left;border:none;height:30px;width:230px;padding:0px 3px 0px 3px;"></iframe>'.StringFormat(url);
                        //var html = null;
                        return html;
                    }
                }
            }, {
                field: "", title: "报告", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd
                , render: function (data) {
                    if (data) {
                        var $html = $('<a href="javascript:void(0)" class="ms-cui-disabled">下载</a>');

                        var reportName = getReportFileNameByReportingDate("MRNR", "docx", data.row.TrustID, data.row.ReportingEndDate);
                        var filepath = fileIsExistByTid(reportName, data.row.TrustID);
                        if (filepath == true) {
                            var currentReportUrl = FilePathConfig.GetFilePath(data.row.TrustID, 'TaskReportFiles', '', reportName);
                            $html.removeClass('ms-cui-disabled');
                            $html.attr("href", currentReportUrl);
                        }

                        return $html;
                    }
                }
            }
            ],
            attr: 'mytable',
            paramsDefault: { paging: 10 },
            noData: "<p class='noData'>当前视图没有可显示记录。</p>",
            pagerPosition: "bottom",
            pager: "mypager",
            sorter: "mysorter",
            onComplete: function () {
                $(".mytable").on("click", ".table-td", function () {
                    $(".mytable .table-td").removeClass("active");
                    $(this).addClass("active");
                })
            }
        });
    }
    function ShowDialogForTask(headertmp, rt, header, tid, rd) {
        reportType = rt;
        console.log("reportType：" + reportType);
        trustId = tid;
        reportingDate = rd;
        console.log("reportingDate：" + reportingDate);
        switch (reportType) {
            case "Loan":
                getTargetStateReason(header, "R4.Loan", "Monitor");
                break;
            case "MRNR":
                getTargetStateReason(header, "R4.MRNR", "Monitor");
                break;
            case "Waterfall":
                getTargetStateReason(header, "R4.Waterfall", "Monitor");
                break;
        }
    }

    function getTargetStateReason(stateFrom, workflowCode, appDomain) {
        var serviceUrl = ServiceHostURL + "/WorkflowService.svc/jsAccessEP/GetTargetStateReason";
        //var serviceUrl = GlobalVariable.SslHost + "TaskProcessServices/WorkflowService.svc/jsAccessEP/GetTargetStateReason";
        //indicatorAppDomain_p = appDomain;
        //workflowCode = "R4.Loan";
        //stateFrom = "Pending Distribution";
        serviceUrl = serviceUrl + "?StateFrom=" + stateFrom + "&WorkflowCode=" + workflowCode + "&ApplicationDomain=" + appDomain;
        jQuery.support.cors = true;
        $.ajax(
                {
                    type: "GET",
                    url: serviceUrl,
                    dataType: "jsonp",
                    crossDomain: true,
                    contentType: "application/json;charset=utf-8",
                    success: GetCompleted,
                    error: GetError
                }
            )
    }

    function GetCompleted(response) {
        var json_obj = jQuery.parseJSON(response);
        //console.log(json_obj);
        //return;
        var nextStateHtml = null;
        var nextActions = [];
        var dialogHeaderTxt = "<div style=\'padding:10px 0px 10px 0px;\'>信托: <b>" + trustId + "</b>&nbsp;&nbsp;&nbsp;&nbsp;" + "收款日期: <b>" + reportingDate.replace(/-/g, "") + "</b><div/>";

        $("#statusHeader").html('');
        $("#statusHeader").append(dialogHeaderTxt);
        $("#statusHeader").append('<br />');
        $("#nextStates").html('');
        $("#nextStates").append(generateReportRibbonButton);
        $("#nextStates").append(WhiteSpace);
        $("#nextStates").append(approveRibbonButton);
        $("#nextStates").append(WhiteSpace);
        $("#nextStates").append(distributeRibbonButton);
        $("#nextStates").append(WhiteSpace);
        $("#nextStates").append(rejectRibbonButton);


        switch (reportType) {
            case "Loan":
                $("#nextStates").append(NewHorizontalRule);
                $("#nextStates").append(LoanReportRibbonButton);
                getReportLoan();
                break;
            case "MRNR":
                $("#nextStates").append(NewHorizontalRule);
                $("#nextStates").append(SecurityReportRibbonButton);
                getReportSecurity();
                break;
            case "Waterfall":
                $("#nextStates").append(NewHorizontalRule);
                $("#nextStates").append(WaterfallReportRibbonButton);
                getReportWaterfall();
                break;
        }

        $.each(json_obj, function () {
            SetRibbonButtonVisible(this.NextActionCode);
        });

        $.anyDialog({
            modal: true,
            dialogClass: "TaskProcessDialogClass",
            closeText: "",
            html: $("#targetStateArea").show(),
            height: 250,
            width: 400,
            close: function (event, ui) {
            },
            title: "存续期管理"
        });

    }

    function getReportFileNameByReportingDate(ReportType, reportFormat, tid, ReportingEndDate) {
        if (ReportType == "Loan")
            ReportType = "兑付兑息";
        else if (ReportType == "MRNR")
            ReportType = "分配指令";
        else if (ReportType == "Waterfall")
            ReportType = "资产管理";

        var _trustId = tid;

        var collateralDate = ReportingEndDate.replace(/-/g, "");
        var collateralMonth = collateralDate.substring(4, 6);
        var collateralDay = collateralDate.substring(6);
        var collateralYear = collateralDate.substring(0, 4);

        //var numberOfDaysToAdd = 1;
        //var dPart = reportingDate.split("-");
        //var cDate = new Date(dPart[0], dPart[1] - 1, dPart[2]);
        //var reportDate = cDate.addDays(numberOfDaysToAdd);
        //var reportingYear = reportDate.getFullYear();
        //var reportingMonth = (reportDate.getMonth() + 1).pad(2);

        var reportName = "CMS_" + ReportType + "_" + _trustId + "_" + collateralYear + collateralMonth + collateralDay + "." + reportFormat;

        return reportName;
    }

    function getReportFileName(ReportType, reportFormat) {
        if (ReportType == "Loan")
            ReportType = "兑付兑息";
        else if (ReportType == "MRNR")
            ReportType = "收益分配";
        else if (ReportType == "Waterfall")
            ReportType = "资产管理";

        var _trustId = trustId;

        var collateralDate = reportingDate.replace(/-/g, "");
        var collateralMonth = collateralDate.substring(4, 6);
        var collateralDay = collateralDate.substring(6);
        var collateralYear = collateralDate.substring(0, 4);

        //var numberOfDaysToAdd = 1;
        //var dPart = reportingDate.split("-");
        //var cDate = new Date(dPart[0], dPart[1] - 1, dPart[2]);
        //var reportDate = cDate.addDays(numberOfDaysToAdd);
        //var reportingYear = reportDate.getFullYear();
        //var reportingMonth = (reportDate.getMonth() + 1).pad(2);

        var reportName = "CMS_" + ReportType + "_" + _trustId + "_" + collateralYear + collateralMonth + collateralDay + "." + reportFormat;

        return reportName;
    }

    function getReportLoan() {
        var reportName = getReportFileName("Loan", "zip");
        var filepath = fileIsExist(reportName);
        if (filepath == true) {
            var currentReportUrl = FilePathConfig.GetFilePath(trustId, 'TaskReportFiles', '', reportName)
            $(".loanReportRibbonButton").removeClass("ms-cui-disabled");
            $(".loanReportRibbonButton").unbind();
            $(".loanReportRibbonButton").prop("href", currentReportUrl);
        }
    }

    function getReportSecurity() {
        var reportName = getReportFileName("MRNR", "docx");
        var filepath = fileIsExist(reportName);
        if (filepath == true) {
            var currentReportUrl = FilePathConfig.GetFilePath(trustId, 'TaskReportFiles', '', reportName)
            $(".securityReportRibbonButton").removeClass("ms-cui-disabled");
            $(".securityReportRibbonButton").unbind();
            $(".securityReportRibbonButton").prop("href", currentReportUrl);
        }
    }

    function getReportWaterfall() {
        var reportName = getReportFileName("Waterfall", "docx");
        var filepath = fileIsExist(reportName);
        if (filepath == true) {
            var currentReportUrl = FilePathConfig.GetFilePath(trustId, 'TaskReportFiles', '', reportName)
            $(".waterfallReportRibbonButton").removeClass("ms-cui-disabled");
            $(".waterfallReportRibbonButton").unbind();
            $(".waterfallReportRibbonButton").prop("href", currentReportUrl);
        }
    }

    function fileIsExistByTid(reportName, tid) {
        var bRet = false;
        var filepath = FilePathConfig.GetFileRelativePath(tid, 'TaskReportFiles', '', reportName);
        $.ajax({
            url: svcBaseUrl + '/FileIsExist?FileRelativePath=' + encodeURIComponent(filepath)
            , async: false
            , cache: false
            , type: 'GET'
            , dataType: 'text'
            , contentType: "application/xml;charset=utf-8"
            , success: function (text) {
                if (text == 'true') { bRet = true; }
            }
            , error: function () {
                alert('get FileIsExist wcf wrror');
            }
        })
        return bRet;
    }

    function fileIsExist(reportName, tid) {
        var bRet = false;
        var filepath = FilePathConfig.GetFileRelativePath(trustId, 'TaskReportFiles', '', reportName);
        $.ajax({
            url: svcBaseUrl + '/FileIsExist?FileRelativePath=' + encodeURIComponent(filepath)
            , async: false
            , cache: false
            , type: 'GET'
            , dataType: 'text'
            , contentType: "application/xml;charset=utf-8"
            , success: function (text) {
                if (text == 'true') { bRet = true; }
            }
            , error: function () {
                alert('get FileIsExist wcf wrror');
            }
        })
        return bRet;
    }

    function SetRibbonButtonVisible(actionCode) {
        IsUserGroupChecked = true;

        if (actionCode.indexOf("CTM") > 0) {
            // RBALoanCTM, RBAMRNRCTM
            //if (currentUserIsOperator) {
            $(".generateReportRibbonButton").removeClass("ms-cui-disabled");
            $(".generateReportRibbonButton").unbind();
            $(".generateReportRibbonButton").bind("click", function () { NextRun(actionCode); });
            //}
        }
        else if (actionCode.indexOf("Approval") > 0) {
            // RBALoanApproval, RBAMRNRApproval
            //if (currentUserIsApprover) {
            $(".approveRibbonButton").removeClass("ms-cui-disabled");
            $(".approveRibbonButton").unbind();
            $(".approveRibbonButton").bind("click", function () { NextRun(actionCode); });
            //}
        }
        else if (actionCode.indexOf("Reject") > 0) {
            // RBALoanReject, RBAMRNRReject
            //if (currentUserIsApprover) {
            $(".rejectRibbonButton").removeClass("ms-cui-disabled");
            $(".rejectRibbonButton").unbind();
            $(".rejectRibbonButton").bind("click", function () { NextRun(actionCode); });
            //}
        }
        else if (actionCode.indexOf("Distribution") > 0) {
            // RBALoanDistribution, RBAMRNRDistribution
            //if (currentUserIsApprover){
            $(".distributeRibbonButton").removeClass("ms-cui-disabled");
            $(".distributeRibbonButton").unbind();
            $(".distributeRibbonButton").bind("click", function () { NextRun(actionCode); });
            //}
        }

    }

    function GetError(response) {
        // error occured
    }

    function NextRun(nextActionTaskCode) {
        switch (reportType) {
            case "Loan":
                LoadLoans(nextActionTaskCode);
                break;
            case "MRNR":
                if (nextActionTaskCode.indexOf("CTM") > 0) {
                    RBAReport_MRNRReport(nextActionTaskCode);
                    //RBATrustID = $("#h_TrustId").val();
                    //reportingDate = $("#h_ReportingDate").val();
                    //OpenDialog_SecurityTransactionReport_WithParameters(RBATrustID, reportingDate);
                    break;
                }
                else {
                    RBAReport_MRNRReport(nextActionTaskCode);
                    break;
                }
            case "Waterfall":
                if (nextActionTaskCode.indexOf("CTM") > 0) {
                    RBAWaterfallReport(nextActionTaskCode);
                    //RBATrustID = $("#h_TrustId").val();
                    //reportingDate = $("#h_ReportingDate").val();
                    //OpenDialog_WaterfallReport_WithParameters(RBATrustID, reportingDate);
                    break;
                }
                else {
                    RBAWaterfallReport(nextActionTaskCode);
                    break;
                }
        }
    }

    function LoadLoans(_taskCode) {
        var RBATrustID = trustId;
        var rDate = reportingDate.replace(/-/g, "");

        var sessionVariables_p = '<SessionVariables>' +

                                 '<SessionVariable>' +
                                     '<Name>TrustId</Name>' +
                                     '<Value>' + RBATrustID + '</Value>' +
                                     '<DataType>String</DataType>' +
                                     '<IsConstant>1</IsConstant>' +
                                     '<IsKey>0</IsKey>' +
                                     '<KeyIndex>0</KeyIndex>' +
                                 '</SessionVariable>' +
                                 '<SessionVariable>' +
                                     '<Name>DimReportingDateId</Name>' +
                                     '<Value>' + rDate + '</Value>' +
                                     '<DataType>Int</DataType>' +
                                     '<IsConstant>1</IsConstant>' +
                                     '<IsKey>0</IsKey>' +
                                     '<KeyIndex>0</KeyIndex>' +
                                 '</SessionVariable>' +
                                 '<SessionVariable>' +
                                     '<Name>RBAReportType</Name>' +
                                     '<Value>' + reportType + '</Value>' +
                                     '<DataType>String</DataType>' +
                                     '<IsConstant>1</IsConstant>' +
                                     '<IsKey>0</IsKey>' +
                                     '<KeyIndex>0</KeyIndex>' +
                                 '</SessionVariable>' +
                                  '<SessionVariable>' +
                                     '<Name>TaskCode</Name>' +
                                     '<Value>' + _taskCode + '</Value>' +
                                     '<DataType>String</DataType>' +
                                     '<IsConstant>1</IsConstant>' +
                                     '<IsKey>0</IsKey>' +
                                     '<KeyIndex>0</KeyIndex>' +
                                 '</SessionVariable>' +
                             '</SessionVariables>';

        taskCode = _taskCode;
        TaskProcessWProxy.CreateSessionShowTask("Task", sessionVariables_p, taskCode);
    }

    function RBAReport_MRNRReport(_taskCode) {
        var RBATrustID = trustId;
        var rDate = reportingDate.replace(/-/g, "");
        var sessionVariables_p = '<SessionVariables>' +
                                  '<SessionVariable>' +
                                  '<Name>DimReportingDateId</Name>' +
                                 '<Value>' + rDate + '</Value>' +
                                 '<DataType>Int</DataType>' +
                                 '<IsConstant>1</IsConstant>' +
                                 '<IsKey>0</IsKey>' +
                                 '<KeyIndex>0</KeyIndex>' +
                                 '</SessionVariable>' +

                                 '<SessionVariable>' +
                                 '<Name>TrustId</Name>' +
                                 '<Value>' + RBATrustID + '</Value>' +
                                 '<DataType>String</DataType>' +
                                 '<IsConstant>1</IsConstant>' +
                                 '<IsKey>0</IsKey>' +
                                 '<KeyIndex>0</KeyIndex>' +
                                 '</SessionVariable>' +

                                  '<SessionVariable>' +
                                     '<Name>TaskCode</Name>' +
                                     '<Value>' + _taskCode + '</Value>' +
                                     '<DataType>String</DataType>' +
                                     '<IsConstant>1</IsConstant>' +
                                     '<IsKey>0</IsKey>' +
                                     '<KeyIndex>0</KeyIndex>' +
                                 '</SessionVariable>' +

                                 //'<SessionVariable>' +
                                 //'<Name>SourceFileURL</Name>' +
                                 //'<Value>' + location.protocol + "//" + location.host + currentFilePath + '</Value>' +
                                 //'<DataType>String</DataType>' +
                                 //'<IsConstant>0</IsConstant>' +
                                 //'<IsKey>0</IsKey>' +
                                 //'<KeyIndex>0</KeyIndex>' +
                                 //'</SessionVariable>' +

                                 //'<SessionVariable>' +
                                 //    '<Name>UserId</Name>' +
                                 //    '<Value>' + currentUser.get_loginName() + '</Value>' +
                                 //    '<DataType>String</DataType>' +
                                 //    '<IsConstant>0</IsConstant>' +
                                 //    '<IsKey>0</IsKey>' +
                                 //    '<KeyIndex>0</KeyIndex>' +
                                 //'</SessionVariable>' +

                                  '</SessionVariables>';
        taskCode = _taskCode;
        TaskProcessWProxy.CreateSessionShowTask("Task", sessionVariables_p, taskCode);
    }

    function RBAWaterfallReport(_taskCode) {
        var RBATrustID = trustId;
        var rDate = reportingDate.replace(/-/g, "");
        var sessionVariables_p = '<SessionVariables>' +
                                  '<SessionVariable>' +
                                  '<Name>DimReportingDateId</Name>' +
                                 '<Value>' + rDate + '</Value>' +
                                 '<DataType>Int</DataType>' +
                                 '<IsConstant>1</IsConstant>' +
                                 '<IsKey>0</IsKey>' +
                                 '<KeyIndex>0</KeyIndex>' +
                                 '</SessionVariable>' +

                                 '<SessionVariable>' +
                                 '<Name>TrustId</Name>' +
                                 '<Value>' + RBATrustID + '</Value>' +
                                 '<DataType>String</DataType>' +
                                 '<IsConstant>1</IsConstant>' +
                                 '<IsKey>0</IsKey>' +
                                 '<KeyIndex>0</KeyIndex>' +
                                 '</SessionVariable>' +

                                  '<SessionVariable>' +
                                     '<Name>TaskCode</Name>' +
                                     '<Value>' + _taskCode + '</Value>' +
                                     '<DataType>String</DataType>' +
                                     '<IsConstant>1</IsConstant>' +
                                     '<IsKey>0</IsKey>' +
                                     '<KeyIndex>0</KeyIndex>' +
                                 '</SessionVariable>' +

                                 //'<SessionVariable>' +
                                 //    '<Name>UserId</Name>' +
                                 //    '<Value>' + currentUser.get_loginName() + '</Value>' +
                                 //    '<DataType>String</DataType>' +
                                 //    '<IsConstant>0</IsConstant>' +
                                 //    '<IsKey>0</IsKey>' +
                                 //    '<KeyIndex>0</KeyIndex>' +
                                 //'</SessionVariable>' +

                                  '</SessionVariables>';
        taskCode = _taskCode;
        TaskProcessWProxy.CreateSessionShowTask("Task", sessionVariables_p, taskCode);
    }

    function CreateSessionCompleted(response) {
        //sessionID = response;
        ////alert("sessionID: " + sessionID );
        ////alert("task Code: " + taskCode );
        //PopupTaskProcessIndicator();
        //if (IsSilverlightInitialized) {
        //    InitParams();
        //}
    }

    var IsSilverlightInitialized = false;

    function CreateSessionError(response) {

    }

    var clientName = 'TaskProcess';







    //完成
    function SaveAssetPaymentStatus(Id) {
        var item = '';
        item += '<item>';
        item += '<{0}>{1}</{0}>'.StringFormat('Id', Id);
        item += '<{0}>{1}</{0}>'.StringFormat('Status', '完成');

        item += '</item>';
        console.log(item);
        var executeParam = {
            SPName: 'usp_UpdatetblTrustTaskTemplateItemDetails', SQLParams: [
                { Name: 'items', value: item, DBType: 'xml' }
            ]
        };

        SaveAssetPaymentData(executeParam);
    }
    //保存
    function SaveAssetPayment(Id, index) {
        var rowfile = $("#divDataList *[rowIndex='" + index + "'][type='file']:visible");
        var argTemplate = 'appDomain=TrustManagement&TrustOriginatorId={0}&TrustId={1}'
                    + '&FolderName={2}&FileName={3}';
        if (rowfile.length > 0 && rowfile.val().length > 0) {
            var filePath = rowfile.val();
            var FileName = filePath.substring(filePath.lastIndexOf('\\') + 1);
            var args = argTemplate.format(encodeURIComponent(Id),
            encodeURIComponent(trustId),
            encodeURIComponent("tblTaskTemplateItemDetails"),
            encodeURIComponent(FileName));

            var fileData = rowfile[0].files[0];
            uploadAssetFile(args, fileData, Id, index, saveData, operate.save);
        }
        else {
            alert('文件不能为空');
        }
        //saveData();
    }
    var operate = {
        del: 0,     //删除
        save: 1     //保存
    }

    function saveData(Id, index, oper) {
        var rows = $("#divDataList *[rowIndex='" + index + "']:visible");
        //if (rows.length > 0) {

        var item = '';
        item += '<item>';
        item += '<{0}>{1}</{0}>'.StringFormat('Id', Id);
        if (oper == 1) {
            item += '<{0}>{1}</{0}>'.StringFormat('Status', '完成');
        } else if (oper == 0) {
            item += '<{0}>{1}</{0}>'.StringFormat('Status', '未完成');
        }

        $.each(rows, function (i, n) {
            if (n.tagName == 'INPUT') {
                if ($(n).attr('type') == 'text' || $(n).attr('type') == 'file') {
                    var filepath = $(n).val().length > 0 ? $(n).val() : $(n).attr('init');
                    var filename = filepath.length > 0 ? filepath.substring(filepath.lastIndexOf('\\') + 1) : '';
                    item += '<{0}>{1}</{0}>'.StringFormat($(n).attr("name"), filename);
                }
                if ($(n).attr('type') == 'checkbox')
                    item += '<{0}>{1}</{0}>'.StringFormat($(n).attr("name"), $(n).attr('checked') ? 1 : 0);
            }
            else if (n.tagName == 'A')
                item += '<{0}>{1}</{0}>'.StringFormat($(n).attr("name"), $(n).attr('value'));
        });
        item += '</item>';
        console.log(item);
        var executeParam = {
            SPName: 'usp_UpdatetblTrustTaskTemplateItemDetails', SQLParams: [
                { Name: 'items', value: item, DBType: 'xml' }
            ]
        };

        SaveAssetPaymentData(executeParam);
        //}
    }

    function SaveAssetPaymentData(executeParam) {
        common.ExecuteGetData(true, svcUrl, 'TrustManagement', executeParam, function (data) {
            if (data[0].Result == 1) { alert('操作成功'); bindAssetPaymentStatistics(); }
            else if (data[0].Result == 0) alert('操作失败');
            else if (data[0].Result == 2) alert('未找到该条数据');
        });
    }

    var uploadAssetFile = function (args, fileData, Id, index, callback, oper) {
        $.ajax({
            url: GlobalVariable.DataProcessServiceUrl + 'UploadOriginatorFile?' + args,
            type: 'POST',
            data: fileData,
            cache: false,
            dataType: 'json',
            processData: false, // Don't process the files
            //contentType: "application/octet-stream", // Set content type to false as jQuery will tell the server its a query string request
            success: function (data) {
                if (callback) {
                    callback(Id, index, oper);
                }
            },
            error: function (data) {
                alert('文件上传出现错误');
            }
        });
    }
    function callRunTaskProcess(taskCode, itemDetailId) {
        var sessionVariables = "<SessionVariables>"
            + "<SessionVariable><Name>SPName</Name><Value>" + "Task.usp_Deplay" + "</Value><DataType>String</DataType><IsConstant>0</IsConstant><IsKey>0</IsKey><KeyIndex>0</KeyIndex></SessionVariable>"
            + "<SessionVariable><Name>duration</Name><Value>" + "00:00:01" + "</Value><DataType>String</DataType><IsConstant>0</IsConstant><IsKey>0</IsKey><KeyIndex>0</KeyIndex></SessionVariable>"
            + "<SessionVariable><Name>ConnectionString</Name><Value>" + "Data Source=mssql;Initial Catalog=TaskProcess;Integrated Security=SSPI;" + "</Value><DataType>String</DataType><IsConstant>0</IsConstant><IsKey>0</IsKey><KeyIndex>0</KeyIndex></SessionVariable>"
            + "<SessionVariable><Name>Id</Name><Value>" + itemDetailId + "</Value><DataType>String</DataType><IsConstant>0</IsConstant><IsKey>0</IsKey><KeyIndex>0</KeyIndex></SessionVariable>"
            + "</SessionVariables>";

        TaskProcessWProxy.CreateSessionShowTask("Task", sessionVariables, taskCode);
    }

    function WorkFlowSessionVariables(id, type) {
        if (type == '005')
            return { TrustId: id.substr(0, id.lastIndexOf('_')), DimReportingDateId: id.substr(id.lastIndexOf('_') + 1), RBAReportType: 'Loan', TAMessage: '' };//, RBAReportType: 'Loan', TaskCode: 'RBALoanCTM'
        else if (type == '006')
            return { TrustId: id.substr(0, id.lastIndexOf('_')), DimReportingDateId: id.substr(id.lastIndexOf('_') + 1), RBAReportType: 'Waterfall', TAMessage: '' };//, RBAReportType: 'Loan', TaskCode: 'RBALoanCTM'
        else if (type == '007')
            return { TrustId: id.substr(0, id.lastIndexOf('_')), DimReportingDateId: id.substr(id.lastIndexOf('_') + 1), RBAReportType: 'MRNR', TAMessage: '' };
    }
    function WorkFlowCallBack(id, type) {
        searchList();
    }


})