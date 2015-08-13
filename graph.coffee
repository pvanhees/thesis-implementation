class @JsonGraph 
  nodes = [] 
  edges = []
  edgeObjects = []
  nodeProperties = {}
  edgeProperties = {}
  firstDataset = {}
  
  constructor: (@json) ->
    firstDataset = json.datasets[0]
    nodes = (node.id for node in firstDataset.nodes)
    edges = (edge.id for edge in firstDataset.edges)
    for edge in firstDataset.edges
      edgeObjects.push({"id":edge.id, "source": edge.source, "target": edge.target})
      edgeProperties[edge.id] = edge.properties
    for node in firstDataset.nodes
      nodeProperties[node.id] = node.properties
  
  #returns the data properties
  getDataProperties: ->
    firstDataset.dataproperties

  #returns list of node id's 
  getNodes: -> 
    nodes  

  #return list of edge id's 
  getEdges: ->
    edges

  #returns list of edge objects of format: {id, source, target}
  getEdgesAsObjects: ->
    edgeObjects

  #returns the properties of the node with id 'key' 
  getNodeProperties: (key) ->
    nodeProperties[key]

  #returns the property 'property' of the node with id 'key'
  getNodeProperty: (key, property) ->
    nodeProperties[key][property]

  #returns the properties of the edge with id 'key' 
  getEdgeProperties: (key) ->
    edgeProperties[key]

  #returns the property 'property' of the edge with id 'key'
  getEdgeProperty: (key, property) ->
    edgeProperties[key][property]

  #returns the graph as a matrix representation.
  #the indices of the matrix are the indices of the nodes in 
  # the list of nodes in this graph class.
  asMatrix: (valueProperty="PropertyEdgeAmount") ->
    matrix = []
    for nodeR in firstDataset.nodes
      row = []
      for nodeC in firstDataset.nodes
        amount = 0
        for edge in firstDataset.edges
          if (edge.source is nodeR.id and edge.target is nodeC.id) or 
             (edge.source is nodeC.id and edge.target is nodeR.id)
              
              if valueProperty is "PropertyEdgeAmount"
                amount++
              else
                amount = edge.properties[valueProperty]
        row.push(amount)
      matrix.push(row)
    matrix
              
  asJson: -> 
    firstDataset
