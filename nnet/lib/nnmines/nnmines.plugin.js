define(['nnmines/nnmines'], function (NnMines) {

	// main plugin routine
	$.fn.nnmines = function(param)
	{
		return this.each(function(){
				var instance = $.data(this, "nnmines");
				if (!instance) {
					$.data(this, "nnmines", new NnMines.NnMines(this, param));
				} else {
					instance[param].apply(instance, Array.prototype.slice.call(arguments, 1));
				}
		});
	};

});
