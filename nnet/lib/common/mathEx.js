define(function() {

	var mathEx = (function() {

		var rndInt = function(max)
		{
			return parseInt(Math.random() * max);
		};
		
		var rndClamped = function()
		{
			return (2 * Math.random() - 1);
		};
	
		var rndBit = function()
		{
			return (Math.random() > 0.5);
		};
		
	
		var sq = function(num)
		{
			return (num * num);
		};
		
		
		
		var bit2int = function(bit)
		{
			return bit ? 1 : 0;
		};
	
		var bin2fact = function(bits)
		{
			var index;
			var value = 0;
			var max = 1;
		
			for(index = 0; index < bits.length; index++)
			{
				
				value = (value << 1) + bit2int(bits[index]);
				max <<= 1;
			}
			
			return value / max;
		};
	
	
		var clamp = function(num, min, max)
		{
			// ensure, that num is between min and max
			if (num < min)
			{
				return min;
			}
			if (num > max)
			{
				return max;
			}
			return num;
		};
	

		var fncSigmoid = function(input, response)
		{
			return (1 / (1 + Math.exp(-input / response)));
		};
		
		
		return {
			rndInt : rndInt,
			rndClamped : rndClamped,
			rndBit : rndBit,
			
			sq : sq,
			
			bit2int : bit2int,
			bin2fact: bin2fact,
			
			clamp: clamp,
			
			fncSigmoid : fncSigmoid
		};
		
	})();
	
	return mathEx;
});