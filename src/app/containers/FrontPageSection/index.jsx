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
import { grid } from '@bbc/psammead-styles/detection';
import SectionLabel from '@bbc/psammead-section-label';
import { C_LUNAR } from '@bbc/psammead-styles/colours';
import pathOr from 'ramda/src/pathOr';
import { splitEvery, splitAt, take } from 'ramda';
import UsefulLinksComponent from './UsefulLinks';
import { ServiceContext } from '#contexts/ServiceContext';
import StoryPromo from '../StoryPromo';
import groupShape from '#models/propTypes/frontPageGroup';
import { storyItem } from '#models/propTypes/storyItem';
import idSanitiser from '#lib/utilities/idSanitiser';

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

const StoryPromoComponent = ({
  item,
  topStory,
  displayImage,
  isLeading,
  isFirstSection,
}) => {
  const lazyLoadImage = !(topStory && isFirstSection); // don't lazy load image if it is a top story
  return (
    <StoryPromo
      item={item}
      topStory={topStory}
      lazyLoadImage={lazyLoadImage}
      displayImage={displayImage}
      isLeading={isLeading}
    />
  );
};

StoryPromoComponent.propTypes = {
  item: shape(storyItem).isRequired,
  topStory: bool.isRequired,
  displayImage: bool,
  isLeading: bool,
  isFirstSection: bool,
};

StoryPromoComponent.defaultProps = {
  displayImage: true,
  isLeading: false,
  isFirstSection: false,
};

const defaultColumns = {
  group0: 6,
  group1: 6,
  group2: 6,
  group3: 6,
};

const fullWidthStoryPromoColumns = {
  ...defaultColumns,
  group4: 8,
  group5: 8,
};

const normalStoryPromoColumns = {
  ...defaultColumns,
  group4: 2,
  group5: 2,
};

// Style grid
const GridList = styled(Grid)`
  list-style-type: none;
  margin: 0;
  padding: 0;
`;
const GridListItem = styled(Grid)`
  border-bottom: 0.0625rem solid ${C_LUNAR};
  padding: ${GEL_SPACING} 0.5rem ${GEL_SPACING_DBL};

  @media (min-width: ${GEL_GROUP_3_SCREEN_WIDTH_MIN}) {
    padding: ${GEL_SPACING_DBL} 0.5rem ${GEL_SPACING_DBL};
  }

  @media (min-width: ${GEL_GROUP_4_SCREEN_WIDTH_MIN}) {
    padding: ${GEL_SPACING_TRPL} 0.5rem ${GEL_SPACING_TRPL};
  }

  @supports (${grid}) {
    padding: ${GEL_SPACING} 0rem ${GEL_SPACING_DBL};

    @media (min-width: ${GEL_GROUP_3_SCREEN_WIDTH_MIN}) {
      padding: ${GEL_SPACING_DBL} 0rem ${GEL_SPACING_DBL};
    }

    @media (min-width: ${GEL_GROUP_4_SCREEN_WIDTH_MIN}) {
      padding: ${GEL_SPACING_TRPL} 0rem ${GEL_SPACING_TRPL};
    }
  }

  &:first-child {
    padding-top: 0;

    @media (min-width: ${GEL_GROUP_3_SCREEN_WIDTH_MIN}) {
      padding-top: 1rem;
    }

    @media (min-width: ${GEL_GROUP_4_SCREEN_WIDTH_MIN}) {
      padding-top: 1.5rem;
    }
  }

  &:last-child {
    padding-bottom: 0;
    border: none;
  }
`;

// Split items into slices
const getItemLimit = (items, isFirstSection) =>
  isFirstSection ? take(13, items) : take(10, items);

// Split the top row stories out into their own list
const splitTopRowSlice = (items, isFirstSection) => {
  // First section always has a single top story
  if (isFirstSection || items.length % 4 === 1) {
    return splitAt(1, items);
  }
  if (items.length % 4 > 1) {
    return splitAt(2, items);
  }
  return splitAt(0, items);
};

// Split into fours and make sure slices only go through if a four
const splitStandardSlices = items =>
  splitEvery(4, items).filter(itemList => itemList.length === 4);

// Anything beyond the first 2 fours goes into an imageless slice
const splitNoImageSlices = standardSlices => splitAt(2, standardSlices);

const getItems = (items, isFirstSection) => {
  const presentStories = getItemLimit(items, isFirstSection);

  const [topRowItems, unsplitStandardItems] = splitTopRowSlice(
    presentStories,
    isFirstSection,
  );
  const [standardItems, [noImageItems]] = splitNoImageSlices(
    splitStandardSlices(unsplitStandardItems),
  );

  return {
    topRowItems,
    standardItems,
    noImageItems,
  };
};

// Slice rendering
const renderTopStorySlice = (items, isFirstSection) => (
  <GridListItem
    item
    columns={fullWidthStoryPromoColumns}
    parentColumns={fullWidthStoryPromoColumns}
    key={items[0].id}
    forwardedAs="li"
    role="listitem"
  >
    <StoryPromoComponent
      item={items[0]}
      topStory
      displayImage
      isFirstSection={isFirstSection}
    />
  </GridListItem>
);

const renderLeadingStorySlice = items => (
  <>
    <GridListItem
      item
      columns={{ ...defaultColumns, group4: 6, group5: 6 }}
      parentColumns={fullWidthStoryPromoColumns}
      key={items[0].id}
      forwardedAs="li"
      role="listitem"
    >
      <StoryPromoComponent
        item={items[0]}
        displayImage
        isLeading
        topStory={false}
      />
    </GridListItem>
    <GridListItem
      item
      parentColumns={fullWidthStoryPromoColumns}
      columns={normalStoryPromoColumns}
      key={items[1].id}
      forwardedAs="li"
      role="listitem"
    >
      <StoryPromoComponent item={items[1]} displayImage topStory={false} />
    </GridListItem>
  </>
);

const renderTopSlice = (items, isFirstSection) =>
  items.length === 1
    ? renderTopStorySlice(items, isFirstSection)
    : renderLeadingStorySlice(items);

const renderNormalSlice = (items, isFirstSection, index) => (
  <React.Fragment key={index}>
    {items.map(item => (
      <GridListItem
        item
        parentColumns={fullWidthStoryPromoColumns}
        columns={normalStoryPromoColumns}
        key={item.id}
        forwardedAs="li"
        role="listitem"
      >
        <StoryPromoComponent
          item={item}
          displayImage
          isFirstSection={isFirstSection}
          topStory={false}
        />
      </GridListItem>
    ))}
  </React.Fragment>
);

const renderImagelessSlice = items => (
  <>
    {items.map(item => (
      <GridListItem
        item
        columns={normalStoryPromoColumns}
        parentColumns={fullWidthStoryPromoColumns}
        key={item.id}
        forwardedAs="li"
        role="listitem"
      >
        <StoryPromoComponent
          item={item}
          isFirstSection
          topStory={false}
          displayImage={false}
        />
      </GridListItem>
    ))}
  </>
);

const renderSlices = (slices, isFirstSection) => {
  const topSlice =
    slices.topRowItems.length > 0 &&
    renderTopSlice(slices.topRowItems, isFirstSection);
  const normalSlices =
    slices.standardItems.length > 0 &&
    slices.standardItems.map((slice, index) =>
      renderNormalSlice(slice, isFirstSection, index),
    );
  const imagelessSlice =
    slices.noImageItems &&
    slices.noImageItems.length > 0 &&
    renderImagelessSlice(slices.noImageItems);
  return (
    <>
      {topSlice}
      {normalSlices}
      {imagelessSlice}
    </>
  );
};

const renderStoryPromoList = (groupType, items, isFirstSection) => {
  const slices = getItems(items, isFirstSection);

  return (
    <GridList
      forwardedAs="ul"
      role="list"
      enableGelGutters
      columns={fullWidthStoryPromoColumns}
    >
      {renderSlices(slices, isFirstSection)}
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
