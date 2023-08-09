// ** React Imports
import { ReactNode } from 'react'

// ** Component Imports


// ** Types


interface Props {
  children: ReactNode
}

const CanViewNavGroup = (props: Props) => {
  // ** Props
  const { children } = props

  return <>{children}</> 
}

export default CanViewNavGroup
