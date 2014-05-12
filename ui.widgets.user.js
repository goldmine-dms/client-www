widgets.user = {}

widgets.user.changepassword = function() {

  var chpass_form = new Ext.FormPanel({
    labelWidth:150,
    frame:true,
    defaultType:'textfield',

    items:
    [
      {
        fieldLabel:'Old password',
        name:'oldpassword',
        inputType:'password',
      },
      {
        fieldLabel:'New password',
        name:'password',
        inputType:'password',
      },
      {
        fieldLabel:'Repeat password',
        name:'password2',
        inputType:'password',
      }
    ],

    buttons:[{
      text:'Change',
      formBind: true,
      handler: function(){
        var form = chpass_form.getForm();
        if(form.findField('password').getValue() == form.findField('password2').getValue()
           && form.findField('password').getValue() != ""){
          $.jsonRPC.request('user.change_password_user', {

            params: [form.findField('oldpassword').getValue(), form.findField('password').getValue()],
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

widgets.user.settings = function() {
  $.jsonRPC.request("user.setting.all", {
    params: [],
    success: function(settings) {

      var store = new Ext.data.JsonStore({
        id: 'settings-store',
        fields: ['id', 'key', 'value'],
        data: settings
      });

      var columns = [
        {header: "ID", dataIndex: "id", hidden: true},
        {header: "Key",
         dataIndex: "key",
         editor: {
           xtype: 'textfield'
         },
        },
        {
          header: "Value",
          dataIndex: "value",
          editor: {
           xtype: 'textfield'
         },
        },
      ];

      var toolbar = new Ext.Toolbar({
        items: [
          {
            text: 'Add',
            id: 'settings-add',
            icon: 'icons/add.png',
            handler: function(stuff) {
              var newRow = new store.recordType();
              store.insert(0, newRow);
            },
          },
          {
            text: 'Remove',
            id: 'settings-remove',
            icon: 'icons/delete.png',
            handler: function(obj) {
              console.log(gridpanel);
              var gridpanel = Ext.getCmp('settings-grid-panel');
              var selected = gridpanel.getSelectionModel().getSelections();
              var existing = selected.filter(function (row) {
                return (row.data.id !== undefined);
              });
              var keys = existing.map(function (row) {
                return (row.data.key);
              });

              $.jsonRPC.request('user.setting.remove', {
                async: true,
                params: [keys],
                success: function(res) {
                  gridpanel.store.remove(existing);
                },
              });
            },
          },
          {
            text: 'Autosave',
            id: 'settings-autosave',
            enableToggle: true,
            pressed: true,
            toolTip: "When enabled, changes will be saved automatically.",
            handler: function(obj) {
              Ext.getCmp('settings-save').setDisabled(!Ext.getCmp('settings-save').disabled);
            },
          },
          {
            text: 'Save',
            id: 'settings-save',
            toolTip: "Save items.",
            disabled: true,
            handler: function(stuff) {
              console.log(stuff);
            },
          },
        ]
      });

      var gridpanel = new Ext.grid.EditorGridPanel({
        id: 'settings-grid-panel',
        emptyText: 'No settings',
        autoHeight: true,
        viewConfig: {
          forceFit: true,
        },
        colModel: new Ext.grid.ColumnModel({
          defaults: {
            sortable: true,
          },
          columns: columns
        }),
        selModel: new Ext.grid.RowSelectionModel({}),
        store: store,
      });

      gridpanel.on('afteredit', function(e) {
        changed = e;
        console.log(e);
        if (e.record.data.id === undefined) {
          // not yet submitted, create a new settings record
          if (e.record.data.key !== undefined && e.record.data.value !== undefined) {
            var store = e.grid.getStore();
            store.add(e.record);
          }
        };
      });

      var win = new Ext.Window({
        width:500,
        height:500,
        resizable: true,
        plain: true,
        border: false,
        autoScroll: true,
        cls: "whitewin",
        title: "User settings",
        items: [toolbar, gridpanel]
      });

      win.show();
    }
  });

};
