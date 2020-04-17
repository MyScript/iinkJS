function noop () {
  return {}
}

require.extensions['.css'] = noop
