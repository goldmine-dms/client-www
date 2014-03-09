views.doc = {}

views.doc.browse = function(){

  setHistory("views.doc.browse");

  $.jsonRPC.request("doc.methods", {
    params: [],
    success: function(list) {


      app.main.prepare();
      app.main.setTitle("Browse API Documentation");

      var tree = new Ext.tree.TreePanel( {
        animate:false,
        loader: new Ext.tree.TreeLoader(), // Note: no dataurl, register a TreeLoader to make use of createNode()
        selModel: new Ext.tree.MultiSelectionModel(),
        border: false
      });


      // set the root node

      data = {
        children: []
      };

      list = list.sort();

      for(var i = 0; i < list.length; i++){

        var elements = list[i].split(".");
        var root = data;

        for(var j = 0; j < elements.length; j++){

          if(j == elements.length - 1){
            // at last element
            root.children.push(
              {
                "text": elements[j],
                "id": list[i],
                "leaf": true
              }
            );
          }
          else{
            // inbetween
            if(!root.children){
              root.children = [];
            }

            // find child
            var found = false;
            for(var k = 0; k < root.children.length; k++){
              if(root.children[k].text == elements[j]){
                root = root.children[k];
                found = true;
                break;
              }
            }

            // child not found, create it
            if(!found){
              obj = {
                "text": elements[j],
                "leaf": false,
                "children": []
              }
              root.children.push(obj)
              root = obj;
            }
          }

        }
      }

      var root = new Ext.tree.AsyncTreeNode({
        text: 'API Docs',
        expanded: true,
        children: data.children
      });

      tree.setRootNode(root);
      app.left.prepare();


      tree.on('click', function(obj){
        if(obj.leaf){
          views.doc.show(obj.id);
        }else{
          obj.toggle();
        }

      });

      app.left.add(tree);
    }
  });
}


views.doc.show = function(name){

  setHistory("views.doc.show", name);

  $.jsonRPC.request("doc.help", {
    params: [name],
    success: function(obj) {

      app.main.prepare();
      app.main.setTitle("Documentation for " + name);

      var html = '<h1>' + obj.method + '</h1>';
      if (obj.doc)
        html += '<pre>' + obj.doc + '</pre>';

      var wrap = new Ext.Panel({
        layout: 'fit',
        border: false,
        cls: 'layoutpad txt',
        html: html
      });

      app.main.add(wrap);
      app.main.doLayout();

    }
  });
}
