
import { Restaurant, Review, Dish } from './types';

export const USER_STATS = {
  id: 'u999', // Fixed User ID
  userName: '李同学',
  major: '计算机科学',
  grade: '大二',
  avatar: '', // Empty means use default initial-based avatar
  frequentTags: [],
  favoriteCuisines: [],
  orderHistory: [] 
};

// --- Mock Data Generation Helpers ---

const MOCK_USERS = [
  '张伟', '李强', '王芳', '陈静', '刘洋', '黄勇', '周杰', '吴艳', '赵强', '孙丽', 
  'Alice', 'Bob', 'Charlie', 'David', 'Eva', 'Frank', 'Grace', 'Helen', 'Ivy', 'Jack',
  'Kevin', 'Lily', 'Mike', 'Nancy', 'Oscar', 'Paul', 'Queen', 'Rose', 'Steve', 'Tom',
  '澳门食神', '干饭人', '减肥失败', '奶茶续命', '早八人', 'DDL战士', '食堂品鉴家', '不吃香菜',
  '微辣星人', '碳水教父', 'AAA建材王总', 'momo', '用户8821', '吃货小美', '探店达人'
];

const MOCK_COMMENTS = [
  "味道真不错，强烈推荐！", "分量很足，吃得很饱。", "稍微有点咸，但总体还可以。", 
  "性价比超高，不仅便宜还好吃。", "排队人太多了，但值得等待。", "这也是我最爱吃的菜之一。",
  "卖相一般，但味道惊艳。", "很有家乡的味道。", "一般般吧，无功无过。", "下次还会再来点的。",
  "不仅好吃，阿姨手也不抖，给很多！", "今天的饭稍微有点硬。", "好评好评！", "五星好评！",
  "稍微有点辣，不过很爽。", "不仅速度快，味道也在线。", "可以说是食堂天花板了。", "一般，不是很推荐。", "超级好吃！", "YYDS!",
  "肉很多，很实在。", "汤底很浓郁。", "米饭有点夹生，希望改进。", "服务态度很好。", "价格有点贵，但味道对得起价格。",
  "朋友推荐来的，果然不错。", "每天必吃。", "有点油腻。", "清淡健康。", "很有特色。"
];

const generateReviews = (targetId: string, count: number): { reviews: Review[], average: number, breakdown: {appearance: number, aroma: number, taste: number} } => {
  const reviews: Review[] = [];
  let totalRating = 0;
  let totalApp = 0;
  let totalAroma = 0;
  let totalTaste = 0;

  for (let i = 0; i < count; i++) {
    // Bias towards 3-5 stars
    const rRand = Math.random();
    let rating = 3;
    if (rRand > 0.6) rating = 5;
    else if (rRand > 0.3) rating = 4;
    
    // Slight randomness in breakdown
    const app = Math.min(5, Math.max(1, rating + Math.floor(Math.random() * 3) - 1));
    const aroma = Math.min(5, Math.max(1, rating + Math.floor(Math.random() * 3) - 1));
    const taste = rating;

    totalRating += rating;
    totalApp += app;
    totalAroma += aroma;
    totalTaste += taste;

    // Pick a user
    const user = MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)];
    // 60% chance of having a comment
    const hasComment = Math.random() > 0.4;
    const comment = hasComment ? MOCK_COMMENTS[Math.floor(Math.random() * MOCK_COMMENTS.length)] : "（用户未填写评论）";

    reviews.push({
      id: `r_${targetId}_${i}_${Date.now()}`,
      userId: `u_${Math.floor(Math.random() * 9999)}`,
      userName: user,
      rating: rating,
      dimensions: {
        appearance: app,
        aroma: aroma,
        taste: taste
      },
      comment: comment,
      date: new Date(Date.now() - Math.floor(Math.random() * 60 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
      likes: Math.floor(Math.random() * 20)
    });
  }
  
  // Sort descending by date
  reviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return {
    reviews,
    average: parseFloat((totalRating / count).toFixed(1)),
    breakdown: {
      appearance: parseFloat((totalApp / count).toFixed(1)),
      aroma: parseFloat((totalAroma / count).toFixed(1)),
      taste: parseFloat((totalTaste / count).toFixed(1))
    }
  };
};

// --- Raw Data Definitions (Before Processing) ---

const RAW_RESTAURANTS: Restaurant[] = [
  // --- 位置：厨艺天地 ---
  {
    id: '101',
    name: '南洋巴打',
    location: '厨艺天地',
    rating: 0,
    cuisineType: '异国风味',
    image: '/assets/images/101_cover.jpg',
    tags: ['异国风味', '面条', '米饭', '牛肉', '鸡肉', '东南亚菜', '咖喱', '面食'],
    ratingBreakdown: { appearance: 0, aroma: 0, taste: 0 },
    reviews: [],
    menu: [
      {
        id: 'd101_1', name: '铁板马来炒面', price: 42.00,
        image: '', // Will be updated
        description: '镬气十足的铁板炒面，带有浓郁的马来风味。',
        calories: 680, rating: 0, category: '面条', reviews: []
      },
      {
        id: 'd101_2', name: '芝士牛肉拌饭', price: 58.00,
        image: '',
        description: '拉丝芝士包裹着嫩牛肉，铁盘滋滋作响。',
        calories: 850, rating: 0, category: '米饭', reviews: []
      },
      {
        id: 'd101_3', name: '牛肉鸡丁拌饭', price: 58.00,
        image: '',
        description: '双重肉类满足，分量十足。',
        calories: 820, rating: 0, category: '米饭', reviews: []
      },
      {
        id: 'd101_4', name: '新加坡海南鸡（一只）', price: 120.00,
        image: '',
        description: '适合分享，皮脆肉嫩，配三种蘸料。',
        calories: 1200, rating: 0, category: '鸡肉', reviews: []
      },
      {
        id: 'd101_5', name: '新加坡海南鸡油饭', price: 48.00,
        image: '',
        description: '一人食首选，米饭吸收了鸡油的香气。',
        calories: 700, rating: 0, category: '米饭', reviews: []
      }
    ]
  },
  {
    id: '102',
    name: '铁留香',
    location: '厨艺天地',
    rating: 0,
    cuisineType: '铁板烧',
    image: '/assets/images/102_cover.jpg',
    tags: ['铁板烧', '米饭', '牛肉', '鸡肉', '海鲜', '快餐', '便当'],
    ratingBreakdown: { appearance: 0, aroma: 0, taste: 0 },
    reviews: [],
    menu: [
      {
        id: 'd102_1', name: '鸡排套餐', price: 48.00,
        image: '',
        description: '外焦里嫩的铁板鸡排，配时蔬。',
        calories: 750, rating: 0, category: '米饭', reviews: []
      },
      {
        id: 'd102_2', name: '肥牛套餐', price: 48.00,
        image: '',
        description: '肥牛在铁板上烤出油脂香，下饭神器。',
        calories: 800, rating: 0, category: '米饭', reviews: []
      },
      {
        id: 'd102_3', name: '香煎龙利鱼排套餐', price: 48.00,
        image: '',
        description: '无刺龙利鱼，口感细嫩，黑椒汁调味。',
        calories: 600, rating: 0, category: '米饭', reviews: []
      },
      {
        id: 'd102_4', name: '蘑菇白汁鸡排套餐', price: 55.00,
        image: '',
        description: '浓郁白汁配上香煎鸡排，西式风味。',
        calories: 850, rating: 0, category: '米饭', reviews: []
      }
    ]
  },
  {
    id: '103',
    name: '和兴隆江猪脚饭',
    location: '厨艺天地',
    rating: 0,
    cuisineType: '粤菜',
    image: '/assets/images/103_cover.jpg',
    tags: ['中式', '广式', '米饭', '猪肉', '鸡肉', '粤菜', '潮汕菜', '卤味'],
    ratingBreakdown: { appearance: 0, aroma: 0, taste: 0 },
    reviews: [],
    menu: [
      {
        id: 'd103_1', name: '招牌隆江猪脚饭', price: 49.00,
        image: '',
        description: '猪脚软糯Q弹，卤汁浓郁，肥而不腻。',
        calories: 900, rating: 0, category: '米饭', reviews: []
      },
      {
        id: 'd103_2', name: '鲍汁排骨饭', price: 49.00,
        image: '',
        description: '排骨炖煮入味，鲍汁鲜美。',
        calories: 800, rating: 0, category: '米饭', reviews: []
      },
      {
        id: 'd103_3', name: '白切沙姜猪肘饭', price: 49.00,
        image: '',
        description: '沙姜风味独特，猪肘切片爽口。',
        calories: 750, rating: 0, category: '米饭', reviews: []
      },
      {
        id: 'd103_4', name: '卤五花肉饭', price: 48.00,
        image: '',
        description: '经典卤味，五花肉层次分明。',
        calories: 950, rating: 0, category: '米饭', reviews: []
      },
      {
        id: 'd103_5', name: '卤汁牛展饭', price: 49.00,
        image: '',
        description: '牛展有嚼劲，卤香四溢。',
        calories: 700, rating: 0, category: '米饭', reviews: []
      }
    ]
  },
  {
    id: '104',
    name: '欧巴韩式料理',
    location: '厨艺天地',
    rating: 0,
    cuisineType: '韩式',
    image: '/assets/images/104_cover.jpg',
    tags: ['韩式', '面条', '米饭', '牛肉', '鸡肉', '辣', '韩国菜', '韩料', '面食', '泡菜'],
    ratingBreakdown: { appearance: 0, aroma: 0, taste: 0 },
    reviews: [],
    menu: [
      {
        id: 'd104_1', name: '韩式辛拉面', price: 43.00,
        image: '',
        description: '热辣开胃，配上韩式泡菜。',
        calories: 550, rating: 0, category: '面条', reviews: []
      },
      {
        id: 'd104_2', name: '韩式芝士鸡丝拌面', price: 42.00,
        image: '',
        description: '浓郁芝士与香辣鸡丝的完美结合。',
        calories: 680, rating: 0, category: '面条', reviews: []
      },
      {
        id: 'd104_3', name: '韩式牛肉炒年糕', price: 50.00,
        image: '',
        description: '年糕软糯，牛肉嫩滑，甜辣口味。',
        calories: 720, rating: 0, category: '米饭', reviews: []
      },
      {
        id: 'd104_4', name: '韩式炸鸡拼盘', price: 45.00,
        image: '',
        description: '外酥里嫩，配甜辣酱和蜂蜜芥末酱。',
        calories: 900, rating: 0, category: '鸡肉', reviews: []
      }
    ]
  },
  {
    id: '105',
    name: '宫日厨',
    location: '厨艺天地',
    rating: 0,
    cuisineType: '日式',
    image: '/assets/images/105_cover.jpg',
    tags: ['日式', '面条', '米饭', '牛肉', '鸡肉', '猪肉', '海鲜', '日料', '日本菜', '面食', '盖饭'],
    ratingBreakdown: { appearance: 0, aroma: 0, taste: 0 },
    reviews: [],
    menu: [
      {
        id: 'd105_1', name: '黑豚猪软骨蔬菜饭', price: 48.00,
        image: '',
        description: '软骨炖得非常烂，入口即化，胶质丰富。',
        calories: 780, rating: 0, category: '米饭', reviews: []
      },
      {
        id: 'd105_2', name: '和风肥牛丼', price: 48.00,
        image: '',
        description: '经典日式肥牛饭，洋葱甜味十足。',
        calories: 750, rating: 0, category: '米饭', reviews: []
      },
      {
        id: 'd105_3', name: '一品锅丼', price: 55.00,
        image: '',
        description: '炸物与滑蛋的结合，口感丰富。',
        calories: 900, rating: 0, category: '米饭', reviews: []
      },
      {
        id: 'd105_4', name: '薄烧鳗鱼饭', price: 65.00,
        image: '',
        description: '鳗鱼肥美，酱汁浓郁。',
        calories: 800, rating: 0, category: '米饭', reviews: []
      },
      {
        id: 'd105_5', name: '日式吞拿鱼泡菜乌冬', price: 53.00,
        image: '',
        description: '酸辣开胃，乌冬面爽滑。',
        calories: 600, rating: 0, category: '面条', reviews: []
      }
    ]
  },
  {
    id: '106',
    name: '小两口',
    location: '厨艺天地',
    rating: 0,
    cuisineType: '中式',
    image: '/assets/images/106_cover.jpg',
    tags: ['中式', '面条', '牛肉', '猪肉', '辣', '川菜', '湘菜', '面食', '酸辣', '粉面'],
    ratingBreakdown: { appearance: 0, aroma: 0, taste: 0 },
    reviews: [],
    menu: [
      {
        id: 'd106_1', name: '大粒番茄牛腩汤面', price: 42.00,
        image: '',
        description: '番茄汤底浓郁，牛腩大块。',
        calories: 650, rating: 0, category: '面条', reviews: []
      },
      {
        id: 'd106_2', name: '牛肉酸辣粉', price: 42.00,
        image: '',
        description: '酸辣爽口，红薯粉劲道。',
        calories: 580, rating: 0, category: '面条', reviews: []
      },
      {
        id: 'd106_3', name: '红烧牛肉面', price: 42.00,
        image: '',
        description: '传统红烧口味，汤鲜味美。',
        calories: 700, rating: 0, category: '面条', reviews: []
      },
      {
        id: 'd106_4', name: '家常青椒肉末拌面', price: 38.00,
        image: '',
        description: '家常味道，青椒清香解腻。',
        calories: 620, rating: 0, category: '面条', reviews: []
      },
      {
        id: 'd106_5', name: '沙茶牛肉捞面', price: 42.00,
        image: '',
        description: '沙茶酱香浓郁，牛肉鲜嫩。',
        calories: 750, rating: 0, category: '面条', reviews: []
      }
    ]
  },

  // --- 位置：点聚 ---
  {
    id: '201',
    name: '盛记冰室',
    location: '点聚',
    rating: 0,
    cuisineType: '广式',
    image: '/assets/images/201_cover.jpg',
    tags: ['中式', '广式', '牛肉', '猪肉', '鸡肉', '米饭', '面条', '茶餐厅', '面食', '烧味'],
    ratingBreakdown: { appearance: 0, aroma: 0, taste: 0 },
    reviews: [],
    menu: [
      {
        id: 'd201_1', name: '两肉一菜', price: 38.00,
        image: '',
        description: '经济实惠，自选搭配。',
        calories: 750, rating: 0, category: '米饭', reviews: []
      },
      {
        id: 'd201_2', name: '香茅猪扒饭', price: 38.00,
        image: '',
        description: '猪扒带有淡淡香茅味，煎得恰到好处。',
        calories: 800, rating: 0, category: '米饭', reviews: []
      },
      {
        id: 'd201_3', name: '港式番茄肉酱意面', price: 38.00,
        image: '',
        description: '酸甜开胃，茶餐厅经典味道。',
        calories: 700, rating: 0, category: '面条', reviews: []
      },
      {
        id: 'd201_4', name: '生炒牛肉饭', price: 43.00,
        image: '',
        description: '米饭粒粒分明，锅气足。',
        calories: 850, rating: 0, category: '米饭', reviews: []
      },
      {
        id: 'd201_5', name: '黯然销魂叉烧饭', price: 40.00,
        image: '',
        description: '蜜汁叉烧配流心蛋，经典搭配。',
        calories: 820, rating: 0, category: '米饭', reviews: []
      },
      {
        id: 'd201_6', name: '麻辣手撕鸡饭', price: 43.00,
        image: '',
        description: '鸡肉撕成丝，拌上麻辣红油，下饭一绝。',
        calories: 720, rating: 0, category: '米饭', reviews: []
      }
    ]
  },

  // --- 位置：路环市集 ---
  {
    id: '301',
    name: '泰式小面',
    location: '路环市集',
    rating: 0,
    cuisineType: '泰式',
    image: '/assets/images/301_cover.jpg',
    tags: ['泰式', '鸡肉', '米饭', '海鲜', '面条', '猪肉', '辣', '泰国菜', '东南亚菜', '面食', '咖喱'],
    ratingBreakdown: { appearance: 0, aroma: 0, taste: 0 },
    reviews: [],
    menu: [
      {
        id: 'd301_1', name: '泰式青咖喱鸡排饭', price: 55.00,
        image: '',
        description: '青咖喱奶香浓郁，微辣，鸡排酥脆。',
        calories: 850, rating: 0, category: '米饭', reviews: []
      },
      {
        id: 'd301_2', name: '泰式猪颈肉煎蛋饭', price: 49.00,
        image: '',
        description: '猪颈肉爽脆，配特制泰式蘸水。',
        calories: 800, rating: 0, category: '米饭', reviews: []
      },
      {
        id: 'd301_3', name: '蚝仔米线', price: 53.00,
        image: '',
        description: '汤头鲜甜，蚝仔新鲜。',
        calories: 550, rating: 0, category: '面条', reviews: []
      },
      {
        id: 'd301_4', name: '猪颈肉米线', price: 53.00,
        image: '',
        description: '酸辣汤底配猪颈肉，开胃。',
        calories: 600, rating: 0, category: '面条', reviews: []
      }
    ]
  },
  {
    id: '302',
    name: '三合木',
    location: '路环市集',
    rating: 0,
    cuisineType: '意式',
    image: '/assets/images/302_cover.jpg',
    tags: ['意式', '猪肉', '鸡肉', '面条', '油炸', '西餐', '意粉', '面食', '炸鸡'],
    ratingBreakdown: { appearance: 0, aroma: 0, taste: 0 },
    reviews: [],
    menu: [
      {
        id: 'd302_1', name: '拿破仑肉酱意粉', price: 49.00,
        image: '',
        description: '经典红酱意面，肉酱给得足。',
        calories: 700, rating: 0, category: '面条', reviews: []
      },
      {
        id: 'd302_2', name: '新奥尔良烤翅（4件）', price: 39.00,
        image: '',
        description: '甜辣口味，烤得滋滋冒油。',
        calories: 400, rating: 0, category: '鸡肉', reviews: []
      },
      {
        id: 'd302_3', name: '薯条拼炸鸡翅（10件）', price: 59.00,
        image: '',
        description: '聚会小吃神器，量大管饱。',
        calories: 1100, rating: 0, category: '鸡肉', reviews: []
      }
    ]
  },
  {
    id: '303',
    name: '老袁记馄炖',
    location: '路环市集',
    rating: 0,
    cuisineType: '中式',
    image: '/assets/images/303_cover.jpg',
    tags: ['中式', '猪肉', '牛肉', '米饭', '面条', '馄饨', '面食', '饺子', '早餐'],
    ratingBreakdown: { appearance: 0, aroma: 0, taste: 0 },
    reviews: [],
    menu: [
      {
        id: 'd303_1', name: '鲜肉小馄炖', price: 32.00,
        image: '',
        description: '皮薄馅大，汤鲜味美。',
        calories: 400, rating: 0, category: '馄饨', reviews: []
      },
      {
        id: 'd303_2', name: '上海葱油拌面', price: 32.00,
        image: '',
        description: '葱香浓郁，面条劲道。',
        calories: 550, rating: 0, category: '面条', reviews: []
      },
      {
        id: 'd303_3', name: '牛腩汤面', price: 38.00,
        image: '',
        description: '牛腩炖得软烂，汤底醇厚。',
        calories: 650, rating: 0, category: '面条', reviews: []
      },
      {
        id: 'd303_4', name: '猪手饭', price: 48.00,
        image: '',
        description: '猪手富含胶质，软糯入味。',
        calories: 850, rating: 0, category: '米饭', reviews: []
      },
      {
        id: 'd303_5', name: '五花腩肉饭', price: 48.00,
        image: '',
        description: '肥瘦相间，卤味十足。',
        calories: 900, rating: 0, category: '米饭', reviews: []
      }
    ]
  },
  {
    id: '304',
    name: '濠江特色小炒',
    location: '路环市集',
    rating: 0,
    cuisineType: '澳门菜',
    image: '/assets/images/304_cover.jpg',
    tags: ['澳门菜', '海鲜', '鸡肉', '猪肉', '牛肉', '鹅肉', '面条', '茶餐厅', '面食', '炒菜'],
    ratingBreakdown: { appearance: 0, aroma: 0, taste: 0 },
    reviews: [],
    menu: [
      {
        id: 'd304_1', name: '烧鹅濑粉-蛋套餐', price: 77.00,
        image: '',
        description: '烧鹅皮脆肉嫩，濑粉滑爽。',
        calories: 750, rating: 0, category: '面条', reviews: []
      },
      {
        id: 'd304_2', name: '牛肋骨-香肠-蛋套餐', price: 68.00,
        image: '',
        description: '肉食者的狂欢，牛肋骨烤得很香。',
        calories: 950, rating: 0, category: '牛肉', reviews: []
      },
      {
        id: 'd304_3', name: '咖喱鸡-牛肉套餐', price: 68.00,
        image: '',
        description: '葡式咖喱风味，双拼满足。',
        calories: 880, rating: 0, category: '米饭', reviews: []
      },
      {
        id: 'd304_4', name: '黑椒猪扒-香肠-蛋套餐', price: 49.00,
        image: '',
        description: '茶餐厅经典搭配，黑椒汁浓郁。',
        calories: 900, rating: 0, category: '猪肉', reviews: []
      },
      {
        id: 'd304_5', name: '鲍鱼闷鸡套餐', price: 68.00,
        image: '',
        description: '食材豪华，鲜味十足。',
        calories: 700, rating: 0, category: '鸡肉', reviews: []
      }
    ]
  },
  {
    id: '305',
    name: '大将',
    location: '路环市集',
    rating: 0,
    cuisineType: '日式',
    image: '/assets/images/305_cover.jpg',
    tags: ['日式', '米饭', '牛肉', '鸡肉', '饺子', '油炸', '日料', '烧烤', '居酒屋'],
    ratingBreakdown: { appearance: 0, aroma: 0, taste: 0 },
    reviews: [],
    menu: [
      {
        id: 'd305_1', name: '经典汁烧肥牛丼', price: 59.00,
        image: '',
        description: '酱汁是灵魂，拌饭一绝。',
        calories: 780, rating: 0, category: '米饭', reviews: []
      },
      {
        id: 'd305_2', name: '烧孜然牛肋条丼', price: 63.00,
        image: '',
        description: '孜然风味独特，牛肋条有嚼劲。',
        calories: 820, rating: 0, category: '米饭', reviews: []
      },
      {
        id: 'd305_3', name: '日式炸饺子', price: 28.00,
        image: '',
        description: '外皮酥脆，内馅多汁。',
        calories: 400, rating: 0, category: '饺子', reviews: []
      },
      {
        id: 'd305_4', name: '秘制酱烧鸡腿肉', price: 15.00,
        image: '',
        description: '鲜嫩多汁的烤鸡腿肉。',
        calories: 250, rating: 0, category: '鸡肉', reviews: []
      },
      {
        id: 'd305_5', name: '串烧一口牛肉粒', price: 25.00,
        image: '',
        description: '一口一个，肉香四溢。',
        calories: 300, rating: 0, category: '牛肉', reviews: []
      },
      {
        id: 'd305_6', name: '秘制酱烧鸡全翅', price: 17.00,
        image: '',
        description: '酱汁入味，烤得恰到好处。',
        calories: 350, rating: 0, category: '鸡肉', reviews: []
      }
    ]
  }
];

// --- Final Data Processing ---

// Process the raw data to inject mocks (50 reviews per item) and update images
export const RESTAURANTS = RAW_RESTAURANTS.map(r => {
  // 1. Generate Restaurant Reviews (Simulate 50 people)
  const rStats = generateReviews(r.id, 50);

  // 2. Process Menu
  const processedMenu = r.menu.map(d => {
    // Generate Dish Reviews (Simulate 50 people)
    const dStats = generateReviews(d.id, 50);
    
    // Update Image URL
    const newImage = `https://raw.githubusercontent.com/zhD1dqz/must-canteen/main/images/${d.name}.jpg`;

    return {
      ...d,
      image: newImage,
      rating: dStats.average,
      reviews: dStats.reviews
    };
  });

  return {
    ...r,
    rating: rStats.average,
    ratingBreakdown: rStats.breakdown,
    reviews: rStats.reviews,
    menu: processedMenu
  };
});
