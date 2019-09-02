/// <reference path="jquery-1.12.1.min.js" />
/// <reference path="../bower_components/asyncbox/asyncbox.js" />
var GSDialogType = {
    Success: 0,
    Confirm: 1,
    Warn: 2,
    Error: 3
};

define( function (require) {
    var $ = require('jquery');
    require("anyDialog");
    var GSDialog = function () { };
    GSDialog.prototype = {
         alert : function (aType, content, title, fnCallback) {
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
         },
         html:function (title, content, fnCallback, width, height) {
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
         },
         open: function (title, url, data, fnCallBack, width, height, size, draggable, changeallow, mask, scrolling) {
             //如果父级的window找不到就会去找父级的父
             window.anyDialog({
                 width: width,
                 height: height,
                 title: title,
                 url: url,
                 data: data,
                 draggable: draggable,
                 size: size,
                 dialogResult: 0,
                 changeallow: changeallow,
                 scrolling: scrolling,
                 mask: mask,
                 onClose: function () {
                    var results= window.frames[0].frameElement.options;
                    if (fnCallBack) { fnCallBack(results); }
                    else {
                        location.reload();
                    }
                 }
             });
         },
        HintWindow: function (str, cfn,mask) {
             var body=$("body");
             var $box = $("<div>" + str + "</div>");
             $box.css({ "position": "relative",
             "padding": "20px",
             "line-height": "24px",
             "word-break": "break-all",
             "overflow":"hidden",
             "font-size": "14px",
             "overflow-x": "hidden",
             "text-align":"left",
             "overflow-y": "auto"
             })
            mask ? mask : true,
             $.anyDialog({
                 title: '提示',
                 html: $box[0],
                 draggable: true,
                 changeallow: false,
                 type: 'HintWindow',
                 buttonGroup: [{ text: '确认', event: cfn && cfn }],
                 mask: mask
             })
        },
        HintWindowWithCancel: function (str, cfn, cfn2, mask) {
            var body = $("body");
            var $box = $("<div>" + str + "</div>");
            $box.css({
                "position": "relative",
                "padding": "20px",
                "line-height": "24px",
                "word-break": "break-all",
                "overflow": "hidden",
                "font-size": "14px",
                "overflow-x": "hidden",
                "text-align": "left",
                "overflow-y": "auto"
            })
            mask ? mask : true,
             $.anyDialog({
                 title: '提示',
                 html: $box[0],
                 draggable: true,
                 changeallow: false,
                 type: 'HintWindow',
                 buttonGroup: [
                     { text: '确认', event: cfn && cfn },
                     { text: '取消', event: cfn2 && cfn2 }
                 ],
                 mask: mask
             })
        },
        HintWindowtop: function (str, cfn, mask) {

            var body = $("body");
            var $box = $("<div>" + str + "</div>");
            $box.css({
                "position": "relative",
                "padding": "20px",
                "line-height": "24px",
                "word-break": "break-all",
                "overflow": "hidden",
                "font-size": "14px",
                "overflow-x": "hidden",
                "text-align": "left",
                "overflow-y": "auto"
            })
            mask ? mask : true
            //$($(top)[0])[0]
            $($(top)[0])[0].$.anyDialog({
                title: '提示',
                html: $box[0],
                draggable: true,
                changeallow: false,
                type: 'HintWindow',
                buttonGroup: [{ text: '确认', event: cfn && cfn }],
                mask: mask
            })

        },
         HintWindowTF:function(str,fn,fn1,mask){
             var body = $("body");
             var $box = $("<div>" + str + "</div>");
             $box.css({
                 "position": "relative",
                 "padding": "20px",
                 "line-height": "24px",
                 "word-break": "break-all",
                 "overflow": "hidden",
                 "font-size": "14px",
                 "overflow-x": "hidden",
                 "overflow-y": "auto",
                 "text-align":"left"
             })
             fn1 ? fn1 : function () { }
             mask ? mask : true
             window.anyDialog({
                 title: '提示',
                 html: $box[0],
                 draggable: true,
                 changeallow: false,
                 type: 'HintWindowTF',
                 fn: fn,
                 fn1: fn1,
                 mask:mask
             })
         },
         HintWindowTFS: function (str, fn, fn1,fn2,mask) {
             var body = $("body");
             var $box = $("<div>" + str + "</div>");
             $box.css({
                 "position": "relative",
                 "padding": "20px",
                 "line-height": "24px",
                 "word-break": "break-all",
                 "overflow": "hidden",
                 "font-size": "14px",
                 "overflow-x": "hidden",
                 "overflow-y": "auto",
                 "text-align": "left"
             })
             fn1 ? fn1 : function () { }
             mask ? mask : true
             window.anyDialog({
                 title: '提示',
                 html: $box[0],
                 draggable: true,
                 changeallow: false,
                 type: 'HintWindowTFS',
                 fn: fn,
                 fn1: fn1,
                 fn2:fn2,
                 mask: mask
             })
         },
         topOpen: function (title, url, data, fnCallBack, width, height, size, draggable, changeallow, mask,scrolling) {
             //如果父级的window找不到就会去找父级的父
             window.parent.anyDialog({
                 width: width,
                 height: height,
                 title: title,
                 url: url,
                 data: data,
                 draggable: draggable,
                 size: size,
                 dialogResult: 0,
                 changeallow: changeallow,
                 scrolling: scrolling,
                 mask: mask,
                 page:2,
                 onClose: function () {
                     if (window.frames[0]!=undefined) {
                         var results = window.frames[0].frameElement.options;
                      }
                     if (fnCallBack) { fnCallBack(results); }
                     else { location.reload(); }
                 }
             });
         },
         getData: function () {          
             var str = frameElement.getAttribute("data-Data");
             if (str == "" || str == "undefined") {
                 return false;
             }
             var obj=JSON.parse(str);
             return obj;
          },
         close: function (dialogResult) {
             frameElement.options = dialogResult
             $(frameElement).attr("data-Data", dialogResult);
             //$(frameElement).parents("i#modal-close").click();
             $("#modal-close", parent.document).click()
          },
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
    };
    return new GSDialog();
})
