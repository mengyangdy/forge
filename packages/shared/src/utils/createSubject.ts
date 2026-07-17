/** 表示可用于取消订阅的清理函数 */
export type Teardown = { unsubscribe: () => void };

/** 基础观察者接口，用于接收值 */
export interface Observer<T> {
  next: (value: T) => void;
}

/**
 * Subject 接口，扩展了 Observer 并添加了额外功能
 * Subject 同时是 Observable（可被订阅）和 Observer（可发出值）
 */
export interface Subject<T> extends Observer<T> {
  /** 表示 Subject 是否已关闭，不再接受新订阅 */
  readonly closed: boolean;
  /** 完成 Subject 并清除所有观察者 */
  complete: () => void;
  /** 检查是否有活跃的观察者 */
  hasObservers: () => boolean;
  /** 当前观察者数量 */
  readonly size: number;
  /** 使用 Observer 对象或 next 函数订阅值更新 */
  subscribe: (obs: Observer<T> | ((v: T) => void)) => Teardown;
  /** 取消所有观察者的订阅 */
  unsubscribe: () => void;
}

/**
 * 创建一个新的 Subject，用于向多个观察者发出值
 * 实现了简化版的 RxJS Subject 模式
 *
 * @example
 *   const bus = createSubject<string>();
 *   const a = bus.subscribe(v => console.log('A:', v));
 *   const b = bus.subscribe({ next: v => console.log('B:', v) });
 *   bus.next('hello'); // A: hello / B: hello
 *   a.unsubscribe();
 *   bus.next('world'); // B: world
 *   bus.complete();
 */
export function createSubject<T>(): Subject<T> {
  // 存储所有活跃观察者的集合
  const observers = new Set<Observer<T>>();
  // 标记 Subject 是否已关闭
  let _closed = false;

  /**
   * 使用 Observer 对象或 next 函数订阅 Subject
   * 返回可用于取消订阅的清理对象
   */
  const subscribe = (obsOrFn: Observer<T> | ((v: T) => void)): Teardown => {
    // 如果 Subject 已关闭，返回空操作的取消订阅函数
    if (_closed) return { unsubscribe: () => {} };
    // 如果传入的是函数，转换为 Observer 对象
    const obs: Observer<T> = typeof obsOrFn === "function" ? { next: obsOrFn } : obsOrFn;
    observers.add(obs);
    let done = false;
    return {
      unsubscribe: () => {
        if (done) return;
        done = true;
        observers.delete(obs);
      },
    };
  };

  /**
   * 向所有观察者发出新值
   * 在迭代前对观察者进行快照，避免迭代期间集合被修改导致问题
   */
  const next = (value: T) => {
    if (_closed || observers.size === 0) return;
    // 对观察者集合进行快照，避免迭代期间集合被修改
    const snapshot = Array.from(observers);
    for (const ob of snapshot) {
      try {
        ob.next?.(value);
      } catch (e) {
        // oxlint-disable-next-line no-console
        console.error(e);
      }
    }
  };

  /** 移除所有观察者，但不关闭 Subject */
  const unsubscribe = () => {
    observers.clear();
  };

  /** 标记 Subject 已完成并移除所有观察者 */
  const complete = () => {
    _closed = true;
    observers.clear();
  };

  return {
    get closed() {
      return _closed;
    },
    complete,
    hasObservers: () => observers.size > 0,
    next,
    get size() {
      return observers.size;
    },
    subscribe,
    unsubscribe,
  };
}
