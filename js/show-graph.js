fullyTransparant = 0 // global to allow override while testing
var diagram = {}
diagram.startThread = function(svgDefs){
    svgDefs.append('svg:marker')
        .attr('id', "start-thread")
        .attr('viewBox', '-7 -7 14 14')
        .attr('markerWidth', 12)
        .attr('markerHeight', 12 )
        .attr('orient', 'auto')
        .attr('markerUnits', 'userSpaceOnUse')
      .append('svg:path')
        .attr('d', diagram.shape.square)
        .attr('fill', "#000").style('opacity',0.5)
}
diagram.startPair = function(svgDefs){
    svgDefs.append('svg:marker')
        .attr('id', "start-pair")
        .attr('viewBox', '-7 -7 14 14')
        .attr('markerWidth', 10)
        .attr('markerHeight', 12 )
        .attr('orient', 'auto')
        .attr('markerUnits', 'userSpaceOnUse')
      .append('svg:path')
        .attr('d', diagram.shape.diamond)
        .attr('fill', "#000").style('opacity',0.5)
}
diagram.twistMark = function(svgDefs){
    svgDefs.append('svg:marker')
        .attr('id', "twist-1")
        .attr('viewBox', '-2 -2 4 4')
        .attr('markerWidth', 5)
        .attr('markerHeight', 5)
        .attr('orient', 'auto')
        .attr('markerUnits', 'userSpaceOnUse')
      .append('svg:path')
        .attr('d', 'M 0,6 0,-6')
        .attr('fill', "#000")
        .attr('stroke', "#000")
        .attr('stroke-width', "1px")
}
diagram.markers = function(svgDefs,id,color){
    svgDefs.append('svg:marker')
        .attr('id', 'start-' + id)
        .attr('viewBox', '0 -5 10 10')
        .attr('markerWidth', 6)
        .attr('markerHeight', 8 )
        .attr('orient', 'auto')
        .attr('markerUnits', 'userSpaceOnUse')
      .append('svg:path')
        .attr('d', 'M0,0L10,0')
        .attr('stroke-width', 3)
        .attr('stroke', color)

    svgDefs.append('svg:marker')
        .attr('id', 'end-' + id)
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 10)
        .attr('markerWidth', 6)
        .attr('markerHeight', 8 )
        .attr('orient', 'auto')
        .attr('markerUnits', 'userSpaceOnUse')
      .append('svg:path')
        .attr('d', 'M0,0L10,0')
        .attr('stroke-width', 3)
        .attr('stroke', color)
}
diagram.shape = {}
diagram.shape.stitch = "M 6,0 A 6,6 0 0 1 0,6 6,6 0 0 1 -6,0 6,6 0 0 1 0,-6 6,6 0 0 1 6,0 Z" // larger circle
diagram.shape.pin = "M 4,0 A 4,4 0 0 1 0,4 4,4 0 0 1 -4,0 4,4 0 0 1 0,-4 4,4 0 0 1 4,0 Z" // smaller circle
diagram.shape.square = "M 6,0 A 6,6 0 0 1 0,6 6,6 0 0 1 -6,0 6,6 0 0 1 0,-6 6,6 0 0 1 6,0 Z"
diagram.shape.diamond = "M 6,0 A 6,6 0 0 1 0,6 6,6 0 0 1 -6,0 6,6 0 0 1 0,-6 6,6 0 0 1 6,0 Z"
diagram.shape.bobbin = "m 0,40 c -3.40759,0 -6.01351,3.60204 -1.63269,3.60204 l 0,19.82157 c -3.67432,-0.008 -1.7251,5.087 -1.32784,7.27458 0.76065,4.18864 1.01701,8.40176 0.3478,12.58551 -1.68869,10.55725 -2.31894,21.67593 1.25552,31.9161 0.2088,0.59819 0.68935,2.7631 1.40054,2.7636 0.71159,0 1.19169,-2.16521 1.40057,-2.7636 C 5.01838,104.95964 4.38954,93.84095 2.70085,83.2837 2.03164,79.09995 2.28656,74.88683 3.04721,70.69819 3.44447,68.51061 5.61865,63.44146 1.71951,63.42361 l 0,-19.82157 C 5.86853,43.60204 3.4855,39.99659 0,40 L 0,0"
diagram.markLinks = function(links) {
  links
    .style('marker-start', function(d) { if (d.start != "white") return 'url(#start-'+d.start+')' })
    .style('marker-end', function(d) { if (d.end != "white") return 'url(#end-'+d.end+')' })
    .style('marker-mid', function(d,i) { if (d.mid) return 'url(#twist-1)' })
}
diagram.transform = function(d) {
    // moves a node into its next position
    return "translate(" + (d.x = d.x ? d.x : 0) + "," + (d.y = d.y ? d.y : 0) + ")"
}
diagram.showGraph = function(args) {
    //var colorpicker = (args.threadColor == undefined ? undefined : d3.select(args.threadColor)[0][0])

    args.width = args.width ? args.width : 744
    args.height = args.height? args.height : 1052

    // document creation
    var svgRoot = d3.select(args.container).append("svg")
                .attr("width", args.width)
                .attr("height", args.height)
                .attr("pointer-events", "all")

    // marker definitions

    var defs = svgRoot.append('svg:defs')
    diagram.startThread(defs)
    diagram.startPair(defs)
    diagram.twistMark(defs)
    diagram.markers(defs, 'green','#0f0')
    diagram.markers(defs, 'red','#f00')
    diagram.markers(defs, 'purple','#609')
    //diagram.markers(defs, 'white','#fff')

    // zoom functionality

    var container = svgRoot.append('svg:g')
                //.call(d3.zoom().scaleTo(args.scale).on("zoom", redraw))
                //https://github.com/d3/d3/blob/master/CHANGES.md#zooming-d3-zoom
              .append('svg:g')
                .attr("transform", args.transform)

    container.append('svg:rect') // TODO somehow just surround the graph
        .attr('width', args.width * (5/args.scale))
        .attr('height', args.height * (5/args.scale))
        .attr('fill', 'white')

    function redraw() {
      container.attr("transform",
          "translate(" + d3.event.translate + ")"
          + " scale(" + d3.event.scale + ")");
    }

    // object creation and decoration

    var isIE = document.documentURI == undefined // wrong feature check
    var isMobileMac = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream

    var link = container.selectAll(".path").data(args.links).enter().append("svg:path")
        .attr("class", function(d) { return d.thread ? "link thread" + d.thread : "link" })
        .attr("id",function(d,i) { return "link_" + i; })
        .style('opacity', function(d) { return d.border || d.toPin ? fullyTransparant : 1})
        .style('stroke', '#000')
        .style('fill', 'none')
    if (!isIE) diagram.markLinks(link)

    var node = container.selectAll(".node").data(args.nodes).enter().append("svg:path")
        .attr("d", function(d) { return (d.bobbin ? diagram.shape.bobbin : d.pin ? diagram.shape.pin : diagram.shape.stitch)})
        .attr("class", function(d) { return "node " + (d.startOf ? "threadStart" : d.thread ? ("thread"+d.thread) : "")})
        .style('opacity', function(d) { return d.bobbin || d.pin ? 1 : fullyTransparant})
        .style('fill', '#000000')
        .style('stroke', function(d) { return d.pin ? 'none' : '#000000'})

     node.append("svg:title").text(function(d) { return d.title ? d.title : "" })

    // configure layout

    var sim = d3.forceSimulation()
        .force("link", d3.forceLink().id(function(d) { return d.id; }))
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter(args.width / 2, args.height / 2))
//    var force = d3.layout.force()
//        .nodes(args.nodes)
//        .links(args.links)
//        .size([args.width, args.height])
//        .charge(-20)
//        .linkDistance(10)
//        .linkStrength(10)
//        .start()
//        .alpha(0.01)

//    var threadStarts = container.selectAll(".threadStart") // TODO fixme
//    if ( args.palette ) {
//      var colors = args.palette.split(',')
//      for(i=threadStarts[0].length ; i >= 0 ; i--) {
//        var n = (i - 1 + colors.length) % colors.length
//        container.selectAll(".thread"+i)
//          .style('stroke', colors[n])
//          .style('fill', function(d) { return d.bobbin ? colors[n] : 'none'})
//      }
//    }
//
//    // event listeners
//
//    threadStarts.on('click', function (d) {
//        if (d3.event.defaultPrevented) return
//        container.selectAll("."+d.startOf)
//          .style('stroke', '#'+colorpicker.value)
//          .style('fill', function(d) { return d.bobbin ? '#'+colorpicker.value : 'none' })
//    })

    var pathTicked = function(d) {
    // looks more like drawlink in http://bl.ocks.org/mbostock/f584aa36df54c451c94a9d0798caed35
        // moves a link into its next position
        var source = args.nodes[d.source]
        var target = args.nodes[d.target]
        var sX = source.x = (source.x ? source.x : 0)
        var sY = source.y = (source.y ? source.y : 0)
        var tX = target.x = (target.x ? target.x : 0)
        var tY = target.y = (target.y ? target.y : 0)
        var dX = (tX - sX)
        var dY = (tY - sY)
        var mid = d.left ? ("S" + (sX - dY/3 + dX/3) + "," + (sY + dX/3 + dY/3)) :
                  d.right ? ("S" + (sX + dY/3 + dX/3) + "," + (sY + dY/3 - dX/3)) :
                             " "
        if (d.end && d.end == "white")
            return "M"+ sX + "," + sY + mid + " " + (tX - dX/4) + "," + (tY - dY/4)
        if (d.start && d.start == "white")
            return "M"+ (sX + dX/4) + "," + (sY + dY/4) + mid + " " + tX + "," + tY
        if (d.mid)
            return "M"+ sX + "," + sY + " " + (sX + dX/2) + "," + (sY + dY/2) + " " + tX + "," + tY
        return "M"+ sX + "," + sY + " " + tX + "," + tY
    }
    // a higher speed for IE as marks only appear when the animation is finished
    var mod = isMobileMac ? 10 : isIE ? 3 : 2
    var step = 0
    var simTicked = function() {
                         if ( ((step++)%mod) != 0) return
                         node.attr("transform", diagram.transform)
                         link.attr("d", pathTicked)
                     }
    var simEnded = function(){
                      if (isIE) diagram.markLinks(link)
                      if (args.onAnimationEnd) args.onAnimationEnd()
                    }
    sim.on("tick", simTicked)
    sim.on("end", simEnded)
}
