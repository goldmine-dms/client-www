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
            icon: 'icons/folder_user.png',
            menu: [
                {text: "Study", handler: broadcast("menu.mydata.study")},
                {text: "Favorite", handler: broadcast("menu.mydata.favorites")},
                {text: "Import", handler: broadcast("menu.mydata.importer")},
                {text: "Temporary file", handler: broadcast("menu.mydata.tempfile")}
            ]
        }, 
        {
            text: 'Browse',
            id: 'browsemenu',
            icon: 'icons/folder_explore.png',
            menu: [        
                {
                    text: "Map", 
                    icon: "icons/map.png",
                    menu: [
                    {text: "Project", handler: broadcast("menu.browse.map.project")},
                    {text: "Activity", handler: broadcast("menu.browse.map.activity")}
                ]},
                '-',
                {text: "Project", handler: broadcast("menu.browse.project")},
                {text: "Activity", handler: broadcast("menu.browse.activity")},
                {text: "Study", handler: broadcast("menu.browse.study")},
                '-',
                {text: "Datatype", handler: broadcast("menu.browse.datatype")}

            ]
        }, 
        {
            text: 'Administration',
            id: 'adminmenu',
            icon: 'icons/cog.png',
            menu: [             
                {
                    text: "Dataset Curation", 
                    handler: broadcast("menu.admin.curate")
                },
                "-",
                {
                    text: "Restart Server", 
                    icon: "icons/arrow_rotate_clockwise.png",
                    handler: broadcast("menu.admin.restart")
                },
            ]
        }, 
        '->',
        {
            text: 'API Docs',
            icon: 'icons/book.png'
        },
        '-',
        {
            text: 'Not logged in',
            id: 'usermenu',
            icon: 'icons/user.png',
            menu: []
        }        
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







