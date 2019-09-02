
var CategoryId = getQueryString("CategoryId") ? getQueryString("CategoryId") : "";

var configCategory = {
    
    LanguageList: [
        { key: 'zh-CN', value: '中文' }
        , { key: 'en-US', value: '英文' }
    ]    
    , sContent: {
        'SPName': 'usp_GetCategoryInfo', 'SQLParams': [
         { 'Name': 'CategoryIdId', 'Value': CategoryId, 'DBType': 'int' }
        ]
    }
    , svcUrl: GlobalVariable.DataProcessServiceUrl+"CommonExecuteGet?"
}


function getData() {
    var sContent = JSON.stringify(configCategory.sContent);
    var tmsDataProcessBase = GlobalVariable.DataProcessServiceUrl;
    var serviceUrl = tmsDataProcessBase + 'CommonExecuteGet?appDomain=TrustManagement&executeParams=' +
        sContent + "&resultType=com";

    $.ajax({
        type: "GET",
        url: serviceUrl,
        dataType: "jsonp",
        crossDomain: true,
        contentType: "application/xml;charset=utf-8",
        data: {},
        beforeSend: function () {
            $('#loading').fadeOut();
        },
        success: function (response) {
            if (typeof response == "string")
                response = JSON.parse(response);
            console.log(response);
            BindData(response);
            AfterBindData();
        },
        error: function (response) { alert("error:" + response); }
    });
}
function IsRequiredChange(obj, b) {
    var doms = $(obj).parent().parent().nextAll()
    if (b)
        doms.show();
    else
        doms.hide();
}
function BindData(data) {
    if (data.length > 0) {
        $("#CategoryDetailFrom input[id='CategoryCode']").attr("disabled", "disabled");
    }
    else {
        return;
    }
    $("#CategoryDetailFrom .form-item").each(function (i, n) {
        var code = $(n).attr("id");
        var type = $(n).attr("type");
        if (data[code]) {
            if (type == "checkbox")
                $(n).attr("checked", data[code]);
            else
                $(n).val(data[code]);
        }
    })
}
function saveData() {
    var haveError = false;
    $("#CategoryDetailFrom .form-item[data-valid]").each(function () {
        var $this = $(this);
        if (!CommonValidation.ValidControlValue($this)) { haveError = true; }
    });
    if (haveError) return;
   
    var categorycode = $("#CategoryCode").val();
    var categoryvalue = $("#CategoryValue").val();
    var sequenceno = $("#SequenceNo").val();
    var executeParam = {
        SPName: 'usp_Insert_ItemCategory', SQLParams: [
              { Name: 'CategoryCode', value: categorycode, DBType: 'string' },
              { Name: 'CategoryValue', value: categoryvalue, DBType: 'string' },
              { Name: 'SequenceNo', value: sequenceno == "" ? null : sequenceno, DBType: 'int' }
        ]
    };
   
    ExecuteGetData(true, configCategory.svcUrl, 'TrustManagement', executeParam, function (data) {
        if (data[0].Result == 1) {
            alert('保存成功');
            window.parent.InitTree();
            var tmpInterval = setInterval(function () {

                $(window.parent.document).find("#modal-mask").trigger('click');
                window.clearInterval(tmpInterval);
            }, 10);
        }
        else if (data[0].Result == 0) alert('保存失败');
        else if (data[0].Result == 2) alert('该CategoryCode已存在');
    });
}
function AfterBindData() {
    IsRequiredChange($("#CategoryDetailFrom input[data-attr='IsRequired']"), $("#CategoryDetailFrom input[data-attr='IsRequired']").attr('checked'));

    $("#CategoryDetailFrom input:not([disabled]):not([readonly]):eq(0)").focus();
}
$(function () {
    getData();
    $("#CategoryDetailFrom input[data-attr='IsRequired']").change(function () {
        var $this = $(this);
        IsRequiredChange($this, $this.attr('checked'));
    })
    $("#CategoryDetailFrom .form-item[data-valid]").change(function () {
        CommonValidation.ValidControlValue($(this));
    });
    $("#Save").click(function () {
        saveData();
    })
})