import './index.scss';
import SearchParams from '@taraflex/silly-query-string';

function transform(search: SearchParams, pathParts: string[]) {
    let [type, v, ...values] = pathParts;
    // https://core.telegram.org/api/links
    // https://github.com/zevlg/telega.el/blob/master/telega-tme.el#L276

    // tg: only
    // https://core.telegram.org/api/links#settings-links
    // https://core.telegram.org/api/links#telegram-passport-links
    // https://core.telegram.org/api/links#premium-referrer-links
    // https://core.telegram.org/api/links#qr-code-login-links
    // https://core.telegram.org/api/links#id-links
    // https://core.telegram.org/api/links#emoji-links

    if (type[0] === '$') {
        v = type.slice(1);
        type = 'invoice';
    } else if (type[0] === '+' && !/^\+[0-9\(\)\-\s]+$/i.test(type) /*phone*/) {
        v = type.slice(1);
        type = 'joinchat';
    }
    switch (type) {
        case 'contact':
            search.token = v;
            return 'tg://contact' + search;
        case 'joinchat':
            search.invite = v;
            return 'tg://join' + search;
        case 'share':
            return 'tg://msg_url' + search;
        case 'addstickers':
        case 'addemoji':
            search.set = v;
            return 'tg://' + type + search;
        case 'socks':
        case 'proxy':
        case 'confirmphone':
            return 'tg://' + type + search;
        case 'addlist':
        case 'addtheme':
        case 'bg':
        case 'invoice':
            search.slug = v;
            return 'tg://' + type + search;
        //todo preview bg as page background
        //todo https://core.telegram.org/api/links#solid-fill-wallpapers
        //todo https://core.telegram.org/api/links#gradient-fill-wallpapers
        //todo https://core.telegram.org/api/links#freeform-gradient-fill-wallpapers
        case 'login':
            search.code = v;
            return 'tg://login' + search;
        case 'setlanguage':
            search.lang = v;
            return 'tg://setlanguage' + search;
        case 'c':
            search.channel = v;
            if (values.length > 1) {
                search.thread = values[0];
                search.post = values[1];
            } else if (values.length) {
                search.post = values[0];
            }
            return 'tg://privatepost' + search;
        default:
            if (type[0] === '+') {
                search.phone = type.replace(/^\++/, '');
            } else {
                if (search.startapp) {
                    search.appname = values[0];
                } else if (values.length > 1) {
                    search.thread = values[0];
                    search.post = values[1];
                } else if (values.length) {
                    search.post = values[0];
                }
                search.domain = v;
            }
            return 'tg://resolve' + search;
    }
}

let label = [location.hash, location.pathname]
    .map(v =>
        v
            .slice(1)
            .replace(/^(https?:)?\/*/i, '')
            .replace(/^(t\.me)?\/*/i, '')
    )
    .filter(Boolean)[0];

if (label) {
    label = location.origin + '/' + label;
    document.getElementById('label').textContent = label;
    let link = document.getElementById('wrapper') as HTMLAnchorElement;
    link.href = label;

    const u = transform(new SearchParams(link.search), link.pathname.slice(1).split('/', 4));
    link.href = u;
    link.style.display = 'inline-block';
    location.href = u;
} else {
    //todo empty page must display field for transform t.me links
}
