define(function (require) {
    var $ = require('jquery');
    require('jquery-ui');
    var ko = require('knockout');
    var mapping = require('knockout.mapping');
    /******************
        用谷歌tab样式 start
    ********************/
    var animationStyle, chromeTabs;
    if (document.body.style['-webkit-mask-repeat'] !== void 0) {
        $('html').addClass('cssmasks');
    } else {
        $('html').addClass('no-cssmasks');
    }
    animationStyle = document.createElement('style');
    chromeTabs = {
        init: function (options) {
            var render;
            $.extend(options.$shell.data(), options);
            options.$shell.prepend(animationStyle);
            options.$shell.find('.chrome-tab').each(function () {
                return $(this).data().tabData = {
                    data: {}
                };
            });
            render = function () {
                return options.$shell.trigger('chromeTabRender');
            };
            $(window).resize(render);
            return render();
        }
    };
    /******************
        用谷歌tab样式 end
    ********************/
    var tabModel = function () {
        var self = this;
        self.tabs = ko.observableArray();
        self.showId = ko.observable();
        self.changeShowId = function (item) {
            this.showId(item.id);
            $('.chrome-tabs-shell').find('.chrome-tab-current').removeClass('chrome-tab-current');
            $('.chrome-tabs-shell').find('.active').addClass('chrome-tab-current');
        };
        self.closeShowId = function (item) {
            this.tabs.remove(item);
            var lastItem = this.tabs()[(this.tabs().length) - 1]
            self.changeShowId(lastItem);
        }
        self.init = function () {
            window.viewModel = mapping.fromJS(self);

            //viewModel = new ViewModel();
            //debugger
            ko.applyBindings(window.viewModel, document.getElementById("main"));
            var $chromeTabsExampleShell = $('.chrome-tabs-shell')
            chromeTabs.init({
                $shell: $chromeTabsExampleShell,
                minWidth: 45,
                maxWidth: 120
            });
        };
        this.goList = function (id) {
            console.log(id);
            self.showId(id);
        };
        //iframe加载完成后的回调函数
        this.loadIframe = function (element,callBack) {
            element.load(function () {
                callBack();
            });
        }
    };
    return tabModel;

});


