import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import './pages.css'
import TextField from '@material-ui/core/TextField';


export default class SessionPage extends Component {

  state = {}

  updateUserSession = e => this.setState({session: e.target.value})

  loadUserSession = e => {

      e.preventDefault()

      fetch('http://127.0.0.1:5000/check-session/', {
          method: 'post',
          body: JSON.stringify(this.state.session)
      })
        .then(res => res.json())
        .then(data => {
            console.log(data);
            if (data === 'notok') {
                this.props.history.push('/upload')
            } else {
                let pathname = '/harmony/' + this.state.session
                this.props.history.push(pathname)
            }
        })
  }

  render() {
    return (
      <div className="page">
        <div style={{display: 'flex'}}>
        <div
          style={{
            width: '30%',
            height:'100%',
            marginLeft: '10%',
            marginTop: '3%'
          }}
        ></div>

        <div style={{width: '70%', height: '100%'}}>

          <h3>Load existing session</h3>
          <div className="session-container">
            <form onSubmit={this.loadUserSession}>
              <TextField
                id="sessionInput"
                ref="sessionInput"
                label="Session code"
                style={{width:400, marginTop: 0}}
                onChange={this.updateUserSession}
                autoComplete='off'
              />
              {this.state.error}
              <input type="submit" value="Load session" className="session-button" />
            </form>
          </div>

          <h3>Create a new session</h3>
          <div className="session-container">
            <div className="session-button">
              <Link to={{pathname:  "/upload"}}>Create session</Link>
            </div>
          </div>

          <h3>Try our example</h3>
          <div className="session-container">
            <div className="session-button">
              <Link to={{pathname: '/harmony/test_session'}}>Example session</Link>
            </div>
          </div>
          </div>
        </div>
      </div>
    )
  }
}
