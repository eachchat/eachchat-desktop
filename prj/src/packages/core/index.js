/**
 * Core modules
 * @author Jakit
 * @date 2020/03/04
 */

import { loading } from './loader.js'
import * as model from './model.js'
import * as sqlite from './sqlite.js'

loading("model", model)
loading("sqlite", sqlite)

export {
  model,
  sqlite
}
