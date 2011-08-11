var currentUser = null;

var loginWindow = function() {
    currentUser = null;
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
                userAuthenticated();
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

var userAuthenticated = function() {

    $.jsonRPC.setup({
      endPoint: '/service',
      auth: $.cookie("auth")
    });
                         

    $.jsonRPC.request('user.whoami', {
        params: [],
        success: function(result) {           
            currentUser = result
 
            toolbar.items.get("usermenu").setText(currentUser.username);
            
            var usermenu = new Ext.menu.Menu({});
            usermenu.add({text:"<b>" + currentUser.fullname + "</b>", disabled: true});
            usermenu.add({text:currentUser.email, disabled: true});
            usermenu.add("-");
            usermenu.add({text:"Settings", handler: broadcast("menu.user.settings")});
            usermenu.add({text:"Logout", handler: broadcast("menu.user.logout")});
 
            toolbar.items.get("usermenu").menu = usermenu;
 
            app.show();
            app.left.hide();
 
        },
        error: function() {
            loginWindow();
        }
    });

};
