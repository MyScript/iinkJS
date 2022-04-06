/**
 * @typedef {Object} DestructuredPromise
 * @property {Promise} promise
 * @property {function} resolve
 * @property {function} reject
 */

/**
 * destructurePromise
 * @returns {{resolve: *, reject: *, promise: Promise<unknown>}}
 */
export function destructurePromise () {
  let resolveParam
  let rejectParam
  const initPromise = new Promise(
    (resolve, reject) => {
      resolveParam = async (v) => {
        initPromise.isFullfilled = true
        initPromise.isPending = false
        return resolve(v)
      }
      rejectParam = async (e) => {
        initPromise.isRejected = true
        initPromise.isPending = false
        reject(e)
      }
    })

  initPromise.isPending = true

  return { promise: initPromise, resolve: resolveParam, reject: rejectParam }
}

/**
 * @param time
 * @return {{timer: *, promise: Promise}}
 */
export function delay (time) {
  let timer = null
  const promise = new Promise((resolve) => {
    timer = setTimeout(resolve, time)
  })
  return {
    promise,
    timer
  }
}
