
var easy_pg = function(title, obj, limit, cls){
    var p = new Ext.grid.PropertyGrid({
        title: title,
        columnWidth: 1,
        cls: cls,
        autoHeight: true,
        autoWidth: true,
        hideHeaders: true,
        listeners: { 'beforeedit': function (e) { return false; } },
        viewConfig: {scrollOffset: 0, autoFill: true, forceFit: true},
    })
    
    delete p.getStore().sortInfo; // Remove default sorting
    p.getColumnModel().getColumnById('name').sortable = false; // set sorting of first column to false
    p.setSource(limit_dict(obj, limit)); // Now load data
    return p;
}

var setHistory = function(fn, val){   
    app.settinghistory = true;
    if(typeof(val) == 'undefined'){
        Ext.History.add(fn, true);
    }
    else{
        Ext.History.add(fn + ":" + val, true);
    }
    (function() {
    app.settinghistory = false;
    }).defer(150);
}

var changeHistory = function(token){
    if(app.settinghistory !== true){
        var parts = token.split(":");
        if(parts.length == 1){
            eval(parts[0] + "()");
        }
        else{
            eval(parts[0]+ "('" + parts.slice(1).join(",") + "')");
        }
    }
}

var jsonstore = function(dataset, fieldlist) {
    var cleanfieldlist = Array();
    for(var i = 0; i < fieldlist.length; i++){
        cleanfieldlist.push(fieldlist[i].split("*").join(""));
    } 
    var store = new Ext.data.ArrayStore({fields: cleanfieldlist});
    var data = [];
    
    for(var i = 0; i < dataset.length; i++){
        var d = dataset[i];
        var dataframe = [];
        for(var j = 0; j < fieldlist.length; j++){          
            dataframe.push(resolveobj(fieldlist[j], d));
        }
        data.push(dataframe);
    }
          
    store.loadData(data);
    return store;
}

requestingplotinfo = false;

var plotinto = function(fid, oid, xid, ds, dsname, param, paramname, xmin, xmax, overviewplot){

    var numbins = 750;
     
    if(requestingplotinfo !== true){
        requestingplotinfo = true;
    
        $.jsonRPC.request("dataset.get_derived", {
        
            params: [ds, {"numbins": numbins, "limits": [xmin, xmax], "params": [param]}],  
            success: function(result) {
                  
                var datao = [];

                for (var i=0; i<result[0].length; i++) {
                    datao[i] = [result[0][i], result[1][i]];
                }
                                         
                
                if(result[0].length < numbins){
                    var data = [{ data: datao, points: {show: true}, lines: {show: true}, label: paramname}];   
                }
                else{
                    var data = [{ data: datao, label: paramname}];   
                }
                
                var options = {
                    selection: { mode: "x" },
                };

                var figure = $(fid);
                var overview = $(oid);
                figure.unbind("plotselected");
                figure.bind("plotselected", function (event, ranges) {
                                          
                       figureplot = $.plot(figure, data,
                              $.extend(true, {}, options, {
                                  xaxis: { min: ranges.xaxis.from, max: ranges.xaxis.to }
                              }));

                        plotinto(fid, oid, xid, ds, dsname, param, paramname, ranges.xaxis.from, ranges.xaxis.to, overviewplot);
                        overviewplot.setSelection(ranges, true);
                });  
                          
                var figureplot = $.plot(figure, data, options);
               
                if(typeof overviewplot == "undefined"){

                    overviewplot = $.plot(overview, [{ data: datao }], {
                        series: {
                            lines: { show: true, lineWidth: 1 },
                            shadowSize: 0
                        },
                        xaxis: { ticks: []},
                        yaxis: { ticks: [], autoscaleMargin: 0.1 },
                        selection: { mode: "x" }
                    });
                    
                    overview.bind("plotselected", function (event, ranges) {
                        figureplot.setSelection(ranges);
                    });
                    
                    
                    $(xid).text(dsname);
                                        
                }
                
                requestingplotinfo = false;
            }
            
        });
    } 
}

var lineageinto = function(id, obj, wrap){
   
    var rowheight = 20;
    wrap.show();

    $.jsonRPC.request("study.lineage", {
        params: [id],  
        success: function(lineage) {
            var nodes = lineage.nodes;
            var edges = lineage.edges;
            var levelcount = Array();
            var levels = Array();
            $.each(nodes, function(key, value){
                if(typeof levelcount[value.level] == "undefined"){
                    levelcount[value.level] = 1;
                    levels[value.level] = Array();
                    levels[value.level].push(key);
                }
                else{
                    levelcount[value.level] += 1;
                    levels[value.level].push(key);
                }
            });
            
            var maxlevel = Math.max.apply(null, levelcount);
            
            var width = $(obj).width();
            var height = (maxlevel) * rowheight ;
            var leveldist = width/(levels.length);
            var offset = leveldist / 2;
            var hoffset = rowheight / 2;

            var depmap = Array();
            for(var k = 0; k < edges.length; k++){
                if(typeof depmap[edges[k][0]] == "undefined")
                    depmap[edges[k][0]] = Array();

                for(var l = 0; l < levels.length; l++){
                    for(var m = 0; m < maxlevel; m++){
                        if(levels[l][m] == edges[k][1]){
                            var o = {"id": edges[k][1], "x": l, "y": m};
                            depmap[edges[k][0]].push(o);
                        }
                    }
                }
            }


            $(obj).height(height);

            var paper = Raphael(obj.substr(1), width, height);
            
            for(var i=0; i < levels.length; i++){
                var x = offset + leveldist*i; 
                for(var j = 0; j < maxlevel; j++){
                    var y = hoffset + rowheight * j;
                    var el = levels[i][j];
                    if(typeof el != "undefined"){
                        var node = nodes[el];
                        var description = (el.substr(0, 8) + ": " + node.description);
                        if(description.length > 30)
                            description = description.substr(0,28) + "..."
                        var text = paper.text(x,y, description);
                        var bb = text.getBBox();
                        var bg = paper.rect(bb.x-6, bb.y-2, bb.width+12, bb.height+4, 4);
                        text.toFront();
                        text.attr("title", node.description);
                        text.attr("fill", "#fff");
                        text.attr("font-weight", "bold");
                        bg.attr("stroke-width", 0);
                        bg.attr("fill", "#039");
                        $(text.node).click(el, function (e) {
                            showDataset(e.data);
                        });

                        var edgelist = depmap[el];
                        if(typeof edgelist != "undefined"){
                            for(var k = 0; k < edgelist.length; k++){
                                var cx = edgelist[k].x*leveldist + offset;
                                var cy = edgelist[k].y*rowheight + hoffset;
                                var m = ["M", x, y];
                                var c = ["C", (cx+x)/2, y, (cx+x)/2, cy, cx, cy];
                                var line = paper.path([m, c]);
                                line.attr("stroke-width", 2);
                                line.attr("opacity", 0.2);
                                line.toBack();
                            }
                        }
                    }
                }
            }

            if(maxlevel > 5){
                wrap.collapse();
            }
        }      
    });
}

