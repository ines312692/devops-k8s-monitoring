const express = require('express');
const client = require('prom-client');
const app = express();
const PORT = process.env.PORT || 3000;

// Créer un registre pour les métriques
const register = new client.Registry();

// Métriques par défaut
client.collectDefaultMetrics({ register });

// Métriques personnalisées
const httpRequestsTotal = new client.Counter({
    name: 'http_requests_total',
    help: 'Total des requêtes HTTP',
    labelNames: ['method', 'status_code']
});

const httpRequestDuration = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Durée des requêtes HTTP en secondes',
    labelNames: ['method', 'route']
});

register.registerMetric(httpRequestsTotal);
register.registerMetric(httpRequestDuration);

// Middleware pour mesurer les requêtes
app.use((req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
        const duration = (Date.now() - start) / 1000;
        httpRequestsTotal.inc({ method: req.method, status_code: res.statusCode });
        httpRequestDuration.observe({ method: req.method, route: req.path }, duration);
    });

    next();
});

// Routes de l'application
app.get('/', (req, res) => {
    res.json({
        message: 'Hello DevOps!',
        timestamp: new Date().toISOString(),
        version: process.env.APP_VERSION || '1.0.0'
    });
});

app.get('/health', (req, res) => {
    res.json({ status: 'healthy', uptime: process.uptime() });
});

// Route pour les métriques Prometheus
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    const metrics = await register.metrics();
    res.end(metrics);
});

// Simulation de charge pour les tests
app.get('/stress', (req, res) => {
    // Simule une opération coûteuse
    const iterations = Math.floor(Math.random() * 1000000);
    let result = 0;
    for (let i = 0; i < iterations; i++) {
        result += Math.random();
    }
    res.json({ result, iterations });
});

app.listen(PORT, () => {
    console.log(`App running on port ${PORT}`);
});