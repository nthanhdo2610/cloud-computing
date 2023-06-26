import React, { Component } from 'react';
import axios from 'axios';

class App extends Component {
	state = {
		data: {
			email: '',
			name: '',
			phone: '',
			subject: '',
			message: ''
		},
    submitted: false
	};

	onChange = (e) => {
		return this.setState({
			data: { ...this.state.data, [e.target.name]: e.target.value }
		});
	};

	onSubmit = () => {
		console.log(JSON.stringify(this.state.data));
    const correctData = {};

    correctData.GuestName = this.state.data.name;
    correctData.Email = this.state.data.email;
    correctData.Phone = this.state.data.phone;
    correctData.MessageTitle = this.state.data.subject;
    correctData.Message = this.state.data.message;

    axios.post(
      'https://yvzvk41grl.execute-api.us-east-1.amazonaws.com/v1/contact',
      correctData
    ).then(
      (response) => {
        console.log("Response: " + JSON.stringify(response));
      },
      (error) => {
        console.log("Error " + error);
      }
    ); 
	};

	render() {
		return (
      <form id="contactForm">
        <input
          type="text"
          id="name"
          name="name"
          className="form-control"
          placeholder="Your Name*"
          onChange={this.onChange}
        />
        <input
          type="email"
          className="form-control"
          id="email"
          name="email"
          placeholder="Your Email*"
          onChange={this.onChange}
        />
        <input
          type="text"
          id="subject"
          name="subject"
          className="form-control"
          placeholder="Subject*"
          onChange={this.onChange}
        />
        <input
          type="text"
          className="form-control"
          id="phone"
          name="phone"
          placeholder="Phone"
          onChange={this.onChange}
        />
        <textarea
          name="message"
          id="message"
          className="form-control"
          rows="6"
          placeholder="Your Message* ..."
          onChange={this.onChange}
        ></textarea>
        {!this.state.submitted && (
          <button
            type="button"
            onClick={this.onSubmit}
            disabled={this.state.loading}
            className="btn send_btn theme_btn"
          >
            Send A Secure Message
          </button>
        )}
      </form>
    )
	}
}

export default App;
