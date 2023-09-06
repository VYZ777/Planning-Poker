import '../styles/styles.css'

export const Input = ({ value, handleChange }) => {
  return (
    <div>
      <input
        className='timer-input'
        type='number'
        value={value}
        onChange={handleChange}
      />
    </div>
  )
}
