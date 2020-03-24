import React from 'react';
import serialize from 'form-serialize'
import { Button, DropdownSelect } from '@tableau/tableau-ui'
import './App.css'
import avatar_map from './avatarMapping.js'

/* global tableau */

class App extends React.Component {
  constructor(props) {
    super(props);
    var self = this;
    self.state = {
      configuration: ['sheetname', 'avatar', 'pose', 'emotionField', 'speechBubbleTextField'],
      comicgen: {

      },
      worksheetData: undefined,
      worksheets: undefined,
      form: {
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
        // avatarSize: {
        //   value: '1x',
        //   label: 'Select Avatar Size',
        //   options: ['0.5x', '1x', '1.5x', '2x']
        // },
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
      }
    };
    tableau.extensions.initializeDialogAsync().then(this.loadForm.bind(this))
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  loadForm(stateStr) {
    // console.log('stateStr from actual', JSON.parse(stateStr))
    // let initialState = JSON.parse(JSON.parse(stateStr).settings)
    // console.log(initialState)

    let worksheets = tableau.extensions.dashboardContent.dashboard.worksheets
    // TODO: what if Sheets are empty,
    //  handle empty condition by showing a "No worksheets found. Add a worksheet" message
    this.setState({
      ...this.state,
      worksheets: worksheets,
      form: {
        ...this.state.form,
        sheetname: {
          ...this.state.form.sheetname,
          options: worksheets.map(d => d.name)
        }
      }
    })
  }

  handleChange(event) {
    if (event.target.name === 'sheetname') {

      let worksheet = tableau.extensions.dashboardContent.dashboard.worksheets
        .find(sheet => sheet.name.trim() === event.target.value.trim())

      this.setState({
        ...this.state,
        form: {
          ...this.state.form,
          sheetname: { ...this.state.form.sheetname, value: event.target.value } 
        }
      })
      console.log('thi.state', this.state)
      worksheet.getSummaryDataAsync().then(this.afterDataSelected.bind(this))
    }
  }

  handleSubmit(event) {
    event.preventDefault();
    const self = this
    const body = serialize(event.target, { hash: true })
    const speechBubbleTextField = this.state.form.speechBubbleTextField.options.indexOf(body.speechBubbleTextField)
    const emotionField = this.state.form.emotionField.options.indexOf(body.emotionField)

    self.setState({
      ...self.state,
      debug: emotionField + ' --- ' + speechBubbleTextField,
      comicgen: {
        avatar: body.avatar,
        pose: body.pose,
        annotation: self.state.worksheetData[speechBubbleTextField]._formattedValue,
        emotion: avatar_map[body.avatar]['emotion_' + self.state.worksheetData[emotionField]._formattedValue]
      },
      form: {
        ...self.state.form,
        avatar: {
          ...self.state.form.avatar,
          value: body.avatar
        },
        pose: {
          ...self.state.form.pose,
          value: body.pose
        },
        emotionField: {
          ...self.state.form.emotionField,
          value: body.emotionField
        },
        speechBubbleTextField: {
          ...self.state.form.speechBubbleTextField,
          value: body.speechBubbleTextField
        }
      }

    }, function () {
      self.setState({
        ...self.state,
        debug: JSON.stringify(self.state.comicgen)
      })
      self.closeDialog()
    })
  }

  afterDataSelected(marks) {
    var self = this
    console.log('insital', marks)
    var worksheetData = marks.data[0]
    const columnNames = marks.columns.map(function (column) {
      return column._fieldName
    })
    console.log('columnNames', columnNames)

    self.setState({
      ...this.state,
      worksheetData: worksheetData,
      form: {
        ...this.state.form,
        emotionField: {
          ...self.state.form.emotionField,
          options: columnNames
        },
        speechBubbleTextField: {
          ...self.state.form.speechBubbleTextField,
          options: columnNames
        }
      }
    })
  }

  closeDialog() {
    const self = this
    tableau.extensions.settings.set('settings', JSON.stringify({
      comicgen: self.state.comicgen,
      form: self.state.form,
      worksheetData: self.state.worksheetData
    }));
    tableau.extensions.settings.saveAsync().then((newSavedSettings) => {
      console.log('newSavedSettings', newSavedSettings)
      tableau.extensions.ui.closeDialog(newSavedSettings.settings);
    });
  }



  render() {
    console.log("#############", this.state)
    let self = this;

    return (
      <div className="app d-flex">
        <div className="col-10">
          {this.state.debug}
          <div className="configuration">
            <form onSubmit={self.handleSubmit}>
              {
                Object.entries(self.state.form)
                  .map(function ([fieldKey, fieldInfo]) {
                    return (<div key={fieldKey} className="d-flex justify-content-center flex-column align-items-center">
                      <div className="p-2"></div>
                      <div>{fieldInfo.label}</div>
                      <Dropdown key={'dropdown' + fieldKey} {...fieldInfo} name={fieldKey} handleChange={self.handleChange}></Dropdown>
                    </div>)
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
    console.log('props', this.props)
    var optionTags = options && options.map((d, i) => {
      return <option key={d}>{d}</option>
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
