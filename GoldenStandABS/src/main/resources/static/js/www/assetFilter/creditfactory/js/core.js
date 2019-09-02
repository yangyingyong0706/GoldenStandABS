 
var Search={
    registerSearchEvent : function () {
        $(".seachShow").click(function (event) {
            event.stopPropagation();
            $(this).toggleClass("seachStyle")
            $(".filter_box").stop().slideToggle(300);
            $(".filterMask").toggleClass("filterBox_hider")
        })
        $(".clickSeach").click(function (event) {
            event.stopPropagation();
            $(".seachShow").toggleClass("seachStyle")
            $(".filter_box").stop().slideToggle(200);
            $(".filterMask").toggleClass("filterBox_hider")
        })
        $(".filter_box").click(function (event) {
            event.stopPropagation();
        })
        $(".filterMask").click(function () {
                $(".seachShow").toggleClass("seachStyle")
                $(".filter_box").stop().slideToggle(300);
                $(".filterMask").addClass("filterBox_hider")
        })
        
      
    },
}
 
 
  