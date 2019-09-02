function drag(ev)
{
	ev.dataTransfer.setData("Text",ev.target.id);
}
(function () {
	var nodeArray=[];
	var edgeArray=[];
    RoomCreate("");

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
            (node) ? node.firstChild.className = 'taskProgress '+state : container.appendChild(div);
            return div;
        }
		
		var creatSectionRoom = function(data){
			var div = document.createElement('div');
			var innerHtml ='<div class="taskProgress Pending">' +
								'<div class="taskText">' +
									'<div class="taskName">特殊情况</div>' +
								'</div>' +
							'</div>' +
							'<div class="svg" width="1130" >';
			$.each(data,function(index,dom){
				innerHtml+='<span id="'+dom.id+'" class="dropSpan" draggable="true" ondragstart="drag(event)" >'+dom.name+'</span>';
			});
			innerHtml+='</div>';
            div.className = 'section';
            div.innerHTML = innerHtml;
			container.appendChild(div);
            return div;
		}
		
		var node = d3.select(createdNode('control-0', '流程图', 'Pending'));
		
		var data=[{'id':'code1','name':'加速偿付'},{'id':'code2','name':'特殊情况1'},{'id':'code3','name':'特殊情况2'},{'id':'code4','name':'特殊情况3'}]
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
		if(data.length==0){
			data='[{"States":"node_1","AliasValue":"正常情况","IsActive":1,"IsChildNode":1}]';
			data=eval('(' + data + ')');
		}
		nodeArray=data;
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
				shape:"rect",
                label: row.AliasValue,
                id: row.States,
                style: nodeStatusColor(row.IsActive),
                paddingLeft: 20,
                paddingRight: 20,
                active: row.IsActive,
				isChildNode:row.IsChildNode
            });
        });

        var setEdges = function (edge) {
			if(edge.length==0){
				edge='[]';
				edge=eval('(' + edge + ')');
			}
			edgeArray=edge;
            edge.forEach(function (row) {
                g.setEdge(row.SourceState, row.TargetState,{});
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
			
			svg.selectAll("g.node").on("click", function (id) {		
				alert("这是"+id+"节点");
            });
			
			$("g.node").on("dragover", function (ev) {
				ev.preventDefault();	
            });
			
			$("g.node").on("drop", function (ev) {
				ev.preventDefault();
				var id=this.id;
				var data=ev.originalEvent.dataTransfer.getData("Text");
				var dropDateName=$("#"+data).text();
				var dropDateCode=data;		
				var IsChildNode='';
				$.each(nodeArray,function(index,dom){
					if(dom.States==id){
						IsChildNode=dom.IsChildNode
						dom.IsChildNode=0;
					}	
				})
				if(!!IsChildNode){
					ev.target.appendChild(document.getElementById(data));
					var nodeObject={};
					nodeObject['States']=dropDateCode;
					nodeObject['AliasValue']=dropDateName;
					nodeObject['IsActive']=0;
					nodeObject['IsChildNode']=1
					nodeArray.push(nodeObject);
					var nodeObject1={};
					nodeObject1['States']="not_"+dropDateCode;
					nodeObject1['AliasValue']="非"+dropDateName;
					nodeObject1['IsActive']=0;
					nodeObject1['IsChildNode']=1
					nodeArray.push(nodeObject1);
					var edgObject={};
					edgObject['SourceState']=id
					edgObject['TargetState']=dropDateCode;
					edgeArray.push(edgObject)
					var edgObject1={};
					edgObject1['SourceState']=id
					edgObject1['TargetState']="not_"+dropDateCode;
					edgeArray.push(edgObject1)
					renderFlowTree(nodeArray)
				}
				else{
					return;
				}	
            });

            var xCenterOffset = (svg.attr("width") - g.graph().width) / 2;
            inner.attr("transform", "translate(" + xCenterOffset + ", 40)");
            svg.attr("height", g.graph().height + 100);
        }
		setEdges(edgeArray);
    }
    
	function renderDisplayer() {
        RoomCreate("");
    }
    window.renderDisplayer = renderDisplayer;
})();