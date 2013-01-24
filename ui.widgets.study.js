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
                console.log("Handle group", group.id);
            },
            disabled: true, // FIXME until proper handling
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


