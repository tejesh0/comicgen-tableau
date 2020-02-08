import React, { useEffect, setState} from 'react';
import { Button, DropdownSelect } from '@tableau/tableau-ui';
import './App.css';

/* global tableau */

class App extends React.Component {
  // var state = { checked: false };
  constructor(props) {
    super(props);
    this.state = { value: '' };

    this.handleChange = this.handleChange.bind(this);
    // this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({ value: event.target.value });
  }

  render() {
    return (
      <div className="app">
        <div className="configuration d-flex justify-content-center flex-column align-items-center">
          <div>Select Sheet</div>
          <DropdownSelect kind='outline' onChange={this.handleChange}>
            <option>sheet 1</option>
            <option>sheet 2</option>
            <option>sheet 3</option>
            <option>sheet 4</option>
          </DropdownSelect>

          <div className="p-1"></div>
          <div>Select Avatar</div>
          <DropdownSelect kind='outline' onChange={this.handleChange}>
            <option>Avatar 1</option>
            <option>Avatar 2</option>
            <option>Avatar 3</option>
            <option>Avatar 4</option>
          </DropdownSelect>

          <div className="p-1"></div>
          <div>Select Pose</div>
          <DropdownSelect kind='outline' onChange={this.handleChange}>
            <option>Pose 1</option>
            <option>Pose 2</option>
            <option>Pose 3</option>
            <option>Pose 4</option>
          </DropdownSelect>

          <div className="p-1"></div>
          <div>Select Emotion Field</div>
          <DropdownSelect kind='outline' onChange={this.handleChange}>
            <option>Sum(Sales)</option>
            <option>Emotion</option>
            <option>Profit</option>
          </DropdownSelect>

          <div className="p-1"></div>
          <div>Write Annotation Template</div>
          <textarea className="form-control w-25 sm-12" >
            Colorado's profit is 19% with sales amounting to 3.4Million
          </textarea>
        </div>
      </div>
    );
  }

}

export default App;
