import React, { Component } from 'react';
import { StyleSheet, TouchableHighlight } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const styles = {
	checkboxIcon: {
		fontSize: 20,
		height: 22,
		//marginRight: 10,
	},
};

class Checkbox extends Component {

	constructor() {
		super();
		this.state = {
			checked: false,
		}
	}

	componentWillMount() {
		this.setState({ checked: this.props.checked });
	}

	componentWillReceiveProps(newProps) {
		if ('checked' in newProps) {
			this.setState({ checked: newProps.checked });
		}
	}

	onPress() {
		let newChecked = !this.state.checked;
		this.setState({ checked: newChecked });
		if (this.props.onChange) this.props.onChange(newChecked);
	}

	render() {
		const iconName = this.state.checked ? 'md-checkbox-outline' : 'md-square-outline';

		let style = this.props.style ? Object.assign({}, this.props.style) : {};
		style.justifyContent = 'center';
		style.alignItems = 'center';

		let checkboxIconStyle = Object.assign({}, styles.checkboxIcon);
		if (style.color) checkboxIconStyle.color = style.color;

		if (style.paddingTop) checkboxIconStyle.marginTop = style.paddingTop;
		if (style.paddingBottom) checkboxIconStyle.marginBottom = style.paddingBottom;
		if (style.paddingLeft) checkboxIconStyle.marginLeft = style.paddingLeft;
		if (style.paddingRight) checkboxIconStyle.marginRight = style.paddingRight;

		const thStyle = {
			justifyContent: 'center',
			alignItems: 'center',
		};

		if (style.display) thStyle.display = style.display;

		return (
			<TouchableHighlight onPress={() => this.onPress()} style={thStyle}>
				<Icon name={iconName} style={checkboxIconStyle}/>
			</TouchableHighlight>
		);
	}

}

export { Checkbox };