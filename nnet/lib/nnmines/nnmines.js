define(['common/mathEx', 'nnmines/map'], function (mathEx, Map) {

	var LOOP_MULTIPLIER = 10;
	var MAX_POPULATION = 32;
	var CROSSOVER_RATE = 0.7;
	var MUTATION_RATE = 0.1;
	
	var GENE_LENGTH = 10;


	var defaults = {
			numMines: 30,
			numTanks: 10,
			updateInterval: 20
		};


	var NnMines = function(canvas_in, options_in)
	{
		var _this = this;
		var _options = $.extend({}, defaults, options_in);
		
		var canvas = _this.canvas_ = canvas_in;
		var context = _this.context_ = canvas.getContext('2d');
		var width = _this.width = canvas.width;
		var height = _this.height = canvas.height;
		
		_this.map_ = new Map.Map(width, height, {
				minMineSize: 3,
				maxMineSize: 5,
				tankSize: 18
			});
		
		_this.timer_ = undefined;
		
		_this.reset = function()
		{
			_this.map_.prepare(_options.numMines, _options.numTanks);
			_this.draw();
		};
		
		_this.draw = function()
		{
			context.clearRect(0, 0, canvas.width, canvas.height);

			$.each(_this.map_.mines, function(index, i_mine) {
					_this.drawMine(i_mine, '#003300', '#00FF00');
				});

			$.each(_this.map_.tanks, function(index, i_tank) {
					_this.drawTank(i_tank, '#333333', '#eeeeee');
				});
		};
		
		_this.drawMine = function(mine, color, fill)
		{
      context.beginPath();
      context.arc(mine.x, mine.y, mine.size, 0, 2 * Math.PI, false);
      context.fillStyle = fill;
      context.fill();
      context.lineWidth = 2;
      context.strokeStyle = color;
      context.stroke();
		};
		
		_this.drawTank = function(tank, color, fill)
		{
			var offset = parseInt(tank.size / 6);
			var pos_2 = 2 * offset;
			var pos_3 = 3 * offset;
			context.save();
			context.translate(tank.x, tank.y);
			context.rotate(tank.direction.getAngle() + 0.5 * Math.PI);
			context.beginPath();
			context.moveTo(     0, -pos_3);
			context.lineTo( pos_2,  pos_2);
			context.lineTo( pos_2, -pos_2);
			context.lineTo( pos_3, -pos_2);
			context.lineTo( pos_3,  pos_3);
			context.lineTo( pos_2,  pos_3);
			context.lineTo( pos_2,  pos_2);
			context.lineTo(-pos_2,  pos_2);

			context.lineTo(-pos_2,  pos_3);
			context.lineTo(-pos_3,  pos_3);
			context.lineTo(-pos_3, -pos_2);
			context.lineTo(-pos_2, -pos_2);
			context.lineTo(-pos_2,  pos_2);

			context.closePath();
      context.fillStyle = fill;
			context.fill();
      context.lineWidth = 2;
      context.strokeStyle = color;
      context.stroke();
      context.restore();
		};
		
		_this.update = function()
		{
			var index;
			
			_this.updateObjects();
			_this.draw();
			
			// update info
			// $("#info").text("gen: " + _this.ga_.getGenerations() + "; pop: " + _this.ga_.pool_.length + " / " + MAX_POPULATION);
		};
		
		_this.updateObjects = function()
		{
			var angle;
			// TODO: update object info from the NN...
			$.each(_this.map_.tanks, function(i, tank) {
					tank.move(_this.map_);
				});
		};
		
		_this.runTest = function()
		{
			_this.stopTest();
			_this.timer_ = window.setInterval(function() { _this.update(); }, _options.updateInterval);
		};
		
		_this.stopTest = function()
		{
			if (_this.timer_)
			{
				window.clearInterval(_this.timer_);
			}
		};
		
		// go...
		_this.reset();
	};
	
	
	
	return {
		defaults: defaults,
		NnMines: NnMines
	};
	
});
