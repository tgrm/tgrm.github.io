import './index.scss';

var label = [location.hash, location.pathname].map(function (v) {
    return v.slice(1)
        .replace(/^(http:|https:)?\/*/i, '')
        .replace(/^(t\.me)?\/*/i, '');
}).filter(Boolean)[0];
if (label) {
    document.getElementById('linkName').textContent = 't.me/' + label;

    /** @type {HTMLAnchorElement} */
    var link;
    //@ts-ignore
    link = document.getElementById('linkURL');
    link.href = 'https://t.me/' + label
    var path = link.pathname.split('/', 3);
    var str = '';

    switch (path[1]) {
        case 'socks':
            str = 'tg://socks' + link.search;
            break;
        case 'share':
            str = 'tg://msg_' + path[2] + link.search;
            break;
        case 'joinchat':
            str = 'tg://join?invite=' + path[2];
            break;
        case 'addstickers':
            str = 'tg://addstickers?set=' + path[2];
            break;
        case 'proxy':
            str = 'tg://proxy' + link.search;
            break;
        default:
            str = 'tg://resolve?domain=' + path[1] + link.search.replace('?start=', '&start=');
            if (path[2]) {
                str += '&post=' + path[2];
            }
    }

    link.href = str;
    link.style.display = 'inline-block';
    location.href = str;
}