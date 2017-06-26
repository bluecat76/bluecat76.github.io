define(['common/mathEx', 'gadiscs/disc'], function (mathEx, Disc) {

	var Map = function(width, height)
	{
		var _this = this;
		
		_this.width = width;
		_this.height = height;
		_this.discs = [];
		
		_this.clear = function()
		{
			_this.discs = [];
		};		
		
		_this.prepare = function(max_discs)
		{
			var index;
			
			_this.clear();
			for (index = 0; index < max_discs; index++)
			{
				while (!_this.tryAddDisc(10 + mathEx.rndInt(width * 0.05)))
					; // try to set until eternity...
			}
			
		};
		
		_this.tryAddDisc = function(size)
		{
			// make sure, the disc is within the limits
			var red = 2 * size; // reduce double size, so disc is somewhere within limits...
			var x = mathEx.rndInt(_this.width - red) + size;
			var y = mathEx.rndInt(_this.height - red) + size;
			var try_disc = new Disc(x, y, size);

			// check overlapping
			if (!_this.overlaps(try_disc))
			{
				_this.add(try_disc);
				return true;
			}
			
			// try failed
			return false;
		};
		
		_this.add = function(disc)
		{
			_this.discs.push(disc);
		};
	
		_this.overlaps = function(check_disc)
		{
			var index;
			var i_disc;
			
			for(index = 0; index < _this.discs.length; index++)
			{
				i_disc = _this.discs[index];
				if (_this.sqdist(i_disc, check_disc) < mathEx.sq(i_disc.size + check_disc.size))
				{
					return true;
				}
			}
			
			return false;
		};


		_this.inbounds = function(check_disc)
		{
			if (check_disc.x < check_disc.size || check_disc.x > _this.width - check_disc.size)
				return false;

			if (check_disc.y < check_disc.size || check_disc.y > _this.height - check_disc.size)
				return false;
			
			return true;
		};
		
		_this.sqdist = function(disc_a, disc_b)
		{
			return mathEx.sq(disc_a.x - disc_b.x) + mathEx.sq(disc_a.y - disc_b.y);
		};
	
	};

	return Map;
});
