import originAxios from 'axios'

const axios = originAxios.create({
    baseURL: 'https://cnodejs.org/api/v1',
    timeout: 10000,
    headers: {
        post: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }
})

axios.interceptors.response.use(res => res && res.data, error => Promise.reject(error))

class Service {
    getTopics(page = 1, tab = 'all', limit = 40, mdrender = false) {
        return axios.get('/topics', {
            params: {
                page,
                tab,
                limit,
                mdrender
            }
        })
    }

    getTopicDetail(id, mdrender = true) {
        return axios.get(`/topic/${id}`, {
            params: {
                mdrender
            }
        })
    }
}

export default new Service()
