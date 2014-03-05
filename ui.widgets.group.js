widgets.group = {}

widgets.group.well = function(obj){
  console.log(obj);
}

widgets.group.choose = function(callback){

  var choose = {};

  $.jsonRPC.request("group.tree", {
    params: [],
    success: function(list) {

      var tree = new Ext.tree.TreePanel( {
        animate:false,
        loader: new Ext.tree.TreeLoader(), // Note: no dataurl, register a TreeLoader to make use of createNode()
        selModel: new Ext.tree.MultiSelectionModel(),
        border: false,
        rootVisible: false,
        autoScroll: true,
        cls: 'layoutpad',
      });

      var process = function(obj){

        for(var i=0; i < obj.length; i++){
          obj[i].text = obj[i].name;
          obj[i].expanded = true;
          if(obj[i].children.length == 0){
            obj[i].children = undefined;
            obj[i].leaf = true;
          }
          else{
            process(obj[i].children);
          }
        }
      }

      process(list);

      var root = new Ext.tree.AsyncTreeNode({
        text: 'Groups',
        expanded: true,
        children: list
      });

      tree.setRootNode(root);

      tree.on('click', function(obj){
        if(!obj.leaf){
          obj.toggle();
        }
      });

      tree.on('dblclick', function(obj){
        callback(obj.id, widgets.group.well(obj.text));
        win.close();
      });

      var win = new Ext.Window({
        width:500,
        height:500,
        resizable: true,
        plain: false,
        border: false,
        autoScroll: true,
        cls: 'whitewin',
        title: "Choose Group",
        items: [tree]
      });

      win.show();

    }
  });

}
