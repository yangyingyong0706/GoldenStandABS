

define(['jquery', 'gs/uiFrame/js/roleOperate', 'gs/webStorage', 'gs/permission', 'Vue', 'jquery.cookie'], function ($, RoleOperate, webStorage, Permission, v) {
    Vue = v;
    var userName = RoleOperate.cookieName();
    var appName = webStorage.getItem('showId')
    function loadSiteRibbon(configURL) {
        var deferred = $.Deferred();
        $.ajax({
            url: configURL,
            
            type: 'GET',
            cache: false,
            error: function (xml) {
                deferred.reject(xml);
                alert("加载JSON文档出错!");
            },
            success: function (response) {
                //和权限做对比
                var ribbon = Permission.checkMenuPermission(response);
                renderRibbon(ribbon);
                deferred.resolve(ribbon);


            }
        });
        return deferred.promise;
    }
    function renderRibbon(data) {
        new Vue({
            el: "#DashBoard",
            data: {
                obj: data, // needs to be filtered, 需要和实际权限比较过滤一下
                state: window.state?window.state:""
            },
            methods: {
                creatLink: function (linkname, linkurl) {
                    return "javascript:gsRibbonButtonClickedEventTransfer('" + linkname + "')";
                },
                asideList: function (asideListUrl) {
                    return "javascript:asidetest('" + asideListUrl + "')";
                },
                openBottomTabIframe: function (url, showId, tabName) {
                    return "javascript:openBottomTabIframe('" + url + "','" + showId + "','" + tabName + "')";
                },
                changeActive: function (showId) {
                    $.each(this.obj.group, function (index, dom) {
                        if (dom.linkname == showId) {
                            dom.active = true;
                        }
                        else {
                            dom.active = false;
                        }
                    })
                }
            }
        })
    };
    var GSAdmin = function () {
    };
    GSAdmin.prototype = {
        init: function (configURL,callback) {
            var promise = loadSiteRibbon(configURL);
            
            promise().then(function () {
                $('#side-menu a').click(function () {
                    var $this = $(this);
                    if ($this.attr('href') == '#') return;

                    var targetApp = $this.attr('app');
                    var targetModule = $this.attr('module');

                    ribbonDefaultApp = targetApp;
                    ribbonDefaultModule = targetModule;

                });
                                

                $(window).bind("load resize", function () {
                    var topOffset = 85;
                    var width = (this.window.innerWidth > 0) ? this.window.innerWidth : this.screen.width;
                    if (width < 768) {
                        $('div.navbar-collapse').addClass('collapse');
                        topOffset = 100; // 2-row-menu
                    } else {
                        $('div.navbar-collapse').removeClass('collapse');
                    }

                    var height = ((this.window.innerHeight > 0) ? this.window.innerHeight : this.screen.height) - 1;
                    height = height - topOffset;
                    if (height < 1) height = 1;
                    if (height > topOffset) {
                        $("#page-wrapper").css("min-height", (height) + "px");
                    }
                });

                if (typeof callback === "function")
                    callback();
            });
        }
    };
    return new GSAdmin();

})


/*************************

$(function () {

    loadSiteRibbon();

    $('#side-menu a').click(function () {
        var $this = $(this);
        if ($this.attr('href') == '#') return;

        var targetApp = $this.attr('app');
        var targetModule = $this.attr('module');

        ribbonDefaultApp = targetApp;
        ribbonDefaultModule = targetModule;
        //ribbonTabGroupEnableDisable();
    });

    //Loads the correct sidebar on window load,
    //collapses the sidebar on window resize.
    // Sets the min-height of #page-wrapper to window size
    $(window).bind("load resize", function () {
        var topOffset = 85;
        var width = (this.window.innerWidth > 0) ? this.window.innerWidth : this.screen.width;
        if (width < 768) {
            $('div.navbar-collapse').addClass('collapse');
            topOffset = 100; // 2-row-menu
        } else {
            $('div.navbar-collapse').removeClass('collapse');
        }

        var height = ((this.window.innerHeight > 0) ? this.window.innerHeight : this.screen.height) - 1;
        height = height - topOffset;
        if (height < 1) height = 1;
        if (height > topOffset) {
            $("#page-wrapper").css("min-height", (height) + "px");
        }
    });
});
*****************************************/



String.prototype.format = function () {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function (match, number) {
        return typeof args[number] != 'undefined' ? args[number] : match;
    });
};

function gsRibbonButtonClickedEventTransfer(fnName) {
    //子页面取父页面的元素
    var ifr = document.getElementById(window.viewModel.showId()) || window.parent.document.getElementById((window.parent.viewModel ? window.parent.viewModel.showId() : '')) || window.parent.parent.document.getElementById((window.parent.parent.viewModel ? window.parent.parent.viewModel.showId() : ''))
    var win = ifr.window || ifr.contentWindow;

    if (win && win[fnName] && typeof win[fnName] === 'function') {
        
        win[fnName]();
    }
    $(".ribbonButton").click(function () {
        $(this).parents("#DashBoard").find(".ribbonButton").removeClass("active")
        $(this).addClass("active")
    })
}

function openBottomTabIframe(url,showId,tabName) {
    var pass = true;
    viewModel.tabs().forEach(function (v, i) {
        if (v.id == showId) {
            pass = false;
            viewModel.changeShowId(v);
            return false;
        }
    })
    if (pass) {
        var newTab = {
            id: showId,
            url: url,
            name: tabName,
            disabledClose: false
        };
        viewModel.tabs.push(newTab);
        viewModel.changeShowId(newTab);
    };
}
