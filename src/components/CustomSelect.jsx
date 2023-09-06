import React, { useState, useEffect, useRef } from 'react'
import '../styles/styles.css' // Подключите свои стили здесь

export const CustomSelect = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedOption, setSelectedOption] = useState('')
  const selectRef = useRef(null)

  const options = ['Simple', 'Advanced']

  const handleToggle = () => {
    setIsOpen(!isOpen)
  }

  const handleOptionClick = (option) => {
    setSelectedOption(option)
    setIsOpen(false)
  }

  const handleClickOutside = (event) => {
    if (selectRef.current && !selectRef.current.contains(event.target)) {
      setIsOpen(false)
    }
  }

  useEffect(() => {
    document.addEventListener('click', handleClickOutside)

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [])

  return (
    <div className='custom-select' ref={selectRef}>
      <button className='select-toggle' onClick={handleToggle}>
        {selectedOption || 'Choose Mode'}
      </button>
      {isOpen && (
        <ul className='select-options'>
          {options.map((option, index) => (
            <li key={index} onClick={() => handleOptionClick(option)}>
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
