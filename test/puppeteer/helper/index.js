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
 * @param strokesParam
 * @param offsetX
 * @param offsetY
 * @returns {Promise<void>}
 */
async function playStrokes (page, strokesParam, offsetX, offsetY) {
  const offsetXRef = offsetX || 0
  const offsetYRef = offsetY || 0
  for (const strokes of strokesParam) {
    if (strokes[0].length === 1 && strokes[0][0] === strokes[1][0]) {
      if (strokes[0][0] === -1) {
        await page.click('#undo')
      } else if (strokes[0][0] === 1) {
        await page.click('#redo')
      } else if (strokes[0][0] === 0) {
        await page.click('#clear')
      }
    } else {
      await page.mouse.move(offsetXRef + strokes[0][0], offsetYRef + strokes[1][0])
      await page.mouse.down()
      for (let p = 0; p < strokes[0].length; p++) {
        await page.mouse.move(offsetXRef + strokes[0][p], offsetYRef + strokes[1][p])
      }
      await page.waitFor(100)
      await page.mouse.up()
    }
  }
}

module.exports = {
  getStrokesFromJIIX,
  playStrokes,
  findValuesByKey
}
