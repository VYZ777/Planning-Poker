import React, { useState } from 'react'
import '../styles/styles.css'

export const CopyButton = ({ text }) => {
  const [isCopied, setIsCopied] = useState(false)

  const handleCopyClick = () => {
    const textarea = document.createElement('textarea')
    textarea.value = text

    document.body.appendChild(textarea)

    textarea.select()

    document.execCommand('copy')

    document.body.removeChild(textarea)

    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 3000)
  }

  return (
    <button className='button-copy' onClick={handleCopyClick}>
      {isCopied ? 'Copied!' : 'Copy'}
    </button>
  )
}
