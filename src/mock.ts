import GiftLoader, { giftData } from './giftLoader'
import { v4 as uuidv4 } from 'uuid'

const randomNum = (minNum: number, maxNum: number): number => {
  return parseInt((Math.random() * (maxNum - minNum + 1) + minNum).toString(), 10)
}

const giftCapsuleListArray = [
  {
    nickname: '91王先生',
    avatarUrl: 'https://img0.baidu.com/it/u=1536857165,2921056634&fm=26&fmt=auto&gp=0.jpg',
    money: 666,
    uid: 3312,
  },
  {
    nickname: 'Pornhub大波妹',
    avatarUrl: 'https://img2.baidu.com/it/u=222120700,1745793916&fm=26&fmt=auto&gp=0.jpg',
    money: 99,
    uid: 444,
  },
  {
    nickname: 'CC奶玲',
    avatarUrl: 'https://z3.ax1x.com/2021/08/11/ftOL4K.png',
    money: 69,
    uid: 6900,
  },
  {
    nickname: '⁄(⁄ ⁄•⁄ω⁄•⁄ ⁄)⁄',
    avatarUrl: 'https://img0.baidu.com/it/u=1355519613,4273607392&fm=26&fmt=auto&gp=0.jpg',
    money: 1,
    uid: 3333,
  },
  {
    nickname: '^_^什么情况？',
    avatarUrl: 'https://img1.baidu.com/it/u=3676446160,2628100231&fm=26&fmt=auto&gp=0.jpg',
    money: 1,
    uid: 6696,
  },
  {
    nickname: '奶玲睡完翻脸不认人',
    avatarUrl: 'https://img1.baidu.com/it/u=3254254623,2492769581&fm=26&fmt=auto&gp=0.jpg',
    money: 1,
    uid: 888111,
  },
  {
    nickname: '奶玲追随者',
    avatarUrl: 'https://img1.baidu.com/it/u=1541636380,2661844494&fm=26&fmt=auto&gp=0.jpg',
    money: 1,
    uid: 888222,
  },
  {
    nickname: '广州寡二代',
    avatarUrl: 'https://img0.baidu.com/it/u=2066477729,1346895226&fm=26&fmt=auto&gp=0.jpg',
    money: 1,
    uid: 888333,
  },
]

const chatMessageListArray = [
  {
    nickname: '^_^什么情况？',
    avatarUrl: 'https://img1.baidu.com/it/u=3676446160,2628100231&fm=26&fmt=auto&gp=0.jpg',
    message:
      '谁能告诉我现在是什么情况？谁能告诉我现在是什么情况？啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊我是谁我在哪？',
    uid: 6696,
  },
  {
    nickname: '⁄(⁄ ⁄•⁄ω⁄•⁄ ⁄)⁄',
    avatarUrl: 'https://img0.baidu.com/it/u=1355519613,4273607392&fm=26&fmt=auto&gp=0.jpg',
    message: '人生的意义就是为了奶玲的白丝(╯‵□′)╯︵┻━┻',
    uid: 3333,
  },
  {
    nickname: '⁄(⁄ ⁄•⁄ω⁄•⁄ ⁄)⁄',
    avatarUrl: 'https://img0.baidu.com/it/u=1355519613,4273607392&fm=26&fmt=auto&gp=0.jpg',
    message: '😝如果没有奶玲的白丝，世界就失去了色彩😿😿😿😿？？！',
    uid: 3333,
  },
  {
    nickname: '⁄(⁄ ⁄•⁄ω⁄•⁄ ⁄)⁄',
    avatarUrl: 'https://img0.baidu.com/it/u=1355519613,4273607392&fm=26&fmt=auto&gp=0.jpg',
    message: '所以我希望每天能看到奶玲穿白丝直播，这样我会非常满足！',
    uid: 3333,
  },
  {
    nickname: 'CC奶玲',
    avatarUrl: 'https://z3.ax1x.com/2021/08/11/ftOL4K.png',
    message: '。。。滚！！~',
    uid: 66690,
    type: 'anchor',
  },
  {
    nickname: 'CC奶玲',
    avatarUrl: 'https://z3.ax1x.com/2021/08/11/ftOL4K.png',
    message: '😡😡😡',
    uid: 66690,
    type: 'anchor',
  },
  {
    nickname: '91王先生',
    avatarUrl: 'https://img0.baidu.com/it/u=1536857165,2921056634&fm=26&fmt=auto&gp=0.jpg',
    message: '今晚奶玲在我怀里',
    uid: 3312,
    type: 'admin',
  },
  {
    nickname: 'Pornhub大波妹',
    avatarUrl: 'https://img2.baidu.com/it/u=222120700,1745793916&fm=26&fmt=auto&gp=0.jpg',
    message: '哈哈',
    uid: 91330,
  },
  {
    nickname: 'Pornhub大波妹',
    avatarUrl: 'https://img2.baidu.com/it/u=222120700,1745793916&fm=26&fmt=auto&gp=0.jpg',
    message: '我爱奶玲一生一世',
    uid: 91330,
  },
  {
    nickname: '奶玲睡完翻脸不认人',
    avatarUrl: 'https://img1.baidu.com/it/u=3254254623,2492769581&fm=26&fmt=auto&gp=0.jpg',
    message: '奶玲你这个无情的家伙！昨晚睡我的时候笑嘻嘻的，早上起床那个脸一拉就翻脸不认人辽！你是什么意思啊！？？',
    uid: 888111,
  },
  {
    nickname: '奶玲睡完翻脸不认人',
    avatarUrl: 'https://img1.baidu.com/it/u=3254254623,2492769581&fm=26&fmt=auto&gp=0.jpg',
    message: '你给我等着，我今晚就去你家门口躺下，我就不信你真的有这么绝情！',
    uid: 888111,
  },
  {
    nickname: '奶玲追随者',
    avatarUrl: 'https://img1.baidu.com/it/u=1541636380,2661844494&fm=26&fmt=auto&gp=0.jpg',
    message: '咦？奶玲居然开播了耶，我守了24小时只为等你开播！我爱奶玲！',
    uid: 888222,
  },
  {
    nickname: '奶玲追随者',
    avatarUrl: 'https://img1.baidu.com/it/u=1541636380,2661844494&fm=26&fmt=auto&gp=0.jpg',
    message: '奶玲我真的好喜欢你啊，为了你，我愿意电牛紫！！！',
    uid: 888222,
  },
  {
    nickname: '广州寡二代',
    avatarUrl: 'https://img1.baidu.com/it/u=3254254623,2492769581&fm=26&fmt=auto&gp=0.jpg',
    message: '本人男20岁，985本科，目前在国企上班，现寻求一位女士与我共度后半生，要求年龄50岁以上。',
    uid: 888333,
  },
  {
    nickname: '广州寡二代',
    avatarUrl: 'https://img1.baidu.com/it/u=3254254623,2492769581&fm=26&fmt=auto&gp=0.jpg',
    message: '坐等有人找我谈恋爱😬',
    uid: 888333,
  },
]

const giftCardListArray = [
  {
    nickname: 'Pornhub大波妹',
    avatarUrl: 'https://img2.baidu.com/it/u=222120700,1745793916&fm=26&fmt=auto&gp=0.jpg',
    money: 30,
    giftName: '奶罩',
    giftCount: 1,
    giftImage: 'http://cc.fp.ps.netease.com/file/5e00c4dc8b74271a603efa2f7buKHOXy02',
    message: '赠送了奶罩 × 1',
    comment: '我永远爱奶玲！',
    uid: 91330,
  },
  {
    nickname: 'CC奶玲',
    avatarUrl: 'https://z3.ax1x.com/2021/08/11/ftOL4K.png',
    money: 69,
    giftName: '火箭',
    giftCount: 1,
    giftImage: 'http://cc.fp.ps.netease.com/file/5f8cec0d5e60274c35d5ac2bP6i4f3OR02',
    message: '赠送了火箭 × 1',
    uid: 66690,
  },
  {
    nickname: '91王先生',
    avatarUrl: 'https://img0.baidu.com/it/u=1536857165,2921056634&fm=26&fmt=auto&gp=0.jpg',
    money: 264000,
    giftName: '圣旨降临',
    giftCount: 66,
    giftImage: 'http://cc.fp.ps.netease.com/file/5e00b61f143cfac22118ec30ibJDLBaO02',
    message: '赠送了圣旨降临 × 66',
    comment: '圣旨66张，只为看奶玲白丝美腿！',
    uid: 3312,
  },
  {
    nickname: '⁄(⁄ ⁄•⁄ω⁄•⁄ ⁄)⁄',
    avatarUrl: 'https://img0.baidu.com/it/u=1355519613,4273607392&fm=26&fmt=auto&gp=0.jpg',
    money: 99,
    giftName: '月费守护',
    giftCount: 1,
    message: '开通了月费守护',
    uid: 3333,
    type: 'guard-monthly',
  },
  {
    nickname: '^_^什么情况？',
    avatarUrl: 'https://img1.baidu.com/it/u=3676446160,2628100231&fm=26&fmt=auto&gp=0.jpg',
    money: 588,
    giftName: '年费守护',
    giftCount: 1,
    message: '开通了年费守护',
    uid: 11001,
    type: 'guard-annual',
  },
]

const getRandomGiftCapsule = () => {
  return {
    ...giftCapsuleListArray[randomNum(0, giftCapsuleListArray.length - 1)],
    money: randomNum(1, 100),
  }
}

const getRandomChatMessage = () => {
  return chatMessageListArray[randomNum(0, chatMessageListArray.length - 1)]
}

const getRandomGiftCard = () => {
  const gift = giftData.conf[randomNum(0, giftData.conf.length - 1)]

  return {
    ...giftCardListArray[randomNum(0, giftCardListArray.length - 1)],
    giftImage: gift?.gif || gift?.gif4web || gift?.mgif,
    giftIcon: gift?.icon,
  }
}

export {
  randomNum,
  getRandomGiftCapsule,
  getRandomChatMessage,
  getRandomGiftCard,
  giftCapsuleListArray,
  chatMessageListArray,
  giftCardListArray,
}
