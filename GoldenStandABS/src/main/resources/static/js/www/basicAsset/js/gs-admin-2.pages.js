/// <reference path="jquery-1.12.1.min.js" />
/// <reference path="../bower_components/asyncbox/asyncbox.js" />
var GSDialogType = {
    Success: 0,
    Confirm: 1,
    Warn: 2,
    Error: 3
};
var GSDialog = function () {

    var alert = function (aType, content, title, fnCallback) {
        var dispTitle;
        switch (aType) {
            case 0:
                dispTitle = title || '成功';
                parent.asyncbox.success(content, dispTitle, function (action) {
                    //success 返回两个 action 值，分别是 'ok' 和 'close'。
                    if (fnCallback && typeof fnCallback === 'function') { fnCallback(action); }
                });
                break;
            case 1:
                dispTitle = title || '请确认';
                parent.asyncbox.confirm(content, dispTitle, function (action) {
                    //confirm 返回三个 action 值，分别是 'ok'、'cancel' 和 'close'。
                    if (fnCallback && typeof fnCallback === 'function') { fnCallback(action); }
                });
                break;
            case 3:
                dispTitle = title || '出现错误';
                parent.asyncbox.error(content, dispTitle, function (action) {
                    //error 返回两个 action 值，分别是 'ok' 和 'close'。
                    if (fnCallback && typeof fnCallback === 'function') { fnCallback(action); }
                });
                break;
            case 2:
            default:
                dispTitle = title || '警告';
                parent.asyncbox.warning(content, dispTitle, function (action) {
                    //alert 返回四个 action 值，分别是 'yes'、'no'、'cancel' 和 'close'。
                    if (fnCallback && typeof fnCallback === 'function') { fnCallback(action); }
                });
                break;
        }
    };

    //var prompt = function () {
    //    //prompt 支持三种文本类型: text || textarea || password。
    //    //如需阻止窗口关闭，请在判断 action 值内加入 return false
    //    asyncbox.prompt('标题', '小提示:', '内容缺省输入 null 或者两个单引号', 'text', function (action, val) {
    //        //prompt 返回三个 action 值，分别是 'ok' 、'cancel' 和 'close'。
    //        if (action == 'ok') {
    //            alert('您输入了：' + val);
    //        }
    //        alert(action);
    //    });
    //};

    var html = function (title, content, fnCallback, width, height) {
        parent.asyncbox.html({
            title: title,//[optional] (String)
            content: content,//可为静态的html标签+内容，或为具有innerHtml属性的dom对象
            width: width,//[optional] (Number,String) --传入数字为窗口内容区域宽度，传入带 px 后缀字符串为窗口整体宽度。
            height: height, //[optional] (Number,String) --传入数字 300 为窗口内容区域高度，传入带 px 后缀字符串为窗口整体高度。
            modal: true, //[optional] (bool) --模态（遮罩层），一定程度上屏蔽用户对本窗口以外的操作。默认false
            dialogResult: 0,
            unload: function () {
                if (fnCallback && typeof fnCallback === 'function') { fnCallback(this.dialogResult); }
            }//[optional]
        });
    };

    var open = function (title, url, data, fnCallback, width, height) {
        parent.asyncbox.open({
            title: title,//[optional] (String)
            url: url,
            data: data,//[optional] --接受任何类型对象、值，传递到窗口内子页面中。
            width: width, //[optional] (Number,String) --传入数字为窗口内容区域宽度，传入带 px 后缀字符串为窗口整体宽度。
            height: height, //[optional] (Number,String) --传入数字 300 为窗口内容区域高度，传入带 px 后缀字符串为窗口整体高度。
            cache: false,//[optional] (bool) --缓存窗口在文档里（即不删除窗口，只是隐藏）。默认值：false。
            //timer: 5, //[optional] (bool) --定秒自动关闭窗口的秒数值。默认不自动关闭。
            modal: true, //[optional] (bool) --模态（遮罩层），一定程度上屏蔽用户对本窗口以外的操作。默认false
            dialogResult: 0,
            unload: function () {
                if (fnCallback && typeof fnCallback === 'function') { fnCallback(this.dialogResult); }
            }//[optional]
        }, window);
    };

    var getData = function () {
        var dialog = frameElement.api;
        var requestData = dialog.data;
        return requestData;
    };

    var close = function (dialogResult) {
        var dialog = frameElement.api;
        dialog.options.dialogResult = dialogResult;
        dialog.close();
    };

    return {
        Alert: alert,
        Html: html,
        Open: open,
        GetData: getData,
        Close: close
    };
}();
