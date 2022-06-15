import {ElMenuItem, ElSubMenu} from 'element-plus'
import {FunctionalComponent, PropType} from 'vue'
import {Menu} from './menu.type'

export const MenuItem: FunctionalComponent<{menu: Menu}> = props => {
  const menu = props.menu
  return !menu.children || !menu.children.length ? (
    <ElMenuItem key={menu.key} index={menu.key}>
      {menu.title}
    </ElMenuItem>
  ) : (
    <ElSubMenu key={menu.key} index={menu.key}>
      {{
        title: () => menu.title,
        default: () => menu.children!.map(child => <MenuItem menu={child} key={child.key} />)
      }}
    </ElSubMenu>
  )
}

MenuItem.props = {
  menu: {
    type: Object as PropType<Menu>,
    default: () => ({})
  }
}
