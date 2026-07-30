/* ═══════════════════════════════════════════
   search-index.js — Site content search index
   CDTU 应用统计学四年规划 | FDD
   ═══════════════════════════════════════════ */
(function() {
  'use strict';
  window.CDTU = window.CDTU || {};

  window.CDTU.SearchIndex = [
    // ── Home ──
    { title: '核心目标', snippet: '本科毕业即具备独立胜任数据分析/商业分析类岗位的能力，拥有完整项目作品集与实习经验', url: 'index.html', page: '首页', keywords: '目标 就业 数据分析 商业分析' },
    { title: '德厚流光 栋立苍穹', snippet: '成都工业学院 · 大数据与人工智能学院 · 2026–2030 · 创作者：FDD', url: 'index.html', page: '首页', keywords: '校训 motto 成都工业学院' },

    // ── Plan ──
    { title: '大一·筑基期', snippet: '适应大学生活、打好数学基础、建立编程思维、探索方向。高数、线代、Python入门', url: 'plan.html', page: '四年规划', keywords: '大一 筑基 数学分析 高等数学 线性代数 Python' },
    { title: '大二·进阶期', snippet: '数理统计深化、SQL掌握、竞赛起步、工具链成型。数理统计、数据库、多元统计', url: 'plan.html', page: '四年规划', keywords: '大二 进阶 数理统计 SQL 数据库 建模竞赛' },
    { title: '大三·实战期', snippet: '机器学习入门、实习经历、项目作品集建设、确定方向。机器学习、时间序列、抽样调查', url: 'plan.html', page: '四年规划', keywords: '大三 实战 机器学习 实习 项目 XGBoost A/B测试' },
    { title: '大四·冲刺期', snippet: '秋招全力以赴、毕业论文、深度项目、软技能补齐。秋招、简历、面试、Offer', url: 'plan.html', page: '四年规划', keywords: '大四 冲刺 秋招 毕业论文 面试 Offer 春招' },
    { title: '数学分析/高等数学', snippet: '统计学的根，不能只求及格，要真正理解极限、积分、级数的直觉', url: 'plan.html', page: '四年规划', keywords: '高数 数学分析 微积分 极限' },
    { title: '线性代数', snippet: '矩阵运算、特征值、SVD，后续机器学习的骨架知识', url: 'plan.html', page: '四年规划', keywords: '线代 矩阵 特征值 SVD' },
    { title: '概率论', snippet: '统计学的语言，贝叶斯公式、大数定律、中心极限定理', url: 'plan.html', page: '四年规划', keywords: '概率 贝叶斯 大数定律 中心极限定理' },
    { title: 'Python基础', snippet: '从Jupyter Notebook开始写你的第一行代码。NumPy → Pandas → 数据清洗与可视化', url: 'plan.html', page: '四年规划', keywords: 'Python NumPy Pandas Jupyter 编程' },
    { title: 'SQL学习', snippet: 'SQL从入门到熟练：LeetCode SQL题库 + HackerRank + 牛客网SQL实战，每天3道', url: 'plan.html', page: '四年规划', keywords: 'SQL LeetCode 数据库 查询 面试' },
    { title: 'CET-4/CET-6', snippet: '四级必须过，目标550+。六级争取一次通过，目标500+', url: 'plan.html', page: '四年规划', keywords: '英语 四级 六级 CET 考试' },

    // ── Skills ──
    { title: '技术栈路线图', snippet: '从零开始，按学年逐步搭建你的数据分析技术栈。编程语言、数据处理、SQL、可视化、机器学习、统计学、工具链、业务能力、软技能', url: 'skills.html', page: '技能竞赛', keywords: '技术栈 技能 Python SQL Tableau 机器学习 统计学' },
    { title: '全国大学生数学建模竞赛 CUMCM', snippet: '每年9月·3天3夜·3人组队。国内规模最大、含金量最高的建模竞赛', url: 'skills.html', page: '技能竞赛', keywords: '数学建模 国赛 CUMCM 竞赛' },
    { title: '美国大学生数学建模竞赛 MCM/ICM', snippet: '每年1-2月·4天·3人组队。国际级竞赛，全英文论文撰写', url: 'skills.html', page: '技能竞赛', keywords: '美赛 MCM ICM 数学建模 国际' },
    { title: '正大杯市场调查与分析大赛', snippet: '每年10月启动·持续数月。统计学专业最对口的竞赛之一', url: 'skills.html', page: '技能竞赛', keywords: '正大杯 市场调查 问卷 抽样 竞赛' },
    { title: '挑战杯', snippet: '两年一届（奇数年）。中国大学生奥林匹克，需要跨专业组队', url: 'skills.html', page: '技能竞赛', keywords: '挑战杯 学术科技 竞赛 跨专业' },
    { title: 'Kaggle数据科学竞赛', snippet: '全年滚动，随时参加。国际数据科学社区，简历上的国际认可度极高', url: 'skills.html', page: '技能竞赛', keywords: 'Kaggle 数据科学 竞赛 Titanic' },
    { title: '全国大学生统计建模大赛', snippet: '每年3-6月。统计学专业最直接的竞赛', url: 'skills.html', page: '技能竞赛', keywords: '统计建模 竞赛 经济 社会 管理' },
    { title: '数据分析项目选题', snippet: '豆瓣电影分析、成都二手房价格分析、APP用户行为分析、电商销售预测、信用卡欺诈检测等10个选题', url: 'skills.html', page: '技能竞赛', keywords: '项目 选题 数据分析 实战 GitHub' },

    // ── Career ──
    { title: '数据分析师', snippet: '成都应届6K-10K·一线10K-18K。负责业务数据提取、指标监控、分析报告', url: 'career.html', page: '就业书单', keywords: '就业 数据分析师 薪资 SQL Python BI' },
    { title: '数据科学家', snippet: '成都应届8K-14K·一线15K-25K。偏建模方向，要求更强的数学和机器学习能力', url: 'career.html', page: '就业书单', keywords: '就业 数据科学家 机器学习 深度学习' },
    { title: '商业分析师', snippet: '成都应届7K-12K·一线12K-20K。介于业务和技术之间', url: 'career.html', page: '就业书单', keywords: '就业 商业分析 BA 行业研究' },
    { title: '金融风控分析', snippet: '成都应届7K-12K·一线12K-18K。银行、消费金融、保险行业', url: 'career.html', page: '就业书单', keywords: '就业 金融 风控 评分卡 银行' },
    { title: '推荐书单', snippet: '深入浅出统计学、利用Python进行数据分析、精益数据分析、SQL必知必会、统计学习导论ISLR等', url: 'career.html', page: '就业书单', keywords: '书单 书籍 统计 机器学习 Python 推荐' },
    { title: '学习资源', snippet: '可汗学院、SQLZoo、Kaggle Learn、DataLemur、ISLR免费PDF、Tableau Public、Coursera等', url: 'career.html', page: '就业书单', keywords: '资源 学习 免费 在线课程 MOOC' },

    // ── Tools ──
    { title: '每周作息模板', snippet: '大一/大二参考作息。每天保证2-3小时课外学习', url: 'tools.html', page: '工具FAQ', keywords: '作息 时间表 每日 习惯 自律' },
    { title: '学期关键节点', snippet: '八个学期的核心任务：大一适应→大二竞赛→大三实习→大四秋招', url: 'tools.html', page: '工具FAQ', keywords: '学期 节点 大一 大二 大三 大四 时间线' },
    { title: '关键习惯清单', snippet: '每天1小时编程练习、每项目写总结文章、保持分析日志、每周读行业报告', url: 'tools.html', page: '工具FAQ', keywords: '习惯 坚持 编程 写作 阅读' },
    { title: 'GPA计算器', snippet: '输入课程和成绩，自动计算加权平均绩点（4.0标准）', url: 'tools.html', page: '工具FAQ', keywords: 'GPA 绩点 计算 成绩' },
    { title: '技能打卡清单', snippet: '按类别追踪你的技能掌握进度，数据保存在浏览器中', url: 'tools.html', page: '工具FAQ', keywords: '技能 打卡 追踪 进度' },
    { title: 'FAQ常见问题', snippet: '不考研好就业吗？Python还是R？找不到实习怎么办？面试问什么？需要考哪些证书？', url: 'tools.html', page: '工具FAQ', keywords: 'FAQ 问题 考研 实习 面试 证书 就业' },
    { title: 'CDA数据分析师', snippet: '国内认可度最高的数据分析证书，考试费约1000元。推荐大二/大三考取', url: 'tools.html', page: '工具FAQ', keywords: 'CDA 证书 数据分析师 认证' },
  ];
})();
