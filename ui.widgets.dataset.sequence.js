widgets.dataset.sequence = function(id){
    
    var wrap = [];
    
    $.jsonRPC.request("dataset.sequence.get", {
        params: [id], 
        async: false,
        success: function(obj) {
            
            // Add "Sequence" info to header
            var overview = widgets.easy_pg('Sequence', obj, ["index_type.name", "index_type.unit", "index_marker_type", "index_marker_location"]);
            
            views.show.master.addproperties(overview);
            
            var toolbar = new Ext.Panel({
                layout: 'fit',
                cls: 'layoutpad',
                height: 40,
                items: [
                    {xtype: 'toolbar', items: [{xtype: 'tbspacer', width: 5},
                    {
                            text: '<b>Download</b>',
                            icon: 'icons/page_save.png',
                            handler: function(){
                                widgets.dataset.sequence.download(id);
                            }
                    },
                    {xtype: 'tbspacer', width: 5},
                    {
                        text: 'Plotting',
                        icon: 'icons/chart_curve.png',
                        menu: [
                            {
                                text: 'X-axis', menu: [
                                {
                                    text: 'Logarithmic', 
                                    xtype: 'menucheckitem',
                                    id: 'sequence.plot.x.log',
                                    handler: widgets.dataset.sequence.plot.redraw
                                },
                                {
                                    text: 'Inverted', 
                                    xtype: 'menucheckitem',
                                    id: 'sequence.plot.x.inverted',
                                    handler: widgets.dataset.sequence.plot.redraw
                                }
                            ]},
                            {   text: 'Y-axis', menu: [
                                {
                                    text: 'Logarithmic', 
                                    xtype: 'menucheckitem',
                                    id: 'sequence.plot.y.log',
                                    handler: widgets.dataset.sequence.plot.redraw
                                },
                                {
                                    text: 'Inverted', 
                                    xtype: 'menucheckitem',
                                    id: 'sequence.plot.y.inverted',
                                    handler: widgets.dataset.sequence.plot.redraw
                                }
                            ]}
                        ]
                    },
                    {xtype: 'tbspacer', width: 5},
                    {
                        text: 'Analysis',
                        icon: 'icons/chart_pie.png',
                        menu: [
                            {text: 'Compare with other dataset', disabled: true},
                            '-'

                        ]
                    },
                    /*
                    {xtype: 'tbspacer', width: 5},
                    {
                        text: 'Metadata',
                        icon: 'icons/note.png',
                        menu: [
                            {text: 'Annotate'}
                        ]
                    },
                    */
                    {xtype: 'tbspacer', width: 5},
                    {
                        text: 'Administration',
                        icon: 'icons/wrench_orange.png',
                        menu: [
                            {
                                text: 'Close dataset',
                                disabled: obj.dataset.closed,
                                icon: 'icons/lock_add.png',
                                handler: function(){
                                    Ext.Msg.confirm('Confirm closing', 'Are you sure you want to close the dataset: "' + obj.dataset.description + '"<br/>No futher data can be added.', function(btn){
                                        if(btn == 'yes'){
                                            $.jsonRPC.request("dataset.close", {
                                                params: [id],
                                                success: function(){
                                                    views.show.dataset(id);
                                                }
                                            });
                                        }
                                    });
                                }
                            },
                            {
                                text: 'Purge dataset', 
                                icon: 'icons/delete.png',
                                disabled: obj.dataset.closed,
                                handler: function(){
                                    Ext.Msg.confirm('Confirm deletion', 'Are you sure you want to delete dataset: "' + obj.dataset.description + '"', function(btn){
                                        if(btn == 'yes'){
                                            $.jsonRPC.request("dataset.purge", {
                                                params: [id],  
                                                success: function(){
                                                   views.show.study(obj.dataset.study_id);
                                                }
                                            });
                                        }
                                    });   
                                            
                                }
                            }
                        ]
                    }
                    ]}
                ]
            });

            wrap.push(toolbar);
            
            var figure = new Ext.Panel({
                layout: 'fit',
                colspan: 2,
                cls: 'layoutpad',
                title: 'Figure',
                autoHeight: true,
                collapsible: 'true',
                hidden: true,
                html: '<div id="figureoverview" title="Double-click to reset..."></div><div id="figure"></div><div id="figurexlabel">.</div>',
                id: 'figurewrap'
            });
            
            wrap.push(figure);
            
                       
            var parameterstore = jsonstore(obj.parameters, ['type.name', 'type.unit', 'storage', 'uncertainty_type', 'uncertainty_value', 'index']);
            var parametercolumns = [
                { header: 'Index', width: 20, dataIndex: 'index'},
                { header: 'Type', width: 250, dataIndex: 'type.name'},
                { header: 'Unit', width: 250, dataIndex: 'type.unit'},
                { header: 'Storage', width: 100, dataIndex: 'storage'},
                { header: 'Uncertainty Type', width: 100, dataIndex: 'uncertainty_type'},
                { header: 'Uncertainty Value', width: 100, dataIndex: 'uncertainty_value'},
                { header: 'Metadata', fixed: false, dataIndex: 'metadata'}
            ];
        
            var parameters = widgets.easy_gp('Parameters', parameterstore, parametercolumns, function(index){
                widgets.dataset.sequence.plot(obj, [index]);
            }, "index");    
            
            wrap.push(parameters);
            
        }
    });
    return wrap;
}

widgets.dataset.sequence.isplotting = false;
widgets.dataset.sequence.overviewplot = null;
widgets.dataset.sequence.figureplot = null;

widgets.dataset.sequence.plot = function(dataset, params, xmin, xmax){

    var numbins = 750;

    Ext.getCmp("figurewrap").show();
    
    if(widgets.dataset.sequence.isplotting !== true){
        widgets.dataset.sequence.isplotting = true;
        
        var getfn = ['dataset.sequence.get_data', [
            dataset.dataset.id, params, xmin, xmax
        ]];
        
        var rebinfn = ['dataset.sequence.analysis.meanbin', 
        {   original_if_supersample: true,
            numbins: numbins
        }];
    
        $.jsonRPC.request("chain", {
        
            params: [getfn, rebinfn],  
            success: function(result) {
                
                var figure = $("#figure");
                var overview = $("#figureoverview");
                
                figure.show();
                
                $("#figurexlabel").text(dataset.index_type.name + " (" + dataset.index_type.unit + ")");
                
                
                var data = [];
                var overviewdata = [];
                var hooks = [];

                for(var j=0; j<params.length; j++){
                                       
                    var datapoints = [];
                    
                    var yname = result.current_parameters[j].type.name + " (" + result.current_parameters[j].type.unit + ") from " + dataset.dataset.description;
                    
                    for (var i=0; i<result.data.length; i++) {
                        datapoints[i] = [result.data[i][0], result.data[i][1+j]];
                    }

                    if(result.data.length < numbins){
                        var hotstep = null;
                        if(dataset.index_marker_type == "span"){
                            hotstep = dataset.index_marker_location;
                        }

                        data.push({data: datapoints, points: {show: false}, lines: {show: true}, hotstep: {type:hotstep, discrete: false}, label: yname});   
                    }
                    else{
                        data.push({data: datapoints, points: {show: false}, lines: {show: true}, label: yname});   
                    }
                    
                    overviewdata.push({data: datapoints});
                }
                
                
                var transform = function(axis, inverse){
                    return function(v){
                        
                        if(Ext.getCmp("sequence.plot."+axis+".inverted").checked) v = -v;
                        
                        if(!inverse){
                            if(Ext.getCmp("sequence.plot."+axis+".log").checked)
                                return Math.log(v)
                            else
                                return v
                        }
                        else{
                            if(Ext.getCmp("sequence.plot."+axis+".log").checked)
                                return Math.exp(v)
                            else
                                return v
                        }
                    }
                }
                
                var options = {
                    selection: { mode: "x" },
                    yaxis: { transform: transform("y"), inverseTransform: transform("y", true) },
                    xaxis: { transform: transform("x"), inverseTransform: transform("x", true) }
                };
          
                widgets.dataset.sequence.figureplot = $.plot(figure, data, options);
                
                figure.unbind("plotselected");
                figure.bind("plotselected", function (event, ranges) {
                                          
                       widgets.dataset.sequence.figureplot = $.plot(figure, data,
                              $.extend(true, {}, options.xaxis, {
                                  min: ranges.xaxis.from, max: ranges.xaxis.to
                              }));

                        widgets.dataset.sequence.plot(dataset, params, ranges.xaxis.from, ranges.xaxis.to);
                        widgets.dataset.sequence.overviewplot.setSelection(ranges, true);
                });  
               
                if(typeof xmax == "undefined"){

                    widgets.dataset.sequence.overviewplot = $.plot(overview, overviewdata, {
                        series: {
                            lines: { show: true, lineWidth: 1 },
                            shadowSize: 0
                        },
                        xaxis: { 
                            ticks: [], 
                            transform: transform("x"), 
                            inverseTransform: transform("x", true)
                            },
                        yaxis: { 
                            ticks: [], 
                            autoscaleMargin: 0.1,  
                            transform: transform("y"), 
                            inverseTransform: transform("y", true) 
                            },
                        selection: { mode: "x" }
                    });
                    
                    overview.bind("plotselected", function (event, ranges) {
                        widgets.dataset.sequence.figureplot.setSelection(ranges);
                    });
                    
                    overview.bind("dblclick", function(event){
                        widgets.dataset.sequence.plot(dataset, params);
                    });
                }
                
                
                widgets.dataset.sequence.isplotting = false;
                
            }
            
        });
    } 
}   

widgets.dataset.sequence.plot.redraw = function(){
    (function(){
        if(widgets.dataset.sequence.figureplot){
            widgets.dataset.sequence.figureplot.setupGrid();
            widgets.dataset.sequence.figureplot.draw();
        }
        if(widgets.dataset.sequence.overviewplot){
            widgets.dataset.sequence.overviewplot.setupGrid();
            widgets.dataset.sequence.overviewplot.draw();
        }
    }).defer(100);
}

widgets.dataset.sequence.download = function(id){
    
    var getfn = ['dataset.sequence.get_data', id];
    var asciifn = ['dataset.sequence.export.to_ascii'];
    var tmpfilefn = ['tempfile.create', 'dataset_download_'+ id +'.txt'];
    
    $.jsonRPC.request("chain", {
    
        params: [getfn, asciifn, tmpfilefn],  
        async: true,
        success: function(result) {
            filename = result[0];
            // FIXME: hardcoded value for REST'y endpoint
            downloadURL("/rest/tempfile.pull/" + filename);
            
        }
    });
}

