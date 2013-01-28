widgets.study = {};

widgets.study.toolbar = function(obj){


    var role = "unknown";

    var icons = {
        "read": "eye",
        "write": "pencil",
        "admin": "cog"
    }

    $.jsonRPC.request("study.access", {
        params: [obj.id], 
        async: false,
        success: function(obj) {
            role = obj;
    }});

    if(role == "!admin"){
        var access = "You have access as admin";
        var icon = "user_gray";
    }else if(role == "!owner"){
        var access = "You have access as admin";
        var icon = "user";
    }else{
        var access = "You have " + role + " access";
        var icon = icons[role];
    };

    groupmenu = [];

    for(var i = 0; i < obj.access.length; i++){
        var group = obj.access[i].group;
        groupmenu.push({
            text: group.name,
            handler: function(){
                views.group.show(group.id);
            },
            icon: 'icons/' + icons[obj.access[i].role] + '.png',
        });
    }
            

    var toolbar = new Ext.Panel({
        layout: 'fit',
        cls: 'layoutpad',
        height: 40,
        items: [
            {xtype: 'toolbar', items: [
                {xtype: 'tbspacer', width: 5},
                {
                    text: '&nbsp;Access',
                    icon: 'icons/group_key.png',
                    menu: [
                        {   
                            text: access,
                            icon: 'icons/' + icon + '.png',
                            disabled: true
                        },
                        {   
                            text: "Groups with explicit access",
                            icon: 'icons/group.png',
                            menu: groupmenu
                        },
                        
                    ]
                },
            ]}
        ]
    });

    return toolbar;
}


widgets.study.well = function(name){
    console.log(name);
}


widgets.study.choose = function(callback){

    $.jsonRPC.request("study.all", {
        params: [], 
        success: function(obj) {


            for(var j=0; j<obj.length; j++){

                obj[j].activity = [];

                for(var i=0; i<obj[j].activities.length; i++){
                    obj[j].activity.push(obj[j].activities[i].name);
                }

                obj[j].activity = obj[j].activity.join(", ");
            }


            var store = jsonstore(obj, ['description', 'activity','name', 'id']);
            var columns = [
            
                { header: 'ID', width: 250, dataIndex: 'id', hidden: true},
                { header: 'Name', width: 175, dataIndex: 'name'},
                { header: 'Description', width: 175, dataIndex: 'description'},
                { header: 'Referenced activities', fixed: false, dataIndex: 'activity'}
            ];

           
            var search = new Ext.Panel({
                cls: 'layoutpad',
                layout: 'fit',
                border: false,
                autoWidth: true,
                items: [
                    new Ext.form.TextField({
                        emptyText: "Search",
                        enableKeyEvents: true,
                        listeners: {
                            keyup: function(field){
                                store.filter("description", field.getValue(), true, false);
                            }
                        },

                    })
                ]
            });

            var lv = new Ext.grid.GridPanel({
                emptyText: 'No users matching query', 
                cm: new Ext.grid.ColumnModel({
                    defaults: {
                        sortable: true,
                        fixed: true
                    },
                    columns: columns
                }),   
                cls: 'layoutpad x-unselectable clickme',
                layout: 'fit',
                store: store,  
                autoHeight: true, 
                stripeRows: true, 
                viewConfig: {
                    scrollOffset: 0, 
                    forceFit:true
                },
                listeners: { 
                    celldblclick: function(grid, row, col, e){ 
                        win.close();
                        callback(store.getAt(row).get("id"), widgets.study.well(store.getAt(row).get("name")));
                    }
                }
                
            });
            
            var win = new Ext.Window({
                width:800,
                height:500,
                resizable: true,
                plain: true,
                border: false,
                autoScroll: true,
                cls: "whitewin",
                title: "Choose study",
                items: [search, lv]
            });

            win.show();

        }
    });

}