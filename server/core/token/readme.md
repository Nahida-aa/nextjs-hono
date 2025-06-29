
- CSRFToken: 一次性使用

- sessionToken: 登录状态, 可以考虑携带用户信息
  - sessionJWT: 通过JWT生成的sessionToken

- accessJWT: 用于访问资源, 可以考虑携带用户信息和权限信息, 有效期短

- refreshJWT: 用于刷新accessJWT, 有效期长, 只携带 很少信息
