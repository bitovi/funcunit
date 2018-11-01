
function assign(d, s) {
	for (var prop in s) {
		var desc = Object.getOwnPropertyDescriptor(d,prop);
		if(!desc || desc.writable !== false){
			d[prop] = s[prop];
		}
	}
	return d;
}

module.exports = assign;
