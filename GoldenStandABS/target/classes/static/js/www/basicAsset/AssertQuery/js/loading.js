define(function () {
    var loading = function () {
        function show(text) {
            close();
            //if (typeof (text) == undefined || text == null) {
            //    text = '数据加载中，请稍后...';
            //}
            //var html = '<div id="loading" class="loadpage">' +
            //     '<div class="loading-wraper">' +
            //     ' <i class="icon-cog bigicon am-rotate pa"></i>' +
            //     ' <i class="icon-cog smicon am-rotate pa"></i>' +
            //     ' <p class="text pa">' + text + '</p>' +
            //     '</div>' +
            //     '</div>'
            //var html = '<div id="loading">' +
		    //        '<div id="loading-center">'+
			//            '<div id="loading-center-absolute">'+
			//	            '<div class="object" id="object_one"></div>'+
			//	            '<div class="object" id="object_two"></div>'+
			//	            '<div class="object" id="object_three"></div>'+
			//	            '<div class="object" id="object_four"></div>'+
			//	            '<div class="object" id="object_five"></div>'+
			//	            '<div class="object" id="object_six"></div>'+
			//	            '<div class="object" id="object_seven"></div>'+
			//	            '<div class="object" id="object_eight"></div>'+
			//	            '<div class="object" id="object_big"></div>'+
			//            '</div>'+    
		    //        '</div>'+
	        //    '</div>'
            var html = '<div id = "loading" class = "loadingBox">' +
	                    '<img src="../../../asset/img/loading-image.gif"/>' +
                    '</div>'
            var div = document.createElement("div");
            div.innerHTML = html;
            document.body.appendChild(div);
        }


        function close() {
            var _element = document.getElementById('loading');
            if (_element) {
                var _parentElement = _element.parentNode;
                if (_parentElement) {
                    _parentElement.removeChild(_element);
                }
            }
        }

        function alertMsg(text, status) {
            var alert_tip = $('#alert-tip');
            var icon = 'icon-attention';
            var color = '#f33737';
            switch (status) {

                case 0://提醒
                    icon = 'icon-attention';
                    color = '#f33737';
                    break;
                case 1://成功
                    icon = 'icon-ok';
                    color = '#66bb6a';
                    break;
            }

            if (!alert_tip[0]) {
                var $alert = $('<div id="alert-tip" class="alert_tip am-scale-up"/>');
                var $temp = $('<div class="alert_content">' +
                                '<i class="' + icon + '" style="color:' + color + '"></i>' +
                                //'<p class="warning-text">' + text + '</p>' +
                            '</div>');
                $temp.appendTo($alert);
                $alert.appendTo(document.body);
                setTimeout(function () {
                    $('#alert-tip').fadeOut(function () {
                        $(this).remove();
                    });
                }, 1000);
            }
        }


        return {
            show: show,
            close: close,
            alertMsg: alertMsg
        }
    }

    return new loading();
});