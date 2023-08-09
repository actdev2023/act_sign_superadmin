// ** React Imports
import { ReactNode } from 'react'





interface Props {
  children: ReactNode
}

const CanViewNavLink = (props: Props) => {
  // ** Props
  const { children } = props


  return  <>{children}</> 
}

export default CanViewNavLink
