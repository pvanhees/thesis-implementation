xobj = new XMLHttpRequest()
xobj.open("GET", 'graph.json',true)
xobj.setRequestHeader("Content-type", "application/json")
xobj.onreadystatechange =  ->
  if xobj.readyState is 4 and xobj.status is 200 
    json = JSON.parse(xobj.responseText)
    load(json)
    
xobj.send()

load = (json) ->
  graph = new JsonGraph(json)
  color = d3.scale.category20()

  width = 1600
  height = 900
  colad3 = cola.d3adaptor()
          #.linkDistance(30)
          .size([width, height])

  svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height)
  #reform jsongraph to cola acceptable format
  graphNodes = []
  graphEdges = []
  nodeIndices = {}

  graph.getNodes().forEach((node, i) ->
    graphNodes.push({"name": node, "group": graph.getNodeProperty(node, "y")})
    nodeIndices[node] = i
  )
  graph.getEdgesAsObjects().forEach((e) ->
    graphEdges.push({"target": nodeIndices[e.target], "source": nodeIndices[e.source], "value": graph.getEdgeProperty(e.id, "weight")})
  )

  colaGraph = {"nodes": graphNodes, "links":graphEdges}
  colad3.nodes(colaGraph.nodes)
      .links(colaGraph.links)
      .symmetricDiffLinkLengths(5)
      .start(30)

  svg.append('svg:defs').append('svg:marker')
    .attr('id', 'end-arrow')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 6)
    .attr('markerWidth', 3)
    .attr('markerHeight', 3)
    .attr('orient', 'auto')
    .append('svg:path')
    .attr('d', 'M0 -5L10,0L0,5')
    .attr('fill', '#000')
    

  path = svg.selectAll(".link")
          .data(colaGraph.links)
          .enter().append("svg:path")
          .attr("class", "link")

  node = svg.selectAll(".node")
          .data(colaGraph.nodes)
          .enter().append("circle")
          .attr("class", "node")
          .attr("r",nodeRadius)
          .style("fill", (d) -> color(d.group))
          .on("click", (d) -> d.fixed = true)
          .call(colad3.drag)

  node.append("title")
    .text((d) -> d.name)

  colad3.on("tick", -> 
     # draw directed edges with proper padding from node centers
            path.attr('d',  (d) ->
              deltaX = d.target.x - d.source.x
              deltaY = d.target.y - d.source.y
              dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
              normX = deltaX / dist
              normY = deltaY / dist
              sourcePadding = nodeRadius
              targetPadding = nodeRadius + 2
              sourceX = d.source.x + (sourcePadding * normX)
              sourceY = d.source.y + (sourcePadding * normY)
              targetX = d.target.x - (targetPadding * normX)
              targetY = d.target.y - (targetPadding * normY)
              'M' + sourceX + ',' + sourceY + 'L' + targetX + ',' + targetY
            )
  )
