import { onRequestPost as __api_lista_js_onRequestPost } from "/home/claude/mdz-sitio/functions/api/lista.js"
import { onRequest as __api_lista_js_onRequest } from "/home/claude/mdz-sitio/functions/api/lista.js"
import { onRequestGet as __l__id__js_onRequestGet } from "/home/claude/mdz-sitio/functions/l/[id].js"

export const routes = [
    {
      routePath: "/api/lista",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_lista_js_onRequestPost],
    },
  {
      routePath: "/api/lista",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_lista_js_onRequest],
    },
  {
      routePath: "/l/:id",
      mountPath: "/l",
      method: "GET",
      middlewares: [],
      modules: [__l__id__js_onRequestGet],
    },
  ]