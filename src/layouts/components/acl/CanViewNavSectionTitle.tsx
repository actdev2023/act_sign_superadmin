// ** React Imports
import { ReactNode } from 'react'


interface Props {
  children: ReactNode
}

const CanViewNavSectionTitle = (props: Props) => {
  // ** Props
  const { children } = props



  return  <>{children}</> 
}

export default CanViewNavSectionTitle
