var parseHtml = require('./dist').default


console.log(parseHtml.parse('<a href="#" t:a="123" :a="123213123" @click="123123" v-bind:v="123123"><a>123123123{{test}}</a>123123</a>'))