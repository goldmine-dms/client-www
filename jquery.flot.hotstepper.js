(function ($) {
    function init(plot) {
        plot.hooks.processDatapoints.push(hotstepper);       
    }

    function hotstepper(plot, series, datapoints) {

        if(series.hotstep.type){

            var ps = datapoints.pointsize;
            var points = datapoints.points;

            var triplepoints = points.concat(points).concat(points);
            for(var i = 0; i < points.length/ps; i++){
                var o = 3*ps*i;
                var s = i*ps;
                for(var k=0; k < 3; k++){
                    triplepoints[o+ps*k] = points[s];
                    triplepoints[o+ps*k+1] = points[s+1];
                }
            }

            switch(series.hotstep.type){

                case "end":
                    for(var i = 0; i < points.length/ps; i++){
                        var o = 3*ps*i;
                        var k = 1;
                        triplepoints[o-3*ps+ps*2+1] = triplepoints[o+1];
                        if(series.hotstep.discrete) triplepoints[o+ps*k] = null;
                    }

                break;
                case "center":

                    // FIXME not implemented


                break;
                case "start":
                default:
                    // FIXME not implemented
                    
            }


            datapoints.points = triplepoints;
            


        }
        
    }

    var options = {
        series: {
            hotstep: {
                type: null,
                discrete: true
            }
        }
    }

    $.plot.plugins.push({
        init: init,
        options: options,
        name: "hotstep",
        version: "0.1"
    });
})(jQuery);