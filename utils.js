var listeners = {};

// Simple event handling

var broadcast = function(event, params){
    return function(){
        if(listeners[event] == null){
            Ext.Msg.alert(event, "This function is not yet handled");
        }
        else{
            listeners[event].forEach(function(fun){
                fun(params);
            });
        }
    };
};

var listen = function(event, handler){
    if(listeners[event] == null){
        listeners[event] = [handler];
    }
    else{
        listeners[event].push(handler);
    }
}

var limit_dict = function(dict, names){

    var obj = {};
    
    for(var i = 0; i < names.length; i++){
        var o = resolveobj(names[i].toLowerCase(), dict);
        obj[names[i]] = o;
    }   
    return obj;

}

var resolveobj = function(str, obj){
    
    if (str.indexOf(".") < 1){
        return obj[str]
    }
    else{  
        var o = obj;
        var ss = str.split(".");
        for(var i = 0; i < ss.length; i++){
            var sss = ss[i];
            if(sss.indexOf("*") > 0){
                var sss = sss.substr(0, str.indexOf("*"));
                
                var otmp = o[sss];
                var o = Array();
                for(var j = 0; j < otmp.length; j++){
                    var oo = otmp[j];
                    var ooo = resolveobj(ss.slice(i+1).join("."), oo);
                    o.push(ooo);
                }
                var o = o.join(", ");
                break;
            }
            else{
                var o = o[sss];
            }
        }
        return o;
    }
}
