import qs from 'qs'
export default {
  data () {
    /* eslint-disable */
    return {
      // 设置属性
      mixinViewModuleOptions: {
        activatedIsNeed: true,    // 此页面是否在激活（进入）时，调用查询数据列表接口？
        getDataListURL: '',       // 数据列表接口，API地址
        getDataListIsPage: false, // 数据列表接口，是否需要分页？
        deleteURL: '',            // 删除接口，API地址
        deleteIsBatch: false,     // 删除接口，是否需要批量？
        deleteIsBatchKey: 'id',   // 删除接口，批量状态下由那个key进行标记操作？比如：pid，uid...
        exportURL: ''             // 导出接口，API地址
      },
      // 默认属性
      dataForm: {},               // 查询条件
      dataFormOp: {},             // 查询条件操作
      dataList: [],               // 数据列表
      order: '',                  // 排序，asc／desc
      orderField: '',             // 排序，字段
      page: 1,                    // 当前页码
      limit: 10,                  // 每页数
      total: 0,                   // 总条数
      dataListLoading: false,     // 数据列表，loading状态
      dataListSelections: [],     // 数据列表，多选项
      addOrUpdateVisible: false,   // 新增／更新，弹窗visible状态
      // 表格属性
      selectionRow: false,
      options: {
        size: 'mini',
        stripe: true,
        border: true
      }
    }
    /* eslint-enable */
  },
  activated () {
    if (this.mixinViewModuleOptions.activatedIsNeed) {
      this.getDataList()
    }
  },
  created () {
    if (this.mixinViewModuleOptions.activatedIsNeed) {
      this.getDataList()
    }
  },
  methods: {
    // 获取数据列表
    getDataList () {
      this.dataListLoading = true
      this.$axios.post(
        this.mixinViewModuleOptions.getDataListURL,
        {
          pageForm: {
            order: this.order,
            orderField: this.orderField,
            page: this.mixinViewModuleOptions.getDataListIsPage ? this.page : null,
            limit: this.mixinViewModuleOptions.getDataListIsPage ? this.limit : null
          },
          dataForm: {
            data: this.dataForm,
            op: this.dataFormOp
          }
        }
      ).then(res => {
        this.dataListLoading = false
        this.dataList = this.mixinViewModuleOptions.getDataListIsPage ? res.list : res
        this.total = this.mixinViewModuleOptions.getDataListIsPage ? res.totalCount : 0
<<<<<<< .mine
        this.dataList = this.mixinViewModuleOptions.getDataListIsPage ? res.list : res
        this.total = this.mixinViewModuleOptions.getDataListIsPage ? res.totalCount : 0
=======
        this.dataList = this.mixinViewModuleOptions.getDataListIsPage ? res.list : res
        this.total = this.mixinViewModuleOptions.getDataListIsPage ? res.total : 0
>>>>>>> .theirs
      }).catch(() => {
        this.dataList = []
        this.total = 0
        this.dataListLoading = false
      })
    },
    // 多选
    dataListSelectionChangeHandle (val) {
      this.dataListSelections = val
    },
    // 排序
    dataListSortChangeHandle (data) {
      if (!data.order || !data.prop) {
        this.order = ''
        this.orderField = ''
        return false
      }
      this.order = data.order.replace(/ending$/, '')
      this.orderField = data.prop.replace(/([A-Z])/g, '_$1').toLowerCase()
      this.getDataList()
    },
    // 分页, 每页条数
    pageSizeChangeHandle (val) {
      this.page = 1
      this.limit = val
      this.getDataList()
    },
    // 分页, 当前页
    pageCurrentChangeHandle (val) {
      this.page = val
      this.getDataList()
    },
    // 新增 / 修改
    addOrUpdateHandle ({index, row}) {
      this.addOrUpdateVisible = true
      if(index) {
        this.$nextTick(() => {
          this.$refs.addOrUpdate.dataForm.id = row.id
          this.$refs.addOrUpdate.init()
        })
      } else {
        this.$refs.addOrUpdate.init()
      }
    },
    // 删除
    deleteHandle ({index, row}) {
      const id = row.id
      if (this.mixinViewModuleOptions.deleteIsBatch && !id && this.dataListSelections.length <= 0) {
        return this.$message({
          message: this.$t('public.prompt.deleteBatch'),
          type: 'warning',
          duration: 500
        })
      }
      this.$confirm(this.$t('public.prompt.info', { 'handle': this.$t('views.public.delete') }), this.$t('public.prompt.title'), {
        confirmButtonText: this.$t('views.public.confirm'),
        cancelButtonText: this.$t('views.public.cancel'),
        type: 'warning'
      }).then(() => {
        this.$axios.delete(
          `${this.mixinViewModuleOptions.deleteURL}${this.mixinViewModuleOptions.deleteIsBatch ? '' : '/' + id}`,
          this.mixinViewModuleOptions.deleteIsBatch ? {
            'data': id ? [id] : this.dataListSelections.map(item => item[this.mixinViewModuleOptions.deleteIsBatchKey])
          } : {}
        ).then(res => {
          this.$message({
            message: this.$t('views.public.success'),
            type: 'success',
            duration: 500,
            onClose: () => {
              this.getDataList()
            }
          })
        }).catch(() => {})
      }).catch(() => {})
    },
    // 导出
    exportHandle () {
      var params = qs.stringify({
        'token': cookieGet('token'),
        ...this.dataForm
      })
      window.location.href = `${window.SITE_CONFIG['apiURL']}${this.mixinViewModuleOptions.exportURL}?${params}`
    }
  }
}
