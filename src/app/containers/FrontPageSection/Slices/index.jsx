import React from 'react';
import styled from 'styled-components';
import { arrayOf, shape, bool } from 'prop-types';
import { grid } from '@bbc/psammead-styles/detection';
import { C_LUNAR } from '@bbc/psammead-styles/colours';
import {
  GEL_SPACING,
  GEL_SPACING_DBL,
  GEL_SPACING_TRPL,
} from '@bbc/gel-foundations/spacings';
import {
  GEL_GROUP_3_SCREEN_WIDTH_MIN,
  GEL_GROUP_4_SCREEN_WIDTH_MIN,
} from '@bbc/gel-foundations/breakpoints';
import Grid from '@bbc/psammead-grid';
import { storyItem } from '#models/propTypes/storyItem';
import {
  fullWidthStoryPromoColumns,
  normalStoryPromoColumns,
  defaultColumns,
} from '../gridColumns';
import StoryPromoComponent from '../StoryPromoComponent';

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

const TopStorySlice = ({ items, isFirstSection }) => (
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

TopStorySlice.propTypes = {
  items: arrayOf(shape(storyItem)).isRequired,
  isFirstSection: bool.isRequired,
};

const LeadingStorySlice = ({ items }) => (
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

LeadingStorySlice.propTypes = {
  items: arrayOf(shape(storyItem)).isRequired,
};

const TopSlice = ({ items, isFirstSection }) =>
  items.length === 1 ? (
    <TopStorySlice items={items} isFirstSection={isFirstSection} />
  ) : (
    <LeadingStorySlice items={items} />
  );

TopSlice.propTypes = {
  items: arrayOf(shape(storyItem)).isRequired,
  isFirstSection: bool.isRequired,
};

const RegularSlice = ({ items, isFirstSection }) => (
  <>
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
  </>
);

RegularSlice.propTypes = {
  items: arrayOf(shape(storyItem)).isRequired,
  isFirstSection: bool.isRequired,
};

const NoImageSlice = ({ items }) => (
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

NoImageSlice.propTypes = {
  items: arrayOf(shape(storyItem)).isRequired,
};

const Slices = ({ slices, isFirstSection }) => {
  const topSlice = slices.topRowItems.length > 0 && (
    <TopSlice items={slices.topRowItems} isFirstSection={isFirstSection} />
  );
  const normalSlices =
    slices.standardItems.length > 0 &&
    slices.standardItems.map(slice => (
      <RegularSlice
        items={slice}
        isFirstSection={isFirstSection}
        key={slice[0].id}
      />
    ));
  const imagelessSlice = slices.noImageItems &&
    slices.noImageItems.length > 0 && (
      <NoImageSlice items={slices.noImageItems} />
    );
  return (
    <>
      {topSlice}
      {normalSlices}
      {imagelessSlice}
    </>
  );
};

Slices.propTypes = {
  slices: shape({
    topRowItems: arrayOf(shape(storyItem)),
    standardItems: arrayOf(arrayOf(shape(storyItem))),
    noImageItems: arrayOf(shape(storyItem)),
  }).isRequired,
  isFirstSection: bool.isRequired,
};

export default Slices;
