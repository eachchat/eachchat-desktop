const MAX_WIDTH = 800;
const MAX_HEIGHT = 600;

class timelineHandler {
    constructor() {

    }

    static shareInstance() {
        if(!global.mxMatrixClientPeg.timelineHandler) global.mxMatrixClientPeg.timelineHandler = new timelineHandler();
        return global.mxMatrixClientPeg.timelineHandler;
    }

    /**
     * Load a file into a newly created image element.
     *
     * @param {File} imageFile The file to load in an image element.
     * @return {Promise} A promise that resolves with the html image element.
     */
    async loadImageElement(imageFile, imgUrl) {
        // Load the file into an html element
        const img = document.createElement("img");
        const objectUrl = imgUrl ? imgUrl : URL.createObjectURL(imageFile);
        const imgPromise = new Promise((resolve, reject) => {
            img.onload = function() {
                this.imgWidth = img.width;
                this.imgHeight = img.height;
                URL.revokeObjectURL(objectUrl);
                resolve(img);
            };
            img.onerror = function(e) {
                reject(e);
            };
        });
        img.src = objectUrl;

        // // check for hi-dpi PNGs and fudge display resolution as needed.
        // // this is mainly needed for macOS screencaps
        // let parsePromise;
        // if (imageFile.type === "image/png") {
        //     // in practice macOS happens to order the chunks so they fall in
        //     // the first 0x1000 bytes (thanks to a massive ICC header).
        //     // Thus we could slice the file down to only sniff the first 0x1000
        //     // bytes (but this makes extractPngChunks choke on the corrupt file)
        //     const headers = imageFile; //.slice(0, 0x1000);
        //     parsePromise = readFileAsArrayBuffer(headers).then(arrayBuffer => {
        //         const buffer = new Uint8Array(arrayBuffer);
        //         const chunks = extractPngChunks(buffer);
        //         for (const chunk of chunks) {
        //             if (chunk.name === 'pHYs') {
        //                 if (chunk.data.byteLength !== PHYS_HIDPI.length) return;
        //                 return chunk.data.every((val, i) => val === PHYS_HIDPI[i]);
        //             }
        //         }
        //         return false;
        //     });
        // }

        // const [hidpi] = await Promise.all([parsePromise, imgPromise]);
        const [hidpi] = await Promise.all([imgPromise]);
        const width = hidpi ? (img.width >> 1) : img.width;
        const height = hidpi ? (img.height >> 1) : img.height;
        return {width, height, img};
    }
    
    /**
     * Read the metadata for an image file and create and upload a thumbnail of the image.
     *
     * @param {MatrixClient} matrixClient A matrixClient to upload the thumbnail with.
     * @param {String} roomId The ID of the room the image will be uploaded in.
     * @param {File} imageFile The image to read and thumbnail.
     * @return {Promise} A promise that resolves with the attachment info.
     */
    infoForImageFile(roomId, imageFile, imgUrl) {
        let thumbnailType = "image/png";
        if (imageFile.type === "image/jpeg") {
            thumbnailType = "image/jpeg";
        }

        let imageInfo;
        return this.loadImageElement(imageFile, imgUrl).then((r) => {
            console.log("*** loadImageElement return is ", r);
            return this.createThumbnail(r.img, r.width, r.height, thumbnailType);
        }).then((result) => {
            imageInfo = result.info;
            return this.uploadFile(roomId, result.thumbnail);
        }).then((result) => {
            imageInfo.thumbnail_url = result.url;
            imageInfo.thumbnail_file = result.file;
            return imageInfo;
        });
    }
    
    /**
     * Upload the file to the content repository.
     * If the room is encrypted then encrypt the file before uploading.
     *
     * @param {MatrixClient} matrixClient The matrix client to upload the file with.
     * @param {String} roomId The ID of the room being uploaded to.
     * @param {File} file The file to upload.
     * @param {Function?} progressHandler optional callback to be called when a chunk of
     *    data is uploaded.
     * @return {Promise} A promise that resolves with an object.
     *  If the file is unencrypted then the object will have a "url" key.
     *  If the file is encrypted then the object will have a "file" key.
     */
    uploadFile(roomId, file) {
        let canceled = false;
        if (global.mxMatrixClientPeg.matrixClient.isRoomEncrypted(roomId)) {
            // If the room is encrypted then encrypt the file before uploading it.
            // First read the file into memory.
            let uploadPromise;
            let encryptInfo;
            const prom = readFileAsArrayBuffer(file).then((data) => {
                return encrypt.encryptAttachment(data);
            }).then((encryptResult) => {
                // Record the information needed to decrypt the attachment.
                encryptInfo = encryptResult.info;
                // Pass the encrypted data as a Blob to the uploader.
                const blob = new Blob([encryptResult.data]);
                uploadPromise = global.mxMatrixClientPeg.matrixClient.uploadContent(blob, {
                    progressHandler: this.onUploadProgress,
                    includeFilename: false,
                });
                return uploadPromise;
            }).then((url) => {
                // If the attachment is encrypted then bundle the URL along
                // with the information needed to decrypt the attachment and
                // add it under a file key.
                encryptInfo.url = url;
                if (file.type) {
                    encryptInfo.mimetype = file.type;
                }
                return {"file": encryptInfo};
            });
        } else {
            const basePromise = global.mxMatrixClientPeg.matrixClient.uploadContent(file, {
                progressHandler: this.onUploadProgress,
            });
            const promise1 = basePromise.then((url) => {
                // If the attachment isn't encrypted then include the URL directly.
                return {"url": url};
            });
            return promise1;
        }
    }

    createThumbnail(element, inputWidth, inputHeight, mimeType) {
        return new Promise((resolve) => {
            let targetWidth = inputWidth;
            let targetHeight = inputHeight;
            if (targetHeight > MAX_HEIGHT) {
                targetWidth = Math.floor(targetWidth * (MAX_HEIGHT / targetHeight));
                targetHeight = MAX_HEIGHT;
            }
            if (targetWidth > MAX_WIDTH) {
                targetHeight = Math.floor(targetHeight * (MAX_WIDTH / targetWidth));
                targetWidth = MAX_WIDTH;
            }

            const canvas = document.createElement("canvas");
            canvas.width = targetWidth;
            canvas.height = targetHeight;
            canvas.getContext("2d").drawImage(element, 0, 0, targetWidth, targetHeight);
            canvas.toBlob((thumbnail) => {
                resolve({
                    info: {
                        thumbnail_info: {
                            w: targetWidth,
                            h: targetHeight,
                            mimetype: thumbnail.type,
                            size: thumbnail.size,
                        },
                        w: inputWidth,
                        h: inputHeight,
                    },
                    thumbnail: thumbnail,
                });
            }, mimeType);
        });
    }
}

export{
    timelineHandler
}