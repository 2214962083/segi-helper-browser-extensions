import {DefaultIcon, IconPack} from './file-icons-types'

export interface FolderIcon {
  /**
   * Name of the icon, e.g. 'src'
   */
  name: string

  /**
   * Define the folder names that should apply the icon.
   * E.g. ['src', 'source']
   */
  folderNames: string[]

  /**
   * Define if there is a light icon available.
   */
  light?: boolean

  /**
   * Define if there is a high contrast icon available.
   */
  highContrast?: boolean

  /**
   * Define if the icon should be disabled.
   */
  disabled?: boolean

  /**
   * Defines a pack to which this icon belongs. A pack can be toggled and all icons inside this pack can be enabled or disabled together.
   */
  enabledFor?: IconPack[]
}

export interface FolderTheme {
  /**
   * Name of the theme
   */
  name: string

  /**
   * Define the default icon for folders in a theme.
   */
  defaultIcon: DefaultIcon

  /**
   * Icon for root folders.
   */
  rootFolder?: DefaultIcon

  /**
   * Defines folder icons for specific folder names.
   */
  icons?: FolderIcon[]
}
