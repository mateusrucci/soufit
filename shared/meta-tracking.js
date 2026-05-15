(function () {
    var config = {
        pixelId: '1172482898007013',
        endpoint: '/meta-capi.php',
        storagePrefix: 'soufit_meta_'
    };

    function getCookie(name) {
        var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match ? decodeURIComponent(match[2]) : null;
    }

    function setCookie(name, value, days) {
        var expires = new Date(Date.now() + days * 864e5).toUTCString();
        document.cookie = name + '=' + encodeURIComponent(value) + ';expires=' + expires + ';path=/;SameSite=Lax';
    }

    function getStored(key) {
        try {
            return window.localStorage.getItem(config.storagePrefix + key);
        } catch (_) {
            return null;
        }
    }

    function setStored(key, value) {
        try {
            window.localStorage.setItem(config.storagePrefix + key, value);
        } catch (_) {}
    }

    function generateId(prefix) {
        return prefix + '_' + Math.random().toString(36).slice(2) + '_' + Date.now().toString(36);
    }

    function getExternalId() {
        var id = getCookie('_soufit_eid') || getStored('external_id');

        if (!id) {
            id = generateId('eid');
            setCookie('_soufit_eid', id, 180);
            setStored('external_id', id);
        }

        return id;
    }

    function getFbc() {
        var cookie = getCookie('_fbc');

        if (cookie) {
            setStored('fbc', cookie);
            return cookie;
        }

        var params = new URLSearchParams(window.location.search);
        var fbclid = params.get('fbclid');

        if (fbclid) {
            var fbc = 'fb.1.' + Date.now() + '.' + fbclid;
            setCookie('_fbc', fbc, 90);
            setStored('fbc', fbc);
            return fbc;
        }

        return getStored('fbc');
    }

    function getFbp() {
        var cookie = getCookie('_fbp');

        if (cookie) {
            setStored('fbp', cookie);
            return cookie;
        }

        var stored = getStored('fbp');

        if (stored) {
            setCookie('_fbp', stored, 90);
            return stored;
        }

        var fbp = 'fb.1.' + Date.now() + '.' + Math.floor(Math.random() * 1e10);
        setCookie('_fbp', fbp, 90);
        setStored('fbp', fbp);
        return fbp;
    }

    function normalizeEmail(email) {
        var value = String(email || '').trim().toLowerCase();
        return value || null;
    }

    function normalizePhone(phone) {
        var value = String(phone || '').replace(/\D/g, '');
        return value || null;
    }

    function loadPixel() {
        if (window.fbq) {
            window.fbq('init', config.pixelId);
            return;
        }

        !function (f, b, e, v, n, t, s) {
            if (f.fbq) return;
            n = f.fbq = function () {
                n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
            };
            if (!f._fbq) f._fbq = n;
            n.push = n;
            n.loaded = true;
            n.version = '2.0';
            n.queue = [];
            t = b.createElement(e);
            t.async = true;
            t.src = v;
            s = b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t, s);
        }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

        window.fbq('init', config.pixelId);
    }

    function sendServer(payload, preferBeacon) {
        var body = JSON.stringify(payload);

        if (preferBeacon && navigator.sendBeacon) {
            var blob = new Blob([body], { type: 'application/json' });
            if (navigator.sendBeacon(config.endpoint, blob)) {
                return;
            }
        }

        if (!window.fetch) {
            return;
        }

        fetch(config.endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: body,
            keepalive: !!preferBeacon
        }).catch(function () {});
    }

    function track(eventName, customData, userData, options) {
        customData = customData || {};
        userData = userData || {};
        options = options || {};

        var eventId = options.eventId || generateId('evt');

        if (typeof window.fbq === 'function') {
            window.fbq('track', eventName, customData, { eventID: eventId });
        }

        sendServer({
            eventName: eventName,
            eventId: eventId,
            eventUrl: window.location.href,
            fbp: getFbp(),
            fbc: getFbc(),
            external_id: userData.external_id || getExternalId(),
            email: normalizeEmail(userData.email),
            phone: normalizePhone(userData.phone),
            fn: userData.fn || null,
            ln: userData.ln || null,
            custom_data: customData
        }, !!options.preferBeacon);

        return eventId;
    }

    function checkoutDataFromUrl(url) {
        var quantity = parseInt(url.searchParams.get('quantidade') || '1', 10);
        var productId = url.searchParams.get('produto') || '1';

        if (!Number.isFinite(quantity) || quantity < 1) {
            quantity = 1;
        }

        return {
            content_name: 'Fit Moderno',
            content_type: 'product',
            content_ids: [productId],
            contents: [{ id: productId, quantity: quantity }],
            num_items: quantity,
            currency: 'BRL'
        };
    }

    function installCheckoutTracking() {
        document.addEventListener('click', function (event) {
            var link = event.target.closest ? event.target.closest('a[href]') : null;

            if (!link) {
                return;
            }

            var url;
            try {
                url = new URL(link.href, window.location.href);
            } catch (_) {
                return;
            }

            if (url.hostname !== 'soufit.com' || url.pathname !== '/comprar') {
                return;
            }

            track('InitiateCheckout', checkoutDataFromUrl(url), {}, { preferBeacon: true });
        }, true);
    }

    window.SoufitTracker = window.SoufitTracker || {};
    window.SoufitTracker.track = track;
    window.SoufitTracker.config = config;

    loadPixel();

    document.addEventListener('DOMContentLoaded', function () {
        track('PageView', {
            page_title: document.title,
            page_path: window.location.pathname
        });
        installCheckoutTracking();
    });
})();
