define(function () {
	
	var Genome = function(length, fitness_function)
	{
		var _this = this;
	
		_this.length_ = length;
		_this.dna_ = [];
		_this.apply_fitness_ = fitness_function;
		_this.fitness_ = undefined; // must be applied by outside after fill...
	
		_this.getLength = function()
		{
			return _this.length_;
		};
	
		_this.getDna = function()
		{
			return _this.dna_.slice(0);
		};
	
		_this.setDna = function(dna)
		{
			var index;
			for(index = 0; index < _this.length_; index++)
			{
				_this.dna_[index] = dna[index];
			}
		};
	
		_this.getFitness = function()
		{
			if (_this.fitness_ === undefined)
			{
				// must apply fitness to cache it...
				if(_this.dna_.length == _this.length_ && _this.apply_fitness_)
				{
					_this.fitness_ = _this.apply_fitness_(_this);
				}
			}
		
			return _this.fitness_;
		};
	
		_this.fill = function(fill_func)
		{
			var index;
			var value;
		
			for (index = 0; index < _this.length_; index++)
			{
				value = fill_func ? fill_func() : 0;
				_this.dna_.push(value);
			}
		};
		
	}
	
	return Genome;
});
