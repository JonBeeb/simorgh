import React from 'react';
import Navigation from '@bbc/psammead-navigation';
import { node, string, shape } from 'prop-types';
import { scriptPropType } from '@bbc/gel-foundations/prop-types';
import { AmpScrollableNavigation } from '@bbc/psammead-navigation/scrollable';
import { AmpMenuButton } from '@bbc/psammead-navigation/dropdown';
import { GEL_GROUP_2_SCREEN_WIDTH_MAX } from '@bbc/gel-foundations/breakpoints';
import styled from 'styled-components';
import Helmet from 'react-helmet';

const HIDDEN_CLASS_NAME = 'scrollable-hidden';
const SCROLLABLE_ID = 'scrollable-nav';
const NAVIGATION_ID = 'navigation-id';
const OPEN_CLASS_NAME = 'open';

const StyledAmpScrollableNavigation = styled(AmpScrollableNavigation)`
  &.${HIDDEN_CLASS_NAME} {
    @media (max-width: ${GEL_GROUP_2_SCREEN_WIDTH_MAX}) {
      display: none;
      visibility: hidden;
    }
  }
`;

const ampAnimationJSON = {
  duration: '500ms',
  animations: [
    {
      selector: '#dropdown-menu',
      keyframes: {
        transform: ['translateY(-340px)', 'translateY(0px)'],
      },
    },
  ],
};

const AnimationAmpScript = () => (
  <>
    <Helmet>
      <script
        async
        custom-element="amp-animation"
        src="https://cdn.ampproject.org/v0/amp-animation-0.1.js"
      />
    </Helmet>
    <amp-animation layout="nodisplay" id="dropdown-animation">
      <script
        type="application/json"
        /* eslint-disable-next-line react/no-danger */
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ampAnimationJSON) }}
      />
    </amp-animation>
  </>
);

const AmpNavigationContainer = ({
  script,
  service,
  skipLinkText,
  dir,
  menuAnnouncedText,
  scrollableListItems,
  dropdownListItems,
  dropdownId,
}) => (
  <Navigation
    script={script}
    skipLinkText={skipLinkText}
    service={service}
    dir={dir}
    id={NAVIGATION_ID}
    ampOpenClass={OPEN_CLASS_NAME}
  >
    <AnimationAmpScript />
    <AmpMenuButton
      announcedText={menuAnnouncedText}
      onToggle={`
        ${dropdownId}.toggleVisibility,
        ${SCROLLABLE_ID}.toggleClass(class=${HIDDEN_CLASS_NAME}),
        ${NAVIGATION_ID}.toggleClass(class=${OPEN_CLASS_NAME}),
        dropdown-animation.start
      `}
      dir={dir}
      script={script}
    />
    {dropdownListItems}
    <StyledAmpScrollableNavigation dir={dir} id={SCROLLABLE_ID}>
      {scrollableListItems}
    </StyledAmpScrollableNavigation>
  </Navigation>
);

AmpNavigationContainer.propTypes = {
  service: string.isRequired,
  dir: string.isRequired,
  script: shape(scriptPropType).isRequired,
  skipLinkText: string.isRequired,
  scrollableListItems: node.isRequired,
  dropdownListItems: node.isRequired,
  menuAnnouncedText: string.isRequired,
  dropdownId: string.isRequired,
};

export default AmpNavigationContainer;
