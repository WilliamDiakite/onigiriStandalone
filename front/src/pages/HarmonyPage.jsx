import React, {Component} from 'react'
import {Link} from 'react-router-dom'
import Select from 'react-select'
import SuggestionBlock from '../components/SuggestionBlock'
import './pages.css'

export default class HarmonyPage extends Component {

  constructor() {
    super()
    this.state = {
      session: null,
      suggestion: null,
      previous: [],
      common: 1,
      nbuser: 0,
      total: 0
    }
  }

  notifyExit = (e) => {
    if (e) {
      e.preventDefault()
    }

    fetch('http://127.0.0.1:5000/leave/', {
      method: 'post',
      body: JSON.stringify(this.state.session)
    })
      .then(res => res.json())
      .then(data => console.log(data))
  }


  componentWillUnmount() {
    this.notifyExit();
  }

  componentDidMount() {

    console.log(this.props.history);

    window.onbeforeunload = (e) => this.notifyExit(e)


    const {handle} = this.props.match.params

    // Load session
    console.log('loading session');
    fetch('http://127.0.0.1:5000/load-session/', {
      method: 'post',
      body: JSON.stringify(handle)
    })
      .then(response => response.json())
      .then(data => {
        console.log(data);
        console.log('getting first suggestion...');
        // Get first suggestion
        fetch('http://127.0.0.1:5000/get-suggestion/', {
          method: 'post',
          body: JSON.stringify(handle)
        })
          .then(res => res.json())
          .then(data => {
            console.log(data);
            this.setState({session: handle,
                           suggestion: data['suggestion'],
                           nbuser: data['nbuser'],
                           total: data['total'],
                           common: 1})
          })
      })
  }

  getSuggestion = (prevSuggestion) => {
    fetch('http://127.0.0.1:5000/get-suggestion/', {
      method: 'post',
      body: JSON.stringify(this.state.session)
    }).then(response => response.json()).then(data => {
      console.log('received suggestion');
      console.log(data)
      if (prevSuggestion === null) {
        this.setState({suggestion: data['suggestion'],
                         nbuser: data['nbuser'],
                         total: data['total'],
                         common: 1})
      } else {
        var prev = this.state.previous
        prev.push(this.state.suggestion)
        this.setState({suggestion: data['suggestion'],
                        nbuser: data['nbuser'],
                        total: data['total'],
                        previous: prev,
                        common: 1})
      }
    })
  }

  matchUpdate = (id1, id2) => {
    fetch('http://127.0.0.1:5000/add-match/', {
      method: 'post',
      body: JSON.stringify(
        {
          'match': [[JSON.stringify(id1), JSON.stringify(id2)]],
          'type': 'match',
          'session': this.state.session
        })
    }).then(response => response.json()).then(data => {
      this.getSuggestion(this.state.suggestion)
    })
  }

  noMatchUpdate = e => {
    const options = this.state.suggestion['options']
    const c_options = this.state.suggestion.suggestions[0]['options']

    const no_match = this.state.suggestion.suggestions.map(elt => {
      return [
        this.state.suggestion[options['id']],
        elt[c_options['id']]
      ]
    })

    fetch('http://127.0.0.1:5000/add-match/', {
      method: 'post',
      body: JSON.stringify(
            {
              'match': no_match,
              'type': 'no_match',
              'session': this.state.session
            })
    })
      .then(response => response.json())
      .then(data => {
        console.log(data)
        this.getSuggestion(this.state.suggestion)
      })
  }

  undo = e => {
    const previous = this.state.previous
    const prev = previous.pop()

    this.setState({suggestion: prev, previous: previous})
  }

  back = e => this.props.updateCurrentPage('home', null)

  updateFilter = (selected) => {
    this.setState({common: selected.value})
  }

  render() {

    const options = [
      {
        value: 1,
        label: '1'
      }, {
        value: 2,
        label: '2'
      }, {
        value: 3,
        label: '3'
      }, {
        value: 4,
        label: '4'
      }, {
        value: 5,
        label: '5'
      }
    ]

    return (
    <div className="page">

      <div
        style={{display: 'flex'}}
      >

        <div
          style={{
            width: '30%',
            height:'100%',
            marginLeft: '5%',
            marginTop: '3%'
          }}
        >

          <div className='panel-section'>
            <h3 className="page-title">Working on {this.state.session}</h3>

            <div>
              <p>Collaborators working on this session: {this.state.nbuser}</p>
              <p>{this.state.total} matches to deal with</p>
            </div>
          </div>

          <div className='panel-section'>
            <h3 className="page-title">Matching method</h3>

            <div className='method-container'>
              <div className='method'>
                <div className='method-name'>Key collision</div>
                <div className='method-attr'>
                  <div className='method-attr-name'>status:</div>
                  <div className='method-attr-value'>Ready</div>
                </div>
              </div>
            </div>

            <div className='method-container'>
              <div className='method'>
                <div className='method-name'>Levensthein</div>
                <div className='method-attr'>
                  <div className='method-attr-name'>status:</div>
                  <div className='method-attr-value'>Not available</div>
                </div>
              </div>
            </div>
          </div>

          <div className='panel-section'>
            <h3 className="page-title">Filter/sort</h3>
            <div
              className="filter"
              style={{
                display: 'flex',
                width: '70%',
                alignContent: 'center'
              }}>
              <div style={{width: '30%'}}>Common keys:</div>
              <div style={{width: '70%'}}>
                <Select
                  defaultValue={options[0]}
                  options={options}
                  onChange={this.updateFilter}
                />
              </div>
            </div>
          </div>

          <div className='panel-section'>
            <h3 className="page-title">Download</h3>
            <div style={{display: 'flex'}}>
              <a href='/'>Click here</a>
              <div style={{marginLeft: '3px'}}>
                to download the integrated dataset
              </div>
            </div>
          </div>

          <div className='panel-section'>
            <h3 className="page-title">History</h3>
          </div>

        </div>

        <div
          style={{width: '70%', height: '100%'}}
        >
          {this.state.suggestion === null
            ? (<div>No data to print</div>)
            : (<div className="suggestion-container">
                  <SuggestionBlock
                    data={this.state.suggestion}
                    matchUpdate={this.matchUpdate}
                    common={this.state.common}
                    session={this.state.session}
                  />
                </div>
          )}

          <div className="buttons">

            <div className="button">
              <Link to='/home'>
                Back home
              </Link>
            </div>

            {this.state.previous.length > 0
              ? ( <div className="button-red">
                    <p onClick={this.undo}>
                    Undo
                    </p>
                  </div>
                )
              : <div className="button-red"/>
            }

            <div className="button-red">
              <p onClick={this.noMatchUpdate} id="no-match">
                No Match !
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>)
  }
}
