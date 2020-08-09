// components/Example.js
import { remove, cloneDeep } from 'lodash';
import oss from 'ali-oss';
import momentObj from 'moment';
import urlJoin from 'proper-url-join';
import React, { PureComponent } from 'react';
import { Upload, message, Spin, Modal } from 'antd';
import { saveFileToLink } from 'web-downloadfile';
import { PlusOutlined } from '@ant-design/icons';

function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

const uploadPath = file =>
  `techangorder/${momentObj().format('YYYYMMDD')}/${file.name.substring(
    0,
    file.name.lastIndexOf('.'),
  )}-${file.uid}.${file.name.replace(/.*\./, '')}`;

class Uploader extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      updateLoading: false,
      previewVisible: false,
      previewImage: '',
      previewTitle: '',
      fileList: [],
    };
  }

  uploadToOss = file => {
    const { ossConfig } = this.props;
    const url = uploadPath(file);
    return new Promise((resolve, reject) => {
      // eslint-disable-next-line new-cap
      new oss(ossConfig)
        .multipartUpload(url, file)
        .then(data => {
          resolve({ ...data, fileName: file.name });
        })
        .catch(error => {
          reject(error);
          message.error('上传文件失败!');
        });
    });
  };

  // 预览文件
  handlePreview = async file => {
    // word excel ppt 等预览 https://juejin.im/post/6844903561017425927
    // 预览图片
    if (this.judgeFileType(file.url) === 'image') {
      if (!file.url && !file.preview) {
        file.preview = await getBase64(file.originFileObj);
      }
      this.setState({
        previewImage: file.preview || file.url,
        previewVisible: true,
        previewTitle: file.name || file.url.substring(file.url.lastIndexOf('/') + 1),
      });
    }
    // 预览 pdf
    else if (this.judgeFileType(file.url) === 'pdf') {
      window.open(file.url, 'PDF');
    }
    // 预览 xlsx，ppt，word
    else if (this.judgeFileType(file.url) === 'office') {
      // https://view.officeapps.live.com/op/view.aspx?src=https://xinglan.oss-cn-shanghai.aliyuncs.com/techangorder/20200807/2017-5-11.xlsx
      window.open(`https://view.officeapps.live.com/op/view.aspx?src=${file.url}`);
    } else {
      message.error('预览失败，仅支持 image/*,.pdf,.xls,.xlsx,.ppt,.pptx,.doc,.docx 的预览');
    }
  };

  // 关闭预览
  handleCancel = () => this.setState({ previewVisible: false });

  // 判断文件属性
  judgeFileType = fileName => {
    const urlObj = fileName.split('?')[0];
    // 后缀获取
    let suffix = '';
    // 图片格式
    const imgTypes = ['png', 'jpg', 'jpeg', 'bmp', 'gif'];
    // pdf 格式
    const pdflTypes = ['pdf'];
    // office 格式
    const officeTypes = ['xls', 'xlsx', 'ppt', 'pptx', 'doc', 'docx'];

    const flieArr = urlObj.split('.');
    suffix = flieArr[flieArr.length - 1];
    if (suffix !== '') {
      suffix = suffix.toLocaleLowerCase();
      // 进行图片匹配
      if (imgTypes.find(item => item === suffix)) {
        return 'image';
      }
      // pdf 匹配
      if (pdflTypes.find(item => item === suffix)) {
        return 'pdf';
      }
      // office 匹配
      if (officeTypes.find(item => item === suffix)) {
        return 'office';
      }
    }
    return null;
  };

  // 删除文件
  handleRemove = file => {
    const { fileList } = this.state;
    const newFileList = cloneDeep(fileList);
    remove(newFileList, fileItem => fileItem.uid === file.uid);
    this.setState({ fileList: newFileList });
  };

  downloadIamge = (imgsrc, name) => {
    // 下载图片地址和图片名
    const image = new Image();
    // 解决跨域 Canvas 污染问题
    image.setAttribute('crossOrigin', 'anonymous');
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const context = canvas.getContext('2d');
      context.drawImage(image, 0, 0, image.width, image.height);
      const url = canvas.toDataURL('image/png'); // 得到图片的base64编码数据
      const a = document.createElement('a'); // 生成一个a元素
      const event = new MouseEvent('click'); // 创建一个单击事件
      a.download = name || 'photo'; // 设置图片名称
      a.href = url; // 将生成的URL设置为a.href属性
      a.dispatchEvent(event); // 触发a的单击事件
    };
    image.src = imgsrc;
  };

  downloadOffice = (url, name) => {
    try {
      const element = document.createElement('a');
      element.href = url;
      element.download = name;
      const a = document.body.appendChild(element);
      a.click();
      document.body.removeChild(element);
    } catch (e) {
      message.error('下载文件出错，请稍后重试');
    }
  };

  beforeUpload = file => {
    const { ossConfig, fileLimit = 8 * 1024 * 1024 } = this.props;
    if (file.size > fileLimit) {
      message.error('不能上传超过 8MB 的文件!');
      return false;
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      this.setState({ updateLoading: true });
      // 使用ossupload覆盖默认的上传方法
      this.uploadToOss(file)
        .then(data => {
          const { fileList } = this.state;
          let url = `https://${ossConfig.bucket}.panwecat.com/${data.name}`;
          if (this.judgeFileType(url) === 'office') {
            url = `https://${ossConfig.bucket}.${ossConfig.region}.aliyuncs.com/${data.name}`;
          }
          fileList.push({
            uid: data.res.headers['x-oss-request-id'],
            name: data.fileName,
            status: data.res.statusCode === 200 ? 'done' : 'error',
            response: data.res.statusCode === 200 ? '' : '上传失败', // custom error message to show
            url,
          });
          this.setState({ fileList });
        })
        .then(() => {
          this.setState({ updateLoading: false });
        })
        .catch(() => {
          message.error('上传出错');
        });
    };
    return false; // 不调用默认的上传方法
  };

  render() {
    const uploadButton = (
      <div>
        <PlusOutlined />
        <div className="ant-upload-text">选择文件或图片</div>
      </div>
    );

    const { antUploadParams } = this.props;
    const { fileList, updateLoading, previewVisible, previewImage, previewTitle } = this.state;

    return (
      <div>
        <Spin spinning={updateLoading} tip="上传中" delay={100} size="large">
          <Upload
            accept="image/*,.pdf,.xls,.xlsx,.ppt,.pptx,.doc,.docx"
            name="avatar"
            listType="picture-card"
            className="avatar-uploader"
            multiple
            onDownload={file => {
              console.log('onDownload file', file);
              const fileType = this.judgeFileType(file.url);
              if (fileType === 'image') {
                this.downloadIamge(file.url, file.name);
              } else if (fileType === 'pdf') {
                saveFileToLink(file.url, file.name, '', () => {
                  // 此处可以获取到 下载进度。
                });
              } else if (fileType === 'office') {
                this.downloadOffice(file.url, file.name);
              } else {
                message.error('此文件不支持下载！仅支持 pdf 和图片格式！');
              }
            }}
            beforeUpload={this.beforeUpload}
            // onChange={this.handleChange}
            onPreview={this.handlePreview}
            fileList={fileList.map(fileObj => {
              if (fileObj.url && this.judgeFileType(fileObj.url) === 'image') {
                fileObj.url = urlJoin(fileObj.url, { query: { 'x-oss-process': 'style/preview' } });
              }
              return fileObj;
            })}
            showUploadList={{
              showPreviewIcon: true,
              showRemoveIcon: true,
              showDownloadIcon: true,
            }}
            onRemove={this.handleRemove}
            {...antUploadParams}
          >
            {uploadButton}
          </Upload>
        </Spin>
        <Modal
          visible={previewVisible}
          title={previewTitle}
          footer={null}
          onCancel={this.handleCancel}
        >
          <img alt="example" style={{ width: '100%' }} src={previewImage} />
        </Modal>
      </div>
    );
  }
}
export default Uploader;
