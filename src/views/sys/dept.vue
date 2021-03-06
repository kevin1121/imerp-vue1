<template>
  <d2-container class="mod-sys__user">
    <div class="shuruhead">
    <vxe-toolbar slot="header"  size="mini">
      <template v-slot:buttons>
        <el-input class="shuru" size="mini" v-model="filterName2" prefixIcon="el-icon-search" type="search" placeholder="根据名称查询"></el-input>
        <el-button
          v-if="$hasPermission('sys:dept:save')"
          type="primary"
          icon="el-icon-circle-plus"
          size="mini"
          @click="addOrUpdateData()"
        >{{ $t('views.public.add') }}</el-button>
      </template>
    </vxe-toolbar>
    </div>
    <vxe-grid
      border
      resizable
      v-loading="loading"
      highlight-hover-row
      size="mini"
      ref="pGrid"
      :data="list2"
      :columns="tableColumn"
      :tree-config="{ children: 'children', expandAll: !!filterName2, indent: 8}"
      :edit-config="{trigger: 'click', mode: 'row', showStatus: true}"
      >
    </vxe-grid>
    <!-- 弹窗, 新增 / 修改 -->
    <add-or-update v-if="addOrUpdateVisible" ref="addOrUpdate" @refreshDataList="search" />
  </d2-container>
</template>

<script>
import mixinViewModule from "@/mixins/view-module";
import AddOrUpdate from "./dept-add-or-update";
import XEUtils from "xe-utils"
import { type } from 'os';
import store from '@/store/index'
export default {
  mixins: [mixinViewModule],
  data() {
    return {
      mixinViewModuleOptions: {
        getDataListURL: "/sys/dept/select",
        getDataListIsPage: false,
        deleteURL: "/sys/dept/delete",
        deleteIsBatch: true,
        deleteIsBatchKey: 'deptId',
        exportURL: "/sys/dept/export"
      },  
       loading: true,
      filterName2: '',
      //增改
      addOrUpdateVisible: false,
      dataForm: {
        name: ""
      },
     
      dataFormOp: {
        name: "like"
      },
      tableColumn: [
        {
          title: '部门名称',
          field: 'name',
          sortable: true,
          width: 250,
          align: 'left',
          treeNode: true
        },
        {
          title: '上级部门名称',
          field: 'parentName',
          sortable: true,
          align: 'center'
        },
        {
          title: '类型',
          field: 'type',
          sortable: true,
          width: 110,
          align: 'center',
          slots: {
            default: ({ row }) => {
                      return [
                        <el-tag type={row.type===0?"primary":"success"}>
                        {row.type===0?"公司":"部门"}
                        </el-tag>
                      ]
                    }
          }
        },
        {
          title: '排序',
          field: 'orderNum',
          sortable: true,
          width: 110,
          align: 'center',
          slots: {
            default: ({ row }) => {
                      return [
                        <el-tag type="primary" v-show={row.isTop === 1 && row.currentId !==1 ? false:true} >
                        {row.orderNum}
                        </el-tag>
                      ]
                    }
          }
        },
        {
          title: '操作',
          field: 'other',
          width:170,
          sortable: true,
          align: 'center',
          slots: {
                    default: ({ row }) => {
                      return [
                        <el-button size="mini" icon="el-icon-edit" onClick={ () => this.addOrUpdateData(row) } type="primary" v-show={row.isTop === 1 && row.currentId !==1 ? false:true} >修改</el-button>,
                        <el-button size="mini" icon="el-icon-delete" type="danger" onClick={ () => this.deleteHandleSetter(row) }  v-show={row.isTop === 1 && row.currentId !==1 ? false:true} >删除</el-button>
                      ]
                    }
                  }
        }
      ]
    };
  },
  components: {
    AddOrUpdate
  },
  computed:{
    list2 () {
      let filterName = XEUtils.toString(this.filterName2).trim().toLowerCase()
      if (filterName) {
        let filterRE = new RegExp(filterName, 'gi')
        let options = { children: 'children' }
        let searchProps = ['name', 'parentName']
        let rest = XEUtils.searchTree(this.dataList, item => searchProps.some(key => XEUtils.toString(item[key]).toLowerCase().indexOf(filterName) > -1), options)
        XEUtils.eachTree(rest, item => {
          searchProps.forEach(key => {
            //item[key] = XEUtils.toString(item[key]).replace(filterRE, match => `<span class="keyword-lighten">${match}</span>`)
          })
        }, options)
        return rest
      }
      this.loading=false
      return this.dataList
    }
  },
   mounted() {
    this.getDataList()
  },
  
  methods: {
  
    //增改
  async addOrUpdateData (row) {
     debugger
      this.addOrUpdateVisible = true;
      const user = await store.dispatch('d2admin/db/get',{
        dbName: 'sys',
        path: 'user.info',
        defaultValue: {},
        user: true
        }, { root: true })
      this.$refs.addOrUpdate.dataForm.currentId = user.id
      if (row) {
        this.$nextTick(() => {
          this.$refs.addOrUpdate.dataForm.id = row.deptId;
          this.$refs.addOrUpdate.update(row);
        })
      } else {
        this.$nextTick(() => { 
          this.$refs.addOrUpdate.init();
        })
      }
    },
     // 删除
    deleteHandleSetter (index) {
      let data
      if (this.mixinViewModuleOptions.deleteIsBatch && this.dataListSelections.length > 0) {
        data = this.dataListSelections.map(item => item[this.mixinViewModuleOptions.deleteIsBatchKey])
      }
      let row
      if (!index) {
        row = undefined
      } else {
        row = index
      }
      if (row) {
        const id = row.deptId
        if (id) {
          data = [id]
        }
      }
      this.$confirm(this.$t('public.prompt.info', { 'handle': this.$t('views.public.delete') }), this.$t('public.prompt.title'), {
        confirmButtonText: this.$t('views.public.confirm'),
        cancelButtonText: this.$t('views.public.cancel'),
        type: 'warning'
      }).then(() => {
        this.$axios.post(
          `${this.mixinViewModuleOptions.deleteURL}${this.mixinViewModuleOptions.deleteIsBatch ? '' : '/' + id}`,
          this.mixinViewModuleOptions.deleteIsBatch ? {
            'data': data
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
    }
  }
}
</script>

<style  type="text/css">
.shuru{
display: inline-block;
font-size: 14px;
width: 180px;
padding-right: 10px;
}
.shuruhead{
  padding: 0px 0px 0px 0px;
}
</style>
