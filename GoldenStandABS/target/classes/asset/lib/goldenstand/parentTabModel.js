define(function (require) {
    var $ = require('jquery');
    var ko = require('knockout');
    var mapping = require('knockout.mapping');
    var webStorage= require('gs/webStorage');

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

    function setRibbonDisabled(obj,isDisabled) {
        //设置ribbon按钮的不可用字体颜色
        if (isDisabled) {
            $(obj).css('cursor', 'no-drop');
            $(obj).children().css('color', '#ccc');
        }
        else {
            $(obj).css('cursor', 'pointer');
            $(obj).children('span').css('color', 'rgba(77,77,77,1)');
            $(obj).children('i').css('color', 'rgba(77,77,77,1)');
        }
        //if (isDisabled) $(obj).show();
        //else $(obj).hide();
    }

    var tabModel = function () {
        var self = this;
        self.tabs = ko.observableArray();
        self.showId = ko.observable();
        self.prevTab = {};//上一个tab
        self.changeShowId = function (item) {
            //在改变showId前,先记录上一个tab
            this.tabs().forEach(function (v, i) {
                //通过showId匹配tabs里tab的id
                if (v.id == self.showId()) {
                    //把showId对应的tab保存在prevTab
                    self.prevTab = v;
                    return false;
                }
            });
            this.showId(item.id);
            if (window.location.href.indexOf('productDesign') > -1) {
                //产品设计页面，业务按钮是否可用控制
                var itemName = item.name != undefined ? item.name : "";
                var rProDesign = $('.ribbonGroup a').filter("[data-action='ProductDesign']")[0];  //产品设计按钮
                var rStressTest = $('.ribbonGroup a').filter("[data-action='StressTest']")[0];    //压力测试按钮
                var rQuickStressTest = $('.ribbonGroup a').filter("[data-action='QuickStressTest']")[0];    //快速压力测试按钮
                var $ribbon = $('#DashBoard').find(".ribbonButton").find("span");
                //var spanPD = $(rProDesign).children('span .font_color')[0];
                //var spanST = $(rStressTest).children('span .font_color')[0];
                setRibbonDisabled(rProDesign, true);
                setRibbonDisabled(rStressTest, true);
                setRibbonDisabled(rQuickStressTest, true);
                if (itemName.indexOf('资产池列表') > -1 || itemName.split('_')[0] == '资产池') {
                    //资产池列表tab
                    setRibbonDisabled(rProDesign, false);
                    $.each($ribbon, function (i, v) {
                        $(v).parent().removeClass('active');
                    })
                } else if (itemName.indexOf('产品列表') > -1) {
                    //产品资产池tab
                    setRibbonDisabled(rStressTest, false);
                    setRibbonDisabled(rQuickStressTest, false);
                    $.each($ribbon, function (i, v) {
                        $(v).parent().removeClass('active');
                    })
                } else if (itemName.indexOf('Asset pool list') > -1) {
                    //产品资产池tab
                    setRibbonDisabled(rProDesign, false);
                    $.each($ribbon, function (i, v) {
                        $(v).parent().removeClass('active');
                    })
                } else if (itemName.indexOf('Product list') > -1) {
                    //产品资产池tab
                    setRibbonDisabled(rStressTest, false);
                    setRibbonDisabled(rQuickStressTest, false);
                    $.each($ribbon, function (i, v) {
                        $(v).parent().removeClass('active');
                    })
                } else if (itemName.indexOf('产品设计') > -1) {
                    //既不在资产池列表tab不在产品列表tab
                    setRibbonDisabled(rProDesign, false);
                    setRibbonDisabled(rStressTest, true);
                    setRibbonDisabled(rQuickStressTest, true);
                    $.each($ribbon, function (i, v) {
                        if (v.textContent == "产品设计向导") {
                            $(v).parent().addClass('active');
                        } else {
                            $(v).parent().removeClass('active');
                        }
                    })
                } else if (itemName.split('_')[0] == '压力测试' || itemName.indexOf('拆分与归集') > -1) {       
                    //既不在资产池列表tab不在产品列表tab
                    setRibbonDisabled(rProDesign, true);
                    setRibbonDisabled(rStressTest, false);
                    setRibbonDisabled(rQuickStressTest, true);
                    $.each($ribbon, function (i, v) {
                        if (v.textContent == "产品压力测试向导") {
                            $(v).parent().addClass('active');
                        } else {
                            $(v).parent().removeClass('active');
                        }
                    })
                } else if (itemName.indexOf('快速压力测试') > -1) {
                    //既不在资产池列表tab不在产品列表tab
                    setRibbonDisabled(rProDesign, true);
                    setRibbonDisabled(rStressTest, true);
                    setRibbonDisabled(rQuickStressTest, false);
                    $.each($ribbon, function (i, v) {
                        if (v.textContent == "快速压力测试向导") {
                            $(v).parent().addClass('active');
                        } else {
                            $(v).parent().removeClass('active');
                        }
                    })
                }
            }
            $('.chrome-tabs-shell').find('.chrome-tab-current').removeClass('chrome-tab-current');
            $('.chrome-tabs-shell').find('.active').addClass('chrome-tab-current');
        };
        self.closeShowId = function (item) {
            //先把关闭的tab移除
            this.tabs.remove(item);
            //判断移除的tab是不是当前焦点tab,不是就不改变当前焦点tab,是就改变焦点tab
            if (self.showId() == item.id) {
                //默认将要获取焦点的tab为最后一个tab
                var prevItem = this.tabs()[(this.tabs().length) - 1];
                if (prevItem.name == '产品列表') {
                    $(".chrome-tabs .chrome-tab").eq(1).trigger("click");
                    return false
                }
                self.changeShowId(prevItem);
            }
        }
        self.init = function () {
            var viewModel = mapping.fromJS(self);
            //viewModel = new ViewModel();
            ko.applyBindings(viewModel, document.getElementById("main"));
            var $chromeTabsExampleShell = $('.chrome-tabs-shell')
            chromeTabs.init({
                $shell: $chromeTabsExampleShell,
                minWidth: 45,
                maxWidth: 120
            });

            return viewModel;
        };
        this.goList = function () {
            //self.showId('');
            //var showId = webStorage.getItem('showId');
            //$('.header-nav', top.document).css('display', 'none');
            ////$('#bussinessSystem', top.document).css('display', 'none');
            ////$('#' + webStorage.getItem('showId'), top.document).addClass('z-hide');
            //$('#' + showId, top.document).addClass('z-hide');
            //$('#work', parent.document).removeClass('z-hide');
            ////$('#work', top.document)[0].contentWindow.location.replace('../navigator/main.html');
            //$('#work', top.document)[0].contentWindow.location.reload();
            //$('.ads', parent.document).css('display', '');

            //解决点击主页返回后页面空白问题
            $('.header-nav', top.document).css('display', 'none');
            //$('#bussinessSystem', top.document).css('display', 'none');
            $('#work', parent.document).removeClass('z-hide');
            $('#' + webStorage.getItem('showId'), parent.document).addClass('z-hide');
            $('#work', top.document)[0].contentWindow.location.reload();
            //window.location.replace('./index.html');
            //$('#work', top.document)[0].contentWindow.location.replace();
            $('.ads', parent.document).css('display', '');
        };
        this.resetShowId = function () {
            this.showId('');
        }
    };
    return tabModel;
});


