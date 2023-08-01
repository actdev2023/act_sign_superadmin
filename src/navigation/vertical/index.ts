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
      action: 'read',
      subject: 'pdf-list'
    },
    {
      title: 'Signed Documents',
      path: '/signed-documents',
      icon: 'tabler:file-check',
      action: 'read',
      subject: 'pdf-signed-list'
    },
    {
      title: 'Signature',
      path: '/signature',
      action: 'read',
      subject: 'signature',
      icon: 'tabler:signature',
    },
    {
      path: '/users',
      action: 'read',
      subject: 'users-page',
      title: 'Users',
      icon: 'tabler:users',
    },
    {
      path: '/acl',
      action: 'read',
      subject: 'acl-page',
      title: 'Access Control',
      icon: 'tabler:shield',
    }
  ]
}

export default navigation
