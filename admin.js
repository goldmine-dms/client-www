var admin = {};


admin.restart = function(){
    $.jsonRPC.request('admin.restart', {
            params: []
    });
    $("#loading-mask").fadeIn();
    load('Restarting Server',0); 
    admin.restart.check();
};

admin.restart.counter = 0;

admin.restart.check = function(){
    
    if(admin.restart.counter == 11){
        
        $.jsonRPC.request('info', {
            params: [],
            success: function(version) {
                $("#loading-mask").fadeOut();
            },
            error: function(){
                admin.restart.counter=0;
                setTimeout(admin.restart.check, 100);
            }
        });
    }
    else
    {
        load('Restarting Server', admin.restart.counter * 10);
        admin.restart.counter++;
        setTimeout(admin.restart.check, 100);
        
    }
}
