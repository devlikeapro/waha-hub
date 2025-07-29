// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    typescript: false,
    devtools: {enabled: true},
    ssr: false,
    runtimeConfig: {
        public: {
            mockData: false,
        }
    },
    app: {
        baseURL: '/dashboard/',
        head: {
            title: 'Dashboard | WAHA',
            link: [
                {
                    id: 'theme-css',
                    rel: 'stylesheet',
                    type: 'text/css',
                    href: '/dashboard/themes/lara-dark-green/theme.css'
                },
                {
                    rel: 'icon',
                    type: 'image/x-icon',
                    href: '/dashboard/favicon.ico'
                }
            ]
        }
    },
    components: {
        path: '~/components',
        pathPrefix: false
    },
    modules: [
        'nuxt-primevue',
        '@pinia/nuxt',
        '@nuxtjs/i18n'
    ],
    primevue: {
        options: {ripple: true},
        components: {
            exclude: ['Editor']
        }
    },
    script: [
        {
            strategy: 'lazyOnload',
            src: 'https://www.googletagmanager.com/gtag/js?id=UA-93461466-1'
        },
    ],
    css: [
        // PrimeVue
        'primeicons/primeicons.css',
        'primeflex/primeflex.scss',
        'primevue/resources/primevue.min.css',
        // Font Awesome
        '@fortawesome/fontawesome-svg-core/styles.css',
        // Custom
        '@/assets/styles.scss',
        'vue-json-pretty/lib/styles.css'
    ],
    i18n: {
        compilation: {
            strictMessage: false
        },
        locales: [
            { code: 'en', name: '🇺🇸 English (English)', file: 'en.json' },
            { code: 'ar', name: '🇦🇪 العربية (Arabic)', file: 'ar.json' },
            { code: 'bn', name: '🇧🇩 বাংলা (Bengali)', file: 'bn.json' },
            { code: 'de', name: '🇩🇪 Deutsch (German)', file: 'de.json' },
            { code: 'es', name: '🇪🇸 Español (Spanish)', file: 'es.json' },
            { code: 'fa', name: '🇮🇷 فارسی (Persian)', file: 'fa.json' },
            { code: 'fr', name: '🇫🇷 Français (French)', file: 'fr.json' },
            { code: 'he', name: '🇮🇱 עברית (Hebrew)', file: 'he.json' },
            { code: 'hi', name: '🇮🇳 हिंदी (Hindi)', file: 'hi.json' },
            { code: 'id', name: '🇮🇩 Bahasa Indonesia (Indonesian)', file: 'id.json' },
            { code: 'pa', name: '🇵🇰 ਪੰਜਾਬੀ (Punjabi)', file: 'pa.json' },
            { code: 'pt', name: '🇧🇷🇵🇹 Português (Portuguese)', file: 'pt.json' },
            { code: 'ru', name: '🇷🇺 Русский (Russian)', file: 'ru.json' },
            { code: 'tr', name: '🇹🇷 Türkçe (Turkish)', file: 'tr.json' },
            { code: 'uk', name: '🇺🇦 Українська (Ukrainian)', file: 'uk.json' },
            { code: 'ur', name: '🇵🇰 اردو (Urdu)', file: 'ur.json' },
        ],
        skipSettingLocaleOnNavigate: true,
        locale: 'en',
        fallbackLocale: 'en',
        strategy: 'no_prefix',
        lazy: false,
        langDir: 'locales/'
    }
});
