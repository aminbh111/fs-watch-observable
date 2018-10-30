import { join } from "path";
import rimraf = require("rimraf");
import mkdirp = require("mkdirp");

import watchObservable from ".";
import { closeSync, openSync } from "fs";

const pkg = join(__dirname, 'test');
beforeEach(() => mkdirp.sync(pkg));
afterEach(() => rimraf.sync(pkg));

it("simple overload", done => {
  const observable = watchObservable(pkg);

  const subscription = observable.subscribe(
    ([ eventType, filename ]) => {
      expect(eventType).toBe('rename');
      expect(filename).toBe('foo');
      subscription.unsubscribe();
    }
  );

  subscription.add(() => done());
  closeSync(openSync(join(pkg, 'foo'), 'w'));
});

// recursive is not supported on linux
it.skip("options overload (recursive)", done => {
  const subfolder = join(pkg, 'subfolder');
  mkdirp.sync(subfolder);

  const observable = watchObservable(pkg, { recursive: true });

  const subscription = observable.subscribe(
    ([ eventType, filename ]) => {
      expect(eventType).toBe('rename');
      expect(filename).toBe(join('subfolder', 'bar'));
      subscription.unsubscribe();
    }
  );

  subscription.add(() => done());
  closeSync(openSync(join(subfolder, 'bar'), 'w'));
});

it("options overload (encoding)", done => {
  const observable = watchObservable(pkg, { encoding: "utf8" });

  const subscription = observable.subscribe(
    ([ eventType, filename ]) => {
      expect(eventType).toBe('rename');
      expect(filename).toBe('foo');
      subscription.unsubscribe();
    }
  );

  subscription.add(() => done());
  closeSync(openSync(join(pkg, 'foo'), 'w'));
})

it("buffer overload", done => {
  const observable = watchObservable(pkg, "buffer");

  const subscription = observable.subscribe(
    ([ eventType, filename ]) => {
      expect(eventType).toBe('rename');
      expect(filename).toEqual(Buffer.from('foo'));
      subscription.unsubscribe();
    }
  );

  subscription.add(() => done());
  closeSync(openSync(join(pkg, 'foo'), 'w'));
});
