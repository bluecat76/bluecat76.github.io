define(['common/mathEx', 'ga/ga', 'ga/genome', 'gadiscs/disc', 'gadiscs/map'], function (mathEx, Ga, Genome, Disc, Map) {

	var LOOP_MULTIPLIER = 10;
	var MAX_POPULATION = 32;
	var CROSSOVER_RATE = 0.8;
	var MUTATION_RATE = 0.05;
	
	var GENE_LENGTH = 10;

/*
#define NUM_ELITE         4
#define NUM_COPIES_ELITE  1
*/

	var defaults = {
			numDiscs: 50,
			staticColor: '#003300',
			staticFill: '#00FF00',
			updateInterval: 20
		};

	var GaDiscs = function(canvas_in, options_in)
	{
		var _this = this;
		var _options = $.extend({}, defaults, options_in);
		
		var canvas = _this.canvas_ = canvas_in;
		var context = _this.context_ = canvas.getContext('2d');
		var width = _this.width = canvas.width;
		var height = _this.height = canvas.height;
		
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
			var fx = mathEx.bin2fact(dna.slice(0, GENE_LENGTH-1));
			var fy = mathEx.bin2fact(dna.slice(GENE_LENGTH, 2*GENE_LENGTH-1));
			var fsize = mathEx.bin2fact(dna.slice(2*GENE_LENGTH, 3*GENE_LENGTH-1));
			var x = parseInt(fx * _this.width);
			var y = parseInt(fy * _this.height);
			var size = parseInt(fsize * _this.height);
			
			return new Disc(x, y, size);
		};
	
	
		_this.setupGa = function()
		{
			var genome_fill_func = function() { return mathEx.rndBit(); };
			var ga = _this.ga_ = new Ga.GeneticAlgorithm({
				maxPopulation: MAX_POPULATION,
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
					},
				fillFunc: genome_fill_func
			});
			
			ga.add(MAX_POPULATION);
		};
		
		_this.update = function()
		{
			var index;
			
			for(index = 0; index < LOOP_MULTIPLIER; index++)
			{
				_this.ga_.cycle();
			}
			_this.draw();
			_this.drawGa();
			
			$("#info").text("gen: " + _this.ga_.getGenerations() + "; pop: " + _this.ga_.pool_.length + " / " + MAX_POPULATION);
		};
		
		_this.drawGa = function()
		{
			var disc;
			var best_genome;
			
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
			best_genome = _this.ga_.getBest(1)[0];
			if (best_genome)
			{
				disc = _this.genome2disc(best_genome);
				_this.drawDisc(disc, 'rgba(0,0,255,0.4)', 'rgba(0,0,0,255,0.05)');
			}
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
		GaDiscs: GaDiscs
	};

});
