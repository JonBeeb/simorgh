import React from 'react';
import pipe from 'ramda/src/pipe';
import styled from 'styled-components';
import {
  GEL_SPACING_DBL,
  GEL_SPACING_TRPL,
  GEL_SPACING_QUAD,
} from '@bbc/gel-foundations/spacings';
import { C_CHALK } from '@bbc/psammead-styles/colours';
import { GEL_GROUP_4_SCREEN_WIDTH_MIN } from '@bbc/gel-foundations/breakpoints';
import path from 'ramda/src/path';
import pathOr from 'ramda/src/pathOr';
import Grid, { TwoColumnLayout } from '#app/components/Grid';
import { getImageParts } from '#lib/utilities/preprocessor/rules/cpsAssetPage/convertToOptimoBlocks/blocks/image/helpers';
import CpsMetadata from '#containers/CpsMetadata';
import LinkedData from '#containers/LinkedData';
import headings from '#containers/Headings';
import Timestamp from '#containers/ArticleTimestamp';
import text from '#containers/CpsText';
import image from '#containers/Image';
import MediaPlayer from '#containers/CpsAssetMediaPlayer';
import Blocks from '#containers/Blocks';
import CpsRelatedContent from '#containers/CpsRelatedContent';
import ATIAnalytics from '#containers/ATIAnalytics';
import cpsAssetPagePropTypes from '../../models/propTypes/cpsAssetPage';
import fauxHeadline from '#containers/FauxHeadline';
import visuallyHiddenHeadline from '#containers/VisuallyHiddenHeadline';
import {
  getFirstPublished,
  getLastPublished,
  getAboutTags,
} from '#lib/utilities/parseAssetData';
import categoryType from './categoryMap/index';

// Page Handlers
import withContexts from '#containers/PageHandlers/withContexts';
import withPageWrapper from '#containers/PageHandlers/withPageWrapper';
import withError from '#containers/PageHandlers/withError';
import withLoading from '#containers/PageHandlers/withLoading';
import withData from '#containers/PageHandlers/withData';

const CpsStyContainer = ({ pageData }) => {
  const title = path(['promo', 'headlines', 'headline'], pageData);
  const category = path(
    ['promo', 'passport', 'category', 'categoryName'],
    pageData,
  );
  const summary = path(['promo', 'summary'], pageData);
  const metadata = path(['metadata'], pageData);
  const allowDateStamp = path(['options', 'allowDateStamp'], metadata);
  const assetUri = path(['locators', 'assetUri'], metadata);
  const blocks = pathOr([], ['content', 'model', 'blocks'], pageData);
  const relatedContent = pathOr(
    [],
    ['relatedContent', 'groups', 0, 'promos'],
    pageData,
  );
  const indexImagePath = path(['promo', 'indexImage', 'path'], pageData);
  const indexImageLocator = indexImagePath
    ? getImageParts(indexImagePath)[1]
    : null;
  const indexImageAltText = path(['promo', 'indexImage', 'altText'], pageData);
  const firstPublished = getFirstPublished(pageData);
  const lastPublished = getLastPublished(pageData);
  const aboutTags = getAboutTags(pageData);

  const componentsToRender = {
    fauxHeadline,
    visuallyHiddenHeadline,
    headline: headings,
    subheadline: headings,
    text,
    image,
    timestamp: props =>
      allowDateStamp ? (
        <StyledTimestamp {...props} popOut={false} minutesTolerance={1} />
      ) : null,
    video: props => <MediaPlayer {...props} assetUri={assetUri} />,
    version: props => <MediaPlayer {...props} assetUri={assetUri} />,
  };

  const StyledTimestamp = styled(Timestamp)`
    padding-bottom: ${GEL_SPACING_DBL};

    @media (min-width: ${GEL_GROUP_4_SCREEN_WIDTH_MIN}) {
      padding-bottom: ${GEL_SPACING_TRPL};
    }
  `;

  const StyledGrid = styled(Grid)`
    flex-grow: 1;
  `;

  const SecondaryColumn = styled.div`
    margin-top: ${GEL_SPACING_QUAD};
  `;

  const Component = styled.div`
    background: ${C_CHALK};
    padding: ${GEL_SPACING_DBL};
    margin-top: ${GEL_SPACING_DBL};
  `;

  const gridColumns = {
    group0: 8,
    group1: 8,
    group2: 8,
    group3: 8,
    group4: 12,
    group5: 12,
  };

  const gridMargins = {
    group0: false,
    group1: false,
    group2: false,
    group3: false,
    group4: true,
    group5: true,
  };

  const firstColItems = (
    <>
      <Blocks blocks={blocks} componentsToRender={componentsToRender} />
      <CpsRelatedContent content={relatedContent} />
    </>
  );

  const secondColItems = (
    <SecondaryColumn>
      <Component>
        <h2>This is a component in the second column</h2>
      </Component>
      <Component>
        <h2>This is a component in the second column</h2>
      </Component>
      <Component>
        <h2>This is a component in the second column</h2>
      </Component>
      <Component>
        <h2>This is a component in the second column</h2>
      </Component>
    </SecondaryColumn>
  );

  return (
    <>
      <CpsMetadata
        title={title}
        language={metadata.language}
        description={summary}
        firstPublished={firstPublished}
        lastPublished={lastPublished}
        imageLocator={indexImageLocator}
        imageAltText={indexImageAltText}
        aboutTags={aboutTags}
      />
      <LinkedData
        type={categoryType(category)}
        seoTitle={title}
        headline={title}
        description={summary}
        showAuthor
        datePublished={firstPublished}
        dateModified={lastPublished}
        aboutTags={aboutTags}
      />
      <ATIAnalytics data={pageData} />
      <StyledGrid columns={gridColumns} enableGelGutters margins={gridMargins}>
        <TwoColumnLayout
          firstColItems={firstColItems}
          secondColItems={secondColItems}
        />
      </StyledGrid>
    </>
  );
};

CpsStyContainer.propTypes = cpsAssetPagePropTypes;

const EnhancedCpsStyContainer = pipe(
  withData,
  withError,
  withLoading,
  withPageWrapper,
  withContexts,
)(CpsStyContainer);

export default EnhancedCpsStyContainer;
