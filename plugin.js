var plugin = {};



plugin.dataset = {}
plugin.dataset.sequence = {}
plugin.dataset.sequence.analysis = {}

plugin.dataset.sequence.analysis.data_on_timescale = {

    name: "Data on timescale",
    actions:[
    /*

        {   name: "Plot",
            action: function(dataset_id){
                widgets.dataset.choose(function(timescale_id){
                    alert("Not implemented yet!");
                }, undefined, "sequence");
            }
        },
    */
        {   
            name: "Download",
            icon: "icons/page_save.png",
            action: function(dataset_id){


                var get_dataset_well = function(id){

                    var datasetobj = null;

                    if(id != null){

                        $.jsonRPC.request("dataset.sequence.get", {
                            params: [id], 
                            async: false,
                            success: function(obj) {
                                datasetobj = obj;
                            }
                        });

                        var swell = widgets.study.well(datasetobj.dataset.study_id, "<i>Current study</i>");
                        var dswell = widgets.dataset.well(id, datasetobj.dataset.description, datasetobj.dataset.study_id);
                        var parmwell = widgets.dataset.sequence.parameterwell(datasetobj.parameters);
                    }else{
                        var swell = widgets.study.well(null);
                        var dswell = widgets.dataset.well(null);
                        var parmwell = widgets.dataset.sequence.parameterwell(null);
                    }

                    swell.on('wellupdate', function(study_id){
                        dswell.update_study(study_id);
                        parmwell.update_dataset(null);
                    });

                    dswell.on('wellupdate', function(dsid){
                        $.jsonRPC.request("dataset.sequence.get", {
                            params: [dsid],
                            success: function(obj) {
                                parmwell.update_dataset(obj.parameters);
                            }
                        });
                    });

                    return [swell,  dswell, parmwell];
                }



                var dataset_panel = new Ext.Panel({
                    title: "Choose data",
                    flex: 1,
                    border: false,
                    padding: 10,
                    items: get_dataset_well(dataset_id)
                });


                var timescale_panel = new Ext.Panel({
                    title: "Choose timescale",
                    flex: 1,
                    border: false,
                    padding: 10,
                    items: get_dataset_well(null)
                });

                var buttons = new Ext.Panel({
                    height: 30,
                    border: false,
                    align: 'right',
                    items: [
                        {
                            text: '<b>Download</b>',
                            xtype: 'button',
                            handler: function(){

                                var dataset_id = dataset_panel.items.items[1].tag_id;
                                var dataset_parm = dataset_panel.items.items[2].tag_id;
                                var timescale_id = timescale_panel.items.items[1].tag_id;
                                var timescale_parm = timescale_panel.items.items[2].tag_id;

                                var getdatafn = ['dataset.sequence.get_data', [dataset_id, dataset_parm]];
                                var gettimefn = ['dataset.sequence.get_data', [timescale_id, timescale_parm]];

                                var argmap = ['util.argmap', 'plugin.glaciology.timescale.spans_to_time'];

                                var asciifn = ['dataset.sequence.export.to_ascii'];
                                
                                var tmpfilefn = ['tempfile.create', 'data_on_timescale.txt'];
                                
                                $.jsonRPC.request("chain", {
                                    params: [[getdatafn, gettimefn], argmap, asciifn, tmpfilefn],  
                                    success: function(result) {
                                        filename = result[0];
                                        // FIXME: hardcoded value for REST'y endpoint
                                        downloadURL("/rest/tempfile.pull/" + filename);
                                    }
                                });


                            }
                        }
                    ]
                });

                var win = new Ext.Window({
                    width:600,
                    height:300,
                    resizable: true,
                    plain: true,
                    border: false,
                    cls: "whitewin",
                    layout: 'vbox',
                    layoutConfig: {
                        align: 'stretch'
                    },
                    title: "Convert data to time scale",
                    items: [ dataset_panel, timescale_panel, buttons]
                });

                win.show();




/*                
                widgets.dataset.choose(function(timescale_id){




                    console.log(dataset_id, timescale_id);

                    var getdatafn = ['dataset.sequence.get_data', dataset_id];
                    var gettimefn = ['dataset.sequence.get_data', timescale_id];
                    var argmap = ['util.argmap', 'plugin.glaciology.timescale.spans_to_time'];
                    var asciifn = ['dataset.sequence.export.to_ascii'];
                    var tmpfilefn = ['tempfile.create', 'data_on_timescale.txt'];
                    
                    $.jsonRPC.request("chain", {
                    
                        params: [[getdatafn, gettimefn], argmap, asciifn, tmpfilefn],  
                        async: true,
                        success: function(result) {
                            filename = result[0];
                            // FIXME: hardcoded value for REST'y endpoint
                            downloadURL("/rest/tempfile.pull/" + filename);
                            
                        }
                    });


                }, undefined, "sequence");*/

            }

        },

    ]

    
}