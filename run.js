/*
This function is run when the page is reloaded, determining wether to display
a login window or the main user interface.
*/



listen("menu.user.logout", loginWindow);
listen("menu.browse.sites", browseSites);
listen("menu.browse.map", browseMap);
listen("menu.browse.types", browseTypes);
listen("menu.browse.sastudies", browseStandaloneStudies);
listen("menu.mydata.studies", browseMyStudies);

$(function() {
                
    $.jsonRPC.setup({ endPoint: '/service' });

    if($.cookie("auth") !== null)
        userAuthenticated();
    else
        loginWindow();
        
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
});

