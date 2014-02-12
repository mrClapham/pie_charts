/**
 * This is a simple Piechart/donut chart component.
 * It is highly configurable.
 * Default settings which may be overidden and their defaults  are :
 *
 * config:config,
 * targ:targ,
 * data:data,
 * width:350,
 * height:350,
 * outerOffset: 10,
 * thickness:70,
 * radius:null,
 * arc:null,
 * arcs:null,
 * arcPaths:null,
 * pie:null,
 * svg:null,
 * arcColors:null,
 * sorting:null,
 * animated:true,
 * colors:['#484848', '#747474','#999999','#15ffad', '#ff4c1a'],
 * showLegends:true,
 * legendColor:'#ffffff',
 * legendWidth:350,
 * legendHeight:14,
 * legendPadding:4,
 * legendTopOffset:12
 */



function Comp_pie(targ, data, config){
    var scope = {
        model:{
            eventListener:null,
            config:config,
            targ:targ,
            data:data,
            width:350,
            height:350,
            outerOffset: 10,
            thickness:70,
            radius:null,
            arc:null,
            arcs:null,
            arcPaths:null,
            pie:null,
            svg:null,
            arcColors:null,
            sorting:null,
            animated:true,
            colors:['#484848', '#747474','#999999','#15ffad', '#ff4c1a'],
            showLegends:true,
            legendColor:'#ffffff',
            legendWidth:350,
            legendHeight:14,
            legendPadding:4,
            legendTopOffset:12

        },
        view:{
            legends:null,
            legendBlocks:null

        },
        controller:{
            init:function(){
                scope.model
                for(var prop in config){
                    scope.model[prop] = config[prop]
                    console.log(" INIT CALLED + prop... "+config[prop])
                }
                scope.model.radius = Math.min(scope.model.width, scope.model.height) / 2;
                scope.controller.initSVG();
                scope.controller.draw();
            },
            clear:function(){
                d3.select(scope.model.targ).selectAll("svg").remove()

            },
            draw:function(){
                console.log("DRAW CALLED...")
                scope.controller.initColours();
                scope.controller.initPie();
                scope.controller.initArc();
                scope.controller.initArcs();
                //if (scope.controller.showLegends==true){
                    scope.controller.initLegends();
                //}
            },
            initSVG:function(){

                scope.model.svg = d3.select(scope.model.targ).append("svg")
                    .attr("width", scope.model.width+scope.model.legendWidth)
                    .attr("height", scope.model.height)
                    .data(scope.model.data)
                    .append("g")
                    .attr("transform", "translate(" + scope.model.width / 2 + "," + scope.model.height / 2 + ")");
            },
            initColours:function(){
                scope.model.arcColors = d3.scale.ordinal()
                    .range(scope.model.colors);
            },
            initPie:function(){
                scope.model.pie = d3.layout.pie()
                    .sort(scope.model.sorting)
                    .value(function(d) { return d.value; });
            },
            initArc:function(){
                scope.model.arc = d3.svg.arc()
                    .outerRadius( scope.model.radius - scope.model.outerOffset )
                    .innerRadius( scope.model.radius - (scope.model.thickness+scope.model.outerOffset) );
            },
            initArcs:function(){
                scope.model.arcs = scope.model.svg.selectAll(".arc")
                    .data(scope.model.pie(scope.model.data))
                    .enter().append("g")
                    .attr("class", "arc")
                    .on("mouseover", function(d, i){scope.controller.onSegmentMouseOver(d,i) })

                scope.model.arcs.append("path")
                    .attr("d", scope.model.arc)
                    .style("fill", function(d) { return scope.model.arcColors(d.data.label); })
                    .each(function(d){
                        this._current=d;

                    }) // storing an initial value of 'd' for later tweening;
                ;

                scope.model.arcs.append("text")
                    .attr("transform", function(d) { return "translate(" + scope.model.arc.centroid(d) + ")"; })
                    .attr("dy", ".35em")
                    .attr("class", "pie_text")
                    .style({"text-anchor":  "middle"})
                    .text(function(d) { return d.data.label; });
            },
            initLegends:function(){
                console.log("INIT LEGENDS CALLED... ")
                scope.view.legends = scope.model.svg.selectAll('.legendHolder')
                         .data(scope.model.data)

                scope.view.legends
                    .enter()
                    .append("text")
                    .attr('fill', function(d,i){return scope.model.colors[i]})
                    .attr('class', 'legendHolder')
                    .attr('y', function(d,i){return (scope.model.legendHeight/2) + scope.model.legendTopOffset + (0-scope.model.radius) + ((scope.model.legendHeight+scope.model.legendPadding)*i)})
                    .attr('x', function(d,i){return scope.model.radius+scope.model.legendPadding+scope.model.legendHeight })
                    .attr('width', 100)
                    .attr('height', scope.model.legendHeight+scope.model.legendPadding)
                   .attr('fill', '#ffffff')
                    .text(function(d) { return d.label; })
                    .attr('class', 'pie_text')
//                .attr('dy', function(d,i){return (0-scope.model.radius) + (10*i)})
//                .attr('x', function(d,i){return scope.model.radius });


                scope.view.legends
                    .exit().remove();
                 // now for the blocks of colour

                scope.view.legendBlocks =  scope.model.svg.selectAll('.legendBlock')
                    .data(scope.model.data)
                    .enter()
                    .append("svg:rect")
                    .attr('fill', function(d,i){return scope.model.colors[i]})
                    .attr('class', 'legendBlock')
                    .attr('y', function(d,i){return (0-scope.model.radius) + scope.model.legendTopOffset +((scope.model.legendHeight+scope.model.legendPadding)*i)})
                    .attr('x', function(d,i){return scope.model.radius })
                    .attr('width', 12)
                    .attr('height', 12)




               // scope.view.legends

            },
            onSegmentMouseOver:function(d,i){
                console.log("onSegmentMouseOver d = "+d+"  i "+i)
            },
            // Store the displayed angles in _current.
            // Then, interpolate from _current to the new angles.
            // During the transition, _current is updated in-place by d3.interpolate.
            arcTween:function(a){
                var i = d3.interpolate({value: a._current}, a);
                console.log("arcTween CALLED "+a._current)

                this._current = i(0);

                return function(t) {
                    return scope.model.arc(i(t));
                }
            },
            update:function(){
                console.log("update CALLED");
                scope.model.arcPaths = scope.model.targ.selectAll("path")
                    .transition().duration(750).attrTween("d", scope.controller.arcTween)
                    //.data(scope.model.pie(scope.model.data))
                    .each(function(d){
                        console.log("CURRENT + "+this._current)
                        //this.transition().duration(750).attrTween("d", scope.controller.arcTween(this));
                    });
                    //.transition().duration(750).attrTween("d", scope.controller.arcTween(this));
            },
            change:function(){

            }
        }
    };
    /**
     * setData accepts an array of Objects
     * @param value
     */
    scope.setData=function(value){
       scope.model.data = value;
        scope.controller.clear();
       scope.controller.init();

    }

    scope.controller.init();

    this.setData = function(data){
        scope.model.data = data
        scope.controller.update();


    }

    return scope;

}