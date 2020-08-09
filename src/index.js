import React from "react";
import ReactDOM from "react-dom";
import Uploader from './components/uploader'
import 'antd/dist/antd.css';

export default () => {
  return <Uploader imageUrlExtend={{ 'x-oss-process': 'style/preview' }}
    ossConfig={{
      accessKeyId: 'fake-4G2Huhqd3ByCdRczR9Lq', // oss的key_id
      accessKeySecret: 'fake-tp9yR1QIW4bGxukCKtX5yh79Gy', // oss的secret
      region: 'oss-cn-shanghai', // 地域节点
      bucket: 'xinglan', // bucket 名字
    }}
    antUploadParams={{
      accept: "image/*,.pdf,.xls,.xlsx,.ppt,.pptx,.doc,.docx",
      listType: "picture-card",
      className: "avatar-uploader",
      multiple: true
    }}
    fileLimit={8 * 1024 * 1024} // 8M
  />
}

