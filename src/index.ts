import { PathLike, watch, WatchEventType, WatchOptions } from 'fs';
import { Observable } from 'rxjs';

type WatchObservable<T> = Observable<[WatchEventType, T]>;

// definition of watch from @types/node/fs.d.ts, slightly edited

/**
 * Watch for changes on `filename`, where `filename` is either a file or a directory, returning a `WatchObservable`.
 * @param filename A path to a file or directory. If a URL is provided, it must use the `file:` protocol.
 */
function watchObservable(filename: PathLike): WatchObservable<string>

/**
 * Watch for changes on `filename`, where `filename` is either a file or a directory, returning a `WatchObservable`.
 * @param filename A path to a file or directory. If a URL is provided, it must use the `file:` protocol.
 * @param options Either the encoding for the filename provided to the listener, or an object optionally specifying encoding, persistent, and recursive options.
 * If `encoding` is not supplied, the default of `'utf8'` is used.
 * If `persistent` is not supplied, the default of `true` is used.
 * If `recursive` is not supplied, the default of `false` is used.
 */
function watchObservable(
  filename: PathLike,
  options: WatchOptions | string,
): WatchObservable<string | Buffer>

/**
 * Watch for changes on `filename`, where `filename` is either a file or a directory, returning a `WatchObservable`.
 * @param filename A path to a file or directory. If a URL is provided, it must use the `file:` protocol.
 * @param options Either the encoding for the filename provided to the listener, or an object optionally specifying encoding, persistent, and recursive options.
 * If `encoding` is not supplied, the default of `'utf8'` is used.
 * If `persistent` is not supplied, the default of `true` is used.
 * If `recursive` is not supplied, the default of `false` is used.
 */
function watchObservable(
  filename: PathLike,
  options?: WatchOptions | BufferEncoding | null
): WatchObservable<string>

/**
 * Watch for changes on `filename`, where `filename` is either a file or a
 * directory.
 *
 * The second argument is optional. If `options` is provided as a string, it
 * specifies the `encoding`. Otherwise `options` should be passed as an object.
 *
 * The observable gets a tuple with `[eventType, filename]`. `eventType`is either `'rename'` or `'change'`, and `filename` is the name of the file
 * which triggered the event.
 *
 * On most platforms, `'rename'` is emitted whenever a filename appears or
 * disappears in the directory.
 *
 * The observable is attached to the `'change'` event fired by `fs.FSWatcher`, but it is not the same thing as the `'change'` value of`eventType`.
 *
 * If a `signal` is passed, aborting the corresponding AbortController will close
 * the returned `fs.FSWatcher`.
 */
function watchObservable(
  filename: PathLike,
  options:
    | (WatchOptions & {
          encoding: 'buffer';
      })
    | 'buffer',
): WatchObservable<Buffer>;

function watchObservable(
  filename: PathLike,
  options?: WatchOptions | BufferEncoding | string | null | (WatchOptions & { encoding: 'buffer'; }) | 'buffer'
): WatchObservable<string | Buffer> {

  return new Observable(subscriber => {
    // I tried but have to put options as any here.
    const watcher = watch(filename, options as any, (eventType, filename) => {
      subscriber.next([ eventType, filename ])
    });

    watcher.on("error", (error: Error) => {
      subscriber.error(error);
    });

    watcher.on("close", () => {
      subscriber.complete();
    });

    if (typeof options === "object") {
      options?.signal?.addEventListener("abort", () => {
        watcher.close();
      }, { once: true });
    }

    return function unsubscribe() {
      watcher.close();
    }
  });
};

export default watchObservable;
