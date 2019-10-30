import csp from 'helmet-csp';
import getRouteProps from '#app/routes/getInitialData/utils/getRouteProps';
import routes from '#app/routes';
import getOriginContext from '#contexts/RequestContext/getOriginContext';

// Test Cannon
// default-src 'self'; font-src https://gel.files.bbci.co.uk https://ws-downloads.files.bbci.co.uk; style-src 'unsafe-inline'; img-src https://ichef.bbci.co.uk https://ping.chartbeat.net https://a1.api.bbc.co.uk/hit.xiti https://news.files.bbci.co.uk https://*.akstat.io https://r.bbci.co.uk https://ichef.test.bbci.co.uk https://news.test.files.bbci.co.uk https://logws1363.ati-host.net data: 'self'; script-src https://news.files.bbci.co.uk https://*.chartbeat.com https://*.go-mpulse.net https://mybbc-analytics.files.bbci.co.uk https://emp.bbci.co.uk https://static.bbci.co.uk https://news.test.files.bbci.co.uk 'self' 'unsafe-inline'; connect-src https://*.akstat.io https://*.akamaihd.net https://c.go-mpulse.net https://cookie-oven.api.bbc.co.uk https://cookie-oven.test.api.bbc.co.uk https://logws1363.ati-host.net 'self'; frame-src 'self' https://emp.bbc.com https://emp.bbc.co.uk https://chartbeat.com https://*.chartbeat.com

// Test Amp

// default-src 'self'; font-src https://gel.files.bbci.co.uk https://ws-downloads.files.bbci.co.uk; style-src 'unsafe-inline'; img-src https://ichef.bbci.co.uk https://ping.chartbeat.net https://a1.api.bbc.co.uk/hit.xiti https://news.files.bbci.co.uk https://*.akstat.io https://r.bbci.co.uk https://ichef.test.bbci.co.uk https://news.test.files.bbci.co.uk https://logws1363.ati-host.net data: 'self'; script-src https://cdn.ampproject.org https://*.chartbeat.com https://*.go-mpulse.net 'unsafe-inline'; connect-src https://logws1363.ati-host.net https://*.akstat.io https://*.akamaihd.net https://c.go-mpulse.net; frame-src 'self' https://emp.bbc.com https://emp.bbc.co.uk https://chartbeat.com https://*.chartbeat.com

// Live Cannon
// default-src 'self'; font-src https://gel.files.bbci.co.uk https://ws-downloads.files.bbci.co.uk; style-src 'unsafe-inline'; img-src https://ichef.bbci.co.uk https://ping.chartbeat.net https://a1.api.bbc.co.uk/hit.xiti https://news.files.bbci.co.uk https://*.akstat.io https://r.bbci.co.uk data: 'self'; script-src https://news.files.bbci.co.uk https://*.chartbeat.com https://*.go-mpulse.net https://mybbc-analytics.files.bbci.co.uk https://emp.bbci.co.uk https://static.bbci.co.uk 'self' 'unsafe-inline'; connect-src https://*.akstat.io https://*.akamaihd.net https://c.go-mpulse.net https://cookie-oven.api.bbc.co.uk https://a1.api.bbc.co.uk/hit.xiti 'self'; frame-src 'self' https://emp.bbc.com https://emp.bbc.co.uk https://chartbeat.com https://*.chartbeat.com

// Live Amp
// default-src 'self'; font-src https://gel.files.bbci.co.uk https://ws-downloads.files.bbci.co.uk; style-src 'unsafe-inline'; img-src https://ichef.bbci.co.uk https://ping.chartbeat.net https://a1.api.bbc.co.uk/hit.xiti https://news.files.bbci.co.uk https://*.akstat.io https://r.bbci.co.uk data: 'self'; script-src https://cdn.ampproject.org https://*.chartbeat.com https://*.go-mpulse.net 'unsafe-inline'; connect-src https://a1.api.bbc.co.uk/hit.xiti https://*.akstat.io https://*.akamaihd.net https://c.go-mpulse.net; frame-src 'self' https://emp.bbc.com https://emp.bbc.co.uk https://chartbeat.com https://*.chartbeat.com

// `"default-src 'self'; font-src https://gel.files.bbci.co.uk https://ws-downloads.files.bbci.co.uk; style-src 'unsafe-inline'"

const shared = {
  'default-src': ["'self'"],
  'font-src': [
    'https://gel.files.bbci.co.uk',
    'https://ws-downloads.files.bbci.co.uk',
  ],
  'style-src': ["'unsafe-inline'"],
};

export const generateScriptSrc = (isAmp, isLive) => {
  if (isAmp) {
    return [
      'https://cdn.ampproject.org',
      'https://*.chartbeat.com',
      'https://*.go-mpulse.net',
      "'unsafe-inline'",
    ];
  }

  const scriptSrc = [
    'https://news.files.bbci.co.uk',
    'https://*.chartbeat.com',
    'https://*.go-mpulse.net',
    'https://mybbc-analytics.files.bbci.co.uk',
    'https://emp.bbci.co.uk',
    'https://static.bbci.co.uk',
    "'self'",
    "'unsafe-inline'",
  ];

  if (!isLive) {
    scriptSrc.push('https://news.test.files.bbci.co.uk');
  }

  return scriptSrc;
};

const constructCspHeader = () => ({
  directives: {
    'img-src': [
      'https://ichef.bbci.co.uk',
      'https://ping.chartbeat.net',
      'https://a1.api.bbc.co.uk/hit.xiti',
      'https://news.files.bbci.co.uk',
      'https://*.akstat.io',
      'https://r.bbci.co.uk',
      "data: 'self'",
    ],
    'script-src': generateScriptSrc(false, true),
    'connect-src': [
      'https://*.akstat.io',
      'https://*.akamaihd.net',
      'https://c.go-mpulse.net',
      'https://cookie-oven.api.bbc.co.uk',
      'https://a1.api.bbc.co.uk/hit.xiti',
      "'self'",
    ],
    'frame-src': [
      "'self'",
      'https://emp.bbc.com',
      'https://emp.bbc.co.uk',
      'https://chartbeat.com',
      'https://*.chartbeat.com',
    ],
  },
});

const injectCspHeader = (req, res, next) => {
  const middleware = csp(constructCspHeader());

  const { isAmp } = getRouteProps(routes, req.url);

  // getOriginContext()

  console.log(isAmp);

  middleware(req, res, next);
};

export default injectCspHeader;
