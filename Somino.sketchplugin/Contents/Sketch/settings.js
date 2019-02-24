
function parse(string, settings) {
	string.split('\n').forEach((line) => {
		let pos = line.indexOf('=');
		if (pos >= 0) {
			settings[line.substr(0, pos)] = line.substr(pos + 1)
		}
		console.log(pos)
	})
}

function read(context) {
	let settings = {};
	context.document.pages().forEach((page) => {
		if (page.name().toLowerCase() === 'somino') {
			page.artboards().forEach((artboard) => {
				artboard.layers().forEach((layer) => {
					if (layer.name().toLowerCase() === "settings") {
						parse(layer.attributedString().string(), settings)
					}
				})
			})
		}
	});
	return settings
}



module.exports = {
	read: read
};
