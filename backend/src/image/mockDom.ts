// mockDom.ts
Object.defineProperty(global, 'navigator', {
  value: { userAgent: 'node' },
  writable: true,
  configurable: true
});


export function mockDom(width: number, height: number) {
  // 这里随便写一个 createElement('canvas') 的逻辑
  global.document = {
    createElement: (tag: string) => {
      if (tag === 'canvas') {
        // 直接在这里 new Canvas，大小你可以自由定
        const { Canvas } = require('skia-canvas');
        const canvas = new Canvas(width, height);
        // Chart.js 可能会用到一些属性
        (canvas as any).style = {};
        return canvas;
      }
      return {};
    },
  } as unknown as Document;

  global.window = {
    devicePixelRatio: 1,
    // 可能 Chart.js 要用 addEventListener 之类
    addEventListener: () => { },
  } as unknown as Window & typeof globalThis;

  global.navigator = {
    userAgent: 'node',
  } as unknown as Navigator;
}
