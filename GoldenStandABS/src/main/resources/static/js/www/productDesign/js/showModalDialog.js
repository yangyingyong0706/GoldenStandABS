// Based on this article: http://extremedev.blogspot.com/2011/03/windowshowmodaldialog-cross-browser-new.html
/*
Usage example:
var url = 'test.html';

$.showModalDialog({
     url: url,
     height: 500,
     width: 900,
     scrollable: false,
     onClose: function(){ var returnedValue = this.returnValue; }
});

UPDATE August 2012: Looks like there is a problem when setting DocType: HTML 4.01 Doctype on top of extremedevStart.html. --> The popup does not close.
To fix this use:

$dlg.dialogWindow.dialog('close');

instead of:
window.close(); 

*/


var $dialog = null;

jQuery.showModalDialog = function (options) {

    var defaultOptns = {
        title: null,
        url: null,
        dialogArguments: null,
        height: 'auto',
        width: 'auto',
        position: 'center',
        resizable: true,
        scrollable: true,
        onClose: function () { },
        returnValue: null,
        doPostBackAfterCloseCallback: false,
        postBackElementId: null
    };

    var fns = {
        close: function () {
            opts.returnValue = $dialog.returnValue;
            $dialog = null;
            opts.onClose();
            if (opts.doPostBackAfterCloseCallback) {
                postBackForm(opts.postBackElementId);
            }
        },
        adjustWidth: function () { $frame.css("width", "100%"); }
    };

    // build main options before element iteration

    var opts = $.extend({}, defaultOptns, options);

    var $frame = $('<iframe id="iframeDialog" />');

    if (opts.scrollable)
        $frame.css('overflow', 'auto');

    $frame.css({
        'padding': 0,
        'margin': 0,
        'padding-bottom': 10
    });

    var $dialogWindow = $frame.dialog({
        autoOpen: true,
        modal: true,
        width: opts.width,
        height: opts.height,
        resizable: opts.resizable,
        position: opts.position,
        overlay: {
            opacity: 0.5,
            background: "black"
        },
        close: fns.close,
        resizeStop: fns.adjustWidth
    });

    $frame.attr('src', opts.url);
    fns.adjustWidth();

    $frame.load(function () {
        if ($dialogWindow) {

            var maxTitleLength = 50;
            if (opts.title == null) {
                var title = $(this).contents().find("title").html();

                if (title.length > maxTitleLength) {
                    title = title.substring(0, maxTitleLength) + '...';
                }
                opts.title = title;
            }

            $dialogWindow.dialog('option', 'title', opts.title);
        }
    });

    $dialog = new Object();
    $dialog.dialogArguments = opts.dialogArguments;
    $dialog.dialogWindow = $dialogWindow;
    $dialog.returnValue = null;
}

//function postBackForm(targetElementId) {
//    var theform;
//    theform = document.forms[0];
//    theform.__EVENTTARGET.value = targetElementId;
//    theform.__EVENTARGUMENT.value = "";
//    theform.submit();
//}

var prntWindow = getParentWindowWithDialog(); //$(top)[0];

var $dlg = prntWindow && prntWindow.$dialog;

function getParentWindowWithDialog() {
    var p = window.parent;
    var previousParent = p;
    while (p != null) {
        if ($(p.document).find('#iframeDialog').length) return p;

        p = p.parent;

        if (previousParent == p) return null;

        // save previous parent

        previousParent = p;
    }
    return null;
}

function setWindowReturnValue(value) {
    if ($dlg) $dlg.returnValue = value;
    window.returnValue = value; // in case popup is called using showModalDialog

}

function getWindowReturnValue() {
    // in case popup is called using showModalDialog

    if (!$dlg && window.returnValue != null)
        return window.returnValue;

    return $dlg && $dlg.returnValue;
}

if ($dlg) window.dialogArguments = $dlg.dialogArguments;
if ($dlg) window.close = function () { if ($dlg) $dlg.dialogWindow.dialog('close'); };

function CloseWindow() {
    if ($dlg) {
        $dlg.dialogWindow.dialog('close');
    } else {
        ForceCloseWindow();
    }
}

function ForceCloseWindow() {
    var browserName = navigator.appName;
    var browserVer = parseInt(navigator.appVersion);
    //alert(browserName + " : "+browserVer);

    //document.getElementById("flashContent").innerHTML = "<br>&nbsp;<font face='Arial' color='blue' size='2'><b> You have been logged out of the Game. Please Close Your Browser Window.</b></font>";

    if (browserName == "Microsoft Internet Explorer") {
        var ie7 = (document.all && !window.opera && window.XMLHttpRequest) ? true : false;
        if (ie7) {
            //This method is required to close a window without any prompt for IE7 & greater versions.
            window.open('', '_parent', '');
            window.close();
        }
        else {
            //This method is required to close a window without any prompt for IE6
            this.focus();
            self.opener = this;
            self.close();
        }
    } else {
        //For NON-IE Browsers except Firefox which doesnt support Auto Close
        try {
            this.focus();
            self.opener = this;
            self.close();
        }
        catch (e) {

        }

        try {
            window.open('', '_self', '');
            window.close();
        }
        catch (e) {

        }
    }
}