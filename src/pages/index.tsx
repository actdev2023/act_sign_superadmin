// ** React Imports
import { useEffect } from 'react'

// ** Next Imports
import { useRouter } from 'next/router'

// ** Spinner Import
import Spinner from 'src/@core/components/spinner'


// ** Hook Imports


/**
 *  Set Home URL based on User Roles
 */
export const getHomeRoute = (role: string) => {
  if (role === 'client') return '/acl'
  else return '/home'
}

const Home = () => {
  // ** Hooks
 
  const router = useRouter()

  useEffect(() => {
    // if (auth.user && router.route === '/') {
    //   router.replace('/home')
    // }

  
     

      // Redirect user to Home URL
    
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ router])

  return <Spinner sx={{ height: '100%' }} />
}

export default Home
