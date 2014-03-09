views.add = function(type) {

  function getKVValues(kv) {
    var values = [];
    for (var k in kv) {
      console.log(k);
      if (!kv[k])
        continue;
      if (k.match(/_id$/) !== null) {
        console.log(kv[k]);
        values.push(kv[k]['id']);
      } else {
        values.push(kv[k]);
      }
    }
    return values;
  }

  function getArguments(cmd) {
    var args;
    $.jsonRPC.request('doc.help', {
      params: [cmd],
      async: false,
      success: function(result) {
        args = result.arguments;
      }
    });
    return args;
  };

  // Auto-magically create the items needed for a form, based on the
  // input args. args ending in '_id' are presumed to be foreign keys
  // for whatever comes before '_id'.
  function createItems(args) {
    // strip parens surrounding args
    args = args.replace(/[()]/g, '');
    args = args.split(', ');

    var items = [];
    for (var i=0; i<args.length; i++) {
      if (typeof(args[i]) !== 'string') {
        continue;
      }

      var arg = args[i];
      arg = arg.split('=');
      var name = arg[0];
      // Args with a default value are considered optional and are
      // marked as such.
      var hasDefault = (arg.length === 2);

      // Split name
      var fkey = name.match(/(.*?)(_id)$/);

      if (fkey && fkey.length === 3) {

        var combo = new Ext.form.ComboBox({
          id: 'create' + capitalize(name),
          fieldLabel: capitalize(fkey[1]),
          name: name,
          type: fkey[1],
          allowBlank: hasDefault,
          // store: [], // if the store is defined, the updated store
          // will result in the correct number of items, but all items
          // will be empty...
          displayField: 'name',
          valueField: 'id',
          typeAhead: true,
          mode: 'local',
          triggerAction: 'all',
          emptyText: 'Select a ' + capitalize(fkey[1]) + '...',
          selectOnFocus: true,
          listeners: {
            scope: this,
            afterRender: function(combo) {
              $.jsonRPC.request(combo.type + '.all', {
                params: [],
                success: function(result) {
                  var store = createArrayStore(result);
                  combo.bindStore(store);
                },
              });
            }
          },
        });
        items.push(combo);

      } else {
        items.push({
          fieldLabel: capitalize(name),
          name: name,
          allowBlank: hasDefault,
        });
      }

    }
    return items;
  };

  var create_form = new Ext.FormPanel({
    id: type + 'Form',
    frame: true,
    monitorValid: true,
    defaultType: 'textfield',
    items: createItems(getArguments(type + '.create')),
    buttons: [{
      text: 'Create',
      formBind: true,
      handler: function() {
        var form = create_form.getForm();
        $.jsonRPC.request(type + '.create', {
          params: getKVValues(form.getFieldValues())
            .filter(function (x) {
              console.log(typeof(this));
              return(true);
            }),
          success: function(result) {
            Ext.Msg.alert('Success', 'Created ' + type + ' "' + result.name + '"');
            addwindow.close();
          }
        });
      }
    }]
  });

  var addwindow = new Ext.Window({
    layout:'fit',
    width:500,
    height:300,
    resizable: true,
    plain: false,
    border: false,
    title: "Create " + type,
    items: [create_form]
  });

  addwindow.show();

};
