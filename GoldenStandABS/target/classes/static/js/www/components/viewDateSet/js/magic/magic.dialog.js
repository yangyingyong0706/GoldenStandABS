/*
 * version: 2.4
 * author: Mac_J
 * need: core.js
 */
define(['jquery', './magic.core'], function ($, mac) {
    mac.dialog = function (self, cfg) {
        if (cfg.width)
            self.width(cfg.width);
        if (cfg.height)
            self.height(cfg.height);
        self.hide();
        var mk = $('<div class="mask"></div>');
        self.adjust = function () {
            var doc = $(document);
            var docEl = document.documentElement;
            var cw = docEl.clientWidth, ch = docEl.clientHeight;
            var dh = doc.height(), dw = doc.width();
            mk.height(dh > ch ? dh : ch).width(dw);
            if ((!cfg.pos || cfg.pos == 'center') && !self.moved) {
                var w = self.width(), h = self.height();
                cw = docEl.clientWidth;
                ch = docEl.clientHeight;
                l = cw / 2 - w / 2;
                t = ch / 2 - h / 2;
                l = l < 0 ? 0 : l;
                t = t < 0 ? 0 : t;
                self.css({
                    left: cfg.left || l,
                    top: cfg.top || t
                });
            }
            return self;
        }
        self.close = function () {
            if (cfg.closeAction == 'remove') {
                self.remove();
                mk.remove();
            } else {
                self.hide();
                mk.hide();
            }
            $(window).unbind('keydown', self.close);
            if (cfg.onClose)
                cfg.onClose();
        }
        $(window).resize(self.adjust);
        if (cfg.blank)
            return self;
        // setting tabIndex makes the div focusable
        // setting outline to 0 prevents a border on focus in Mozilla
        self.attr('tabIndex', 0).css('outline', 0);
        self.click(function (e) {
            self.move2top();
        });
        var hd = $('<div class="head"></div>').appendTo(self);
        hd.append('<span class="fl">' + cfg.title + '</span>');
        var hdr = $('<span class="fr"></span>').appendTo(hd);
        if (!cfg.noCloser) {
            var c = $('<span class="icon icon-close closer"></span>');
            c.hover(function () {
                $(this).addClass('ui-state-hover');
            }, function () {
                $(this).removeClass('ui-state-hover');
            }).click(self.close);
            hdr.append(c);
        }
        var bd = self.body = $('<div class="body"></div>');
        // alert(hd.height());
        // bd.height(self.height() - hd.height());
        if (cfg.el)
            bd.append(cfg.el);
        self.append(bd);
        self.move2top = function () {
            var ec = $(this), z = ec.css('z-index');
            var d = mac.dialog;
            if (z && !isNaN(z) && z >= d.maxZ) {
                d.maxZ = z;
            } else {
                if (cfg.model)
                    mk.css('z-index', ++d.maxZ);
                ec.css('z-index', ++d.maxZ);
            }
            return self;
        }
        if (cfg.draggable) {
            self.draggable({
                cancel: '.body, .closer',
                handle: '.head',
                containment: 'window',
                stop: function () {
                    self.moved = true;
                }
            });
            self.css('position', 'absolute');
        }
        if (cfg.resizable) {
            // .ui-resizable has position: relative defined in the stylesheet
            // but dialogs have to use absolute or fixed positioning
            // var p = self.css('position');
            self.resizable({
                cancel: '.body',
                // containment: self.parent(),
                // alsoResize: self.find('.body'),
                maxWidth: cfg.maxWidth,
                maxHeight: cfg.maxHeight,
                minWidth: cfg.minWidth,
                minHeight: cfg.minHeight,
                handles: cfg.handles,
                resize: function () {
                    var h = self.height() - hd.height();
                    bd.height(h);
                    if (cfg.onResize)
                        cfg.onResize(bd.width(), h);
                }
            });
            self.css('position', 'absolute');
        }
        self.open = function () {
            if (self.parent().length == 0)
                $('body').prepend(self);
            if (cfg.model)
                $('body').prepend(mk.show());
            self.addClass('dialog');
            self.move2top();// 移动到最前
            self.adjust().show();
            self.focus();
            if (cfg.closeOnEsc) {
                $(window).keydown(function (e) {
                    var z = self.css('z-index');
                    if (e.keyCode == 27 && z == mac.dialog.maxZ)
                        self.close();
                });
            }
        }
        if (cfg.autoOpen)
            self.open();
        return self;
    }
    //set default z-index
    mac.dialog.maxZ = 1000;
    mac.wait = function (msg, params, w, h) {
        var dg = $('<div><div>').mac('dialog', {
            title: mac.getMsg(msg, params),
            width: w || 240,
            height: h || 100,
            autoOpen: true,
            draggable: true,
            noCloser: true,
            model: true,
            closeAction: 'remove'
        });
        dg.body.append('<div class="wait"><img src="../../Scripts/magic/bgWait.gif" align="center" /></div>');
        return dg;
    }

    mac.opendlg = function (c) {
        var dg = $('<div></div>').mac('dialog', {
            title: c.title,
            width: c.width || 400,
            height: c.height || 'auto',
            autoOpen: true,
            draggable: true,
            noCloser: true,
            model: true,
            closeAction: 'remove'
        });
        var ct = $('<div class="main">' + mac.getMsg(c.message, c.params)
                + '</div>');
        dg.body.append(ct);
        if (c.buttons && c.buttons.length > 0) {
            var bb = $('<div class="bottom"></div>');
            $.each(c.buttons, function (n, c) {
                var b = $('<div class="button"></div>');
                b.append(c.text).click(function () {
                    c.click(dg);
                    return false;
                });
                if (c.width)
                    b.width(c.width);
                bb.append(b);
            });
            bb.append('<div class="clear"></div>');
            dg.body.append(bb)
        }
        // var mh = dg.height() - bb.height() - dg.children('.head').height();
        // ct.height(mh);
        dg.keydown(function (e) {
            switch (e.keyCode) {
                case 13:
                    dg.close();
                    return false;
                case 27:
                    dg.close();
                    return false;
            }
        });
        return dg;
    }
    mac.confirm = function (msg, callback, params, btns) {
        return mac.opendlg({
            title: '',
            message: msg,
            callback: callback,
            params: params,
            buttons: btns || [{
                text: 'Cancel',
                click: function (d) {
                    d.close();
                }
            }, {
                text: 'OK',
                click: function (d) {
                    d.close();
                    callback();
                }
            }]
        });
    };
    mac.alert = function (msg, params, callback) {
        return mac.opendlg({
            title: '',
            message: msg,
            callback: callback,
            params: params,
            buttons: [{
                text: 'OK',
                click: function (d) {
                    d.close();
                    if (callback)
                        callback();
                }
            }]
        });
    };

    mac.complete = function (msg, params, w, h) {
        $('<div><div>').html('');
        var dg = $('<div><div>').mac('dialog', {
            title: mac.getMsg(msg, params),
            width: w || 240,
            height: h || 100,
            autoOpen: true,
            draggable: true,
            noCloser: true,
            model: true,
            closeAction: 'remove',

        });
        dg.body.append('<div class="wait"><img src="../../Scripts/magic/success.jpg" align="center" /></div>');
        setTimeout(function () {
            dg.close();
        }, 1500);
        return dg;
    };
});