import React from 'react';
import serialize from 'form-serialize'
import settings from './settings.svg'
import { Button, DropdownSelect } from '@tableau/tableau-ui'
import './App.css'
import avatar_map from './avatarMapping.js'

/* global tableau, comicgen */

class App extends React.Component {
  constructor(props) {
    super(props);
    var self = this;
    self.state = {
      configuration: ['sheetname', 'avatar', 'pose', 'emotionField', 'speechBubbleTextField'],
      comicgen: {

      },
      sheetname: {
        value: '',
        label: 'Select Sheet',
        options: []
      },
      avatar: {
        value: '',
        label: 'Select Avatar',
        options: ['dey', 'dee']
      },
      pose: {
        value: '',
        label: 'Select Pose',
        options: ['handsfolded', 'holdingcoffee', 'handsonhip', 'readingpaper', 'thinkinghmm']
      },
      emotionField: {
        value: '',
        label: 'Select Emotion Field',
        options: []
      },
      speechBubbleTextField: {
        value: '',
        label: 'Select SpeechBubble Text Field',
        options: []
      }
    };
    tableau.extensions.initializeDialogAsync().then(this.loadForm.bind(this))
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleToggleClick = this.handleToggleClick.bind(this);
  }

  loadForm(initState) {
    console.log('initState from actual', initState)

    let worksheets = tableau.extensions.dashboardContent.dashboard.worksheets
    this.setState({ worksheets: worksheets, comicgen: JSON.parse(initState) })
    // TODO: what if Sheets are empty,
    //  handle empty condition by showing a "No worksheets found. Add a worksheet" message
    this.setState({
      sheetname: {
        ...this.state.sheetname,
        options: this.state.worksheets.map(d => d.name)
      }
    })

  }

  handleChange(event) {
    if (event.target.name === 'sheetname') {
      this.setState({ sheetname: { ...this.state.sheetname, value: event.target.value } })
      this.reloadSheetFields(event.target.value)
    }
  }

  handleSubmit(event) {
    event.preventDefault();
    var self = this
    const body = serialize(event.target, { hash: true })
    this.setState({
      comicgen: {
        avatar: body.avatar,
        pose: body.pose,
        annotation: this.state.worksheetData[this.state.speechBubbleTextField.options.indexOf(body.speechBubbleTextField)]._formattedValue,
        emotion: avatar_map[body.avatar]['emotion_'+this.state.worksheetData[this.state.emotionField.options.indexOf(body.emotionField)]._formattedValue]
      },
      avatar: {
        ...this.state.avatar,
        value: body.avatar
      },
      pose: {
        ...this.state.pose,
        value: body.pose
      },
      emotionField: {
        ...this.state.emotionField,
        value: body.emotionField
      },
      speechBubbleTextField: {
        ...this.state.speechBubbleTextField,
        value: body.speechBubbleTextField
      }

    }, function() {
      this.closeDialog()
    })
  }


  closeDialog() {
    console.log('this')
    tableau.extensions.settings.set('settings', JSON.stringify(this.state.comicgen));

    tableau.extensions.settings.saveAsync().then((newSavedSettings) => {
      console.log('newSavedSettings', newSavedSettings)
      tableau.extensions.ui.closeDialog(newSavedSettings);
    });
  }

  handleToggleClick() {

  }

  render() {
    console.log("#############", this.state)
    return (
      <div className="app d-flex">
        <div className="header col-2">
          <img src={settings} alt="settings" onClick={this.handleToggleClick} className="position-absolute cursor-pointer" width="30px" />
        </div>
        <div className="col-10">
          <div className="configuration">
            <form onSubmit={this.handleSubmit}>
            {
              this.state.configuration.map((key) => {
                return (
                  <div key={key} className="d-flex justify-content-center flex-column align-items-center">
                    <div className="p-2"></div>
                    <div>{this.state[key].label}</div>
                    <Dropdown key={'dropdown' + key} {...this.state[key]} name={key} handleChange={this.handleChange}></Dropdown>
                  </div>
                )
              })
            }
            <div className="d-flex justify-content-center flex-column align-items-center mt-2">
              <Button type="submit" kind="primary" className="font-weight-bold">Render Comic</Button>
            </div>
          </form>
          </div>
        </div>
      </div>
    );
  }
}

class Dropdown extends React.Component {
  render() {
    const { name, options } = this.props
    // console.log('props', options, this.props)
    var optionTags = options && options.map((d, i) => {
      return <option key={i}>{d}</option>
    })
    return (
      <DropdownSelect key={name} kind='line' name={name} onChange={this.props.handleChange}>
        <option selected="selected" disabled="disabled">select</option>
        {
          optionTags
        }
      </DropdownSelect>
    )
  }
}

export default App;
