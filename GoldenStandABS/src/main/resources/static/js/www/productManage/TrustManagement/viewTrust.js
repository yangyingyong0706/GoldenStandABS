
define(function (require) {
 
    var $ = require('jquery');
    

    var common = require('common');
    var gsUtil = require('gsUtil');

 


    var trustId = gsUtil.getQueryString('tid');
    var tab = gsUtil.getHashValue('tab');
    var trustPoolCloseDate;


    // 页面载入
    $('.nav-tab li a').click(function (event) {
  
        event.preventDefault();
        var $this = $(this);
        var attrTab = $this.attr('tab');

        if (!trustId || isNaN(trustId) || trustId <= 0) {
            //if (attrTab != 'trustwizard')
            //    return false;
            if (attrTab != 'trustwizard')
                return false;
        }

        $this.closest('li').siblings().find('a').removeClass('active');
        $this.addClass('active');
        var url = $this.attr('href');
        common.setHashValue('tab', attrTab); 
        $.ajax({
            type: 'get',
            cache: false,
            url: url + (url.indexOf('?') < 0 ? '?' : '&') + 'random=' + Math.random(),
            dataType: 'html',
            success: function (res) {
                $('#html').empty();
                $('#html').html(res)
                autoLayout(columns(col));

            }
        });
    });
    if (!tab) tab = $('.nav-tab li a').eq(0).attr('tab');
    var tabSelector = '.nav-tab li a[tab="' + tab + '"]';
    $(tabSelector).click()

    

    // 布局切换
    $(document).on('click', '#changeCols', function () {
        var $this = $(this);
        col = $this.attr('data-col');
        autoLayout(columns(col));
        if (col == 2) {
            $(this).attr('data-col', '3').html('三栏布局');
        } else {
            $(this).attr('data-col', '2').html('两栏布局');
        }
    });
    
});

       
