'use strict';
S.gl = GERM.map(r => r.slice());
S.gf = null;
const GCROPS = ['芒果', '荔枝', '香蕉', '菠萝', '火龙果', '番木瓜'];
const GLV = ['公开', '受限', '涉密'];
const parseCsvRows = text => {
    const rows = []; let row = [], cell = '', quoted = false;
    for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (c === '"' && quoted && text[i + 1] === '"') { cell += '"'; i++ }
        else if (c === '"') quoted = !quoted;
        else if (c === ',' && !quoted) { row.push(cell); cell = '' }
        else if ((c === '\n' || c === '\r') && !quoted) { if (c === '\r' && text[i + 1] === '\n') i++; row.push(cell); if (row.some(v => v.trim())) rows.push(row); row = []; cell = '' }
        else cell += c;
    }
    row.push(cell); if (row.some(v => v.trim())) rows.push(row);
    return rows;
};
ACT.gimport = (d, el) => {
    const file = el.files[0]; if (!file) return;
    if (!file.name.toLowerCase().endsWith('.csv')) { toast('当前原型支持 CSV 导入，请先将 Excel 另存为 CSV'); return }
    file.text().then(text => {
        const rows = parseCsvRows(text), head = (rows.shift() || []).map(v => v.trim().toLowerCase());
        let count = 0;
        rows.forEach((r,i) => {
            const at = key => head.findIndex(h => h.includes(key));
            const value = (key, fallback='') => { const j=at(key); return j>=0 ? r[j] || fallback : fallback };
            const id=value('编号', 'IMPORT-' + Date.now() + '-' + (i+1)), name=value('名称');
            if (!name) return;
            S.gl.unshift([id,name,value('作物','芒果'),value('产地'),value('糖度','0'),value('抗性'),value('共享级别','受限')]); count++;
        });
        render(); toast(count ? `已导入 ${count} 条种质档案` : '没有识别到有效档案，请检查 CSV 表头和名称列');
    });
};
ACT.gnew = () => { S.gf = { i: -1, v: ['', '', '芒果', '', '', '', '公开'] }; render() };
ACT.gedit = d => { S.gf = { i: +d.i, v: S.gl[+d.i].slice() }; render() };
ACT.gfld = (d, el) => { S.gf.v[+d.k] = el.value };
ACT.gsave = () => {
    const v = S.gf.v;
    if (!v[0].trim() || !v[1].trim()) { toast('请填写编号和名称'); return }
    if (S.gf.i < 0) S.gl.unshift(v); else S.gl[S.gf.i] = v;
    S.gf = null; render(); toast('种质档案已保存');
};
ACT.gcancel = () => { S.gf = null; render() };
ACT.gdel2 = d => { if (confirm('确定删除这份种质档案？')) { S.gl.splice(+d.i, 1); render() } };

PAGES['share.library'] = () => {
    const f = S.gf, e = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g, '&' + '#39;');
    const inp = (k, l) => `<div class='field'><label>${l}</label><input value='${e(f.v[k])}' data-change='gfld' data-k='${k}'></div>`;
    const sel = (k, l, o) => `<div class='field'><label>${l}</label><select data-change='gfld' data-k='${k}'>${o.map(c => `<option ${c === f.v[k] ? 'selected' : ''}>${c}</option>`).join('')}</select></div>`;
    const form = f ? panel(f.i < 0 ? '新增种质档案' : '编辑种质档案', `<div class='grid g-3'>${inp(0, '编号')}${inp(1, '名称')}${sel(2, '作物', GCROPS)}${inp(3, '原产地')}${inp(4, '糖度 (%)')}${inp(5, '抗性')}${sel(6, '共享级别', GLV)}</div><div class='row'><button class='btn primary' data-act='gsave'>保存档案</button><button class='btn' data-act='gcancel'>取消</button></div>`) + `<div style='height:20px'></div>` : '';
    const rows = S.gl.map((r, i) => ({ r, i })).filter(x => !S.sh?.archived?.includes(x.r[0]) && (S.crop === '全部' || x.r[2] === S.crop)).map(({ r, i }) => [`<span class='mono'>${e(r[0])}</span>`, `<b>${e(r[1])}</b>`, e(r[2]), e(r[3]), e(r[4]) + '%', e(r[5]), lvl(e(r[6])), `<button class='btn sm' data-act='gedit' data-i='${i}'>编辑</button> <button class='btn sm' data-act='gdel2' data-i='${i}'>删除</button>`]);
    return form + lead([['38,412', '种质资源总量'], ['91.6%', '已数字化'], ['642', '本月新增'], ['37', '共享机构']]) + `<div class='row' style='margin-bottom:14px'><button class='btn primary' data-act='gnew'>新增种质</button><label class='btn' for='germ-csv'>批量导入 CSV</label><input id='germ-csv' type='file' accept='.csv,text/csv' data-change='gimport' hidden></div>` + seg(['全部', '芒果', '荔枝', '香蕉', '菠萝', '火龙果'], S.crop, 'crop') + panel('种质资源档案', table([{ t: '编号' }, { t: '名称' }, { t: '作物' }, { t: '原产地' }, { t: '糖度', r: 1 }, { t: '抗性' }, { t: '共享级别' }, { t: '操作' }], rows), 'flush');
};

const oldTrait = PAGES['breed.trait'];
S.timg = [['HN-MG-0421', '果实纵切面', '10-21'], ['HN-MG-0421', '叶片正面', '10-21'], ['HN-MG-0819', '果实外观', '10-20']];
S.timgm = 0;
ACT.timgm = (d, el) => { S.timgm = +el.value };
ACT.timgadd = () => { const n = MAT[S.timgm || 0]; S.timg.unshift([n[0], '新上传图片', '刚刚']); render(); toast('图片已上传并关联到 ' + n[0]) };
ACT.timgdel = d => { S.timg.splice(+d.i, 1); render() };
PAGES['breed.trait'] = () => oldTrait() + `<div style='margin-top:20px'>` + panel('性状图片管理', `<div class='row' style='margin-bottom:14px'><select data-change='timgm'>${MAT.map((m, i) => `<option value='${i}' ${i === S.timgm ? 'selected' : ''}>${m[1]}</option>`).join('')}</select><button class='btn primary sm' data-act='timgadd'>上传图片</button><span class='mute' style='font-size:12px'>图片会关联到所选材料的性状记录</span></div><div class='plots'>${S.timg.map((t, i) => `<div><div class='plot' style='width:100%'></div><div style='font-size:12px;margin-top:4px'>${t[1]}</div><div class='mono mute' style='font-size:11px'>${t[0]} · ${t[2]}</div><button class='btn sm' data-act='timgdel' data-i='${i}'>删除</button></div>`).join('')}</div>`) + `</div>`;

S.sx = 0; S.sxf = {}; S.sxdb = { host: '', port: '3306', db: '', user: '' }; S.sxc = { '时间': true, '地块编号': true, '温度': true, '湿度': true }; S.sxlog = [['作物表型数据', '8 个字段', '10-21 09:30', '成功']];
const SX = [['CSV 文件', 'file', '.csv'], ['Excel 表格', 'file', '.xlsx,.xls'], ['SQL 数据库', 'db'], ['实时传感器数据', 'live'], ['历史气象数据', 'hist'], ['作物表型数据', 'hist']];
const SXC = ['时间', '地块编号', '温度', '湿度', '土壤 EC', '降雨量', '单果重', '糖度'];
ACT.sx = d => { S.sx = +d.i; render() };
ACT.sxfile = (d, el) => { S.sxf[S.sx] = el.files[0] ? el.files[0].name : ''; render() };
ACT.sxdb = (d, el) => { S.sxdb[d.k] = el.value };
ACT.sxtest = () => toast(S.sxdb.host && S.sxdb.db ? '连接成功，发现 12 张数据表' : '请先填写主机地址和数据库名');
ACT.sxc = d => { S.sxc[d.k] = !S.sxc[d.k]; render() };
ACT.sxgo = () => {
    const s = SX[S.sx], n = Object.keys(S.sxc).filter(k => S.sxc[k]).length;
    if (s[1] === 'file' && !S.sxf[S.sx]) { toast('请先选择文件'); return }
    if (s[1] === 'db' && !(S.sxdb.host && S.sxdb.db)) { toast('请先填写连接信息'); return }
    if (!n) { toast('请至少选择一个字段'); return }
    S.sxlog.unshift([s[0], n + ' 个字段', '刚刚', '成功']); render(); toast('已导入 ' + s[0]);
};
PAGES['mining.source'] = () => {
    const s = SX[S.sx];
    const cfg = s[1] === 'file' ? `<div class='field'><label>选择文件（${s[2]}）</label><input type='file' accept='${s[2]}' data-change='sxfile'></div>${S.sxf[S.sx] ? `<p class='mute' style='font-size:12px'>已选择：${S.sxf[S.sx]}</p>` : ''}` : s[1] === 'db' ? ['host:主机地址', 'port:端口', 'db:数据库名', 'user:用户名'].map(x => { const [k, l] = x.split(':'); return `<div class='field'><label>${l}</label><input value='${S.sxdb[k]}' data-change='sxdb' data-k='${k}'></div>` }).join('') + `<button class='btn sm' data-act='sxtest'>测试连接</button>` : `<p class='mute' style='margin:0'>${s[1] === 'live' ? '实时接入，已连接 386 路传感器，数据每分钟更新。' : '已汇入历史数据，可选择字段后导入到建模数据集。'}</p>`;
    return lead([['6', '数据来源类型'], ['386', '实时传感器'], ['42 万', '表型记录'], ['5 分钟内', '决策耗时']]) + `<div class='grid g-1-2' style='align-items:start'>${panel('数据来源', table([{ t: '来源' }, { t: '状态' }], SX.map(x => [`<b>${x[0]}</b>`, tag('可用', 'ok')]), { pick: 'sx', sel: S.sx }), 'flush')}<div class='grid'>${panel('接入配置 · ' + s[0], cfg + `<h3 style='margin:16px 0 8px;font-size:14px'>选择要导入的字段</h3><div class='row'>${SXC.map(c => `<button class='btn sm ${S.sxc[c] ? 'primary' : ''}' data-act='sxc' data-k='${c}'>${c}</button>`).join('')}</div><div style='margin-top:14px'><button class='btn primary' data-act='sxgo'>导入到建模数据集</button></div>`)}${panel('导入记录', table([{ t: '来源' }, { t: '内容' }, { t: '时间' }, { t: '结果' }], S.sxlog.map(r => [`<b>${r[0]}</b>`, r[1], r[2], tag(r[3], 'ok')])), 'flush')}</div></div>`;
};

const oldDev = PAGES['iot.device'];
const DVT = DEVT.map(d => d[0]);
S.dv = { t: '全部', s: '全部' };
const DVL = Array.from({ length: 36 }, (_, i) => {
    const t = DVT[i % 6], on = i % 7 !== 3, bad = on && i % 11 === 0;
    return { id: 'DV-' + String(1001 + i), t, plot: (i * 5) % 24 + 1, on, st: !on ? '离线' : bad ? '告警' : '正常', tx: !on ? '中断' : i % 9 === 4 ? '延迟' : '正常', last: !on ? '昨日 ' + (10 + i % 12) + ':20' : (i % 5 + 1) + ' 分钟前' };
});
ACT.dvf = (d, el) => { S.dv[d.k] = el.value; render() };
PAGES['iot.device'] = () => {
    const rows = DVL.filter(x => (S.dv.t === '全部' || x.t === S.dv.t) && (S.dv.s === '全部' || x.st === S.dv.s));
    const sel = (k, o) => `<select data-change='dvf' data-k='${k}'>${['全部', ...o].map(v => `<option ${v === S.dv[k] ? 'selected' : ''}>${v}</option>`).join('')}</select>`;
    return oldDev() + `<div style='margin-top:20px'>` + panel('逐台设备状态', `<div class='row' style='padding:0 24px 14px'>${sel('t', DVT)}${sel('s', ['正常', '告警', '离线'])}<span class='mute' style='font-size:12px'>共 ${rows.length} 台</span></div>` + table([{ t: '设备编号' }, { t: '类型' }, { t: '地块' }, { t: '在线状态' }, { t: '设备状态' }, { t: '数据传输' }, { t: '最近上报' }], rows.map(x => [`<span class='mono'>${x.id}</span>`, x.t, x.plot + ' 号', x.on ? tag('在线', 'ok') : tag('离线', 'alert'), x.st === '告警' ? tag('告警', 'warn') : x.on ? tag('正常', 'ok') : tag('—'), x.tx === '正常' ? tag('正常', 'ok') : x.tx === '延迟' ? tag('延迟', 'warn') : tag('中断', 'alert'), x.last])), 'flush') + `</div>`;
};
