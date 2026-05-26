import {APP_BASE_HREF} from '@angular/common';
import express from 'express';
import {fileURLToPath} from 'node:url';
import {dirname, join, resolve} from 'node:path';

const app = express();
const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');
const indexHtml = join(serverDistFolder, 'index.server.html');

// NOTA: En las versiones nuevas de Angular, el renderizado se simplificó así:
app.set('view engine', 'html');
app.set('views', browserDistFolder);

// Servir archivos estáticos desde /browser
app.get('**', express.static(browserDistFolder, {
  maxAge: '1y',
  index: 'index.html',
}));

// Todos los demás paths usan el motor de Angular SSR de forma directa
app.get('**', (req, res, next) => {
  const {protocol, originalUrl, headers} = req;

  // Si tu versión usa la nueva API simplificada de Angular SSR:
  res.render(indexHtml, {
    req,
    providers: [{provide: APP_BASE_HREF, useValue: req.baseUrl}],
  }, (err: Error | null | undefined, html: string | undefined) => {
    // ◄-- Aquí tipamos explícitamente err y html para corregir el error TS7006
    if (err) {
      return next(err);
    }
    res.send(html);
  });
});

const port = process.env['PORT'] || 4000;
app.listen(port, () => {
  console.log(`Node Express server listening on http://localhost:${port}`);
});
