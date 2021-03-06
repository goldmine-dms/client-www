/*
  This function is run when the page is reloaded, determining wether to display
  a login window or the main user interface.
*/


/* Bind menu clicks to functions */

listen("menu.user.logout",          user.login);
listen("menu.user.changepassword",  widgets.user.changepassword);
listen("menu.user.settings",        widgets.user.settings);

listen("menu.apidocs",              views.doc.browse);

listen("menu.browse.project",       views.browse.project);
listen("menu.browse.activity",      views.browse.activity);
listen("menu.browse.study",         views.browse.study);
listen("menu.browse.map.project",   views.map.project);
listen("menu.browse.map.activity",  views.map.activity);
listen("menu.browse.datatype",      views.browse.datatype);

listen("menu.mydata.study",         views.browse.my_study);
listen("menu.mydata.importer",      views.browse.importer);
listen("menu.mydata.tempfile",      views.browse.tempfile);
listen("menu.mydata.favorites",     views.browse.favorite);

listen("menu.admin.restart",        admin.restart);
listen("menu.admin.group.create",   admin.creategroup);
listen("menu.admin.user.create",    admin.createuser);
listen("menu.admin.group.browse",   views.group.browse);

// Generic add item menu
listen("menu.add",   views.add);

// Global variable for settings
var settingsstore;
var settings = function (key) {
  var key2 = settingsstore.data.items.filter(function (k) {
    return (k.data.key == key);
  });
  key2 = key2[0];

  if (key2 !== undefined) {
    return key2.data.value;
  } else {
    return false;
  }
};


$(function() {

  $.jsonRPC.setup({ endPoint: '/service' });

  if($.cookie("auth") !== null)
    user.authenticate();
  else
    user.login();

  $("#loading-mask").fadeOut();

  Ext.History.init();

  Ext.History.on('change', function(token){
    if(token){
      changeHistory(token);
    }
  });

  var token = Ext.History.getToken();
  if (token && $.cookie("auth") !== null) {
    changeHistory(token);
  }

  $.jsonRPC.request('info', {
    params: [],
    async: false,
    success: function(result) {
      app.statusbar.text(result.server.organisation + " (" + result.server.name + ")");
    }});

});
