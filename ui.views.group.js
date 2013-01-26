views.group = {}

views.group.browse = function(){

    setHistory("views.group.browse");
    
    $.jsonRPC.request("group.tree", {
            params: [], 
            success: function(list) {

           
                app.main.prepare();
                app.main.setTitle("Browse Groups");
                                   
                var tree = new Ext.tree.TreePanel( {
                    animate:false,
                    loader: new Ext.tree.TreeLoader(), // Note: no dataurl, register a TreeLoader to make use of createNode()
                    selModel: new Ext.tree.MultiSelectionModel(),
                    border: false,
                    title: 'Groups',
                    rootVisible: false
                });


                var process = function(obj){

                    for(var i=0; i < obj.length; i++){
                        obj[i].text = obj[i].name;
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
                app.left.prepare();

              
                tree.on('click', function(obj){
                    if(obj.leaf){
                        views.group.show(obj.id);  
                    }else{
                        views.group.show(obj.id); 
                        obj.toggle();
                    }
                                      
                });
                
                app.left.add(tree);
            }
    });       
}

views.group.show = function(id){
    
     setHistory("views.group.show", id);
    
     $.jsonRPC.request("group.get", {
            params: [id], 
            success: function(obj) {
            
                app.main.prepare();
                app.main.setTitle("Showing group: " + obj.name);

                var store = jsonstore(obj.members, ['username', 'fullname', 'id']);
               
                var columns = [
                    { header: 'ID', width: 250, dataIndex: 'id', hidden: true},
                    { header: 'Username', width: 250, dataIndex: 'username'},
                    { header: 'Full Name', fixed: false, dataIndex: 'fullname'}
                ];
                
                var wrap = [widgets.easy_gp('Users', store, columns, function(){
                    alert("Not implemented");
                })];

                app.main.add(wrap);                
                app.main.doLayout();
                
            }
    });  
}


