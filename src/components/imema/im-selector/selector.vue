<template>
  <span class='el-form-item__label' v-if="curprops.readonly">{{selectVal.key}}</span>
  <el-select
    v-else
    :value="selectVal"
    :filterable="selType == 'dyamic'"
    :remote="selType == 'dyamic'"
    :automatic-dropdown="selType == 'dyamic'"
    :loading="loading"
    :remote-method="_selDyamicList"
    v-bind="curprops"
    @focus="e => _click(e)"
    @change="e => _selChange(e)">
    <el-option
      v-for="item in options"
      :key="item.key"
      :label="item.key"
      :value="item">
    </el-option>
  </el-select>
</template>

<script>
export default {
  props: {
    value: {
      type: String,
      default: ''
    },
    selprops: Object
  },
  data () {
    return {
      selectVal: this.value,
      loading: false,
      selPlaceholder: '',
      options: [],
      codeType: '',
      dType: '',
      selType: 'static',
      lock: false,
      curprops: this.selprops
    }
  },
  created () {
    
  },
  mounted () {
    this.init()
  },
  methods: {
    init() {
      if (this.curprops.dataType.includes('.')) {
        this.dType = this.curprops.dataType.split('.')[0]
        this.codeType = this.curprops.dataType.split('.')[1]
      } else {
        this.dType = this.curprops.dataType
      }
      this.selType = this.dType === 'biz' ? 'dyamic' : 'static'
      if (this.selType === 'static') {
        this._selLoadCode()
      }
    },
    _selLoadCode () {
      this.lock = true
      this._selDyamicList('').then(() => {
        this.lock = false
      })
    },
    async _selDyamicList (query) {
      this.loading = true
      if(!this.curprops.dataParam) {
        this.curprops.dataParam = {}
      }
      
      this.curprops.dataParam.query = query
      await this.$axios.post(
        '/common/' + this.dType.replace(/^\//, '') + '/' + this.codeType,
        this.curprops.dataParam
      ).then(res => {
        this.loading = false
        if (res && res.length > 0) {
          this.options = res
        } else { this.options = [] }
      })
    },
    _click(e) {
      this._selLoadCode()
    },
    _selChange (e) {
      this.selectVal = e
      this.$emit('change', e)
    },
    _setVal (e) {
      if (e.value && this.selType === 'dyamic') {
        this.options = [e]
      }
      if (e.value && this.selType === 'static') {
        let timer = setInterval(() => {
          if (!this.lock) {
            this.options.map(item => {
              if (this._.toString(e.value) === this._.toString(item.value)) { this.selectVal = item }
            })
            clearInterval(timer)
          }
        }, 500)
      } else { 
        this.selectVal = e 
      }
    },
    selpropsChange(props) {
      this.curprops = Object.assign({}, this.curprops, props)
    }
  },
  watch: {
    // 判断下拉框的值是否有改变
    value (val) {
      this.selectVal = val // ②监听外部对props属性result的变更，并同步到组件内的data属性myResult中
    },
    // ③组件内对myResult变更后向外部发送事件通知
    selectVal (val, oldVal) {
      this.$emit('input', val)
    }
  }
}
</script>

<style lang="scss" scoped>
.im-selector {

}
</style>
