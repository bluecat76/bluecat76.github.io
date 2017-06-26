define(['common/mathEx', 'nnmines/map'], function (mathEx, Map) {

	var Mine = function(x, y, size)
	{
		var _this = this;
		
    Map.Item.call(_this, x, y, size);
    _this.color = color;
	};
	
	
	var Tank = function(x, y)
	{
		var _this = this;

    Map.Item.call(_this, x, y, TANK_SIZE);

		_this.direction = new Pointer(mathEx.rndClamped(), mathEx.rndClamped());
		_this.look_at = new Pointer(mathEx.rndClamped(), mathEx.rndClamped());
		
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
	
	
	return {
		Mine: Mine,
		Tank: Tank
	};

});	

