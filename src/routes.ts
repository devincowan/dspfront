import { RouteConfig } from "vue-router"

import CzScott from '@/scott.vue'   // temporary

import CzFooter from '@/components/base/cz.footer.vue'
import CzHome from '@/components/home/cz.home.vue'
import CzAbout from '@/components/about/cz.about.vue'
import CzSubmit from '@/components/submit/cz.submit.vue'
import CzResources from '@/components/resources/cz.resources.vue'
import CzContact from '@/components/contact/cz.contact.vue'
import CzRecommendations from '@/components/recommendations/cz.recommendations.vue'
import CzSubmissions from '@/components/submissions/cz.submissions.vue'
import CzLogin from '@/components/account/cz.login.vue'

export const routes: RouteConfig[] = [
    {
        name: 'home',
        path: '/',
        components: {
            content: CzHome,
            footer: CzFooter
        },
    },
    {
        name: 'about',
        path: '/about',
        components: {
            content: CzAbout,
            footer: CzFooter
        },
    },
    {
        name: 'submit-data',
        path: '/submit',
        components: {
            content: CzSubmit,
            footer: CzFooter
        },
    },
    {
        name: 'resources',
        path: '/resources',
        components: {
            content: CzResources,
            footer: CzFooter
        },
    },
    {
        name: 'recommendations',
        path: '/recommendations',
        components: {
            content: CzRecommendations,
            footer: CzFooter
        },
    },
    {
        name: 'submissions',
        path: '/submissions',
        components: {
            content: CzSubmissions,
            footer: CzFooter
        },
    },
    {
        name: 'contact',
        path: '/contact',
        components: {
            content: CzContact,
            footer: CzFooter
        },
    },
    {
        name: 'login',
        path: '/login',
        components: {
            content: CzLogin,
            footer: CzFooter
        },
    },
    {
        name: 'scott',
        path: '/scott',
        components: {
            content: CzScott,
            footer: CzFooter
        },
    },
    {
        path: '*',
        redirect: '/',
    },
]