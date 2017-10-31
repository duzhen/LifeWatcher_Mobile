import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { Http, Headers, RequestOptions, RequestMethod } from '@angular/http';
import { File } from '@ionic-native/file';

declare var cordova: any;
declare var FileUploadOptions, FileTransfer: any;
declare const resolveLocalFileSystemURL: any;

@Injectable()
export class DetectorService {

  storageDirectory: string = '';
   url:string = 'http://192.168.1.106:8080/detector';

  constructor(private http:Http, public platform: Platform, private file: File) {
    if (this.platform.is('ios')) {
      this.storageDirectory = cordova.file.tempDirectory;
    }
    else if(this.platform.is('android')) {
      this.storageDirectory = cordova.file.externalRootDirectory;
    }
    else {
      // exit otherwise, but you could add further types here e.g. Windows
      return;
    }
    document.addEventListener("deviceready", onDeviceReady, false);
    function onDeviceReady() {
      console.log(FileTransfer);
    }
  }

  writeFile(fileName: string, uploadName:string, fileBlob: any) {
    resolveLocalFileSystemURL(this.storageDirectory, (dir) => {
      console.log('Access to the directory granted successfully');
      dir.getFile(fileName, {create: true, replace: true}, (file) => {
        console.log('File created successfully.');
        file.createWriter((fileWriter) => {
          console.log('Writing content to file', fileWriter);
          fileWriter.onwriteend = (e) => {
            console.log("file length:", fileWriter.length);
            console.log('Write completed.',fileName, e);
            this.uploadFile(fileName, uploadName);
          };
          fileWriter.write(fileBlob);
        }, () => {
          alert('Unable to save file in path ' + this.storageDirectory);
        });
      });
    });
  }

  detector(imgData) {
    console.log(this.storageDirectory);
    var uploadName = new Date().getTime().toString() + ".jpeg";
    var fileName = "detector.jpeg";
    this.writeFile(fileName, uploadName, imgData);
  }

  public uploadFile(fileName: string, uploadName:string) {
    var win = function (r) {
      console.log("Code = " + r.responseCode);
      console.log("Response = " + r.response);
      console.log("Sent = " + r.bytesSent);
    }

    var fail = function (error) {
      alert("An error has occurred: Code = " + error.code);
      console.log("upload error source " + error.source);
      console.log("upload error target " + error.target);
    }
    let options = new FileUploadOptions();
    options.fileKey = "file";
    options.fileName = fileName;
    options.mimeType = "image/jpeg";
    options.chunkedMode = false
    let filePath = this.storageDirectory + fileName;
    let fileTransfer = new FileTransfer();
    fileTransfer.upload(filePath, encodeURI(this.url), win, fail, options);
  }
}