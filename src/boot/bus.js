import mitt from 'mitt'

const emitter = mitt()
export { emitter }
export default async ({ app }) => {
  app.config.globalProperties.$emitter = emitter
}
