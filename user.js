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
            
            var usermenu = new Ext.menu.Menu({});
            usermenu.add({text:"<b>" + user.current.fullname + "</b>", disabled: true});
            usermenu.add({text:user.current.email, disabled: true});

 

            $.jsonRPC.request('info', {
                params: [],
                async: false,
                success: function(result) {   
                    usermenu.add({text:'Server name: ' + result.server.name, disabled: true});
                    usermenu.add({text:'Organisation: ' + result.server.organisation, disabled: true});
                    usermenu.add({text:'API version: ' + result.version.api, disabled: true});
            }});

            
            usermenu.add("-");
            usermenu.add({text:"Settings", handler: broadcast("menu.user.settings")});
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
