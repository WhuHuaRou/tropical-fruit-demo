'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...(r.querySelectorAll ? r.querySelectorAll(s) : [])];
const tag = (t, tone = '') => `<span class='tag ${tone}'>${t}</span>`;
const ref = (t = '已接入 · 调用现有接口') => tag(t, 'ref');
const bar = (p, tone = '') => `<div class='bar ${tone}'><i style='width:${Math.max(0, Math.min(100, p))}%'></i></div>`;
const panel = (title, body, cls = '') => `<section class='panel ${cls}'>${title ? `<h3>${title}</h3>` : ''}${body}</section>`;
const lead = a => `<div class='lead'>${a.map(([v, l]) => `<div><b data-kpi='${String(v).replace(/'/g, '')}'>${v}</b><span>${l}</span></div>`).join('')}</div>`;
const kv = o => `<dl class='kv'>${Object.entries(o).map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>`;
const table = (cols, rows, opt = {}) => `<div class='tbl-wrap'><table class='tbl'><thead><tr>${cols.map(c => `<th class='${c.r ? 'r' : ''}'>${c.t}</th>`).join('')}</tr></thead><tbody>${rows.map((r, i) => `<tr ${opt.pick ? `data-pick='${opt.pick}' data-i='${i}'` : ''} class='${opt.sel === i ? 'on' : ''}'>${r.map((v, j) => `<td class='${cols[j].r ? 'r mono' : ''}'>${v}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
const toast = m => { const e = document.createElement('div'); e.className = 'toast'; e.textContent = m; document.body.appendChild(e); setTimeout(() => e.remove(), 2200) };

const PAGES = {}, ACT = {};
const STATE_OWNER = {
    crop: 'share', api: 'share', q: 'share', gl: 'share', gf: 'share', sh: 'share',
    ds: 'info', dsForm: 'info', test: 'info', testing: 'info', range: 'info', ix: 'info',
    det: 'ai', orders: 'ai', reps: 'ai', ax: 'ai',
    mod: 'pest', th: 'pest', sent: 'pest', px: 'pest', modelState: 'pest',
    fam: 'breed', fm: 'breed', mm: 'breed', ped: 'breed', ms: 'breed', mq: 'breed', tg: 'breed', mg: 'breed', mem: 'breed', rule: 'breed', img: 'breed', plan: 'breed', tsel: 'breed', tval: 'breed', timg: 'breed', timgm: 'breed', an: 'breed', arep: 'breed', bx: 'breed',
    find: 'mining', map: 'mining', alg: 'mining', opt: 'mining', auto: 'mining', sx: 'mining', sxc: 'mining', sxdb: 'mining', sxf: 'mining', sxlog: 'mining', mx: 'mining',
    dev: 'iot', dlog: 'iot', dv: 'iot', iox: 'iot'
};
const MODULE_STATE = Object.fromEntries(['home', 'share', 'info', 'ai', 'pest', 'breed', 'mining', 'iot'].map(id => [id, {}]));
const S = new Proxy({}, {
    get: (_, key) => MODULE_STATE[STATE_OWNER[key] || 'home'][key],
    set: (_, key, value) => { MODULE_STATE[STATE_OWNER[key] || 'home'][key] = value; return true }
});

const SYSTEMS = [
    { id: 'share', no: '01', group: '数据与共享', name: '种质信息共享', title: '种质资源共享管理', desc: '管理种质资源，向各机构开放接口，并按调用次数和频次控制每个用户的使用额度。', note: '超出申请的次数或频次时，系统会自动停止该用户的 API 服务。', banner: '../assets/img/banners/share.jpg', tabs: [['library', '种质资源库'], ['collab', '共享协同'], ['market', 'API 市场'], ['monitor', '调用监控'], ['quota', '申请与权限'], ['safe', '安全与运维']] },
    { id: 'info', no: '02', group: '数据与共享', name: '育种信息服务', title: '育种综合信息服务', desc: '汇聚各类数据源，治理数据质量，统计数据资产的规模与变化趋势。', note: '数据源可以在线配置、测试联通和实时监控。', banner: '../assets/img/banners/info.jpg', tabs: [['ingest', '数据汇聚'], ['govern', '数据治理'], ['asset', '数据资源']] },
    { id: 'ai', no: '03', group: '智能决策', name: 'AI 辅助决策', title: 'AI 辅助决策', desc: '从巡园影像里发现异常，分析原因，推荐处置方案，再把处置效果反馈给模型。', note: '每一步的结果会流向下一步，处置完成后自动进入效果跟踪。', banner: '../assets/img/hero.jpg', tabs: [['detect', '异常检测'], ['diagnose', '诊断分析'], ['advice', '处置推荐'], ['track', '效果跟踪'], ['env', '环境报告']] },
    { id: 'pest', no: '04', group: '智能决策', name: '病虫害预警', title: '病虫害识别预警', desc: '融合气象、土壤、物候、影像等数据预测风险，超过阈值就发出预警，并给出防治时机和防控建议。', note: '预警阈值可以调整，调整后立即看到哪些预警会被触发。', banner: '../assets/img/banners/pest.jpg', tabs: [['model', '预警模型'], ['alert', '阈值预警'], ['guide', '防控指导'], ['review', '历史复盘'], ['resistance', '抗性筛选']] },
    { id: 'breed', no: '05', group: '科研与基地', name: '智能育种研发', title: '智能育种研发', desc: '管理育种材料和方案，采集性状数据，并做试验数据分析。', note: '材料、基因型、田间试验与分析数据在本系统内独立管理。', banner: '../assets/img/banners/breed.jpg', tabs: [['material', '育种材料'], ['plan', '育种方案'], ['trait', '性状数据'], ['analysis', '数据分析'], ['genetics', '基因与群体'], ['quality', '数据质控'], ['stability', '多环境稳定性']] },
    { id: 'mining', no: '06', group: '科研与基地', name: '数据挖掘平台', title: '数据挖掘平台', desc: '接入多种格式的数据，用内置算法建模，自动对比多个模型，也可以手动调参。', note: '决策耗时控制在分钟级，训练支持 GPU 加速。', banner: '../assets/img/banners/mining.jpg', tabs: [['source', '数据接入'], ['algo', '算法库'], ['auto', '自动建模'], ['genome', '基因数据分析'], ['archive', '数据清洗与归档']] },
    { id: 'iot', no: '07', group: '科研与基地', name: '基地物联网', title: '基地物联网管控', desc: '查看物联设备状态和病虫害、环境的实时数据，并远程调整设备参数。', note: '设备档案、历史数据、权限与参数均由本系统独立管理。', banner: '../assets/img/banners/iot.jpg', tabs: [['device', '设备状态'], ['live', '实时数据'], ['control', '远程控制'], ['history', '历史档案'], ['association', '关联分析'], ['admin', '用户与配置']] }
];

const route = () => {
    const [sys, tab] = (location.hash.slice(1) || 'home').split('/');
    return SYSTEMS.some(s => s.id === sys) ? { sys, tab: tab || SYSTEMS.find(s => s.id === sys).tabs[0][0] } : { sys: 'home', tab: 'home' };
};

const privaNumSvg = no => `<div class='priva-num' aria-hidden='true'><svg class='priva-num-svg' viewBox='0 0 132 96'><text class='priva-num-text' x='128' y='82' text-anchor='end'>${no}</text></svg></div>`;

const heroBand = (eyebrow, title, desc, note, no, image) => `<section class='hero-band'><div class='hero-media' style="--hero-image:url('${image}')" aria-hidden='true'></div><div class='hero-inner'><div><div class='hero-eyebrow'>${eyebrow}</div><div class='hero-title-wrap'><span class='hero-chevron' aria-hidden='true'><svg width='18' height='26' viewBox='0 0 18 26' fill='none' style='margin-top:6px'><path d='M3 3L14 13L3 23' stroke='#00B5CE' stroke-width='3.2' stroke-linecap='square'/></svg></span><h1>${title}</h1></div>${desc ? `<p class='hero-desc'>${desc}</p>` : ''}</div><div class='hero-meta'>${note ? `<div class='aside-note'>${note}</div>` : ''}${privaNumSvg(no)}</div></div></section><div class='spectrum-bar'></div>`;

let _mounted = false, _lastRouteKey = '', _lastSysKey = '', _rafId = 0;

function syncGlider(wrapSel, itemSel, inkSel) {
    const wrap = $(wrapSel), ink = $(inkSel);
    if (!wrap || !ink || typeof wrap.getBoundingClientRect !== 'function') return;
    const on = $(itemSel, wrap);
    if (!on) { ink.style.opacity = '0'; return }
    const wr = wrap.getBoundingClientRect(), ir = on.getBoundingClientRect();
    if (!ir.width) { ink.style.opacity = '0'; return }
    ink.style.opacity = '1';
    ink.style.width = ir.width + 'px';
    ink.style.transform = `translate3d(${(ir.left - wr.left).toFixed(1)}px,0,0)`;
}

/* Priva "Facts & Figures" Smooth KPI Count-Up */
function animateKPIs(root) {
    if (typeof requestAnimationFrame !== 'function') return;
    if (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const nodes = $$('b[data-kpi]', root);
    nodes.forEach(el => {
        const raw = el.getAttribute('data-kpi') || '';
        if (raw.includes('/') || /^v\d/i.test(raw)) return;
        const m = raw.match(/^([+-]?)([\d,]+(?:\.\d+)?)(.*)$/);
        if (!m) return;
        const sign = m[1], numStr = m[2], suffix = m[3];
        const hasComma = numStr.includes(',');
        const dec = (numStr.split('.')[1] || '').length;
        const target = parseFloat(numStr.replace(/,/g, ''));
        if (!isFinite(target) || target === 0) return;
        const dur = 680, t0 = performance.now();
        const fmt = v => {
            let s = v.toFixed(dec);
            if (hasComma) { const parts = s.split('.'); parts[0] = Number(parts[0]).toLocaleString('en-US'); s = parts.join('.') }
            return sign + s + suffix;
        };
        const step = now => {
            const p = Math.min(1, (now - t0) / dur);
            const eased = 1 - Math.pow(1 - p, 4);
            el.textContent = p < 1 ? fmt(target * eased) : raw;
            if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    });
}

/* 面板滚动进入视口时依次上浮，表格行和地块随后逐个浮现 */
let _revealIO = null;
function revealPanels(root) {
    if (typeof IntersectionObserver !== 'function') return;
    if (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (_revealIO) _revealIO.disconnect();
    let batch = 0, batchT = 0;
    _revealIO = new IntersectionObserver(entries => {
        const now = performance.now();
        if (now - batchT > 120) { batch = 0; batchT = now }
        entries.filter(e => e.isIntersecting).forEach(e => {
            e.target.style.setProperty('--d', (Math.min(batch++, 5) * 0.09).toFixed(2) + 's');
            e.target.classList.add('in');
            _revealIO.unobserve(e.target);
        });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    $$('.panel', root).forEach(p => {
        p.classList.add('reveal');
        $$('.tbl tbody tr', p).forEach((r, i) => r.style.setProperty('--i', Math.min(i, 12)));
        $$('.plots>*', p).forEach((c, i) => c.style.setProperty('--i', Math.min(i, 24)));
        _revealIO.observe(p);
    });
}

function ensureShell() {
    const app = $('#app');
    if (_mounted && $('.shell', app)) return true;
    const topbar = `<header class='topbar'><div class='topbar-inner'><button class='brand' data-go='home'><span class='brand-mark' aria-hidden='true'><svg width='18' height='18' viewBox='0 0 20 20' fill='none'><path d='M4 15L10 4L16 15H12.6L10 10.1L7.4 15H4Z' fill='#FFFFFF'/><circle cx='15' cy='5' r='2' fill='#00BF72'/></svg></span><span class='brand-text'><b>热带水果科研信息化平台</b></span></button><nav class='topnav' id='primary-nav' aria-label='系统功能导航'></nav><div class='topbar-actions' id='topbar-actions'></div></div></header>`;
    const foot = `<footer class='footbar'><div class='footbar-inner'><span>热带水果科研信息化平台 · 七个独立业务系统</span></div></footer>`;
    app.innerHTML = `<div class='shell'>${topbar}<div id='hero-slot'></div><div class='subbar'><div class='subbar-inner' id='sub-slot'></div></div><main class='main' id='main-slot'></main>${foot}</div>`;
    _mounted = true;
    return false;
}

function render() {
    const y = scrollY, { sys, tab } = route(), cur = SYSTEMS.find(s => s.id === sys);
    const sysKey = cur ? cur.id : 'home';
    const tObj = cur ? (cur.tabs.find(x => x[0] === tab) || cur.tabs[0]) : null;
    const routeKey = cur ? `${cur.id}/${tObj[0]}` : 'home';
    const isRouteChange = routeKey !== _lastRouteKey;
    const isSysChange = sysKey !== _lastSysKey;

    const hadShell = ensureShell();
    const heroSlot = $('#hero-slot'), subSlot = $('#sub-slot'), mainSlot = $('#main-slot');

    /* Fallback for non-DOM headless VM verification */
    if (!heroSlot || !subSlot || !mainSlot) {
        const head = !cur ? heroBand('科研与基地', '热带水果科研信息化平台', '', '', '00', '../assets/img/banners/home.jpg') : heroBand(cur.group, cur.title, cur.desc, cur.note, cur.no, cur.banner);
        const sub = !cur ? `<div class='crumb'><b>主页面 · 七个独立系统</b></div>` : `<div class='crumb'><button data-go='home'>主页面</button><i>/</i><span>${cur.name}</span><i>/</i><b>${tObj[1]}</b></div>`;
        const fn = cur ? PAGES[cur.id + '.' + tObj[0]] : HOME;
        const body = fn ? fn() : `<div class='empty'>该页面暂未开放</div>`;
        const nav = cur ? `<nav class='topnav' aria-label='${cur.name}功能导航'>${cur.tabs.map(x => `<button class='nav-item ${x[0] === tObj[0] ? 'on' : ''}' data-go='${cur.id}/${x[0]}'>${x[1]}</button>`).join('')}<span class='nav-ink' aria-hidden='true'></span></nav>` : '';
        const action = cur ? `<button class='screen-cta' data-go='home'>返回主页面</button>` : `<a class='screen-cta' href='screen.html'><i></i><span>数据大屏</span></a><button class='screen-cta' data-logout>退出登录</button>`;
        $('#app').innerHTML = `<div class='shell'><header class='topbar'><div class='topbar-inner'><button class='brand' data-go='home'><span class='brand-mark' aria-hidden='true'><svg width='18' height='18' viewBox='0 0 20 20' fill='none'><path d='M4 15L10 4L16 15H12.6L10 10.1L7.4 15H4Z' fill='#FFFFFF'/><circle cx='15' cy='5' r='2' fill='#00BF72'/></svg></span><span class='brand-text'><b>热带水果科研信息化平台</b></span></button>${nav}<div class='topbar-actions'>${action}</div></div></header>${head}<div class='subbar'><div class='subbar-inner'>${sub}</div></div><main class='main'>${body}</main></div>`;
        _lastRouteKey = routeKey; _lastSysKey = sysKey;
        return;
    }

    /* 1. Show only the current system's child pages in the top navigation. */
    const nav = $('#primary-nav');
    nav.innerHTML = cur
        ? cur.tabs.map(x => `<button class='nav-item ${x[0] === tObj[0] ? 'on' : ''}' data-go='${cur.id}/${x[0]}'>${x[1]}</button>`).join('') + `<span class='nav-ink' aria-hidden='true'></span>`
        : '';
    $('#topbar-actions').innerHTML = cur
        ? `<button class='screen-cta' data-go='home'>返回主页面</button>`
        : `<a class='screen-cta' href='screen.html'><i></i><span>数据大屏</span></a><button class='screen-cta' data-logout>退出登录</button>`;

    /* 2. Update Hero Band only when switching system modules */
    if (!hadShell || isSysChange) {
        heroSlot.innerHTML = !cur
            ? heroBand('科研与基地', '热带水果科研信息化平台', '', '', '00', '../assets/img/banners/home.jpg')
            : heroBand(cur.group, cur.title, cur.desc, cur.note, cur.no, cur.banner);
        heroSlot.classList.remove('route-enter');
        void heroSlot.offsetWidth;
        heroSlot.classList.add('route-enter');
    }

    /* 3. Update Subbar (Breadcrumbs + Smooth Gliding Sub-Tabs) */
    subSlot.innerHTML = !cur
        ? `<div class='crumb'><b>主页面 · 七个独立系统</b></div>`
        : `<div class='crumb'><button data-go='home'>主页面</button><i>/</i><span>${cur.name}</span><i>/</i><b>${tObj[1]}</b></div>`;

    /* 4. Render Main Content & Trigger Staggered Motion ONLY on Route Change */
    const fn = !cur ? HOME : PAGES[cur.id + '.' + tObj[0]];
    mainSlot.innerHTML = fn ? fn() : `<div class='empty'>该页面暂未开放</div>`;

    if (isRouteChange) {
        mainSlot.classList.remove('route-enter');
        void mainSlot.offsetWidth;
        mainSlot.classList.add('route-enter');
        animateKPIs(mainSlot);
        revealPanels(mainSlot);
    } else {
        mainSlot.classList.remove('route-enter');
    }

    _lastRouteKey = routeKey;
    _lastSysKey = sysKey;

    if (typeof requestAnimationFrame === 'function') {
        cancelAnimationFrame(_rafId);
        _rafId = requestAnimationFrame(() => {
            syncGlider('.topnav', '.nav-item.on', '.nav-ink');
        });
    }
    scrollTo(0, y);
}

document.addEventListener('click', e => {
    if (e.target.closest('[data-logout]')) {
        PlatformAuth.logout();
        location.replace('screen.html');
        return;
    }
    const g = e.target.closest('[data-go]'); if (g) {
        const current = route().sys, [target, child] = g.dataset.go.split('/');
        if (target !== 'home' && current !== 'home' && target !== current) return;
        if (target !== 'home' && !SYSTEMS.some(s => s.id === target)) return;
        location.hash = g.dataset.go; return;
    }
    const p = e.target.closest('[data-pick]'); if (p && !e.target.closest('button')) { ACT[p.dataset.pick]?.(p.dataset); return }
    const a = e.target.closest('[data-act]'); if (a) ACT[a.dataset.act]?.(a.dataset, a);
});
document.addEventListener('change', e => { const a = e.target.closest('[data-change]'); if (a) ACT[a.dataset.change]?.(a.dataset, a) });
document.addEventListener('input', e => { const a = e.target.closest('[data-input]'); if (a) ACT[a.dataset.input]?.(a.dataset, a) });

/* Priva Signature Radial Cursor Shine & Sticky Header Shadow */
document.addEventListener('pointermove', e => {
    if (!e.target || typeof e.target.closest !== 'function') return;
    const b = e.target.closest('.btn,.screen-cta');
    if (!b) return;
    const r = b.getBoundingClientRect();
    b.style.setProperty('--mx', (e.clientX - r.left).toFixed(1) + 'px');
    b.style.setProperty('--my', (e.clientY - r.top).toFixed(1) + 'px');
});
const _stillMotion = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
addEventListener('scroll', () => {
    const tb = $('.topbar');
    if (tb) tb.classList.toggle('scrolled', scrollY > 8);
    /* 横幅照片视差：随滚动以 0.35 倍速下移，最多移动横幅高度的 10% */
    const hm = $('.hero-media');
    if (hm && !_stillMotion) {
        const h = hm.parentElement.offsetHeight;
        hm.style.setProperty('--px', Math.min(scrollY * 0.35, h * 0.1).toFixed(1) + 'px');
    }
}, { passive: true });
addEventListener('resize', () => {
    syncGlider('.topnav', '.nav-item.on', '.nav-ink');
});
addEventListener('hashchange', () => { render(); scrollTo(0, 0) });
if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
        syncGlider('.topnav', '.nav-item.on', '.nav-ink');
    });
}

function HOME() {
    return `<div class='system-grid'>${SYSTEMS.map(s => `<section class='system-card'><div class='system-card-top'><span class='system-number mono'>${s.no}</span><span class='system-group'>${s.group}</span></div><h2>${s.name}</h2><p>${s.desc}</p><button class='btn primary sm' data-go='${s.id}/${s.tabs[0][0]}'>进入系统</button></section>`).join('')}</div>`;
}
