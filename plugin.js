var plugin = {};



plugin.dataset = {}
plugin.dataset.sequence = {}
plugin.dataset.sequence.analysis = {}

plugin.dataset.sequence.analysis.data_on_timescale = {

    name: "Data on timescale",
    actions:[

        {   name: "Plot",
            action: function(dataset_id){
                widgets.dataset.choose(function(timescale_id){
                    alert("Not implemented yet!");
                }, undefined, "sequence");
            }
        },

        {   name: "Download",
            action: function(dataset_id){
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


                }, undefined, "sequence");
            }

        },

    ]

    
}