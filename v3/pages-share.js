'use strict';
const GERM = [['HN-MG-0421', '桂热芒 82 号', '芒果', '海南昌江', '18.4', '高抗炭疽病', '公开'], ['HN-MG-0819', '热研金煌芒 3 号', '芒果', '海南三亚', '17.6', '中抗白粉病', '受限'], ['GD-LZ-0108', '仙进奉优系 A2', '荔枝', '广东增城', '19.8', '耐裂果', '公开'], ['GX-XJ-0312', '桂蕉 9 号抗枯萎系', '香蕉', '广西武鸣', '21.2', '抗枯萎病', '涉密'], ['YN-BL-0205', '金钻凤梨 T17', '菠萝', '云南景洪', '16.9', '耐寒', '公开'], ['HN-HL-0094', '热科红心火龙果 2 号', '火龙果', '海南东方', '18.1', '中抗溃疡病', '受限']];
S.crop = '全部'; S.api = 0;
ACT.toast = d => toast(d.m);
ACT.crop = d => { S.crop = d.v; render() };
ACT.api = d => { S.api = +d.i; render() };
const seg = (items, cur, act) => `<div class='row' style='margin-bottom:14px'>${items.map(x => `<button class='btn sm ${x === cur ? 'primary' : ''}' data-act='${act}' data-v='${x}'>${x}</button>`).join('')}</div>`;
const lvl = l => tag(l, l === '涉密' ? 'alert' : l === '受限' ? 'warn' : 'ok');
const rank = (items, tone = '') => `<ol style='list-style:none;margin:0;padding:0'>${items.map(([n, v, p, t]) => `<li style='padding:9px 0;border-bottom:1px solid var(--priva-line)'><div class='row' style='justify-content:space-between;font-size:13px;margin-bottom:4px'><span>${n}</span><span class='mono'>${t || v.toLocaleString()}</span></div>${bar(p, tone)}</li>`).join('')}</ol>`;

PAGES['share.library'] = () => {
    const rows = GERM.filter(r => S.crop === '全部' || r[2] === S.crop).map(r => [`<span class='mono'>${r[0]}</span>`, `<b>${r[1]}</b>`, r[2], r[3], r[4] + '%', r[5], lvl(r[6]), `<button class='btn sm' data-act='toast' data-m='已打开种质档案'>查看档案</button>`]);
    return lead([['38,412', '种质资源总量'], ['91.6%', '已数字化'], ['642', '本月新增'], ['37', '共享机构']]) + seg(['全部', '芒果', '荔枝', '香蕉', '菠萝', '火龙果'], S.crop, 'crop') + panel('种质资源档案', table([{ t: '编号' }, { t: '名称' }, { t: '作物' }, { t: '原产地' }, { t: '糖度', r: 1 }, { t: '抗性' }, { t: '共享级别' }, { t: '' }], rows), 'flush');
};

PAGES['share.collab'] = () => {
    const pk = [['华南芒果种质表型联合包', '热科院品资所 与 海南热作所', '9,860 份种质 · 42 万条表型', '双向同步中', ''], ['荔枝耐裂果系谱共享集', '广东农科院 与 广西热作所', '3,420 份种质 · 三代系谱', '协议有效至 2027-12', 'ok'], ['香蕉枯萎病抗性联防数据', '云南热区院 与 湛江试验站', '1,890 份抗性鉴定记录', '需审批后访问', 'warn']];
    return `<div class='grid g-3'>${pk.map(p => panel(p[0], `<p style='margin:0 0 8px;color:var(--priva-slate)'>${p[1]}</p><p class='mono mute' style='margin:0 0 14px;font-size:12px'>${p[2]}</p><div class='row' style='justify-content:space-between'>${tag(p[3], p[4])}<button class='btn sm' data-act='toast' data-m='已打开共享协议'>查看协议</button></div>`)).join('')}</div><div style='margin-top:20px'>${panel('发起新的共享', `<div class='row'><button class='btn primary' data-act='toast' data-m='已提交共享申请'>选择数据集并邀请机构</button><span class='mute' style='font-size:12px'>可设置共享范围、有效期和是否允许二次分发</span></div>`)}</div>`;
};

const APIS = [
    { id: 'germ-passport', n: '种质基础信息查询', m: 'GET', v: 'v2.4', sub: 38, calls: 318420, fail: 0.12, auth: 'OAuth2 + 签名', d: '按编号、作物、原产地查询种质档案。', req: { germplasmId: 'HN-MG-0421', fields: ['morphology', 'brix', 'resistance'] }, res: { code: 0, data: { germplasmId: 'HN-MG-0421', name: '桂热芒 82 号', brix: 18.4 } } },
    { id: 'orchard-meteo', n: '果园小气候逐小时序列', m: 'GET', v: 'v3.1', sub: 44, calls: 512680, fail: 0.46, auth: 'AppKey', d: '按地块返回逐小时温湿度、降雨和土壤 EC。', req: { plotId: 'PLOT-03', metrics: ['temp', 'rh', 'soilEc'], window: '24h' }, res: { code: 0, data: [{ ts: '2026-10-21T14:00', temp: 29.1, rh: 88, soilEc: 2.41 }] } },
    { id: 'pest-samples', n: '病虫害标注样本', m: 'POST', v: 'v1.2', sub: 19, calls: 89400, fail: 3.68, auth: 'OAuth2 + IP 白名单', d: '分页拉取专家复核过的病虫害影像与标注。', req: { crop: '芒果', disease: '炭疽病', page: 1, pageSize: 50 }, res: { code: 0, data: { total: 14280, samples: [{ id: 'SMP-8814', severity: 2 }] } } },
    { id: 'phenology', n: '物候期观测记录', m: 'GET', v: 'v1.5', sub: 26, calls: 142300, fail: 2.41, auth: 'OAuth2', d: '返回各站点萌芽、开花、膨大、成熟的观测时间。', req: { stationId: 'OBS-HN-CJ-07', season: 2026 }, res: { code: 0, data: { stage: '果实膨大期', daysInStage: 24 } } }
];
PAGES['share.market'] = () => {
    const a = APIS[S.api];
    return `<div class='grid g-2-1' style='align-items:start'>${panel('API 目录', table([{ t: '接口' }, { t: '版本' }, { t: '订购方', r: 1 }, { t: '今日调用', r: 1 }, { t: '失败率', r: 1 }], APIS.map(x => [`<b>${x.n}</b><br><span class='mono mute' style='font-size:11px'>${x.id}</span>`, x.v, x.sub, x.calls.toLocaleString(), `<span style='color:${x.fail > 2 ? 'var(--priva-red)' : 'inherit'}'>${x.fail.toFixed(2)}%</span>`]), { pick: 'api', sel: S.api }), 'flush')}<div class='grid'>${panel(a.n, `<p style='margin:0 0 12px;color:var(--priva-slate)'>${a.d}</p>` + kv({ 请求方式: a.m + ' /openapi/' + a.id, 鉴权: a.auth, 订购机构: a.sub + ' 家', 今日调用: a.calls.toLocaleString() + ' 次' }))}${panel('请求参数', `<pre class='code'>${JSON.stringify(a.req, null, 2)}</pre>`)}${panel('返回参数', `<pre class='code'>${JSON.stringify(a.res, null, 2)}</pre>`)}</div></div>`;
};

PAGES['share.monitor'] = () => `<div class='grid g-3'>${panel('用户调用量排行', rank([['海南省热带作物研究所', 412580, 100], ['中国热科院品种资源所', 338210, 82], ['广西亚热带作物研究所', 204760, 50], ['云南热区农业科学院', 151320, 37], ['广东湛江芒果试验站', 98640, 24]]))}${panel('接口调用量排行', rank([['果园小气候逐小时序列', 512680, 100], ['种质基础信息查询', 318420, 62], ['物候期观测记录', 142300, 28], ['品种权属与系谱', 96540, 19], ['病虫害标注样本', 89400, 17]]))}${panel('接口失败率排行', rank([['病虫害标注样本', 0, 100, '3.68%'], ['物候期观测记录', 0, 65, '2.41%'], ['果园小气候逐小时序列', 0, 13, '0.46%'], ['种质基础信息查询', 0, 3, '0.12%'], ['品种权属与系谱', 0, 2, '0.08%']], 'alert') + `<p class='mute' style='font-size:12px;margin:10px 0 0'>失败集中在样本库分页超时和频次超限。</p>`)}</div>`;

S.q = { limit: 5000, qps: 10, used: 4680, cur: 6, stop: false, why: '', sub: false, log: ['10-20 09:12 配额调整生效，由 40,000 提升至 60,000 次/日'] };
ACT.qset = (d, el) => { S.q[d.k] = Math.max(1, +el.value || 1); S.q.stop = false; render() };
ACT.qsub = () => { S.q.sub = true; render(); toast('申请已提交，等待审批') };
ACT.qcount = () => { const q = S.q; q.used = q.limit + 320; q.stop = true; q.why = '当日调用 ' + q.used.toLocaleString() + ' 次，超过申请的 ' + q.limit.toLocaleString() + ' 次/日'; q.log.unshift('刚刚 次数超限，已自动停止服务'); render() };
ACT.qqps = () => { const q = S.q; q.cur = q.qps + 8; q.stop = true; q.why = '瞬时频次 ' + q.cur + ' 次/秒，超过申请的 ' + q.qps + ' 次/秒'; q.log.unshift('刚刚 频次超限，已自动停止服务'); render() };
ACT.qok = () => { const q = S.q; q.used = Math.round(q.limit * .4); q.cur = Math.round(q.qps * .5); q.stop = false; q.why = ''; q.log.unshift('刚刚 审批通过，服务已恢复'); render() };
PAGES['share.quota'] = () => {
    const q = S.q, over1 = q.used > q.limit, over2 = q.cur > q.qps;
    return `<div class='grid g-1-2' style='align-items:start'>${panel('配额申请', `<div class='field'><label>调用次数上限（次 / 天）</label><input type='number' value='${q.limit}' data-change='qset' data-k='limit'></div><div class='field'><label>调用频次上限（次 / 秒）</label><input type='number' value='${q.qps}' data-change='qset' data-k='qps'></div><div class='row'><button class='btn primary' data-act='qsub'>提交申请</button>${q.sub ? tag('已提交 · 待审批', 'warn') : ''}</div><p class='mute' style='font-size:12px;margin:12px 0 0'>次数和频次任一项超出申请值，系统会自动为该用户停止 API 服务。</p>`)}${panel('使用情况', `<div class='row' style='justify-content:space-between;margin-bottom:12px'><b>海南省热带作物研究所</b>${q.stop ? tag('服务已自动停止', 'alert') : tag('服务正常', 'ok')}</div><div class='grid g-2'><div><div class='mute' style='font-size:12px'>今日调用次数</div><div class='mono' style='font-size:22px;color:${over1 ? 'var(--priva-red)' : 'inherit'}'>${q.used.toLocaleString()} / ${q.limit.toLocaleString()}</div>${bar(q.used / q.limit * 100, over1 ? 'alert' : 'ok')}</div><div><div class='mute' style='font-size:12px'>实时调用频次</div><div class='mono' style='font-size:22px;color:${over2 ? 'var(--priva-red)' : 'inherit'}'>${q.cur} / ${q.qps} 次/秒</div>${bar(q.cur / q.qps * 100, over2 ? 'alert' : 'ok')}</div></div><div class='row' style='margin:16px 0'><button class='btn' data-act='qcount' ${q.stop ? 'disabled' : ''}>模拟次数超限</button><button class='btn' data-act='qqps' ${q.stop ? 'disabled' : ''}>模拟频次超限</button><button class='btn primary' data-act='qok' ${q.stop ? '' : 'disabled'}>审批通过并恢复</button></div>${q.stop ? `<pre class='code'>HTTP 429 QUOTA_EXCEEDED\n${q.why}\n已停止该用户的 API 服务，恢复需重新审批。</pre>` : ''}<h3 style='margin:16px 0 8px;font-size:14px'>停服与审批记录</h3><ul style='margin:0;padding-left:18px;font-size:13px;color:var(--priva-slate)'>${q.log.map(l => `<li>${l}</li>`).join('')}</ul>`)}</div>`;
};

PAGES['share.safe'] = () => `<div class='grid g-2'>${panel('数据安全与隐私保护', table([{ t: '措施' }, { t: '说明' }, { t: '状态' }], [['坐标脱敏', '野生近缘种的采集坐标自动模糊处理', tag('已开启', 'ok')], ['传输加密', '全链路 TLS 1.3，报文签名', tag('已开启', 'ok')], ['存储加密', '库表 AES-256，密钥定期轮换', tag('正常', 'ok')], ['访问审计', '调用与导出日志保留 180 天', tag('拦截 3 次', 'warn')]]), 'flush')}${panel('系统管理与维护', table([{ t: '项目' }, { t: '当前状态' }, { t: '' }], [['API 网关', '4 个节点正常，可用率 99.97%', tag('健康', 'ok')], ['配额计数器', '读写延迟 0.4 ms', tag('健康', 'ok')], ['数据备份', '今日 02:00 增量备份完成', tag('已校验', 'ok')], ['角色与权限', '109 家机构，2 项待审批', tag('待办', 'warn')]]), 'flush')}</div>`;
