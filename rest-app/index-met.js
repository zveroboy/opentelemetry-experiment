const { setTimeout } = require('node:timers/promises');
const { metrics } = require('@opentelemetry/api');

const meter = metrics.getMeter('express-server');

const progressCounter = meter.createCounter('cache-generator-progress', {
  description: 'The number of jobs',
});

// return tracer.startActiveSpan(`rollOnce:${i}`, (span) => {

const TOTAL = 2;

const doJob = async (i) => {

    const duration = Math.random() * 1e3;

    await setTimeout(duration);
    
    // span.addEvent('generated', { payload: duration });
    const payload = { index: i, payload: duration };
    console.log({ payload })
    progressCounter.add(1, payload);
};

const main = async (total) => {
    for (let i = 0; i < total; i++) {
        await doJob(i);
    }

    setInterval(() => {}, 1 << 30);
}

main(TOTAL)
.catch(e => {
    console.log(e);
    process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM signal. Shutting down gracefully...');
  console.log('Server closed. Exiting...');
  
  process.exit(0);
});
