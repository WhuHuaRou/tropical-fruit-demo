'use strict';
window.PlatformAuth = (() => {
    const SESSION_KEY = 'tropical-fruit-platform-session';
    const DEMO_USER = 'admin';
    const DEMO_PASSWORD = '123456';

    const hasSession = () => localStorage.getItem(SESSION_KEY) === DEMO_USER;
    const logout = () => localStorage.removeItem(SESSION_KEY);

    const requireSession = () => {
        if (hasSession()) return true;
        location.replace('screen.html');
        return false;
    };

    const mountLogin = () => {
        const trigger = document.querySelector('#screen-login-trigger');
        const setTrigger = () => {
            trigger.textContent = hasSession() ? '返回主页' : '登录';
            trigger.setAttribute('aria-label', hasSession() ? '返回平台主页' : '统一登录');
        };
        window.addEventListener('storage', setTrigger);
        const layer = document.createElement('div');
        layer.className = 'auth-screen';
        layer.hidden = true;
        layer.innerHTML = `<form class="auth-panel" aria-labelledby="auth-title">
            <div class="auth-kicker">TROPICAL FRUIT RESEARCH PLATFORM</div>
            <h1 id="auth-title">平台统一登录</h1>
            <p>登录后进入平台主页</p>
            <button class="auth-close" type="button" aria-label="关闭登录窗口">关闭</button>
            <label>账号<input name="username" autocomplete="username" required value="admin"></label>
            <label>密码<input name="password" type="password" autocomplete="current-password" required value="123456"></label>
            <button type="submit">登录</button>
            <div class="auth-error" role="alert" aria-live="polite"></div>
            <small>演示账号：admin　密码：123456</small>
        </form>`;
        document.body.appendChild(layer);
        setTrigger();
        trigger.addEventListener('click', () => {
            if (hasSession()) location.assign('index.html#home');
            else layer.hidden = false;
        });
        layer.addEventListener('click', event => {
            if (event.target === layer || event.target.closest('.auth-close')) layer.hidden = true;
        });
        document.addEventListener('keydown', event => {
            if (event.key === 'Escape') layer.hidden = true;
        });
        layer.querySelector('form').addEventListener('submit', event => {
            event.preventDefault();
            const form = event.currentTarget;
            if (form.elements.username.value.trim() !== DEMO_USER || form.elements.password.value !== DEMO_PASSWORD) {
                layer.querySelector('.auth-error').textContent = '账号或密码不正确';
                return;
            }
            localStorage.setItem(SESSION_KEY, DEMO_USER);
            location.replace('index.html#home');
        });
    };

    return { hasSession, requireSession, logout, mountLogin };
})();
