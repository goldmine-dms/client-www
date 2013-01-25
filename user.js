var user = {}

user.current = null;

user.login = function() {

    user.current = null;
    $.cookie("auth", null); // do session logout
    $.jsonRPC.setup({
      endPoint: '/service',
      auth: null
    });
    
    app.hide();
    
    var doLogin = function(){
        $.jsonRPC.request('authenticate', {
            params: [login.getForm().findField('username').getValue(), login.getForm().findField('password').getValue()], 
            success: function(token) {
                $.cookie("auth", token);
                user.authenticate();
                win.close();
            },
            error: function(result) {
                Ext.Msg.alert('Error', result.message); 
                login.getForm().findField('password').setValue(""); 
            }
        });    
    }

    var login = new Ext.FormPanel({ 
        labelWidth:80,
        frame:true, 
        title:'Please Login', 
        defaultType:'textfield',

        items:[{ 
            fieldLabel:'Username', 
            name:'username', 
            id: 'username',
        },{ 
            fieldLabel:'Password', 
            name:'password', 
            inputType:'password', 
        }],
 
        buttons:[{ 
            text:'Login',
            formBind: true,	 
            handler: doLogin    
        }],
        
        keys: [{ 
            key: [Ext.EventObject.ENTER], handler: doLogin
        }]
 
    });


    

    var win = new Ext.Window({
        layout:'fit',
        width:300,
        height:150,
        closable: false,
        resizable: false,
        plain: true,
        border: false,
        items: [login]
	});

	win.show();
};

user.authenticate = function() {

    $.jsonRPC.setup({
      endPoint: '/service',
      auth: $.cookie("auth")
    });
                         

    $.jsonRPC.request('user.whoami', {
        params: [],
        success: function(result) {           
            user.current = result
 
            toolbar.items.get("usermenu").setText(user.current.username);
            

                var chpass_form = new Ext.FormPanel({ 

                    labelWidth:150,
                    frame:true, 
                    defaultType:'textfield',

                    items:[{ 
                        fieldLabel:'New password', 
                        name:'password', 
                        inputType:'password', 
                    },{ 
                        fieldLabel:'Repeat password', 
                        name:'password2', 
                        inputType:'password', 
                    }],
             
                    buttons:[{ 
                        text:'Change',
                        formBind: true,  
                        handler: function(){
                            var form = chpass_form.getForm();
                            if(form.findField('password').getValue() == form.findField('password2').getValue()
                                && form.findField('password').getValue() != ""){
                                $.jsonRPC.request('user.change_password', {

                                    params: [form.findField('password').getValue()], 
                                    success: function() {
                                        Ext.Msg.alert('Success', "The password was changed"); 
                                        chpass.close();
                                    }
                                });    
                            }else{
                                Ext.Msg.alert('Error', "The passwords does not match and cannot be empty"); 
                            }

                        }    
                    }],
                    
                    
                })


            var chpass = new Ext.Window({
                layout:'fit',
                width:350,
                height:150,
                resizable: false,
                plain: true,
                border: false,
                title: "Change password",
                items: [chpass_form]
            });





            var usermenu = new Ext.menu.Menu({});
            usermenu.add({text:"<b>" + user.current.fullname + "</b>", disabled: true});
            usermenu.add({text:user.current.email, disabled: true});
           
            usermenu.add("-");

            usermenu.add({text:"Settings", handler: broadcast("menu.user.settings")});
                        usermenu.add({text:"Change Password...", handler: function(){
                chpass.show();
            }});
            usermenu.add("-");
            usermenu.add({text:"Logout", handler: broadcast("menu.user.logout")});

            toolbar.items.get("usermenu").menu = usermenu;
            app.show();
            app.left.hide();
            
 
        },
        error: function() {
            user.login();
        }
    });

};
