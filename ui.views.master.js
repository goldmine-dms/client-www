var views = {}

views.browse = {}
views.show = {}
views.map = {}

views.browse.master = function(name, rpcfunction, titlefield, callback, rpcparam){

    setHistory("views.browse." + name);
    
    if(typeof rpcparam === "undefined")
        rpcparam = [];

    $.jsonRPC.request(rpcfunction, {
            params: rpcparam, 
            success: function(list) {

                var nicename = name.replace("_", " ");

            
                app.main.prepare();
                app.main.setTitle("");
    
                var store = new Ext.data.ArrayStore({fields: ["name", "data"]});
                
                var data = [];
                for(var i = 0; i < list.length; i++){
                    var frame = list[i];
                    data.push([frame[titlefield], frame]);
                }
                      
                store.loadData(data);
                
                app.left.prepare();
                app.left.add(new Ext.form.TextField({
                    emptyText: "Search",
                    enableKeyEvents: true,
                    listeners: {
                        keyup: function(field){ store.filter(titlefield, field.getValue(), true, false); }
                    }
                }));
                
                var lv = new Ext.list.ListView({
                    emptyText: 'No ' + name + 's matching query', 
                    columns: [{
                        header: capitalize(nicename), 
                        dataIndex: titlefield
                    }], 
                    store: store,
                });
                
                lv.on('click', function(sthis, nodeid){
                    callback(store.getAt(nodeid).get("data")["id"]);
                });
                app.left.add(lv);
            }
    });       
}


views.map.master = function(name, rpcfunction, titlefield, callback, rpcparam){

    setHistory("views.map." + name);

    if(typeof rpcparam === "undefined")
        rpcparam = [];

    $.jsonRPC.request(rpcfunction, {
            params: rpcparam,
            success: function(list) {
  
                app.main.prepare();
                app.main.setTitle("Map: " + capitalize(name));
  
                var data = [];                  
                for(var i = 0; i < list.length; i++){
                    var frame = list[i];
                    if(frame['location'] != null){
                        var frame = {marker: {title: frame[titlefield]}, 
                                     lat: frame['location']['latitude'], 
                                     lng: frame['location']['longitude'],
                                     listeners: {
                                           click: callback.createCallback(frame['id'], true),
                                     }};

                         data.push(frame);
                    }
                }
                
                var wrap = new Ext.Panel({
                    layout: 'fit',
                    border: false,
                    style: 'height: 100%',
                    items: [{xtype: 'gmappanel', gmapType: 'map', zoomLevel: 2, setCenter: {lat: 0, lng: 0}, markers: data}],
                });

                app.main.add(wrap);
                app.main.doLayout();
 
            }
    });
}


views.show.master = function(id, name, rpcfunction, title, header, description, contentcallback, tbar){
    
     setHistory("views.show." + name, id);
    
     $.jsonRPC.request(rpcfunction, {
            params: [id], 
            success: function(obj) {
            
                app.main.prepare();
                app.main.setTitle(capitalize(name) + ": " + obj[title]);
                
                if(typeof tbar === "function"){
                    tbar = tbar(obj);
                }

                var wrap = new Ext.Panel({

                    layout: 'fit',
                    tbar: tbar,
                    border: false,
                    items: [
                        {   
                            border: false,
                            layout: 'column',
                            autoHeight: true,
                            id: 'pg_header',
                            items: [
                            
                                widgets.easy_pg("Properties", obj, header),
                            
                                {
                                    title: 'Map', 
                                    xtype: 'panel', 
                                    layout: 'fit',
                                    width: 400,
                                    height: 300, 
                                    cls: 'layoutpad',
                                    hidden: obj['location'] == null,
                                    items: [
                                        {
                                            xtype: 'gmappanel', 
                                            mapType: 'map', 
                                            id: "overviewmap",
                                            zoomLevel: 3,  
                                            setCenter: {  
                                                lat: obj.location == null ? 0 : obj['location']['latitude'],  
                                                lng: obj.location == null ? 0 : obj['location']['longitude'],  
                                                marker: { 
                                                    title: obj[title]
                                                }
                                            }  
                                        }
                                    ]
                                },
                            ]
                        },
                        
                        {
                            xtype: 'panel',
                            layout: 'fit',
                            colspan: 2,
                            cls: 'layoutpad txt',
                            html: description ? obj[description] : null,
                            hidden: description ? obj[description] == null : true,
                            title: description ? capitalize(description) : null
                        }
                    ]
                });
                                
                if(typeof contentcallback === "function"){
                    cbdata = contentcallback(obj);
                    for(var i = 0; i < cbdata.length; i++){ 
                        wrap.items.add(cbdata[i]);
                    }
                }

                app.main.add(wrap);                
                app.main.doLayout();
                
            }
    });  
}

views.show.master.addmarkers = function(o, c, cb){
    
    var map = Ext.getCmp("overviewmap");
    
    var fn = function(obj, color, callback){
        var markers = [];
        var cb = function(){};
        
        var pinImage = new google.maps.MarkerImage(
            "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + color,
            new google.maps.Size(21, 34),
            new google.maps.Point(0,0),
            new google.maps.Point(10, 34));
        
        var pinShadow = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_shadow",
            new google.maps.Size(40, 37),
            new google.maps.Point(0, 0),
            new google.maps.Point(12, 35)
        );

        
        for(var i = 0; i < obj.length; i++){
            if(obj[i].location != null){
                
                if(typeof callback !== "undefined") cb = callback.createCallback(obj[i].id, true);
                
                markers.push({
                    lat: obj[i].location.latitude, 
                    lng: obj[i].location.longitude, 
                    marker: {
                        title: obj[i].name,
                        icon: pinImage,
                        shadow: pinShadow
                    },
                    listeners: {
                        click: cb
                    }
                });
            }
        }
        map.addMarkers(markers);
    }
    
    fn(o, c, cb);
    map.addListener('mapready', fn.createDelegate(map, [o, c, cb]));

}

views.show.master.addproperties = function(obj){
    var header = Ext.getCmp("pg_header");    
    obj.columnWidth = 0.4;
    header.items.items[0].columnWidth = 0.6;
    header.add(obj);
}

