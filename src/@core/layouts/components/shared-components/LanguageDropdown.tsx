// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Import


// ** Custom Components Imports
import OptionsMenu from 'src/@core/components/option-menu'

// ** Type Import
import { Settings } from 'src/@core/context/settingsContext'

interface Props {
  settings: Settings
  saveSettings: (values: Settings) => void
}

const LanguageDropdown = ({ settings, saveSettings }: Props) => {
  // ** Hook
 

 
  return (
    <OptionsMenu
      iconButtonProps={{ color: 'inherit' }}
      icon={<Icon fontSize='1.5rem' icon='tabler:language' />}
      menuProps={{ sx: { '& .MuiMenu-paper': { mt: 4.5, minWidth: 130 } } }}
      options={[
        {
          text: 'English',
          menuItemProps: {
            sx: { py: 2 },
            
          }
        },
        {
          text: 'French',
          menuItemProps: {
            sx: { py: 2 },
            
          }
        },
        {
          text: 'Arabic',
          menuItemProps: {
            sx: { py: 2 },
            
          }
        }
      ]}
    />
  )
}

export default LanguageDropdown
