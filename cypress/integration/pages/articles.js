import { BBC_BLOCKS } from '@bbc/psammead-assets/svgs';
import * as moment from 'moment-timezone';
import iterator from '../../support/iterator';
import envConfig from '../../support/config/envs';
import config from '../../support/config/services';
import appConfig from '../../../src/app/lib/config/services';
import { getBlockByType, getBlockData } from '../../support/bodyTestHelper';

// TODO: Remove after https://github.com/bbc/simorgh/issues/2959
const serviceHasFigure = service =>
  ['arabic', 'news', 'pashto', 'persian', 'urdu'].includes(service);
const serviceHasCaption = service => service === 'news';
// TODO: Remove after https://github.com/bbc/simorgh/issues/2962
const serviceHasCorrectlyRenderedParagraphs = service => service !== 'sinhala';
const serviceHasTimestamp = service => service === 'news';

const runTests = ({ service }) =>
  describe(`Tests`, () => {
    describe(`Metadata`, () => {
      it('should have the correct articles metadata', () => {
        cy.checkArticlesMetadata({
          articleAuthor: `${appConfig[service].articleAuthor}`,
          description:
            'Meghan follows the royal bridal tradition started by the Queen Mother in 1923.',
          imageUrl: `${appConfig[service].defaultImage}`,
          altText: `${appConfig[service].defaultImageAltText}`,
          locale: `${appConfig[service].locale}`,
          siteName: `${appConfig[service].defaultImageAltText}`,
          title: "Meghan's bouquet laid on tomb of unknown warrior",
          type: 'article',
          url: `https://www.bbc.com${config[service].pageTypes.articles.path}`,
          twitterCard: 'summary_large_image',
          twitterCreator: `${appConfig[service].twitterCreator}`,
          twitterDescription:
            'Meghan follows the royal bridal tradition started by the Queen Mother in 1923.', // eslint-disable-line no-unused-vars
          twitterImageAlt: `${appConfig[service].defaultImageAltText}`,
          twitterImageSrc: `${appConfig[service].defaultImage}`,
          twitterSite: `${appConfig[service].twitterSite}`,
          twitterTitle: "Meghan's bouquet laid on tomb of unknown warrior", // eslint-disable-line no-unused-vars
        });
      });

      it('should include mainEntityOfPage in the LinkedData', () => {
        cy.get('script[type="application/ld+json"]')
          .should('contain', 'mainEntityOfPage')
          .and('contain', 'author')
          .and('contain', 'headline');
      });

      it('should include correct metadata', () => {
        cy.request(`${config[service].pageTypes.articles.path}.json`).then(
          ({ body }) => {
            cy.get('meta[name="description"]').should(
              'have.attr',
              'content',
              body.promo.summary || body.promo.headlines.seoHeadline,
            );
            cy.get('meta[name="og:title"]').should(
              'have.attr',
              'content',
              body.promo.headlines.seoHeadline,
            );
            cy.get('meta[name="og:type"]').should(
              'have.attr',
              'content',
              body.metadata.type,
            );
            cy.get('meta[name="article:published_time"]').should(
              'have.attr',
              'content',
              new Date(body.metadata.firstPublished).toISOString(),
            );
            cy.get('meta[name="article:modified_time"]').should(
              'have.attr',
              'content',
              new Date(body.metadata.lastPublished).toISOString(),
            );
          },
        );
      });
    });

    describe(`Article Body`, () => {
      it('should render a H1, which contains/displays a styled headline', () => {
        cy.request(`${config[service].pageTypes.articles.path}.json`).then(
          ({ body }) => {
            const headlineData = getBlockData('headline', body);
            cy.get('h1').should(
              'contain',
              headlineData.model.blocks[0].model.blocks[0].model.text,
            );
          },
        );
      });

      if (serviceHasTimestamp(service)) {
        it('should render a formatted timestamp', () => {
          cy.request(`${config[service].pageTypes.articles.path}.json`).then(
            ({ body }) => {
              const { language } = body.metadata.passport;
              const { lastPublished } = body.metadata;
              const { firstPublished } = body.metadata;
              const updatedTimestamp = moment
                .tz(lastPublished, `${appConfig[service].timezone}`)
                .locale(language)
                .format('D MMMM YYYY');
              const firstTimestamp = moment
                .tz(firstPublished, `${appConfig[service].timezone}`)
                .locale(language)
                .format('D MMMM YYYY');
              // exempt pashto && arabic as we do have currently their locale implementation
              if (!['pashto', 'arabic'].includes(service)) {
                cy.get('time').then($time => {
                  if (lastPublished === firstPublished) {
                    cy.get($time).should('contain', updatedTimestamp);
                  } else {
                    cy.get($time)
                      .eq(0)
                      .should('contain', firstTimestamp);
                    cy.get($time)
                      .eq(1)
                      .should(
                        'contain',
                        `${appConfig[service].articleTimestampPrefix}${updatedTimestamp}`,
                      );
                  }
                });
              }
            },
          );
        });
      }

      it('should render an H2, which contains/displays a styled subheading', () => {
        cy.request(`${config[service].pageTypes.articles.path}.json`).then(
          ({ body }) => {
            if (body.metadata.language === 'en-gb') {
              const subheadingData = getBlockData('subheadline', body);
              cy.get('h2').should(
                'contain',
                subheadingData.model.blocks[0].model.blocks[0].model.text,
              );
            }
          },
        );
      });

      it('should render a paragraph, which contains/displays styled text', () => {
        if (serviceHasCorrectlyRenderedParagraphs(service)) {
          cy.request(`${config[service].pageTypes.articles.path}.json`).then(
            ({ body }) => {
              const paragraphData = getBlockData('text', body);
              const { text } = paragraphData.model.blocks[0].model;

              cy.get('p').should('contain', text);
            },
          );
        }
      });

      if (serviceHasFigure(service)) {
        it('should have a placeholder image', () => {
          cy.get('figure div div div')
            .eq(0)
            .should(el => {
              expect(el).to.have.css(
                'background-image',
                `url("data:image/svg+xml;base64,${BBC_BLOCKS}")`,
              );
            });
        });

        if (serviceHasCaption(service)) {
          it('should have a visible image without a caption, and also not be lazyloaded', () => {
            cy.get('figure')
              .eq(0)
              .should('be.visible')
              .should('to.have.descendants', 'img')
              .should('not.to.have.descendants', 'figcaption')
              .within(() => cy.get('noscript').should('not.exist'));
          });
        }

        it('should have an image copyright label with styling', () => {
          cy.request(`${config[service].pageTypes.articles.path}.json`).then(
            ({ body }) => {
              const copyrightData = getBlockData('image', body);
              const rawImageblock = getBlockByType(
                copyrightData.model.blocks,
                'rawImage',
              );
              const { copyrightHolder } = rawImageblock.model;

              cy.get('figure')
                .eq(0)
                .then($fig => {
                  if ($fig.find('p').length > 0) {
                    cy.get('figure p')
                      .eq(0)
                      .should('contain', copyrightHolder);
                  } else {
                    // If an image has a BBC copyright, the copyright holder (<p>) does not appear on images.
                    // This is why we're asserting the value. If the copyright does not appear and is not
                    // 'BBC' then it is clear there is an error with this component.
                    expect(copyrightHolder).to.eq('BBC');
                  }
                });
            },
          );
        });
      }

      it('should render a title', () => {
        cy.request(`${config[service].pageTypes.articles.path}.json`).then(
          ({ body }) => {
            const { seoHeadline } = body.promo.headlines;
            cy.title().should(
              'eq',
              `${seoHeadline} - ${appConfig[service].brandName}`,
            );
          },
        );
      });

      it('should have an inline link', () => {
        cy.request(`${config[service].pageTypes.articles.path}.json`).then(
          ({ body }) => {
            if (body.metadata.language === 'en-gb') {
              cy.get('main a');
            }
          },
        );
      });
    });
  });

// -------------------------------------------

const runCanonicalTests = ({ service }) =>
  describe(`Canonical Tests`, () => {
    it('should not have an AMP attribute on the main article', () => {
      cy.get('html').should('not.have.attr', 'amp');
    });

    describe('ATI', () => {
      it('should have a noscript tag with an 1px image with the ati url', () => {
        cy.hasNoscriptImgAtiUrl(
          envConfig.atiUrl,
          config[service].isWorldService ? envConfig.atiAnalyticsWSBucket : '',
        );
      });
    });

    describe('Chartbeat', () => {
      if (envConfig.chartbeatEnabled) {
        it('should have a script with src value set to chartbeat source', () => {
          cy.hasScriptWithChartbeatSrc();
        });
        it('should have chartbeat config set to window object', () => {
          cy.hasGlobalChartbeatConfig();
        });
      }
    });

    it('should include ampHTML tag', () => {
      cy.get('head link[rel="amphtml"]').should(
        'have.attr',
        'href',
        `${window.location.origin}${config[service].pageTypes.articles.path}.amp`,
      );
    });

    if (serviceHasCaption(service)) {
      it('should have a visible image with a caption that is lazyloaded and has a noscript fallback image', () => {
        cy.get('figure')
          .eq(2)
          .within(() => {
            cy.get('div div div div').should(
              'have.class',
              'lazyload-placeholder',
            );
          })
          .scrollIntoView();

        cy.get('figure')
          .eq(2)
          .should('be.visible')
          .should('to.have.descendants', 'img')
          .should('to.have.descendants', 'figcaption')

          // NB: If this test starts failing unexpectedly it's a good sign that the dom is being
          // cleared during hydration. React won't render noscript tags on the client so if they
          // get cleared during hydration, the following render wont re-add them.
          // See https://github.com/facebook/react/issues/11423#issuecomment-341751071 or
          // https://github.com/bbc/simorgh/pull/1872 for more infomation.
          .within(() => {
            cy.get('noscript').contains('<img ');
            cy.get('div div').should('not.have.class', 'lazyload-placeholder');
          });
      });
    }
  });

// -------------------------------------------

const runAmpTests = ({ service }) =>
  describe(`Amp Tests`, () => {
    describe('ATI', () => {
      it('should have an amp-analytics tag with the ati url', () => {
        cy.hasAmpAnalyticsAtiUrl(
          envConfig.atiUrl,
          config[service].isWorldService ? envConfig.atiAnalyticsWSBucket : '',
        );
      });
    });

    describe('Chartbeat', () => {
      if (envConfig.chartbeatEnabled) {
        it('should have chartbeat config UID', () => {
          cy.hasAmpChartbeatConfigUid();
        });
      }
    });

    it('should have AMP attribute', () => {
      cy.get('html').should('have.attr', 'amp');
    });

    it('should contain an amp-img', () => {
      if (serviceHasFigure(service)) {
        cy.get('figure')
          .eq(0)
          .should('be.visible')
          .within(() => {
            cy.get('amp-img').should('be.visible');
          });
      }
    });

    // TODO - Refactor or review this. Can it be a puppeteer test?
    it('should load the AMP framework', () => {
      // .eq(2) gets the amp <script> as:
      // the first loaded is a Cypress <script>
      // the second loaded is the Schema.org metadata script
      cy.get('head script')
        .eq(2)
        .should('have.attr', 'src', 'https://cdn.ampproject.org/v0.js');

      cy.get('head script')
        .eq(3)
        .should(
          'have.attr',
          'src',
          'https://cdn.ampproject.org/v0/amp-geo-0.1.js',
        );

      cy.get('head script')
        .eq(4)
        .should(
          'have.attr',
          'src',
          'https://cdn.ampproject.org/v0/amp-consent-0.1.js',
        );

      cy.get('head script')
        .eq(5)
        .should(
          'have.attr',
          'src',
          'https://cdn.ampproject.org/v0/amp-analytics-0.1.js',
        );
    });

    it('should load the AMP body scripts', () => {
      cy.get('body script')
        .eq(0)
        .should('have.attr', 'type', 'application/json');
      cy.get('body script')
        .eq(1)
        .should('have.attr', 'type', 'application/json');
    });

    it('should have any correct amp scripts in the body and the head', () => {
      cy.get('body script')
        .its('length')
        .should('be', 2); // 1 for amp-geo + 1 for amp-consent
      cy.get('head script')
        .its('length')
        .should('be', 5); // 1 for amp.js + 1 for amp-geo + 1 for amp-consent + 1 for amp-analytics + 1 that Cypress injects into the head
    });
  });

iterator('articles', runTests, runCanonicalTests, runAmpTests);