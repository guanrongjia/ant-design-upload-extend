## info

这个项目是对 ant design upload 组件的扩展，
专用于 oss 前端直传！！！！ 
支持以下文件的直传，预览，直接下载。
image/*,.pdf,.xls,.xlsx,.ppt,.pptx,.doc,.docx

注意： oss的key_id 和 oss的secret 需要填写自己的信息

## install
```shell
yarn add ant-design-upload-extend 
```
or
```shell
npm install ant-design-upload-extend 
```

## Usage

```javascript
<Uploader imageUrlExtend={{ 'x-oss-process': 'style/preview' }} 
        ossConfig={{accessKeyId: 'fake-4G2Huhqd3ByCdRczR9Lq', // oss的key_id
            accessKeySecret: 'fake-tp9yR1QIW4bGxukCKtX5yh79Gy', // oss的secret
            region: 'oss-cn-shanghai', // 地域节点
            bucket: 'xinglan', }}// bucket 名字
        antUploadParams={{accept: "image/*,.pdf,.xls,.xlsx,.ppt,.pptx,.doc,.docx",
            listType:"picture-card",
            className:"avatar-uploader",
            multiple:true}} 
        uploadTitle="请选择文件或图片"
        fileLimit={8 * 1024 * 1024} // 8M
        onSetFileList={(currentFileList) => { console.log('currentFileList', currentFileList) }}
    />
```

## props

| params          | info                           | extends                                                                                                                          |
| --------------- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| imageUrlExtend  | 图片 oss 处理后缀              | { 'x-oss-process': 'style/preview' }，这里的  x-oss-process是 oss 图片处理参数，  style/preview是规则别名，需要自行在 oss 中设置 |
| ossConfig       | oss 相关信息                   |
| antUploadParams | ant design upload 的所有参数， | 注意  accept只允许如下值，因为涉及到预览和直接下载: "image/*,.pdf,.xls,.xlsx,.ppt,.pptx,.doc,.docx",                             |
| fileLimit       | 文件大小限制                   | 默认值 8* 1024*1024， 8M                                                                                                         |
|uploadTitle| 上传文件按钮的文案|默认为 请选择文件或图片|
|onSetFileList |在文件上传后，删除后，返回最新的文件列表|结构为[{uid:'', name: '', status: 'done' or 'error', response: '' or '上传失败',  url,}]

## LICENSE

MIT


## ref 效果图
![效果图](https://xinglan.oss-cn-shanghai.aliyuncs.com/techangorder/1596953186868.jpg)