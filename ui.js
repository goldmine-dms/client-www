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
                {text: "Studies", handler: broadcast("menu.mydata.studies")}
            ]
        }, 
        {
            text: 'Browse',
            id: 'browsemenu',
            menu: [             
                {text: "Sites", handler: broadcast("menu.browse.sites")},
                {text: "Standalone Studies", handler: broadcast("menu.browse.sastudies")},
                {text: "Map", handler: broadcast("menu.browse.map")},
                {text: "Types", handler: broadcast("menu.browse.types")}
            ]
        }, 
        '->',
/*        {
            xtype: 'textfield',
            name: 'searchfield',
            id: 'searchfield',
            emptyText: 'Enter search term'
        },*/
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







