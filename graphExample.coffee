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
  graph.asMatrix("weight")
  list = graph.getNodes()
  console.log(graph.getProperties(list[0]))
  console.log(graph.getProperty(list[0], 'x'))
