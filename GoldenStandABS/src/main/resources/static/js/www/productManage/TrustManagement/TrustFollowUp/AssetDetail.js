var AssetDetailKO = (function () {
    var assetDetailData = [
        { ItemCode: "", ItemValue: "", DataType: "", ItemAliasValue: "" }
        , { ItemCode: "", ItemValue: "", DataType: "", ItemAliasValue: "" }
        , { ItemCode: "", ItemValue: "", DataType: "", ItemAliasValue: "" }
    ];

    var dataFunc = function () {
        this.dataList = [];
    }

    var Init = function () {

    }

    var saveCallBack = function () {
        callImportAssetDataTaskProcess();
    }

    function callImportAssetDataTaskProcess() {
        var trustId = tid;
        var rDate = TrustExtensionNameSpace.GetDateSetListByCode(1, 'ReportingDate');
        var rDateId = rDate.replace(/-/g, '');
        //var Incremental = "1";//TrustExtensionNameSpace.GetDateSetListByCode(1, 'ReportingDate');
        var PeriodType = "M";
        var PeriodNumber = "1";
        var d = stringToDate(rDate);
        var FirstImutationDate = dateToString(new Date(d.setFullYear(d.getFullYear() - 3)));
        var IsMonthEndRule = "0";
        var AccountNo = TrustExtensionNameSpace.GetDateSetListByCode(1, 'AccountNo');

        var sessionVariables = "<SessionVariables>"
            + "<SessionVariable><Name>TrustId</Name><Value>" + trustId + "</Value><DataType>String</DataType><IsConstant>0</IsConstant><IsKey>0</IsKey><KeyIndex>0</KeyIndex></SessionVariable>"
            + "<SessionVariable><Name>PeriodType</Name><Value>" + PeriodType + "</Value><DataType>String</DataType><IsConstant>0</IsConstant><IsKey>0</IsKey><KeyIndex>0</KeyIndex></SessionVariable>"
            + "<SessionVariable><Name>PeriodNumber</Name><Value>" + PeriodNumber + "</Value><DataType>String</DataType><IsConstant>0</IsConstant><IsKey>0</IsKey><KeyIndex>0</KeyIndex></SessionVariable>"
            + "<SessionVariable><Name>FirstImutationDate</Name><Value>" + FirstImutationDate + "</Value><DataType>String</DataType><IsConstant>0</IsConstant><IsKey>0</IsKey><KeyIndex>0</KeyIndex></SessionVariable>"
            + "<SessionVariable><Name>IsMonthEndRule</Name><Value>" + IsMonthEndRule + "</Value><DataType>String</DataType><IsConstant>0</IsConstant><IsKey>0</IsKey><KeyIndex>0</KeyIndex></SessionVariable>"
            + "<SessionVariable><Name>AccountNo</Name><Value>" + AccountNo + "</Value><DataType>String</DataType><IsConstant>0</IsConstant><IsKey>0</IsKey><KeyIndex>0</KeyIndex></SessionVariable>"
            + "</SessionVariables>";

        TaskProcessWProxy.CreateSessionShowTask("Task", sessionVariables, "AdjustAssetInterest");
    }

    return {
        SaveCallBack: saveCallBack
    };
})();

//var SaveCallBack = AssetDetailKO.SaveCallBack;

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

function iframeOnload() {
    var ifm = document.getElementById("iframepage");
    initIframeSrc(ifm);
}

function initIframeSrc(ifm) {
    var loanPaymentDate = TrustExtensionNameSpace.GetDateSetListByCode(1, 'LoanPaymentDate');
    var start = TrustExtensionNameSpace.GetDateSetListByCode(1, 'StartDate');
    var end = TrustExtensionNameSpace.GetDateSetListByCode(1, 'EndDate');
    var dStart = stringToDate(start), dEnd = stringToDate(end), dLoanPaymentDate = stringToDate(loanPaymentDate);
    var iMonth = dEnd.getFullYear() * 12 + dEnd.getMonth() - dStart.getFullYear() * 12 - dStart.getMonth();
    dLoanPaymentDate.setMonth(dLoanPaymentDate.getMonth() + iMonth)
    var loanEndDate = dateToString(dLoanPaymentDate);

    var isInit = (!$(ifm).attr("src") || $(ifm).attr("src").indexOf("?") < 0);
    if (!isInit) {
        var src = $(ifm).attr("src");
        var assetStart = getQueryStringByString("start", src),
            assetEnd = getQueryStringByString("end", src);
        isInit = (assetStart != loanPaymentDate || assetEnd != loanEndDate);
    }

    if (isInit) {
        $(ifm).attr("src", $(ifm).attr("link") + "?trustId=" + tid + "&accountNo=" + accountNo + "&start=" + loanPaymentDate + "&end=" + loanEndDate);
    }
}
function unfoldOnload() {
    var ifm = document.getElementById("unfoldpage");
    initIframeSrc(ifm);
}

var AssetUnfoldKO = (function () {
    var isloaded = false;
    $(function () {
        $('#AssetUnfoldDiv .date-plugins').date_input();
        $('#AssetUnfoldDiv .form-control').change(function () {
            validControlValue($(this));
        });
        $("#save_assetunfold").click(function () {
            var haveError = false;
            $('#AssetUnfoldDiv .form-control').each(function () {
                var $this = $(this);
                if (!validControlValue($this)) { haveError = true; }
            });
            if (haveError) return;

            //保存
            var PoolCloseDate = $.trim($("#AssetUnfoldDiv input[name='PoolCloseDate']").val());
            PoolCloseDate = (PoolCloseDate == '' ? '1900-01-01' : PoolCloseDate);
            var StartDate = $("#AssetUnfoldDiv input[name='StartDate']").val();
            var LoanIssueDate = $("#AssetUnfoldDiv input[name='LoanIssueDate']").val();
            var EndDate = $("#AssetUnfoldDiv input[name='EndDate']").val();
            var RemainTerm = $("#AssetUnfoldDiv input[name='RemainTerm']").val();
            var PayDate = $("#AssetUnfoldDiv input[name='PayDate']").val();
            var SpecifiedAmt = $.trim($("#AssetUnfoldDiv input[name='SpecifiedAmt']").val());
            SpecifiedAmt = (SpecifiedAmt == '' ? '0' : SpecifiedAmt);
            console.log('PoolCloseDate:' + PoolCloseDate + ',SpecifiedAmt:' + SpecifiedAmt);

            var trustId = tid;
            var AccountNo = TrustExtensionNameSpace.GetDateSetListByCode(1, 'AccountNo');
            var PeriodType = "M";
            var PeriodNumber = "1";
            var IsMonthEndRule = "0";
            
            var sessionVariables = "<SessionVariables>"
                + "<SessionVariable><Name>TrustId</Name><Value>" + trustId + "</Value><DataType>String</DataType><IsConstant>0</IsConstant><IsKey>0</IsKey><KeyIndex>0</KeyIndex></SessionVariable>"
                + "<SessionVariable><Name>AccountNo</Name><Value>" + AccountNo + "</Value><DataType>String</DataType><IsConstant>0</IsConstant><IsKey>0</IsKey><KeyIndex>0</KeyIndex></SessionVariable>"
                + "<SessionVariable><Name>EndDate</Name><Value>" + EndDate + "</Value><DataType>String</DataType><IsConstant>0</IsConstant><IsKey>0</IsKey><KeyIndex>0</KeyIndex></SessionVariable>"
                + "<SessionVariable><Name>RemainTerm</Name><Value>" + RemainTerm + "</Value><DataType>String</DataType><IsConstant>0</IsConstant><IsKey>0</IsKey><KeyIndex>0</KeyIndex></SessionVariable>"
                + "<SessionVariable><Name>PayDate</Name><Value>" + PayDate + "</Value><DataType>String</DataType><IsConstant>0</IsConstant><IsKey>0</IsKey><KeyIndex>0</KeyIndex></SessionVariable>"
                + "<SessionVariable><Name>LoanIssueDate</Name><Value>" + LoanIssueDate + "</Value><DataType>String</DataType><IsConstant>0</IsConstant><IsKey>0</IsKey><KeyIndex>0</KeyIndex></SessionVariable>"
                + "<SessionVariable><Name>PeriodType</Name><Value>" + PeriodType + "</Value><DataType>String</DataType><IsConstant>0</IsConstant><IsKey>0</IsKey><KeyIndex>0</KeyIndex></SessionVariable>"
                + "<SessionVariable><Name>PeriodNumber</Name><Value>" + PeriodNumber + "</Value><DataType>String</DataType><IsConstant>0</IsConstant><IsKey>0</IsKey><KeyIndex>0</KeyIndex></SessionVariable>"
                + "<SessionVariable><Name>PoolCloseDate</Name><Value>" + PoolCloseDate + "</Value><DataType>String</DataType><IsConstant>0</IsConstant><IsKey>0</IsKey><KeyIndex>0</KeyIndex></SessionVariable>"
                + "<SessionVariable><Name>IsMonthEndRule</Name><Value>" + IsMonthEndRule + "</Value><DataType>String</DataType><IsConstant>0</IsConstant><IsKey>0</IsKey><KeyIndex>0</KeyIndex></SessionVariable>"
                + "<SessionVariable><Name>SpecifiedAmt</Name><Value>" + SpecifiedAmt + "</Value><DataType>String</DataType><IsConstant>0</IsConstant><IsKey>0</IsKey><KeyIndex>0</KeyIndex></SessionVariable>"
                + "</SessionVariables>";

            TaskProcessWProxy.CreateSessionShowTask("Task", sessionVariables, "AssetUnfold");
        });
    });

    function loadData() {
        if (!isloaded) {
            isloaded = true;
            $("#AssetUnfoldDiv input[name='PoolCloseDate']").val(window.parent.trustPoolCloseDate ? window.parent.trustPoolCloseDate : '');
            $("#AssetUnfoldDiv input[name='StartDate']").val(TrustExtensionNameSpace.GetDateSetListByCode(1, 'StartDate'));
            $("#AssetUnfoldDiv input[name='LoanIssueDate']").val(TrustExtensionNameSpace.GetDateSetListByCode(1, 'LoanIssueDate'));
            $("#AssetUnfoldDiv input[name='EndDate']").val(TrustExtensionNameSpace.GetDateSetListByCode(1, 'EndDate'));
            $("#AssetUnfoldDiv input[name='RemainTerm']").val(TrustExtensionNameSpace.GetDateSetListByCode(1, 'RemainingTerm'));
            //$("#AssetUnfoldDiv input[name='PayDate']").val();
        }
    }

    var TrustMngmtRegxCollection = {
        int: /^([-]?[1-9]+\d*$|^0)?$/,
        decimal: /^([-]?[1-9]+\d*(\.{1}\d+){0,1}$|^[-]{1}0\.\d*[1-9]\d*$|^0(\.\d+)?)?$/,
        date: /^((\d{4})-(\d{2})-(\d{2}))?$/,
        datetime: /^((\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2}))?$/
    };
    function validControlValue(obj) {
        var $this = $(obj);
        var objValue = $this.val();
        var valids = $this.attr('data-valid');
        $this.removeAttr("title");

        //无data-valid属性，不需要验证
        if (!valids || valids.length < 1) { return true; }

        //如果有必填要求，必填验证
        if (valids.indexOf('required') >= 0) {
            if (!objValue || objValue.length < 1) {
                $this.addClass('red-border');
                return false;
            } else {
                $this.removeClass('red-border');
            }
        }
        //暂时只考虑data-valid只包含两个值： 必填和类型
        var dataType = valids.replace('required', '').toLocaleLowerCase().trim();

        //通过必填验证，做数据类型验证
        var regx = TrustMngmtRegxCollection[dataType];
        if (!regx) { return true; }

        if (!regx.test(objValue)) {
            $this.addClass('red-border');
            return false;
        } else {
            $this.removeClass('red-border');
        }

        if (dataType == 'int') {
            var title = '';
            if ($this.attr('data-min') && parseInt($this.attr('data-min')) == $this.attr('data-min')
                && parseInt($this.val()) < parseInt($this.attr('data-min'))) {
                title += (title.length > 0 ? ',且' : '') + '不小于' + $this.attr('data-min');
            }
            if ($this.attr('data-max') && parseInt($this.attr('data-max')) == $this.attr('data-max')
                && parseInt($this.val()) > parseInt($this.attr('data-max'))) {
                title += (title.length > 0 ? ',且' : '') + '不大于' + $this.attr('data-max');
            }
            if (title.length > 0) {
                $this.addClass('red-border');
                $this.attr("title", '输入值需' + title);
                return false;
            }
            else {
                $this.removeClass('red-border');
                $this.removeAttr("title");
            }
        }

        return true;
    }

    return { LoadData: loadData }
})();