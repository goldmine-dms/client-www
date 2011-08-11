/* BROWSE VIEWS */

var browseSites = function(){

    setHistory("browseSites");


    $.jsonRPC.request('site.listing', {
            params: [""], 
            success: function(list) {
            
                app.main.prepare();
                app.main.setTitle("Browse Sites");
    
                var store = new Ext.data.ArrayStore({fields: ['name', 'site']});
                
                var data = [];
                
                for(var i = 0; i < list.length; i++){
                    var site = list[i];
                    data.push([site['name'], site]);
                }
                      
                store.loadData(data);
                
                app.left.prepare();
                
                app.left.add(new Ext.form.TextField({
                    emptyText: "Search",
                    enableKeyEvents: true,
                    listeners: {
                        keyup: function(field){ store.filter('name',field.getValue(), true, false); }
                    }
                    
                }));
                
                var lv = new Ext.list.ListView({
                    emptyText: 'No sites matching query', 
		    columns: [{
                        header: "Site", 
                        dataIndex: "name"
                    }], 
                    store: store,
                });
                
                lv.on('click', function(sthis, nodeid){
                    showSite(store.getAt(nodeid).get("site")["id"]);
                });
                
                app.left.add(lv);
                
            }
    });       
}

var browseMap = function(){

    setHistory("browseMap");


    $.jsonRPC.request('site.listing', {
            params: [""],
            success: function(list) {
  
                app.main.prepare();
                app.main.setTitle("Browse Map");
  
                var data = [];  		

                for(var i = 0; i < list.length; i++){
                    var site = list[i];
 		    if(site['latitude'] != null){
                        var frame = {marker: {title: site['name']}, 
 			             lat: site['latitude'], 
		 	             lng: site['longitude'], 
                                     iconx: 'site', 
                                     link: '#showSite:' + site['id']};
		         data.push(frame);
		    }

		    for(var j = 0; j < site['cores'].length; j++){
         		if(site['cores'][j]['latitude'] != null){ 
			    var id = site['cores'][j]['id'];
			    var frame = {marker: {title: site['cores'][j]['name']},
                                        lat: site['cores'][j]['latitude'],
                                        lng: site['cores'][j]['longitude'],
                                        iconx: 'site',
                                        listeners: {
					   click: showCore.createCallback(id, true),
                                        }
					};
                            data.push(frame);
			 }
                    }
                }
 		
		var wrap = new Ext.Panel({
                    layout: 'fit',
	            border: false,
                    style: 'height: 100%',
		    items: [{
	            	xtype: 'gmappanel',
                        gmapType: 'map',
                        zoomLevel: 2,
			setCenter: {
			    lat: 0,
			    lng: 0
			},
			markers: data, 
                    }],
		});

		app.main.add(wrap);
		app.main.doLayout();
 
            }
    });
}

var browseStandaloneStudies = function(){

    setHistory("browseStandaloneStudies");


    $.jsonRPC.request('study.listing', {
        params: [null, true], 
        success: function(list) {

        app.main.prepare();
        app.main.setTitle("Browse Standalone Studies");

        var store = new Ext.data.ArrayStore({fields: ['name', 'study']});

        var data = [];

        for(var i = 0; i < list.length; i++){
        var study = list[i];
        data.push([study['name'], study]);
        }

        store.loadData(data);

        app.left.prepare();

        app.left.add(new Ext.form.TextField({
            emptyText: "Search",
            enableKeyEvents: true,
            listeners: {
                keyup: function(field){ store.filter('name',field.getValue(), true, false); }
            }
        }));

        var lv = new Ext.list.ListView({
            emptyText: 'No studies matching query', 
            columns: [{
            header: "Study", 
            dataIndex: "name"
        }], 
        store: store,
        });

        lv.on('click', function(sthis, nodeid){
                showStudy(store.getAt(nodeid).get("study")["id"]);
                });

        app.left.add(lv);

        }
    });       
}


var browseMyStudies = function(){

    setHistory("browseMyStudies");


    $.jsonRPC.request('study.my', {
        params: [], 
        success: function(list) {

        app.main.prepare();
        app.main.setTitle("Browse My Studies");

        var store = new Ext.data.ArrayStore({fields: ['name', 'study']});

        var data = [];

        for(var i = 0; i < list.length; i++){
        var study = list[i];
        data.push([study['name'], study]);
        }

        store.loadData(data);

        app.left.prepare();

        app.left.add(new Ext.form.TextField({
            emptyText: "Search",
            enableKeyEvents: true,
            listeners: {
                keyup: function(field){ store.filter('name',field.getValue(), true, false); }
            }
        }));

        var lv = new Ext.list.ListView({
            emptyText: 'No studies matching query', 
            columns: [{
            header: "Study", 
            dataIndex: "name"
        }], 
        store: store,
        });

        lv.on('click', function(sthis, nodeid){
                showStudy(store.getAt(nodeid).get("study")["id"]);
                });

        app.left.add(lv);

        }
    });       
}


var browseTypes = function(){

    setHistory("browseTypes");


    $.jsonRPC.request('type.listing', {
        params: [""],
        success: function(list) {

        app.main.prepare();
        app.main.setTitle("Browse Types");

        var store = new Ext.data.ArrayStore({fields: ['name', 'type']});

        var data = [];

        for(var i = 0; i < list.length; i++){
        var type = list[i];
        data.push([type['name'], type]);
        }

        store.loadData(data);

        app.left.prepare();

        app.left.add(new Ext.form.TextField({
        emptyText: "Search",
        enableKeyEvents: true,
        listeners: {
        keyup: function(field){ store.filter('name',field.getValue(), true, false); }
        }

        }));

        var lv = new Ext.list.ListView({
        emptyText: 'No types matching query',
        columns: [{
        header: "Type",
        dataIndex: "name"
        }],
        store: store,
        });

        lv.on('click', function(sthis, nodeid){
                showType(store.getAt(nodeid).get("type")["id"]);
                });

        app.left.add(lv);

        }
    });
}



/* SHOW VIEWS */

var showSite = function(id){
    
     setHistory("showSite", id);
    
     $.jsonRPC.request('site.get', {
            params: [id], 
            success: function(site) {
            
                app.main.prepare();
                app.main.setTitle("Show Site");
                
                var coreStore = jsonstore(site.cores, ['name', 'description', 'id']);
                
                var wrap = new Ext.Panel({

                    layout: 'fit',
                    border: false,
                    items: [
                        {   
                            border: false,
                            layout: 'column',
                            autoHeight: true,
                            items: [
                                
                                easy_pg('Site', site, ["ID", "Name", "Latitude", "Longitude", "Elevation"], 'layoutpad'),
                                
                                {
                                    xtype: 'panel',
                                    layout: 'fit',
                                    width: 400,
                                    height: 300,
                                    cls: 'layoutpad',
                                    title: 'Map',
                                    hidden: site['latitude'] == null,
                                    items: [  
                                        {  
                                            xtype: 'gmappanel',  
                                            gmapType: 'map',
                                            zoomLevel: 3,  
                                            setCenter: {  
                                                lat: site['latitude'],  
                                                lng: site['longitude'],  
                                                marker: {  
                                                    title: site['name']  
                                                }  
                                            }  
                                        }  
                                    ],
                                },
                            ]

                        },
                        
                        {
                            xtype: 'panel',
                            layout: 'fit',
                            colspan: 2,
                            cls: 'layoutpad txt',
                            html: site["description"],
                            hidden: site["description"] == null,
                            title: 'Description'
                        },
                        
                        
                        new Ext.grid.GridPanel({
                            layout: 'fit',
                            columns: [
                                { header : 'ID', width: 250, dataIndex: 'id'},
                                { header : 'Name', width: 250, dataIndex: 'name'},
                                { header : 'Description', dataIndex: 'description', id: 'description-column'},
                            ],
                            store: coreStore,
                            cls: 'layoutpad',
                            title: 'Cores',
                            autoHeight: true,
                            stripeRows: true,
                            autoExpandColumn: 'description-column',
                            viewConfig: {scrollOffset: 0},
                            listeners: {
                                celldblclick: function(grid, row, col, e){ showCore(coreStore.getAt(row).get("id")); }
                            }
                            
                        })
                    ]
                });
                                
    
                app.main.add(wrap); 
                app.main.doLayout();
                
            }
    });  
}


var showCore = function(id){

     setHistory("showCore", id);
    
     $.jsonRPC.request('core.get', {
            params: [id], 
            success: function(core) {
            
                app.main.prepare();
                app.main.setTitle("Show Core"); 
                
                var studyStore = jsonstore(core.studies, ['name', 'description', 'id']);;
                
                var wrap = new Ext.Panel({

                    layout: 'fit',
                    border: false,
                    items: [
                        {   
                            border: false,
                            layout: 'column',
                            autoHeight: true,
                            items: [
                                
                                easy_pg('Core', core, ["ID", "Name", "Latitude", "Longitude", "Elevation"], 'layoutpad'),
                                
                                {
                                    xtype: 'panel',
                                    layout: 'fit',
                                    width: 400,
                                    height: 300,
                                    cls: 'layoutpad',
                                    title: 'Map',
                                    hidden: core['latitude'] == null,
                                    items: [  
                                        {  
                                            xtype: 'gmappanel',  
                                            gmapType: 'map',
                                            zoomLevel: 3,  
                                            setCenter: {  
                                                lat: core['latitude'],  
                                                lng: core['longitude'],  
                                                marker: {  
                                                    title: core['name']  
                                                }  
                                            }  
                                        }  
                                    ],
                                },
                            ]

                        },
                        
                        {
                            xtype: 'panel',
                            layout: 'fit',
                            colspan: 2,
                            cls: 'layoutpad txt',
                            html: core["description"],
                            hidden: core["description"] == null,
                            title: 'Description'
                        },
                        
                        
                        new Ext.grid.GridPanel({
                            layout: 'fit',
                            columns: [
                                { header : 'ID', width: 250, dataIndex: 'id'},
                                { header : 'Name', width: 250, dataIndex: 'name'},
                                { header : 'Description', dataIndex: 'description', id: 'description-column'},
                            ],
                            store: studyStore,
                            cls: 'layoutpad',
                            title: 'Studies',
                            autoHeight: true,
                            stripeRows: true,
                            autoExpandColumn: 'description-column',
                            viewConfig: {scrollOffset: 0},
                            listeners: {
                                celldblclick: function(grid, row, col, e){ showStudy(studyStore.getAt(row).get("id")); }
                            }
                            
                        })
                    ]
                });
                                
    
                app.main.add(wrap); 
                app.main.doLayout();
                
            }
    });  
}


var showStudy = function(id){
     
     setHistory("showStudy", id);
    
     $.jsonRPC.request('study.get', {
            params: [id], 
            success: function(study) {
            
                app.main.prepare();
                app.main.setTitle("Show Study");
                var coreStore = jsonstore(study.cores, ['name', 'description', 'id']);;
                
                var datasetStore = jsonstore(study.datasets, ['id', 'description', 'xtype.name', 'params*.ytype.name']);
                
                var wrap = new Ext.Panel({

                    layout: 'fit',
                    border: false,
                    items: [
                        {   
                            border: false,
                            layout: 'column',
                            autoHeight: true,
                            items: [
                                
                                easy_pg('Study', study, ["ID", "Name" ,"Owner.Fullname"], 'layoutpad'),
                                
                            ]

                        },
                        
                        {
                            xtype: 'panel',
                            layout: 'fit',
                            colspan: 2,
                            cls: 'layoutpad txt',
                            html: study["description"],
                            hidden: study["description"] == null,
                            title: 'Description'
                        },
                        
                        {
                            xtype: 'panel',
                            layout: 'fit',
                            colspan: 2,
                            cls: 'layoutpad',
                            collapsible: 'true',
                            title: 'Lineage',
                            hidden: true,
                            autoHeight: true,
                            html: '<div id="lineage"></div>',
                            id: 'lineagewrap'
                        },
                        
                        
                        new Ext.grid.GridPanel({
                            layout: 'fit',
                            columns: [
                                { header : 'ID', width: 250, dataIndex: 'id'},
                                { header : 'Description', width: 250, dataIndex: 'description'},
                                { header : 'Measurement', width: 250, dataIndex: 'xtype.name'},
                                { header : 'Parameters', dataIndex: 'params.ytype.name', id: 'ytype-column'},
                            ],
                            store: datasetStore,
                            cls: 'layoutpad',
                            title: 'Datasets',
                            autoHeight: true,
                            stripeRows: true,
                            hidden: study.datasets.length ==0,
                            autoExpandColumn: 'ytype-column',
                            viewConfig: {scrollOffset: 0},
                            listeners: {
                                celldblclick: function(grid, row, col, e){ showDataset(datasetStore.getAt(row).get("id")); }
                            }
                            
                        }),


                        new Ext.grid.GridPanel({
                            layout: 'fit',
                            columns: [
                                { header : 'ID', width: 250, dataIndex: 'id'},
                                { header : 'Name', width: 250, dataIndex: 'name'},
                                { header : 'Description', dataIndex: 'description', id: 'description-column'},
                            ],
                            store: coreStore,
                            cls: 'layoutpad',
                            title: 'Cores',
                            autoHeight: true,
                            stripeRows: true,
                            hidden: study.cores.length == 0,
                            autoExpandColumn: 'description-column',
                            viewConfig: {scrollOffset: 0},
                            listeners: {
                                celldblclick: function(grid, row, col, e){ showCore(coreStore.getAt(row).get("id")); }
                            }
                            
                        })
                    ]
                });
                                
    
                app.main.add(wrap); 
                app.main.doLayout();

                if(study.datasets.length > 1){
                    lineageinto(id, '#lineage', Ext.getCmp("lineagewrap"));
                }
                
            }
    });  
}

var showDataset = function(id){
     
     setHistory("showDataset", id);
    
     $.jsonRPC.request('dataset.get', {
            params: [id], 
            success: function(dataset) {
            
                app.main.prepare();
                app.main.setTitle("Show Dataset");
                
                var paramsStore = jsonstore(
                    dataset.params, ['id', 'ytype.name', 'ytype.unit', 
                                    'ytype.species', 'ytype.description', 
                                    'ytype.classification', 'ytype.id']);
                var metadataStore = jsonstore(
                    dataset.metadata, ['id', 'annotation', 'params.length', 
                                       'created', 'creator.fullname', 'params']);
                var expander = new Ext.ux.grid.RowExpander({
                    handler : function(row){
                        var data = row.data.params;
                        var obj = Array();
                        if(data.length == 0)
                            return undefined;

                        for(var i =0; i < data.length; i++){
                            obj[data[i].key] = data[i].value;
                        }

                        var p = new Ext.grid.PropertyGrid({
                            autoHeight: true,
                            width: 500,
                            source: obj,
                            cls: 'layoutpad',
                            listeners: { 
                                'beforeedit': function (e) { return false; }, 
                            },
                            viewConfig: {scrollOffset: 2, forceFit: true},
                        }); 
                        
                        return p;
                    },
                    expandOnDblClick: false,
                });

                var studyAction = new Ext.Action({
                        text: 'Study (' + dataset.study.name + ')',
                        handler: function(){
                            showStudy(dataset.study.id);
                        }               
                });

                var wrap = new Ext.Panel({
                    tbar: [studyAction, '&#8594;','Dataset','->', '<div id="downloadify"><img src="icons/error.png" title="Flash 10 needed to download datasets"/></div>'],
                    layout: 'fit',
                    border: false,
                    items: [
                        {   
                            border: false,
                            layout: 'column',
                            autoHeight: true,
                            items: [
                                easy_pg('Dataset', dataset, ["ID", "Created", 
                                    "Closed", "Description", "xType.Name", 
                                    "xType.Unit", "xType.Species", "Markerlocation", "Markertype", 
                                    "Counters.Measurements", 
                                    "Counters.Datapoints" ], 'layoutpad'), 
                            ]
                        },
                        
                        {
                            xtype: 'panel',
                            layout: 'fit',
                            colspan: 2,
                            cls: 'layoutpad',
                            title: 'Plot',
                            hidden: true,
                            autoHeight: true,
                            html: '<div id="figureoverview"></div><div id="figure"></div><div id="figurexlabel">.</div>',
                            id: 'figurewrap'
                        },
                            
                        new Ext.grid.GridPanel({
                            layout: 'fit',
                            columns: [
                                { header : 'ID', width: 250, dataIndex: 'id'},
                                { header : 'Name', width: 250, dataIndex: 'ytype.name'},
                                { header : 'Unit', width: 150, dataIndex: 'ytype.unit'},
                                { header : 'Species', width: 250, dataIndex: 'ytype.species'},
                                { header : 'Classification', width: 250, dataIndex: 'ytype.classification'},
                                { header : 'Type', width: 250, dataIndex: 'ytype.id'},
                                { header : 'Description', dataIndex: 'ytype.description', id: 'ytype-column'},
                            ],
                            store: paramsStore,
                            cls: 'layoutpad',
                            title: 'Parameters',
                            autoHeight: true,
                            stripeRows: true,
                            autoExpandColumn: 'ytype-column',
                            viewConfig: {scrollOffset: 0},
                             listeners: {
                                celldblclick: function(grid, row, col, e){ 
                                    Ext.getCmp("figurewrap").show();
                                    var xname = dataset.xtype.name + " (" + dataset.xtype.unit + ")";
                                    var yname = paramsStore.getAt(row).get("ytype.name") + " (" + paramsStore.getAt(row).get("ytype.unit") + ")";
                                    plotinto("#figure", "#figureoverview", "#figurexlabel", id, xname, paramsStore.getAt(row).get("id"), yname); 
                                }
                            }
                            
                        }),

                        new Ext.grid.GridPanel({
                            layout: 'fit',
                            columns: [
                                expander,
                                { header : '#P', width: 30, dataIndex: 'params.length'},
                                { header : 'ID', width: 250, dataIndex: 'id'},
                                { header : 'Created', width: 150, dataIndex: 'created'},
                                { header : 'Created By', width: 200, dataIndex: 'creator.fullname'},
                                { header : 'Annotation', dataIndex: 'annotation', id: 'x-column'},
                            ],
                            store: metadataStore,
                            cls: 'layoutpad',
                            title: 'Dataset Metadata',
                            autoHeight: true,
                            stripeRows: true,
                            plugins: expander,
                            hidden: dataset.metadata.length == 0,
                            autoExpandColumn: 'x-column',
                            viewConfig: {scrollOffset: 0},
                            
                        })                    
                        
                    ]
                });
                    
                    
    
                app.main.add(wrap); 
                app.main.doLayout();
                
                Downloadify.create('downloadify',{
					filename: function(){
						return id + ".csv";
					},
					data: function(){
                        var val;
                        $.jsonRPC.request('dataset.get_raw', {
                            params: [id, null, null, null],
                            async: false,
                            success: function(res){
                                val = res;
                            }
                        });


                        var outstr = "";
                        outstr += dataset.xtype.name;
                        outstr += ",";

                        for(var i = 0; i < dataset.params.length; i++)
                        {
                            outstr += dataset.params[i].ytype.name;
                            if(i != dataset.params.length - 1) outstr += ",";

                        }

                        outstr += "\n";
                        
                        
                        for(var i = 0; i < val[0].length; i++){
                            for(var j = 0; j < val.length; j++){
                               outstr += val[j][i] != null ? val[j][i] : "NaN"
                               if(j != val.length - 1) outstr += ",";
                            }
                            outstr += "\n";
                        }
						return outstr;
					},
					swf: 'lib/downloadify/downloadify.swf',
					downloadImage: 'lib/downloadify/download.png',
					width: 16,
					height: 16,
					transparent: true,
					append: false
				});            
                
            }
    });  
}


var showType = function(id){
    
     setHistory("showType", id);
    
     $.jsonRPC.request('type.get_extended', {
            params: [id], 
            success: function(type) {
            
                app.main.prepare();
                app.main.setTitle("Show Type");
                
                var dsStore = jsonstore(type.datasets, ['xtype.name', 'params*.ytype.name', 'id', 'description']);
                var coreStore = jsonstore(type.cores, ['name', 'description', 'id']);
 
                var wrap = new Ext.Panel({

                    layout: 'fit',
                    border: false,
                    items: [
                                easy_pg('Type', type, 
				       ["ID", 
					"Name", 
					"Unit", 
					"Species", 
					"Classification", 
					"Description"], 
				'layoutpad'),
                        
                        
                        new Ext.grid.GridPanel({
                            layout: 'fit',
                            columns: [
                                { header : 'ID', width: 250, dataIndex: 'id'},
                                { header : 'Name', width: 250, dataIndex: 'name'},
                                { header : 'Description', dataIndex: 'description', id: 'description-column'},
                            ],
                            store: coreStore,
                            cls: 'layoutpad',
                            title: 'Cores',
                            autoHeight: true,
                            stripeRows: true,
                            autoExpandColumn: 'description-column',
                            viewConfig: {scrollOffset: 0},
                            listeners: {
                                celldblclick: function(grid, row, col, e){ showCore(coreStore.getAt(row).get("id")); }
                            }
		        }),

                       	new Ext.grid.GridPanel({
                            layout: 'fit',
                            columns: [
                                { header : 'ID', width: 250, dataIndex: 'id'},
				{ header : 'Description', width: 250, dataIndex: 'description'},
                                { header : 'Measurement Type', width: 250, dataIndex: 'xtype.name'},
                                { header : 'Parameter Types', dataIndex: 'params.ytype.name', id: 'description-column'},
                            ],
                            store: dsStore,
                            cls: 'layoutpad',
                            title: 'Datasets',
                            autoHeight: true,
                            stripeRows: true,
                            autoExpandColumn: 'description-column',
                            viewConfig: {scrollOffset: 0},
                            listeners: {
                                celldblclick: function(grid, row, col, e){ showDataset(dsStore.getAt(row).get("id")); }
                            }
                            
                        }),


                    ]
                });
                                
    
                app.main.add(wrap); 
                app.main.doLayout();
                
            }
    });  
}

