import {ElIcon} from 'element-plus'
import {Component, defineComponent, h, ref, toRefs, watch} from 'vue'
import {getIconComponentByIconName} from '../utils/file-icon-utils'

export default defineComponent({
  name: 'DynamicIcon',
  props: {
    /**
     * 图标名称
     */
    name: {
      type: String
    },
    /**
     * 文件夹是否打开
     */
    isOpen: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const MyIcon = ref<Component>()
    const {name, isOpen} = toRefs(props)

    watch(
      [name, isOpen],
      async () => {
        let iconName = name.value
        if (!iconName) return

        // 如果是文件夹 icon， 并且文件夹处于打开状态，则使用文件夹打开图标
        iconName = iconName.startsWith('folder-') && isOpen.value ? `${iconName}-open` : iconName
        MyIcon.value = getIconComponentByIconName(iconName)
      },
      {
        immediate: true
      }
    )

    return () =>
      MyIcon.value
        ? h(
            ElIcon,
            {},
            {
              default: () => h(MyIcon.value as Component)
            }
          )
        : null
  }
})
