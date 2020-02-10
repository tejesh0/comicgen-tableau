import React from 'react';
import serialize from 'form-serialize'
import settings from './settings.svg'
import { Button, DropdownSelect } from '@tableau/tableau-ui'
import './App.css'

console.log('OOOOOOOO', document.currentScript, document.currentScript.src)
console.log('svgs', typeof(svgs))
/* global tableau, comicgen */

class App extends React.Component {
  constructor(props) {
    super(props);
    var self = this;
    self.state = {
      showConfig: true,
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
        options: ['dee', 'dey']
      },
      pose: {
        value: '',
        label: 'Select Pose',
        options: ['handsfolded', 'holdingcoffee']
      },
      emotionField: {
        value: '',
        label: 'Select Emotion Field',
        options: ['sales', 'emotion']
      },
      speechBubbleTextField: {
        value: '',
        label: 'Select SpeechBubble Text Field',
        options: []
      }
    };


    // TODO: show loader

    tableau.extensions.initializeAsync().then(this.loadForm.bind(this))

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleToggleClick = this.handleToggleClick.bind(this);
  }

  loadForm() {
    // TODO: hide loader
    let worksheets = tableau.extensions.dashboardContent.dashboard.worksheets
    console.log('worksheets', worksheets)
    this.setState({ worksheets: worksheets })

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
    // console.log('event: ', event.target, event.target.name)
    if (event.target.name === 'sheetname') {
      this.setState({ sheetname: { ...this.state.sheetname, value: event.target.value } })
      this.reloadSheetFields(event.target.value)
    }
  }

  handleSubmit(event) {
    event.preventDefault();
    var self = this
    console.log('submit: ', this.state, event.target, event.target.name)
    const body = serialize(event.target, { hash: true })
    console.log('body', body, this.state.worksheetData, body.emotionField, this.state.emotionField.options.indexOf(body.emotionField))
    console.log(this.state.worksheetData[this.state.emotionField.options.indexOf(body.emotionField)]._formattedValue)
    this.setState({
      comicgen: {
        avatar: body.avatar,
        pose: body.pose,
        emotion: this.state.worksheetData[this.state.emotionField.options.indexOf(body.emotionField)]._formattedValue
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
      }

    }, function() {
      comicgen('.new')
      self.handleToggleClick()
    })
  }

  handleToggleClick() {
    this.setState(state => ({
      showConfig: !state.showConfig
    }))
  }

  reloadSheetFields (sheetname) {
    if (!sheetname) return
    var worksheet = this.state.worksheets.find(sheet => sheet.name === sheetname)
    worksheet.getUnderlyingDataAsync().then(this.afterDataSelected.bind(this))
    var self = this
    this.state.worksheets.forEach(function(wrksht) {
      self.loadSelectedMarks(wrksht, worksheet)
    })
  }

  loadSelectedMarks(worksheet, main_worksheet) {
    console.log('worksheet', worksheet)
    let markselectionEventListener
    let self = this

    // Call to get the selected marks for our sheet
    if (self.state[worksheet.name]) {
      self.state[worksheet.name]()
    }
    markselectionEventListener = worksheet.addEventListener(tableau.TableauEventType.MarkSelectionChanged, function () {
      console.log("insdie evnt listener")
      main_worksheet.getUnderlyingDataAsync().then(self.refreshEmotion.bind(self))
    })
    console.log('outside event listener')
    self.setState({ [worksheet.name]: markselectionEventListener })
  }

  refreshEmotion(marks) {
    var worksheetData = marks.data[0]

    console.log(this.state.emotionField.value, 'emotionField', worksheetData[this.state.emotionField.options.indexOf(this.state.emotionField.value)]._formattedValue)
    this.setState({
      comicgen: {
        ...this.state.comicgen,
        emotion: worksheetData[this.state.emotionField.options.indexOf(this.state.emotionField.value)]._formattedValue
      }
    },function() {
      comicgen('.new')
    })
  }

  afterDataSelected (marks) {
    var self = this
    var worksheetData = marks.data[0]
    const columnNames = marks.columns.map(function (column) {
      return column.fieldName
    });
    self.setState({
      worksheetData: worksheetData
    })

    console.log('columnnames', columnNames)

    self.setState({
      emotionField: {
        ...self.state.emotionField,
        options: columnNames
      },
      speechBubbleTextField: {
        ...self.state.speechBubbleTextField,
        options: columnNames
      }
    })
  }

  render() {
    console.log("#############", this.state)
    return (
      <div className="app">
        <div className="header">
          <img src={settings} alt="settings" onClick={this.handleToggleClick} className="position-absolute cursor-pointer" width="30px" />
        </div>

          <div className={this.state.showConfig ? 'configuration': 'd-none' }>
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
        <div className={this.state.showConfig ? 'd-none': 'comic-panel'}>
          <svg>
            <g className="new"
              name={this.state.comicgen.avatar}
              angle="straight"
              emotion={this.state.comicgen.emotion}
              pose={this.state.comicgen.pose}
            ></g>
          </svg>
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
