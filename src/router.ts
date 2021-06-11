import {createRouter, createWebHistory, NavigationGuardNext, RouteLocationNormalized, RouteRecordRaw} from 'vue-router'
import Default from '@/layouts/Default.vue'

// Context of your middle functions
type MetaMiddlewareContext = {
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext;
}

// Middleware Function
type MetaMiddlewareFn = ((ctx: MetaMiddlewareContext) => any | void);

// Array of middleware functions
type MetaMiddlewares = MetaMiddlewareFn[]


const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        component: Default,
        children: [
            {
                path: '',
                name: 'Home',
                component: () => import('./views/Home.vue')
            },
            {
                path: '/about',
                name: 'About',
                component: () => import('./views/About.vue'),
                meta: {
                    middlewares: <MetaMiddlewares>[
                        ({next}) => {
                            console.log("Middleware 1")
                            next()
                        },

                        ({next}) => {
                            console.log("Middleware 2")
                            next()
                        },
                    ]
                }
            }
        ]
    }
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
})


router.beforeEach((to, from, next) => {
    let middlewares = to.meta.middlewares as MetaMiddlewares;

    // Stop if no middlewares
    if (!middlewares) return next();

    // Convert to array if not
    if (!Array.isArray(middlewares)) middlewares = [middlewares];

    // Holds current index;
    let currentIndex = 0;

    /**
     * Custom Next Function.
     * This is the next function that will be passed to your `meta` middlewares
     */
    const customNext = () => {
        // get the next `meta` middleware
        const nextMiddleware = middlewares[currentIndex + 1];
        currentIndex++;

        // if function run it, else stop and send the default next()
        if (typeof nextMiddleware === "function") {
            return nextMiddleware({
                to,
                from,
                next: customNext
            })
        } else {
            // Else use default next NOT custom.
            return next()
        }
    }

    // Start the meta middlewares cycle.
    middlewares[0]({to, from, next: customNext})
})

export default router
