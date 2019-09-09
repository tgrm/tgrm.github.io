import './index.scss';

var label = location.hash.replace(/^#(http:|https:)?\/*/i, '').replace(/^(t\.me)?\/*/i, '');;
if (label) {
    document.getElementById('label').textContent = 't.me/' + label;

    /** @type {HTMLAnchorElement} */
    var link;
    //@ts-ignore
    link = document.getElementById('wrapper');
    link.href = 'http://t.me/' + label
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