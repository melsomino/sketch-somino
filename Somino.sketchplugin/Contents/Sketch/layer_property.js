const ui = require('sketch/ui');


function items_value(items, get_item) {
	const values = [];
	items.forEach((item) => values.push(get_item(item)));
	return values
}


function create_items(value, create_item) {
	const items = [];
	value.forEach((item_value) => items.push(create_item(item_value)));
	return items
}


function color_value(color) {
	return (Math.round(color.red() * 0xFF) & 0xFF) * 0x1000000 +
		(Math.round(color.green() * 0xFF) & 0xFF) * 0x10000 +
		(Math.round(color.blue() * 0xFF) & 0xFF) * 0x100 +
		(Math.round(color.alpha() * 0xFF) & 0xFF)
}


function create_color(value) {
	const color = MSColor.new();
	color.setRed(((value >> 24) & 0xFF) / 0xFF);
	color.setGreen(((value >> 16) & 0xFF) / 0xFF);
	color.setBlue(((value >> 8) & 0xFF) / 0xFF);
	color.setAlpha((value & 0xFF) / 0xFF);
	return color
}


function point_value(point) {
	return {x: point.x.floatValue(), y: point.y.floatValue()}
}


function create_point(value) {
	return {x: value.x, y: value.y}
}


function gradient_stop_value(stop) {
	return {
		position: stop.position(),
		color: color_value(stop.color())
	}
}


function create_gradient_stop(value) {
	stop = MSGradientStop.new();
	stop.setPosition(value.position);
	stop.setColor(create_color(value.color));
	return stop
}


function gradient_value(gradient) {
	return {
		gradientType: gradient.gradientType(),
		elipseLength: gradient.elipseLength(),
		from: point_value(gradient.from()),
		to: point_value(gradient.to()),
		stops: items_value(gradient.stops(), gradient_stop_value)
	}
}


function create_gradient(value) {
	const gradient = MSGradient.new();
	gradient.setGradientType(value.gradientType);
	gradient.setElipseLength(value.elipseLength);
	gradient.setFrom(create_point(value.from));
	gradient.setTo(create_point(value.to));
	gradient.setStops(create_items(value.stops, create_gradient_stop));
	return gradient
}


function context_settings_value(contextSettings) {
	return {
		opacity: contextSettings.opacity(),
		blendMode: contextSettings.blendMode()
	}
}


function create_context_settings(value) {
	const settings = MSGraphicsContextSettings.new();
	settings.setOpacity(value.opeacity);
	settings.setBlendMode(value.blendMode);
	return settings
}


function merge_base(source, value) {
	value.isEnabled = source.isEnabled();
	value.contextSettings = context_settings_value(source.contextSettings());
	value.color = color_value(source.color());
	return value
}


function apply_base(target, value) {
	target.setIsEnabled(value.isEnabled);
	target.setContextSettings(create_context_settings(value.contextSettings));
	target.setColor(create_color(value.color))
}


function ensure_style_value(value) {
	if (!value.style) {
		value.style = {}
	}
	return value.style
}


function border_value(border) {
	return merge_base(border, {
		fillType: border.fillType(),
		position: border.position(),
		thickness: border.thickness(),
		gradient: gradient_value(border.gradient())
	})
}


function create_border(value) {
	const border = MSStyleBorder.new();
	apply_base(border, value);
	border.setFillType(value.fillType);
	border.setPosition(value.position);
	border.setThickness(value.thickness);
	border.setGradient(create_gradient(value.gradient));
	return border
}


function border_options_value(options) {
	const dashPattern = [];
	options.dashPattern().forEach((x) => dashPattern.push(x));
	return {
		lineJoinStyle: options.lineJoinStyle(),
		lineCapStyle: options.lineCapStyle(),
		dashPattern: dashPattern
	}
}


function create_border_options(value) {
	const border_options = MSStyleBorderOptions.new();
	border_options.setLineJoinStyle(value.lineJoinStyle);
	border_options.setLineCapStyle(value.lineCapStyle);
	border_options.setDashPattern(value.dashPattern);
	return border_options
}


// Border


function merge_border(layer, value) {
	const style = layer.style();
	const style_value = ensure_style_value(value);
	style_value.borders = items_value(style.borders(), border_value);
	style_value.borderOptions = border_options_value(style.borderOptions());
	return value
}


function apply_border(layer, value, options) {
	const style = layer.style();
	style.setBorderOptions(create_border_options(value.style.borderOptions));
	style.setBorders(create_items(value.style.borders, create_border))
}


const border_property = {
	names: ['border', 'br'],
	merge_value: merge_border,
	apply: apply_border
};


// Fill


function fill_value(fill) {
	return merge_base(fill, {
		fillType: fill.fillType(),
		gradient: gradient_value(fill.gradient())
	})
}


function create_fill(value) {
	const fill = MSStyleFill.new();
	apply_base(fill, value);
	fill.setFillType(value.fillType);
	fill.setGradient(create_gradient(value.gradient));
	return fill
}


function merge_fill(layer, value) {
	const style = layer.style();
	const style_value = ensure_style_value(value);
	style_value.fills = items_value(style.fills(), fill_value);
	return value
}


function apply_fill(layer, value, options) {
	layer.style().setFills(create_items(value.style.fills, create_fill))
}


const fill_property = {
	names: ['fill', 'fl'],
	merge_value: merge_fill,
	apply: apply_fill
};


// Shadow


function shadow_value(shadow) {
	return merge_base(shadow, {
		spread: shadow.spread(),
		offsetY: shadow.offsetY(),
		offsetX: shadow.offsetX(),
		blurRadius: shadow.blurRadius()
	})
}


function create_shadow(value) {
	const shadow = MSStyleShadow.new();
	apply_base(shadow, value);
	shadow.setSpread(value.spread);
	shadow.setOffsetX(value.offsetX);
	shadow.setOffsetY(value.offsetY);
	shadow.setBlurRadius(value.blurRadius);
	return shadow
}


function merge_shadow(layer, value) {
	const style = layer.style();
	ensure_style_value(value).shadows = items_value(style.shadows(), shadow_value);
	return value
}


function apply_shadow(layer, value, options) {
	layer.style().setShadows(create_items(value.style.shadows, create_shadow))
}


const shadow_property = {
	names: ['shadow', 'sh'],
	merge_value: merge_shadow,
	apply: apply_shadow
};


// Shape


function curve_point_value(point) {
	return {
		hasCurveFrom: point.hasCurveFrom(),
		curveMode: point.curveMode(),
		curveFrom: point_value(point.curveFrom()),
		cornerRadius: point.cornerRadius(),
		curveTo: point_value(point.curveTo()),
		hasCurveTo: point.hasCurveTo(),
		point: point_value(point.point())
	}
}


function shape_value(shape) {
	return items_value(shape.points(), curve_point_value)
}


function is_shape(layer) {
	const layer_class = layer.class();
	return layer_class === MSRectangleShape || layer_class === MSShapePathLayer
}


function first_shape(layer) {
	return is_shape(layer) ? layer : (layer.layers().find((x) => is_shape(x)))
}


function merge_shape(layer, value) {
	const shape = first_shape(layer);
	if (shape) {
		value.shape = {
			points: shape_value(shape)
		}
	}
	return value
}


function create_curve_point(value) {
	const point = MSCurvePoint.new();
	point.setHasCurveFrom(value.hasCurveFrom);
	point.setCurveMode(value.curveMode);
	point.setCurveFrom(create_point(value.curveFrom));
	point.setCornerRadius(value.cornerRadius);
	point.setCurveTo(create_point(value.curveTo));
	point.setHasCurveTo(value.hasCurveTo);
	point.setPoint(create_point(value.point));
	return point
}


function apply_shape(layer, value, options) {
	const shape_value = value.shape;
	if (!shape_value) {
		return
	}
	const shape = first_shape(layer);
	if (!shape) {
		return
	}
	shape.setPoints(create_items(shape_value.points, create_curve_point))
}


const shape_property = {
	names: ['shape'],
	merge_value: merge_shape,
	apply: apply_shape
};


const all_properties = [
	border_property,
	fill_property,
	shadow_property,
	shape_property
];


const properties_by_name = {};


all_properties.forEach((property) => {
	property.name = property.names[0];
	property.names.forEach((name) => properties_by_name[name] = property)
});


function merge_properties(layer, value) {
	all_properties.forEach((property) => {
		value = property.merge_value(layer, value)
	});
	return value
}


function layer_value(layer) {
	return merge_properties(layer, {
		somino_version: 1
	})
}


// Exports


function copy_to_clipboard(context) {
	const layer = context.document.selectedLayers().layers()[0];
	const values = merge_properties(layer, {
		somino_version: 1
	});
	const pasteboard = NSPasteboard.generalPasteboard();
	pasteboard.clearContents();
	pasteboard.setString_forType(JSON.stringify(values), NSPasteboardTypeString)
}


function paste_from_clipboard(context, properties) {
	const pasteboard = NSPasteboard.generalPasteboard();
	const json_string = pasteboard.stringForType(NSPasteboardTypeString);
	const value = JSON.parse(json_string);
	if (value.somino_version !== 1) {
		ui.message('Clipboard does not Contains Style Data');
		return
	}
	context.document.selectedLayers().layers().forEach((layer) => {
		properties.forEach((property) => {
			property.apply(layer, value)
		})
	})
}


module.exports = {
	copy_to_clipboard,
	paste_from_clipboard,
	layer_value: layer_value,
	all: all_properties,
	by_name: properties_by_name,
	border: border_property,
	fill: fill_property,
	shadow: shadow_property,
	shape: shape_property
};
