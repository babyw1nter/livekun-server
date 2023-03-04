# [1.0.0-alpha.4](https://github.com/hhui64/livekun-server/compare/v1.0.0-alpha.3...v1.0.0-alpha.4) (2022-06-08)


### Bug Fixes

* **modules/chatMessage:** 修复获取某些信息失败时崩溃的问题 ([6b69cae](https://github.com/hhui64/livekun-server/commit/6b69cae4191dbb6d67777cea12aa8a3bba0dc74d))
* **modules/chatMessage:** 修复无法获取用户守护信息的问题 ([89f2080](https://github.com/hhui64/livekun-server/commit/89f2080ff96af35e846de120b59625fc385192cd))


### Features

* 新增消息列表支持显示礼物 ([0aab5ea](https://github.com/hhui64/livekun-server/commit/0aab5ea4dbe3d841f1b21028848be54a6c7c0278))
* **mock:** mock 模块支持导入 json 数据 ([b6f1340](https://github.com/hhui64/livekun-server/commit/b6f134070153f8dcf6377e71d81a7b9b41ccfda7))
* **modules/chatMessage:** 新增过滤指定 ccid 的消息 ([61a0e50](https://github.com/hhui64/livekun-server/commit/61a0e50bff6fa2238cfdb8cd750b711ff4e806d6))
* **modules/chatMessage:** 新增支持守护特殊昵称样式 ([3542ed7](https://github.com/hhui64/livekun-server/commit/3542ed7c659c8546249b352afbc62b2138788fe5))


### Performance Improvements

* 优化获取实例就绪状态的方法 ([e38c6ce](https://github.com/hhui64/livekun-server/commit/e38c6ce07f41cdd01bf9ff9d749c2342adc076d3))
* **cclinkjsManager:** 优化创建实例时支持传入实例 options ([8d51754](https://github.com/hhui64/livekun-server/commit/8d51754366da1a1af4a88a0d9fd773018a6c8f59))
* **modules/paid:** 调整文案 ([9caca6a](https://github.com/hhui64/livekun-server/commit/9caca6abd20b27bc8995f1d300fd84c9ce92cefa))



# [1.0.0-alpha.3](https://github.com/hhui64/livekun-server/compare/v1.0.0-alpha.2...v1.0.0-alpha.3) (2021-09-11)


### Bug Fixes

* **httpServer/api:** 修复 join 和 reset 接口的逻辑问题 ([8fe1baf](https://github.com/hhui64/livekun-server/commit/8fe1baf638a56a353bfc8e7d7518c45abb7aead6))


### Features

* **httpServer/api:** 新增获取 mock 数据接口 ([a7fd406](https://github.com/hhui64/livekun-server/commit/a7fd406f292528615cd6ab6c8ff9da8450d1bb57))
* **httpServer/api:** 新增获取公告接口 ([822aca5](https://github.com/hhui64/livekun-server/commit/822aca566c2890db44dc28ec51b6c73a890c7f66))
* **modules/paid:** 新增礼物图标 url 属性 ([8e23244](https://github.com/hhui64/livekun-server/commit/8e23244f34f15c7626d086fa1967724ac82f4583))


### Performance Improvements

* 优化导入模块 ([6dd4100](https://github.com/hhui64/livekun-server/commit/6dd410072369b4ca72e72965e524e013702532f8))
* 优化接口数据合并以减少请求数量 ([eff194e](https://github.com/hhui64/livekun-server/commit/eff194ee3b887b0ce866c0112b974fa2cb976b9d))
* 优化退出登录时的实例销毁逻辑 ([9db0428](https://github.com/hhui64/livekun-server/commit/9db0428017d6dad91ca65bd3ec76b2abf31e4742))
* **httpServer/api:** 优化 join 和 reset 接口的实例管理逻辑 ([17ac131](https://github.com/hhui64/livekun-server/commit/17ac131065d7b5251f4d5ece1e78ce6942a45175))



# [1.0.0-alpha.2](https://github.com/hhui64/livekun-server/compare/v1.0.0-alpha.1...v1.0.0-alpha.2) (2021-08-29)


### Bug Fixes

* **httpServer/server:** 修复因响应头类型错误引起的前端页面无法加载的问题 ([1a46217](https://github.com/hhui64/livekun-server/commit/1a4621769fc05b3a805841ba0135ecb6c34f0424))


### Features

* 新增支持 ArrayBuffer 传输 WS 数据 ([08006a4](https://github.com/hhui64/livekun-server/commit/08006a41335bccc4a17179230a42c365c8423c82))



# [1.0.0-alpha.1](https://github.com/hhui64/livekun-server/compare/v1.0.0-alpha.0...v1.0.0-alpha.1) (2021-08-27)


### Features

* **httpServer/server:** 新增请求拦截鉴权中间件 ([996c6f5](https://github.com/hhui64/livekun-server/commit/996c6f56d20aa4f4d5a85c6ad6fb1297fc91d10a))
* **httpServer/server:** 新增响应数据包装方法 ([1b5988c](https://github.com/hhui64/livekun-server/commit/1b5988c0b4a3805a7c2645a1fda9feb6250dda62))
* **httpServer/user:** 新增 UserManager 用户管理器类 ([d51d3ef](https://github.com/hhui64/livekun-server/commit/d51d3efe8fc288ce15a4a35d9ad9410d88507a9e))
* **socketServer/server:** 新增 connection 合法验证机制 ([be1365a](https://github.com/hhui64/livekun-server/commit/be1365a723a952a9d6684b25f4c8a2ba9a5a583c))


### Performance Improvements

* **httpServer/*:** 优化请求的响应数据使用响应包数据包装方法 ([84d171f](https://github.com/hhui64/livekun-server/commit/84d171fe54c57b279c2157361ff391d1f6764d59))
* **httpServer/api:** 优化控制接口的协议格式 ([4c447bc](https://github.com/hhui64/livekun-server/commit/4c447bcc42766e4021d563f78a00af650943e521))
* **httpServer/server:** 优化 session 储存机制 ([6deaaad](https://github.com/hhui64/livekun-server/commit/6deaaad4f85d6a196ac3cea5c144143e83cd0b37))
* **httpServer/server:** 优化响应头的配置 ([59f1bfb](https://github.com/hhui64/livekun-server/commit/59f1bfb99338699b71c06536396b87559df61ec2))
* **socketServer/server:** 优化数据包装方法添加时间戳 ([26e7667](https://github.com/hhui64/livekun-server/commit/26e76672d141076ba11b18a6f5764c331a2c2f99))



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
* **modules/paid:** 优化礼物图标 Url 的获取顺序 ([538436e](https://github.com/hhui64/livekun-server/commit/538436e266ca59fd6258ee643064d3ec963edc0c))



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
* **modules/paid:** 新增 paid 事件处理模块 ([d7be6f1](https://github.com/hhui64/livekun-server/commit/d7be6f1dcfcb08d1d74de9943f64182ab7be3957))
* **statusManager:** 新增 statusManager 状态管理器 ([23c55e8](https://github.com/hhui64/livekun-server/commit/23c55e87683a33034fbd5e9cda9f3db8d8b7753c))


### Performance Improvements

* **httpServer:** 优化进房接口的错误信息 ([bfe4fcf](https://github.com/hhui64/livekun-server/commit/bfe4fcf53591facde071f548c7c5480ba784082c))
* **modules/chatMessage:** 优化聊天消息格式处理逻辑 ([7501aa1](https://github.com/hhui64/livekun-server/commit/7501aa1e5e98d3642969d561e1033be08edf4d9f))
* **modules/paid:** 优化礼物卡片消息与留言属性分开发送 ([1ed0fe5](https://github.com/hhui64/livekun-server/commit/1ed0fe5fb003e5fc8ba7650d203c63188c66433e))



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

* 调整 Ticket 持续时间的单位 ([f69c774](https://github.com/hhui64/livekun-server/commit/f69c7748bbefd14270250de2477acb107496e740))



