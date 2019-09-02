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
        draggable: true,
        mask: true,
        scrolling: true,
        buttonGroup: [],
        data: "",
        size: "",
        dialogResult: 0,
        changeallow: true,
        onCallback: function () { },
        onClose: function () { },
        fn: function () { },
        fn1: function () { },
        fn2:function(){}
    }
    var anyDialog = function (options) {


        var self = this, containerId = 'container-' + (Date.now());

        self.options = $.extend({}, defaults, options);

        self.container = $('<div id="' + containerId + '"/>');
        self.container[0].data = self.options.data;
        self.container[0].result = self.options.dialogResult;
        self.title = $('<div/>');
        self.mask = null;

        self.iframe = null;
        self.targetElement = null;

        self.closePopup = self.close;
        var setWidth, setHeight;
        if (typeof self.options.width === 'number') {
             setWidth = self.options.width + 'px';
            //self.options.width = self.options.width + 'px';
        } else if (typeof self.options.width === 'string') {
             setWidth = self.options.width;
        }
        if (typeof self.options.height === 'number') {
             setHeight= self.options.height + 'px';
        } else if (typeof self.options.height === 'string') {
             setHeight = self.options.height;
        }
        if (self.options.type == "HintWindow" || self.options.type == "HintWindowTF" || self.options.type == "HintWindowTFS") {
            self.container.css({
                'background': '#fff',
                'min-width':"300px",
                'border-radius': '2px',
                'box-shadow': '0 2px 15px rgba(0,0,0,.1)'
            })
        } else {
            self.container.css({
                'background': '#fff',
                'width': setWidth,
                'height': setHeight,
                'border-radius': '2px',
                'box-shadow': '0 2px 15px rgba(0,0,0,.1)'
            });
        }
        

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
                    'z-index': '1000',
                    'display': 'none'
                });
                $(doc.body).append($mask);
                self.mask = $mask;
            }
            self.mask.css({ 'display': 'table' });

            $wrap.css({
                'display': 'table-cell',
                'vertical-align': 'middle'
            });
            $wrap.appendTo(self.mask);
            //if ($("#modal-mask").length > 0) {
            //    $("#modal-mask").eq($("#modal-mask").length - 1).remove();
            //}
            self.container.css({
                'position': 'absolute',
                'left': '50%',
                'top': '50%',
                'transform': 'translate(-50%,-50%)'
            });

            self.container.appendTo($wrap);

            //self.options.width = self.container.width();

            //self.options.height = self.container.height();

        } else {

            self.container.css({
                'position': 'fixed',
                'border': '1px solid #ddd',
                "z-index": "1000",
                'left': '50%',
                'top': '50%',
                'transform': 'translate(-50%,-50%)'
            });
            self.container.appendTo(document.body);

            //self.options.width = self.container.width();

            //self.options.height = self.container.height();

            //self.container.css({
            //    'top': ($(win).height() - self.options.height) / 2 + 'px',
            //    'left': ($(win).width() - self.options.width) / 2 + 'px'
            //});

            $(win).on('resize', function () {

                self.container.css({
                    'position': 'fixed',
                    'border': '1px solid #ddd',
                    "z-index": "1000",
                    'left': '50%',
                    'top': '50%',
                    'transform': 'translate(-50%,-50%)'
                });
            });
        }

        self.title.css({
            'padding-left': '20px',
            'height': '40px',
            'line-height': '40px',
            'background': 'rgba(243,245,250,1)',
            'border-top-left-radius': '2px',
            'border-top-right-radius': '2px'
        });

        self.title.appendTo(self.container);

        if (self.options.title != '') {

            self.title.append('<div style="font-size:16px;">' + self.options.title + '</div>');
        }
        var closeBtn = $('<i id="modal-close" class="icon icon-close"></i>');
        var winBtn = $('<i id="modal-win" class="icon icon-window-maximize"></i>');
        closeBtn.css({
            'position': 'absolute',
            'top': '12px',
            'right': '8px',
            'background': 'transparent',
            'border': 'none',
            'font-weight': '700',
            'line-height': '1',
            'color': '#000',
            'text-shadow': '0 1px 0 #fff',
            'outline': '0',
            'opacity': '1',
            'font-size': '16px',
            'cursor': 'pointer'
        })
        winBtn.css({
            'position': 'absolute',
            'top': '1px',
            'right': '40px',
            'border': 'none',
            'outline': '0',
            'opacity': '1',
            'font-size': '16px',
            'cursor': 'pointer'
        })
        if (self.options.type != "HintWindow" && self.options.type != "HintWindowTF" && self.options.type != "HintWindowTFS") {
            console.log(1);
            self.title.append(closeBtn);
            self.title.append(winBtn);
        }
        closeBtn.on('click', self.close.bind(self));
        self.bigwindow();
        if (self.options.draggable == true) {
            self.draggable()
        }
        winBtn.on('click', self.bigSmall.bind(self));
        self.removefn();
        self.contents();
        self.getData();
        self.windowResize();
        //当高度自适应时，将渲染高度保存,后面bigSmall放大缩小弹框要用到
        self.renderHeight = self.container.height()
        //(self.options.draggable && !self.options.mask) &&　self.draggable();
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
                    'text-align': 'center',
                    'padding': '13px 20px',
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
                case 'HintWindow':
                    //closeBtn.css("display", "none");
                    var btnObj = self.options.buttonGroup;
                    self.title.css({
                        'padding': '0 80px 0 20px',
                        'height': '42px',
                        'line-height': '42px',
                        'background': '#F3F5FA',
                        'color': "#4D4D4D",
                        "font-size":"14px",
                        'border-top-left-radius': '2px',
                        'border-top-right-radius': '2px'
                    });
                    self.title.appendTo(self.container);
                    self.container.append(self.options.html);
                    var btnlayer = $("<div></div>");
                    btnlayer.css({
                    "text-align": "right",
                    "padding": "0 15px 12px",
                    "pointer-events": "auto",
                    "user-select": "none",
                    "-webkit-user-select": "none"
                    })
                    var defaultCss = {
                        "line-height": "28px",
                        "margin": "5px 5px 0",
                        "padding": "0 15px",
                        "background": "#45569C",
                        "color": "#FFFFFF",
                        "border-radius": "2px",
                        "font-weight": "400",
                        "cursor": "pointer",
                        "text-decoration": "none",
                        "display": "inline-block"
                    }
                    $.each(btnObj, function (k, v) {
                        var btnNode = $("<a></a>");
                        btnNode.css($.extend(defaultCss, v.css || {}))
                                .text(v.text || '')
                                .click(v.event && v.event.bind(self) || function () { });
                        btnNode.appendTo(btnlayer);
                        btnNode.click(function () {
                            self.close();
                        })
                    })
                    btnlayer.appendTo(self.container);
                    break;
                case 'HintWindowTF':
                    self.title.css({
                        'padding': '0 80px 0 20px',
                        'height': '42px',
                        'line-height': '42px',
                        'background': '#F3F5FA',
                        'color': "#4D4D4D",
                        "font-size": "14px",
                        'border-top-left-radius': '2px',
                        'border-top-right-radius': '2px'
                    });
                    self.title.appendTo(self.container);
                    self.container.append(self.options.html);
                    var btnlayer = $("<div></div>");
                    btnlayer.css({
                    "text-align": "right",
                    "padding": "0 15px 12px",
                    "pointer-events": "auto",
                    "user-select": "none",
                    "-webkit-user-select": "none"
                    })
                   
                    var btnf = $("<a>取消</a>");
                    var btn = $("<a>确认</a>");
                    btnf.css({
                        "line-height": "28px",
                        "margin": "5px 5px 0",
                        "padding": "0 15px",
                        "border": "1px solid rgba(230,230,230,1)",
                        "color": "#4D4D4D",
                        "border-radius": "2px",
                        "font-weight": "400",
                        "cursor": "pointer",
                        "text-decoration": "none",
                        "display": "inline-block"
                    })
                    btn.css({
                        "line-height": "28px",
                        "margin": "5px 5px 0",
                        "padding": "0 15px",
                        "background": "#45569C",
                        "color": "#FFFFFF",
                        "border-radius": "2px",
                        "font-weight": "400",
                        "cursor": "pointer",
                        "text-decoration": "none",
                        "display": "inline-block"
                    })
                    btn.appendTo(btnlayer);
                    btnf.appendTo(btnlayer);
                    btnlayer.appendTo(self.container);
                    btn.click(function () {
                        self.close();
                        if (self.options.fn) {
                            self.options.fn();
                        }
                    })
                    btnf.click(function () {
                        self.close();
                        if (self.options.fn1) {
                            self.options.fn1();
                        }

                    })
                    break;
                case 'HintWindowTFS':
                    self.title.css({
                        'padding': '0 80px 0 20px',
                        'height': '42px',
                        'line-height': '42px',
                        'background': '#F3F5FA',
                        'color': "#4D4D4D",
                        "font-size": "14px",
                        'border-top-left-radius': '2px',
                        'border-top-right-radius': '2px'
                    });
                    self.title.appendTo(self.container);
                    self.container.append(self.options.html);
                    var btnlayer = $("<div></div>");
                    btnlayer.css({
                        "text-align": "right",
                        "padding": "0 15px 12px",
                        "pointer-events": "auto",
                        "user-select": "none",
                        "-webkit-user-select": "none"
                    })

                    var btnf = $("<a>否</a>");
                    var btn = $("<a>是</a>");
                    var btnfs = $("<a>取消</a>");
                    btnf.css({
                        "line-height": "28px",
                        "margin": "5px 5px 0",
                        "padding": "0 21px",
                        "border": "1px solid rgb(208, 0, 0)",
                        "color": "rgb(208, 0, 0)",
                        "border-radius": "2px",
                        "font-weight": "400",
                        "cursor": "pointer",
                        "text-decoration": "none",
                        "display": "inline-block"
                    })
                    btn.css({
                        "line-height": "28px",
                        "margin": "5px 5px 0",
                        "padding": "0 15px",
                        "background": "#45569C",
                        "color": "#FFFFFF",
                        "border-radius": "2px",
                        "font-weight": "400",
                        "cursor": "pointer",
                        "text-decoration": "none",
                        "display": "inline-block"
                    })
                    btnfs.css({
                        "line-height": "28px",
                        "margin": "5px 5px 0",
                        "padding": "0 15px",
                        "border": "1px solid rgba(230,230,230,1)",
                        "color": "#4D4D4D",
                        "border-radius": "2px",
                        "font-weight": "400",
                        "cursor": "pointer",
                        "text-decoration": "none",
                        "display": "inline-block"
                    })
                    btn.appendTo(btnlayer);
                    btnf.appendTo(btnlayer);
                    btnfs.appendTo(btnlayer)
                    btnlayer.appendTo(self.container);
                    btn.click(function () {
                        self.close();
                        if (self.options.fn) {
                            self.options.fn();
                        }
                    })
                    btnf.click(function () {
                        self.close();
                        if (self.options.fn1) {
                            self.options.fn1();
                        }

                    })
                    btnfs.click(function () {
                        self.close();
                        if (self.options.fn2) {
                            self.options.fn2();
                        }

                    })
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

            try{            
                // IE下iframe会缓存，关闭弹出层同时干掉它
                self.options.onClose.bind(self)();
            } catch (err) {
                console.log('error:',err)
            }

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

        },
        draggable: function () {
            var self = this;
            self.title.css("cursor", "move").on("mousedown", function (e) {
                var e = e || window.event;
                var X, Y, iX, iY;
                var offset = self.container.offset();
                var oW = document.body.clientWidth - self.container.width(),
                    oH = document.body.clientHeight - self.container.height();
                var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
                if (scrollTop) {
                    scrollTop = scrollTop;
                } else {
                    scrollTop = 0;
                }
                X = e.clientX;
                Y = e.clientY;
                iX = e.clientX - offset.left;
                iY = e.clientY - offset.top;
                document.onmousemove = function (e) {
                    var e = e || window.event;
                    var left = e.clientX - iX;
                    var top = e.clientY - iY-scrollTop;
                    if (left < 0) {
                        left = 0;
                    }
                    if (top < 0) {
                        top = 0
                    }
                    if (left > oW) {
                        left = oW;
                    }
                    if (top > oH) {
                        top = oH;
                    }

                    self.container.css({ "transform": "none", "left": left + "px", "top": top + "px" });
                    document.onmouseup = function (e) {
                        var e = e || window.event;
                        document.onmousemove = null;
                        document.onmouseup = null;
                    };
                    return false;
                };
                document.onmouseup = function (e) {
                    var e = e || window.event;
                    document.onmousemove = null;
                    document.onmouseup = null;
                };

            })
        },
        bigSmall: function () {
            var self = this;
            var w = document.body.clientWidth;
            var h = document.body.clientHeight;
            var oldw = self.options.width;
            var oldh = self.renderHeight;
            var disw = self.container.width();
            if (disw == oldw || disw == oldw - 2) {   
                self.container.css({ "width": w + "px", "height": h + "px", "top": 0, "left": 0, "transform": "none" });
                self.container.find("#modal-win").removeClass("icon icon-window-maximize").addClass("icon icon-window-restore");
                self.title.css({ "cursor": "default" });
            }
            if (disw == w || disw == w -2 ) {
                self.container.css({ "width": oldw + "px", "height": oldh + "px", "top": "50%", "left": "50%", 'transform': 'translate(-50%,-50%)' });
                self.container.find("#modal-win").removeClass("icon icon-window-restore").addClass("icon icon-window-maximize");
                self.title.css({ "cursor": "move" });
            }
        },
        bigwindow: function () {
            var self = this;
            if (self.options.changeallow == false) {
                self.container.find("#modal-win").css("display", "none");
            }
            var w = document.body.clientWidth;
            var h = document.body.clientHeight;
            if (self.options.size == "bigwindow") {
                self.container.css({ "width": w + "px", "height": h + "px", "top": 0, "left": 0, "transform": "none" });
                self.container.find(".icon-window-maximize").removeClass().addClass("icon icon-window-restore");
            }
        },
        removefn: function () {
            var self = this;
            var len = self.container.parent().parent().find(">div").length;
            if (len > 1) {
                self.container.parent().parent().find(">div").eq(0).remove();
            }
        },
        getData: function () {
            var self = this;
            var str = "";
            str = JSON.stringify(self.options.data);
            if (self.iframe) {
                self.iframe.attr("data-Data", str);
            }
        },
        throttle: function(method, context) {
            clearTimeout(method.tId);
            method.tId = setTimeout(function () {
                method.call(context);
            }, 300);
        },
        windowResize: function () {
            var self = this;
            var oldw = self.options.width;
            var oldh = self.renderHeight;
            window.onresize = function () {
                self.throttle(function () {
                    var disw = self.container.width();
                    var width = document.documentElement.clientWidth;
                    var height = document.documentElement.clientHeight;
                    if (self.container.find("#modal-win").hasClass("icon icon-window-restore") && disw != width) {
                        self.container.css({ "width": width + "px", "height": height + "px", "top": 0, "left": 0, "transform": "none" });
                    }
                }, window)
            }
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

    $.anyDialog = window.anyDialog = function (options) {
        return new anyDialog(options);
    }
}(jQuery, document, window);