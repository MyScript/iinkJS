/**
 *
 * @param obj
 * @param key
 * @param list
 * @returns {*}
 */
function findValuesHelper (obj, key, list) {
  let listRef = list
  if (!obj) return listRef
  if (obj instanceof Array) {
    Object.keys(obj).forEach((k) => {
      listRef = listRef.concat(findValuesHelper(obj[k], key, []))
    })
    return listRef
  }
  if (obj[key]) {
    if (obj[key] instanceof Array) {
      Object.keys(obj[key]).forEach((l) => {
        listRef.push(obj[key][l])
      })
    } else {
      listRef.push(obj[key])
    }
  }

  if (typeof obj === 'object') {
    const children = Object.keys(obj)
    if (children.length > 0) {
      children.forEach((child) => {
        listRef = listRef.concat(findValuesHelper(obj[child], key, []))
      })
    }
  }
  return listRef
}

/**
 *
 * @param obj
 * @param key
 * @returns {*}
 */
function findValuesByKey (obj, key) {
  return findValuesHelper(JSON.parse(obj), key, [])
}

/**
 *
 * @param jiix
 * @returns {*}
 */
function getStrokesFromJIIX (jiix) {
  const itemsList = findValuesByKey(jiix, 'items')
  return itemsList.filter(item => item.type === 'stroke')
}

/**
 *
 * @param page
 * @param strokes
 * @param offsetX
 * @param offsetY
 * @returns {Promise<void>}
 */
async function playStrokes (page, strokes, offsetX, offsetY) {
  const offsetXRef = offsetX || 0
  const offsetYRef = offsetY || 0

  for (const { x, y, t } of strokes) {
    const hasTimeStamp = t && t.length > 0
    await page.mouse.move(offsetXRef + x[0], offsetYRef + y[0])
    await page.mouse.down()
    let oldTimestamp
    if (hasTimeStamp) {
      oldTimestamp = t[0]
    }
    for (let p = 0; p < x.length; p++) {
      let waitTime = 10
      if (hasTimeStamp) {
        waitTime = t[p] - oldTimestamp
        oldTimestamp = t[p]
      }
      await page.waitForTimeout(waitTime)
      await page.mouse.move(offsetXRef + x[p], offsetYRef + y[p])
    }
    await page.mouse.up()
    await page.waitForTimeout(100)
  }
}

/**
 * @param page
 * @returns {Promise<boolean>}
 */
async function isEditorInitialized (editorEl) {
  await editorEl.evaluate(node => node.editor.recognizerContext.initPromise)
  return await editorEl.evaluate(node => node.editor.initialized)
}

const exported = `(async () => {
  return new Promise((resolve, reject) => {
    document.getElementById('editor').addEventListener('exported', (e) => {
      resolve('exported');
    });
  });
})()`

module.exports = {
  getStrokesFromJIIX,
  playStrokes,
  findValuesByKey,
  isEditorInitialized,
  exported
}
