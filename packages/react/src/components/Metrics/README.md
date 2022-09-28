# Metrics

> **_NOTE:_** This is a work in progress, and requires metrics to be populated within a given workspace. See more about producing metrics: [producing metrics in the api](https://www.thenile.dev/rest-api#tag/metrics/operation/produceBatchOfMetrics). In the sdk, `nile.metrics.produceBatchOfMetrics(payload)` can be used to produce them.

Metrics come in two flavors, a basic time series chart and a hook that handles requesting and formatting metrics to be rendered.

## Charts

### MetricsLineChart

#### Usage

```typescript
import { MetricsLineChart, NileProvider } from '@theniledev/react';

const API_URL = 'http://localhost:8080'; // location of the Nile endpoint
const WORKSPACE = 'myWorkspace'; // name of the workspace to use

function App() {
  const filter = {
    entityType: 'clusters',
    metricName: 'my.metric',
  };
  return (
    <NileProvider basePath={API_URL} workspace={WORKSPACE}>
      <h1>🤩Metrics the great🤩</h1>
      <h2>Requests</h2>
      <MetricsLineChart filter={filter} />
    </NileProvider>
  );
}
```

#### Properties

**timeFormat** string (default 'HH:mm:ss')

**dataset** object

- A configuration object to render the line. Maps to [chartjs dataset configuration](https://www.chartjs.org/docs/latest/configuration/#dataset-configuration)

  default

  ```
  {
    borderColor: 'rgb(255, 99, 132)',
    backgroundColor: 'rgba(255, 99, 132, 0.5)',
  }
  ```

**updateInterval** number

- time in milliseconds to update the graph

**chartOptions**

- A configuration object to render the graph. Maps to [chartjs chart configuration](https://www.chartjs.org/docs/latest/configuration/#configuration-object-structure)

## useMetrics

It is expected that the basic charts provided by this library will not meet the needs of every use case. For custom charts, the `useMetrics` hook can be used to request and format data, and then iterated on.

### Usage

Assuming a metric is being produced of uptime 1 being up and 0 being down...

```typescript
function MyMetricComponent() {

  const { metrics } = useMetrics({
    updateInterval: 5000, // update every 5 seconds
    fromTimestamp: new Date(), // start reading metrics from right now
    filter: {
      metricName: 'uptime',
      entityType: 'SaaSDB',
    },
  });

  return (
    <div>
      {metrics.map((metric, idx)=> {
        if (metric.value === 0) {
          return <div key={idx}>🤪 Oh nooo! It's broked 🤪</div>;
        }
        return (
          <div key={idx}>
            This is working <strong>very</strong> well
          </div>
        );
      })}
    </div>
    );
  }
}
```
