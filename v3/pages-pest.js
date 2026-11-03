'use strict';
const MODELS = [['随机森林', .926, .951, '0.921 ± 0.014', '良好'], ['支持向量机', .902, .934, '0.889 ± 0.026', '过拟合，已加正则'], ['神经网络 MLP', .938, .962, '0.931 ± 0.011', '良好'], ['融合模型（加权）', .951, .971, '0.946 ± 0.008', '良好']];
const FEAT = [['气象特征', 14, 31, '积温、降雨、冠层湿度、日照'], ['影像特征', 12, 24, '病斑面积、纹理、颜色'], ['土壤特征', 9, 18, '含水率、EC、pH、有机质'], ['物候特征', 6, 16, '生育期、果龄、新梢抽发'], ['历史发生', 8, 11, '上年发病率、邻近地块']];
const AL = [['W-2610', '芒果 · 桂热芒 82 号', '3 号地块', '炭疽病', 86, '果实膨大期'], ['W-2609', '荔枝 · 妃子笑', '7 号地块', '蒂蛀虫', 74, '果实着色期'], ['W-2608', '香蕉 · 巴西蕉', '12 号地块', '叶斑病', 68, '营养生长期'], ['W-2607', '火龙果 · 红心', '9 号地块', '溃疡病', 52, '开花期']];
S.th = 70; S.sent = {}; S.mod = 3; S.modelState = { training: false, trained: false, published: '' };
ACT.mod = d => { S.mod = +d.i; render() };
ACT.th = (d, el) => { S.th = +el.value; render() };
ACT.thsave = () => toast('预警阈值已保存为 ' + S.th + '%');
ACT.send = d => { S.sent[d.k] = (S.sent[d.k] || 0) + 1; render(); toast(d.m) };
ACT.pesttrain = () => { S.modelState.training=true; render(); setTimeout(()=>{S.modelState.training=false;S.modelState.trained=true;render();toast('演示训练完成：模型评估结果已更新')},650) };
ACT.pestpublish = () => { if(!S.modelState.trained){toast('请先完成一次模型训练');return} S.modelState.published=MODELS[S.mod][0]; render(); toast('已发布当前模型版本') };

PAGES['pest.model'] = () => {
    const m = MODELS[S.mod];
    return lead([['3 类', '基础算法'], ['49 维', '融合特征'], ['0.951', '融合模型 F1'], ['42.6 万', '训练与验证样本']]) + `<div class='grid g-2-1' style='align-items:start'>${panel('模型对比', table([{ t: '模型' }, { t: 'F1', r: 1 }, { t: 'AUC', r: 1 }, { t: '5 折交叉验证', r: 1 }, { t: '拟合诊断' }], MODELS.map(x => [`<b>${x[0]}</b>`, x[1].toFixed(3), x[2].toFixed(3), x[3], tag(x[4], x[4] === '良好' ? 'ok' : 'warn')]), { pick: 'mod', sel: S.mod }).replace(/data-i='/g, `data-i='`), 'flush')}<div class='grid'>${panel('特征融合', FEAT.map(f => `<div style='margin-bottom:10px'><div class='row' style='justify-content:space-between;font-size:13px'><span>${f[0]} <span class='mute'>${f[1]} 项</span></span><span class='mono'>${f[2]}%</span></div>${bar(f[2] * 2.8)}<span class='mute' style='font-size:12px'>${f[3]}</span></div>`).join(''))}${panel('防止过拟合', kv({ 正则化: 'L2，系数 0.01', 验证: '5 折交叉验证', 训练: '早停', 数据划分: '训练与验证 8 比 2', 发布版本: S.modelState.published || '未发布' }) + `<div class='row' style='margin-top:14px'><button class='btn primary sm' data-act='pesttrain' ${S.modelState.training?'disabled':''}>${S.modelState.training?'训练中…':'重新训练'}</button><button class='btn sm' data-act='pestpublish'>发布「${m[0]}」</button></div>`)}</div></div>`;
};
ACT.mod = d => { S.mod = +d.i; render() };

PAGES['pest.alert'] = () => {
    const on = AL.filter(a => a[4] >= S.th);
    const W = [['炭疽病', '果实膨大期，高风险', '高湿 24–28 ℃ 易发，雨后 3 天为侵染高峰', '10-28 至 11-01', '3 天'], ['蒂蛀虫', '果实着色期，高风险', '成虫产卵于果蒂，孵化后蛀入果内', '10-30 至 11-04', '7 天'], ['叶斑病', '营养生长期，中风险', '老叶先发病，风雨传播，蔓延慢', '11-01 至 11-09', '12 天']];
    return `<div class='grid g-1-2' style='align-items:start'>${panel('预警阈值', `<div class='row' style='align-items:baseline'><span class='mono' style='font-size:34px;font-weight:700;color:var(--priva-navy)'>${S.th}</span><span class='mute'>%</span><span class='mute' style='margin-left:auto;font-size:13px'>当前触发 ${on.length} / ${AL.length} 条</span></div><input type='range' min='30' max='95' value='${S.th}' data-change='th' style='width:100%;accent-color:var(--priva-blue)' aria-label='预警阈值'><div class='row' style='justify-content:space-between;font-size:12px;color:var(--priva-mute)'><span>30% 更灵敏</span><span>95% 更保守</span></div><div class='row' style='margin-top:14px'><button class='btn primary sm' data-act='thsave'>保存阈值</button></div><p class='mute' style='font-size:12px;margin:12px 0 0'>预测概率超过阈值时触发预警，并推送给地块负责人。</p>`)}${panel('今日预警', table([{ t: '编号' }, { t: '作物 / 地块' }, { t: '病虫害' }, { t: '概率', r: 1 }, { t: '物候期' }, { t: '状态' }], AL.map(a => { const t = a[4] >= S.th; return [`<span class='mono'>${a[0]}</span>`, `${a[1]}<br><span class='mute' style='font-size:12px'>${a[2]}</span>`, a[3], `<b style='color:${t ? 'var(--priva-red)' : 'var(--priva-mute)'}'>${a[4]}%</b>`, a[5], t ? tag(a[4] > 80 ? '已触发 · 紧急' : '已触发', a[4] > 80 ? 'alert' : 'warn') : tag('未触发')] })), 'flush')}</div><div style='margin-top:20px'>${panel('最佳防治时机', table([{ t: '病虫害' }, { t: '物候期风险' }, { t: '发生规律' }, { t: '防治窗口' }, { t: '剩余', r: 1 }], W), 'flush')}</div>`;
};

PAGES['pest.guide'] = () => {
    const C = [['now', '立即处置，72 小时内', '芒果 3 号地块 · 炭疽病', '苯醚甲环唑 1500 倍液全园喷雾；剪除病果并销毁；雨后补喷。', 'alert'], ['watch', '重点监测，7 天内', '荔枝 7 号地块 · 蒂蛀虫', '每 3 天检查果蒂；成虫高峰前悬挂诱虫板，必要时用氯虫苯甲酰胺。', 'warn'], ['pre', '预防管理，14 天内', '香蕉 12 号地块 · 叶斑病', '改善通风，清除老叶；雨后喷施保护性药剂。', '']];
    return `<div class='grid g-3'>${C.map(c => panel(c[1], `<div style='margin-bottom:8px'>${tag(c[2], c[4])}</div><p style='margin:0 0 14px;min-height:72px;color:var(--priva-slate)'>${c[3]}</p><div class='row'><button class='btn primary sm' data-act='send' data-k='${c[0]}f' data-m='防控单已生成'>${S.sent[c[0] + 'f'] ? '已生成' : '生成防控单'}</button><button class='btn sm' data-act='send' data-k='${c[0]}p' data-m='已推送给地块负责人'>${S.sent[c[0] + 'p'] ? '已推送' : '推送给负责人'}</button></div>`)).join('')}</div><div style='margin-top:20px'>${panel('建议是怎么生成的', table([{ t: '输入' }, { t: '规则' }, { t: '输出' }], [['风险概率 86%', '超过阈值 70%，进入紧急通道', '72 小时内处置'], ['物候期：果实膨大期', '该期不用高毒药剂，优先三唑类', '苯醚甲环唑'], ['未来 3 天有雨', '雨前 24 小时施药，雨后补喷', '明天上午施药'], ['砂壤土，保水性差', '药液量上调 10%', '每亩 60 升'], ['距采收 21 天', '满足安全间隔期', tag('可施药', 'ok')]]), 'flush')}</div>`;
};
