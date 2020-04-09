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
      resolveParam = resolve
      rejectParam = reject
    })
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
