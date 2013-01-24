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
                /*{text: "Import", handler: broadcast("menu.mydata.importer")},*/
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
        /*{
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
        }, */
        '->',
        {
            text: 'Help',
            icon: 'icons/help.png',
            handler: function(){
                window.open('help/index.html');
            }
        },
        '-',
        {
            text: 'Report a bug',
            icon: 'icons/bug.png',
            handler: function(){
                window.open('https://podio.com/webforms/1386398/240029');
            }
        },
        '-',
        {
            text: 'API Docs',
            icon: 'icons/book.png',
            handler: broadcast("menu.apidocs")
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

    var statustext = new Ext.Action({
        text: "",
        handleMouseEvents: false,
    })

    var connectionstatus = new Ext.Action({
        icon: 'icons/hourglass.png',
        handleMouseEvents: false,
        tooltip: 'Connection status'
    })

    var statusbar = new Ext.Toolbar({
        region: 'south',
        height: 28,
        items: [statustext, "->", connectionstatus]
    });
              
    app = new Ext.Viewport({
        layout: 'border',
        items: [toolbar, main, left, statusbar]
    });

    app.main = main;
    app.left = left;
    app.statusbar = statusbar;

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

    app.statusbar.wait = function(){
        $("body").addClass('wait')
        connectionstatus.items[0].setIcon('icons/loading.gif');
        connectionstatus.items[0].setTooltip("Working");
        connectionstatus.working = true;
        setTimeout("app.statusbar.wait_alert()", 1000);
    }

    app.statusbar.wait_alert = function(){
        if(connectionstatus.working == true){
            connectionstatus.waitdialog = true;
            Ext.MessageBox.show({
                title: 'Please wait',
                msg: 'You command is being processed',
                wait:true,
                waitConfig: {interval:100}
            });
        }
    }

    app.statusbar.done = function(){
        $("body").removeClass('wait')
        connectionstatus.items[0].setIcon('icons/accept.png');
        connectionstatus.items[0].setTooltip("Last command executed successfully")
        connectionstatus.working = false;
        if(connectionstatus.waitdialog){
            Ext.MessageBox.hide();
            connectionstatus.waitdialog = false;
        }
    }

    app.statusbar.error = function(){
        app.statusbar.done();
        connectionstatus.items[0].setIcon('icons/error.png');
        connectionstatus.items[0].setTooltip("Last command failed")
    }

    app.statusbar.text = function(str){
        statustext.setText(str);
    }



    
});







