
define(function (require) {
    var d3 = require('d3v3');
    var $ = require('jquery')
    var common = require('common');
    var GlobalVariable = require('globalVariable');
    var webStorage = require("gs/webStorage");
    var userName = webStorage.getItem('gs_UserName');
    var trustId = common.getQueryString('tid');
    var originData = [];//缓存远程获取的原始数据
    var GSDialog = require("gsAdminPages");
    //绘图初始化标志位，仅初始化一次
    var isInited = false;
    var test
    //绘图数据源
    var xScale, yScale, xBar, yBar, xAaix, yAaix, xInner, yInner, xInnerBar, yInnerBar, tipsValue;
    var dataSource = [],
    
    //记录已选择的专项计划列表
    selectedTrust = '',
     lines = [],
     xMarks = [],
     lineNames = [],
     lineColor = ['#1489bc', '#c01414', '#15b443'],
     w = $('.svg_warp').width(),
     h = $('.svg_warp').height(),
     padding = 90,
     currentLineNum = 0;

    var head_height = padding - 20,
    title = '资金收支预测图',
    subTitle = 'goldenstand',
    foot_height = padding;
    var dataNum = 6;
    var svg = d3.select('.svg_warp')
             .append('svg')
             .attr('width', "100%")
             .attr('height', "100%");

    svg.append('g')
        .append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', "100%")
        .attr('height', "100%")
        .style('fill', '#ffffff')
        .style('stroke-width', 2)
        .style('stroke', '#e7e7e7');

    if (title !== '') {
        svg.append('g')
           .append('text')
           .text(title)
           .attr('class', 'title')
           .attr('x', "50%")
           .attr('y', head_height);
            head_height += 30;
    }

    if (subTitle !== '') {
        svg.append('g')
        .append('text')
        .text(subTitle)
        .attr('class', 'subTitle')
        .attr('x', "50%")
        .attr('y', head_height);
        head_height += 20;
    }
    var legend = svg.append('g');
    
    //获取远程数据
    function getData(trustIdList) {
        var dtd = $.Deferred();
        oldData = dataSource;
        trustIdXml = assembleXml(trustIdList)
        //获取数据
        var executeParaminfo = {
            SPName: '[Asset].[usp_GetAssetLiquid]',
            SQLParams: [
                {
                    Name: '@trustId',
                    value: trustIdXml,
                    DBType: 'xml'
                }
            ]
        };
        var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
        common.ExecuteGetData(true, svcUrl, 'TrustManagement', executeParaminfo, function (data) {
            //存储过程保留两位小数
            test = data[0].Column1;
            if (data[0].Column1 == -1) {
                data = []
                GSDialog.HintWindow('该专项计划暂无有效现金流，请重新选择!');
              
                //清空Chart
                clearChartAndTableResetisInited();
                $('#nodataToChart').show();
                $('#nodataToTable').show();
            }
            else {
                originData = data
                var interval = $('#xAaixTick').val();   //数据间隔几个月
                if (data && data.length > 0) {
                    $("#nodataToChart").hide();
                    $("#nodataToTable").hide();
                    var formatData = getDataByMonth(interval, data)
                    dataSource = [[], [], []];
                    //清空横轴单位
                    xMarks = [];
                    if (formatData.length > 0) {
                        $.each(formatData, function (i, v) {
                            dataSource[0].push(v.TotalAmount);
                            dataSource[1].push(-1 * v.TotalExpend);
                            dataSource[2].push(v.SpreadPrice);
                            xMarks.push(v.DatePoint)
                        })
                        if (!isInited) {
                            initDraw();
                        }
                        loadDataToTable(formatData);
                    }

                    dtd.resolve();
                }
            }
            $('#mask').hide();
            $('#mask-chart').hide();
           
        })
       
        return dtd.promise()
    }

    $.when(init())
　　.done(function () {

    $('#xAaixTick').change(function () {
        var val = $(this).val()
        setTimeout(function () {

            selectTick(val)
        }, 10)
    })
})

    //清空chart，重置初始化标志位
    function clearChartAndTableResetisInited() {
        //清空表格
        $('#dataList').empty();
        $('#page_navigation').empty();
        //清空chart
    }
    function initDraw() {
        lineNames = ['收入', '支出', '差值'];
        //模拟数据
        w = $(".svg_warp").width()
        h = $(".svg_warp").height()
        //判断是否为多维数组，如果不是，则转化为多维数组
        if (!(dataSource[0] instanceof Array)) {
            var tempArr = [];
            tempArr.push(dataSource);
            dataSource = tempArr
        }

        currentLineNum = dataSource.length;

        //foot_height += 25;


        maxdata = getMaxData(dataSource);
        mindata = getMinData(dataSource);
        //横坐标比例尺
        xScale = d3.scale.linear()
                   .domain([0, dataSource[0].length - 1])
                   .range([padding, w - padding])
        //纵坐标比例尺
        yScale = d3.scale.linear()
                   .domain([mindata, maxdata])
                   .range([h - foot_height, head_height]);
        //定义横轴网格线
        xInner = d3.svg.axis()
                   .scale(xScale)
                   .tickSize(-(h - head_height - foot_height), 0, 0)
                   .tickFormat('')
                   .orient('bottom')
                   .ticks(dataSource[0].length);
        xInnerBar = svg.append("g")
                   .attr('class', 'inner_line')
                   .attr('transform', 'translate(0,' + (h - padding) + ")")
                   .call(xInner)

        //定义纵轴网格线
        yInner = d3.svg.axis()
                    .scale(yScale)
                    .tickSize(-(w - padding * 2), 0, 0)
                    .tickFormat('')
                    .orient('left')
                    .ticks(10)
        //添加纵轴网格线
        yInnerBar = svg.append('g')
                       .attr('class', 'inner_line')
                       .attr('transform', 'translate(' + padding + ',0)')
                       .call(yInner);

        var translateL = (maxdata - 0) / (maxdata - mindata);
        var xAaixTran = getxAaixTran(dataSource)?getxAaixTran(dataSource):-10  //横坐标的垂直偏移量
        //定义横轴
        xAaix = d3.svg.axis()
                   .scale(xScale)   //指定比例尺
                   .orient('bottom') //指定方位
                   .ticks(dataSource[0].length);  //指定刻度数
        //添加横轴坐标轴
        xBar = svg.append('g')
                   .attr('class', 'axis')
                   .attr('transform', 'translate(0,' + xAaixTran + ')')
                   .call(xAaix);
        xBar.selectAll("text").text(function (d) { return xMarks[d]; }).attr('transform', 'rotate(30)translate(20,0)').style('text-anchor', 'start');
      
        yAxis = d3.svg.axis()
                 .scale(yScale)
                 .orient('left')
                 .ticks(10)

        //添加纵轴
        yBar = svg.append('g')
               .attr('class', 'axis')
               .attr('transform', "translate(" + padding + ',0)')
               .call(yAxis);

        //添加图
        addLegend();
        lines = [];
        for (let i = 0; i < currentLineNum; i++) {   //currentLineNum为dataSource的长度
            var newLine = new CrystalLineObject();
            newLine.init(i)
            lines.push(newLine)
        }
        isInited = true;
    }

    
     
    function submitTrusts() {
        $('#mask-chart').show()
        var $trustIds = $('#trustSelector').find('input:checked');
        console.log($trustIds.length)
        var list = [];
        $trustIds.each(function () {
            list.push(this.value);
        })
        $.when(getData(list)).done(function () {
            $('#mask-chart').hide()
            drawChart();
        }
      )
    }

    function init() {
        getAllTrustList(renderTrustCheckList);
        //判断URL中是否带有参数trustId
        var trustId = common.getQueryString('trustId');
        if (trustId) {
            var $trust = $('#trustSelector .check-list').find("input") && $('#trustSelector .check-list').find("input[value =" + trustId + "]");
            //debugger;
            if ($trust) {
                $trust.trigger("click");
                $('#submitTrusts').trigger("click");
            }
        } else {
        // 加载专项计划列表并渲染页面
        
        //默认以列表中第一个trustId作图
        var $firstTrust = $('#trustSelector .check-list').find("input") && $('#trustSelector .check-list').find("input").eq(0);
        if ($firstTrust) {
            $firstTrust.trigger("click");
            $('#submitTrusts').trigger("click");
        }

        }
               
    }
    function resizehandler() {
        if (test == "-1") {
            return
        } else {
            $(".svg_warp").find("svg").remove();
            svg = d3.select('.svg_warp')
            .append('svg')
            .attr('width', "100%")
            .attr('height', "100%");

            svg.append('g')
           .append('rect')
           .attr('x', 0)
           .attr('y', 0)
           .attr('width', "100%")
           .attr('height', "100%")
           .style('fill', '#fff')
           .style('stroke-width', 2)
           .style('stroke', '#e7e7e7');

            if (title !== '') {
                svg.append('g')
                   .append('text')
                   .text(title)
                   .attr('class', 'title')
                   .attr('x', "50%")
                   .attr('y', 70);
            }

            if (subTitle !== '') {
                svg.append('g')
                .append('text')
                .text(subTitle)
                .attr('class', 'subTitle')
                .attr('x', "50%")
                .attr('y', 100);
            }
            legend = svg.append('g');
            initDraw()
        }

    }
    function throttle(method, context) {
        clearTimeout(method.tId);
        method.tId = setTimeout(function () {
            method.call(context);
        }, 100);
    }
    //reload视图,自适应
    window.onresize = function () {
        throttle(resizehandler, window);

    }
    //右侧收缩按钮
    $("#slcstart").click(function () {
        if (!$("#flex_area").hasClass('rightnow')) {
            $("#flex_area").addClass("rightnow");
            $(".fixed_control>i").addClass("rot_left");
            $(".svg_warp").addClass("content_startmove");
            var timer = null;
            clearTimeout(timer);
            timer = setTimeout(function () {
                window.onresize()
            }, 300)
        } else {
            $("#flex_area").removeClass("rightnow");
            $(".fixed_control>i").removeClass("rot_left");
            $(".svg_warp").removeClass("content_startmove");
            var timer = null;
            clearTimeout(timer);
            timer = setTimeout(function () {
                window.onresize()
            }, 300)
        }
    })

    //定义折线类
    function CrystalLineObject() {
        var xAaixTran = getxAaixTran(dataSource)   //获取横坐标的垂直偏移量
        this.group = null;
        this.path = null;
        this.oldData = [];
        this.init = function (id) {
            var arr = dataSource[id];
            //debugger;
            this.group = svg.append('g');
            if (id == 2) {
                var line = d3.svg.area()
                      .x(function (d, i) { return xScale(i) })
                      .y0(xAaixTran)
                      .y1(function (d) {
                          return yScale(d)
                      })
                      .interpolate('monotone')
            } else {
                var line = d3.svg.line()
                         .x(function (d, i) { return xScale(i) })
                         .y(function (d) { return yScale(d) })
                         .interpolate('monotone')

            }
            this.path = this.group.append('path')
                .attr("d", line(arr))
                .style("fill", "none")
                .style("stroke-width", 1)
                .style("stroke", lineColor[id])
                .style("stroke-opacity", 0.9);
            if (id == 2) {
                this.path.style("fill", "rgba(32, 221, 34, 0.1)")
            }

            //添加小圆点
            this.group.selectAll('circle')
                .data(arr)
                .enter()
                .append('circle')
                //.attr('cx', function (d, i) {
                //    return xScale(i)
                //})
                .attr('cx', line.x())
                .attr('cy', line.y())
                .attr('r', 3)
                .attr('fill', lineColor[id])
                .on('mouseover', function (d, i) {
                    
                    //鼠标移动到点上让点变大
                    d3.select(this).transition().duration(10).attr('r', 5);
                    //将y坐标值赋给tipsValue
                    tipsValue = d;

                    //选择tips框并且让其跟着鼠标走
                    var tooltip = d3.select(".tips")
                        .style("top", (event.pageY - 10) + "px")
                        .style("left", (event.pageX + 10) + "px")
                        .style('display', 'block');

                    //给tips里面赋值
                    d3.select(".dateTip").text("时间：" + xMarks[i]);
                    d3.select(".dateValue").text("数据值：" + tipsValue);

                })
                .on('mouseout', function () {
                    //鼠标移开让点变小
                    d3.select(this).transition().duration(10).attr('r', 3);
                    //tips框隐藏
                    d3.select('.tips').style('display', 'none');

                });

            this.oldData = arr;
        }

        this.moveBegin = function (id) {
            var arr = dataSource[id];
            var olddata = this.oldData;

            var line = d3.svg.line()
                            .x(function (d, i) {
                                if (i >= olddata.length) return w - padding; else return xScale(i)
                            })
                            .y(function (d, i) {
                                if (i >= olddata.length) return h - foot_height; else return yScale(olddata[i]);
                            })
                            .interpolate('monotone')
            //路径初始化
            this.path.attr('d', line(arr));

            //截断旧数据
            var tempData = olddata.slice(0, arr.length);
            var circle = this.group.selectAll('circle').data(tempData);
            //截断多余的圆点
            circle.exit().remove();
            //圆点初始化，添加圆点，多出来的到右侧底部
            this.group.selectAll('circle')
                .data(arr)
                .enter()
                .append('circle')
                .attr('fill', lineColor[id])
                .attr('cx', function (d, i) {
                    if (i > olddata.length) return w - padding; else return xScale(i);
                })
                .attr('cy', function (d, i) {
                    if (i > olddata.length) return h - foot_height; else return yScale(d);
                })
                .attr('r', 3)
                .on('mouseover', function (d, i) {

                    //鼠标移动到点上让点变大
                    d3.select(this).transition().duration(10).attr('r', 5);
                    //将y坐标值赋给tipsValue
                    tipsValue = d;

                    //选择tips框并且让其跟着鼠标走
                    var tooltip = d3.select(".tips")
                        .style("top", (event.pageY - 10) + "px")
                        .style("left", (event.pageX + 10) + "px")
                        .style('display', 'block');

                    //给tips里面赋值
                    d3.select(".dateTip").text("时间：" + xMarks[i]);
                    d3.select(".dateValue").text("数据值：" + tipsValue);

                 })
                 .on('mouseout', function () {
                        //鼠标移开让点变小
                        d3.select(this).transition().duration(10).attr('r', 3);
                        //tips框隐藏
                        d3.select('.tips').style('display', 'none');

                 })
               
                

            this.olddata = arr;
        }

        //重绘动画效果
        this.reDraw = function (id, _duration) {
            var arr = dataSource[i];

            if (id == 2) {
                var xAaixTran = getxAaixTran(dataSource)
                var line = d3.svg.area()
                      .x(function (d, i) { return xScale(i) })
                      .y0(xAaixTran)
                      .y1(function (d) {
                          return yScale(d)
                      })
                      .interpolate('monotone')
            } else {
                var line = d3.svg.line()
                         .x(function (d, i) { return xScale(i) })
                         .y(function (d) { return yScale(d) })
                         .interpolate('monotone')

            }
            // var line = d3.svg.line()
            //           .x(function(d,i){return xScale(i)})
            //           .y(function(d){return yScale(d)})
            //           .interpolate('cardinal') 
            //路径动画
            this.path.transition().duration(_duration).attr('d', line(arr));
            //圆点动画
            this.group.selectAll('circle')
                      .transition()
                      .duration(_duration)
                      .attr('cx', function (d, i) {
                          return xScale(i)
                      })
                      .attr('cy', function (d) {
                          return yScale(d)
                      });
        };
        //从画布删除折线
        this.remove = function () {
            this.group.remove()
        }
    }
    //window.onresize = function () {
    //    var timer = null
    //    clearTimeout(timer)
    //    timer = setTimeout(function () {
    //        $('#page_navigation').empty();
    //        initDraw();
    //    }, 1000)
    //}
    //重新作图
    function drawChart() {
        var _duration = $(".svg_warp").width();
        addLegend();
        //设置线条动画起始位置
        var lineObject = new CrystalLineObject();   // 实例化折线类
        for (i = 0 ; i < dataSource.length ; i++) {
            if (i < currentLineNum) {
                //对已有的线条做动画
                lineObject = lines[i];
                lineObject.moveBegin(i);
            } else {
                //如果现有线条不够， 就加上一些
                var newLine = new CrystalLineObject();
                newLine.init(i);
                lines.push(newLine);
            }
        }
        //删除多余的线条 ，如果有的话
        if (dataSource.length < currentLineNum) {
            for (i = dataSource.length; i < currentLineNum; i++) {
                lineObject = lines[i];
                lineObject.remove();
            }
            lines.splice(dataSource.length, currentLineNum - dataSource.length)
        }

        maxdata = getMaxData(dataSource);
        mindata = getMinData(dataSource);
        newLength = dataSource[0].length;
        var xAaixTran = getxAaixTran(dataSource)
        xBar.attr("transform", "translate(0," + xAaixTran + ")")
        //横轴数据动画
        xScale.domain([0, newLength - 1]);
        xAaix.scale(xScale).ticks(newLength);
        xBar.transition().duration(_duration).call(xAaix);
        xBar.selectAll("text").text(function (d) { return xMarks[d]; }).attr('transform', 'rotate(30)translate(10,0)').style('text-anchor', 'start');
        xInner.scale(xScale).ticks(newLength);
        xInnerBar.transition().duration(_duration).call(xInner);

        //纵轴数据动画
        yScale.domain([mindata, maxdata]);
        yBar.transition().duration(_duration).call(yAxis);
        yInnerBar.transition().duration(_duration).call(yInner);

        //开始线条动画
        for (i = 0; i < lines.length; i++) {
            lineObject = lines[i];
            lineObject.reDraw(i, _duration);
        }

        currentLineNum = dataSource.length;
        dataLength = newLength;
    }
    //添加图例     收入  支出   差值
    function addLegend() {
        var textGroup = legend.selectAll('text')
                        .data(lineNames);
        textGroup.exit().remove();
        legend.selectAll('text')
             .data(lineNames)
             .enter()
             .append('text')
             .text(function (d) { return d; })
             .attr('class', 'legend')
             .attr('x', function (d, i) { return i * 100 })
             .attr('y', -30)
             .attr('fill', function (d, i) { return lineColor[i] })

        var rectGroup = legend.selectAll('rect')
                 .data(lineNames);
        rectGroup.exit().remove();
        legend.selectAll('rect')
              .data(lineNames)
              .enter()
              .append('rect')
              .attr('x', function (d, i) { return i * 100 - 20 })
              .attr('y', -40)
              .attr('width', 12)
              .attr('height', 12)
              .attr('fill', function (d, i) { return lineColor[i]; })
        legend.attr('transform', "translate(" + ((w - lineNames.length * 100) / 2) + ',' + (h - 10) + ')');
    }
    //取得多维数组最大值
    function getMaxData(arr) {
        maxdata = 0;
        for (i = 0; i < arr.length; i++) {
            maxdata = d3.max([maxdata, d3.max(arr[i])])
        }
        return maxdata;
    }
    //取得多维数组的最小值
    function getMinData(arr) {
        mindata = 0;
        for (i = 0; i < arr.length; i++) {
            mindata = d3.min([mindata, d3.min(arr[i])]);
        }
        return mindata
    }

    //选择不同的期数
    function selectTick(val) {
        dataNum = val;
        var data = getDataByMonth(dataNum, originData);
        dataSource = [[], [], []];
        xMarks = [];
        if (data.length > 0) {
            $.each(data, function (i, v) {
                dataSource[0].push(v.TotalAmount);
                dataSource[1].push(-1 * v.TotalExpend);
                dataSource[2].push(v.SpreadPrice);
                xMarks.push(v.DatePoint);
            })
            loadDataToTable(data);
        }
        drawChart();
    }

    //获取横坐标垂直偏移量
    function getxAaixTran() {
        maxdata = getMaxData(dataSource);
        mindata = getMinData(dataSource);
        var translateL = (maxdata - 0) / (maxdata - mindata)
        var xAaixTran = ((h - foot_height - head_height) * translateL + head_height)
        return xAaixTran
    }


 
    $('#refresh').click(function () {
        drawChart();
    })
    //将数据按照月、季度、半年归集
    function getDataByMonth(m, data) {
        var result = [],
            datePoint = '',
            length = data.length;
        for (var i = 0; i < length; i++) {
            if (i == 0) {

                result.push({
                    TotalAmount: accAdd(data[0].TotalAmount,0),
                    TotalExpend: accAdd(data[0].TotalExpend,0),
                    SpreadPrice: accAdd(data[0].SpreadPrice,0),
                    DatePoint: dateToabscissa(data[0].DatePoint, m)
                });

            }
            else {
                if (dateToabscissa(data[i].DatePoint, m) == dateToabscissa(data[i - 1].DatePoint, m)) {
                    result[result.length - 1].TotalAmount = accAdd(data[i].TotalAmount, result[result.length - 1].TotalAmount);
                    result[result.length - 1].TotalExpend = accAdd(data[i].TotalExpend, result[result.length - 1].TotalExpend);
                    result[result.length - 1].SpreadPrice = accAdd(data[i].SpreadPrice, result[result.length - 1].SpreadPrice);
                }
                else {
                    result.push({
                        TotalAmount: accAdd(data[i].TotalAmount,0),
                        TotalExpend: accAdd(data[i].TotalExpend,0),
                        SpreadPrice: accAdd(data[i].SpreadPrice,0),
                        DatePoint: dateToabscissa(data[i].DatePoint, m)
                    });
                }
            }
        }
        return result
    }
    //按照要求的单元归集日期
    function dateToabscissa(date, unit) {
        var year = date.split('-')[0];
        var month = parseInt(date.split('-')[1]);
        switch (unit) {
            case '1': {
                return date;
            }
            case '3': {
                if (4 > month) {
                    month = '03';
                }
                else if (7 > month && 3 < month) {
                    month = '06';
                }
                else if (10 > month && 6 < month) {
                    month = '09';
                }
                else {
                    month = '12';
                }
                break;
            }
            case '6': {
                if (7 > month) {
                    month = '06';
                }

                else {
                    month = '12';
                }
                break;
            }
            case '12': {
                return year;
            }
        }
        return year + '-' + month;
    }






    //获取专项计划列表
    function getAllTrustList(callback) {

        var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecute?';
        var objArgs = {
            SPName: 'usp_GetAllTrustList',
            SQLParams: [
                { Name: 'UserName', Value: name, DBType: 'string' }
            ]
        };
        var executeParams = encodeURIComponent(JSON.stringify(objArgs));
        $.ajax({
            cache: false,
            type: "GET",
            async: false,
            url: svcUrl + 'connConfig=TrustManagement&appDomain=TrustManagement&executeParams=' + executeParams + '&resultType=Common',
            dataType: "json",
            contentType: "application/xml;charset=utf-8",
            data: {},
            success: function (response) {
                response = JSON.parse(response)
                callback(response);
            },
            error: function (response) { GSDialog.HintWindow('Error occursed when fetch the remote source data!'); }
        });
    }
    //渲染专项计划复选列表
    function renderTrustCheckList(trustList) {

        $.each(trustList, function (i, v) {
            var str = '<label title='+ v.TrustName +'><input class="check-input" type=' + "checkbox" + ' value=' + v.TrustId + '>' + '</input>' + v.TrustName + '</label>';
            $('#trustSelector .check-list').append(str);
        })
        $('#submitTrusts').on("click", submitTrusts);
        $('.check-input').change(function () {
            $(this).parent().toggleClass('checked')
            var str = '<span title={2} class="checked-item" id={0}>{1}<i>X</i></span>'.format($(this).val(), $(this).parent().text(), $(this).parent().text())
            $(this).prop("checked") ? $('.checked-box').append(str) : $('#' + $(this).val()).remove();
            $('.check-input:checked').length > 0 ? $('.placeholder').hide() : $('.placeholder').show();
            $('.checked-item>i').off().on('click', function () {
                var $self = $(this)
                $(this).parent().remove();
                $('.check-input:checked').each(function () {

                    if ($(this).val() == $self.parent().attr('id')) {

                        $(this).parent().removeClass("checked")
                        $(this).parent().find('input').removeAttr("checked");
                    }
                })
            })
        })

    }

    function assembleXml(trustIdList) {
        //定义XML
        var parameterXml = '<TrustId>{0}</TrustId>';
        var rootXml = '<Root>{0}</Root>';
        var xml = '';
        $.each(trustIdList, function (i, v) {
            xml = xml + (parameterXml.format(v) + ',');
        })
        xml = xml.substring(0, xml.lastIndexOf(','));
        xml = rootXml.format(xml);

        return xml;
    }

  

    function loadDataToTable(dataList) {
        var gridRowTemplate = "<tr><td class='center'>{0}</td><td class='center'>{1}</td><td class='center'>{2}</td><td class='center'>{3}</td></tr>";
        var html = '';
        $.each(dataList, function (i, v) {
            html += gridRowTemplate.format(v.DatePoint, common.numFormt(v.TotalAmount), common.numFormt(v.TotalExpend), common.numFormt(v.SpreadPrice));
        })
        $('#dataList').empty().append(html);
        createPage();
    }

    function createPage() {
        //每页显示的数目
        var c_h = $(".tb_layer").height()-44;
        var c_n = Math.floor(c_h / 35);
        console.log(c_n)
        var show_per_page = c_n-1;
        //获取content对象里面，数据的数量
        var number_of_items = $('#dataList').children().size();
        //计算页面显示的数量
        var number_of_pages = Math.ceil(number_of_items / show_per_page);

        //隐藏域默认值

        $('#current_page').val(0);
        $('#show_per_page').val(show_per_page);

        var navigation_html = '<a class="previous_link">上一页</a>';
        var current_link = 0;
        while (number_of_pages > current_link) {
            navigation_html += '<a class="page_link"  longdesc="' + current_link + '">' + (current_link + 1) + '</a>';
            current_link++;
        }
        navigation_html += '<a class="next_link" onclick="">下一页</a>';

        $('#page_navigation').html(navigation_html);
        //add active_page class to the first page link
        $('#page_navigation .page_link:first').addClass('active_page');

        //隐藏该对象下面的所有子元素
        $('#dataList').children().hide();
        //显示第n（show_per_page）元素
        $('#dataList').children().slice(0, show_per_page).show();
        $('.next_link').click(function () {
            next();
        })
        $('.previous_link').click(function () {
            previous();
        })
        $('.page_link').click(function () {
            go_to_page($(this).attr('longdesc'));
        })



    }

    //上一页
    function previous() {
        console.log('a')
        new_page = parseInt($('#current_page').val()) - 1;
        if ($('.active_page').prev('.page_link').length == true) {
            go_to_page(new_page);
        }
    }
    //下一页
    function next() {
        new_page = parseInt($('#current_page').val()) + 1;
        if ($('.active_page').next('.page_link').length == true) {
            go_to_page(new_page);
        }
    }
    //跳转某一页
    function go_to_page(page_num) {
        //修改URL
        var url = window.location.href;
        var re = /currentPage=\d/;
        if (url.match(re)) {
            url = url.replace(re, 'currentPage=' + page_num)
        }
        var stateObject = {};
        var title = "";
        history.pushState(stateObject, title, url);


        var show_per_page = parseInt($('#show_per_page').val());
        start_from = page_num * show_per_page;
        end_on = start_from + show_per_page;
        $('#dataList').children().hide().slice(start_from, end_on).show();
        $('.page_link[longdesc=' + page_num + ']').addClass('active_page').siblings('.active_page').removeClass('active_page');
        $('#current_page').val(page_num);
    }

    //处理float类型精确计算问题
    //浮点数加法运算
    function accAdd(arg1, arg2) {
        var r1, r2, m;
        try { r1 = arg1.toString().split(".")[1].length } catch (e) { r1 = 0 }
        try { r2 = arg2.toString().split(".")[1].length } catch (e) { r2 = 0 }
        m = Math.pow(10, Math.max(r1, r2));
        n = (r1 >= r2) ? r1 : r2;
        n = n > 2 ? 2 : n;
        return parseFloat(((arg1 * m + arg2 * m) / m).toFixed(n));
    }


})