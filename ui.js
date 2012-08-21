/*
    Fixed UI Elements
*/

var app = null;

// UI Fixed Elements

var toolbar = new Ext.Toolbar({
    region: 'north',
    height: 28,
    items: [
        {
            text: 'My Data',
            id: 'mydatamenu',
            menu: [
                {text: "Studies", handler: broadcast("menu.mydata.studies")},
                {text: "Favorites", handler: broadcast("menu.mydata.favorites")},
                {text: "Recent", handler: broadcast("menu.mydata.recent")},
                {text: "Import", handler: broadcast("menu.mydata.importer")}
            ]
        }, 
        {
            text: 'Browse',
            id: 'browsemenu',
            menu: [        
                {text: "Map", menu: [
                    {text: "Project", handler: broadcast("menu.browse.map.project")},
                    {text: "Activity", handler: broadcast("menu.browse.map.activity")}
                ]},
                '-',
                {text: "Project", handler: broadcast("menu.browse.project")},
                {text: "Activity", handler: broadcast("menu.browse.activity")},
                {text: "Datatype", handler: broadcast("menu.browse.datatype")}

            ]
        }, 
        {
            text: 'Administration',
            id: 'adminmenu',
            menu: [             
                {text: "Dataset Curation", handler: broadcast("menu.admin.curate")}
            ]
        }, 
        '->',
        {
            xtype: 'textfield',
            name: 'searchfield',
            id: 'searchfield',
            emptyText: 'Enter search term'
        },
        '-', 
        {
            text: 'Not logged in',
            id: 'usermenu',
            menu: []
        }, 
        
    ]      
});


// Inititalizing the UI
        
$(function() {
    Ext.QuickTips.init();
    
    var main = new Ext.Panel({region: 'center', title: '&nbsp;', autoScroll: true});
    
    var left  = new Ext.Panel({
                    region: 'west', 
                    width: 200, 
                    title: '&nbsp;', 
                    collapsed: true, 
                    collapsible: true,
                    collapseMode: 'mini',
                    hidden: true,
                    hideMode: "offsets",
                    autoScroll: true,
                    defaults: {
                        width: 198 
                    },
                    
               });    

    left.prepare = function() {
        app.left.collapse(false);
        app.left.show();
        app.left.removeAll();
        app.left.expand();
    };
    
    main.prepare = function() {
        app.main.removeAll();  
    };
              
    app =  new Ext.Viewport({
        layout: 'border',
        items: [toolbar, main, left]
    });

    app.main = main;
    app.left = left;
        
    app.hide = function(){
        app.left.collapse(false);
        app.left.removeAll();
        app.left.hide();
        app.main.prepare();
        app.main.setTitle("&nbsp;");
        app.items.each(function(item){item.hide();});
        app.doLayout();
    }
    
    app.show = function(){
        app.items.each(function(item){item.show();});
        app.left.hide();
        app.doLayout();
    }
    
});







