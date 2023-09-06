import { Link } from 'react-router-dom'
import '../styles/NotFound.css'

export const NotFound = () => {
  return (
    <div className='body1'>
      <div className='container1'>
        <h1 className='h11'>404</h1>
        <p className='p1'>
          Oops! The session you are looking for does not exist.
        </p>
        <Link to='/'>
          <button className='btn-back'>Go Back to Home</button>
        </Link>
      </div>
    </div>
  )
}
