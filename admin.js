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



admin.createuser = function(){

    var randomPassword = function(length)
    {
      var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
      var pass = "";
      for(var x=0;x<10;x++){
        var i = Math.floor(Math.random() * chars.length);
        pass += chars.charAt(i);
      }
      return pass;
    }

    var cform = new Ext.FormPanel({ 

        labelWidth:150,
        frame:true, 
        defaultType:'textfield',

        items:[
            { 
                fieldLabel:'Username', 
                name:'username', 
                inputType:'text', 
            },
            { 
                fieldLabel:'Full Name', 
                name:'fullname', 
                inputType:'text', 
            },
            { 
                fieldLabel:'E-mail address', 
                name:'email', 
                inputType:'text', 
            },
            { 
                fieldLabel:'Initial Password', 
                name:'password', 
                inputType:'text',
                value: randomPassword() 
            }
        ],

        buttons:[{ 
            text:'Create',
            formBind: true,  
            handler: function(){
                var form = cform.getForm();
                $.jsonRPC.request('user.create', {

                    params: [
                        form.findField('username').getValue(),
                        form.findField('fullname').getValue(),
                        form.findField('email').getValue(),
                        form.findField('password').getValue()
                    ], 
                    success: function() {
                        Ext.Msg.alert('Success', "The user was created"); 
                        win.close();
                    }
                });    
            }    
        }],
        
        
    })


    var win = new Ext.Window({
        layout:'fit',
        width:350,
        height:200,
        closable: true,
        resizable: false,
        plain: true,
        border: false,
        title: "Create User",
        items: [cform]
    });

    win.show();
}