<template>
    <div>
        {{totalVolume}} / 1GB
        <input type="file" @change="oneFileSelect"/>
        <button @click="oneFileSubmit">전송</button>
        <button @click="clearAll">전체 삭제</button>
        <hr>
        <!-- 이건 나중에 플렉스로 바꿀게요 -->
        <div v-for="(file, idx) in loadedFile" :key="idx" style="margin: 50px 0">
            {{file.fileName}}<br>
            <img :src="`data:image/${file.ext};base64, ${file.content}`">
            <button @click="downloadPicture(`data:image/${file.ext};base64, ${file.content}`, file.fileName)">다운로드</button>
        </div>
    </div>
</template>

<script>
import axios from 'axios'
import downloadFile from '@/js/downloader.js'

export default {
    data() {
        return {
            totalVolume: "",
            oneFile: {},
            loadedFile: []
        }
    },
    created() {
        this.getTotalVolume();
        this.downloadAllPicture();
    },
    methods: {
        async getTotalVolume() {
            var totalVolume = await axios.get(process.env.VUE_APP_URL + "/getTotalVolume").then(({data}) => data)
            if (totalVolume < 1024) {
                this.totalVolume = totalVolume + "byte"
            } else if (totalVolume < 1024 * 1024) {
                this.totalVolume = (Math.round(totalVolume / 1024 * 100) / 100) + "KB"
            } else if (totalVolume < 1024 * 1024 *1024) {
                this.totalVolume = (Math.round(totalVolume / 1024 / 1024 * 100) / 100) + "MB"
            }
        },
        async downloadAllPicture() {
            this.loadedFile = await axios.get(process.env.VUE_APP_URL + "/downloadAllPicture").then(({data}) => data);
        },
        oneFileSelect(e) {
            this.oneFile = e.target.files[0];
        },
        async oneFileSubmit() {
            if (!this.oneFile["name"]) {
                alert("파일을 선택해 주세요");
                return;
            }
            alert("파일을 전송해요")
            const formData = new FormData();
            formData.append("file", this.oneFile);
            var result = await axios.post(process.env.VUE_APP_URL + "/uploadOneFile", formData, {headers: {'Content-Type': 'multipart/form-data'}}).then(({data}) => data);
            console.log(result)
            if (result == 0) {
                alert("더 이상 파일을 저장할 공간이 없어요")
            }
            await this.getTotalVolume();
            await this.downloadAllPicture();
        },
        downloadPicture(baseUri, fileName) {
            downloadFile(baseUri, fileName);
        },
        clearAll() {
            prompt("아이디");
        }
    },
}
</script>
