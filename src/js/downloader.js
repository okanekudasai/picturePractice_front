const dataURIToBlob = (base64) => {
    const binStr = atob(base64.split(',')[1]);
    const len = binStr.length;
    const arr = new Uint8Array(len);
    const mimeString = base64.split(',')[0].split(':')[1].split(';')[0];

    for (let i = 0; i < len; i++) {
        arr[i] = binStr.charCodeAt(i);
    }

    return new Blob([arr], {
        type: mimeString,
    });
};

const downloadFile = (base64, filename) => new Promise((resolve, reject) => {
    try {
        if (!base64 || !filename) {
            throw new Error('Missing param base64 or filename.');
        }

        if (typeof filename !== 'string') {
            throw new TypeError('Missing param base64 or filename.');
        }

        const blob = dataURIToBlob(base64);
        const url = URL.createObjectURL(blob);
        const blobAnchor = document.createElement('a');
        const dataURIAnchor = document.createElement('a');
        blobAnchor.download = filename;
        dataURIAnchor.download = filename;
        blobAnchor.href = url;
        dataURIAnchor.href = base64;
        blobAnchor.addEventListener('click', () => {
            requestAnimationFrame(() => {
                URL.revokeObjectURL(url);
                resolve();
            });
        });
        blobAnchor.click();
    } catch (e) {
        reject(e);
    }
});

module.exports = downloadFile;