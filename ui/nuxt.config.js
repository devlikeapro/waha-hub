// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    typescript: false,
    devtools: {enabled: true},
    ssr: false,
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
    modules: [
        'nuxt-primevue',
        '@pinia/nuxt',
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
        {
            id: 'ga-analytics',
            strategy: 'lazyOnload',
            children: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'UA-93461466-1');
            `
        }
    ],
    css: [
        // PrimeVue
        'primeicons/primeicons.css',
        'primeflex/primeflex.scss',
        'primevue/resources/primevue.min.css',
        // Font Awesome
        '@fortawesome/fontawesome-svg-core/styles.css',
        // Custom
        '@/assets/styles.scss'
    ]
});
