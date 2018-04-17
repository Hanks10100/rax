const MODULE_NAME_PREFIX = '@weex-module/';

const availableWindmillModules = [''];
function isAvailableWindmillModule(moduleName) {
  // return availableWindmillModules.indexOf(module) !== -1;
  return true;
}

module.exports = function(modules, weex, windmill) {
  const isInWindmill = weex.config.container === 'windmill';
  function require(name) {
    var mod = modules[name];

    // if require '@weex-module/'
    if (name.split(MODULE_NAME_PREFIX).length > 1) {
      const weexModuleName = name.split(MODULE_NAME_PREFIX)[1];
      if (isInWindmill && isAvailableWindmillModule(weexModuleName)) {
        var handler = {
          get: function(target, api) {
            return function(cfg) {
              console.log('$call: ' + weexModuleName + '.' + api);
              return windmill.$call(weexModuleName + '.' + api, cfg);
            };
          }
        };
        return new Proxy({}, handler);
      } else {
        if (weex.isRegisteredModule(weexModuleName)) {
          return weex.requireModule(weexModuleName);
        } else {
          throw new Error(
            'Requiring unknown weex module "' + name + '"'
          );
        }
      }
    }

    if (mod && mod.isInitialized) {
      return mod.module.exports;
    }

    if (!mod) {
      throw new Error(
        'Requiring unknown module "' + name + '"'
      );
    }

    if (mod.hasError) {
      throw new Error(
        'Requiring module "' + name + '" which threw an exception'
      );
    }

    try {
      mod.isInitialized = true;
      mod.factory(require, mod.module.exports, mod.module);
    } catch (e) {
      mod.hasError = true;
      mod.isInitialized = false;
      throw e;
    }

    return mod.module.exports;
  }

  return require;
};
