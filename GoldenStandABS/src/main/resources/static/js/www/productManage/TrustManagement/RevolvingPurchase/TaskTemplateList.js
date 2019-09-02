var svcUrl = GlobalVariable.DataProcessServiceUrl+"CommonExecuteGet?";

//var trustId = getQueryString('trustId');

$(function () {
    init();
});
function init() {
    if (!trustId || trustId == 0 || isNaN(trustId)) {
        return;
    }
    
    GetPeriodData(function (list) {
        if (list) {
            var html = '';//'<option value="all">所有</option>';
            $.each(list, function (i, item) {
                var t = item.EndDate ? getStringDate(item.StartDate).dateFormat('yyyyMMdd') : '';//yyyy-MM-dd
                var t2 = item.EndDate ? getStringDate(item.EndDate).dateFormat('yyyyMMdd') : '';//yyyy-MM-dd
                html += '<option value="' + t + '">' + t + "-" + t2 + '</option>';
            });
            $('#ReportingDateId').html(html);
            $('#ReportingDateId').change(function () {
                bindAssetPaymentStatistics();
            })
            bindAssetPaymentStatistics();
        }
    });
}
function GetPeriodData(callback) {
    var executeParam = {
        SPName: 'usp_GetTrustPeriod', SQLParams: [
            { Name: 'TrustId', value: trustId, DBType: 'int' },
            { Name: 'TrustPeriodType', value: 'RevolvingPurchaseDate_CF', DBType: 'string' }
        ]
    };
    var data = ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam);
    callback(data);
}
function bindAssetPaymentStatistics() {
    var executeParam = {
        SPName: 'usp_GetTaskTemplateItemDetails', SQLParams: [
            { Name: 'TrustId', Value: trustId, DBType: 'string' }
            , { Name: 'TemplateCode', Value: 'RevolvingPurchase1', DBType: 'string' }
            , { Name: 'ReportingDateId', Value: $("#ReportingDateId").val(), DBType: 'int' }
        ]
    };

    var executeParams = encodeURIComponent(JSON.stringify(executeParam));
    var sourceData = [];
    $.ajax({
        cache: false,
        type: "GET",
        async: false,
        url: svcUrl + 'appDomain=TrustManagement&executeParams=' + executeParams + '&resultType=commom',
        dataType: "json",
        contentType: "application/xml;charset=utf-8",
        data: {},
        success: function (response) {
            if (typeof response === 'string') { sourceData = JSON.parse(response); }
            else { sourceData = response; }
            $.each(sourceData, function (i, n) {
                sourceData[i].PayDate = sourceData[i].PayDate ? getStringDate(sourceData[i].PayDate).dateFormat('yyyy-MM-dd') : ''
            });
            bindAssetPaymentStatisticsList(sourceData);
        },
        error: function (response) { alert('Error occursed while requiring the remote source data!'); }
    });
    return sourceData;
}

function bindAssetPaymentStatisticsList(data) {
    if ($('#divDataList').datagrid("datagrid"))
        $('#divDataList').datagrid("destroy");
    $('#divDataList').datagrid({
        data: data,
        col: [
            {
                field: "", title: "步骤", sortable: true, attrHeader: settable.tableTh, attr: settable.tableTd
            , render: function (data) { return data.rowindex; }
            },
        {
            field: "TemplateItem", title: "循环购买相关条目", sortable: true, attrHeader: settable.tableTh, attr: settable.tableTd
        },
        { field: "TemplateItemDetail", title: "循环购买相关条目明细", sortable: true, attrHeader: settable.tableTh, attr: settable.tableTd }
        , {
            field: "Status", title: "状态", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd
            //,render: function (data) {
            //    var html = '<input type="checkbox" name="Status" rowIndex="{1}" {0} />'.StringFormat(data.value == '1' ? 'checked="checked"' : '', data.rowindex);
            //    return html;
            //}
        }, {
            field: "FilePath", title: "文件", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd,
            render: function (data) {
                if (data.row.IsFileRequired) {
                    var $html = $('<div class="template" />');
                    var tmp;
                    var isshow = true;
                    if (data.row.FilePath) {
                        tmp = $('<span class="mainform"><a href="{0}" name="FilePath" value="{1}" rowIndex="{2}" target="_blank">{1}</a></span>'.StringFormat(data.value ? (FilePathConfig.GetFilePath(trustId, "tblTaskTemplateItemDetails", data.row.Id, data.value)) : '', data.value, data.rowindex));
                        $html.append(tmp);
                        tmp = $(' <a style="cursor: pointer;">更新</a>').click(function () {
                            var $this = $(this).prev();
                            $this.hide().next().hide().next().show().next().show().next().show();
                        });
                        $html.append(tmp);
                        isshow = false;
                    }
                    tmp = $('<input type="file" name="FilePath" rowIndex="{1}" class="mainform" init="{0}" />'.StringFormat(data.value ? data.value : '', data.rowindex));
                    if (isshow == false) tmp.hide();
                    $html.append(tmp);
                    tmp = $(' <a style="cursor: pointer;">返回</a>').hide().click(function () {
                        var $this = $(this);
                        $this.prev().hide().prevAll().show();
                        $this.hide();
                    });
                    //if (isshow == false) tmp.show();
                    $html.append(tmp);
                    tmp = $(' <a style="cursor: pointer;">删除</a>').click(function () {
                        if (confirm("确定删除吗？")) {
                            var $this = $(this);
                            $this.prev().hide().prev().show().prev().hide().prev().hide();
                            $this.prev().prev().val('').attr('init', '');
                            saveData(data.row.Id, data.rowindex,operate.del);
                        }
                    });
                    $html.append(tmp);
                    return $html;
                }
                else
                    return '';
            }
        }
            , {
                field: "", title: "操作", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd
                , render: function (data) {
                    var $html = $('<div class="do" />');
                    var havesave = false;
                    if (data.row.IsFileRequired) {
                        var $save = $('<a style="cursor:pointer" onclick="SaveAssetPayment(\'' + data.row.Id + '\',' + data.rowindex + ');">保存</a>');
                        $html.append($save); havesave = true;
                    }

                    if (data.row.TaskCode != undefined && data.row.TaskCode != "") {
                        $html.append($('<a style="cursor:pointer" rowIndex="' + data.rowindex + '" onclick="callRunTaskProcess(\'' + data.row.TaskCode + '\',\'' + data.row.Id + '\');">执行</a>'));
                        havesave = true;
                    }
                    if (havesave == false)
                        $html.append($('<a style="cursor:pointer" onclick="SaveAssetPaymentStatus(\'' + data.row.Id + '\');">完成</a>'));

                    return $html;
                }
            }
        ],
        attr: 'mytable',
        paramsDefault: { paging: 30 },
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

function saveData(Id,index,oper) {
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
    ExecuteGetData(true, svcUrl, 'TrustManagement', executeParam, function (data) {
        if (data[0].Result == 1) { alert('操作成功'); bindAssetPaymentStatistics(); }
        else if (data[0].Result == 0) alert('操作失败');
        else if (data[0].Result == 2) alert('未找到该条数据');
    });
}

var uploadAssetFile = function (args, fileData,Id,index,callback,oper) {
    $.ajax({
        url: GlobalVariable.DataProcessServiceUrl+'UploadOriginatorFile?' + args,
        type: 'POST',
        data: fileData,
        cache: false,
        dataType: 'json',
        processData: false, // Don't process the files
        //contentType: "application/octet-stream", // Set content type to false as jQuery will tell the server its a query string request
        success: function (data) {
            if (callback) {
                callback(Id,index,oper);
            }
        },
        error: function (data) {
            alert('文件上传出现错误');
        }
    });
}
function callRunTaskProcess(taskCode, itemDetailId) {
    //var trustId = tid;
    //var rDate = TrustExtensionNameSpace.GetDateSetListByCode(1, 'ReportingDate');
    //var rDateId = rDate.replace(/-/g, '');
    ////var Incremental = "1";//TrustExtensionNameSpace.GetDateSetListByCode(1, 'ReportingDate');
    //var PeriodType = "M";
    //var PeriodNumber = "1";
    //var d = stringToDate(rDate);
    //var FirstImutationDate = dateToString(new Date(d.setFullYear(d.getFullYear() - 3)));
    //var IsMonthEndRule = "0";
    //var AccountNo = TrustExtensionNameSpace.GetDateSetListByCode(1, 'AccountNo');

    //var sessionVariables = "<SessionVariables>"
    //    + "<SessionVariable><Name>TrustId</Name><Value>" + trustId + "</Value><DataType>String</DataType><IsConstant>0</IsConstant><IsKey>0</IsKey><KeyIndex>0</KeyIndex></SessionVariable>"
    //    + "<SessionVariable><Name>PeriodType</Name><Value>" + PeriodType + "</Value><DataType>String</DataType><IsConstant>0</IsConstant><IsKey>0</IsKey><KeyIndex>0</KeyIndex></SessionVariable>"
    //    + "<SessionVariable><Name>PeriodNumber</Name><Value>" + PeriodNumber + "</Value><DataType>String</DataType><IsConstant>0</IsConstant><IsKey>0</IsKey><KeyIndex>0</KeyIndex></SessionVariable>"
    //    + "<SessionVariable><Name>FirstImutationDate</Name><Value>" + FirstImutationDate + "</Value><DataType>String</DataType><IsConstant>0</IsConstant><IsKey>0</IsKey><KeyIndex>0</KeyIndex></SessionVariable>"
    //    + "<SessionVariable><Name>IsMonthEndRule</Name><Value>" + IsMonthEndRule + "</Value><DataType>String</DataType><IsConstant>0</IsConstant><IsKey>0</IsKey><KeyIndex>0</KeyIndex></SessionVariable>"
    //    + "<SessionVariable><Name>AccountNo</Name><Value>" + AccountNo + "</Value><DataType>String</DataType><IsConstant>0</IsConstant><IsKey>0</IsKey><KeyIndex>0</KeyIndex></SessionVariable>"
    //    + "</SessionVariables>";
    var sessionVariables = "<SessionVariables>"
        + "<SessionVariable><Name>SPName</Name><Value>" + "Task.usp_Deplay" + "</Value><DataType>String</DataType><IsConstant>0</IsConstant><IsKey>0</IsKey><KeyIndex>0</KeyIndex></SessionVariable>"
        + "<SessionVariable><Name>duration</Name><Value>" + "00:00:01" + "</Value><DataType>String</DataType><IsConstant>0</IsConstant><IsKey>0</IsKey><KeyIndex>0</KeyIndex></SessionVariable>"
        + "<SessionVariable><Name>ConnectionString</Name><Value>" + "Data Source=mssql;Initial Catalog=TaskProcess;Integrated Security=SSPI;" + "</Value><DataType>String</DataType><IsConstant>0</IsConstant><IsKey>0</IsKey><KeyIndex>0</KeyIndex></SessionVariable>"
        + "<SessionVariable><Name>Id</Name><Value>" + itemDetailId + "</Value><DataType>String</DataType><IsConstant>0</IsConstant><IsKey>0</IsKey><KeyIndex>0</KeyIndex></SessionVariable>"
        + "</SessionVariables>";

    TaskProcessWProxy.CreateSessionShowTask("Task", sessionVariables, taskCode);
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




