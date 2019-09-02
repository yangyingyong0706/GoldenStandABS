function drag(ev) {
    ev.dataTransfer.setData("Text", ev.target.id);
}

var PaySequenceDisplayer = (function () {
    var trustId = 0;
    var nodeArray = [];
    var edgeArray = [];
    //  RoomCreate("");
    var winHeight = $(window.parent.document).height();
    var winWidth = $(window.parent.document).width();

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

        var creatSectionRoom = function (data) {
            var div = document.createElement('div');
            var innerHtml = '<div class="taskProgress Pending">' +
                                '<div class="taskText">' +
                                    '<div class="taskName">特殊情况</div>' +
                                '</div>' +
                            '</div>' +
                            '<div class="svg specialRoom" width="1130" >';

            $.each(data, function (index, dom) {
                innerHtml += '<span id="' + dom.ScenarioId + '" class="dropSpan" draggable="true" ondragstart="drag(event)" >' + dom.ScenarioName + '</span>';
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
        renderFlowTree(nodeArray)

        node.select('.taskProgress').on('click', function () {
            var parentNode = this.parentNode;
            if (parentNode.classList.contains('toggle')) {
                parentNode.classList.remove('toggle');
            } else {
                parentNode.classList.add('toggle');
            }
        })
    }

    function renderFlowTree(data) {
        if (data.length == 0) {
            data = '[{"States":"node_1","AliasValue":"正常情况","IsActive":1,"IsChildNode":1,"Levels":0}]';
            data = eval('(' + data + ')');
        }
        nodeArray = data;
        var svg = d3.select('#control-0').select('.svg'),
			inner = svg.select("g");

        var g = new dagreD3.graphlib.Graph().setGraph({
            nodesep: 160,
            edgesep: 2 // -5 ??
        });

        var nodeStatusColor = function (IsActive) {
            return (IsActive) ? 'fill:#f3eb90' : 'fill:#dcdcdc'
        }

        data.forEach(function (row) {
            g.setNode(row.States, {
                //shape: row.States.match(/_[end|back]/gi) ? "ellipse" : "rect",
                shape: "rect",
                label: row.AliasValue,
                id: row.States,
                style: nodeStatusColor(row.IsActive),
                paddingLeft: 20,
                paddingRight: 20,
                active: row.IsActive,
                isChildNode: row.IsChildNode
            });
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
                node.rx = node.ry = 3;
            });

            new dagreD3.render()(inner, g);

            /**svg.selectAll("g.node").on("click", function (id) {
                var IsActive = d3.select(this).attr('data-active');			
				var number=0;
				var IsChildNode='';
				$.each(nodeArray,function(index,dom){
					if(dom.States==id){
						IsChildNode=dom.IsChildNode
						dom.IsChildNode=0;
					}	
					if(parseInt(dom.States.split("_")[1])>number)
						number=parseInt(dom.States.split("_")[1]);
				})
				if(!!IsChildNode){
					var nodeObject={};
					nodeObject['States']="node_"+(number+1);
					nodeObject['AliasValue']="node"+(number+1);
					nodeObject['IsActive']=0;
					nodeObject['IsChildNode']=1
					nodeArray.push(nodeObject);
					var nodeObject1={};
					nodeObject1['States']="node_"+(number+2);
					nodeObject1['AliasValue']="node"+(number+2);
					nodeObject1['IsActive']=0;
					nodeObject1['IsChildNode']=1
					nodeArray.push(nodeObject1);
					var edgObject={};
					edgObject['SourceState']=id
					edgObject['TargetState']="node_"+(number+1);
					edgeArray.push(edgObject)
					var edgObject1={};
					edgObject1['SourceState']=id
					edgObject1['TargetState']="node_"+(number+2);
					edgeArray.push(edgObject1)
					renderFlowTree(nodeArray)
				}
				else{
					return;
				}	
            });**/

            $("g.node").unbind();

            $("g.node").bind("mousedown", (function (e) {
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
					        var id = this.id;
					        showDialogPage('../FeeSettings/PaymentSequence.html?tid=' + trustId + '&id=' + id + '', '维护偿付顺序', winWidth * 9 / 10, winHeight * 4 / 5, function () { })
					    }
					}],
					[{
					    text: "删除",
					    func: function () {
					        var name = $(this).text().replace("非", "");
					        var flag = $(this).text().split("not_");
					        var brotherId = 0;
					        var id = this.id.replace("not_", "");
					        if (flag.length == 1) {
					            brotherId = parseInt(id) + 1
					        }
					        else {
					            brotherId = parseInt(id) - 1
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

            $("g.node").on("drop", function (ev) {
                ev.preventDefault();
                var id = this.id;
                var data = ev.originalEvent.dataTransfer.getData("Text");
                var dropDateName = $("#" + data).text();
                var dropDateCode = data;
                var IsChildNode = '';
                $.each(nodeArray, function (index, dom) {
                    if (dom.States == id) {
                        IsChildNode = dom.IsChildNode
                        dom.IsChildNode = 0;
                    }
                })
                if (!!IsChildNode) {
                    //ev.target.appendChild(document.getElementById(data));
                    var nodeObject = {};
                    nodeObject['States'] = dropDateCode;
                    nodeObject['AliasValue'] = dropDateName;
                    nodeObject['IsActive'] = 0;
                    nodeObject['IsChildNode'] = 1
                    nodeObject['FatherNode'] = id
                    nodeArray.push(nodeObject);
                    var nodeObject1 = {};
                    nodeObject1['States'] = parseInt(dropDateCode) + 1;
                    nodeObject1['AliasValue'] = "非" + dropDateName;
                    nodeObject1['IsActive'] = 0;
                    nodeObject1['IsChildNode'] = 1
                    nodeObject1['FatherNode'] = id
                    nodeArray.push(nodeObject1);
                    var edgObject = {};
                    edgObject['SourceState'] = id
                    edgObject['TargetState'] = dropDateCode;
                    edgeArray.push(edgObject)
                    var edgObject1 = {};
                    edgObject1['SourceState'] = id
                    edgObject1['TargetState'] = parseInt(dropDateCode) + 1;
                    edgeArray.push(edgObject1)
                    renderFlowTree(nodeArray)
                }
                else {
                    return;
                }
            });


            var xCenterOffset = (svg.attr("width") - g.graph().width) / 2;
            inner.attr("transform", "translate(" + xCenterOffset + ", 40)");
            svg.attr("height", g.graph().height + 100);
        }
        setEdges(edgeArray);
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


