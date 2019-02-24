const dom = require('sketch/dom');
const ui = require('sketch/ui');
const settings_reader = require('./settings');
const layer_property = require('./layer_property');
const attached_style = require('./attached_style');


function getArtboards(layers) {
	return [...layers.reduce((by_id, layer) => {
		while (layer && (layer.type !== 'Artboard')) {
			layer = layer.parent
		}
		if (layer) {
			by_id.set(layer.id, layer)
		}
		return by_id
	}, new Map()).values()]
}


function selectedOrAllArtboards(doc) {
	let artboards = getArtboards(doc.selectedLayers.layers);
	if (artboards.length === 0) {
		artboards = getArtboards(doc.selectedPage.layers)
	}
	return artboards
}

function makeExportName(artboard, format) {
	return [].concat(
		format.prefix ? format.prefix : [],
		artboard.name,
		format.suffix ? format.suffix : [],
		'.',
		format.fileFormat,
	).join('')
}

function absPath(path) {
	return NSString.stringWithString(path).stringByExpandingTildeInPath()
}

function combinePath(a, b) {
	return NSString.stringWithString(a).stringByAppendingPathComponent(b)
}

function onSilentExport(context) {
	let settings = settings_reader.read(context);
	if (!settings.silent_path) {
		ui.message('silent_path settings not found');
		return
	}
	const doc = dom.getSelectedDocument();
	const artboards = selectedOrAllArtboards(doc);
	const fm = NSFileManager.defaultManager();
	const outputPath = absPath(settings.silent_path);
	const tempPath = combinePath(outputPath, '/~~~');
	artboards.forEach((artboard) => {
		artboard.exportFormats.forEach((format) => {
			try {
				dom.export(artboard, {
					output: tempPath,
					formats: format.fileFormat,
					scales: format.size,
					overwriting: true,
				});
				const errorPtr = MOPointer.alloc().init();
				const files = fm.contentsOfDirectoryAtPath_error_(tempPath, errorPtr);
				if (files && files.count()) {
					const tempFilePath = combinePath(tempPath, files.firstObject());
					const outputFilePath = combinePath(outputPath, makeExportName(artboard, format));
					fm.removeItemAtPath_error_(outputFilePath, null);
					fm.moveItemAtPath_toPath_error_(tempFilePath, outputFilePath, null)
				}
			} catch (error) {
			}
		});
		fm.removeItemAtPath_error_(tempPath, null)
	});
	if (artboards.length < 10) {
		ui.message(artboards.map((x) => x.name).join(', ') + ' exported')
	} else {
		ui.message(`${artboards.length} artboards exported`)
	}
}


function onAttachStyle(context) {
	attached_style.attach(context)
}


function onDetachStyle(context) {
	attached_style.detach(context)
}


function onShowStyles(context) {
	attached_style.show(context)
}


function onApplyStyles(context) {
	attached_style.apply(context)
}


function onPasteBorders(context) {
	layer_property.paste_from_clipboard(context, [layer_property.border])
}


function onPasteFills(context) {
	layer_property.paste_from_clipboard(context, [layer_property.fill])
}


function onPasteShadows(context) {
	layer_property.paste_from_clipboard(context, [layer_property.shadow])
}


function onPasteShapes(context) {
	layer_property.paste_from_clipboard(context, [layer_property.shape])
}


function onCopyStyleAndShapes(context) {
	layer_property.copy_to_clipboard(context)
}
