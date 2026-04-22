import Routes from '../js/routes.js'

export default {
    history: VueRouter.createWebHashHistory(), // Hash simplifies hosting, no need to fallback to index.html
    routes: Routes,
}
