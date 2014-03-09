"use strict";
// EVENT HANDLING, mainly UI clicks, such as menues
var listeners = {};

// Event: Broadcast that a named event fired
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

// Event: Subscribe to named events
var listen = function(event, handler){
    if(listeners[event] == null){
        listeners[event] = [handler];
    }
    else{
        listeners[event].push(handler);
    }
}


// Given a dict, return a new dict containing only the keys
// specificed by names
var limit_dict = function(dict, names){

    var obj = {};

    for(var i = 0; i < names.length; i++){
        var o = resolveobj(names[i].toLowerCase(), dict);
        obj[names[i]] = o;
    }
    return obj;

}


// Given an object and string, resolve the element in the object, given a string.
// str = a.b.c resolves obj.a.b.c as a string
// str = a.*.c resolves obj.a.b[0].c, ... obj.a.b[n].c as a string
var resolveobj = function(str, obj){

    if(obj == null) return null;

    if (str.indexOf(".") < 1){ return obj[str]}
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
                if (o == null) return null;
                var o = o[sss];
            }
        }
        return o;
    }
}

// Capitalize the first letter of a string
function capitalize(string) {
	return string.substr(0,1).toUpperCase() + string.substr(1);
}


var downloadURL = function downloadURL(url)
{
    var iframe;
    iframe = document.getElementById("hiddenDownloader");
    if (iframe === null)
    {
        iframe = document.createElement('iframe');
        iframe.id = "hiddenDownloader";
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
    }
    iframe.src = url;
}

// Create an Ext.data.ArrayStore and populate with fields from
// resultset
function createArrayStore(res) {
  var knownfields = {'id':null, 'name':null, 'parent':null};

  var groups = [];

  for (var i=0; i < res.length; i++) {
    groups[i] = [];
    for (var prop in res[i]) {
      if (prop in knownfields) {
        knownfields[prop] = true;
        groups[i].push(res[i][prop]);
      }
    }
    groups[i] = [res[i].id, res[i].name];

  }
    // groups[i] = [res[i].id, list[i].name, list[i].parent];
  var usedfields = [];
  for (var prop in knownfields) {
    if (knownfields[prop])
      usedfields.push(prop);
  }

  return new Ext.data.ArrayStore({
    fields: usedfields,
    data : groups,
  });
}
