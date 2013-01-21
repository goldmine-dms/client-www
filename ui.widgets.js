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

widgets.easy_gp = function(title, store, columns, callback){
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
        cls: 'layoutpad x-unselectable',
        layout: 'fit', 
        autoHeight: true, 
        stripeRows: true, 
        viewConfig: {
            scrollOffset: 0, 
            forceFit:true
        },
        listeners: { 
            cellclick: function(grid, row, col, e)
                { callback(store.getAt(row).get("id")); }
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



