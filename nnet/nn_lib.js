$(document).ready(function() {

	// define constants
	var WEIGHT_BIAS = -1;
	var ACTIVATION_RESPONSE = 1;
	

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
	
	
	function fncSigmoid(input, response)
	{
		return (1 / (1 + Math.exp(-input / response)));
	}
	

	function Neuron(num_inputs)
	{
		var _this = this;
	
		_this.length_ = num_inputs;
		_this.weights_ = [];
	
		_this.getLength = function()
		{
			return _this.length_;
		};
	
		_this.getWeights = function()
		{
			return _this.weights_.slice(0);
		};
	
		_this.setWeights = function(weights)
		{
			_this.weights_ = weights;
		};
	
		_this.getWeight = function(index)
		{
			return _this.weights_[index];
		};
	
		_this.setWeight = function(index, weight)
		{
			_this.weights_[index] = weight;
		};
	
		_this.fill = function(fill_func)
		{
			var index;
			var value;
		
			for (index = 0; index < _this.length_ + 1; index++)
			{
				value = fill_func ? fill_func() : 0;
				_this.weights_.push(value);
			}
		};
		
		_this.randomize = function()
		{
			_this.fill(rndClamped);
		};
	
	}
	
	
	function NeuronLayer(num_neurons, num_inputs)
	{
		var _this = this;
	
		_this.length_ = num_neurons;
		_this.randomize();
	
		_this.getLength = function()
		{
			return _this.length_;
		};
	
		_this.getNeurons = function()
		{
			return _this.neurons_.slice(0);
		};
	
		_this.getNeuron = function(index)
		{
			return _this.neurons_[index];
		};
	
		_this.fill = function(fill_func)
		{
			var index;
			var neuron;
		
			_this.neurons_ = [];
			for (index = 0; index < _this.length_; index++)
			{
				neuron = new Neuron(num_inputs);
				neuron.fill(fill_func);
				_this.neurons_.push(neuron);
			}
		};
		
		_this.randomize = function()
		{
			_this.fill(rndClamped);
		};
	
	}
	
	
	$.nnlib = {
		defaults: {
			numInputs: 4,
			numOutputs: 2,
			numHiddenLayers: 1,
			numNeuronsPerLayer: 6,
			activationFunction: function(input) { return 0; } // should return float between 0..1
		},
	
		NeuralNet: function(options_in)
		{
			var _this = this;
			var _options = $.extend({}, $.nnlib.defaults, options_in);
	
			_this.num_inputs_ = _options.numInputs;
			_this.num_outputs_ = _options.numOutputs;
			_this.num_hidden_layers_ = _options.numHiddenLayers;
			_this.num_neurons_per_layer_ = _options.numNeuronsPerLayer;
			_this.activation_func_ = _options.activationFunction;

			_this.cycles_ = 0;
			_this.layers_ = [];
			
			// create the network
			_this.createNet();
		
			_this.getLayers = function()
			{
				return _this.layers_.slice(0);
			};
		
			_this.getCycles = function()
			{
				return _this.cycles_;
			};
			
			
			_this.createNet = function()
			{
				var index;
				var layer;
				
				if (_this.num_hidden_layers_ > 0)
				{
					for (index = 0; index < _this.num_hidden_layers_; index++)
					{
						layer = new NeuronLayer(_this.num_neurons_per_layer_, _this.num_neurons_per_layer_);
						_this.layers_.push(layer);
					}
				
					_this.layers_.push(new NeuronLayer(_this.num_outputs_, _this.num_neurons_per_layer_));
				}
				else
				{
					_this.layers_.push(new NeuronLayer(_this.num_outputs_, _this.num_inputs_));
				}
			};
			
			
			_this.getWeights = function()
			{
				// retrieve all the weights...
				var weights = [];
				
				// iterate layers
				$.each(_this.layers_, function(i, layer) {
						// iterate neurons
						$.each(layer.getNeurons(), function(j, neuron) {
								// iterate weights
								$.each(neuron.getWeights(), function(k, weight) {
										weights.push(weight);
									});
							});
					});
				
				return weights;
			};
			
			
			_this.setWeights = function(weights)
			{
				// replace all the weights...
				var index = 0;
				
				// iterate layers
				$.each(_this.layers_, function(i, layer) {
						// iterate neurons
						$.each(layer.getNeurons(), function(j, neuron) {
								// iterate weights
								$.each(neuron.getWeights(), function(k, weight) {
										// set weight from input list
										neuron.setWeight(k, weights[index++]);
									});
							});
					});
			};
			
			
			_this.update = function(set_inputs)
			{
				var outputs = [];
				var inputs = set_inputs.slice(0);
				var net_input;
				var num_inputs;
				
				if (all_weights.length != _this.num_inputs_)
				{
					// return an empty vector if number of inputs is incorrect
					console.log("number of inputs is incorrect", all_weights);
					return outputs;
				}
				
				// iterate layers
				$.each(_this.layers_, function(i, layer) {
						if (i>0)
						{
							inputs = outputs;
						}
						
						outputs = [];
						
						// iterate neurons
						$.each(layer.getNeurons(), function(j, neuron) {
								net_input = 0;
								num_inputs = neuron.getLength();
								
								// sum weighted inputs
								for (index = 0; index < num_inputs - 1; ++index)
								{
									net_input += neuron.getWeight(index) * inputs[index];
								}
								
								// add bias (last weight)
								net_input += neuron.getWeight(index) * WEIGHT_BIAS;
								
								outputs.push(_this.activation_function(net_input, ACTIVATION_RESPONSE));
							});
					});
				
				return outputs;
			};

		}

	};
	
});
