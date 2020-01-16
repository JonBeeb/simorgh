import React from 'react';
import { shape, bool } from 'prop-types';
import { storyItem } from '#models/propTypes/storyItem';
import StoryPromo from '../StoryPromo';

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

export default StoryPromoComponent;
