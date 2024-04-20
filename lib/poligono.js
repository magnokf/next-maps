/**
 * Verifica se um ponto está contido dentro da área de um Polígono
 * @param {number[]} ponto 
 * @param {number[][]} polyPoints 
 * @returns {boolean}
 */
export function pontoNoPoligono(ponto, polyPoints){
	const x = ponto[0], y = ponto[1];
	let intersections = 0;
	let ss = '';
	for (let i = 0, j = polyPoints.length - 1;i < polyPoints.length;j = i++){
		let xi = polyPoints[i][0], yi = polyPoints[i][1]; let xj = polyPoints[j][0], yj = polyPoints[j][1];
		if (yj == yi && yj == y && x > Math.min(xj, xi) && x < Math.max(xj, xi)) { // Check if point is on an horizontal polygon boundary
			return true;
		}
		if (y > Math.min(yj, yi) && y <= Math.max(yj, yi) && x <= Math.max(xj, xi) && yj != yi) {
			ss = (y - yj) * (xi - xj) / (yi - yj) + xj;
			if (ss == x) { // Check if point is on the polygon boundary (other than horizontal)
				return true;
			}
			if (xj == xi || x <= ss) {
				intersections++;
			}
		}
	}
	// If the number of edges we passed through is odd, then it’s in the polygon.
	return intersections % 2 != 0;
}