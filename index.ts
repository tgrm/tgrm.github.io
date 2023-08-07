import './index.scss';
import SearchParams from '@taraflex/silly-query-string';

const hex = (s: string) => {
    const a = (s || '').toLowerCase().split(/(?:[~-])/);
    return a.every(c => /^[0-9a-f]{6}$/.test(c)) ? a : null;
};

const transform = (search: SearchParams, pathParts: string[]) => {
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

    const colors = hex(v) || hex(search.bg_color) || ['dbddbb', '6ba587', 'd5d88d', '88b884'];
    switch (colors.length) {
        case 1:
            document.body.style.background = '#' + (search.bg_color = search.color = colors[0]);
            break;
        case 2:
            document.body.style.background =
                'linear-gradient(' + (search.rotation | 0) + 'deg, #' + colors.join(',#') + ')';
            break;
        case 3:
        case 4:
            const n = (v: number) => v * Math.abs(v * 100 - ((Math.random() * 25) | 0));
            document.body.style.background =
                colors
                    .map((c, i) => {
                        const T = 8;
                        const S = ((T - i) * (100 / T)) | 0;
                        return (
                            'radial-gradient(' +
                            S +
                            '% ' +
                            S +
                            '% at ' +
                            n((i + (i < 2 ? 1 : 0)) % 2) +
                            '% ' +
                            n(i < 2 ? 1 : 0) +
                            '%, #' +
                            c +
                            ' 20%, transparent)'
                        );
                    })
                    .join(',') +
                ', linear-gradient(to bottom right, #' +
                colors[2] +
                ', #' +
                colors[0] +
                ')';
            break;
    }

    if (type[0] === '$') {
        v = type.slice(1);
        type = 'invoice';
    } else if (type[0] === '+' && !/^\+[0-9\(\)\-\s]+$/i.test(type) /*not phone*/) {
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
        case 'bg':
            if (colors.length > 1) {
                search.bg_color = search.gradient = colors.join(colors.length === 2 ? '-' : '~');
            }
        case 'addlist':
        case 'addtheme':
        case 'invoice':
            search.slug = v;
            return 'tg://' + type + search;
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
                if (v) {
                    values.unshift(v);
                    if (values.every(s => /^[1-9]+[0-9]*$/.test(s))) {
                        if (values.length > 1) {
                            search.thread = values[0];
                            search.post = values[1];
                        } else {
                            search.post = v;
                        }
                    } else {
                        search.appname = v;
                    }
                }
                search.domain = type;
            }
            return 'tg://resolve' + search;
    }
};

let label = [location.hash, location.pathname]
    .map(v =>
        v
            .slice(1)
            .replace(/^(https?:)?\/*/i, '')
            .replace(/^(t\.me)?\/*/i, '')
    )
    .filter(Boolean)[0];

if (label) {
    label = location.origin.slice(location.protocol.length + 2) + '/' + label;
    document.getElementById('l').textContent = label;
    let link = document.getElementById('w') as HTMLAnchorElement;
    link.href = location.protocol + '//' + label;

    const u = transform(new SearchParams(link.search), link.pathname.slice(1).split('/', 4));
    link.href = u;
    location.href = u;
}
//todo fix favicon in chrome
//todo empty page must display field for transform t.me links [ + button to patch link in clipboard (ignore domain) ]
