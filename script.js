// Initial network data with a larger set of nodes
let graph = {
  "nodes": [
    {"id": "A", "label": "Node A", "expanded": false},
    {"id": "B", "label": "Node B", "expanded": false},
    {"id": "C", "label": "Node C", "expanded": false},
    {"id": "D", "label": "Node D", "expanded": false},
    {"id": "E", "label": "Node E", "expanded": false},
    {"id": "F", "label": "Node F", "expanded": false},
    {"id": "G", "label": "Node G", "expanded": false},
    {"id": "H", "label": "Node H", "expanded": false},
    {"id": "I", "label": "Node I", "expanded": false},
    {"id": "J", "label": "Node J", "expanded": false}
  ],
  "links": [
    {"source": "A", "target": "B"},
    {"source": "A", "target": "C"},
    {"source": "B", "target": "D"},
    {"source": "B", "target": "E"},
    {"source": "C", "target": "F"},
    {"source": "C", "target": "G"},
    {"source": "D", "target": "H"},
    {"source": "E", "target": "I"},
    {"source": "F", "target": "J"}
  ]
};

// Potential nodes and links for expansion and retraction
const expansionData = {
  "A": {
    "nodes": [
      {"id": "K", "label": "Node K"},
      {"id": "L", "label": "Node L"}
    ],
    "links": [
      {"source": "A", "target": "K"},
      {"source": "A", "target": "L"}
    ]
  },
  "B": {
    "nodes": [
      {"id": "M", "label": "Node M"},
      {"id": "N", "label": "Node N"}
    ],
    "links": [
      {"source": "B", "target": "M"},
      {"source": "B", "target": "N"}
    ]
  },
  "C": {
    "nodes": [
      {"id": "O", "label": "Node O"},
      {"id": "P", "label": "Node P"}
    ],
    "links": [
      {"source": "C", "target": "O"},
      {"source": "C", "target": "P"}
    ]
  }
  // Add more expansion data as needed for other nodes
};

// Create SVG container
const svg = d3.select("svg");
const width = +svg.attr("width");
const height = +svg.attr("height");

// Set margins and dimensions
const margin = {top: 20, right: 30, bottom: 40, left: 40};
const graphWidth = width - margin.left - margin.right;
const graphHeight = height - margin.top - margin.bottom;

// Create a group element and apply margins
const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Create a simulation with forces
let simulation = d3.forceSimulation(graph.nodes)
    .force("link", d3.forceLink(graph.links).id(d => d.id).distance(150))
    .force("charge", d3.forceManyBody().strength(-300))
    .force("center", d3.forceCenter(graphWidth / 2, graphHeight / 2));

// Render the graph
let link = g.append("g")
    .attr("stroke", "#999")
    .attr("stroke-opacity", 0.6)
  .selectAll("line")
  .data(graph.links)
  .enter().append("line")
    .attr("class", "link");

let node = g.append("g")
    .attr("stroke", "#fff")
    .attr("stroke-width", 1.5)
  .selectAll("circle")
  .data(graph.nodes)
  .enter().append("circle")
    .attr("class", "node")
    .attr("r", 8)
    .attr("fill", "#1f77b4")
    .on("click", toggleNode) // Add click event listener for expansion/retraction
    .call(drag(simulation));

let labels = g.selectAll("text")
  .data(graph.nodes)
  .enter().append("text")
    .attr("class", "node-label")
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("fill", "#333")
    .text(d => d.label);

simulation.on("tick", () => {
  link
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y);

  node
      .attr("cx", d => d.x)
      .attr("cy", d => d.y);

  labels
      .attr("x", d => d.x)
      .attr("y", d => d.y - 10); // Position text slightly above the node
});

// Toggle node function (expand/retract)
function toggleNode(event, d) {
  if (d.expanded) {
    retractNode(d);
  } else {
    expandNode(d);
  }
}

// Expand node function
function expandNode(d) {
  const expansion = expansionData[d.id];
  if (expansion) {
    // Add new nodes
    expansion.nodes.forEach(node => {
      if (!graph.nodes.find(n => n.id === node.id)) {
        graph.nodes.push(node);
      }
    });

    // Add new links
    expansion.links.forEach(link => {
      if (!graph.links.find(l => l.source.id === link.source && l.target.id === link.target)) {
        graph.links.push(link);
      }
    });

    d.expanded = true; // Mark node as expanded

    // Restart the simulation with updated data
    updateGraph();
  }
}

// Retract node function
function retractNode(d) {
  const expansion = expansionData[d.id];
  if (expansion) {
    // Remove the expanded nodes
    const nodesToRemove = expansion.nodes.map(n => n.id);
    graph.nodes = graph.nodes.filter(node => !nodesToRemove.includes(node.id));

    // Remove the expanded links
    graph.links = graph.links.filter(link => 
      !nodesToRemove.includes(link.source.id || link.source) &&
      !nodesToRemove.includes(link.target.id || link.target)
    );

    d.expanded = false; // Mark node as retracted

    // Restart the simulation with updated data
    updateGraph();
  }
}

// Update the graph with new nodes and links
function updateGraph() {
  // Update link data
  link = link.data(graph.links);
  link.exit().remove();
  link = link.enter().append("line")
    .attr("class", "link")
    .merge(link);

  // Update node data
  node = node.data(graph.nodes);
  node.exit().remove();
  node = node.enter().append("circle")
    .attr("class", "node")
    .attr("r", 8)
    .attr("fill", "#1f77b4")
    .on("click", toggleNode) // Re-attach click event listener
    .call(drag(simulation))
    .merge(node);

  // Update label data
  labels = labels.data(graph.nodes);
  labels.exit().remove();
  labels = labels.enter().append("text")
    .attr("class", "node-label")
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("fill", "#333")
    .text(d => d.label)
    .merge(labels);

  // Restart the simulation
  simulation.nodes(graph.nodes);
  simulation.force("link").links(graph.links);
  simulation.alpha(1).restart();
}

// Dragging behavior
function drag(simulation) {
  function dragstarted(event) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }

  function dragged(event) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }

  function dragended(event) {
    if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
  }

  return d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
}
