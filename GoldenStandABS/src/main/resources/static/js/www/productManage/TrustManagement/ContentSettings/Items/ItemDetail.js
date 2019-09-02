var ItemId = getQueryString("ItemId") ? getQueryString("ItemId") : "";
var CategoryId = getQueryString("CategoryId") ? getQueryString("CategoryId") : "";
var ExtensionItemId, ItemAliasId;
//if (CategoryId != parseInt(CategoryId)) {
//    alert("请传入正确CategoryId");
//}

var config = {
    TableNameList: []
    , DictionaryList: []
    , DataTypeList: [
        { key: 'String', value: 'String' }
        , { key: 'Double', value: 'Double' }
        , { key: 'Float', value: 'Float' }
        , { key: 'Decimal', value: 'Decimal' }
        , { key: 'Int', value: 'Int' }
        , { key: 'Date', value: 'Date' }
        , { key: 'Datetime', value: 'Datetime' }
        , { key: 'Bool', value: 'Bool' }
        , { key: 'Select', value: 'Select' }
        , { key: 'List', value: 'List' }
        , { key: 'Text', value: 'Text' }
    ]
    , LanguageList: [
        { key: 'zh-CN', value: '中文' }
        , { key: 'en-US', value: '英文' }
    ]
    , UnitList: [
      { key: "One", value: "One" }
      , { key: "Ten", value: "Ten" }
      , { key: "Hundred", value: "Hundred" }
      , { key: "Thousands", value: "Thousands" }
      , { key: "TenThousands", value: "TenThousands" }
      , { key: "HundredThousands", value: "HundredThousands" }
      , { key: "Million", value: "Million" }
      , { key: "TenMillion", value: "TenMillion" }
      , { key: "HundredMillion", value: "HundredMillion" }
      , { key: "Billion", value: "Billion" }
      , { key: "TenBillion", value: "TenBillion" }
    ]
    , sContent: {
        'SPName': 'usp_GetItemInfo', 'SQLParams': [
         { 'Name': 'ItemId', 'Value': ItemId, 'DBType': 'int' }
        ]
    }
    , svcUrl: GlobalVariable.DataProcessServiceUrl+"CommonExecuteGet?"
}

function getMetaData() {
    var executeParam = {
        SPName: 'usp_GetItemInfoMetaData', SQLParams: [
            { Name: 'ItemId', value: ItemId, DBType: 'string' }
        ]
    };
    var data = ExecuteGetData(false, config.svcUrl, 'TrustManagement', executeParam);
    config.TableNameList = data[0];
    config.DictionaryList = data[1];
    afterGetMetaData();
}
function afterGetMetaData() {
    var ll = $("#itemDetailFrom select[data-attr='ItemAliasSetName']");
    var dt = $("#itemDetailFrom select[data-attr='DataType']");
    var um = $("#itemDetailFrom select[data-attr='UnitOfMeasure']");
    addOption(ll, config.LanguageList, ['key', 'value']);
    addOption(dt, config.DataTypeList, ['key', 'key']);
    addOption(um, config.UnitList, ['key', 'key'], ['', '无']);
    function addOption(dom, list, keyvalue, initKeyValue) {
        var html = (initKeyValue ? ('<option value="{0}">{1}</option>'.StringFormat(initKeyValue[0], initKeyValue[1])) : '');
        $.each(list, function (i, n) {
            html += '<option value="{0}">{1}</option>'.StringFormat(n[keyvalue[0]], n[keyvalue[1]]);
        })
        $(dom).html(html);
    }
    var tn = $("#itemDetailFrom input[data-attr='TableName']");
    addDataList(tn, config.TableNameList, ['TableName']);
    function addDataList(dom, list, keyvalue) {
        var listid = 'TableName' + (new Date()).getTime();
        if (list) {
            var html = "";
            $.each(list, function (i, option) {
                html = html + '<option value="' + option[keyvalue[0]] + '"></option>';
            });
            html = '<datalist id="' + listid + '">' + html + '</datalist>';
        } else {
            html = '<datalist id="' + listid + '"></datalist>';
        }
        $(dom).attr('list', listid);
        $(dom).after(html);
    }
    //绑定字典信息  AlertDivFrom  AlertDivFromTamplate
    var htmlTemplate = $("#AlertDivFromTamplate").html();
    if (config.DictionaryList.length > 0) {
        $.each(config.DictionaryList, function (index, dic) {
            var $html = $(htmlTemplate);
            $html.find('.form-item').each(function (i, n) {
                var key = $(n).attr('data-attr');
                if (typeof dic[key] != "undefined" && dic[key] != null) {
                    $(n).val(dic[key]);
                }
            })
            if (index == 0)
                $html.find('button.btn-plus').unbind().bind('click', function () { dicListFunction(this, 'add'); }).show();
            else
                $html.find('button.btn-remove').unbind().bind('click', function () { dicListFunction(this, 'del') }).show();

            $("#AlertDivFrom").append($html);
        })
    }
    else {
        var $html = $(htmlTemplate);
        $html.find('button.btn-plus').unbind().bind('click', function () { dicListFunction(this, 'add') }).show();
        $("#AlertDivFrom").append($html);
    }
}
function dicListFunction(obj, func) {
    if (func == 'add') {
        var htmlTemplate = $("#AlertDivFromTamplate").html();
        var $html = $(htmlTemplate);
        $html.find('button.btn-remove').unbind().bind('click', function () { dicListFunction(this, 'del') }).show();
        $("#AlertDivFrom").append($html);
    }
    else if (func == 'del') {
        if (confirm('确定删除吗？删除后将无法使用'))
            $(obj).parent().parent().remove();
    }
}
function getData() {
    var sContent = JSON.stringify(config.sContent);
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
function BindData(data) {
    if (data.length > 0) {
        data = data[0];
        ItemId = data.ItemId, ExtensionItemId = data.ExtensionItemId, ItemAliasId = data.ItemAliasId;
        $("#itemDetailFrom input[data-attr='ItemCode']").attr("disabled", "disabled");
    }
    else {
        return;
    }
    $("#itemDetailFrom .form-item").each(function (i, n) {
        var code = $(n).attr("data-attr");
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
    $("#itemDetailFrom .form-item[data-valid]").each(function () {
        var $this = $(this);
        if (!CommonValidation.ValidControlValue($this)) { haveError = true; }
    });
    if (haveError) return;

    var dicitems = '';
    if (config.DictionaryList.length > 0 && $("#itemDetailFrom select[data-attr='DataType']").val() == 'Select') {
        haveError = false;
        $("#AlertDivFrom .form-item[data-valid]").each(function () {
            var $this = $(this);
            if (!CommonValidation.ValidControlValue($this)) { haveError = true; }
        });
        if (haveError) { alert("下拉选项验证未通过，请重新编辑后保存"); return; };

        //获取字典xml
        dicitems += '<items>';

        $.each(config.DictionaryList, function (i, n) {
            dicitems += '<item>';
            dicitems += '<{0}>{1}</{0}>'.StringFormat('CategoryCode', $("#itemDetailFrom input[data-attr='ItemCode']").val());
            for (var dic in n) {
                dicitems += '<{0}>{1}</{0}>'.StringFormat(dic, n[dic]);
            }
            dicitems += '</item>';
        })
        dicitems += '</items>';
    }
    console.log(dicitems);

    //获取item xml
    var item = '';
    item += '<item>';
    item += '<{0}>{1}</{0}>'.StringFormat('ItemId', ItemId);
    item += '<{0}>{1}</{0}>'.StringFormat('CategoryId', CategoryId ? CategoryId : 0);
    item += '<{0}>{1}</{0}>'.StringFormat('ExtensionItemId', ExtensionItemId ? ExtensionItemId : 0);
    item += '<{0}>{1}</{0}>'.StringFormat('ItemAliasId', ItemAliasId ? ItemAliasId : 0);

    $("#itemDetailFrom .form-item").each(function (i, n) {
        var code = $(n).attr("data-attr");
        var type = $(n).attr("type");
        var value = '';
        if (type == "checkbox")
            value = $(n).attr("checked") ? true : false;
        else
            value = $(n).val();
        item += '<{0}>{1}</{0}>'.StringFormat(code, value);
    });
    item += '</item>';

    var executeParam = {
        SPName: 'usp_UpdateItemInfo', SQLParams: [
            { Name: 'items', value: item, DBType: 'xml' }
            , { Name: 'codeCategory', value: dicitems, DBType: 'xml' }
        ]
    };

    ExecuteGetData(true, config.svcUrl, 'TrustManagement', executeParam, function (data) {
        if (data[0].Result == 1) {
            alert('保存成功');
            window.parent.ItemListModel.PagerListModule.Filter({});
            var tmpInterval = setInterval(function () {
                //$(window.parent.document).find("#modal-mask").css('z-index', '-1').remove();
                //$(window.parent.document).find("#modal-layout").css('z-index', '-1').remove();
                //var $modal = $(window.parent.document).css('z-index', '0').find("#modal-layout");
                //var $mask = $(window.parent.document).css('z-index', '0').find("#modal-mask");
                //$modal.fadeOut('fast', function () {
                //    $mask.remove();
                //    $modal.remove();
                //});
                //$(window.parent.document).find("#modal-mask").trigger('click');

                window.parent.ItemListModel.CloseDialog();
                window.clearInterval(tmpInterval);
            }, 10);
        }
        else if (data[0].Result == 0) alert('保存失败');
        else if (data[0].Result == 2) alert('该ItemCode已存在');
    });
}
function IsRequiredChange(obj, b) {
    var doms = $(obj).parent().parent().nextAll()
    if (b)
        doms.show();
    else
        doms.hide();
}
function IsDataTypeChange(obj) {
    var butm = $(obj).parent().next().find('button');
    if ($(obj).val() == 'Select')
        butm.show();
    else
        butm.hide();
}
function AfterBindData() {
    IsRequiredChange($("#itemDetailFrom input[data-attr='IsRequired']"), $("#itemDetailFrom input[data-attr='IsRequired']").attr('checked'));
    IsDataTypeChange($("#itemDetailFrom select[data-attr='DataType']"));

    //$("#itemDetailFrom input:not([disabled]):not([readonly]):eq(0)").focus();
}
$(function () {
    getMetaData();
    AfterBindData();
    getData();

    $("#itemDetailFrom input[data-attr='IsRequired']").change(function () {
        var $this = $(this);
        IsRequiredChange($this, $this.attr('checked'));
    })
    $("#itemDetailFrom .form-item").change(function () {
        var $this = $(this);
        if ($this.attr("data-valid"))
            CommonValidation.ValidControlValue($this);
        if ($(this).attr("data-attr") == 'DataType') {
            IsDataTypeChange($(this));
        }
    });
    $("#AlertDivFrom .form-item").change(function () {
        var $this = $(this);
        if ($this.attr("data-valid"))
            CommonValidation.ValidControlValue($this);
    });
    $("#itemDetailFrom select[data-attr='DataType']").parent().next().find('button').click(function () {
        $.anyDialog({
            modal: true,
            dialogClass: "TaskProcessDialogClass",
            closeText: "",
            html: $("#AlertDiv").show(),
            height: 350,
            width: 800,
            onClose: function (event, ui) {
                updateDicList();
            },
            onMaskClick: function (event, ui) {
                updateDicList();
            },
            title: "编辑下拉选项"
        });
        function updateDicList() {
            //更新字典数据 config.DictionaryList
            var dics = [];
            $("#AlertDivFrom .row").each(function (index, currow) {
                var row = {};
                $(currow).find('.form-item').each(function (i, n) {
                    var key = $(n).attr('data-attr');
                    var value = $(n).val();
                    row[key] = value;
                })
                dics.push(row);
            })
            config.DictionaryList = dics;
            //console.log(config.DictionaryList);
        }
    })
    $("#Save").click(function () {
        saveData();
    })
})