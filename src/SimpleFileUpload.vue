<template>
<div class="example-full">
  <div v-show="$refs.upload && $refs.upload.dropActive" class="drop-active">
		<h3>Drop files to upload</h3>
  </div>
  <div class="upload" v-show="!isOption">
    <div class="table-responsive">
      <table class="table table-hover">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Size</th>
            <th>Speed</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!files.length">
            <td colspan="9">
              <div class="text-center p-5">
                <h4>Drop files anywhere to upload<br/>or</h4>
                <label :for="name" class="btn btn-lg btn-primary">Select Files</label>
              </div>
            </td>
          </tr>
          <tr v-for="(file, index) in files" :key="file.id">
            <td>{{index}}</td>
            <td>
              <div class="filename">
                {{file.name}}
              </div>
              <div class="progress" v-if="file.active || file.progress !== '0.00'">
                <div :class="{'progress-bar': true, 'progress-bar-striped': true, 'bg-danger': file.error, 'progress-bar-animated': file.active}" role="progressbar" :style="{width: file.progress + '%'}">{{file.progress}}%</div>
              </div>
            </td>
            <td>{{file.size}}</td>
            <td>{{file.speed}}</td>

            <td v-if="file.error">{{file.error}}</td>
            <td v-else-if="file.success">success</td>
            <td v-else-if="file.active">active</td>
            <td v-else></td>
            <td>
              <div class="btn-group">
                <button class="btn btn-secondary btn-sm dropdown-toggle" type="button">
                  Action
                </button>
                <div class="dropdown-menu">
                  <a :class="{'dropdown-item': true, disabled: !file.active}" href="#" @click.prevent="file.active ? $refs.upload.update(file, {error: 'cancel'}) : false">Cancel</a>

                  <a class="dropdown-item" href="#" v-if="file.error && file.error !== 'compressing' && file.error !== 'image parsing' && $refs.upload.features.html5" @click.prevent="$refs.upload.update(file, {active: true, error: '', progress: '0.00'})">Retry upload</a>
                  <a :class="{'dropdown-item': true, disabled: file.success || file.error === 'compressing' || file.error === 'image parsing'}" href="#" v-else @click.prevent="file.success || file.error === 'compressing' || file.error === 'image parsing' ? false : $refs.upload.update(file, {active: true})">Upload</a>

                  <div class="dropdown-divider"></div>
                  <a :class="{'dropdown-item': true, disabled: file.success}" href="#" @click.prevent="$refs.upload.remove(file)">Remove</a>
                  <a :class="{'dropdown-item': true, disabled: !file.success}" href="#" @click.prevent="deleteFile(file)">Delete</a>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="example-foorer">
      <div class="footer-status float-right">
        Drop: {{$refs.upload ? $refs.upload.drop : false}},
        Active: {{$refs.upload ? $refs.upload.active : false}},
        Uploaded: {{$refs.upload ? $refs.upload.uploaded : true}},
        Drop active: {{$refs.upload ? $refs.upload.dropActive : false}}
      </div>
      <div class="btn-group">
        <file-upload
          class="btn btn-primary dropdown-toggle"
          :custom-action="customAction"
          :multiple="multiple"
          :directory="directory"
          :create-directory="createDirectory"
          :size="size || 0"
          :headers="headers"
          :data="data"
          :drop="drop"
          :drop-directory="dropDirectory"
          :add-index="addIndex"
          v-model="files"
          ref="upload">
          <i class="fa fa-plus"></i>
          Select
        </file-upload>
        <div class="dropdown-menu">
          <label class="dropdown-item" :for="name">Add files</label>
          <a class="dropdown-item" href="#" @click="onAddFolder">Add folder</a>
          <a class="dropdown-item" href="#" @click.prevent="addData.show = true">Add data</a>
        </div>
      </div>
      <button type="button" class="btn btn-success" v-if="!$refs.upload || !$refs.upload.active" @click.prevent="$refs.upload.active = true">
        <i class="fa fa-arrow-up" aria-hidden="true"></i>
        Start Upload
      </button>
      <button type="button" class="btn btn-danger"  v-else @click.prevent="$refs.upload.active = false">
        <i class="fa fa-stop" aria-hidden="true"></i>
        Stop Upload
      </button>
    </div>
  </div>


</div>
</template>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@4.0.0-beta/dist/css/bootstrap.min.css" rel="stylesheet" />
<link href="https://cdn.jsdelivr.net/npm/font-awesome/css/font-awesome.min.css" rel="stylesheet" />
<link href="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release/build/styles/atom-one-light.min.css" rel="stylesheet" />
<link href="https://cdn.jsdelivr.net/npm/cropperjs/dist/cropper.css" rel="stylesheet" />
<style>

@import "https://cdn.jsdelivr.net/npm/bootstrap@4.0.0-beta/dist/css/bootstrap.min.css";
@import "https://cdn.jsdelivr.net/npm/font-awesome/css/font-awesome.min.css";
@import "https://cdn.jsdelivr.net/gh/highlightjs/cdn-release/build/styles/atom-one-light.min.css";
@import "https://cdn.jsdelivr.net/npm/cropperjs/dist/cropper.css";

.file-uploads {
  overflow: hidden;
  position: relative;
  text-align: center;
  display: inline-block;
}
.file-uploads.file-uploads-html4 input, .file-uploads.file-uploads-html5 label {
  /* background fix ie  click */
  background: #fff;
  opacity: 0;
  font-size: 20em;
  z-index: 1;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  width: 100%;
  height: 100%;
}
.file-uploads.file-uploads-html5 input, .file-uploads.file-uploads-html4 label {
  /* background fix ie  click */
  background: rgba(255, 255, 255, 0);
  overflow: hidden;
  position: fixed;
  width: 1px;
  height: 1px;
  z-index: -1;
  opacity: 0;
}


.example-full .btn-group .dropdown-menu {
  display: block;
  visibility: hidden;
  transition: all .2s
}
.example-full .btn-group:hover > .dropdown-menu {
  visibility: visible;
}

.example-full label.dropdown-item {
  margin-bottom: 0;
}

.example-full .btn-group .dropdown-toggle {
  margin-right: .6rem
}

.td-image-thumb {
  max-width: 4em;
  max-height: 4em;
}

.example-full .filename {
  margin-bottom: .3rem
}

.example-full .btn-is-option {
  margin-top: 0.25rem;
}
.example-full .example-foorer {
  padding: .5rem 0;
  border-top: 1px solid #e9ecef;
  border-bottom: 1px solid #e9ecef;
}


.example-full .edit-image img {
  max-width: 100%;
}

.example-full .edit-image-tool {
  margin-top: .6rem;
}

.example-full .edit-image-tool .btn-group{
  margin-right: .6rem;
}

.example-full .footer-status {
  padding-top: .4rem;
}

.example-full .drop-active {
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  position: fixed;
  z-index: 9999;
  opacity: .6;
  text-align: center;
  background: #000;
}

.example-full .drop-active h3 {
  margin: -.5em 0 0;
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  -webkit-transform: translateY(-50%);
  -ms-transform: translateY(-50%);
  transform: translateY(-50%);
  font-size: 40px;
  color: #fff;
  padding: 0;
}
</style>

<script>
// import FileUpload from 'vue-upload-component'
import axios from "axios";

const sprintf = require('sprintf-js').sprintf;
export default {
  components: {
    // FileUpload,
  },

  props: ["loadFiles"],

  data() {
    return {
      files: [],
      data: null,
      headers: null,
      minSize: 1024,
      size: 1024 * 1024 * 10,
      multiple: true,
      directory: false,
      drop: true,
      dropDirectory: true,
      createDirectory: false,
      addIndex: false,
      thread: 3,
      name: 'file',
      customAction: async (file, component) => {
        const recordUrl = this.$parent.fileCreateUrl
        const token = await this.$parent.getAccessToken()
        const recordId = this.$parent.recordId

        const url = sprintf(recordUrl, recordId)
        const form = new window.FormData()
        form.append(this.name, file.file, file.file.name || file.file.filename  || file.name)
        await axios.post(url, form, {headers: {'Content-Type': 'multipart/form-data'}, params: {"access_token": token}}).then((resp) => {
          file.response.id = resp.data.file_name ? resp.data.file_name : resp.data.id
        })
      },

      autoCompress: 1024 * 1024,
      uploadAuto: false,
      isOption: false,

      addData: {
        show: false,
        name: '',
        type: '',
        content: '',
      },


      editFile: {
        show: false,
        name: '',
      }
    }
  },

  created: function() {
    this.showRecord()
  },

  watch: {

    'addData.show'(show) {
      if (show) {
        this.addData.name = ''
        this.addData.type = ''
        this.addData.content = ''
      }
    },
    'loadFiles'(load) {
      if(load){
        this.showRecord()
      }
    },
  },

  methods: {
    showRecord() {
      this.listFiles()
      this.$emit('finishedListFiles')
    },
    async listFiles() {
      const filesUrl = this.$parent.fileReadUrl
      const recordId = this.$parent.recordId

      const url = sprintf(filesUrl, recordId)
      const token = await this.$parent.getAccessToken()
      return await axios.get(url, {params: {"access_token": token}}).then((resp) => {
        const files = []
        const respData = this.$parent.filesKey ? resp.data[this.$parent.filesKey] : resp.data
        respData.forEach((f, index) => {
          files.push({
            "name": f.file_name ? f.file_name : f.filename,
            "size": f.size ? f.size : f.filesize,
            "response": {"id": f.file_name ? f.file_name : f.id},
            "upload": false,
            "active": false,
            "progress": '0.00',
            "success": true,
            "speed": 0,
            // these are required for remove to work
            "fileObject": null,
            "type": null,
            "error": null,
            "putAction": null,
            "postAction": null,
            "timeout": null,
            "id": f.file_name ? f.file_name : f.id,
            "file": null,
            "data": null,
            "headers": null})
        })
        this.files = files
      })
    },
    async deleteFile(file) {
      // 899159
      const fileUrl = this.$parent.fileDeleteUrl
      const recordId = this.$parent.recordId
      const url = sprintf(fileUrl, recordId, file.response.id)
      const token = await this.$parent.getAccessToken()
      await axios.delete(url, {params: {"access_token": token}}).then((resp) => {
        if(!this.$refs.upload.remove(file.id)){
          this.$parent.message = "file was deleted but failed to remove from listing"
        }
      }).catch((error) => {
        this.$parent.message = error.message
      })
    },

    // add folder
    onAddFolder() {
      if (!this.$refs.upload.features.directory) {
        this.alert('Your browser does not support')
        return
      }
      const input = document.createElement('input')
      input.style = "background: rgba(255, 255, 255, 0);overflow: hidden;position: fixed;width: 1px;height: 1px;z-index: -1;opacity: 0;"
      input.type = 'file'
      input.setAttribute('allowdirs', true)
      input.setAttribute('directory', true)
      input.setAttribute('webkitdirectory', true)
      input.multiple = true
      document.querySelector("body").appendChild(input)
      input.click()
      input.onchange = (e) => {
        this.$refs.upload.addInputFile(input).then(function() {
          document.querySelector("body").removeChild(input)
        })
      }
    }
  }
}
</script>
