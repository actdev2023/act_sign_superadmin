// ** Type import
import { VerticalNavItemsType } from 'src/@core/layouts/types'

const navigation = (): VerticalNavItemsType => {
  return [
    {
      title: 'Home',
      path: '/home',
      icon: 'tabler:smart-home',
    },
    {
      title: 'PDF Documents',
      path: '/pdf-documents',
      icon: 'tabler:file',
    },
    {
      title: 'Signed Documents',
      path: '/signed-documents',
      icon: 'tabler:file-check',
    },
    {
      title: 'Signature',
      path: '/signature',
      icon: 'tabler:signature',
    },
    {
      path: '/users',
      title: 'Users',
      icon: 'tabler:users',
    },
    {
      path: '/acl',
      title: 'Access Control',
      icon: 'tabler:shield',
    }
  ]
}

export default navigation
