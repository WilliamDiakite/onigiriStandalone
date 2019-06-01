import React, { Component } from 'react'
import './SuggestionBlock.css'

export default class SuggestionBlock extends Component {

  componentWillMount() {
      console.log(this.props.data);
  }

  buildHeader = () => {
    const options = this.props.data['options']

    const labels = options['infoLabels'].map((l, i) => {
      return(
        <div
          key={`${this.props.data[options['id']]}-label-${i}`}
          className="info-block"
        >
          <p className="label">{l}</p>
          <p className="value">{this.props.data[l]}</p>
        </div>
      )
    })

    return (
      <div>
        <div className='title'>{this.props.data['__fname']}</div>
          <div className='candidate'>
            <div
              style={{
                backgroundColor: '#B388C4',
                height: '100%',
                width: '13%',
              }}
            ></div>

            <div style={{height: '100%', width: '90%'}}>
              <div
                id={this.props.data[options['id']]}
                style={{
                  width: '100%',
                  height: '50px',
                  backgroundColor:'#E1E1E1'
                }}
              >
              <div
                style={{
                  fontFamily: "'Roboto Condensed', sans-serif",
                  fontWeight: '700',
                  fontSize: '24px',
                  marginLeft: '15px'
                }}
              >
                {this.props.data[options['match']]}
              </div>
            </div>

            <div className="info-labels">
              <div className="info-block">
                <p className="label">{options['id']}:</p>
                <p className="value">{this.props.data[options['id']]}</p>
              </div>
              {labels}
            </div>
          </div>
        </div>
      </div>
    )
  }

  buildSuggestions = () => {

    console.log('SUGGESTIONS BLOCK data');
    console.log(this.props.data);

    // Parse options
    const options = this.props.data.suggestions[0]['options']

    var suggestions = this.props.data.suggestions
        .filter(a => a.common >= this.props.common)
        .map((elt, i) => {

            const labels = options['infoLabels'].map((l, i) => {
              return(
                <div
                  key={`${elt[options['id']]}-label-{i}`}
                  id={elt[options['id']]}
                  className="info-block"
                >
                  <p id={elt[options['id']]} className="label">{l}:</p>
                  <p id={elt[options['id']]} className="value">{elt[l]}</p>
                </div>
              )
            })

      return(
        <div
          className="candidate"
          key={elt[options['id']]}
          id={elt[options['id']]}
          onClick={this.confirmCandidate}
        >
          <div
            id={elt[options['id']]}
            style={{
              backgroundColor: '#956060',
              height: '100%',
              width: '13%'
            }}
          ></div>

          <div
            id={elt[options['id']]}
            style={{height: '100%', width: '90%'}}
          >
            <div
              id={elt[options['id']]}
              style={{
                width: '100%',
                height: '50px',
                backgroundColor:'#E1E1E1'
              }}
            >
              <div
                id={elt[options['id']]}
                style={{
                  fontFamily:"'Roboto Condensed', sans-serif",
                  fontWeight: '700',
                  fontSize: '24px',
                  marginLeft: '15px'
                }}
              >
                {elt[options['match']]}
              </div>
            </div>

            <div
              id={elt[options['id']]}
              className="info-labels">
              <div
                id={elt[options['id']]}
                className="info-block">
                <p id={elt[options['id']]} className="label">{options['id']}:</p>
                <p id={elt[options['id']]} className="value">{elt[options['id']]}</p>
              </div>
              {labels}
            </div>
          </div>

        </div>
      )
    })

    if (suggestions.length === 0) {
        suggestions = (
            <div className="candidate">
                No data, must reduce filter
            </div>
        )
    }

    return (
      <div>
        <div className='title'>
          <div style={{width: '50%'}}>
            {this.props.data.suggestions[0]['__fname']}
          </div>
          <div style={{align: 'right', width: '50%'}}>
            {`(${suggestions.length} candidates)`}
          </div>
        </div>
        <div className="suggestion-zone">
            {suggestions}
        </div>
      </div>
    )
  }

  addPrefix = (obj, prefix) => {
    Object.keys(obj).forEach(p => {
      obj[prefix + p] = obj[p]
      delete obj[p]
    })
    return obj
  }

  confirmCandidate = e => {
    const options = this.props.data['options']
    this.props.matchUpdate(
      this.props.data[options['id']],
      e.target.id,
      'match'
    )

    // Prepare data for direct save
    var matched = this.props.data.suggestions.find(elt => elt[elt['options']['id']].toString() === e.target.id)
    var target = this.props.data

    if (!matched) {
      console.log('\nERROR');
      return
    }

    // Delete useless data
    delete matched.options
    delete target.options
    delete target.suggestions

    //append prefix to attributes
    matched = this.addPrefix(matched, 'r_')
    target = this.addPrefix(target, 'l_')

    const load = {...target, ...matched}

    console.log('DIRECT SAVE');

    fetch('http://127.0.0.1:5000/direct-save/', {
      method: 'post',
      body: JSON.stringify({
        data: load,
        session: this.props.session
      })
    })
      .then(res => res.json())
      .then(data => console.log(data))
  }

  render () {
    return (
      <div>
          <div className="suggestion-block">
            { this.buildHeader() }
            { this.buildSuggestions() }
          </div>
      </div>
    )
  }
}
