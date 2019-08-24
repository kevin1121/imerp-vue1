import imSelector from './selector.vue'
export default {
  name: 'im-selector',
  components: {
    imSelector
  },
  data () {
    return {
      mapKey: 'key',
      mapVal: 'value'
    }
  },
  props: {
    value: [String, Number],
    // 容器样式
    type: {
      type: String,
      required: false,
      default: 'select'
    },
    // 组件业务类型
    dataType: {
      type: String,
      required: true
    },
    // 对应绑定的form表单
    mapModel: {
      type: [Object, Function],
      default: () => ({})
    },
    // 下拉框对象的下拉显示属性-对应的值
    mapKeyVal: {
      type: String,
      required: false
    },
    clearable: {
      type: Boolean,
      default: true
    },
    placeholder: String,
    selprops: Object
  },
  computed: {
    // 始终返回渲染组件
    component () {
      if (this.type === 'select') return imSelector
      else {
        return 'div'
      }
    }
  },
  render (h) {
    return h('div', {
      ref: 'selector',
      class: 'selector-component'
    }, [
      h(this.component, {
        ref: 'component',
        props: {
          dataType: this.dataType,
          placeholder: this.placeholder,
          clearable: this.clearable,
          selprops: this.selprops
        },
        on: {
          change: e => this.$emit('change', e),
          input: e => {
            if (!e.value) {
              this.mapModel[this.mapKey] = this.mapModel[this.mapVal] = null
            } else {
              this.mapModel[this.mapKey] = e.key
              this.mapModel[this.mapVal] = e.value
            }
          }
        }
      })
    ])
  },
  methods: {

  },
  watch: {
    value: function (val, oldVal) {
      let obj = {
        key: this.mapModel[this.mapKey],
        value: this.mapModel[this.mapVal]
      }
      this.$refs.component._setVal(obj)
    }
  },
  created () {
    if (this.mapKeyVal) {
      let kv = this.mapKeyVal.split(':')
      if (kv.length === 2) {
        this.mapKey = kv[0]
        this.mapVal = kv[1]
      } else {
        this.mapKey = this.mapVal = this.mapKeyVal
      }
    }
  },
  mounted () {
    this.$nextTick(() => {
      let obj = {
        key: this.mapModel[this.mapKey],
        value: this.mapModel[this.mapVal]
      }
      this.$refs.component._setVal(obj)
    })
  }
}
