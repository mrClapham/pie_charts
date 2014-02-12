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




function Piechart_2layer(targ, data, config){
    var scope = {
        model:{
            eventListener:null,
            config:config,
            targ:targ,
            data:data,
            transitionSpeed:200,
            dataAggregat:function(){
                var totalValue =0
                var ds = scope.model.data
                for(var val in ds){
                    for(var val2 in ds[val].data){
                        totalValue+=  ds[val].data[val2].value;
                    }
                }
                return  totalValue
            },
            innerData:function(){
                var ds = scope.model.data


                var _d =[]

                for(var i=0; i< ds.length; i++){
                    var label = ds[i].label;
                    var value = 0
                    for(var n = 0; n<ds[i].data.length; n++ ){
                        value += ds[i].data[n].value
                    }
                //   console.log(" PERCENT = value "+value+"  totalValue "+totalValue+"  asPercent: "+scope.controller.asPercent(value, totalValue))
                    var percent =  scope.controller.asPercent(value, scope.model.dataAggregat())
                   // console.log(percent)

                    _d.push({label:label, value:value, percent:percent, i:i})
                }


                return _d;
            },
            outerData:function(){
                var ds = scope.model.data

                var _d =[]

                for(var i=0; i< ds.length; i++){
                    for(var n = 0; n<ds[i].data.length; n++ ){
                        ds[i].data[n].i = i
                        // storing the position in the  array and in the nested array for later use
                        ds[i].data[n].n = n
                        //and convert the value to a percent...
                        var percent =  scope.controller.asPercent(ds[i].data[n].value, scope.model.dataAggregat())
                        ds[i].data[n].percent = percent

                        _d.push(ds[i].data[n])
                    }
                }
                return _d;
            },
             nodeData:function(value){
                 return scope.model.data[value].data
             },
            width:450,
            height:450,
            outerOffset: 100,
            arcPaths:null,
            thickness:50,
            radius:null,
            arc:null,
            arcs:null,
            pie:null,
            //--- outer
            arcOuter:null,
            arcsOuter:null,
            outerPie:null,
            arcColors:null,
            sorting:null,
            animated:true,
            colors:['#484848', '#747474','#999999','#15ffad', '#ff4c1a'],
            colorArray:['rgba(195, 26, 39, 1)', 'rgba(228, 30, 31, 1)', 'rgba(228, 52,26, 1)','rgba(229, 101, 28, 1)','rgba(234, 174, 37, 1)','rgba(235, 213, 38, 1)','rgba(236, 236, 49, 1)'],
            showLegends:true,
            legendColor:'#ffffff',
            legendWidth:350,
            legendHeight:14,
            legendPadding:4,
            legendTopOffset:12,
            selectedSegmentMajor:0,
            selectedValue:'',
            selectedPercent:'',
            selectedLegend:'',
            showPercent:true,
            selectedValueHtm:function(){
                 return '<p class="legendNumber">'+scope.model.selectedValue+'</p><p class="legendText">'+scope.model.selectedLegend+'</p>';
            },
            centerLegentTopOffset:50
        },
        view:{
            legends:null,
            legendBlocks:null,
            outerSvg:null,
            svg:null,
            menuDiv:null,
            centerlegentNumber:null,
            centerLegentText:null,
            targ:targ

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
            asPercent:function(part, whole){
              return  ( part/whole * 100 ).toFixed(2)
            },
            clear:function(){
                d3.select(scope.model.targ).selectAll("svg").remove()
            },
            draw:function(){
                scope.controller.initCenterLegends()
                scope.controller.initColours();
                scope.controller.initPie();

                scope.controller.initArcOuter();
                scope.controller.initArcsOuter();

                scope.controller.initArc();
                scope.controller.initArcs();

                if (scope.controller.showLegends==true){
                    scope.controller.initLegends();
                }
                scope.controller.initMenu()

            },
            initSVG:function(){
                scope.view.svg = d3.select(scope.model.targ).append("svg")
                    .append("g")
                    .attr('class', 'holder')
                    .attr("width", scope.model.width+scope.model.legendWidth)
                    .attr("height", scope.model.height)
                    .attr("transform", "translate(" + scope.model.width / 2 + "," + scope.model.height / 2 + ")")
                    .style('z-index', 10)


                // -- create the filters


                var filter = scope.view.svg.append("svg:defs")
                    .append("svg:filter")
                    .attr("id", "blur1")
                    .append("svg:feGaussianBlur")
                    .attr("stdDeviation", 5);


                var filter2 = scope.view.svg.append("svg:defs")
                    .append("svg:filter")
                    .attr("id", "blurx")

                    .attr("x", '50%')
                    .attr("y",'50%')
                    .attr("width",'200%')
                    .attr("height",'200%')
                filter2
                    .append("svg:feGaussianBlur")
                    .attr('in', 'SourceAlpha')
                    .attr('operator', 'arithmetic')
                    .attr('k2', '-1')
                    .attr('k3', '1')
                    .attr('result', 'hlDiff')
                filter2
                    .append('svg:feFlood')
                    .attr('flood-color', '#ff00ff')
                    .attr('flood-opacity',.7)
                filter2
                    .append('feComposite')
                    .attr('in', 'hlDiff')
                    .attr('operator', 'in')
                filter2
                    .append('svg:feComposite')
                    .attr('in', 'SourceGraphic')
                    .attr('operator', 'over')
                    .attr('result', 'withGlow')

                var filter3 = scope.view.svg.append("svg:defs")
                    .append("svg:filter")
                    .attr("id", "blur__")

                filter3
                    .append("svg:feOffset")
                    .attr("stdDeviation", 5)
                    .attr("dx", "-2")
                    .attr("dy","-2")

                filter3
                    .append('svg:feComposite')
                    .attr('in2', 'SourceAlpha')
                    .attr('operator', 'arithmetic')
                    .attr('k2', '-1')
                    .attr('k3', '1')
                    .attr('result', 'shadowDiff')

                filter3
                    .append('svg:feComposite')
                    .attr('flood-color', "white")
                    .attr('flood-opacity', '1')

                filter3
                    .append("svg:feGaussianBlur")
                    .attr('in', 'SourceAlpha')
                    .attr('operator', 'arithmetic')
                    .attr('k2', '-3')
                    .attr('k3', '3')
                    .attr('result', 'hlDiff')

                //////////////////////////////////////////////////////

                var filter4 = scope.view.svg.append("svg:defs")
                    .append("svg:filter")
                    .attr("id", "blur")
                    .attr("width", "200%")
                    .attr("height", "200%")

                filter4
                    .append("svg:feGaussianBlur")
                    .attr("in", 'SourceAlpha')
                    .attr('stdDeviation', '1')
                    .attr("result", "blur")

                filter4
                    .append('svg:feOffset')
                    .attr('dy', '1')
                    .attr('dx', '0')

                filter4
                    .append('svg:feComposite')
                    .attr('in2', "SourceAlpha")
                    .attr('operator', 'arithmetic')
                    .attr('k2', '-2')
                    .attr('k3', '2')
                    .attr("result", "shadowDiff")

                filter4
                    .append("svg:feFlood")
                    .attr('flood-color', 'white')
                    .attr('flood-opacity', '.1')

                filter4
                    .append("svg:feComposite")
                    .attr('in2', 'shadowDiff')
                    .attr('operator', 'in')

                filter4
                    .append("svg:feComposite")
                    .attr('in2', 'SourceGraphic')
                    .attr('operator', 'over')

                /* the grad */

                filter4
                    .append("svg:linearGradient")
                    .attr('x1', '0%')
                    .attr('x2', '0%')
                    .attr('y1', '0%')
                    .attr('y2', '100%')
                    .attr('spreadMethod', 'pad')
                    .attr('operator', 'over')

                filter4
                    .append("svg:stop")
                    .attr('offset', '0%')
                    .attr('stop-color', '#00cc00')
                    .attr('stop-opacity', '.1')

                filter4
                    .append("svg:stop")
                    .attr('offset', '100%')
                    .attr('stop-color', '#006600')
                    .attr('stop-opacity', '.1')


                 /////////////////////////////////////////////////////




                //////////////////////////////////////////////////////

                var filterShad = scope.view.svg.append("svg:defs")
                    .append("svg:filter")
                    .attr("id", "blurShad")
                    .attr("width", "200%")
                    .attr("height", "200%")

                filterShad
                    .append("svg:feGaussianBlur")
                    .attr("in", 'SourceAlpha')
                    .attr('stdDeviation', '1')
                    .attr("result", "blur")

                filterShad
                    .append('svg:feOffset')
                    .attr('dy', '1')
                    .attr('dx', '0')

                filterShad
                    .append('svg:feComposite')
                    .attr('in2', "SourceAlpha")
                    .attr('operator', 'arithmetic')
                    .attr('k2', '-2')
                    .attr('k3', '2')
                    .attr("result", "shadowDiff")

                filterShad
                    .append("svg:feFlood")
                    .attr('flood-color', 'white')
                    .attr('flood-opacity', '.1')

                filterShad
                    .append("svg:feComposite")
                    .attr('in2', 'shadowDiff')
                    .attr('operator', 'in')

                filterShad
                    .append("svg:feComposite")
                    .attr('in2', 'SourceGraphic')
                    .attr('operator', 'over')

                /* the grad */

                filterShad
                    .append("svg:linearGradient")
                    .attr('x1', '0%')
                    .attr('x2', '0%')
                    .attr('y1', '0%')
                    .attr('y2', '100%')
                    .attr('spreadMethod', 'pad')
                    .attr('operator', 'over')

                filterShad
                    .append("svg:stop")
                    .attr('offset', '0%')
                    .attr('stop-color', '#00cc00')
                    .attr('stop-opacity', '.1')

                filterShad
                    .append("svg:stop")
                    .attr('offset', '100%')
                    .attr('stop-color', '#006600')
                    .attr('stop-opacity', '.1')
                //-- the shadow starts
                filterShad
                    .append('svg:feOffset')
                    .attr('result', 'offOut')
                    .attr('in', 'SourceAlpha')
                    .attr('dx','6')
                    .attr('dy','6')

                filterShad
                    .append('feGaussianBlur')
                    .attr('result', 'blurOut')
                    .attr('in','offOut')
                    .attr('stdDeviation', '4')

                filterShad
                    .append('feBlend')
                    .attr('in','SourceGraphic')
                    .attr('in2', 'blurOut')
                    .attr('mode', 'normal')

                //-- the shadow ends
                /////////////////////////////////////////////////////

                scope.view.outerSvg = scope.view.svg
                    .append("g")
                    .attr('class', 'outerCircleHolder')

                scope.view.innerrSvg = scope.view.svg
                    .append("g")
                    .attr('class', 'innerCircleHolder')



                scope.view.innerrSvg
                    .append('g')
                    .append("svg:circle")
                    .attr('class', 'out_circle')
                    .attr("r", scope.model.radius - scope.model.outerOffset +10 )
                    .style('fill', '#1d1d1d')
                    //.style({'stroke': '#ff00ff',  'stroke-width':'1px'})
                    .style({'opacity': '1'})

                scope.view.innerrSvg
                    .append('g')
                    .append("svg:circle")
                    .attr('class', 'mid_circle')
                    .attr("r", scope.model.radius - scope.model.outerOffset - scope.model.thickness - 10 )
                    .style('fill', 'rgba(0,0,0,0)')
                    .style({'stroke': '#000000',  'stroke-width':'1px'})
                    .style({'opacity': '1'})

            },
            initCenterLegends:function(){
               var topPos = scope.model.outerOffset + scope.model.thickness;
               var boxWidth = scope.model.width - (topPos *2);
                scope.view.centerlegentNumber = d3.select(scope.view.targ)
                    .append('div')
                    .attr('class', 'legendNumber')
                    .style({'width':boxWidth+'px', 'height':'auto', 'position':'absolute', 'top':topPos+scope.model.centerLegentTopOffset+'px', 'left':topPos+'px', 'text-align':'center'})

                     scope.controller.updateCenterLegends();
            },
            updateCenterLegends:function(){
                scope.view.centerlegentNumber = d3.select('.legendNumber')
                .html(scope.model.selectedValueHtm())
            },
            initColours:function(){
                scope.model.arcColors = d3.scale.ordinal()
                    .range(scope.model.colors);
            },
            getColor:function(i, alpha){
                var colIndex = 0;
                i<scope.model.colorArray.length  ?   colIndex = i : colIndex = i % scope.model.colorArray.length;
               // colIndex = 0
                var retColour =  scope.model.colorArray[colIndex]

                if( alpha && !isNaN(alpha) ){
                    var splitString =  scope.model.colorArray[colIndex].split(',')
                    splitString[splitString.length-1] = String(alpha)+')'
                    retColour =  splitString.join(',')
                }
                return retColour;
            },
            initMenu:function(){
                scope.view.menuDiv  = d3.select(scope.model.targ)
                    .append("div")
                    .attr('class', 'pieMenuolder')
                    .style({'width': '300px', 'height':'300px', 'color':'#ffffff', 'position':'absolute', 'top':'10px', 'left':scope.model.width+'px'})

                scope.model.menuList = scope.view.menuDiv
                    .append('ul')
                    .attr('class', 'pieList')
                    .selectAll('li')

                scope.controller.updateMenu();
            },
            updateMenu:function(){

                scope.model.menuList = scope.view.menuDiv.select('.pieList').selectAll('li')
                    .remove()

                scope.model.menuList = scope.view.menuDiv.select('.pieList').selectAll('li')
                    .data(scope.model.pie(scope.model.innerData()))

                scope.model.menuList
                    .enter()
                    .append('li')
                    .attr('class', 'deselected over')
                    .append('a')
                    // .style('color', '#ffffff')
                    .attr('href', '#')
                    .append('div')
                    .attr('class', 'menuCellMaj')

                    .html(function(d, i){
                        var selectColour =  scope.controller.getColor(i)
                        var value
                        scope.model.showPercent ?   value  = d.data.percent+'%' : value = d.data.value ;
                        return "<div class='menu_value menu_num'>"+value+"</div>  <div class='menu_value menu_dot' style ='background-color: "+selectColour+"'></div><div class='menu_value'>"+d.data.label+"</div>"
                    })
                    .on("click", function(d, i){scope.setSelection(i) })
                    .on("mouseover", function(d, i){scope.controller.onSegmentMouseOver(d,i) })
                    .on('mouseout', function(d,i){scope.controller.onSegmentMouseOut(d,i)});

                scope.model.menuList.exit().remove();
            },

            initPie:function(){
                scope.model.pie = d3.layout.pie()
                    .sort(scope.model.sorting)
                    .value(function(d) { return d.value; });
            },
            // menu display in the middle of the circles
            // INNER
            initArc:function(){
                scope.model.arc = d3.svg.arc()
                    .outerRadius( scope.model.radius - scope.model.outerOffset )
                    .innerRadius( scope.model.radius - (scope.model.thickness+scope.model.outerOffset) );
            },
            //OUTER
            initArcOuter:function(){
                scope.model.arcOuter = d3.svg.arc()
//                    .outerRadius( scope.model.radius - 20 )
//                    .innerRadius( scope.model.radius - scope.model.outerOffset );
                    .outerRadius( scope.model.radius - scope.model.outerOffset + 20 )
                    .innerRadius( scope.model.radius - (scope.model.thickness+scope.model.outerOffset) );
            },
            initArcs:function(){
//                console.log("innerData     ")
//                console.log(scope.model.innerData())
//                console.log("outerData     ")
//                console.log(scope.model.outerData())

                scope.model.arcs =  scope.view.innerrSvg.selectAll('.innerPath')
                    .data(scope.model.pie(scope.model.innerData()))
                scope.model.arcs
                    .enter()
                    .append("path")
                    .attr('class','innerPath')
                    .style("fill", function(d,i) { return scope.controller.getColor(i, 1); })
                    .attr('transform', 'scale(1),translate(0,0)')
                    .attr("d", scope.model.arc)
                    .on("mouseover", function(d, i){scope.controller.onSegmentMouseOver(d,i) })
                    .on('mouseout', function(d,i){scope.controller.onSegmentMouseOut(d,i)})
                    .on("click", function(d, i){scope.controller.onSegmentClick(d,i, this) })

                    .each(function(d){
                        this._current=d;
                    }) // storing an initial value of 'd' for later tweening;

                scope.model.arcs
                    .style("fill", function(d,i) { return scope.controller.getColor(i, 1); })
                    .style('stroke', '#000000')
                    .attr("filter", "url(#blur)")

                    .style('stroke-width','1px')
                    .transition()
                    .duration(scope.model.transitionSpeed)
                    .attr("d", scope.model.arc)
                    .attr('transform', 'scale(1),translate(0,0)')

                   // .attrTween("d", scope.controller.arcTween(this))
                   //
                    .each(function(d){
                        this._current=d;
                    })
                   // .attrTween("d", scope.controller.arcTween(this))

                scope.model.arcs.exit().remove()
            },
            initArcsOuter:function(){
                scope.model.arcsOuter =  scope.view.outerSvg.selectAll('.outerPath')
                    .data(scope.model.pie(scope.model.outerData()))
                scope.model.arcsOuter
                    .enter()
                    .append("path")
                    .attr('class','outerPath')
                   // .style("fill", function(d,i) {return scope.controller.getColor(d.data.i, 1); })
                    .style("fill", 'rgba(0,0,0,0)')
                    .attr("d", scope.model.arcOuter)
                    .each(function(d){
                        this._current=d;
                    }) // storing an initial value of 'd' for later tweening;
                    .on('mouseover', function(d,i){ scope.controller.onSubSelectChanged(d.data.i, d.data.n) })

                scope.model.arcsOuter
                    //.style("fill", function(d,i) { return scope.controller.getColor(d.data.i, 1); })
//                    .style('stroke', '#000000')
//                    .style('stroke-width','1px')
                    //.style("stroke-dasharray", ("1, 2"))
                    .transition()
                    .duration(scope.model.transitionSpeed)
                    .attr("d", scope.model.arcOuter)
                    // .attrTween("d", scope.controller.arcTween(this))
                    //
                    .each(function(d){
                        this._current=d;
                    })
                // .attrTween("d", scope.controller.arcTween(this))

                scope.model.arcsOuter.exit().remove()
            },


            initLegends:function(){
                console.log("INIT LEGENDS CALLED... ")
                scope.view.legends = scope.view.svg.selectAll('.legendHolder')
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

                scope.view.legendBlocks =  scope.view.svg.selectAll('.legendBlock')
                    .data(scope.model.data)
                    .enter()
                    .append("svg:rect")
                    .attr('fill', function(d,i){return scope.model.colors[i]})
                    .attr('class', 'legendBlock')
                    .attr('y', function(d,i){return (0-scope.model.radius) + scope.model.legendTopOffset +((scope.model.legendHeight+scope.model.legendPadding)*i)})
                    .attr('x', function(d,i){return scope.model.radius })
                    .attr('width', 12)
                    .attr('height', 12)

            },
            onSegmentMouseOver:function(d,i){


                var outr =  scope.view.outerSvg.selectAll('.outerPath')
                    .attr('transform', 'scale(1.2),translate(0,0)')

                //console.log(i)
               scope.model.arcs
                  // .transition()
                  // .duration(scope.model.transitionSpeed)
                   .attr('transform', 'scale(1),translate(0,0)')
                   .each(function(d,i){
                   var _this = d3.select(this).attr('class','innerPath')
                        .attr("filter", "url(#blur)")
                        .style('z-index', '1');
                   })

                var rs = d3.select(scope.model.arcs[0][i])
                    .transition()
                    .duration(scope.model.transitionSpeed / 2)
                    .attr('transform', 'scale(1.1),translate(0,0)')
                    .attr('class','wedgeSelect innerPath')
                    .attr("filter", "url(#blurShad)")
                    .style('z-index', '30')

//                rs.parentNode.appendChild(rs)
//                    console.log(rs.parentNode)

                    .attr('null', function(d,i){
                        var value
                        scope.model.showPercent ? value = d.data.percent+'%' :  value = d.data.value

                        scope.setSelectedValues(value, d.data.label, d.data.value)
                    })
            },
            onSegmentMouseOut:function(d, i){
                scope.model.arcs
                    .transition()
                    .duration(scope.model.transitionSpeed)
                    .attr('transform', 'scale(1),translate(0,0)')
                    .attr("filter", "url(#blur)");

                // scope.setSelectedValues("","","")
            },
            onSegmentClick:function(d,i,t){
               scope.setSelection(i)
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
                    .transition().duration(scope.model.transitionSpeed).attrTween("d", scope.controller.arcTween)
                    //.data(scope.model.pie(scope.model.data))
                    .each(function(d){
                        console.log("CURRENT + "+this._current)
                        //this.transition().duration(750).attrTween("d", scope.controller.arcTween(this));
                    });
                    //.transition().duration(750).attrTween("d", scope.controller.arcTween(this));
            },
            change:function(){

            },
            onSelectionChanged:function(){
                scope.model.arcs
                    .transition()
                    .duration(scope.model.transitionSpeed)
                    .attr('transform', 'scale(1),translate(0,0)')

                var outr =  scope.view.outerSvg.selectAll('.outerPath')
                    .each(function(d,i){
                        var _this = d3.select(this)
                        var _hiliteOn =    scope.controller.getColor(scope.model.selectedSegmentMajor, .7);
                        var _strokeStyle
                        d.data.i===scope.model.selectedSegmentMajor ? _hiliteOn =  scope.controller.getColor(scope.model.selectedSegmentMajor, 1) : _hiliteOn =  'rgba(0,0,0,0)';
                        d.data.i===scope.model.selectedSegmentMajor ? _strokeStyle =  'rgba(0,0,0,1)' : _strokeStyle =  'none';


                        // console.log(d.data.value, d.data.label, d.data.value)
                        _this
                            .style('fill', _hiliteOn)
                            .style('stroke', _strokeStyle)
                            .attr("filter", "url(#blur)")
                            .transition()
                            .duration(scope.model.transitionSpeed)
                            .attr('transform', 'scale(1.2),translate(0,0)')
                    })
                //-- now the menu at the side
                scope.model.menuList
                    .attr('class', 'deselected over')

                scope.model.menuList.selectAll('.subLevel').remove()

               var selectedNode =  d3.select( scope.model.menuList[0][scope.model.selectedSegmentMajor] )
                   .attr('class', 'selected')
                   .append('ul')
                   .attr('class', 'subLevel')

                var subs = selectedNode.selectAll('.subLi')
                    .data( scope.model.pie( scope.model.nodeData(scope.model.selectedSegmentMajor) ) )
                    .enter()
                    .append('li')
                    .attr('class', 'subLi subDeselected')
                    .append('a')
                    .html(function(d, i){
                        var selectColour =  scope.controller.getColor(scope.model.selectedSegmentMajor  )

                        scope.model.showPercent ?   value  = d.data.percent+'%' : value = d.data.value ;

                        return "<span class='menu_value menu_num'>"+value+"</span>  <span class='menu_value menu_dot' style ='background-color: "+selectColour+"'></span><span class='menu_value'>"+d.data.label+"</span>"

                    })

                  // .text(function(d,i){ return d.data.label})
                    .on("mouseover", function(d, i){ scope.controller.onSubSelectChanged(d.data.i, d.data.n) })
            },
            onSubSelectChanged:function(ind,n){

                var subs = scope.model.menuList.selectAll('.subLi')
                    .attr('class', 'subLi subDeselected')

                var subNode = d3.select(subs[ind][n])
                    .attr('class', 'subLi subselected')

                var outr =  scope.view.outerSvg.selectAll('.outerPath')
                    .each(function(d,i){
                        var _this = d3.select(this)
                            .attr('transform', 'scale(1.2),translate(0,0)')

                       if(d.data.i==ind && d.data.n == n){
                           _this
                               .transition()
                               .duration(scope.model.transitionSpeed)
                               .attr('transform', 'scale(1.3),translate(0,0)')
                               .attr('null', function(d,i){
                                   var value
                                   scope.model.showPercent ? value = d.data.percent+'%' :  value = d.data.value
                                   scope.setSelectedValues(value, d.data.label, d.data.value)
                               })
                       }

                    })
            }
        }

    };
    /**                                           ≈
     * setData accepts an array of Objects
     * @param value
     */
    scope.setData=function(value){
        scope.model.data = value;
        scope.controller.initArcs();
        scope.controller.initArcsOuter()
        scope.controller.updateMenu()
    }

    scope.setSelection = function(value){
        if( !isNaN(value) ){
            scope.model.selectedSegmentMajor = value
            scope.controller.onSelectionChanged()
        }else{
            var outr =  scope.view.outerSvg.selectAll('.outerPath')
                .attr('transform', 'scale(1.2),translate(0,0)')


        }
    }
    scope.setSubSelection = function(section, subsection){

    }

    scope.setSelectedValues = function(num, legend, percent){

        scope.model.selectedValue = num
        scope.model.selectedLegend = legend
        scope.controller.updateCenterLegends();
    }

    scope.controller.init();

    this.setData = function(data){
        scope.model.data = data
        scope.setSelection(null)

        scope.controller.update();


    }

    return scope;

}