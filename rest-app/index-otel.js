const { setTimeout } = require('node:timers/promises');
const { trace, metrics } = require('@opentelemetry/api');

const tracer = trace.getTracer('cache-generator', '0.1.0');

const meter = metrics.getMeter('cache-generator');

const progressCounter = meter.createCounter('cache-generator-progress', {
  description: 'The number of jobs',
});

const TOTAL = 2;

const doJob = async (i) => {
    await tracer.startActiveSpan(`generate for client #${i}`, async (span) => {

        const duration = Math.random() * 2e3;

        await setTimeout(duration);
        
        span.addEvent('generated', { payload: duration });
        const payload = { index: i, payload: duration };
        console.log({ payload })
        progressCounter.add(1, payload);

        span.end();
    });
};

const main = async (total) => {
    await tracer.startActiveSpan('generate', async (span) => {
        for (let i = 0; i < total; i++) {
            await doJob(i);
        }

        span.end();
    }); 

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