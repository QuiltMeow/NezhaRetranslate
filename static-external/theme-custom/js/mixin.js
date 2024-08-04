const mixinsVue = {
    delimiters: ['@#', '#@'],
    data: {
        preferredTemplate: null,
        isMobile: false,
        adaptedTemplates: [
            {
                key: 'default',
                name: 'Default',
                icon: 'th large'
            },
            {
                key: 'angel-kanade',
                name: 'AngelKanade',
                icon: 'square'
            },
            {
                key: 'server-status',
                name: 'ServerStatus',
                icon: 'list'
            }
        ]
    },
    created() {
        this.isMobile = this.checkIsMobile();
        this.preferredTemplate = this.getCookie('preferred_theme') ? this.getCookie('preferred_theme') : this.$root.defaultTemplate;
    },
    methods: {
        toggleTemplate(template) {
            if (template !== this.preferredTemplate) {
                this.preferredTemplate = template;
                this.updateCookie("preferred_theme", template);
                window.location.reload();
            }
        },
        updateCookie(name, value) {
            document.cookie = name + "=" + value + "; path=/";
        },
        getCookie(name) {
            const cookies = document.cookie.split(';');
            let cookieValue = null;
            for (let i = 0; i < cookies.length; ++i) {
                const cookie = cookies[i].trim();
                if (cookie.startsWith(name + '=')) {
                    cookieValue = cookie.substring(name.length + 1, cookie.length);
                    break;
                }
            }
            return cookieValue;
        },
        checkIsMobile() { // 檢查裝置類型，頁面寬度小於 768 px 判定為行動裝置
            return window.innerWidth <= 768;
        },
        logOut(id) {
            $.ajax({
                type: 'POST',
                url: '/api/logout',
                data: JSON.stringify({ id: id }),
                contentType: 'application/json',
                success: function (resp) {
                    if (resp.code === 200) {
                        window.location.reload();
                    } else {
                        alert('登出失敗 (錯誤代碼 ' + resp.code + ') : ' + resp.message);
                    }
                },
                error: function (err) {
                    alert('網路錯誤 : ' + err.responseText);
                }
            });
        }
    }
};