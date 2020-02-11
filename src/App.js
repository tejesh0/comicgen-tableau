import React from 'react';
import serialize from 'form-serialize'
import settings from './settings.svg'
import { Button, DropdownSelect } from '@tableau/tableau-ui'
import './App.css'

console.log('OOOOOOOO', document.currentScript, document.currentScript.src)
console.log('svgs', typeof(svgs))
/* global tableau, comicgen */

let avatar_map = {
  "dey": {
      emotion_normal: "normal",
      emotion_laugh: "smile",
      emotion_sad: "tired",
      emotion_angry: "shocked",
      emotion_worried: "shocked",
      emotion_surprised: "hmmconfused",
      emotion_wink: "wink",
      pose_pointingright: "pointingright",
      pose_pointingup: "pointingup",
      pose_yuhoo: "yuhoo",
      pose_superperfect: "superperfect",
      pose_holdinglaptop: "holdinglaptop",
      pose_angryfrustrated: "angryfrustrated",
      pose_handsfolded: "handsfolded",
      pose_handsonhip: "handsonhip",
      pose_holdingbook: "holdingbook",
      pose_readingpaper: "readingpaper",
      pose_thumbsup: "thumbsup",
      pose_thinkinghmm: "thinkinghmm"
  },
  "dee": {
      emotion_normal: "smile",
      emotion_laugh: "smilehappy",
      emotion_sad: "sad",
      emotion_angry: "angryfrustrated",
      emotion_worried: "worried",
      emotion_surprised: "angryshouting",
      emotion_wink: "wink",
      pose_pointingright: "pointingright",
      pose_pointingup: "pointingup",
      pose_yuhoo: "yuhoo",
      pose_superperfect: "superperfect",
      pose_holdinglaptop: "holdinglaptop",
      pose_angryfrustrated: "angryfrustrated",
      pose_handsfolded: "handsfolded",
      pose_handsonhip: "handsonhip",
      pose_holdingbook: "holdingbook",
      pose_readingpaper: "readingpaper",
      pose_thumbsup: "thumbsup",
      pose_thinkinghmm: "thinkinghmm"
  }
};

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
        options: ['handsfolded', 'holdingcoffee', 'handsonhip', 'readingpaper', 'thinkinghmm']
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
    // console.log('worksheets', worksheets)
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
    // console.log('submit: ', this.state, event.target, event.target.name)
    const body = serialize(event.target, { hash: true })
    // console.log('body', body, this.state.worksheetData, body.emotionField, this.state.emotionField.options.indexOf(body.emotionField))
    // console.log(this.state.worksheetData[this.state.emotionField.options.indexOf(body.emotionField)]._formattedValue)
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
    worksheet.getSummaryDataAsync().then(this.afterDataSelected.bind(this))
    var self = this
    this.state.worksheets.forEach(function(wrksht) {
      self.loadSelectedMarks(wrksht, worksheet)
    })
  }

  loadSelectedMarks(worksheet, main_worksheet) {
    let markselectionEventListener
    let self = this

    // Call to get the selected marks for our sheet
    if (self.state[worksheet.name]) {
      self.state[worksheet.name]()
    }
    markselectionEventListener = worksheet.addEventListener(tableau.TableauEventType.MarkSelectionChanged, function () {
      console.log("insdie evnt listener", main_worksheet, main_worksheet.name)
      main_worksheet.getSummaryDataAsync().then(self.summaryrefresh.bind(self))
    })
    self.setState({ [worksheet.name]: markselectionEventListener })
  }

  summaryrefresh(marks) {
    console.log('summary refresh', marks, marks.columns)
    var worksheetData = marks.data[0]
    var cols = marks.columns.map(d=> d._fieldName)
    var actual_emotion = worksheetData[cols.indexOf('AGG('+this.state.emotionField.value+')')]._formattedValue.toLowerCase()
    var emotion = avatar_map[this.state.comicgen.avatar]['emotion_'+actual_emotion]
    var annotation = worksheetData[cols.indexOf('AGG('+this.state.speechBubbleTextField.value+')')]._formattedValue.toLowerCase()

    this.setState({
      comicgen: {
        ...this.state.comicgen,
        emotion: emotion,
        annotation: annotation
      }
    },function() {
      comicgen('.new')
    })
  }

  afterDataSelected (marks) {
    var self = this
    var worksheetData = marks.data[0]
    const aggColumnNames = marks.columns.map(function (column) {
      return column._fieldName
    })
    const columnNames = aggColumnNames.map(function(col) {
      return /AGG\((.*?)\)/i.exec(col)[1]
    })
    self.setState({
      worksheetData: worksheetData
    })

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
      <div className="app row">
        <div className="header col-1">
          <img src={settings} alt="settings" onClick={this.handleToggleClick} className="position-absolute cursor-pointer" width="30px" />
        </div>

        <div className="col-11">
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
              <div class="comic-caption-top">{this.state.comicgen.annotation}</div>
              <g className="new"
                height="500"
                width="300"
                name={this.state.comicgen.avatar}
                angle="straight"
                emotion={this.state.comicgen.emotion}
                pose={this.state.comicgen.pose}
              ></g>
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
