/*
*	弹出框组件 V 2.0
*
*	Author : BieJun
*	Date : 2016.03.11
*	Update : 2017.03.20
*/

~function ($, doc, win) {

    var defaults = {
        width: 500,
        height: 400,
        title: '',
        url: '',
        html: '',
        type: 'default',
        draggable: false,
        mask: true,
        scrolling: true,
        buttonGroup: [],
        onCallback: function () { },
        onClose: function () { }
    }

    var anyDialog = function (options) {

        var self = this, containerId = 'container-' + (Date.now());

        self.options = $.extend({}, defaults, options);

        self.container = $('<div id="' + containerId + '"/>');

        self.title = $('<div/>');

        self.mask = null;

        self.iframe = null;

        self.targetElement = null;

        self.closePopup = self.close;

        if (typeof self.options.width === 'number') {
            self.options.width = self.options.width + 'px';
        }
        if (typeof self.options.height === 'number') {
            self.options.height = self.options.height + 'px';
        }

        self.container.css({
            'background': '#fff',
            'width': self.options.width,
            'height': self.options.height,
            'border-radius': '2px',
            'box-shadow': '0 2px 15px rgba(0,0,0,.1)'
        });

        if (self.options.mask) {

            var $mask = $('<div id="modal-mask"/>'),
				$wrap = $('<div id="modal-wrap"/>');

            // 判断笼罩层是否已经存在，减少不必要的dom操作导致的性能消耗
            if ($('#modal-mask')[0]) {
                self.mask = $('#modal-mask');

            } else {
                $mask.css({
                    'position': 'fixed',
                    'top': 0,
                    'left': 0,
                    'right': 0,
                    'bottom': 0,
                    'width': '100%',
                    'height': '100%',
                    'background': 'rgba(0,0,0,.3)',
                    'z-index': '999',
                    'display': 'none'
                });

                $(doc.body).append($mask);

                self.mask = $mask;
            }

            self.mask.css('display', 'table');

            $wrap.css({
                'display': 'table-cell',
                'vertical-align': 'middle'
            });

            $wrap.appendTo(self.mask);

            self.container.css({
                'position': 'relative',
                'margin': '0 auto',
                //'overflow':'auto'
            });

            self.container.appendTo($wrap);

            self.options.width = self.container.width();

            self.options.height = self.container.height();

        } else {

            self.container.css({
                'position': 'fixed',
                'border': '1px solid #ddd',
            });

            self.container.appendTo(document.body);

            self.options.width = self.container.width();

            self.options.height = self.container.height();

            self.container.css({
                'top': ($(win).height() - self.options.height) / 2 + 'px',
                'left': ($(win).width() - self.options.width) / 2 + 'px'
            });

            $(win).on('resize', function () {

                self.options.width = self.container.width();

                self.options.height = self.container.height();

                self.container.css({
                    'top': ($(win).height() - self.options.height) / 2 + 'px',
                    'left': ($(win).width() - self.options.width) / 2 + 'px'
                });
            });
        }

        self.title.css({
            'padding': '10px 20px 0 20px',
            'height': '40px'
        });

        self.title.appendTo(self.container);

        if (self.options.title != '') {

            self.title.append('<div style="font-size:16px;">' + self.options.title + '</div>');
        }

        var closeBtn = $('<button id="modal-close">&times;</button>');

        closeBtn.css({
            'position': 'absolute',
            'top': '10px',
            'right': '18px',
            'background': 'transparent',
            'border': 'none',
            'font-size': '21px',
            'font-weight': '700',
            'line-height': '1',
            'color': '#000',
            'text-shadow': '0 1px 0 #fff',
            'outline': '0',
            'opacity': '.3'
        })

        self.title.append(closeBtn);

        closeBtn.on('click', self.close.bind(self));

        self.contents();

        (self.options.draggable && !self.options.mask) && self.draggable();
    }
    anyDialog.prototype = {
        contents: function () {
            var self = this, $div = $('<div/>'), $button = $('<button type="button"/>'), type = self.options.type,
				// 按钮颜色
				colors = [
					{
					    //backgroundColor:'#E0E1E2',
					    //color:'rgba(0,0,0,.6)',
					    //boxShadow:'0 0 0 1px transparent inset, 0 0 0 0 rgba(34,36,38,.15) inset'
					},
					{
					    //backgroundColor:'#21BA45',
					    //color:'#fff',
					    //boxShadow:'0 0 0 0 rgba(34,36,38,.15) inset',
					    //marginLeft:'10px'
					}
				];

            if ('alert' == type || 'confirm' == type || 'prompt' == type) {
                var $buttonGroup = $('<div/>');
                $buttonGroup.css({
                    'text-align': 'right',
                    'padding': '13px 20px',
                    'background': '#f9fafb',
                    'height': '58px',
                    'border-top': '1px solid rgba(34, 36, 38, 0.15)'
                });
                // -100px 减去标题栏与按钮部分的高度
                $div.css({ 'height': 'calc(100% - 100px)', 'overflow': 'auto' });
                $button.css({
                    'position': 'relative',
                    'overflow': 'visible',
                    'display': 'inline-block',
                    'padding': '0.3em 0.7em',
                    'border': '1px solid #d4d4d4',
                    'margin': '0',
                    'text-decoration': 'none',
                    'text-align': 'center',
                    'text-shadow': '1px 1px 0 #fff',
                    'color': '#555',
                    'white-space': 'nowrap',
                    'cursor': 'pointer',
                    'outline': 'none',
                    'background-color': '#ececec',
                    'background-image': '-webkit-gradient(linear, 0 0, 0 100%, from(#f4f4f4), to(#ececec))',
                    'background-image': '-moz-linear-gradient(#f4f4f4, #ececec)',
                    'background-image': ' -ms-linear-gradient(#f4f4f4, #ececec)',
                    'background-image': '-o-linear-gradient(#f4f4f4, #ececec)',
                    'background-image': 'linear-gradient(#f4f4f4, #ececec)',
                    '-moz-background-clip': 'padding',
                    'background-clip': ' padding-box',
                    'border-radius': ' 0.2em',
                    'zoom': '1',
                    'font-size': '14px',
                    'font-family': "Microsoft Yahei",
                    'font-weight': 'normal',
                    'text-align': 'center',
                    'margin-left': '10px'
                });
                self.container.append($div);
                $div.after($buttonGroup);
            }

            switch (type) {
                case 'default':
                    $div.css({ 'height': 'calc(100% - 40px)', 'overflow': self.options.scrolling == true ? 'auto' : 'hidden', 'overflowX': 'hidden' });
                    if (self.options.url != '') {
                        self.iframe = $('<iframe id="dialogIframe" frameborder="0"/>');
                        self.iframe.css({
                            width: '100%',
                            height: '100%'
                        });
                        self.iframe.attr('src', self.options.url);
                        self.iframe.appendTo($div);
                    } else {
                        if (typeof self.options.html == 'object') {

                            self.targetElement = self.options.html;
                            self.targetElement.show().appendTo($div);
                        } else {
                            $div.css({ 'padding': '0 20px', 'font-size': '14px' });
                            $div.html(self.options.html)
                        }
                    }
                    self.container.append($div);
                    break;
                case 'alert':
                    var button = $button.clone(), btnObj = self.options.buttonGroup.shift();
                    if (btnObj) {
                        $div.css('text-align', 'center').html(self.options.html);
                        button.css($.extend(colors.pop(), btnObj.css || {})).text(btnObj.text || '');
                        $buttonGroup.append(button);
                        button.click(btnObj.event && btnObj.event.bind(self) || function () { });
                    }
                    break;
                case 'confirm':
                    var btnNode, btnObj = self.options.buttonGroup;

                    $div.css('text-align', 'center').html(self.options.html);

                    $.each(btnObj, function (k, v) {
                        btnNode = $button.clone();
                        btnNode.css($.extend(colors[k], v.css || {}))
								.text(v.text || '')
								.click(v.event && v.event.bind(self) || function () { });
                        $buttonGroup.append(btnNode);
                        btnNode = null;
                    });
                    break;
                case 'prompt':
                    var btnNode, btnObj = self.options.buttonGroup, $input;

                    var inputId = 'modal-input-' + Math.round(Math.random() * 66666);
                    var inputForm = '<div style="padding:0 20px">' +
										'<input type="text" id="' + inputId + '" style="width:100%;padding:6px 5px;border:1px solid #ddd;font-size:12px;"/>' +
									'</div>';

                    $div.css('padding', '20px 0').html(inputForm);

                    $input = $('#' + inputId);

                    $input.focus(); // 给弹出的表单一个焦点

                    $.each(btnObj, function (k, v) {
                        btnNode = $button.clone();
                        btnNode.css($.extend(colors[k], v.css || {}))
								.text(v.text || '')
								.click(v.event && v.event.bind(self, $input) || function () { });
                        $buttonGroup.append(btnNode);
                        btnNode = null;
                    });
                    break;
            }
            (self.iframe) ? self.iframe.load(self.options.onCallback.call(self)) : self.options.onCallback.call(self);
        },
        close: function () {
            var self = this;
            // IE下iframe会缓存，关闭弹出层同时干掉它
            if (self.iframe) {
                self.iframe.attr('src', '').remove();
                self.iframe = null;
            }
            if (self.targetElement) {
                self.targetElement.hide().appendTo(doc.body);
                self.targetElement = null;
            }
            if (self.options.mask) {
                // 隐藏笼罩层以便下次使用
                self.mask.hide();
                // 找到下一层元素并移除掉，防止jqyery内部缓存机制导致的内存泄露
                self.mask.find('#modal-wrap').remove();
            } else {
                self.container.remove();
            }
            self.options.onClose.bind(self)();
        },
        draggable: function () {
            var self = this;

            var timer, moving = false, iX, iY, oX, oY, X, Y;
            var oW = $(win).width() - self.options.width,
				oH = $(win).height() - self.options.height;

            var drag = {
                start: function (e) {
                    var e = e || win.event;
                    var offset = self.container.offset();
                    iX = e.clientX - offset.left;
                    iY = e.clientY - offset.top;
                    // 加入计时器，防止每次移动时重新计算位置消耗性能
                    timer = setInterval(function () {
                        if (timer && moving) {
                            oX = X - iX;
                            oY = Y - iY;
                            oX = oX < 0 ? 0 : oX > oW ? oW : oX;
                            oY = oY < 0 ? 0 : oY > oH ? oH : oY;
                            self.container.css({ "left": oX + "px", "top": oY + "px" });
                        }
                    }, 5);
                    return false;
                },
                move: function (e) {
                    var e = e || win.event;
                    X = e.clientX;
                    Y = e.clientY;
                    if (timer !== undefined) {
                        moving = true;
                    }
                    return false;
                },
                stop: function (e) {
                    clearInterval(timer);
                    timer = undefined;
                    moving = false;
                    // 释放内存
                    iX = iY = oX = oY = X = Y = null;
                }
            }
            self.title.css('cursor', 'move').on('mousedown', drag.start);
            $(doc).on("mousemove", drag.move);
            $(doc).on("mouseup", drag.stop);
        }
    }

    $.fn.anyDialog = function (options) {
        var $this = $(this);
        $this.on('click', function (e) {
            var e = e || win.event;
            e.preventDefault();
            new anyDialog(options)
        });
        return $this;
    }
    $.anyDialog = function (options) {
        return new anyDialog(options);
    }
}(jQuery, document, window);