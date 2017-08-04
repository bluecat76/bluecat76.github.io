define(['common/mathEx', 'ga/genome'], function (mathEx, Genome) {

	var defaults = {
			crossoverRate: 0.7,
			mutationRate: 0.001,
			maxPerturbation: 0.3
		};

	var PersistentGa = function(options_in)
	{
			var _this = this;
			var _options = $.extend({}, defaults, options_in);
	
			_this.crossover_rate_ = _options.crossoverRate;
			_this.mutation_rate_ = _options.mutationRate;
			_this.max_perturbation_ = _options.maxPerturbation;
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
			
			_this.addGenome = function(genome)
			{
				_this.pool_.push(genome);
			};
		
			_this.equals = function(genome_a, genome_b)
			{
				var index;
				
				for (index = 0; index < genome_a.getLength(); index++)
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
			
			
			_this.mutate = function(chromosome)
			{
				if(Math.random() < _this.mutation_rate)
				{
					// slightly modify the value
					return (chromosome + mathEx.rndClamped() * _this.max_perturbation_);
				}
				return chromosome;
			};
		
		
			_this.mutateGenome = function(genome)
			{
				var dna = genome.getDna();
				var index = 0;
				
				for(index = 0; index < dna.length; index++)
				{
					dna[index] = _this.mutate(dna[index]);
				}
				
				return genome;
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
					_this.addGenome(_this.getMutatedGenome(parent_a));
					_this.addGenome(_this.getMutatedGenome(parent_b));
				
					return;
				}
			
				// make children
				cut_point = mathEx.rndInt(_this.genome_length_);
			
				Array.prototype.push.apply(child_a, parent_a.slice(0, cut_point-1));
				Array.prototype.push.apply(child_a, parent_b.slice(cut_point));
				_this.addGenome(_this.getMutatedGenome(child_a));
			
				Array.prototype.push.apply(child_b, parent_b.slice(0, cut_point-1));
				Array.prototype.push.apply(child_b, parent_a.slice(cut_point));
				_this.addGenome(_this.getMutatedGenome(child_b));
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
					select_index = roulette[mathEx.rndInt(roulette.length)];
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
					select_index = mathEx.rndInt(pool.length);
				}
			
//				return pool[select_index];
				return pool.splice(select_index, 1)[0];
			};
		
			_this.cycle = function()
			{
				// produce the next generation of the population (keep the better half of the pool)
				var pool = _this.getBest(_this.pool_.length >> 1);
				var index;
				var genome;
			
				_this.generations_ += 1;
				
				// add random members to the temporary pool
				for (index = pool.length; index < _this.max_population_; index++)
				{
					genome = new Genome(_this.genome_length_, _this.fitness_func_);
					// randomize genome
					genome.fill(_this.fill_func_);
					
					pool.push(genome);
				}
				
				// fill the pool again by comnination
				for (index = 0; index < pool.length; index += 2)
				{
					_this.combine(_this.selectByPopularity(pool), _this.selectByPopularity(pool));
				}
				
				// reduce population, keeping the fittest
				_this.checkPopulation();
			};
		
	};
	
	return {
		defaults: defaults,
		GeneticAlgorithm : GeneticAlgorithm
	};
	
});
