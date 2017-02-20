(function($, window){

	var LOOP_MULTIPLIER = 10;
	var POPULATION = 32;
	var CROSSOVER_RATE = 0.8;
	var MUTATION_RATE = 0.05;
	
	var GENE_LENGTH = 10;

/*
#define NUM_ELITE         4
#define NUM_COPIES_ELITE  1
*/

	function rndInt(max)
	{
		return parseInt(Math.random() * max);
	}
	
	function rndBit()
	{
		return (Math.random() > 0.5);
	}
	
	function sq(num)
	{
		return (num * num);
	}
	
	function bin2fact(bits)
	{
		var index;
		var value = 0;
		var max = 1;
		
		for(index = 0; index < bits.length; index++)
		{
			value = (value << 1) + parseInt(bits[index]);
			max <<= 1;
		}
		
		return value / max;
	}
	

	function Disc(x, y, size)
	{
		this.x = x;
		this.y = y;
		this.size = size;
	}
	
	
	function Map(width, height)
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
				while (!_this.tryAddDisc(10 + rndInt(width * 0.05)))
					; // try to set until eternity...
			}
			
		};
		
		_this.tryAddDisc = function(size)
		{
			// make sure, the disc is within the limits
			var red = 2 * size; // reduce double size, so disc is somewhere within limits...
			var x = rndInt(_this.width - red) + size;
			var y = rndInt(_this.height - red) + size;
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
				if (_this.sqdist(i_disc, check_disc) < sq(i_disc.size + check_disc.size))
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
			return sq(disc_a.x - disc_b.x) + sq(disc_a.y - disc_b.y);
		};
	
	}


	function GaDiscs(canvas, options_in)
	{
		var _this = this;
		var _options = $.extend({}, $.gadiscs.defaults, options_in);
		
		_this.canvas_ = canvas;
		_this.context_ = context = canvas.getContext('2d');
		_this.width = width = canvas.width;
		_this.height = height = canvas.height;
		
		_this.map_ = new Map(width, height);
		
		_this.timer_ = undefined;
		
		_this.reset = function()
		{
			_this.map_.prepare(_options.numDiscs);
			_this.draw();
			_this.setupGa();
		};
		
		_this.draw = function()
		{
			context.clearRect(0, 0, canvas.width, canvas.height);

			$.each(_this.map_.discs, function(index, i_disc) {
					_this.drawDisc(i_disc, _options.staticColor, _options.staticFill);
				});
		};
		
		_this.drawDisc = function(disc, color, fill)
		{
      context.beginPath();
      context.arc(disc.x, disc.y, disc.size, 0, 2 * Math.PI, false);
      context.fillStyle = fill;
      context.fill();
      context.lineWidth = 2;
      context.strokeStyle = color;
      context.stroke();
		};
		
		
		_this.genome2disc = function(genome)
		{
			var dna = genome.getDna();
			var fx = bin2fact(dna.slice(0, GENE_LENGTH-1));
			var fy = bin2fact(dna.slice(GENE_LENGTH, 2*GENE_LENGTH-1));
			var fsize = bin2fact(dna.slice(2*GENE_LENGTH, 3*GENE_LENGTH-1));
			var x = parseInt(fx * _this.width);
			var y = parseInt(fy * _this.height);
			var size = parseInt(fsize * _this.height);
		
			return new Disc(x, y, size);
		};
	
	
		_this.setupGa = function()
		{
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
		};
		
		_this.update = function()
		{
			var index;
			
//			_this.ga_.add(function() { return rndBit(); });

			for(index = 0; index < LOOP_MULTIPLIER; index++)
			{
				_this.ga_.cycle();
			}
			_this.draw();
			_this.drawGa();
			
			$("#info").text("gen: " + _this.ga_.getGenerations() + "; pop: " + _this.ga_.pool_.length + " / " + POPULATION);
		};
		
		_this.drawGa = function()
		{
			var disc;
			$.each(_this.ga_.getPopulation(), function(index, i_genome) {
					var fitness = i_genome.getFitness();
					disc = _this.genome2disc(i_genome);
					
					if (fitness > 0)
					{
						_this.drawDisc(disc, 'rgba(255,0,0,0.4)', 'rgba(255,0,0,0.2)');
					}
					else
					{
						_this.drawDisc(disc, 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.05)');
					}
				});
				
			// draw the best in blue
			disc = _this.genome2disc(_this.ga_.getBest(1)[0]);
			_this.drawDisc(disc, 'rgba(0,0,255,0.4)', 'rgba(0,0,0,255,0.05)');
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
	$.gadiscs = {
		defaults: {
			numDiscs: 50,
			staticColor: '#003300',
			staticFill: '#00FF00',
			updateInterval: 20
		}
	};


	// main plugin routine
	$.fn.gadiscs = function(param)
	{
		return this.each(function(){
				var instance = $.data(this, "gadiscs");
				if (!instance) {
					$.data(this, "gadiscs", new GaDiscs(this, param));
				} else {
					instance[param].apply(instance, Array.prototype.slice.call(arguments, 1));
				}
		});
	};
	
}(jQuery, this));
