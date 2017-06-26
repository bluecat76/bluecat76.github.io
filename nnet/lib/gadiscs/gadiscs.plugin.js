define(['gadiscs/gadiscs'], function (GaDiscs) {

	// main plugin routine
	$.fn.gadiscs = function(param)
	{
		return this.each(function(){
				var instance = $.data(this, "gadiscs");
				if (!instance) {
					$.data(this, "gadiscs", new GaDiscs.GaDiscs(this, param));
				} else {
					instance[param].apply(instance, Array.prototype.slice.call(arguments, 1));
				}
		});
	};

});
