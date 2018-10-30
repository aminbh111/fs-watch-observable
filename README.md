This is a drop-in replacement for `fs.Watch` that emits change events on an Observable stream.

```typescript
merge(of(null /* first run */), watchObservable(Files.Settings)).pipe(
  debounceTime(50),
  mergeMap(loadMods),
  map(updateLoadedMods)
).subscribe(console.log);
```