$(document).ready(function() {

	function rndInt(max)
	{
		return parseInt(Math.random() * max);
	}
	
	function rndClamped()
	{
		return (2 * Math.random() - 1);
	}
	
	function Genome(length, fitness_function)
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
	
		_this.getGene = function(index)
		{
			return _this.dna_[index];
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



	$.galib = {
		defaults: {
			genomeLength: 20,
			maxPopulation: 32,
			crossoverRate: 0.7,
			mutationRate: 0.001,
			maxPerturbation: 0.3,
			fitnessFunction: function(genome) { return 0; } // should return float between 0..1
		},
	
		Ga: function(options_in)
		{
			var _this = this;
			var _options = $.extend({}, $.galib.defaults, options_in);
	
			_this.genome_length_ = _options.genomeLength;
			_this.max_population_ = _options.maxPopulation;
			_this.crossover_rate_ = _options.crossoverRate;
			_this.mutation_rate_ = _options.mutationRate;
			_this.max_perturbation_ = _options.maxPerturbation;
			_this.fitness_func_ = _options.fitnessFunction;
			_this.generations_ = 0;
		
			_this.pool_ = [];
		
			_this.getPopulation = function()
			{
				return _this.pool_.slice(0);
			};
		
			_this.getGenerations = function()
			{
				return _this.generations_;
			};
		
			_this.checkPopulation = function()
			{
				var pool = _this.pool_;
				var least_fittest;
				var remove_index;
				var fn_check = function(pool_index, i_genome) {
						if (i_genome.getFitness() < least_fittest.getFitness())
						{
							least_fittest = pool[pool_index];
							remove_index = pool_index;
						}
					};
		
				// survival of the fittest...
				while(pool.length > _this.max_population_)
				{
					remove_index = pool.length - 1; // the last one if all are equally fit
					least_fittest = pool[remove_index];

					$.each(pool, fn_check);

					pool.splice(remove_index, 1);
				}
			};
		
			_this.equals = function(genome_a, genome_b)
			{
				var index;
			
				for (index = 0; index < _this.genome_length_; index++)
				{
					if(genome_a.getGene(index) != genome_b.getGene(index))
					{
						return false;
					}
				}
			
				return true;
			};
		
			_this.contains = function(genome)
			{
				var index;
			
				for (index = 0; index < _this.pool_.length; index ++)
				{
					if (_this.equals(genome, _this.pool_[index]))
					{
						return true;
					}
				}
			
				return false;
			};
		
		
			_this.getBest = function(max)
			{
				// sort pool
				_this.pool_.sort(function (genome_a, genome_b) { return genome_b.getFitness() - genome_a.getFitness(); });
			
				return _this.pool_.slice(0, max);
			};
		
			_this.add = function(fill_func, optional_num)
			{
				var num = optional_num || 1;
				var genome;
			
				while (num--)
				{
					genome = new Genome(_this.genome_length_, _this.fitness_func_);
					genome.fill(fill_func);
				
					if (!_this.contains(genome))
					{
						_this.pool_.push(genome);
					}
				}
			};
		
			_this.mutate = function(chromosome)
			{
				if(Math.random() < _this.mutation_rate)
				{
					// slightly modify the value
					return (chromosome + rndClamped() * _this.max_perturbation_);
				}
				return chromosome;
			};
		
			_this.addGenome = function(dna)
			{
				var index = 0;
			
				_this.add(function() { return _this.mutate(dna[index++]); });
			};
		
			_this.combine = function(genome_a, genome_b)
			{
				// create a new genome out of the two parents
				var parent_a = genome_a.getDna();
				var parent_b = genome_b.getDna();
				var child_a = [];
				var child_b = [];
				var cut_point;
			
				if (Math.random() > _this.crossover_rate_)
				{
					// return (possibly mutated) parents
					_this.addGenome(parent_a);
					_this.addGenome(parent_b);
				
					return;
				}
			
				// make children
				cut_point = rndInt(_this.genome_length_);
			
				Array.prototype.push.apply(child_a, parent_a.slice(0, cut_point-1));
				Array.prototype.push.apply(child_a, parent_b.slice(cut_point));
				_this.addGenome(child_a);
			
				Array.prototype.push.apply(child_b, parent_b.slice(0, cut_point-1));
				Array.prototype.push.apply(child_b, parent_a.slice(cut_point));
				_this.addGenome(child_b);
			};
		
			_this.selectByPopularity = function(pool)
			{
				var total_fitness = 0;
				var roulette = [];
				var slots_available = 100;
				var sum_probabilities = 0;
				var mul_factor;
				var select_index = -1;
			
				// determine maximum fitness
				$.each(pool, function(pool_index, i_genome) {
						total_fitness += i_genome.getFitness();
					});
			
				if (total_fitness > 0.001)
				{
					// fill the roulette wheel
					mul_factor = slots_available / total_fitness;
					$.each(pool, function(pool_index, i_genome) {
							for (index = 0; index < Math.max(i_genome.getFitness() * mul_factor, 1); index++)
							{
								roulette.push(pool_index);
							}
						});
			
					// select one by random
					select_index = roulette[rndInt(roulette.length)];
/*
					$.each(pool, function(pool_index, i_genome) {
							sum_probabilities += i_genome.getFitness();
						
							if (Math.random() <= i_genome.getFitness() / total_fitness)
							{
								select_index = pool_index;
								return false;
							}
						});
*/
				}
			
				if (select_index < 0)
				{
					select_index = rndInt(pool.length);
				}
			
//				return pool[select_index];
				return pool.splice(select_index, 1)[0];
			};
		
			_this.cycle = function()
			{
				// produce the next generation of the population
				var pool = _this.getBest(_this.pool_.length >> 1);
				var index;
				var genome;
			
				_this.generations_ += 1;
			
				// add random members
				for (index = pool.length; index < _this.max_population_; index++)
				{
					genome = new Genome(_this.genome_length_, _this.fitness_func_);
					// randomize genome
					genome.fill(rndClamped);
					
					pool.push(genome);
				}
			
				for (index = 0; index < pool.length; index += 2)
				{
					_this.combine(_this.selectByPopularity(pool), _this.selectByPopularity(pool));
				}

				_this.checkPopulation();
			};
		
		}

	};
	
});
