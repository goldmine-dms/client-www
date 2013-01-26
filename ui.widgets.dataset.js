widgets.dataset = {}


widgets.dataset.well = function(name){
    console.log(name); 
}


widgets.dataset.choose = function(callback, current_study, limit_type){

    if(typeof current_study === "undefined"){
        // call with widgets.study.choose

        return;
    }

    $.jsonRPC.request("study.get", {
        
        params: [current_study], 
        success: function(obj) {


            var store = jsonstore(obj.datasets, ['description', 'type', 'created', 'closed', 'curation_status', 'id']);

            var columns = [
            
                { header: 'ID', width: 250, dataIndex: 'id', hidden: true},
                { header: '', width: 24, dataIndex: 'closed', renderer: function(o){
                    if(o) return "<img src='icons/lock.png' title='Closed'/>";
                    else return "<img src='icons/pencil.png' title='Open'/>";
                }},
                { header: 'Type', width: 100, dataIndex: 'type'},
                { header: 'Created', width: 175, dataIndex: 'created'},
                { header: 'Curation', width: 75, dataIndex: 'curation_status'},
                { header: 'Description', fixed: false, dataIndex: 'description'}
            ];

            if(limit_type){
                store.filter("type", limit_type, true, false);
            }
            
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
                                if(limit_type){
                                    store.filter([
                                        {property: "type", value: limit_type},
                                        {property: "description", value: field.getValue(), anyMatch: true, caseSensitive: false}
                                    ]);
                                }else{
                                    store.filter("description", field.getValue(), true, false);
                                }
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
                        callback(store.getAt(row).get("id"), widgets.dataset.well(store.getAt(row).get("description")));
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
                title: "Choose dataset",
                items: [search, lv]
            });

            win.show();

        }
    });

}