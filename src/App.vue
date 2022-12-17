<template>
    <div>
        {{totalVolume}} / 1GB
        <input type="file" @change="oneFileSelect"/>
        <button @click="oneFileSubmit">전송</button>
        <button @click="clearAll">전체 삭제</button>
        <hr>
        <!-- 이건 나중에 플렉스로 바꿀게요 -->
        <div style="display: flex; flex-wrap: wrap;">
            <div v-for="(file, idx) in loadedFile" :key="idx" style="margin: 20px">
                {{file.fileName}}<br>
                <img :src="`data:image/${file.ext};base64, ${file.content}`"><br>
                <button @click="downloadPicture(`data:image/${file.ext};base64, ${file.content}`, file.fileName)">다운로드</button>
            </div>
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
            if (result == 0) {
                alert("더 이상 파일을 저장할 공간이 없어요")
            }
            await this.getTotalVolume();
            await this.downloadAllPicture();
        },
        downloadPicture(baseUri, fileName) {
            downloadFile(baseUri, fileName);
        },
        async clearAll() {
            // 먼저 관리자로서 로그인 되어있는지 확인해요
            // 세션 스토리지에 토큰이 있다면 로그인 되어 있다고 생각할게요
            // 그 토큰을 서버에 보내서 토큰이 유효한지 확인해요
            // 유효하다면 삭제를 시작해요
            // 유효하지 않다면 로그인을 시작해요
            var token = sessionStorage.getItem("token");
            // console.log("토근:", token)
            if (token) {
                alert("토큰이 있어요")
                //이제 토큰이 유효한지 확인해야해요
                var result = await axios.post(process.env.VUE_APP_URL + "/tokenConfirm", token, {headers:{'Content-Type': 'text/plain'}}).then(({data}) => data)
                // 토큰이 유효하다면
                if (result == 1) {
                    console.log("토큰이 유효해요")
                    this.clearAllProcess();
                } else {
                    console.log("토큰이 유효하지 않아요")
                    this.login();
                }
            } else {
                this.login();
            }
        },
        async login() {
            sessionStorage.setItem("token", "");
            var adm = prompt("관리자키를 입력해 주세요")
            if (!adm) return;
            //관리자키와 데이터베이스에 있는 값과 비교해요
            var result = await axios.post(process.env.VUE_APP_URL + "/admConfirm", adm, {headers:{'Content-Type': 'text/plain'}}).then(({data}) => data)
            if (result == 1) {
                //로그인에 성공했어요
                //토큰을 발급 받을게요
                var key = await axios.get(process.env.VUE_APP_URL + "/getToken").then(({data}) => data);
                // 받은 토큰을 세션스토리지에 저장해요
                sessionStorage.setItem("token", key);
                await this.clearAllProcess();
            }
            else {
                //로그인에 실패했어요
                alert("관리자가 아니시네요")
            }
        },
        async clearAllProcess() {
            await axios.get(process.env.VUE_APP_URL + "/clearAllProcess")
            this.getTotalVolume();
            this.downloadAllPicture();
        }
    },
}
</script>
