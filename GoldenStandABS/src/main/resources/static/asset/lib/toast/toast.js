// 简单Toast组件，需要引入toast.css 
// 注：IOCN支持字体图标,字体和背景颜色自定义
if (typeof Object.create !== 'function') {
    Object.create = function (obj) {
        function F() { }
        F.prototype = obj;
        return new F();
    };
}

; (function ($, window, document, undefined) {
    "use strict";

    var Toast = {
        _defaultType: ['success', 'error', 'info', 'warning'],

        init: function (options, elem) {
            this.prepareOptions(options, $.toast.options);
            this.process();
        },

        prepareOptions: function (options, options_to_extend) {
            var _options = {};
            if ((typeof options === 'string') || (options instanceof Array)) {
                _options.message = options;
            } else {
                _options = options;
            }
            this.options = $.extend({}, options_to_extend, _options);
        },

        process: function () {
            this.setup();
            this.addToDom();
            this.bindToast();
            this.animate();
        },

        setup: function () {
            var _toastContent = '';
            this._toastEl = this._toastEl || $('<div></div>', { class: 'jq-toast-single' });
            if (this.options.type) {
                $.inArray(this.options.type, this._defaultType) !== -1 ? this._toastEl.addClass('jq-icon-' + this.options.type) : '';
            };
            _toastContent += '<div class="jq-toast-right">';
            this.options.allowClose ? _toastContent += '<span class="jq-toast-close">&times;</span>' : '';
            this.options.title ? _toastContent += '<h2 class="jq-toast-title">' + this.options.title + '</h2>' : '';
            this.options.message ? _toastContent += '<p class="jq-toast-contnet">' + this.options.message + '</p>' : '';
            _toastContent += '</div>';

            this._toastEl.html(_toastContent);

            this.options.textColor ? this._toastEl.css("color", this.options.textColor) : '';
            this.options.textAlign ? this._toastEl.css('text-align', this.options.textAlign) : '';
            this.options.bgColor ? this._toastEl.css("background-color", this.options.bgColor) : '';
        },

        bindToast: function () {
            var that = this;

            this._toastEl.find('.jq-toast-close').on('click', function (e) {
                e.preventDefault();
                that.isClose = true
                console.info(that.isClose, '')
                that._toastEl.fadeOut(function () {
                    that._toastEl.trigger('afterHidden');
                });
            });

            if (typeof this.options.afterHidden == 'function') {
                this._toastEl.on('afterHidden', function () {
                    that.isClose = true
                    that.options.afterHidden();
                });
            };
        },

        addToDom: function () {
            var _container = $('.jq-toast-wrap');

            if (_container.length === 0) {
                _container = $('<div></div>', { class: "jq-toast-wrap" });
                $('body').append(_container);
            } else if (!this.options.stack || isNaN(parseInt(this.options.stack, 10))) {
                _container.empty();
            }

            _container.find('.jq-toast-single:hidden').remove();
            _container.append(this._toastEl);

            if (this.options.stack && !isNaN(parseInt(this.options.stack), 10)) {
                var _prevToastCount = _container.find('.jq-toast-single').length,
                    _extToastCount = _prevToastCount - this.options.stack;
                if (_extToastCount > 0) {
                    $('.jq-toast-wrap').find('.jq-toast-single').slice(0, _extToastCount).remove();
                };
            }

            this._container = _container;
        },

        canAutoHide: function () {
            return (this.options.hideTime !== false) && !isNaN(parseInt(this.options.hideTime, 10) && !this.isClose);
        },

        animate: function () {
            var that = this;
            this._toastEl.hide();
            this._toastEl.trigger('toast');
            this._toastEl.fadeIn(function () {
                that._toastEl.trigger('toast');
            });

            if (this.canAutoHide()) {
                window.setTimeout(function () {
                    that._toastEl.fadeOut(function () {
                        that._toastEl.trigger('afterHidden');
                    });
                }, this.options.hideTime);
            };
        }
    };

    $.toast = function (options) {
        var toast = Object.create(Toast);
        toast.init(options, this);
    };

    $.toast.options = {
        title: '',
        message: '',
        type: '',
        allowClose: true,
        hideTime: 1000,
        stack: 1,      // 并列显示多少个
        bgColor: '',
        textColor: '',
        textAlign: 'center',
        afterHidden: function () { }
    };

})(jQuery, window, document);