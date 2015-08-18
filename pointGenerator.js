/*Tool to efficiently find the "kink" points of any function
very useful for income tax charts
by Nick Kasprak, CBPP

Usage:

Create the point generator object:

	var myGenerator = new pointGenerator(myFunction, myIteratorInterval, maxStep);
	
	myFunction = function to find kink points
	myIteratorInterval = basic iterval to recurse over
	maxStep = largest allowed interval - patterns smaller than this that recur with a frequency
	that is a multiple of the interator may be lost
	
	For example, using 7 for the iterator interval and 1000 for max step means that the largest
	and starting interval will be 343 (7^3) as 2401 (7^4) is too large

Get the kink points of the function within a range:

	var theKinkPoints = myGenerator.outputXPoints(lowEndOfRange, highEndOfRange);

*/

var pointGenerator = function(f, iteratorInterval, maxStep) {
	"use strict";
	this.outputXPoints = function(minX, maxX) {
		var range = maxX - minX, 
			step, 
			power,
			maxPower,
			recurseFind, 
			pointsObj = {}, 
			calcs = {}, 
			pG = this, 
			pointsFound = 0, 
			pointsArr = [],
			point,
			numPasses = 0,
			numCalcs = 0;
		maxPower = Math.floor(Math.log(maxStep)/Math.log(iteratorInterval));
		power = Math.min(Math.floor(Math.log(range)/Math.log(iteratorInterval)),maxPower);
		
		step = Math.pow(iteratorInterval,power);
		range = Math.ceil(range/step) * step;
		recurseFind = function(mn, mx, stp, pw) {
			var x = mn, cont = true, dfdx_low, dfdx_high, ys = [], cVal;
			while (cont) {
				for (cVal = 0;cVal<3;cVal++) {
					if(typeof(calcs[x+cVal*stp]) === "undefined") {
						ys[cVal] = Math.round(f.call(pG,x+cVal*stp)*1000000)/1000000;
						numCalcs++;	
					} else {
						ys[cVal] = calcs[x+cVal*stp];
					}
				}
				numPasses++;
				calcs[x] = ys[0];
				calcs[x+stp] = ys[1];
				calcs[x+2*stp] = ys[2];
				dfdx_low = Math.round((ys[1] - ys[0])*1000000)/1000000;
				dfdx_high = Math.round((ys[2] - ys[1])*1000000)/1000000;
				if (Math.abs(dfdx_high - dfdx_low) > 0.0001) {
					if (stp === 1) {
						pointsObj[x+stp] = ys[1];
						pointsFound++;
					} else {
						recurseFind(x,x+2*stp,stp/iteratorInterval, pw-1);
						x = x+ stp;	
					}
				}
				if (x === minX || x === maxX) {
					pointsObj[x] = ys[0];
				}
				x = x+stp;
				if (x > mx) {
					cont = false;
				}
			}
		};
		while (pointsFound < 1 && power > 0) {
			recurseFind(minX, minX + range, step, power);
			step = step / iteratorInterval;
			power--;
		}
		for (point in pointsObj) {
			if (pointsObj.hasOwnProperty(point)) {
				pointsArr.push([point*1,pointsObj[point]]);
			}
		}
		pointsArr.sort(function(a,b) {
			return a[0] - b[0];
		});
		return pointsArr;
	};
};