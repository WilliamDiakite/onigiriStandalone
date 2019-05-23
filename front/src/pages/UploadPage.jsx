import React, {Component} from 'react'
import { Link } from 'react-router-dom'
import Dropzone from 'react-dropzone'
import Async from 'react-async'
import TextField from '@material-ui/core/TextField';
import Select from 'react-select'
import './pages.css'

import testLoad from './test_load.json'



export default class UploadPage extends Component {

  constructor() {
    super()
    this.state = {
      validSession: false,
      session: '',
      files: [],
      contents: [],
      options: [
            {id: null, match: null, infoLabels: null},
            {id: null, match: null, infoLabels: null}
          ],
      canUpload: false
    }
  }

  onDrop = (acceptedFiles) => {
    if ( this.state.files.length < 3) {
      var reader = new FileReader()

      reader.onabort = () => console.log('file reading was aborted')
      reader.onerror = () => console.log('file reading has failed')
      reader.onload = e => {
        var {
          files,
          contents
        } = this.state

        files.push(acceptedFiles[0])
        contents.push(reader.result)
        this.setState({files: files, contents: contents})
      }
      reader.readAsText(acceptedFiles[0])
    }
  }

  getFileList = () => {

    const rows = this.state.files.map((f, i) => {

      const labels = this.state.contents[i].split('\n')[0].split(",").map(l => {
        return {value: l, label: l}
      })

      return (
        <tr
          className="dataset-row"
          key={i}
        >
          <td>{i+1}</td>
          <td>{f.path}</td>
          <td>
            <Select
              name={`id-${i}`}
              options={labels}
              onChange={this.optionChange} />
          </td>
          <td>
          <Select
            name={`match-${i}`}
            options={labels}
            onChange={this.optionChange}/>
          </td>
          <td>
          <Select
            name={`infoLabels-${i}`}
            options={labels}
            onChange={this.optionChange}
            isMulti/>
          </td>
          <td>{Math.round(f.size/1000000, 3)} Mb</td>
        </tr>
      )
    })
    return rows
  }

  optionChange = (selectedOption, e) => {
    const [option, datasetId] = e.name.split('-')
    var options = this.state.options

    if (option === 'match' || option === 'id') {
      options[datasetId][option] = selectedOption.value
      this.setState({options: options, canUpload: this.ready()})
    }
    else if (option === 'infoLabels') {
      options[datasetId][option] = selectedOption.map(elt => elt.value)
      this.setState({options: options, canUpload: this.ready()})
    }
  }

  ready = () => {
    var allOptions = true
    this.state.options.forEach(o => {
      Object.keys(o).forEach(label => {
        if (o[label] === null) allOptions = false
      })
    })
    if (this.state.files === 2 && this.state.contents === 2 && allOptions) {
      this.setState({canUpload: true})
    }
    return allOptions
  }

  uploadFiles = () => {
    var load = []
    for (var i = 0 ; i < 2; i++) {
      load.push(
        {
          name: this.state.files[i].path,
          size: this.state.files[i].size,
          content: this.state.contents[i],
          options: this.state.options[i]
        }
      )
    }

    return fetch('http://127.0.0.1:5000/create-session/', {
      method: 'post',
      body: JSON.stringify({load: load, session: this.state.session})
    })
      .then(response => response.json())
  }

  testUploadFiles = () => {
      return fetch('http://127.0.0.1:5000/create-session/', {
        method: 'post',
        body: JSON.stringify(testLoad)
      })
        .then(response => response.json())
  }

  resetFiles = () => {
    this.setState({files: [],
                    contents: [],
                    options: [
                        {id: null, match: null, infoLabels: null},
                        {id: null, match: null, infoLabels: null}
                      ],
                    canUpload: false})
  }

  updateUserSession = e => {
      const session = e.target.value
      fetch('http://127.0.0.1:5000/check-session/', {
          method: 'post',
          body: JSON.stringify(session)
      })
        .then(res => res.json())
        .then(data => {
            console.log('session check', data);
            data.sessionExists
                ? this.setState({validSession: false, session: session})
                : this.setState({validSession: true, session: session})
        })
  }

  render() {
    return (
      <div className="page">
        <h2>Pick a session name</h2>
        <TextField
          id="sessionInput"
          ref="sessionInput"
          label="Session name"
          style={{width:400, marginTop: 20}}
          onChange={this.updateUserSession}
          autoComplete='off'
        />
        {this.state.session.length > 5
          ? this.state.validSession
              ? <div className='alert' variant='light'>What a lovely name, brilliant !</div>
              : <div className='alert' variant="warning">Session already exists...</div>
          : this.state.session.length > 0
              ? <div className='alert' variant='warning'>Session name is too short</div>
              : <div className='alert'></div>
        }


        <h2>Upload your files</h2>

        <div className="upload-section">
          <Dropzone onDrop={this.onDrop}>
            {({getRootProps, getInputProps}) => (
              <section>
                <div style={{width: 500}}{...getRootProps()}>
                  <input  {...getInputProps()} />
                  <p className='dropzone'><br/>Drag 'n' drop some files here, or click to select files</p>
                </div>
              </section>
            )}
          </Dropzone>
        </div>

        <table className="pure-table" style={{marginTop: 40}}>
          <thead>
              <tr>
                <td style={{width: 120}}>Uploaded ({this.state.files.length}/2)</td>
                <td style={{width: 150}}>Filename</td>
                <td style={{width: 150}}>Id column</td>
                <td style={{width: 150}}>Match column</td>
                <td style={{width: 150}}>Displayed infos</td>
                <td style={{width: 80}}>Size</td>
              </tr>
          </thead>
          <tbody>
            { this.state.files.length === this.state.contents.length
              ? this.getFileList()
              : null
            }
          </tbody>
        </table>


        <div className="button">
          <p onClick={this.resetFiles}>Reset files</p>
        </div>

        <div className="upload-section">
          {this.state.canUpload
            ?
                <div className="session-button">
                  <p onClick={() => this.setState({doUpload: true, canUpload: false})}>
                    Upload
                  </p>
                </div>
            : null
          }

          <div className="session-button" onClick={this.testUploadFiles }>
            Retry
          </div>

          {this.state.doUpload
            ? <Async promiseFn={this.uploadFiles}>
                <Async.Loading>
                  <div className="load-button">
                    <i className="fa fa-circle-o-notch fa-spin"></i>
                    <p>Loading...</p>
                  </div>
                </Async.Loading>
                <Async.Resolved>
                  {data =>(
                      <div className="session-button">
                          <Link
                            to={{pathname: /harmony/+this.state.session}}
                          >Start
                          </Link>
                        </div>
                    )}
                </Async.Resolved>
                <Async.Rejected>{e => e.message}</Async.Rejected>
              </Async>
            : null
          }
        </div>
      </div>
    )
  }
}
