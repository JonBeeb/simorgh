import React, { useContext } from 'react';
import { bool, shape, number, arrayOf, string } from 'prop-types';
import styled, { css } from 'styled-components';
import Grid from '@bbc/psammead-grid';
import {
  GEL_GROUP_3_SCREEN_WIDTH_MIN,
  GEL_GROUP_4_SCREEN_WIDTH_MIN,
} from '@bbc/gel-foundations/breakpoints';
import {
  GEL_SPACING,
  GEL_SPACING_DBL,
  GEL_SPACING_TRPL,
  GEL_SPACING_QUAD,
} from '@bbc/gel-foundations/spacings';
import SectionLabel from '@bbc/psammead-section-label';
import pathOr from 'ramda/src/pathOr';
import UsefulLinksComponent from './UsefulLinks';
import { ServiceContext } from '#contexts/ServiceContext';
import groupShape from '#models/propTypes/frontPageGroup';
import { storyItem } from '#models/propTypes/storyItem';
import idSanitiser from '#lib/utilities/idSanitiser';
import Slices from './Slices';
import StoryPromoComponent from './StoryPromoComponent';
import { fullWidthStoryPromoColumns } from './gridColumns';
import getItems from './storySplitter';

// Apply the right margin-top to the first section of the page when there is one or multiple items.
const FirstSectionTopMargin = styled.div`
  ${({ oneItem }) =>
    oneItem
      ? css`
          @media (min-width: ${GEL_GROUP_3_SCREEN_WIDTH_MIN}) {
            margin-top: ${GEL_SPACING_TRPL};
          }

          @media (min-width: ${GEL_GROUP_4_SCREEN_WIDTH_MIN}) {
            margin-top: ${GEL_SPACING_QUAD};
          }
        `
      : css`
          @media (min-width: ${GEL_GROUP_3_SCREEN_WIDTH_MIN}) {
            margin-top: ${GEL_SPACING};
          }
        `}
`;

// Apply the right margin-top between the section label and the promos
const TopMargin = styled.div`
  @media (min-width: ${GEL_GROUP_3_SCREEN_WIDTH_MIN}) {
    margin-top: ${GEL_SPACING_DBL};
  }

  @media (min-width: ${GEL_GROUP_4_SCREEN_WIDTH_MIN}) {
    margin-top: ${GEL_SPACING_TRPL};
  }
`;

// eslint-disable-next-line react/prop-types
const MarginWrapper = ({ isFirstSection, oneItem, children }) => {
  // Conditionally add a `margin-top` to the `children`.
  if (isFirstSection) {
    return (
      <FirstSectionTopMargin oneItem={oneItem}>
        {children}
      </FirstSectionTopMargin>
    );
  }

  if (oneItem) {
    return <TopMargin>{children}</TopMargin>;
  }

  return children;
};

// Style grid
const GridList = styled(Grid)`
  list-style-type: none;
  margin: 0;
  padding: 0;
`;

const renderStoryPromoList = (groupType, items, isFirstSection) => {
  const slices = getItems(items, isFirstSection);

  return (
    <GridList
      forwardedAs="ul"
      role="list"
      enableGelGutters
      columns={fullWidthStoryPromoColumns}
    >
      <Slices slices={slices} isFirstSection={isFirstSection} />
    </GridList>
  );
};

const StoryPromoRenderer = ({ items, isFirstSection, groupType }) => {
  if (items.length === 1) {
    return (
      <MarginWrapper isFirstSection={isFirstSection} oneItem>
        <Grid enableGelGutters columns={fullWidthStoryPromoColumns}>
          <Grid item columns={fullWidthStoryPromoColumns}>
            <StoryPromoComponent
              item={items[0]}
              topStory
              isFirstSection={isFirstSection}
            />
          </Grid>
        </Grid>
      </MarginWrapper>
    );
  }

  return (
    <MarginWrapper isFirstSection={isFirstSection}>
      {renderStoryPromoList(groupType, items, isFirstSection)}
    </MarginWrapper>
  );
};

StoryPromoRenderer.propTypes = {
  items: arrayOf(shape(storyItem)).isRequired,
  isFirstSection: bool.isRequired,
  groupType: string.isRequired,
};

const FrontPageSection = ({ bar, group, sectionNumber }) => {
  const { script, service, dir, translations } = useContext(ServiceContext);
  const sectionLabelId = idSanitiser(group.title);

  const strapline = pathOr(null, ['strapline', 'name'], group);
  const isLink = pathOr(null, ['strapline', 'type'], group) === 'LINK';
  const href = pathOr(null, ['strapline', 'links', 'mobile'], group);
  const items = pathOr(null, ['items'], group);
  const seeAll = pathOr(null, ['seeAll'], translations);
  const isFirstSection = sectionNumber === 0;

  // The current implementation of SectionLabel *requires* a strapline to be
  // present in order to render. It is currently *not possible* to render a
  // section that does not have a strapline without breaking both the visual
  // *and especially* the screen reader UX.
  // If this group does not have a strapline; do not render!
  // This may change in the future, if a way to avoid breaking UX is found.
  // Also, don't render a section without any items.
  if (!(strapline && items) || items.length === 0) {
    return null;
  }

  return (
    // jsx-a11y considers `role="region"` on a <section> to be redundant.
    // (<section> tags *should* imply `role="region"`)
    // While this may be true in a perfect world, we set it in order to get
    // the greatest possible support.
    // eslint-disable-next-line jsx-a11y/no-redundant-roles
    <section role="region" aria-labelledby={sectionLabelId}>
      <SectionLabel
        script={script}
        labelId={sectionLabelId}
        bar={bar}
        visuallyHidden={isFirstSection}
        service={service}
        dir={dir}
        linkText={isLink ? seeAll : null}
        href={href}
      >
        {group.strapline.name}
      </SectionLabel>
      {group.semanticGroupName === 'Useful links' ? (
        <UsefulLinksComponent items={items} script={script} service={service} />
      ) : (
        <StoryPromoRenderer
          items={items}
          isFirstSection={isFirstSection}
          groupType={group.type}
        />
      )}
    </section>
  );
};

FrontPageSection.defaultProps = {
  bar: true,
};

FrontPageSection.propTypes = {
  bar: bool,
  group: shape(groupShape).isRequired,
  sectionNumber: number.isRequired,
};

export default FrontPageSection;
