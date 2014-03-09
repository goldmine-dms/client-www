/*
  From: https://github.com/datagraph/jquery-jsonrpc
  Modified to use auth
  Modified to throw graphical error messages
  Modified to show graphical loading process
  Modified to catch JSONRPCUnauthorized exception (-31000) and show login dialog
*/

(function($) {
  $.extend({
    jsonRPC: {
      // RPC Version Number
      version: '2.0',

      // End point URL, sets default in requests if not
      // specified with the request call
      endPoint: null,

      // Default namespace for methods
      namespace: null,

      // ADDED: Authentication token
      auth: null,


      /*
       * Provides the RPC client with an optional default endpoint and namespace
       *
       * @param {object} The params object which can contains
       *   {string} endPoint The default endpoint for RPC requests
       *   {string} namespace The default namespace for RPC requests
       */
      setup: function(params) {
        this._validateConfigParams(params);
        this.endPoint = params.endPoint;
        this.namespace = params.namespace;
        this.auth = params.auth;
        return this;
      },

      /*
       * Convenience wrapper method to allow you to temporarily set a config parameter
       * (endPoint or namespace) and ensure it gets set back to what it was before
       *
       * @param {object} The params object which can contains
       *   {string} endPoint The default endpoint for RPC requests
       *   {string} namespace The default namespace for RPC requests
       * @param {function} callback The function to call with the new params in place
       */
      withOptions: function(params, callback) {
        this._validateConfigParams(params);
        // No point in running if there isn't a callback received to run
        if(typeof(callback) === 'undefined') throw("No callback specified");

        origParams = {endPoint: this.endPoint, namespace: this.namespace, auth: this.auth};
        this.setup(params);
        callback.call(this);
        this.setup(origParams);
      },

      /*
       * Performas a single RPC request
       *
       * @param {string} method The name of the rpc method to be called
       * @param {object} options A collection of object which can contains
       *  params {array} the params array to send along with the request
       *  success {function} a function that will be executed if the request succeeds
       *  error {function} a function that will be executed if the request fails
       *  url {string} the url to send the request to
       * @return {undefined}
       */
      request: function(method, options) {
        if(typeof(options) === 'undefined') {
          options = {};
        }

        if(typeof(options.async) === "undefined"){
          options.async = true;
        }

        // Validate method arguments
        this._validateRequestMethod(method);
        this._validateRequestParams(options.params);
        this._validateRequestCallbacks(options.success, options.error);

        // Perform the actual request
        this._doRequest(JSON.stringify(this._requestDataObj(method, options.params, 1)), options);

        return true;
      },

      /*
       * Submits multiple requests
       * Takes an array of objects that contain a method and params
       *
       * @params {array} requests an array of request object which can contain
       *  method {string} the name of the method
       *  param {object} the params object to be sent with the request
       * @param {object} options A collection of object which can contains
       *  success {function} a function that will be executed if the request succeeds
       *  error {function} a function that will be executed if the request fails
       *  url {string} the url to send the request to
       * @return {undefined}
       */
      batchRequest: function(requests, options) {
        if(typeof(options) === 'undefined') {
          options = {};
        }

        // Ensure our requests come in as an array
        if(!$.isArray(requests) || requests.length === 0) throw("Invalid requests supplied for jsonRPC batchRequest. Must be an array object that contain at least a method attribute");

        // Make sure each of our request objects are valid
        var _that = this;
        $.each(requests, function(i, req) {
          _that._validateRequestMethod(req.method);
          _that._validateRequestParams(req.params);
        });
        this._validateRequestCallbacks(options.success, options.error);

        var data = [],
        request;

        // Prepare our request object
        for(var i = 0; i<requests.length; i++) {
          request = requests[i];
          data.push(this._requestDataObj(request.method, request.params, i+1));
        }

        this._doRequest(JSON.stringify(data), options);
      },

      // Validate a params hash
      _validateConfigParams: function(params) {
        if(typeof(params) === 'undefined') {
          throw("No params specified");
        }
        else {
          if(params.endPoint && typeof(params.endPoint) !== 'string'){
            throw("endPoint must be a string");
          }
          if(params.namespace && typeof(params.namespace) !== 'string'){
            throw("namespace must be a string");
          }
        }
      },

      // Request method must be a string
      _validateRequestMethod: function(method) {
        if(typeof(method) !== 'string') throw("Invalid method supplied for jsonRPC request")
        return true;
      },

      // Validate request params.  Must be a) empty, b) an object (e.g. {}), or c) an array
      _validateRequestParams: function(params) {
        if(!(params === null ||
             typeof(params) === 'undefined' ||
             typeof(params) === 'object' ||
             $.isArray(params))) {
          throw("Invalid params supplied for jsonRPC request. It must be empty, an object or an array.");
        }
        return true;
      },

      _validateRequestCallbacks: function(success, error) {
        // Make sure callbacks are either empty or a function
        if(typeof(success) !== 'undefined' &&
           typeof(success) !== 'function') throw("Invalid success callback supplied for jsonRPC request");
        if(typeof(error) !== 'undefined' &&
           typeof(error) !== 'function') throw("Invalid error callback supplied for jsonRPC request");
        return true;
      },

      // Internal method used for generic ajax requests
      _doRequest: function(data, options) {
        if(app){
          app.statusbar.wait();
        }
        var _that = this;
        $.ajax({
          type: 'POST',
          dataType: 'json',
          contentType: 'application/json',
          url: this._requestUrl(options.url),
          data: data,
          cache: false,
          async: false !== options.async,
          processData: false,
          error: function(json) {
            if(app) app.statusbar.error();
            _that._requestError.call(_that, json, options.error);
          },
          success: function(json) {
            if(app) app.statusbar.done();
            _that._requestSuccess.call(_that, json, options.success, options.error);
          }
        })
      },

      // Determines the appropriate request URL to call for a request
      _requestUrl: function(url) {
        url = url || this.endPoint;
        return url + '?tm=' + new Date().getTime()
      },

      // Creates an RPC suitable request object
      _requestDataObj: function(method, params, id) {
        var dataObj = {
          jsonrpc: this.version,
          method: this.namespace ? this.namespace +'.'+ method : method,
          id: id
        }
        if(typeof(params) !== 'undefined') {
          dataObj.params = params;
        }
        if(typeof(this.auth) !== 'null') {
          dataObj.auth = this.auth
        }
        return dataObj;
      },

      // Handles calling of error callback function
      _requestError: function(json, error) {
        if (typeof(error) !== 'undefined' && typeof(error) === 'function') {
          error(this._response());
        }
      },

      // Handles calling of RPC success, calls error callback
      // if the response contains an error
      // TODO: Handle error checking for batch requests
      _requestSuccess: function(json, success, error) {
        var response = this._response(json);

        // If we've encountered an error in the response, trigger the error callback if it exists
        if (response.error) {
          if (typeof(error) === 'function') {
            error(response.error);
            return;
          } else {
            // FIXME:
            console.log(typeof(response.error.code));
            if (response.error.code === -31000) {
              // JSON UnauthorizedException, show login dialog instead
              // of error
              user.authenticate("Session expired. Please log in to continue working.");
              return;
            } else{
              Ext.Msg.alert('Error!!', response.error.code + " " + response.error.message);
              return;
            }
          }
        }

        // Otherwise, successful request, run the success request if it exists
        if(typeof(success) === 'function') {
          try {
            // If we've processed a batch request, the response is an
            // Array of Objects instead of a single Object. In this
            // case, we pass along the full response.
            if (json instanceof Array) {
              success(response);
            } else {
              success(response.result);
            };
          } catch(e) {
            alert(e.message + "\n" + e.stack);
          }
        }
      },

      // Returns a generic RPC 2.0 compatible response object
      _response: function(json) {
        if (typeof(json) === 'undefined') {
          return {
            error: 'Internal server error',
            version: '2.0'
          };
        }
        else {
          try {
            if(typeof(json) === 'string') {
              json = eval ( '(' + json + ')' );
            }

            if (($.isArray(json) && json.length > 0 && json[0].jsonrpc !== '2.0') ||
                (!$.isArray(json) && json.jsonrpc !== '2.0')) {
              throw 'Version error';
            }

            return json;
          }
          catch (e) {
            return {
              error: 'Internal server error: ' + e,
              version: '2.0'
            }
          }
        }
      }

    }
  });
})(jQuery);
