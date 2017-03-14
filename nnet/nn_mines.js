(function($, window){

	// map parameters
	var MIN_MINE_SIZE = 3;
	var MAX_MINE_SIZE = 5;
	var TANK_SIZE = 18;
	var LOOP_MULTIPLIER = 10;

	// ga paramaters
	var POPULATION = 32;
	var CROSSOVER_RATE = 0.7;
	var MUTATION_RATE = 0.1;
	
	function rndInt(max)
	{
		return parseInt(Math.random() * max);
	}
	
	function rndClamped()
	{
		return (2 * Math.random() - 1);
	}
	
	function rndBit()
	{
		return (Math.random() > 0.5);
	}
	
	function sq(num)
	{
		return (num * num);
	}
	

	function Mine(x, y, size)
	{
		var _this = this;
		_this.x = x;
		_this.y = y;
		_this.size = size;
	}
	
	
	function Pointer(dx, dy)
	{
		var _this = this;
		_this.dx = dx;
		_this.dy = dy;

		_this.getLength = function()
		{
			return Math.sqrt(sq(_this.dx) + sq(_this.dy));
		};

		_this.getAngle = function()
		{
			return Math.atan2(_this.dy, _this.dx);
		};
		
		_this.normalize = function()
		{
			var length = 1 / _this.getLength();
			_this.dx = _this.dx * length;
			_this.dy = _this.dy * length;
		};
		
		_this.rotate = function(rad)
		{
			var ca = Math.cos(rad);
			var sa = Math.sin(rad);
			_this.dx = _this.dx * ca - _this.dy * sa;
			_this.dy = _this.dx * sa + _this.dy * ca;
		};
		
		_this.getDotProduct = function(other)
		{
			return _this.dx * other.dx + _this.dy * other.dy;
		};
		
		_this.getSign = function(other)
		{
			// returns positive if v2 is clockwise of v1, minus if anticlockwise
			if (_this.dy * other.dx > _this.dx * other.dy)
			{ 
				return 1;
			}
			else 
			{
				return -1;
			}
			
		};


		_this.clone = function()
		{
			return new Pointer(_this.dx, _this.dy);
		};
	}
	
	function Tank(x, y)
	{
		var _this = this;
		var dir = new Pointer(rndClamped(), rndClamped());

		_this.x = x;
		_this.y = y;
		_this.direction = dir.clone(); // pointer
		_this.look_at = dir.clone(); // pointer
		_this.size = TANK_SIZE;
	}
	
	
	function Map(width, height)
	{
		var _this = this;
		
		_this.width = width;
		_this.height = height;
		_this.mines = [];
		_this.tanks = [];
		
		_this.clear = function()
		{
			_this.mines = [];
			_this.tanks = [];
		};		
		
		_this.prepare = function(max_mines, max_tanks)
		{
			var index;
			
			_this.clear();
			for (index = 0; index < max_mines; index++)
			{
				_this.addMine();
			}
			
			for (index = 0; index < max_tanks; index++)
			{
				_this.addTank();
			}
		};
		
		_this.addMine = function()
		{
			var free_spot;
			do
			{
				free_spot = _this.tryFindSpot(MIN_MINE_SIZE + rndInt(MAX_MINE_SIZE - MIN_MINE_SIZE));
			}
			while (free_spot === undefined); // try to set until eternity...

			_this.mines.push(new Mine(free_spot.x, free_spot.y, free_spot.size));
		};
		
		_this.addTank = function()
		{
			var free_spot;
			do
			{
				free_spot = _this.tryFindSpot(TANK_SIZE);
			}
			while (free_spot === undefined); // try to set until eternity...
			
			_this.tanks.push(new Tank(free_spot.x, free_spot.y));
		};
		
		_this.tryFindSpot = function(size)
		{
			// make sure, the mine is within the limits
			var red = 2 * size; // reduce double size, so mine is somewhere within limits...
			var x = rndInt(_this.width - red) + size;
			var y = rndInt(_this.height - red) + size;
			var try_mine = new Mine(x, y, size);

			// check overlapping
			if (!_this.overlaps(try_mine))
			{
				return { x: x, y: y, size: size };
			}
			
			// try failed
			return undefined;
		};
		
		_this.overlaps = function(check_object)
		{
			var index;
			var i_mine;
			var i_tank;
			
			for(index = 0; index < _this.mines.length; index++)
			{
				i_mine = _this.mines[index];
				if (_this.sqdist(i_mine, check_object) < sq(i_mine.size + check_object.size))
				{
					return true;
				}
			}
			
			for(index = 0; index < _this.tanks.length; index++)
			{
				i_tank = _this.tanks[index];
				if (_this.sqdist(i_tank, check_object) < sq(i_tank.size + check_object.size))
				{
					return true;
				}
			}
			
			return false;
		};


		_this.inbounds = function(check_object)
		{
			if (check_object.x < check_object.size || check_object.x > _this.width - check_object.size)
				return false;

			if (check_object.y < check_object.size || check_object.y > _this.height - check_object.size)
				return false;
			
			return true;
		};
		
		_this.sqdist = function(obj_a, obj_b)
		{
			return sq(obj_a.x - obj_b.x) + sq(obj_a.y - obj_b.y);
		};
	
	}


	function NnMines(canvas, options_in)
	{
		var _this = this;
		var _options = $.extend({}, $.nnmines.defaults, options_in);
		
		_this.canvas_ = canvas;
		_this.context_ = context = canvas.getContext('2d');
		_this.width = width = canvas.width;
		_this.height = height = canvas.height;
		
		_this.map_ = new Map(width, height);
		
		_this.timer_ = undefined;
		
		_this.reset = function()
		{
			_this.map_.prepare(_options.numMines, _options.numTanks);
			_this.draw();
			_this.setupNn();
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
			context.rotate(tank.direction.getAngle());
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
		
		
		_this.setupNn = function()
		{
			// TODO: setup the NN!
/*
			var ga = _this.ga_ = new $.galib.Ga({
				maxPopulation: POPULATION,
				crossoverRate: CROSSOVER_RATE,
				mutationRate: MUTATION_RATE,
				genomeLength: 3 * GENE_LENGTH,
				fitnessFunction: function(genome) {
						var test_disc = _this.genome2disc(genome);
						var fitness = 0; // should not survive...

						if (_this.map_.inbounds(test_disc) && !_this.map_.overlaps(test_disc))
						{
							// the fitness level is the disc size.
							fitness = test_disc.size;
						}
						
						return fitness;
					}
				});
			
			ga.add(function() { return rndBit(); }, POPULATION);
*/
		};
		
		_this.update = function()
		{
			var index;
			
			for(index = 0; index < LOOP_MULTIPLIER; index++)
			{
				// TODO: update NN
				// _this.nn_.cycle();
			}
			_this.updateObjects();
			_this.draw();
			
			// update info
			// $("#info").text("gen: " + _this.ga_.getGenerations() + "; pop: " + _this.ga_.pool_.length + " / " + POPULATION);
		};
		
		_this.updateObjects = function()
		{
			var angle;
			// TODO: update object info from the NN...
			$.each(_this.map_.tanks, function(i, tank) {
					tank.direction.rotate(0.1);
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
	}
	

	// global default options
	$.nnmines = {
		defaults: {
			numMines: 30,
			numTanks: 10,
			updateInterval: 20
		}
	};


	// main plugin routine
	$.fn.nnmines = function(param)
	{
		return this.each(function(){
				var instance = $.data(this, "nnmines");
				if (!instance) {
					$.data(this, "nnmines", new NnMines(this, param));
				} else {
					instance[param].apply(instance, Array.prototype.slice.call(arguments, 1));
				}
		});
	};
	
}(jQuery, this));
