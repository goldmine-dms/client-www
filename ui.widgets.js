var widgets = {};

widgets.easy_pg = function(title, obj, limit){
    var p = new Ext.grid.PropertyGrid({
        title: title,
        columnWidth: 1,
        layout: 'fit',
        cls: 'layoutpad',
        autoHeight: true,
        autoWidth: true,
        hideHeaders: true,
        listeners: { 'validateedit': function (e) { e.cancel = true; return false; } },
        viewConfig: {
            scrollOffset: 0, 
            autoFill: true, 
            forceFit: true
        },
    })
    
    delete p.getStore().sortInfo; // Remove default sorting
    p.getColumnModel().getColumnById('name').sortable = false; // set sorting of first column to false
    p.setSource(limit_dict(obj, limit)); // Now load data
    return p;
}

widgets.easy_gp = function(title, store, columns, callback, idcol){

    if (typeof idcol === "undefined") idcol = "id";

    return new Ext.grid.GridPanel({
        title: "<img src='icons/arrow_right.png' style='vertical-align: middle'/> " + title,
        cm: new Ext.grid.ColumnModel({
            defaults: {
                sortable: true,
                fixed: true
            },
            columns: columns
        }),                   
        store: store, 
        cls: 'layoutpad x-unselectable clickme',
        layout: 'fit', 
        autoHeight: true, 
        stripeRows: true, 
        viewConfig: {
            scrollOffset: 0, 
            forceFit:true
        },
        listeners: { 
            cellclick: function(grid, row, col, e)
                { callback(store.getAt(row).get(idcol)); }
            }
        }
    );
}

widgets.lineage = function(study_id){
    
    var panel = new Ext.Panel({
        xtype: 'panel', layout: 'fit', colspan: 2, cls: 'layoutpad',
        collapsible: 'true', id: 'lineagewrap', hidden: false,
        title: "<img src='icons/arrow_switch.png' style='vertical-align: middle'/> " + 'Lineage', 
        autoHeight: true, html: '<div id="lineage"></div>'
    });
    
    lineageinto(study_id, '#lineage', panel);
    
    return panel
}



widgets.favorite = function(id, type){

    var action = new Ext.Action({
            icon: 'icons/heart_gray.png',
            handler: function(){}
    });



    var fetch = function(){
        $.jsonRPC.request("favorite.get_by_reference", {
            params: [id, type],
            async: false,
            success: function(obj){
                setState(obj);
            }
        });
    };

    var add = function(name){
        $.jsonRPC.request("favorite.add", {
            params: [name, id, type],
            async: false,
            success: function(obj){
                setState(obj);
            }
        });
    };

    var remove = function(name){
        $.jsonRPC.request("favorite.remove", {
            params: [name],
            async: false,
            success: function(obj){
                setState(null);    
            }
        });
    };

    var setState = function(obj){
        if(obj){
            action.items[0].setIcon('icons/heart.png');
            action.setText("#" + obj.name)
            action.setHandler(function(){
                Ext.MessageBox.confirm("Un-favorite", "Are you sure you want to remove favorite #" + obj.name + "?", function(btn){
                    if(btn == "ok"){
                       remove(obj.name); 
                    } 
                });
            });
            
        }else{
            action.items[0].setIcon('icons/heart_gray.png');
            action.setText("");
            action.setHandler(function(){
                Ext.MessageBox.prompt('Favorite', 'Enter short handle:', function(btn, text){
                    if(btn == "ok"){
                        add(text);
                    }
                });                
            });        
        }
    }
    
    setTimeout(fetch, 10);


    

    return action;
}