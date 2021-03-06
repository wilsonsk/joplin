import React, { Component } from 'react';
import { View, Button, Picker } from 'react-native';
import { connect } from 'react-redux'
import { reg } from 'lib/registry.js';
import { Log } from 'lib/log.js'
import { NoteList } from 'lib/components/note-list.js'
import { Folder } from 'lib/models/folder.js'
import { Tag } from 'lib/models/tag.js'
import { Note } from 'lib/models/note.js'
import { Setting } from 'lib/models/setting.js'
import { themeStyle } from 'lib/components/global-style.js';
import { ScreenHeader } from 'lib/components/screen-header.js';
import { MenuOption, Text } from 'react-native-popup-menu';
import { _ } from 'lib/locale.js';
import { ActionButton } from 'lib/components/action-button.js';
import { dialogs } from 'lib/dialogs.js';
import DialogBox from 'react-native-dialogbox';
import { BaseScreenComponent } from 'lib/components/base-screen.js';

class NotesScreenComponent extends BaseScreenComponent {
	
	static navigationOptions(options) {
		return { header: null };
	}

	async componentDidMount() {
		await this.refreshNotes();
	}

	async componentWillReceiveProps(newProps) {
		if (newProps.notesOrder !== this.props.notesOrder ||
		    newProps.selectedFolderId != this.props.selectedFolderId ||
		    newProps.selectedTagId != this.props.selectedTagId ||
		    newProps.notesParentType != this.props.notesParentType) {
			await this.refreshNotes(newProps);
		}
	}

	async refreshNotes(props = null) {
		if (props === null) props = this.props;

		let options = {
			order: props.notesOrder,
			uncompletedTodosOnTop: props.uncompletedTodosOnTop,
		};

		const parent = this.parentItem(props);
		if (!parent) return;

		const source = JSON.stringify({
			options: options,
			parentId: parent.id,
		});

		if (source == props.notesSource) return;

		let notes = [];
		if (props.notesParentType == 'Folder') {
			notes = await Note.previews(props.selectedFolderId, options);
		} else {
			notes = await Tag.notes(props.selectedTagId); // TODO: should also return previews
		}

		this.props.dispatch({
			type: 'NOTES_UPDATE_ALL',
			notes: notes,
			notesSource: source,
		});
	}

	deleteFolder_onPress(folderId) {
		dialogs.confirm(this, _('Delete notebook?')).then((ok) => {
			if (!ok) return;

			Folder.delete(folderId).then(() => {
				this.props.dispatch({
					type: 'NAV_GO',
					routeName: 'Welcome',
				});
			}).catch((error) => {
				alert(error.message);
			});
		});
	}

	editFolder_onPress(folderId) {
		this.props.dispatch({
			type: 'NAV_GO',
			routeName: 'Folder',
			folderId: folderId,
		});
	}

	menuOptions() {
		if (this.props.notesParentType == 'Folder') {
			if (this.props.selectedFolderId == Folder.conflictFolderId()) return [];

			return [
				{ title: _('Delete notebook'), onPress: () => { this.deleteFolder_onPress(this.props.selectedFolderId); } },
				{ title: _('Edit notebook'), onPress: () => { this.editFolder_onPress(this.props.selectedFolderId); } },
			];
		} else {
			return []; // For tags - TODO
		}
	}

	parentItem(props = null) {
		if (!props) props = this.props;

		let output = null;
		if (props.notesParentType == 'Folder') {
			output = Folder.byId(props.folders, props.selectedFolderId);
		} else if (props.notesParentType == 'Tag') {
			output = Tag.byId(props.tags, props.selectedTagId);
		} else {
			return null;
			throw new Error('Invalid parent type: ' + props.notesParentType);
		}
		return output;
	}

	render() {
		const parent = this.parentItem();
		const theme = themeStyle(this.props.theme);

		let rootStyle = {
			flex: 1,
			backgroundColor: theme.backgroundColor,
		}

		if (!this.props.visible) {
			rootStyle.flex = 0.001; // This is a bit of a hack but it seems to work fine - it makes the component invisible but without unmounting it
		}

		if (!parent) {
			return (
				<View style={rootStyle}>
					<ScreenHeader title={title} menuOptions={this.menuOptions()} />
				</View>
			)
		}

		let title = parent ? parent.title : null;
		const addFolderNoteButtons = this.props.selectedFolderId && this.props.selectedFolderId != Folder.conflictFolderId();

		return (
			<View style={rootStyle}>
				<ScreenHeader title={title} menuOptions={this.menuOptions()} />
				<NoteList style={{flex: 1}}/>
				<ActionButton addFolderNoteButtons={addFolderNoteButtons} parentFolderId={this.props.selectedFolderId}></ActionButton>
				<DialogBox ref={dialogbox => { this.dialogbox = dialogbox }}/>
			</View>
		);
	}
}

const NotesScreen = connect(
	(state) => {
		return {
			folders: state.folders,
			tags: state.tags,
			selectedFolderId: state.selectedFolderId,
			selectedTagId: state.selectedTagId,
			notesParentType: state.notesParentType,
			notes: state.notes,
			notesOrder: state.notesOrder,
			notesSource: state.notesSource,
			uncompletedTodosOnTop: state.settings.uncompletedTodosOnTop,
			theme: state.settings.theme,
		};
	}
)(NotesScreenComponent)

export { NotesScreen };