views.browse.project = function(){
  views.browse.master("project", "project.all", "name", views.show.project);
}

views.browse.activity = function(project){
  if(typeof project !== "undefined") project = [project];
  views.browse.master("activity", "activity.all", "name", views.show.activity, project);
}

views.browse.study = function(){
  views.browse.master("study", "study.all", "name", views.show.study);
}

views.browse.my_study = function(){
  views.browse.master("my_study", "study.all", "name", views.show.study, [true]);
}

views.browse.favorite = function(){
  views.browse.master("favorite", "favorite.all", "name", views.show.favorite);
}

views.browse.datatype = function(){
  views.browse.master("datatype", "dataset.type.all", "name", views.show.datatype);
}

views.browse.tempfile = function(){
  views.browse.master("tempfile", "tempfile.all", "name", views.show.tempfile);
}

// views.browse.importer = function(){
//     views.browse.master("importer", "importer.all", "name", views.show.importer);
// }

views.map.project = function(){
  views.map.master("project", "project.all", "name", views.show.project);
}

views.map.activity = function(project){
  if(typeof project !== "undefined") project = [project];
  views.map.master("activity", "activity.all", "name", views.show.activity, project);
}

views.show.project = function(id){

  var header = ["ID", "Name", "Location.Latitude", "Location.Longitude", "Location.Elevation"];

  views.show.master(id, "project", "project.get", "name", header, "description", function(obj){

    var store = jsonstore(obj.activities, ['name', 'description', 'id']);

    var columns = [
      { header: 'ID', width: 250, dataIndex: 'id', hidden: true},
      { header: 'Name', width: 250, dataIndex: 'name'},
      { header: 'Description', fixed: false, dataIndex: 'description'}
    ];

    var d = [widgets.easy_gp('Activities', store, columns, views.show.activity)];
    views.show.master.addmarkers(obj.activities, "42C0FB", views.show.activity);
    return d;

  }, function(obj){
    var favorite = widgets.favorite(obj.id,  "project");
    return ["->", favorite];
  });



}

views.show.activity = function(id){

  var header = ["ID", "Name", "Location.Latitude", "Location.Longitude", "Location.Elevation"];

  views.show.master(
    id, "activity", "activity.get", "name", header, "description",
    function(obj) {

      var store = jsonstore(obj.studies, ['name', 'description', 'id']);
      var columns = [
        { header: 'ID', width: 250, dataIndex: 'id', hidden: true},
        { header: 'Name', width: 250, dataIndex: 'name'},
        { header: 'Description', fixed: false, dataIndex: 'description'}
      ];

      return [widgets.easy_gp('Studies', store, columns, views.show.study)]
    },
    function(obj){

      var backProject = new Ext.Action({
        text: 'Project (' + obj.project.name + ')',
        icon: 'icons/arrow_left.png',
        handler: function(){
          views.show.project(obj.project.id);
        }
      });

      var favorite = widgets.favorite(obj.id,  "activity");

      return [backProject, "->", favorite];
    }

  );
}

views.show.study = function(id){

  var header = ["ID", "Name", "Owner.Fullname"];

  views.show.master(id, "study", "study.get", "name", header, "description", function(obj){

    var datasetstore = jsonstore(obj.datasets, ['description', 'type', 'created', 'closed', 'curation_status', 'id']);
    var datasetcolumns = [
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

    return [
      widgets.study.toolbar(obj),
      widgets.easy_gp('Datasets', datasetstore, datasetcolumns, views.show.dataset),
      widgets.lineage(id),
    ]
  },
                    function(obj){
                      var activityMenu = [];

                      for(var i = 0; i < obj.activities.length; i++){
                        var activity_id = obj.activities[i].id;
                        var activity = {
                          text: obj.activities[i].name,
                          handler: function(){
                            views.show.activity(activity_id);
                          }
                        };
                        activityMenu.push(activity);
                      }

                      var backActivity = new Ext.Action({
                        text: 'Activities (' + obj.activities.length + ')',
                        icon: 'icons/arrow_left.png',
                        menu: activityMenu
                      });

                      var favorite = widgets.favorite(obj.id,  "study");

                      return [backActivity, "->", favorite];
                    }
                   );
}

views.show.datatype = function(id){
  var header = ["ID", "Name", "Unit"];
  views.show.master(id, "datatype", "dataset.type.get", "name", header, "description", undefined, function(obj){
    var favorite = widgets.favorite(obj.id,  "datatype");
    return ["->", favorite];
  });
}

views.show.favorite = function(obj){
  var id = obj.ref_id;
  var type = obj.ref_type;
  views.show[type](id);
}


views.show.dataset = function(id){

  var header = ["ID", "Description", "Type", "Created", "Creator.Fullname", "Closed", "Curated", "Curated_by", "Curation_status"];

  views.show.master(id, "dataset", "dataset.get", "description", header, undefined,
                    function(obj){
                      // content
                      return widgets.dataset[obj.type](id)
                    },
                    function(obj){
                      // tbar
                      var backStudy = new Ext.Action({
                        text: 'Study (' + obj.study.name + ')',
                        icon: 'icons/arrow_left.png',
                        handler: function(){
                          views.show.study(obj.study.id);
                        }
                      });

                      var favorite = widgets.favorite(obj.id,  "dataset");

                      return [backStudy, '->', favorite];
                    });
}

// views.show.importer = function(id) {

//     var get_dataset_well = function(id){

//         var datasetobj = null;

//         if(id != null){

//             $.jsonRPC.request("dataset.sequence.get", {
//                 params: [id],
//                 async: false,
//                 success: function(obj) {
//                     datasetobj = obj;
//                 }
//             });

//             var swell = widgets.study.well(datasetobj.dataset.study_id, "<i>Current study</i>");
//             var dswell = widgets.dataset.well(id, datasetobj.dataset.description, datasetobj.dataset.study_id);
//             var parmwell = widgets.dataset.sequence.parameterwell(datasetobj.parameters);
//         }else{
//             var swell = widgets.study.well(null);
//             var dswell = widgets.dataset.well(null);
//             var parmwell = widgets.dataset.sequence.parameterwell(null);
//         }

//         swell.on('wellupdate', function(study_id){
//             dswell.update_study(study_id);
//             parmwell.update_dataset(null);
//         });

//         dswell.on('wellupdate', function(dsid){
//             $.jsonRPC.request("dataset.sequence.get", {
//                 params: [dsid],
//                 success: function(obj) {
//                     parmwell.update_dataset(obj.parameters);
//                 }
//             });
//         });

//         return [swell,  dswell, parmwell];
//     }

//     var study_panel = new Ext.Panel({
//         title: "Choose study",
//         flex: 1,
//         border: false,
//         padding: 10,
//         items: widgets.study.well(null);
//     });


//     var timescale_panel = new Ext.Panel({
//         title: "Choose timescale",
//         flex: 1,
//         border: false,
//         padding: 10,
//         items: get_dataset_well(null)
//     });

//     var buttons = new Ext.Panel({
//         height: 30,
//         border: false,
//         align: 'right',
//         items: [
//             {
//                 text: '<b>Upload</b>',
//                 xtype: 'button',
//                 handler: function(){

//                     var dataset_id = dataset_panel.items.items[1].tag_id;
//                     var dataset_parm = dataset_panel.items.items[2].tag_id;
//                     var timescale_id = timescale_panel.items.items[1].tag_id;
//                     var timescale_parm = timescale_panel.items.items[2].tag_id;

//                     var getdatafn = ['dataset.sequence.get_data', [dataset_id, dataset_parm]];
//                     var gettimefn = ['dataset.sequence.get_data', [timescale_id, timescale_parm]];

//                     var argmap = ['util.argmap', 'plugin.glaciology.timescale.spans_to_time'];

//                     var asciifn = ['dataset.sequence.export.to_ascii'];

//                     var tmpfilefn = ['tempfile.create', 'data_on_timescale.txt'];

//                     $.jsonRPC.request("chain", {
//                         params: [[getdatafn, gettimefn], argmap, asciifn, tmpfilefn],
//                         success: function(result) {
//                             filename = result[0];
//                             // FIXME: hardcoded value for REST'y endpoint
//                             downloadURL("/rest/tempfile.pull/" + filename);
//                         }
//                     });


//                 }
//             }
//         ]
//     });


//     var win = new Ext.Window({
//         plain: true,
//         border: false,
//         cls: 'whitewin',
//         layout: 'vbox',
//         layoutConfig: {
//             align: 'stretch'
//         },
//         title: "Import new dataset",
//         items: [ study_panel, type_panel, date_panel, comment_panel, curation_panel]
//     });

//     win.show();
// }

views.show.tempfile = function(id){
  var header = ["Name", "Size", "Accessed", "Modified", "Created"];
  views.show.master(id, "tempfile", "tempfile.info", "name", header, undefined, function(obj){

    var wrap = [];
    var toolbar = new Ext.Panel({
      layout: 'fit',
      cls: 'layoutpad',
      height: 70,
      items: [
        {xtype: 'toolbar', items: [
          {xtype: 'tbspacer', width: 5},
          {
            text: '<b>Download</b>',
            handler: function(){
              //FIXME: hardcoded URL
              downloadURL('/rest/tempfile.get/' + obj.id);
            }
          },
          {
            text: 'Delete',
            handler: function(){

              Ext.Msg.confirm('Confirm deletion', 'Filename: "' + obj.id + '"', function(btn){
                if(btn == 'yes'){
                  $.jsonRPC.request("tempfile.delete", {
                    params: [obj.id],
                    success: function(){
                      views.browse.tempfile();
                    }
                  });
                }
              });
            }
          },
        ]}
      ]
    });

    wrap.push(toolbar);
    return wrap;
  });
}



/*


                  var paramsStore = jsonstore(
                  dataset.params, ['id', 'ytype.name', 'ytype.unit',
                  'ytype.species', 'ytype.description',
                  'ytype.classification', 'ytype.id']);
                  *
                  var metadataStore = jsonstore(
                  dataset.metadata, ['id', 'annotation', 'params.length',
                  'created', 'creator.fullname', 'params']);
                  *
                  var expander = new Ext.ux.grid.RowExpander({
                  handler : function(row){
                  var data = row.data.params;
                  var obj = Array();
                  if(data.length == 0)
                  return undefined;

                  for(var i =0; i < data.length; i++){
                  obj[data[i].key] = data[i].value;
                  }

                  var p = new Ext.grid.PropertyGrid({
                  autoHeight: true,
                  width: 500,
                  source: obj,
                  cls: 'layoutpad',
                  listeners: {
                  'beforeedit': function (e) { return false; },
                  },
                  viewConfig: {scrollOffset: 2, forceFit: true},
                  });

                  return p;
                  },var toolbar = new Ext.Panel({
                  layout: 'fit',
                  cls: 'layoutpad',
                  height: 70,
                  items: [
                  {xtype: 'toolbar', items: [{xtype: 'tbspacer', width: 5},
                  {
                  text: '<b>Download</b>',
                  handler: function(){
                  widgets.dataset.sequence.download(id);
                  }
                  },
                  {xtype: 'tbspacer', width: 5},
                  {
                  text: 'Plotting',
                  menu: [
                  {
                  text: 'X-axis', menu: [
                  {
                  text: 'Logarithmic',
                  xtype: 'menucheckitem',
                  id: 'sequence.plot.x.log',
                  handler: widgets.dataset.sequence.plot.redraw
                  },
                  {
                  text: 'Inverted',
                  xtype: 'menucheckitem',
                  id: 'sequence.plot.x.inverted',
                  handler: widgets.dataset.sequence.plot.redraw
                  }
                  ]},
                  {   text: 'Y-axis', menu: [
                  {
                  text: 'Logarithmic',
                  xtype: 'menucheckitem',
                  id: 'sequence.plot.y.log',
                  handler: widgets.dataset.sequence.plot.redraw
                  },
                  {
                  text: 'Inverted',
                  xtype: 'menucheckitem',
                  id: 'sequence.plot.y.inverted',
                  handler: widgets.dataset.sequence.plot.redraw
                  }
                  ]}
                  ]
                  },
                  {xtype: 'tbspacer', width: 5},
                  {
                  text: 'Analysis',
                  menu: [
                  {text: 'Compare with other dataset'}
                  ]
                  },
                  {xtype: 'tbspacer', width: 5},
                  {
                  text: 'Metadata',
                  menu: [
                  {text: 'Annotate'}
                  ]
                  },
                  {xtype: 'tbspacer', width: 5},
                  {
                  text: 'Administration',
                  menu: [
                  {text: 'Close dataset'}
                  ]
                  }
                  ]}
                  ]
                  });

                  wrap.push(toolbar);
                  expandOnDblClick: false,
                  });

                  var studyAction = new Ext.Action({
                  text: 'Study (' + dataset.study.name + ')',
                  handler: function(){
                  showStudy(dataset.study.id);
                  }
                  });

                  var wrap = new Ext.Panel({
                  tbar: [studyAction, '&#8594;','Dataset','->', '<div id="downloadify"><img src="icons/error.png" title="Flash 10 needed to download datasets"/></div>'],
                  layout: 'fit',
                  border: false,
                  items: [
                  {
                  border: false,
                  layout: 'column',
                  autoHeight: true,
                  items: [
                  easy_pg('Dataset', dataset, ["ID", "Created",
                  "Closed", "Description", "xType.Name",
                  "xType.Unit", "xType.Species", "Markerlocation", "Markertype",
                  "Counters.Measurements",
                  "Counters.Datapoints" ], 'layoutpad'),
                  ]
                  },


                  new Ext.grid.GridPanel({
                  layout: 'fit',
                  columns: [
                  expander,
                  { header : '#P', width: 30, dataIndex: 'params.length'},
                  { header : 'ID', width: 250, dataIndex: 'id'},
                  { header : 'Created', width: 150, dataIndex: 'created'},
                  { header : 'Created By', width: 200, dataIndex: 'creator.fullname'},
                  { header : 'Annotation', dataIndex: 'annotation', id: 'x-column'},
                  ],
                  store: metadataStore,
                  cls: 'layoutpad',
                  title: 'Dataset Metadata',
                  autoHeight: true,
                  stripeRows: true,
                  plugins: expander,
                  hidden: dataset.metadata.length == 0,
                  autoExpandColumn: 'x-column',
                  viewConfig: {scrollOffset: 0},

                  })

                  ]
                  });




*/
