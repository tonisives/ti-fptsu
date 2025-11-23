# if cases

## if case with TE

Use fromPredicate/filterOrElse to return string guards
In the end of the pipe, log out the guard, or return the error

```ts
let processConfigWithWindow = (
  rule
): CacheTask<TriggeredNotification | null> =>
  pipe(
    shouldTriggerNotification(rule),
    te.fromPredicate(
      (should) => should,
      () => "not triggered",
    ),
    te.flatMap(() =>
      deps.timeseriesCache.checkWindow(config.notification_id, window.timeframe, now),
    ),
    te.filterOrElse(
      (should) => should,
      () => "window filled",
    ),
    te.flatMap(() => createTriggeredNotification(deps, config, metadata, window, rule.rule)),
    te.orElse(logGuard),
  )

let logGuard = (e: string | ObserverError) =>
  typeof e === "string"
    ? pipe(
        l.traceL(() => `Not triggered: ${e}`),
        () => null,
        te.of,
      )
    : te.left(e as ObserverError)
```
