widgets.user = {}

widgets.user.changepassword = function() {

    var chpass_form = new Ext.FormPanel({ 
        labelWidth:150,
        frame:true, 
        defaultType:'textfield',

        items:[{ 
            fieldLabel:'New password', 
            name:'password', 
            inputType:'password', 
        },{ 
            fieldLabel:'Repeat password', 
            name:'password2', 
            inputType:'password', 
        }],
 
        buttons:[{ 
            text:'Change',
            formBind: true,  
            handler: function(){
                var form = chpass_form.getForm();
                if(form.findField('password').getValue() == form.findField('password2').getValue()
                    && form.findField('password').getValue() != ""){
                    $.jsonRPC.request('user.change_password', {

                        params: [form.findField('password').getValue()], 
                        success: function() {
                            Ext.Msg.alert('Success', "The password was changed"); 
                            chpass.close();
                        }
                    });    
                }else{
                    Ext.Msg.alert('Error', "The passwords does not match and cannot be empty"); 
                }

            }    
        }],
        
    })


    var chpass = new Ext.Window({
        layout:'fit',
        width:350,
        height:150,
        resizable: false,
        plain: true,
        border: false,
        title: "Change password",
        items: [chpass_form]
    });

    chpass.show();
}

widgets.user.well = function(name){
    console.log(name);
}


widgets.user.choose = function(callback){

    $.jsonRPC.request("user.all", {
        params: [], 
        success: function(list) {


            var store = new Ext.data.ArrayStore({fields: ["id", "username", "fullname"]});
            
            var data = [];
            for(var i = 0; i < list.length; i++){
                var frame = list[i];
                data.push([frame["id"], frame["username"], frame["fullname"]]);
            }
                  
            store.loadData(data);
            
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
                            keyup: function(field){ store.filter("fullname", field.getValue(), true, false); }
                        },

                    })
                    ]
            });
            
            var columns = [
                    {header: "ID", dataIndex: "id", hidden: true},
                    {header: "Username", dataIndex: "username", width: 100},
                    {header: "Full name", dataIndex: "fullname", fixed: false},
            ];

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
                        callback(store.getAt(row).get("id"), widgets.user.well(store.getAt(row).get("fullname")));
                    }
                }
                
            });
            
            var win = new Ext.Window({
                width:500,
                height:500,
                resizable: true,
                plain: true,
                border: false,
                autoScroll: true,
                cls: "whitewin",
                title: "Choose user",
                items: [search, lv]
            });

            win.show();

        }
    });       

}