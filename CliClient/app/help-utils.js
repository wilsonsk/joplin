require('source-map-support').install();
require('babel-plugin-transform-runtime');

import fs from 'fs-extra';
import { wrap } from 'lib/string-utils.js';
import { Setting } from 'lib/models/setting.js';
import { fileExtension, basename, dirname } from 'lib/path-utils.js';
import { _, setLocale, languageCode } from 'lib/locale.js';

const rootDir = dirname(dirname(__dirname));
const MAX_WIDTH = 78;
const INDENT = '    ';

function renderTwoColumnData(options, baseIndent, width) {
	let output = [];
	const optionColWidth = getOptionColWidth(options);

	for (let i = 0; i < options.length; i++) {
		let option = options[i];
		const flag = option[0];
		const indent = baseIndent + INDENT + ' '.repeat(optionColWidth + 2);
		
		let r = wrap(option[1], indent, width);
		r = r.substr(flag.length + (baseIndent + INDENT).length);
		r = baseIndent + INDENT + flag + r;
		output.push(r);
	}

	return output.join("\n");
}

function renderCommandHelp(cmd, width = null) {
	if (width === null) width = MAX_WIDTH;

	const baseIndent = '';

	let output = [];
	output.push(baseIndent + cmd.usage());
	output.push('');
	output.push(wrap(cmd.description(), baseIndent + INDENT, width));

	const optionString = renderTwoColumnData(cmd.options(), baseIndent, width);

	if (optionString) {
		output.push('');
		output.push(optionString);
	}

	if (cmd.name() === 'config') {
		const renderMetadata = (md) => {
			let desc = [];

			if (md.label) {
				let label = md.label();
				if (label.length && label[label.length - 1] !== '.') label += '.';
				desc.push(label);
			}

			if (md.description) {
				desc.push(md.description());
			}

			desc.push(_('Type: %s.', md.isEnum ? _('Enum') : Setting.typeToString(md.type)));
			if (md.isEnum) desc.push(_('Possible values: %s.', Setting.enumOptionsDoc(md.key, '%s (%s)')));

			let defaultString = null;

			if ('value' in md) {
				if (md.type === Setting.TYPE_STRING) {
					defaultString = md.value ? '"' + md.value + '"' : null;
				} else if (md.type === Setting.TYPE_INT) {
					defaultString = (md.value ? md.value : 0).toString();
				} else if (md.type === Setting.TYPE_BOOL) {
					defaultString = (md.value === true ? 'true' : 'false');
				}
			}
			
			if (defaultString !== null) desc.push(_('Default: %s', defaultString));

			return [md.key, desc.join("\n")];
		};

		output.push('');
		output.push(_('Possible keys/values:'));
		output.push('');

		let keysValues = [];
		const keys = Setting.keys(true, 'cli');
		for (let i = 0; i < keys.length; i++) {
			if (keysValues.length) keysValues.push(['','']);
			const md = Setting.settingMetadata(keys[i]);
			if (!md.label) continue;
			keysValues.push(renderMetadata(md));
		}

		output.push(renderTwoColumnData(keysValues, baseIndent, width));
	}
	
	return output.join("\n");
}

function getOptionColWidth(options) {
	let output = 0;
	for (let j = 0; j < options.length; j++) {
		const option = options[j];
		if (option[0].length > output) output = option[0].length;
	}
	return output;
}

export { renderCommandHelp };