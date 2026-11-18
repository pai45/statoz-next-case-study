// Runs before either packaged product. Presentation data gets its own namespace
// on the shared GitHub Pages origin, including reset operations.
(() => {
  const product = document.currentScript.dataset.product;
  const namespace = 'statoz.case.demo.' + product + '.';
  function scopedStorage(storage) {
    const keys = () => Object.keys(storage).filter(key => key.startsWith(namespace)).map(key => key.slice(namespace.length));
    const facade = {
      getItem: key => storage.getItem(namespace + key),
      setItem: (key, value) => storage.setItem(namespace + key, String(value)),
      removeItem: key => storage.removeItem(namespace + key),
      clear: () => keys().forEach(key => storage.removeItem(namespace + key)),
      key: index => keys()[index] ?? null,
    };
    Object.defineProperty(facade, 'length', { configurable: true, get: () => keys().length });
    return new Proxy(facade, {
      get: (target, key) => key in target || typeof key === 'symbol' ? Reflect.get(target, key) : facade.getItem(key),
      set: (_target, key, value) => { facade.setItem(key, value); return true; },
      ownKeys: () => keys(),
      getOwnPropertyDescriptor: (_target, key) => ({ configurable: true, enumerable: true, value: facade.getItem(key) }),
      deleteProperty: (_target, key) => { facade.removeItem(key); return true; },
    });
  }
  Object.defineProperty(window, 'localStorage', { value: scopedStorage(window.localStorage) });
  Object.defineProperty(window, 'sessionStorage', { value: scopedStorage(window.sessionStorage) });
  const NativeChannel = window.BroadcastChannel;
  if (NativeChannel) window.BroadcastChannel = class extends NativeChannel { constructor(name) { super(namespace + name); } };
  const database = window.indexedDB;
  if (database) {
    const open = database.open.bind(database), remove = database.deleteDatabase.bind(database);
    database.open = (name, ...args) => open(namespace + name, ...args);
    database.deleteDatabase = name => remove(namespace + name);
  }
  const prefix = 'statoz.next.' + product + '-web', email = 'investor-demo@statoz.example';
  function seed() {
    localStorage.setItem(prefix + '.auth.v2', JSON.stringify({ version: 2, authenticated: true, email }));
    localStorage.setItem(prefix + '.accounts.v1', JSON.stringify({ version: 1, accounts: { [email]: { onboardingComplete: true } } }));
    localStorage.setItem(prefix + '.account-data-owner.v1', email);
  }
  seed();
  addEventListener('message', event => {
    if (event.source !== parent || event.origin !== location.origin || event.data?.type !== 'statoz-case-reset') return;
    localStorage.clear(); sessionStorage.clear(); seed(); location.reload();
  });
  parent.postMessage({ type: 'statoz-case-ready' }, location.origin);
})();
