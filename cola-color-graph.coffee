#xobj = new XMLHttpRequest()
#xobj.open("GET", 'graph.json',true)
#xobj.setRequestHeader("Content-type", "application/json")
#xobj.onreadystatechange =  ->
  #if xobj.readyState is 4 and xobj.status is 200 
    #json = JSON.parse(xobj.responseText)
    #drawColaColor(json)
    
#xobj.send()

drawColaColor = (json) ->
  graph = new JsonGraph(json)

  if checkIfDataCanBeDisplayed(graph.getDataProperties()) 
    d3.select("body").append("p").html("The selected data is not fit for this visualisation")
    false

  color = d3.scale.category20()

  width = 1600
  height = 900
  colad3 = cola.d3adaptor()
          #.linkDistance(30)
          .size([width, height])

  svg = d3.select("#visualisations").append("svg")
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

  link = svg.selectAll(".link")
          .data(colaGraph.links)
          .enter().append("line")
          .attr("class", "link")
          .style("stroke", "#999")
          .style("stroke-width", (d) -> Math.sqrt(d.value) )
  node = svg.selectAll(".node")
          .data(colaGraph.nodes)
          .enter().append("circle")
          .attr("class", "node")
          .attr("r",5)
          .style("fill", (d) -> color(d.value))
          .on("click", (d) -> d.fixed = true)
          .call(colad3.drag)

  node.append("title")
    .text((d) -> d.name)

  colad3.on("tick", -> 
    link.attr("x1", (d) -> d.source.x)
        .attr("y1", (d) -> d.source.y)
        .attr("x2", (d) -> d.target.x)
        .attr("y2", (d) -> d.target.y)
    node.attr("cx", (d) -> d.x)
        .attr("cy", (d) -> d.y)
  )

checkIfDataCanBeDisplayed = (properties) ->
  if properties.indexOf("graph") isnt -1 and
      properties.indexOf("weighted") isnt -1 and
    true
  else false
