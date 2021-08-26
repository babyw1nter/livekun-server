# [1.0.0-alpha.0](https://github.com/hhui64/livekun-server/compare/v0.1.0-alpha.3...v1.0.0-alpha.0) (2021-08-26)


### Features

* **cclinkjsManager:** 合并 statusManager 相关功能至 cclinkjsManager ([58dd7b8](https://github.com/hhui64/livekun-server/commit/58dd7b88f61cb1c555a4fa365868a2f5513c4235))
* **cclinkjsManager:** 新增 CCLinkJSInstance 类的 reset() 方法 ([e2d56d4](https://github.com/hhui64/livekun-server/commit/e2d56d407a3a8c7a900031db951037738461b1d7))
* **cclinkjsManager:** 新增 CCLinkJSInstance 实例类 ([005227d](https://github.com/hhui64/livekun-server/commit/005227d73e24bef640a5f1fa7b47bedcd74c506b))
* **giftLoader:** 新增 giftLoader 礼物加载器 ([db5881a](https://github.com/hhui64/livekun-server/commit/db5881a2daefbe0f69d9a5a3a68be9e27bda8ac1))
* **httpServer/api:** 新增 api 接口模块 ([48f21d0](https://github.com/hhui64/livekun-server/commit/48f21d07f795e56b3be4814a9a3acf286bdeabf8))
* **httpServer/server:** 新增多种操作接口的鉴权功能 ([0a077e5](https://github.com/hhui64/livekun-server/commit/0a077e563b62e6eb0df326f948dc56ca10b06d1c))
* **httpServer/user:** 新增用户登陆模块 ([e8c28fe](https://github.com/hhui64/livekun-server/commit/e8c28feb56fcebbed22442889f916c65d94b184d))
* **httpServer:** 新增 session 登录功能 ([8165e1c](https://github.com/hhui64/livekun-server/commit/8165e1c408e6c60556b372c348aeee15934076d7))
* **modules/*:** 新增支持通过实例 UUID 发送至指定的 socket 客户端 ([7761f64](https://github.com/hhui64/livekun-server/commit/7761f64db70860a2577d302de89849cfdde61460))


### Performance Improvements

* **cclinkjsManager:** 移动 joinLiveRoom() 方法至 CCLinkJSInstance 类 ([1c577d2](https://github.com/hhui64/livekun-server/commit/1c577d2be4cc23aa79809fc9e346cf1e8bdc323d))
* **cclinkjsManager:** 优化 CCLinkJSInstance 的状态管理机制 ([6bdcb11](https://github.com/hhui64/livekun-server/commit/6bdcb110449fe251386da911d9466444a8ce8a90))
* **cclinkjsManager:** 优化实例管理器的重复创建实例判断 ([31b13f2](https://github.com/hhui64/livekun-server/commit/31b13f2a7271b6d0fd573a03abf4b6f561def6c4))
* **configManager:** 新增配置管理器的指定 UUID 获取 ([3f27008](https://github.com/hhui64/livekun-server/commit/3f27008d580a0de97eee9bf90bc89fe93a90b06d))
* **mock:** 优化 mock 数据随机返回礼物卡片 ([1b77994](https://github.com/hhui64/livekun-server/commit/1b77994523d570d4ac1459caee932d8f6ef1ccb9))
* **modules/*:** 优化礼物数据的加载逻辑 ([f7cf41d](https://github.com/hhui64/livekun-server/commit/f7cf41dbde2c4832a24a3dd0ab99d490af41c62f))
* **modules/giftCard:** 优化礼物图标 Url 的获取顺序 ([538436e](https://github.com/hhui64/livekun-server/commit/538436e266ca59fd6258ee643064d3ec963edc0c))



# [0.1.0-alpha.3](https://github.com/hhui64/livekun-server/compare/v0.1.0-alpha.2...v0.1.0-alpha.3) (2021-08-23)


### Performance Improvements

* **cclinkjsManager:** 优化实例生命周期处理 ([e6b25ff](https://github.com/hhui64/livekun-server/commit/e6b25ff575427a58295bf03a432e1966a1fe4955))
* **httpServer:** 优化进入房间失败时的错误信息 ([b1b0515](https://github.com/hhui64/livekun-server/commit/b1b05152d24ef1e442db613616e808880dd59dba))



# [0.1.0-alpha.2](https://github.com/hhui64/livekun-server/compare/v0.1.0-alpha.1...v0.1.0-alpha.2) (2021-08-22)


### Features

* **cclinkjsManager:** 新增 cclinkjsManager 连接管理器 ([474364f](https://github.com/hhui64/livekun-server/commit/474364fb1357cdcfdd97af454ccc7118f2f14f82))
* **emtsLoader:** 新增 emtsLoader 表情加载器 ([0f1dabd](https://github.com/hhui64/livekun-server/commit/0f1dabdfbbaa52822c1d12b4b882902af809ec23))
* **modules/chatMessage:** 新增 chatMessage 事件处理模块 ([0af83d9](https://github.com/hhui64/livekun-server/commit/0af83d920680ad46152ae892fb14703b45f484c4))
* **modules/giftCapsule:** 新增 giftCapsule 事件处理模块 ([6f4669a](https://github.com/hhui64/livekun-server/commit/6f4669aead85224c4becde324f42fcf2120ca046))
* **modules/giftCard:** 新增 giftCard 事件处理模块 ([d7be6f1](https://github.com/hhui64/livekun-server/commit/d7be6f1dcfcb08d1d74de9943f64182ab7be3957))
* **statusManager:** 新增 statusManager 状态管理器 ([23c55e8](https://github.com/hhui64/livekun-server/commit/23c55e87683a33034fbd5e9cda9f3db8d8b7753c))


### Performance Improvements

* **httpServer:** 优化进房接口的错误信息 ([bfe4fcf](https://github.com/hhui64/livekun-server/commit/bfe4fcf53591facde071f548c7c5480ba784082c))
* **modules/chatMessage:** 优化聊天消息格式处理逻辑 ([7501aa1](https://github.com/hhui64/livekun-server/commit/7501aa1e5e98d3642969d561e1033be08edf4d9f))
* **modules/giftCard:** 优化礼物卡片消息与留言属性分开发送 ([1ed0fe5](https://github.com/hhui64/livekun-server/commit/1ed0fe5fb003e5fc8ba7650d203c63188c66433e))



# [0.1.0-alpha.1](https://github.com/hhui64/livekun-server/compare/v0.1.0-alpha.0...v0.1.0-alpha.1) (2021-08-21)


### Features

* 新增支持礼物卡片留言功能 ([292cea6](https://github.com/hhui64/livekun-server/commit/292cea6de30d99673a9e14f502b8535aac913983))
* **httpServer:** 支持操作组件 ([3aac839](https://github.com/hhui64/livekun-server/commit/3aac839121ba456176e36f27719024774f68b93a))
* **mock:** 添加 mock 数据 ([a33c3cc](https://github.com/hhui64/livekun-server/commit/a33c3ccbc350a9e53be28df22931823592ed0a79))
* **socketServer:** 支持多客户端连接 ([a911877](https://github.com/hhui64/livekun-server/commit/a9118771e7b81059717ea38270f77066bc693fa2))



# [0.1.0-alpha.0](https://github.com/hhui64/livekun-server/compare/e7bdce9ca23a97009b03b81ee7297952cb264866...v0.1.0-alpha.0) (2021-08-20)


### Bug Fixes

* 修复`liveId`类型错误的问题 ([489b96c](https://github.com/hhui64/livekun-server/commit/489b96cccdc9ace5f6c67545b1f7998456fcf432))
* 修复控制台输出过多内容的问题 ([12e62a9](https://github.com/hhui64/livekun-server/commit/12e62a9f06f1e929c96159fd36412b82549a99b5))
* 修复配置文件读取错误时会整个挂掉的问题 ([6bcac48](https://github.com/hhui64/livekun-server/commit/6bcac4858272d93dfb3d6f51295740dac180b751))


### Features

* 表情加载器 ([0728c68](https://github.com/hhui64/livekun-server/commit/0728c688d50cb8bc497f94398739124dfeccbe1f))
* 聊天消息数据添加用户信息字段 ([ddb36c1](https://github.com/hhui64/livekun-server/commit/ddb36c1a65e76b9ac2835b8acd910558d472f4ce))
* 聊天消息支持调整字体大小 ([e646939](https://github.com/hhui64/livekun-server/commit/e6469395117c1b5ec7b13adaa327777c14ee1cb7))
* 判断用户类型 ([15e81af](https://github.com/hhui64/livekun-server/commit/15e81af472a3fca3eaa80a137d88f54888b8580d))
* 实时推送配置信息 ([e8f3c31](https://github.com/hhui64/livekun-server/commit/e8f3c31338ca93e5ecb132967a77b9db9bb3456b))
* 优化控制台消息输出样式 ([50c2342](https://github.com/hhui64/livekun-server/commit/50c2342eaac4aaaca19ab7225b507c9c02bc28f1))
* liveroom title ([e7bdce9](https://github.com/hhui64/livekun-server/commit/e7bdce9ca23a97009b03b81ee7297952cb264866))


### Performance Improvements

* 调整礼物胶囊持续时间的单位 ([f69c774](https://github.com/hhui64/livekun-server/commit/f69c7748bbefd14270250de2477acb107496e740))



