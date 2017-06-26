define(['common/mathEx'], function (mathEx) {

	var MAX_ROTATION_CHANGE = 0.03;


	var MapItem = function(x, y, size)
	{
		var _this = this;
		_this.x = x;
		_this.y = y;
		_this.size = size;
	};
	
/*
	var Position = function(x, y)
	{
		var _this = this;
		_this.x = x;
		_this.y = y;
		
		_this.translate = function(pointer)
		{
			_this.x += pointer.dx;
			_this.y += pointer.dy;
		};
	};
*/

	var Pointer = function(dx, dy)
	{
		var _this = this;
		_this.dx = dx;
		_this.dy = dy;

		_this.getLength = function()
		{
			return Math.sqrt(mathEx.sq(_this.dx) + mathEx.sq(_this.dy));
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
	};


	var Mine = function(x, y, size)
	{
		var _this = this;
		
    MapItem.call(_this, x, y, size);
    // _this.color = color;
	};
	
	
	var Tank = function(x, y, size)
	{
		var _this = this;

    MapItem.call(_this, x, y, size);

		_this.direction = new Pointer(mathEx.rndClamped(), mathEx.rndClamped());
		_this.look_at = new Pointer(mathEx.rndClamped(), mathEx.rndClamped());
		_this.leftTrack = mathEx.rndClamped();
		_this.rightTrack = mathEx.rndClamped();
		_this.minesCollected = 0;
		
		_this.getSpeed = function() {
				return _this.leftTrack + _this.rightTrack;
			};
		
		_this.getRotationChange = function () {
				var rotForce = _this.leftTrack - _this.rightTrack;
				return mathEx.clamp(rotForce, -MAX_ROTATION_CHANGE, MAX_ROTATION_CHANGE);
			};
			
		_this.move = function (map) {
				var speed = _this.getSpeed() * 6;
				var mines_collected;
				
				// move
				_this.x += _this.direction.dx * speed;
				_this.y += _this.direction.dy * speed;
				
				// check bounds (wrap around)
				if (_this.x < 0)
				{
					_this.x += map.width;
				}
				else if (_this.x > map.width)
				{
					_this.x -= map.width;
				}
				if (_this.y < 0)
				{
					_this.y += map.height;
				}
				else if (_this.y > map.height)
				{
					_this.y -= map.height;
				}
				
				// rotate
				_this.direction.rotate(_this.getRotationChange());
				
				// check with other map objects!
				mines_collected = map.collectMines(_this);
				for(index = 0; index < mines_collected.length; index++)
				{
					console.log("mine collected", _this, mines_collected[index]);
					_this.minesCollected += mines_collected[index].size;
				}
			};
			
		
/*
		_this.nn_ = new Nn.NeuralNet({
					numInputs: 4,
					numOutputs: 2,
					numHiddenLayers: 1,
					numNeuronsPerLayer: 6,
					activationFunction: mathEx.fncSigmoid
				});
*/
	};
	
	
	var defaults = {
			minMineSize: 3,
			maxMineSize: 5,
			tankSize: 18
	};
	
	
	var Map = function(width, height, options_in)
	{
		var _this = this;
		
		var _options = $.extend({}, defaults, options_in);

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
				free_spot = _this.tryFindSpot(_options.minMineSize + mathEx.rndInt(_options.maxMineSize - _options.minMineSize));
			}
			while (free_spot === undefined); // try to set until eternity...

			_this.mines.push(new Mine(free_spot.x, free_spot.y, free_spot.size));
		};
		
		_this.addTank = function()
		{
			var free_spot;
			do
			{
				free_spot = _this.tryFindSpot(_options.tankSize);
			}
			while (free_spot === undefined); // try to set until eternity...
			
			_this.tanks.push(new Tank(free_spot.x, free_spot.y, free_spot.size));
		};
		
		_this.tryFindSpot = function(size)
		{
			// make sure, the mine is within the limits
			var red = 2 * size; // reduce double size, so mine is somewhere within limits...
			var x = mathEx.rndInt(_this.width - red) + size;
			var y = mathEx.rndInt(_this.height - red) + size;
			var try_mine = new Mine(x, y, size);

			// check overlapping
			if (!_this.overlaps(try_mine))
			{
				return { x: x, y: y, size: size };
			}
			
			// try failed
			return undefined;
		};
		
		_this.collectMines = function(check_object)
		{
			var result = [];
			var index;
			var i_mine;
			var remove_idx = [];
			
			for(index = 0; index < _this.mines.length; index++)
			{
				i_mine = _this.mines[index];
				if (_this.sqdist(i_mine, check_object) < mathEx.sq(i_mine.size + check_object.size))
				{
					// collect indexes of mines to remove
					remove_idx.push(index);
				}
			}
			
			if (remove_idx.length)
			{
				// remove objects from the map (back to front)
				for(index = remove_idx.length-1; index >= 0; index--)
				{
					result.push(_this.mines.splice(remove_idx[index], 1));
				}
			}
			
			return result;
		};
		
		_this.overlaps = function(check_object)
		{
			var index;
			var i_mine;
			var i_tank;
			
			for(index = 0; index < _this.mines.length; index++)
			{
				i_mine = _this.mines[index];
				if (_this.sqdist(i_mine, check_object) < mathEx.sq(i_mine.size + check_object.size))
				{
					return true;
				}
			}
			
			for(index = 0; index < _this.tanks.length; index++)
			{
				i_tank = _this.tanks[index];
				if (_this.sqdist(i_tank, check_object) < mathEx.sq(i_tank.size + check_object.size))
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
			return mathEx.sq(obj_a.x - obj_b.x) + mathEx.sq(obj_a.y - obj_b.y);
		};
	
	};
	
	
	
	
	return {
		Item: MapItem,
		Map: Map
	};

});	

