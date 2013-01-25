/*
This function is run when the page is reloaded, determining wether to display
a login window or the main user interface.
*/


/* Bind menu clicks to functions */

listen("menu.user.logout",          user.login);

listen("menu.apidocs",              views.doc.browse);

listen("menu.browse.project",       views.browse.project);
listen("menu.browse.activity",      views.browse.activity);
listen("menu.browse.study",         views.browse.study);
listen("menu.browse.map.project",   views.map.project);
listen("menu.browse.map.activity",  views.map.activity);
listen("menu.browse.datatype",      views.browse.datatype);

listen("menu.mydata.study",         views.browse.my_study);
listen("menu.mydata.tempfile",      views.browse.tempfile);
listen("menu.mydata.favorites",     views.browse.favorite);

listen("menu.admin.restart",        admin.restart);
listen("menu.admin.user.create",    admin.createuser);
listen("menu.admin.group.browse",    views.group.browse);

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
    if(token && $.cookie("auth") !== null){
        changeHistory(token);
    }

    $.jsonRPC.request('info', {
        params: [],
        async: false,
        success: function(result) {   
            app.statusbar.text(result.server.organisation + " (" + result.server.name + ")");
    }});

});

