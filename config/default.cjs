module.exports = {
  server: {
    host: 'localhost',
    port: 39074
  },
  redis: {
    host: '127.0.0.1',
    port: 6379,
    username: '',
    password: ''
  },
  session: {
    cookieName: 'LK_USER_TOKEN',
    secret: '',
    cookie: {
      secure: false,
      domain: '',
      httpOnly: true
    }
  },
  voice: {
    apiUrl: ''
  }
}
