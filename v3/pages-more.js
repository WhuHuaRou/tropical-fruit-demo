'use strict';
const MSUB = ['材料查询', '性状分组', '材料分组', '编码规则', '材料图片', '系谱追溯', '家系生成', '配组统计', '分组管理'];
S.ms = 0; S.mq = ''; S.tg = [['产量性状', 12], ['品质性状', 18], ['抗性性状', 9], ['物候性状', 7]]; S.mg = [['优良系', 1320], ['抗病系', 864], ['耐裂果', 512], ['耐寒系', 298]]; S.mem = {}; S.rule = { region: 'HN', crop: 'MG', digits: 4, start: 1 }; S.fam = null; S.ped = 0; S.fm = 0; S.mm = 1; S.img = {};
ACT.ms = d => { S.ms = +d.i; render() };
ACT.mq = (d, el) => { S.mq = el.value; render() };
ACT.gadd = d => { S[d.k].push(['新建分组 ' + (S[d.k].length + 1), 0]); render() };
ACT.gdel = d => { S[d.k].splice(+d.i, 1); render() };
ACT.rule = (d, el) => { S.rule[d.k] = (d.k === 'digits' || d.k === 'start') ? Math.max(1, +el.value || 1) : el.value; render() };
ACT.rulesave = () => { toast('编码规则已保存，本系统新建材料将按该规则生成编号') };
ACT.fp = (d, el) => { S[d.k] = +el.value; S.fam = null; render() };
ACT.ped = d => { S.ped = +d.i; render() };
ACT.fgen = () => { if (S.fm === S.mm) { toast('母本和父本不能是同一份材料'); return } S.fam = Array.from({ length: 6 }, (_, i) => MAT[S.fm][0] + ' × ' + MAT[S.mm][0] + ' · F1-' + String(i + 1).padStart(2, '0')); render(); toast('已生成 6 个家系') };
ACT.famadd = () => { if (!S.fam?.length) { toast('请先生成家系'); return } S.plan.families=[...(S.plan.families||[]),...S.fam]; render(); toast('家系已加入本系统育种方案') };
ACT.gmove = (d, el) => { S.mem[d.c] = el.value; render(); toast('已调整分组') };
ACT.iadd = async (d, el) => {
    const files = [...(el?.files || [])].filter(file => file.type.startsWith('image/'));
    if (!files.length) { toast('请选择图片文件'); return }
    const read = file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve({ name: file.name, url: reader.result });
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
    try {
        const added = await Promise.all(files.map(read));
        S.img[d.c] = [...(S.img[d.c] || []), ...added];
        render(); toast(`已添加 ${added.length} 张图片`);
    } catch { toast('图片读取失败，请重试') }
};
ACT.idel = d => { S.img[d.c].splice(+d.i, 1); render() };
const gv = (k, t) => panel(t, `<div class='row' style='padding:0 24px 14px'><button class='btn primary sm' data-act='gadd' data-k='${k}'>新建分组</button></div>` + table([{ t: '分组名称' }, { t: '数量', r: 1 }, { t: '' }], S[k].map((g, i) => [`<b>${g[0]}</b>`, g[1], `<button class='btn sm' data-act='gdel' data-k='${k}' data-i='${i}'>删除</button>`])), 'flush');
const msel = (k, v) => `<select data-change='fp' data-k='${k}'>${MAT.map((m, i) => `<option value='${i}' ${i === v ? 'selected' : ''}>${m[1]}（${m[0]}）</option>`).join('')}</select>`;
const MV = [
    () => { const q = S.mq.trim(), rows = MAT.filter(m => !q || m.join(' ').includes(q)); return `<div class='field'><label>按编码、名称、作物或亲本检索</label><input value='${S.mq}' data-change='mq' placeholder='例如 芒果'></div>` + panel('查询结果（' + rows.length + ' 条）', rows.length ? table([{ t: '编码' }, { t: '名称' }, { t: '作物' }, { t: '分组' }, { t: '亲本组合' }], rows.map(m => [`<span class='mono'>${m[0]}</span>`, `<b>${m[1]}</b>`, m[2], S.mem[m[0]] || m[3], m[4]])) : `<div class='empty'>没有符合条件的材料，换个关键词试试。</div>`, rows.length ? 'flush' : '') },
    () => gv('tg', '性状分组'),
    () => gv('mg', '材料分组'),
    () => { const r = S.rule, code = r.region + '-' + r.crop + '-26-' + String(r.start).padStart(r.digits, '0'); return `<div class='grid g-1-2' style='align-items:start'>${panel('编码规则', `<div class='field'><label>产地代码</label><input value='${r.region}' data-change='rule' data-k='region'></div><div class='field'><label>作物代码</label><input value='${r.crop}' data-change='rule' data-k='crop'></div><div class='grid g-2'><div class='field'><label>流水号位数</label><input type='number' value='${r.digits}' data-change='rule' data-k='digits'></div><div class='field'><label>起始流水号</label><input type='number' value='${r.start}' data-change='rule' data-k='start'></div></div><button class='btn primary' data-act='rulesave'>保存规则</button>`)}${panel('编码预览', `<p class='mute' style='margin:0 0 8px;font-size:12px'>格式：产地-作物-年份-流水号</p><div class='mono' style='font-size:26px'>${code}</div><p class='mute' style='font-size:12px;margin:10px 0 0'>新建材料时按此规则自动生成编码，已有编码不受影响。</p>`)}</div>` },
    () => panel('材料图片', table([{ t: '材料' }, { t: '图片数', r: 1 }, { t: '预览' }, { t: '' }], MAT.map(m => { const images = S.img[m[0]] || []; return [`<b>${m[1]}</b><br><span class='mono mute' style='font-size:11px'>${m[0]}</span>`, images.length, `<div class='row' style='gap:4px'>${images.map((img, i) => `<div style='width:64px'><img src='${img.url}' alt='${escapeText(img.name)}' title='${escapeText(img.name)}' style='display:block;width:56px;height:56px;object-fit:cover;border-radius:4px'><button class='btn sm' data-act='idel' data-c='${m[0]}' data-i='${i}' aria-label='删除 ${escapeText(img.name)}'>删除</button></div>`).join('') || `<span class='mute' style='font-size:12px'>暂无图片</span>`}</div>`, `<label class='btn sm' for='material-image-${m[0]}'>添加图片</label><input id='material-image-${m[0]}' type='file' accept='image/*' multiple data-change='iadd' data-c='${m[0]}' hidden>`] })), 'flush'),
    () => { const m = MAT[S.ped], p = m[4].split(' × '); return `<div class='grid g-1-2' style='align-items:start'>${panel('选择材料', table([{ t: '材料' }, { t: '作物' }], MAT.map(x => [`<b>${x[1]}</b>`, x[2]]), { pick: 'ped', sel: S.ped }), 'flush')}${panel('系谱 · ' + m[1], table([{ t: '世代' }, { t: '材料编码' }], [['本材料', m[0]], ['第 1 代 · 母本', p[0]], ['第 1 代 · 父本', p[1]], ['第 2 代 · 母本侧', p[0] + '-M / ' + p[0] + '-F'], ['第 2 代 · 父本侧', p[1] + '-M / ' + p[1] + '-F']]) + `<p class='mute' style='font-size:12px;margin:10px 0 0'>最多向上追溯三代。</p>`, '')}</div>` },
    () => `<div class='grid g-1-2' style='align-items:start'>${panel('选择亲本', `<div class='field'><label>母本</label>${msel('fm', S.fm)}</div><div class='field'><label>父本</label>${msel('mm', S.mm)}</div><button class='btn primary' data-act='fgen'>生成家系</button>`)}${panel('家系列表', S.fam ? table([{ t: '家系编号' }, { t: '状态' }], S.fam.map(f => [`<span class='mono'>${f}</span>`, tag('待种植', 'warn')])) + `<div style='margin-top:12px'><button class='btn sm' data-act='famadd'>加入育种方案</button></div>` : `<div class='empty'>选择母本和父本后点击「生成家系」。</div>`)}</div>`,
    () => { const R = [['芒果', 86, 71], ['荔枝', 64, 52], ['香蕉', 58, 41], ['菠萝', 32, 27], ['火龙果', 78, 60]]; return panel('本季配组情况统计', table([{ t: '作物' }, { t: '配组数', r: 1 }, { t: '成功数', r: 1 }, { t: '成功率' }], R.map(r => [`<b>${r[0]}</b>`, r[1], r[2], `<div class='row'><div style='width:110px'>${bar(r[2] / r[1] * 100, 'ok')}</div><span class='mono mute' style='font-size:12px'>${(r[2] / r[1] * 100).toFixed(1)}%</span></div>`])), 'flush') },
    () => panel('分组管理', table([{ t: '材料' }, { t: '作物' }, { t: '所属分组' }], MAT.map(m => { const cur = S.mem[m[0]] || m[3]; return [`<b>${m[1]}</b>`, m[2], `<select data-change='gmove' data-c='${m[0]}'>${S.mg.map(g => `<option ${g[0] === cur ? 'selected' : ''}>${g[0]}</option>`).join('')}</select>`] })), 'flush')
];
PAGES['breed.material'] = () => lead([['4,218', '育种材料'], [S.tg.length, '性状分组'], [S.mg.length, '材料分组'], ['318', '本季配组']]) + `<div class='row' style='margin-bottom:16px'>${MSUB.map((x, i) => `<button class='btn sm ${i === S.ms ? 'primary' : ''}' data-act='ms' data-i='${i}'>${x}</button>`).join('')}</div>` + MV[S.ms]();
