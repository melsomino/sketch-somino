const ui = require('sketch/ui');
const layer_property = require('./layer_property');


function get_uid(layer) {
	return layer.objectID().toLowerCase()
}


function parse_applier(s) {
	const property = layer_property.by_name[s.toLowerCase().trim()];
	return property ? {property: property, options: {}} : null
}


function create_attached_style(context, layer) {
	const uid = get_uid(layer);
	if (!uid) {
		return null
	}
	const name_parts = layer.name().split(':');
	if (name_parts.length < 2) {
		return null
	}
	const appliers = name_parts[1].split(' ').map((x) => parse_applier(x)).filter((x) => x);
	return {
		context: context,
		layer: layer,
		uid: get_uid(layer),
		name: name_parts[0].trim(),
		appliers: appliers
	}
}


class Styles {
	constructor(context) {
		this.plugin = 'com.melsomino.sketch.somino';
		this.context = context;
		this.command = context.command;
		this.all = [];
		this.by_uid = {};
		context.document.pages().forEach((page) => {
			if (page.name().toLowerCase() === 'somino') {
				page.artboards().forEach((artboard) => {
					artboard.layers().forEach((layer) => {
						const style = create_attached_style(context, layer);
						if (style) {
							this.all.push(style);
							this.by_uid[style.uid] = style
						}
					})
				})
			}
		})
	}


	get_value(layer, key) {
		const raw_value = this.command.valueForKey_onLayer_forPluginIdentifier('somino.' + key, layer, this.plugin);
		return raw_value !== null ? JSON.parse(raw_value) : null
	}


	set_value(layer, key, value) {
		this.command.setValue_forKey_onLayer_forPluginIdentifier(
			value !== null ? JSON.stringify(value) : null, 'somino.' + key, layer, this.plugin
		)
	}


	get_attached_styles(layer) {
		const uids = this.get_value(layer, 'attachedStyles');
		return Array.isArray(uids) ? uids.map((x) => this.by_uid[x]).filter((x) => x) : []
	}


	set_attached_styles(layer, styles) {
		this.set_value(layer, 'attachedStyles', styles.map((x) => x.uid))
	}


	attach_style(selected) {
		if (selected.length === 0) {
			ui.message('No Elements Selected');
			return
		}
		const answer = ui.getSelectionFromUser('Select Style to Attach', this.all.map((x) => x.name));

		const ok = answer[2];
		if (!ok) {
			return
		}

		const value = answer[1];
		const style = this.all[value];
		let attached_count = 0;
		selected.forEach((layer) => {
			const layer_styles = this.get_attached_styles(layer);
			if (!layer_styles.includes(style)) {
				layer_styles.push(style);
				this.set_attached_styles(layer, layer_styles);
				attached_count += 1;
				this.apply_styles_to_layer(layer_styles, layer)
			}
		});
		if (attached_count === 0) {
			ui.message('Style Already Attached to Selected Element(s)')
		} else {
			ui.message('Style has been Attached to ' + attached_count + ' Element(s)')
		}
	}


	detach_style(selected) {
		if (selected.length === 0) {
			ui.message('No Elements Selected');
			return
		}

		const attached_styles = [];
		selected.forEach((layer) => {
			this.get_attached_styles(layer).forEach((style) => {
				if (!attached_styles.includes(style)) {
					attached_styles.push(style)
				}
			})
		});

		if (attached_styles.length === 0) {
			ui.message("Selected Element(s) has No Attached Styles");
			return
		}

		const answer = ui.getSelectionFromUser('Select Style to Detach', attached_styles.map((x) => x.name));

		const ok = answer[2];
		if (!ok) {
			return
		}

		const value = answer[1];
		const style = attached_styles[value];
		let detached_count = 0;
		selected.forEach((layer) => {
			const layer_styles = this.get_attached_styles(layer);
			const index = layer_styles.indexOf(style);
			if (index >= 0) {
				layer_styles.splice(index, 1);
				this.set_attached_styles(layer, layer_styles);
				detached_count += 1
			}
		});
		ui.message('' + detached_count + ' Style(s) has been Detached')
	}


	show_styles(selected) {
		if (selected.length === 0) {
			ui.message('No Elements Selected');
			return
		}
		const names = [];
		selected.forEach((layer) => {
			this.get_attached_styles(layer).forEach((style) => {
				if (!names.includes(style.name)) {
					names.push(style.name)
				}
			})
		});
		if (names.length > 0) {
			ui.message(names.join(', '))
		} else {
			ui.message('Element(s) has No Styles')
		}
	}


	apply_styles_to_layer(styles, layer) {
		styles.forEach((style) => {
			const value = layer_property.layer_value(style.layer);
			style.appliers.forEach((applier) => {
				applier.property.apply(layer, value, applier.options)
			})
		})
	}


	apply_styles(selected) {
		let processed = 0;
		this.context.document.pages().forEach((page) => {
			page.artboards().forEach((artboard) => {
				artboard.layers().forEach((layer) => {
					const styles = this.get_attached_styles(layer);
					if (styles.length > 0) {
						processed += 1;
						this.apply_styles_to_layer(styles, layer)
					}
				})
			})
		});
		ui.message('Styles applied to ' + processed + ' Element(s)')
	}
}


function attach_style(context) {
	new Styles(context).attach_style(context.document.selectedLayers().layers())
}


function detach_style(context) {
	new Styles(context).detach_style(context.document.selectedLayers().layers())
}


function show_attached_styles(context) {
	new Styles(context).show_styles(context.document.selectedLayers().layers())
}


function apply_attached_styles(context) {
	new Styles(context).apply_styles(context.document.selectedLayers().layers())
}


module.exports = {
	attach: attach_style,
	detach: detach_style,
	show: show_attached_styles,
	apply: apply_attached_styles
};
