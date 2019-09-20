import React, { Component } from 'react'
import PropTypes from 'prop-types'
import '../stylesheets/DownloadForm.scss'

class DownloadForm extends Component {
  componentDidMount () {
  }

  render () {
    return (
      <form className='downloadForm' onSubmit={this.props.onSubmit}>
        <input className='downloadForm__input' type='text' />
        <input type="checkbox" className='downloadForm__checkbox' title='Only MP3' />
        <button className='downloadForm__btn'>▶</button>
      </form>
    )
  }
}

DownloadForm.propTypes = {
  onSubmit: PropTypes.func
}

export default DownloadForm
