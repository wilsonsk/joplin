import { BaseCommand } from './base-command.js';
import { app } from './app.js';
import { _ } from 'lib/locale.js';
import { BaseModel } from 'lib/base-model.js';
import { Folder } from 'lib/models/folder.js';
import { Note } from 'lib/models/note.js';
import { sprintf } from 'sprintf-js';
import { time } from 'lib/time-utils.js';
import { uuid } from 'lib/uuid.js';

class Command extends BaseCommand {

	usage() {
		return 'search <pattern> [notebook]';
	}

	description() {
		return _('Searches for the given <pattern> in all the notes.');
	}

	compatibleUis() {
		return ['gui'];
	}

	async action(args) {
		let pattern = args['pattern'];
		let folderTitle = args['notebook'];

		let folder = null;
		if (folderTitle) {
			folder = await Folder.loadByTitle(folderTitle);
			if (!folder) throw new Error(_('Cannot find "%s".', folderTitle));
		}

		const searchId = uuid.create();

		this.dispatch({
			type: 'SEARCH_ADD',
			search: {
				id: searchId,
				title: pattern,
				query_pattern: pattern,
				query_folder_id: folder ? folder.id : '',
				type_: BaseModel.TYPE_SEARCH,
			},
		});

		this.dispatch({
			type: 'SEARCH_SELECT',
			id: searchId,
		});

		// let fields = Note.previewFields();
		// fields.push('body');
		// const notes = await Note.previews(folder ? folder.id : null, {
		// 	fields: fields,
		// 	anywherePattern: '*' + pattern + '*',
		// });

		// const fragmentLength = 50;

		// let parents = {};

		// for (let i = 0; i < notes.length; i++) {
		// 	const note = notes[i];
		// 	const parent = parents[note.parent_id] ? parents[note.parent_id] : await Folder.load(note.parent_id);
		// 	parents[note.parent_id] = parent;

		// 	const idx = note.body.indexOf(pattern);
		// 	let line = '';
		// 	if (idx >= 0) {
		// 		let fragment = note.body.substr(Math.max(0, idx - fragmentLength / 2), fragmentLength);
		// 		fragment = fragment.replace(/\n/g, ' ');
		// 		line = sprintf('%s: %s / %s: %s', BaseModel.shortId(note.id), parent.title, note.title, fragment);
		// 	} else {
		// 		line = sprintf('%s: %s / %s', BaseModel.shortId(note.id), parent.title, note.title);
		// 	}

		// 	this.stdout(line);
		// }
	}

}

module.exports = Command;