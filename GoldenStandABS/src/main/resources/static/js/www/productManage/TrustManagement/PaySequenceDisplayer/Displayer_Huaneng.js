function drag(ev) {
    ev.dataTransfer.setData("Text", ev.target.id);
}

function allowDrop(ev) {
    ev.preventDefault();
};
var PaySequenceDisplayer = (function () {
    var trustId = 0;
    var nodeArray = [];
    var nodeArray1 = [];
    var edgeArray = [];
    var edgeArray = [];
    //  RoomCreate("");
    var winHeight = $(window.parent.document).height();
    var winWidth = $(window.parent.document).width();

    //$(".js").on("drop", function (ev) {
    //    ev.preventDefault();
    //    var id = this.id;
    //    var controlId = this.parentNode.id
    //    controlIndex = controlId.split("-")[1]
    //    var data = ev.originalEvent.dataTransfer.getData("Text");
    //    ev.target.appendChild(document.getElementById(data));
    //    var dropDateName = $("#" + data).text();
    //    var dropDateCode = data;
    //    var nodeObject = {};
    //    nodeObject['States'] = dropDateCode;
    //    nodeObject['AliasValue'] = dropDateName;//fatherNode.AliasValue+"/"+dropDateName;
    //    nodeObject['IsActive'] = 1;
    //    nodeObject['IsChildNode'] = 1
    //    nodeObject['FatherNode'] = id

    //    //var newNodeArray = [];
    //    //$.extend(newNodeArray, nodeArrays[controlIndex]);
    //    //newNodeArray.push(nodeObject);
    //    //nodeArrays[controlIndex] = newNodeArray;

    //    nodeArray.push(nodeObject);
    //    renderFlowTree(nodeArrays[controlIndex], controlId)

    //});
    $(".js").on("allowDrop", function (ev) {
        ev.preventDefault();
    });

    function getMousePos(event) {
        var e = event || window.event;
        var scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;
        var scrollY = document.documentElement.scrollTop || document.body.scrollTop;
        var x = e.clientX //+ scrollX;
        var y = e.clientY //+ scrollY;
        return { 'x': x, 'y': y };
    }

    function getOffset(element) {
        var $element = $(element);
        var scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;
        var scrollY = document.documentElement.scrollTop || document.body.scrollTop;
        return {
            //x: $element.offset().left - $('svg').offset().left,
            //y: $element.offset().top - $('svg').offset().top
            x: $element.offset().left + d3.select($element[0].firstChild).attr('width')/2, //- offsetWidth,
            y: $element.offset().top + d3.select($element[0].firstChild).attr('height') + scrollY// + div.offsetHeight-10
        };
    }

    function getTrustPaymentSequence(tid, callback) {
        var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";

        var executeParam = {
            SPName: 'usp_GetTrustPaymentSequence', SQLParams: [
                { Name: 'TrustId', value: tid, DBType: 'int' },

            ]
        };
        ExecuteGetData(true, svcUrl, 'TrustManagement', executeParam, callback);
    }

    function getTrustPaymentChart(tid, callback) {
        var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";

        var executeParam = {
            SPName: 'usp_GetTrustPaymentChart', SQLParams: [
                { Name: 'TrustId', value: tid, DBType: 'int' },

            ]
        };
        ExecuteGetData(true, svcUrl, 'TrustManagement', executeParam, callback);
    }

    function RoomCreate(data) {
        var container = document.getElementById('workflow');

        var createdNode = function (nodeId, nodeName, state) {
            var div = document.createElement('div');
            var innerHtml = '<div class="taskProgress ' + state + '">' +
								'<div class="taskText">' +
									'<div class="taskName">' + nodeName + '</div>' +
								'</div>' +
							'</div>' +
							'<svg class="svg" width="1130"><g/></svg>';
            div.id = nodeId;
            div.className = 'section';
            div.innerHTML = innerHtml;
            var node = document.getElementById(nodeId);

            (node) ? node.firstChild.className = 'taskProgress ' + state : container.appendChild(div);
            return div;
        }

        var createNodeSpeed=function (nodeId, state) {
            var div = document.createElement('div');
            var innerHtml = '<svg class="svg" width="1130"><g/></svg>';
            div.id = nodeId;
            div.className = 'section';
            div.innerHTML = innerHtml;
            var node = document.getElementById(nodeId);

            (node) ? node.firstChild.className = 'taskProgress ' + state : container.appendChild(div);
            return div;
        }

        var creatSectionRoom = function (data) {
            var div = document.createElement('div');
            var innerHtml = '<div class="taskProgress Pending">' +
                                '<div class="taskText">' +
                                    '<div class="taskName">特殊情况</div>' +
                                '</div>' +
                            '</div>' +
                            '<div class="svg specialRoom" width="1130" >';

            $.each(data, function (index, dom) {
                if (dom.ScenarioName == "加速清偿")
                {
                    var SpeedPayId = dom.ScenarioId + 1;
                    innerHtml += '<span id="' + dom.ScenarioId + '" class="dropSpan" draggable="true" ondragstart="drag(event)" >' + dom.ScenarioName + '</span>';
                    innerHtml += '<span id="' + SpeedPayId + '" class="dropSpan" draggable="true" ondragstart="drag(event)" >' + "非" + dom.ScenarioName + '</span>';
                }
                //innerHtml += '<span id="' + dom.ScenarioId + '" class="dropSpan" draggable="true" ondragstart="drag(event)" >' + dom.ScenarioName + '</span>';
            });
            innerHtml += '</div>';
            div.className = 'section';
            div.innerHTML = innerHtml;
            container.appendChild(div);
            return div;
        }

        var node = d3.select(createdNode('control-0', '流程图', 'Pending'));

        //var data=[{'id':'code1','name':'加速偿付'},{'id':'code2','name':'特殊情况1'},{'id':'code3','name':'特殊情况2'},{'id':'code4','name':'特殊情况3'}]
        creatSectionRoom(data);
        renderFlowTree(nodeArray, "control-0");
        var temp = [];
        //renderFlowTree(nodeArray, "control-1");
        node.select('.taskProgress').on('click', function () {
            var parentNode = this.parentNode;
            if (parentNode.classList.contains('toggle')) {
                parentNode.classList.remove('toggle');
            } else {
                parentNode.classList.add('toggle');
            }
        })
    }

    function renderFlowTree(data, controlid) {
        var controlIndex = controlid.split("-")[1]
        var svg = d3.select('#' + controlid).select(".svg"),
                inner = svg.select("g");
        if (data.length == 0) {
            data = '[{"States":"node_1","AliasValue":"开始","IsActive":1,"IsChildNode":1,"Levels":0}]';
            data = eval('(' + data + ')');
        }
        nodeArray = data;
        //var svg = d3.select('#svg').select('.svg'),
		//	inner = svg.select("g");
        // Set up zoom support
       
        var g = new dagreD3.graphlib.Graph().setGraph({
            nodesep: 160,
            edgesep: 2 // -5 ??
        });

        var nodeStatusColor = function (IsActive) {
            return (IsActive) ? '#f3eb90' : '#dcdcdc'
        }
        data.forEach(function (row) {
            if (row.AliasValue != "加速清偿") {
                var className = ((row.class != null || row.class != 'undifined') && row.class == 'jsChild') ? row.class : '';
                if (className == 'jsChild')
                {
                    g.setNode(row.States, {
                        //shape: row.States.match(/_[end|back]/gi) ? "ellipse" : "rect",
                        shape: "rect",
                        label: row.AliasValue,
                        id: row.States,
                        style: 'fill:' + nodeStatusColor(row.IsActive),
                        paddingLeft: 20,
                        paddingRight: 20,
                        active: row.IsActive,
                        class: className,
                        transform:"translate(318.65625,301.328125)",
                        isChildNode: row.IsChildNode
                    });
                
                }
                else {
                    g.setNode(row.States, {
                        //shape: row.States.match(/_[end|back]/gi) ? "ellipse" : "rect",
                        shape: "rect",
                        label: row.AliasValue,
                        id: row.States,
                        style: 'fill:' + nodeStatusColor(row.IsActive),
                        paddingLeft: 20,
                        paddingRight: 20,
                        active: row.IsActive,
                        class: className,
                        isChildNode: row.IsChildNode
                    });
                }
                
            }
            else {
                g.setNode(row.States, {
                    //shape: row.States.match(/_[end|back]/gi) ? "ellipse" : "rect",
                    shape: "rect",
                    label: "",//row.AliasValue,
                    id: row.States,
                    style: 'fill:' + 'white' + ";stroke-width:1;stroke:" + "#676565",
                    paddingLeft: 20,
                    paddingRight: 20,
                    width: 400,
                    height: 400,
                    class:'js',
                    active: row.IsActive,

                    isChildNode: row.IsChildNode
                });
            }
            
        });

        var setEdges = function (edge) {

            if (edge.length == 0) {
                edge = '[]';
                edge = eval('(' + edge + ')');
            }
            edgeArray = edge;
            edge.forEach(function (row) {
                g.setEdge(row.SourceState, row.TargetState, {});
            });

            g.nodes().forEach(function (v) {
                var node = g.node(v);
                node.rx = node.ry = 10;
            });

            new dagreD3.render()(inner, g);

            var js = d3.select(".js")
            if (js != null)
            {
                js.attr("ondragover","allowDrop(event)")
            }

            $("g.node").unbind();

            $("g.node").bind("mousedown", (function (e) {
                e.preventDefault();
                e.stopPropagation();
                if (e.which == 3) {
                    var opertion = {
                        name: "",
                        offsetX: 2,
                        offsetY: 2,
                        textLimit: 10,
                        beforeShow: $.noop,
                        afterShow: $.noop
                    };
                    //text: e.target.innerHTML,
                    var data = [
					[{
					    text: "查看",
					    func: function () {
					        var idArray = this.id.split("$$");
					        var currentNode = $.grep(nodeArray, function (node, i) { return node.States == this.id })[0];
					        console.log(currentNode);
					        var id = idArray[idArray.length-1];
					        showDialogPage('../FeeSettings/PaymentSequence.html?tid=' + trustId + '&id=' + id + '', '维护偿付顺序', winWidth * 8 / 10, winHeight * 4 / 5, function () { })
					    }
					}],
					[{
					    text: "删除",
					    func: function () {
					        var name = $(this).text().replace("非", "");
					        var flag = $(this).text().split("not_");
					        var brotherId = 0;
					        var id = this.id.replace("not_", "");
                            var idArray=id.split("$$");
                            var realId=idArray[idArray.length-1]
					        if (flag.length == 1) {
					            brotherId = id.replace("$$" + realId,"") + "$$" + (parseInt(realId) + 1)
					        }
					        else {
					            brotherId = id.replace("$$" + realId, "") + "$$" + (parseInt(realId) - 1)
					        }
					        var IsChildNode = 1;
					        var fatherNode = '';
					        var nodeindexNumber = [];
					        var edgeindexNumber = [];
					        $.each(edgeArray, function (index, dom) {
					            if (dom.TargetState == id) {
					                edgeindexNumber.push(index);
					            }
					            if (dom.TargetState == brotherId) {
					                edgeindexNumber.push(index);
					            }
					        })
					        $.each(nodeArray, function (index, dom) {
					            if (dom.States == id) {
					                IsChildNode = IsChildNode && dom.IsChildNode;
					                fatherNode = dom.FatherNode;
					                nodeindexNumber.push(index);
					            }
					            if (dom.States == brotherId) {
					                IsChildNode = IsChildNode && dom.IsChildNode;
					                nodeindexNumber.push(index);
					            }
					        })
					        nodeindexNumber = $.map(nodeindexNumber, function (dom, index) {
					            return dom - index;
					        })
					        edgeindexNumber = $.map(edgeindexNumber, function (dom, index) {
					            return dom - index;
					        })
					        if (!!IsChildNode) {
					            $.each(nodeindexNumber, function (index, dom) {
					                nodeArray.splice(dom, 1)
					            })
					            $.each(edgeindexNumber, function (index, dom) {
					                edgeArray.splice(dom, 1)
					            })
					            $.each(nodeArray, function (index, dom) {
					                if (dom.States == fatherNode) {
					                    dom.IsChildNode = 1;
					                }
					            })
					            //$(".specialRoom").append('<span id="' + id + '" class="dropSpan" draggable="true" ondragstart="drag(event)" >' + name + '</span>')
					            renderFlowTree(nodeArray);
					        }
					        else {
					            return;
					        }
					    }
					}]
                    ];
                    $(this).smartMenu(data, opertion);
                }
            }));
            $("g.node").on("dragover", function (ev) {
                ev.preventDefault();
            });

            var dropPos = [];
            $("g.node").on("drop", function (ev) {
                ev.preventDefault();
                var id = this.id;
                var controlId = $(this).parentsUntil('.section')[3].parentNode.id;
                var offset = getMousePos(ev)
                var elementPos = {x:this.getBoundingClientRect().left,y:this.getBoundingClientRect().bottom};
                if (offset.y < elementPos.y + 20 && offset.y > elementPos.y - 20) {
                    var data = ev.originalEvent.dataTransfer.getData("Text");
                    ev.target.appendChild(document.getElementById(data));//拖拽原位置是否减掉被拖的块
                    var dropDateName = $("#" + data).text();
                    var dropDateCode = data;
                    var IsChildNode = '';
                    dropNodeId = id + "$$" + dropDateCode;
                    $.each(nodeArray, function (index, dom) {
                        if (dom.States == id) {
                            IsChildNode = dom.IsChildNode
                            //dom.IsChildNode = 0;
                        }
                    })
                    if (!!IsChildNode) {
                        //ev.target.appendChild(document.getElementById(data));
                        var nodeObject = {};
                        var fatherNode = $.grep(nodeArray, function (n, i) { return n.States == id })[0];
                        nodeObject['States'] = id + "$$" + dropDateCode;
                        nodeObject['AliasValue'] = dropDateName;//fatherNode.AliasValue+"/"+dropDateName;
                        nodeObject['IsActive'] = 0;
                        nodeObject['IsChildNode'] = 1
                        nodeObject['FatherNode'] = id

                        nodeArray.push(nodeObject);
                        //var nodeObject1 = {};
                        //nodeObject1['States'] = id+"$$"+(parseInt(dropDateCode) + 1);
                        //nodeObject1['AliasValue'] = fatherNode.AliasValue + "/" + "非" + dropDateName;
                        //nodeObject1['IsActive'] = 0;
                        //nodeObject1['IsChildNode'] = 1
                        //nodeObject1['FatherNode'] = id
                        //nodeArray.push(nodeObject1);
                        var edgObject = {};
                        edgObject['SourceState'] = id
                        edgObject['TargetState'] = id + "$$" + dropDateCode;
                        edgeArray.push(edgObject)
                        //var edgObject1 = {};
                        //edgObject1['SourceState'] = id
                        //edgObject1['TargetState'] = id+"$$"+(parseInt(dropDateCode) + 1);
                        //edgeArray.push(edgObject1)
                        renderFlowTree(nodeArray, controlId)
                    }
                    else {
                        return;
                    }
                }
                else {
                        var js = (d3.select('.js'));
                        if (js == null)
                        {
                        }
                        else
                        {
                            var jsClass = js.attr('class').split(' ')
                            if (jsClass[jsClass.length-1] == 'js')
                            {
                                var id = this.id;
                                
                                controlIndex = controlId.split("-")[1]
                                var data = ev.originalEvent.dataTransfer.getData("Text");
                                ev.target.appendChild(document.getElementById(data));
                                var dropDateName = $("#" + data).text();
                                var dropDateCode = data;
                                var nodeObject = {};
                                nodeObject['States'] = dropDateCode;
                                nodeObject['AliasValue'] = dropDateName;//fatherNode.AliasValue+"/"+dropDateName;
                                nodeObject['IsActive'] = 1;
                                nodeObject['IsChildNode'] = 1
                                nodeObject['FatherNode'] = id
                                nodeObject['class'] = "jsChild"
                                //var newNodeArray = [];
                                //$.extend(newNodeArray, nodeArrays[controlIndex]);
                                //newNodeArray.push(nodeObject);
                                //nodeArrays[controlIndex] = newNodeArray;
                                
                                nodeArray.push(nodeObject);
                                renderFlowTree(nodeArray, controlId)
                            }

                        }
                    
                    }
               
            });
            
            var xCenterOffset = (svg.attr("width") - g.graph().width) / 2;
            inner.attr("transform", "translate(" + xCenterOffset + ", 40)");
            svg.attr("height", g.graph().height + 100);
        }
        setEdges(edgeArray);
        var zoom = d3.behavior.zoom().on("zoom", function () {
            inner.attr("transform", "translate(" + d3.event.translate + ")" +
                                        "scale(" + d3.event.scale + ")");
        });
        svg.call(zoom);

        var initialScale = 0.75;
        zoom
          .translate([(svg.attr("width") - g.graph().width * initialScale) / 2, 20])
          .scale(initialScale)
          .event(svg);
        svg.attr('height', g.graph().height * initialScale + 40);
    }


    function executeRemoteData(executeParam, callback) {
        var executeParams = JSON.stringify(executeParam);

        var params = '';
        params += '<root appDomain="TrustManagement" postType="">';
        params += executeParams;
        params += '</root>';

        var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonPostExecute";

        $.ajax({
            type: "POST",
            url: serviceUrl,
            dataType: "json",
            contentType: "application/xml;charset=utf-8",
            data: params,
            processData: false,
            success: function (response) {
                if (callback)
                    callback(response);
            },
            error: function (response) { alert("error is :" + response); }
        });
    }

    function renderDisplayer(tid) {
        trustId = tid;
        getTrustPaymentSequence(trustId, function (paymentData) {
            getTrustPaymentChart(trustId, function (paymentChartData) {
                if (paymentChartData.length > 0) {
                    nodeArray = eval('(' + paymentChartData[0].NodeArray + ')');
                    edgeArray = eval('(' + paymentChartData[0].EdgeArray + ')');

                    nodeArray1 = eval('(' + paymentChartData[0].NodeArray + ')');
                    edgeArray1 = eval('(' + paymentChartData[0].EdgeArray + ')');
                    var paymentArray = $.extend({}, paymentData);

                    $.each(paymentArray, function (i, p) {
                        $.each(nodeArray, function (j, a) {
                            if (p.ScenarioId == parseInt(a.States)) {
                                paymentData.splice($.inArray(p.ScenarioId, p), 1);
                               
                            }
                        })
                    })
                }

                RoomCreate(paymentData);
            })
        })

        $("#btnSaveChart").on('click', function () {
            var executeParam = {
                SPName: 'usp_SaveTrustPaymentChart', SQLParams: [
                    { Name: 'TrustId', value: tid, DBType: 'int' },
                    { Name: 'NodeArray', value: JSON.stringify(nodeArray), DBType: 'string' },
                    { Name: 'EdgeArray', value: JSON.stringify(edgeArray), DBType: 'string' },
                ]

            };

            executeRemoteData(executeParam, function (data) {
                if (data) {
                    alert("saved successfuly!");
                }
            });
        })
    }

    return {
        RenderDisplayer: renderDisplayer
    }
})();


