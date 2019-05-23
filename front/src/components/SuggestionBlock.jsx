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
        <h4>{this.props.data['__fname']}</h4>

        <div className="header">

          <h3>{this.props.data[options['match']]}</h3>

          <div className="info-labels">
            <div className="info-block">
              <p className="label">{options['id']}:</p>
              <p className="value">{this.props.data[options['id']]}</p>
            </div>
            {labels}
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
        .sort((a,b) => a[a.options['match']] - b[b.options['match']])
        .filter(a => a.common >= this.props.common)
        .map((elt, i) => {

            const labels = options['infoLabels'].map((l, i) => {
              return(
                <div
                  key={`${elt[options['id']]}-label-{i}`}
                  className="info-block"
                >
                  <p className="label">{l}:</p>
                  <p className="value">{elt[l]}</p>
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
            style={{
              backgroundColor: '#956060',
              height: '100%',
              width: '15%',
              border: '1px',
              borderColor: '#DAD7D7',
              borderStyle: 'solid'
            }}
          ></div>

          <div style={{height: '100%', width: '80%'}}>
            <h3
              id={elt[options['id']]}
            >{elt[options['match']]}</h3>

            <div className="info-labels">
              <div className="info-block">
                <p className="label">{options['id']}:</p>
                <p className="value">{elt[options['id']]}</p>
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
        <h4>{`${this.props.data.suggestions[0]['__fname']} (${suggestions.length} candidates)`}</h4>
        <div className="suggestion-zone">
            {suggestions}
        </div>
      </div>
    )
  }

  confirmCandidate = e => {
    const options = this.props.data['options']

    console.log(parseInt(this.props.data[options['id']]), parseInt(e.target.id));

    this.props.matchUpdate(
      parseInt(this.props.data[options['id']]),
      parseInt(e.target.id),
      'match'
    )
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
