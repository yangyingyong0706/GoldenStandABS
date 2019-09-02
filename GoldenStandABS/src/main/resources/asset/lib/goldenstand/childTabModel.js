define(function (require) {
    var $ = require('jquery');
    require('jquery-ui');
    var ko = require('knockout');
    var mapping = require('knockout.mapping');
    var webStorage = require('gs/webStorage');
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
    function setRibbonDisabled(obj, isDisabled) {
        //设置ribbon按钮的不可用字体颜色
        if (isDisabled) {
            $(obj).css('cursor', 'no-drop');
            $(obj).children().css('color', '#ccc');
        }
        else {
            $(obj).css('cursor', 'pointer');
            $(obj).children('span').css('color', 'rgba(69,86,156,1)');
            $(obj).children('i').css('color', 'rgba(69,86,156,1)');
        }
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
            if (window.location.href.indexOf('basicAsset') > -1) {
                var itemName = item.name != undefined ? item.name : "";
                var $DataTemplateImportNavigator = $('.ribbonGroup a').filter("[data-action='DataTemplateImportNavigator']")[0];    //数据模板选择向导
                var $ImportAssetNavigator = $('.ribbonGroup a').filter("[data-action='ImportAssetNavigator']")[0];    //资产导入向导
                var $ribbon = $('#DashBoard').find(".ribbonButton").find("span");
                setRibbonDisabled($ImportAssetNavigator, true);
                setRibbonDisabled($DataTemplateImportNavigator, true);
                if (itemName.indexOf('基础资产一览') > -1) {
                    setRibbonDisabled($ImportAssetNavigator, false);
                    setRibbonDisabled($DataTemplateImportNavigator, false);
                    $.each($ribbon, function (i, v) {
                        $(v).parent().removeClass('active');
                    })
                } else if (itemName.indexOf('数据模板选择向导') > -1) {
                    setRibbonDisabled($DataTemplateImportNavigator, false);
                    $.each($ribbon, function (i, v) {
                        if (v.textContent == "数据模板选择向导") {
                            $(v).parent().addClass('active');
                        } else {
                            $(v).parent().removeClass('active');
                        }
                    })
                } else if (itemName.indexOf('资产导入向导') > -1) {
                    setRibbonDisabled($ImportAssetNavigator, false);
                    $.each($ribbon, function (i, v) {
                        if (v.textContent == "资产导入向导") {
                            $(v).parent().addClass('active');
                        } else {
                            $(v).parent().removeClass('active');
                        }
                    })
                } else {
                    $.each($ribbon, function (i, v) {
                        $(v).parent().removeClass('active');
                    })
                }
            }
            if (window.location.href.indexOf('riskManagement') > -1) {
                var itemName = item.name != undefined ? item.name : "";
                var $ribbon = $('#DashBoard').find(".ribbonButton").find("span");
                if (itemName.indexOf('投后总览') > -1) {
                    $.each($ribbon, function (i, v) {
                        if (v.textContent == "投后总览") {
                            $(v).parent().addClass('active');
                        } else {
                            $(v).parent().removeClass('active');
                        }
                    })
                } else if (itemName.indexOf('投后数据') > -1) {
                    $.each($ribbon, function (i, v) {
                        if (v.textContent == "投后数据") {
                            $(v).parent().addClass('active');
                        } else {
                            $(v).parent().removeClass('active');
                        }
                    })
                } else if (itemName.indexOf('投后检查') > -1) {
                    $.each($ribbon, function (i, v) {
                        if (v.textContent == "投后检查") {
                            $(v).parent().addClass('active');
                        } else {
                            $(v).parent().removeClass('active');
                        }
                    })
                } else if (itemName.indexOf('信息披露') > -1) {
                    $.each($ribbon, function (i, v) {
                        if (v.textContent == "信息披露") {
                            $(v).parent().addClass('active');
                        } else {
                            $(v).parent().removeClass('active');
                        }
                    })
                } else if (itemName.indexOf('风险预警') > -1) {
                    $.each($ribbon, function (i, v) {
                        if (v.textContent == "风险预警") {
                            $(v).parent().addClass('active');
                        } else {
                            $(v).parent().removeClass('active');
                        }
                    })
                } else {
                    $.each($ribbon, function (i, v) {
                        $(v).parent().removeClass('active');
                    })
                }
            }
            if (window.location.href.indexOf('managementDataCenter') > -1) {
                var itemName = item.name != undefined ? item.name : "";
                var $ribbon = $('#DashBoard').find(".ribbonButton").find("span");
                if (itemName.indexOf('产品列表') > -1 || itemName.indexOf('产品切片') > -1) {
                    $.each($ribbon, function (i, v) {
                        if (v.textContent == "产品列表") {
                            $(v).parent().addClass('active');
                        } else {
                            $(v).parent().removeClass('active');
                        }
                    })
                } else if (itemName.indexOf('资产查询') > -1) {
                    $.each($ribbon, function (i, v) {
                        if (v.textContent == "资产查询") {
                            $(v).parent().addClass('active');
                        } else {
                            $(v).parent().removeClass('active');
                        }
                    })
                }
            }
            if (window.location.href.indexOf('basicData') > -1) {
                var itemName = item.name != undefined ? item.name : "";
                var $ribbon = $('#DashBoard').find(".ribbonButton").find("span");
                if (itemName == '系统设置') {
                    $.each($ribbon, function (i, v) {
                        $(v).parent().removeClass('active');
                    })
                } else if (itemName.indexOf('工具') > -1) {
                    $.each($ribbon, function (i, v) {
                        if (v.textContent == "工具") {
                            $(v).parent().addClass('active');
                        } else {
                            $(v).parent().removeClass('active');
                        }
                    })
                } else if (itemName.indexOf('日志') > -1) {
                    $.each($ribbon, function (i, v) {
                        if (v.textContent == "日志") {
                            $(v).parent().addClass('active');
                        } else {
                            $(v).parent().removeClass('active');
                        }
                    })
                } else if (itemName.indexOf('数据管理') > -1) {
                    $.each($ribbon, function (i, v) {
                        if (v.textContent == "数据管理") {
                            $(v).parent().addClass('active');
                        } else {
                            $(v).parent().removeClass('active');
                        }
                    })
                } else if (itemName.indexOf('测试') > -1) {
                    $.each($ribbon, function (i, v) {
                        if (v.textContent == "测试") {
                            $(v).parent().addClass('active');
                        } else {
                            $(v).parent().removeClass('active');
                        }
                    })
                } else {
                    $.each($ribbon, function (i, v) {
                        $(v).parent().removeClass('active');
                    })
                }
            }
            if (window.location.href.indexOf('productManage') > -1) {
                //产品管理页面，业务按钮是否可用控制
                var itemName = item.name != undefined ? item.name : "";
                var $ReportManagement = $('.ribbonGroup a').filter("[data-action='ReportManagement']")[0];  //存续报告
                var $RevolvePurchase = $('.ribbonGroup a').filter("[data-action='RevolvePurchase']")[0];    //循环购买向导
                var $MangeTrust = $('.ribbonGroup a').filter("[data-action='MangeTrust']")[0];    //产品维护
                var $AddTrust = $('.ribbonGroup a').filter("[data-action='AddTrust']")[0];    //新建产品向导
                
                var $ribbon = $('#DashBoard').find(".ribbonButton").find("span");
                setRibbonDisabled($ReportManagement, true);
                setRibbonDisabled($RevolvePurchase, true);
                setRibbonDisabled($MangeTrust, true);
                setRibbonDisabled($AddTrust, true);
                if (itemName.indexOf('产品列表') > -1) {
                    setRibbonDisabled($ReportManagement, false);
                    setRibbonDisabled($RevolvePurchase, false);
                    setRibbonDisabled($MangeTrust, false);
                    setRibbonDisabled($AddTrust, false);
                    $.each($ribbon, function (i, v) {
                        $(v).parent().removeClass('active');
                    })
                } else if (itemName.indexOf('新建产品') > -1) {
                    //setRibbonDisabled($ReportManagement, true);
                    //setRibbonDisabled($RevolvePurchase, true);
                    //setRibbonDisabled($MangeTrust, true);
                    setRibbonDisabled($AddTrust, false);
                    $.each($ribbon, function (i, v) {
                        if (v.textContent == "新建产品向导") {
                            $(v).parent().addClass('active');
                        } else {
                            $(v).parent().removeClass('active');
                        }
                    })
                } else if (itemName.indexOf('产品维护') > -1) {
                    //setRibbonDisabled($ReportManagement, true);
                    //setRibbonDisabled($RevolvePurchase, true);
                    setRibbonDisabled($MangeTrust, false);
                    //setRibbonDisabled($AddTrust, true);
                    $.each($ribbon, function (i, v) {
                        if (v.textContent == "产品维护向导") {
                            $(v).parent().addClass('active');
                        } else {
                            $(v).parent().removeClass('active');
                        }
                    })
                } else if (itemName.indexOf('循环购买') > -1) {
                    //setRibbonDisabled($ReportManagement, true);
                    setRibbonDisabled($RevolvePurchase, false);
                    //setRibbonDisabled($MangeTrust, true);
                    //setRibbonDisabled($AddTrust, true);
                    $.each($ribbon, function (i, v) {
                        if (v.textContent == "循环购买向导") {
                            $(v).parent().addClass('active');
                        } else {
                            $(v).parent().removeClass('active');
                        }
                    })
                } else if (itemName.indexOf('存续报告') > -1 || itemName.indexOf('向导一') > -1 || itemName.indexOf('向导二') > -1 || itemName.indexOf('向导三') > -1) {
                    setRibbonDisabled($ReportManagement, false);
                    //setRibbonDisabled($RevolvePurchase, true);
                    //setRibbonDisabled($MangeTrust, true);
                    //setRibbonDisabled($AddTrust, true);
                    $.each($ribbon, function (i, v) {
                        if (v.textContent == "存续报告向导") {
                            $(v).parent().addClass('active');
                        } else {
                            $(v).parent().removeClass('active');
                        }
                    })
                } else {
                    $.each($ribbon, function (i, v) {
                         $(v).parent().removeClass('active');
                    })
                }
            }
            $('.chrome-tabs-shell').find('.chrome-tab-current').removeClass('chrome-tab-current');
            $('.chrome-tabs-shell').find('.active').addClass('chrome-tab-current');
        };
        self.closeShowId = function (item) {
            //先把关闭的tab移除
            this.tabs.remove(item);   
            reloadReport(item)
            //判断移除的tab是不是当前焦点tab,不是就不改变当前焦点tab,是就改变焦点tab
            if (self.showId() == item.id) {
                //默认将要获取焦点的tab为最后一个tab
                var prevItem = this.tabs()[(this.tabs().length) - 1];
                this.tabs().forEach(function (v, i) {
                    //changeShowId()时会记录prevTab
                    if (self.prevTab == v) {
                        //移除的tab不是prevTab，则将要获取焦点的tab为prevTab
                        prevItem = self.prevTab;
                        return false;
                    }
                });
                self.changeShowId(prevItem);
            }
        }
        self.init = function () {
            window.viewModel = mapping.fromJS(self);

            //viewModel = new ViewModel();
            ko.applyBindings(window.viewModel, document.getElementById("main"));
            var $chromeTabsExampleShell = $('.chrome-tabs-shell')
            chromeTabs.init({
                $shell: $chromeTabsExampleShell,
                minWidth: 45,
                maxWidth: 120
            });
        };
        this.goList = function (id) {
            //解决点击主页返回后页面空白问题
            if (id == undefined) {
                $('.header-nav', top.document).css('display', 'none');
                //$('#bussinessSystem', top.document).css('display', 'none');
                $('#work', parent.document).removeClass('z-hide');
                $('#' + webStorage.getItem('showId'), parent.document).addClass('z-hide');
                $('#work', top.document)[0].contentWindow.location.reload();
                //window.location.replace('./index.html');
                //$('#work', top.document)[0].contentWindow.location.replace();
                $('.ads', parent.document).css('display', '');
            } else { 
            self.showId(id);
            var showId = webStorage.getItem('showId');
            $('.header-nav', top.document).css('display', 'none');
            //$('#bussinessSystem', top.document).css('display', 'none');
            //$('#' + webStorage.getItem('showId'), top.document).addClass('z-hide');
            $('#' + showId, top.document).addClass('z-hide');
            $('#work', parent.document).removeClass('z-hide');
            $('#work', top.document)[0].contentWindow.location.reload();
            $('.ads', parent.document).css('display', '');
            }
        };
        //iframe加载完成后的回调函数
        this.loadIframe = function (element,callBack) {
            element.load(function () {
                callBack();
            });
        }
    };
    return tabModel;


    //产品管理下面报告向导模块打开具体向导操作完以后，关闭向导Iframe后，报告向导要刷新
    function reloadReport(item) {
        if(!item.name) return false
        if (item.name.indexOf('向导一') != -1 || item.name.indexOf('向导二') != -1 || item.name.indexOf('向导三') != -1) {
            $('iframe[src*=reportGuide]')[0].contentWindow.location.reload(true);
        }
    }



});


