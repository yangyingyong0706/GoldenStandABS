// JavaScript source code

define(function () {
    var stairsNavgation = function () {
        function bindStairsNavgation() {
            var _index = 0;
            var win = $(window); //得到窗口对象
            var sc = $(document);//得到document文档对象。
            var topArr = [];

            //$(".menu ul li").find("span").removeClass("active");
            //$(".menu ul li").eq(0).find("span").addClass("active")

           
            
            $('#main').scroll(function () {
                var Top = sc.scrollTop();
                var Li = $(".menu ul li").not("#backup");
               
                $(".view-work-body").children().each(function () {
                    var Top = sc.scrollTop();
                    if (Top > $(this).offset().top) {
                        $('.menu').hide()
                        $('.menu').eq($(this).index()).show();
                    }
                })

                $(".ec-row").each(function (index) {
                    if (Top > $(".ec-row").eq(index).offset().top - 2 && Top < $(".ec-row").eq(index + 1).offset().top - 2) {
                        $(Li).siblings().find("span").removeClass("active");
                        $(Li).eq(index).find('span').addClass('active') 
                    }
                })


                //if (Top < $("#louti2").offset().top - 100) {
                //    $(Li).siblings().find("span").removeClass("active");
                //    $(Li).eq(0).find('span').addClass('active')
                //} else if (Top >= $("#louti2").offset().top - 100 && Top < $("#louti3").offset().top - 100) {
                //    $(Li).siblings().find("span").removeClass("active");
                //    $(Li).eq(1).find('span').addClass('active')
                //} else if (Top >= $("#louti3").offset().top - 100 && Top < $("#louti4").offset().top - 100) {

                //    $(Li).siblings().find("span").removeClass("active");
                //    $(Li).eq(2).find('span').addClass('active')
                //} else if (Top >= $("#louti4").offset().top - 100 && Top < $("#louti5").offset().top - 100) {

                //    $(Li).siblings().find("span").removeClass("active");
                //    $(Li).eq(3).find('span').addClass('active')
                //} else if (Top >= $("#louti5").offset().top - 100 && Top < $("#louti6").offset().top - 100) {

                //    $(Li).siblings().find("span").removeClass("active");
                //    $(Li).eq(4).find('span').addClass('active')
                //} else if (Top >= $("#louti6").offset().top - 100 && Top < $("#louti7").offset().top - 100) {

                //    $(Li).siblings().find("span").removeClass("active");
                //    $(Li).eq(5).find('span').addClass('active')
                //} else if (Top >= $("#louti7").offset().top - 100 && Top < $("#louti8").offset().top - 100) {

                //    $(Li).siblings().find("span").removeClass("active");
                //    $(Li).eq(6).find('span').addClass('active')
                //} else if (Top >= $("#louti8").offset().top - 100 && Top < $("#louti9").offset().top - 100) {

                //    $(Li).siblings().find("span").removeClass("active");
                //    $(Li).eq(7).find('span').addClass('active')
                //}
            });

            $(document).on("click", ".menu ul li", function () {
                if (this.id == "backup") {
                    _top = 0
                } else {
                    _top = $(".ec-row").eq($(".menu ul li").not("#backup").index($(this))).offset().top

                }
                console.log(_top, $(".menu ul li").index($(this)), topArr)

                var that = $(this)
                //scrollTop滚动到对应高度
                $("#main").animate({ scrollTop: _top }, 500, function () {
                    $(".menu ul li span").removeClass("active");
                    that.find("span").addClass("active");
                });

            });
        };

        return {
            bindStairsNavgation: bindStairsNavgation
        }
    }

    return stairsNavgation();
})
